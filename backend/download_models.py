import os
import sys
import urllib.request
import shutil

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

# Model registry: name → (url, filename, description)
MODELS = {
    "coco": {
        "url": "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8n.pt",
        "file": "yolov8n.pt",
        "desc": "YOLOv8n COCO - vehicle & person detection (80 classes)"
    },
    "helmet": {
        "hf_repo": "sharathhhhh/safetyHelmet-detection-yolov8",
        "hf_file": "best.pt",
        "file": "helmet_detector.pt",
        "desc": "Helmet detector - helmet / no_helmet classification"
    },
    "sign": {
        "url": "",
        "file": "sign_detector.pt",
        "desc": "Traffic sign detector - no_parking classification"
    },
    "plate": {
        "hf_repo": "Koushim/yolov8-license-plate-detection",
        "hf_file": "best.pt",
        "file": "plate_detector.pt",
        "desc": "License plate detector"
    },
    "seatbelt": {
        "url": "",
        "file": "seatbelt_detector.pt",
        "desc": "Seatbelt detector"
    }
}

def download_file(url, dest_path, desc):
    """Download a file with progress indication."""
    if not url:
        return False
    if os.path.exists(dest_path):
        size_mb = os.path.getsize(dest_path) / (1024 * 1024)
        print(f"  [OK] {desc} already exists ({size_mb:.1f} MB)")
        return True

    print(f"  [>] Downloading {desc}...")
    try:
        urllib.request.urlretrieve(url, dest_path)
        size_mb = os.path.getsize(dest_path) / (1024 * 1024)
        print(f"  [OK] Downloaded ({size_mb:.1f} MB)")
        return True
    except Exception as e:
        print(f"  [FAIL] Failed: {e}")
        return False

def try_huggingface_download(repo_id, filename, dest_path, desc):
    """Try downloading a model via Hugging Face Hub."""
    if os.path.exists(dest_path):
        size_mb = os.path.getsize(dest_path) / (1024 * 1024)
        print(f"  [OK] {desc} already exists ({size_mb:.1f} MB)")
        return True
        
    try:
        from huggingface_hub import hf_hub_download
        print(f"  [>] Downloading {desc} from HuggingFace ({repo_id})...")
        cached_file = hf_hub_download(repo_id=repo_id, filename=filename)
        shutil.copy2(cached_file, dest_path)
        size_mb = os.path.getsize(dest_path) / (1024 * 1024)
        print(f"  [OK] Downloaded ({size_mb:.1f} MB)")
        return True
    except ImportError:
        print("  [WARN] huggingface_hub package not installed. Install with: pip install huggingface_hub")
        return False
    except Exception as e:
        print(f"  [WARN] HuggingFace download failed: {e}")
        return False

def try_roboflow_download(project_name, version_num, dest_path, desc):
    """Try downloading a model via Roboflow SDK."""
    if os.path.exists(dest_path):
        size_mb = os.path.getsize(dest_path) / (1024 * 1024)
        print(f"  [OK] {desc} already exists ({size_mb:.1f} MB)")
        return True
        
    try:
        from roboflow import Roboflow
        print(f"\n  Attempting Roboflow SDK download for {desc}...")
        api_key = os.environ.get("ROBOFLOW_API_KEY", "")
        if not api_key:
            print("  [WARN] Set ROBOFLOW_API_KEY env var for automatic download")
            print("  [WARN] Get free key at: https://app.roboflow.com/settings/api")
            return False
        
        rf = Roboflow(api_key=api_key)
        workspace, project_id = project_name.split("/")
        project = rf.workspace(workspace).project(project_id)
        version = project.version(version_num)
        model = version.model
        model.download(dest_path)
        print(f"  [OK] {desc} downloaded via Roboflow SDK")
        return True
    except ImportError:
        print("  [WARN] roboflow package not installed. Install with: pip install roboflow")
        return False
    except Exception as e:
        print(f"  [WARN] Roboflow download failed: {e}")
        return False

