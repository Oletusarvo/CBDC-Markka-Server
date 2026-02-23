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
  TBill,
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
    const tenderSum = sumTokens(tender);
    const changeAmtInCents = tenderSum - amtInCents;

    const finalTokensToMint = [];
    const finalTokensToUpdate = [];

    const assignFinalTokensToUpdate = (
      toSender: TBill[] = [],
      toReceiver: TBill[] = [],
      toReserve: TBill[] = [],
    ) => {
      finalTokensToUpdate.push(
        ...toSender.map(t => {
          return {
            ...t,
            old_account_id: receiverAccount.id,
            account_id: senderAccount.id,
          };
        }),
        ...toReceiver.map(t => {
          return {
            ...t,
            old_account_id: senderAccount.id,
            account_id: receiverAccount.id,
          };
        }),
        ...toReserve.map(t => {
          return {
            ...t,
            account_id: null,
            old_account_id: senderAccount.id,
          };
        }),
      );
    };

    const assignFinalTokensToMint = (
      toSender: Pick<TBill, 'value_in_cents'>[] = [],
      toReceiver: Pick<TBill, 'value_in_cents'>[] = [],
    ) => {
      finalTokensToMint.push(
        ...toSender.map(t => {
          return {
            value_in_cents: t.value_in_cents,
            account_id: senderAccount.id,
          };
        }),
        ...toReceiver.map(t => {
          return {
            value_in_cents: t.value_in_cents,
            account_id: receiverAccount.id,
          };
        }),
      );
    };

    if (changeAmtInCents > 0) {
      //1. Try to get change from the receiver. Has to be exact.
      if (containsExactly(receiverTokens, changeAmtInCents)) {
        console.log('Getting change from receiver...');
        const change = pick(receiverTokens, changeAmtInCents);
        assignFinalTokensToUpdate(change, tender);
      }
      //2. Try to get change from the reserve. Has to be exact.
      else if (
        containsExactly(reserveTokens, amtInCents) &&
        //This should check the reserve without the amount in cents, against the change.
        containsExactly(without(reserveTokens, amtInCents), changeAmtInCents)
      ) {
        console.log('Getting change from reserve...');
        const change = pick(reserveTokens, changeAmtInCents);
        const toReceiver = pick(reserveTokens, amtInCents);
        assignFinalTokensToUpdate(change, toReceiver, tender);
      } else {
        //Mint new coins. Put original tender in reserve.
        console.log('Minting change and tender...');
        const toReceiver = mint(amtInCents);
        const change = mint(changeAmtInCents);

        assignFinalTokensToUpdate([], [], tender);
        assignFinalTokensToMint(change, toReceiver);
      }
    } else {
      //No change; just give the tender to the receiver.
      assignFinalTokensToUpdate([], tender);
    }

    await db.transaction(async trx => {
      for (const t of finalTokensToUpdate) {
        const rows = await trx(tablenames.currencyObjects)
          .where({ id: t.id, account_id: t.old_account_id })
          .update({
            account_id: t.account_id,
          });

        if (rows !== 1) {
          throw new Error('Double spend detected!');
        }
      }

      for (const t of finalTokensToMint) {
        await trx(tablenames.currencyObjects).insert({
          account_id: t.account_id,
          denom_type_id: trx
            .select('id')
            .from('denom_type')
            .where({ value_in_cents: t.value_in_cents })
            .limit(1),
        });
      }

      await trx(tablenames.transactions).insert({
        from: senderAccount.id,
        to: receiverAccount.id,
        amount_in_cents: amtInCents,
        message: req.data.message,
      });
    });

    return res.status(200).end();
  },
  (err, res) => {
    if (err.message.includes('Double spend')) {
      return res.status(409).json({
        error: 'transaction:double-spend',
      });
    }
    return res.status(500).end();
  },
);
