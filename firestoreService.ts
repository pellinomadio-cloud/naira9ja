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
    console.error('Error saving user to Firestore:', err);
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
        localStorage.setItem('naira9ja_users', JSON.stringify(merged));
        callback(merged);
      } catch (e) {
        console.error('Error merging users to localStorage:', e);
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
    const cleanSub = JSON.parse(JSON.stringify(submission));
    await setDoc(subRef, cleanSub, { merge: true });
  } catch (err) {
    console.error('Error saving payment submission to Firestore:', err);
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
            map.set(fsSub.id, fsSub);
          }
        }
      });

      const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
      try {
        localStorage.setItem('naira9ja_payment_submissions', JSON.stringify(merged));
      } catch (e) {
        console.error('Error syncing submissions to localStorage:', e);
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
    console.error('Error saving app settings to Firestore:', err);
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
