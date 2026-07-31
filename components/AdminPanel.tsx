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

  // Filter users by search
  const userList: User[] = (Object.values(allUsers) as User[]).filter(
    (u: User) =>
      (u?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = paymentSubmissions.filter(s => s.status === 'pending').length;

  const filteredSubmissions = paymentSubmissions.filter(s => {
    if (paymentFilter === 'all') return true;
    return s.status === paymentFilter;
  });

  const handleApprovePayment = (submissionId: string) => {
    const res = approvePaymentSubmission(submissionId, (updatedTargetUser) => {
      // Update local storage state
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

    let imminentExpiry: number | undefined = targetUser.imminentDeactivationExpiry;
    if (editImminentActive && !imminentExpiry) {
      imminentExpiry = Date.now() + 24 * 60 * 60 * 1000;
    } else if (!editImminentActive) {
      imminentExpiry = undefined;
    }

    const updatedTargetUser: User = {
      ...targetUser,
      balance: numBalance,
      level: editLevel,
      isBanned: editIsBanned,
      adminMessage: editAdminMessage.trim() ? editAdminMessage.trim() : undefined,
      imminentDeactivationExpiry: imminentExpiry
    };

    // Save to allUsers map and Firestore
    const updatedMap = {
      ...allUsers,
      [selectedUserEmail]: updatedTargetUser
    };

    setAllUsers(updatedMap);
    localStorage.setItem('naira9ja_users', JSON.stringify(updatedMap));
    saveUserToFirestore(updatedTargetUser);

    // If target user is the currently active user, trigger callback
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
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-black">
                    {pendingCount} Pending
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Review user uploaded transfer proofs and approve/decline</p>
            </div>

            <button
              onClick={() => {
                loadSubmissions();
                setNotice({ type: 'success', message: 'Submissions refreshed!' });
                setTimeout(() => setNotice(null), 2000);
              }}
              className="p-2 bg-[#1a1e48] text-slate-300 hover:text-white rounded-xl border border-[#2b326d] transition-colors"
              title="Refresh List"
            >
              <Icons.Sync size={16} />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-2">
            {[
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'all', label: `All (${paymentSubmissions.length})` },
              { id: 'approved', label: 'Approved' },
              { id: 'declined', label: 'Declined' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setPaymentFilter(f.id as any)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                  paymentFilter === f.id
                    ? 'bg-red-900/60 text-white border-red-500 shadow-md'
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
                <p className="text-sm font-bold text-slate-300">No {paymentFilter} payment submissions found.</p>
                <p className="text-xs text-slate-500">All payment proofs uploaded by users will appear here awaiting admin review.</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`bg-[#12142e] rounded-3xl p-5 border shadow-lg space-y-4 transition-all ${
                    sub.status === 'pending'
                      ? 'border-amber-500/50 bg-gradient-to-b from-[#161a3f] to-[#12142e]'
                      : sub.status === 'approved'
                      ? 'border-emerald-800/40 opacity-85'
                      : 'border-rose-900/40 opacity-85'
                  }`}
                >
                  {/* Top info */}
                  <div className="flex justify-between items-start border-b border-[#1f2452] pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
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
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{sub.userEmail}</p>
                    </div>

                    <div className="text-right">
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
                      <span className="text-slate-400 font-bold">Item / Upgrade:</span>
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
                        <span className="text-slate-400 font-bold">Proof File:</span>
                        <span className="font-mono text-[10px] text-slate-200 bg-[#111433] px-2 py-0.5 rounded border border-[#2b326d]">
                          {sub.proofFileName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Proof Image Preview */}
                  {sub.proofDataUrl && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Uploaded Receipt Screenshot</span>
                      <div className="relative group rounded-2xl overflow-hidden border border-[#2b3164] bg-[#0d0f24] max-h-48 flex items-center justify-center">
                        <img 
                          src={sub.proofDataUrl} 
                          alt="Payment Proof" 
                          className="max-h-48 object-contain cursor-pointer transition-transform hover:scale-105"
                          onClick={() => setSelectedProofImg(sub.proofDataUrl || null)}
                        />
                        <button
                          onClick={() => setSelectedProofImg(sub.proofDataUrl || null)}
                          className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-950/80 text-white rounded-lg text-[10px] font-bold border border-slate-700 flex items-center space-x-1"
                        >
                          <Icons.Search size={12} />
                          <span>Inspect Full Image</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Decline reason field if pending */}
                  {sub.status === 'pending' && (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        placeholder="Optional rejection reason (default: Invalid receipt)"
                        value={declineReasonInput[sub.id] || ''}
                        onChange={(e) => setDeclineReasonInput({ ...declineReasonInput, [sub.id]: e.target.value })}
                        className="w-full px-3 py-2 bg-[#181c42] border border-[#293068] rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                      />

                      {/* Approve / Decline Buttons */}
                      <div className="flex space-x-2 pt-1">
                        <button
                          onClick={() => handleApprovePayment(sub.id)}
                          className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center space-x-1.5"
                        >
                          <Icons.CheckCircle size={16} />
                          <span>Approve & Grant Payment</span>
                        </button>

                        <button
                          onClick={() => handleDeclinePayment(sub.id)}
                          className="flex-1 py-3 bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-600 hover:to-red-600 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center space-x-1.5"
                        >
                          <Icons.XCircle size={16} />
                          <span>Decline Payment</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notes / Reason if processed */}
                  {sub.declineReason && sub.status === 'declined' && (
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-[11px] text-rose-200 font-medium">
                      <span className="text-rose-400 font-bold block mb-0.5 uppercase tracking-wider text-[9px]">Rejection Reason:</span>
                      {sub.declineReason}
                    </div>
                  )}
                </div>
              ))
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
          <div className="relative max-w-2xl w-full bg-[#12142e] p-2 rounded-3xl border border-rose-900/60 overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedProofImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors z-10"
            >
              <Icons.X size={20} />
            </button>
            <img src={selectedProofImg} alt="Enlarged Proof" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />
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
              placeholder="Search user by email or name..."
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
            <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
              Select User to Manage ({userList.length} found)
            </span>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {userList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4 italic">No matching users found.</p>
              ) : (
                userList.map((u) => {
                  const isSelected = u.email ? u.email.toLowerCase() === selectedUserEmail : false;
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
                        <div className="w-8 h-8 rounded-full bg-purple-600/80 text-white flex items-center justify-center font-bold text-xs uppercase border border-purple-400/40">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-white truncate max-w-[140px]">{u.name}</span>
                            {u.isBanned && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[9px] font-black uppercase">
                                BANNED
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{u.email}</p>
                        </div>
                      </div>

                      <div className="text-right">
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
          {selectedUser ? (
            <div className="bg-[#12142e] rounded-3xl p-6 border border-[#212552] shadow-xl space-y-5">
              <div className="flex justify-between items-center border-b border-[#1e2247] pb-3">
                <div className="flex items-center space-x-2">
                  <Icons.UserCheck size={20} className="text-rose-400" />
                  <h3 className="font-black text-white text-base">Editing: {selectedUser.name}</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{selectedUser.email}</span>
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
                  placeholder="e.g. Your withdrawal of ₦50,000 has been processed successfully..."
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
            <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center space-x-1">
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
