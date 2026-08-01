
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

export interface NairaCodeData {
  code: string;
  amount: number;
  createdAt: number;
  isUsed: boolean;
  usedAt?: number;
}

export interface User {
  name: string;
  email: string;
  balance: number;
  level?: number; // 1, 2, 3, 4 (Default is 1)
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
  isBanned?: boolean; // Banned status
  attendedByAdmin?: boolean; // Flagged when admin attends to user
  adminMessage?: string; // Message sent from admin
  notificationPreferences?: NotificationPreferences;
  lastTelegramClaimTimestamp?: number;
  dailyQuizCount?: number;
  lastQuizTimestamp?: number;
  activeNairaCode?: NairaCodeData;
  nairaCodesHistory?: NairaCodeData[];
}

export interface AppSettings {
  companyBankName: string;
  companyAccountNumber: string;
  companyAccountName: string;
  level2Price: number;
  level3Price: number;
  level4Price: number;
  nairaCodePrices: number[];
  telegramLink: string;
  supportLink: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  companyBankName: 'Moniepoint MFB',
  companyAccountNumber: '5276179936',
  companyAccountName: 'Awwal Onimsi Abdulsalam',
  level2Price: 6000,
  level3Price: 8000,
  level4Price: 15000,
  nairaCodePrices: [6000, 8000, 10000, 15000],
  telegramLink: 'https://t.me/naira9ja001',
  supportLink: 'https://t.me/naira9ja_support'
};

export interface UpgradeLevelPlan {
  level: number;
  name: string;
  price: number;
  priceFormatted: string;
  badge?: string;
  features: string[];
}

export type PaymentType = 'upgrade' | 'activation' | 'naira_code';
export type PaymentStatus = 'pending' | 'approved' | 'declined';

export interface PaymentSubmission {
  id: string;
  userEmail: string;
  userName: string;
  type: PaymentType;
  amount: number;
  itemDescription: string;
  proofFileName?: string;
  proofDataUrl?: string;
  createdAt: number;
  status: PaymentStatus;
  targetLevel?: number;
  codeAmount?: number;
  declineReason?: string;
  processedAt?: number;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  amount: string; // For email body clarity
  duration: string;
  recommended?: boolean;
}
