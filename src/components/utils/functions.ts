import { Group } from "../types/Group";

export function toBinaryString(value: number, numVars: number): string {
  return value.toString(2).padStart(numVars, '0');
}

export function generateRandomMinterms(numVars: number): boolean[] {
  const length = 1 << numVars;
  const arr: boolean[] = [];
  for (let i = 0; i < length; i++) {
    arr.push(Math.random() < 0.5);
  }
  return arr;
}

export function countOnes(x: number): number {
  let count = 0;
  while (x > 0) {
    if (x & 1) count++;
    x >>= 1;
  }
  return count;
}

export function differByOneBit(
  a: number,
  b: number,
  maskA: number,
  maskB: number,
  numVars: number
): number {
  const combinedMask = maskA | maskB;
  let diff = 0;
  let bitCount = 0;
  for (let i = 0; i < numVars; i++) {
    const bit = 1 << i;
    if ((combinedMask & bit) === 0) {
      const aBit = (a & bit) !== 0;
      const bBit = (b & bit) !== 0;
      if (aBit !== bBit) {
        diff |= bit;
        bitCount++;
        if (bitCount > 1) return -1;
      }
    }
  }
  return bitCount === 1 ? diff : -1;
}

// Uses a JSON key to remove duplicate groups.
export function removeDuplicateGroups(groups: Group[]): Group[] {
  const unique = new Map<string, Group>();
  for (const g of groups) {
    const key = JSON.stringify({
      minterms: g.minterms.slice().sort((a, b) => a - b),
      mask: g.mask
    });
    if (!unique.has(key)) {
      unique.set(key, g);
    }
  }
  return Array.from(unique.values());
}

// Uses (1 << numVars)-1 so that only relevant bits are considered.
export function computeBaseVal(minterms: number[], numVars: number): number {
  if (minterms.length === 0) return 0;
  return minterms.reduce((acc, m) => acc & m, (1 << numVars) - 1);
}

// Counts the number of specified literals (regardless of 0 or 1).
export function countSpecifiedLiterals(pi: Group, numVars: number): number {
  let count = 0;
  for (let i = 0; i < numVars; i++) {
    if (((pi.mask >> i) & 1) === 0) count++;
  }
  return count;
}

/* ---------------------------------------------------------------------
   Petrick's Method Utilities (for covering uncovered minterms)
--------------------------------------------------------------------- */

export function isSubset(small: Set<number>, big: Set<number>): boolean {
  for (const val of small) {
    if (!big.has(val)) return false;
  }
  return true;
}

export function removeSupersets(sets: Array<Set<number>>): Array<Set<number>> {
  return sets.filter(
    (s) => !sets.some((t) => t !== s && isSubset(t, s))
  );
}

export function petrickProduct(terms: Array<Set<number>>): Array<Set<number>> {
  let combinations: Array<Set<number>> = [new Set<number>()];
  for (const term of terms) {
    const newCombinations: Array<Set<number>> = [];
    for (const comb of combinations) {
      for (const piIndex of term) {
        const newComb = new Set<number>(comb);
        newComb.add(piIndex);
        newCombinations.push(newComb);
      }
    }
    combinations = removeSupersets(newCombinations);
  }
  return combinations;
}

export function chooseMinimalCombination(
  combinations: Array<Set<number>>,
  primeImplicants: Group[],
  numVars: number
): Set<number> {
  let best: Set<number> | null = null;
  let bestCost = Infinity;
  for (const comb of combinations) {
    const termCount = comb.size;
    let literalCount = 0;
    for (const idx of comb) {
      literalCount += countSpecifiedLiterals(primeImplicants[idx], numVars);
    }
    // Weight the number of terms heavily.
    const cost = termCount * 1000 + literalCount;
    if (cost < bestCost) {
      bestCost = cost;
      best = comb;
    }
  }
  return best || new Set<number>();
}
