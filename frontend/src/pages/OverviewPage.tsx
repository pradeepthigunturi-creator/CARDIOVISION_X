import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Layers, Cpu, FileText, BarChart2, ShieldCheck, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { SafetyDisclaimer } from '../components/SafetyDisclaimer';

export function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 p-8 md:p-10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multimodal AI Hackathon 2026 — Track A</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            CARDIOVISION <span className="text-blue-500">X</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Explainable AI-Powered Coronary Intelligence and Interactive 3D Coronary Visualization Platform.
            Predicts overall Coronary Artery Disease (CAD) and vessel-specific stenosis for the <strong className="text-blue-400">LAD</strong>, <strong className="text-blue-400">LCX</strong>, and <strong className="text-blue-400">RCA</strong> arteries using 55 non-invasive clinical parameters.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <NavLink
              to="/predict"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Launch Clinical Predictor</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>

            <NavLink
              to="/visualization"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Explore 3D Coronary Anatomy</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Medical Safety Disclaimer */}
      <SafetyDisclaimer />

      {/* Core Objectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-bold text-slate-100 text-base">4-Target ML Pipelines</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Trains four independent machine learning classifiers for Overall CAD, LAD, LCX, and RCA vessel stenosis using CatBoost, Random Forest, and Gradient Boosting.
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="font-bold text-slate-100 text-base">Strict Target Leakage Prevention</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated guardrails enforce strict exclusion of outcome columns (<code className="text-slate-300 font-mono">Cath, LAD, LCX, RCA</code>) from input predictor matrices to prevent evaluation contamination.
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="font-bold text-slate-100 text-base">SHAP Model Explainability</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Computes local patient SHAP feature attributions and global feature importance rankings to clarify how each clinical parameter influences risk predictions.
          </p>
        </div>
      </div>
    </div>
  );
}
