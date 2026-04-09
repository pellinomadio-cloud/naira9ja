
import React from 'react';
import { Icons } from './Icons';

const Banner: React.FC = () => {
  return (
    <div className="mt-6 mb-24 relative rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800"></div>
      
      <div className="relative p-5 flex justify-between items-center">
        <div className="flex-1 z-10">
            <h3 className="text-white font-black text-xl mb-1 tracking-tight">Financial Freedom</h3>
            <p className="text-white/80 text-xs font-medium mb-4 max-w-[180px] leading-relaxed">
                Unlock your potential with easy credit. Quick loans ready for you.
            </p>
            <button className="bg-white text-black text-xs font-bold py-2 px-6 rounded-full shadow-sm active:scale-95 transition-transform">
                Get Started
            </button>
            
             {/* Pagination Dots Simulation */}
            <div className="flex space-x-1.5 mt-4">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/30"></div>
            </div>
        </div>

        {/* Illustrations */}
        <div className="absolute right-0 bottom-0 h-full w-1/2 flex items-end justify-end pointer-events-none">
             <img 
                src="https://picsum.photos/seed/finance/300/200" 
                alt="Growth" 
                className="object-cover h-full w-full opacity-40 mix-blend-overlay" 
                referrerPolicy="no-referrer"
             />
        </div>
      </div>
    </div>
  );
};

export default Banner;
