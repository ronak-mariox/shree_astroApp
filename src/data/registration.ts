import type { ComponentType } from 'react';

import {
  CertificateIcon,
  FileIcon,
  LockIcon,
  PhotoIcon,
} from '../components/icons/DocumentIcons';
import type { Option } from '../components/OptionGroup';

/** The wizard is four steps deep before the confirmation screen. */
export const REGISTRATION_STEPS = 4;

/** Figma node 105:6068. */
export const GENDER_OPTIONS: ReadonlyArray<Option> = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

/** Figma node 105:6194. */
export const SPECIALIZATIONS: ReadonlyArray<string> = [
  'Vedic Astrology',
  'Numerology',
  'Tarot',
  'Vastu Shastra',
  'Palmistry',
  'KP System',
  'Nadi Astrology',
];

/** The backend's `expertise` ids (models/constants.js) each label above maps to. */
export const SPECIALIZATION_IDS: Record<string, string> = {
  'Vedic Astrology': 'vedic',
  Numerology: 'numerology',
  Tarot: 'tarot',
  'Vastu Shastra': 'vastu',
  Palmistry: 'palmistry',
  'KP System': 'krishnamurti-paddhati',
  'Nadi Astrology': 'nadi',
};

/** Figma node 105:6221. */
export const LANGUAGES: ReadonlyArray<string> = [
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Gujarati',
];

/** The backend's `languages` ids each label above maps to. */
export const LANGUAGE_IDS: Record<string, string> = {
  Hindi: 'hindi',
  English: 'english',
  Tamil: 'tamil',
  Telugu: 'telugu',
  Bengali: 'bengali',
  Marathi: 'marathi',
  Gujarati: 'gujarati',
};

/** Figma node 105:6248. */
export const EXPERIENCE_OPTIONS: ReadonlyArray<Option> = [
  { value: '1-3', label: '1–3' },
  { value: '3-5', label: '3–5' },
  { value: '5-10', label: '5–10' },
  { value: '10+', label: '10+' },
];

/** The whole-years figure `registerAstrologer`'s `experienceYears` wants — the midpoint of each band. */
export const EXPERIENCE_YEARS: Record<string, number> = {
  '1-3': 2,
  '3-5': 4,
  '5-10': 7,
  '10+': 12,
};

/** Figma node 105:6266 — the last option carries its own width. */
export const RATE_OPTIONS: ReadonlyArray<Option> = [
  { value: '15', label: '₹15' },
  { value: '20', label: '₹20' },
  { value: '25', label: '₹25' },
  { value: '30', label: '₹30' },
  { value: 'custom', label: 'Custom Amount', width: 135 },
];

export type RequiredDocument = {
  id: string;
  title: string;
  /** Formats and size limit, shown until the document lands. */
  hint: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  /**
   * The backend's `AstrologerProfile.documents[].type` id (models/constants.js
   * `DOCUMENT_TYPES`) this row files under. Undefined for the profile photo —
   * that one isn't a "document" on the backend at all; it goes through
   * `photoUrl` on the account itself instead of the documents endpoint.
   */
  backendType?: string;
};

/** Figma nodes 105:6330 – 105:6408. */
export const REQUIRED_DOCUMENTS: ReadonlyArray<RequiredDocument> = [
  {
    id: 'photo',
    title: 'Profile Photo',
    hint: 'JPG/PNG, max 5MB',
    Icon: PhotoIcon,
  },
  {
    id: 'aadhar-front',
    title: 'Aadhar Card — Front',
    hint: 'JPG/PNG/PDF, max 5MB',
    Icon: FileIcon,
    backendType: 'aadhaar_front',
  },
  {
    id: 'aadhar-back',
    title: 'Aadhar Card — Back',
    hint: 'JPG/PNG/PDF, max 5MB',
    Icon: FileIcon,
    backendType: 'aadhaar_back',
  },
  {
    id: 'pan',
    title: 'PAN Card',
    hint: 'JPG/PNG/PDF, max 5MB',
    Icon: LockIcon,
    backendType: 'pan_card',
  },
  {
    id: 'certificate',
    title: 'Astrology Certificate',
    hint: 'JPG/PNG/PDF, max 10MB',
    Icon: CertificateIcon,
    backendType: 'certificate',
  },
];

/** Figma node 105:6648. */
export const QUICK_SELECT_BANKS: ReadonlyArray<string> = [
  'SBI',
  'HDFC',
  'ICICI',
  'Axis',
  'PNB',
  'Kotak',
];

/** Figma nodes 105:6696 – 105:6719. */
export const REVIEW_STAGES: ReadonlyArray<string> = [
  'Application Received',
  'Document Verification',
  'Profile Approved',
  'Go Live & Earn',
];
