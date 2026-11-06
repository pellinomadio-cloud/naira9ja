import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, AppSettings, PaymentSubmission } from './types';
import { saveAppSettings } from './appSettings';

const USERS_COLLECTION = 'users';
const PAYMENTS_COLLECTION = 'payment_submissions';
const SETTINGS_COLLECTION = 'settings';
const CONFIG_DOC_ID = 'app_config';

/**
 * Safe utility to save users map to localStorage with tiered quota handling
 */
export const safeSaveUsersToLocalStorage = (usersMap: Record<string, User>): void => {
  if (!usersMap || typeof usersMap !== 'object') return;
  try {
    localStorage.setItem('naira9ja_users', JSON.stringify(usersMap));
  } catch (err) {
    console.warn('LocalStorage quota reached when saving users map. Applying safe pruning...');
    try {
      // Tier 1: Prune large base64 profile pictures from non-active users and truncate transactions
      const activeSessionEmail = (localStorage.getItem('naira9ja_active_session') || '').toLowerCase();
      const pruned: Record<string, User> = {};
      
      for (const [key, user] of Object.entries(usersMap)) {
        if (!user) continue;
        const isCurrent = key.toLowerCase() === activeSessionEmail;
        pruned[key] = {
          ...user,
          profileImage: isCurrent 
            ? user.profileImage 
            : (user.profileImage && user.profileImage.length > 5000 ? undefined : user.profileImage),
          transactions: user.transactions && user.transactions.length > 15
            ? user.transactions.slice(0, 15)
            : user.transactions
        };
      }
      localStorage.setItem('naira9ja_users', JSON.stringify(pruned));
    } catch (err2) {
      console.warn('Storage still near limit. Applying minimal users cache...');
      try {
        // Tier 2: Retain core account parameters and top 5 transactions without heavy strings
        const minimal: Record<string, User> = {};
        for (const [key, user] of Object.entries(usersMap)) {
          if (!user) continue;
          minimal[key] = {
            name: user.name,
            email: user.email,
            balance: user.balance,
            level: user.level,
            isBanned: user.isBanned,
            adminMessage: user.adminMessage,
            activeNairaCode: user.activeNairaCode,
            deactivationDate: user.deactivationDate,
            imminentDeactivationExpiry: user.imminentDeactivationExpiry,
            attendedByAdmin: user.attendedByAdmin,
            transactions: user.transactions ? user.transactions.slice(0, 5) : []
          };
        }
        localStorage.setItem('naira9ja_users', JSON.stringify(minimal));
      } catch (err3) {
        console.warn('Notice: LocalStorage device quota reached; in-memory state remains synchronized.', err3);
      }
    }
  }
};

/**
 * Save user to Firestore
 */
export const saveUserToFirestore = async (user: User): Promise<void> => {
  if (!user || !user.email) return;
  try {
    const emailKey = user.email.toLowerCase().replace(/\./g, '_dot_');
    const userRef = doc(db, USERS_COLLECTION, emailKey);
    const cleanUser = JSON.parse(JSON.stringify(user));
    await setDoc(userRef, cleanUser, { merge: true });
  } catch (err) {
    console.warn('Notice saving user to Firestore:', err);
  }
};

/**
 * Subscribe to real-time updates for all users in Firestore
 */
export const subscribeToUsers = (
  callback: (usersMap: Record<string, User>) => void
): Unsubscribe => {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(
    usersRef,
    (snapshot) => {
      const firestoreUsers: Record<string, User> = {};
      snapshot.forEach((docSnap) => {
        const u = docSnap.data() as User;
        if (u && u.email) {
          firestoreUsers[u.email.toLowerCase()] = u;
        }
      });
      
      try {
        const stored = localStorage.getItem('naira9ja_users');
        const localUsersMap: Record<string, User> = stored ? JSON.parse(stored) : {};
        const merged = { ...localUsersMap, ...firestoreUsers };
        safeSaveUsersToLocalStorage(merged);
        callback(merged);
      } catch (e) {
        console.warn('Notice merging users into local cache:', e);
        callback(firestoreUsers);
      }
    },
    (error) => {
      console.warn('Firestore users subscription notice:', error.message);
      try {
        const stored = localStorage.getItem('naira9ja_users');
        if (stored) {
          callback(JSON.parse(stored));
        }
      } catch (e) {
        // ignore
      }
    }
  );
};

/**
 * Save payment submission to Firestore
 */
