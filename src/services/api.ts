/**
 * Everything the app reads or writes, in one place.
 *
 * This is the only file that talks to the server. Each function calls a real
 * endpoint and then **maps between two vocabularies**: the API speaks in ids
 * and numbers (`expertise: ['vedic']`, `ratePerMinute: 20`), and the screens
 * were drawn against readable strings (`skill: 'Vedic'`, `currentRate: '₹ 20'`).
 * Adapters below do that translation, so no screen has to know either shape.
 *
 * Every function throws an `ApiError` when the server refuses. The provider
 * (state/AppDataProvider.tsx) catches it and shows `error.message`.
 */

import { client } from './client';
import {
  type BankAccount,
  type BankAccountDraft,
  type BankTransaction,
  validateBankAccount,
} from '../data/bank';
import { type UploadedDocument } from '../data/documents';
import { type PriceChangeDraft, type ServiceRate, validatePriceChange } from '../data/priceChange';
import { type AstrologerProfile } from '../data/profile';
import { type Review } from '../data/reviews';
import { validateDispute, type Dispute } from '../data/support';

/* -------------------------------------------------------------------------- */
/* Translating between the API's ids and the screens' words                   */
/* -------------------------------------------------------------------------- */

/** "vedic" -> "Vedic", "face-reading" -> "Face Reading". */
const titleCase = (value: string) =>
  String(value)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** "Vedic Astrology" -> "vedic-astrology", which is the id the API stores. */
const toId = (value: string) => String(value).trim().toLowerCase().replace(/\s+/g, '-');

/** ["vedic","tarot"] -> "Vedic , Tarot", as the profile screen prints it. */
const joinLabels = (values?: string[]) => (values ?? []).map(titleCase).join(' , ');

/** "Vedic , Tarot" -> ["vedic","tarot"]. */
const splitLabels = (value?: string) =>
  (value ?? '')
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(toId);

/** 20 -> "₹ 20". */
const rupees = (value?: number) => `₹ ${Math.round(Number(value) || 0)}`;

/** "₹ 20" -> 20. */
const amountOf = (value: string) => Number(String(value).replace(/[^0-9.]/g, '')) || 0;

/** An ISO date -> "April 10, 2001", the way the profile screen writes one. */
const longDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

/** An ISO date -> "20 Jan, 2025", the way the price-change table writes one. */
const shortDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).replace(/^(\d+) (\w+)/, '$1 $2,')
    : '';

/** "pending" -> "Pending". */
const statusLabel = (value?: string) => titleCase(value ?? 'pending');

/* -------------------------------------------------------------------- profile */

/** What GET /astrologer/me answers, in the shape the screens read. */
function toProfile(astrologer: any): AstrologerProfile {
  return {
    astroCode: astrologer.astroCode ?? '',
    fullName: astrologer.name ?? '',
    email: astrologer.email ?? '',
    primaryMobile: astrologer.phone ?? '',
    secondaryMobile: astrologer.secondaryPhone ?? '',
    gender: titleCase(astrologer.gender ?? ''),
    dob: longDate(astrologer.dateOfBirth),
    language: joinLabels(astrologer.languages),
    experience: astrologer.experienceYears ? `${astrologer.experienceYears} years` : '',
    skill: joinLabels(astrologer.expertise),
    about: astrologer.about ?? '',
    photoFileName: astrologer.photo ?? undefined,
  };
}

/** GET /astrologer/profile */
export async function fetchProfile(): Promise<AstrologerProfile> {
  const { data } = await client.get('/astrologer/me');
  return toProfile(data.astrologer);
}

/**
 * PUT /astrologer/profile
 *
 * Only the fields the Edit Profile screen can change are sent. The astro code,
 * the primary mobile and the rates are not among them — those are set once, and
 * a rate change has to be approved.
 */
