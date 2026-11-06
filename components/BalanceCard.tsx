import React, { useState } from 'react';
import { Icons } from './Icons';

interface BalanceCardProps {
  balance: number;
  userName?: string;
  userLevel?: number;
  onHistoryClick?: () => void;
  onWithdrawClick?: () => void;
  onUpgradeClick?: () => void;
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Level 1 • Beginner',
  2: 'Level 2 • Scholar (Tier 2)',
  3: 'Level 3 • Master',
  4: 'Level 4 • VIP Pro'
};

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  userName = "Member", 
  userLevel = 1,
  onHistoryClick,
  onWithdrawClick,
  onUpgradeClick
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const levelName = LEVEL_NAMES[userLevel] || `Level ${userLevel}`;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    return "Good evening,";
  };

  const formatCurrency = (amount: number) => {
    if (!showBalance) return '₦ • • • • •';
    return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-4 md:p-5 border border-pink-200 shadow-sm shadow-pink-500/10 my-2">
      {/* Soft Ambient Pink & Blue Glow */}
      <div className="absolute top-0 right-4 w-40 h-40 bg-pink-200/30 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top Header Row inside Card */}
      <div className="flex justify-between items-start relative z-10 mb-3">
        <div>
          <p className="text-[11px] text-slate-500 font-medium">{getGreeting()}</p>
          <h2 className="text-sm md:text-base font-black text-slate-900 flex items-center space-x-1.5 mt-0.5">
            <span>{userName}</span>
            <span className="text-sm">👋</span>
          </h2>
          
          {/* Level Pill */}
          <button 
            onClick={onUpgradeClick}
            className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 rounded-full bg-pink-100 hover:bg-pink-200 border border-pink-200 text-[9px] font-bold text-slate-800 transition-colors active:scale-95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>{levelName}</span>
            <span className="text-[8px] text-blue-700 font-black ml-1 uppercase">Upgrade</span>
          </button>
        </div>

        {/* View Wallet Link */}
        <button 
          onClick={onHistoryClick}
          className="text-[10px] text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-1 bg-pink-50/80 px-2 py-1 rounded-lg border border-pink-200 font-bold"
        >
          <span>Wallet</span>
          <span className="text-blue-600 font-black">&gt;</span>
        </button>
      </div>

      {/* Main Balance & 3D Wallet Illustration Section */}
      <div className="flex justify-between items-end relative z-10 mt-2">
        {/* Left: Total & Available Balance */}
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Total Balance</span>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              {showBalance ? <Icons.Eye size={12} /> : <Icons.EyeOff size={12} />}
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none pt-0.5">
            {formatCurrency(balance)}
          </h1>

          <p className="text-[10px] text-slate-500 font-medium pt-0.5">
            Available: <span className="text-slate-800 font-bold">{formatCurrency(balance)}</span>
          </p>
        </div>

        {/* Right: Floating Coin Graphic + Withdraw Button (Black with touch of blue) */}
        <div className="flex flex-col items-end space-y-2">
          {/* Custom Wallet Accent Graphic */}
          <div className="relative w-16 h-12 flex items-center justify-center -mr-1">
            <div className="absolute -top-1 right-2 flex space-x-1 animate-bounce duration-1000">
              <div className="w-4 h-4 rounded-full bg-blue-600 border border-blue-400 text-white flex items-center justify-center text-[7px] font-black shadow-xs">
                ₦
              </div>
            </div>

            {/* Wallet SVG in pink/slate tones */}
            <svg className="w-14 h-10 drop-shadow-xs" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20 C10 12, 18 8, 28 8 L82 8 C90 8, 95 14, 95 22 L95 62 C95 70, 88 75, 80 75 L20 75 C10 75, 5 68, 5 58 Z" fill="#0f172a" />
              <path d="M8 25 C8 18, 15 14, 25 14 L85 14 C92 14, 98 20, 98 28 L98 65 C98 72, 91 78, 83 78 L22 78 C12 78, 8 70, 8 60 Z" fill="#1e293b" />
              <path d="M68 32 C68 28, 72 25, 78 25 L98 25 L98 52 L78 52 C72 52, 68 48, 68 42 Z" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
              <circle cx="82" cy="38" r="4" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
            </svg>
          </div>

          {/* Withdraw Button: Black with touch of blue */}
          <button 
            onClick={onWithdrawClick}
            className="btn-black-blue px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1"
          >
            <Icons.ArrowDown size={12} className="text-blue-400" strokeWidth={2.5} />
            <span>Withdraw</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
