"""
VioLens Unified Model Training Script
Fine-tunes YOLOv8s on the Indian traffic dataset (19 classes)
with heavy data augmentation to compensate for small dataset size (284 images).
"""

import os
from ultralytics import YOLO

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_YAML = os.path.join(PROJECT_ROOT, "dataset", "data.yaml")
MODELS_DIR = os.path.join(SCRIPT_DIR, "models")
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "runs")

def train():
    print("=" * 60)
    print("VioLens Unified Model Training")
    print("=" * 60)
    print(f"Dataset config: {DATA_YAML}")
    print(f"Output dir:     {OUTPUT_DIR}")
    print()

    # Load pretrained YOLOv8s (small — better accuracy than nano)
    model = YOLO("yolov8s.pt")

    # Train with aggressive augmentation for small dataset
    results = model.train(
        data=DATA_YAML,
        epochs=100,
        imgsz=640,
        batch=16,
        name="violens_unified",
        project=OUTPUT_DIR,
        exist_ok=True,

        # --- Data augmentation (aggressive for 284 images) ---
        augment=True,
        mosaic=1.0,        # mosaic augmentation (combine 4 images)
        mixup=0.3,         # mix two images together
        hsv_h=0.015,       # hue jitter (handles lighting variation)
        hsv_s=0.7,         # saturation jitter (rain/fog/dust)
        hsv_v=0.4,         # value/brightness jitter
        degrees=10.0,      # rotation (slight camera angle variation)
        translate=0.1,     # translation
        scale=0.5,         # scale jitter
        fliplr=0.5,        # horizontal flip
        flipud=0.0,        # no vertical flip (vehicles don't appear upside down)
        erasing=0.2,       # random erasing (occlusion simulation)
        crop_fraction=1.0, # crop fraction for classification (not used in detection)

        # --- Training config ---
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,          # final learning rate = lr0 * lrf
        warmup_epochs=5,
        weight_decay=0.0005,
        patience=20,       # early stopping if no improvement for 20 epochs
        
        # --- GPU/CPU ---
        device='cpu',      # PyTorch didn't detect CUDA, using CPU
        workers=4,
        
        # --- Logging ---
        verbose=True,
        plots=True,
    )

    # Copy best weights to models dir
    best_pt = os.path.join(OUTPUT_DIR, "violens_unified", "weights", "best.pt")
    dest_pt = os.path.join(MODELS_DIR, "violens_unified.pt")

    if os.path.exists(best_pt):
        import shutil
        os.makedirs(MODELS_DIR, exist_ok=True)
        shutil.copy2(best_pt, dest_pt)
        print(f"\n✅ Best model copied to: {dest_pt}")
        
        # Verify
        test_model = YOLO(dest_pt)
        print(f"Model classes ({len(test_model.names)}): {test_model.names}")
    else:
        print(f"\n❌ Training did not produce best.pt at {best_pt}")

    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)

if __name__ == "__main__":
    train()
