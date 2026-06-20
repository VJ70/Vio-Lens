// Canvas annotation utility
// Draws bounding boxes, labels, and violation indicators on traffic images
// Now supports real pixel-coordinate bboxes from multi-layer YOLO backend

// fallback position map for when bbox is not available
const POSITION_MAP = {
  "top-left": { x: 0.1, y: 0.15 },
  "top-center": { x: 0.5, y: 0.15 },
  "top-right": { x: 0.85, y: 0.15 },
  "center-left": { x: 0.15, y: 0.5 },
  "center": { x: 0.5, y: 0.5 },
  "center-right": { x: 0.85, y: 0.5 },
  "bottom-left": { x: 0.15, y: 0.8 },
  "bottom-center": { x: 0.5, y: 0.8 },
  "bottom-right": { x: 0.85, y: 0.8 },
  "left": { x: 0.15, y: 0.5 },
  "right": { x: 0.85, y: 0.5 }
};

// severity-based colors
const SEVERITY_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e"
};

// get canvas position — prefers real bbox, falls back to position_hint
function getBoxRect(item, canvasW, canvasH, imgDims) {
  // if backend returned real pixel bbox, scale to canvas
  if (item.bbox && Array.isArray(item.bbox) && imgDims) {
    const scaleX = canvasW / imgDims.width;
    const scaleY = canvasH / imgDims.height;
    return {
      x: item.bbox[0] * scaleX,
      y: item.bbox[1] * scaleY,
      w: (item.bbox[2] - item.bbox[0]) * scaleX,
      h: (item.bbox[3] - item.bbox[1]) * scaleY
    };
  }
  
  // fallback to position_hint (approximate)
  const hint = item.position || item.position_hint || "center";
  const pos = POSITION_MAP[hint] || POSITION_MAP["center"];
  const boxW = canvasW * 0.2;
  const boxH = canvasH * 0.25;
  return {
    x: pos.x * canvasW - boxW / 2,
    y: pos.y * canvasH - boxH / 2,
    w: boxW,
    h: boxH
  };
}

// draw a rounded rect
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// annotate a canvas with analysis results
export function annotateCanvas(canvas, image, analysisResult) {
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;

  // draw base image
  ctx.drawImage(image, 0, 0, width, height);

  if (!analysisResult) return;

  const vehicles = analysisResult.vehicles || [];
  const violations = analysisResult.violations || [];
  // image dimensions from backend for accurate bbox scaling
  const imgDims = analysisResult.image_dimensions || null;

  // scale font size based on canvas size
  const baseFontSize = Math.max(12, Math.min(width / 40, 18));

  // draw bounding boxes for each vehicle
  vehicles.forEach((vehicle) => {
    const rect = getBoxRect(vehicle, width, height, imgDims);

    // determine worst severity for this vehicle
    const vehicleViolations = violations.filter((v) => v.vehicle_id === vehicle.id);
    const hasViolation = vehicleViolations.length > 0;
    const worstSeverity = vehicleViolations.reduce((worst, v) => {
      const order = { high: 3, medium: 2, low: 1 };
      return (order[v.severity] || 0) > (order[worst] || 0) ? v.severity : worst;
    }, "low");

    // green box if no violations, red/yellow if violations
    const color = hasViolation
      ? (SEVERITY_COLORS[worstSeverity] || SEVERITY_COLORS.medium)
      : "#22c55e";

    // draw bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

    // draw label background
    const labelText = vehicle.class.toUpperCase();
    ctx.font = `bold ${baseFontSize}px Inter, sans-serif`;
    const labelW = ctx.measureText(labelText).width + 16;
    const labelH = baseFontSize + 12;

    ctx.fillStyle = color;
    roundedRect(ctx, rect.x, rect.y - labelH - 4, labelW, labelH, 4);
    ctx.fill();

    // draw label text
    ctx.fillStyle = "#ffffff";
    ctx.fillText(labelText, rect.x + 8, rect.y - 10);

    // draw confidence badge
    const confText = `${Math.round((vehicle.confidence || 0) * 100)}%`;
    ctx.font = `${baseFontSize - 2}px Inter, sans-serif`;
    const confW = ctx.measureText(confText).width + 12;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    roundedRect(ctx, rect.x + rect.w - confW - 4, rect.y + 4, confW, baseFontSize + 8, 4);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(confText, rect.x + rect.w - confW + 2, rect.y + baseFontSize + 4);
  });

  // draw violation indicators
  violations.forEach((violation) => {
    const rect = getBoxRect(violation, width, height, imgDims);
    const color = SEVERITY_COLORS[violation.severity] || SEVERITY_COLORS.medium;
    
    // center of the violation bbox
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;

    // pulsing dot
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // violation label
    const label = `${violation.type.replace(/_/g, " ")} (${Math.round(violation.confidence * 100)}%)`;
    ctx.font = `bold ${baseFontSize - 2}px Inter, sans-serif`;
    const tw = ctx.measureText(label).width + 12;

    ctx.fillStyle = "rgba(0,0,0,0.8)";
    roundedRect(ctx, cx + 12, cy - (baseFontSize / 2) - 4, tw, baseFontSize + 8, 4);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.fillText(label, cx + 18, cy + (baseFontSize / 2) - 2);
  });

  // scene overlay text (top-left)
  if (analysisResult.scene_description) {
    const desc = analysisResult.scene_description;
    ctx.font = `${baseFontSize - 1}px Inter, sans-serif`;
    const tw = ctx.measureText(desc).width + 20;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    roundedRect(ctx, 8, 8, tw, baseFontSize + 14, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(desc, 18, baseFontSize + 12);
  }
}

// export annotated canvas as PNG data URL
export function exportCanvasAsPNG(canvas) {
  return canvas.toDataURL("image/png");
}
