
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { UpgradeLevelPlan } from '../types';
import { useAppSettings } from '../appSettings';
import { submitPaymentProof, getUserPendingSubmission } from '../paymentService';
import { compressImageFile } from '../utils/imageCompressor';

interface UpgradePaymentProps {
  userEmail: string;
  userName?: string;
  selectedPlan?: UpgradeLevelPlan;
  onPaymentComplete: (targetLevel?: number) => void;
}

const UpgradePayment: React.FC<UpgradePaymentProps> = ({ 
  userEmail, 
  userName = 'User',
  selectedPlan = {
    level: 2,
    name: 'Level 2 • Scholar',
    price: 6000,
    priceFormatted: '₦6,000',
    features: []
  }, 
  onPaymentComplete 
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'pending_exist'>('idle');
  const [isFetching, setIsFetching] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofDataUrl, setProofDataUrl] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string>('');

  const settings = useAppSettings();
  const accountNumber = settings.companyAccountNumber;

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFetching(false);
    }, 1200);

    // Check if user already has a pending payment submission
    const pending = getUserPendingSubmission(userEmail);
    if (pending) {
      setStatus('pending_exist');
    }

    const warningInterval = setInterval(() => {
      setShowWarning(prev => !prev);
      setTimeout(() => setShowWarning(true), 500);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(warningInterval);
    };
  }, [userEmail]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    if (file) {
      try {
        const compressed = await compressImageFile(file, 500, 0.6);
        setProofDataUrl(compressed);
      } catch (err) {
        console.error('Failed to compress image:', err);
        setProofDataUrl(undefined);
      }
    } else {
      setProofDataUrl(undefined);
    }
  };

  const handleVerify = () => {
    // Check if pending already exists
    const pending = getUserPendingSubmission(userEmail);
    if (pending) {
      setStatus('pending_exist');
      alert('You already have a payment submission pending admin approval.');
      return;
    }

    if (!proofFile) {
      alert("Please select and upload your payment proof receipt first.");
      return;
    }

    setStatus('loading');

    setTimeout(() => {
      const result = submitPaymentProof({
        userEmail,
        userName,
        type: 'upgrade',
        amount: selectedPlan.price,
        itemDescription: `${selectedPlan.name} Upgrade`,
        proofFileName: proofFile.name,
        proofDataUrl: proofDataUrl,
        targetLevel: selectedPlan.level
      });

      if (result.success) {
        setStatus('success');
        setNoticeMessage(result.message);
      } else {
        setStatus('pending_exist');
        setNoticeMessage(result.message);
      }
    }, 1500);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
        <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(168,85,247,0.4)]"></div>
        <p className="text-purple-400 font-bold text-xs uppercase tracking-widest animate-pulse">
          Generating Company Account Details...
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Warning Notice */}
      <div className={`bg-rose-950/80 border border-rose-800/60 text-rose-300 p-3 rounded-2xl text-center font-bold text-xs transition-all duration-500 ${showWarning ? 'opacity-100 scale-100' : 'opacity-70 scale-98'}`}>
        ⚠️ Transfers from OPay are restricted. Please use Moniepoint, PalmPay, Kuda, or standard commercial bank apps to pay.
      </div>

      {/* Pending Submission Banner if User has already submitted */}
      {status === 'pending_exist' && (
        <div className="bg-amber-950/90 border border-amber-600/80 p-5 rounded-3xl space-y-2 text-center animate-in zoom-in-95">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
            <Icons.Sync className="animate-spin" size={24} />
          </div>
          <h4 className="font-black text-amber-300 text-base">Payment Verification Pending</h4>
          <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
            You already have an active payment proof submission submitted to Service awaiting approval. You cannot upload a new payment proof until the current submission is processed.
          </p>
        </div>
      )}

      {/* Selected Plan Summary */}
      <div className="bg-[#12142e] p-5 rounded-2xl flex justify-between items-center border border-[#212552] shadow-xl">
        <div>
          <p className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest">Selected Upgrade Plan</p>
          <h3 className="text-lg font-black text-white mt-0.5">{selectedPlan.name}</h3>
          <p className="text-xs text-slate-400">Target Level: Level {selectedPlan.level}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white">{selectedPlan.priceFormatted}</p>
          <span className="text-[10px] text-slate-400 font-medium">Company Account Transfer</span>
        </div>
      </div>

      {/* Account Details Section */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Step 1: Transfer {selectedPlan.priceFormatted} to Company Account</p>
        
        <div className="bg-[#12142e] rounded-3xl p-6 shadow-2xl border border-[#212552] space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-indigo-600"></div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-[#1e2247] pb-3">
              <span className="text-xs text-slate-400 uppercase font-bold">Account Number</span>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-white tracking-widest">{accountNumber}</span>
                <button 
                  onClick={handleCopy}
                  className={`p-2 rounded-xl transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-[#1e2247] text-purple-300 hover:bg-[#282d5c]'}`}
                >
                  {copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-b border-[#1e2247] pb-3">
              <span className="text-xs text-slate-400 uppercase font-bold">Bank Name</span>
              <span className="text-sm font-black text-white uppercase tracking-tight">{settings.companyBankName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase font-bold">Account Name</span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-tight">{settings.companyAccountName}</span>
            </div>
          </div>
          
          <div className="bg-[#181a3c] p-3 rounded-xl flex items-start space-x-2 border border-[#2a2f66]">
            <Icons.AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-300 leading-normal font-medium">
              Transfer exactly <strong className="text-white">{selectedPlan.priceFormatted}</strong> to upgrade your account to <strong className="text-purple-300">Level {selectedPlan.level}</strong>. Keep your transaction receipt for verification.
            </p>
          </div>
        </div>
      </div>

      {/* Proof Upload Section */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Step 2: Upload Payment Proof</p>
        
        <div className="relative">
          <input 
            type="file" 
            accept="image/*"
            disabled={status === 'pending_exist'}
            onChange={handleFileChange}
            className="hidden" 
            id="proof-upload"
          />
          <label 
            htmlFor="proof-upload"
            className={`w-full py-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
              status === 'pending_exist'
                ? 'border-slate-800 bg-slate-900/50 cursor-not-allowed opacity-60'
                : proofFile 
                ? 'border-emerald-500/80 bg-emerald-950/30' 
                : 'border-[#2a2f66] bg-[#12142e] hover:border-purple-500/50'
            }`}
          >
            {proofFile ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                  <Icons.CheckCircle size={28} />
                </div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider px-2 text-center truncate max-w-xs">
                  Receipt Selected: {proofFile.name}
                </span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-[#1e2247] text-purple-400 flex items-center justify-center">
                  <Icons.Upload size={24} />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Click to upload payment receipt</span>
                <span className="text-[10px] text-slate-400">JPEG, PNG, or PDF screenshot</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Status Alert */}
      {status === 'success' && (
        <div className="bg-emerald-950/90 border border-emerald-800 p-4 rounded-2xl text-center space-y-1 text-emerald-300 animate-in fade-in">
          <div className="flex items-center justify-center space-x-2">
            <Icons.CheckCircle size={22} />
            <span className="text-xs font-extrabold uppercase">Payment Proof Submitted to Service!</span>
          </div>
          <p className="text-[11px] text-emerald-200/90">{noticeMessage || 'Awaiting admin review and approval.'}</p>
        </div>
      )}

      {/* Submit Verification Button */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Step 3: Submit for Admin Approval</p>
        <button 
          onClick={handleVerify}
          disabled={status === 'loading' || status === 'success' || status === 'pending_exist'}
          className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all flex items-center justify-center space-x-2 ${
            status === 'loading' || status === 'success' || status === 'pending_exist'
              ? 'bg-slate-700/80 cursor-not-allowed text-slate-400'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 shadow-[0_4px_20px_rgba(124,58,237,0.4)]'
          }`}
        >
          {status === 'loading' ? (
            <>
              <Icons.Sync className="animate-spin" size={18} />
              <span className="uppercase tracking-wider">Submitting Payment Proof...</span>
            </>
          ) : status === 'pending_exist' ? (
            <>
              <Icons.Sync size={18} />
              <span className="uppercase tracking-wider">Submission Pending Approval</span>
            </>
          ) : (
            <>
              <Icons.ShieldCheck size={20} />
              <span className="uppercase tracking-wider">Submit Payment Verification</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-[#12142e] p-3 rounded-xl text-center border border-[#212552]">
        <p className="text-[10px] text-slate-400 leading-tight">
          Payments are verified by Service admins against bank logs. Fake or duplicated payment receipts will result in permanent account suspension.
        </p>
      </div>

    </div>
  );
};

export default UpgradePayment;
