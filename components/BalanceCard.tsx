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
  2: 'Level 2 • Scholar',
  3: 'Level 3 • Master',
  4: 'Level 4 • VIP Pro'
};

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  userName = "Omale Justina", 
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131535] to-[#0f112a] p-5 md:p-6 border border-[#232752] shadow-[0_15px_35px_rgba(0,0,0,0.5)] my-3">
      {/* Glow Effects */}
      <div className="absolute top-0 right-10 w-44 h-44 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

      {/* Top Header Row inside Card */}
      <div className="flex justify-between items-start relative z-10 mb-4">
        <div>
          <p className="text-xs text-slate-400 font-medium">{getGreeting()}</p>
          <h2 className="text-xl font-bold text-white flex items-center space-x-1.5 mt-0.5">
            <span>{userName}</span>
            <span className="text-xl">👋</span>
          </h2>
          
          {/* Level Pill */}
          <button 
            onClick={onUpgradeClick}
            className="inline-flex items-center space-x-1 mt-2 px-2.5 py-0.5 rounded-full bg-[#20224a] hover:bg-[#2c2f66] border border-[#313570] text-[10px] font-semibold text-purple-300 transition-colors active:scale-95"
          >
            <span className="text-amber-400">⭐</span>
            <span>{levelName}</span>
            <span className="text-[9px] text-purple-400 font-extrabold ml-1 uppercase">Upgrade</span>
          </button>
        </div>

        {/* View Wallet Link */}
        <button 
          onClick={onHistoryClick}
          className="text-xs text-slate-300 hover:text-purple-300 transition-colors flex items-center space-x-1 bg-[#1a1c40]/80 px-2.5 py-1 rounded-lg border border-[#2b2f63]"
        >
          <span>View Wallet</span>
          <span className="text-purple-400 font-bold">&gt;</span>
        </button>
      </div>

      {/* Main Balance & 3D Wallet Illustration Section */}
      <div className="flex justify-between items-end relative z-10 mt-3">
        {/* Left: Total & Available Balance */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium">
            <span>Total Balance</span>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {showBalance ? <Icons.Eye size={15} /> : <Icons.EyeOff size={15} />}
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none pt-1">
            {formatCurrency(balance)}
          </h1>

          <p className="text-xs text-slate-400 font-medium pt-1">
            Available Balance: <span className="text-slate-200 font-bold">{formatCurrency(balance)}</span>
          </p>
        </div>

        {/* Right: 3D Wallet & Floating Coins Graphic + Withdraw Button */}
        <div className="flex flex-col items-end space-y-3">
          {/* Custom SVG Wallet Illustration matching screenshot */}
          <div className="relative w-24 h-20 flex items-center justify-center -mr-1 -mb-1">
            {/* Background ambient glow */}
            <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full"></div>

            {/* Glowing Coins Floating */}
            <div className="absolute -top-1 right-2 flex space-x-1 animate-bounce duration-1000">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border border-yellow-200 shadow-[0_0_10px_rgba(234,179,8,0.7)] flex items-center justify-center text-[9px] font-black text-amber-950">
                ₦
              </div>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 border border-yellow-200 shadow-[0_0_8px_rgba(245,158,11,0.6)] flex items-center justify-center text-[8px] font-black text-amber-950 -mt-2">
                ₦
              </div>
            </div>

            {/* 3D Wallet SVG */}
            <svg className="w-20 h-16 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Back flap */}
              <path d="M10 20 C10 12, 18 8, 28 8 L82 8 C90 8, 95 14, 95 22 L95 62 C95 70, 88 75, 80 75 L20 75 C10 75, 5 68, 5 58 Z" fill="#4c1d95" />
              {/* Wallet Main Body */}
              <path d="M8 25 C8 18, 15 14, 25 14 L85 14 C92 14, 98 20, 98 28 L98 65 C98 72, 91 78, 83 78 L22 78 C12 78, 8 70, 8 60 Z" fill="url(#walletGradient)" />
              {/* Wallet Strap */}
              <path d="M68 32 C68 28, 72 25, 78 25 L98 25 L98 52 L78 52 C72 52, 68 48, 68 42 Z" fill="#6d28d9" stroke="#8b5cf6" strokeWidth="1.5" />
              {/* Strap Gold Button */}
              <circle cx="82" cy="38" r="4.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1" />
              <defs>
                <linearGradient id="walletGradient" x1="8" y1="14" x2="98" y2="78" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6d28d9" />
                  <stop offset="1" stopColor="#3b0764" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Withdraw Button */}
          <button 
            onClick={onWithdrawClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-bold text-xs flex items-center space-x-1.5 shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all border border-indigo-400/30"
          >
            <Icons.ArrowDown size={14} strokeWidth={2.5} />
            <span>Withdraw</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
