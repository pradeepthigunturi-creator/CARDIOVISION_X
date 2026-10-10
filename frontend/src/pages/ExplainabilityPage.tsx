import React, { useState, useEffect } from 'react';
import { ModelMetricsResponse, PredictionResponse } from '../types';
import { fetchMetrics, postPredict } from '../services/api';
import { ShapExplainabilityView } from '../components/ShapExplainabilityView';
import { FileText, Sparkles, UserCheck, Activity } from 'lucide-react';

const PATIENT_PRESETS: Record<string, { label: string; desc: string; values: Record<string, any> }> = {
  high_risk: {
    label: 'Patient A: Severe CAD & Multi-vessel Risk',
    desc: 'Age 67, Male, Typical Angina, ST Elevation, RWMA = 4, EF = 40%',
    values: {
      Age: 67, Weight: 85, Length: 172, Sex: 'Male', BMI: 28.7,
      DM: 1, HTN: 1, 'Current Smoker': 1, 'EX-Smoker': 0, FH: 1,
      Obesity: 'Y', CRF: 'N', CVA: 'N', 'Airway disease': 'N',
      'Thyroid Disease': 'N', CHF: 'Y', DLP: 'Y', BP: 145, PR: 85,
      Edema: 1, 'Weak Peripheral Pulse': 'Y', 'Lung rales': 'N',
      'Systolic Murmur': 'Y', 'Diastolic Murmur': 'N', 'Typical Chest Pain': 1,
      Dyspnea: 'Y', 'Function Class': 2, Atypical: 'N', Nonanginal: 'N',
      'Exertional CP': 'N', 'LowTH Ang': 'Y', 'Q Wave': 1, 'St Elevation': 1,
      'St Depression': 1, Tinversion: 1, LVH: 'Y', 'Poor R Progression': 'Y',
      BBB: 'LBBB', FBS: 165, CR: 1.4, TG: 240, LDL: 165, HDL: 32,
      BUN: 24, ESR: 32, HB: 13.1, K: 4.4, Na: 138, WBC: 9200,
      Lymph: 22, Neut: 72, PLT: 280, 'EF-TTE': 40, 'Region RWMA': 4, VHD: 'Moderate'
    }
  },
  low_risk: {
    label: 'Patient B: Normal / Low CAD Risk',
    desc: 'Age 45, Female, Asymptomatic, Normal ECG, EF = 65%',
    values: {
      Age: 45, Weight: 60, Length: 165, Sex: 'Fmale', BMI: 22.0,
      DM: 0, HTN: 0, 'Current Smoker': 0, 'EX-Smoker': 0, FH: 0,
      Obesity: 'N', CRF: 'N', CVA: 'N', 'Airway disease': 'N',
      'Thyroid Disease': 'N', CHF: 'N', DLP: 'N', BP: 115, PR: 68,
      Edema: 0, 'Weak Peripheral Pulse': 'N', 'Lung rales': 'N',
      'Systolic Murmur': 'N', 'Diastolic Murmur': 'N', 'Typical Chest Pain': 0,
      Dyspnea: 'N', 'Function Class': 0, Atypical: 'N', Nonanginal: 'Y',
      'Exertional CP': 'N', 'LowTH Ang': 'N', 'Q Wave': 0, 'St Elevation': 0,
      'St Depression': 0, Tinversion: 0, LVH: 'N', 'Poor R Progression': 'N',
      BBB: 'N', FBS: 92, CR: 0.8, TG: 110, LDL: 95, HDL: 58,
      BUN: 12, ESR: 8, HB: 13.8, K: 4.1, Na: 141, WBC: 6200,
      Lymph: 35, Neut: 56, PLT: 220, 'EF-TTE': 65, 'Region RWMA': 0, VHD: 'N'
    }
  }
};

export function ExplainabilityPage() {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('Cath');
  const [selectedPreset, setSelectedPreset] = useState<string>('high_risk');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchMetrics(),
      postPredict(PATIENT_PRESETS[selectedPreset].values)
    ])
      .then(([metricsData, predData]) => {
        setMetrics(metricsData);
        setPrediction(predData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [selectedPreset]);

  const currentMeta = metrics?.targets?.[selectedTarget];
  
  // Get active local SHAP explanation depending on target selection
  const getActiveShapData = () => {
    if (!prediction) return undefined;
    if (selectedTarget === 'Cath') return prediction.overall_cad.shap_explanation;
    if (selectedTarget === 'LAD') return prediction.vessels.LAD.shap_explanation;
    if (selectedTarget === 'LCX') return prediction.vessels.LCX.shap_explanation;
    if (selectedTarget === 'RCA') return prediction.vessels.RCA.shap_explanation;
    return undefined;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <span>SHAP Global & Local Feature Explainability</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect game-theoretic SHAP feature attributions across all 4 target models.
        </p>
      </div>

      {/* Target Selector Tabs & Patient Preset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-2">
          {['Cath', 'LAD', 'LCX', 'RCA'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTarget(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTarget === t
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {t === 'Cath' ? 'Overall CAD' : `${t} Artery`} Target
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Patient Sample:</span>
          {Object.entries(PATIENT_PRESETS).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setSelectedPreset(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedPreset === key
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {key === 'high_risk' ? 'Patient A (High Risk)' : 'Patient B (Normal)'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-slate-900/80 p-12 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-semibold">Loading SHAP Global Feature Importance & Local Attributions...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-xl text-xs text-rose-300">
          Failed to load SHAP metadata: {error}
        </div>
      ) : (
        <ShapExplainabilityView
          targetName={selectedTarget === 'Cath' ? 'Overall CAD' : `${selectedTarget} Artery`}
          globalMetadata={currentMeta}
          shapData={getActiveShapData()}
        />
      )}
    </div>
  );
}
