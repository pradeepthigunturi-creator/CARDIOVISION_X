import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Layers, Cpu, BarChart2, ShieldCheck, HelpCircle, FileText } from 'lucide-react';

export function Navbar() {
  const navItems = [
    { to: '/', label: 'Overview', icon: Activity },
    { to: '/predict', label: 'Clinical Predictor', icon: Layers },
    { to: '/visualization', label: '3D Coronary View', icon: Cpu },
    { to: '/explainability', label: 'SHAP Explainability', icon: FileText },
    { to: '/metrics', label: 'Model Performance', icon: BarChart2 },
    { to: '/model-info', label: 'Pipeline & Leakage Audit', icon: ShieldCheck },
    { to: '/assistant', label: 'Medical AI Assistant', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080C14]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                CARDIOVISION <span className="text-blue-500">X</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Coronary Intelligence Platform
              </span>
            </div>
          </NavLink>

          {/* Nav links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
