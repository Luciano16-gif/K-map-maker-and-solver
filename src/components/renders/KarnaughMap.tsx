import { Group } from "../types/Group";
import { toBinaryString } from "../utils/functions";

interface Cell {
  index: number;
  value: boolean;
}

export interface KarnaughMapProps {
  data: boolean[];
  numVars: number;
  groups?: Group[];
  onToggle?: (mintermIndex: number) => void;
}

export const KarnaughMap: React.FC<KarnaughMapProps> = ({ data, numVars, groups = [], onToggle }) => {
  const tableClasses = "border-collapse w-full text-center";
  const headerClasses = "bg-gray-200 font-semibold border border-gray-400 px-2 py-1";
  const baseCellClasses =
    "border border-gray-300 px-4 py-3 transition-colors duration-200 relative cursor-pointer hover:bg-gray-100";

  // Build the cell matrix based on the number of variables.
  let map: Cell[][] = [];
  if (numVars === 1) {
    map.push([
      { index: 0, value: data[0] },
      { index: 1, value: data[1] }
    ]);
  } else if (numVars === 2) {
    map = [
      [
        { index: 0, value: data[0] },
        { index: 1, value: data[1] }
      ],
      [
        { index: 2, value: data[2] },
        { index: 3, value: data[3] }
      ]
    ];
  } else if (numVars === 3) {
    const colOrder = [0, 1, 3, 2];
    for (let cVal = 0; cVal < 2; cVal++) {
      const row: Cell[] = [];
      for (let i = 0; i < 4; i++) {
        const ab = colOrder[i];
        const A = (ab >> 1) & 1;
        const B = ab & 1;
        const idx = (A << 2) + (B << 1) + cVal;
        row.push({ index: idx, value: data[idx] });
      }
      map.push(row);
    }
  } else if (numVars === 4) {
    const order = [0, 1, 3, 2];
    for (let r = 0; r < 4; r++) {
      const row: Cell[] = [];
      const cd = order[r];
      const C = (cd >> 1) & 1;
      const D = cd & 1;
      for (let c = 0; c < 4; c++) {
        const ab = order[c];
        const A = (ab >> 1) & 1;
        const B = ab & 1;
        const idx = (A << 3) + (B << 2) + (C << 1) + D;
        row.push({ index: idx, value: data[idx] });
      }
      map.push(row);
    }
  }

  // Determine tooltip and border style based on group membership.
  function cellGroupInfo(cellIndex: number): { title: string; borderStyle?: React.CSSProperties } {
    const coveringGroups = groups.filter((g) => g.minterms.includes(cellIndex));
    if (coveringGroups.length > 0) {
      const groupNames = coveringGroups.map((_, i) => "G" + (i + 1));
      return {
        title: "Groups: " + groupNames.join(", "),
        borderStyle: { border: `2px solid ${coveringGroups[0].color}` }
      };
    }
    return { title: "", borderStyle: {} };
  }

  const renderCell = (cell: Cell) => {
    const { title, borderStyle } = cellGroupInfo(cell.index);
    return (
      <td
        key={cell.index}
        className={baseCellClasses}
        title={title}
        style={borderStyle}
        onClick={() => onToggle && onToggle(cell.index)}
      >
        {cell.value ? 1 : 0}
      </td>
    );
  };

  // Render table based on numVars.
  if (numVars === 1) {
    return (
      <div className="w-full flex flex-col space-y-2 p-4 bg-white rounded-lg shadow-lg">
        <div className="font-bold text-xl">K-Map for 1 Variable (A)</div>
        <div className="flex gap-2">
          {map[0].map(renderCell)}
        </div>
      </div>
    );
  } else if (numVars === 2) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg overflow-auto">
        <div className="font-bold text-xl mb-2">K-Map (2 Variables: A, B)</div>
        <table className={tableClasses}>
          <thead>
            <tr>
              <th className={headerClasses}></th>
              <th className={headerClasses}>B = 0</th>
              <th className={headerClasses}>B = 1</th>
            </tr>
          </thead>
          <tbody>
            {map.map((row, i) => (
              <tr key={i}>
                <th className={headerClasses}>{i === 0 ? "A = 0" : "A = 1"}</th>
                {row.map(renderCell)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else if (numVars === 3) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg overflow-auto">
        <div className="font-bold text-xl mb-2">K-Map (3 Variables: A, B, C)</div>
        <table className={tableClasses}>
          <thead>
            <tr>
              <th className={headerClasses}>C vs AB</th>
              <th className={headerClasses}>00</th>
              <th className={headerClasses}>01</th>
              <th className={headerClasses}>11</th>
              <th className={headerClasses}>10</th>
            </tr>
          </thead>
          <tbody>
            {map.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th className={headerClasses}>C = {rowIndex}</th>
                {row.map(renderCell)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg overflow-auto">
        <div className="font-bold text-xl mb-2">K-Map (4 Variables: A, B, C, D)</div>
        <table className={tableClasses}>
          <thead>
            <tr>
              <th className={headerClasses}>CD vs AB</th>
              <th className={headerClasses}>00</th>
              <th className={headerClasses}>01</th>
              <th className={headerClasses}>11</th>
              <th className={headerClasses}>10</th>
            </tr>
          </thead>
          <tbody>
            {map.map((row, i) => (
              <tr key={i}>
                <th className={headerClasses}>{toBinaryString(i, 2)}</th>
                {row.map(renderCell)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};
