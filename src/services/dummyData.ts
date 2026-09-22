/**
 * Fixture data for every screen that normally reads from the API.
 *
 * Used only while `USE_DUMMY_DATA` in `./api.ts` is on — see the comment
 * there. Field names follow the backend models (`Astrologer`,
 * `AstrologerProfile`, `WalletTransaction`, `Notification`, `Withdrawal`) so
 * swapping back to the real endpoints later needs no reshaping.
 */

import { type BankAccount, type BankTransaction } from '../data/bank';
import { type GalleryPhoto } from '../data/gallery';
import { type UploadedDocument } from '../data/documents';
import { type ServiceRate } from '../data/priceChange';
import { type AstrologerProfile } from '../data/profile';
import { type Review } from '../data/reviews';

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString();

/* -------------------------------------------------------------------- profile */

export const DUMMY_PROFILE: AstrologerProfile = {
  astroCode: 'AST10234',
  fullName: 'Pt. Ranjan Sharma',
  email: 'ranjan.sharma@example.com',
  primaryMobile: '9876543210',
  secondaryMobile: '9123456780',
  gender: 'Male',
  dob: 'April 10, 1985',
  language: 'Hindi , English',
  experience: '12 years',
  skill: 'Vedic , Numerology , Tarot',
  about:
    'Vedic astrologer with 12+ years of experience in horoscope reading, numerology and tarot consultations. Helped thousands of seekers find clarity on career, marriage and health.',
};

/* -------------------------------------------------------------------- gallery */

export const DUMMY_GALLERY: GalleryPhoto[] = [];

/* ----------------------------------------------------------------------- bank */

export const DUMMY_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank-1',
    holderName: 'Ranjan Sharma',
    bankName: 'HDFC Bank',
    accountNumber: '50100234567890',
    ifsc: 'HDFC0001234',
    createdDate: '12 Jan, 2025',
    status: 'Approved',
    proofFileName: 'cancelled-cheque.jpg',
  },
  {
    id: 'bank-2',
    holderName: 'Ranjan Sharma',
    bankName: 'State Bank of India',
    accountNumber: '30456789012345',
    ifsc: 'SBIN0005678',
    createdDate: '02 Mar, 2025',
    status: 'Pending',
    proofFileName: 'passbook.jpg',
  },
];

export const DUMMY_TRANSACTIONS: BankTransaction[] = [
  { id: 'txn-1', reference: 'TXN-8FA21C', date: '28 Aug, 2025', amount: '₹ 4500', status: 'Success' },
  { id: 'txn-2', reference: 'TXN-6B12E4', date: '15 Aug, 2025', amount: '₹ 3200', status: 'Success' },
  { id: 'txn-3', reference: 'TXN-9C77A1', date: '02 Aug, 2025', amount: '₹ 1800', status: 'Pending' },
];

/* ------------------------------------------------------------------ documents */

export const DUMMY_DOCUMENTS: UploadedDocument[] = [
  { id: 'doc-1', type: 'Id Proof', idNumber: 'XXXXXX1234', status: 'Approved', fileName: 'aadhar-front.jpg' },
  { id: 'doc-2', type: 'PAN Card', idNumber: 'ABCDE1234F', status: 'Approved', fileName: 'pan-card.jpg' },
  { id: 'doc-3', type: 'Certificate', idNumber: 'CERT-2025-045', status: 'Pending', fileName: 'astrology-certificate.pdf' },
];

/* -------------------------------------------------------------- price changes */

export const DUMMY_SERVICE_RATES: ServiceRate[] = [
  {
    id: 'chat',
    name: 'Chat',
    oldRate: '₹ 15',
    currentRate: '₹ 12',
    offer: '20%',
    applyAll: 'No',
    newRequestedRate: '₹ 15',
    requestDate: '20 Aug, 2025',
    status: 'Pending',
    emergency: false,
  },
  {
    id: 'call',
    name: 'Call',
    oldRate: '₹ 20',
    currentRate: '₹ 20',
    offer: '0%',
    applyAll: 'No',
    newRequestedRate: '₹ 20',
    requestDate: '—',
    status: 'Active',
    emergency: false,
  },
  {
    id: 'emergency_chat',
    name: 'Emergency Chat',
    oldRate: '₹ 25',
    currentRate: '₹ 25',
    offer: '0%',
    applyAll: 'No',
    newRequestedRate: '₹ 25',
    requestDate: '—',
    status: 'Active',
    emergency: true,
  },
];

