import React from 'react';
import { ModelMetricsResponse } from '../types';
import { BarChart2, CheckCircle2, AlertCircle, Award, ShieldCheck } from 'lucide-react';

interface MetricsProps {
  metrics: ModelMetricsResponse;
}

export function ModelMetricsView({ metrics }: MetricsProps) {
  const targets = Object.keys(metrics.targets || {});

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-slate-100">Model Evaluation & Validation Metrics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Independently evaluated across 4 classification targets using Stratified 80/20 train-test splits and held-out test data.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block">Dataset Records:</span>
            <span className="font-mono font-bold text-slate-200">{metrics.dataset_info?.total_records}</span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-500 block">Validation Split:</span>
            <span className="font-mono font-bold text-slate-200">80/20 Stratified</span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-slate-500 block">Random Seed:</span>
            <span className="font-mono font-bold text-slate-200">{metrics.dataset_info?.seed}</span>
          </div>
        </div>
      </div>

      {/* Target Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {targets.map((targetKey) => {
          const tData = metrics.targets[targetKey];
          const finalM = tData.final_metrics;
          const candidates = tData.candidate_evaluations || {};

          return (
            <div key={targetKey} className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5">
              {/* Target Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Prediction Target
                  </span>
                  <h3 className="text-lg font-bold text-slate-100">{tData.target} Pipeline</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Selected Model</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    {tData.selected_model}
                  </span>
                </div>
              </div>

              {/* Main Metric Badges */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Accuracy</div>
                  <div className="text-base font-mono font-bold text-blue-400">
                    {(finalM.accuracy * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Precision</div>
                  <div className="text-base font-mono font-bold text-indigo-400">
                    {(finalM.precision * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Recall</div>
                  <div className="text-base font-mono font-bold text-cyan-400">
                    {(finalM.recall * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">F1 Score</div>
                  <div className="text-base font-mono font-bold text-emerald-400">
                    {(finalM.f1 * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* ROC-AUC & Confusion Matrix Section */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Confusion Matrix Table */}
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-slate-300 block">Confusion Matrix (Held-out Test)</span>
                  <div className="grid grid-cols-2 gap-1.5 text-center font-mono">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">TN (True Neg)</span>
                      <span className="text-slate-200 font-bold">{finalM.confusion_matrix.tn}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-rose-400 block">FP (False Pos)</span>
                      <span className="text-rose-400 font-bold">{finalM.confusion_matrix.fp}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-amber-400 block">FN (False Neg)</span>
                      <span className="text-amber-400 font-bold">{finalM.confusion_matrix.fn}</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-emerald-400 block">TP (True Pos)</span>
                      <span className="text-emerald-400 font-bold">{finalM.confusion_matrix.tp}</span>
                    </div>
                  </div>
                </div>

                {/* ROC-AUC Stats */}
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 text-xs flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-300 block">ROC-AUC Performance</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Evaluates rank discrimination across classification thresholds.
                    </p>
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-blue-400 mt-2">
                    {finalM.roc_auc ? (finalM.roc_auc * 100).toFixed(1) + '%' : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Candidate Model Comparison Table */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-300 block">Candidate Models Comparison</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-semibold text-[10px] uppercase">
                        <th className="py-1.5 px-2">Algorithm</th>
                        <th className="py-1.5 px-2">Accuracy</th>
                        <th className="py-1.5 px-2">F1 Score</th>
                        <th className="py-1.5 px-2">ROC-AUC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(candidates).map(([cName, cMetrics]) => (
                        <tr
                          key={cName}
                          className={`border-b border-slate-800/40 ${
                            cName === tData.selected_model ? 'bg-blue-600/10 font-bold text-blue-300' : ''
                          }`}
                        >
                          <td className="py-1.5 px-2 flex items-center gap-1.5">
                            {cName === tData.selected_model && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                            <span>{cName}</span>
                          </td>
                          <td className="py-1.5 px-2 font-mono">{(cMetrics.accuracy * 100).toFixed(1)}%</td>
                          <td className="py-1.5 px-2 font-mono">{(cMetrics.f1 * 100).toFixed(1)}%</td>
                          <td className="py-1.5 px-2 font-mono">
                            {cMetrics.roc_auc ? (cMetrics.roc_auc * 100).toFixed(1) + '%' : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
