import React, { useState } from 'react';
import { Heart3DViewer } from '../visualization/Heart3DViewer';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { Cpu, Info, ShieldAlert } from 'lucide-react';

export function VisualizationPage() {
  const [selectedVessel, setSelectedVessel] = useState<'LAD' | 'LCX' | 'RCA' | null>('LAD');

  // Sample default vessel state for interactive 3D exploration
  const defaultVessels = {
    LAD: { target: 'LAD', label: 'Stenotic', probability: 0.84, risk_level: 'High Risk', status_color: '#EF4444', model_used: 'RandomForest' },
    LCX: { target: 'LCX', label: 'Normal', probability: 0.42, risk_level: 'Moderate Risk', status_color: '#F59E0B', model_used: 'CatBoost' },
    RCA: { target: 'RCA', label: 'Stenotic', probability: 0.72, risk_level: 'High Risk', status_color: '#EF4444', model_used: 'GradientBoosting' },
  };

  const defaultOverall = { target: 'Cath', label: 'CAD Positive', probability: 0.92, risk_level: 'High Risk', status_color: '#EF4444', model_used: 'CatBoost' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-blue-400" />
          <span>Interactive 3D Coronary Anatomy & Spatial Risk Explorer</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rotate, zoom, and inspect individual coronary artery territories (LAD, LCX, RCA) mapped to machine learning predictions.
        </p>
      </div>

      <SafetyDisclaimer />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Heart3DViewer
            vessels={defaultVessels}
            overallCad={defaultOverall}
            selectedVessel={selectedVessel}
            onSelectVessel={(v) => setSelectedVessel(v)}
          />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Anatomical Vessel Guide</h3>

            <div className="space-y-3 text-xs">
              <div
                onClick={() => setSelectedVessel('LAD')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedVessel === 'LAD' ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>LAD — Left Anterior Descending</span>
                  <span className="text-rose-400 font-mono">84.0%</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Supplies the anterior wall of the left ventricle and interventricular septum.
                </p>
              </div>

              <div
                onClick={() => setSelectedVessel('LCX')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedVessel === 'LCX' ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>LCX — Left Circumflex</span>
                  <span className="text-amber-400 font-mono">42.0%</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Courses in the coronary sulcus, supplying the posterolateral LV wall.
                </p>
              </div>

              <div
                onClick={() => setSelectedVessel('RCA')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedVessel === 'RCA' ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span>RCA — Right Coronary Artery</span>
                  <span className="text-rose-400 font-mono">72.0%</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Supplies the right ventricle, inferior LV wall, and SA/AV conduction nodes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
