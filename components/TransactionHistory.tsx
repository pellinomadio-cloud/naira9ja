
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
        <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
        <p className="text-xs text-gray-400 font-medium">Your recent financial activities.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
            
            {/* Transaction List */}
            {transactions.length > 0 ? (
                transactions.map((trx) => (
                    <div 
                      key={trx.id} 
                      onClick={() => onTransactionClick?.(trx)}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer active:opacity-70 group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                trx.status === 'pending'
                                ? 'bg-orange-50 text-orange-500'
                                : trx.type === 'credit' 
                                ? 'bg-green-50 text-green-500' 
                                : 'bg-red-50 text-red-500'
                            }`}>
                                {
                                    trx.status === 'pending' ? <Icons.Clock size={20} /> :
                                    trx.description.includes('Welcome') ? <Icons.Gift size={20} /> : 
                                    trx.description.includes('Reward') ? <Icons.Reward size={20} /> :
                                    trx.description.includes('Airtime') ? <Icons.Airtime size={20} /> :
                                    trx.description.includes('Data') ? <Icons.Data size={20} /> :
                                    trx.type === 'credit' ? <Icons.ArrowDownLeft size={20} /> : 
                                    <Icons.ArrowUpRight size={20} />
                                }
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800 truncate max-w-[150px]">
                                    {trx.description}
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        {trx.type === 'credit' ? 'Received' : 'Sent'}
                                    </p>
                                    {trx.status === 'pending' && (
                                        <span className="text-[8px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded uppercase">Pending</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                            <div>
                                <p className={`text-sm font-bold ${
                                    trx.status === 'pending' ? 'text-orange-500' :
                                    trx.type === 'credit' ? 'text-green-500' : 'text-gray-800'
                                }`}>
                                    {trx.type === 'credit' ? '+' : '-'}₦{trx.amount.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium">{formatDate(trx.date)}</p>
                            </div>
                            <Icons.ChevronRight size={16} className="text-gray-200 group-hover:text-primary-blue transition-colors" />
                        </div>
                    </div>
                ))
            ) : (
                 <div className="p-8 text-center">
                    <p className="text-sm text-gray-400 font-medium">No transactions found.</p>
                </div>
            )}

        </div>
      </div>
      
      <div className="text-center pb-10">
          <p className="text-[10px] text-gray-400 font-medium italic">Click on any transaction to view receipt</p>
      </div>
    </div>
  );
};

export default TransactionHistory;
