# CARDIOVISION X — Technical System Architecture

## Overview Architecture Diagram

```mermaid
flowchart TD
    subgraph Frontend["React 18 + TypeScript + Vite"]
        UI["Clinical Input Dashboard"]
        Pres["Patient Presets"]
        Card["Risk Cards (CAD, LAD, LCX, RCA)"]
        ShapView["SHAP Feature Attribution Charts"]
        Canvas3D["Interactive Three.js 3D Heart Viewer"]
        ChatUI["RAG Educational AI Assistant"]
    end

    subgraph Backend["FastAPI Python Server (Port 8000)"]
        API["REST API Endpoints (/api/v1)"]
        Validation["Pydantic Schema (extra=forbid)"]
        LeakCheck["Target Leakage Guardrails"]
        Predictor["Multi-Target Inference Service"]
        SHAP["SHAP Tree & Kernel Explainers"]
        RAG["Educational Knowledge Engine"]
    end

    subgraph Artifacts["Saved Artifacts (backend/artifacts/)"]
        ModelCAD["Cath Model (CatBoost)"]
        ModelLAD["LAD Model (RandomForest)"]
        ModelLCX["LCX Model (CatBoost)"]
        ModelRCA["RCA Model (GradientBoosting)"]
        Manifest["Metadata Manifest"]
    end

    subgraph Dataset["Clinical Data (data/)"]
        CSV["z_alizadeh_sani.csv (303 records, 55 predictors)"]
    end

    UI -->|JSON Payload| API
    API --> Validation
    Validation --> LeakCheck
    LeakCheck --> Predictor
    Predictor --> ModelCAD & ModelLAD & ModelLCX & ModelRCA
    Predictor --> SHAP
    Predictor -->|Predictions & SHAP| API
    API -->|Response JSON| UI & Card & Canvas3D & ShapView
```

## Component Breakdown

1. **Frontend Layer:**
   - Framework: React 18, TypeScript, Vite, Tailwind CSS.
   - 3D Rendering: Three.js, React Three Fiber, Drei, WebGL.
   - Data Visualization: Recharts (SHAP horizontal bar charts, global importance, metrics).
   - Icons & Components: Lucide React.

2. **Backend API Layer:**
   - Framework: FastAPI, Uvicorn, Pydantic v2.
   - Guardrails: Strict Pydantic `extra="forbid"` and `leakage_checks.py` module.

3. **Machine Learning Pipeline:**
   - Library: scikit-learn, CatBoost, XGBoost, Joblib, SHAP.
   - Data Processing: Imputation, Standard Scaling, One-Hot Encoding, Stratified 80/20 train-test splits.
