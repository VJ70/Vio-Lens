// Individual violation severity pill/badge
import { VIOLATIONS } from "../../data/mvact";

const SEVERITY_STYLES = {
  high: { bg: "var(--severity-high-bg)", color: "var(--severity-high)" },
  medium: { bg: "var(--severity-medium-bg)", color: "var(--severity-medium)" },
  low: { bg: "var(--severity-low-bg)", color: "var(--severity-low)" }
};

export default function ViolationBadge({ violation }) {
  const info = VIOLATIONS[violation.type] || {};
  const style = SEVERITY_STYLES[violation.severity] || SEVERITY_STYLES.medium;
  const confidence = Math.round((violation.confidence || 0) * 100);

  return (
    <div
      className={`violation-badge severity-${violation.severity}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      <span className="violation-name">{info.label || violation.type}</span>
      <span className="violation-section">{info.section || ""}</span>
      <span className="violation-confidence">{confidence}%</span>
    </div>
  );
}
