<div align="center">
  <h1>🚦 Vio-Lens</h1>
  <p><b>AI-Powered Traffic Violation Detection System for Indian Roads</b></p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/YOLOv8-FF1493?style=for-the-badge&logo=yolo" alt="YOLOv8" />
    <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch" />
  </p>
</div>

Vio-Lens is a full-stack, AI-driven traffic surveillance application designed to automatically detect traffic violations using a custom-trained **YOLOv8** computer vision model. It parses scenes to detect vehicles, riders, helmets, and license plates, cross-references infractions with the Motor Vehicles Act (2019), and automatically generates digital challans (fines).

## ✨ Features

- **Custom YOLOv8 Vision Model:** Trained specifically on Indian traffic datasets to detect 19 unique classes (Auto, Bicycle, Bus, Car, Cattle, Helmet, License Plate, Lorry, Motorbike, Motorbike-Rider, No-Helmet, Person, Rickshaw, Scooty, Scooty-Rider, Tractor, Truck, Vendor).
- **Automated Violation Detection:** Accurately identifies:
  - ❌ Helmet Non-compliance (No Helmet)
  - 🏍️ Triple Riding
  - 🛑 Wrong-side Driving (via bounding box heuristics)
- **Built-in ALPR (OCR):** Integrates **EasyOCR** on the backend to extract text directly from bounding boxes classified as license plates.
- **Dynamic Challan Generation:** Maps detected violations directly to Motor Vehicles Act sections, dynamically calculating base and repeat fines.
- **Weather Preprocessing:** Frontend image manipulation to improve visibility in adverse Indian weather conditions (Monsoon, Haze, Fog).
- **Annotated Canvas UI:** Overlays visually distinct, confidence-scored bounding boxes directly onto uploaded traffic footage in the browser.

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* CSS (Custom Glassmorphism Design System)
* Canvas API (for bounding box annotations)

**Backend:**
* Python & FastAPI
* Ultralytics YOLOv8
* PyTorch
* EasyOCR & OpenCV

## 🚀 Deployment Strategy

Vio-Lens uses a split deployment architecture due to the heavy memory requirements of the machine learning backend:

1. **Backend (Hugging Face Spaces):** The FastAPI server, `violens_unified.pt` model, and EasyOCR require ~1.5GB of RAM. It is containerized via Docker and hosted on Hugging Face Spaces.
2. **Frontend (Vercel):** The React/Vite application is compiled into static assets and globally served via Vercel's Edge CDN for maximum speed.

## 💻 Local Development Setup

To run Vio-Lens on your local machine:

### 1. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (runs on port 8000 by default)
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
# In the root directory
npm install

# Create an environment variable file
cp .env.example .env
# Ensure VITE_BACKEND_URL is set to http://localhost:8000 in .env

# Start the Vite development server
npm run dev
```

## 🧠 Model Details

The core of Vio-Lens is a unified `YOLOv8s` model (`violens_unified.pt`). Instead of running multiple heavy cascade models, this single model processes the entire image frame in one pass, identifying parent vehicles, linking riders to vehicles (via IoU bounding box overlap), and checking for the presence of helmets and license plates simultaneously.

## ⚖️ License
This project is for educational and demonstrative purposes.
