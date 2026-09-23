/**
 * A stand-in for services/api.ts, for the screen tests.
 *
 * The real one talks to a server, which a screen test has no business doing.
 * This keeps an in-memory store with the same shapes, so every test exercises
 * the actual screens and the actual provider — only the network is replaced.
 *
 * `resetApiMock()` puts the store back between tests.
 */

import type { BankAccount, BankAccountDraft, BankTransaction } from '../../src/data/bank';
import type { UploadedDocument } from '../../src/data/documents';
import type { GalleryPhoto } from '../../src/data/gallery';
import type { PriceChangeDraft, ServiceRate } from '../../src/data/priceChange';
import type { AstrologerProfile } from '../../src/data/profile';
import type { Review } from '../../src/data/reviews';
import type { Dispute } from '../../src/data/support';
import {
  CHAT_PEER,
  CHAT_TRANSCRIPT,
  FIXTURE_BANK_ACCOUNTS,
  FIXTURE_DOCUMENTS,
  FIXTURE_GALLERY,
  FIXTURE_PROFILE,
  FIXTURE_REVIEWS,
  FIXTURE_SERVICE_RATES,
  FIXTURE_TRANSACTIONS,
  HISTORY_ENTRIES,
  HISTORY_TOTAL,
  MISSED_CALLS,
  NOTIFICATIONS,
  PAYOUT_ACCOUNT,
  TRANSACTIONS,
  WALLET_BALANCE,
} from './fixtures';

/** The two requests the dashboard tests answer and decline. */
const FIXTURE_REQUESTS = [
  {
    chatId: 'chat-priya',
    channel: 'chat',
    user: { id: 'u-1', name: 'Priya Mehta' },
    intake: {
      topic: 'marriage',
      question: 'Marriage timing',
      minutesBooked: 10,
      birthDetails: {
        dateOfBirth: '1996-05-14T00:00:00.000Z',
        place: { formatted: 'Pune, Maharashtra' },
      },
    },
    ratePerMinute: 20,
    requestedAt: new Date().toISOString(),
  },
  {
    chatId: 'chat-arjun',
    channel: 'call',
    user: { id: 'u-2', name: 'Arjun Rao' },
    intake: { topic: 'career-job', question: 'Career & job change', minutesBooked: 15 },
    ratePerMinute: 30,
    requestedAt: new Date().toISOString(),
  },
];

/** The services the dashboard switches on and off. */
const FIXTURE_SERVICES = [
  { type: 'call', isEnabled: false, ratePerMinute: 10, effectiveRate: 10 },
  { type: 'chat', isEnabled: false, ratePerMinute: 10, effectiveRate: 10 },
];

const store = {
  profile: { ...FIXTURE_PROFILE } as AstrologerProfile,
  requests: FIXTURE_REQUESTS.map(r => ({ ...r })),
  services: FIXTURE_SERVICES.map(s => ({ ...s })),
  isOnline: true,
  bankAccounts: [...FIXTURE_BANK_ACCOUNTS] as BankAccount[],
  transactions: [...FIXTURE_TRANSACTIONS] as BankTransaction[],
  documents: [...FIXTURE_DOCUMENTS] as UploadedDocument[],
  gallery: [...FIXTURE_GALLERY] as GalleryPhoto[],
  serviceRates: [...FIXTURE_SERVICE_RATES] as ServiceRate[],
  reviews: [...FIXTURE_REVIEWS] as Review[],
};

let nextId = 1;
const mintId = (prefix: string) => `${prefix}-${nextId++}`;

export function resetApiMock() {
  store.profile = { ...FIXTURE_PROFILE };
  store.bankAccounts = [...FIXTURE_BANK_ACCOUNTS];
  store.transactions = [...FIXTURE_TRANSACTIONS];
  store.documents = [...FIXTURE_DOCUMENTS];
  store.gallery = [...FIXTURE_GALLERY];
  store.serviceRates = [...FIXTURE_SERVICE_RATES];
  store.reviews = [...FIXTURE_REVIEWS];
  store.requests = FIXTURE_REQUESTS.map(r => ({ ...r }));
  store.services = FIXTURE_SERVICES.map(s => ({ ...s }));
  store.isOnline = true;
  posted = [];
  nextId = 1;
}

