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
      sublabel: 'Tier 2',
      icon: Icons.TrendingUp,
      iconColor: 'text-sky-400',
      textColor: 'text-sky-300',
      borderColor: 'border-sky-500/40',
      glowShadow: 'shadow-[0_0_12px_rgba(56,189,248,0.25)]'
    },
    {
      id: 'free_withdraw',
      label: 'Earn',
      sublabel: 'Tasks',
      icon: Icons.BarChart2,
      iconColor: 'text-emerald-400',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-500/40',
      glowShadow: 'shadow-[0_0_12px_rgba(52,211,153,0.25)]'
    },
    {
      id: 'support',
      label: 'Help',
      sublabel: 'Desk',
      icon: Icons.Support,
      iconColor: 'text-cyan-400',
      textColor: 'text-cyan-300',
      borderColor: 'border-cyan-500/40',
      glowShadow: 'shadow-[0_0_12px_rgba(34,211,238,0.25)]'
    },
    {
      id: 'buy_naira_code',
      label: 'Naira Code',
      sublabel: 'Voucher',
      icon: Icons.Key,
      iconColor: 'text-amber-400',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-500/40',
      glowShadow: 'shadow-[0_0_12px_rgba(251,191,36,0.25)]'
    }
  ];

  const secondaryServices = [
    { id: 'bank', label: 'Withdraw', icon: Icons.Send },
    { id: 'airtime', label: 'Airtime', icon: Icons.Airtime },
    { id: 'data', label: 'Data', icon: Icons.Data },
    { id: 'subscribe', label: 'Vouchers', icon: Icons.FileText },
    { id: 'rewards', label: 'Rewards', icon: Icons.Reward },
    { id: 'loan', label: 'Quick Loan', icon: Icons.Loan },
    { id: 'business', label: 'Business', icon: Icons.Business },
    { id: 'invite', label: 'Quiz Game', icon: Icons.Gamepad2 },
  ];

  return (
    <div className="space-y-3.5 my-2">
      {/* Primary Quick Access - Black Buttons with High-Visibility Non-White Typography */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-black text-slate-800 tracking-tight">Quick Access</h3>
        <div className="grid grid-cols-4 gap-2">
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
                className={`bg-black hover:bg-slate-900 border ${item.borderColor} ${item.glowShadow} flex flex-col items-center justify-center p-2.5 rounded-2xl group active:scale-95 transition-all text-center space-y-1`}
              >
                <div className={`w-8 h-8 rounded-xl bg-slate-900/90 border ${item.borderColor} flex items-center justify-center ${item.iconColor} group-hover:scale-105 transition-transform`}>
                  <Icon size={16} strokeWidth={2.4} />
                </div>
                <div className="leading-tight">
                  <span className={`text-[11px] font-black block tracking-tight ${item.textColor}`}>
                    {item.label}
                  </span>
                  <span className={`text-[9px] font-bold block opacity-90 ${item.textColor}`}>
                    {item.sublabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Extended Features & Services Grid in Pink & White */}
      <div className="bg-white rounded-3xl p-3.5 border border-pink-200 shadow-sm shadow-pink-500/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Features & Services</h4>
          <span className="text-[9px] text-blue-600 font-bold">LearnEarn Core</span>
        </div>
        <div className="grid grid-cols-4 gap-y-2.5 gap-x-1.5">
          {secondaryServices.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onActionClick?.(item.id)}
                className="flex flex-col items-center space-y-1 group active:scale-95 transition-all p-1"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-pink-200 bg-pink-50/60 text-slate-800 group-hover:border-blue-400 group-hover:bg-pink-100 transition-all">
                  <Icon size={16} strokeWidth={2} className="text-blue-600" />
                </div>
                <span className="text-[9px] text-slate-700 font-bold text-center leading-tight group-hover:text-blue-600 transition-colors">
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
