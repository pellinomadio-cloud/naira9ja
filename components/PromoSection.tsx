import React from 'react';
import { Icons } from './Icons';

const PromoSection: React.FC = () => {
  return (
    <div className="space-y-4 my-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#12142e] rounded-2xl p-4 border border-[#212552] shadow-xl hover:border-purple-500/30 transition-all">
          <div className="w-9 h-9 bg-purple-950/80 rounded-xl flex items-center justify-center text-purple-400 mb-2.5 border border-purple-800/40">
            <Icons.Savings size={20} />
          </div>
          <h4 className="text-xs font-bold text-white">Smart Vault</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Earn up to 25% p.a.</p>
        </div>
        <div className="bg-[#12142e] rounded-2xl p-4 border border-[#212552] shadow-xl hover:border-indigo-500/30 transition-all">
          <div className="w-9 h-9 bg-emerald-950/80 rounded-xl flex items-center justify-center text-emerald-400 mb-2.5 border border-emerald-800/40">
            <Icons.Zap size={20} />
          </div>
          <h4 className="text-xs font-bold text-white">Learn & Grow</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Daily course payouts</p>
        </div>
      </div>
    </div>
  );
};

export default PromoSection;
