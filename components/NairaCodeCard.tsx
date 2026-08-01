import React, { useState } from 'react';
import { Icons } from './Icons';
import { NairaCodeData } from '../types';
import { useAppSettings } from '../appSettings';

interface NairaCodeCardProps {
  nairaCodeObj?: NairaCodeData;
  onBuyCodeClick: () => void;
  onWithdrawClick: () => void;
}

const NairaCodeCard: React.FC<NairaCodeCardProps> = ({
  nairaCodeObj,
  onBuyCodeClick,
  onWithdrawClick
}) => {
  const settings = useAppSettings();
  const nairaCodePrice = settings.nairaCodePrice ?? 7000;
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Case 1: Active, Unused Code
  if (nairaCodeObj && !nairaCodeObj.isUsed) {
    return (
      <div className="bg-gradient-to-r from-amber-950/90 via-[#1b1509] to-[#12142e] border-2 border-amber-500/80 rounded-3xl p-5 shadow-[0_10px_30px_rgba(245,158,11,0.25)] space-y-4 my-3 relative overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Icons.Key size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">Active Naira CODE</h3>
              <p className="text-[10px] text-amber-200/80 font-medium">Approved & Ready for Withdrawal</p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider animate-pulse">
            One-Time Use
          </span>
        </div>

        {/* Big Code Box */}
        <div className="bg-[#0b0c1b]/90 border border-amber-500/50 p-4 rounded-2xl flex items-center justify-between shadow-inner relative z-10">
          <div>
            <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest block mb-0.5">
              Your One-Time Voucher CODE
            </span>
            <span className="text-xl md:text-2xl font-black font-mono text-amber-300 tracking-widest select-all">
              {nairaCodeObj.code}
            </span>
          </div>

          <button
            onClick={() => handleCopy(nairaCodeObj.code)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 shadow-md active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
            }`}
          >
            {copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}
            <span>{copied ? 'COPIED!' : 'COPY'}</span>
          </button>
        </div>

        {/* Footer & Action */}
        <div className="flex items-center justify-between pt-1 relative z-10">
          <p className="text-[10px] text-amber-200/90 font-medium flex items-center space-x-1">
            <Icons.AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
            <span>Expires after 1 successful withdrawal transaction.</span>
          </p>

          <button
            onClick={onWithdrawClick}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 uppercase tracking-wider"
          >
            Withdraw Now →
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Code Expired / Used
  if (nairaCodeObj && nairaCodeObj.isUsed) {
    return (
      <div className="bg-[#12142e] border border-slate-700/80 rounded-3xl p-4 shadow-lg flex items-center justify-between my-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
            <Icons.CheckCircle size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-xs font-black text-slate-200">Previous Naira CODE Used</h4>
              <span className="px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-800/60 text-[9px] font-mono font-bold rounded">
                EXPIRED
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Purchase a new Naira CODE for your next withdrawal.</p>
          </div>
        </div>

        <button
          onClick={onBuyCodeClick}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 uppercase tracking-wider"
        >
          Buy New Code
        </button>
      </div>
    );
  }

  // Case 3: No Naira CODE
  return (
    <div className="bg-gradient-to-r from-[#181a3d] to-[#12142e] border border-[#2b3166] rounded-3xl p-4 shadow-lg flex items-center justify-between my-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Icons.Key size={20} />
        </div>
        <div>
          <h4 className="text-xs font-black text-white">Naira CODE Required</h4>
          <p className="text-[10px] text-slate-400 font-medium">Buy a 1-time activation code to unlock withdrawals.</p>
        </div>
      </div>

      <button
        onClick={onBuyCodeClick}
        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 uppercase tracking-wider"
      >
        Get CODE (₦{nairaCodePrice.toLocaleString()})
      </button>
    </div>
  );
};

export default NairaCodeCard;
