import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { type GalleryPhoto } from '../data/gallery';
import { type PriceChangeDraft, type ServiceRate } from '../data/priceChange';
import { type AstrologerProfile } from '../data/profile';
import { type Review } from '../data/reviews';
import { type Dispute } from '../data/support';
import * as api from '../services/api';
import type { PickedFile } from '../services/filePicker';
import { getSession, onSessionChange } from '../services/session';

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

  /** The astrologer's own portfolio gallery — separate from their profile photo. */
  gallery: ReadonlyArray<GalleryPhoto>;
  addGalleryImage: (file: PickedFile) => Promise<boolean>;
  removeGalleryImage: (id: string) => Promise<boolean>;

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
  const [gallery, setGallery] = useState<ReadonlyArray<GalleryPhoto>>([]);
  const [documents, setDocuments] = useState<ReadonlyArray<UploadedDocument>>([]);
  const [serviceRates, setServiceRates] = useState<ReadonlyArray<ServiceRate>>([]);
  const [reviews, setReviews] = useState<ReadonlyArray<Review>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** Whose data is loaded above — re-synced on every sign-in/sign-out so a second astrologer never inherits the first one's state on the same running app. */
  const [astrologerId, setAstrologerId] = useState<string | null>(
    () => getSession()?.astrologer.id ?? null,
  );

  /** Back to the pre-login shape — used on sign-out, and right before a different astrologer's data loads in. */
  const reset = useCallback(() => {
    setProfile(BLANK_PROFILE);
    setBankAccounts([]);
    setGallery([]);
    setDocuments([]);
    setServiceRates([]);
    setReviews([]);
    setError(null);
  }, []);

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
      api.fetchGallery(),
    ]);

    const [nextProfile, nextAccounts, nextDocuments, nextRates, nextReviews, nextGallery] = results;
    if (nextProfile.status === 'fulfilled') setProfile(nextProfile.value);
    if (nextAccounts.status === 'fulfilled') setBankAccounts(nextAccounts.value);
    if (nextDocuments.status === 'fulfilled') setDocuments(nextDocuments.value);
    if (nextRates.status === 'fulfilled') setServiceRates(nextRates.value);
    if (nextReviews.status === 'fulfilled') setReviews(nextReviews.value);
    if (nextGallery.status === 'fulfilled') setGallery(nextGallery.value);

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

  /** Tracks whoever is actually signed in right now, however that changed. */
  useEffect(
    () => onSessionChange(session => setAstrologerId(session?.astrologer.id ?? null)),
    [],
  );

  /**
   * The very first mount always loads, exactly as before — this provider is
   * rendered standalone in tests, ahead of `restoreSession()` settling in a
   * real app, so it must not wait on `astrologerId` to already be right.
   *
   * Every *subsequent* firing means the signed-in astrologer actually
   * changed after mount — a sign-out, or a fresh sign-in replacing a
   * different account on the same running app — so it blanks everything
   * first rather than leaving the previous astrologer's data sitting in
   * memory for whoever is signed in now.
   */
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      refresh();
      return;
    }
    reset();
    if (astrologerId) {
      refresh();
    } else {
      setLoading(false);
    }
  }, [astrologerId, refresh, reset]);

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

      gallery,

      addGalleryImage: file =>
        attempt(async () => {
          setGallery(await api.addGalleryImage(file));
        }),

      removeGalleryImage: id =>
        attempt(async () => {
          setGallery(await api.deleteGalleryImage(id));
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
    [profile, bankAccounts, documents, gallery, serviceRates, reviews, error, loading, refresh, attempt],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}
