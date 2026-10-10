"""
CARDIOVISION X - High-Performance Model Training & Validation Pipeline
Trains and evaluates CatBoost, Random Forest, Extra Trees, Gradient Boosting, and Logistic Regression
across 4 prediction targets (Overall CAD, LAD, LCX, RCA) using Stratified 5-Fold Cross Validation & Strict Target Leakage Protection.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

from sklearn.base import clone
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, ExtraTreesClassifier

# Safe optional imports
HAS_CATBOOST = False
try:
    from catboost import CatBoostClassifier
    HAS_CATBOOST = True
except Exception as e:
    print(f"CatBoost import notice: {e}")

HAS_XGBOOST = False
try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except Exception as e:
    print(f"XGBoost import notice: {e}")

from backend.ml.data_processing import load_and_preprocess_raw_data
from backend.ml.leakage_checks import sanitize_features, assert_no_leakage
from backend.ml.evaluate import evaluate_predictions
from backend.ml.explain import ModelExplainerService

TARGETS = ['Cath', 'LAD', 'LCX', 'RCA']
ARTIFACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'artifacts')

def find_optimal_threshold(y_true: np.ndarray, y_prob: np.ndarray) -> Tuple[float, float]:
    """
    Finds classification probability threshold t in [0.2, 0.8] that maximizes F1 score.
    """
    best_t = 0.5
    best_f1 = -1.0
    for t in np.linspace(0.2, 0.8, 61):
        y_pred = (y_prob >= t).astype(int)
        metrics = evaluate_predictions(y_true, y_pred, y_prob)
        if metrics['f1'] > best_f1:
            best_f1 = metrics['f1']
            best_t = float(t)
    return best_t, best_f1

def train_and_evaluate_all_targets(data_path: str, seed: int = 42) -> Dict[str, Any]:
    """
    Main training routine for Cardiovision X.
    Trains 4 independent target models with Stratified 5-Fold CV and held-out test evaluation.
    """
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    df = load_and_preprocess_raw_data(data_path)
    
    print(f"===========================================================")
    print(f" CARDIOVISION X — HIGH-PERFORMANCE TRAINING PIPELINE")
    print(f" Dataset: {data_path} | Total Records: {len(df)}")
    print(f"===========================================================")
    
    overall_results = {
        "dataset_info": {
            "path": data_path,
            "total_records": len(df),
            "seed": seed,
            "targets": TARGETS,
            "validation_strategy": "Stratified 5-Fold Cross Validation + Held-out 20% Test Split"
        },
        "models": {}
    }

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=seed)

    for target in TARGETS:
        target_display_name = "Overall CAD" if target == "Cath" else f"{target} Artery"
        print(f"\n-----------------------------------------------------------")
        print(f" TARGET: {target_display_name} ({target})")
        print(f"-----------------------------------------------------------")
        
        # 1. Enforce Target Leakage Prevention
        X, y, excluded_cols = sanitize_features(df, target_col=target)
        feature_names = X.columns.tolist()
        
        print(f"Predictor Features Count: {len(feature_names)}")
        print(f"Excluded Prohibited Columns: {excluded_cols}")
        print(f"Class Distribution: {y.value_counts().to_dict()}")
        
        # 2. Train/Test Stratified Split (80% Train, 20% Held-out Test)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=seed, stratify=y
        )
        
        # Scaler for Logistic Regression
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # 3. Candidate Model Definitions
        candidates = {
            "RandomForest": RandomForestClassifier(
                n_estimators=200, max_depth=6, min_samples_split=3, random_state=seed
            ),
            "ExtraTrees": ExtraTreesClassifier(
                n_estimators=150, max_depth=6, min_samples_split=3, random_state=seed
            ),
            "GradientBoosting": GradientBoostingClassifier(
                n_estimators=150, max_depth=4, learning_rate=0.04, random_state=seed
            ),
            "LogisticRegression": LogisticRegression(
                C=0.5, max_iter=1000, random_state=seed
            )
        }

        if HAS_CATBOOST:
            candidates["CatBoost"] = CatBoostClassifier(
                iterations=300, depth=5, learning_rate=0.04, l2_leaf_reg=3, verbose=0, random_seed=seed
            )
        if HAS_XGBOOST:
            candidates["XGBoost"] = XGBClassifier(
                n_estimators=150, max_depth=4, learning_rate=0.04, random_state=seed, eval_metric='logloss'
            )
        
        candidate_evals = {}
        best_model_name = None
        best_cv_f1 = -1.0
        best_model_obj = None
        best_scaler = None

        for name, clf in candidates.items():
            # Stratified 5-Fold Cross Validation
            cv_f1s, cv_rocs, cv_accs = [], [], []
            
            X_tr_all = X_train_scaled if name == "LogisticRegression" else X_train.values
            y_tr_all = y_train.values

            for train_idx, val_idx in skf.split(X_tr_all, y_tr_all):
                X_tr_fold, X_val_fold = X_tr_all[train_idx], X_tr_all[val_idx]
                y_tr_fold, y_val_fold = y_tr_all[train_idx], y_tr_all[val_idx]

                clf_fold = clone(clf)
                clf_fold.fit(X_tr_fold, y_tr_fold)
                
                y_val_pred = clf_fold.predict(X_val_fold)
                y_val_prob = clf_fold.predict_proba(X_val_fold)[:, 1] if hasattr(clf_fold, "predict_proba") else y_val_pred
                
                m = evaluate_predictions(y_val_fold, y_val_pred, y_val_prob)
                cv_f1s.append(m['f1'])
                cv_accs.append(m['accuracy'])
                if m.get('roc_auc') is not None:
                    cv_rocs.append(m['roc_auc'])

            mean_cv_f1 = float(np.mean(cv_f1s))
            mean_cv_acc = float(np.mean(cv_accs))
            mean_cv_roc = float(np.mean(cv_rocs)) if cv_rocs else 0.0

            # Fit full training set
            X_tr_fit = X_train_scaled if name == "LogisticRegression" else X_train
            X_te_eval = X_test_scaled if name == "LogisticRegression" else X_test
            
            clf.fit(X_tr_fit, y_train)
            y_test_pred = clf.predict(X_te_eval)
            y_test_prob = clf.predict_proba(X_te_eval)[:, 1] if hasattr(clf, "predict_proba") else None

            test_metrics = evaluate_predictions(y_test.values, y_test_pred, y_test_prob)
            test_metrics['cv_mean_f1'] = round(mean_cv_f1, 4)
            test_metrics['cv_mean_accuracy'] = round(mean_cv_acc, 4)
            test_metrics['cv_mean_roc_auc'] = round(mean_cv_roc, 4)

            candidate_evals[name] = test_metrics

            print(f"Candidate [{name:18s}] -> 5-CV F1: {mean_cv_f1:.4f} | Test Acc: {test_metrics['accuracy']:.4f} | Prec: {test_metrics['precision']:.4f} | Rec: {test_metrics['recall']:.4f} | F1: {test_metrics['f1']:.4f} | ROC-AUC: {test_metrics.get('roc_auc', 0.0):.4f}")

            if mean_cv_f1 > best_cv_f1:
                best_cv_f1 = mean_cv_f1
                best_model_name = name
                best_model_obj = clf
                best_scaler = scaler if name == "LogisticRegression" else None

        print(f"\n---> Best Model Selected for {target}: {best_model_name} (5-CV Mean F1: {best_cv_f1:.4f})")
        
        # 4. Generate SHAP global feature importances
        explainer_service = ModelExplainerService(best_model_obj, feature_names, X_train)
        global_importance = explainer_service.get_global_importance(X_test)
        
        # 5. Save Artifacts for this target
        target_dir = os.path.join(ARTIFACTS_DIR, target.lower())
        os.makedirs(target_dir, exist_ok=True)
        
        model_artifact_path = os.path.join(target_dir, 'model.joblib')
        scaler_artifact_path = os.path.join(target_dir, 'scaler.joblib') if best_scaler else None
        
        joblib.dump(best_model_obj, model_artifact_path)
        if best_scaler:
            joblib.dump(best_scaler, scaler_artifact_path)

        metadata = {
            "target": target,
            "target_display_name": target_display_name,
            "selected_model": best_model_name,
            "feature_names": feature_names,
            "excluded_columns": excluded_cols,
            "candidate_evaluations": candidate_evals,
            "final_metrics": candidate_evals[best_model_name],
            "global_importance": global_importance,
            "has_scaler": best_scaler is not None
        }

        with open(os.path.join(target_dir, 'metadata.json'), 'w') as f:
            json.dump(metadata, f, indent=2)

        overall_results["models"][target] = metadata

    # Save manifest summary
    with open(os.path.join(ARTIFACTS_DIR, 'manifest.json'), 'w') as f:
        json.dump(overall_results, f, indent=2)

    print(f"\n===========================================================")
    print(f" TRAINING COMPLETED SUCCESSFULLY! ARTIFACTS SAVED TO {ARTIFACTS_DIR}")
    print(f"===========================================================")
    return overall_results

if __name__ == '__main__':
    data_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'z_alizadeh_sani.csv')
    train_and_evaluate_all_targets(data_file)
