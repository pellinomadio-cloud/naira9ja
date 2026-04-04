
import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from './Icons';

interface Feedback {
  user: string;
  message: string;
  amount: string;
  time: string;
}

const names = ["Sarah J.", "Kelechi O.", "Amina W.", "David E.", "Chidi P.", "Bisi A.", "Olamide R.", "Chioma N.", "Emeka U.", "Adewale K.", "Yusuf M.", "Ngozi S.", "Tunde V.", "Fatima B.", "Samuel L.", "Zainab H.", "Musa G.", "Blessing I.", "Emmanuel T.", "Grace Q."];

const messageTemplates = [
  "Just received my bonus and it's already helping with my bills! Earnix9ja is amazing.",
  "The VIP upgrade is totally worth it. My grant was processed in minutes!",
  "Finally a platform that actually pays out daily rewards without stress. Highly recommended.",
  "Referral program is legit. Shared with my friends and my withdrawal limit increased.",
  "Airtime purchase was instant. Faster than my regular bank app. Earnix9ja to the world!",
  "Used the business hub funds to restock my shop. This is a game changer for SMEs.",
  "Withdrawal to my Kuda account was lightning fast. 10/10 experience.",
  "I was skeptical at first, but my first 50k withdrawal just landed. Wow!",
  "The interface is so smooth and the rewards are real. Best financial app in Nigeria.",
  "Joined 2 days ago and I've already earned back my subscription through rewards."
];

const amounts = ["₦10,000", "₦50,000", "₦100,000", "₦2,000,000", "₦500,000", "₦2,500", "₦20,000", "₦150,000", "₦75,000", "₦1,000,000"];

const times = ["Just now", "1 min ago", "2 mins ago", "3 mins ago", "4 mins ago", "5 mins ago", "10 mins ago"];

interface NotificationFeedProps {
  onBack: () => void;
}

const NotificationFeed: React.FC<NotificationFeedProps> = ({ onBack }) => {
  const generateRandomFeedback = useCallback((): Feedback => {
    const name = names[Math.floor(Math.random() * names.length)];
    const message = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const time = times[Math.floor(Math.random() * times.length)];
    return { user: name, message, amount, time };
  }, []);

  const [currentFeedback, setCurrentFeedback] = useState<Feedback>(generateRandomFeedback());
  const [key, setKey] = useState(0); // Used to trigger animation on content change

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeedback(generateRandomFeedback());
      setKey(prev => prev + 1);
    }, 4000); 

    return () => clearInterval(interval);
  }, [generateRandomFeedback]);

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 min-h-[70vh] flex flex-col">
      <div className="flex items-center space-x-2">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-800 transition-colors">
             <Icons.ArrowLeft size={24} className="text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">Live Success Stories</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 pb-8">
        {/* Animated Feedback Card */}
        <div 
          key={key} 
          className="w-full bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-800 animate-in zoom-in-95 fade-in duration-500 relative overflow-hidden"
        >
           {/* Decorative Quote Mark */}
           <div className="absolute top-4 right-6 opacity-10">
              <Icons.MessageCircle size={80} className="text-gold" />
           </div>

           <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-black font-bold text-lg shadow-inner">
                {currentFeedback.user.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white">{currentFeedback.user}</h3>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{currentFeedback.time}</p>
              </div>
           </div>

           <p className="text-lg text-gray-300 italic leading-relaxed font-medium mb-6">
              "{currentFeedback.message}"
           </p>

           <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Status: VERIFIED SUCCESS</span>
              </div>
              <span className="text-xl font-black text-gold">{currentFeedback.amount}</span>
           </div>
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-full shadow-sm border border-gray-800">
           <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
           </div>
           <span className="text-[10px] font-black text-gold uppercase tracking-widest">Thousands of users sharing success</span>
        </div>
      </div>

      {/* VIP Feedback Instruction */}
      <div className="bg-gold/5 p-5 rounded-2xl border border-gold/10 space-y-3 shadow-sm">
         <div className="flex items-center space-x-2 text-gold">
            <Icons.Zap size={18} fill="currentColor" />
            <h4 className="text-xs font-black uppercase tracking-widest">Post Your Success Story</h4>
         </div>
         <p className="text-xs text-gold/70 font-medium leading-relaxed">
            Want to see your feedback here? Access to drop success stories is exclusive to <span className="font-bold">VIP Members</span> only. 
            Join the elite circle to share your journey!
         </p>
         <div className="pt-1">
            <button 
                onClick={onBack} 
                className="text-[10px] font-black text-gold underline uppercase tracking-tighter"
            >
                Return to Dashboard to Upgrade
            </button>
         </div>
      </div>

      <div className="bg-gray-900 p-4 rounded-2xl text-center border border-gray-800">
         <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">
            Live Feed: Real-time Member Testimonials
         </p>
      </div>
    </div>
  );
};

export default NotificationFeed;
