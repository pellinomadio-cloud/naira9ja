import React from 'react';
import { Icons } from './Icons';

export const MaintenanceScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fff1f5] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Ambient Pink & Blue Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-pink-300/25 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[280px] h-[280px] bg-blue-400/15 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative w-full max-w-sm bg-white rounded-3xl border border-pink-200 shadow-xl shadow-pink-500/10 p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-blue-600 to-pink-400"></div>

        {/* Maintenance Icon Header */}
        <div className="relative mx-auto w-14 h-14 flex items-center justify-center pt-1">
          <div className="absolute inset-0 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center shadow-xs">
            <Icons.Settings className="text-blue-600 animate-spin" style={{ animationDuration: '8s' }} size={26} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black border border-blue-400 flex items-center justify-center text-[9px] font-black text-amber-300 shadow-xs">
            !
          </div>
        </div>

        {/* Title & Status Badge */}
        <div className="space-y-1.5">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-pink-100 text-pink-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-pink-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
            <span>System Maintenance Active</span>
          </span>

          <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">
            App Under Maintenance
          </h1>

          <p className="text-xs text-slate-600 leading-relaxed font-medium px-1">
            We are currently performing scheduled system upgrades and security maintenance. Access to the dashboard, login, and registration is temporarily locked.
          </p>
        </div>

        {/* Maintenance Details Card */}
        <div className="bg-pink-50/60 rounded-2xl p-3.5 border border-pink-200 text-left space-y-2 relative">
          <div className="flex justify-between items-center text-[10px] border-b border-pink-100 pb-1.5">
            <span className="text-slate-500 uppercase font-bold tracking-wider">Portal Status</span>
            <span className="flex items-center space-x-1 font-black text-rose-600 uppercase">
              <Icons.Lock size={11} />
              <span>TEMPORARILY LOCKED</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-[10px] border-b border-pink-100 pb-1.5">
            <span className="text-slate-500 uppercase font-bold tracking-wider">Dashboard & Auth</span>
            <span className="font-mono font-bold text-slate-800 uppercase">OFFLINE FOR UPGRADE</span>
          </div>

          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 uppercase font-bold tracking-wider">User Balances & Data</span>
            <span className="font-mono font-bold text-blue-600 uppercase">100% SECURED</span>
          </div>
        </div>

        {/* Security Assurance Notice */}
        <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-start space-x-2 text-left">
          <Icons.ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={15} />
          <p className="text-[10px] text-slate-700 font-semibold leading-snug">
            All user accounts, wallet funds, and pending transactions remain safely stored. The platform will reopen automatically once maintenance is completed.
          </p>
        </div>

        {/* Locked Indicator Button (Black with touch of blue & non-white clear text) */}
        <div className="pt-1">
          <div className="w-full py-2.5 px-4 bg-black border border-blue-500/60 shadow-[0_2px_10px_rgba(37,99,235,0.25)] rounded-xl flex items-center justify-center space-x-2 cursor-not-allowed">
            <Icons.Lock size={13} className="text-sky-400" />
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-300">
              Maintenance in Progress • Please Check Back
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-pink-100 flex items-center justify-center space-x-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
          <span>LearnEarn Core</span>
          <span>•</span>
          <span>System Upgrade Mode</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceScreen;
