import React from 'react';
import { Icons } from './Icons';

interface InviteAdProps {
  onStart: () => void;
  onClose: () => void;
}

const InviteAd: React.FC<InviteAdProps> = ({ onStart, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-xl relative overflow-hidden text-center space-y-4 animate-in zoom-in-95 duration-300 border border-pink-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 p-1 bg-pink-50 rounded-full text-slate-400 hover:text-slate-800 transition-colors">
            <Icons.X size={16} />
        </button>

        <div className="flex justify-center pt-1">
             <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center border border-blue-500/50 shadow-xs">
                <Icons.Gamepad2 size={26} className="text-blue-400" />
             </div>
        </div>

        <div>
             <h2 className="text-lg font-black text-slate-900">Daily Quiz Challenge!</h2>
             <p className="text-slate-500 mt-1 text-xs leading-relaxed font-medium">
                Test your knowledge and earn <span className="font-bold text-slate-950">₦7,000</span> for every correct answer!
             </p>
        </div>

        <div className="space-y-2">
            <button 
                onClick={onStart}
                className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-blue-500/50 transition-all active:scale-95 flex items-center justify-center space-x-1.5 uppercase tracking-wider"
            >
                <Icons.Gamepad2 size={16} className="text-blue-400" />
                <span>Play & Earn Now</span>
            </button>
            <button 
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-700 py-1 font-medium"
            >
                Remind me later
            </button>
        </div>
      </div>
    </div>
  );
};

export default InviteAd;