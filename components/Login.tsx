
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
    // Only allow numbers and max 4 digits
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
    
    // Simulate API call / Local Validation
    setTimeout(() => {
      // Check if user exists in local storage
      const existingUsersStr = localStorage.getItem('naira9ja_users');
      const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : {};
      const user = existingUsers[email.toLowerCase()];

      if (user) {
        onLogin(email, user.name);
        setIsLoading(false);
      } else {
        // User not found logic
        setError('Account not registered on this device.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bg-gray flex flex-col items-center justify-center p-6 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-blue rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl italic tracking-tighter">n9</span>
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-400 font-medium">Sign in to access your naira9ja dashboard</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {error && (
              <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl text-center border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icons.Mail className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-2xl relative block w-full pl-12 px-4 py-4 border border-gray-100 placeholder-gray-300 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue sm:text-sm transition-all shadow-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">4-digit PIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icons.Lock className="h-5 w-5 text-gray-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  className="appearance-none rounded-2xl relative block w-full pl-12 px-4 py-4 border border-gray-100 placeholder-gray-300 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue sm:text-sm transition-all shadow-sm tracking-widest"
                  placeholder="Enter 4-digit PIN"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <a href="#" className="font-bold text-primary-blue hover:text-primary-dark">
                Forgot your PIN?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-primary-blue hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue shadow-lg transition-all disabled:opacity-70"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && (
                 <span className="absolute right-4 inset-y-0 flex items-center pl-3">
                    <Icons.ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white" />
                 </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
            <p className="text-sm text-gray-400 font-medium">
                Don't have an account?{' '}
                <button onClick={onSwitchToRegister} className="font-bold text-primary-blue hover:text-primary-dark">
                    Register now
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
