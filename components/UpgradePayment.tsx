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
    name: 'Tier 2 • Scholar',
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
    }, 800);

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
    }, 1200);
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 animate-in fade-in duration-500">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 font-bold text-xs uppercase tracking-wider animate-pulse">
          Loading Company Account Details...
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      
      {/* Warning Notice */}
      <div className={`bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-2xl text-center font-bold text-xs transition-all duration-500 ${showWarning ? 'opacity-100 scale-100' : 'opacity-80 scale-98'}`}>
        ⚠️ Transfers from OPay are restricted. Please use Moniepoint, PalmPay, Kuda, or commercial bank apps to pay.
      </div>

      {/* Pending Submission Banner if User has already submitted */}
      {status === 'pending_exist' && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-3xl space-y-1.5 text-center animate-in zoom-in-95">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-300">
            <Icons.Sync className="animate-spin" size={20} />
          </div>
          <h4 className="font-black text-amber-900 text-sm">Payment Verification Pending</h4>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            You already have an active payment proof submission submitted to Service awaiting approval. Your Tier 2 upgrade and pending withdrawal will be approved shortly.
          </p>
        </div>
      )}

      {/* Selected Plan Summary */}
      <div className="bg-white p-4 rounded-2xl flex justify-between items-center border border-pink-200 shadow-sm shadow-pink-500/5">
        <div>
          <p className="text-[9px] text-blue-600 font-black uppercase tracking-wider">Selected Upgrade Plan</p>
          <h3 className="text-base font-black text-slate-900 mt-0.5">{selectedPlan.name}</h3>
          <p className="text-xs text-slate-500 font-medium">Tier {selectedPlan.level} Upgrade</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-slate-900">{selectedPlan.priceFormatted}</p>
          <span className="text-[10px] text-slate-500 font-medium">Bank Transfer</span>
        </div>
      </div>

      {/* Account Details Section */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Step 1: Transfer {selectedPlan.priceFormatted} to Company Account</p>
        
        <div className="bg-white rounded-3xl p-5 shadow-sm shadow-pink-500/5 border border-pink-200 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-black"></div>
          
          <div className="space-y-2.5">
            <div className="flex justify-between items-center border-b border-pink-100 pb-2">
              <span className="text-xs text-slate-500 uppercase font-bold">Account Number</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-slate-900 tracking-wider">{accountNumber}</span>
                <button 
                  onClick={handleCopy}
                  className={`p-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-pink-50 text-slate-700 hover:bg-pink-100'}`}
                >
                  {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} className="text-blue-600" />}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-b border-pink-100 pb-2">
              <span className="text-xs text-slate-500 uppercase font-bold">Bank Name</span>
              <span className="text-xs font-black text-slate-900 uppercase">{settings.companyBankName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 uppercase font-bold">Account Name</span>
              <span className="text-xs font-black text-slate-900 uppercase">{settings.companyAccountName}</span>
            </div>
          </div>
          
          <div className="bg-pink-50/70 p-2.5 rounded-xl flex items-start space-x-2 border border-pink-200">
            <Icons.AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-700 leading-normal font-medium">
              Transfer exactly <strong className="text-slate-950">{selectedPlan.priceFormatted}</strong> to activate <strong className="text-rose-600">Tier {selectedPlan.level}</strong>. Keep your transaction receipt for verification.
            </p>
          </div>
        </div>
      </div>

      {/* Proof Upload Section */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Step 2: Upload Payment Proof Receipt</p>
        
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
            className={`w-full py-5 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-all ${
              status === 'pending_exist'
                ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                : proofFile 
                ? 'border-emerald-500 bg-emerald-50/50' 
                : 'border-pink-300 bg-white hover:border-blue-500 shadow-2xs'
            }`}
          >
            {proofFile ? (
              <>
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center">
                  <Icons.CheckCircle size={22} />
                </div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider px-2 text-center truncate max-w-xs">
                  Receipt: {proofFile.name}
                </span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-pink-100 text-blue-600 flex items-center justify-center">
                  <Icons.Upload size={20} />
                </div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Click to upload payment receipt</span>
                <span className="text-[10px] text-slate-500">Screenshot JPEG or PNG</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Status Alert */}
      {status === 'success' && (
        <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl text-center space-y-1 text-emerald-900 animate-in fade-in">
          <div className="flex items-center justify-center space-x-1.5">
            <Icons.CheckCircle size={18} className="text-emerald-600" />
            <span className="text-xs font-extrabold uppercase">Payment Proof Submitted to Service!</span>
          </div>
          <p className="text-[11px] text-emerald-800">{noticeMessage || 'Awaiting admin review and approval.'}</p>
        </div>
      )}

      {/* Submit Verification Button - Black with touch of blue */}
      <div className="space-y-2 pt-1">
        <button 
          onClick={handleVerify}
          disabled={status === 'loading' || status === 'success' || status === 'pending_exist'}
          className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 ${
            status === 'loading' || status === 'success' || status === 'pending_exist'
              ? 'bg-slate-300 cursor-not-allowed text-slate-500'
              : 'bg-black hover:bg-slate-900 active:scale-95 border border-blue-500/50 shadow-[0_2px_10px_rgba(37,99,235,0.25)] uppercase tracking-wider'
          }`}
        >
          {status === 'loading' ? (
            <>
              <Icons.Sync className="animate-spin" size={16} />
              <span>Submitting Payment Proof...</span>
            </>
          ) : status === 'pending_exist' ? (
            <>
              <Icons.Sync size={16} />
              <span>Submission Pending Approval</span>
            </>
          ) : (
            <>
              <Icons.ShieldCheck size={16} className="text-blue-400" />
              <span>Submit Payment Verification</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl text-center border border-pink-200">
        <p className="text-[10px] text-slate-500 leading-tight">
          Payments are verified by Service admins against bank logs. Fake or duplicated payment receipts will result in permanent account suspension.
        </p>
      </div>

    </div>
  );
};

export default UpgradePayment;