export async function saveProfile(profile: AstrologerProfile): Promise<AstrologerProfile> {
  const { data } = await client.patch('/astrologer/me', {
    name: profile.fullName.trim(),
    email: profile.email.trim() || undefined,
    gender: profile.gender ? profile.gender.toLowerCase() : undefined,
    about: profile.about,
    secondaryPhone: profile.secondaryMobile
      ? profile.secondaryMobile.replace(/\D/g, '')
      : undefined,
    languages: splitLabels(profile.language),
    expertise: splitLabels(profile.skill),
    experienceYears: Number(String(profile.experience).replace(/\D/g, '')) || undefined,
    /** Only when the account has no number yet — an admin-created one. */
    phone: profile.primaryMobile ? profile.primaryMobile.replace(/\D/g, '') : undefined,
  });

  return toProfile(data.astrologer);
}

/**
 * POST /astrologer/profile/photo
 *
 * The native picker hands over a `{ uri, name, type }`; React Native streams
 * the file itself from that. A plain string is treated as a URL already stored.
 */
export async function uploadProfilePhoto(
  photo: string | { uri: string; name?: string; type?: string },
): Promise<AstrologerProfile> {
  if (typeof photo === 'string') {
    const { data } = await client.patch('/astrologer/me', { photoUrl: photo });
    return toProfile(data.astrologer);
  }

  const form = new FormData();
  form.append('photo', {
    uri: photo.uri,
    name: photo.name || 'profile.jpg',
    type: photo.type || 'image/jpeg',
  } as unknown as Blob);

  const { data } = await client.patch('/astrologer/me', form);
  return toProfile(data.astrologer);
}

/* ----------------------------------------------------------------------- bank */

function toBankAccount(account: any): BankAccount {
  return {
    id: String(account._id),
    holderName: account.holderName ?? '',
    bankName: account.bankName ?? '',
    accountNumber: account.accountNumber ?? '',
    ifsc: account.ifsc ?? '',
    createdDate: shortDate(account.createdAt) || shortDate(new Date().toISOString()),
    status: statusLabel(account.status),
    proofFileName: account.proof?.fileName,
  };
}

/** GET /astrologer/bank-accounts */
export async function fetchBankAccounts(): Promise<BankAccount[]> {
  const { data } = await client.get('/astrologer/me/bank-accounts');
  return (data.items ?? []).map(toBankAccount);
}

/**
 * POST /astrologer/bank-accounts
 *
 * Checked on the client first so an obviously incomplete form is refused
 * without a round trip; the server checks it again regardless.
 */
export async function addBankAccount(
  draft: BankAccountDraft,
  proof?: { uri: string; name?: string; type?: string },
): Promise<BankAccount> {
  const problem = validateBankAccount(draft);
  if (problem) {
    throw new Error(problem);
  }

  const form = new FormData();
  form.append('holderName', draft.holderName.trim());
  form.append('bankName', draft.bankName.trim());
  form.append('accountNumber', draft.accountNumber.trim());
  form.append('ifsc', draft.ifsc.trim().toUpperCase());
  if (proof) {
    form.append('file', {
      uri: proof.uri,
      name: proof.name || 'proof.jpg',
      type: proof.type || 'image/jpeg',
    } as unknown as Blob);
  }

  const { data } = await client.post('/astrologer/me/bank-accounts', form);
  const items = (data.items ?? []).map(toBankAccount);
  return items[items.length - 1];
}

/** GET /astrologer/transactions — the earnings ledger. */
export async function fetchTransactions(): Promise<BankTransaction[]> {
  const { data } = await client.get('/wallet/transactions', { params: { limit: 50 } });

  return (data.items ?? []).map((row: any) => ({
    id: String(row._id),
    reference: row.reference,
    date: shortDate(row.createdAt),
    amount: rupees(row.amount),
    status: statusLabel(row.status),
  }));
}

/* ------------------------------------------------------------------ documents */

function toDocument(document: any): UploadedDocument {
  return {
    id: String(document._id),
    type: titleCase(document.type),
    idNumber: document.idNumber ?? '',
    status: statusLabel(document.status),
    fileName: document.file?.fileName ?? 'Uploaded',
  };
}

