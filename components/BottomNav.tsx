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
    <div className="fixed bottom-0 left-0 right-0 bg-[#0d0e20] border-t border-[#1f2248] pb-safe z-50 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-md mx-auto flex justify-between items-center px-4 h-16 relative">
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
                  isActive ? 'text-purple-400 scale-105' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-purple-400' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Floating Task Button */}
        <div className="relative -top-5">
          <button 
            onClick={() => setActiveTab('free_withdraw')}
            className="w-14 h-14 bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,58,237,0.7)] hover:shadow-[0_0_30px_rgba(124,58,237,0.9)] hover:scale-105 active:scale-95 transition-all border-2 border-purple-400/50"
          >
            <Icons.ClipboardList size={26} strokeWidth={2.2} className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
          </button>
        </div>

        {/* Right Tabs */}
        <div className="flex flex-1 justify-around">
          {rightTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center transition-all ${
                  isActive ? 'text-purple-400 scale-105' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-purple-400' : 'text-slate-400'}`}>
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
