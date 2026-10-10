"""
CARDIOVISION X - Explainable AI (SHAP) Module
Computes SHAP global feature importances and local patient-level prediction attributions.

Explainer routing:
  - TreeExplainer   → CatBoost, ExtraTrees, RandomForest, XGBoost (fast, exact)
  - LinearExplainer → LogisticRegression, LinearSVC, Ridge (fast, exact for linear models)
  - KernelExplainer → All other models (slow, approximate, last resort)
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
import shap
import warnings
warnings.filterwarnings("ignore")


def _is_tree_model(model: Any) -> bool:
    """Returns True if the model is a tree-based algorithm supported by TreeExplainer."""
    class_name = type(model).__name__
    tree_keywords = ['Tree', 'Forest', 'CatBoost', 'XGB', 'GBM', 'Gradient', 'Extra', 'LGBM', 'LightGBM']
    return any(kw in class_name for kw in tree_keywords)


def _is_linear_model(model: Any) -> bool:
    """Returns True if the model is linear and supported by LinearExplainer."""
    class_name = type(model).__name__
    linear_keywords = ['LogisticRegression', 'LinearSVC', 'Ridge', 'Lasso', 'ElasticNet', 'SGD', 'Perceptron', 'LinearDiscriminantAnalysis']
    return any(kw in class_name for kw in linear_keywords)


class ModelExplainerService:
    def __init__(self, model: Any, feature_names: List[str], X_background: pd.DataFrame = None):
        self.model = model
        self.feature_names = feature_names
        self.explainer = None
        self.explainer_type = None
        self.init_explainer(X_background)

    def init_explainer(self, X_background: pd.DataFrame = None):
        """
        Initialises the appropriate SHAP explainer based on model type.
        Priority: TreeExplainer → LinearExplainer → KernelExplainer
        """
        model_name = type(self.model).__name__

        # --- 1. Tree-based models ---
        if _is_tree_model(self.model):
            try:
                self.explainer = shap.TreeExplainer(self.model)
                self.explainer_type = 'tree'
                print(f"[SHAP] Initialized TreeExplainer for {model_name}")
                return
            except Exception as e:
                print(f"[SHAP] TreeExplainer failed for {model_name}: {e}")

        # --- 2. Linear models ---
        if _is_linear_model(self.model):
            try:
                if X_background is not None:
                    bg = X_background.values if hasattr(X_background, 'values') else X_background
                    self.explainer = shap.LinearExplainer(self.model, bg)
                else:
                    self.explainer = shap.LinearExplainer(self.model, np.zeros((1, len(self.feature_names))))
                self.explainer_type = 'linear'
                print(f"[SHAP] Initialized LinearExplainer for {model_name}")
                return
            except Exception as e:
                print(f"[SHAP] LinearExplainer failed for {model_name}: {e}")

        # --- 3. KernelExplainer fallback ---
        if X_background is not None:
            try:
                bg_sample = X_background.iloc[:50] if len(X_background) > 50 else X_background
                self.explainer = shap.KernelExplainer(self.model.predict_proba, bg_sample)
                self.explainer_type = 'kernel'
                print(f"[SHAP] Initialized KernelExplainer for {model_name} (fallback)")
                return
            except Exception as e:
                print(f"[SHAP] KernelExplainer failed for {model_name}: {e}")

        print(f"[SHAP] WARNING: Could not initialize any explainer for {model_name}")
        self.explainer = None

    def explain_instance(self, df_instance: pd.DataFrame) -> Dict[str, Any]:
        """
        Computes local SHAP values for a single patient input record.
        Returns a structured dict with feature contributions sorted by |SHAP|.
        """
        if self.explainer is None:
            return {"available": False, "reason": "SHAP explainer not initialized"}

        try:
            if self.explainer_type == 'linear':
                # LinearExplainer returns (n_samples, n_features) array
                raw = self.explainer.shap_values(df_instance.values if hasattr(df_instance, 'values') else df_instance)
                if isinstance(raw, list):
                    # Multi-class: take positive class
                    vals = np.array(raw[1])[0] if len(raw) > 1 else np.array(raw[0])[0]
                else:
                    vals = np.array(raw)[0]
                base_val = float(self.explainer.expected_value[1]) if isinstance(self.explainer.expected_value, (list, np.ndarray)) else float(self.explainer.expected_value)

            elif self.explainer_type == 'tree':
                shap_obj = self.explainer(df_instance)
                values = shap_obj.values
                if len(values.shape) == 3:          # (samples, features, classes)
                    vals = values[0, :, 1]
                    base_val = float(shap_obj.base_values[0][1])
                elif len(values.shape) == 2:        # (samples, features)
                    vals = values[0, :]
                    bv = shap_obj.base_values
                    base_val = float(bv[0]) if hasattr(bv, '__len__') else float(bv)
                else:
                    vals = values
                    base_val = 0.5

            else:
                # KernelExplainer
                raw = self.explainer.shap_values(df_instance)
                if isinstance(raw, list):
                    vals = np.array(raw[1])[0] if len(raw) > 1 else np.array(raw[0])[0]
                else:
                    vals = np.array(raw)[0]
                ev = self.explainer.expected_value
                base_val = float(ev[1]) if isinstance(ev, (list, np.ndarray)) and len(ev) > 1 else float(ev)

            # Build contribution list
            raw_values = df_instance.iloc[0].tolist()
            contributions = []
            for feat_name, val, raw_val in zip(self.feature_names, vals, raw_values):
                float_val = float(val)
                contributions.append({
                    "feature": feat_name,
                    "value": float(raw_val),
                    "shap_value": float_val,
                    "abs_shap_value": abs(float_val),
                    "effect": "increases_risk" if float_val > 0 else "decreases_risk"
                })

            contributions.sort(key=lambda x: x['abs_shap_value'], reverse=True)

            return {
                "available": True,
                "base_value": base_val,
                "contributions": contributions,
                "top_positive": [c for c in contributions if c['shap_value'] > 0][:5],
                "top_negative": [c for c in contributions if c['shap_value'] < 0][:5]
            }

        except Exception as e:
            return {"available": False, "reason": f"SHAP calculation error: {str(e)}"}

    def get_global_importance(self, X_sample: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Computes mean absolute SHAP feature importances across validation set.
        """
        if self.explainer is None:
            return []

        try:
            if self.explainer_type == 'linear':
                X_arr = X_sample.values if hasattr(X_sample, 'values') else X_sample
                raw = self.explainer.shap_values(X_arr)
                if isinstance(raw, list):
                    vals = np.array(raw[1]) if len(raw) > 1 else np.array(raw[0])
                else:
                    vals = np.array(raw)

            elif self.explainer_type == 'tree':
                shap_obj = self.explainer(X_sample)
                vals = shap_obj.values
                if len(vals.shape) == 3:
                    vals = vals[:, :, 1]

            else:
                raw = self.explainer.shap_values(X_sample)
                if isinstance(raw, list):
                    vals = np.array(raw[1]) if len(raw) > 1 else np.array(raw[0])
                else:
                    vals = np.array(raw)

            mean_abs_shap = np.mean(np.abs(vals), axis=0)
            importance = [
                {"feature": feat, "importance": float(imp)}
                for feat, imp in zip(self.feature_names, mean_abs_shap)
            ]
            importance.sort(key=lambda x: x['importance'], reverse=True)
            return importance

        except Exception as e:
            print(f"[SHAP] Global importance error: {e}")
            return []
