
import React from 'react';
import { Icons } from './Icons';

interface ReferralModalProps {
  onProceed: () => void;
  onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ onProceed, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden text-center space-y-6 animate-in zoom-in-95 duration-300 border-2 border-gold">
        
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold via-gold-dark to-gold"></div>

        <div className="flex justify-center pt-2">
             <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center animate-bounce">
                <Icons.User size={40} className="text-gold" />
             </div>
        </div>

        <div>
             <h2 className="text-2xl font-black text-white">Special Offer! 🎁</h2>
             <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                Want <span className="font-bold text-gold">FREE withdrawals</span> without any subscription?
             </p>
             <p className="text-gray-400 mt-2 text-sm">
                Refer 50 friends to <span className="font-bold text-white">EARNIX9JA</span> and unlock lifetime free access today!
             </p>
        </div>

        <div className="space-y-3">
            <button 
                onClick={onProceed}
                className="w-full py-3.5 bg-gold hover:bg-gold-dark text-black font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2"
            >
                <span>Proceed to Referral</span>
                <Icons.ArrowRight size={18} />
            </button>
            <button 
                onClick={onClose}
                className="text-xs text-gray-500 hover:text-gray-300"
            >
                Maybe later
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;
