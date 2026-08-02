
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

  // If email not passed, try getting current logged in user from localStorage
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
    }, 1500);
  };

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-800">
             <Icons.ArrowLeft size={24} className="text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Imminent Activation</h2>
      </div>

      {status === 'pending_exist' && (
        <div className="bg-amber-950/90 border border-amber-600/80 p-5 rounded-3xl space-y-2 text-center animate-in zoom-in-95">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
            <Icons.Sync className="animate-spin" size={24} />
          </div>
          <h4 className="font-black text-amber-300 text-base">Activation Verification Pending</h4>
          <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
            You already submitted an activation payment proof to Service. Your request is awaiting admin review and approval. You cannot upload a new payment proof until the current submission is processed.
          </p>
        </div>
      )}

      <div className="bg-gold/10 p-4 rounded-xl border border-gold/20 shadow-sm">
        <h3 className="font-bold text-gold mb-2 flex items-center">
            <Icons.ShieldCheck className="mr-2" size={18} />
            Mandatory Activation
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed font-medium">
            New users and subscribers must complete the imminent payment to secure their account status. This is a one-time verification requirement.
        </p>
      </div>

      {/* PAY Now Section */}
      <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gold"></div>
        
        <div className="text-center space-y-1">
            <p className="text-xs font-black text-gold uppercase tracking-widest">Verification Amount</p>
            <p className="text-3xl font-black text-white">₦10,000</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left border-t border-gray-800 pt-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Bank Name</p>
            <p className="text-sm font-black text-white">{settings.companyBankName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Account Name</p>
            <p className="text-sm font-black text-white">{settings.companyAccountName}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Account Number</p>
            <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-gray-800">
              <p className="text-xl font-black text-gold tracking-wider">{settings.companyAccountNumber}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(settings.companyAccountNumber);
                  alert("Account number copied to clipboard!");
                }}
                className="p-2 bg-gold/10 text-gold rounded-lg active:scale-90 transition-transform"
              >
                <Icons.Copy size={18} />
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handlePayNow}
          className="w-full py-5 bg-gold hover:bg-gold-dark text-black font-black text-xl rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-3 group"
        >
          <Icons.Banknote size={28} className="group-hover:rotate-6 transition-transform" />
          <span className="uppercase tracking-widest">Copy Details</span>
        </button>
        
        <p className="text-[10px] text-gray-500 text-center font-medium italic">Make payment of ₦10,000 to the account above</p>
        
        <div className="bg-red-900/20 p-3 rounded-lg border border-red-800 text-center">
          <p className="text-[10px] text-red-400 font-bold leading-tight uppercase tracking-tight">
            ⚠️ DO NOT USE OPAY TO PAY FOR SUBSCRIPTION. <br/>
            PALMPAY AND ANY OTHER BANK IS ALLOWED.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-gray-800">
          {/* Payment Proof Upload */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 text-center">Step 2: Upload Payment Proof</p>
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
                className={`w-full py-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                  status === 'pending_exist' 
                    ? 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
                    : paymentProof ? 'border-green-500 bg-green-900/20' : 'border-gray-800 hover:border-gold'
                }`}
              >
                {paymentProof ? (
                  <>
                    <Icons.CheckCircle className="text-green-500" size={24} />
                    <span className="text-xs font-bold text-green-400 uppercase">Proof Uploaded</span>
                  </>
                ) : (
                  <>
                    <Icons.Upload className="text-gray-500" size={24} />
                    <span className="text-xs font-bold text-gray-500 uppercase">Click to Upload Receipt</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 text-center">Step 3: Confirm Activation</p>

          {status === 'success' && (
            <div className="bg-emerald-950/90 border border-emerald-800 p-4 rounded-xl text-center space-y-1 text-emerald-300 animate-in fade-in">
              <div className="flex items-center justify-center space-x-2">
                <Icons.CheckCircle size={22} />
                <span className="text-xs font-extrabold uppercase">Payment Proof Submitted!</span>
              </div>
              <p className="text-[11px] text-emerald-200">{noticeMessage}</p>
            </div>
          )}

          <button 
            onClick={handleSubmit} 
            disabled={status === 'loading' || status === 'success' || status === 'pending_exist'}
            className="w-full py-4 bg-gold hover:bg-gold-dark disabled:bg-gray-800 text-black disabled:text-gray-500 font-black rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 uppercase tracking-widest"
          >
              {status === 'loading' ? (
                  <>
                    <Icons.Sync className="animate-spin" size={20} />
                    <span>Submitting Proof...</span>
                  </>
              ) : status === 'pending_exist' ? (
                  <span>Submission Pending Approval</span>
              ) : (
                  <span>Verify Payment</span>
              )}
          </button>

          <div className="bg-gray-900 p-3 rounded-lg text-center border border-gray-800">
            <p className="text-[10px] text-gray-500 font-medium leading-tight">
                Our security protocol will automatically match your transaction ID. <br/>
                <span className="font-bold">Avoid duplicate activation attempts.</span>
            </p>
          </div>
      </div>
    </div>
  );
};

export default ImminentPayment;
