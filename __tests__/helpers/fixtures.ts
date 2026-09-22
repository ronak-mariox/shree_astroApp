/**
 * Fixtures for the screen tests.
 *
 * These were the app's seed data before it talked to a server. They live here
 * now because the only thing that still needs made-up records is a test.
 */

import type { BankAccount } from '../../src/data/bank';
import type { UploadedDocument } from '../../src/data/documents';
import type { GalleryPhoto } from '../../src/data/gallery';
import type { ServiceRate } from '../../src/data/priceChange';
import type { AstrologerProfile } from '../../src/data/profile';
import type { Review } from '../../src/data/reviews';
import type { ChatMessage } from '../../src/components/ChatBubble';
import type { ConsultationRequest } from '../../src/components/RequestCard';
import type { HistoryEntry } from '../../src/data/history';
import type { Notification } from '../../src/components/NotificationCard';
import type { PerformanceStats } from '../../src/components/PerformanceCard';
import type { ServiceRow } from '../../src/components/ServicesCard';
import type { Transaction } from '../../src/components/TransactionRow';

/**
 * What the record holds before anything is edited. Figma prints these on the
 * read screen (nodes 110:6297 – 110:6332); the edit screen's own mock values
 * are its placeholders, so the record wins there.
 */
export const FIXTURE_PROFILE: AstrologerProfile = {
  astroCode: '2024031009',
  fullName: 'Astro Mohan',
  email: 'mohanram123@gmail.com',
  primaryMobile: '95356 54856',
  secondaryMobile: '6498796543',
  gender: 'Female',
  dob: 'April 10, 2001',
  language: 'English',
  experience: '2 years',
  skill: 'Numerology , FaceReading , Nadi Vedic , Tarot',
  about:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
};

/** The astrologer's own portfolio photos — separate from their profile photo. */
export const FIXTURE_GALLERY: ReadonlyArray<GalleryPhoto> = [
  { id: 'portfolio-1', url: 'https://example.com/gallery/one.jpg' },
  { id: 'portfolio-2', url: 'https://example.com/gallery/two.jpg' },
];

/** The account Figma prints on the screen (nodes 110:6616 – 110:6638). */
export const FIXTURE_BANK_ACCOUNTS: ReadonlyArray<BankAccount> = [
  {
    id: 'pnb-6876',
    holderName: 'Saurabh Sani',
    bankName: 'Punjab National Bank',
    accountNumber: '8436 5863 4785 6876',
    ifsc: 'PNB32423IB',
    createdDate: 'September 25, 2024',
    status: 'Pending',
    proofFileName: 'cancelled-cheque.png',
  },
];

/**
 * A payout settled against an account. Figma designs no ledger, so the sheet
 * behind "View Trangection" prints these.
 */
export type BankTransaction = {
  id: string;
  reference: string;
  date: string;
  amount: string;
  status: string;
};

export const FIXTURE_TRANSACTIONS: ReadonlyArray<BankTransaction> = [
  {
    id: 'txn-1',
    reference: 'Payout · September 2024',
    date: 'September 30, 2024',
    amount: '₹18,520',
    status: 'Settled',
  },
  {
    id: 'txn-2',
    reference: 'Payout · August 2024',
    date: 'August 31, 2024',
    amount: '₹14,180',
    status: 'Settled',
  },
];

/** The scans already on file (Figma frames 110:7102, 110:7154, 110:7180). */
export const FIXTURE_DOCUMENTS: ReadonlyArray<UploadedDocument> = [
  {
    id: 'id-proof-1',
    type: 'Id Proof',
    idNumber: '5445GFDT454',
    status: 'Pending',
    fileName: 'id-proof-front.png',
  },
  {
    id: 'id-proof-2',
    type: 'Id Proof',
    idNumber: '5445GFDT454',
    status: 'Pending',
    fileName: 'id-proof-back.png',
  },
  {
    id: 'pan-1',
    type: 'PAN Card',
    idNumber: '5445GFDT454',
    status: 'Pending',
    fileName: 'pan-card.png',
  },
  {
    id: 'award-1',
    type: 'Award',
    idNumber: '5445GFDT454',
    status: 'Pending',
    fileName: 'award.png',
  },
];

/**
 * Figma fills in only the first panel and leaves the rest closed, so the others
 * carry the same figures until a request is made against them.
 */
