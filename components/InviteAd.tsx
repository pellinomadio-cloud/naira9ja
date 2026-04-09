import React from 'react';
import { Icons } from './Icons';

interface InviteAdProps {
  onStart: () => void;
  onClose: () => void;
}

const InviteAd: React.FC<InviteAdProps> = ({ onStart, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden text-center space-y-5 animate-in zoom-in-95 duration-300 border-2 border-black">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
            <Icons.X size={20} />
        </button>

        <div className="flex justify-center pt-2">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center animate-bounce">
                <Icons.Gamepad2 size={40} className="text-black" />
             </div>
        </div>

        <div>
             <h2 className="text-2xl font-black text-black">Daily Quiz Challenge!</h2>
             <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                Test your knowledge and earn <span className="font-bold text-black">₦7,000</span> for every correct answer! Play now and boost your balance.
             </p>
        </div>

        <div className="space-y-3">
            <button 
                onClick={onStart}
                className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2"
            >
                <Icons.Gamepad2 size={18} fill="currentColor" />
                <span>Play & Earn Now</span>
            </button>
            <button 
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-gray-600"
            >
                Remind me later
            </button>
        </div>
      </div>
    </div>
  );
};

export default InviteAd;