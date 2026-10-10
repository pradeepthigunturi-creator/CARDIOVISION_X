"""
CARDIOVISION X - Model Evaluation Module
Calculates evaluation metrics, confusion matrices, and calibration stats.
"""

from typing import Dict, Any, List
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, brier_score_loss, log_loss
)

def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray = None) -> Dict[str, Any]:
    """
    Computes standard classification evaluation metrics safely.
    Handles edge cases like single-class test sets or zero denominator metrics.
    """
    metrics = {}

    # Basic counts
    total = len(y_true)
    positives = int(np.sum(y_true == 1))
    negatives = int(np.sum(y_true == 0))

    metrics['sample_count'] = total
    metrics['class_distribution'] = {'positive': positives, 'negative': negatives}

    # Accuracy
    metrics['accuracy'] = float(accuracy_score(y_true, y_pred))

    # Precision, Recall, F1
    metrics['precision'] = float(precision_score(y_true, y_pred, zero_division=0))
    metrics['recall'] = float(recall_score(y_true, y_pred, zero_division=0))
    metrics['f1'] = float(f1_score(y_true, y_pred, zero_division=0))

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    metrics['confusion_matrix'] = {
        'tn': int(tn),
        'fp': int(fp),
        'fn': int(fn),
        'tp': int(tp),
        'matrix': cm.tolist()
    }

    # ROC-AUC & Calibration metrics
    if len(np.unique(y_true)) < 2:
        metrics['roc_auc'] = None
        metrics['roc_auc_note'] = "ROC-AUC is unavailable because evaluation set contains only one class."
    elif y_prob is not None:
        try:
            metrics['roc_auc'] = float(roc_auc_score(y_true, y_prob))
            metrics['brier_score'] = float(brier_score_loss(y_true, y_prob))
            metrics['log_loss'] = float(log_loss(y_true, y_prob))
        except Exception as e:
            metrics['roc_auc'] = None
            metrics['roc_auc_note'] = f"ROC-AUC calculation failed: {str(e)}"

    return metrics
