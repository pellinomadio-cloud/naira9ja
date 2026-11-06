import React, { useState } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface BusinessHubProps {
  user: User;
  onVipWithdraw: (amount: number) => void;
  onBack: () => void;
}

const BusinessHub: React.FC<BusinessHubProps> = ({ user, onVipWithdraw, onBack }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [error, setError] = useState('');

  const vipBalance = user.vipBalance || 0;

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (amt > vipBalance) {
      setError('Insufficient VIP funds');
      return;
    }

    onVipWithdraw(amt);
    setWithdrawAmount('');
    setError('');
    alert(`₦${amt.toLocaleString()} successfully moved to your main balance!`);
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-pink-100 transition-colors">
             <Icons.ArrowLeft size={20} className="text-slate-800" />
        </button>
        <h2 className="text-base font-black text-slate-900">My Business Hub</h2>
      </div>

      {/* VIP Status Banner */}
      {user.isVIP ? (
        <div className="bg-black text-white rounded-3xl p-4 shadow-sm border border-blue-500/50 flex items-center justify-between">
           <div className="flex items-center space-x-2.5">
              <div className="bg-slate-900 border border-blue-500/40 p-2 rounded-xl text-blue-400">
                <Icons.Zap size={20} fill="currentColor" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-300">VIP Status</p>
                <p className="text-sm font-black text-white">ACTIVE MEMBER</p>
              </div>
           </div>
           <Icons.Star className="animate-pulse text-amber-400" size={18} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-3.5 text-slate-500 text-center border border-pink-200">
           <p className="text-xs font-medium">VIP Status: Inactive • Upgrade to access grants</p>
        </div>
      )}

      {/* Balance Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-pink-200">
           <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Main Balance</p>
           <p className="text-xl font-black text-slate-950">₦{user.balance.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-pink-200">
           <p className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">VIP Business Funds</p>
           <p className="text-2xl font-black text-slate-950">₦{vipBalance.toLocaleString()}</p>
           <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Funds available to move to main balance</p>
        </div>
      </div>

      {/* Withdrawal Section */}
      {user.isVIP && vipBalance > 0 && (
        <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-pink-200 space-y-3">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Withdraw VIP Funds</h3>
          
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 ml-0.5">Withdrawal Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₦</span>
                <input 
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 pl-7 bg-pink-50/50 border border-pink-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && <p className="text-rose-600 text-xs font-bold">{error}</p>}

            <button 
              onClick={handleWithdraw}
              className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-blue-500/50 transition-all active:scale-95 flex items-center justify-center space-x-2 uppercase tracking-wider"
            >
              <Icons.Banknote size={15} className="text-blue-400" />
              <span>Withdraw to Main Balance</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-3.5 rounded-2xl border border-pink-200">
         <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
           <strong className="text-slate-800">About Business Hub:</strong> This hub is designed for VIP members to manage their business development grants. VIP funds can be moved to your main balance for withdrawal.
         </p>
      </div>
    </div>
  );
};

export default BusinessHub;
