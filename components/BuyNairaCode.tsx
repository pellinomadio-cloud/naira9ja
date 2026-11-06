import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useAppSettings } from '../appSettings';
import { submitPaymentProof, getUserPendingSubmission } from '../paymentService';
import { compressImageFile } from '../utils/imageCompressor';

interface BuyNairaCodeProps {
  userEmail?: string;
  userName?: string;
  onBack: () => void;
}

const BuyNairaCode: React.FC<BuyNairaCodeProps> = ({ userEmail = '', userName = 'User', onBack }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'details' | 'submitting' | 'pending_exist' | 'success'>('idle');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofDataUrl, setProofDataUrl] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string>('');

  const settings = useAppSettings();
  const accountNumber = settings.companyAccountNumber;
  const nairaCodePrice = settings.nairaCodePrice ?? 7000;
  const nairaCodePriceFormatted = `₦${nairaCodePrice.toLocaleString()}`;

  const activeEmail = userEmail || (() => {
    try {
      const stored = localStorage.getItem('naira9ja_users');
      if (stored) {
        const users = JSON.parse(stored);
        const emails = Object.keys(users);
        if (emails.length > 0) return emails[0];
      }
    } catch (e) {}
    return 'user@naira9ja.com';
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setStatus('loading');

    const pending = getUserPendingSubmission(activeEmail);
    const timer = setTimeout(() => {
      if (pending) {
        setStatus('pending_exist');
      } else {
        setStatus('details');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [activeEmail]);

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

  const handleConfirm = () => {
    const pending = getUserPendingSubmission(activeEmail);
    if (pending) {
      setStatus('pending_exist');
      alert('You already have a payment submission pending admin approval.');
      return;
    }

    if (!proofFile) {
      alert("Please upload payment proof first.");
      return;
    }
    setStatus('submitting');

    setTimeout(() => {
      const result = submitPaymentProof({
        userEmail: activeEmail,
        userName,
        type: 'naira_code',
        amount: nairaCodePrice,
        itemDescription: `Naira CODE Voucher Activation (${nairaCodePriceFormatted})`,
        proofFileName: proofFile.name,
        proofDataUrl: proofDataUrl,
        codeAmount: nairaCodePrice
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

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 animate-in fade-in duration-500">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-blue-600 font-bold text-xs uppercase tracking-wider animate-pulse">Loading Details...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="text-center space-y-0.5">
         <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Buy Naira CODE</h2>
         <p className="text-xs text-slate-500 font-medium">Follow the steps below to get your code</p>
      </div>

      {status === 'pending_exist' && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-3xl space-y-1.5 text-center animate-in zoom-in-95 text-amber-900">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-300">
            <Icons.Sync className="animate-spin" size={20} />
          </div>
          <h4 className="font-black text-amber-900 text-sm">CODE Verification Pending</h4>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            You already submitted a Naira CODE payment proof to Service. Your request is awaiting admin review and approval.
          </p>
        </div>
      )}

      {/* Selected Plan Summary */}
      <div className="bg-white p-3.5 rounded-2xl flex justify-between items-center border border-pink-200 shadow-sm shadow-pink-500/5">
        <div>
            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">Service</p>
            <h3 className="text-sm font-black text-slate-900">Naira CODE Activation</h3>
        </div>
        <div className="text-right">
            <p className="text-base font-extrabold text-slate-900">{nairaCodePriceFormatted}</p>
            <p className="text-[10px] text-slate-500 uppercase">One-time</p>
        </div>
      </div>

      {/* Account Details Section */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Step 1: Transfer to Management Account</p>
        
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
            <Icons.AlertTriangle size={15} className="text-slate-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-700 leading-tight font-medium">
              Ensure you pay exactly {nairaCodePriceFormatted} for Naira CODE. Verification is manual by Service Admin.
            </p>
          </div>
        </div>
      </div>

      {/* Proof Upload Section */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Step 2: Upload Payment Proof</p>
        
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
                ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                : proofFile ? 'border-emerald-500 bg-emerald-50/50' : 'border-pink-300 bg-white hover:border-blue-500 shadow-2xs'
            }`}
          >
            {proofFile ? (
              <>
                <Icons.CheckCircle size={24} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Proof Selected: {proofFile.name}</span>
              </>
            ) : (
              <>
                <Icons.Upload size={24} className="text-blue-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Click to upload receipt</span>
              </>
            )}
          </label>
        </div>
      </div>

      {status === 'success' && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-2xl text-center space-y-1 animate-in fade-in">
          <div className="flex items-center justify-center space-x-1.5">
            <Icons.CheckCircle size={18} className="text-emerald-600" />
            <span className="text-xs font-extrabold uppercase">Payment Proof Submitted!</span>
          </div>
          <p className="text-[11px] text-emerald-800">{noticeMessage}</p>
        </div>
      )}

      {/* Confirm Button - Black with touch of blue */}
      <div className="space-y-2 pt-1">
        <button 
            onClick={handleConfirm}
            disabled={status === 'submitting' || status === 'success' || status === 'pending_exist'}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 ${
                status === 'submitting' || status === 'success' || status === 'pending_exist'
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-black hover:bg-slate-900 border border-blue-500/50 shadow-[0_2px_10px_rgba(37,99,235,0.25)] active:scale-95 uppercase tracking-wider'
            }`}
        >
            {status === 'submitting' ? (
              <>
                <Icons.Sync className="animate-spin" size={16} />
                <span>Submitting Proof...</span>
              </>
            ) : status === 'pending_exist' ? (
              <span>Submission Pending Approval</span>
            ) : (
              <>
                <Icons.ShieldCheck size={16} className="text-blue-400" />
                <span>Confirm Payment</span>
              </>
            )}
        </button>

        <button
          onClick={onBack}
          className="w-full py-2 text-slate-500 font-medium hover:text-slate-900 text-xs transition-colors text-center"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl text-center border border-pink-200">
          <p className="text-[10px] text-slate-500 leading-tight">
            Our admin team will verify your uploaded proof manually. Fake proofs will lead to permanent account ban.
          </p>
      </div>

    </div>
  );
};

export default BuyNairaCode;
