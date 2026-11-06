import React, { useState } from 'react';
import { Icons } from './Icons';

interface HeaderProps {
  userName?: string;
  profileImage?: string;
  userLevel?: number;
  onLogout?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  pageTitle?: string;
  onNavigateProfile?: () => void;
  onNavigateWithdraw?: () => void;
  onNavigateUpgrade?: () => void;
  onNavigateHome?: () => void;
  onNavigateAdmin?: () => void;
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Level 1 • Beginner',
  2: 'Level 2 • Scholar (Tier 2)',
  3: 'Level 3 • Master',
  4: 'Level 4 • VIP Pro'
};

const Header: React.FC<HeaderProps> = ({ 
  userName = "Guest", 
  profileImage, 
  userLevel = 1,
  onLogout,
  showBack = false,
  onBack,
  pageTitle,
  onNavigateProfile,
  onNavigateWithdraw,
  onNavigateUpgrade,
  onNavigateHome,
  onNavigateAdmin
}) => {
  const [isSlideOpen, setIsSlideOpen] = useState(false);

  const levelName = LEVEL_NAMES[userLevel] || `Level ${userLevel}`;

  return (
    <>
      {showBack ? (
        <div className="bg-white px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 border-b border-pink-200 text-slate-900 shadow-2xs">
          <div className="flex items-center space-x-2">
            <button 
              onClick={onBack} 
              className="p-1.5 -ml-1.5 hover:bg-pink-100 rounded-full transition-colors text-slate-700"
            >
              <Icons.ArrowLeft size={18} />
            </button>
            <span className="font-black text-slate-900 text-sm tracking-tight">{pageTitle}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setIsSlideOpen(true)}
              className="p-1.5 hover:bg-pink-100 rounded-full text-slate-700"
            >
              <Icons.Menu size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-transparent px-4 pt-3 pb-1">
          <div className="flex justify-between items-center">
            {/* Left Side: Hamburger & Brand */}
            <div className="flex items-center space-x-2.5">
              <button 
                onClick={() => setIsSlideOpen(true)}
                className="p-1.5 -ml-1.5 text-slate-800 hover:text-blue-600 transition-colors"
                title="Open Navigation Menu"
              >
                <Icons.Menu size={20} />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-black border border-blue-500/50 flex items-center justify-center text-white shadow-xs">
                  <Icons.GraduationCap size={15} className="text-blue-400" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">LearnEarn</h1>
                  <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-0.5">LEARN • EARN • GROW</p>
                </div>
              </div>
            </div>

            {/* Right Side: Notification Bell & Profile Avatar */}
            <div className="flex items-center space-x-2">
              <button className="relative p-1.5 text-slate-600 hover:text-slate-900 transition-colors">
                <Icons.Notification size={18} />
                <span className="absolute top-1 right-1 w-3 h-3 bg-blue-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                  1
                </span>
              </button>

              <div 
                onClick={onNavigateProfile}
                className="w-7 h-7 rounded-full bg-white p-0.5 border border-pink-300 ring-1 ring-blue-500/30 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-pink-100 flex items-center justify-center">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Icons.User size={13} className="text-slate-800" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide Drawer Modal */}
      {isSlideOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsSlideOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {/* Drawer Content Panel */}
          <div className="relative w-4/5 max-w-xs bg-white border-r border-pink-200 text-slate-900 h-full flex flex-col justify-between p-4 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              {/* Header inside drawer */}
              <div className="flex justify-between items-start pb-3 border-b border-pink-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-pink-100 p-0.5 border border-pink-300 flex items-center justify-center shadow-xs">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Icons.User size={16} className="text-slate-800" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs truncate max-w-[120px]">{userName}</h3>
                    <div className="inline-flex items-center space-x-1 px-2 py-0.2 rounded-full bg-pink-100 border border-pink-200 text-[9px] font-bold text-slate-700 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      <span>{levelName}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSlideOpen(false)}
                  className="p-1 rounded-full bg-pink-50 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Icons.X size={15} />
                </button>
              </div>

              {/* Navigation Menu List */}
              <div className="mt-4 space-y-1.5">
                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateHome?.();
                  }}
                  className="w-full flex items-center space-x-3 p-2.5 rounded-2xl bg-pink-50/60 hover:bg-pink-100 border border-pink-200 text-slate-800 transition-all text-left"
                >
                  <div className="p-1.5 rounded-xl bg-white text-blue-600 border border-pink-200">
                    <Icons.Home size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Home Dashboard</span>
                    <span className="text-[9px] text-slate-500">Main overview & activities</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateProfile?.();
                  }}
                  className="w-full flex items-center space-x-3 p-2.5 rounded-2xl bg-pink-50/60 hover:bg-pink-100 border border-pink-200 text-slate-800 transition-all text-left"
                >
                  <div className="p-1.5 rounded-xl bg-white text-blue-600 border border-pink-200">
                    <Icons.User size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">My Profile</span>
                    <span className="text-[9px] text-slate-500">View and edit account profile</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateWithdraw?.();
                  }}
                  className="w-full flex items-center space-x-3 p-2.5 rounded-2xl bg-pink-50/60 hover:bg-pink-100 border border-pink-200 text-slate-800 transition-all text-left"
                >
                  <div className="p-1.5 rounded-xl bg-white text-blue-600 border border-pink-200">
                    <Icons.Send size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Withdraw Funds</span>
                    <span className="text-[9px] text-slate-500">Transfer balance to bank account</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateUpgrade?.();
                  }}
                  className="w-full flex items-center space-x-3 p-2.5 rounded-2xl bg-pink-50/60 hover:bg-pink-100 border border-pink-200 text-slate-800 transition-all text-left"
                >
                  <div className="p-1.5 rounded-xl bg-white text-blue-600 border border-pink-200">
                    <Icons.TrendingUp size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Upgrade Tier / Level</span>
                    <span className="text-[9px] text-slate-500">Tier 2, Level 3 & Level 4 VIP</span>
                  </div>
                </button>

                {/* Service Button */}
                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateAdmin?.();
                  }}
                  className="btn-black-blue w-full flex items-center space-x-3 p-2.5 rounded-2xl text-left"
                >
                  <div className="p-1.5 rounded-xl bg-slate-900 text-blue-400 border border-blue-500/40">
                    <Icons.ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="font-black text-xs block text-white">Service</span>
                    <span className="text-[9px] text-slate-400">System Portal • Passkey</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer inside drawer */}
            <div className="pt-3 border-t border-pink-100 space-y-2">
              {onLogout && (
                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors"
                >
                  <Icons.LogOut size={14} />
                  <span>Log Out</span>
                </button>
              )}

              <p className="text-[9px] text-slate-400 text-center font-mono">LearnEarn Secure Account</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
