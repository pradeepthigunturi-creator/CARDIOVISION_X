export interface FeatureMeta {
  name: string;
  type: 'numeric' | 'binary' | 'categorical';
  category: string;
  unit?: string;
  label?: string;
  min?: number;
  max?: number;
  default: number | string;
  options?: string[];
}

export interface ShapContribution {
  feature: string;
  value: number;
  shap_value: number;
  abs_shap_value: number;
  effect: 'increases_risk' | 'decreases_risk';
}

export interface ShapExplanation {
  available: boolean;
  base_value?: number;
  reason?: string;
  contributions?: ShapContribution[];
  top_positive?: ShapContribution[];
  top_negative?: ShapContribution[];
}

export interface PredictionDetail {
  target: string;
  label: string;
  probability: number;
  risk_level: string;
  status_color: string;
  model_used: string;
  shap_explanation?: ShapExplanation;
}

export interface PredictionResponse {
  status: string;
  patient_summary: {
    age?: number;
    sex?: string;
    bmi?: number;
    bp?: number;
    ef_tte?: number;
    rwma?: number;
  };
  overall_cad: PredictionDetail;
  vessels: {
    LAD: PredictionDetail;
    LCX: PredictionDetail;
    RCA: PredictionDetail;
  };
  warnings: string[];
  disclaimer: string;
  execution_time_ms: number;
}

export interface SingleMetric {
  sample_count: number;
  class_distribution: { positive: number; negative: number };
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc?: number;
  roc_auc_note?: string;
  confusion_matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
    matrix: number[][];
  };
}

export interface TargetMetadata {
  target: string;
  selected_model: string;
  feature_names: string[];
  excluded_columns: string[];
  candidate_evaluations: Record<string, SingleMetric>;
  final_metrics: SingleMetric;
  global_importance: { feature: string; importance: number }[];
}

export interface ModelMetricsResponse {
  dataset_info: {
    path: string;
    total_records: number;
    seed: number;
    targets: string[];
  };
  targets: Record<string, TargetMetadata>;
  disclaimer: string;
}
