import React, { useState } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface BuyAirtimeDataProps {
  type: 'airtime' | 'data';
  user: User;
  onPurchase: (amount: number, description: string) => void;
  onBack: () => void;
}

const networks = [
  { id: 'mtn', name: 'MTN', color: 'bg-yellow-400' },
  { id: 'glo', name: 'GLO', color: 'bg-emerald-500' },
  { id: 'airtel', name: 'Airtel', color: 'bg-red-500' },
  { id: '9mobile', name: '9Mobile', color: 'bg-green-700' },
];

const dataPlans = [
  { id: '100mb', name: '100MB / 1 Day', price: 100 },
  { id: '1gb', name: '1GB / 30 Days', price: 1200 },
  { id: '2gb', name: '2.5GB / 30 Days', price: 2000 },
  { id: '10gb', name: '10GB / 30 Days', price: 5000 },
  { id: 'unlimited', name: 'Unlimited / 30 Days', price: 20000 },
];

const VALID_NAIRA_CODE = 'nairaABC';

const BuyAirtimeData: React.FC<BuyAirtimeDataProps> = ({ type, user, onPurchase, onBack }) => {
  const [network, setNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [nairaCode, setNairaCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [error, setError] = useState('');

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!network) {
        setError('Please select a network provider');
        return;
    }
    if (phoneNumber.length < 11) {
        setError('Please enter a valid phone number');
        return;
    }

    if (nairaCode.trim().toUpperCase() !== VALID_NAIRA_CODE.toUpperCase()) {
        setError('Invalid Naira CODE. Please purchase a valid code to proceed.');
        return;
    }

    let purchaseAmount = 0;
    let desc = '';

    if (type === 'airtime') {
        purchaseAmount = parseFloat(amount);
        if (!purchaseAmount || purchaseAmount < 50) {
            setError('Minimum airtime amount is ₦50');
            return;
        }
        desc = `${networks.find(n => n.id === network)?.name} Airtime - ${phoneNumber}`;
    } else {
        const plan = dataPlans.find(p => p.id === selectedPlan);
        if (!plan) {
            setError('Please select a data plan');
            return;
        }
        purchaseAmount = plan.price;
        desc = `${networks.find(n => n.id === network)?.name} Data ${plan.name} - ${phoneNumber}`;
    }

    if (purchaseAmount > user.balance) {
        setError('Insufficient balance');
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
        onPurchase(purchaseAmount, desc);
        setIsLoading(false);
        setStep('success');
    }, 1200);
  };

  if (step === 'success') {
    return (
        <div className="px-4 py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
           <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2 border border-emerald-300">
              <Icons.Check size={32} className="text-emerald-700" />
          </div>
          <div>
              <h2 className="text-lg font-black text-slate-900 mb-0.5 uppercase tracking-tight">Purchase Successful!</h2>
              <p className="text-slate-500 text-xs">
                  Your {type === 'airtime' ? 'Airtime' : 'Data'} purchase was processed.
              </p>
          </div>
          <button 
              onClick={onBack}
              className="w-full max-w-sm bg-black hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all uppercase tracking-wider text-xs border border-blue-500/50"
          >
              Done
          </button>
        </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="text-center space-y-0.5">
        <div className="inline-flex items-center justify-center p-2.5 rounded-2xl mb-1 bg-black text-white border border-blue-500/50 shadow-xs">
            {type === 'airtime' ? <Icons.Airtime size={20} className="text-blue-400" /> : <Icons.Data size={20} className="text-blue-400" />}
        </div>
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Buy {type}</h2>
        <p className="text-xs text-slate-500 font-medium">Recharge your phone or data line instantly</p>
      </div>

      <form onSubmit={handlePurchase} className="space-y-3.5 bg-white p-4.5 rounded-3xl border border-pink-200 shadow-sm shadow-pink-500/5">
        {error && (
             <div className="bg-rose-50 text-rose-700 text-xs p-2.5 rounded-xl text-center border border-rose-200 font-bold">
                {error}
              </div>
        )}

        {/* Network Selection */}
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 ml-0.5 uppercase tracking-wider">Select Network</label>
            <div className="grid grid-cols-4 gap-2">
                {networks.map((net) => (
                    <div 
                        key={net.id}
                        onClick={() => setNetwork(net.id)}
                        className={`
                            cursor-pointer rounded-xl p-2 flex flex-col items-center justify-center border transition-all
                            ${network === net.id ? 'border-blue-500 bg-blue-50' : 'border-pink-200 bg-pink-50/50'}
                        `}
                    >
                        <div className={`w-6 h-6 rounded-full mb-1 ${net.color} shadow-xs`}></div>
                        <span className="text-[10px] font-bold text-slate-800">{net.name}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Phone Number */}
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 ml-0.5 uppercase tracking-wider">Phone Number</label>
            <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.User className="h-4 w-4 text-slate-400" />
                 </div>
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08012345678"
                    className="w-full pl-9 p-2.5 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-xs tracking-wider"
                />
            </div>
        </div>

        {/* Amount or Plan Selection */}
        {type === 'airtime' ? (
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 ml-0.5 uppercase tracking-wider">Amount (₦)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    className="w-full p-2.5 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-900 font-bold text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1">
                    {[100, 200, 500, 1000, 2000].map(amt => (
                        <button
                            type="button"
                            key={amt}
                            onClick={() => setAmount(amt.toString())}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors ${amount === amt.toString() ? 'bg-black text-white' : 'bg-pink-50 text-slate-700 border border-pink-200'}`}
                        >
                            ₦{amt}
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 ml-0.5 uppercase tracking-wider">Data Plan</label>
                <div className="space-y-1.5">
                    {dataPlans.map(plan => (
                        <div 
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`p-2.5 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-pink-200 bg-pink-50/50'}`}
                        >
                            <span className="font-bold text-slate-800 text-xs">{plan.name}</span>
                            <span className="font-black text-blue-700 text-xs">₦{plan.price.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Naira CODE Input */}
        <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 ml-0.5 uppercase tracking-wider">Naira CODE</label>
            <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.ShieldCheck className="h-4 w-4 text-slate-400" />
                 </div>
                <input
                    type="text"
                    value={nairaCode}
                    onChange={(e) => setNairaCode(e.target.value)}
                    placeholder="Enter Naira CODE"
                    className="w-full pl-9 p-2.5 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-xs tracking-wider"
                />
            </div>
        </div>

        {/* Black Button with Touch of Blue */}
        <button
            type="submit"
            disabled={isLoading || !network || !phoneNumber || (type === 'airtime' ? !amount : !selectedPlan) || !nairaCode}
            className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-blue-500/50 transition-all mt-2 flex items-center justify-center space-x-2 uppercase tracking-wider active:scale-95"
        >
            {isLoading ? (
                <span>Processing...</span>
            ) : (
                <>
                    <span>Buy {type === 'airtime' ? 'Airtime' : 'Data'}</span>
                    <Icons.ArrowRight size={15} className="text-blue-400" />
                </>
            )}
        </button>
      </form>
    </div>
  );
};

export default BuyAirtimeData;
