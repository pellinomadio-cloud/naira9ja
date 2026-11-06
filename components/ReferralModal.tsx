import React from 'react';
import { Icons } from './Icons';

interface ReferralModalProps {
  onProceed: () => void;
  onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ onProceed, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-xl shadow-pink-500/10 relative overflow-hidden text-center space-y-4 animate-in zoom-in-95 duration-200 border border-pink-200">
        
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-blue-500 to-pink-400"></div>

        <div className="flex justify-center pt-1">
          <div className="w-14 h-14 bg-pink-100 text-blue-600 rounded-2xl flex items-center justify-center border border-pink-200 shadow-xs">
            <Icons.User size={26} />
          </div>
        </div>

        <div>
          <span className="inline-block px-2.5 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-pink-200 mb-1">
            Special Referral Offer 🎁
          </span>
          <h2 className="text-base font-black text-slate-900 tracking-tight">Unlock Referral Rewards</h2>
          <p className="text-slate-600 mt-1.5 text-xs leading-relaxed">
            Want <span className="font-bold text-blue-600">fast-track benefits</span> and cash bonuses without waiting?
          </p>
          <p className="text-slate-500 mt-1 text-[11px]">
            Share your unique invite link with friends to grow your rewards and build your commission network!
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <button 
            onClick={onProceed}
            className="btn-black-blue w-full py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5"
          >
            <span>Proceed to Referral Hub</span>
            <Icons.ArrowRight size={14} className="text-blue-400" />
          </button>
          <button 
            onClick={onClose}
            className="w-full py-1 text-[11px] text-slate-400 hover:text-slate-700 font-medium transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;
