import os
import base64
import cv2
import numpy as np
import re
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO

app = FastAPI(title="VioLens Traffic Violation Detection")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Loading ---
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

# Try unified model first, fall back to COCO
UNIFIED_PATH = os.path.join(MODELS_DIR, "violens_unified.pt")
COCO_PATH = os.path.join(MODELS_DIR, "yolov8n.pt")

unified_model = None
coco_model = None
USE_UNIFIED = False

if os.path.exists(UNIFIED_PATH):
    print(f"Loading UNIFIED model from {UNIFIED_PATH}...")
    unified_model = YOLO(UNIFIED_PATH)
    USE_UNIFIED = True
    print(f"Unified model classes: {unified_model.names}")
elif os.path.exists(COCO_PATH):
    print(f"Unified model not found, falling back to COCO: {COCO_PATH}")
    coco_model = YOLO(COCO_PATH)
else:
    raise RuntimeError(f"No model found! Place violens_unified.pt or yolov8n.pt in {MODELS_DIR}")

# Helmet model (only used in COCO fallback mode)
HELMET_PATH = os.path.join(MODELS_DIR, "helmet_detector.pt")
helmet_model = None
if not USE_UNIFIED and os.path.exists(HELMET_PATH):
    print(f"Loading helmet model from {HELMET_PATH}...")
    helmet_model = YOLO(HELMET_PATH)

# Plate model (only used in COCO fallback mode for detection; OCR always uses EasyOCR)
PLATE_PATH = os.path.join(MODELS_DIR, "plate_detector.pt")
plate_model = None
if not USE_UNIFIED and os.path.exists(PLATE_PATH):
    print(f"Loading plate model from {PLATE_PATH}...")
    plate_model = YOLO(PLATE_PATH)

# Lazy-loaded EasyOCR reader (initialized on first OCR request)
_ocr_reader = None
def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        import easyocr
        print("Initializing EasyOCR reader (first OCR request)...")
        _ocr_reader = easyocr.Reader(['en', 'hi'], gpu=True)
    return _ocr_reader

# Indian License Plate Regex
PLATE_REGEX = re.compile(r'^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{0,3}\s?[0-9]{4}$')

# COCO class IDs (fallback mode only)
COCO_CLASS_MAP = {
    0: "person", 1: "bicycle", 2: "car", 3: "motorcycle", 5: "bus", 7: "truck"
}

# Unified model class name → our internal vehicle type mapping
UNIFIED_VEHICLE_MAP = {
    "car": "car",
    "bus": "bus",
    "truck": "truck",
    "lorry": "truck",
    "auto": "auto_rickshaw",
    "rickshow": "auto_rickshaw",
    "motorbike": "motorcycle",
    "scooty": "motorcycle",
    "bicycle": "bicycle",
    "tractor": "truck",
}

UNIFIED_RIDER_CLASSES = {"motorbike-rider", "scooty-rider", "bicycle-rider"}
UNIFIED_PERSON_CLASSES = {"person"}
UNIFIED_HELMET_CLASSES = {"helmet": True, "no_helmet": False}
UNIFIED_PLATE_CLASS = "license_plate"

class AnalyzeRequest(BaseModel):
    image_base64: str

# --- Geometry Helpers ---

