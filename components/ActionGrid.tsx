
import React from 'react';
import { Icons } from './Icons';
import { useAppSettings } from '../appSettings';

interface ActionGridProps {
  onActionClick?: (id: string) => void;
}

export const ActionGrid: React.FC<ActionGridProps> = ({ onActionClick }) => {
  const settings = useAppSettings();
  const primaryQuickAccess = [
    {
      id: 'upgrade',
      label: 'Upgrade',
      icon: Icons.TrendingUp,
      bg: 'bg-gradient-to-br from-[#4f46e5] to-[#3730a3]',
      textStyle: 'text-slate-200 font-semibold'
    },
    {
      id: 'free_withdraw',
      label: 'Earn More',
      icon: Icons.BarChart2,
      bg: 'bg-gradient-to-br from-[#6d28d9] to-[#4c1d95]',
      textStyle: 'text-slate-200 font-semibold'
    },
    {
      id: 'support',
      label: 'Support',
      icon: Icons.Support,
      bg: 'bg-gradient-to-br from-[#0284c7] to-[#0369a1]',
      textStyle: 'text-slate-200 font-semibold'
    },
    {
      id: 'buy_naira_code',
      label: 'BUY Naira Code',
      icon: Icons.Key,
      bg: 'bg-gradient-to-br from-[#059669] to-[#047857]',
      textStyle: 'text-emerald-400 font-bold'
    }
  ];

  const secondaryServices = [
    { id: 'bank', label: 'Withdraw', icon: Icons.Send, color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/40' },
    { id: 'airtime', label: 'Airtime', icon: Icons.Airtime, color: 'text-purple-400 bg-purple-950/60 border-purple-800/40' },
    { id: 'data', label: 'Data', icon: Icons.Data, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40' },
    { id: 'subscribe', label: 'Naira Code', icon: Icons.FileText, color: 'text-amber-400 bg-amber-950/60 border-amber-800/40' },
    { id: 'rewards', label: 'Rewards', icon: Icons.Reward, color: 'text-rose-400 bg-rose-950/60 border-rose-800/40' },
    { id: 'loan', label: 'Loan', icon: Icons.Loan, color: 'text-blue-400 bg-blue-950/60 border-blue-800/40' },
    { id: 'business', label: 'Business', icon: Icons.Business, color: 'text-teal-400 bg-teal-950/60 border-teal-800/40' },
    { id: 'invite', label: 'Quiz Game', icon: Icons.Gamepad2, color: 'text-violet-400 bg-violet-950/60 border-violet-800/40' },
  ];

  return (
    <div className="space-y-5 my-4">
      {/* Primary Quick Access matching screenshot */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight">Quick Access</h3>
        <div className="grid grid-cols-4 gap-3">
          {primaryQuickAccess.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'support') {
                    const link = settings.supportLink || settings.telegramLink || 'https://t.me/naira9ja_support';
                    window.open(link, '_blank');
                  } else {
                    onActionClick?.(item.id);
                  }
                }}
                className="flex flex-col items-center space-y-2 group active:scale-95 transition-transform"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${item.bg} border border-white/10 group-hover:brightness-110 transition-all`}>
                  <Icon size={26} strokeWidth={2.2} />
                </div>
                <span className={`text-[11px] text-center leading-tight ${item.textStyle}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Extended Features & Services Grid */}
      <div className="bg-[#12142e] rounded-2xl p-4 border border-[#212552] shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Features & Services</h4>
          <span className="text-[10px] text-indigo-400 font-medium">LearnEarn Hub</span>
        </div>
        <div className="grid grid-cols-4 gap-y-4 gap-x-2">
          {secondaryServices.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onActionClick?.(item.id)}
                className="flex flex-col items-center space-y-1.5 group active:scale-95 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${item.color} group-hover:scale-105`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span className="text-[10px] text-slate-300 font-medium text-center leading-tight group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionGrid;

