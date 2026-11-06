import React from 'react';
import { Icons } from './Icons';

const PromoSection: React.FC = () => {
  return (
    <div className="space-y-3 my-3">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-2xl p-3 border border-pink-200 shadow-sm shadow-pink-500/5 hover:border-pink-300 transition-all">
          <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 mb-2 border border-pink-200">
            <Icons.Savings size={16} />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Smart Vault</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Earn up to 25% p.a.</p>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-pink-200 shadow-sm shadow-pink-500/5 hover:border-blue-300 transition-all">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-2 border border-blue-200">
            <Icons.Zap size={16} />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Learn & Grow</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Daily course payouts</p>
        </div>
      </div>
    </div>
  );
};

export default PromoSection;
