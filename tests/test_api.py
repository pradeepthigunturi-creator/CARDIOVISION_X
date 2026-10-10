"""
CARDIOVISION X - API Endpoints Test Suite
"""

import os
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["models_ready"] is True
    assert len(data["loaded_targets"]) == 4

def test_features_endpoint():
    response = client.get("/api/v1/features")
    assert response.status_code == 200
    data = response.json()
    assert data["total_features"] == 55
    assert len(data["features"]) == 55

def test_metrics_endpoint():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "targets" in data
    assert "Cath" in data["targets"]
    assert "LAD" in data["targets"]

def test_predict_endpoint_valid():
    payload = {
        "Age": 55, "Weight": 75, "Length": 168, "Sex": "Male", "BMI": 26.5,
        "DM": 0, "HTN": 1, "Current Smoker": 0, "EX-Smoker": 0, "FH": 0,
        "Obesity": "Y", "CRF": "N", "CVA": "N", "Airway disease": "N",
        "Thyroid Disease": "N", "CHF": "N", "DLP": "Y", "BP": 130, "PR": 75,
        "Edema": 0, "Weak Peripheral Pulse": "N", "Lung rales": "N",
        "Systolic Murmur": "N", "Diastolic Murmur": "N", "Typical Chest Pain": 1,
        "Dyspnea": "N", "Function Class": 0, "Atypical": "N", "Nonanginal": "N",
        "Exertional CP": "N", "LowTH Ang": "N", "Q Wave": 0, "St Elevation": 0,
        "St Depression": 0, "Tinversion": 0, "LVH": "N", "Poor R Progression": "N",
        "BBB": "N", "FBS": 105, "CR": 0.9, "TG": 140, "LDL": 115, "HDL": 45,
        "BUN": 15, "ESR": 14, "HB": 14.0, "K": 4.2, "Na": 140, "WBC": 7100,
        "Lymph": 32, "Neut": 60, "PLT": 230, "EF-TTE": 55, "Region RWMA": 0, "VHD": "N"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "overall_cad" in data
    assert "vessels" in data
    assert "LAD" in data["vessels"]
    assert 0.0 <= data["overall_cad"]["probability"] <= 1.0

def test_predict_endpoint_prohibited_key_rejection():
    # Attempt target leakage by injecting a prohibited target column
    payload = {
        "Age": 55, "Weight": 75, "Length": 168, "Sex": "Male", "BMI": 26.5,
        "Cath": "CAD"  # Prohibited target column!
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code in [400, 422]  # Unprocessable Entity due to forbidden extra field
