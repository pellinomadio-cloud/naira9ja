import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface LoanProps {
  user: User;
  onApply: (amount: number) => void;
  onBack: () => void;
}

const loanOffers = [
  { id: 'small', amount: 50000, label: 'Starter Credit', duration: '7 Days' },
  { id: 'medium', amount: 150000, label: 'Business Growth', duration: '14 Days' },
  { id: 'large', amount: 500000, label: 'Enterprise Fund', duration: '30 Days' },
];

const VALID_NAIRA_CODE = 'nairaABC';

const Loan: React.FC<LoanProps> = ({ user, onApply, onBack }) => {
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [nairaCode, setNairaCode] = useState('');
  const [error, setError] = useState('');

  const hasActiveLoan = (user.loanBalance || 0) > 0;

  const handleApply = () => {
    if (!selectedOffer) return;
    
    if (nairaCode.trim().toUpperCase() !== VALID_NAIRA_CODE.toUpperCase()) {
      setError('Invalid Naira CODE. Please purchase a valid code to proceed.');
      return;
    }

    onApply(selectedOffer);
  };

  useEffect(() => {
    if (!user.loanExpiry) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = user.loanExpiry! - now;

      if (diff <= 0) {
        setTimeLeft('Repayment Due');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user.loanExpiry]);

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="text-center space-y-0.5">
        <div className="inline-flex items-center justify-center p-2.5 bg-black text-white rounded-2xl mb-1 border border-blue-500/50 shadow-xs">
          <Icons.Banknote size={20} className="text-blue-400" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Instant Credit</h2>
        <p className="text-xs text-slate-500 font-medium">Borrow interest-free. Automated repayment from balance.</p>
      </div>

      {hasActiveLoan ? (
        <div className="bg-white rounded-3xl p-5 text-slate-900 shadow-sm border border-pink-200 space-y-2 text-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Loan Balance</p>
          <h3 className="text-2xl font-black text-slate-950">₦{user.loanBalance?.toLocaleString()}</h3>
          <div className="bg-pink-50 rounded-full px-3 py-1 inline-flex items-center space-x-1.5 border border-pink-200">
            <Icons.Clock size={12} className="text-blue-600" />
            <span className="text-xs font-bold text-slate-700">{timeLeft}</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-2">
            Funds will be automatically debited from your main balance upon expiry.
          </p>
        </div>
      ) : (
        <div className="space-y-3 bg-white p-4.5 rounded-3xl border border-pink-200 shadow-sm shadow-pink-500/5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Available Loan Offers</h3>
          {error && (
             <div className="bg-rose-50 text-rose-700 text-xs p-2.5 rounded-xl text-center border border-rose-200 font-bold">
                {error}
              </div>
          )}
          <div className="grid grid-cols-1 gap-2">
            {loanOffers.map((offer) => (
              <div 
                key={offer.id}
                onClick={() => setSelectedOffer(offer.amount)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedOffer === offer.amount 
                  ? 'border-blue-500 bg-blue-50 shadow-2xs' 
                  : 'border-pink-200 bg-pink-50/40 hover:bg-pink-50'
                }`}
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{offer.label}</h4>
                  <p className="text-[10px] text-slate-500">Term: {offer.duration} • 0% Interest</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-950">₦{offer.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Naira CODE Input */}
          <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 mb-1 ml-0.5 uppercase tracking-wider">Naira CODE</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icons.ShieldCheck className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                      type="text"
                      value={nairaCode}
                      onChange={(e) => setNairaCode(e.target.value)}
                      placeholder="Enter Naira CODE"
                      className="w-full pl-9 p-2.5 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-xs tracking-wider"
                  />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 ml-0.5 font-medium">Required to unlock instant credit</p>
          </div>

          {/* Black button with touch of blue */}
          <button
            onClick={handleApply}
            disabled={!selectedOffer || !nairaCode}
            className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-blue-500/50 transition-all flex items-center justify-center space-x-2 active:scale-95 uppercase tracking-wider mt-2"
          >
            <Icons.CheckCircle size={15} className="text-blue-400" />
            <span>Apply for Loan</span>
          </button>
        </div>
      )}

      <button onClick={onBack} className="w-full py-2 text-slate-500 text-xs font-medium hover:text-slate-900 text-center">
        Back to Dashboard
      </button>
    </div>
  );
};

export default Loan;
