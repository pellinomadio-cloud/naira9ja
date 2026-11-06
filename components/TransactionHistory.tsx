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
    <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="text-center space-y-0.5">
        <h2 className="text-lg font-black text-slate-900">Transaction History</h2>
        <p className="text-xs text-slate-500 font-medium">Your financial activities and payouts</p>
      </div>

      <div className="bg-white rounded-3xl border border-pink-200 shadow-sm shadow-pink-500/5 overflow-hidden">
        <div className="divide-y divide-pink-100">
            
            {/* Transaction List */}
            {transactions.length > 0 ? (
                transactions.map((trx) => (
                    <div 
                      key={trx.id} 
                      onClick={() => onTransactionClick?.(trx)}
                      className="p-3.5 hover:bg-pink-50/50 transition-colors flex items-center justify-between cursor-pointer active:opacity-75 group"
                    >
                        <div className="flex items-center space-x-2.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                trx.status === 'pending'
                                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                : trx.type === 'credit' 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                                : 'bg-rose-100 text-rose-700 border border-rose-300'
                            }`}>
                                {
                                    trx.status === 'pending' ? <Icons.Clock size={16} /> :
                                    trx.description.includes('Welcome') ? <Icons.ArrowDown size={16} /> : 
                                    trx.description.includes('Task') ? <Icons.Card size={16} /> :
                                    trx.description.includes('Reward') ? <Icons.Gift size={16} /> :
                                    trx.type === 'credit' ? <Icons.ArrowDown size={16} /> : 
                                    <Icons.ArrowUp size={16} />
                                }
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                                    {trx.description}
                                </h4>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {formatDate(trx.date)}
                                    </p>
                                    {trx.status === 'pending' && (
                                        <span className="text-[8px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded uppercase">
                                          Pending • Tier 2 Req.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex items-center space-x-2">
                            <div>
                                <p className={`text-xs font-black ${
                                    trx.status === 'pending' ? 'text-amber-700' :
                                    trx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                                }`}>
                                    {trx.type === 'credit' ? '+' : '-'}₦{trx.amount.toLocaleString()}
                                </p>
                                <span className={`inline-block mt-0.5 text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                                  trx.status === 'success' || trx.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {trx.status}
                                </span>
                            </div>
                            <Icons.ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                    </div>
                ))
            ) : (
                 <div className="p-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">No transactions found.</p>
                </div>
            )}

        </div>
      </div>
      
      <div className="text-center pb-6">
          <p className="text-[10px] text-slate-400 font-medium italic">Click on any transaction to view detailed receipt</p>
      </div>
    </div>
  );
};

export default TransactionHistory;
