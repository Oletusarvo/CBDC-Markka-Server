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
import { CoinBatch } from '../../currencies/util/coin-batch';

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

    const amtInCents = Math.round(req.data.amt * 100);

    const senderTokens = new CoinBatch(
      await getTokens(db).where({
        account_id: senderAccount.id,
      }),
    );

    if (senderTokens.sum < amtInCents) {
      return res.status(409).json({
        error: 'transaction:insufficient-funds',
      });
    }

    const receiverTokens = new CoinBatch(
      await getTokens(db).where({
        account_id: receiverAccount.id,
      }),
    );

    const reserveTokens = new CoinBatch(
      await getTokens(db)
        .whereNull('account_id')
        .orderBy('denom_type.value_in_cents', 'desc')
        .limit(200),
    );

    const tender = senderTokens.pick(amtInCents);
    const tenderSum = tender.sum;
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
      if (receiverTokens.containsExactly(changeAmtInCents)) {
        console.log('Getting change from receiver...');
        const change = receiverTokens.pick(changeAmtInCents);
        assignFinalTokensToUpdate(change.coins, tender.coins);
      }
      //2. Try to get change from the reserve. Has to be exact.
      else if (
        reserveTokens.containsExactly(amtInCents) &&
        //This should check the reserve without the amount in cents, against the change.
        reserveTokens.without(amtInCents).containsExactly(changeAmtInCents)
      ) {
        console.log('Getting change from reserve...');
        const change = reserveTokens.pick(changeAmtInCents);
        const toReceiver = reserveTokens.pick(amtInCents);
        assignFinalTokensToUpdate(change.coins, toReceiver.coins, tender.coins);
      } else {
        //Mint new coins. Put original tender in reserve.
        console.log('Minting change and tender...');
        const toReceiver = mint(amtInCents);
        const change = mint(changeAmtInCents);

        assignFinalTokensToUpdate([], [], tender.coins);
        console.log(change, toReceiver, changeAmtInCents);
        assignFinalTokensToMint(change, toReceiver);
      }
    } else {
      //No change; just give the tender to the receiver.
      assignFinalTokensToUpdate([], tender.coins);
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
