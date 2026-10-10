import React from 'react';
import { PredictionDetail } from '../types';
import { ShieldAlert, Activity, ArrowRight, Layers } from 'lucide-react';

interface CardProps {
  title: string;
  subtitle: string;
  detail: PredictionDetail;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function PredictionCard({ title, subtitle, detail, isSelected, onSelect }: CardProps) {
  const probPct = (detail.probability * 100).toFixed(1);

  return (
    <div
      onClick={onSelect}
      className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-900/95 border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/50 scale-[1.02]'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {subtitle}
          </span>
          <h3 className="text-lg font-bold text-slate-100 mt-0.5">{title}</h3>
        </div>

        {/* Risk Badge */}
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm"
          style={{
            backgroundColor: `${detail.status_color}20`,
            color: detail.status_color,
            border: `1px solid ${detail.status_color}40`,
          }}
        >
          {detail.risk_level}
        </span>
      </div>

      {/* Main Metric Probability Bar */}
      <div className="mt-4 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-400">Predicted Probability</span>
          <span className="text-2xl font-mono font-extrabold" style={{ color: detail.status_color }}>
            {probPct}%
          </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${probPct}%`, backgroundColor: detail.status_color }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Model: <strong className="text-slate-300 font-mono">{detail.model_used}</strong></span>
        </span>

        <span className="flex items-center gap-1 font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
          <span>Inspect SHAP</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
