import React, { useState, useEffect } from 'react';
import { ModelMetricsResponse } from '../types';
import { fetchMetrics } from '../services/api';
import { ModelMetricsView } from '../components/ModelMetricsView';
import { BarChart2, RotateCcw, AlertTriangle } from 'lucide-react';

export function MetricsPage() {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = () => {
    setIsLoading(true);
    setError(null);
    fetchMetrics()
      .then((data) => {
        setMetrics(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="bg-slate-900/80 p-12 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-semibold">Loading validation metrics and candidate comparison data...</p>
        </div>
      ) : error ? (
        <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-rose-500/30 text-xs space-y-4 max-w-2xl mx-auto text-center">
          <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Unable to Load Validation Metrics</h3>
            <p className="text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Loading Metrics</span>
          </button>
        </div>
      ) : metrics ? (
        <ModelMetricsView metrics={metrics} />
      ) : null}
    </div>
  );
}