/** GET /astrologer/documents */
export async function fetchDocuments(): Promise<UploadedDocument[]> {
  const { data } = await client.get('/astrologer/me/documents');
  return (data.items ?? []).map(toDocument);
}

/** POST /astrologer/documents */
export async function uploadDocument(input: {
  type: string;
  idNumber: string;
  file?: { uri: string; name?: string; type?: string };
}): Promise<UploadedDocument> {
  if (!input.idNumber.trim()) {
    throw new Error('Enter the number this document is filed against.');
  }
  if (!input.file?.uri) {
    throw new Error('Pick a file to upload.');
  }

  const form = new FormData();
  form.append('type', toId(input.type).replace(/-/g, '_'));
  form.append('idNumber', input.idNumber.trim());
  form.append('file', {
    uri: input.file.uri,
    name: input.file.name || 'document.jpg',
    type: input.file.type || 'image/jpeg',
  } as unknown as Blob);

  const { data } = await client.post('/astrologer/me/documents', form);
  const items = (data.items ?? []).map(toDocument);
  return items[items.length - 1];
}

/**
 * PUT /astrologer/documents/:id
 *
 * A new scan resets it to pending — it has to be checked again, exactly as a
 * newly filed one would be.
 */
export async function replaceDocument(
  id: string,
  file: { uri: string; name?: string; type?: string },
): Promise<UploadedDocument> {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name || 'document.jpg',
    type: file.type || 'image/jpeg',
  } as unknown as Blob);

  const { data } = await client.put(`/astrologer/me/documents/${id}`, form);
  return toDocument(data.document);
}

/** DELETE /astrologer/documents/:id */
export async function deleteDocument(id: string): Promise<void> {
  await client.delete(`/astrologer/me/documents/${id}`);
}

/* -------------------------------------------------------------------- support */

/** POST /astrologer/disputes */
export async function submitDispute(dispute: Dispute): Promise<void> {
  const problem = validateDispute(dispute);
  if (problem) {
    throw new Error(problem);
  }

  await client.post('/support/tickets', {
    issueType: dispute.issueType,
    description: dispute.description.trim(),
  });
}

/* -------------------------------------------------------------- price changes */

/**
 * One row of the Price Change table.
 *
 * `oldRate` and `currentRate` are the same thing until a change is approved, so
 * both read the live rate; `newRequestedRate` is whatever is waiting on an
 * admin, and falls back to the live rate when nothing is.
 */
function toServiceRate(row: any): ServiceRate {
  return {
    id: row.service,
    name: titleCase(row.service),
    oldRate: rupees(row.ratePerMinute),
    currentRate: rupees(row.effectiveRate ?? row.ratePerMinute),
    offer: `${row.offerPercent ?? 0}%`,
    applyAll: 'No',
    newRequestedRate: rupees(row.request?.requestedRate ?? row.ratePerMinute),
    requestDate: shortDate(row.request?.requestedAt),
    status: statusLabel(row.request?.status ?? (row.isEnabled ? 'active' : 'disabled')),
    emergency: row.service === 'emergency_chat',
  };
}

/** GET /astrologer/service-rates */
export async function fetchServiceRates(): Promise<ServiceRate[]> {
  const { data } = await client.get('/astrologer/me/service-rates');
  return (data.items ?? []).map(toServiceRate);
}

/**
 * POST /astrologer/service-rates/change-requests
 *
 * A rate never changes here — it is requested, and an admin decides. The row
 * comes back with the request against it so the table shows it as pending.
 */
export async function requestPriceChange(draft: PriceChangeDraft): Promise<ServiceRate> {
  const problem = validatePriceChange(draft);
  if (problem) {
    throw new Error(problem);
  }

  await client.post('/astrologer/me/price-changes', {
    service: toId(draft.service).replace(/-/g, '_'),
    requestedRate: amountOf(draft.newPrice),
  });

  /** Read the table back, so the row reflects what the server actually stored. */
  const rates = await fetchServiceRates();
  const updated = rates.find(rate => rate.id === toId(draft.service).replace(/-/g, '_'));
  if (!updated) {
    throw new Error(`There is no "${draft.service}" service to reprice.`);
  }
  return updated;
}

