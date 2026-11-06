import React, { useState } from 'react';
import { Icons } from './Icons';
import { NairaCodeData } from '../types';
import { useAppSettings } from '../appSettings';

interface NairaCodeCardProps {
  nairaCodeObj?: NairaCodeData;
  onBuyCodeClick: () => void;
  onWithdrawClick: () => void;
}

export const NairaCodeCard: React.FC<NairaCodeCardProps> = ({
  nairaCodeObj,
  onBuyCodeClick,
  onWithdrawClick
}) => {
  const [copied, setCopied] = useState(false);
  const settings = useAppSettings();
  const nairaCodePrice = settings.nairaCodePrice ?? 7000;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Case 1: Active Code Available and Unused
  if (nairaCodeObj && !nairaCodeObj.isUsed) {
    return (
      <div className="bg-white border border-pink-200 rounded-3xl p-3.5 shadow-sm shadow-pink-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 my-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-blue-600 shrink-0">
            <Icons.Key size={16} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Active Naira CODE</span>
              <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-mono font-black rounded-full">
                READY
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="font-mono font-black text-slate-900 text-xs tracking-wider select-all">
                {nairaCodeObj.code}
              </span>
              <button
                onClick={() => handleCopy(nairaCodeObj.code)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                title="Copy Code"
              >
                {copied ? <Icons.Check size={11} className="text-emerald-600" /> : <Icons.Copy size={11} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 self-end sm:self-center">
          <button
            onClick={() => handleCopy(nairaCodeObj.code)}
            className="px-2 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-slate-700 border border-pink-200 font-bold text-[10px] transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={onWithdrawClick}
            className="btn-black-blue px-3 py-1 rounded-xl text-[10px] font-black text-blue-300 uppercase tracking-wider flex items-center space-x-1"
          >
            <span>Withdraw →</span>
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Code Expired / Used
  if (nairaCodeObj && nairaCodeObj.isUsed) {
    return (
      <div className="bg-white border border-pink-200 rounded-3xl p-3.5 shadow-sm shadow-pink-500/5 flex items-center justify-between my-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <Icons.CheckCircle size={16} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-[11px] font-black text-slate-800">Previous Naira CODE Used</h4>
              <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 text-[8px] font-mono font-bold rounded-full">
                EXPIRED
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Purchase a new Naira CODE for your next withdrawal.</p>
          </div>
        </div>

        <button
          onClick={onBuyCodeClick}
          className="btn-black-blue px-2.5 py-1 text-[10px] font-black text-amber-300 rounded-xl uppercase tracking-wider shrink-0"
        >
          Buy New Code
        </button>
      </div>
    );
  }

  // Case 3: No Naira CODE
  return (
    <div className="bg-white border border-pink-200 rounded-3xl p-3.5 shadow-sm shadow-pink-500/5 flex items-center justify-between my-2">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-blue-600 shrink-0">
          <Icons.Key size={16} />
        </div>
        <div>
          <h4 className="text-[11px] font-black text-slate-800">Naira CODE Required</h4>
          <p className="text-[10px] text-slate-500 font-medium">Get a 1-time activation code to unlock withdrawals.</p>
        </div>
      </div>

      <button
        onClick={onBuyCodeClick}
        className="btn-black-blue px-2.5 py-1 text-[10px] font-black text-amber-300 rounded-xl uppercase tracking-wider shrink-0"
      >
        Get CODE (₦{nairaCodePrice.toLocaleString()})
      </button>
    </div>
  );
};

export default NairaCodeCard;
