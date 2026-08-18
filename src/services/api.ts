/**
 * Everything the app reads or writes, in one place.
 *
 * Each function below is a stub that resolves against an in-memory store after
 * a short delay, so the screens already behave as if they were talking to a
 * server: buttons show a pending state, failures surface as rejections, and a
 * write made on one screen is visible on the next.
 *
 * **This is the only file that has to change when the real backend lands.**
 * Replace a function's body with its `fetch` / `axios` call — the signature and
 * the shapes on either side of it are what every screen is already written
 * against, so nothing above this layer needs touching.
 */

import {
  SEED_BANK_ACCOUNTS,
  SEED_TRANSACTIONS,
  validateBankAccount,
  type BankAccount,
  type BankAccountDraft,
  type BankTransaction,
} from '../data/bank';
import { SEED_DOCUMENTS, type UploadedDocument } from '../data/documents';
import {
  SEED_SERVICE_RATES,
  validatePriceChange,
  type PriceChangeDraft,
  type ServiceRate,
} from '../data/priceChange';
import { SEED_PROFILE, type AstrologerProfile } from '../data/profile';
import { SEED_REVIEWS, type Review } from '../data/reviews';
import { validateDispute, type Dispute } from '../data/support';

/**
 * Stand-in latency, so a pending state is visible while developing. Tests set
 * it to 0 to stay fast; a real backend makes it moot.
 */
export const apiConfig = { latencyMs: 320 };

const settle = () =>
  new Promise<void>(resolve => setTimeout(resolve, apiConfig.latencyMs));

/** The store the stubs read and write. A real backend replaces it wholesale. */
const store = {
  profile: { ...SEED_PROFILE } as AstrologerProfile,
  bankAccounts: [...SEED_BANK_ACCOUNTS] as BankAccount[],
  transactions: [...SEED_TRANSACTIONS] as BankTransaction[],
  documents: [...SEED_DOCUMENTS] as UploadedDocument[],
  serviceRates: [...SEED_SERVICE_RATES] as ServiceRate[],
  reviews: [...SEED_REVIEWS] as Review[],
};

/** Ids the server would mint. Monotonic so two writes never collide. */
let nextId = 1;
const mintId = (prefix: string) => `${prefix}-${nextId++}`;

/** Resets the store between tests. Not used by the app itself. */
export function __resetApi() {
  store.profile = { ...SEED_PROFILE };
  store.bankAccounts = [...SEED_BANK_ACCOUNTS];
  store.transactions = [...SEED_TRANSACTIONS];
  store.documents = [...SEED_DOCUMENTS];
  store.serviceRates = [...SEED_SERVICE_RATES];
  store.reviews = [...SEED_REVIEWS];
  nextId = 1;
}

/* ------------------------------------------------------------------ profile */

/** GET /astrologer/profile */
export async function fetchProfile(): Promise<AstrologerProfile> {
  await settle();
  return { ...store.profile };
}

/** PUT /astrologer/profile */
export async function saveProfile(
  profile: AstrologerProfile,
): Promise<AstrologerProfile> {
  await settle();
  store.profile = { ...profile };
  return { ...store.profile };
}

/**
 * POST /astrologer/profile/photo
 *
 * The native picker is not wired yet, so the caller hands over a name and this
 * records it. Swap both halves when the picker lands.
 */
export async function uploadProfilePhoto(
  fileName: string,
): Promise<AstrologerProfile> {
  await settle();
  store.profile = { ...store.profile, photoFileName: fileName };
  return { ...store.profile };
}

/* -------------------------------------------------------------------- bank */

/** GET /astrologer/bank-accounts */
export async function fetchBankAccounts(): Promise<BankAccount[]> {
  await settle();
  return store.bankAccounts.map(account => ({ ...account }));
}

/**
 * POST /astrologer/bank-accounts
 *
 * Rejects on an incomplete or mismatched draft the way the server would, so the
 * sheet's error handling is already exercised.
 */
export async function addBankAccount(
  draft: BankAccountDraft,
  proofFileName?: string,
): Promise<BankAccount> {
  const problem = validateBankAccount(draft);
  if (problem) {
    throw new Error(problem);
  }

  await settle();
  const account: BankAccount = {
    id: mintId('account'),
    holderName: draft.holderName,
    bankName: draft.bankName,
    accountNumber: draft.accountNumber,
    ifsc: draft.ifsc,
    createdDate: today(),
    status: 'Pending',
    proofFileName,
  };
  store.bankAccounts = [...store.bankAccounts, account];
  return { ...account };
}