/**
 * Sets the opening rates.
 *
 * Works only while the profile is still being set up — after that a change has
 * to go through requestPriceChange for approval.
 */
export async function setOpeningRates(
  services: Array<{ type: string; ratePerMinute: number; freeMinutes?: number }>,
): Promise<ServiceRate[]> {
  await client.put('/astrologer/me/rates', {
    services: services.map(service => ({ ...service, isEnabled: true })),
  });
  return fetchServiceRates();
}

/* -------------------------------------------------------------------- reviews */

function toReview(review: any): Review {
  const at = review.at ? new Date(review.at) : new Date();

  return {
    id: String(review.id),
    reviewer: review.reviewer ?? 'Anonymous',
    orderId: String(review.id).slice(-8),
    date: shortDate(review.at),
    service: titleCase(review.channel ?? 'chat'),
    duration: review.durationSeconds
      ? `${Math.ceil(review.durationSeconds / 60)} min`
      : '—',
    rating: review.rating ?? 0,
    comment: review.comment ?? '',
    reply: review.reply ? { author: 'You', message: review.reply } : undefined,
    flagged: Boolean(review.flagged),
    pinned: Boolean(review.pinned),
    year: String(at.getFullYear()),
    month: at.toLocaleDateString('en-US', { month: 'long' }),
  };
}

/** GET /astrologer/reviews */
export async function fetchReviews(): Promise<Review[]> {
  const { data } = await client.get('/astrologer/me/reviews', { params: { limit: 50 } });
  return (data.items ?? []).map(toReview);
}

/** POST /astrologer/reviews/:id/reply — one reply per review; sending again replaces it. */
export async function replyToReview(
  id: string,
  message: string,
  author: string,
): Promise<Review> {
  if (!message.trim()) {
    throw new Error('Write a reply before sending it.');
  }

  await client.post(`/astrologer/me/reviews/${id}/reply`, { message: message.trim() });

  const reviews = await fetchReviews();
  const updated = reviews.find(review => review.id === id);
  if (!updated) {
    throw new Error('That review is no longer listed.');
  }
  return { ...updated, reply: { author, message: message.trim() } };
}

/**
 * POST /astrologer/reviews/:id/flag — raises it with an admin. It toggles.
 *
 * Flags are rationed, so this can fail once the monthly allowance is gone.
 */
export async function toggleReviewFlag(id: string): Promise<Review> {
  const { data } = await client.post(`/astrologer/me/reviews/${id}/flag`, {});
  const reviews = await fetchReviews();
  const updated = reviews.find(review => review.id === id);
  return { ...(updated as Review), flagged: data.flagged };
}

/** POST /astrologer/reviews/:id/pin — holds it at the top of the public profile. */
export async function toggleReviewPin(id: string): Promise<Review> {
  const { data } = await client.post(`/astrologer/me/reviews/${id}/pin`, {});
  const reviews = await fetchReviews();
  const updated = reviews.find(review => review.id === id);
  return { ...(updated as Review), pinned: data.pinned };
}

/* ------------------------------------------------------------------ dashboard */

/** What the dashboard screen prints, in one call. */
export type Dashboard = {
  name: string;
  isOnline: boolean;
  earnings: { today: number; balance: number; thisMonth: number; lifetime: number };
  performance: {
    consultationsToday: number;
    consultationsTotal: number;
    rating: number;
    acceptance: number;
  };
  services: Array<{
    type: string;
    isEnabled: boolean;
    ratePerMinute: number;
    effectiveRate: number;
    freeMinutes: number;
  }>;
  pendingRequests: number;
  /** Profile fields still to fill in — the app nudges for exactly these. */
  missing: string[];
  applicationStatus: string;
};

/** GET /astrologer/dashboard */
export async function fetchDashboard(): Promise<Dashboard> {
  const { data } = await client.get('/astrologer/me/dashboard');
  return data;
}

