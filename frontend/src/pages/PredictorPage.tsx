import React, { useState, useEffect } from 'react';
import { FeatureMeta, PredictionResponse } from '../types';
import { fetchFeatures, postPredict } from '../services/api';
import { ClinicalInputForm } from '../components/ClinicalInputForm';
import { PredictionCard } from '../components/PredictionCard';
import { Heart3DViewer } from '../visualization/Heart3DViewer';
import { ShapExplainabilityView } from '../components/ShapExplainabilityView';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';
import { Activity, AlertTriangle, Layers, Info } from 'lucide-react';

export function PredictorPage() {
  const [features, setFeatures] = useState<FeatureMeta[]>([]);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<'LAD' | 'LCX' | 'RCA' | null>('LAD');

  useEffect(() => {
    fetchFeatures()
      .then((data) => setFeatures(data.features))
      .catch((err) => setError(err.message));
  }, []);

  const handlePredict = async (formData: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await postPredict(formData);
      setPrediction(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const activeVesselPrediction = selectedVessel && prediction ? prediction.vessels[selectedVessel] : null;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-400" />
          <span>Clinical CAD & Multi-vessel Risk Predictor</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit patient parameters to run 4 independent prediction pipelines for CAD, LAD, LCX, and RCA.
        </p>
      </div>

      <SafetyDisclaimer />

      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 p-4 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Input Form on left/top, 3D heart on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ClinicalInputForm features={features} onSubmit={handlePredict} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Heart3DViewer
            vessels={prediction?.vessels}
            overallCad={prediction?.overall_cad}
            selectedVessel={selectedVessel}
            onSelectVessel={(v) => setSelectedVessel(v)}
          />

          {prediction?.warnings && prediction.warnings.length > 0 && (
            <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/30 text-xs space-y-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Physiological Data Quality Warnings</span>
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                {prediction.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Predictions Section */}
      {prediction && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Multi-Target Inference Results</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Inference Latency: <strong>{prediction.execution_time_ms} ms</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PredictionCard
              title="Overall CAD Status"
              subtitle="Catheterization Target"
              detail={prediction.overall_cad}
              isSelected={selectedVessel === null}
              onSelect={() => setSelectedVessel(null)}
            />

            <PredictionCard
              title="LAD Vessel Risk"
              subtitle="Left Anterior Descending"
              detail={prediction.vessels.LAD}
              isSelected={selectedVessel === 'LAD'}
              onSelect={() => setSelectedVessel('LAD')}
            />

            <PredictionCard
              title="LCX Vessel Risk"
              subtitle="Left Circumflex Artery"
              detail={prediction.vessels.LCX}
              isSelected={selectedVessel === 'LCX'}
              onSelect={() => setSelectedVessel('LCX')}
            />

            <PredictionCard
              title="RCA Vessel Risk"
              subtitle="Right Coronary Artery"
              detail={prediction.vessels.RCA}
              isSelected={selectedVessel === 'RCA'}
              onSelect={() => setSelectedVessel('RCA')}
            />
          </div>

          {/* Active SHAP Section */}
          <div className="pt-4">
            {selectedVessel && activeVesselPrediction ? (
              <ShapExplainabilityView
                targetName={`${selectedVessel} Artery`}
                shapData={activeVesselPrediction.shap_explanation}
              />
            ) : (
              <ShapExplainabilityView
                targetName="Overall CAD Status"
                shapData={prediction.overall_cad.shap_explanation}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
