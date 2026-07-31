
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
  2: 'Level 2 • Scholar',
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
        <div className="bg-[#0c0e22] px-4 py-3.5 flex items-center justify-between sticky top-0 z-50 border-b border-[#1c2048] text-white">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 hover:bg-[#1a1d42] rounded-full transition-colors text-white"
            >
              <Icons.ArrowLeft size={22} />
            </button>
            <span className="font-bold text-white text-base tracking-wide">{pageTitle}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsSlideOpen(true)}
              className="p-2 hover:bg-[#1a1d42] rounded-full text-slate-300"
            >
              <Icons.Menu size={22} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#080915] px-4 pt-4 pb-2">
          <div className="flex justify-between items-center">
            {/* Left Side: Hamburger & Brand */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsSlideOpen(true)}
                className="p-2 -ml-2 text-white hover:text-purple-400 transition-colors"
                title="Open Navigation Menu"
              >
                <Icons.Menu size={26} />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                  <Icons.GraduationCap size={22} />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-tight leading-none">LearnEarn</h1>
                  <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-0.5">LEARN • EARN • GROW</p>
                </div>
              </div>
            </div>

            {/* Right Side: Notification Bell & Profile Avatar */}
            <div className="flex items-center space-x-2">
              <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
                <Icons.Notification size={22} />
                <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-[#080915]">
                  3
                </span>
              </button>

              <div 
                onClick={onNavigateProfile}
                className="w-9 h-9 rounded-full bg-purple-600 p-0.5 border border-purple-400/50 flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.4)] cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-purple-900 flex items-center justify-center">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Icons.User size={18} className="text-white" />
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
          />

          {/* Drawer Content Panel */}
          <div className="relative w-4/5 max-w-xs bg-[#0e1027] border-r border-[#222758] text-white h-full flex flex-col justify-between p-5 z-10 shadow-2xl animate-in slide-in-from-left duration-300">
            <div>
              {/* Header inside drawer */}
              <div className="flex justify-between items-start pb-5 border-b border-[#1e2350]">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600 p-0.5 border-2 border-purple-400/50 flex items-center justify-center shadow-md">
                    <div className="w-full h-full rounded-full overflow-hidden bg-purple-900 flex items-center justify-center">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Icons.User size={24} className="text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base truncate max-w-[130px]">{userName}</h3>
                    <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#1b1f48] border border-[#2d3478] text-[10px] font-semibold text-purple-300 mt-0.5">
                      <span className="text-amber-400">⭐</span>
                      <span>{levelName}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsSlideOpen(false)}
                  className="p-2 rounded-full bg-[#181c42] text-slate-300 hover:text-white hover:bg-[#23295e] transition-colors"
                >
                  <Icons.X size={18} />
                </button>
              </div>

              {/* Navigation Menu List */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateHome?.();
                  }}
                  className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141838]/60 hover:bg-[#1f2552] border border-[#202758] text-white transition-all text-left"
                >
                  <div className="p-2 rounded-xl bg-indigo-900/60 text-indigo-400">
                    <Icons.Home size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Home Dashboard</span>
                    <span className="text-[10px] text-slate-400">Main overview & activities</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateProfile?.();
                  }}
                  className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141838]/60 hover:bg-[#1f2552] border border-[#202758] text-white transition-all text-left"
                >
                  <div className="p-2 rounded-xl bg-purple-900/60 text-purple-400">
                    <Icons.User size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">My Profile</span>
                    <span className="text-[10px] text-slate-400">View and edit account profile</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateWithdraw?.();
                  }}
                  className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141838]/60 hover:bg-[#1f2552] border border-[#202758] text-white transition-all text-left"
                >
                  <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-400">
                    <Icons.Send size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Withdraw Funds</span>
                    <span className="text-[10px] text-slate-400">Transfer balance to bank account</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateUpgrade?.();
                  }}
                  className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-[#141838]/60 hover:bg-[#1f2552] border border-[#202758] text-white transition-all text-left"
                >
                  <div className="p-2 rounded-xl bg-amber-900/60 text-amber-400">
                    <Icons.TrendingUp size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Upgrade Level</span>
                    <span className="text-[10px] text-slate-400">Level 2, Level 3 & Level 4 VIP</span>
                  </div>
                </button>

                {/* Red Service Button */}
                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onNavigateAdmin?.();
                  }}
                  className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-gradient-to-r from-red-950/90 to-rose-950/90 hover:from-red-900 hover:to-rose-900 border border-red-600/80 text-white transition-all text-left shadow-[0_0_15px_rgba(225,29,72,0.35)]"
                >
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-md">
                    <Icons.ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm block text-red-300">Service</span>
                    <span className="text-[10px] text-red-200/80">System Portal • Passkey required</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer inside drawer */}
            <div className="pt-4 border-t border-[#1e2350] space-y-3">
              {onLogout && (
                <button
                  onClick={() => {
                    setIsSlideOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/50 text-rose-300 font-bold text-xs transition-colors"
                >
                  <Icons.LogOut size={16} />
                  <span>Log Out</span>
                </button>
              )}

              <p className="text-[10px] text-slate-500 text-center font-mono">LearnEarn v2.4 • Secure Account</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;


