import React, { useState } from 'react';
import { Icons } from './Icons';

interface LoginProps {
  onLogin: (email: string, name: string) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPassword(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password.length !== 4) {
      setError('Please enter your 4-digit PIN');
      setIsLoading(false);
      return;
    }
    
    setTimeout(() => {
      const existingUsersStr = localStorage.getItem('naira9ja_users');
      const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : {};
      const safeEmail = (email || '').trim().toLowerCase();
      const user = existingUsers[safeEmail];

      if (user) {
        onLogin(safeEmail, user.name);
        setIsLoading(false);
      } else {
        setError('Account not registered on this device.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fff1f5] text-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-1.5">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-[0_2px_10px_rgba(37,99,235,0.25)] border border-blue-500/50">
            <Icons.GraduationCap size={26} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">LearnEarn</h2>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">LEARN • EARN • GROW</p>
          <p className="text-xs text-slate-500">Sign in to access your dashboard</p>
        </div>

        <form className="space-y-4 bg-white p-5 rounded-3xl border border-pink-200 shadow-sm shadow-pink-500/5" onSubmit={handleSubmit}>
          <div className="space-y-3">
            {error && (
              <div className="bg-rose-50 text-rose-700 text-xs p-2.5 rounded-xl text-center border border-rose-200 font-bold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Icons.Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="rounded-xl block w-full pl-9 px-3 py-2.5 bg-pink-50/50 border border-pink-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs transition-all font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">4-Digit PIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Icons.Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  className="rounded-xl block w-full pl-9 px-3 py-2.5 bg-pink-50/50 border border-pink-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs transition-all tracking-widest font-mono"
                  placeholder="••••"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-black hover:bg-slate-900 border border-blue-500/50 shadow-[0_2px_10px_rgba(37,99,235,0.25)] transition-all disabled:opacity-70 flex items-center justify-center space-x-1.5 active:scale-95 uppercase tracking-wider"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              {!isLoading && <Icons.ArrowRight className="h-3.5 w-3.5 text-blue-400" />}
            </button>
          </div>
        </form>

        <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">
                Don't have an account?{' '}
                <button onClick={onSwitchToRegister} className="font-bold text-blue-600 hover:text-blue-700 underline">
                    Register now
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
