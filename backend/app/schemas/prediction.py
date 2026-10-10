"""
CARDIOVISION X - API Pydantic Data Schemas
Defines input payload and response schemas for clinical prediction endpoints.
"""

from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict

class ClinicalInputSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    # Demographics
    Age: float = Field(58.0, ge=1.0, le=130.0, description="Age in years")
    Weight: float = Field(73.0, ge=1.0, le=300.0, description="Weight in kg")
    Length: float = Field(165.0, ge=50.0, le=250.0, description="Height in cm")
    Sex: Union[str, int] = Field("Male", description="Sex ('Male' / 'Fmale' / 1 / 0)")
    BMI: float = Field(26.8, ge=5.0, le=80.0, description="Body Mass Index in kg/m²")
    
    # Medical History (Flexible types accepting 1/0 or "Y"/"N")
    DM: Union[int, str] = Field(0, description="Diabetes Mellitus (0/1 or Y/N)")
    HTN: Union[int, str] = Field(1, description="Hypertension (0/1 or Y/N)")
    Current_Smoker: Union[int, str] = Field(0, alias="Current Smoker", description="Current Smoker (0/1 or Y/N)")
    EX_Smoker: Union[int, str] = Field(0, alias="EX-Smoker", description="Ex-Smoker (0/1 or Y/N)")
    FH: Union[int, str] = Field(0, description="Family History of CAD (0/1 or Y/N)")
    Obesity: Union[int, str] = Field("Y", description="Obesity status (1/0 or Y/N)")
    CRF: Union[int, str] = Field("N", description="Chronic Renal Failure (1/0 or Y/N)")
    CVA: Union[int, str] = Field("N", description="Cerebrovascular Accident (1/0 or Y/N)")
    Airway_disease: Union[int, str] = Field("N", alias="Airway disease", description="Airway Disease (1/0 or Y/N)")
    Thyroid_Disease: Union[int, str] = Field("N", alias="Thyroid Disease", description="Thyroid Disease (1/0 or Y/N)")
    CHF: Union[int, str] = Field("N", description="Congestive Heart Failure (1/0 or Y/N)")
    DLP: Union[int, str] = Field("Y", description="Dyslipidemia (1/0 or Y/N)")

    # Examination
    BP: float = Field(130.0, ge=40.0, le=300.0, description="Systolic Blood Pressure in mmHg")
    PR: float = Field(75.0, ge=30.0, le=250.0, description="Pulse Rate in bpm")
    Edema: Union[int, str] = Field(0, description="Edema (0/1 or Y/N)")
    Weak_Peripheral_Pulse: Union[int, str] = Field("N", alias="Weak Peripheral Pulse")
    Lung_rales: Union[int, str] = Field("N", alias="Lung rales")
    Systolic_Murmur: Union[int, str] = Field("N", alias="Systolic Murmur")
    Diastolic_Murmur: Union[int, str] = Field("N", alias="Diastolic Murmur")

    # Symptoms
    Typical_Chest_Pain: Union[int, str] = Field(1, alias="Typical Chest Pain")
    Dyspnea: Union[int, str] = Field("N")
    Function_Class: Union[int, str] = Field(0, alias="Function Class")
    Atypical: Union[int, str] = Field("N")
    Nonanginal: Union[int, str] = Field("N")
    Exertional_CP: Union[int, str] = Field("N", alias="Exertional CP")
    LowTH_Ang: Union[int, str] = Field("N", alias="LowTH Ang")

    # ECG
    Q_Wave: Union[int, str] = Field(0, alias="Q Wave")
    St_Elevation: Union[int, str] = Field(0, alias="St Elevation")
    St_Depression: Union[int, str] = Field(0, alias="St Depression")
    Tinversion: Union[int, str] = Field(0)
    LVH: Union[int, str] = Field("N")
    Poor_R_Progression: Union[int, str] = Field("N", alias="Poor R Progression")
    BBB: Union[int, str] = Field("N", description="Bundle Branch Block ('N'/'LBBB'/'RBBB' or 0/1/2)")

    # Laboratory
    FBS: float = Field(110.0, ge=10.0, le=1000.0, description="Fasting Blood Sugar mg/dL")
    CR: float = Field(1.0, ge=0.0, le=50.0, description="Creatinine mg/dL")
    TG: float = Field(150.0, ge=10.0, le=2000.0, description="Triglycerides mg/dL")
    LDL: float = Field(120.0, ge=5.0, le=1000.0, description="LDL mg/dL")
    HDL: float = Field(42.0, ge=1.0, le=300.0, description="HDL mg/dL")
    BUN: float = Field(16.0, ge=0.0, le=300.0)
    ESR: float = Field(18.0, ge=0.0, le=300.0)
    HB: float = Field(13.5, ge=1.0, le=40.0)
    K: float = Field(4.2, ge=0.5, le=15.0)
    Na: float = Field(140.0, ge=50.0, le=220.0)
    WBC: float = Field(7500.0, ge=100.0, le=100000.0)
    Lymph: float = Field(30.0, ge=0.0, le=100.0)
    Neut: float = Field(62.0, ge=0.0, le=100.0)
    PLT: float = Field(240.0, ge=1.0, le=2000.0)

    # Echo
    EF_TTE: float = Field(50.0, ge=5.0, le=100.0, alias="EF-TTE", description="Ejection Fraction %")
    Region_RWMA: float = Field(0.0, ge=0.0, le=10.0, alias="Region RWMA", description="RWMA Region Score")
    VHD: Union[int, str] = Field("N", description="Valvular Heart Disease ('N'/'mild'/'Moderate'/'Severe' or 0/1/2/3)")

class SinglePredictionDetail(BaseModel):
    target: str
    label: str
    probability: float
    risk_level: str
    status_color: str
    model_used: str
    shap_explanation: Optional[Dict[str, Any]] = None

class PredictionResponseSchema(BaseModel):
    status: str = "success"
    patient_summary: Dict[str, Any]
    overall_cad: SinglePredictionDetail
    vessels: Dict[str, SinglePredictionDetail]
    warnings: List[str]
    disclaimer: str
    execution_time_ms: float