const BASE = {
  oldRate: '₹ 15',
  currentRate: '₹ 15',
  offer: '15%',
  applyAll: 'Yas',
  newRequestedRate: '₹ 15',
  requestDate: '20 Jan, 2025',
  status: 'Pending',
} as const;

/** Figma nodes 110:11983 – 110:12036, in order. */
export const FIXTURE_SERVICE_RATES: ReadonlyArray<ServiceRate> = [
  { id: 'call', name: 'Call', ...BASE },
  { id: 'chat', name: 'Chat', ...BASE },
  { id: 'live-chat', name: 'Live Chat', ...BASE },
  { id: 'live-call', name: 'Live Call', ...BASE },
  { id: 'emergency-chat', name: 'Emergency Chat', ...BASE, emergency: true },
];

/** Figma draws two cards, both against May 2025 (nodes 110:12283, 110:12306). */
export const FIXTURE_REVIEWS: ReadonlyArray<Review> = [
  {
    id: 'review-1',
    reviewer: 'Rahul Sharma',
    orderId: '45235452155632',
    date: 'Mar 05, 2024',
    service: 'Chat',
    duration: '4 Mins',
    rating: 1,
    comment: 'I dont like your Astrology Skills',
    year: '2025',
    month: 'May',
  },
  {
    id: 'review-2',
    reviewer: 'Rahul Sharma',
    orderId: '45235452155632',
    date: 'Mar 05, 2024',
    service: 'Chat',
    duration: '4 Mins',
    rating: 1,
    comment: 'I dont like your Astrology Skills',
    year: '2025',
    month: 'May',
  },
];


/** The signed-in astrologer, as the dashboard header prints them. */
export const ASTROLOGER = {
  name: 'Pt. Rajesh',
  greeting: 'Good Morning ✨',
} as const;

/** Figma nodes 104:5766, 104:5787. */
export const EARNINGS = {
  today: '₹2,840',
  todayTrend: '+₹340 this hour',
  walletBalance: '₹18,520',
} as const;

/** Figma node 104:5817. */
export const PERFORMANCE: PerformanceStats = {
  consultations: 12,
  rating: 4.9,
  acceptance: 94,
};

/** Figma node 106:6879. */
export const SERVICES: ReadonlyArray<ServiceRow> = [
  { id: 'call', label: 'Call', rate: '10', time: '01 Dec 12:00 PM', enabled: false },
  { id: 'chat', label: 'Chat', rate: '10', time: '05 Dec 12:00 PM', enabled: false },
];

/** Figma node 106:7011. */
export const LIFE_ASPECTS: ReadonlyArray<string> = [
  'Love',
  'Parents',
  'Education',
  'Career',
  'Marriage',
  'Health',
];

/** Figma node 106:7130. */
export const SKILLS: ReadonlyArray<string> = [
  'Tarot',
  'Vastu',
  'Vedic',
  'Numerology',
  'Palmistry',
  'Prashna kundli',
];

/**
 * Figma nodes 104:5910, 104:5946 for the cards; `details` is what the incoming
 * popup prints (node 108:7448). Only Priya's sheet is drawn in Figma, so Arjun's
 * follows the same shape from his card's channel and topic.
 */
export const PENDING_REQUESTS: ReadonlyArray<ConsultationRequest> = [
  {
    id: 'priya-mehta',
    name: 'Priya Mehta',
    initials: 'PM',
    age: '2m ago',
    channel: 'chat',
    topic: 'Marriage timing',
    details: {
      dateOfBirth: '15 June 1992, 06:30 AM',
      birthPlace: 'Mumbai, Maharashtra',
      issue: 'Marriage Timing & Compatibility',
      rate: '₹25/min',
      duration: '20–30 minutes',
      earnings: '₹500 – ₹750',
    },
  },
  {
    id: 'arjun-rao',
    name: 'Arjun Rao',
    initials: 'AR',
    age: '5m ago',
    channel: 'voice',
    topic: 'Career & job change',
    details: {
      dateOfBirth: '02 March 1988, 11:45 PM',
      birthPlace: 'Bengaluru, Karnataka',
      issue: 'Career & Job Change',
      rate: '₹25/min',
      duration: '15–25 minutes',
      earnings: '₹375 – ₹625',
    },
  },
];

/**
 * The badge counts three, but only two cards are drawn — the third is the one
 * still below the fold in the mockup.
 */
export const PENDING_COUNT = 3;

/**
 * The consult screen's Missed Call list reuses the same two seekers, without
 * answer buttons (Figma nodes 112:2160, 112:2188).
 */
