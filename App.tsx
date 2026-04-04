
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import ActionGrid from './components/ActionGrid';
import PromoSection from './components/PromoSection';
import Banner from './components/Banner';
import BottomNav from './components/BottomNav';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Rewards from './components/Rewards';
import SendMoney from './components/SendMoney';
import TransactionHistory from './components/TransactionHistory';
import TransactionReceipt from './components/TransactionReceipt';
import BuyAirtimeData from './components/BuyAirtimeData';
import TelegramAd from './components/TelegramAd';
import InviteEarn from './components/InviteEarn';
import InviteAd from './components/InviteAd';
import ImminentDeactivationNotification from './components/ImminentDeactivationNotification';
import ImminentPayment from './components/ImminentPayment';
import ReferralModal from './components/ReferralModal';
import TaskPage from './components/TaskPage';
import UpgradeProposal from './components/UpgradeProposal';
import UpgradePayment from './components/UpgradePayment';
import BuyNairaCode from './components/BuyNairaCode';
import BusinessHub from './components/BusinessHub';
import NotificationFeed from './components/NotificationFeed';
import Loan from './components/Loan';
import { Icons } from './components/Icons';
import { User, Transaction, RewardStatus } from './types';

const DEFAULT_NOTIFICATION_PREFERENCES = {
  withdrawals: true,
  transfers: true,
  airtime: true,
  rewards: true
};

