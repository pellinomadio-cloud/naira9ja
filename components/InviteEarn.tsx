
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

  // Check for existing cooldown on mount
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

  // Timer effect
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
    if (index !== completedTasks) return; // Enforce sequential order

    setIsLoading(true);

    // Construct WhatsApp share link with updated URL
    const text = encodeURIComponent("Join naira9ja today and get ₦10,000 welcome bonus! Join here: https://naira9ja.top");
    const url = `https://wa.me/?text=${text}`;
    
    // Open WhatsApp
    window.open(url, '_blank');

    // Simulate verification delay
    setTimeout(() => {
      const newCount = completedTasks + 1;
      setCompletedTasks(newCount);
      setIsLoading(false);

      // Check if all tasks completed
      if (newCount === totalTasks) {
        handleCompletion();
      }
    }, 2000);
  };

  const handleCompletion = () => {
    // Award reward
    onReward();
    
    // Reset tasks
    setCompletedTasks(0);
    
    // Set 60s cooldown
    const cooldownSeconds = 60;
    setCooldown(cooldownSeconds);
    const endTime = Date.now() + (cooldownSeconds * 1000);
    localStorage.setItem('invite_cooldown_end', endTime.toString());
  };

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-green-neon/10 rounded-full text-green-neon mb-2">
            <Icons.Share2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">Invite & Earn</h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Complete 5 sharing tasks to instantly receive <span className="font-bold text-green-neon">₦50,000</span> in your wallet.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-green-neon to-green-dark rounded-2xl p-6 text-black shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-full -mr-10 -mt-10"></div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-black/60 text-xs font-bold uppercase">Task Progress</p>
                    <p className="text-3xl font-black">{completedTasks}/{totalTasks}</p>
                </div>
                <div className="text-right">
                     <p className="text-black/60 text-xs font-bold uppercase">Reward</p>
                     <p className="text-xl font-bold">₦50,000</p>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-black/20 rounded-full h-3">
                <div 
                    className="bg-black h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                ></div>
            </div>
         </div>
      </div>

      {/* Cooldown Timer */}
      {cooldown > 0 && (
         <div className="bg-green-neon/5 border border-green-neon/20 p-4 rounded-xl flex items-center justify-center space-x-3 animate-pulse">
            <Icons.Clock className="text-green-neon" />
            <p className="text-green-neon font-bold">
                Next tasks available in: {cooldown}s
            </p>
         </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {Array.from({ length: totalTasks }).map((_, index) => {
            const isCompleted = index < completedTasks;
            const isCurrent = index === completedTasks;
            const isLocked = index > completedTasks || cooldown > 0;

            return (
                <button
                    key={index}
                    onClick={() => handleTaskClick(index)}
                    disabled={!isCurrent || isLoading || cooldown > 0}
                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all duration-200 ${
                        isCompleted 
                        ? 'bg-green-neon/5 border-green-neon' 
                        : isCurrent && cooldown === 0
                            ? 'bg-gray-900 border-green-neon shadow-md transform scale-[1.02]' 
                            : 'bg-gray-900/50 border-gray-800 opacity-70'
                    }`}
                >
                    <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isCompleted 
                            ? 'bg-green-neon text-black' 
                            : isCurrent && cooldown === 0
                                ? 'bg-green-neon text-black' 
                                : 'bg-gray-800 text-gray-500'
                        }`}>
                            {isCompleted ? <Icons.Check size={20} /> : index + 1}
                        </div>
                        <div className="text-left">
                            <h4 className={`font-bold text-sm ${isCompleted ? 'text-green-neon' : 'text-white'}`}>
                                Share to WhatsApp Friend
                            </h4>
                            <p className="text-xs text-gray-500">
                                {isCompleted ? 'Completed' : 'Click to share invite link'}
                            </p>
                        </div>
                    </div>
                    
                    <div>
                         {isCurrent && isLoading ? (
                            <Icons.Sync className="animate-spin text-green-neon" size={20} />
                         ) : isCompleted ? (
                             <span className="text-xs font-bold text-green-neon">Done</span>
                         ) : (
                             <Icons.MessageCircle className={`${isCurrent && cooldown === 0 ? 'text-green-neon' : 'text-gray-700'}`} size={24} />
                         )}
                    </div>
                </button>
            );
        })}
      </div>

      <button onClick={onBack} className="w-full py-3 text-gray-500 font-medium hover:text-green-neon text-sm">
        Back to Dashboard
      </button>

    </div>
  );
};

export default InviteEarn;