/** PATCH /astrologer/presence — the dashboard's availability toggle. */
export async function setOnline(isOnline: boolean): Promise<boolean> {
  const { data } = await client.patch('/astrologer/me/presence', { isOnline });
  return Boolean(data.presence?.isOnline);
}

/** PATCH /astrologer/services — switch a service on or off. */
export async function setServiceEnabled(type: string, isEnabled: boolean): Promise<void> {
  await client.patch('/astrologer/me/services', { type, isEnabled });
}

/* --------------------------------------------------------------- consultations */

/** One incoming request, as the popup on the dashboard prints it. */
export type IncomingRequest = {
  chatId: string;
  channel: string;
  user: { id: string; name: string; photo?: string } | null;
  intake: {
    topic?: string;
    question?: string;
    birthDetails?: unknown;
    minutesBooked?: number;
  };
  ratePerMinute: number;
  requestedAt: string;
};

/** GET /astrologer/requests — the queue behind the incoming-request popup. */
export async function fetchRequests(): Promise<IncomingRequest[]> {
  const { data } = await client.get('/astrologer/me/requests');
  return data.items ?? [];
}

export async function acceptRequest(chatId: string) {
  const { data } = await client.post(`/chats/${chatId}/accept`, {});
  return data;
}

export async function rejectRequest(chatId: string, reason?: string) {
  const { data } = await client.post(`/chats/${chatId}/reject`, { reason });
  return data;
}

export async function endConsultation(chatId: string, reason?: string) {
  const { data } = await client.post(`/chats/${chatId}/end`, { reason });
  return data;
}

/** GET /chats — the history screens. */
export async function fetchConsultations(status?: string) {
  const { data } = await client.get('/chats', { params: { status, limit: 50 } });
  return data.items ?? [];
}

/** GET /chats/:id/messages — the transcript, oldest first. */
export async function fetchMessages(chatId: string, beforeSeq?: number) {
  const { data } = await client.get(`/chats/${chatId}/messages`, {
    params: { beforeSeq, limit: 50 },
  });
  return data.items ?? [];
}

/** POST /chats/:id/messages — the fallback when the socket is down. */
export async function sendMessage(chatId: string, text: string, clientMessageId?: string) {
  const { data } = await client.post(`/chats/${chatId}/messages`, {
    type: 'text',
    content: { text },
    clientMessageId,
  });
  return data.message;
}

/* --------------------------------------------------------------------- wallet */

/** GET /wallet — the earnings header. */
export async function fetchEarnings() {
  const { data } = await client.get('/wallet');
  return data.earnings;
}

/** POST /wallet/withdrawals — ask to be paid out. */
export async function requestWithdrawal(amount: number, bankAccountId?: string) {
  const { data } = await client.post('/wallet/withdrawals', { amount, bankAccountId });
  return data.withdrawal;
}

/** GET /wallet/withdrawals — payout history. */
export async function fetchWithdrawals() {
  const { data } = await client.get('/wallet/withdrawals', { params: { limit: 50 } });
  return data.items ?? [];
}

/* -------------------------------------------------------------- notifications */

export async function fetchNotifications() {
  const { data } = await client.get('/notifications', { params: { limit: 50 } });
  return data;
}

export async function markNotificationsRead(notificationId?: string) {
  const { data } = await client.post('/notifications/read', { notificationId });
  return data;
}

/** POST /astrologer/submit — hand the application to the admins. */
export async function submitApplication() {
  const { data } = await client.post('/astrologer/me/submit', {});
  return data;
}

/* -------------------------------------------------------------------------- */
/* Screen-shaped reads                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The wallet screen: the header figures and the ledger, already formatted.
 *
 * The screens were drawn against strings, so the mapping happens here rather
 * than in each one.
 */
