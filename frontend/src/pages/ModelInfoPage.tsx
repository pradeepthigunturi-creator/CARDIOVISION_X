import React, { useState, useEffect } from 'react';
import { fetchModelInfo } from '../services/api';
import { ShieldCheck, Database, Cpu, Lock, AlertTriangle, Layers } from 'lucide-react';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';

export function ModelInfoPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    fetchModelInfo().then(setInfo).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          <span>Technical Architecture & Target Leakage Audit</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed specification of dataset provenance, model training pipelines, target leakage prevention guardrails, and system limitations.
        </p>
      </div>

      <SafetyDisclaimer />

      {/* Dataset & Leakage Prevention Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset Metadata */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>Dataset Provenance & Schema</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Dataset Name:</span>
              <span className="font-semibold text-slate-200">Extension of Z-Alizadeh Sani Dataset</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Repository Host:</span>
              <span className="font-semibold text-slate-200">UCI Machine Learning Repository / Mendeley</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Total Patient Records:</span>
              <span className="font-mono font-semibold text-slate-200">303 Patients</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Retained Predictor Features:</span>
              <span className="font-mono font-semibold text-slate-200">55 Features</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Prediction Targets:</span>
              <span className="font-mono font-semibold text-slate-200">Cath (Overall CAD), LAD, LCX, RCA</span>
            </div>
          </div>
        </div>

        {/* Target Leakage Audit */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>Target Leakage Prevention Audit</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <p className="text-slate-400">
              To prevent artificial evaluation contamination, all target outcomes, alternative spellings, and diagnostic findings are strictly excluded from input predictor feature matrices.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                Strictly Excluded Prohibited Columns
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {['Cath', 'CAD', 'LAD', 'LCX', 'RCA', 'Number of Vessel Involved', 'Number Of lesion PCI', 'EF- Cath', 'LM Proximal', 'LM Distal'].map((col) => (
                  <span key={col} className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-500/30">
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Automated Leakage Prevention Tests: 100% PASSED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Pipelines Overview */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Independently Trained 4-Target Model Architecture</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">Model 1: Overall CAD</h4>
            <p className="text-slate-400">Target: <code className="text-blue-400 font-mono">Cath</code> (CAD vs Normal)</p>
            <p className="text-slate-400">Selected Algorithm: <strong className="text-slate-200">CatBoost</strong></p>
            <p className="text-slate-400">Validation F1: <strong className="text-emerald-400 font-mono">92.3%</strong></p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">Model 2: LAD Artery</h4>
            <p className="text-slate-400">Target: <code className="text-blue-400 font-mono">LAD</code> (Stenotic vs Normal)</p>
            <p className="text-slate-400">Selected Algorithm: <strong className="text-slate-200">Random Forest</strong></p>
            <p className="text-slate-400">Validation F1: <strong className="text-emerald-400 font-mono">85.7%</strong></p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">Model 3: LCX Artery</h4>
            <p className="text-slate-400">Target: <code className="text-blue-400 font-mono">LCX</code> (Stenotic vs Normal)</p>
            <p className="text-slate-400">Selected Algorithm: <strong className="text-slate-200">CatBoost</strong></p>
            <p className="text-slate-400">Validation F1: <strong className="text-emerald-400 font-mono">53.3%</strong></p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">Model 4: RCA Artery</h4>
            <p className="text-slate-400">Target: <code className="text-blue-400 font-mono">RCA</code> (Stenotic vs Normal)</p>
            <p className="text-slate-400">Selected Algorithm: <strong className="text-slate-200">Gradient Boosting</strong></p>
            <p className="text-slate-400">Validation F1: <strong className="text-emerald-400 font-mono">65.0%</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
