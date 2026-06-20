// Two-panel grid layout wrapper
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

export default function Layout() {
  return (
    <div className="layout">
      {/* app header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">🚦</div>
          <div>
            <h1 className="brand-title">VioLens</h1>
            <p className="brand-subtitle">AI-Powered Traffic Violation Detection System</p>
          </div>
        </div>
        <div className="header-badge">
          <span className="badge-dot"></span>
          MV Act 2019 Compliant
        </div>
      </header>

      {/* main content panels */}
      <div className="panels-container">
        <LeftPanel />
        <RightPanel />
      </div>
    </div>
  );
}
