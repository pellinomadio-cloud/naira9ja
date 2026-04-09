import React from 'react';
import { Icons } from './Icons';

const PromoSection: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Secondary Promo Row (Optional but adds to the aesthetic) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 mb-3">
            <Icons.Savings size={20} />
          </div>
          <h4 className="text-xs font-bold text-gray-800">Fixed Savings</h4>
          <p className="text-[10px] text-gray-400 mt-1">Earn up to 20% p.a.</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500 mb-3">
            <Icons.Zap size={20} />
          </div>
          <h4 className="text-xs font-bold text-gray-800">SmartEarn</h4>
          <p className="text-[10px] text-gray-400 mt-1">Daily returns on cash</p>
        </div>
      </div>
    </div>
  );
};

export default PromoSection;