const today = () =>
  new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/* ------------------------------------------------------------------ profile */

export const fetchProfile = async () => ({ ...store.profile });

export const saveProfile = async (profile: AstrologerProfile) => {
  store.profile = { ...profile };
  return { ...store.profile };
};

export const uploadProfilePhoto = async (file: { uri?: string; name?: string } | string) => {
  store.profile = {
    ...store.profile,
    photoUrl: typeof file === 'string' ? file : file.uri ?? file.name,
  };
  return { ...store.profile };
};

/* --------------------------------------------------------------------- bank */

export const fetchBankAccounts = async () => store.bankAccounts.map(a => ({ ...a }));

export const addBankAccount = async (
  draft: BankAccountDraft,
  proof?: { name?: string },
) => {
  const { validateBankAccount } = require('../../src/data/bank');
  const problem = validateBankAccount(draft);
  if (problem) {
    throw new Error(problem);
  }

  const account: BankAccount = {
    id: mintId('account'),
    holderName: draft.holderName,
    bankName: draft.bankName,
    accountNumber: draft.accountNumber,
    ifsc: draft.ifsc,
    createdDate: today(),
    status: 'Pending',
    proofFileName: proof?.name,
  };
  store.bankAccounts = [...store.bankAccounts, account];
  return { ...account };
};

export const fetchTransactions = async () => store.transactions.map(t => ({ ...t }));

/* ---------------------------------------------------------------- documents */

export const fetchDocuments = async () => store.documents.map(d => ({ ...d }));

export const uploadDocument = async (input: {
  type: string;
  idNumber: string;
  file?: { name?: string };
}) => {
  if (!input.idNumber.trim()) {
    throw new Error('Enter the number this document is filed against.');
  }
  if (!input.file?.name) {
    throw new Error('Pick a file to upload.');
  }

  const document: UploadedDocument = {
    id: mintId('document'),
    type: input.type,
    idNumber: input.idNumber,
    status: 'Pending',
    fileName: input.file.name,
  };
  store.documents = [...store.documents, document];
  return { ...document };
};

export const replaceDocument = async (id: string, file: { name?: string }) => {
  const existing = store.documents.find(d => d.id === id);
  if (!existing) {
    throw new Error('That document is no longer on file.');
  }
  const updated = { ...existing, fileName: file.name ?? '', status: 'Pending' };
  store.documents = store.documents.map(d => (d.id === id ? updated : d));
  return { ...updated };
};

export const deleteDocument = async (id: string) => {
  store.documents = store.documents.filter(d => d.id !== id);
};

/* ------------------------------------------------------------------ gallery */

export const fetchGallery = async () => store.gallery.map(photo => ({ ...photo }));

export const addGalleryImage = async (file: { uri: string }) => {
  const photo: GalleryPhoto = { id: mintId('gallery'), url: file.uri };
  store.gallery = [...store.gallery, photo];
  return store.gallery.map(entry => ({ ...entry }));
};

export const deleteGalleryImage = async (id: string) => {
  store.gallery = store.gallery.filter(photo => photo.id !== id);
  return store.gallery.map(entry => ({ ...entry }));
};

/* ------------------------------------------------------------------ support */

/** Disputes raised in a test run, so the screen's own list can be asserted. */
const raisedDisputes: Array<Record<string, unknown>> = [];

