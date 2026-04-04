import React from 'react';

const PromoSection: React.FC = () => {
  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-sm mt-4 transition-colors duration-200 border border-gray-800">
      <div className="grid grid-cols-2 gap-3">
        {/* Fixed Savings Card */}
        <div className="bg-green-neon/10 rounded-xl p-3 relative overflow-hidden border border-green-neon/20 transition-colors">
             {/* Hot Badge */}
            <div className="absolute top-0 right-0">
                <div className="w-0 h-0 border-t-[40px] border-t-green-neon border-l-[40px] border-l-transparent absolute top-0 right-0"></div>
                <span className="absolute top-1 right-1 text-black text-[10px] font-bold rotate-45">HOT</span>
            </div>
            
            <h3 className="text-green-neon font-bold text-sm mb-1">Fixed Savings</h3>
            <p className="text-xs text-gray-400 mb-2 leading-tight">Get Cash Reward on Deposit</p>
            <p className="text-green-400 font-bold text-lg">₦20,000</p>
            <p className="text-[10px] text-gray-500 mb-3">Cash</p>
            <button className="bg-green-neon hover:bg-green-dark text-black text-xs font-bold py-1.5 px-6 rounded-full w-full shadow-md transition-all">
                Claim
            </button>
        </div>

        {/* SmartEarn Card */}
        <div className="bg-green-neon/10 rounded-xl p-3 relative border border-green-neon/20 transition-colors">
            <h3 className="text-green-neon font-bold text-sm mb-1">SmartEarn</h3>
            <p className="text-xs text-gray-400 mb-2 leading-tight">Save Smarter, Earn PLUS Return</p>
            <p className="text-green-400 font-bold text-lg">21.26%</p>
            <p className="text-[10px] text-gray-500 mb-3">Annual Yield</p>
            <button className="bg-green-neon hover:bg-green-dark text-black text-xs font-bold py-1.5 px-6 rounded-full w-full shadow-md transition-all">
                Save
            </button>
        </div>
      </div>
      
      <div className="text-center mt-3">
        <button className="text-xs text-gray-500 hover:text-green-neon flex items-center justify-center mx-auto transition-colors">
            More Wealth Product <span className="ml-1">›</span>
        </button>
      </div>
    </div>
  );
};

export default PromoSection;