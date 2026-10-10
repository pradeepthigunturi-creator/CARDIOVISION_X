# CARDIOVISION X — Explainable AI Coronary Intelligence & 3D Visualization Platform

**Multimodal AI Hackathon 2026 — Track A: Cardiovascular Risk Visualization & Prediction**

CARDIOVISION X is an end-to-end explainable AI decision-support platform that estimates overall Coronary Artery Disease (CAD) status and vessel-specific stenosis risk for the three primary coronary arteries:
- **LAD** — Left Anterior Descending Artery
- **LCX** — Left Circumflex Artery
- **RCA** — Right Coronary Artery

The platform maps machine-learning predictions onto an interactive 3D anatomical heart model in real time, provides game-theoretic SHAP feature attributions, and enforces strict target leakage prevention guardrails.

---

## 🌟 Key Features

1. **Four Independent ML Prediction Pipelines:**
   - **Model 1 (Overall CAD Status):** Trained on `Cath` target (CatBoost F1: 92.3%, ROC-AUC: 0.907).
   - **Model 2 (LAD Target):** Trained on `LAD` target (RandomForest F1: 85.7%, ROC-AUC: 0.837).
   - **Model 3 (LCX Target):** Trained on `LCX` target (CatBoost F1: 53.3%, ROC-AUC: 0.722).
   - **Model 4 (RCA Target):** Trained on `RCA` target (GradientBoosting F1: 65.0%, ROC-AUC: 0.804).

2. **Strict Target Leakage Prevention:**
   - Enforces automated checks that strictly exclude outcome columns (`Cath`, `CAD`, `LAD`, `LCX`, `RCA`, `Number of Vessel Involved`, etc.) from all predictor feature matrices.

3. **Interactive 3D Coronary Anatomy Viewer:**
   - Built with Three.js, React Three Fiber, and WebGL.
   - Dynamic risk color coding (Green: Low Risk <35%, Amber: Moderate 35-65%, Red: High Risk >65%).
   - Orbit controls, vessel selection, pulse animations, and real-time backend updates.

4. **SHAP Explainability Engine:**
   - Computes local patient feature attributions and global feature importance rankings.

5. **Medical Safety & Out-of-Distribution Warnings:**
   - Detects physiological anomalies (e.g., Severe Hypertension >180 mmHg, Low Ejection Fraction <35%).

---

## 📁 Repository Structure

```text
CARDIOVISION X/
├── data/
│   └── z_alizadeh_sani.csv          # UCI Extension of Z-Alizadeh Sani Dataset (303 records)
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── api/endpoints.py          # /health, /model-info, /features, /metrics, /predict, /chat
│   │   ├── schemas/prediction.py     # Pydantic schemas (extra="forbid" for leakage protection)
│   │   └── services/predictor.py     # Inference & SHAP service manager
│   ├── ml/
│   │   ├── data_processing.py        # Schema validation & feature encoding
│   │   ├── leakage_checks.py         # Target leakage prevention guardrails
│   │   ├── train.py                  # Model training & candidate selection pipeline
│   │   ├── evaluate.py               # Classification metrics & confusion matrix
│   │   └── explain.py                # SHAP Tree & Kernel explainers
│   └── artifacts/                    # Saved joblib models and metadata JSON manifests
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, Form, Cards, SHAP, Metrics, Chatbot
│   │   ├── visualization/            # Heart3DViewer.tsx (Three.js / React Three Fiber)
│   │   ├── pages/                    # Overview, Predictor, 3D Explorer, Explainability, Metrics
│   │   ├── services/api.ts           # Frontend API client
│   │   └── App.tsx                   # React Router layout
│   └── package.json
├── tests/
│   ├── test_leakage.py               # Target leakage prevention automated tests
│   └── test_api.py                   # FastAPI endpoint tests
├── docs/
│   ├── ARCHITECTURE.md               # Technical system architecture diagram
│   ├── TECHNICAL_REPORT.md           # 6-page maximum technical report
│   └── DEMO_SCRIPT.md                # 3-10 minute presentation & demo walkthrough
└── README.md
```

---

## 🚀 Installation & Setup Instructions (macOS / Linux)

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 2. Environment Setup & Dependency Installation

```bash
# Clone or navigate to project directory
cd "CARDIOVISION X"

# Setup Python Virtual Environment
python3 -m venv .venv
source .venv/bin/activate

# Install Backend Dependencies
pip install -r backend/requirements.txt (or pip install pandas numpy scikit-learn catboost xgboost shap fastapi uvicorn pydantic pytest ucimlrepo openpyxl scipy matplotlib joblib httpx)

# Install Frontend Dependencies
cd frontend
npm install
cd ..
```

---

## 🏃 Running the Application

### Option A: Run Backend & Frontend Concurrently

**Terminal 1 — Backend API Server:**
```bash
source .venv/bin/activate
PYTHONPATH=. uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend interactive API docs will be available at: http://localhost:8000/docs*

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm run dev
```
*Frontend application will be available at: http://localhost:5173*

---

## 🧪 Running Machine Learning Pipeline & Automated Tests

### Train Model Pipelines Across All 4 Targets:
```bash
source .venv/bin/activate
PYTHONPATH=. python backend/ml/train.py
```

### Execute Automated Test Suite (Pytest):
```bash
source .venv/bin/activate
PYTHONPATH=. pytest tests/
```

---

## ⚠️ Clinical Safety Disclaimer

**CARDIOVISION X is an experimental AI decision-support and educational prototype. Its predictions and 3D visualizations are not a medical diagnosis and must not replace clinical evaluation, validated diagnostic imaging, or advice from qualified healthcare professionals.**
