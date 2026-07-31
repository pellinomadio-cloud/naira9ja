
import React, { useState } from 'react';
import { Icons } from './Icons';
import { UpgradeLevelPlan } from '../types';
import { getAppSettings } from '../appSettings';

interface UpgradeProposalProps {
  currentLevel?: number;
  onProceed: (plan: UpgradeLevelPlan) => void;
  onBack: () => void;
}

export const getUpgradePlans = (): UpgradeLevelPlan[] => {
  const settings = getAppSettings();
  return [
    {
      level: 2,
      name: 'Level 2 • Scholar',
      price: settings.level2Price,
      priceFormatted: `₦${settings.level2Price.toLocaleString()}`,
      badge: 'Popular Upgrade',
      features: [
        'Increased daily withdrawal limit',
        '2x Quiz & Daily Task Rewards',
        'Priority payment queue',
        'Standard customer support'
      ]
    },
    {
      level: 3,
      name: 'Level 3 • Master',
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
      name: 'Level 4 • VIP Pro',
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
  const [selectedLevel, setSelectedLevel] = useState<number>(
    currentLevel >= 4 ? 4 : currentLevel + 1 <= 4 ? currentLevel + 1 : 2
  );

  const upgradePlans = getUpgradePlans();
  const activePlan = upgradePlans.find(p => p.level === selectedLevel) || upgradePlans[0];

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-[0_0_25px_rgba(124,58,237,0.5)] border border-purple-400/30 mb-2">
          <Icons.TrendingUp size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Account Level Upgrade</h2>
        <p className="text-xs text-slate-300 max-w-xs mx-auto">
          All user accounts start on <span className="text-purple-400 font-bold">Level 1</span>. Upgrade your account level to unlock higher daily earnings and instant bank withdrawals.
        </p>

        {/* Current Status Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#181a3c] border border-[#2d3269] text-xs font-semibold text-slate-300 mt-2">
          <span className="text-amber-400">⭐</span>
          <span>Your Current Status: <strong className="text-white">Level {currentLevel}</strong></span>
        </div>
      </div>

      {/* Plan Selector Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#12142e] rounded-2xl border border-[#212552]">
        {upgradePlans.map((plan) => {
          const isSelected = plan.level === selectedLevel;
          const isCurrent = plan.level <= currentLevel;
          return (
            <button
              key={plan.level}
              onClick={() => setSelectedLevel(plan.level)}
              className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center space-y-1 transition-all ${
                isSelected 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border border-purple-400/40' 
                  : 'text-slate-400 hover:text-white bg-[#181a3c]/60'
              }`}
            >
              <span className="text-xs font-black">Level {plan.level}</span>
              <span className="text-[11px] font-extrabold">{plan.priceFormatted}</span>
              {isCurrent && (
                <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">Active</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Level Details Card */}
      <div className="bg-[#12142e] rounded-3xl p-6 border border-[#212552] shadow-2xl space-y-5 relative overflow-hidden">
        {activePlan.badge && (
          <div className="absolute top-4 right-4 bg-purple-950 text-purple-300 border border-purple-800/60 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
            {activePlan.badge}
          </div>
        )}

        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Upgrade Destination</span>
          <h3 className="text-2xl font-black text-white mt-0.5">{activePlan.name}</h3>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-white">{activePlan.priceFormatted}</span>
            <span className="text-xs text-slate-400 font-medium">One-Time Fee • Company Account Transfer</span>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-[#1e2247]">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Plan Benefits</h4>
          <ul className="space-y-2.5">
            {activePlan.features.map((feature, i) => (
              <li key={i} className="flex items-center space-x-3 text-xs text-slate-300 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center justify-center shrink-0">
                  <Icons.Check size={12} strokeWidth={3} />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={() => onProceed(activePlan)}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all flex items-center justify-center space-x-2 active:scale-95"
        >
          <span>Pay {activePlan.priceFormatted} for Level {activePlan.level}</span>
          <Icons.ArrowRight size={18} />
        </button>

        <button
          onClick={onBack}
          className="w-full py-3 text-slate-400 font-bold hover:text-white text-xs transition-colors text-center"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default UpgradeProposal;
