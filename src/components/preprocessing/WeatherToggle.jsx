// Weather mode toggle: Normal / Monsoon / Haze / Fog
import { useAppContext } from "../../context/AppContext";

const MODES = [
  { value: "normal", label: "Normal", icon: "☀️" },
  { value: "monsoon", label: "Monsoon", icon: "🌧️" },
  { value: "haze", label: "Haze", icon: "🌫️" },
  { value: "fog", label: "Fog", icon: "🌁" }
];

export default function WeatherToggle() {
  const { weatherMode, setWeatherMode } = useAppContext();

  return (
    <div className="weather-toggle" id="weather-toggle">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          className={`weather-btn ${weatherMode === mode.value ? "active" : ""}`}
          onClick={() => setWeatherMode(mode.value)}
          id={`weather-${mode.value}`}
        >
          <span className="weather-icon">{mode.icon}</span>
          <span className="weather-label">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
