import React from 'react';
import { Icons } from './Icons';
import { Transaction } from '../types';

interface TransactionReceiptProps {
  transaction: Transaction;
  userName: string;
  onBack: () => void;
  onUpgradeToTier2?: () => void;
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({ 
  transaction, 
  userName, 
  onBack,
  onUpgradeToTier2 
}) => {
  const isCredit = transaction.type === 'credit';
  const isPending = transaction.status === 'pending';
  const isWithdrawal = transaction.description.toLowerCase().includes('withdraw');
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in zoom-in-95 duration-500 pb-16">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-pink-100 transition-colors">
          <Icons.ArrowLeft size={20} className="text-slate-800" />
        </button>
        <h2 className="text-base font-black text-slate-900">Transaction Receipt</h2>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-pink-200 overflow-hidden relative">
        <div className="p-6 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center font-black italic text-base border border-blue-500/50 shadow-xs">
            LE
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction Status</p>
            {isPending ? (
              <div className="flex items-center justify-center space-x-1.5 text-amber-700 mt-1 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Icons.Clock size={13} className="animate-spin text-amber-600" />
                <span className="text-xs font-black uppercase">Pending Approval</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-1.5 text-emerald-700 mt-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Icons.CheckCircle size={13} className="text-emerald-600" />
                <span className="text-xs font-black uppercase">Successful</span>
              </div>
            )}
          </div>

          <div className="py-1">
            <h3 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">
              {isCredit ? '+' : '-'}₦{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>

          {/* If Pending Withdrawal, show Compulsory Tier 2 Upgrade Notice */}
          {isPending && isWithdrawal && (
            <div className="bg-rose-50 border border-rose-300 p-3 rounded-2xl w-full text-left space-y-1">
              <div className="flex items-center space-x-1.5 text-rose-700">
                <Icons.AlertTriangle size={14} className="shrink-0 text-rose-600" />
                <span className="text-[11px] font-black uppercase tracking-wide">Compulsory: Tier 2 Upgrade Required</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                Without upgrading your account to Tier 2 (Level 2), this pending withdrawal cannot be disbursed or successful.
              </p>
            </div>
          )}

          <div className="w-full space-y-2.5 pt-3 border-t border-dashed border-pink-200 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Type</span>
              <span className="font-bold text-slate-800 capitalize">{transaction.type}</span>
            </div>
            
            <div className="flex justify-between items-start text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Description</span>
              <span className="font-bold text-slate-800 text-right max-w-[180px] break-words">
                {transaction.description}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Account User</span>
              <span className="font-bold text-slate-800">{userName}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Date</span>
              <span className="font-medium text-slate-700 text-right">
                {formatDate(transaction.date)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Ref ID</span>
              <span className="font-mono font-bold text-blue-700 text-[11px]">{transaction.id}</span>
            </div>
          </div>

          <div className="pt-2 w-full">
            <div className="bg-pink-50 p-2 rounded-xl flex items-center justify-center space-x-1.5 border border-pink-200">
              <Icons.ShieldCheck size={14} className="text-blue-600" />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tight">Verified by LearnEarn Security</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {isPending && isWithdrawal && onUpgradeToTier2 && (
          <button 
            onClick={onUpgradeToTier2}
            className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl border border-blue-500/50 shadow-[0_2px_10px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center space-x-1.5 uppercase tracking-wider active:scale-95"
          >
            <Icons.TrendingUp size={15} className="text-blue-400" />
            <span>Upgrade to Tier 2 Now (Compulsory)</span>
          </button>
        )}

        <div className="flex space-x-2">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Transaction Receipt',
                  text: `Transaction of ₦${transaction.amount.toLocaleString()} is ${transaction.status} on LearnEarn. Ref: ${transaction.id}`
                });
              } else {
                alert('Receipt copied for sharing');
              }
            }}
            className="flex-1 py-2 px-3 bg-white hover:bg-pink-50 text-slate-800 font-bold text-xs rounded-xl border border-pink-200 shadow-2xs transition-all flex items-center justify-center space-x-1.5"
          >
            <Icons.Share2 size={14} className="text-blue-600" />
            <span>Share</span>
          </button>
          <button 
            onClick={onBack}
            className="flex-1 py-2 px-3 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl border border-blue-500/40 shadow-2xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;
