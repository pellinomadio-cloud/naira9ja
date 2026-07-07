import React from 'react';
import { Icons } from './Icons';

interface SuspendedProps {
  onContactSupport?: () => void;
}

export const Suspended: React.FC<SuspendedProps> = ({ onContactSupport }) => {
  const currentUtcDate = "2026-07-07 11:32:15"; // Static or dynamic placeholder matching requested date
  const referenceCode = "N9J-SUSP-77291";

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Red Radial Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      {/* Glowing Blue Ambient Accent */}
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Decorative Grid Gridline Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-white rounded-3xl border border-red-200/60 shadow-[0_15px_40px_rgba(239,68,68,0.08),0_0_25px_rgba(6,182,212,0.12)] p-6 md:p-8 text-center transition-all animate-in fade-in duration-500">
        
        {/* Animated Icon Header */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          {/* Glowing Blue Outer Ring */}
          <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping opacity-75"></div>
          {/* Crimson Red Inner Ring */}
          <div className="absolute inset-2 rounded-full bg-red-100 flex items-center justify-center border border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Icons.Lock className="text-red-600 animate-bounce" size={32} strokeWidth={2.5} />
          </div>
          {/* Miniature glowing blue indicator */}
          <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></div>
        </div>

        {/* Header Section */}
        <div className="space-y-2 mb-6">
          <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-full border border-red-200 shadow-[0_2px_8px_rgba(239,68,68,0.05)]">
            PORTAL RESTRICTED
          </span>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight uppercase">
            Account Suspended
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed font-medium">
            This platform has been temporarily suspended by the administration. All pending activities and transactions are currently on hold.
          </p>
        </div>

        {/* Structured Administrative Info Card */}
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 text-left space-y-3 mb-6 relative">
          {/* Glowing blue accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-cyan-400 to-red-600 rounded-t-2xl"></div>

          <div className="flex justify-between items-center text-xs border-b border-neutral-200/50 pb-2 pt-1">
            <span className="text-neutral-400 uppercase font-bold tracking-wider">Status Type</span>
            <span className="flex items-center space-x-1 font-black text-red-600 uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
              <span>ADMIN LOCK</span>
            </span>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-neutral-200/50 pb-2">
            <span className="text-neutral-400 uppercase font-bold tracking-wider">Reason Code</span>
            <span className="font-mono font-bold text-neutral-700 uppercase tracking-tighter">
              AUDIT_HOLD_403
            </span>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-neutral-200/50 pb-2">
            <span className="text-neutral-400 uppercase font-bold tracking-wider">System Reference</span>
            <span className="font-mono font-bold text-cyan-600 uppercase tracking-tighter drop-shadow-[0_0_2px_rgba(6,182,212,0.2)]">
              {referenceCode}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-400 uppercase font-bold tracking-wider">Suspended Date</span>
            <span className="font-mono font-bold text-neutral-600">
              {currentUtcDate} UTC
            </span>
          </div>
        </div>

        {/* Guidance and Action Info */}
        <div className="space-y-4">
          <div className="p-3.5 bg-cyan-950/5 rounded-xl border border-cyan-400/20 text-center flex items-start space-x-2.5">
            <Icons.ShieldCheck className="text-cyan-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-[11px] text-neutral-600 font-bold leading-normal text-left">
              Your security and asset insurance are fully protected under our system security and audit rules.
            </p>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-center space-x-1.5 text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
          <span>naira9ja Secure Core</span>
          <span>•</span>
          <span>© 2026 All Rights Reserved</span>
        </div>
      </div>
    </div>
  );
};