def compute_iou(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    inter = max(0, xB - xA) * max(0, yB - yA)
    areaA = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    areaB = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    union = areaA + areaB - inter
    return inter / union if union > 0 else 0

def center_inside_box(small_box, big_box):
    cx = (small_box[0] + small_box[2]) / 2
    cy = (small_box[1] + small_box[3]) / 2
    return big_box[0] <= cx <= big_box[2] and big_box[1] <= cy <= big_box[3]

def get_position_hint(bbox, img_w, img_h):
    cx = (bbox[0] + bbox[2]) / 2
    cy = (bbox[1] + bbox[3]) / 2
    if cx < img_w / 3: h = "left"
    elif cx > 2 * img_w / 3: h = "right"
    else: h = "center"
    if cy < img_h / 3: return f"top-{h}"
    elif cy > 2 * img_h / 3: return f"bottom-{h}"
    else: return h if h == "center" else f"center-{h}"

def pad_crop_box(bbox, img_h, img_w, pad_ratio=0.15):
    x1, y1, x2, y2 = bbox
    bw = x2 - x1
    bh = y2 - y1
    px = bw * pad_ratio
    py = bh * pad_ratio
    return [
        max(0, int(x1 - px)),
        max(0, int(y1 - py)),
        min(img_w, int(x2 + px)),
        min(img_h, int(y2 + py))
    ]

def analyze_traffic_light_color(img, bbox):
    x1, y1, x2, y2 = [int(v) for v in bbox]
    crop = img[y1:y2, x1:x2]
    if crop.size == 0:
        return "unknown"
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    # Red ranges (wraps around hue 0/180)
    mask_red = cv2.bitwise_or(
        cv2.inRange(hsv, np.array([0, 70, 50]), np.array([10, 255, 255])),
        cv2.inRange(hsv, np.array([170, 70, 50]), np.array([180, 255, 255]))
    )
    mask_green = cv2.inRange(hsv, np.array([40, 50, 50]), np.array([90, 255, 255]))
    red_px = cv2.countNonZero(mask_red)
    green_px = cv2.countNonZero(mask_green)
    if red_px > green_px and red_px > 10:
        return "red"
    elif green_px > red_px and green_px > 10:
        return "green"
    return "unknown"

def run_ocr_on_crop(img, plate_bbox):
    """Run EasyOCR on a plate crop and return cleaned text or None."""
    try:
        x1, y1, x2, y2 = [int(v) for v in plate_bbox]
        crop = img[y1:y2, x1:x2]
        if crop.size == 0:
            return None
        reader = get_ocr_reader()
        results = reader.readtext(crop, detail=0)
        if results:
            raw = "".join(results).upper().replace(" ", "")
            # Common OCR error fixes for Indian plates
            raw = raw.replace("O", "0").replace("I", "1").replace("S", "5").replace("B", "8")
            if len(raw) >= 6:
                return raw
    except Exception as e:
        print(f"OCR error: {e}")
    return None

# --- Unified Model Pipeline ---

def run_unified_pipeline(img):
    """Single-pass detection with the unified 19-class model."""
    h, w = img.shape[:2]
    results = unified_model(img, conf=0.35, verbose=False)

    vehicles = []     # detected vehicles
    riders = []       # motorbike-rider, scooty-rider, bicycle-rider
    persons = []      # generic persons
    helmets = []      # helmet detections
    no_helmets = []   # no_helmet detections
    plates = []       # license_plate detections
    traffic_lights = []

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            cls_name = unified_model.names[cls_id]
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            bbox = [x1, y1, x2, y2]

            obj = {
                "bbox": bbox,
                "conf": conf,
                "class": cls_name,
                "pos_hint": get_position_hint(bbox, w, h)
            }

            if cls_name in UNIFIED_VEHICLE_MAP:
                obj["mapped_class"] = UNIFIED_VEHICLE_MAP[cls_name]
                vehicles.append(obj)
            elif cls_name in UNIFIED_RIDER_CLASSES:
                riders.append(obj)
            elif cls_name in UNIFIED_PERSON_CLASSES:
                persons.append(obj)
            elif cls_name == "helmet":
                helmets.append(obj)
            elif cls_name == "no_helmet":
                no_helmets.append(obj)
            elif cls_name == UNIFIED_PLATE_CLASS:
                plates.append(obj)
            # cattle/vendor are detected but not used for violations

    return vehicles, riders, persons, helmets, no_helmets, plates, traffic_lights

def run_unified_rules(vehicles, riders, persons, helmets, no_helmets, plates, traffic_lights, img):
    """Apply violation rules using unified model detections."""
    h, w = img.shape[:2]
    resp_vehicles = []
    resp_violations = []

    red_lights = [tl for tl in traffic_lights if tl.get("color") == "red"]

    v_idx = 1
    for v in vehicles:
        v_id = f"V{v_idx}"
        v_idx += 1
        vehicle_class = v.get("mapped_class", v["class"])
        vehicle_violations = []

        # --- Find riders/persons on this vehicle ---
        associated_riders = []
        associated_persons = []

        for r in riders:
            if compute_iou(v["bbox"], r["bbox"]) > 0.1 or center_inside_box(r["bbox"], v["bbox"]):
                associated_riders.append(r)
        for p in persons:
            if compute_iou(v["bbox"], p["bbox"]) > 0.05 or center_inside_box(p["bbox"], v["bbox"]):
                associated_persons.append(p)

        all_people = associated_riders + associated_persons
        occupant_count = len(all_people)

        # --- Find plates for this vehicle ---
        plate_text = None
        for pl in plates:
            if compute_iou(v["bbox"], pl["bbox"]) > 0.05 or center_inside_box(pl["bbox"], v["bbox"]):
                plate_text = run_ocr_on_crop(img, pl["bbox"])
                break

        # --- Motorcycle rules ---
        if vehicle_class == "motorcycle":
            # Triple riding: 3+ riders/persons on one motorcycle
            if occupant_count >= 3:
                vehicle_violations.append("triple_riding")
                resp_violations.append({
                    "vehicle_id": v_id,
                    "type": "triple_riding",
                    "confidence": round(min(r["conf"] for r in all_people), 2),
                    "position_hint": v["pos_hint"],
                    "severity": "high",
                    "bbox": v["bbox"]
                })

            # Helmet violations: check no_helmet detections near riders
            for nh in no_helmets:
                # Find if this no_helmet is associated with any rider on this vehicle
                for i, rider in enumerate(associated_riders):
                    if compute_iou(nh["bbox"], rider["bbox"]) > 0.05 or center_inside_box(nh["bbox"], rider["bbox"]):
                        viol_type = "helmet_rider" if i == 0 else "helmet_pillion"
                        if viol_type not in vehicle_violations:
                            vehicle_violations.append(viol_type)
                            resp_violations.append({
                                "vehicle_id": v_id,
                                "type": viol_type,
                                "confidence": round(nh["conf"], 2),
                                "position_hint": nh["pos_hint"],
                                "severity": "high",
                                "bbox": nh["bbox"]
                            })
                        break

                # Also check against generic persons on the motorcycle
                for i, person in enumerate(associated_persons):
                    if compute_iou(nh["bbox"], person["bbox"]) > 0.05 or center_inside_box(nh["bbox"], person["bbox"]):
                        viol_type = "helmet_rider" if (i == 0 and len(associated_riders) == 0) else "helmet_pillion"
                        if viol_type not in vehicle_violations:
                            vehicle_violations.append(viol_type)
                            resp_violations.append({
                                "vehicle_id": v_id,
                                "type": viol_type,
                                "confidence": round(nh["conf"], 2),
                                "position_hint": nh["pos_hint"],
                                "severity": "high",
                                "bbox": nh["bbox"]
                            })
                        break

        # --- Red light rule ---
        if len(red_lights) > 0:
            for rl in red_lights:
                if v["bbox"][3] > rl["bbox"][3] + (h * 0.1):
                    vehicle_violations.append("red_light")
                    resp_violations.append({
                        "vehicle_id": v_id,
                        "type": "red_light",
                        "confidence": 0.75,
                        "position_hint": "past-signal",
                        "severity": "high",
                        "bbox": v["bbox"]
                    })
                    break

        # --- Wrong-side heuristic (cars/motorcycles only, NOT buses/trucks) ---
        if vehicle_class in ["car", "motorcycle"]:
            v_width = v["bbox"][2] - v["bbox"][0]
            v_height = v["bbox"][3] - v["bbox"][1]
            if v_height > 0 and (v_width / v_height) > 2.5:
                vehicle_violations.append("wrong_side")
                resp_violations.append({
                    "vehicle_id": v_id,
                    "type": "wrong_side",
                    "confidence": 0.3,
                    "position_hint": "horizontal-movement",
                    "severity": "high",
                    "bbox": v["bbox"]
                })

        # --- Build vehicle response ---
        resp_vehicles.append({
            "id": v_id,
            "class": vehicle_class,
            "position": v["pos_hint"],
            "plate": plate_text,
            "occupants": occupant_count,
            "violations": vehicle_violations,
            "confidence": round(v["conf"], 2),
            "bbox": v["bbox"]
        })

    return resp_vehicles, resp_violations

# --- COCO Fallback Pipeline ---

def run_coco_pipeline(img):
    """Fallback: COCO detection + separate helmet/plate models."""
    h, w = img.shape[:2]
    results = coco_model(img, conf=0.35, verbose=False)

    vehicles = []
    persons = []
    traffic_lights = []

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            bbox = [x1, y1, x2, y2]

            if cls_id == 9:  # traffic light
                color = analyze_traffic_light_color(img, bbox)
                traffic_lights.append({"bbox": bbox, "color": color})
            elif cls_id in COCO_CLASS_MAP:
                cls_name = COCO_CLASS_MAP[cls_id]
                obj = {
                    "bbox": bbox, "conf": conf, "class": cls_name,
                    "pos_hint": get_position_hint(bbox, w, h)
                }
                if cls_id == 0:
                    persons.append(obj)
                else:
                    vehicles.append(obj)

    return vehicles, persons, traffic_lights

def run_coco_rules(vehicles, persons, traffic_lights, img):
    """Apply rules using COCO detections + specialist models."""
    h, w = img.shape[:2]
    resp_vehicles = []
    resp_violations = []
    red_lights = [tl for tl in traffic_lights if tl.get("color") == "red"]

    v_idx = 1
    for v in vehicles:
        v_id = f"V{v_idx}"
        v_idx += 1
        vehicle_violations = []

        # Find associated persons
        riders = []
        for p in persons:
            if compute_iou(v["bbox"], p["bbox"]) > 0.05 or center_inside_box(p["bbox"], v["bbox"]):
                riders.append(p)

        # Plate OCR (if plate model available)
        plate_text = None
        if plate_model:
            x1, y1, x2, y2 = v["bbox"]
            y1_lower = y1 + (y2 - y1) * 0.4
            crop = img[int(y1_lower):int(y2), int(x1):int(x2)]
            if crop.size > 0:
                plate_results = plate_model(crop, conf=0.40, verbose=False)
                for pr in plate_results:
                    if len(pr.boxes) > 0:
                        pb = pr.boxes[0]
                        px1, py1, px2, py2 = pb.xyxy[0].tolist()
                        full_bbox = [px1 + x1, py1 + y1_lower, px2 + x1, py2 + y1_lower]
                        plate_text = run_ocr_on_crop(img, full_bbox)
                        break

        # Motorcycle rules
        if v["class"] == "motorcycle":
            if len(riders) >= 3:
                vehicle_violations.append("triple_riding")
                resp_violations.append({
                    "vehicle_id": v_id, "type": "triple_riding",
                    "confidence": round(min(r["conf"] for r in riders), 2),
                    "position_hint": v["pos_hint"], "severity": "high", "bbox": v["bbox"]
                })

            # Helmet check
            if helmet_model:
                padded = pad_crop_box(v["bbox"], h, w, pad_ratio=0.3)
                crop = img[padded[1]:padded[3], padded[0]:padded[2]]
                if crop.size > 0:
                    h_results = helmet_model(crop, conf=0.30, verbose=False)
                    ox, oy = padded[0], padded[1]
                    for hr in h_results:
                        for hbox in hr.boxes:
                            cls_name = helmet_model.names[int(hbox.cls[0])].lower()
                            if "no" in cls_name or "without" in cls_name:
                                hx1, hy1, hx2, hy2 = hbox.xyxy[0].tolist()
                                full_bbox = [hx1 + ox, hy1 + oy, hx2 + ox, hy2 + oy]
                                for i, r in enumerate(riders):
                                    if compute_iou(full_bbox, r["bbox"]) > 0.05:
                                        vtype = "helmet_rider" if i == 0 else "helmet_pillion"
                                        if vtype not in vehicle_violations:
                                            vehicle_violations.append(vtype)
                                            resp_violations.append({
                                                "vehicle_id": v_id, "type": vtype,
                                                "confidence": round(float(hbox.conf[0]), 2),
                                                "position_hint": get_position_hint(full_bbox, w, h),
                                                "severity": "high", "bbox": full_bbox
                                            })
                                        break

        # Red light
        if len(red_lights) > 0:
            for rl in red_lights:
                if v["bbox"][3] > rl["bbox"][3] + (h * 0.1):
                    vehicle_violations.append("red_light")
                    resp_violations.append({
                        "vehicle_id": v_id, "type": "red_light",
                        "confidence": 0.75, "position_hint": "past-signal",
                        "severity": "high", "bbox": v["bbox"]
                    })
                    break

        # Wrong-side (only cars/motorcycles)
        if v["class"] in ["car", "motorcycle"]:
            vw = v["bbox"][2] - v["bbox"][0]
            vh = v["bbox"][3] - v["bbox"][1]
            if vh > 0 and (vw / vh) > 2.5:
                vehicle_violations.append("wrong_side")
                resp_violations.append({
                    "vehicle_id": v_id, "type": "wrong_side",
                    "confidence": 0.3, "position_hint": "horizontal-movement",
                    "severity": "high", "bbox": v["bbox"]
                })

        resp_vehicles.append({
            "id": v_id, "class": v["class"], "position": v["pos_hint"],
            "plate": plate_text, "occupants": len(riders),
            "violations": vehicle_violations, "confidence": round(v["conf"], 2),
            "bbox": v["bbox"]
        })

    return resp_vehicles, resp_violations

# --- API Endpoints ---

@app.post("/api/analyze")
async def analyze_image(request: AnalyzeRequest):
    try:
        # Decode base64 image
        encoded = request.image_base64.split(',')[1] if ',' in request.image_base64 else request.image_base64
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Failed to decode image")

        h, w = img.shape[:2]

        if USE_UNIFIED:
            # Single-pass unified model
            vehicles, riders, persons, helmets, no_helmets, plates_det, traffic_lights = run_unified_pipeline(img)
            resp_vehicles, resp_violations = run_unified_rules(
                vehicles, riders, persons, helmets, no_helmets, plates_det, traffic_lights, img
            )
            total_people = len(riders) + len(persons)
        else:
            # COCO fallback
            vehicles, persons, traffic_lights = run_coco_pipeline(img)
            resp_vehicles, resp_violations = run_coco_rules(vehicles, persons, traffic_lights, img)
            total_people = len(persons)

        return {
            "image_id": f"img_{np.random.randint(1000, 9999)}",
            "timestamp": "2024-05-18T10:30:00Z",
            "camera_id": "CAM-BLR-01",
            "location": "Traffic Surveillance Point",
            "vehicles": resp_vehicles,
            "violations": resp_violations,
            "total_vehicles": len(resp_vehicles),
            "total_violations": len(resp_violations),
            "image_dimensions": {"width": w, "height": h},
            "metadata": {
                "total_vehicles_detected": len(resp_vehicles),
                "total_persons_detected": total_people,
                "total_violations": len(resp_violations),
                "model_mode": "unified" if USE_UNIFIED else "coco_fallback",
                "warnings": [
                    "wrong_side detection requires video input for accurate detection."
                ] if any(v["type"] == "wrong_side" for v in resp_violations) else []
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health():
    models_status = {"coco": "loaded" if coco_model else "not_loaded"}
    if USE_UNIFIED:
        models_status = {
            "unified": "loaded",
            "classes": dict(unified_model.names) if unified_model else {}
        }
    else:
        models_status["helmet"] = "loaded" if helmet_model else "not_found"
        models_status["plate"] = "loaded" if plate_model else "not_found"
    
    return {
        "status": "ok",
        "mode": "unified" if USE_UNIFIED else "coco_fallback",
        "models": models_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
