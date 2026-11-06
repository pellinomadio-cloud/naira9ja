import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface InviteEarnProps {
  onReward: () => void;
  onBack: () => void;
}

const InviteEarn: React.FC<InviteEarnProps> = ({ onReward, onBack }) => {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const totalTasks = 5;

  useEffect(() => {
    const savedCooldown = localStorage.getItem('invite_cooldown_end');
    if (savedCooldown) {
      const endTime = parseInt(savedCooldown, 10);
      const now = Date.now();
      const remaining = Math.ceil((endTime - now) / 1000);
      
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        localStorage.removeItem('invite_cooldown_end');
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            localStorage.removeItem('invite_cooldown_end');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const handleTaskClick = (index: number) => {
    if (cooldown > 0) return;
    if (index !== completedTasks) return;

    setIsLoading(true);

    const text = encodeURIComponent("Join LearnEarn today and get ₦250,000 welcome bonus! Instant bank payouts!");
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');

    setTimeout(() => {
      const newCount = completedTasks + 1;
      setCompletedTasks(newCount);
      setIsLoading(false);

      if (newCount === totalTasks) {
        handleCompletion();
      }
    }, 1500);
  };

  const handleCompletion = () => {
    onReward();
    setCompletedTasks(0);
    const cooldownSeconds = 60;
    setCooldown(cooldownSeconds);
    const endTime = Date.now() + (cooldownSeconds * 1000);
    localStorage.setItem('invite_cooldown_end', endTime.toString());
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center p-2.5 bg-black text-white rounded-2xl mb-1 border border-blue-500/50 shadow-xs">
            <Icons.Share2 size={20} className="text-blue-400" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Invite & Earn</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Complete 5 sharing tasks to instantly receive <span className="font-bold text-slate-950">₦50,000</span> in your wallet.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-3xl p-4 text-slate-900 shadow-sm border border-pink-200 relative overflow-hidden">
         <div>
            <div className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Task Progress</p>
                    <p className="text-2xl font-black text-slate-950">{completedTasks}/{totalTasks}</p>
                </div>
                <div className="text-right">
                     <p className="text-slate-400 text-[10px] font-bold uppercase">Reward</p>
                     <p className="text-base font-bold text-blue-700">₦50,000</p>
                </div>
            </div>
            
            <div className="w-full bg-pink-100 rounded-full h-2 overflow-hidden">
                <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                ></div>
            </div>
         </div>
      </div>

      {/* Cooldown Timer */}
      {cooldown > 0 && (
         <div className="bg-pink-50 border border-pink-200 p-3 rounded-2xl flex items-center justify-center space-x-2 animate-pulse">
            <Icons.Clock className="text-blue-600" size={15} />
            <p className="text-blue-700 font-bold text-xs">
                Next tasks available in: {cooldown}s
            </p>
         </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {Array.from({ length: totalTasks }).map((_, index) => {
            const isCompleted = index < completedTasks;
            const isCurrent = index === completedTasks;

            return (
                <button
                    key={index}
                    onClick={() => handleTaskClick(index)}
                    disabled={!isCurrent || isLoading || cooldown > 0}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
                        isCompleted 
                        ? 'bg-emerald-50/50 border-emerald-300' 
                        : isCurrent && cooldown === 0
                            ? 'bg-white border-blue-500 shadow-xs' 
                            : 'bg-white/60 border-pink-100 opacity-60'
                    }`}
                >
                    <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCompleted 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isCurrent && cooldown === 0
                                ? 'bg-black text-white border border-blue-500/50' 
                                : 'bg-slate-100 text-slate-400'
                        }`}>
                            {isCompleted ? <Icons.Check size={14} /> : index + 1}
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-xs text-slate-800">
                                Share to WhatsApp Friend
                            </h4>
                            <p className="text-[10px] text-slate-400">
                                {isCompleted ? 'Completed' : 'Click to share invite link'}
                            </p>
                        </div>
                    </div>
                    
                    <div>
                         {isCurrent && isLoading ? (
                            <Icons.Sync className="animate-spin text-blue-600" size={16} />
                         ) : isCompleted ? (
                             <span className="text-[10px] font-bold text-emerald-700">Done</span>
                         ) : (
                             <Icons.MessageCircle className={`${isCurrent && cooldown === 0 ? 'text-blue-600' : 'text-slate-300'}`} size={18} />
                         )}
                    </div>
                </button>
            );
        })}
      </div>

      <button onClick={onBack} className="w-full py-2 text-slate-500 font-medium hover:text-slate-900 text-xs text-center">
        Back to Dashboard
      </button>

    </div>
  );
};

export default InviteEarn;
