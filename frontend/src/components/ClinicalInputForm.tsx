import React, { useState } from 'react';
import { FeatureMeta } from '../types';
import { Play, RotateCcw, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormProps {
  features: FeatureMeta[];
  onSubmit: (formData: Record<string, any>) => void;
  isLoading: boolean;
}

// Pre-configured Clinical Patient Presets
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
  },
  borderline: {
    label: 'Patient C: Moderate / Borderline Stenosis Risk',
    desc: 'Age 58, Male, Dyslipidemia, Mild ST Depression, EF = 50%',
    values: {
      Age: 58, Weight: 76, Length: 168, Sex: 'Male', BMI: 26.9,
      DM: 0, HTN: 1, 'Current Smoker': 0, 'EX-Smoker': 1, FH: 1,
      Obesity: 'Y', CRF: 'N', CVA: 'N', 'Airway disease': 'N',
      'Thyroid Disease': 'N', CHF: 'N', DLP: 'Y', BP: 132, PR: 74,
      Edema: 0, 'Weak Peripheral Pulse': 'N', 'Lung rales': 'N',
      'Systolic Murmur': 'N', 'Diastolic Murmur': 'N', 'Typical Chest Pain': 0,
      Dyspnea: 'N', 'Function Class': 1, Atypical: 'Y', Nonanginal: 'N',
      'Exertional CP': 'N', 'LowTH Ang': 'N', 'Q Wave': 0, 'St Elevation': 0,
      'St Depression': 1, Tinversion: 0, LVH: 'N', 'Poor R Progression': 'N',
      BBB: 'N', FBS: 118, CR: 1.0, TG: 175, LDL: 135, HDL: 40,
      BUN: 16, ESR: 16, HB: 14.5, K: 4.3, Na: 140, WBC: 7400,
      Lymph: 30, Neut: 62, PLT: 245, 'EF-TTE': 50, 'Region RWMA': 1, VHD: 'mild'
    }
  }
};

export function ClinicalInputForm({ features, onSubmit, isLoading }: FormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    features.forEach((f) => {
      initial[f.name] = f.default;
    });
    return initial;
  });

  const [activeTab, setActiveTab] = useState<string>('Demographic');

  const categories = ['Demographic', 'Medical History', 'Clinical Examination', 'Symptoms', 'ECG Findings', 'Laboratory Measurements', 'Echocardiography'];

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPreset = (presetKey: string) => {
    const preset = PATIENT_PRESETS[presetKey];
    if (preset) {
      setFormData((prev) => ({ ...prev, ...preset.values }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <span>Clinical Patient Input Specification</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure 55 non-invasive clinical, ECG, and echocardiographic parameters. Target features are strictly excluded.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Presets:</span>
          {Object.entries(PATIENT_PRESETS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleApplyPreset(key)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 transition-colors"
              title={p.desc}
            >
              {p.label.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 border-b border-slate-800 pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveTab(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === cat
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto pr-1">
        {features
          .filter((f) => f.category === activeTab)
          .map((f) => {
            const val = formData[f.name] ?? f.default;

            return (
              <div key={f.name} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5 hover:border-slate-700 transition-colors">
                <label className="text-xs font-semibold text-slate-300 flex justify-between">
                  <span>{f.label || f.name}</span>
                  {f.unit && <span className="text-[10px] text-slate-500 font-normal">{f.unit}</span>}
                </label>

                {f.type === 'binary' ? (
                  <select
                    value={val}
                    onChange={(e) => handleChange(f.name, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={1}>Yes / Positive (1)</option>
                    <option value={0}>No / Negative (0)</option>
                  </select>
                ) : f.type === 'categorical' && f.options ? (
                  <select
                    value={val}
                    onChange={(e) => handleChange(f.name, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {f.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    step={f.name === 'CR' || f.name === 'K' || f.name === 'BMI' ? '0.1' : '1'}
                    min={f.min}
                    max={f.max}
                    value={val}
                    onChange={(e) => handleChange(f.name, parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                )}
              </div>
            );
          })}
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            const initial: Record<string, any> = {};
            features.forEach((f) => { initial[f.name] = f.default; });
            setFormData(initial);
          }}
          className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Risk Pipelines...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Execute 4-Target Inference</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
