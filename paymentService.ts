import { PaymentSubmission, PaymentType, PaymentStatus, User, NairaCodeData } from './types';
import { savePaymentSubmissionToFirestore, saveUserToFirestore } from './firestoreService';

const STORAGE_KEY = 'naira9ja_payment_submissions';

export const getAllPaymentSubmissions = (): PaymentSubmission[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load payment submissions:', e);
    return [];
  }
};

export const savePaymentSubmissions = (submissions: PaymentSubmission[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save payment submissions:', e);
  }
};

export const getUserPendingSubmission = (userEmail: string): PaymentSubmission | undefined => {
  if (!userEmail) return undefined;
  const all = getAllPaymentSubmissions();
  return all.find(
    (s) => s.userEmail && s.userEmail.toLowerCase() === userEmail.toLowerCase() && s.status === 'pending'
  );
};

export const getUserLatestSubmission = (userEmail: string): PaymentSubmission | undefined => {
  if (!userEmail) return undefined;
  const all = getAllPaymentSubmissions();
  const userSubmissions = all.filter(
    (s) => s.userEmail && s.userEmail.toLowerCase() === userEmail.toLowerCase()
  );
  if (userSubmissions.length === 0) return undefined;
  return userSubmissions.sort((a, b) => b.createdAt - a.createdAt)[0];
};

export const submitPaymentProof = (params: {
  userEmail: string;
  userName: string;
  type: PaymentType;
  amount: number;
  itemDescription: string;
  proofFileName?: string;
  proofDataUrl?: string;
  targetLevel?: number;
  codeAmount?: number;
}): { success: boolean; message: string; submission?: PaymentSubmission } => {
  // Check if user already has a pending submission
  const existingPending = getUserPendingSubmission(params.userEmail);
  if (existingPending) {
    return {
      success: false,
      message: 'You already have a payment submission pending admin review. You cannot upload a new payment proof until the current one is processed.'
    };
  }

  const newSubmission: PaymentSubmission = {
    id: 'PAY-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000),
    userEmail: params.userEmail,
    userName: params.userName,
    type: params.type,
    amount: params.amount,
    itemDescription: params.itemDescription,
    proofFileName: params.proofFileName,
    proofDataUrl: params.proofDataUrl,
    createdAt: Date.now(),
    status: 'pending',
    targetLevel: params.targetLevel,
    codeAmount: params.codeAmount
  };

  const all = getAllPaymentSubmissions();
  all.unshift(newSubmission);
  savePaymentSubmissions(all);
  savePaymentSubmissionToFirestore(newSubmission);

  return {
    success: true,
    message: 'Payment proof submitted successfully! Awaiting admin verification and approval.',
    submission: newSubmission
  };
};

