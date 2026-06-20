// Left panel: upload zone, weather toggle, state selector, analyze button
import UploadZone from "../upload/UploadZone";
import DemoImageGrid from "../upload/DemoImageGrid";
import WeatherToggle from "../preprocessing/WeatherToggle";
import PreviewPane from "../preprocessing/PreviewPane";
import StateSelector from "../controls/StateSelector";
import AnalyzeButton from "../controls/AnalyzeButton";
import { useAppContext } from "../../context/AppContext";

export default function LeftPanel() {
  const { originalImage } = useAppContext();

  return (
    <aside className="left-panel">
      <div className="panel-section">
        <h2 className="section-title">
          <span className="section-icon">📸</span>
          Upload Image
        </h2>
        <UploadZone />
        <DemoImageGrid />
      </div>

      {originalImage && (
        <>
          <div className="panel-section">
            <h2 className="section-title">
              <span className="section-icon">🌤️</span>
              Weather Enhancement
            </h2>
            <WeatherToggle />
            <PreviewPane />
          </div>

          <div className="panel-section">
            <h2 className="section-title">
              <span className="section-icon">📍</span>
              Jurisdiction
            </h2>
            <StateSelector />
          </div>

          <div className="panel-section">
            <AnalyzeButton />
          </div>
        </>
      )}
    </aside>
  );
}
