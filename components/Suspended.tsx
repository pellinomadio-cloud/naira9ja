import React from 'react';
import { Icons } from './Icons';

interface SuspendedProps {
  onContactSupport?: () => void;
}

export const Suspended: React.FC<SuspendedProps> = ({ onContactSupport }) => {
  const currentUtcDate = "2026-07-07 11:32:15";
  const referenceCode = "N9J-SUSP-77291";

  return (
    <div className="min-h-screen bg-[#fff1f5] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient pink and blue glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-300/20 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative w-full max-w-sm bg-white rounded-3xl border border-pink-200 shadow-xl shadow-pink-500/10 p-6 text-center transition-all animate-in fade-in duration-300">
        
        {/* Animated Icon Header */}
        <div className="relative mx-auto w-14 h-14 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-rose-100 flex items-center justify-center border border-rose-200">
            <Icons.Lock className="text-rose-600" size={24} />
          </div>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-xs"></div>
        </div>

        {/* Header Section */}
        <div className="space-y-1 mb-4">
          <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-200">
            PORTAL RESTRICTED
          </span>
          <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">
            Account Suspended
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            This account is temporarily suspended by administrative review. All transactions are currently on hold.
          </p>
        </div>

        {/* Structured Administrative Info Card */}
        <div className="bg-pink-50/50 rounded-2xl p-3 border border-pink-200 text-left space-y-2 mb-4 relative">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 via-blue-500 to-rose-500 rounded-t-2xl"></div>

          <div className="flex justify-between items-center text-[10px] border-b border-pink-100 pb-1.5 pt-1">
            <span className="text-slate-500 uppercase font-bold tracking-wider">Status</span>
            <span className="flex items-center space-x-1 font-black text-rose-600 uppercase">
              <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping"></span>
              <span>ADMIN HOLD</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-[10px] border-b border-pink-100 pb-1.5">
            <span className="text-slate-500 uppercase font-bold tracking-wider">Reason Code</span>
            <span className="font-mono font-bold text-slate-800 uppercase">AUDIT_HOLD_403</span>
          </div>

          <div className="flex justify-between items-center text-[10px] border-b border-pink-100 pb-1.5">
            <span className="text-slate-500 uppercase font-bold tracking-wider">Reference</span>
            <span className="font-mono font-bold text-blue-600">{referenceCode}</span>
          </div>

          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 uppercase font-bold tracking-wider">Date</span>
            <span className="font-mono text-slate-700">{currentUtcDate}</span>
          </div>
        </div>

        {/* Action Info */}
        <div className="space-y-3">
          <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-center flex items-center space-x-2">
            <Icons.ShieldCheck className="text-blue-600 shrink-0" size={16} />
            <p className="text-[10px] text-slate-700 font-medium leading-normal text-left">
              Contact our service support team to appeal this suspension or submit required verification.
            </p>
          </div>

          {onContactSupport && (
            <button
              onClick={onContactSupport}
              className="btn-black-blue w-full py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5"
            >
              <Icons.Send size={13} className="text-blue-400" />
              <span>Contact Support Desk</span>
            </button>
          )}
        </div>

        {/* Copyright Footer */}
        <div className="mt-4 pt-3 border-t border-pink-100 flex items-center justify-center space-x-1 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
          <span>naira9ja Secure Core</span>
          <span>•</span>
          <span>© 2026</span>
        </div>
      </div>
    </div>
  );
};
