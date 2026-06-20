// Indian state selector dropdown for fine calculation
import { useAppContext } from "../../context/AppContext";
import { STATE_LIST } from "../../data/states";

export default function StateSelector() {
  const { selectedState, setSelectedState } = useAppContext();

  return (
    <div className="state-selector" id="state-selector">
      <label className="selector-label" htmlFor="state-select">
        Select State (affects fine amounts)
      </label>
      <select
        id="state-select"
        className="state-select"
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
      >
        {STATE_LIST.map((state) => (
          <option key={state.code} value={state.code}>
            {state.code} — {state.name} (×{state.multiplier})
          </option>
        ))}
      </select>
    </div>
  );
}
