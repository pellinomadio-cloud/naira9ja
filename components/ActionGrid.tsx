
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
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Make Payment</h3>
        <div className="grid grid-cols-4 gap-4">
          {makePaymentItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                onClick={() => onActionClick?.(item.id)}
                className="flex flex-col items-center space-y-2 cursor-pointer active:opacity-70"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center ${item.color}`}>
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 text-center leading-tight">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Services</h3>
        <div className="grid grid-cols-4 gap-y-6 gap-x-4">
          {serviceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                onClick={() => onActionClick?.(item.id)}
                className="flex flex-col items-center space-y-2 cursor-pointer active:opacity-70"
              >
                <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${item.color}`}>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <span className="text-[11px] font-medium text-gray-600 text-center leading-tight">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionGrid;