/* -------------------------------------------------------------------- reviews */

export const DUMMY_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    reviewer: 'Priya Mehta',
    orderId: '8FA21CDE',
    date: '12 May, 2025',
    service: 'Chat',
    duration: '18 min',
    rating: 5,
    comment: 'Amazing insights on my career path, very accurate predictions!',
    reply: { author: 'You', message: 'Thank you so much for your kind words 🙏' },
    flagged: false,
    pinned: true,
    year: '2025',
    month: 'May',
  },
  {
    id: 'rev-2',
    reviewer: 'Amit Verma',
    orderId: '6B12E4FA',
    date: '08 May, 2025',
    service: 'Call',
    duration: '25 min',
    rating: 4,
    comment: 'Good consultation, helped me understand my marriage timing.',
    flagged: false,
    pinned: false,
    year: '2025',
    month: 'May',
  },
  {
    id: 'rev-3',
    reviewer: 'Sneha Kapoor',
    orderId: '9C77A1BC',
    date: '22 Apr, 2025',
    service: 'Chat',
    duration: '10 min',
    rating: 3,
    comment: 'Decent session, would have liked more detail.',
    flagged: false,
    pinned: false,
    year: '2025',
    month: 'April',
  },
];

/* ------------------------------------------------------------------ dashboard */

export const DUMMY_DASHBOARD = {
  name: 'Pt. Ranjan Sharma',
  isOnline: true,
  earnings: { today: 2450, balance: 18650, thisMonth: 42300, lifetime: 186400 },
  performance: { consultationsToday: 6, consultationsTotal: 842, rating: 4.7, acceptance: 92 },
  services: [
    { type: 'chat', isEnabled: true, ratePerMinute: 15, effectiveRate: 12, onlineTime: '09:00 AM - 09:00 PM' },
    { type: 'call', isEnabled: true, ratePerMinute: 20, effectiveRate: 20, onlineTime: '10:00 AM - 08:00 PM' },
  ],
  pendingRequests: 2,
  missing: [] as string[],
  applicationStatus: 'approved',
};

/* --------------------------------------------------------------- consultations */

export const DUMMY_REQUESTS = [
  {
    chatId: 'chat-101',
    channel: 'chat',
    user: { id: 'user-1', name: 'Priya Mehta' },
    intake: {
      topic: 'career',
      question: 'Will I get a promotion this year?',
      birthDetails: { dateOfBirth: '1994-03-12', place: { formatted: 'Delhi, India', city: 'Delhi' } },
      minutesBooked: 15,
    },
    ratePerMinute: 12,
    requestedAt: minutesAgo(2),
  },
  {
    chatId: 'chat-102',
    channel: 'call',
    user: { id: 'user-2', name: 'Rahul Singh' },
    intake: {
      topic: 'marriage',
      question: 'When will I get married?',
      birthDetails: { dateOfBirth: '1990-07-22', place: { formatted: 'Mumbai, India', city: 'Mumbai' } },
      minutesBooked: 20,
    },
    ratePerMinute: 20,
    requestedAt: minutesAgo(7),
  },
];

export const DUMMY_MISSED_CONSULTATIONS = [
  { id: 'chat-090', channel: 'call', with: { id: 'user-3', name: 'Neha Joshi' }, topic: 'health', createdAt: minutesAgo(180) },
  { id: 'chat-091', channel: 'chat', with: { id: 'user-4', name: 'Vikram Rao' }, topic: 'finance', createdAt: minutesAgo(300) },
];

export const DUMMY_MESSAGES = [
  {
    id: 'msg-1',
    senderRole: 'user',
    content: { text: 'Namaste ji, I wanted to ask about my career growth this year.' },
    createdAt: minutesAgo(12),
    isIntake: true,
  },
  {
    id: 'msg-2',
    senderRole: 'astrologer',
    content: { text: 'Namaste! Please share your date, time and place of birth so I can check your chart.' },
    createdAt: minutesAgo(11),
  },
  {
    id: 'msg-3',
    senderRole: 'user',
    content: { text: '12 March 1994, 6:45 AM, Delhi.' },
    createdAt: minutesAgo(10),
  },
  {
    id: 'msg-4',
    senderRole: 'astrologer',
    content: { text: 'Thank you. Jupiter is transiting favourably for you — expect good career news around October.' },
    createdAt: minutesAgo(9),
  },
];