export async function fetchWallet(): Promise<{
  balance: { total: string; today: string; monthly: string; lifetime: string };
  transactions: Array<{
    id: string;
    title: string;
    meta: string;
    amount: string;
    kind: 'credit' | 'withdrawal' | 'fee';
  }>;
}> {
  const [earnings, ledger] = await Promise.all([
    fetchEarnings(),
    client.get('/wallet/transactions', { params: { limit: 50 } }),
  ]);

  const short = (value: number) =>
    value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : `₹${Math.round(value).toLocaleString('en-IN')}`;

  return {
    balance: {
      total: `₹${(earnings.balance ?? 0).toLocaleString('en-IN')}`,
      today: `₹${(earnings.today ?? 0).toLocaleString('en-IN')}`,
      monthly: `₹${(earnings.thisMonth ?? 0).toLocaleString('en-IN')}`,
      lifetime: short(earnings.lifetime ?? 0),
    },
    transactions: (ledger.data.items ?? []).map((row: any) => ({
      id: String(row._id),
      title: row.title || titleCase(row.type),
      meta: `${titleCase(row.type)} · ${new Date(row.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      amount: `${row.direction === 'credit' ? '+' : '−'}₹${Math.round(row.amount).toLocaleString('en-IN')}`,
      kind:
        row.type === 'withdrawal'
          ? 'withdrawal'
          : row.direction === 'credit'
          ? 'credit'
          : 'fee',
    })),
  };
}

/**
 * The chat / call history screens.
 *
 * `variant` picks the channel; the totals are added up from what comes back, so
 * the figure at the top always matches the rows under it.
 */
export async function fetchHistory(variant: 'chat' | 'call'): Promise<{
  total: string;
  entries: Array<{
    id: string;
    userName: string;
    channel: 'chat' | 'call';
    amount: string;
    dateTime: string;
    duration: string;
    status: string;
    refundStatus: string;
    refundDate: string;
  }>;
}> {
  const { data } = await client.get('/chats', {
    params: { status: 'ended', limit: 50 },
  });

  const rows = (data.items ?? []).filter((row: any) => row.channel === variant);
  const total = rows.reduce(
    (sum: number, row: any) => sum + (row.astrologerEarning ?? 0),
    0,
  );

  return {
    total: total.toLocaleString('en-IN'),
    entries: rows.map((row: any) => ({
      id: row.id,
      userName: row.with?.name ?? 'Seeker',
      channel: row.channel,
      amount: `₹ ${Math.round(row.astrologerEarning ?? 0).toLocaleString('en-IN')}`,
      dateTime: row.endedAt
        ? new Date(row.endedAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—',
      duration: row.durationSeconds
        ? `${Math.floor(row.durationSeconds / 60)}:${String(row.durationSeconds % 60).padStart(2, '0')} Min`
        : '—',
      status: row.rating ? `${row.rating} ★` : 'Completed',
      refundStatus: 'No refund',
      refundDate: '—',
    })),
  };
}

/**
 * The notification card draws five kinds; the API has more, so the extra ones
 * fall back to the platform styling rather than rendering nothing.
 */
const NOTIFICATION_KINDS: Record<string, string> = {
  consultation_request: 'chat',
  consultation_started: 'chat',
  consultation_ended: 'chat',
  message: 'chat',
  wallet_credit: 'wallet',
  wallet_debit: 'wallet',
  withdrawal: 'withdrawal',
  review: 'review',
};

/** An ISO time -> "2 hours ago". */
function ageOf(at: string): string {
  const seconds = Math.max(Math.floor((Date.now() - new Date(at).getTime()) / 1000), 0);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/** The notifications screen, in the shape its cards read. */
export async function fetchNotificationFeed(): Promise<
  Array<{ id: string; kind: string; title: string; body: string; age: string; unread: boolean }>
> {
  const feed = await fetchNotifications();
  return (feed?.items ?? []).map((row: any) => ({
    id: String(row._id),
    kind: NOTIFICATION_KINDS[row.type] ?? 'platform',
    title: row.title,
    body: row.body ?? '',
    age: ageOf(row.createdAt),
    unread: !row.readAt,
  }));
}
