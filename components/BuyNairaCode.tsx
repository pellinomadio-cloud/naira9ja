
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useAppSettings } from '../appSettings';
import { submitPaymentProof, getUserPendingSubmission } from '../paymentService';

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
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeEmail]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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
        amount: 7000,
        itemDescription: 'Naira CODE Voucher Activation (₦7,000)',
        proofFileName: proofFile.name,
        proofDataUrl: proofDataUrl,
        codeAmount: 7000
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

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.4)]"></div>
        <p className="text-cyan-500 font-black uppercase tracking-widest animate-pulse drop-shadow-[0_0_4px_rgba(6,182,212,0.3)]">fetching management account...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="text-center">
         <h2 className="text-xl font-bold text-black uppercase tracking-tighter">Buy Naira CODE</h2>
         <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Follow the steps below to get your code</p>
      </div>

      {status === 'pending_exist' && (
        <div className="bg-amber-950/90 border border-amber-600/80 p-5 rounded-3xl space-y-2 text-center animate-in zoom-in-95 text-amber-200">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
            <Icons.Sync className="animate-spin" size={24} />
          </div>
          <h4 className="font-black text-amber-300 text-base">CODE Verification Pending</h4>
          <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
            You already submitted a Naira CODE payment proof to Service. Your request is awaiting admin review and approval. You cannot upload a new payment proof until the current submission is processed.
          </p>
        </div>
      )}

      {/* Selected Plan Summary */}
      <div className="bg-white p-4 rounded-xl flex justify-between items-center border border-gray-100 shadow-sm">
        <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Service</p>
            <h3 className="text-lg font-bold text-black">Naira CODE Activation</h3>
        </div>
        <div className="text-right">
            <p className="text-lg font-extrabold text-black">₦7,000</p>
            <p className="text-xs text-gray-400 uppercase">One-time</p>
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
              <span className="text-lg font-black text-black uppercase tracking-tighter">{settings.companyBankName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 uppercase font-bold">Account Name</span>
              <span className="text-sm font-black text-black uppercase tracking-tighter">{settings.companyAccountName}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg flex items-start space-x-2">
            <Icons.AlertTriangle size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-tight font-medium uppercase">
              Ensure you pay exactly ₦7,000 for Naira CODE. Verification is manual by Service Admin.
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
            disabled={status === 'pending_exist'}
            onChange={handleFileChange}
            className="hidden" 
            id="proof-upload"
          />
          <label 
            htmlFor="proof-upload"
            className={`w-full py-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
              status === 'pending_exist'
                ? 'border-gray-200 bg-gray-100/60 opacity-60 cursor-not-allowed'
                : proofFile ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-black'
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

      {status === 'success' && (
        <div className="bg-emerald-900 text-white p-4 rounded-xl text-center space-y-1 animate-in fade-in">
          <div className="flex items-center justify-center space-x-2">
            <Icons.CheckCircle size={22} className="text-emerald-400" />
            <span className="text-xs font-extrabold uppercase">Payment Proof Submitted!</span>
          </div>
          <p className="text-[11px] text-emerald-200">{noticeMessage}</p>
        </div>
      )}

      {/* Confirm Button */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-center">Step 3: Confirm Payment</p>
        <button 
            onClick={handleConfirm}
            disabled={status === 'submitting' || status === 'success' || status === 'pending_exist'}
            className={`w-full py-4 rounded-xl text-white font-black text-lg shadow-lg transition-all flex items-center justify-center space-x-2 ${
                status === 'submitting' || status === 'success' || status === 'pending_exist'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 transform active:scale-95'
            }`}
        >
            {status === 'submitting' ? (
              <>
                <Icons.Sync className="animate-spin" size={20} />
                <span className="uppercase tracking-widest">Submitting Proof...</span>
              </>
            ) : status === 'pending_exist' ? (
              <span className="uppercase tracking-widest text-xs">Submission Pending Approval</span>
            ) : (
              <>
                <Icons.ShieldCheck size={20} />
                <span className="uppercase tracking-widest">Confirm Payment</span>
              </>
            )}
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

export default BuyNairaCode;
