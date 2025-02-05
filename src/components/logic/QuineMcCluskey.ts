import { Group } from "../types/Group";
import { 
  countOnes,
  differByOneBit,
  removeDuplicateGroups,
  computeBaseVal,
  countSpecifiedLiterals,
  petrickProduct,
  chooseMinimalCombination
} from "../utils/functions";

export function quineMcCluskey(
  minterms: number[],
  numVars: number
): { expression: string; finalCover: Group[] } {
  if (minterms.length === 0) return { expression: "0", finalCover: [] };
  if (minterms.length === 1 << numVars)
    return { expression: "1", finalCover: [] };

  // Remove duplicates and sort.
  minterms = Array.from(new Set(minterms)).sort((a, b) => a - b);
  const groups: Group[][] = Array.from({ length: numVars + 1 }, () => []);
  // Group by number of ones in the minterm.
  for (const m of minterms) {
    groups[countOnes(m)].push({
      minterms: [m],
      mask: 0,
      used: false,
      baseVal: m
    });
  }
  let currentGroups = groups;
  let combined = false;
  do {
    const newGroups: Group[][] = Array.from({ length: numVars + 1 }, () => []);
    combined = false;
    for (let i = 0; i < currentGroups.length - 1; i++) {
      for (const g1 of currentGroups[i]) {
        for (const g2 of currentGroups[i + 1]) {
          const diff = differByOneBit(
            g1.baseVal,
            g2.baseVal,
            g1.mask,
            g2.mask,
            numVars
          );
          if (diff !== -1) {
            const newMask = g1.mask | g2.mask | diff;
            const newMinterms = Array.from(
              new Set([...g1.minterms, ...g2.minterms])
            ).sort((a, b) => a - b);
            const newBaseVal = computeBaseVal(newMinterms, numVars);
            // Determine group by the number of specified bits.
            let countSpecified = 0;
            for (let j = 0; j < numVars; j++) {
              if (((newMask >> j) & 1) === 0) countSpecified++;
            }
            newGroups[countSpecified].push({
              minterms: newMinterms,
              mask: newMask,
              used: false,
              baseVal: newBaseVal
            });
            g1.used = true;
            g2.used = true;
            combined = true;
          }
        }
      }
    }
    // Reassign implicants that could not be combined.
    const flatCurrent = currentGroups.flat();
    for (const g of flatCurrent) {
      if (!g.used) {
        let countSpecified = 0;
        for (let j = 0; j < numVars; j++) {
          if (((g.mask >> j) & 1) === 0) countSpecified++;
        }
        newGroups[countSpecified].push(g);
      }
    }
    // Remove duplicates in each group.
    for (let i = 0; i < newGroups.length; i++) {
      newGroups[i] = removeDuplicateGroups(newGroups[i]);
    }
    currentGroups = newGroups;
  } while (combined);

  const primeImplicants = currentGroups.flat();

  // Select essential implicants.
  const essentialPIs: Group[] = [];
  const nonEssentialPIs: Group[] = [];
  const coveredMinterms = new Set<number>();
  for (const pi of primeImplicants) {
    let isEssential = false;
    for (const m of pi.minterms) {
      const coverCount = primeImplicants.filter((p) =>
        p.minterms.includes(m)
      ).length;
      if (coverCount === 1) {
        isEssential = true;
        break;
      }
    }
    if (isEssential) {
      essentialPIs.push(pi);
      pi.minterms.forEach((m) => coveredMinterms.add(m));
    } else {
      nonEssentialPIs.push(pi);
    }
  }
  const uncovered = new Set<number>(
    minterms.filter((m) => !coveredMinterms.has(m))
  );
  const selectedPIs: Group[] = [];
  if (uncovered.size > 0) {
    // Use Petrick's method for remaining minterms.
    const petrickTerms: Array<Set<number>> = [];
    uncovered.forEach((m) => {
      const indices = new Set<number>();
      nonEssentialPIs.forEach((pi, index) => {
        if (pi.minterms.includes(m)) {
          indices.add(index);
        }
      });
      petrickTerms.push(indices);
    });
    const combinations = petrickProduct(petrickTerms);
    const chosen = chooseMinimalCombination(combinations, nonEssentialPIs, numVars);
    chosen.forEach((idx) => selectedPIs.push(nonEssentialPIs[idx]));
  }
  const finalCover = removeDuplicateGroups([...essentialPIs, ...selectedPIs]);

  // Build the simplified expression (ensuring a consistent variable order).
  const expressionParts: string[] = [];
  for (const pi of finalCover) {
    let literal = "";
    for (let bitPos = numVars - 1; bitPos >= 0; bitPos--) {
      if (((pi.mask >> bitPos) & 1) === 0) {
        const bitVal = (pi.baseVal >> bitPos) & 1;
        const variableName = String.fromCharCode(65 + (numVars - bitPos - 1));
        literal += bitVal ? variableName : variableName + "'";
      }
    }
    if (literal === "") literal = "1";
    expressionParts.push(literal);
  }
  return { expression: expressionParts.join(" + "), finalCover };
}
