// 4 summary metric cards for session-wide stats
import { useAppContext } from "../../context/AppContext";

export default function MetricCards() {
  const { sessionStats } = useAppContext();

  const metrics = [
    {
      label: "Images Analyzed",
      value: sessionStats.totalImagesAnalyzed,
      icon: "📸",
      color: "#3b82f6"
    },
    {
      label: "Vehicles Detected",
      value: sessionStats.totalVehiclesDetected,
      icon: "🚗",
      color: "#10b981"
    },
    {
      label: "Violations Found",
      value: sessionStats.totalViolationsFound,
      icon: "⚠️",
      color: "#ef4444"
    },
    {
      label: "Challans Generated",
      value: sessionStats.totalChallansGenerated,
      icon: "📋",
      color: "#f59e0b"
    }
  ];

  return (
    <div className="metric-cards">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="metric-card"
          style={{ "--accent": m.color }}
        >
          <span className="metric-icon">{m.icon}</span>
          <div className="metric-data">
            <span className="metric-value">{m.value}</span>
            <span className="metric-label">{m.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
