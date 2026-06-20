import { useAppContext } from "../../context/AppContext";
import { analyzeImage } from "../../services/yoloVision";
import { buildAllChallans } from "../../utils/challanBuilder";

export default function AnalyzeButton() {
  const {
    processedImage,
    originalImage,
    isAnalyzing,
    selectedState,
    setAnalyzing,
    setAnalysisResult,
    setError,
    addChallans,
    updateStats,
    updateChallanStats
  } = useAppContext();

  const imageToAnalyze = processedImage || originalImage;
  const canAnalyze = !!imageToAnalyze && !isAnalyzing;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setAnalyzing(true);
    try {
      // call YOLO Vision API
      const result = await analyzeImage(imageToAnalyze);
      setAnalysisResult(result);

      // update session stats
      updateStats(result);

      // build challans for all vehicles with violations
      // small delay so annotated canvas renders first
      setTimeout(() => {
        const annotatedCanvas = document.getElementById("annotated-canvas");
        const evidenceImage = annotatedCanvas
          ? annotatedCanvas.toDataURL("image/png")
          : imageToAnalyze;

        const newChallans = buildAllChallans(result, selectedState, evidenceImage);
        if (newChallans.length > 0) {
          addChallans(newChallans);
          updateChallanStats(newChallans.length);
        }
      }, 500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <button
      className={`analyze-btn ${isAnalyzing ? "analyzing" : ""}`}
      onClick={handleAnalyze}
      disabled={!canAnalyze}
      id="analyze-btn"
    >
      {isAnalyzing ? (
        <>
          <span className="spinner"></span>
          Analyzing with YOLO Model...
        </>
      ) : (
        <>
          <span className="btn-icon">🔍</span>
          Analyze Traffic Image
        </>
      )}
    </button>
  );
}
