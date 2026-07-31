
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
      const user = existingUsers[email.toLowerCase()];

      if (user) {
        onLogin(email, user.name);
        setIsLoading(false);
      } else {
        setError('Account not registered on this device.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#080915] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-[0_0_25px_rgba(124,58,237,0.5)] border border-purple-400/30">
            <Icons.GraduationCap size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">LearnEarn</h2>
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">LEARN • EARN • GROW</p>
          <p className="text-xs text-slate-400">Welcome back! Sign in to access your dashboard</p>
        </div>

        <form className="mt-8 space-y-6 bg-[#12142e] p-6 rounded-3xl border border-[#212552] shadow-2xl" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="bg-rose-950/80 text-rose-300 text-xs p-3 rounded-xl text-center border border-rose-800/50 font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Icons.Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="rounded-2xl block w-full pl-12 px-4 py-3.5 bg-[#181a3c] border border-[#2d3269] text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1">4-Digit PIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Icons.Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  className="rounded-2xl block w-full pl-12 px-4 py-3.5 bg-[#181a3c] border border-[#2d3269] text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all tracking-widest"
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
              className="w-full py-4 px-4 text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all disabled:opacity-70 flex items-center justify-center space-x-2"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              {!isLoading && <Icons.ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>

        <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">
                Don't have an account?{' '}
                <button onClick={onSwitchToRegister} className="font-bold text-purple-400 hover:text-purple-300 underline">
                    Register now
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

