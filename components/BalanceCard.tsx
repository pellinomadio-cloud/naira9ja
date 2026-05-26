import React, { useState } from 'react';
import { Icons } from './Icons';

interface BalanceCardProps {
  balance: number;
  onHistoryClick?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, onHistoryClick }) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    if (!showBalance) return '₦ • • • • •';
    return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-6 shadow-[0_10px_30px_rgba(229,57,53,0.35)] border border-red-500/20 mb-4">
      {/* Premium Glossy overlay */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400 opacity-[0.08] rounded-full blur-3xl -mr-12 -mt-12 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-white opacity-[0.03] rounded-full blur-2xl -ml-8 -mb-8"></div>
      
      {/* Decorative grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Available Balance</span>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            {showBalance ? <Icons.Eye size={16} /> : <Icons.EyeOff size={16} />}
          </button>
        </div>
        
        {/* Glowing Blue Online/Verified Badge */}
        <div className="flex items-center space-x-1.5 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="text-[9px] font-black text-cyan-300 uppercase tracking-widest">SECURE</span>
        </div>
      </div>

      <div className="flex items-baseline mb-6 relative z-10">
        <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
          {formatCurrency(balance)}
        </h1>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-white/10 relative z-10">
        <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">naira9ja Safe Vault</div>
        <button 
          onClick={onHistoryClick}
          className="text-cyan-300 text-xs font-black flex items-center hover:text-cyan-200 transition-colors drop-shadow-[0_0_4px_rgba(34,211,238,0.4)]"
        >
          View History <Icons.ChevronRight size={14} className="ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default BalanceCard;