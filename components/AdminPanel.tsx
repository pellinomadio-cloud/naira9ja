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
  subscribeToAppSettings
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

    return () => {
      unsubUsers();
      unsubPayments();
      unsubSettings();
    };
  }, []);

  // Sync selected user form when selectedUserEmail or allUsers changes
  useEffect(() => {
    if (!selectedUserEmail || !allUsers[selectedUserEmail]) {
      // Fallback to first user or currentUser
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
      localStorage.setItem('naira9ja_users', JSON.stringify(updatedMap));
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
      localStorage.setItem('naira9ja_users', JSON.stringify(updatedMap));
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
      (s.type === 'activation' || (s.itemDescription && s.itemDescription.toLowerCase().includes('activation')))
  );
  const pendingActivationCount = pendingActivationSubmissions.length;

  const filteredSubmissions = paymentSubmissions.filter((s) => {
    if (paymentFilter !== 'all' && s.status !== paymentFilter) return false;

    if (paymentTypeFilter !== 'all') {
      const isActivation =
        s.type === 'activation' || (s.itemDescription && s.itemDescription.toLowerCase().includes('activation'));
      if (paymentTypeFilter === 'activation' && !isActivation) return false;
      if (paymentTypeFilter === 'upgrade' && s.type !== 'upgrade') return false;
      if (paymentTypeFilter === 'naira_code' && s.type !== 'naira_code') return false;
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
    localStorage.setItem('naira9ja_users', JSON.stringify(updatedMap));
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
      <div className="px-4 py-8 max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.5)] mx-auto border border-rose-400/40">
            <Icons.ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Service Access Portal</h2>
          <p className="text-xs text-slate-400">Enter system passkey to access administrative controls</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#12142e] p-6 rounded-3xl border border-rose-900/40 shadow-2xl space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-rose-300 uppercase tracking-widest mb-1.5">
              Service Passkey
            </label>
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter Passkey"
              className="w-full px-4 py-3.5 bg-[#181c42] border border-rose-800/60 rounded-xl text-white font-mono text-center tracking-widest text-lg placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              autoFocus
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs font-bold text-rose-300 text-center animate-in shake duration-300">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all active:scale-95 uppercase tracking-wider"
          >
            Authenticate Service Access
          </button>
        </form>

        <button
          onClick={onBack}
          className="w-full py-3 text-slate-400 font-bold hover:text-white text-xs transition-colors text-center"
        >
          Cancel & Exit
        </button>
      </div>
    );
  }

  const selectedUser = allUsers[selectedUserEmail];

  return (
    <div className="px-4 py-6 space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-[#181a3c] to-rose-950 p-5 rounded-3xl border border-red-800/50 shadow-2xl flex justify-between items-center">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-900/60 text-red-300 border border-red-700/60 text-[10px] font-extrabold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Service Portal Active</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">System Control Dashboard</h2>
          <p className="text-xs text-slate-300">Registered Users: <strong className="text-emerald-400 font-mono text-sm">{Object.keys(allUsers).length}</strong></p>
        </div>

        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-red-900/40 text-rose-300 hover:bg-red-900/80 border border-red-700/50 transition-colors"
          title="Exit Portal"
        >
          <Icons.X size={20} />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="grid grid-cols-4 gap-1 p-1.5 bg-[#12142e] border border-[#222758] rounded-2xl">
        <button
          onClick={() => setAdminTab('payments')}
          className={`py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center space-x-1 relative ${
            adminTab === 'payments'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Icons.ShieldCheck size={15} />
          <span>Payments</span>
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-mono text-[9px] font-black rounded-full animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center space-x-1 ${
            adminTab === 'users'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Icons.User size={15} />
          <span>Users</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center space-x-1 ${
            adminTab === 'settings'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Icons.Settings size={15} />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setAdminTab('codes')}
          className={`py-2.5 rounded-xl text-[11px] font-black transition-all flex items-center justify-center space-x-1 ${
            adminTab === 'codes'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Icons.Key size={15} />
          <span>Vouchers</span>
        </button>
      </div>

      {/* Notice Alert Banner */}
      {notice && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-2 text-xs font-bold animate-in slide-in-from-top duration-300 ${
            notice.type === 'success'
              ? 'bg-emerald-950/90 border border-emerald-700 text-emerald-300'
              : 'bg-rose-950/90 border border-rose-700 text-rose-300'
          }`}
        >
          {notice.type === 'success' ? <Icons.CheckCircle size={18} /> : <Icons.AlertTriangle size={18} />}
          <span>{notice.message}</span>
        </div>
      )}

      {/* TAB 0: PAYMENT APPROVALS & SUBMISSIONS */}
      {adminTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[#12142e] p-4 rounded-3xl border border-[#212552]">
            <div>
              <h3 className="font-black text-white text-base flex items-center space-x-2">
                <span>Payment Approvals</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-black animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Review user uploaded transfer proofs and approve or decline activations instantly</p>
            </div>

            <button
              onClick={() => {
                loadSubmissions();
                loadUsersFromStorage();
                setNotice({ type: 'success', message: 'Submissions & users refreshed!' });
                setTimeout(() => setNotice(null), 2000);
              }}
              className="p-2.5 bg-[#1a1e48] text-slate-300 hover:text-white rounded-xl border border-[#2b326d] transition-colors flex items-center space-x-1"
              title="Refresh List"
            >
              <Icons.Sync size={16} />
              <span className="text-xs font-bold hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Pending Activations Urgent Alert Banner */}
          {pendingActivationCount > 0 && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/90 via-[#231b10] to-[#161a3f] border border-amber-500/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Icons.ShieldCheck size={22} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">
                    ⚡ {pendingActivationCount} Pending Activation Payment{pendingActivationCount > 1 ? 's' : ''} Uploaded!
                  </h4>
                  <p className="text-xs text-amber-200/80 font-medium">
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
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all shrink-0 active:scale-95"
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
              className="w-full pl-10 pr-10 py-3 bg-[#12142e] border border-[#242a5a] rounded-2xl text-white placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:border-red-500"
            />
            <div className="absolute left-3.5 top-3.5 text-slate-400">
              <Icons.Search size={16} />
            </div>
            {paymentSearchQuery && (
              <button
                onClick={() => setPaymentSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
              >
                <Icons.X size={16} />
              </button>
            )}
          </div>

          {/* Category Type Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'activation', label: `⚡ Activations (${paymentSubmissions.filter(s => s.type === 'activation' || s.itemDescription?.toLowerCase().includes('activation')).length})` },
              { id: 'upgrade', label: `Upgrades (${paymentSubmissions.filter(s => s.type === 'upgrade').length})` },
              { id: 'naira_code', label: `Naira Codes (${paymentSubmissions.filter(s => s.type === 'naira_code').length})` }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setPaymentTypeFilter(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  paymentTypeFilter === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md'
                    : 'bg-[#12142e] text-slate-400 border-[#242a5a] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Filter Pills */}
          <div className="flex space-x-2">
            {[
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'all', label: `All Statuses (${paymentSubmissions.length})` },
              { id: 'approved', label: 'Approved' },
              { id: 'declined', label: 'Declined' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPaymentFilter(f.id as any)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                  paymentFilter === f.id
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-md'
                    : 'bg-[#12142e] text-slate-400 border-[#242a5a] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <div className="bg-[#12142e] rounded-3xl p-8 border border-[#212552] text-center space-y-2">
                <Icons.CheckCircle size={36} className="text-emerald-500 mx-auto opacity-80" />
                <p className="text-sm font-bold text-slate-300">No {paymentFilter} {paymentTypeFilter !== 'all' ? paymentTypeFilter : ''} payment submissions found.</p>
                <p className="text-xs text-slate-500">All payment proofs uploaded by users will appear here awaiting admin review.</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isActivation = sub.type === 'activation' || (sub.itemDescription && sub.itemDescription.toLowerCase().includes('activation'));

                return (
                  <div
                    key={sub.id}
                    className={`bg-[#12142e] rounded-3xl p-5 border shadow-lg space-y-4 transition-all ${
                      sub.status === 'pending'
                        ? isActivation
                          ? 'border-amber-500/80 bg-gradient-to-b from-[#231b10] to-[#12142e] shadow-amber-950/20'
                          : 'border-amber-500/50 bg-gradient-to-b from-[#161a3f] to-[#12142e]'
                        : sub.status === 'approved'
                        ? 'border-emerald-800/40 opacity-90'
                        : 'border-rose-900/40 opacity-90'
                    }`}
                  >
                    {/* Top info */}
                    <div className="flex justify-between items-start border-b border-[#1f2452] pb-3">
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-extrabold text-white text-sm">{sub.userName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            sub.status === 'pending'
                              ? 'bg-amber-950 text-amber-300 border-amber-600/60'
                              : sub.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-600/60'
                              : 'bg-rose-950 text-rose-300 border-rose-600/60'
                          }`}>
                            {sub.status}
                          </span>
                          {isActivation && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-950/80 text-purple-300 border border-purple-600/60 flex items-center space-x-1">
                              <span>⚡ ACCOUNT ACTIVATION</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{sub.userEmail}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-amber-400 text-base block">
                          ₦{sub.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {new Date(sub.createdAt || Date.now()).toLocaleDateString()} {new Date(sub.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-[#181c42] p-3 rounded-2xl border border-[#272d62] space-y-2 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400 font-bold">Purpose / Item:</span>
                        <span className="font-extrabold text-white">{sub.itemDescription}</span>
                      </div>
                      {sub.targetLevel && (
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400 font-bold">Target Level:</span>
                          <span className="font-bold text-purple-300">Level {sub.targetLevel}</span>
                        </div>
                      )}
                      {sub.proofFileName && (
                        <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-[#232857]">
                          <span className="text-slate-400 font-bold">Receipt File:</span>
                          <span className="font-mono text-[10px] text-slate-200 bg-[#111433] px-2 py-0.5 rounded border border-[#2b326d]">
                            {sub.proofFileName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Proof Image Preview */}
                    {sub.proofDataUrl && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Uploaded Bank Receipt Screenshot</span>
                        <div className="relative group rounded-2xl overflow-hidden border border-[#2b3164] bg-[#0d0f24] max-h-52 flex items-center justify-center p-2">
                          <img 
                            src={sub.proofDataUrl} 
                            alt="Payment Proof" 
                            className="max-h-48 object-contain cursor-pointer transition-transform hover:scale-105 rounded-xl"
                            onClick={() => setSelectedProofImg(sub.proofDataUrl || null)}
                          />
                          <button
                            onClick={() => setSelectedProofImg(sub.proofDataUrl || null)}
                            className="absolute bottom-2 right-2 px-3 py-1.5 bg-slate-950/90 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold border border-slate-700 flex items-center space-x-1 transition-colors shadow-lg"
                          >
                            <Icons.Search size={13} />
                            <span>Inspect Full Receipt</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending Actions */}
                    {sub.status === 'pending' && (
                      <div className="space-y-3 pt-1 border-t border-[#1e2247]">
                        {/* Quick Presets for Rejection */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rejection Reason (or click preset):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Invalid / fake receipt screenshot',
                              'Bank transfer deposit not received',
                              'Incorrect transfer amount paid'
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setDeclineReasonInput({ ...declineReasonInput, [sub.id]: preset })}
                                className="px-2 py-1 rounded-lg bg-[#181c42] hover:bg-rose-950/60 border border-[#282f63] hover:border-rose-700 text-[10px] font-bold text-slate-300 hover:text-rose-200 transition-colors"
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
                            className="w-full px-3 py-2 bg-[#181c42] border border-[#293068] rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                          />
                        </div>

                        {/* Approve / Decline Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleApprovePayment(sub.id)}
                            className="py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center space-x-2 border border-emerald-400/30"
                          >
                            <Icons.CheckCircle size={17} />
                            <span>{isActivation ? 'Approve & Activate User' : 'Approve & Grant'}</span>
                          </button>

                          <button
                            onClick={() => handleDeclinePayment(sub.id)}
                            className="py-3 px-4 bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 hover:from-rose-600 hover:to-red-600 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center space-x-2 border border-rose-400/30"
                          >
                            <Icons.XCircle size={17} />
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
                          className="w-full py-2 bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-700/60 text-indigo-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                        >
                          <Icons.UserCheck size={15} />
                          <span>Open User Profile in Dashboard</span>
                        </button>
                      </div>
                    )}

                    {sub.status !== 'pending' && (
                      <div className="pt-2 flex justify-between items-center border-t border-[#1e2247]">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                          <Icons.CheckCircle size={12} />
                          <span>Attended & Saved in Database</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleMarkUserAttended(sub.userEmail);
                            setSelectedUserEmail(sub.userEmail.toLowerCase());
                            setAdminTab('users');
                          }}
                          className="px-2.5 py-1 bg-[#181c42] hover:bg-red-900/40 text-xs font-bold text-slate-200 border border-[#2b326d] rounded-lg"
                        >
                          Edit User / Ban
                        </button>
                      </div>
                    )}

                    {/* Rejection Reason if processed */}
                    {sub.declineReason && sub.status === 'declined' && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-[11px] text-rose-200 font-medium">
                        <span className="text-rose-400 font-bold block mb-0.5 uppercase tracking-wider text-[9px]">Rejection Reason:</span>
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
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedProofImg(null)}
        >
          <div className="relative max-w-2xl w-full bg-[#12142e] p-3 rounded-3xl border border-rose-900/60 overflow-hidden shadow-2xl space-y-2">
            <div className="flex justify-between items-center px-2 pt-1">
              <span className="text-xs font-bold text-slate-300">Full Payment Receipt Screenshot</span>
              <button
                onClick={() => setSelectedProofImg(null)}
                className="p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors z-10"
              >
                <Icons.X size={18} />
              </button>
            </div>
            <img src={selectedProofImg} alt="Enlarged Proof" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl border border-slate-800" />
          </div>
        </div>
      )}

      {/* TAB 1: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registered user by email or name..."
              className="w-full pl-10 pr-4 py-3 bg-[#12142e] border border-[#242a5a] rounded-2xl text-white placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:border-red-500"
            />
            <div className="absolute left-3.5 top-3.5 text-slate-400">
              <Icons.Search size={16} />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
              >
                <Icons.X size={16} />
              </button>
            )}
          </div>

          {/* User Selector Dropdown List */}
          <div className="bg-[#12142e] rounded-3xl p-4 border border-[#212552] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
                Registered Users ({userList.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Click any user to edit balance or activation
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {userList.length === 0 ? (
                <div className="text-center py-6 px-3 space-y-1">
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
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-950/80 to-[#1b1e48] border-red-500 text-white shadow-md'
                          : 'bg-[#181c42]/60 hover:bg-[#1f2552] border-[#293066] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600/80 text-white flex items-center justify-center font-bold text-xs uppercase border border-purple-400/40 shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-bold text-xs text-white truncate max-w-[130px]">{u.name}</span>
                            {hasPending && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase">
                                ⚡ Proof Pending
                              </span>
                            )}
                            {isDeactivated && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-black uppercase">
                                DEACTIVATED
                              </span>
                            )}
                            {u.isBanned && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[9px] font-black uppercase">
                                BANNED
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{u.email}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-400 block">
                          ₦{u.balance ? u.balance.toLocaleString() : '0'}
                        </span>
                        <span className="text-[9px] text-purple-300 font-bold block">
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
                <div className="bg-[#12142e] rounded-3xl p-6 border border-[#212552] shadow-xl space-y-5">
                  <div className="flex justify-between items-center border-b border-[#1e2247] pb-3">
                    <div className="flex items-center space-x-2">
                      <Icons.UserCheck size={20} className="text-rose-400" />
                      <h3 className="font-black text-white text-base">Editing User: {selectedUser.name}</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedUser.email}</span>
                  </div>

                  {/* Pending Payment Review Card inside User Profile */}
                  {pendingUserSubmission && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 to-[#211a12] border border-amber-500/80 shadow-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Icons.ShieldCheck className="text-amber-400" size={18} />
                          <span className="font-extrabold text-amber-200 text-xs">
                            Pending Payment Uploaded for {pendingUserSubmission.itemDescription}
                          </span>
                        </div>
                        <span className="font-mono font-black text-amber-300 text-sm">
                          ₦{pendingUserSubmission.amount.toLocaleString()}
                        </span>
                      </div>

                      {pendingUserSubmission.proofDataUrl && (
                        <div className="flex items-center space-x-3 bg-[#111329] p-2 rounded-xl border border-amber-500/30">
                          <img
                            src={pendingUserSubmission.proofDataUrl}
                            alt="Receipt"
                            className="w-16 h-16 object-cover rounded-lg cursor-pointer border border-slate-700"
                            onClick={() => setSelectedProofImg(pendingUserSubmission.proofDataUrl || null)}
                          />
                          <div className="text-xs space-y-0.5">
                            <p className="text-white font-bold">{pendingUserSubmission.proofFileName || 'Receipt Screenshot'}</p>
                            <p className="text-[10px] text-slate-400">
                              Uploaded: {new Date(pendingUserSubmission.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleApprovePayment(pendingUserSubmission.id)}
                          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center space-x-1"
                        >
                          <Icons.CheckCircle size={15} />
                          <span>Approve Payment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclinePayment(pendingUserSubmission.id)}
                          className="py-2.5 px-3 bg-rose-700 hover:bg-rose-600 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center space-x-1"
                        >
                          <Icons.XCircle size={15} />
                          <span>Decline Payment</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Account Status / Re-activate Action Banner */}
                  <div className="p-3.5 rounded-2xl bg-[#181c42] border border-[#2b3164] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-xs font-extrabold text-white block flex items-center space-x-1.5">
                        <span>Account Status:</span>
                        {isUserDeactivated ? (
                          <span className="text-rose-400 font-black">🔴 DEACTIVATED</span>
                        ) : (
                          <span className="text-emerald-400 font-black">🟢 ACTIVE</span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {isUserDeactivated ? 'User account is restricted or requires activation fee.' : 'User account is fully active with normal dashboard access.'}
                      </span>
                    </div>

                    {isUserDeactivated ? (
                      <button
                        type="button"
                        onClick={() => handleReactivateUser(selectedUser.email)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg uppercase tracking-wider transition-all shrink-0 active:scale-95 flex items-center space-x-1"
                      >
                        <Icons.CheckCircle size={15} />
                        <span>Re-activate User Now</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold uppercase">
                        Fully Verified
                      </span>
                    )}
                  </div>

                  {/* Edit Balance */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-widest block">
                      Wallet Balance (₦)
                    </label>
                    <input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-full px-4 py-3 bg-[#181c42] border border-[#2b3164] rounded-xl text-white font-mono text-xl font-bold focus:outline-none focus:border-red-500"
                    />

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[10px] text-slate-400 self-center font-bold uppercase">Quick Set:</span>
                      {[250000, 480500, 100000, 50000, 10000, 0].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setEditBalance(amt.toString())}
                          className="px-2.5 py-1 rounded-lg bg-[#1a1e48] hover:bg-red-900/40 text-xs font-bold text-slate-200 border border-[#2b326d]"
                        >
                          ₦{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Edit Level */}
                  <div className="space-y-2 pt-2 border-t border-[#1e2247]">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-widest block">
                      Account Level
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { lvl: 1, name: 'Level 1 • Beginner' },
                        { lvl: 2, name: 'Level 2 • Scholar' },
                        { lvl: 3, name: 'Level 3 • Master' },
                        { lvl: 4, name: 'Level 4 • VIP Pro' }
                      ].map((p) => (
                        <button
                          key={p.lvl}
                          type="button"
                          onClick={() => setEditLevel(p.lvl)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                            editLevel === p.lvl
                              ? 'bg-red-900/60 text-white border-red-500 shadow-md'
                              : 'bg-[#181c42] text-slate-400 border-[#2b3164] hover:text-white'
                          }`}
                        >
                          <span>{p.name}</span>
                          {editLevel === p.lvl && <Icons.Check size={14} className="text-red-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ban / Unban User Toggle */}
                  <div className="pt-2 border-t border-[#1e2247]">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-[#181c42] border border-[#2b3164]">
                      <div>
                        <span className="text-xs font-extrabold text-white block">Ban Account Access</span>
                        <span className="text-[10px] text-slate-400">Prevents user from performing any action or accessing dashboard</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditIsBanned(!editIsBanned)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                          editIsBanned
                            ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.6)]'
                            : 'bg-[#11142d] text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {editIsBanned ? 'BANNED' : 'ACTIVE'}
                      </button>
                    </div>
                  </div>

                  {/* Send Message to User */}
                  <div className="space-y-2 pt-2 border-t border-[#1e2247]">
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-widest block">
                      Send Direct Notification / Message
                    </label>
                    <textarea
                      rows={2}
                      value={editAdminMessage}
                      onChange={(e) => setEditAdminMessage(e.target.value)}
                      placeholder="e.g. Your activation payment of ₦10,000 has been verified and approved..."
                      className="w-full px-4 py-2.5 bg-[#181c42] border border-[#2b3164] rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      This message will appear as a popup notification on the user's screen.
                    </span>
                  </div>

                  {/* Imminent Activation Warning Toggle */}
                  <div className="flex justify-between items-center pt-2 border-t border-[#1e2247]">
                    <div>
                      <span className="text-xs font-extrabold text-slate-200 block">Imminent ₦10,000 Activation Fee Warning</span>
                      <span className="text-[10px] text-slate-400">Trigger 24h urgent deactivation notice</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditImminentActive(!editImminentActive)}
                      className={`w-12 h-6 rounded-full transition-colors p-1 relative ${
                        editImminentActive ? 'bg-red-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          editImminentActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSelectedUser}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wider"
                  >
                    Save User Changes
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="bg-[#12142e] rounded-3xl p-6 border border-[#212552] text-center text-slate-400 text-xs">
              Select a user above to edit parameters.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GLOBAL APP SETTINGS */}
      {adminTab === 'settings' && (
        <div className="bg-[#12142e] rounded-3xl p-6 border border-[#212552] shadow-xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-[#1e2247] pb-3">
            <Icons.Settings size={20} className="text-rose-400" />
            <h3 className="font-black text-white text-base">Global Application Configuration</h3>
          </div>

          {/* Company Bank Account Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center space-x-1">
              <Icons.Wallet size={14} />
              <span>Company Deposit Bank Account</span>
            </h4>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={appSettings.companyBankName}
                onChange={(e) => setAppSettings({ ...appSettings, companyBankName: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#181c42] border border-[#2b3164] rounded-xl text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={appSettings.companyAccountNumber}
                onChange={(e) => setAppSettings({ ...appSettings, companyAccountNumber: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#181c42] border border-[#2b3164] rounded-xl text-white font-mono text-sm font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={appSettings.companyAccountName}
                onChange={(e) => setAppSettings({ ...appSettings, companyAccountName: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#181c42] border border-[#2b3164] rounded-xl text-white text-xs font-bold"
              />
            </div>
          </div>

          {/* Prices Section */}
          <div className="space-y-3 pt-3 border-t border-[#1e2247]">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center space-x-1">
              <Icons.Key size={14} />
              <span>Naira CODE Activation Price (₦)</span>
            </h4>

            <div>
              <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                Naira CODE Amount (₦)
              </label>
              <input
                type="number"
                value={appSettings.nairaCodePrice ?? 7000}
                onChange={(e) =>
                  setAppSettings({ ...appSettings, nairaCodePrice: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2.5 bg-[#181c42] border border-[#2b3164] rounded-xl text-amber-300 font-mono text-xs font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Amount required for users to purchase/activate a Naira CODE across the application.
              </p>
            </div>

            <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center space-x-1 pt-2">
              <Icons.TrendingUp size={14} />
              <span>Level Upgrade Prices (₦)</span>
            </h4>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Level 2 Price
                </label>
                <input
                  type="number"
                  value={appSettings.level2Price}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, level2Price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-[#181c42] border border-[#2b3164] rounded-xl text-white font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Level 3 Price
                </label>
                <input
                  type="number"
                  value={appSettings.level3Price}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, level3Price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-[#181c42] border border-[#2b3164] rounded-xl text-white font-mono text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                  Level 4 VIP Price
                </label>
                <input
                  type="number"
                  value={appSettings.level4Price}
                  onChange={(e) =>
                    setAppSettings({ ...appSettings, level4Price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-[#181c42] border border-[#2b3164] rounded-xl text-white font-mono text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Links & Telegram */}
          <div className="space-y-3 pt-3 border-t border-[#1e2247]">
            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center space-x-1">
              <Icons.Send size={14} />
              <span>Telegram & Support Links</span>
            </h4>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Official Telegram Group/Channel
              </label>
              <input
                type="text"
                value={appSettings.telegramLink}
                onChange={(e) => setAppSettings({ ...appSettings, telegramLink: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#181c42] border border-[#2b3164] rounded-xl text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Support Handle / Link
              </label>
              <input
                type="text"
                value={appSettings.supportLink}
                onChange={(e) => setAppSettings({ ...appSettings, supportLink: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#181c42] border border-[#2b3164] rounded-xl text-white text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wider"
          >
            Save Global App Settings
          </button>
        </div>
      )}

      {/* TAB 3: VOUCHER CODE GENERATOR */}
      {adminTab === 'codes' && (
        <div className="bg-[#12142e] rounded-3xl p-6 border border-[#212552] shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#1e2247] pb-3">
            <Icons.Key size={20} className="text-amber-400" />
            <h3 className="font-black text-white text-base">Naira CODE Generator</h3>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-widest block">
              Select Voucher Denomination (₦)
            </label>
            <div className="flex space-x-2">
              {['6000', '7000', '8000', '10000', '15000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCodeAmount(amt)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                    codeAmount === amt
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md'
                      : 'bg-[#181c42] text-slate-400 border-[#2b3164]'
                  }`}
                >
                  ₦{parseInt(amt).toLocaleString()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerateCode}
              className="w-full py-3 bg-[#1e2352] hover:bg-[#282f6c] text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
            >
              Generate New Voucher CODE
            </button>

            {generatedCode && (
              <div className="bg-[#181a3c] p-4 rounded-2xl border border-amber-500/40 text-center space-y-3 animate-in fade-in">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Generated CODE</span>
                <p className="text-xl font-black font-mono text-amber-400 tracking-widest select-all">{generatedCode}</p>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex-1 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl inline-flex items-center justify-center space-x-1"
                  >
                    {codeCopied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
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
                        localStorage.setItem('naira9ja_users', JSON.stringify(updatedMap));
                        saveUserToFirestore(targetUser);

                        if (selectedUserEmail && currentUser?.email && selectedUserEmail === currentUser.email.toLowerCase()) {
                          onUpdateCurrentUser(targetUser);
                        }

                        setNotice({ type: 'success', message: `Naira CODE assigned to ${targetUser.name}!` });
                        setTimeout(() => setNotice(null), 3000);
                      }}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl inline-flex items-center justify-center space-x-1"
                    >
                      <Icons.CheckCircle size={14} />
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
        className="w-full py-3 text-slate-400 font-bold hover:text-white text-xs transition-colors text-center"
      >
        Return to Main Dashboard
      </button>
    </div>
  );
};
