"""
CARDIOVISION X - Data Preprocessing & Pipeline Module
Handles schema validation, feature encoding, scaling, and data preparation.
"""

import os
import json
import pandas as pd
import numpy as np
from typing import Dict, Tuple, List, Any
from sklearn.preprocessing import StandardScaler

BINARY_MAP_YN = {'Y': 1, 'N': 0, 'y': 1, 'n': 0, 1: 1, 0: 0}
SEX_MAP = {'Male': 1, 'Fmale': 0, 'Female': 0, 1: 1, 0: 0}
TARGET_MAP = {
    'Cath': {'CAD': 1, 'Normal': 0, 1: 1, 0: 0},
    'LAD': {'Stenotic': 1, 'Normal': 0, 1: 1, 0: 0},
    'LCX': {'Stenotic': 1, 'Normal': 0, 1: 1, 0: 0},
    'RCA': {'Stenotic': 1, 'Normal': 0, 1: 1, 0: 0},
}

BBB_MAP = {'N': 0, 'LBBB': 1, 'RBBB': 2}
VHD_MAP = {'N': 0, 'mild': 1, 'Moderate': 2, 'Severe': 3}

# All 55 predictor features metadata with display names, min/max defaults, and categories
FEATURE_METADATA = [
    {"name": "Age", "type": "numeric", "category": "Demographic", "unit": "years", "min": 30, "max": 90, "default": 58},
    {"name": "Weight", "type": "numeric", "category": "Demographic", "unit": "kg", "min": 40, "max": 140, "default": 73},
    {"name": "Length", "type": "numeric", "category": "Demographic", "unit": "cm", "min": 140, "max": 200, "default": 165},
    {"name": "Sex", "type": "categorical", "category": "Demographic", "options": ["Male", "Fmale"], "default": "Male"},
    {"name": "BMI", "type": "numeric", "category": "Demographic", "unit": "kg/m²", "min": 15, "max": 45, "default": 26.8},
    {"name": "DM", "type": "binary", "category": "Medical History", "label": "Diabetes Mellitus", "default": 0},
    {"name": "HTN", "type": "binary", "category": "Medical History", "label": "Hypertension", "default": 1},
    {"name": "Current Smoker", "type": "binary", "category": "Medical History", "label": "Current Smoker", "default": 0},
    {"name": "EX-Smoker", "type": "binary", "category": "Medical History", "label": "Ex-Smoker", "default": 0},
    {"name": "FH", "type": "binary", "category": "Medical History", "label": "Family History CAD", "default": 0},
    {"name": "Obesity", "type": "binary", "category": "Medical History", "label": "Obesity (BMI > 25)", "default": 1},
    {"name": "CRF", "type": "binary", "category": "Medical History", "label": "Chronic Renal Failure", "default": 0},
    {"name": "CVA", "type": "binary", "category": "Medical History", "label": "Cerebrovascular Accident", "default": 0},
    {"name": "Airway disease", "type": "binary", "category": "Medical History", "label": "Airway Disease", "default": 0},
    {"name": "Thyroid Disease", "type": "binary", "category": "Medical History", "label": "Thyroid Disease", "default": 0},
    {"name": "CHF", "type": "binary", "category": "Medical History", "label": "Congestive Heart Failure", "default": 0},
    {"name": "DLP", "type": "binary", "category": "Medical History", "label": "Dyslipidemia", "default": 1},
    {"name": "BP", "type": "numeric", "category": "Clinical Examination", "unit": "mmHg", "min": 80, "max": 200, "default": 130},
    {"name": "PR", "type": "numeric", "category": "Clinical Examination", "unit": "bpm", "min": 50, "max": 130, "default": 75},
    {"name": "Edema", "type": "binary", "category": "Clinical Examination", "label": "Edema", "default": 0},
    {"name": "Weak Peripheral Pulse", "type": "binary", "category": "Clinical Examination", "label": "Weak Peripheral Pulse", "default": 0},
    {"name": "Lung rales", "type": "binary", "category": "Clinical Examination", "label": "Lung Rales", "default": 0},
    {"name": "Systolic Murmur", "type": "binary", "category": "Clinical Examination", "label": "Systolic Murmur", "default": 0},
    {"name": "Diastolic Murmur", "type": "binary", "category": "Clinical Examination", "label": "Diastolic Murmur", "default": 0},
    {"name": "Typical Chest Pain", "type": "binary", "category": "Symptoms", "label": "Typical Anginal Chest Pain", "default": 1},
    {"name": "Dyspnea", "type": "binary", "category": "Symptoms", "label": "Dyspnea", "default": 0},
    {"name": "Function Class", "type": "numeric", "category": "Symptoms", "unit": "NYHA class", "min": 0, "max": 4, "default": 0},
    {"name": "Atypical", "type": "binary", "category": "Symptoms", "label": "Atypical Chest Pain", "default": 0},
    {"name": "Nonanginal", "type": "binary", "category": "Symptoms", "label": "Non-anginal Chest Pain", "default": 0},
    {"name": "Exertional CP", "type": "binary", "category": "Symptoms", "label": "Exertional Chest Pain", "default": 0},
    {"name": "LowTH Ang", "type": "binary", "category": "Symptoms", "label": "Low Threshold Angina", "default": 0},
    {"name": "Q Wave", "type": "binary", "category": "ECG Findings", "label": "Pathological Q Wave", "default": 0},
    {"name": "St Elevation", "type": "binary", "category": "ECG Findings", "label": "ST Segment Elevation", "default": 0},
    {"name": "St Depression", "type": "binary", "category": "ECG Findings", "label": "ST Segment Depression", "default": 0},
    {"name": "Tinversion", "type": "binary", "category": "ECG Findings", "label": "T Wave Inversion", "default": 0},
    {"name": "LVH", "type": "binary", "category": "ECG Findings", "label": "Left Ventricular Hypertrophy", "default": 0},
    {"name": "Poor R Progression", "type": "binary", "category": "ECG Findings", "label": "Poor R Wave Progression", "default": 0},
    {"name": "BBB", "type": "categorical", "category": "ECG Findings", "options": ["N", "LBBB", "RBBB"], "default": "N"},
    {"name": "FBS", "type": "numeric", "category": "Laboratory Measurements", "unit": "mg/dL", "min": 60, "max": 400, "default": 110},
    {"name": "CR", "type": "numeric", "category": "Laboratory Measurements", "unit": "mg/dL", "min": 0.5, "max": 5.0, "default": 1.0},
    {"name": "TG", "type": "numeric", "category": "Laboratory Measurements", "unit": "mg/dL", "min": 50, "max": 600, "default": 150},
    {"name": "LDL", "type": "numeric", "category": "Laboratory Measurements", "unit": "mg/dL", "min": 40, "max": 300, "default": 120},
    {"name": "HDL", "type": "numeric", "category": "Laboratory Measurements", "unit": "mg/dL", "min": 15, "max": 90, "default": 42},
    {"name": "BUN", "type": "numeric", "category": "Laboratory Measurements", "unit": "mg/dL", "min": 5, "max": 80, "default": 16},
    {"name": "ESR", "type": "numeric", "category": "Laboratory Measurements", "unit": "mm/h", "min": 1, "max": 90, "default": 18},
    {"name": "HB", "type": "numeric", "category": "Laboratory Measurements", "unit": "g/dL", "min": 8, "max": 20, "default": 13.5},
    {"name": "K", "type": "numeric", "category": "Laboratory Measurements", "unit": "mEq/L", "min": 3.0, "max": 6.5, "default": 4.2},
    {"name": "Na", "type": "numeric", "category": "Laboratory Measurements", "unit": "mEq/L", "min": 120, "max": 160, "default": 140},
    {"name": "WBC", "type": "numeric", "category": "Laboratory Measurements", "unit": "/mm³", "min": 2000, "max": 20000, "default": 7500},
    {"name": "Lymph", "type": "numeric", "category": "Laboratory Measurements", "unit": "%", "min": 5, "max": 60, "default": 30},
    {"name": "Neut", "type": "numeric", "category": "Laboratory Measurements", "unit": "%", "min": 30, "max": 90, "default": 62},
    {"name": "PLT", "type": "numeric", "category": "Laboratory Measurements", "unit": "×10³/µL", "min": 100, "max": 600, "default": 240},
    {"name": "EF-TTE", "type": "numeric", "category": "Echocardiography", "unit": "%", "min": 15, "max": 75, "default": 50},
    {"name": "Region RWMA", "type": "numeric", "category": "Echocardiography", "unit": "score", "min": 0, "max": 5, "default": 0},
    {"name": "VHD", "type": "categorical", "category": "Echocardiography", "options": ["N", "mild", "Moderate", "Severe"], "default": "N"},
]

