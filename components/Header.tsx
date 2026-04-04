
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
  // Get initials safely
  const initials = userName.length >= 2 ? userName.substring(0, 2).toUpperCase() : userName.substring(0, 1).toUpperCase();
  const firstName = userName.split(' ')[0];

  return (
    <div className="bg-black px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-colors duration-200 border-b border-gray-800">
      <div className="flex items-center space-x-2">
        {showBack ? (
          <>
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 mr-1 hover:bg-gray-800 rounded-full transition-colors text-white"
            >
              <Icons.ArrowLeft size={24} />
            </button>
            <span className="font-bold text-white text-lg">{pageTitle}</span>
          </>
        ) : (
          <>
            <div className="relative group">
              <div className="w-8 h-8 rounded-full bg-green-neon flex items-center justify-center text-black font-bold italic text-sm overflow-hidden shadow-green group-hover:shadow-green-lg transition-all duration-300">
                  {profileImage ? (
                    <img src={profileImage} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className={`font-semibold text-white text-lg truncate max-w-[150px]`}>Hi, {firstName}</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-3 text-gray-300">
        <button className="p-1 hover:bg-gray-800 rounded-full transition-colors">
            <Icons.Support size={24} />
        </button>
      </div>
    </div>
  );
};

export default Header;
