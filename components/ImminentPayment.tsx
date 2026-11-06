import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useAppSettings } from '../appSettings';
import { submitPaymentProof, getUserPendingSubmission } from '../paymentService';
import { compressImageFile } from '../utils/imageCompressor';

interface ImminentPaymentProps {
  userEmail?: string;
  userName?: string;
  onBack: () => void;
}

const ImminentPayment: React.FC<ImminentPaymentProps> = ({ userEmail = '', userName = 'User', onBack }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'pending_exist'>('idle');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string>('');

  const settings = useAppSettings();

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

  useEffect(() => {
    const pending = getUserPendingSubmission(activeEmail);
    if (pending) {
      setStatus('pending_exist');
    }
  }, [activeEmail]);

  const handlePayNow = () => {
    const accountNumber = settings.companyAccountNumber;
    navigator.clipboard.writeText(accountNumber);
    alert(
      `ACTIVATION DETAILS\n\n` +
      `Bank: ${settings.companyBankName}\n` +
      `Account Number: ${accountNumber}\n` +
      `Account Name: ${settings.companyAccountName}\n\n` +
      `AMOUNT: ₦10,000\n\n` +
      `Account number copied! Make payment and click "Verify" below.`
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      try {
        const compressed = await compressImageFile(file, 500, 0.6);
        setPaymentProof(compressed);
      } catch (err) {
        console.error('Failed to compress image:', err);
        setPaymentProof(undefined);
      }
    }
  };

  const handleSubmit = () => {
    const pending = getUserPendingSubmission(activeEmail);
    if (pending) {
      setStatus('pending_exist');
      alert('You already have a payment submission pending admin approval.');
      return;
    }

    if (!paymentProof) {
      alert("Please upload payment proof before verifying.");
      return;
    }
    setStatus('loading');
    
    setTimeout(() => {
      const result = submitPaymentProof({
        userEmail: activeEmail,
        userName,
        type: 'activation',
        amount: 10000,
        itemDescription: 'Imminent Account Activation Fee',
        proofFileName: proofFile?.name || 'activation_receipt.png',
        proofDataUrl: paymentProof
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

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-pink-100 transition-colors">
             <Icons.ArrowLeft size={20} className="text-slate-800" />
        </button>
        <h2 className="text-base font-black text-slate-900">Account Activation</h2>
      </div>

      {status === 'pending_exist' && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-3xl space-y-1.5 text-center animate-in zoom-in-95">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-300">
            <Icons.Sync className="animate-spin" size={20} />
          </div>
          <h4 className="font-black text-amber-900 text-sm">Activation Verification Pending</h4>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            You already submitted an activation payment proof to Service. Your request is awaiting admin review and approval.
          </p>
        </div>
      )}

      <div className="bg-white p-3.5 rounded-2xl border border-pink-200 shadow-sm shadow-pink-500/5">
        <h3 className="font-bold text-xs text-rose-600 mb-1 flex items-center">
            <Icons.ShieldCheck className="mr-1.5" size={15} />
            Mandatory Activation
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
            New users must complete activation payment to secure their account status.
        </p>
      </div>

      {/* PAY Now Section */}
      <div className="bg-white rounded-3xl p-5 shadow-sm shadow-pink-500/5 border border-pink-200 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-black"></div>
        
        <div className="text-center space-y-0.5">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Verification Amount</p>
            <p className="text-2xl font-black text-slate-900">₦10,000</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-left border-t border-pink-100 pt-3">
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Bank Name</p>
            <p className="text-xs font-black text-slate-900">{settings.companyBankName}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Account Name</p>
            <p className="text-xs font-black text-slate-900">{settings.companyAccountName}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Account Number</p>
            <div className="flex items-center justify-between bg-pink-50/70 p-2.5 rounded-xl border border-pink-200">
              <p className="text-base font-black text-slate-900 tracking-wider">{settings.companyAccountNumber}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(settings.companyAccountNumber);
                  alert("Account number copied to clipboard!");
                }}
                className="p-1.5 bg-white text-blue-600 border border-pink-200 rounded-lg active:scale-90 transition-transform"
              >
                <Icons.Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handlePayNow}
          className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-blue-500/50 transition-all active:scale-95 flex items-center justify-center space-x-2 uppercase tracking-wider"
        >
          <Icons.Banknote size={15} className="text-blue-400" />
          <span>Copy Details</span>
        </button>
        
        <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center">
          <p className="text-[10px] text-rose-700 font-bold leading-tight uppercase">
            ⚠️ DO NOT USE OPAY. PALMPAY AND OTHER BANKS ARE ALLOWED.
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1 border-t border-pink-100">
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Step 2: Upload Payment Proof</p>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                disabled={status === 'pending_exist'}
                onChange={handleFileUpload}
                className="hidden" 
                id="imminent-proof-upload"
              />
              <label 
                htmlFor="imminent-proof-upload"
                className={`w-full py-4 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-all ${
                  status === 'pending_exist' 
                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    : paymentProof ? 'border-emerald-500 bg-emerald-50/50' : 'border-pink-300 bg-white hover:border-blue-500'
                }`}
              >
                {paymentProof ? (
                  <>
                    <Icons.CheckCircle className="text-emerald-600" size={20} />
                    <span className="text-xs font-bold text-emerald-700 uppercase">Proof Uploaded</span>
                  </>
                ) : (
                  <>
                    <Icons.Upload className="text-blue-500" size={20} />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Click to Upload Receipt</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {status === 'success' && (
            <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl text-center space-y-0.5 text-emerald-900 animate-in fade-in">
              <div className="flex items-center justify-center space-x-1.5">
                <Icons.CheckCircle size={16} className="text-emerald-600" />
                <span className="text-xs font-extrabold uppercase">Payment Proof Submitted!</span>
              </div>
              <p className="text-[11px] text-emerald-800">{noticeMessage}</p>
            </div>
          )}

          <button 
            onClick={handleSubmit} 
            disabled={status === 'loading' || status === 'success' || status === 'pending_exist'}
            className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-blue-500/50 transition-all flex items-center justify-center space-x-2 active:scale-95 uppercase tracking-wider"
          >
              {status === 'loading' ? (
                  <>
                    <Icons.Sync className="animate-spin" size={16} />
                    <span>Submitting Proof...</span>
                  </>
              ) : status === 'pending_exist' ? (
                  <span>Submission Pending Approval</span>
              ) : (
                  <span>Verify Payment</span>
              )}
          </button>
      </div>
    </div>
  );
};

export default ImminentPayment;
