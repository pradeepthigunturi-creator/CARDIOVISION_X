"""
CARDIOVISION X - Model Inference & Explainer Service
Loads model artifacts, executes inference for 4 targets, and returns structured risk predictions with SHAP.
"""

import os
import json
import time
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple

from backend.ml.data_processing import preprocess_single_input, load_and_preprocess_raw_data
from backend.ml.explain import ModelExplainerService
from backend.ml.leakage_checks import PROHIBITED_TARGET_COLUMNS

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'artifacts')
TARGET_KEYS = {
    'overall': 'cath',
    'LAD': 'lad',
    'LCX': 'lcx',
    'RCA': 'rca'
}

DISCLAIMER_TEXT = (
    "CARDIOVISION X is an experimental AI decision-support and educational prototype. "
    "Its predictions and 3D visualizations are not a medical diagnosis and must not replace clinical evaluation, "
    "validated diagnostic imaging, or advice from qualified healthcare professionals."
)

class CardiovisionPredictorService:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.metadata = {}
        self.explainers = {}
        self.load_all_artifacts()

    def load_all_artifacts(self):
        """
        Loads models, metadata, and initializes SHAP explainers for all 4 targets.
        """
        print(f"[PredictorService] Loading artifacts from {ARTIFACTS_DIR}...")
        for key, folder in TARGET_KEYS.items():
            target_dir = os.path.join(ARTIFACTS_DIR, folder)
            metadata_path = os.path.join(target_dir, 'metadata.json')
            model_path = os.path.join(target_dir, 'model.joblib')
            scaler_path = os.path.join(target_dir, 'scaler.joblib')

            if os.path.exists(metadata_path) and os.path.exists(model_path):
                with open(metadata_path, 'r') as f:
                    meta = json.load(f)
                self.metadata[folder] = meta
                self.models[folder] = joblib.load(model_path)
                
                if os.path.exists(scaler_path):
                    self.scalers[folder] = joblib.load(scaler_path)
                else:
                    self.scalers[folder] = None

                # Initialize SHAP explainer
                feat_names = meta['feature_names']
                self.explainers[folder] = ModelExplainerService(self.models[folder], feat_names)
                print(f"[PredictorService] Loaded target artifact '{folder}' with model '{meta['selected_model']}'")
            else:
                print(f"[PredictorService] WARNING: Artifacts missing for target folder '{folder}' at {target_dir}")

    def get_risk_category(self, prob: float) -> Tuple[str, str]:
        """
        Maps model probability to risk level and hex color code.
        """
        if prob < 0.35:
            return "Low Risk", "#10B981"  # Emerald
        elif prob < 0.65:
            return "Moderate Risk", "#F59E0B"  # Amber
        else:
            return "High Risk", "#EF4444"  # Crimson Red

    def check_input_warnings(self, raw_input: Dict[str, Any]) -> List[str]:
        """
        Checks input values for out-of-range or physiological anomaly warnings.
        """
        warnings = []
        age = raw_input.get("Age", 58)
        bp = raw_input.get("BP", 130)
        fbs = raw_input.get("FBS", 110)
        ef = raw_input.get("EF-TTE", raw_input.get("EF_TTE", 50))
        cr = raw_input.get("CR", 1.0)

        if age > 85 or age < 30:
            warnings.append(f"Patient age ({age} yrs) is near boundary of training dataset distribution (30-86 yrs).")
        if bp > 180:
            warnings.append(f"Systolic BP ({bp} mmHg) indicates Severe Hypertension (Stage 2 Hypertensive Crisis range).")
        if fbs > 250:
            warnings.append(f"Fasting Blood Sugar ({fbs} mg/dL) is markedly elevated (>250 mg/dL).")
        if ef < 35:
            warnings.append(f"Left Ventricular Ejection Fraction ({ef}%) indicates severely reduced systolic function (<35%).")
        if cr > 2.5:
            warnings.append(f"Serum Creatinine ({cr} mg/dL) indicates impaired renal clearance (>2.5 mg/dL).")

        return warnings

    def predict(self, raw_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes prediction for all 4 target pipelines independently.
        """
        start_time = time.time()
        
        # Enforce Leakage Check on raw input
        for key in raw_input.keys():
            if key in PROHIBITED_TARGET_COLUMNS:
                raise ValueError(f"Target leakage violation: input payload contains prohibited key '{key}'")

        warnings = self.check_input_warnings(raw_input)
        results = {}

        # 1. Overall CAD Status Prediction (target folder 'cath')
        overall_pred = self._predict_single_target('cath', raw_input, target_name="Overall CAD")
        
        # 2. Vessel-specific predictions (LAD, LCX, RCA)
        vessel_preds = {
            "LAD": self._predict_single_target('lad', raw_input, target_name="LAD Stenosis"),
            "LCX": self._predict_single_target('lcx', raw_input, target_name="LCX Stenosis"),
            "RCA": self._predict_single_target('rca', raw_input, target_name="RCA Stenosis")
        }

        exec_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "status": "success",
            "patient_summary": {
                "age": raw_input.get("Age"),
                "sex": raw_input.get("Sex"),
                "bmi": raw_input.get("BMI"),
                "bp": raw_input.get("BP"),
                "ef_tte": raw_input.get("EF-TTE", raw_input.get("EF_TTE")),
                "rwma": raw_input.get("Region RWMA", raw_input.get("Region_RWMA", 0))
            },
            "overall_cad": overall_pred,
            "vessels": vessel_preds,
            "warnings": warnings,
            "disclaimer": DISCLAIMER_TEXT,
            "execution_time_ms": exec_ms
        }

    def _predict_single_target(self, folder_key: str, raw_input: Dict[str, Any], target_name: str) -> Dict[str, Any]:
        """
        Inference logic for a single target folder.
        """
        if folder_key not in self.models:
            return {
                "target": target_name,
                "label": "Model Unavailable",
                "probability": 0.0,
                "risk_level": "Unavailable",
                "status_color": "#6B7280",
                "model_used": "None",
                "shap_explanation": None
            }

        model = self.models[folder_key]
        scaler = self.scalers[folder_key]
        meta = self.metadata[folder_key]
        feat_names = meta['feature_names']

        # Preprocess single input matching training columns
        df_single = preprocess_single_input(raw_input, feat_names)
        
        # Scale if scaler exists
        X_in = scaler.transform(df_single) if scaler else df_single

        # Model Prediction
        pred_class = int(model.predict(X_in)[0])
        if hasattr(model, "predict_proba"):
            prob = float(model.predict_proba(X_in)[0][1])
        else:
            prob = 1.0 if pred_class == 1 else 0.0

        label = "Stenotic / Positive" if pred_class == 1 else "Normal / Negative"
        risk_level, status_color = self.get_risk_category(prob)

        # Local SHAP attribution
        explainer = self.explainers.get(folder_key)
        shap_explanation = explainer.explain_instance(df_single) if explainer else None

        return {
            "target": target_name,
            "label": label,
            "probability": round(prob, 4),
            "risk_level": risk_level,
            "status_color": status_color,
            "model_used": meta.get('selected_model', 'Unknown'),
            "shap_explanation": shap_explanation
        }

# Global singleton predictor service instance
predictor_service = CardiovisionPredictorService()
