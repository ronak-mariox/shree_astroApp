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
  connectSocket,
  disconnectSocket,
  sendChatMessage,
  subscribeToChat,
  subscribeToIncomingRequests as subscribeToIncomingRequestsRaw,
} from './socket';
import {
  type BankAccount,
  type BankAccountDraft,
  type BankTransaction,
  validateBankAccount,
} from '../data/bank';
import { DOCUMENT_TYPE_IDS, type UploadedDocument } from '../data/documents';
import { type GalleryPhoto } from '../data/gallery';
import { type PriceChangeDraft, type ServiceRate, validatePriceChange } from '../data/priceChange';
import { type AstrologerProfile } from '../data/profile';
import { type Review } from '../data/reviews';
import type { PackageView } from '../utils/sessionClock';
import type { SeekerKundli } from '../data/kundli';
import { validateDispute, type Dispute, type RaisedDispute } from '../data/support';
import {
  DUMMY_BANK_ACCOUNTS,
  DUMMY_DASHBOARD,
  DUMMY_DOCUMENTS,
  DUMMY_EARNINGS,
  DUMMY_GALLERY,
  DUMMY_HISTORY,
  DUMMY_MESSAGES,
  DUMMY_MISSED_CONSULTATIONS,
  DUMMY_NOTIFICATION_FEED,
  DUMMY_PROFILE,
  DUMMY_REQUESTS,
  DUMMY_REVIEWS,
  DUMMY_SERVICE_RATES,
  DUMMY_TRANSACTIONS,
  DUMMY_WALLET,
  DUMMY_WITHDRAWALS,
} from './dummyData';
import { USE_DUMMY_CONSULT, USE_DUMMY_DATA, USE_DUMMY_PROFILE } from './dummyMode';

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
    photoUrl: astrologer.photoUrl ?? undefined,
    applicationStatus: astrologer.applicationStatus,
  };
}

