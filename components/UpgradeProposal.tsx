import React, { useState } from 'react';
import { Icons } from './Icons';
import { UpgradeLevelPlan } from '../types';
import { getAppSettings, useAppSettings } from '../appSettings';
import { AppSettings } from '../types';

interface UpgradeProposalProps {
  currentLevel?: number;
  onProceed: (plan: UpgradeLevelPlan) => void;
  onBack: () => void;
}

export const getUpgradePlans = (passedSettings?: AppSettings): UpgradeLevelPlan[] => {
  const settings = passedSettings || getAppSettings();
  return [
    {
      level: 2,
      name: 'Tier 2 • Scholar',
      price: settings.level2Price,
      priceFormatted: `₦${settings.level2Price.toLocaleString()}`,
      badge: 'Compulsory for Withdrawals',
      features: [
        'Mandatory upgrade to release pending bank withdrawals',
        'Increased daily withdrawal limit',
        '2x Quiz & Daily Task Rewards',
        'Priority payout verification queue'
      ]
    },
    {
      level: 3,
      name: 'Tier 3 • Master',
      price: settings.level3Price,
      priceFormatted: `₦${settings.level3Price.toLocaleString()}`,
      badge: 'High Earner',
      features: [
        'High speed instant payouts',
        '3x Quiz & Daily Task Rewards',
        'Zero maintenance fees',
        'Exclusive bonus tasks access'
      ]
    },
    {
      level: 4,
      name: 'Tier 4 • VIP Pro',
      price: settings.level4Price,
      priceFormatted: `₦${settings.level4Price.toLocaleString()}`,
      badge: 'Maximum Rewards',
      features: [
        'Unlimited daily withdrawals',
        'Instant automated bank payouts',
        '5x Quiz & Task Payouts',
        '24/7 VIP Dedicated Manager'
      ]
    }
  ];
};

const UpgradeProposal: React.FC<UpgradeProposalProps> = ({ currentLevel = 1, onProceed, onBack }) => {
  const settings = useAppSettings();
  const [selectedLevel, setSelectedLevel] = useState<number>(
    currentLevel >= 4 ? 4 : currentLevel + 1 <= 4 ? currentLevel + 1 : 2
  );

  const upgradePlans = getUpgradePlans(settings);
  const activePlan = upgradePlans.find(p => p.level === selectedLevel) || upgradePlans[0];

  return (
    <div className="px-4 py-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs border border-blue-500/50 mb-1">
          <Icons.TrendingUp size={24} className="text-blue-400" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Account Tier Upgrade</h2>
        <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
          Upgrading to <span className="text-rose-600 font-bold">Tier 2</span> is <strong className="text-slate-900 font-black">very compulsory</strong> to release and complete your bank withdrawals.
        </p>

        {/* Current Status Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white border border-pink-200 text-xs font-semibold text-slate-700 mt-1 shadow-2xs">
          <span className="text-amber-500">⭐</span>
          <span>Your Status: <strong className="text-slate-900 font-bold">Level {currentLevel}</strong></span>
        </div>
      </div>

      {/* Plan Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-white rounded-2xl border border-pink-200 shadow-2xs">
        {upgradePlans.map((plan) => {
          const isSelected = plan.level === selectedLevel;
          const isCurrent = plan.level <= currentLevel;
          return (
            <button
              key={plan.level}
              onClick={() => setSelectedLevel(plan.level)}
              className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all ${
                isSelected 
                  ? 'bg-black text-white shadow-xs border border-blue-500' 
                  : 'text-slate-600 hover:text-slate-900 bg-pink-50/60'
              }`}
            >
              <span className="text-xs font-black">Tier {plan.level}</span>
              <span className={`text-[10px] font-extrabold ${isSelected ? 'text-blue-300' : 'text-slate-700'}`}>{plan.priceFormatted}</span>
              {isCurrent && (
                <span className="text-[8px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-bold">Active</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Level Details Card */}
      <div className="bg-white rounded-3xl p-5 border border-pink-200 shadow-sm shadow-pink-500/5 space-y-4 relative overflow-hidden">
        {activePlan.badge && (
          <div className="inline-block bg-rose-100 text-rose-700 border border-rose-300 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
            {activePlan.badge}
          </div>
        )}

        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Upgrade Destination</span>
          <h3 className="text-lg font-black text-slate-950 mt-0.5">{activePlan.name}</h3>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{activePlan.priceFormatted}</span>
            <span className="text-[11px] text-slate-500 font-medium">One-Time Fee • Company Account</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-pink-100">
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Plan Benefits</h4>
          <ul className="space-y-2">
            {activePlan.features.map((feature, i) => (
              <li key={i} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Icons.Check size={10} strokeWidth={3} />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons - Black with touch of blue */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => onProceed(activePlan)}
          className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-blue-500 transition-all flex items-center justify-center space-x-1.5 active:scale-95 uppercase tracking-wider"
        >
          <span>Pay {activePlan.priceFormatted} for Tier {activePlan.level}</span>
          <Icons.ArrowRight size={15} className="text-blue-400" />
        </button>

        <button
          onClick={onBack}
          className="w-full py-2 text-slate-500 font-medium hover:text-slate-900 text-xs transition-colors text-center"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default UpgradeProposal;
