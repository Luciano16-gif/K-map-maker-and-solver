import { useState } from 'react';
import { motion } from 'framer-motion';
import { generateRandomMinterms, toBinaryString } from "../components/utils/functions";
import { quineMcCluskey } from "../components/logic/QuineMcCluskey";
import { KarnaughMap } from "../components/renders/KarnaughMap";
import { ImplicantLegend } from "../components/renders/ImplicantLegend";
import { MapControls } from "../components/renders/MapControls";

// Define the color palette.
const groupColors = ["#F44336", "#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#00BCD4"];

export default function KarnaughMapApp() {
  // State for custom variable number mode.
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [customNumVars, setCustomNumVars] = useState<number>(4);

  // Main state for the map.
  const [numVars, setNumVars] = useState<number>(4);
  const [data, setData] = useState<boolean[]>(() => generateRandomMinterms(4));

  // When in default mode, generate a new map with a random variable count (2–4).
  function handleGenerateNewMap() {
    const newNumVars = Math.floor(Math.random() * 3) + 2;
    setNumVars(newNumVars);
    setData(generateRandomMinterms(newNumVars));
  }

  // When in custom mode, update the map using the selected variable count.
  function handleUpdateCustomMap() {
    setNumVars(customNumVars);
    setData(generateRandomMinterms(customNumVars));
  }

  // Toggle a cell value.
  function handleToggle(index: number) {
    setData((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  }

  // Convert boolean array to indices where value is true.
  function toMinterms(arr: boolean[]): number[] {
    const ms: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) ms.push(i);
    }
    return ms;
  }

  const minterms = toMinterms(data);
  const { expression: simplified, finalCover } = quineMcCluskey(minterms, numVars);

  // Assign colors to implicants for consistency.
  const coloredCover = finalCover.map((group, idx) => ({
    ...group,
    color: groupColors[idx % groupColors.length]
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-6 space-y-6 bg-gray-50 min-h-screen"
    >
      <h1 className="text-3xl font-bold text-center">Random K-Map Generator</h1>
      <p className="text-center text-gray-600">
        Up to 4 variables (A, B, C, D)
      </p>

      <MapControls
        useCustom={useCustom}
        customNumVars={customNumVars}
        onCustomToggle={setUseCustom}
        onCustomNumChange={setCustomNumVars}
        onUpdateCustomMap={handleUpdateCustomMap}
        onGenerateNewMap={handleGenerateNewMap}
      />

      <div className="max-w-full">
        <KarnaughMap data={data} numVars={numVars} groups={coloredCover} onToggle={handleToggle} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-2">Simplified Expression:</h2>
        <p className="font-mono bg-gray-100 p-3 rounded inline-block text-lg">{simplified}</p>
      </div>

      {coloredCover.length > 0 && <ImplicantLegend groups={coloredCover} numVars={numVars} />}
    </motion.div>
  );
}
