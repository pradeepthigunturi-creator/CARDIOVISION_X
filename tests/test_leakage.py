"""
CARDIOVISION X - Automated Target Leakage Prevention Test Suite
Verifies that prohibited target columns are strictly excluded from all prediction feature matrices.
"""

import os
import pytest
import pandas as pd

from backend.ml.leakage_checks import (
    sanitize_features,
    assert_no_leakage,
    PROHIBITED_TARGET_COLUMNS
)
from backend.ml.data_processing import load_and_preprocess_raw_data

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'z_alizadeh_sani.csv')

def test_leakage_prevention_for_all_targets():
    """
    Ensures no target column enters the feature set for any of the 4 target models.
    """
    assert os.path.exists(DATA_PATH), f"Dataset file missing at {DATA_PATH}"
    df = load_and_preprocess_raw_data(DATA_PATH)
    
    targets = ['Cath', 'LAD', 'LCX', 'RCA']
    for target in targets:
        X, y, excluded = sanitize_features(df, target_col=target)
        
        # 1. Target column itself must not be in X
        assert target not in X.columns, f"Target '{target}' leaked into X columns!"
        
        # 2. None of the prohibited target columns can be in X
        for p in PROHIBITED_TARGET_COLUMNS:
            assert p not in X.columns, f"Prohibited column '{p}' found in X for target '{target}'!"
            assert p.lower() not in [c.lower() for c in X.columns], f"Case-insensitive prohibited column '{p}' found in X!"

        # 3. Assert no leakage check helper passes
        assert_no_leakage(X, target)

def test_leakage_assertion_failure():
    """
    Tests that assert_no_leakage raises AssertionError if a prohibited column is artificially injected.
    """
    bad_df = pd.DataFrame({
        'Age': [50, 60],
        'BP': [120, 130],
        'LAD': ['Stenotic', 'Normal']
    })
    
    with pytest.raises(AssertionError):
        assert_no_leakage(bad_df, 'Cath')
