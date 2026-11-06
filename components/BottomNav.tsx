import React from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: User | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, user }) => {
  const leftTabs = [
    { id: 'home', label: 'Home', icon: Icons.Home },
    { id: 'free_withdraw', label: 'Earn', icon: Icons.GraduationCap },
  ];
  
  const rightTabs = [
    { id: 'history', label: 'Wallet', icon: Icons.Wallet },
    { id: 'me', label: 'Profile', icon: Icons.User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-pink-200 pb-safe z-50 shadow-[0_-4px_20px_rgba(236,72,153,0.06)]">
      <div className="max-w-md mx-auto flex justify-between items-center px-4 h-14 relative">
        {/* Left Tabs */}
        <div className="flex flex-1 justify-around">
          {leftTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center transition-all ${
                  isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Floating Task Button - Black with touch of blue */}
        <div className="relative -top-3.5">
          <button 
            onClick={() => setActiveTab('free_withdraw')}
            className="w-12 h-12 bg-black hover:bg-slate-900 rounded-full flex items-center justify-center text-white shadow-[0_2px_12px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all border-2 border-blue-500"
            title="Earn Rewards"
          >
            <Icons.ClipboardList size={20} strokeWidth={2.2} className="text-blue-400" />
          </button>
        </div>

        {/* Right Tabs */}
        <div className="flex flex-1 justify-around">
          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === (tab.id === 'history' ? 'transaction_history' : tab.id) || activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id === 'history' ? 'transaction_history' : tab.id)}
                className={`flex flex-col items-center justify-center transition-all ${
                  isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[9px] font-bold mt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
