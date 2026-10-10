import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function SafetyDisclaimer() {
  return (
    <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm text-amber-200/90 text-xs shadow-lg">
      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold text-amber-300 mr-1.5 uppercase tracking-wide">
          Medical & Clinical Safety Notice:
        </span>
        CARDIOVISION X is an experimental AI decision-support and educational prototype. Its predictions and 3D visualizations are not a medical diagnosis and must not replace clinical evaluation, validated diagnostic imaging, or advice from qualified healthcare professionals.
      </div>
    </div>
  );
}
