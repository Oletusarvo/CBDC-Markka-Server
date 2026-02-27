import { TBill } from './currency-util';
import crypto from 'crypto';

/** Represents a single denomination of currency.
 * @todo
 */
export class Coin {
  public readonly id: string;
  public readonly account_id: string;
  public readonly value_in_cents: number;
  public readonly minted_at: Date;
  public readonly signature: string;

  constructor({ value_in_cents, account_id, id, minted_at, signature }: TBill) {
    this.id = id;
    this.account_id = account_id;
    this.minted_at = minted_at;
    this.value_in_cents = value_in_cents;
    this.signature = signature || this.calculateHmac();
  }

  calculateHmac() {
    return crypto
      .createHmac('sha256', process.env.MINT_SECRET)
      .update(
        JSON.stringify({
          id: this.id,
          account_id: this.account_id,
          value_in_cents: this.value_in_cents,
          minted_at: this.minted_at,
        }),
      )
      .digest('hex');
  }

  verifySignature() {
    return this.calculateHmac() === this.signature;
  }
}
