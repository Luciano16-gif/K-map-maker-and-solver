import { ChangeEvent } from 'react';
import { Button } from '../Button';

interface MapControlsProps {
  useCustom: boolean;
  customNumVars: number;
  onCustomToggle: (value: boolean) => void;
  onCustomNumChange: (value: number) => void;
  onUpdateCustomMap: () => void;
  onGenerateNewMap: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  useCustom,
  customNumVars,
  onCustomToggle,
  onCustomNumChange,
  onUpdateCustomMap,
  onGenerateNewMap
}) => {
  return (
    <div className="space-y-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={useCustom}
          onChange={(e) => onCustomToggle(e.target.checked)}
          className="form-checkbox"
        />
        <span className="text-lg font-medium">Custom Variable Number</span>
      </label>
      {useCustom ? (
        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-md">
          <label className="font-medium">Number of Variables:</label>
          <select
            value={customNumVars}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onCustomNumChange(parseInt(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
          <Button onClick={onUpdateCustomMap} className="rounded-lg shadow-md hover:bg-blue-100">
            Update Map
          </Button>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button onClick={onGenerateNewMap} className="w-60 rounded-lg shadow-md hover:bg-blue-100">
            Generate New Map
          </Button>
        </div>
      )}
    </div>
  );
};
