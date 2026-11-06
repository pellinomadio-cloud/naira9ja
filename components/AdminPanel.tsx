import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User, AppSettings, PaymentSubmission } from '../types';
import { getAppSettings, saveAppSettings } from '../appSettings';
import { 
  getAllPaymentSubmissions, 
  approvePaymentSubmission, 
  declinePaymentSubmission 
} from '../paymentService';
import {
  saveUserToFirestore,
  saveAppSettingsToFirestore,
  subscribeToUsers,
  subscribeToPaymentSubmissions,
  subscribeToAppSettings,
  safeSaveUsersToLocalStorage
} from '../firestoreService';

interface AdminPanelProps {
  currentUser: User;
  onUpdateCurrentUser: (updatedUser: User) => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onUpdateCurrentUser,
  onBack
}) => {
  const [passkey, setPasskey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin Active Tab
  const [adminTab, setAdminTab] = useState<'users' | 'payments' | 'settings' | 'codes'>('payments');

  // Payment Submissions State
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<'pending' | 'all' | 'approved' | 'declined'>('pending');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'all' | 'activation' | 'upgrade' | 'naira_code'>('all');
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);
  const [declineReasonInput, setDeclineReasonInput] = useState<Record<string, string>>({});

  // All registered users state
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>(currentUser?.email ? currentUser.email.toLowerCase() : '');

  // Selected User Fields
  const [editBalance, setEditBalance] = useState<string>('0');
  const [editLevel, setEditLevel] = useState<number>(1);
  const [editIsBanned, setEditIsBanned] = useState<boolean>(false);
  const [editAdminMessage, setEditAdminMessage] = useState<string>('');
  const [editImminentActive, setEditImminentActive] = useState<boolean>(false);
  const [editIsDeactivated, setEditIsDeactivated] = useState<boolean>(false);

  // App Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(getAppSettings());

  // Code Generator
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeAmount, setCodeAmount] = useState('10000');
  const [codeCopied, setCodeCopied] = useState(false);

  // Notices
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Helper to load submissions
  const loadSubmissions = () => {
    setPaymentSubmissions(getAllPaymentSubmissions());
  };

  // Helper to load all users from localStorage
  const loadUsersFromStorage = () => {
    try {
      const stored = localStorage.getItem('naira9ja_users');
      const parsedUsers: Record<string, User> = stored ? JSON.parse(stored) : {};
      
      // Ensure currentUser is present
      if (currentUser && currentUser.email && !parsedUsers[currentUser.email.toLowerCase()]) {
        parsedUsers[currentUser.email.toLowerCase()] = currentUser;
      }

      setAllUsers(parsedUsers);
    } catch (e) {
      console.error('Error loading users:', e);
    }
  };

  useEffect(() => {
    loadUsersFromStorage();
    loadSubmissions();

    // Subscribe to Firestore real-time data
    const unsubUsers = subscribeToUsers((firestoreUsers) => {
      setAllUsers((prev) => ({ ...prev, ...firestoreUsers }));
    });

    const unsubPayments = subscribeToPaymentSubmissions((firestorePayments) => {
      setPaymentSubmissions(firestorePayments);
    });

    const unsubSettings = subscribeToAppSettings((firestoreSettings) => {
      setAppSettings(firestoreSettings);
    });

    // Listen to local update events
    const handleSubmissionsUpdated = () => {
      loadSubmissions();
    };
    const handleUsersUpdated = () => {
      loadUsersFromStorage();
    };

    window.addEventListener('naira9ja_payment_submissions_updated', handleSubmissionsUpdated);
    window.addEventListener('naira9ja_users_updated', handleUsersUpdated);

    return () => {
      unsubUsers();
      unsubPayments();
      unsubSettings();
      window.removeEventListener('naira9ja_payment_submissions_updated', handleSubmissionsUpdated);
      window.removeEventListener('naira9ja_users_updated', handleUsersUpdated);
    };
  }, []);

  // Sync selected user form when selectedUserEmail or allUsers changes
  useEffect(() => {
    if (!selectedUserEmail || !allUsers[selectedUserEmail]) {
      const keys = Object.keys(allUsers);
      if (keys.length > 0) {
        setSelectedUserEmail(keys[0]);
      }
      return;
    }

    const u = allUsers[selectedUserEmail];
    setEditBalance(u.balance ? u.balance.toString() : '0');
    setEditLevel(u.level || 1);
    setEditIsBanned(!!u.isBanned);
    setEditAdminMessage(u.adminMessage || '');
    setEditImminentActive(!!u.imminentDeactivationExpiry);
    setEditIsDeactivated(!!u.deactivationDate);
  }, [selectedUserEmail, allUsers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey.trim() === 'OHI999') {
      setIsAuthenticated(true);
      setErrorMsg('');
      loadUsersFromStorage();
      loadSubmissions();
    } else {
      setErrorMsg('Invalid Service Passkey. Access Denied.');
    }
  };

  // Build set of attended user emails
  const attendedUserEmails = new Set<string>();

  if (currentUser?.email) {
    attendedUserEmails.add(currentUser.email.toLowerCase());
  }

  (Object.values(allUsers) as User[]).forEach((u) => {
    if (u && u.email && u.attendedByAdmin) {
      attendedUserEmails.add(u.email.toLowerCase());
    }
  });

  paymentSubmissions.forEach((s) => {
    if (s && s.userEmail && s.status !== 'pending') {
      attendedUserEmails.add(s.userEmail.toLowerCase());
    }
  });

  // Filter users list
  const userList: User[] = (Object.values(allUsers) as User[]).filter((u: User) => {
    if (!u || !u.email) return false;
    const emailKey = u.email.toLowerCase();

    if (searchQuery.trim()) {
      return (
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const isAttended = attendedUserEmails.has(emailKey);
    const hasPayment = paymentSubmissions.some((s) => s.userEmail && s.userEmail.toLowerCase() === emailKey);

    return isAttended || hasPayment;
  });

  const handleMarkUserAttended = (email: string) => {
    if (!email) return;
    const key = email.toLowerCase();
    const userToAttend = allUsers[key];
    if (userToAttend) {
      const updatedUser: User = { ...userToAttend, attendedByAdmin: true };
      const updatedMap = { ...allUsers, [key]: updatedUser };
      setAllUsers(updatedMap);
      safeSaveUsersToLocalStorage(updatedMap);
      saveUserToFirestore(updatedUser);
      setSelectedUserEmail(key);
      setNotice({ type: 'success', message: `User ${userToAttend.name} has been saved to Admin Dashboard!` });
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleReactivateUser = (email: string) => {
    if (!email) return;
    const key = email.toLowerCase();
    const targetUser = allUsers[key];
    if (targetUser) {
      const updatedUser: User = {
        ...targetUser,
        deactivationDate: undefined,
        imminentDeactivationExpiry: undefined,
        attendedByAdmin: true,
        adminMessage: 'Your account activation is COMPLETE and fully verified by Service Admin!'
      };
      const updatedMap = { ...allUsers, [key]: updatedUser };
      setAllUsers(updatedMap);
      safeSaveUsersToLocalStorage(updatedMap);
      saveUserToFirestore(updatedUser);
      setEditIsDeactivated(false);
      setEditImminentActive(false);

      if (key === currentUser?.email?.toLowerCase()) {
        onUpdateCurrentUser(updatedUser);
      }

      setNotice({ type: 'success', message: `User ${targetUser.name} has been fully REACTIVATED!` });
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const pendingCount = paymentSubmissions.filter((s) => s.status === 'pending').length;
  const pendingActivationSubmissions = paymentSubmissions.filter(
    (s) =>
      s.status === 'pending' &&
      s.type !== 'naira_code' &&
      !(s.itemDescription && s.itemDescription.toLowerCase().includes('naira code')) &&
      (s.type === 'activation' || (s.itemDescription && s.itemDescription.toLowerCase().includes('activation')))
  );
  const pendingActivationCount = pendingActivationSubmissions.length;

  const filteredSubmissions = paymentSubmissions.filter((s) => {
    if (paymentFilter !== 'all' && s.status !== paymentFilter) return false;

    if (paymentTypeFilter !== 'all') {
      const isNairaCode = s.type === 'naira_code' || (s.itemDescription && s.itemDescription.toLowerCase().includes('naira code'));
      const isActivation =
        !isNairaCode &&
        (s.type === 'activation' || (s.itemDescription && s.itemDescription.toLowerCase().includes('activation')));
      if (paymentTypeFilter === 'activation' && !isActivation) return false;
      if (paymentTypeFilter === 'upgrade' && s.type !== 'upgrade') return false;
      if (paymentTypeFilter === 'naira_code' && !isNairaCode) return false;
    }

    if (paymentSearchQuery.trim()) {
      const q = paymentSearchQuery.toLowerCase();
      const matchName = (s.userName || '').toLowerCase().includes(q);
      const matchEmail = (s.userEmail || '').toLowerCase().includes(q);
      const matchDesc = (s.itemDescription || '').toLowerCase().includes(q);
      const matchAmount = (s.amount ? s.amount.toString() : '').includes(q);
      const matchId = (s.id || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchDesc && !matchAmount && !matchId) return false;
    }

    return true;
  });

  const handleApprovePayment = (submissionId: string) => {
    const res = approvePaymentSubmission(submissionId, (updatedTargetUser) => {
      loadUsersFromStorage();
      if (updatedTargetUser?.email && currentUser?.email && updatedTargetUser.email.toLowerCase() === currentUser.email.toLowerCase()) {
        onUpdateCurrentUser(updatedTargetUser);
      }
    });

    if (res.success) {
      setNotice({ type: 'success', message: res.message });
      loadSubmissions();
      loadUsersFromStorage();
    } else {
      setNotice({ type: 'error', message: res.message });
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleDeclinePayment = (submissionId: string) => {
    const reason = declineReasonInput[submissionId] || 'Invalid payment receipt or unconfirmed bank transfer.';
    const res = declinePaymentSubmission(submissionId, reason, (updatedTargetUser) => {
      loadUsersFromStorage();
      if (updatedTargetUser?.email && currentUser?.email && updatedTargetUser.email.toLowerCase() === currentUser.email.toLowerCase()) {
        onUpdateCurrentUser(updatedTargetUser);
      }
    });

    if (res.success) {
      setNotice({ type: 'success', message: res.message });
      loadSubmissions();
      loadUsersFromStorage();
    } else {
      setNotice({ type: 'error', message: res.message });
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveSelectedUser = () => {
    if (!selectedUserEmail || !allUsers[selectedUserEmail]) return;

    const numBalance = parseFloat(editBalance);
    if (isNaN(numBalance)) {
      setNotice({ type: 'error', message: 'Please enter a valid balance number.' });
      return;
    }

    const targetUser = allUsers[selectedUserEmail];

    let deactivationDateVal = editIsDeactivated ? (targetUser.deactivationDate || Date.now()) : undefined;
    let imminentExpiry: number | undefined = targetUser.imminentDeactivationExpiry;
    if (editImminentActive && !imminentExpiry) {
      imminentExpiry = Date.now() + 24 * 60 * 60 * 1000;
    } else if (!editImminentActive || !editIsDeactivated) {
      imminentExpiry = undefined;
    }

    const updatedTargetUser: User = {
      ...targetUser,
      balance: numBalance,
      level: editLevel,
      isBanned: editIsBanned,
      adminMessage: editAdminMessage.trim() ? editAdminMessage.trim() : undefined,
      deactivationDate: deactivationDateVal,
      imminentDeactivationExpiry: imminentExpiry
    };

    const updatedMap = {
      ...allUsers,
      [selectedUserEmail]: updatedTargetUser
    };

    setAllUsers(updatedMap);
    safeSaveUsersToLocalStorage(updatedMap);
    saveUserToFirestore(updatedTargetUser);

    if (selectedUserEmail && currentUser?.email && selectedUserEmail === currentUser.email.toLowerCase()) {
      onUpdateCurrentUser(updatedTargetUser);
    }

    setNotice({ type: 'success', message: `User ${updatedTargetUser.name} updated successfully in Firebase & Local Storage!` });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSaveSettings = () => {
    saveAppSettings(appSettings);
    saveAppSettingsToFirestore(appSettings);
    setNotice({ type: 'success', message: 'Global App Settings updated in Firebase & Local Storage!' });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleGenerateCode = () => {
    const prefix = 'N9JA';
    const randDigits = Math.floor(100000 + Math.random() * 900000);
    const code = `${prefix}-${codeAmount}-${randDigits}`;
    setGeneratedCode(code);
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Render Login Prompt
  if (!isAuthenticated) {
    return (
      <div className="px-4 py-8 max-w-sm mx-auto space-y-4 animate-in fade-in duration-300">
        <div className="text-center space-y-1">
          <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs mx-auto border border-blue-500/50">
            <Icons.ShieldCheck size={22} className="text-blue-400" />
          </div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">Service Access Portal</h2>
          <p className="text-[11px] text-slate-500">Enter system passkey to access administrative controls</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-4 rounded-3xl border border-pink-200 shadow-sm shadow-pink-500/5 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Service Passkey
            </label>
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter Passkey"
              className="w-full px-3 py-2 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-900 font-mono text-center tracking-widest text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] font-bold text-rose-700 text-center animate-in shake duration-300">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="btn-black-blue w-full py-2 px-3 text-xs font-bold rounded-xl uppercase tracking-wider"
          >
            Authenticate Service Access
          </button>
        </form>

        <button
          onClick={onBack}
          className="w-full py-1.5 text-slate-400 font-medium hover:text-slate-700 text-xs transition-colors text-center"
        >
          Cancel & Exit
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-3 animate-in fade-in duration-300 pb-20">
      {/* Admin Top Header Banner */}
      <div className="bg-white p-3.5 rounded-3xl border border-pink-200 shadow-sm shadow-pink-500/5 flex justify-between items-center">
        <div>
          <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 text-[9px] font-black uppercase tracking-wider mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
            <span>Service Portal Active</span>
          </div>
          <h2 className="text-sm font-black text-slate-900 tracking-tight">System Control Dashboard</h2>
          <p className="text-[11px] text-slate-500">Registered Users: <strong className="text-blue-600 font-mono text-[11px]">{Object.keys(allUsers).length}</strong></p>
        </div>

        <button
          onClick={onBack}
          className="p-1.5 rounded-xl bg-pink-50 text-slate-700 hover:bg-pink-100 border border-pink-200 transition-colors"
          title="Exit Portal"
        >
          <Icons.X size={16} />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-white border border-pink-200 rounded-2xl shadow-2xs">
        <button
          onClick={() => setAdminTab('payments')}
          className={`py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center space-x-1 relative ${
            adminTab === 'payments'
              ? 'bg-black text-white shadow-xs border border-blue-500/50'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Icons.ShieldCheck size={12} className={adminTab === 'payments' ? 'text-blue-400' : ''} />
          <span>Payments</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-blue-600 text-white font-mono text-[8px] font-black rounded-full animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center space-x-1 ${
            adminTab === 'users'
              ? 'bg-black text-white shadow-xs border border-blue-500/50'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Icons.User size={12} className={adminTab === 'users' ? 'text-blue-400' : ''} />
          <span>Users</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center space-x-1 ${
            adminTab === 'settings'
              ? 'bg-black text-white shadow-xs border border-blue-500/50'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Icons.Settings size={12} className={adminTab === 'settings' ? 'text-blue-400' : ''} />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setAdminTab('codes')}
          className={`py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center space-x-1 ${
            adminTab === 'codes'
              ? 'bg-black text-white shadow-xs border border-blue-500/50'
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Icons.Key size={12} className={adminTab === 'codes' ? 'text-blue-400' : ''} />
          <span>Vouchers</span>
        </button>
      </div>

      {/* Notice Alert Banner */}
      {notice && (
        <div
          className={`p-3 rounded-2xl flex items-center space-x-2 text-[11px] font-bold animate-in slide-in-from-top duration-200 border ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notice.type === 'success' ? <Icons.CheckCircle size={15} /> : <Icons.AlertTriangle size={15} />}
          <span>{notice.message}</span>
        </div>
      )}

      {/* TAB 0: PAYMENT APPROVALS & SUBMISSIONS */}
      {adminTab === 'payments' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white p-3.5 rounded-3xl border border-pink-200 shadow-sm shadow-pink-500/5">
            <div>
              <h3 className="font-black text-slate-900 text-xs flex items-center space-x-1.5">
                <span>Payment Approvals</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-700 border border-blue-300 text-[10px] font-mono font-black animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-500">Review user uploaded transfer proofs and approve or decline activations instantly</p>
            </div>

            <button
              onClick={() => {
                loadSubmissions();
                loadUsersFromStorage();
                setNotice({ type: 'success', message: 'Submissions & users refreshed!' });
                setTimeout(() => setNotice(null), 2000);
              }}
              className="btn-black-blue p-2 rounded-xl text-[10px] font-bold flex items-center space-x-1"
              title="Refresh List"
            >
              <Icons.Sync size={13} className="text-blue-400" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Pending Activations Urgent Alert Banner */}
          {pendingActivationCount > 0 && (
            <div className="p-3 rounded-3xl bg-white border border-pink-300 shadow-sm shadow-pink-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-blue-600 border border-pink-200 flex items-center justify-center shrink-0">
                  <Icons.ShieldCheck size={18} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs">
                    ⚡ {pendingActivationCount} Pending Activation Payment{pendingActivationCount > 1 ? 's' : ''} Uploaded!
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Users have submitted activation proof receipts waiting for your approval.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPaymentTypeFilter('activation');
                  setPaymentFilter('pending');
                }}
                className="btn-black-blue px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0"
              >
                View Activations Only
              </button>
            </div>
          )}

          {/* Search Box for Payment Submissions */}
          <div className="relative">
            <input
              type="text"
              value={paymentSearchQuery}
              onChange={(e) => setPaymentSearchQuery(e.target.value)}
              placeholder="Search payment proof by name, email, item description, amount..."
              className="w-full pl-9 pr-9 py-2 bg-white border border-pink-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-slate-400">
              <Icons.Search size={14} />
            </div>
            {paymentSearchQuery && (
              <button
                onClick={() => setPaymentSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>

          {/* Category Type Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'activation', label: `⚡ Activations (${paymentSubmissions.filter(s => s.type !== 'naira_code' && !s.itemDescription?.toLowerCase().includes('naira code') && (s.type === 'activation' || s.itemDescription?.toLowerCase().includes('activation'))).length})` },
              { id: 'upgrade', label: `Upgrades (${paymentSubmissions.filter(s => s.type === 'upgrade').length})` },
              { id: 'naira_code', label: `Naira Codes (${paymentSubmissions.filter(s => s.type === 'naira_code' || s.itemDescription?.toLowerCase().includes('naira code')).length})` }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setPaymentTypeFilter(cat.id as any)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border ${
                  paymentTypeFilter === cat.id
                    ? 'bg-black text-white border-blue-500/50 shadow-xs'
                    : 'bg-white text-slate-600 border-pink-200 hover:bg-pink-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Filter Pages Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'pending', label: '🟡 Pending Approvals', count: pendingCount },
              { id: 'approved', label: '🟢 Approved Archive', count: paymentSubmissions.filter(s => s.status === 'approved').length },
              { id: 'declined', label: '🔴 Declined Archive', count: paymentSubmissions.filter(s => s.status === 'declined').length },
              { id: 'all', label: '📋 All Logs', count: paymentSubmissions.length }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPaymentFilter(f.id as any)}
                className={`py-1.5 px-2 rounded-2xl text-[10px] font-bold transition-all border flex flex-col items-center justify-center space-y-0.2 ${
                  paymentFilter === f.id
                    ? 'bg-black text-white border-blue-500/50 shadow-xs'
                    : 'bg-white text-slate-600 border-pink-200 hover:bg-pink-50'
                }`}
              >
                <span>{f.label}</span>
                <span className="text-[9px] font-mono opacity-80">({f.count})</span>
              </button>
            ))}
          </div>

          {/* Subpage Context Explanation Banner */}
          <div className="p-2.5 rounded-2xl bg-white border border-pink-200 text-[10px] flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping shrink-0" />
              <p className="text-slate-600 font-medium">
                {paymentFilter === 'pending' && 'Page: Pending Approvals — Review new payment receipts. Approved items automatically move to the Approved Archive page.'}
                {paymentFilter === 'approved' && 'Page: Approved Payments Archive — Verified payments and activated users.'}
                {paymentFilter === 'declined' && 'Page: Declined Payments Archive — Rejected receipts and decline notes.'}
                {paymentFilter === 'all' && 'Page: All Payment Logs — Searchable master history of all payment proofs.'}
              </p>
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-3">
            {filteredSubmissions.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 border border-pink-200 text-center space-y-1.5 shadow-sm shadow-pink-500/5">
                <Icons.CheckCircle size={28} className="text-emerald-500 mx-auto opacity-80" />
                <p className="text-xs font-bold text-slate-800">No {paymentFilter} {paymentTypeFilter !== 'all' ? paymentTypeFilter : ''} payment submissions found.</p>
                <p className="text-[10px] text-slate-500">All payment proofs uploaded by users will appear here awaiting admin review.</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isNairaCode = sub.type === 'naira_code' || (sub.itemDescription && sub.itemDescription.toLowerCase().includes('naira code'));
                const isActivation = !isNairaCode && (sub.type === 'activation' || (sub.itemDescription && sub.itemDescription.toLowerCase().includes('activation')));

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-3xl p-4 border border-pink-200 shadow-sm shadow-pink-500/5 space-y-3 transition-all"
                  >
                    {/* Top info */}
                    <div className="flex justify-between items-start border-b border-pink-100 pb-2.5">
                      <div>
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className="font-extrabold text-slate-900 text-xs">{sub.userName}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase border ${
                            sub.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : sub.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}>
                            {sub.status}
                          </span>
                          {isNairaCode && (
                            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-pink-100 text-blue-700 border border-blue-200 flex items-center space-x-1">
                              <span>🔑 NAIRA CODE</span>
                            </span>
                          )}
                          {isActivation && (
                            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-pink-100 text-pink-700 border border-pink-200 flex items-center space-x-1">
                              <span>⚡ ACTIVATION</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sub.userEmail}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-slate-900 text-xs block">
                          ₦{sub.amount.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          {new Date(sub.createdAt || Date.now()).toLocaleDateString()} {new Date(sub.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-pink-50/50 p-2.5 rounded-2xl border border-pink-100 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-400 font-bold">Purpose / Item:</span>
                        <span className="font-extrabold text-slate-900">{sub.itemDescription}</span>
                      </div>
                      {sub.targetLevel && (
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-400 font-bold">Target Level:</span>
                          <span className="font-bold text-blue-600">Level {sub.targetLevel}</span>
                        </div>
                      )}
                      {sub.proofFileName && (
                        <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-pink-100">
                          <span className="text-slate-400 font-bold">Receipt File:</span>
                          <span className="font-mono text-[9px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-pink-200">
                            {sub.proofFileName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Proof Image Preview */}
                    {sub.proofDataUrl && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Uploaded Bank Receipt</span>
                        <div className="relative group rounded-2xl overflow-hidden border border-pink-200 bg-pink-50/30 max-h-44 flex items-center justify-center p-2">
                          <img 
                            src={sub.proofDataUrl} 
                            alt="Payment Proof" 
                            className="max-h-40 object-contain cursor-pointer transition-transform hover:scale-105 rounded-xl"
                            onClick={() => setSelectedProofImg(sub.proofDataUrl || null)}
                          />
                          <button
                            onClick={() => setSelectedProofImg(sub.proofDataUrl || null)}
                            className="btn-black-blue absolute bottom-2 right-2 px-2 py-1 rounded-lg text-[9px] font-bold flex items-center space-x-1"
                          >
                            <Icons.Search size={11} className="text-blue-400" />
                            <span>Inspect Full Receipt</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending Actions */}
                    {sub.status === 'pending' && (
                      <div className="space-y-2.5 pt-1 border-t border-pink-100">
                        {/* Quick Presets for Rejection */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Decline Reason (Optional preset):</span>
                          <div className="flex flex-wrap gap-1">
                            {[
                              'Invalid / fake receipt screenshot',
                              'Bank transfer deposit not received',
                              'Incorrect transfer amount paid'
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setDeclineReasonInput({ ...declineReasonInput, [sub.id]: preset })}
                                className="px-2 py-0.5 rounded-lg bg-pink-50 hover:bg-rose-50 border border-pink-200 hover:border-rose-300 text-[9px] font-bold text-slate-600 hover:text-rose-700 transition-colors"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Type custom rejection reason..."
                            value={declineReasonInput[sub.id] || ''}
                            onChange={(e) => setDeclineReasonInput({ ...declineReasonInput, [sub.id]: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-pink-50/50 border border-pink-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Approve / Decline Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleApprovePayment(sub.id)}
                            className="btn-black-blue py-2 px-3 text-[10px] font-black rounded-xl uppercase tracking-wider flex items-center justify-center space-x-1.5"
                          >
                            <Icons.CheckCircle size={14} className="text-blue-400" />
                            <span>{isNairaCode ? 'Approve & Issue Code' : isActivation ? 'Approve & Activate' : 'Approve & Grant'}</span>
                          </button>

                          <button
                            onClick={() => handleDeclinePayment(sub.id)}
                            className="py-2 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-black text-[10px] rounded-xl shadow-2xs transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center space-x-1.5"
                          >
                            <Icons.XCircle size={14} />
                            <span>Decline Payment</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleMarkUserAttended(sub.userEmail);
                            setSelectedUserEmail(sub.userEmail.toLowerCase());
                            setAdminTab('users');
                          }}
                          className="w-full py-1.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 text-slate-700 font-bold text-[10px] rounded-xl transition-all flex items-center justify-center space-x-1"
                        >
                          <Icons.UserCheck size={12} className="text-blue-600" />
                          <span>Open User Profile in Dashboard</span>
                        </button>
                      </div>
                    )}

                    {sub.status !== 'pending' && (
                      <div className="pt-2 flex justify-between items-center border-t border-pink-100">
                        <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider flex items-center space-x-1">
                          <Icons.CheckCircle size={11} className="text-emerald-600" />
                          <span>Archived in Database</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleMarkUserAttended(sub.userEmail);
                            setSelectedUserEmail(sub.userEmail.toLowerCase());
                            setAdminTab('users');
                          }}
                          className="px-2 py-0.5 bg-pink-50 hover:bg-pink-100 text-[10px] font-bold text-slate-700 border border-pink-200 rounded-lg"
                        >
                          Edit User / Status
                        </button>
                      </div>
                    )}

                    {/* Rejection Reason if processed */}
                    {sub.declineReason && sub.status === 'declined' && (
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-[10px] text-rose-700 font-medium">
                        <span className="text-rose-800 font-bold block mb-0.5 uppercase tracking-wider text-[8px]">Rejection Reason:</span>
                        {sub.declineReason}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal image inspector */}
      {selectedProofImg && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedProofImg(null)}
        >
          <div className="relative max-w-lg w-full bg-white p-3 rounded-3xl border border-pink-200 shadow-xl space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-800">Payment Receipt Inspection</span>
              <button
                onClick={() => setSelectedProofImg(null)}
                className="p-1 rounded-full bg-pink-100 text-slate-700 hover:bg-pink-200 transition-colors"
              >
                <Icons.X size={15} />
              </button>
            </div>
            <img src={selectedProofImg} alt="Enlarged Proof" className="w-full h-auto max-h-[75vh] object-contain rounded-2xl border border-pink-100" />
          </div>
        </div>
      )}

      {/* TAB 1: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="space-y-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registered user by email or name..."
              className="w-full pl-9 pr-9 py-2 bg-white border border-pink-200 rounded-2xl text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-slate-400">
              <Icons.Search size={14} />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <Icons.X size={14} />
              </button>
            )}
          </div>

          {/* User Selector Dropdown List */}
          <div className="bg-white rounded-3xl p-3.5 border border-pink-200 shadow-sm shadow-pink-500/5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Registered Users ({userList.length})
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                Click any user to edit balance or activation
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {userList.length === 0 ? (
                <div className="text-center py-4 px-2 space-y-1">
                  <p className="text-xs text-slate-400 font-bold">No registered users matching search.</p>
                </div>
              ) : (
                userList.map((u) => {
                  const isSelected = u.email ? u.email.toLowerCase() === selectedUserEmail : false;
                  const hasPending = paymentSubmissions.some(s => s.userEmail && s.userEmail.toLowerCase() === u.email?.toLowerCase() && s.status === 'pending');
                  const isDeactivated = u.deactivationDate && Date.now() > u.deactivationDate;

                  return (
                    <div
                      key={u.email || Math.random().toString()}
                      onClick={() => u.email && setSelectedUserEmail(u.email.toLowerCase())}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-pink-100/70 border-blue-500 ring-1 ring-blue-500/30 text-slate-900 shadow-2xs'
                          : 'bg-pink-50/40 hover:bg-pink-50 border-pink-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px] uppercase border border-blue-500/50 shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 truncate max-w-[130px]">{u.name}</span>
                            {hasPending && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-300 text-[8px] font-black uppercase">
                                ⚡ Proof Pending
                              </span>
                            )}
                            {isDeactivated && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-300 text-[8px] font-black uppercase">
                                DEACTIVATED
                              </span>
                            )}
                            {u.isBanned && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-300 text-[8px] font-black uppercase">
                                BANNED
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-400 truncate max-w-[170px] font-mono">{u.email}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900 block">
                          ₦{u.balance ? u.balance.toLocaleString() : '0'}
                        </span>
                        <span className="text-[9px] text-blue-600 font-bold block">
                          Level {u.level || 1}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected User Action Form */}
          {allUsers[selectedUserEmail] ? (
            (() => {
              const selectedUser = allUsers[selectedUserEmail];
              const pendingUserSubmission = paymentSubmissions.find(s => s.userEmail && s.userEmail.toLowerCase() === selectedUserEmail && s.status === 'pending');
              const isUserDeactivated = selectedUser.deactivationDate || selectedUser.imminentDeactivationExpiry;

              return (
                <div className="bg-white rounded-3xl p-4 border border-pink-200 shadow-sm shadow-pink-500/5 space-y-3.5">
                  <div className="flex justify-between items-center border-b border-pink-100 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <Icons.UserCheck size={16} className="text-blue-600" />
                      <h3 className="font-black text-slate-900 text-xs">Editing: {selectedUser.name}</h3>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono">{selectedUser.email}</span>
                  </div>

                  {/* Pending Payment Review Card inside User Profile */}
                  {pendingUserSubmission && (
                    <div className="p-3 rounded-2xl bg-pink-50 border border-pink-300 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1.5">
                          <Icons.ShieldCheck className="text-blue-600" size={15} />
                          <span className="font-extrabold text-slate-800 text-[11px]">
                            Pending Payment for {pendingUserSubmission.itemDescription}
                          </span>
                        </div>
                        <span className="font-mono font-black text-slate-900 text-xs">
                          ₦{pendingUserSubmission.amount.toLocaleString()}
                        </span>
                      </div>

                      {pendingUserSubmission.proofDataUrl && (
                        <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-pink-200">
                          <img
                            src={pendingUserSubmission.proofDataUrl}
                            alt="Receipt"
                            className="w-12 h-12 object-cover rounded-lg cursor-pointer border border-pink-100"
                            onClick={() => setSelectedProofImg(pendingUserSubmission.proofDataUrl || null)}
                          />
                          <div className="text-[10px] space-y-0.5">
                            <p className="text-slate-800 font-bold">{pendingUserSubmission.proofFileName || 'Receipt Screenshot'}</p>
                            <p className="text-[9px] text-slate-400">
                              Uploaded: {new Date(pendingUserSubmission.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleApprovePayment(pendingUserSubmission.id)}
                          className="btn-black-blue py-1.5 px-2 text-[10px] font-bold rounded-xl uppercase flex items-center justify-center space-x-1"
                        >
                          <Icons.CheckCircle size={13} className="text-blue-400" />
                          <span>Approve Payment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclinePayment(pendingUserSubmission.id)}
                          className="py-1.5 px-2 bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 font-bold text-[10px] rounded-xl uppercase flex items-center justify-center space-x-1"
                        >
                          <Icons.XCircle size={13} />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Account Status / Re-activate Action Banner */}
                  <div className="p-2.5 rounded-2xl bg-pink-50/50 border border-pink-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-800 block flex items-center space-x-1">
                        <span>Account Status:</span>
                        {isUserDeactivated ? (
                          <span className="text-rose-600 font-black">🔴 DEACTIVATED</span>
                        ) : (
                          <span className="text-emerald-600 font-black">🟢 ACTIVE</span>
                        )}
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {isUserDeactivated ? 'User account is restricted or requires activation fee.' : 'User account is fully active with normal dashboard access.'}
                      </span>
                    </div>

                    {isUserDeactivated ? (
                      <button
                        type="button"
                        onClick={() => handleReactivateUser(selectedUser.email)}
                        className="btn-black-blue px-3 py-1.5 text-[10px] font-bold rounded-xl uppercase shrink-0 flex items-center space-x-1"
                      >
                        <Icons.CheckCircle size={13} className="text-blue-400" />
                        <span>Re-activate User Now</span>
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-pink-100 text-blue-700 border border-blue-200 text-[9px] font-bold uppercase">
                        Fully Verified
                      </span>
                    )}
                  </div>

                  {/* Edit Balance */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Wallet Balance (₦)
                    </label>
                    <input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-blue-500"
                    />

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <span className="text-[9px] text-slate-400 self-center font-bold uppercase">Quick Set:</span>
                      {[250000, 480500, 100000, 50000, 10000, 0].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setEditBalance(amt.toString())}
                          className="px-2 py-0.5 rounded-lg bg-white hover:bg-pink-100 text-[10px] font-bold text-slate-700 border border-pink-200"
                        >
                          ₦{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Edit Level */}
                  <div className="space-y-1.5 pt-2 border-t border-pink-100">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Account Level
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { lvl: 1, name: 'Level 1 • Beginner' },
                        { lvl: 2, name: 'Level 2 • Scholar (Tier 2)' },
                        { lvl: 3, name: 'Level 3 • Master' },
                        { lvl: 4, name: 'Level 4 • VIP Pro' }
                      ].map((p) => (
                        <button
                          key={p.lvl}
                          type="button"
                          onClick={() => setEditLevel(p.lvl)}
                          className={`py-1.5 px-2.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition-all ${
                            editLevel === p.lvl
                              ? 'bg-black text-white border-blue-500/50 shadow-xs'
                              : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-50'
                          }`}
                        >
                          <span>{p.name}</span>
                          {editLevel === p.lvl && <Icons.Check size={12} className="text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ban / Unban User Toggle */}
                  <div className="pt-2 border-t border-pink-100">
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-pink-50/50 border border-pink-200">
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-800 block">Ban Account Access</span>
                        <span className="text-[9px] text-slate-400">Prevents user from performing any action or accessing dashboard</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditIsBanned(!editIsBanned)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                          editIsBanned
                            ? 'bg-rose-600 text-white border-rose-400'
                            : 'bg-white text-slate-600 border-pink-200 hover:bg-pink-50'
                        }`}
                      >
                        {editIsBanned ? 'BANNED' : 'ACTIVE'}
                      </button>
                    </div>
                  </div>

                  {/* Send Message to User */}
                  <div className="space-y-1 pt-2 border-t border-pink-100">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Send Direct Message / Notice
                    </label>
                    <textarea
                      rows={2}
                      value={editAdminMessage}
                      onChange={(e) => setEditAdminMessage(e.target.value)}
                      placeholder="e.g. Your activation payment of ₦10,000 has been verified..."
                      className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[9px] text-slate-400 block">
                      This message appears as a popup notification on the user screen.
                    </span>
                  </div>

                  {/* Imminent Activation Warning Toggle */}
                  <div className="flex justify-between items-center pt-2 border-t border-pink-100">
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-800 block">Imminent Activation Warning</span>
                      <span className="text-[9px] text-slate-400">Trigger 24h urgent deactivation notice</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditImminentActive(!editImminentActive)}
                      className={`w-10 h-5 rounded-full transition-colors p-0.5 relative ${
                        editImminentActive ? 'bg-black border border-blue-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          editImminentActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSelectedUser}
                    className="btn-black-blue w-full py-2.5 px-4 text-xs font-black rounded-xl uppercase tracking-wider"
                  >
                    Save User Changes
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-3xl p-5 border border-pink-200 text-center text-slate-400 text-xs">
              Select a user above to edit parameters.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GLOBAL APP SETTINGS */}
      {adminTab === 'settings' && (
        <div className="bg-white rounded-3xl p-4 border border-pink-200 shadow-sm shadow-pink-500/5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-pink-100 pb-2.5">
            <Icons.Settings size={16} className="text-blue-600" />
            <h3 className="font-black text-slate-900 text-xs">Global Application Configuration</h3>
          </div>

          {/* Company Bank Account Section */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1">
              <Icons.Wallet size={12} className="text-blue-600" />
              <span>Company Deposit Bank Account</span>
            </h4>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                Bank Name
              </label>
              <input
                type="text"
                value={appSettings.companyBankName}
                onChange={(e) => setAppSettings({ ...appSettings, companyBankName: e.target.value })}
                className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                Account Number
              </label>
              <input
                type="text"
                value={appSettings.companyAccountNumber}
                onChange={(e) => setAppSettings({ ...appSettings, companyAccountNumber: e.target.value })}
                className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                Account Name
              </label>
              <input
                type="text"
                value={appSettings.companyAccountName}
                onChange={(e) => setAppSettings({ ...appSettings, companyAccountName: e.target.value })}
                className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Prices Section */}
          <div className="space-y-2.5 pt-2 border-t border-pink-100">
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1">
              <Icons.Key size={12} className="text-blue-600" />
              <span>Naira CODE Activation Price (₦)</span>
            </h4>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                Naira CODE Amount (₦)
              </label>
              <input
                type="number"
                value={appSettings.nairaCodePrice ?? 7000}
                onChange={(e) =>
                  setAppSettings({ ...appSettings, nairaCodePrice: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-blue-500"
              />
              <p className="text-[9px] text-slate-400 mt-0.5">
                Amount required for users to purchase/activate a Naira CODE across the application.
              </p>
            </div>

            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1 pt-1">
              <Icons.TrendingUp size={12} className="text-blue-600" />
              <span>Level Upgrade Prices (₦)</span>
            </h4>

            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                  Tier 2 (Level 2)
                </label>
                <input
                  type="number"
                  value={appSettings.level2Price}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, level2Price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                  Level 3 Price
                </label>
                <input
                  type="number"
                  value={appSettings.level3Price}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, level3Price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                  Level 4 VIP
                </label>
                <input
                  type="number"
                  value={appSettings.level4Price}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, level4Price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2.5 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Links & Telegram */}
          <div className="space-y-2 pt-2 border-t border-pink-100">
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center space-x-1">
              <Icons.Send size={12} className="text-blue-600" />
              <span>Telegram & Support Links</span>
            </h4>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                Official Telegram Group/Channel
              </label>
              <input
                type="text"
                value={appSettings.telegramLink}
                onChange={(e) => setAppSettings({ ...appSettings, telegramLink: e.target.value })}
                className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
                Support Handle / Link
              </label>
              <input
                type="text"
                value={appSettings.supportLink}
                onChange={(e) => setAppSettings({ ...appSettings, supportLink: e.target.value })}
                className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="btn-black-blue w-full py-2.5 px-4 text-xs font-black rounded-xl uppercase tracking-wider"
          >
            Save Global App Settings
          </button>
        </div>
      )}

      {/* TAB 3: VOUCHER CODE GENERATOR */}
      {adminTab === 'codes' && (
        <div className="bg-white rounded-3xl p-4 border border-pink-200 shadow-sm shadow-pink-500/5 space-y-3">
          <div className="flex items-center space-x-2 border-b border-pink-100 pb-2">
            <Icons.Key size={16} className="text-blue-600" />
            <h3 className="font-black text-slate-900 text-xs">Naira CODE Generator</h3>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              Select Voucher Denomination (₦)
            </label>
            <div className="flex space-x-1.5">
              {['6000', '7000', '8000', '10000', '15000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCodeAmount(amt)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all ${
                    codeAmount === amt
                      ? 'bg-black text-white border-blue-500/50 shadow-xs'
                      : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-50'
                  }`}
                >
                  ₦{parseInt(amt).toLocaleString()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerateCode}
              className="btn-black-blue w-full py-2 text-xs font-bold rounded-xl uppercase tracking-wider"
            >
              Generate New Voucher CODE
            </button>

            {generatedCode && (
              <div className="bg-pink-50/60 p-3 rounded-2xl border border-pink-200 text-center space-y-2 animate-in fade-in">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Generated CODE</span>
                <p className="text-base font-black font-mono text-slate-900 tracking-wider select-all">{generatedCode}</p>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="btn-black-blue flex-1 py-1.5 text-xs font-bold rounded-xl inline-flex items-center justify-center space-x-1"
                  >
                    {codeCopied ? <Icons.Check size={12} className="text-blue-400" /> : <Icons.Copy size={12} className="text-blue-400" />}
                    <span>{codeCopied ? 'Copied!' : 'Copy CODE'}</span>
                  </button>

                  {selectedUserEmail && allUsers[selectedUserEmail] && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetUser = { ...allUsers[selectedUserEmail] };
                        const codeObj = {
                          code: generatedCode,
                          amount: parseFloat(codeAmount) || 7000,
                          createdAt: Date.now(),
                          isUsed: false
                        };
                        targetUser.activeNairaCode = codeObj;
                        if (!targetUser.nairaCodesHistory) targetUser.nairaCodesHistory = [];
                        targetUser.nairaCodesHistory.unshift(codeObj);
                        targetUser.adminMessage = `Service Admin has assigned a new Naira CODE (${generatedCode}) to your account. It is ready on your dashboard for withdrawal!`;

                        const updatedMap = { ...allUsers, [selectedUserEmail]: targetUser };
                        setAllUsers(updatedMap);
                        safeSaveUsersToLocalStorage(updatedMap);
                        saveUserToFirestore(targetUser);

                        if (selectedUserEmail && currentUser?.email && selectedUserEmail === currentUser.email.toLowerCase()) {
                          onUpdateCurrentUser(targetUser);
                        }

                        setNotice({ type: 'success', message: `Naira CODE assigned to ${targetUser.name}!` });
                        setTimeout(() => setNotice(null), 3000);
                      }}
                      className="btn-black-blue flex-1 py-1.5 text-xs font-bold rounded-xl inline-flex items-center justify-center space-x-1"
                    >
                      <Icons.CheckCircle size={12} className="text-blue-400" />
                      <span>Assign to {allUsers[selectedUserEmail].name.split(' ')[0]}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exit Button */}
      <button
        onClick={onBack}
        className="w-full py-2 text-slate-400 font-bold hover:text-slate-700 text-xs transition-colors text-center"
      >
        Return to Main Dashboard
      </button>
    </div>
  );
};
