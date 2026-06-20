// Grid of preloaded demo Indian traffic images
import { useAppContext } from "../../context/AppContext";

// demo images from public/demo-images/
const DEMOS = [
  { file: "delhi-intersection.jpg", label: "Delhi Intersection" },
  { file: "mumbai-highway.jpg", label: "Mumbai Highway" },
  { file: "bangalore-signal.jpg", label: "Bangalore Signal" },
  { file: "triple-riding.jpg", label: "Triple Riding" },
  { file: "no-helmet.jpg", label: "No Helmet" }
];

export default function DemoImageGrid() {
  const { setOriginalImage } = useAppContext();

  // load demo image as base64
  const loadDemo = async (filename) => {
    try {
      const response = await fetch(`/demo-images/${filename}`);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => setOriginalImage(reader.result);
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load demo:", err);
    }
  };

  return (
    <div className="demo-grid">
      <p className="demo-label">Or try a demo image:</p>
      <div className="demo-thumbnails">
        {DEMOS.map((demo) => (
          <button
            key={demo.file}
            className="demo-thumb"
            onClick={() => loadDemo(demo.file)}
            title={demo.label}
            id={`demo-${demo.file.replace(".jpg", "")}`}
          >
            <img
              src={`/demo-images/${demo.file}`}
              alt={demo.label}
              loading="lazy"
            />
            <span className="demo-thumb-label">{demo.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
