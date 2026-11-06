import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface RewardsProps {
  currentDay: number;
  canClaim: boolean;
  onClaim: () => void;
  lastClaimedTimestamp: number;
  onBack: () => void;
}

const Rewards: React.FC<RewardsProps> = ({ currentDay, canClaim, onClaim, lastClaimedTimestamp, onBack }) => {
  const [timeLeft, setTimeLeft] = useState('');

  // Generate days 1 to 100
  const days = Array.from({ length: 100 }, (_, i) => i + 1);

  useEffect(() => {
    if (canClaim) {
        setTimeLeft('00:00:00');
        return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const nextClaimTime = lastClaimedTimestamp + twentyFourHours;
      
      const diff = nextClaimTime - now;
      
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [canClaim, lastClaimedTimestamp]);

  const progressPercentage = Math.min(((currentDay - 1) / 100) * 100, 100);

  return (
    <div className="bg-[#fff1f5] min-h-screen animate-in fade-in duration-500 pb-16">
      <div className="px-4 py-4 space-y-4">
        
        {/* Header with Black Back Button with touch of blue */}
        <div className="flex items-center pt-1 justify-between">
            <button 
                onClick={onBack} 
                className="bg-black hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-xl flex items-center text-xs font-bold shadow-xs border border-blue-500/50 transition-colors"
            >
                 <Icons.ArrowLeft size={14} className="mr-1.5 text-blue-400" strokeWidth={2.5} /> Back
            </button>
            <h1 className="text-lg font-black text-slate-950">Daily Milestone Rewards</h1>
            <div className="w-12"></div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm shadow-pink-500/5 border border-pink-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Progress: {Math.round(progressPercentage)}%</span>
                <span className="text-slate-400 text-[11px]">{currentDay - 1}/100 days</span>
            </div>
            <div className="w-full bg-pink-100 rounded-full h-2.5 overflow-hidden">
                <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>

        {/* Action Card - Black with touch of blue */}
        <div className="bg-black rounded-3xl p-6 text-center text-white shadow-sm border border-blue-500/50 relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="mb-2 bg-slate-900 rounded-full p-2 border border-blue-500/40">
                     <Icons.Clock size={24} className="text-blue-400" />
                </div>
                
                {!canClaim ? (
                    <>
                        <p className="text-slate-300 text-xs mb-1 font-medium">Next reward available in:</p>
                        <div className="bg-slate-900 rounded-xl px-4 py-1.5 mb-2 border border-blue-500/30">
                             <h2 className="text-xl font-mono font-bold tracking-widest text-blue-300">{timeLeft}</h2>
                        </div>
                         <div className="mt-1 px-4 py-1.5 bg-slate-900 text-slate-400 font-bold text-xs rounded-xl border border-slate-800">
                            Claimed for today
                        </div>
                    </>
                ) : (
                    <div className="mb-1 w-full">
                        <p className="text-slate-300 text-xs mb-1.5 font-medium">Your daily reward is ready!</p>
                         <button 
                            onClick={onClaim}
                            className="w-full px-4 py-2.5 bg-white text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 uppercase tracking-wider"
                        >
                            <span>Ready to Claim! 🎉</span>
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-4 gap-2 pb-10">
            {days.map((day) => {
                const isClaimed = day < currentDay;
                const isCurrent = day === currentDay;
                
                return (
                    <div 
                        key={day}
                        className={`
                            aspect-[4/5] rounded-2xl flex flex-col items-center justify-center p-1 border transition-all shadow-2xs
                            ${isClaimed 
                                ? 'bg-white border-pink-200' 
                                : isCurrent && canClaim
                                    ? 'bg-white border-blue-500 shadow-xs ring-1 ring-blue-500/30' 
                                    : 'bg-pink-50/50 border-pink-100'
                            }
                        `}
                    >
                        <span className="text-[9px] font-medium text-slate-400 mb-0.5">Day {day}</span>
                        <span className={`text-[9px] font-black mb-1 ${isClaimed || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                            ₦100,000
                        </span>
                        {isClaimed && (
                            <div className="flex items-center text-[7px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                                <span>✓ Claimed</span>
                            </div>
                        )}
                         {isCurrent && !isClaimed && (
                            <span className={`text-[7px] ${canClaim ? 'bg-black text-white' : 'bg-slate-100 text-slate-400'} px-1.5 py-0.2 rounded-full font-bold uppercase`}>
                                {canClaim ? 'Ready' : 'Locked'}
                            </span>
                        )}
                        {!isClaimed && !isCurrent && (
                             <Icons.Lock size={10} className="text-slate-300" />
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
