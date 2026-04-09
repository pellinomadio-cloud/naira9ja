
import React from 'react';
import { Icons } from './Icons';

interface TelegramAdProps {
  onJoin: () => void;
  onContinue: () => void;
}

const TelegramAd: React.FC<TelegramAdProps> = ({ onJoin, onContinue }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden text-center space-y-6 animate-in zoom-in-95 duration-300 border border-gray-200">
        <div className="relative">
             <div className="w-20 h-20 bg-black rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
                <Icons.Send size={40} className="text-white ml-1" />
             </div>
             <h2 className="text-2xl font-black text-black">Join Our Community!</h2>
             <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                Stay updated! Join our official Telegram channel for exclusive rewards, updates, and support.
             </p>
             <p className="text-black font-bold mt-1">@naira9ja001</p>
        </div>

        <div className="space-y-3">
            <button 
                onClick={onJoin}
                className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2"
            >
                <Icons.Send size={18} />
                <span>Join Channel</span>
            </button>
            <button 
                onClick={onContinue}
                className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
            >
                Continue to Dashboard
            </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramAd;
