
import React from 'react';

const Banner: React.FC = () => {
  return (
    <div className="mt-4 mb-20 relative rounded-2xl overflow-hidden border border-[#212552] shadow-xl">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950 via-indigo-950 to-[#0f112a]"></div>
      
      <div className="relative p-5 flex justify-between items-center z-10">
        <div className="flex-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Learn & Earn Guarantee</span>
            <h3 className="text-white font-extrabold text-lg mb-1 tracking-tight">Level Up Your Skills & Income</h3>
            <p className="text-slate-300 text-xs font-medium mb-3 max-w-[210px] leading-relaxed">
                Complete daily tasks, answer quizzes, and withdraw rewards instantly to your bank account.
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold py-2 px-5 rounded-xl shadow-[0_4px_15px_rgba(124,58,237,0.4)] hover:brightness-110 active:scale-95 transition-all">
                Start Learning Now
            </button>
            
            <div className="flex space-x-1.5 mt-3">
                <div className="w-4 h-1.5 rounded-full bg-purple-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;

