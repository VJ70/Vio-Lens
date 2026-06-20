// Annotated canvas — draws bounding boxes and violation labels on the image
import { useRef, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { annotateCanvas } from "../../utils/canvasAnnotator";

export default function AnnotatedCanvas() {
  const { processedImage, originalImage, analysisResult } = useAppContext();
  const canvasRef = useRef(null);
  const imageToShow = processedImage || originalImage;

  useEffect(() => {
    if (!canvasRef.current || !imageToShow) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      // size canvas to image, max 800px wide
      const maxW = 800;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      annotateCanvas(canvas, img, analysisResult);
    };
    img.src = imageToShow;
  }, [imageToShow, analysisResult]);

  return (
    <div className="annotated-canvas-container">
      <canvas
        ref={canvasRef}
        id="annotated-canvas"
        className="annotated-canvas"
      />
      {analysisResult?.scene_description && (
        <p className="scene-description">
          📍 {analysisResult.scene_description}
          {analysisResult.weather_condition && (
            <span className="weather-badge">{analysisResult.weather_condition}</span>
          )}
        </p>
      )}
    </div>
  );
}
