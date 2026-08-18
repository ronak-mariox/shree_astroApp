import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  SEED_BANK_ACCOUNTS,
  type BankAccount,
  type BankAccountDraft,
  type BankTransaction,
} from '../data/bank';
import {
  SEED_DOCUMENTS,
  groupDocuments,
  type DocumentGroup,
  type UploadedDocument,
} from '../data/documents';
import {
  SEED_SERVICE_RATES,
  type PriceChangeDraft,
  type ServiceRate,
} from '../data/priceChange';
import { SEED_PROFILE, type AstrologerProfile } from '../data/profile';
import { SEED_REVIEWS, type Review } from '../data/reviews';
import { type Dispute } from '../data/support';
import * as api from '../services/api';

/**
 * Everything the signed-in screens read, and the writes they make.
 *
 * The provider owns the state; every action delegates to {@link api}, which is
 * the single place a real endpoint replaces a stub. Actions resolve to `true`
 * when the write went through and `false` when it was refused — callers use
 * that to decide whether to close a sheet or leave the error showing.
 */
type AppData = {
  profile: AstrologerProfile;
  bankAccounts: ReadonlyArray<BankAccount>;
  documents: ReadonlyArray<UploadedDocument>;
  /** The documents above, grouped the way the Documents screen prints them. */
  documentGroups: ReadonlyArray<DocumentGroup>;

  /** The last write that was refused, or null. Cleared by the next attempt. */
  error: string | null;
  clearError: () => void;

  saveProfile: (profile: AstrologerProfile) => Promise<boolean>;
  changeProfilePhoto: (fileName: string) => Promise<boolean>;

  addBankAccount: (
    draft: BankAccountDraft,
    proofFileName?: string,
  ) => Promise<boolean>;
  loadTransactions: () => Promise<BankTransaction[]>;

  uploadDocument: (input: {
    type: string;
    idNumber: string;
    fileName: string;
  }) => Promise<boolean>;
  replaceDocument: (id: string, fileName: string) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;

  submitDispute: (dispute: Dispute) => Promise<boolean>;

  serviceRates: ReadonlyArray<ServiceRate>;
  requestPriceChange: (draft: PriceChangeDraft) => Promise<boolean>;

  reviews: ReadonlyArray<Review>;
  replyToReview: (id: string, message: string) => Promise<boolean>;
  toggleReviewFlag: (id: string) => Promise<boolean>;
  toggleReviewPin: (id: string) => Promise<boolean>;
};

const AppDataContext = createContext<AppData | null>(null);

/** Reads the app's data. Only valid under an {@link AppDataProvider}. */
export function useAppData(): AppData {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('useAppData must be used inside an <AppDataProvider>');
  }
  return value;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  /* Seeded so the first paint has content; the fetches below then replace it
     with whatever the server actually holds. */
  const [profile, setProfile] = useState<AstrologerProfile>(SEED_PROFILE);
  const [bankAccounts, setBankAccounts] =
    useState<ReadonlyArray<BankAccount>>(SEED_BANK_ACCOUNTS);
  const [documents, setDocuments] =
    useState<ReadonlyArray<UploadedDocument>>(SEED_DOCUMENTS);
  const [serviceRates, setServiceRates] =
    useState<ReadonlyArray<ServiceRate>>(SEED_SERVICE_RATES);
  const [reviews, setReviews] = useState<ReadonlyArray<Review>>(SEED_REVIEWS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    const load = async () => {
      const [nextProfile, nextAccounts, nextDocuments, nextRates, nextReviews] =
        await Promise.all([
          api.fetchProfile(),
          api.fetchBankAccounts(),
          api.fetchDocuments(),
          api.fetchServiceRates(),
          api.fetchReviews(),
        ]);
      if (!live) return;
      setProfile(nextProfile);
      setBankAccounts(nextAccounts);
      setDocuments(nextDocuments);
      setServiceRates(nextRates);
      setReviews(nextReviews);
    };
    load().catch(() => {
      /* The seeds stay on screen if the first load fails. */
    });
    return () => {
      live = false;
    };
  }, []);

  /** Runs a write, keeping whatever it returns and surfacing any refusal. */
  const attempt = useCallback(
    async (write: () => Promise<void>): Promise<boolean> => {
      setError(null);
      try {
        await write();
        return true;
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : 'Something went wrong.',
        );
        return false;
      }
    },
    [],
  );

  const value = useMemo<AppData>(
    () => ({
      profile,
      bankAccounts,
      documents,
      documentGroups: groupDocuments(documents),
      error,
      clearError: () => setError(null),

      saveProfile: next =>
        attempt(async () => {
          setProfile(await api.saveProfile(next));
        }),

      changeProfilePhoto: fileName =>
        attempt(async () => {
          setProfile(await api.uploadProfilePhoto(fileName));
        }),

      addBankAccount: (draft, proofFileName) =>
        attempt(async () => {
          const account = await api.addBankAccount(draft, proofFileName);
          setBankAccounts(current => [...current, account]);
        }),

      loadTransactions: () => api.fetchTransactions(),

      uploadDocument: input =>
        attempt(async () => {
          const document = await api.uploadDocument(input);
          setDocuments(current => [...current, document]);
        }),

      replaceDocument: (id, fileName) =>
        attempt(async () => {
          const updated = await api.replaceDocument(id, fileName);
          setDocuments(current =>
            current.map(document => (document.id === id ? updated : document)),
          );
        }),

      deleteDocument: id =>
        attempt(async () => {
          await api.deleteDocument(id);
          setDocuments(current =>
            current.filter(document => document.id !== id),
          );
        }),

      submitDispute: dispute => attempt(() => api.submitDispute(dispute)),

      serviceRates,

      requestPriceChange: draft =>
        attempt(async () => {
          const updated = await api.requestPriceChange(draft);
          setServiceRates(current =>
            current.map(rate => (rate.id === updated.id ? updated : rate)),
          );
        }),

      reviews,

      replyToReview: (id, message) =>
        attempt(async () => {
          const updated = await api.replyToReview(
            id,
            message,
            profile.fullName,
          );
          setReviews(current =>
            current.map(review => (review.id === id ? updated : review)),
          );
        }),

      toggleReviewFlag: id =>
        attempt(async () => {
          const updated = await api.toggleReviewFlag(id);
          setReviews(current =>
            current.map(review => (review.id === id ? updated : review)),
          );
        }),

      toggleReviewPin: id =>
        attempt(async () => {
          const updated = await api.toggleReviewPin(id);
          setReviews(current =>
            current.map(review => (review.id === id ? updated : review)),
          );
        }),
    }),
    [profile, bankAccounts, documents, serviceRates, reviews, error, attempt],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}
