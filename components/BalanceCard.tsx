import React, { useState } from 'react';
import { Icons } from './Icons';

interface BalanceCardProps {
  balance: number;
  onHistoryClick?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, onHistoryClick }) => {
  const formatCurrency = (amount: number) => {
    return '₦' + amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-primary-blue rounded-2xl p-5 mb-4 relative overflow-hidden shadow-medium">
        <div className="flex justify-between items-center mb-2">
            <span className="text-white/80 text-xs font-medium uppercase tracking-wider">Available Balance</span>
            <button 
              onClick={onHistoryClick}
              className="text-white/90 text-xs font-medium flex items-center hover:text-white transition-colors"
            >
              History <Icons.ChevronRight size={14} className="ml-0.5" />
            </button>
        </div>

        <div className="flex items-baseline">
            <h1 className="text-3xl font-bold text-white tracking-tight">
                {formatCurrency(balance)}
            </h1>
        </div>
    </div>
  );
};

export default BalanceCard;