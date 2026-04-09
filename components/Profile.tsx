import React, { useState, useRef } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdateProfile: (updatedUser: Partial<User>) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateProfile, darkMode, toggleDarkMode, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    onUpdateProfile({ name });
    setIsEditing(false);
  };

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-4 border-black shadow-lg overflow-hidden bg-white flex items-center justify-center">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-black text-3xl font-bold italic">{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-black text-white p-2 rounded-full shadow-md hover:bg-gray-800 transition-colors"
          >
            <Icons.Camera size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        <div className="text-center">
            <h2 className="text-xl font-bold text-black">{user.name}</h2>
            <p className="text-sm text-gray-400 font-medium">{user.email}</p>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4 border border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Settings</h3>
        
        {/* Name Edit */}
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div className="flex items-center space-x-3 flex-1">
            <div className="p-2.5 bg-gray-50 rounded-xl text-black">
                <Icons.User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
              {isEditing ? (
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-1.5 border border-gray-200 rounded text-sm bg-white text-black focus:ring-2 focus:ring-black/10 outline-none"
                />
              ) : (
                <p className="text-sm font-bold text-black">{user.name}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => isEditing ? handleSaveName() : setIsEditing(true)}
            className="text-black font-bold text-sm ml-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {isEditing ? <Icons.Check size={20} /> : 'Edit'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <button onClick={onLogout} className="w-full p-4 flex items-center space-x-3 text-red-500 hover:bg-red-50 transition-colors">
            <div className="p-2 bg-red-50 rounded-full">
                <Icons.LogOut size={18} />
            </div>
            <span className="font-bold">Log Out</span>
          </button>
      </div>

    </div>
  );
};

export default Profile;