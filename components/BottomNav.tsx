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
    { id: 'loan', label: 'Loan', icon: Icons.LoanTab },
  ];
  
  const rightTabs = [
    { id: 'finance', label: 'Finance', icon: Icons.Finance },
    { id: 'me', label: 'Me', icon: Icons.Me },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe-area z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
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
                className={`flex flex-col items-center justify-center transition-colors ${
                  isActive ? 'text-primary-blue' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center Button */}
        <div className="relative -top-6">
          <button 
            onClick={() => setActiveTab('send_money')}
            className="w-14 h-14 bg-primary-blue rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
          >
            <Icons.Scan size={28} strokeWidth={2.5} />
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
                className={`flex flex-col items-center justify-center transition-colors ${
                  isActive ? 'text-primary-blue' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;