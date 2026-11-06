
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import NairaCodeCard from './components/NairaCodeCard';
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
import UpgradeProposal, { getUpgradePlans } from './components/UpgradeProposal';
import UpgradePayment from './components/UpgradePayment';
import BuyNairaCode from './components/BuyNairaCode';
import BusinessHub from './components/BusinessHub';
import Loan from './components/Loan';
import { AdminPanel } from './components/AdminPanel';
import { getAppSettings, useAppSettings } from './appSettings';
import { Suspended } from './components/Suspended';
import { Icons } from './components/Icons';
import { User, Transaction, RewardStatus, UpgradeLevelPlan } from './types';
import { saveUserToFirestore, subscribeToUsers, safeSaveUsersToLocalStorage } from './firestoreService';

const DEFAULT_NOTIFICATION_PREFERENCES = {
  withdrawals: true,
  transfers: true,
  airtime: true,
  rewards: true
};

const App: React.FC = () => {
  const appSettings = useAppSettings();
  // Global Time State for Deactivation & Subscription Logic (checked periodically)
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
        setNow(Date.now());
    }, 10000); // Check every 10 seconds to keep app lightning-fast
    return () => clearInterval(interval);
  }, []);

  // Helper to get stored users safely
  const getStoredUsers = () => {
    try {
        const stored = localStorage.getItem('naira9ja_users');
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
  };

  // Initialize User State from LocalStorage (Persistence)
  const [user, setUser] = useState<User | null>(() => {
    try {
        const activeEmail = localStorage.getItem('naira9ja_active_session');
        if (activeEmail) {
            const users = getStoredUsers();
            const storedUser = users[activeEmail.toLowerCase()];
            if (storedUser) {
                // Migration: Ensure transactions array and level exist
                if (!storedUser.transactions) {
                  storedUser.transactions = [];
                }
                if (!storedUser.level) {
                  storedUser.level = 1;
                }
                if (!storedUser.balance || storedUser.balance === 10000 || storedUser.balance === 480500) {
                  storedUser.balance = 250000;
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
                safeSaveUsersToLocalStorage(users);
                
                return storedUser;
            }
        }
    } catch (e) {
        console.warn("Notice restoring session:", e);
    }
    return null;
  });

  // Helper to save user to local storage and Firestore
  const saveUserToStorage = (u: User) => {
    const existingUsers = getStoredUsers();
    existingUsers[u.email.toLowerCase()] = u;
    safeSaveUsersToLocalStorage(existingUsers);
    saveUserToFirestore(u);
  };

  // Real-time Firestore sync & local event listener for active user
  useEffect(() => {
    if (!user?.email) return;

    const handleLocalUserUpdate = () => {
      try {
        const storedUsersStr = localStorage.getItem('naira9ja_users');
        if (storedUsersStr) {
          const usersMap = JSON.parse(storedUsersStr);
          const activeKey = user.email.toLowerCase();
          const updatedUser = usersMap[activeKey];
          if (updatedUser) {
            setUser((prev) => {
              if (!prev) return updatedUser;
              if (JSON.stringify(prev) !== JSON.stringify(updatedUser)) {
                return updatedUser;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('naira9ja_users_updated', handleLocalUserUpdate);

    const unsub = subscribeToUsers((firestoreUsers) => {
      const activeKey = user.email.toLowerCase();
      const updatedUser = firestoreUsers[activeKey];
      if (updatedUser) {
        setUser((prev) => {
          if (!prev) return updatedUser;
          // Only update state if Firestore object differs
          if (JSON.stringify(prev) !== JSON.stringify(updatedUser)) {
            return updatedUser;
          }
          return prev;
        });
      }
    });

    return () => {
      window.removeEventListener('naira9ja_users_updated', handleLocalUserUpdate);
      unsub();
    };
  }, [user?.email]);

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
      const activeEmail = localStorage.getItem('naira9ja_active_session');
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
  const [selectedPlan, setSelectedPlan] = useState<UpgradeLevelPlan>({
    level: 2,
    name: 'Level 2 • Scholar',
    price: 6000,
    priceFormatted: '₦6,000',
    badge: 'Popular Upgrade',
    features: []
  });

  // --- DEVICE BACK BUTTON HANDLING ---
  const handleBack = useCallback(() => {
    if (activeTab === 'upgrade_payment') {
        setActiveTab('upgrade_proposal');
    } else if (activeTab === 'receipt') {
        setActiveTab('transaction_history');
        setSelectedTransaction(null);
    } else if (activeTab === 'send_money' || activeTab === 'buy_service' || activeTab === 'transaction_history' || activeTab === 'invite_earn' || activeTab === 'reward' || activeTab === 'imminent_payment' || activeTab === 'referral_dashboard' || activeTab === 'upgrade_proposal' || activeTab === 'business_hub' || activeTab === 'me' || activeTab === 'finance' || activeTab === 'loan') {
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

  const initialTransactions: Transaction[] = [];

  const handleRegister = (name: string, email: string) => {
    const newUser: User = {
      name: name || 'User',
      email,
      balance: 250000.00,
      level: 1,
      transactions: [],
      rewardStatus: { currentDay: 1, lastClaimedTimestamp: 0 },
      notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES }
    };
    saveUserToStorage(newUser);
    localStorage.setItem('naira9ja_active_session', email.toLowerCase());
    setUser(newUser);
    setCurrentView('dashboard');
    setActiveTab('home');
    setShowWelcomeAd(true);
  };

  const handleLogin = (email: string, name: string) => {
    const existingUsers = getStoredUsers();
    const storedUser = existingUsers[email.toLowerCase()];
    if (storedUser) {
        if (!storedUser.transactions) {
            storedUser.transactions = [];
        }
        if (!storedUser.rewardStatus) storedUser.rewardStatus = { currentDay: 1, lastClaimedTimestamp: 0 };
        if (!storedUser.level) storedUser.level = 1;
        saveUserToStorage(storedUser);
        setUser(storedUser);
    } else {
        const loggedInUser: User = {
            name: name || 'User', 
            email, 
            balance: 250000.00,
            level: 1,
            transactions: [],
            rewardStatus: { currentDay: 1, lastClaimedTimestamp: 0 },
            notificationPreferences: { ...DEFAULT_NOTIFICATION_PREFERENCES }
        };
        setUser(loggedInUser);
        saveUserToStorage(loggedInUser);
    }
    localStorage.setItem('naira9ja_active_session', email.toLowerCase());
    setCurrentView('dashboard');
    setActiveTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('naira9ja_active_session');
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
    if (id === 'buy_naira_code' || id === 'palmpay') {
        setActiveTab('buy_naira_code');
    } else if (id === 'rewards') {
        setActiveTab('reward');
    } else if (id === 'subscribe') {
        setActiveTab('buy_naira_code');
    } else if (id === 'upgrade') {
        setActiveTab('upgrade_proposal');
    } else if (id === 'bank') {
        setActiveTab('send_money');
    } else if (id === 'vip') {
        window.open(appSettings.telegramLink || 'https://t.me/naira9ja001', '_blank');
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
  
  const handlePaymentComplete = (targetLevel?: number) => {
    const newLevel = targetLevel || selectedPlan.level || 2;
    if (user) {
        const updatedUser: User = {
            ...user,
            level: newLevel
        };
        setUser(updatedUser);
        saveUserToStorage(updatedUser);
    }
    alert(`Account successfully upgraded to Level ${newLevel}! Payment proof submitted for admin record.`);
    setActiveTab('home');
  };

  const handleUpgradeToTier2 = () => {
    const plans = getUpgradePlans(appSettings);
    const tier2Plan = plans.find(p => p.level === 2) || plans[0];
    setSelectedPlan(tier2Plan);
    setActiveTab('upgrade_payment');
  };

  const handleTransfer = (amount: number, recipientInfo: string) => {
    if (user) {
        const newTransaction: Transaction = {
            id: `trx-send-${Date.now()}`, type: 'debit', amount: amount,
            description: recipientInfo, date: new Date().toISOString(), 
            status: 'pending' // Always pending for withdrawals as requested
        };

        const updatedActiveCode = user.activeNairaCode 
            ? { ...user.activeNairaCode, isUsed: true, usedAt: Date.now() }
            : undefined;

        const updatedUser = { 
            ...user, 
            balance: user.balance - amount,
            activeNairaCode: updatedActiveCode,
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
    localStorage.setItem('naira9ja_active_session', restoredUser.email.toLowerCase());
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
    'receipt': 'Receipt', 'admin': 'Admin Service'
  };

  return (
    <div className="min-h-screen bg-[#fff1f5] font-sans text-slate-900 transition-colors duration-200">
      <div className="max-w-md mx-auto bg-[#fff1f5] min-h-screen relative shadow-sm border-x border-pink-200/60 transition-colors duration-200">
        <div className="pb-24">
              {activeTab !== 'reward' && activeTab !== 'imminent_payment' && activeTab !== 'referral_dashboard' && activeTab !== 'business_hub' && activeTab !== 'finance' && activeTab !== 'receipt' && activeTab !== 'loan' && activeTab !== 'admin' && (
                  <Header 
                    userName={user?.name} 
                    profileImage={user?.profileImage} 
                    userLevel={user?.level || 1}
                    onLogout={handleLogout} 
                    showBack={activeTab !== 'home'}
                    onBack={handleBack} 
                    pageTitle={pageTitles[activeTab]}
                    onNavigateHome={() => setActiveTab('home')}
                    onNavigateProfile={() => setActiveTab('me')}
                    onNavigateWithdraw={() => setActiveTab('send_money')}
                    onNavigateUpgrade={() => setActiveTab('upgrade_proposal')}
                    onNavigateAdmin={() => setActiveTab('admin')}
                  />
              )}
              {user?.isBanned && activeTab !== 'admin' ? (
                <Suspended />
              ) : activeTab === 'me' ? (
                 <Profile user={user!} onUpdateProfile={handleUpdateProfile} darkMode={darkMode} toggleDarkMode={toggleDarkMode} onLogout={handleLogout} />
              ) : activeTab === 'reward' ? (
                <Rewards currentDay={rewardStatus.currentDay} canClaim={isClaimable} onClaim={handleClaimReward} lastClaimedTimestamp={rewardStatus.lastClaimedTimestamp} onBack={handleBack} />
              ) : activeTab === 'loan' && user ? (
                <Loan user={user} onApply={handleApplyLoan} onBack={handleBack} />
              ) : activeTab === 'upgrade_proposal' ? (
                <UpgradeProposal 
                  currentLevel={user?.level || 1}
                  onProceed={(plan) => {
                    setSelectedPlan(plan);
                    setActiveTab('upgrade_payment');
                  }} 
                  onBack={handleBack} 
                />
              ) : activeTab === 'upgrade_payment' ? (
                <UpgradePayment 
                  userEmail={user?.email || ''} 
                  selectedPlan={selectedPlan}
                  onPaymentComplete={handlePaymentComplete} 
                />
              ) : activeTab === 'buy_naira_code' ? (
                <BuyNairaCode 
                  userEmail={user?.email || ''} 
                  userName={user?.name || 'User'} 
                  onBack={handleBack} 
                />
              ) : activeTab === 'admin' && user ? (
                <AdminPanel 
                  currentUser={user} 
                  onUpdateCurrentUser={(updatedUser) => {
                    setUser(updatedUser);
                    saveUserToStorage(updatedUser);
                  }} 
                  onBack={handleBack} 
                />
              ) : (activeTab === 'business_hub' || activeTab === 'finance') && user ? (
                <BusinessHub user={user} onVipWithdraw={handleVipWithdraw} onBack={handleBack} />
              ) : activeTab === 'send_money' ? (
                <SendMoney 
                  user={user!} 
                  onTransfer={handleTransfer} 
                  onSubscribeRedirect={() => setActiveTab('buy_naira_code')} 
                  onUpgradeToTier2={handleUpgradeToTier2}
                  onGoHome={() => setActiveTab('home')} 
                />
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
                  onUpgradeToTier2={handleUpgradeToTier2}
                />
              ) : activeTab === 'invite_earn' ? (
                <InviteEarn onReward={handleInviteReward} onBack={handleBack} />
              ) : activeTab === 'imminent_payment' ? (
                <ImminentPayment 
                  userEmail={user?.email || ''} 
                  userName={user?.name || 'User'} 
                  onBack={handleBack} 
                />
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
                    {user?.isVIP && (
                      <div className="bg-white text-slate-900 p-3 rounded-2xl shadow-xs border border-pink-200 flex items-center justify-between animate-in slide-in-from-top-2">
                         <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center text-blue-600 border border-pink-200">
                              <Icons.Zap size={14} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-tight text-slate-900">VIP Mode Active</span>
                         </div>
                         <div className="flex items-center space-x-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Funds:</span>
                            <span className="text-xs font-black font-mono bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-lg text-slate-900">₦{(user.vipBalance || 0).toLocaleString()}</span>
                         </div>
                      </div>
                    )}
                    {isDeactivated && (
                        <div className="bg-white text-slate-900 p-3.5 rounded-2xl shadow-sm border-2 border-rose-400 mb-3 flex items-start space-x-2.5">
                            <Icons.Ban className="shrink-0 text-rose-600 mt-0.5" size={18} />
                            <div>
                                <h3 className="font-bold text-xs uppercase tracking-wide text-rose-700">Account Restricted</h3>
                                <p className="text-[11px] mt-0.5 font-medium text-slate-600 leading-snug">Verification fee required to activate withdrawals.</p>
                            </div>
                        </div>
                    )}
                    {showImminentWarning && user?.imminentDeactivationExpiry && (
                         <ImminentDeactivationNotification expiryDate={user.imminentDeactivationExpiry} />
                    )}
                    {/* Pending Withdrawal Compulsory Tier 2 Upgrade Banner */}
                    {user && (user.level || 1) < 2 && user.transactions?.some(t => t.status === 'pending' && t.type === 'debit') && (
                      <div className="bg-white rounded-2xl p-3.5 border-2 border-rose-300 shadow-sm shadow-pink-500/10 flex items-center justify-between space-x-2 animate-in slide-in-from-top-2">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
                            <Icons.Clock size={16} className="animate-spin text-amber-600" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider block">Withdrawal Pending</span>
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">Tier 2 upgrade is very compulsory to release funds.</p>
                          </div>
                        </div>
                        <button
                          onClick={handleUpgradeToTier2}
                          className="bg-black hover:bg-slate-900 text-white font-bold text-[10px] py-1.5 px-3 rounded-xl border border-blue-500/50 shadow-xs shrink-0 uppercase tracking-wider active:scale-95"
                        >
                          Upgrade Tier 2
                        </button>
                      </div>
                    )}

                    <BalanceCard 
                      balance={user?.balance || 0} 
                      userName={user?.name}
                      userLevel={user?.level || 1}
                      onHistoryClick={() => setActiveTab('transaction_history')} 
                      onUpgradeClick={() => setActiveTab('upgrade_proposal')}
                      onWithdrawClick={() => setActiveTab('send_money')}
                    />

                    <NairaCodeCard 
                      nairaCodeObj={user?.activeNairaCode}
                      onBuyCodeClick={() => setActiveTab('buy_naira_code')}
                      onWithdrawClick={() => setActiveTab('send_money')}
                    />

                    <ActionGrid onActionClick={handleGridAction} />
                    
                    {/* Recent Transactions Section */}
                    <div className="bg-white rounded-2xl p-4 border border-pink-200 shadow-sm shadow-pink-500/5">
                      <div className="flex justify-between items-center mb-3 px-0.5">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Transactions</h3>
                        <button 
                          onClick={() => setActiveTab('transaction_history')}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          See All
                        </button>
                      </div>
                      <div className="divide-y divide-pink-100">
                        {(user?.transactions || []).length > 0 ? (
                          (user?.transactions || []).slice(0, 4).map((trx) => (
                            <div 
                              key={trx.id} 
                              onClick={() => {
                                setSelectedTransaction(trx);
                                setActiveTab('receipt');
                              }}
                              className="py-3 flex items-center justify-between cursor-pointer active:opacity-75 transition-opacity"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${
                                  trx.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                                    : trx.type === 'credit' 
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                                    : 'bg-rose-100 text-rose-700 border-rose-300'
                                }`}>
                                  {trx.status === 'pending' ? <Icons.Clock size={16} /> : trx.type === 'credit' ? <Icons.ArrowDownLeft size={16} /> : <Icons.ArrowUpRight size={16} />}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{trx.description}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {new Date(trx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-xs font-black ${trx.status === 'pending' ? 'text-amber-700' : trx.type === 'credit' ? 'text-emerald-700' : 'text-slate-900'}`}>
                                  {trx.type === 'credit' ? '+' : '-'}₦{trx.amount.toLocaleString()}
                                </p>
                                <span className={`inline-block text-[8px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider mt-0.5 ${
                                  trx.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : trx.status === 'success' 
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                    : 'bg-pink-100 text-pink-700 border border-pink-200'
                                }`}>
                                  {trx.status === 'pending' ? 'Pending' : trx.status === 'success' ? 'Success' : 'Completed'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-5 text-center space-y-1">
                            <p className="text-xs text-slate-400 font-medium">No recent transactions</p>
                            <p className="text-[10px] text-slate-400">Your transactions will appear here when you make a transfer or withdrawal.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <PromoSection />
                    <Banner />
                </main>
              )}
          </div>
          {activeTab !== 'imminent_payment' && activeTab !== 'referral_dashboard' && activeTab !== 'receipt' && (
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
          )}
          {showWelcomeAd && (
            <TelegramAd onJoin={() => window.open(appSettings.telegramLink || 'https://t.me/naira9ja001', '_blank')} onContinue={() => setShowWelcomeAd(false)} />
          )}
          {showInviteAd && !showWelcomeAd && activeTab !== 'referral_dashboard' && activeTab !== 'imminent_payment' && (
             <InviteAd onStart={() => { setShowInviteAd(false); setTaskMode('quiz'); setActiveTab('referral_dashboard'); }} onClose={() => setShowInviteAd(false)} />
          )}

          {/* Admin Direct Message Popup */}
          {user?.adminMessage && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white border-2 border-rose-300 rounded-3xl p-5 w-full max-w-sm shadow-xl space-y-3.5 text-center">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto border border-blue-500/50 shadow-xs">
                  <Icons.Bell size={24} className="text-blue-400" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest block mb-0.5">System Notification</span>
                  <h3 className="text-lg font-black text-slate-950">Message from Service</h3>
                </div>
                <p className="text-xs text-slate-700 bg-pink-50/70 p-3.5 rounded-2xl border border-pink-200 text-left leading-relaxed font-medium">
                  {user.adminMessage}
                </p>
                <button
                  onClick={() => {
                    const updated = { ...user, adminMessage: undefined };
                    setUser(updated);
                    saveUserToStorage(updated);
                  }}
                  className="w-full py-2.5 px-4 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 uppercase tracking-wider border border-blue-500/50"
                >
                  Dismiss Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default App;
