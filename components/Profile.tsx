import React, { useState, useRef } from 'react';
import { Icons } from './Icons';
import { User } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface ProfileProps {
  user: User;
  onUpdateProfile: (updatedUser: Partial<User>) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateProfile, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 300, 0.8);
        onUpdateProfile({ profileImage: compressed });
      } catch (err) {
        console.error('Failed to compress avatar:', err);
      }
    }
  };

  const handleSaveName = () => {
    onUpdateProfile({ name });
    setIsEditing(false);
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in duration-300">
      
      {/* Profile Header */}
      <div className="flex flex-col items-center justify-center space-y-3 bg-white p-5 rounded-3xl border border-pink-200 shadow-sm shadow-pink-500/5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-pink-300 shadow-xs overflow-hidden bg-pink-50 flex items-center justify-center ring-2 ring-blue-500/20">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-900 text-2xl font-black italic">{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-black text-white p-1.5 rounded-full shadow-xs border border-blue-500/60 hover:bg-slate-900 transition-colors"
            title="Change Avatar"
          >
            <Icons.Camera size={13} className="text-blue-400" />
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
          <h2 className="text-sm font-black text-slate-900 tracking-tight">{user.name}</h2>
          <p className="text-[11px] text-slate-500 font-medium font-mono">{user.email}</p>
          <div className="mt-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold border border-pink-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Level {user.level || 1} Member</span>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white rounded-3xl shadow-sm shadow-pink-500/5 p-4 space-y-3 border border-pink-200">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Account Settings</h3>
        
        {/* Name Edit */}
        <div className="flex items-center justify-between py-2 border-b border-pink-100/60">
          <div className="flex items-center space-x-2.5 flex-1">
            <div className="p-2 bg-pink-50 rounded-xl text-slate-900 border border-pink-200">
              <Icons.User size={15} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold">Full Name</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-1 border border-pink-200 rounded text-xs bg-pink-50/50 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => isEditing ? handleSaveName() : setIsEditing(true)}
            className="btn-black-blue py-1 px-2.5 rounded-lg text-[10px] font-bold ml-2 inline-flex items-center space-x-1"
          >
            {isEditing && <Icons.Check size={12} className="text-blue-400" />}
            <span>{isEditing ? 'Save' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <div className="bg-white rounded-3xl shadow-sm shadow-pink-500/5 overflow-hidden border border-pink-200">
        <button 
          onClick={onLogout} 
          className="w-full p-3 flex items-center justify-center space-x-2 text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold"
        >
          <Icons.LogOut size={14} />
          <span>Log Out of Account</span>
        </button>
      </div>

    </div>
  );
};

export default Profile;