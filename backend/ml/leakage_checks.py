"""
CARDIOVISION X - Target Leakage Prevention Module
Enforces strict checks to guarantee no target columns or outcome derivatives enter predictor features.
"""

from typing import List, Tuple
import pandas as pd

# Explicitly prohibited columns for any input predictor set
PROHIBITED_TARGET_COLUMNS = [
    'CAD',
    'Cath',
    'LAD',
    'LCX',
    'RCA',
    'cath',
    'cad',
    'lad',
    'lcx',
    'rca',
    'Number of Vessel Involved',
    'Number Of lesion PCI',
    'EF- Cath',
    'LM Proximal',
    'LM Distal',
    'LAD Proximal',
    'LAD Mid',
    'LAD Distal',
    'LCX Proximal',
    'LCX Mid',
    'LCX Distal',
    'RCA Proximal',
    'RCA Mid',
    'RCA Distal',
]

def sanitize_features(df: pd.DataFrame, target_col: str) -> Tuple[pd.DataFrame, pd.Series, List[str]]:
    """
    Extracts features and target from dataframe while enforcing target leakage prevention.
    
    Args:
        df: Input DataFrame
        target_col: Target column name ('Cath', 'LAD', 'LCX', or 'RCA')
        
    Returns:
        X (pd.DataFrame): Sanitized predictor features matrix
        y (pd.Series): Target vector
        excluded_columns (List[str]): List of columns removed due to leakage prevention or target designation
    """
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in dataframe columns: {df.columns.tolist()}")

    # Determine all columns to exclude
    excluded = []
    for col in df.columns:
        col_lower = col.strip().lower()
        # Check against prohibited targets list or match target col
        if col == target_col or col in PROHIBITED_TARGET_COLUMNS or any(p.lower() == col_lower for p in PROHIBITED_TARGET_COLUMNS):
            excluded.append(col)

    # Feature matrix X
    feature_cols = [c for c in df.columns if c not in excluded]
    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # Final verification step
    assert_no_leakage(X, target_col)

    return X, y, excluded

def assert_no_leakage(X: pd.DataFrame, target_col: str) -> None:
    """
    Raises AssertionError if any prohibited column exists in X.
    """
    feature_names_lower = [c.strip().lower() for c in X.columns]
    for prohibited in PROHIBITED_TARGET_COLUMNS:
        p_lower = prohibited.lower()
        if p_lower in feature_names_lower:
            raise AssertionError(f"LEAKAGE DETECTED: Prohibited column '{prohibited}' found in predictor features matrix!")
