import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { PredictorPage } from './pages/PredictorPage';
import { VisualizationPage } from './pages/VisualizationPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { MetricsPage } from './pages/MetricsPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { EducationalChatbot } from './components/EducationalChatbot';

export function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/predict" element={<PredictorPage />} />
            <Route path="/visualization" element={<VisualizationPage />} />
            <Route path="/explainability" element={<ExplainabilityPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/model-info" element={<ModelInfoPage />} />
            <Route
              path="/assistant"
              element={
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-100">Medical AI Educational Assistant</h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Evidence-grounded RAG query interface for coronary disease and SHAP explainability.
                    </p>
                  </div>
                  <EducationalChatbot />
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="border-t border-slate-800/80 bg-[#060911] py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <strong className="text-slate-300 font-semibold">CARDIOVISION X Platform</strong> — Multimodal AI Hackathon 2026 (Track A)
            </div>
            <div className="text-[11px] text-slate-600">
              Experimental Decision-Support & Educational Prototype • Not for Clinical Diagnosis
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
