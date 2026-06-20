// YOLO Backend API service
// Sends image to local FastAPI backend which runs YOLOv8 and returns JSON

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_BACKEND_URL 
  ? `${import.meta.env.VITE_BACKEND_URL}/api/analyze` 
  : "http://localhost:8000/api/analyze";

// send image to local YOLO backend for analysis
export async function analyzeImage(base64DataUrl) {
  // Ensure we include the data URL prefix if it's missing
  const fullBase64 = base64DataUrl.startsWith('data:') 
    ? base64DataUrl 
    : `data:image/jpeg;base64,${base64DataUrl}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_base64: fullBase64
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Backend Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  
  // The backend handles the parsing and returning of exactly what Claude used to return
  if (!data.vehicles || !Array.isArray(data.vehicles)) {
    throw new Error("Invalid response from backend: missing vehicles array");
  }
  
  return data;
}