const App: React.FC = () => {
  // Global Time State for Deactivation & Subscription Logic
  const [now, setNow] = useState(Date.now());
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
        setNow(Date.now());
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // Helper to get stored users safely
  const getStoredUsers = () => {
    try {
        const stored = localStorage.getItem('earnix9ja_users');
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
  };

  // Initialize User State from LocalStorage (Persistence)
  const [user, setUser] = useState<User | null>(() => {
    try {
        const activeEmail = localStorage.getItem('earnix9ja_active_session');
        if (activeEmail) {
            const users = getStoredUsers();
            const storedUser = users[activeEmail.toLowerCase()];
            if (storedUser) {
                // Migration: Ensure transactions array exists
                if (!storedUser.transactions) {
                    storedUser.transactions = [{
                        id: 'trx-init',
                        type: 'credit',
                        amount: 10000,
                        description: 'Welcome Bonus',
                        date: new Date().toISOString(),
                        status: 'success'
                    }];
                }
                // Migration: Ensure rewardStatus exists
                if (!storedUser.rewardStatus) {
                    storedUser.rewardStatus = {
                        currentDay: 1,
                        lastClaimedTimestamp: 0
                    };
                }
                // Migration: Ensure notificationPreferences exists
                if (!storedUser.notificationPreferences) {
                    storedUser.notificationPreferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
                }
                // Save migrations immediately
                users[activeEmail.toLowerCase()] = storedUser;
                localStorage.setItem('earnix9ja_users', JSON.stringify(users));
                
                return storedUser;
            }
        }
    } catch (e) {
        console.error("Error restoring session", e);
    }
    return null;
  });

  // Helper to save user to local storage
  const saveUserToStorage = (u: User) => {
    const existingUsers = getStoredUsers();
    existingUsers[u.email.toLowerCase()] = u;
    localStorage.setItem('earnix9ja_users', JSON.stringify(existingUsers));
  };

  // Check Loan Expiry and Auto-Debit
  useEffect(() => {
    if (user?.loanBalance && user.loanExpiry) {
        if (now > user.loanExpiry) {
            const amountToRepay = user.loanBalance;
            const newTransaction: Transaction = {
                id: `trx-loan-repay-${Date.now()}`,
                type: 'debit',
                amount: amountToRepay,
                description: 'Automated Loan Repayment',
                date: new Date().toISOString(),
                status: 'success'
            };
            const updatedUser = { 
                ...user, 
                balance: user.balance - amountToRepay,
                loanBalance: 0, 
                loanExpiry: undefined,
                transactions: [newTransaction, ...(user.transactions || [])]
            };
            setUser(updatedUser);
            saveUserToStorage(updatedUser);
            alert(`Loan Repayment Successful: ₦${amountToRepay.toLocaleString()} has been debited from your balance.`);
        }
    }
  }, [now, user]);

  // Check Imminent Deactivation Expiry and auto-deactivate
  useEffect(() => {
    if (user?.imminentDeactivationExpiry) {
        if (now > user.imminentDeactivationExpiry && !user.deactivationDate) {
             const updatedUser = { 
                ...user, 
                imminentDeactivationExpiry: undefined, 
                deactivationDate: now - 1000 
            };
            setUser(updatedUser);
            saveUserToStorage(updatedUser);
        }
    }
  }, [now, user]);

  const isDeactivated = user?.deactivationDate ? now > user.deactivationDate : false;
  const showImminentWarning = user?.imminentDeactivationExpiry && now < user.imminentDeactivationExpiry && !isDeactivated;

  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>(() => {
      const activeEmail = localStorage.getItem('earnix9ja_active_session');
      const users = getStoredUsers();
      if (activeEmail && users[activeEmail.toLowerCase()]) {
          return 'dashboard';
      }
      if (Object.keys(users).length > 0) {
          return 'login';
      }
      return 'register';
  });

  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [serviceType, setServiceType] = useState<'airtime' | 'data'>('airtime');
  const [showWelcomeAd, setShowWelcomeAd] = useState(false);
  const [showInviteAd, setShowInviteAd] = useState(false);
  const [taskMode, setTaskMode] = useState<'quiz' | 'telegram' | 'all'>('all');
  const [showReferralModal, setShowReferralModal] = useState(false);

  // --- DEVICE BACK BUTTON HANDLING ---
  const handleBack = useCallback(() => {
    if (activeTab === 'upgrade_payment') {
        setActiveTab('upgrade_proposal');
    } else if (activeTab === 'receipt') {
        setActiveTab('transaction_history');
        setSelectedTransaction(null);
    } else if (activeTab === 'send_money' || activeTab === 'buy_service' || activeTab === 'transaction_history' || activeTab === 'invite_earn' || activeTab === 'reward' || activeTab === 'imminent_payment' || activeTab === 'referral_dashboard' || activeTab === 'upgrade_proposal' || activeTab === 'business_hub' || activeTab === 'notifications' || activeTab === 'me' || activeTab === 'finance' || activeTab === 'loan') {
        setActiveTab('home');
    } else {
        setActiveTab('home');
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (currentView !== 'dashboard') return;

    const onPopState = (event: PopStateEvent) => {
      if (activeTab !== 'home') {
        event.preventDefault();
        handleBack();
        window.history.pushState({ tab: 'home' }, "");
      }
    };

    window.addEventListener('popstate', onPopState);

    if (activeTab !== 'home') {
      window.history.pushState({ tab: activeTab }, "");
    } else {
      if (window.history.state?.tab !== 'home') {
        window.history.replaceState({ tab: 'home' }, "");
      }
    }

    return () => window.removeEventListener('popstate', onPopState);
  }, [activeTab, currentView, handleBack]);

  const handleRegister = (name: string, email: string) => {
    const initialTransaction: Transaction = {
        id: `trx-${Date.now()}`,
        type: 'credit',
        amount: 10000.00,
        description: 'Welcome Bonus',
        date: new Date().toISOString(),
        status: 'success'
    };
    const newUser: User = {
      name, email, balance: 10000.00,
      transactions: [initialTransaction],
      rewardStatus: { currentDay: 1, lastClaimedTimestamp: 0 },
      notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES }
    };
    saveUserToStorage(newUser);
    localStorage.setItem('earnix9ja_active_session', email.toLowerCase());
    setUser(newUser);
    setCurrentView('dashboard');
    setActiveTab('home');
    setShowWelcomeAd(true);
    setHasUnreadNotifications(true);
  };

  const handleLogin = (email: string, name: string) => {
    const existingUsers = getStoredUsers();
    const storedUser = existingUsers[email.toLowerCase()];
    if (storedUser) {
        if (!storedUser.transactions) {
            storedUser.transactions = [{
                id: 'trx-init', type: 'credit', amount: 10000,
                description: 'Welcome Bonus', date: new Date().toISOString(), status: 'success'
            }];
        }
        if (!storedUser.rewardStatus) storedUser.rewardStatus = { currentDay: 1, lastClaimedTimestamp: 0 };
        saveUserToStorage(storedUser);
        setUser(storedUser);
    } else {
        const initialTransaction: Transaction = {
            id: `trx-${Date.now()}`, type: 'credit', amount: 10000.00,
            description: 'Welcome Bonus', date: new Date().toISOString(), status: 'success'
        };
        const loggedInUser: User = {
            name: name || 'User', email, balance: 10000.00,
            transactions: [initialTransaction],
            rewardStatus: { currentDay: 1, lastClaimedTimestamp: 0 },
            notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES }
        };
        setUser(loggedInUser);
        saveUserToStorage(loggedInUser);
    }
    localStorage.setItem('earnix9ja_active_session', email.toLowerCase());
    setCurrentView('dashboard');
    setActiveTab('home');
    setHasUnreadNotifications(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('earnix9ja_active_session');
    setUser(null);
    setCurrentView('login');
    setActiveTab('home');
  };

  const handleUpdateProfile = (updatedFields: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const rewardStatus = user?.rewardStatus || { currentDay: 1, lastClaimedTimestamp: 0 };

  const handleClaimReward = () => {
    if (!user) return;
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (nowTs - rewardStatus.lastClaimedTimestamp >= twentyFourHours) {
        const rewardAmount = 100000;
        const newTransaction: Transaction = {
            id: `trx-rew-${Date.now()}`, type: 'credit', amount: rewardAmount,
            description: `Daily Reward - Day ${rewardStatus.currentDay}`,
            date: new Date().toISOString(), status: 'success'
        };
        const nextDay = Math.min(rewardStatus.currentDay + 1, 100);
        const updatedUser = { 
            ...user, balance: user.balance + rewardAmount,
            transactions: [newTransaction, ...(user.transactions || [])],
            rewardStatus: { lastClaimedTimestamp: nowTs, currentDay: nextDay }
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
    }
  };

  const handleInviteReward = () => {
    if (user) {
        const rewardAmount = 50000;
        const newTransaction: Transaction = {
            id: `trx-inv-${Date.now()}`, type: 'credit', amount: rewardAmount,
            description: 'Invite & Earn Reward', date: new Date().toISOString(), status: 'success'
        };
        const updatedUser = {
            ...user, balance: user.balance + rewardAmount,
            transactions: [newTransaction, ...(user.transactions || [])]
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
        alert(`Congratulations! ₦${rewardAmount.toLocaleString()} has been added to your balance.`);
    }
  };

  const handleGridAction = (id: string) => {
    if (id === 'palmpay') {
        if (user && user.imminentDeactivationExpiry && now < user.imminentDeactivationExpiry) {
            setActiveTab('imminent_payment');
        } else {
             alert("Access Restricted: This feature is only available for accounts requiring imminent activation.");
        }
    } else if (id === 'rewards') {
        setActiveTab('reward');
    } else if (id === 'subscribe') {
        setActiveTab('buy_naira_code');
    } else if (id === 'upgrade') {
        setActiveTab('upgrade_proposal');
    } else if (id === 'bank') {
        setActiveTab('send_money');
    } else if (id === 'vip') {
        window.open('https://t.me/naira9ja001', '_blank');
    } else if (id === 'invite') {
        setTaskMode('quiz');
        setActiveTab('referral_dashboard');
    } else if (id === 'free_withdraw') {
        setTaskMode('telegram');
        setActiveTab('referral_dashboard');
    } else if (id === 'business') {
        setActiveTab('finance');
    } else if (id === 'loan') {
        setActiveTab('loan');
    } else if (id === 'airtime' || id === 'data') {
        setServiceType(id);
        setActiveTab('buy_service');
    }
  };
  
  const handlePaymentComplete = () => {
    alert("Activation request submitted! Admin will verify your transaction shortly.");
    setActiveTab('home');
  };

  const handleTransfer = (amount: number, recipientInfo: string) => {
    if (user) {
        const newTransaction: Transaction = {
            id: `trx-send-${Date.now()}`, type: 'debit', amount: amount,
            description: recipientInfo, date: new Date().toISOString(), 
            status: user.isPMode ? 'pending' : 'success'
        };
        const updatedUser = { 
            ...user, balance: user.balance - amount,
            transactions: [newTransaction, ...(user.transactions || [])]
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
    }
  };

  const handleVipWithdraw = (amount: number) => {
    if (user && user.vipBalance !== undefined) {
      const newVipBalance = user.vipBalance - amount;
      const newTransaction: Transaction = {
          id: `trx-vip-${Date.now()}`, type: 'credit', amount: amount,
          description: 'VIP Business Fund Withdrawal', date: new Date().toISOString(), 
          status: user.isPMode ? 'pending' : 'success'
      };
      const updatedUser: User = { 
          ...user, balance: user.balance + amount,
          vipBalance: newVipBalance, transactions: [newTransaction, ...(user.transactions || [])],
          isVIP: newVipBalance > 0
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  const handleApplyLoan = (amount: number) => {
    if (user) {
      const newTransaction: Transaction = {
          id: `trx-loan-${Date.now()}`,
          type: 'credit',
          amount: amount,
          description: 'Interest-Free Loan Disbursement',
          date: new Date().toISOString(),
          status: user.isPMode ? 'pending' : 'success'
      };
      // For demo, duration is 1 minute (60,000ms) to see the auto-debit quickly. 
      // In production, would use days based on offer.
      const loanDuration = 60 * 1000; 
      const updatedUser = {
          ...user,
          balance: user.balance + amount,
          loanBalance: amount,
          loanExpiry: Date.now() + loanDuration,
          transactions: [newTransaction, ...(user.transactions || [])]
      };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
      alert(`Loan Approved: ₦${amount.toLocaleString()} added to your balance. Repayment due in 1 minute.`);
    }
  };

  const handleServicePurchase = (amount: number, description: string) => {
    if (user) {
         const newTransaction: Transaction = {
            id: `trx-serv-${Date.now()}`, type: 'debit', amount: amount,
            description: description, date: new Date().toISOString(), 
            status: user.isPMode ? 'pending' : 'success'
        };
        const updatedUser = { 
            ...user, balance: user.balance - amount,
            transactions: [newTransaction, ...(user.transactions || [])]
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
    }
  };
  
  const handleRestoreAccount = (restoredUser: User) => {
    if (!restoredUser.transactions) restoredUser.transactions = [];
    if (!restoredUser.rewardStatus) restoredUser.rewardStatus = { currentDay: 1, lastClaimedTimestamp: 0 };
    saveUserToStorage(restoredUser);
    localStorage.setItem('earnix9ja_active_session', restoredUser.email.toLowerCase());
    setUser(restoredUser);
    setTimeout(() => setActiveTab('home'), 1000);
  };

  const handleTelegramClaim = () => {
    if (!user) return;
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastTelegramClaimTimestamp || 0;

    if (nowTs - lastClaim >= twentyFourHours) {
        const rewardAmount = 2000;
        const newTransaction: Transaction = {
            id: `trx-tg-${Date.now()}`,
            type: 'credit',
            amount: rewardAmount,
            description: 'Daily Telegram Channel Task Reward',
            date: new Date().toISOString(),
            status: 'success'
        };
        const updatedUser = {
            ...user,
            balance: user.balance + rewardAmount,
            lastTelegramClaimTimestamp: nowTs,
            transactions: [newTransaction, ...(user.transactions || [])]
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
        alert(`₦${rewardAmount.toLocaleString()} added to your balance for joining Telegram!`);
    } else {
        alert("You have already claimed your Telegram reward for today. Try again tomorrow!");
    }
  };

  const handleGameResult = (win: boolean) => {
    if (!user) return;
    const amount = win ? 7000 : 1000;
    const now = new Date();
    const lastQuiz = user.lastQuizTimestamp ? new Date(user.lastQuizTimestamp) : null;
    
    let newCount = (user.dailyQuizCount || 0) + 1;
    
    // Reset if it's a new day
    if (!lastQuiz || now.toDateString() !== lastQuiz.toDateString()) {
      newCount = 1;
    }

    const newTransaction: Transaction = {
        id: `trx-game-${Date.now()}`,
        type: win ? 'credit' : 'debit',
        amount: amount,
        description: win ? 'Quiz Game Win Reward' : 'Quiz Game Loss Penalty',
        date: new Date().toISOString(),
        status: 'success'
    };
    
    const newBalance = win ? user.balance + amount : user.balance - amount;
    
    const updatedUser = {
        ...user,
        balance: newBalance,
        dailyQuizCount: newCount,
        lastQuizTimestamp: now.getTime(),
        transactions: [newTransaction, ...(user.transactions || [])]
    };
    setUser(updatedUser);
    saveUserToStorage(updatedUser);
    
    if (win) {
        alert(`Congratulations! You won ₦${amount.toLocaleString()}!`);
    } else {
        alert(`Oops! You lost. ₦${amount.toLocaleString()} has been deducted from your balance.`);
    }
  };

  useEffect(() => {
    if (currentView !== 'dashboard') return;
    const interval = setInterval(() => setShowInviteAd(true), 60000);
    return () => clearInterval(interval);
  }, [currentView]);

  if (currentView === 'register') return <div className={darkMode ? 'dark' : ''}><Register onRegister={handleRegister} onSwitchToLogin={() => setCurrentView('login')} /></div>;
  if (currentView === 'login') return <div className={darkMode ? 'dark' : ''}><Login onLogin={handleLogin} onSwitchToRegister={() => setCurrentView('register')} /></div>;

  const nowTs = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const isClaimable = nowTs - rewardStatus.lastClaimedTimestamp >= twentyFourHours;

  const pageTitles: Record<string, string> = {
    'loan': 'Loans', 'finance': 'Business Hub', 'reward': 'Rewards', 'me': 'My Profile',
    'send_money': 'Withdraw',
    'buy_service': serviceType === 'airtime' ? 'Buy Airtime' : 'Buy Data',
    'transaction_history': 'Transactions',
    'invite_earn': 'Quiz Game', 'imminent_payment': 'Activation', 
    'referral_dashboard': taskMode === 'quiz' ? 'Quiz Game' : taskMode === 'telegram' ? 'Task' : 'Tasks',
    'upgrade_proposal': 'VIP Membership', 'upgrade_payment': 'Confirm VIP Status', 'buy_naira_code': 'Buy Naira CODE', 'business_hub': 'Business Hub',
    'notifications': 'Feed', 'receipt': 'Receipt'
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-black font-sans text-white transition-colors duration-200">
        <div className="max-w-md mx-auto bg-black min-h-screen relative shadow-2xl transition-colors duration-200">
          <div className="pb-24">
              {activeTab !== 'reward' && activeTab !== 'imminent_payment' && activeTab !== 'referral_dashboard' && activeTab !== 'business_hub' && activeTab !== 'finance' && activeTab !== 'notifications' && activeTab !== 'receipt' && activeTab !== 'loan' && (
                  <Header 
                    userName={user?.name} profileImage={user?.profileImage} 
                    onLogout={handleLogout} showBack={activeTab !== 'home'}
                    onBack={handleBack} pageTitle={pageTitles[activeTab]}
                    hasUnread={hasUnreadNotifications}
                    onNotificationClick={() => { setActiveTab('notifications'); setHasUnreadNotifications(false); }}
                  />
              )}
              {activeTab === 'me' ? (
                 <Profile user={user!} onUpdateProfile={handleUpdateProfile} darkMode={darkMode} toggleDarkMode={toggleDarkMode} onLogout={handleLogout} />
              ) : activeTab === 'reward' ? (
                <Rewards currentDay={rewardStatus.currentDay} canClaim={isClaimable} onClaim={handleClaimReward} lastClaimedTimestamp={rewardStatus.lastClaimedTimestamp} onBack={handleBack} />
              ) : activeTab === 'loan' && user ? (
                <Loan user={user} onApply={handleApplyLoan} onBack={handleBack} />
              ) : activeTab === 'upgrade_proposal' ? (
                <UpgradeProposal onProceed={() => setActiveTab('upgrade_payment')} onBack={handleBack} />
              ) : activeTab === 'upgrade_payment' ? (
                <UpgradePayment userEmail={user?.email || ''} onPaymentComplete={handlePaymentComplete} />
              ) : activeTab === 'buy_naira_code' ? (
                <BuyNairaCode onBack={handleBack} />
              ) : (activeTab === 'business_hub' || activeTab === 'finance') && user ? (
                <BusinessHub user={user} onVipWithdraw={handleVipWithdraw} onBack={handleBack} />
              ) : activeTab === 'notifications' ? (
                <NotificationFeed onBack={handleBack} />
              ) : activeTab === 'send_money' ? (
                <SendMoney user={user!} onTransfer={handleTransfer} onSubscribeRedirect={() => window.open('https://t.me/naira9ja001', '_blank')} onGoHome={() => setActiveTab('home')} />
              ) : activeTab === 'buy_service' ? (
                 <BuyAirtimeData type={serviceType} user={user!} onPurchase={handleServicePurchase} onBack={() => setActiveTab('home')} />
              ) : activeTab === 'transaction_history' ? (
                <TransactionHistory 
                  user={user!} 
                  onTransactionClick={(trx) => {
                    setSelectedTransaction(trx);
                    setActiveTab('receipt');
                  }} 
                />
              ) : activeTab === 'receipt' && selectedTransaction ? (
                <TransactionReceipt 
                  transaction={selectedTransaction} 
                  userName={user?.name || 'User'} 
                  onBack={() => {
                    setSelectedTransaction(null);
                    setActiveTab('transaction_history');
                  }} 
                />
              ) : activeTab === 'invite_earn' ? (
                <InviteEarn onReward={handleInviteReward} onBack={handleBack} />
              ) : activeTab === 'imminent_payment' ? (
                <ImminentPayment onBack={handleBack} />
              ) : activeTab === 'referral_dashboard' ? (
                <TaskPage 
                  user={user!} 
                  onTelegramClaim={handleTelegramClaim}
                  onGameResult={handleGameResult}
                  onBack={handleBack} 
                  mode={taskMode}
                />
              ) : (
                 <main className="px-4 py-2 space-y-4 animate-in fade-in duration-500">
                    {hasUnreadNotifications && (
                      <div onClick={() => { setActiveTab('notifications'); setHasUnreadNotifications(false); }} className="bg-green-neon text-black p-3 rounded-xl shadow-lg flex items-center justify-between cursor-pointer border border-green-dark animate-in slide-in-from-top-4 duration-500">
                         <div className="flex items-center space-x-2">
                            <Icons.MessageCircle fill="currentColor" size={18} className="text-black/70" />
                            <span className="text-sm font-black uppercase tracking-tight">New Message Arrived</span>
                         </div>
                         <div className="flex items-center space-x-1">
                            <span className="text-[10px] font-bold bg-black/10 px-2 py-0.5 rounded">VIEW FEED</span>
                            <Icons.ChevronRight size={14} />
                         </div>
                      </div>
                    )}
                    {user?.isVIP && (
                      <div className="bg-gradient-to-r from-green-neon to-green-dark text-black p-3 rounded-xl shadow-md flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                         <div className="flex items-center space-x-2">
                            <Icons.Zap fill="currentColor" size={20} className="text-black/70" />
                            <span className="text-sm font-black uppercase tracking-tight">VIP MODE ACTIVE</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold opacity-80">BUSINESS FUNDS</span>
                            <span className="text-xs font-black bg-black/20 px-2 py-0.5 rounded">₦{(user.vipBalance || 0).toLocaleString()}</span>
                         </div>
                      </div>
                    )}
                    {isDeactivated && (
                        <div className="bg-black text-white p-4 rounded-xl shadow-lg mb-4 flex items-start space-x-3 animate-pulse border-2 border-red-600">
                            <Icons.Ban className="flex-shrink-0 text-red-500" size={24} />
                            <div>
                                <h3 className="font-bold text-sm uppercase tracking-wide text-red-500">Account Deactivated</h3>
                                <p className="text-xs mt-1 font-medium leading-relaxed">User must pay 20,000 naira to activate account, using a POS.</p>
                            </div>
                        </div>
                    )}
                    {showImminentWarning && user?.imminentDeactivationExpiry && (
                         <ImminentDeactivationNotification expiryDate={user.imminentDeactivationExpiry} />
                    )}
                    <BalanceCard 
                      balance={user?.balance || 0} 
                      onHistoryClick={() => setActiveTab('transaction_history')} 
                    />
                    <ActionGrid onActionClick={handleGridAction} />
                    <PromoSection />
                    <Banner />
                </main>
              )}
          </div>
          {activeTab !== 'imminent_payment' && activeTab !== 'referral_dashboard' && activeTab !== 'notifications' && activeTab !== 'receipt' && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
          )}
          {showWelcomeAd && (
            <TelegramAd onJoin={() => window.open('https://t.me/naira9ja001', '_blank')} onContinue={() => setShowWelcomeAd(false)} />
          )}
          {showInviteAd && !showWelcomeAd && activeTab !== 'referral_dashboard' && activeTab !== 'imminent_payment' && (
             <InviteAd onStart={() => { setShowInviteAd(false); setTaskMode('quiz'); setActiveTab('referral_dashboard'); }} onClose={() => setShowInviteAd(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
