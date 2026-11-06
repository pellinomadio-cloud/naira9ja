import React from 'react';
import { Icons } from './Icons';
import { useAppSettings } from '../appSettings';

interface TelegramAdProps {
  onJoin: () => void;
  onContinue: () => void;
}

const TelegramAd: React.FC<TelegramAdProps> = ({ onJoin, onContinue }) => {
  const settings = useAppSettings();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-xl relative overflow-hidden text-center space-y-4 animate-in zoom-in-95 duration-300 border border-pink-200">
        <div className="relative">
             <div className="w-14 h-14 bg-black rounded-2xl mx-auto flex items-center justify-center shadow-xs mb-3 border border-blue-500/50">
                <Icons.Send size={26} className="text-blue-400 ml-0.5" />
             </div>
             <h2 className="text-lg font-black text-slate-900">Join Our Community</h2>
             <p className="text-slate-500 mt-1 text-xs leading-relaxed font-medium">
                Stay updated! Join our official Telegram channel for exclusive rewards, daily codes, and support.
             </p>
             <p className="text-blue-600 font-bold text-xs mt-1">{settings.telegramLink}</p>
        </div>

        <div className="space-y-2">
            <button 
                onClick={() => {
                  window.open(settings.telegramLink || 'https://t.me/naira9ja001', '_blank');
                  onJoin();
                }}
                className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-blue-500/50 transition-all active:scale-95 flex items-center justify-center space-x-1.5 uppercase tracking-wider"
            >
                <Icons.Send size={15} className="text-blue-400" />
                <span>Join Channel</span>
            </button>
            <button 
                onClick={onContinue}
                className="w-full py-2 px-4 bg-pink-50 hover:bg-pink-100 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-pink-200"
            >
                Continue to Dashboard
            </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramAd;