export const approvePaymentSubmission = (
  submissionId: string,
  onUserUpdateCallback?: (updatedUser: User) => void
): { success: boolean; message: string } => {
  const submissions = getAllPaymentSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) {
    return { success: false, message: 'Submission not found.' };
  }

  const sub = submissions[index];
  if (sub.status !== 'pending') {
    return { success: false, message: `Submission is already ${sub.status}.` };
  }

  sub.status = 'approved';
  sub.processedAt = Date.now();
  submissions[index] = sub;
  savePaymentSubmissions(submissions);
  savePaymentSubmissionToFirestore(sub);

  // Update target user in localStorage and Firestore
  try {
    const storedUsersStr = localStorage.getItem('naira9ja_users');
    const usersMap: Record<string, User> = storedUsersStr ? JSON.parse(storedUsersStr) : {};
    const targetEmailKey = sub.userEmail ? sub.userEmail.toLowerCase() : '';
    
    let matchedKey = Object.keys(usersMap).find((k) => k.toLowerCase() === targetEmailKey);
    let targetUser = matchedKey ? usersMap[matchedKey] : undefined;

    if (!targetUser && sub.userEmail) {
      targetUser = {
        name: sub.userName || 'User',
        email: sub.userEmail,
        balance: 0,
        level: sub.targetLevel || 1
      };
      matchedKey = targetEmailKey;
    }

    if (targetUser) {
      let message = `Your payment of ₦${sub.amount.toLocaleString()} for ${sub.itemDescription} was APPROVED by Service!`;

      const isActivationType = sub.type === 'activation' || (sub.itemDescription && sub.itemDescription.toLowerCase().includes('activation'));

      // Perform automatic benefit fulfillment
      if (sub.type === 'upgrade' && sub.targetLevel) {
        targetUser.level = sub.targetLevel;
        message += ` Your account has been upgraded to Level ${sub.targetLevel}.`;
      } else if (isActivationType) {
        targetUser.imminentDeactivationExpiry = undefined;
        targetUser.deactivationDate = undefined;
        message += ` Your account activation is now complete and active.`;
      } else if (sub.type === 'naira_code') {
        const codeVal = sub.codeAmount || sub.amount || 7000;
        const randDigits = Math.floor(100000 + Math.random() * 900000);
        const issuedCode = `N9JA-${codeVal}-${randDigits}`;

        const nairaCodeObj: NairaCodeData = {
          code: issuedCode,
          amount: codeVal,
          createdAt: Date.now(),
          isUsed: false
        };

        targetUser.activeNairaCode = nairaCodeObj;
        if (!targetUser.nairaCodesHistory) {
          targetUser.nairaCodesHistory = [];
        }
        targetUser.nairaCodesHistory.unshift(nairaCodeObj);

        message += ` Your Naira CODE (${issuedCode}) has been approved and is now active on your dashboard for withdrawal!`;
      }

      targetUser.attendedByAdmin = true;
      targetUser.adminMessage = message;
      usersMap[matchedKey || targetEmailKey] = targetUser;
      localStorage.setItem('naira9ja_users', JSON.stringify(usersMap));
      saveUserToFirestore(targetUser);

      if (onUserUpdateCallback) {
        onUserUpdateCallback(targetUser);
      }
    }
    window.dispatchEvent(new Event('naira9ja_payment_submissions_updated'));
    window.dispatchEvent(new Event('naira9ja_users_updated'));
  } catch (e) {
    console.error('Failed to update target user during approval:', e);
  }

  return { success: true, message: `Payment for ${sub.userName} (${sub.itemDescription}) has been APPROVED!` };
};

export const declinePaymentSubmission = (
  submissionId: string,
  declineReason?: string,
  onUserUpdateCallback?: (updatedUser: User) => void
): { success: boolean; message: string } => {
  const submissions = getAllPaymentSubmissions();
  const index = submissions.findIndex((s) => s.id === submissionId);
  if (index === -1) {
    return { success: false, message: 'Submission not found.' };
  }

  const sub = submissions[index];
  if (sub.status !== 'pending') {
    return { success: false, message: `Submission is already ${sub.status}.` };
  }

  const reason = declineReason && declineReason.trim() ? declineReason.trim() : 'Invalid transfer proof or unconfirmed bank deposit.';

  sub.status = 'declined';
  sub.declineReason = reason;
  sub.processedAt = Date.now();
  submissions[index] = sub;
  savePaymentSubmissions(submissions);
  savePaymentSubmissionToFirestore(sub);

  // Update target user with decline notification in localStorage and Firestore
  try {
    const storedUsersStr = localStorage.getItem('naira9ja_users');
    const usersMap: Record<string, User> = storedUsersStr ? JSON.parse(storedUsersStr) : {};
    const targetEmailKey = sub.userEmail ? sub.userEmail.toLowerCase() : '';
    let matchedKey = Object.keys(usersMap).find((k) => k.toLowerCase() === targetEmailKey);
    let targetUser = matchedKey ? usersMap[matchedKey] : undefined;

    if (!targetUser && sub.userEmail) {
      targetUser = {
        name: sub.userName || 'User',
        email: sub.userEmail,
        balance: 0
      };
      matchedKey = targetEmailKey;
    }

    if (targetUser) {
      targetUser.attendedByAdmin = true;
      targetUser.adminMessage = `Your payment submission of ₦${sub.amount.toLocaleString()} for ${sub.itemDescription} was DECLINED by Service.\nReason: ${reason}`;
      usersMap[matchedKey || targetEmailKey] = targetUser;
      localStorage.setItem('naira9ja_users', JSON.stringify(usersMap));
      saveUserToFirestore(targetUser);

      if (onUserUpdateCallback) {
        onUserUpdateCallback(targetUser);
      }
    }
    window.dispatchEvent(new Event('naira9ja_payment_submissions_updated'));
    window.dispatchEvent(new Event('naira9ja_users_updated'));
  } catch (e) {
    console.error('Failed to update target user during decline:', e);
  }

  return { success: true, message: `Payment for ${sub.userName} has been DECLINED.` };
};
