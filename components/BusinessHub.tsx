
import React, { useState } from 'react';
import { Icons } from './Icons';
import { User, Transaction } from '../types';

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
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-800">
             <Icons.ArrowLeft size={24} className="text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">My Business Hub</h2>
      </div>

      {/* VIP Status Banner */}
      {user.isVIP ? (
        <div className="bg-green-neon rounded-2xl p-4 text-black shadow-lg flex items-center justify-between">
           <div className="flex items-center space-x-3">
              <div className="bg-black/20 p-2 rounded-full">
                <Icons.Zap size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">VIP Status</p>
                <p className="text-lg font-black">ACTIVE MEMBER</p>
              </div>
           </div>
           <Icons.Star className="animate-pulse" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl p-4 text-gray-500 text-center border-2 border-dashed border-gray-800">
           <p className="text-sm font-medium">VIP Status: Inactive</p>
        </div>
      )}

      {/* Balance Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-800">
           <p className="text-xs font-bold text-gray-500 uppercase mb-1">Main Balance</p>
           <p className="text-2xl font-black text-white">₦{user.balance.toLocaleString()}</p>
        </div>

        <div className="bg-green-neon/10 p-5 rounded-2xl shadow-sm border border-green-neon/20">
           <p className="text-xs font-bold text-green-neon uppercase mb-1">VIP Business Funds</p>
           <p className="text-3xl font-black text-green-neon">₦{vipBalance.toLocaleString()}</p>
           <p className="text-[10px] text-green-neon/70 mt-1 italic">Funds available for instant withdrawal</p>
        </div>
      </div>

      {/* Withdrawal Section */}
      {user.isVIP && vipBalance > 0 && (
        <div className="bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-800 space-y-4">
          <h3 className="font-bold text-white">Withdraw VIP Funds</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Withdrawal Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 font-bold">₦</span>
                <input 
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 pl-8 bg-black border border-gray-800 rounded-xl text-lg font-bold text-white outline-none focus:ring-2 focus:ring-green-neon"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

            <button 
              onClick={handleWithdraw}
              className="w-full py-4 bg-green-neon hover:bg-green-dark text-black font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <Icons.Banknote size={20} />
              <span>Withdraw to Main Balance</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-green-neon/5 p-4 rounded-xl border border-green-neon/10">
         <p className="text-xs text-green-neon/70 leading-relaxed">
           <span className="font-bold">About Business Hub:</span> This hub is designed for our VIP members to manage their business development grants. VIP funds are credited upon admin approval and can be moved to your main balance for withdrawal to external banks.
         </p>
      </div>
    </div>
  );
};

export default BusinessHub;
