// Before/After preview pane with weather preprocessing
import { useEffect, useRef } from "react";
import { useAppContext } from "../../context/AppContext";
import { preprocessImage } from "../../utils/imagePreprocess";

export default function PreviewPane() {
  const { originalImage, processedImage, weatherMode, setProcessedImage } = useAppContext();
  const beforeRef = useRef(null);
  const afterRef = useRef(null);

  // re-process whenever weather mode or original image changes
  useEffect(() => {
    if (!originalImage) return;

    preprocessImage(originalImage, weatherMode).then((result) => {
      setProcessedImage(result);
    });
  }, [originalImage, weatherMode, setProcessedImage]);

  // draw previews on canvases
  useEffect(() => {
    drawPreview(beforeRef.current, originalImage);
  }, [originalImage]);

  useEffect(() => {
    drawPreview(afterRef.current, processedImage);
  }, [processedImage]);

  return (
    <div className="preview-pane">
      <div className="preview-card">
        <span className="preview-label">Original</span>
        <canvas ref={beforeRef} className="preview-canvas" />
      </div>
      <div className="preview-card">
        <span className="preview-label">Enhanced</span>
        <canvas ref={afterRef} className="preview-canvas" />
      </div>
    </div>
  );
}

// draw a base64 image onto a canvas
function drawPreview(canvas, src) {
  if (!canvas || !src) return;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    // scale to fit canvas while keeping aspect ratio
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, w, h);
  };
  img.src = src;
}
