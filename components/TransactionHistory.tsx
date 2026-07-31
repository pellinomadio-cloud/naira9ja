
import React from 'react';
import { Icons } from './Icons';
import { User, Transaction } from '../types';

interface TransactionHistoryProps {
  user: User;
  onTransactionClick?: (transaction: Transaction) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ user, onTransactionClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const transactions = user.transactions || [];

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
        <p className="text-xs text-slate-400 font-medium">Your recent financial activities.</p>
      </div>

      <div className="bg-[#12142e] rounded-2xl border border-[#212552] shadow-xl overflow-hidden">
        <div className="divide-y divide-[#1e2246]">
            
            {/* Transaction List */}
            {transactions.length > 0 ? (
                transactions.map((trx) => (
                    <div 
                      key={trx.id} 
                      onClick={() => onTransactionClick?.(trx)}
                      className="p-4 hover:bg-[#1a1d42] transition-colors flex items-center justify-between cursor-pointer active:opacity-70 group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                trx.status === 'pending'
                                ? 'bg-amber-950/80 text-amber-400 border border-amber-700/50'
                                : trx.type === 'credit' 
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50' 
                                : 'bg-rose-950/80 text-rose-400 border border-rose-700/50'
                            }`}>
                                {
                                    trx.status === 'pending' ? <Icons.Clock size={20} /> :
                                    trx.description.includes('Welcome') ? <Icons.ArrowDown size={20} /> : 
                                    trx.description.includes('Task') ? <Icons.Card size={20} /> :
                                    trx.description.includes('Reward') ? <Icons.Gift size={20} /> :
                                    trx.type === 'credit' ? <Icons.ArrowDown size={20} /> : 
                                    <Icons.ArrowUp size={20} />
                                }
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white truncate max-w-[150px]">
                                    {trx.description}
                                </h4>
                                <div className="flex items-center space-x-2 mt-0.5">
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {formatDate(trx.date)}
                                    </p>
                                    {trx.status === 'pending' && (
                                        <span className="text-[8px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded uppercase">Pending</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                            <div>
                                <p className={`text-sm font-bold ${
                                    trx.status === 'pending' ? 'text-amber-400' :
                                    trx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                    {trx.type === 'credit' ? '+' : '-'}₦{trx.amount.toLocaleString()}
                                </p>
                                <span className={`inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  trx.status === 'success' || trx.status === 'completed'
                                    ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/40' 
                                    : 'bg-indigo-950/90 text-indigo-300 border border-indigo-800/40'
                                }`}>
                                  {trx.status === 'success' ? 'Success' : trx.status}
                                </span>
                            </div>
                            <Icons.ChevronRight size={16} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                        </div>
                    </div>
                ))
            ) : (
                 <div className="p-8 text-center">
                    <p className="text-sm text-slate-400 font-medium">No transactions found.</p>
                </div>
            )}

        </div>
      </div>
      
      <div className="text-center pb-10">
          <p className="text-[10px] text-slate-500 font-medium italic">Click on any transaction to view receipt</p>
      </div>
    </div>
  );
};

export default TransactionHistory;

