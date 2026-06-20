// Per-vehicle result card showing detections and violations
import ViolationBadge from "./ViolationBadge";
import { VEHICLE_CLASSES } from "../../data/vehicleClasses";

export default function VehicleCard({ vehicle, violations }) {
  const classInfo = VEHICLE_CLASSES[vehicle.class] || {};
  const hasViolations = violations.length > 0;

  return (
    <div className={`vehicle-card ${hasViolations ? "has-violations" : "clean"}`}>
      <div className="vehicle-header">
        <span className="vehicle-icon">{classInfo.icon || "🚗"}</span>
        <div className="vehicle-info">
          <h4 className="vehicle-class">
            {classInfo.label || vehicle.class} ({vehicle.id})
          </h4>
          <p className="vehicle-plate">
            {typeof vehicle.plate === 'string' ? vehicle.plate : (vehicle.plate?.raw || "Plate not detected")}
            {vehicle.plate?.state && (
              <span className="plate-state"> · {vehicle.plate.state}</span>
            )}
          </p>
        </div>
        <div className="vehicle-confidence">
          <div
            className="confidence-ring"
            style={{
              "--confidence": `${Math.round((vehicle.confidence || 0) * 100)}%`,
              "--color": classInfo.color || "#3b82f6"
            }}
          >
            {Math.round((vehicle.confidence || 0) * 100)}%
          </div>
        </div>
      </div>

      {/* occupants */}
      {vehicle.occupants > 0 && (
        <p className="vehicle-occupants">
          👤 {vehicle.occupants} occupant{vehicle.occupants > 1 ? "s" : ""}
        </p>
      )}

      {/* violations */}
      {hasViolations ? (
        <div className="vehicle-violations">
          {violations.map((v, i) => (
            <ViolationBadge key={i} violation={v} />
          ))}
        </div>
      ) : (
        <p className="no-violations">✅ No violations detected</p>
      )}
    </div>
  );
}
