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
      const usersMap: Record<string, User> = {};
      snapshot.forEach((docSnap) => {
        const u = docSnap.data() as User;
        if (u && u.email) {
          usersMap[u.email.toLowerCase()] = u;
        }
      });
      if (Object.keys(usersMap).length > 0) {
        try {
          const stored = localStorage.getItem('naira9ja_users');
          const localUsersMap: Record<string, User> = stored ? JSON.parse(stored) : {};
          const merged = { ...localUsersMap, ...usersMap };
          localStorage.setItem('naira9ja_users', JSON.stringify(merged));
        } catch (e) {
          console.error('Error merging users to localStorage:', e);
        }
      }
      callback(usersMap);
    },
    (error) => {
      console.warn('Firestore users subscription notice:', error.message);
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
      const submissions: PaymentSubmission[] = [];
      snapshot.forEach((docSnap) => {
        submissions.push(docSnap.data() as PaymentSubmission);
      });
      submissions.sort((a, b) => b.createdAt - a.createdAt);
      if (submissions.length > 0) {
        try {
          localStorage.setItem('naira9ja_payment_submissions', JSON.stringify(submissions));
        } catch (e) {
          console.error('Error syncing submissions to localStorage:', e);
        }
      }
      callback(submissions);
    },
    (error) => {
      console.warn('Firestore payment submissions subscription notice:', error.message);
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
