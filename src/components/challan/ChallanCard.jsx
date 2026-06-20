// Full challan UI card with vehicle details, violations table, and PDF export
import ChallanTable from "./ChallanTable";
import PDFExport from "./PDFExport";

export default function ChallanCard({ challan }) {
  return (
    <div className="challan-card" id={`challan-${challan.challan_id}`}>
      {/* challan header */}
      <div className="challan-header">
        <div className="challan-title-row">
          <h3 className="challan-title">e-Challan</h3>
          <span className="challan-id">#{challan.challan_id.slice(0, 8)}</span>
        </div>
        <div className="challan-meta">
          <span>📅 {new Date(challan.timestamp).toLocaleString()}</span>
          <span>📷 {challan.camera_id}</span>
          <span>📍 {challan.state_name} ({challan.state})</span>
        </div>
      </div>

      {/* vehicle details */}
      <div className="challan-vehicle">
        <div className="challan-detail">
          <span className="detail-label">Vehicle Class</span>
          <span className="detail-value">{challan.vehicle.class}</span>
        </div>
        <div className="challan-detail">
          <span className="detail-label">License Plate</span>
          <span className="detail-value">{challan.vehicle.plate?.raw || "Not detected"}</span>
        </div>
        <div className="challan-detail">
          <span className="detail-label">State</span>
          <span className="detail-value">{challan.vehicle.plate?.state || challan.state_name}</span>
        </div>
        <div className="challan-detail">
          <span className="detail-label">Multiplier</span>
          <span className="detail-value">×{challan.multiplier}</span>
        </div>
      </div>

      {/* violations table */}
      <ChallanTable violations={challan.violations} />

      {/* total fine */}
      <div className="challan-total">
        <span className="total-label">Total Fine</span>
        <span className="total-amount">₹{challan.total_fine.toLocaleString("en-IN")}</span>
      </div>

      {/* PDF download button */}
      <PDFExport challan={challan} />
    </div>
  );
}
