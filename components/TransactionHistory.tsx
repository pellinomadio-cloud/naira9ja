
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
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Transaction History</h2>
        <p className="text-sm text-gray-500">Your recent financial activities.</p>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-hidden">
        <div className="divide-y divide-gray-800">
            
            {/* Transaction List */}
            {transactions.length > 0 ? (
                transactions.map((trx) => (
                    <div 
                      key={trx.id} 
                      onClick={() => onTransactionClick?.(trx)}
                      className="p-4 hover:bg-gray-800 transition-colors flex items-center justify-between cursor-pointer active:opacity-70 group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                trx.status === 'pending'
                                ? 'bg-orange-900/30 text-orange-400'
                                : trx.type === 'credit' 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-red-900/30 text-red-400'
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
                                <h4 className="text-sm font-bold text-white truncate max-w-[150px]">
                                    {trx.description}
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <p className="text-xs text-gray-500">
                                        {trx.type === 'credit' ? 'Received' : 'Sent'}
                                    </p>
                                    {trx.status === 'pending' && (
                                        <span className="text-[8px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded uppercase">Pending</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                            <div>
                                <p className={`text-sm font-bold ${
                                    trx.status === 'pending' ? 'text-orange-500' :
                                    trx.type === 'credit' ? 'text-green-400' : 'text-white'
                                }`}>
                                    {trx.type === 'credit' ? '+' : '-'}₦{trx.amount.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-gray-500">{formatDate(trx.date)}</p>
                            </div>
                            <Icons.ChevronRight size={16} className="text-gray-700 group-hover:text-green-neon transition-colors" />
                        </div>
                    </div>
                ))
            ) : (
                 <div className="p-8 text-center">
                    <p className="text-sm text-gray-500">No transactions found.</p>
                </div>
            )}

        </div>
      </div>
      
      {transactions.length === 0 && (
        <div className="bg-green-neon/5 border border-green-neon/10 p-4 rounded-xl flex items-start space-x-3">
            <Icons.FileText className="text-green-neon mt-0.5" size={20} />
            <div className="flex-1">
                <p className="text-sm font-bold text-green-neon">Start Transacting</p>
                <p className="text-xs text-green-neon/70 mt-1">
                    Your financial history will appear here.
                </p>
            </div>
        </div>
      )}
      <div className="text-center pb-10">
          <p className="text-[10px] text-gray-500 font-medium">Click on any transaction to view receipt</p>
      </div>
    </div>
  );
};

export default TransactionHistory;
