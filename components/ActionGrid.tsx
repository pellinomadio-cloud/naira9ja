
import React from 'react';
import { Icons } from './Icons';
import { MenuItem } from '../types';

const makePaymentItems: MenuItem[] = [
  { id: 'bank', label: 'Withdraw', icon: Icons.Send, color: 'text-blue-500' },
  { id: 'airtime', label: 'Airtime', icon: Icons.Airtime, color: 'text-orange-500' },
  { id: 'data', label: 'Data', icon: Icons.Data, color: 'text-blue-400' },
  { id: 'subscribe', label: 'BUY NAIRA CODE', icon: Icons.FileText, color: 'text-yellow-500' },
];

const serviceItems: MenuItem[] = [
  { id: 'rewards', label: 'Rewards', icon: Icons.Reward, color: 'text-red-500' },
  { id: 'loan', label: 'Loan', icon: Icons.Loan, color: 'text-purple-500' },
  { id: 'business', label: 'Business', icon: Icons.Business, color: 'text-indigo-500' },
  { id: 'upgrade', label: 'Upgrade', icon: Icons.Upgrade, color: 'text-amber-500' },
  { id: 'invite', label: 'Quiz', icon: Icons.Gamepad2, color: 'text-pink-500' },
  { id: 'vip', label: 'Channel', icon: Icons.MessageCircle, color: 'text-green-500' },
  { id: 'free_withdraw', label: 'Tasks', icon: Icons.Gift, color: 'text-orange-400' },
  { id: 'palmpay', label: 'Activation', icon: Icons.Zap, color: 'text-yellow-600' },
];

interface ActionGridProps {
  onActionClick?: (id: string) => void;
}

const ActionGrid: React.FC<ActionGridProps> = ({ onActionClick }) => {
  return (
    <div className="space-y-6">
      {/* Make Payment Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80">
        <div className="flex items-center space-x-2 mb-4 px-1">
          <div className="w-1 h-3.5 bg-red-600 rounded-full"></div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Make Payment</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {makePaymentItems.map((item) => {
            const Icon = item.icon;
            // Highlight BUY NAIRA CODE with subtle glow
            const isNairaCode = item.id === 'subscribe';
            return (
              <div 
                key={item.id} 
                onClick={() => onActionClick?.(item.id)}
                className="flex flex-col items-center space-y-2 cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isNairaCode 
                    ? 'bg-red-50 text-red-600 border border-red-200 shadow-[0_4px_12px_rgba(229,57,53,0.15)] group-hover:scale-105' 
                    : 'bg-gray-50 text-gray-800 border border-gray-100/50 group-hover:scale-105 group-hover:bg-red-50/50 group-hover:text-red-600'
                }`}>
                  <Icon size={24} strokeWidth={isNairaCode ? 2.5 : 2} className={isNairaCode ? 'animate-bounce' : ''} />
                </div>
                <span className="text-[10px] font-black text-gray-700 group-hover:text-red-600 text-center leading-tight transition-colors">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80">
        <div className="flex items-center space-x-2 mb-4 px-1">
          <div className="w-1 h-3.5 bg-red-600 rounded-full"></div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Services & Tools</h3>
        </div>
        <div className="grid grid-cols-4 gap-y-5 gap-x-4">
          {serviceItems.map((item) => {
            const Icon = item.icon;
            // Add a little glowing blue outline to the VIP / Activation actions
            const isSpecial = item.id === 'palmpay' || item.id === 'upgrade';
            const isGlowBlueTask = item.id === 'rewards' || item.id === 'free_withdraw';
            
            return (
              <div 
                key={item.id} 
                onClick={() => onActionClick?.(item.id)}
                className="flex flex-col items-center space-y-1.5 cursor-pointer group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isSpecial
                    ? 'bg-cyan-50 text-cyan-500 border border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse group-hover:scale-105'
                    : isGlowBlueTask
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-[0_0_10px_rgba(37,99,235,0.15)] group-hover:scale-105'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 group-hover:bg-red-50/50 group-hover:text-red-500 group-hover:scale-105'
                }`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span className="text-[10px] font-black text-gray-600 group-hover:text-red-500 text-center leading-tight transition-colors">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionGrid;
