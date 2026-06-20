// Violation type breakdown bar chart using Recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useAppContext } from "../../context/AppContext";
import { VIOLATIONS } from "../../data/mvact";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1", "#f97316", "#64748b", "#a855f7"];

export default function ViolationChart() {
  const { sessionStats } = useAppContext();
  const breakdown = sessionStats.violationBreakdown;

  const data = Object.entries(breakdown).map(([type, count]) => ({
    name: VIOLATIONS[type]?.label || type.replace(/_/g, " "),
    count,
    type
  }));

  if (data.length === 0) return null;

  return (
    <div className="chart-card">
      <h4 className="chart-title">Violation Breakdown</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(100,116,139,0.3)",
              borderRadius: "8px",
              color: "#e2e8f0"
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