export const submitDispute = async (dispute: Dispute) => {
  const { validateDispute } = require('../../src/data/support');
  const problem = validateDispute(dispute);
  if (problem) {
    throw new Error(problem);
  }
  raisedDisputes.unshift({
    _id: `tkt-${raisedDisputes.length + 1}`,
    reference: `TKT-TEST${raisedDisputes.length + 1}`,
    issueType: dispute.issueType,
    description: dispute.description,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
};

export const fetchMyDisputes = jest.fn(async () => raisedDisputes.map(entry => ({ ...entry })));
/** Test-only: clears what previous tests raised. */
export const resetDisputes = () => raisedDisputes.splice(0);

/* ------------------------------------------------------------------- rates */

export const fetchServiceRates = async () => store.serviceRates.map(r => ({ ...r }));

export const requestPriceChange = async (draft: PriceChangeDraft) => {
  const { validatePriceChange } = require('../../src/data/priceChange');
  const problem = validatePriceChange(draft);
  if (problem) {
    throw new Error(problem);
  }

  const existing = store.serviceRates.find(
    rate => rate.name.toLowerCase() === draft.service.trim().toLowerCase(),
  );
  if (!existing) {
    throw new Error(`There is no "${draft.service}" service to reprice.`);
  }

  const amount = draft.newPrice.replace(/[^0-9.]/g, '');
  const updated: ServiceRate = {
    ...existing,
    newRequestedRate: `₹ ${amount}`,
    requestDate: today(),
    status: 'Pending',
  };
  store.serviceRates = store.serviceRates.map(r => (r.id === existing.id ? updated : r));
  return { ...updated };
};

export const setOpeningRates = async () => store.serviceRates.map(r => ({ ...r }));

/* ----------------------------------------------------------------- reviews */

export const fetchReviews = async () => store.reviews.map(r => ({ ...r }));

const updateReview = (id: string, change: (review: Review) => Review): Review => {
  const existing = store.reviews.find(review => review.id === id);
  if (!existing) {
    throw new Error('That review is no longer listed.');
  }
  const updated = change(existing);
  store.reviews = store.reviews.map(review => (review.id === id ? updated : review));
  return { ...updated };
};

export const replyToReview = async (id: string, message: string, author: string) => {
  if (!message.trim()) {
    throw new Error('Write a reply before sending it.');
  }
  return updateReview(id, review => ({
    ...review,
    reply: { author, message: message.trim() },
  }));
};

export const toggleReviewFlag = async (id: string) =>
  updateReview(id, review => ({ ...review, flagged: !review.flagged }));

export const toggleReviewPin = async (id: string) =>
  updateReview(id, review => ({ ...review, pinned: !review.pinned }));

/* --------------------------------------------------------------- dashboard */

export const fetchDashboard = async () => ({
  name: 'Pt. Rajesh',
  isOnline: store.isOnline,
  earnings: { today: 2840, balance: 18520, thisMonth: 42350, lifetime: 320000 },
  performance: {
    consultationsToday: 12,
    consultationsTotal: 480,
    rating: 4.9,
    acceptance: 94,
  },
  services: store.services.map(s => ({ ...s })),
  pendingRequests: store.requests.length,
  missing: [],
  applicationStatus: 'approved',
});

export const setOnline = async (isOnline: boolean) => {
  store.isOnline = isOnline;
  return isOnline;
};

export const setServiceEnabled = async (type: string, isEnabled: boolean) => {
  store.services = store.services.map(service =>
    service.type === type ? { ...service, isEnabled } : service,
  );
};

export const fetchRequests = async () => store.requests.map(r => ({ ...r }));

/** Answering a request takes it out of the queue, as the server would. */
const settleRequest = (chatId: string) => {
  store.requests = store.requests.filter(request => request.chatId !== chatId);
  return {};
};

export const acceptRequest = async (chatId: string) => settleRequest(chatId);
export const rejectRequest = async (chatId: string) => settleRequest(chatId);
export const endConsultation = async () => ({});
/**
 * The seeker's saved kundli for a consultation (GET /chats/:chatId/kundli) —
 * a jest.fn so a test can swap in "no saved kundli".
 */
export const SEEKER_KUNDLI = {
  found: true as const,
  profileId: 'bp-1',
  status: 'ready',
  birthDetails: { fullName: 'mithu', gender: 'male', dateOfBirth: '1999-02-08T00:00:00.000Z', timeOfBirth: '12:45', place: 'Delhi, India' },
  chart: { url: 'https://example.com/chart-bp-1.svg' },
  lagna: 'Taurus',
  nakshatra: 'Rohini',
  keyPositions: [
    { label: 'Lagna', sign: 'Taurus' },
    { label: 'Sun', sign: 'Capricorn' },
    { label: 'Moon', sign: 'Taurus' },
  ],
  planetaryPositions: [
    { planet: 'Sun', sign: 'Capricorn', house: 9, isRetrograde: false },
    { planet: 'Moon', sign: 'Taurus', house: 1, isRetrograde: false },
    { planet: 'Saturn', sign: 'Aries', house: 12, isRetrograde: true },
  ],
  mahadasha: [
    { lord: 'Moon', start: '1995-01-01T00:00:00.000Z', end: '2005-01-01T00:00:00.000Z', current: false },
    { lord: 'Mars', start: '2005-01-01T00:00:00.000Z', end: '2012-01-01T00:00:00.000Z', current: false },
    { lord: 'Rahu', start: '2012-01-01T00:00:00.000Z', end: '2030-01-01T00:00:00.000Z', current: true },
  ],
};
export const fetchSeekerKundli = jest.fn(async (_chatId: string) => SEEKER_KUNDLI as unknown);

/** The admin's support contact (public GET /settings). */
export const fetchSupportContact = async () => ({ email: 'support@shreeastro.com' });

/**
 * The screens under test subscribe to these, but a screen test has no
 * business reaching a real socket — each just returns the unsubscribe
 * no-op and never fires, same as a connection that never opens.
 */
export const subscribeToIncomingRequests = () => () => {};

type ConsultationHandlers = {
  onMessage?: (message: unknown) => void;
  onTick?: (payload: { chatId: string; minutesBilled: number; minutesRemaining: number; balanceRemaining?: number }) => void;
  onLowBalance?: (payload: {
    chatId: string;
    exhausted: boolean;
    paused?: boolean;
    minutesRemaining?: number;
    balanceRemaining?: number;
  }) => void;
  onEnded?: (payload: { chatId: string; endedBy: string; reason?: string; durationSeconds: number; amountCharged: number }) => void;
  onPackageWarning?: (payload: Record<string, unknown>) => void;
  onPackageEnded?: (payload: Record<string, unknown>) => void;
  onPackageExtended?: (payload: Record<string, unknown>) => void;
  onPerMinuteStarted?: (payload: Record<string, unknown>) => void;
};

/** Whatever the screen currently under test subscribed with — lets a test fire a live event (see fireTick/fireLowBalance below) the same way the real socket would. */
let consultationHandlers: ConsultationHandlers | null = null;

export const subscribeToConsultation = (_chatId: string, _initialSeq: number, handlers: ConsultationHandlers) => {
  consultationHandlers = handlers;
  return () => {
    consultationHandlers = null;
  };
};

/** Test-only: simulates a normal minute billing fine, which clears any standing paused state. */
export const fireTick = (payload?: { chatId?: string; minutesBilled?: number; minutesRemaining?: number; balanceRemaining?: number }) =>
  consultationHandlers?.onTick?.({
    chatId: payload?.chatId ?? 'chat-1',
    minutesBilled: payload?.minutesBilled ?? 0,
    minutesRemaining: payload?.minutesRemaining ?? 0,
    balanceRemaining: payload?.balanceRemaining,
  });

/** Test-only: simulates the seeker's own balance running low/pausing/resuming while the screen under test is subscribed. */
export const fireLowBalance = (payload: {
  chatId: string;
  exhausted: boolean;
  paused?: boolean;
  minutesRemaining?: number;
  balanceRemaining?: number;
}) => consultationHandlers?.onLowBalance?.(payload);
/** Test-only: package bookings — ran out (paused), continued with another package. */
export const firePackageEnded = (payload: Record<string, unknown>) => consultationHandlers?.onPackageEnded?.(payload);
export const firePackageExtended = (payload: Record<string, unknown>) => consultationHandlers?.onPackageExtended?.(payload);
/** Test-only: package bookings — the seeker continued per-minute. */
export const firePerMinuteStarted = (payload: Record<string, unknown>) => consultationHandlers?.onPerMinuteStarted?.(payload);
export const connectLiveUpdates = () => null;
export const disconnectLiveUpdates = () => {};
/** Only the missed list is asked for by a screen; everything else is empty. */
export const fetchConsultations = async (status?: string) =>
  status === 'missed'
    ? MISSED_CALLS.map(call => ({
        id: call.id,
        channel: call.channel === 'voice' ? 'call' : 'chat',
        with: { id: call.id, name: call.name },
        topic: call.topic,
        createdAt: new Date().toISOString(),
      }))
    : [];

/** The session's live state — the chat screen's clock ticks from `startedAt`, handed back as "now" so a fresh render always opens at (00:00 mins). */
export const getChatState = async (chatId: string) => ({
  chatId,
  role: 'astrologer' as const,
  channel: 'chat',
  status: 'active',
  startedAt: new Date().toISOString(),
  ratePerMinute: 20,
  minutesBilled: 0,
  amountCharged: 0,
});

/** The transcript, in the shape the API answers with. */
/** Messages sent during a test, appended to the transcript like a server. */
let posted: any[] = [];

export const fetchMessages = async () => [
  ...CHAT_TRANSCRIPT.map((bubble, index) => ({
    id: bubble.id,
    senderRole: bubble.from === 'astrologer' ? 'astrologer' : 'user',
    type: 'text',
    content: { text: bubble.lines.join(' ') },
    /** The fixture's quoted bubble answers the one before it. */
    replyTo: bubble.quote ? CHAT_TRANSCRIPT[index - 1]?.id : undefined,
    isIntake: Boolean(bubble.action),
    seq: index + 1,
    createdAt: new Date().toISOString(),
  })),
  ...posted,
];

export const sendMessage = async (_chatId: string, text: string) => {
  const message = {
    id: `sent-${posted.length + 1}`,
    senderRole: 'astrologer',
    type: 'text',
    content: { text },
    seq: CHAT_TRANSCRIPT.length + posted.length + 1,
    createdAt: new Date().toISOString(),
  };
  posted = [...posted, message];
  return message;
};

export const fetchEarnings = async () => ({
  balance: 18520,
  today: 2840,
  thisMonth: 42350,
  lifetime: 320000,
});

export const requestWithdrawal = async () => ({});
export const fetchWithdrawals = async () => [];
export const fetchNotifications = async () => ({
  items: NOTIFICATIONS,
  total: NOTIFICATIONS.length,
  unread: NOTIFICATIONS.filter(n => n.unread).length,
});
export const markNotificationsRead = async () => ({ updated: 1, unread: 0 });

/* -------------------------------------------------------- screen-shaped */

export const fetchWallet = async () => ({
  balance: { ...WALLET_BALANCE },
  transactions: TRANSACTIONS.map(t => ({ ...t })),
});

export const fetchHistory = async () => ({
  total: HISTORY_TOTAL,
  entries: HISTORY_ENTRIES.map(entry => ({ ...entry })),
});

export const fetchNotificationFeed = async () => NOTIFICATIONS.map(n => ({ ...n }));

/** The withdraw screen reads the primary account off the bank list. */
export const fetchPayoutAccount = async () => ({ ...PAYOUT_ACCOUNT });
export { CHAT_PEER };
export const submitApplication = async () => ({ applicationStatus: 'under_review' });