export const savePaymentSubmissionToFirestore = async (
  submission: PaymentSubmission
): Promise<void> => {
  if (!submission || !submission.id) return;
  try {
    const subRef = doc(db, PAYMENTS_COLLECTION, submission.id);
    let cleanSub = JSON.parse(JSON.stringify(submission));

    // If proofDataUrl base64 is large (>500KB), strip it for the primary setDoc call to guarantee Firestore doc size limits are met
    if (cleanSub.proofDataUrl && cleanSub.proofDataUrl.length > 500000) {
      console.warn('Payment proof base64 is large (>500KB). Stripping base64 for Firestore document safety.');
      delete cleanSub.proofDataUrl;
    }

    try {
      await setDoc(subRef, cleanSub, { merge: true });
    } catch (setErr) {
      console.warn('Initial setDoc failed on Firestore payment_submissions. Retrying without proofDataUrl:', setErr);
      if (cleanSub.proofDataUrl) {
        delete cleanSub.proofDataUrl;
        await setDoc(subRef, cleanSub, { merge: true });
      } else {
        throw setErr;
      }
    }
  } catch (err) {
    console.warn('Notice saving payment submission to Firestore:', err);
  }
};

/**
 * Subscribe to real-time updates for payment submissions in Firestore
 */
export const subscribeToPaymentSubmissions = (
  callback: (submissions: PaymentSubmission[]) => void
): Unsubscribe => {
  const paymentsRef = collection(db, PAYMENTS_COLLECTION);
  return onSnapshot(
    paymentsRef,
    (snapshot) => {
      const firestoreSubmissions: PaymentSubmission[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as PaymentSubmission;
        if (data && data.id) {
          firestoreSubmissions.push(data);
        }
      });

      // Get current local storage items
      let localSubmissions: PaymentSubmission[] = [];
      try {
        const localDataStr = localStorage.getItem('naira9ja_payment_submissions');
        localSubmissions = localDataStr ? JSON.parse(localDataStr) : [];
      } catch (e) {
        localSubmissions = [];
      }

      const map = new Map<string, PaymentSubmission>();

      // Put local submissions in map first
      localSubmissions.forEach((s) => {
        if (s && s.id) {
          map.set(s.id, s);
        }
      });

      // Merge Firestore submissions
      firestoreSubmissions.forEach((fsSub) => {
        const localSub = map.get(fsSub.id);
        if (!localSub) {
          map.set(fsSub.id, fsSub);
        } else {
          // If local status is approved or declined but Firestore snapshot is still pending, keep local status and persist to Firestore
          if (localSub.status !== 'pending' && fsSub.status === 'pending') {
            savePaymentSubmissionToFirestore(localSub);
          } else {
            // Keep local proofDataUrl if Firestore version doesn't have one
            map.set(fsSub.id, {
              ...fsSub,
              proofDataUrl: fsSub.proofDataUrl || localSub.proofDataUrl
            });
          }
        }
      });

      // Sync any local submission missing from Firestore snapshot up to Firestore
      localSubmissions.forEach((localSub) => {
        if (localSub && localSub.id) {
          const existsInFs = firestoreSubmissions.some((fs) => fs.id === localSub.id);
          if (!existsInFs) {
            savePaymentSubmissionToFirestore(localSub);
          }
        }
      });

      const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
      try {
        localStorage.setItem('naira9ja_payment_submissions', JSON.stringify(merged));
      } catch (e) {
        console.warn('LocalStorage quota reached in submissions sync. Applying safe pruning...');
        try {
          const pruned = merged.map((sub, idx) => {
            if (sub.status !== 'pending' || idx > 5) {
              const { proofDataUrl, ...rest } = sub;
              return rest as PaymentSubmission;
            }
            return sub;
          });
          localStorage.setItem('naira9ja_payment_submissions', JSON.stringify(pruned));
        } catch (e2) {
          try {
            const minimal = merged.slice(0, 25).map((sub) => {
              const { proofDataUrl, ...rest } = sub;
              return rest as PaymentSubmission;
            });
            localStorage.setItem('naira9ja_payment_submissions', JSON.stringify(minimal));
          } catch (e3) {
            console.warn('Could not cache payment submissions to localStorage due to strict quota limits:', e3);
          }
        }
      }
      callback(merged);
    },
    (error) => {
      console.warn('Firestore payment submissions subscription notice:', error.message);
      try {
        const localDataStr = localStorage.getItem('naira9ja_payment_submissions');
        if (localDataStr) {
          callback(JSON.parse(localDataStr));
        }
      } catch (e) {
        // ignore
      }
    }
  );
};

/**
 * Save App Settings to Firestore
 */
export const saveAppSettingsToFirestore = async (
  settings: AppSettings
): Promise<void> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC_ID);
    const cleanSettings = JSON.parse(JSON.stringify(settings));
    await setDoc(settingsRef, cleanSettings, { merge: true });
    saveAppSettings(settings);
  } catch (err) {
    console.warn('Notice saving app settings to Firestore:', err);
  }
};

/**
 * Subscribe to App Settings from Firestore
 */
export const subscribeToAppSettings = (
  callback: (settings: AppSettings) => void
): Unsubscribe => {
  const settingsRef = doc(db, SETTINGS_COLLECTION, CONFIG_DOC_ID);
  return onSnapshot(
    settingsRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        saveAppSettings(data);
        callback(data);
      }
    },
    (error) => {
      console.warn('Firestore settings subscription notice:', error.message);
    }
  );
};
