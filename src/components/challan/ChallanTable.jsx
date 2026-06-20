// Violations breakdown table for challan
export default function ChallanTable({ violations }) {
  return (
    <div className="challan-table-wrapper">
      <table className="challan-table">
        <thead>
          <tr>
            <th>Violation</th>
            <th>MV Act Section</th>
            <th>Confidence</th>
            <th>Fine (₹)</th>
          </tr>
        </thead>
        <tbody>
          {violations.map((v, i) => (
            <tr key={i} className={`severity-row severity-${v.severity}`}>
              <td>{v.label}</td>
              <td>{v.section}</td>
              <td>{Math.round(v.confidence * 100)}%</td>
              <td className="fine-cell">₹{v.adjusted_fine.toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
