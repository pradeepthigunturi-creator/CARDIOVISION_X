"""
CARDIOVISION X - FastAPI Endpoint Definitions
"""

import os
import json
import math
import time
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from backend.app.schemas.prediction import ClinicalInputSchema, PredictionResponseSchema
from backend.app.services.predictor import predictor_service, DISCLAIMER_TEXT
from backend.ml.data_processing import FEATURE_METADATA
from backend.ml.leakage_checks import PROHIBITED_TARGET_COLUMNS

router = APIRouter()

ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'artifacts')

class ChatMessage(BaseModel):
    message: str

def sanitize_json_obj(obj: Any) -> Any:
    """
    Recursively replaces NaN, Inf, and numpy types with standard Python types or None.
    """
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    elif isinstance(obj, dict):
        return {k: sanitize_json_obj(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json_obj(item) for item in obj]
    return obj

@router.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint returning system status and model readiness.
    """
    models_ready = len(predictor_service.models) == 4
    return {
        "status": "online" if models_ready else "degraded",
        "service": "CARDIOVISION X Backend API",
        "version": "1.0.0",
        "models_ready": models_ready,
        "loaded_targets": list(predictor_service.models.keys()),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }

@router.get("/model-info", tags=["Metadata"])
def get_model_info():
    """
    Returns information regarding models, pipeline, target leakage prevention, and datasets.
    """
    manifest_path = os.path.join(ARTIFACTS_DIR, 'manifest.json')
    manifest = {}
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
        except Exception as e:
            print(f"[API] Warning loading manifest: {e}")

    return sanitize_json_obj({
        "platform": "CARDIOVISION X — Explainable AI Coronary Risk Intelligence",
        "dataset_name": "Extension of Z-Alizadeh Sani Cardiovascular Dataset (UCI Machine Learning Repository)",
        "total_records": 303,
        "total_predictors": 55,
        "target_leakage_prevention": {
            "policy": "Strict exclusion of all target columns, post-diagnostic findings, and catheterization outcomes",
            "prohibited_columns": PROHIBITED_TARGET_COLUMNS,
            "automated_check_status": "Passed"
        },
        "models": manifest.get("models", {}),
        "disclaimer": DISCLAIMER_TEXT
    })

@router.get("/features", tags=["Metadata"])
def get_features():
    """
    Returns complete catalog of supported clinical features with categories, units, and bounds.
    """
    return {
        "total_features": len(FEATURE_METADATA),
        "features": FEATURE_METADATA
    }

@router.get("/metrics", tags=["Evaluation"])
def get_metrics():
    """
    Returns evaluation metrics, candidate comparison tables, and confusion matrices for all 4 targets.
    """
    manifest_path = os.path.join(ARTIFACTS_DIR, 'manifest.json')
    if not os.path.exists(manifest_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model manifest not found. Please execute model training pipeline first."
        )

    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)

        sanitized_data = sanitize_json_obj({
            "dataset_info": manifest.get("dataset_info", {}),
            "targets": manifest.get("models", {}),
            "disclaimer": DISCLAIMER_TEXT
        })
        return sanitized_data
    except Exception as e:
        print(f"[API] Metrics retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading model metrics manifest: {str(e)}"
        )

@router.post("/predict", response_model=PredictionResponseSchema, tags=["Inference"])
def predict_cardiovascular_risk(payload: ClinicalInputSchema):
    """
    Generates predictions for CAD, LAD, LCX, and RCA targets with SHAP explainability.
    """
    try:
        raw_dict = payload.model_dump(by_alias=True)
        response = predictor_service.predict(raw_dict)
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Inference error: {str(e)}")

@router.post("/chat", tags=["Educational RAG"])
def educational_chat(msg: ChatMessage):
    """
    Educational AI Assistant providing evidence-grounded information on CAD & Coronary Anatomy.
    """
    user_q = msg.message.lower().strip()
    
    if "lad" in user_q or "left anterior" in user_q:
        answer = (
            "The **Left Anterior Descending (LAD) artery** supplies blood to the anterior wall of the left ventricle "
            "and the anterior two-thirds of the interventricular septum. Often termed the 'widow-maker' artery, "
            "significant stenosis in the LAD accounts for high cardiac morbidity. In CARDIOVISION X, our ML model predicts "
            "LAD stenosis using clinical symptoms, ECG ST elevation/depression, Q waves, and regional wall motion abnormalities (RWMA)."
        )
        sources = ["ACC/AHA Guidelines for CAD Diagnosis", "Z-Alizadeh Sani Dataset Features Specification"]
    elif "lcx" in user_q or "circumflex" in user_q:
        answer = (
            "The **Left Circumflex (LCX) artery** courses along the coronary sulcus, supplying oxygenated blood to the "
            "posterolateral LV wall and left atrium. Ischemia in the LCX territory may manifest as ST depression or T-wave inversions "
            "in lateral ECG leads (I, aVL, V5-V6)."
        )
        sources = ["Braunwald's Heart Disease 12th Ed", "ESC Clinical Practice Guidelines"]
    elif "rca" in user_q or "right coronary" in user_q:
        answer = (
            "The **Right Coronary Artery (RCA)** travels along the right AV groove to supply the right ventricle, inferior wall "
            "of the left ventricle, and SA/AV nodes. RCA occlusion typically presents with inferior ST elevations (II, III, aVF) "
            "and potential AV nodal conduction blocks."
        )
        sources = ["Circulation Cardiovascular Imaging Journal", "ACC/AHA STEMI Guidelines"]
    elif "shap" in user_q or "explain" in user_q or "importance" in user_q:
        answer = (
            "**SHAP (SHapley Additive exPlanations)** calculates Shapley values based on game theory to assign feature attributions "
            "for each clinical parameter. A positive SHAP value increases the predicted risk of stenosis, whereas a negative value "
            "decreases predicted risk. Note: SHAP represents statistical model feature contribution, not medical causality."
        )
        sources = ["Lundberg & Lee (NeurIPS 2017) - A Unified Approach to Interpreting Model Predictions"]
    elif "rwma" in user_q or "wall motion" in user_q:
        answer = (
            "**Regional Wall Motion Abnormality (RWMA)** is an echocardiographic metric indicating abnormal contraction or "
            "hypokinesis of a specific myocardial segment. RWMA serves as a strong clinical indicator of localized myocardial ischemia or prior infarction."
        )
        sources = ["American Society of Echocardiography (ASE) Guidelines"]
    else:
        answer = (
            "CARDIOVISION X is an explainable AI system predicting multi-vessel coronary artery disease (CAD, LAD, LCX, RCA) "
            "from 55 non-invasive clinical, laboratory, ECG, and echocardiographic parameters. You can ask me about specific coronary vessels "
            "(LAD, LCX, RCA), ECG patterns, SHAP explainability, or echocardiographic findings like RWMA."
        )
        sources = ["CARDIOVISION X Knowledge Engine"]

    return {
        "answer": answer,
        "sources": sources,
        "disclaimer": DISCLAIMER_TEXT
    }
