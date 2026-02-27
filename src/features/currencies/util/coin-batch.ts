import { Coin } from './coin';
import { TBill, without } from './currency-util';

export class CoinBatch {
  public readonly coins: TBill[];
  private total: number;

  constructor(tokens: TBill[]) {
    this.coins = [...tokens];
    this.total = this.coins.reduce((acc, cur) => (acc += cur.value_in_cents), 0);
  }

  public get sum() {
    return this.total;
  }

  private static desc(tokens: TBill[]) {
    return tokens.sort((a, b) => b.value_in_cents - a.value_in_cents);
  }

  find(callback: (t: TBill) => boolean) {
    return this.coins.find(callback);
  }

  push(...coins: TBill[]) {
    this.coins.push(...coins);
    this.total += coins.reduce((acc, cur) => (acc += cur.value_in_cents), 0);
  }

  containsExactly(amtInCents: number) {
    const temp = CoinBatch.desc(this.coins).reverse();
    let total = 0;
    let currentIndex = 0;
    while (currentIndex < temp.length) {
      for (let i = currentIndex; i < temp.length; ++i) {
        const bill = temp[i];
        total += bill.value_in_cents;
        if (total === amtInCents) {
          return true;
        }
      }
      currentIndex++;
      total = 0;
    }
    return false;
  }

  remove(fromIndex: number, qty: number) {
    this.coins.splice(fromIndex, qty);
  }

  findClosest(amtInCents: number, includeSmaller?: boolean) {
    const da1 = [];
    //First try to find bills that are closest and lower in value to what is left
    for (let i = 0; i < this.coins.length; ++i) {
      const diff = amtInCents - this.coins[i].value_in_cents;

      const entry = {
        index: i,
        diff: Math.abs(diff),
      };

      if (includeSmaller) {
        if (diff >= 0) {
          da1.push(entry);
        }
      } else {
        da1.push(entry);
      }
    }

    const closest = da1.sort((a, b) => b.diff - a.diff).at(-1);
    return closest && this.coins.at(closest.index);
  }

  /**Picks from this batch a new batch with a value that satisfies amtInCents. */
  pick(amtInCents: number) {
    const temp = new CoinBatch(this.coins);
    const selected: TBill[] = [];
    let totalSelected = 0;
    const billSum = temp.sum;
    //Verify the sum of the bills is bigger or equal to the target amount.
    if (billSum < amtInCents) {
      throw new Error('Insufficient funds!');
    }

    while (totalSelected < amtInCents) {
      const amtLeft = amtInCents - totalSelected;
      //First find a bill that matches exactly the target in cents.
      const exact = temp.find(b => b.value_in_cents === amtLeft);
      //const exact = getExact(temp, amtLeft);

      if (exact) {
        selected.push(exact);
        totalSelected += exact.value_in_cents;
      } else {
        //Grab the one closest to the current target.
        const hasAmtExactly = temp.containsExactly(amtLeft);
        const closest = temp.findClosest(amtLeft, hasAmtExactly);
        selected.push(closest);
        totalSelected += closest.value_in_cents;
        const index = temp.coins.findIndex(i => i === closest);
        temp.remove(index, 1);
      }
    }
    return new CoinBatch(selected);
  }

  without(amountInCents: number) {
    const temp = new CoinBatch([...this.coins]);
    if (!temp.containsExactly(amountInCents)) {
      return new CoinBatch([]);
    }
    let total = 0;
    const indexesToDelete = [];
    for (let i = 0; i < temp.coins.length; ++i) {
      const bill = temp.coins[i];
      total += bill.value_in_cents;
      if (total <= amountInCents) {
        indexesToDelete.push(i);
      }
    }

    return new CoinBatch(
      temp.coins
        .map((b, i) => {
          if (!indexesToDelete.includes(i)) {
            return b;
          }
        })
        .filter(b => b),
    );
  }
}
