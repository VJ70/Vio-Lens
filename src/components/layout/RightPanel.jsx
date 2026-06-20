// Right panel: annotated results, vehicle cards, challans, analytics
import AnnotatedCanvas from "../results/AnnotatedCanvas";
import VehicleCard from "../results/VehicleCard";
import ChallanCard from "../challan/ChallanCard";
import Dashboard from "../analytics/Dashboard";
import { useAppContext } from "../../context/AppContext";

export default function RightPanel() {
  const { analysisResult, challans, sessionStats, error } = useAppContext();

  const hasResults = analysisResult !== null;
  const hasChallans = challans.length > 0;
  const hasStats = sessionStats.totalImagesAnalyzed > 0;

  return (
    <main className="right-panel">
      {/* error display */}
      {error && (
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <div>
            <strong>Analysis Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* annotated image + vehicle cards */}
      {hasResults && (
        <>
          {analysisResult.metadata?.warnings?.length > 0 && (
            <div className="warning-banner" style={{ background: '#fff3cd', color: '#856404', padding: '10px 15px', borderRadius: '4px', marginBottom: '20px', borderLeft: '4px solid #ffeeba' }}>
              <span style={{ marginRight: '8px' }}>⚠️</span>
              <strong>Note:</strong> {analysisResult.metadata.warnings.join(' ')}
            </div>
          )}
          <div className="panel-section">
            <h2 className="section-title">
              <span className="section-icon">🔍</span>
              Detection Results
              <span className="result-count">
                {analysisResult.total_vehicles} vehicles · {analysisResult.total_violations} violations
              </span>
            </h2>
            <AnnotatedCanvas />
          </div>

          <div className="panel-section">
            <h2 className="section-title">
              <span className="section-icon">🚗</span>
              Detected Vehicles
            </h2>
            <div className="vehicle-cards-grid">
              {analysisResult.vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  violations={analysisResult.violations.filter(
                    (v) => v.vehicle_id === vehicle.id
                  )}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* challan cards */}
      {hasChallans && (
        <div className="panel-section">
          <h2 className="section-title">
            <span className="section-icon">📋</span>
            Generated Challans
            <span className="result-count">{challans.length} issued</span>
          </h2>
          <div className="challans-list">
            {challans.map((challan) => (
              <ChallanCard key={challan.challan_id} challan={challan} />
            ))}
          </div>
        </div>
      )}

      {/* analytics dashboard */}
      {hasStats && (
        <div className="panel-section">
          <h2 className="section-title">
            <span className="section-icon">📊</span>
            Session Analytics
          </h2>
          <Dashboard />
        </div>
      )}

      {/* empty state */}
      {!hasResults && !hasChallans && !hasStats && !error && (
        <div className="empty-state">
          <div className="empty-icon">🚦</div>
          <h3>Upload a Traffic Image</h3>
          <p>Upload or select a demo image from the left panel, then click Analyze to detect violations.</p>
        </div>
      )}
    </main>
  );
}
