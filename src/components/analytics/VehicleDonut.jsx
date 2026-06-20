// Vehicle class breakdown donut chart using Recharts
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useAppContext } from "../../context/AppContext";
import { VEHICLE_CLASSES } from "../../data/vehicleClasses";

export default function VehicleDonut() {
  const { sessionStats } = useAppContext();
  const breakdown = sessionStats.vehicleBreakdown;

  const data = Object.entries(breakdown).map(([cls, count]) => ({
    name: VEHICLE_CLASSES[cls]?.label || cls,
    value: count,
    color: VEHICLE_CLASSES[cls]?.color || "#64748b"
  }));

  if (data.length === 0) return null;

  return (
    <div className="chart-card">
      <h4 className="chart-title">Vehicle Distribution</h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(100,116,139,0.3)",
              borderRadius: "8px",
              color: "#e2e8f0"
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
