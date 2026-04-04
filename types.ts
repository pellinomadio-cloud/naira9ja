
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  color?: string;
  badge?: string;
}

export interface PromoItem {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  valueLabel: string;
  buttonText: string;
  theme: 'purple' | 'blue' | 'orange';
  badge?: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string; // ISO string
  status: 'success' | 'pending' | 'failed';
}

export interface RewardStatus {
  currentDay: number;
  lastClaimedTimestamp: number;
}

export type NotificationType = 'withdrawals' | 'transfers' | 'airtime' | 'rewards';

export interface NotificationPreferences {
  withdrawals: boolean;
  transfers: boolean;
  airtime: boolean;
  rewards: boolean;
}

export interface User {
  name: string;
  email: string;
  balance: number;
  profileImage?: string;
  transactions?: Transaction[];
  rewardStatus?: RewardStatus;
  deactivationDate?: number; // Timestamp when deactivation takes effect
  imminentDeactivationExpiry?: number; // Timestamp when 20m warning expires
  isVIP?: boolean;
  vipBalance?: number;
  loanBalance?: number;
  loanExpiry?: number;
  isPMode?: boolean;
  isVMode?: boolean; // Verification mode
  notificationPreferences?: NotificationPreferences;
  lastTelegramClaimTimestamp?: number;
  dailyQuizCount?: number;
  lastQuizTimestamp?: number;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  amount: string; // For email body clarity
  duration: string;
  recommended?: boolean;
}
