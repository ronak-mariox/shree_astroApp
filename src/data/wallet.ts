import type { Transaction } from '../components/TransactionRow';

/** The wallet header's headline figures (Figma nodes 112:1203 – 112:1227). */
export const WALLET_BALANCE = {
  total: '₹18,520',
  today: '₹2,840',
  monthly: '₹42,350',
  lifetime: '₹3.2L',
} as const;

/** Figma nodes 112:1248 – 112:1333. */
export const TRANSACTIONS: ReadonlyArray<Transaction> = [
  {
    id: 'priya-chat',
    title: 'Priya Mehta',
    meta: 'Chat Consultation · Today, 10:30 AM',
    amount: '+₹625',
    kind: 'credit',
  },
  {
    id: 'arjun-voice',
    title: 'Arjun Rao',
    meta: 'Voice Call · Today, 09:00 AM',
    amount: '+₹840',
    kind: 'credit',
  },
  {
    id: 'withdrawal',
    title: 'Withdrawal',
    meta: 'Bank Transfer · Yesterday',
    amount: '-₹5,000',
    kind: 'withdrawal',
  },
  {
    id: 'sunita-chat',
    title: 'Sunita Devi',
    meta: 'Chat Consultation · Yesterday',
    amount: '+₹375',
    kind: 'credit',
  },
  {
    id: 'platform-fee',
    title: 'Platform Fee',
    meta: 'Deduction · Yesterday',
    amount: '-₹186',
    kind: 'fee',
  },
  {
    id: 'kavya-voice',
    title: 'Kavya Singh',
    meta: 'Voice Call · 2 days ago',
    amount: '+₹1,200',
    kind: 'credit',
  },
];

/** The account earnings settle into (Figma nodes 112:1444 – 112:1463). */
export const PAYOUT_ACCOUNT = {
  bank: 'State Bank of India',
  account: '••••••4521',
  ifsc: 'SBIN0001234',
} as const;

/** Preset withdrawal amounts, and the one Figma starts on (node 112:1425). */
export const WITHDRAW_PRESETS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: '1000', label: '₹1,000' },
  { value: '2000', label: '₹2,000' },
  { value: '5000', label: '₹5,000' },
  { value: '10000', label: '₹10,000' },
];

export const WITHDRAW_DEFAULT = '5000';

/** Formats a plain digit string the way the flow prints money: ₹5,000. */
export const formatRupees = (digits: string) => {
  const value = Number(digits || '0');
  return `₹${value.toLocaleString('en-IN')}`;
};
