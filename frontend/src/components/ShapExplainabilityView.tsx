import React from 'react';
import { ShapExplanation, TargetMetadata } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { FileText, TrendingUp, TrendingDown, Info, HelpCircle } from 'lucide-react';

interface ShapProps {
  targetName: string;
  shapData?: ShapExplanation;
  globalMetadata?: TargetMetadata;
}

export function ShapExplainabilityView({ targetName, shapData, globalMetadata }: ShapProps) {
  if (!shapData || !shapData.available) {
    return (
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 text-center text-slate-400 space-y-2">
        <Info className="w-8 h-8 text-blue-400 mx-auto" />
        <h3 className="font-bold text-slate-200">SHAP Explanation Unavailable</h3>
        <p className="text-xs">Execute a clinical prediction first to view local SHAP feature attributions.</p>
      </div>
    );
  }

  // Format local SHAP contributions for Recharts
  const localChartData = (shapData.contributions || []).slice(0, 10).map((c) => ({
    feature: c.feature,
    shap_value: Number(c.shap_value.toFixed(4)),
    raw_val: c.value,
    effect: c.effect,
  })).reverse(); // Reverse for top-down bar chart

  // Global feature importance
  const globalChartData = (globalMetadata?.global_importance || []).slice(0, 10).map((g) => ({
    feature: g.feature,
    importance: Number(g.importance.toFixed(4)),
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Patient Local SHAP Explanation */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Local SHAP Patient Feature Attribution — {targetName}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantifies how each clinical measurement shifted the patient's predicted risk score from the baseline ({shapData.base_value ? (shapData.base_value * 100).toFixed(1) : 50}%).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Increases Risk</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Decreases Risk</span>
            </span>
          </div>
        </div>

        {/* Local SHAP Horizontal Bar Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={localChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <XAxis type="number" stroke="#64748b" tickFormatter={(v) => v.toFixed(3)} />
              <YAxis type="category" dataKey="feature" stroke="#94a3b8" tick={{ fontSize: 11 }} width={120} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1">
                        <div className="font-bold text-slate-200">{data.feature}</div>
                        <div className="text-slate-400">Measured Value: <span className="font-mono text-slate-200">{data.raw_val}</span></div>
                        <div className="text-slate-400">
                          SHAP Impact:{' '}
                          <span className={data.shap_value > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {data.shap_value > 0 ? `+${data.shap_value}` : data.shap_value}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
              <Bar dataKey="shap_value" radius={[0, 4, 4, 0]}>
                {localChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.shap_value > 0 ? '#EF4444' : '#10B981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Drivers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Top Risk Increasing Drivers */}
          <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wide">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span>Top Risk-Increasing Drivers</span>
            </h4>
            <div className="space-y-1.5">
              {(shapData.top_positive || []).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                  <span className="font-semibold">{p.feature} = {p.value}</span>
                  <span className="font-mono font-bold text-rose-400">+{p.shap_value.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Risk Reducing Drivers */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span>Top Protective / Risk-Decreasing Drivers</span>
            </h4>
            <div className="space-y-1.5">
              {(shapData.top_negative || []).map((n, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg">
                  <span className="font-semibold">{n.feature} = {n.value}</span>
                  <span className="font-mono font-bold text-emerald-400">{n.shap_value.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global SHAP Feature Importance */}
      {globalChartData.length > 0 && (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Global Model Feature Importance (Mean |SHAP|) — {targetName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reflects the overall predictive power of clinical features across the validation dataset.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={globalChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" />
                <YAxis type="category" dataKey="feature" stroke="#94a3b8" tick={{ fontSize: 11 }} width={120} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-200">
                          <strong>{payload[0].payload.feature}</strong>: Mean |SHAP| = {payload[0].payload.importance}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="importance" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
