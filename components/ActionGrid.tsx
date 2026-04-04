
import React from 'react';
import { Icons } from './Icons';
import { MenuItem } from '../types';

const topRowItems: MenuItem[] = [
  { id: 'bank', label: 'Withdraw', icon: Icons.Send },
  { id: 'palmpay', label: 'To Earnix', icon: Icons.User },
  { id: 'rewards', label: 'Rewards', icon: Icons.Reward },
  { id: 'subscribe', label: 'BUY Naira CODE', icon: Icons.Subscribe },
];

const bottomGridItems: MenuItem[] = [
  { id: 'airtime', label: 'Airtime', icon: Icons.Airtime, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'data', label: 'Data', icon: Icons.Data, color: 'text-indigo-600 dark:text-indigo-400' },
  { id: 'free_withdraw', label: 'Task', icon: Icons.Gift, color: 'text-orange-500 dark:text-orange-400', badge: 'Unlock' },
  { id: 'business', label: 'My Business Hub', icon: Icons.Business, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'invite', label: 'Quiz Game', icon: Icons.Gamepad2, color: 'text-purple-500 dark:text-purple-400' },
  { id: 'upgrade', label: 'Upgrade', icon: Icons.Upgrade, color: 'text-amber-500 dark:text-amber-400' },
  { id: 'loan', label: 'Loan', icon: Icons.Loan, color: 'text-purple-700 dark:text-purple-300' },
  { id: 'vip', label: 'Channel', icon: Icons.Send, color: 'text-green-neon' },
];

interface ActionGridProps {
  onActionClick?: (id: string) => void;
}

const ActionGrid: React.FC<ActionGridProps> = ({ onActionClick }) => {
  return (
    <div className="space-y-2">
      {/* Top Row - Primary Actions */}
      <div className="bg-gray-900 rounded-xl p-4 shadow-sm grid grid-cols-4 gap-2 transition-colors duration-200 border border-gray-800">
        {topRowItems.map((item) => {
          const Icon = item.icon;
          const isGlowing = ['bank', 'rewards', 'subscribe'].includes(item.id);
          
          return (
            <div 
              key={item.id} 
              onClick={() => onActionClick?.(item.id)}
              className="flex flex-col items-center justify-center space-y-2 cursor-pointer active:opacity-70 group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-green-neon transition-all duration-300 ${isGlowing ? 'bg-green-neon/20 animate-green-glow shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'bg-green-neon/10 group-hover:bg-green-neon/20'}`}>
                <Icon size={24} fill="currentColor" className="text-green-neon" />
              </div>
              <span className="text-xs font-medium text-gray-300 text-center leading-tight">{item.label}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes green-glow {
          0% { box-shadow: 0 0 5px rgba(57, 255, 20, 0.3); transform: scale(1); filter: brightness(1); }
          50% { box-shadow: 0 0 25px rgba(57, 255, 20, 0.8); transform: scale(1.08); filter: brightness(1.3); }
          100% { box-shadow: 0 0 5px rgba(57, 255, 20, 0.3); transform: scale(1); filter: brightness(1); }
        }
        .animate-green-glow {
          animation: green-glow 2s infinite ease-in-out;
        }
      `}</style>

      {/* Secondary Actions Grid */}
      <div className="bg-gray-900 rounded-xl p-4 shadow-sm grid grid-cols-4 gap-x-2 gap-y-6 transition-colors duration-200 border border-gray-800">
        {bottomGridItems.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              onClick={() => onActionClick?.(item.id)}
              className="flex flex-col items-center justify-start space-y-2 cursor-pointer active:opacity-70 relative"
            >
              {item.badge && (
                <div className="absolute -top-3 right-1 bg-green-neon text-black text-[8px] font-bold px-1.5 py-0.5 rounded-tr-lg rounded-bl-lg z-10 shadow-sm">
                    {item.badge}
                </div>
              )}
              <div className={`w-8 h-8 flex items-center justify-center text-green-neon`}>
                 {/* Using fill for solid look where appropriate, simulating the bold icons in screenshot */}
                <Icon size={28} strokeWidth={2} />
              </div>
              <span className="text-xs font-medium text-gray-300 text-center leading-tight w-full break-words px-1">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionGrid;