def verify_models():
    """Verify all models are loaded and print their class names."""
    print("\n--- Model Verification ---")
    try:
        from ultralytics import YOLO
        
        for key, info in MODELS.items():
            path = os.path.join(MODELS_DIR, info["file"])
            if os.path.exists(path):
                model = YOLO(path)
                names = model.names
                print(f"\n  {key.capitalize()} model: {len(names)} classes")
                if key == "coco":
                    relevant = {k: v for k, v in names.items() if v in ['person', 'bicycle', 'car', 'motorcycle', 'bus', 'truck', 'traffic light']}
                    print(f"  Traffic-relevant: {relevant}")
                else:
                    print(f"  Classes: {names}")
            else:
                print(f"\n  [WARN] {key.capitalize()} model not found at {path}!")
                
    except Exception as e:
        print(f"  Error verifying models: {e}")

def main():
    os.makedirs(MODELS_DIR, exist_ok=True)
    print("=== VioLens Model Downloader ===\n")

    # Stage 1: COCO model
    print("[Stage 1] Vehicle & Person Detector (COCO YOLOv8n)")
    coco_info = MODELS["coco"]
    download_file(coco_info["url"], os.path.join(MODELS_DIR, coco_info["file"]), coco_info["desc"])

    # Stage 2: Helmet model (HuggingFace)
    print("\n[Stage 2] Helmet Detector")
    helmet_info = MODELS["helmet"]
    helmet_path = os.path.join(MODELS_DIR, helmet_info["file"])
    if not try_huggingface_download(helmet_info["hf_repo"], helmet_info["hf_file"], helmet_path, helmet_info["desc"]):
        print("\n  Manual download instructions:")
        print("  1. Go to https://universe.roboflow.com/helmetobjectdetection/helmet-detect-v2")
        print("  2. Export as 'YOLOv8' format -> download the .pt file")
        print(f"  3. Place it at: {helmet_path}")

    # Stage 3: Traffic Sign model (Roboflow manual)
    print("\n[Stage 3] Traffic Sign Detector")
    sign_info = MODELS["sign"]
    sign_path = os.path.join(MODELS_DIR, sign_info["file"])
    if os.path.exists(sign_path):
        size_mb = os.path.getsize(sign_path) / (1024 * 1024)
        print(f"  [OK] Sign model already exists ({size_mb:.1f} MB)")
    else:
        print("  Manual download instructions:")
        print("  1. Go to https://universe.roboflow.com")
        print("  2. Search for 'no parking sign yolov8'")
        print("  3. Pick a model with a 'no_parking' or similar class")
        print("  4. Export as 'YOLOv8' format -> download the .pt file")
        print(f"  5. Place it at: {sign_path}")

    # Stage 4: License Plate model (HuggingFace)
    print("\n[Stage 4] License Plate Detector")
    plate_info = MODELS["plate"]
    plate_path = os.path.join(MODELS_DIR, plate_info["file"])
    if not try_huggingface_download(plate_info["hf_repo"], plate_info["hf_file"], plate_path, plate_info["desc"]):
        print("\n  Manual download instructions:")
        print("  1. Go to https://universe.roboflow.com/roboflow-universe-projects/license-plate-recognition-rxg4e")
        print("  2. Export as 'YOLOv8' format -> download the .pt file")
        print(f"  3. Place it at: {plate_path}")

    # Stage 5: Seatbelt model (Roboflow manual)
    print("\n[Stage 5] Seatbelt Detector")
    seatbelt_info = MODELS["seatbelt"]
    seatbelt_path = os.path.join(MODELS_DIR, seatbelt_info["file"])
    if os.path.exists(seatbelt_path):
        size_mb = os.path.getsize(seatbelt_path) / (1024 * 1024)
        print(f"  [OK] Seatbelt model already exists ({size_mb:.1f} MB)")
    else:
        print("  Manual download instructions:")
        print("  1. Go to https://universe.roboflow.com/halla-it/seat-belt-detection")
        print("  2. Export as 'YOLOv8' format -> download the .pt file")
        print(f"  3. Place it at: {seatbelt_path}")

    # Verify
    verify_models()
    print("\n=== Done ===")

if __name__ == "__main__":
    main()
