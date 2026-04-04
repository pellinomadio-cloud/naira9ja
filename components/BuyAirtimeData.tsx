
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
  { id: 'glo', name: 'GLO', color: 'bg-green-500' },
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

    if (nairaCode !== VALID_NAIRA_CODE) {
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
    }, 1500);
  };

  if (step === 'success') {
    return (
        <div className="px-4 py-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-300">
           <div className="w-24 h-24 bg-green-neon/10 rounded-full flex items-center justify-center mb-4">
              <Icons.Check size={48} className="text-green-neon" />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-tighter">Purchase Successful!</h2>
              <p className="text-gray-500 text-sm">
                  Your {type === 'airtime' ? 'Airtime' : 'Data'} purchase was successful.
              </p>
          </div>
          <button 
              onClick={onBack}
              className="w-full max-w-sm bg-green-neon text-black font-black py-4 rounded-xl shadow-xl transition-all uppercase tracking-widest"
          >
              Done
          </button>
        </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <div className={`inline-flex items-center justify-center p-3 rounded-full mb-2 bg-green-neon/10 text-green-neon`}>
            {type === 'airtime' ? <Icons.Airtime size={32} /> : <Icons.Data size={32} />}
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">Buy {type}</h2>
      </div>

      <form onSubmit={handlePurchase} className="space-y-6">
        {error && (
             <div className="bg-red-900/20 text-red-400 text-sm p-3 rounded-xl text-center border border-red-800 animate-pulse font-bold">
                {error}
              </div>
        )}

        {/* Network Selection */}
        <div>
            <label className="block text-xs font-black text-gray-500 mb-2 ml-1 uppercase tracking-widest">Select Network</label>
            <div className="grid grid-cols-4 gap-2">
                {networks.map((net) => (
                    <div 
                        key={net.id}
                        onClick={() => setNetwork(net.id)}
                        className={`
                            cursor-pointer rounded-xl p-2 flex flex-col items-center justify-center border transition-all
                            ${network === net.id ? 'border-green-neon bg-green-neon/5' : 'border-gray-800 bg-gray-900'}
                        `}
                    >
                        <div className={`w-8 h-8 rounded-full mb-1 ${net.color} shadow-sm`}></div>
                        <span className="text-[10px] font-bold text-gray-300">{net.name}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Phone Number */}
        <div>
            <label className="block text-xs font-black text-gray-500 mb-1 ml-1 uppercase tracking-widest">Phone Number</label>
            <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.User className="h-5 w-5 text-gray-500" />
                 </div>
                <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08012345678"
                    className="w-full pl-10 p-4 bg-gray-900 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-green-neon outline-none font-mono text-lg tracking-wide"
                />
            </div>
        </div>

        {/* Amount or Plan Selection */}
        {type === 'airtime' ? (
            <div>
                <label className="block text-xs font-black text-gray-500 mb-1 ml-1 uppercase tracking-widest">Amount (₦)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                    className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white font-black text-xl focus:ring-2 focus:ring-green-neon outline-none"
                />
                <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
                    {[100, 200, 500, 1000, 2000].map(amt => (
                        <button
                            type="button"
                            key={amt}
                            onClick={() => setAmount(amt.toString())}
                            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-colors ${amount === amt.toString() ? 'bg-green-neon text-black' : 'bg-gray-800 text-gray-300 hover:bg-green-neon/10 hover:text-green-neon'}`}
                        >
                            ₦{amt}
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            <div>
                <label className="block text-xs font-black text-gray-500 mb-1 ml-1 uppercase tracking-widest">Data Plan</label>
                <div className="space-y-2">
                    {dataPlans.map(plan => (
                        <div 
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-green-neon bg-green-neon/5' : 'border-gray-800 bg-gray-900'}`}
                        >
                            <span className="font-black text-white text-sm uppercase tracking-tight">{plan.name}</span>
                            <span className="font-black text-green-neon">₦{plan.price.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Naira CODE Input */}
        <div>
            <label className="block text-xs font-black text-gray-500 mb-1 ml-1 uppercase tracking-widest">Naira CODE</label>
            <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.ShieldCheck className="h-5 w-5 text-gray-500" />
                 </div>
                <input
                    type="text"
                    value={nairaCode}
                    onChange={(e) => setNairaCode(e.target.value)}
                    placeholder="Enter Naira CODE"
                    className="w-full pl-10 p-4 bg-gray-900 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-green-neon outline-none font-mono text-lg tracking-widest placeholder:text-gray-700"
                />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 ml-1 font-bold uppercase">Required to perform this transaction</p>
        </div>

        <button
            type="submit"
            disabled={isLoading || !network || !phoneNumber || (type === 'airtime' ? !amount : !selectedPlan) || !nairaCode}
            className="w-full py-4 bg-green-neon hover:bg-green-dark disabled:bg-gray-800 text-black font-black rounded-xl shadow-xl transition-all mt-4 flex items-center justify-center space-x-2 uppercase tracking-widest animate-pulse"
        >
            {isLoading ? (
                <span>Processing...</span>
            ) : (
                <>
                    <span>Buy {type === 'airtime' ? 'Airtime' : 'Data'}</span>
                    <Icons.ArrowRight size={20} />
                </>
            )}
        </button>
      </form>
    </div>
  );
};

export default BuyAirtimeData;
