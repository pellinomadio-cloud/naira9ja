
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface LoanProps {
  user: User;
  onApply: (amount: number) => void;
  onBack: () => void;
}

const loanOffers = [
  { id: 'small', amount: 50000, label: 'Starter Loan', duration: '7 Days' },
  { id: 'medium', amount: 150000, label: 'Business Growth', duration: '14 Days' },
  { id: 'large', amount: 500000, label: 'Enterprise Fund', duration: '30 Days' },
];

const VALID_NAIRA_CODE = 'nairaABC';

const Loan: React.FC<LoanProps> = ({ user, onApply, onBack }) => {
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [nairaCode, setNairaCode] = useState('');
  const [error, setError] = useState('');

  const isEligible = true; // Loans are now available to all registered users
  const hasActiveLoan = (user.loanBalance || 0) > 0;

  const handleApply = () => {
    if (!selectedOffer) return;
    
    if (nairaCode !== VALID_NAIRA_CODE) {
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

  if (!isEligible && !hasActiveLoan) {
    return (
      <div className="px-4 py-10 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-24 h-24 bg-green-neon/10 rounded-full flex items-center justify-center text-green-neon">
          <Icons.Lock size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Loans Restricted</h2>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            Free loans are exclusive to <span className="font-bold text-green-neon">VIP</span> members.
          </p>
        </div>
        <div className="bg-green-neon/5 p-4 rounded-xl border border-green-neon/10">
          <p className="text-xs text-green-neon font-medium">
            Please upgrade to VIP to access instant business credit up to ₦500,000 with 0% interest.
          </p>
        </div>
        <button 
          onClick={onBack}
          className="w-full max-w-sm bg-green-neon hover:bg-green-dark text-black font-bold py-3 rounded-full shadow-lg transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-green-neon/10 rounded-full text-green-neon mb-2">
          <Icons.Banknote size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white">Instant Credit</h2>
        <p className="text-sm text-gray-500">Borrow interest-free. Automated repayment from balance.</p>
      </div>

      {hasActiveLoan ? (
        <div className="bg-green-neon rounded-2xl p-6 text-black shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-black/70 text-xs font-bold uppercase tracking-widest">Active Loan Balance</p>
            <h3 className="text-4xl font-black my-2">₦{user.loanBalance?.toLocaleString()}</h3>
            <div className="bg-black/10 backdrop-blur-md rounded-full px-4 py-1 flex items-center space-x-2 mt-2">
              <Icons.Clock size={14} />
              <span className="text-xs font-bold">{timeLeft}</span>
            </div>
            <p className="text-[10px] text-black/50 mt-4 leading-tight">
              Funds will be automatically debited from your main balance upon expiry.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Available Offers</h3>
          {error && (
             <div className="bg-red-900/20 text-red-400 text-sm p-3 rounded-xl text-center border border-red-800 animate-pulse font-bold">
                {error}
              </div>
          )}
          <div className="grid grid-cols-1 gap-3">
            {loanOffers.map((offer) => (
              <div 
                key={offer.id}
                onClick={() => setSelectedOffer(offer.amount)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedOffer === offer.amount 
                  ? 'border-green-neon bg-green-neon/5' 
                  : 'border-gray-800 bg-gray-900'
                }`}
              >
                <div>
                  <h4 className="font-bold text-white">{offer.label}</h4>
                  <p className="text-xs text-gray-500">Term: {offer.duration} • 0% Interest</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-green-neon">₦{offer.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Naira CODE Input */}
          <div className="mt-4">
              <label className="block text-xs font-black text-gray-500 mb-1 ml-1 uppercase tracking-widest">Naira CODE</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icons.ShieldCheck className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                      type="text"
                      value={nairaCode}
                      onChange={(e) => setNairaCode(e.target.value)}
                      placeholder="Enter Naira CODE"
                      className="w-full pl-10 p-4 bg-gray-900 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-green-neon outline-none font-mono text-lg tracking-widest placeholder:text-gray-700"
                  />
              </div>
              <p className="text-[10px] text-gray-500 mt-2 ml-1 font-bold uppercase">Required to apply for a loan</p>
          </div>

          <button
            onClick={handleApply}
            disabled={!selectedOffer || !nairaCode}
            className="w-full py-4 bg-green-neon hover:bg-green-dark disabled:bg-gray-800 text-black font-black rounded-xl shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-95 uppercase tracking-widest animate-pulse"
          >
            <Icons.CheckCircle size={20} />
            <span>Apply for Loan</span>
          </button>
        </div>
      )}

      <div className="bg-green-neon/5 p-4 rounded-xl border border-green-neon/10">
        <h4 className="text-xs font-bold text-green-neon uppercase mb-2">Terms & Conditions</h4>
        <ul className="space-y-2">
          <li className="flex items-start space-x-2 text-[11px] text-gray-400">
            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 bg-green-neon rounded-full"></span>
            <span>Loans must be repaid in full within the specified duration.</span>
          </li>
          <li className="flex items-start space-x-2 text-[11px] text-gray-400">
            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 bg-green-neon rounded-full"></span>
            <span>Automatic debit will occur on the expiry date from your naira9ja balance.</span>
          </li>
          <li className="flex items-start space-x-2 text-[11px] text-gray-400">
            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 bg-green-neon rounded-full"></span>
            <span>Failure to maintain balance for repayment may result in account deactivation.</span>
          </li>
        </ul>
      </div>

      <button onClick={onBack} className="w-full py-2 text-gray-500 text-sm font-medium">
        Back to Dashboard
      </button>
    </div>
  );
};

export default Loan;
