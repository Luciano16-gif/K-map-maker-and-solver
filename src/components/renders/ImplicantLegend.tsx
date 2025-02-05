import { Group } from "../types/Group";
import { countSpecifiedLiterals } from "../utils/functions";

interface ImplicantLegendProps {
  groups: Group[];
  numVars: number;
}

export const ImplicantLegend: React.FC<ImplicantLegendProps> = ({ groups, numVars }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">Implicant Legend:</h2>
      <ul className="space-y-2">
        {groups.map((group, idx) => (
          <li key={idx} className="flex items-center space-x-3">
            <span
              className="inline-block w-5 h-5 rounded-full"
              style={{ backgroundColor: group.color }}
            ></span>
            <span>
              G{idx + 1} (Literal Count: {countSpecifiedLiterals(group, numVars)})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
