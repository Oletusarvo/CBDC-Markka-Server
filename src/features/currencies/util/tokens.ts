import { TBill } from './currency-util';

export class Tokens {
  private m_tokens: TBill[];
  private m_total: number = 0;
  constructor(tokens: TBill[]) {
    this.m_tokens = [...tokens];
    this.m_total = this.m_tokens.reduce((acc, cur) => (acc += cur.value_in_cents), 0);
  }

  public get total() {
    return this.m_total;
  }

  public get tokens() {
    return this.m_tokens;
  }

  private static desc(tokens: TBill[]) {
    return tokens.sort((a, b) => b.value_in_cents - a.value_in_cents);
  }

  find(callback: (t: TBill) => boolean) {
    return this.m_tokens.find(callback);
  }

  push(token: TBill) {
    this.m_tokens.push(token);
    this.m_total += token.value_in_cents;
  }

  containsExactly(amtInCents: number) {
    const temp = Tokens.desc(this.tokens).reverse();
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
    this.m_tokens.splice(fromIndex, qty);
  }

  findClosest(amtInCents: number, includeSmaller?: boolean) {
    const da1 = [];
    //First try to find bills that are closest and lower in value to what is left
    for (let i = 0; i < this.tokens.length; ++i) {
      const diff = amtInCents - this.tokens[i].value_in_cents;

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
    return closest && this.tokens.at(closest.index);
  }

  pick(amtInCents: number) {
    const temp = new Tokens(Tokens.desc(this.tokens));
    const selected: TBill[] = [];
    let totalSelected = 0;
    const billSum = temp.total;
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
        const closest = this.findClosest(amtLeft, hasAmtExactly);
        selected.push(closest);
        totalSelected += closest.value_in_cents;
        const index = temp.tokens.findIndex(i => i === closest);
        temp.remove(index, 1);
      }
    }
    return selected;
  }
}
