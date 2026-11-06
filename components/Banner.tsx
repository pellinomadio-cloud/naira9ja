
import React from 'react';

const Banner: React.FC = () => {
  return (
    <div className="mt-3 mb-16 relative rounded-2xl overflow-hidden border border-pink-200 shadow-sm shadow-pink-500/5 bg-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-white to-pink-100/60"></div>
      
      <div className="relative p-4 flex justify-between items-center z-10">
        <div className="flex-1">
            <span className="text-[9px] font-black text-pink-700 uppercase tracking-wider bg-pink-100/80 px-2 py-0.5 rounded-full border border-pink-200">Learn & Earn Guarantee</span>
            <h3 className="text-slate-900 font-extrabold text-sm mb-0.5 mt-1.5 tracking-tight">Level Up Your Skills & Income</h3>
            <p className="text-slate-600 text-xs font-medium mb-2.5 max-w-[210px] leading-relaxed">
                Complete daily tasks, answer quizzes, and withdraw rewards instantly to your bank account.
            </p>
            <button className="bg-black hover:bg-slate-900 text-white text-xs font-bold py-1.5 px-4 rounded-xl shadow-[0_2px_8px_rgba(37,99,235,0.2)] border border-blue-500/40 active:scale-95 transition-all">
                Start Learning Now
            </button>
            
            <div className="flex space-x-1.5 mt-2.5">
                <div className="w-3.5 h-1 rounded-full bg-blue-600"></div>
                <div className="w-1 h-1 rounded-full bg-pink-300"></div>
                <div className="w-1 h-1 rounded-full bg-pink-300"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;

