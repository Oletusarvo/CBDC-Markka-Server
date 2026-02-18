import { db } from '../../../db-config';
import { tablenames } from '../../../tablenames';
import { AuthenticatedExpressRequest } from '../../../types/express';
import { createHandler } from '../../../utils/create-handler';
import { getTokens } from '../../currencies/helpers/get-tokens';
import {
  containsExactly,
  mint,
  pick,
  sumTokens,
  without,
} from '../../currencies/util/currency-util';

export const createTransactionWithTokens = createHandler(
  async (req: AuthenticatedExpressRequest, res) => {
    const session = req.session;
    const senderAccount = await db(tablenames.accounts)
      .where({ user_id: session.user.id })
      .select('id')
      .first();

    if (!senderAccount) {
      return res.status(404).json({
        error: 'transaction:invalid-sender',
      });
    }

    const receiverAccount = await db(tablenames.accounts)
      .where({
        user_id: db.select('id').from(tablenames.users).where({ email: req.data.email }).limit(1),
      })
      .first();

    if (!receiverAccount) {
      return res.status(404).json({
        error: 'transaction:invalid-receiver',
      });
    }

    const amtInCents = req.data.amt * 100;

    const senderTokens = await getTokens(db).where({
      account_id: senderAccount.id,
    });

    if (sumTokens(senderTokens) < amtInCents) {
      return res.status(409).json({
        error: 'transaction:insufficient-funds',
      });
    }

    const receiverTokens = await getTokens(db).where({
      account_id: receiverAccount.id,
    });

    const reserveTokens = await getTokens(db)
      .whereNull('account_id')
      .orderBy('denom_type.value_in_cents', 'desc')
      .limit(200);

    const tender = pick(senderTokens, amtInCents);
    const changeAmtInCents = sumTokens(tender) - amtInCents;
    const finalTokensToMint = [];
    const finalTokensToUpdate = [];

    if (changeAmtInCents > 0) {
      //1. Try to get change from the receiver. Has to be exact.
      if (containsExactly(receiverTokens, changeAmtInCents)) {
        const change = pick(receiverTokens, changeAmtInCents);
        finalTokensToUpdate.push(
          ...change.map(t => {
            return {
              ...t,
              account_id: senderAccount.id,
            };
          }),
          ...tender.map(t => {
            return {
              ...t,
              account_id: receiverAccount.id,
            };
          }),
        );
      }
      //2. Try to get change from the reserve. Has to be exact.
      else if (
        //Reserve must have exactly the coins for both parties.
        containsExactly(reserveTokens, amtInCents) &&
        //This should check the reserve without the amount in cents, aginst the change.
        containsExactly(without(reserveTokens, amtInCents), changeAmtInCents)
      ) {
        const change = pick(reserveTokens, changeAmtInCents);
        const toReceiver = pick(reserveTokens, amtInCents);
        finalTokensToUpdate.push(
          //Give the change to the sender
          ...change.map(t => {
            return {
              ...t,
              account_id: senderAccount.id,
            };
          }),
          //Give the receiver their fair share
          ...toReceiver.map(t => {
            return {
              ...t,
              account_id: receiverAccount.id,
            };
          }),
          //Put the original tender in reserve
          ...tender.map(t => {
            return {
              ...t,
              account_id: null,
            };
          }),
        );
      } else {
        //Mint new coins. Put original tender in reserve.
        const toReceiver = mint(amtInCents);
        const change = mint(changeAmtInCents);
        finalTokensToMint.push(
          ...toReceiver.map(amt => {
            return {
              value_in_cents: amt,
              account_id: receiverAccount.id,
            };
          }),
          ...change.map(amt => {
            return {
              value_in_cents: amt,
              account_id: senderAccount.id,
            };
          }),
        );

        finalTokensToUpdate.push(
          ...tender.map(t => {
            return {
              ...t,
              account_id: null,
            };
          }),
        );
      }
    } else {
      //No change; just give the tender to the receiver.
      finalTokensToUpdate.push(
        ...tender.map(t => {
          return {
            ...t,
            account_id: receiverAccount.id,
          };
        }),
      );
    }

    await db.transaction(async trx => {
      await Promise.all(
        finalTokensToUpdate.map(async t => {
          await trx(tablenames.currencyObjects).where({ id: t.id }).update({
            account_id: t.account_id,
          });
        }),
      );

      await Promise.all(
        finalTokensToMint.map(async t => {
          await trx(tablenames.currencyObjects).insert({
            account_id: t.account_id,
            denom_type_id: trx
              .select('id')
              .from('denom_type')
              .where({ value_in_cents: t.value_in_cents })
              .limit(1),
          });
        }),
      );

      await trx(tablenames.transactions).insert({
        from: senderAccount.id,
        to: receiverAccount.id,
        amount_in_cents: amtInCents,
        message: req.data.message,
      });
    });

    return res.status(200).end();
  },
);