def load_and_preprocess_raw_data(data_path: str) -> pd.DataFrame:
    """
    Loads raw CSV dataset and standardizes binary and categorical encodings.
    """
    df = pd.read_csv(data_path)

    # Copy to avoid mutating original
    df_clean = df.copy()

    # Encode binary columns Y/N -> 1/0
    yn_cols = [
        'Obesity', 'CRF', 'CVA', 'Airway disease', 'Thyroid Disease', 'CHF',
        'DLP', 'Weak Peripheral Pulse', 'Lung rales', 'Systolic Murmur',
        'Diastolic Murmur', 'Dyspnea', 'Atypical', 'Nonanginal',
        'Exertional CP', 'LowTH Ang', 'LVH', 'Poor R Progression'
    ]
    for col in yn_cols:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].map(BINARY_MAP_YN).fillna(0).astype(int)

    # Encode Sex
    if 'Sex' in df_clean.columns:
        df_clean['Sex'] = df_clean['Sex'].map(SEX_MAP).fillna(1).astype(int)

    # Encode BBB & VHD
    if 'BBB' in df_clean.columns:
        df_clean['BBB'] = df_clean['BBB'].map(BBB_MAP).fillna(0).astype(int)
    if 'VHD' in df_clean.columns:
        df_clean['VHD'] = df_clean['VHD'].map(VHD_MAP).fillna(0).astype(int)

    # Map target labels to 1/0
    for t_col, t_map in TARGET_MAP.items():
        if t_col in df_clean.columns:
            df_clean[t_col] = df_clean[t_col].map(t_map).astype(int)

    return df_clean

def preprocess_single_input(raw_input: Dict[str, Any], feature_names: List[str]) -> pd.DataFrame:
    """
    Preprocesses a single raw clinical input dictionary into a aligned pd.DataFrame for prediction.
    """
    processed = {}
    for meta in FEATURE_METADATA:
        name = meta['name']
        val = raw_input.get(name, meta['default'])

        if meta['type'] == 'binary':
            if isinstance(val, str):
                processed[name] = BINARY_MAP_YN.get(val, 0)
            else:
                processed[name] = int(val)
        elif name == 'Sex':
            processed[name] = SEX_MAP.get(val, 1)
        elif name == 'BBB':
            processed[name] = BBB_MAP.get(val, 0)
        elif name == 'VHD':
            processed[name] = VHD_MAP.get(val, 0)
        else:
            try:
                processed[name] = float(val)
            except (ValueError, TypeError):
                processed[name] = float(meta['default'])

    df_single = pd.DataFrame([processed])
    # Ensure correct column ordering matching training feature_names
    for f in feature_names:
        if f not in df_single.columns:
            df_single[f] = 0
    return df_single[feature_names]
