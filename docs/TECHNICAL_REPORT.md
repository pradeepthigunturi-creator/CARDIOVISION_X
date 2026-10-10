# CARDIOVISION X: Technical Report & Documentation

**Multimodal AI Hackathon 2026 — Track A: Cardiovascular Risk Visualization & Prediction**

---

## 1. Executive Summary & Problem Statement

Coronary Artery Disease (CAD) remains a leading cause of global mortality. Clinical angiography measures stenosis across major coronary vessels—specifically the Left Anterior Descending (LAD), Left Circumflex (LCX), and Right Coronary Artery (RCA). However, converting non-invasive clinical, laboratory, ECG, and echocardiographic findings into intuitive vessel-specific risk scores poses a diagnostic and communication challenge for clinicians and patients.

**CARDIOVISION X** addresses this challenge by providing an end-to-end explainable AI decision-support platform that:
1. Predicts overall CAD status alongside vessel-specific stenosis for LAD, LCX, and RCA.
2. Enforces strict target leakage prevention to ensure validity.
3. Renders a dynamic, real-time 3D anatomical heart with color-coded risk highlights.
4. Explains predictions using game-theoretic SHAP feature attributions.

---

## 2. Dataset & Target Leakage Prevention Policy

### Dataset Specifications
- **Source:** Extension of Z-Alizadeh Sani Cardiovascular Dataset (UCI Machine Learning Repository / Mendeley Data).
- **Records:** 303 patient records.
- **Predictors:** 55 non-invasive demographic, clinical examination, laboratory, ECG, and echocardiographic parameters.

### Target Leakage Prevention Protocol
Target leakage occurs when post-diagnostic outcome labels or invasive catheterization findings enter the input feature matrix, creating falsely inflated validation metrics.

CARDIOVISION X strictly excludes:
- `Cath` (Angiographic CAD diagnostic ground truth)
- `CAD` (Derived CAD status)
- `LAD` (LAD stenosis ground truth)
- `LCX` (LCX stenosis ground truth)
- `RCA` (RCA stenosis ground truth)
- `Number of Vessel Involved`, `Number Of lesion PCI`, `EF- Cath`, and anatomical lesion coordinates.

This policy is enforced via automated test assertions in `tests/test_leakage.py` and Pydantic schema validation (`extra="forbid"`).

---

## 3. Machine Learning Architecture & Model Performance

Four independent classification pipelines were trained using a 5-Fold Stratified Cross-Validation & held-out 80/20 train-test split:

| Prediction Target | Selected Model | Accuracy | Precision | Recall | F1 Score | ROC-AUC |
|-------------------|----------------|----------|-----------|--------|----------|---------|
| **Overall CAD**   | CatBoost       | 88.52%   | 87.50%    | 97.67% | 92.31%   | 0.9069  |
| **LAD Artery**    | RandomForest   | 81.97%   | 80.49%    | 91.67% | 85.71%   | 0.8367  |
| **LCX Artery**    | CatBoost       | 65.57%   | 57.14%    | 50.00% | 53.33%   | 0.7218  |
| **RCA Artery**    | GradientBoost  | 77.05%   | 76.47%    | 56.52% | 65.00%   | 0.7895  |

*Note: All models were selected based on validation F1 score and generalization stability.*

---

## 4. Interactive 3D Visualization System

The 3D visualization engine is developed in React Three Fiber, Three.js, and WebGL:
- **Coronary Vessel Paths:** LAD, LCX, and RCA are rendered as smooth 3D Catmull-Rom tube geometries wrapping the myocardium.
- **Dynamic Risk Mapping:** Color coding updates automatically based on backend probabilities:
  - Low Risk (<35%): Emerald Green (`#10B981`)
  - Moderate Risk (35-65%): Amber (`#F59E0B`)
  - High Risk (>65%): Crimson Red (`#EF4444`)
- **Interactive Features:** Orbit controls, pulse animations, vessel selection, and synchronized prediction panels.

---

## 5. SHAP Explainability & Clinical Safety

- **Local Attributions:** Calculates exact SHAP values for individual patient predictions, highlighting top risk-increasing (e.g., ST Elevation, Typical Angina, Low EF) vs protective factors.
- **Global Importance:** Ranks overall feature importance across the dataset (e.g., Typical Chest Pain, Region RWMA, Age, FBS).
- **Clinical Safety Notice:** Visible across all UI views emphasizing decision-support status.
