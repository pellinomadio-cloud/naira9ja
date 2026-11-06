import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface ImminentDeactivationNotificationProps {
  expiryDate: number;
}

const ImminentDeactivationNotification: React.FC<ImminentDeactivationNotificationProps> = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = expiryDate - now;

      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }

      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  return (
    <div className="bg-white rounded-2xl p-3 text-slate-900 shadow-sm shadow-rose-500/10 mb-2.5 animate-pulse border-2 border-rose-400">
      <div className="flex items-center justify-between mb-1">
         <div className="flex items-center space-x-1.5">
             <Icons.AlertTriangle size={15} className="text-rose-600" />
             <span className="text-xs font-black uppercase tracking-tight text-rose-600">Deactivation Imminent</span>
         </div>
         <div className="bg-rose-100 px-2 py-0.5 rounded-lg text-xs font-mono font-black text-rose-800 border border-rose-300">
            {timeLeft}
         </div>
      </div>
      <p className="text-[11px] text-center font-medium leading-tight bg-rose-50 p-2 rounded-xl border border-rose-200 text-slate-800">
         To prevent closure, pay <strong className="text-rose-600 font-bold">₦10,000</strong>. Use the activation button on your dashboard.
      </p>
    </div>
  );
};

export default ImminentDeactivationNotification;
