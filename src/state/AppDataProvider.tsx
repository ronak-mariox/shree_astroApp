import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  type BankAccount,
  type BankAccountDraft,
  type BankTransaction,
} from '../data/bank';
import {
  groupDocuments,
  type DocumentGroup,
  type UploadedDocument,
} from '../data/documents';
import { type PriceChangeDraft, type ServiceRate } from '../data/priceChange';
import { type AstrologerProfile } from '../data/profile';
import { type Review } from '../data/reviews';
import { type Dispute } from '../data/support';
import * as api from '../services/api';
import type { PickedFile } from '../services/filePicker';

/** An empty profile, so the first paint has the right shape to read from. */
const BLANK_PROFILE: AstrologerProfile = {
  astroCode: '',
  fullName: '',
  email: '',
  primaryMobile: '',
  secondaryMobile: '',
  gender: '',
  dob: '',
  language: '',
  experience: '',
  skill: '',
  about: '',
};

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

  /** True while the first load is still in flight. */
  loading: boolean;
  /** Re-reads everything from the server. */
  refresh: () => Promise<void>;

  saveProfile: (profile: AstrologerProfile) => Promise<boolean>;
  changeProfilePhoto: (file: PickedFile) => Promise<boolean>;

  addBankAccount: (
    draft: BankAccountDraft,
    proof?: PickedFile,
  ) => Promise<boolean>;
  loadTransactions: () => Promise<BankTransaction[]>;

  uploadDocument: (input: {
    type: string;
    idNumber: string;
    file?: PickedFile;
  }) => Promise<boolean>;
  replaceDocument: (id: string, file: PickedFile) => Promise<boolean>;
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
  /* Empty until the server answers — nothing on screen is ever invented. */
  const [profile, setProfile] = useState<AstrologerProfile>(BLANK_PROFILE);
  const [bankAccounts, setBankAccounts] = useState<ReadonlyArray<BankAccount>>([]);
  const [documents, setDocuments] = useState<ReadonlyArray<UploadedDocument>>([]);
  const [serviceRates, setServiceRates] = useState<ReadonlyArray<ServiceRate>>([]);
  const [reviews, setReviews] = useState<ReadonlyArray<Review>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Reads everything the signed-in screens need.
   *
   * `allSettled` rather than `all`: one endpoint failing — an astrologer with
   * no rates set yet, say — must not blank the other four.
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api.fetchProfile(),
      api.fetchBankAccounts(),
      api.fetchDocuments(),
      api.fetchServiceRates(),
      api.fetchReviews(),
    ]);

    const [nextProfile, nextAccounts, nextDocuments, nextRates, nextReviews] = results;
    if (nextProfile.status === 'fulfilled') setProfile(nextProfile.value);
    if (nextAccounts.status === 'fulfilled') setBankAccounts(nextAccounts.value);
    if (nextDocuments.status === 'fulfilled') setDocuments(nextDocuments.value);
    if (nextRates.status === 'fulfilled') setServiceRates(nextRates.value);
    if (nextReviews.status === 'fulfilled') setReviews(nextReviews.value);

    /** Only the profile failing is worth telling the user about. */
    if (nextProfile.status === 'rejected') {
      setError(
        nextProfile.reason instanceof Error
          ? nextProfile.reason.message
          : 'Could not load your profile.',
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
      loading,
      refresh,

      saveProfile: next =>
        attempt(async () => {
          setProfile(await api.saveProfile(next));
        }),

      changeProfilePhoto: file =>
        attempt(async () => {
          setProfile(await api.uploadProfilePhoto(file));
        }),

      addBankAccount: (draft, proof) =>
        attempt(async () => {
          const account = await api.addBankAccount(draft, proof);
          setBankAccounts(current => [...current, account]);
        }),

      loadTransactions: () => api.fetchTransactions(),

      uploadDocument: input =>
        attempt(async () => {
          const document = await api.uploadDocument(input);
          setDocuments(current => [...current, document]);
        }),

      replaceDocument: (id, file) =>
        attempt(async () => {
          const updated = await api.replaceDocument(id, file);
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
    [profile, bankAccounts, documents, serviceRates, reviews, error, loading, refresh, attempt],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}
