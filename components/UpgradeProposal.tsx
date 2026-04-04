
import React from 'react';
import { Icons } from './Icons';

interface UpgradeProposalProps {
  onProceed: () => void;
  onBack: () => void;
}

const UpgradeProposal: React.FC<UpgradeProposalProps> = ({ onProceed, onBack }) => {
  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-4 bg-gold/10 rounded-full text-gold mb-2">
            <Icons.Zap size={40} fill="currentColor" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">VIP Membership</h2>
        <p className="text-sm text-gray-500">Unlock the full power of Earnix9ja with a lifetime professional VIP status.</p>
      </div>

      {/* Benefits Card */}
      <div className="bg-gray-900 rounded-2xl p-6 shadow-md border border-gray-800 space-y-4">
        <h3 className="font-bold text-white text-lg border-b border-gray-800 pb-2">Exclusive VIP Benefits</h3>
        <ul className="space-y-3">
            {[
                "Priority withdrawal processing",
                "Higher daily transaction limits",
                "Zero maintenance fees for life",
                "Premium customer support access",
                "Exclusive investment opportunities"
            ].map((benefit, i) => (
                <li key={i} className="flex items-center space-x-3 text-sm text-gray-400">
                    <Icons.CheckCircle size={18} className="text-gold shrink-0" />
                    <span>{benefit}</span>
                </li>
            ))}
        </ul>
      </div>

      {/* Price Section */}
      <div className="bg-gold/5 rounded-2xl p-6 text-center border-2 border-gold/20">
        <p className="text-xs font-bold text-gold uppercase tracking-widest mb-1">One-Time VIP Fee</p>
        <h4 className="text-4xl font-black text-white">₦15,000</h4>
        <p className="text-[10px] text-gray-500 mt-2 italic">Lifetime activation • No recurring charges</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
          <button 
            onClick={onProceed}
            className="w-full py-4 bg-gold hover:bg-gold-dark text-black font-black rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2"
          >
              <span>Proceed to VIP</span>
              <Icons.ArrowRight size={20} />
          </button>
          <button onClick={onBack} className="w-full py-3 text-gray-500 font-medium hover:text-gold text-sm">
            Maybe Later
          </button>
      </div>
    </div>
  );
};

export default UpgradeProposal;
