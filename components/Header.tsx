
import React from 'react';
import { Icons } from './Icons';

interface HeaderProps {
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  pageTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  userName = "Guest", 
  profileImage, 
  onLogout,
  showBack = false,
  onBack,
  pageTitle
}) => {
  const initials = userName.length >= 2 ? userName.substring(0, 2).toUpperCase() : userName.substring(0, 1).toUpperCase();
  const firstName = userName.split(' ')[0];

  if (showBack) {
    return (
      <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-full transition-colors text-black"
        >
          <Icons.ArrowLeft size={24} />
        </button>
        <span className="font-bold text-black text-lg">{pageTitle}</span>
      </div>
    );
  }

  return (
    <div className="bg-bg-gray px-4 pt-4 pb-2 space-y-4">
      {/* Top Row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={profileImage || "https://picsum.photos/seed/user/100/100"} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="bg-orange-50 px-2 py-0.5 rounded text-[10px] font-bold text-orange-500 border border-orange-100">
            LVL 1
          </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-400">
          <button className="relative p-1 hover:text-red-500 transition-colors">
            <Icons.Notification size={22} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse"></span>
          </button>
          <button className="relative p-1 hover:text-red-500 transition-colors">
            <Icons.Radio size={22} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
