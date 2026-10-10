# CARDIOVISION X — Demonstration Script & Walkthrough Guide (3–10 Minutes)

---

## 🎬 Presentation Overview

- **Title:** CARDIOVISION X — Explainable AI Coronary Intelligence & 3D Visualization Platform
- **Target Audience:** Hackathon Judges, Clinicians, AI Researchers
- **Duration:** ~5 Minutes

---

## 🕒 Step-by-Step Demo Script

### 0:00 - 0:45 | Introduction & Problem Statement
> "Hello everyone! Today we present CARDIOVISION X, an explainable AI platform designed for Coronary Artery Disease risk visualization and prediction. Coronary artery disease is the leading cause of death globally, but understanding vessel-specific stenosis (LAD, LCX, RCA) from complex clinical lab values and ECGs can be difficult. CARDIOVISION X bridges clinical data and 3D spatial visualization."

*Show Overview Dashboard Page (`/`)*

---

### 0:45 - 2:00 | Clinical Predictor & Patient Presets
> "Let's navigate to the **Clinical Predictor** page. Here we have 55 non-invasive parameters across demographics, medical history, symptoms, ECG findings, laboratory measurements, and echocardiography.
> Let's load **Patient A (Severe CAD & Multi-vessel Risk)** preset. Notice how age is 67, with typical chest pain, ST elevation, and ejection fraction of 40%.
> We click **Execute 4-Target Inference**."

*Click Execute 4-Target Inference*

> "In under 50 milliseconds, our FastAPI backend evaluates 4 independently trained prediction pipelines:
> 1. Overall CAD Status: **99.9% High Risk**
> 2. LAD Artery: **92.1% High Risk (Stenotic)**
> 3. LCX Artery: **45.6% Moderate Risk**
> 4. RCA Artery: **67.1% High Risk (Stenotic)**"

---

### 2:00 - 3:30 | Interactive 3D Coronary Anatomy Explorer
> "Notice our interactive 3D Heart model rendered with Three.js and WebGL.
> The coronary vessels automatically change color based on predicted stenosis probabilities!
> The LAD and RCA arteries are highlighted in **Crimson Red**, while the LCX artery is **Amber**.
> We can click on the **LAD Artery** directly in 3D space to inspect vessel details and trigger local SHAP attributions."

*Rotate & Zoom 3D Heart model, click on LAD artery tube*

---

### 3:30 - 4:15 | SHAP Feature Explainability
> "Why did the model predict 92.1% risk for the LAD artery?
> Looking at our SHAP Waterfall chart, the top risk-increasing drivers are:
> - **Region RWMA = 4** (+0.056 SHAP value)
> - **Typical Chest Pain = Yes** (+0.050 SHAP value)
> - **Ejection Fraction (EF-TTE) = 40%** (+0.036 SHAP value)
> This provides clinicians with clear feature attribution explanations."

---

### 4:15 - 5:00 | Target Leakage Audit & Model Metrics
> "Finally, let's inspect our **Model Performance & Target Leakage Audit** pages.
> Target leakage prevention is strictly enforced in code and automated tests. Columns like `Cath`, `LAD`, `LCX`, `RCA`, and `Number of Vessel Involved` are excluded from predictor matrices.
> All models achieved strong validation performance, with Overall CAD achieving an **88.5% Accuracy** and **92.3% F1-Score**."

> "Thank you for watching!"
