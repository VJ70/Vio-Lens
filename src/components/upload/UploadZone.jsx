// Drag-and-drop + file picker upload zone
import { useCallback, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { readFileAsBase64 } from "../../utils/imagePreprocess";

export default function UploadZone() {
  const { setOriginalImage } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // handle file selection from input or drop
  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const base64 = await readFileAsBase64(file);
    setOriginalImage(base64);
  }, [setOriginalImage]);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onClick = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div
      className={`upload-zone ${isDragging ? "dragging" : ""}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      id="upload-zone"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: "none" }}
      />
      <div className="upload-content">
        <div className="upload-icon">📁</div>
        <p className="upload-text">
          {isDragging ? "Drop image here" : "Drag & drop traffic image"}
        </p>
        <p className="upload-hint">or click to browse · JPG, PNG supported</p>
      </div>
    </div>
  );
}
