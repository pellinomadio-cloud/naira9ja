import React from 'react';
import { Icons } from './Icons';

interface InviteAdProps {
  onStart: () => void;
  onClose: () => void;
}

const InviteAd: React.FC<InviteAdProps> = ({ onStart, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden text-center space-y-5 animate-in zoom-in-95 duration-300 border-2 border-green-neon">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1 bg-gray-800 rounded-full text-gray-500 hover:text-red-500 transition-colors">
            <Icons.X size={20} />
        </button>

        <div className="flex justify-center pt-2">
             <div className="w-20 h-20 bg-green-neon/10 rounded-full flex items-center justify-center animate-bounce">
                <Icons.Gamepad2 size={40} className="text-green-neon" />
             </div>
        </div>

        <div>
             <h2 className="text-2xl font-black text-white">Daily Quiz Challenge!</h2>
             <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                Test your knowledge and earn <span className="font-bold text-green-neon">₦7,000</span> for every correct answer! Play now and boost your balance.
             </p>
        </div>

        <div className="space-y-3">
            <button 
                onClick={onStart}
                className="w-full py-3.5 bg-green-neon hover:bg-green-dark text-black font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2"
            >
                <Icons.Gamepad2 size={18} fill="currentColor" />
                <span>Play & Earn Now</span>
            </button>
            <button 
                onClick={onClose}
                className="text-xs text-gray-500 hover:text-gray-300"
            >
                Remind me later
            </button>
        </div>
      </div>
    </div>
  );
};

export default InviteAd;