/** GET /astrologer/profile */
export async function fetchProfile(): Promise<AstrologerProfile> {
  if (USE_DUMMY_PROFILE) return DUMMY_PROFILE;
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
  if (USE_DUMMY_PROFILE) {
    Object.assign(DUMMY_PROFILE, profile);
    return { ...DUMMY_PROFILE };
  }

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
  if (USE_DUMMY_PROFILE) {
    DUMMY_PROFILE.photoUrl = typeof photo === 'string' ? photo : photo.name || 'profile.jpg';
    return { ...DUMMY_PROFILE };
  }

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

/* -------------------------------------------------------------------- gallery */

/**
 * The portfolio gallery on Edit Profile — separate from the single profile
 * photo above; an astrologer can file several of these.
 */
function toGalleryImage(item: any): GalleryPhoto {
  return { id: String(item._id ?? item.id), url: item.file?.url ?? item.url };
}

/** GET /astrologer/gallery */
export async function fetchGallery(): Promise<GalleryPhoto[]> {
  if (USE_DUMMY_PROFILE) return DUMMY_GALLERY;
  const { data } = await client.get('/astrologer/me/gallery');
  return (data.items ?? []).map(toGalleryImage);
}

/** POST /astrologer/gallery */
export async function addGalleryImage(
  file: { uri: string; name?: string; type?: string },
): Promise<GalleryPhoto[]> {
  if (USE_DUMMY_PROFILE) {
    DUMMY_GALLERY.push({ id: `gallery-${DUMMY_GALLERY.length + 1}`, url: file.uri });
    return DUMMY_GALLERY;
  }

  const form = new FormData();
  form.append('image', {
    uri: file.uri,
    name: file.name || 'gallery.jpg',
    type: file.type || 'image/jpeg',
  } as unknown as Blob);

  const { data } = await client.post('/astrologer/me/gallery', form);
  return (data.items ?? []).map(toGalleryImage);
}

/** DELETE /astrologer/gallery/:id */
export async function deleteGalleryImage(id: string): Promise<GalleryPhoto[]> {
  if (USE_DUMMY_PROFILE) {
    const index = DUMMY_GALLERY.findIndex(entry => entry.id === id);
    if (index !== -1) DUMMY_GALLERY.splice(index, 1);
    return DUMMY_GALLERY;
  }

  const { data } = await client.delete(`/astrologer/me/gallery/${id}`);
  return (data.items ?? []).map(toGalleryImage);
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
  if (USE_DUMMY_PROFILE) return DUMMY_BANK_ACCOUNTS;
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

  if (USE_DUMMY_PROFILE) {
    const account: BankAccount = {
      id: `bank-${DUMMY_BANK_ACCOUNTS.length + 1}`,
      holderName: draft.holderName.trim(),
      bankName: draft.bankName.trim(),
      accountNumber: draft.accountNumber.trim(),
      ifsc: draft.ifsc.trim().toUpperCase(),
      createdDate: shortDate(new Date().toISOString()),
      status: 'Pending',
      proofFileName: proof?.name ?? (proof ? 'proof.jpg' : undefined),
    };
    DUMMY_BANK_ACCOUNTS.push(account);
    return account;
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
  if (USE_DUMMY_DATA) return DUMMY_TRANSACTIONS;
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
  if (USE_DUMMY_PROFILE) return DUMMY_DOCUMENTS;
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

  if (USE_DUMMY_PROFILE) {
    const document: UploadedDocument = {
      id: `doc-${DUMMY_DOCUMENTS.length + 1}`,
      type: input.type,
      idNumber: input.idNumber.trim(),
      status: 'Pending',
      fileName: input.file.name || 'document.jpg',
    };
    DUMMY_DOCUMENTS.push(document);
    return document;
  }

  const form = new FormData();
  /**
   * `input.type` is either one of the sheet's human labels ("Aadhar Card
   * Front") or, from the registration wizard, an id already in the backend's
   * own shape ("aadhaar_front") — `DOCUMENT_TYPE_IDS` maps the former; the
   * fallback passes the latter through unchanged. Naively slugifying the
   * label instead (the old `toId(...).replace('-','_')`) does not match the
   * backend's actual enum (no "card", "aadhaar" not "aadhar"), so every
   * upload from the sheet would have 500'd on a Mongoose enum mismatch.
   */
  form.append('type', DOCUMENT_TYPE_IDS[input.type] ?? input.type);
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
  if (USE_DUMMY_PROFILE) {
    const document = DUMMY_DOCUMENTS.find(entry => entry.id === id);
    if (!document) {
      throw new Error('That document is no longer listed.');
    }
    document.status = 'Pending';
    document.fileName = file.name || 'document.jpg';
    return document;
  }

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
  if (USE_DUMMY_PROFILE) {
    const index = DUMMY_DOCUMENTS.findIndex(entry => entry.id === id);
    if (index !== -1) DUMMY_DOCUMENTS.splice(index, 1);
    return;
  }
  await client.delete(`/astrologer/me/documents/${id}`);
}

/* -------------------------------------------------------------------- support */

/** POST /astrologer/disputes */
/**
 * The disputes this astrologer has raised, newest first (GET
 * /support/tickets) — what Help & Support lists under the form, so a raised
 * dispute is visibly on record and the admin's answer comes back here.
 */
export async function fetchMyDisputes(): Promise<RaisedDispute[]> {
  if (USE_DUMMY_DATA) return [];
  const { data } = await client.get('/support/tickets');
  return data.items ?? [];
}

export async function submitDispute(dispute: Dispute): Promise<void> {
  const problem = validateDispute(dispute);
  if (problem) {
    throw new Error(problem);
  }

  if (USE_DUMMY_DATA) return;

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
  if (USE_DUMMY_PROFILE) return DUMMY_SERVICE_RATES;
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

  const serviceId = toId(draft.service).replace(/-/g, '_');

  if (USE_DUMMY_PROFILE) {
    const rate = DUMMY_SERVICE_RATES.find(entry => entry.id === serviceId);
    if (!rate) {
      throw new Error(`There is no "${draft.service}" service to reprice.`);
    }
    rate.newRequestedRate = rupees(amountOf(draft.newPrice));
    rate.requestDate = shortDate(new Date().toISOString());
    rate.status = 'Pending';
    return rate;
  }

  await client.post('/astrologer/me/price-changes', {
    service: serviceId,
    requestedRate: amountOf(draft.newPrice),
  });

  /** Read the table back, so the row reflects what the server actually stored. */
  const rates = await fetchServiceRates();
  const updated = rates.find(rate => rate.id === serviceId);
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
  services: Array<{ type: string; ratePerMinute: number }>,
): Promise<ServiceRate[]> {
  if (USE_DUMMY_PROFILE) {
    for (const service of services) {
      const rate = DUMMY_SERVICE_RATES.find(entry => entry.id === service.type);
      if (rate) {
        rate.oldRate = rupees(service.ratePerMinute);
        rate.currentRate = rupees(service.ratePerMinute);
      }
    }
    return DUMMY_SERVICE_RATES;
  }

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
  if (USE_DUMMY_PROFILE) return DUMMY_REVIEWS;
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

  if (USE_DUMMY_PROFILE) {
    const review = DUMMY_REVIEWS.find(entry => entry.id === id);
    if (!review) {
      throw new Error('That review is no longer listed.');
    }
    review.reply = { author, message: message.trim() };
    return review;
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
  if (USE_DUMMY_PROFILE) {
    const review = DUMMY_REVIEWS.find(entry => entry.id === id);
    if (!review) {
      throw new Error('That review is no longer listed.');
    }
    review.flagged = !review.flagged;
    return review;
  }

  const { data } = await client.post(`/astrologer/me/reviews/${id}/flag`, {});
  const reviews = await fetchReviews();
  const updated = reviews.find(review => review.id === id);
  return { ...(updated as Review), flagged: data.flagged };
}

/** POST /astrologer/reviews/:id/pin — holds it at the top of the public profile. */
export async function toggleReviewPin(id: string): Promise<Review> {
  if (USE_DUMMY_PROFILE) {
    const review = DUMMY_REVIEWS.find(entry => entry.id === id);
    if (!review) {
      throw new Error('That review is no longer listed.');
    }
    review.pinned = !review.pinned;
    return review;
  }

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
    /** "9:00 AM - 9:00 PM", the window the Services card prints it live in. */
    onlineTime?: string;
  }>;
  pendingRequests: number;
  /** Profile fields still to fill in — the app nudges for exactly these. */
  missing: string[];
  applicationStatus: string;
};

/** GET /astrologer/dashboard */
export async function fetchDashboard(): Promise<Dashboard> {
  if (USE_DUMMY_DATA) return DUMMY_DASHBOARD;
  const { data } = await client.get('/astrologer/me/dashboard');
  return data;
}

/**
 * PATCH /astrologer/presence — the dashboard's availability toggle.
 *
 * The backend ties `presence.isOnline` to this very socket's connect/
 * disconnect (see backend/socket/index.js), so the toggle is what opens and
 * closes the live connection: going online opens it, going offline (or the
 * app backgrounding/being killed) closes it and the server marks the
 * astrologer offline on its own.
 */
export async function setOnline(isOnline: boolean): Promise<boolean> {
  if (USE_DUMMY_DATA) {
    DUMMY_DASHBOARD.isOnline = isOnline;
    return isOnline;
  }
  const { data } = await client.patch('/astrologer/me/presence', { isOnline });
  const confirmed = Boolean(data.presence?.isOnline);
  if (confirmed) {
    connectSocket();
  } else {
    disconnectSocket();
  }
  return confirmed;
}

/** PATCH /astrologer/services — switch a service on or off. */
export async function setServiceEnabled(type: string, isEnabled: boolean): Promise<void> {
  if (USE_DUMMY_DATA) {
    const service = DUMMY_DASHBOARD.services.find(entry => entry.type === type);
    if (service) service.isEnabled = isEnabled;
    return;
  }
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
  /** 'package' when the seeker booked a fixed-length package instead of per-minute. */
  billingMode?: 'per_minute' | 'package';
  packageMinutes?: number;
  /** What the seeker pays for the package — after any admin discount. */
  packagePrice?: number;
  packageDiscountPercent?: number;
  requestedAt: string;
};

/** GET /astrologer/requests — the queue behind the incoming-request popup. */
export async function fetchRequests(): Promise<IncomingRequest[]> {
  if (USE_DUMMY_CONSULT) return DUMMY_REQUESTS;
  const { data } = await client.get('/astrologer/me/requests');
  return data.items ?? [];
}

/** Drops an answered request out of the dummy queue, same as the server would. */
function removeDummyRequest(chatId: string) {
  const index = DUMMY_REQUESTS.findIndex(request => request.chatId === chatId);
  if (index !== -1) DUMMY_REQUESTS.splice(index, 1);
  DUMMY_DASHBOARD.pendingRequests = Math.max(0, DUMMY_DASHBOARD.pendingRequests - 1);
}

export async function acceptRequest(chatId: string) {
  if (USE_DUMMY_CONSULT) {
    removeDummyRequest(chatId);
    return { chatId, status: 'active' };
  }
  const { data } = await client.post(`/chats/${chatId}/accept`, {});
  return data;
}

export async function rejectRequest(chatId: string, reason?: string) {
  if (USE_DUMMY_CONSULT) {
    removeDummyRequest(chatId);
    return { chatId, status: 'rejected', reason };
  }
  const { data } = await client.post(`/chats/${chatId}/reject`, { reason });
  return data;
}

/**
 * The seeker's already-generated kundli for this consultation (GET
 * /chats/:chatId/kundli) — what the chat header's kundli button and the
 * intake's "Generate Kundli" open. Read-only; never generates (or pays for)
 * a new chart.
 */
export async function fetchSeekerKundli(chatId: string): Promise<SeekerKundli> {
  if (USE_DUMMY_CONSULT) return { found: false };
  const { data } = await client.get(`/chats/${chatId}/kundli`);
  return data as SeekerKundli;
}

/**
 * Where support can be reached — the admin panel's Settings → Support
 * contact, from the public GET /settings. Falls back to the platform's
 * default address when it can't be read (offline, dummy mode).
 */
export async function fetchSupportContact(): Promise<{ email: string; phone?: string }> {
  const fallback = { email: 'support@shreeastro.com' };
  if (USE_DUMMY_CONSULT) return fallback;
  try {
    const { data } = await client.get('/settings');
    return { email: data?.supportEmail || fallback.email, phone: data?.supportPhone || undefined };
  } catch {
    return fallback;
  }
}

export async function endConsultation(chatId: string, reason?: string) {
  if (USE_DUMMY_CONSULT) return { chatId, status: 'ended', reason };
  const { data } = await client.post(`/chats/${chatId}/end`, { reason });
  return data;
}

/** One session's live state — status, the frozen rate, and the server-computed startedAt the running clock ticks from. What the chat screen loads on open. */
export async function getChatState(chatId: string) {
  if (USE_DUMMY_CONSULT) {
    return {
      chatId,
      role: 'astrologer' as const,
      channel: 'chat',
      status: 'active',
      startedAt: new Date().toISOString(),
      ratePerMinute: 0,
      minutesBilled: 0,
      amountCharged: 0,
    };
  }
  const { data } = await client.get(`/chats/${chatId}`);
  return data as {
    chatId: string;
    role: 'user' | 'astrologer';
    channel: string;
    status: string;
    startedAt?: string;
    ratePerMinute: number;
    minutesBilled: number;
    amountCharged: number;
    endedAt?: string;
    endReason?: string;
    billingMode?: 'per_minute' | 'package';
    /** Package bookings only — the server-side package clock. */
    package?: PackageView;
    /** The server's clock at the time of this read — the header clock counts against it, not the phone's. */
    serverTime?: string;
  };
}

/**
 * Live updates for one open consultation — messages and the end, however it
 * comes (either side, or the server's own grace-period cutoff). Returns the
 * unsubscribe function.
 */
export const subscribeToConsultation = subscribeToChat;

/**
 * The incoming-request queue's live half: a new request landing in the
 * astrologer's own account room, or the seeker cancelling one still waiting
 * on an answer. Returns the unsubscribe function.
 */
export const subscribeToIncomingRequests = subscribeToIncomingRequestsRaw;

/**
 * The live connection's lifecycle — opened and closed by `setOnline` above.
 * Exposed here too as a safety net for sign-out, which must never leave a
 * socket connected once nobody is signed in.
 */
export const disconnectLiveUpdates = disconnectSocket;

/** GET /chats — the history screens. */
export async function fetchConsultations(status?: string) {
  if (USE_DUMMY_CONSULT) return DUMMY_MISSED_CONSULTATIONS;
  const { data } = await client.get('/chats', { params: { status, limit: 50 } });
  return data.items ?? [];
}

/** GET /chats/:id/messages — the transcript, oldest first. */
export async function fetchMessages(chatId: string, beforeSeq?: number) {
  if (USE_DUMMY_CONSULT) return DUMMY_MESSAGES;
  const { data } = await client.get(`/chats/${chatId}/messages`, {
    params: { beforeSeq, limit: 50 },
  });
  return data.items ?? [];
}

/**
 * Sends a message. Goes out over the live socket when there is one — that is
 * also what makes the seeker see it arrive instantly — and falls back to a
 * plain HTTP post (still delivered, just not instant) when the connection is
 * down.
 */
export async function sendMessage(chatId: string, text: string, clientMessageId?: string) {
  if (USE_DUMMY_CONSULT) {
    const message = {
      id: clientMessageId ?? `msg-${DUMMY_MESSAGES.length + 1}`,
      senderRole: 'astrologer',
      content: { text },
      createdAt: new Date().toISOString(),
    };
    DUMMY_MESSAGES.push(message);
    return message;
  }

  try {
    const result = await sendChatMessage(chatId, text, clientMessageId ?? `local-${Date.now()}`);
    return result.message;
  } catch {
    /** No socket, or it rejected — fall back to the REST path. */
  }

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
  if (USE_DUMMY_DATA) return DUMMY_EARNINGS;
  const { data } = await client.get('/wallet');
  return data.earnings;
}

/** POST /wallet/withdrawals — ask to be paid out. */
export async function requestWithdrawal(amount: number, bankAccountId?: string) {
  if (USE_DUMMY_DATA) {
    const withdrawal = {
      id: `wd-${DUMMY_WITHDRAWALS.length + 1}`,
      reference: `WDL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      amount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };
    DUMMY_WITHDRAWALS.unshift(withdrawal);
    DUMMY_EARNINGS.balance = Math.max(0, DUMMY_EARNINGS.balance - amount);
    DUMMY_DASHBOARD.earnings.balance = DUMMY_EARNINGS.balance;
    return withdrawal;
  }
  const { data } = await client.post('/wallet/withdrawals', { amount, bankAccountId });
  return data.withdrawal;
}

/** GET /wallet/withdrawals — payout history. */
export async function fetchWithdrawals() {
  if (USE_DUMMY_DATA) return DUMMY_WITHDRAWALS;
  const { data } = await client.get('/wallet/withdrawals', { params: { limit: 50 } });
  return data.items ?? [];
}

/* -------------------------------------------------------------- notifications */

export async function fetchNotifications() {
  if (USE_DUMMY_DATA) return { items: DUMMY_NOTIFICATION_FEED };
  const { data } = await client.get('/notifications', { params: { limit: 50 } });
  return data;
}

export async function markNotificationsRead(notificationId?: string) {
  if (USE_DUMMY_DATA) {
    for (const notification of DUMMY_NOTIFICATION_FEED) {
      if (!notificationId || notification.id === notificationId) {
        notification.unread = false;
      }
    }
    return { ok: true };
  }
  const { data } = await client.post('/notifications/read', { notificationId });
  return data;
}

/** POST /astrologer/submit — hand the application to the admins. */
export async function submitApplication() {
  if (USE_DUMMY_PROFILE) {
    DUMMY_DASHBOARD.applicationStatus = 'under_review';
    return { applicationStatus: DUMMY_DASHBOARD.applicationStatus };
  }
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
  if (USE_DUMMY_DATA) return DUMMY_WALLET;

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
  if (USE_DUMMY_DATA) return DUMMY_HISTORY[variant];

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
  if (USE_DUMMY_DATA) return DUMMY_NOTIFICATION_FEED;

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