/** GET /astrologer/transactions */
export async function fetchTransactions(): Promise<BankTransaction[]> {
  await settle();
  return store.transactions.map(transaction => ({ ...transaction }));
}

/* --------------------------------------------------------------- documents */

/** GET /astrologer/documents */
export async function fetchDocuments(): Promise<UploadedDocument[]> {
  await settle();
  return store.documents.map(document => ({ ...document }));
}

/** POST /astrologer/documents */
export async function uploadDocument(input: {
  type: string;
  idNumber: string;
  fileName: string;
}): Promise<UploadedDocument> {
  if (!input.idNumber.trim()) {
    throw new Error('Enter the number this document is filed against.');
  }
  if (!input.fileName) {
    throw new Error('Pick a file to upload.');
  }

  await settle();
  const document: UploadedDocument = {
    id: mintId('document'),
    type: input.type,
    idNumber: input.idNumber,
    status: 'Pending',
    fileName: input.fileName,
  };
  store.documents = [...store.documents, document];
  return { ...document };
}

/**
 * PUT /astrologer/documents/:id
 *
 * Replacing a scan resets it to Pending — the same as filing a new one.
 */
export async function replaceDocument(
  id: string,
  fileName: string,
): Promise<UploadedDocument> {
  await settle();
  const existing = store.documents.find(document => document.id === id);
  if (!existing) {
    throw new Error('That document is no longer on file.');
  }

  const updated: UploadedDocument = {
    ...existing,
    fileName,
    status: 'Pending',
  };
  store.documents = store.documents.map(document =>
    document.id === id ? updated : document,
  );
  return { ...updated };
}

/** DELETE /astrologer/documents/:id */
export async function deleteDocument(id: string): Promise<void> {
  await settle();
  store.documents = store.documents.filter(document => document.id !== id);
}

/* ----------------------------------------------------------------- support */

/** POST /astrologer/disputes */
export async function submitDispute(dispute: Dispute): Promise<void> {
  const problem = validateDispute(dispute);
  if (problem) {
    throw new Error(problem);
  }
  await settle();
}

/* ----------------------------------------------------------- price changes */

/** GET /astrologer/service-rates */
export async function fetchServiceRates(): Promise<ServiceRate[]> {
  await settle();
  return store.serviceRates.map(rate => ({ ...rate }));
}

/**
 * POST /astrologer/service-rates/change-requests
 *
 * A request lands against its service as the new requested rate, back to
 * Pending, dated today.
 */
export async function requestPriceChange(
  draft: PriceChangeDraft,
): Promise<ServiceRate> {
  const problem = validatePriceChange(draft);
  if (problem) {
    throw new Error(problem);
  }

  await settle();
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
  store.serviceRates = store.serviceRates.map(rate =>
    rate.id === existing.id ? updated : rate,
  );
  return { ...updated };
}

/* ---------------------------------------------------------------- reviews */

/** GET /astrologer/reviews */
export async function fetchReviews(): Promise<Review[]> {
  await settle();
  return store.reviews.map(review => ({ ...review }));
}

/** POST /astrologer/reviews/:id/reply */
export async function replyToReview(
  id: string,
  message: string,
  author: string,
): Promise<Review> {
  if (!message.trim()) {
    throw new Error('Write a reply before sending it.');
  }
  await settle();
  return updateReview(id, review => ({
    ...review,
    reply: { author, message: message.trim() },
  }));
}

/** POST /astrologer/reviews/:id/flag — flagging is a toggle. */
export async function toggleReviewFlag(id: string): Promise<Review> {
  await settle();
  return updateReview(id, review => ({ ...review, flagged: !review.flagged }));
}

/** POST /astrologer/reviews/:id/pin — so is pinning. */
export async function toggleReviewPin(id: string): Promise<Review> {
  await settle();
  return updateReview(id, review => ({ ...review, pinned: !review.pinned }));
}

/** Applies a change to one review and hands the new version back. */
function updateReview(id: string, change: (review: Review) => Review): Review {
  const existing = store.reviews.find(review => review.id === id);
  if (!existing) {
    throw new Error('That review is no longer listed.');
  }
  const updated = change(existing);
  store.reviews = store.reviews.map(review =>
    review.id === id ? updated : review,
  );
  return { ...updated };
}

/* ------------------------------------------------------------------ helpers */

/** How the design writes a date, e.g. "September 25, 2024". */
function today(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
