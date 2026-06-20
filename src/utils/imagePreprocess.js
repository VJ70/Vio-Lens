// Canvas-based image preprocessing for weather conditions
// Applies CSS filters to compensate for poor visibility

const WEATHER_FILTERS = {
  normal: null,
  monsoon: { contrast: 1.3, brightness: 1.1, saturate: 0.8 },
  haze: { contrast: 1.5, brightness: 1.2, saturate: 1.1 },
  fog: { contrast: 1.6, brightness: 1.3, saturate: 1.0 }
};

// apply weather filter to base64 image, returns processed base64
export function preprocessImage(base64Data, weatherMode = "normal") {
  return new Promise((resolve) => {
    const filter = WEATHER_FILTERS[weatherMode];
    // no filter needed for normal mode
    if (!filter) {
      resolve(base64Data);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      // apply CSS filters via canvas
      ctx.filter = `contrast(${filter.contrast}) brightness(${filter.brightness}) saturate(${filter.saturate})`;
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = base64Data;
  });
}

// read file as base64 data URL
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// extract raw base64 string (without data URL prefix) for API calls
export function stripBase64Prefix(dataUrl) {
  return dataUrl.replace(/^data:image\/\w+;base64,/, "");
}

// get mime type from data URL
export function getMimeType(dataUrl) {
  const match = dataUrl.match(/^data:(image\/\w+);base64,/);
  return match ? match[1] : "image/jpeg";
}

export { WEATHER_FILTERS };