export const MISSED_CALLS: ReadonlyArray<ConsultationRequest> =
  PENDING_REQUESTS.map(request => ({
    ...request,
    id: `missed-${request.id}`,
  }));

export const MISSED_COUNT = 3;

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

/** Total across the whole history (Figma node 110:8940). */
export const HISTORY_TOTAL = '5,00,000';

/**
 * Figma repeats one entry down both screens (nodes 110:8942 – 110:9014), so the
 * four cards carry the same values under distinct ids.
 */
export const HISTORY_ENTRIES: ReadonlyArray<HistoryEntry> = Array.from(
  { length: 4 },
  (_, index) => ({
    id: `entry-${index + 1}`,
    userName: 'Jeeshan Chandravanshi',
    amount: '₹49.00',
    dateTime: '05 Sep 2025, 12:55 PM',
    duration: '1 min',
    refundStatus: '--',
    refundDate: '--',
  }),
);

/**
 * The astrologer's alerts feed, newest first — Figma node 112:1546. The two at
 * the top are unread, which is where the header's count comes from.
 */
export const NOTIFICATIONS: ReadonlyArray<Notification> = [
  {
    id: 'chat-request-rahul',
    kind: 'chat',
    title: 'New Chat Request',
    body: 'Rahul Sharma wants a consultation on career.',
    age: '2 min ago',
    unread: true,
  },
  {
    id: 'wallet-credit-priya',
    kind: 'wallet',
    title: 'Wallet Credited',
    body: '₹625 credited for consultation with Priya Mehta.',
    age: '45 min ago',
    unread: true,
  },
  {
    id: 'review-arjun',
    kind: 'review',
    title: 'New Review',
    body: "Arjun Rao rated you 5 stars: 'Excellent prediction!'",
    age: '2 hrs ago',
    unread: false,
  },
  {
    id: 'withdrawal-approved',
    kind: 'withdrawal',
    title: 'Withdrawal Approved',
    body: '₹5,000 withdrawal processed successfully.',
    age: 'Yesterday',
    unread: false,
  },
  {
    id: 'platform-dosha-tools',
    kind: 'platform',
    title: 'Platform Update',
    body: 'New AI tools available — Dosha analysis now live!',
    age: '2 days ago',
    unread: false,
  },
];

/** The seeker on the other end of the live consultation (Figma node 110:500). */
export const CHAT_PEER = {
  name: 'Astro Rakesh',
  elapsed: '04:58 mins',
} as const;

/**
 * The transcript as Figma lays it out, top to bottom, keeping its own line
 * breaks and the top corner each bubble's tail flicks off
 * (nodes 110:462, 110:440, 110:478, 110:470, 110:450).
 */
export const CHAT_TRANSCRIPT: ReadonlyArray<ChatMessage> = [
  {
    id: 'birth-details',
    from: 'seeker',
    tail: 'right',
    lines: [
      'Hi',
      'Below are my details:',
      'Name: Mithu',
      'Gender: Male',
      'DOB: 08-Feb-1999',
      'TOB: 12:45 PM',
      'POB: Delhi, India',
    ],
    time: '10:52 AM',
    action: 'Generate Kundli',
  },
  {
    id: 'greeting',
    from: 'astrologer',
    tail: 'left',
    lines: [
      'Welcome to KarmaGuru',
      'Astrologer will join within 10 second',
      '',
      'Please share your question in the',
      'meanwhile',
    ],
    time: '10:52 AM',
  },
  {
    id: 'greeting-quoted',
    from: 'seeker',
    tail: 'left',
    quote: {
      lines: ['Welcome to KarmaGuru', 'Astrologer will join within 10 second'],
    },
    lines: ['Please share your question in the the', 'meanwhile'],
    time: '10:54 AM',
  },
  {
    id: 'reply-astrologer',
    from: 'astrologer',
    tail: 'right',
    lines: [
      'Lorem Ipsum is simply dummy text',
      'of the printing and typesetting ind',
      'ustry. Lorem Ipsum has been the m',
      'e anwhile',
    ],
    time: '10:54 AM',
  },
  {
    id: 'reply-seeker',
    from: 'seeker',
    tail: 'left',
    lines: [
      'Lorem Ipsum is simply dummy text',
      'of the printing and typesetting ind',
      'ustry. Lorem Ipsum has been the m',
      'e anwhile',
    ],
    time: '10:54 AM',
  },
];