/* --------------------------------------------------------------------- wallet */

export const DUMMY_EARNINGS = {
  balance: 18650,
  today: 2450,
  thisMonth: 42300,
  lifetime: 186400,
  pendingWithdrawal: 0,
  totalWithdrawn: 52000,
  currency: 'INR',
};

export const DUMMY_WITHDRAWALS = [
  { id: 'wd-1', reference: 'WDL-7F2C91', amount: 5000, status: 'paid', requestedAt: minutesAgo(4000), paidAt: minutesAgo(3800) },
  { id: 'wd-2', reference: 'WDL-3A88B2', amount: 3000, status: 'pending', requestedAt: minutesAgo(200) },
];

export const DUMMY_WALLET = {
  balance: {
    total: '₹18,650',
    today: '₹2,450',
    monthly: '₹42,300',
    lifetime: '₹1.9L',
  },
  transactions: [
    { id: 'w-1', title: 'Chat with Priya Mehta', meta: 'Consultation Earning · 30 Aug, 14:20', amount: '+₹180', kind: 'credit' as const },
    { id: 'w-2', title: 'Withdrawal to HDFC Bank', meta: 'Withdrawal · 28 Aug, 11:05', amount: '−₹5,000', kind: 'withdrawal' as const },
    { id: 'w-3', title: 'Call with Rahul Singh', meta: 'Consultation Earning · 27 Aug, 19:40', amount: '+₹400', kind: 'credit' as const },
    { id: 'w-4', title: 'Platform Commission', meta: 'Commission · 27 Aug, 19:40', amount: '−₹100', kind: 'fee' as const },
  ],
};

/* ------------------------------------------------------------------- history */

export const DUMMY_HISTORY = {
  chat: {
    total: '12,540',
    entries: [
      {
        id: 'h-1',
        userName: 'Priya Mehta',
        channel: 'chat' as const,
        amount: '₹ 180',
        dateTime: '30 Aug, 2025, 02:20 PM',
        duration: '15:00 Min',
        status: '5 ★',
        refundStatus: 'No refund',
        refundDate: '—',
      },
      {
        id: 'h-2',
        userName: 'Sneha Kapoor',
        channel: 'chat' as const,
        amount: '₹ 96',
        dateTime: '29 Aug, 2025, 11:05 AM',
        duration: '08:00 Min',
        status: '4 ★',
        refundStatus: 'No refund',
        refundDate: '—',
      },
    ],
  },
  call: {
    total: '8,200',
    entries: [
      {
        id: 'h-3',
        userName: 'Rahul Singh',
        channel: 'call' as const,
        amount: '₹ 400',
        dateTime: '27 Aug, 2025, 07:40 PM',
        duration: '20:00 Min',
        status: '5 ★',
        refundStatus: 'No refund',
        refundDate: '—',
      },
      {
        id: 'h-4',
        userName: 'Amit Verma',
        channel: 'call' as const,
        amount: '₹ 250',
        dateTime: '25 Aug, 2025, 05:15 PM',
        duration: '12:30 Min',
        status: 'Completed',
        refundStatus: 'Refunded',
        refundDate: '26 Aug, 2025',
      },
    ],
  },
};

/* -------------------------------------------------------------- notifications */

export const DUMMY_NOTIFICATION_FEED = [
  { id: 'n-1', kind: 'chat', title: 'New consultation request', body: 'Priya Mehta wants a chat consultation.', age: '2 min ago', unread: true },
  { id: 'n-2', kind: 'wallet', title: 'Payment received', body: 'You earned ₹180 from a chat consultation.', age: '1 hour ago', unread: true },
  { id: 'n-3', kind: 'withdrawal', title: 'Withdrawal processed', body: '₹5,000 has been transferred to your HDFC account.', age: '1 day ago', unread: false },
  { id: 'n-4', kind: 'review', title: 'New review received', body: 'Priya Mehta rated you 5 ★.', age: '2 days ago', unread: false },
];
