export interface Group {
    minterms: number[]; // indices of covered minterms
    mask: number;       // bits not specified (don't care)
    used: boolean;
    baseVal: number;    // base value (bitwise AND of minterms)
    color?: string;     // assigned color for display consistency
  }
  