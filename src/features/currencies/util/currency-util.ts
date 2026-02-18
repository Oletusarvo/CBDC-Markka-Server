export type TBill = {
  id: string;
  account_id: string | null;
  value_in_cents: number;
  minted_at: Date;
};

const sum = (arr: TBill[]) => arr.reduce((acc, cur) => (acc += cur.value_in_cents), 0);
const desc = arr => arr.sort((a, b) => b - a);
export const DENOMS_IN_CENTS = desc([
  1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 50000,
]);

/**Greedily mints new currency, creating as few new tokens as possible.*/
export function mint(amountInCents: number, maxDenom = 50000) {
  let mintedBills = [];

  while (amountInCents > 0) {
    const denom = DENOMS_IN_CENTS.find(den => den < amountInCents || den === amountInCents);
    amountInCents -= denom;
    mintedBills.push(denom);
  }

  return desc(mintedBills);
}

export function getExact(bills, targetAmtInCents) {
  const da = [];
  let total = 0;
  const selected = [];
  while (total < targetAmtInCents) {
    const closest = getClosest(bills, targetAmtInCents - total, false);
    selected.push(closest);
    total += closest.value_in_cents;
  }

  return total === targetAmtInCents ? selected : null;
}

export function containsExactly(bills: TBill[], amt: number) {
  const temp = desc([...bills]).reverse();
  let total = 0;
  let currentIndex = 0;
  while (currentIndex < temp.length) {
    for (let i = currentIndex; i < temp.length; ++i) {
      const bill = temp[i];
      total += bill.value_in_cents;
      if (total === amt) {
        return true;
      }
    }
    currentIndex++;
    total = 0;
  }
  return false;
}

function getClosest(bills: TBill[], targetAmtInCents: number, aboveNegative: boolean = false) {
  const da1 = [];
  //First try to find bills that are closest and lower in value to what is left
  for (let i = 0; i < bills.length; ++i) {
    const diff = targetAmtInCents - bills[i].value_in_cents;

    const entry = {
      index: i,
      diff: Math.abs(diff),
    };

    if (aboveNegative) {
      if (diff >= 0) {
        da1.push(entry);
      }
    } else {
      da1.push(entry);
    }
  }

  const closest = da1.sort((a, b) => b.diff - a.diff).at(-1);
  return closest && bills.at(closest.index);
}

/**Picks from a group of bills the minimum number of tokens to satisfy the target amount. Does not modify the original array of bills.*/
export function pick(bills: TBill[], targetAmtInCents: number) {
  const temp = desc([...bills]);
  const selected: TBill[] = [];
  let totalSelected = 0;
  const billSum = sum(temp);
  //Verify the sum of the bills is bigger or equal to the target amount.
  if (billSum < targetAmtInCents) {
    throw new Error('Insufficient funds!');
  }

  while (totalSelected < targetAmtInCents) {
    const amtLeft = targetAmtInCents - totalSelected;
    //First find a bill that matches exactly the target in cents.
    const exact = temp.find(b => b === amtLeft);
    //const exact = getExact(temp, amtLeft);

    if (exact) {
      selected.push(exact);
      totalSelected += exact;
    } else {
      //Grab the one closest to the current target.
      const hasAmtExactly = containsExactly(temp, amtLeft);
      const closest = getClosest(temp, amtLeft, hasAmtExactly);
      selected.push(closest);
      totalSelected += closest.value_in_cents;
      const index = temp.findIndex(i => i === closest);
      temp.splice(index, 1);
    }
  }
  return selected;
}

/**Returns the given array of bills without the bills adding up to the given amount in cents. If the original bills do not satisfy the amount in cents exactly, returns an empty array. */
export function without(bills: TBill[], amountInCents: number) {
  const temp = [...bills];
  if (!containsExactly(bills, amountInCents)) {
    return [];
  }
  let total = 0;
  const indexesToDelete = [];
  for (let i = 0; i < bills.length; ++i) {
    const bill = bills[i];
    total += bill.value_in_cents;
    if (total <= amountInCents) {
      indexesToDelete.push(i);
    }
  }

  return temp
    .map((b, i) => {
      if (!indexesToDelete.includes(i)) {
        return b;
      }
    })
    .filter(b => b);
}

export { sum as sumTokens };
