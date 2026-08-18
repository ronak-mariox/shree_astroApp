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

/** Figma node 105:6248. */
export const EXPERIENCE_OPTIONS: ReadonlyArray<Option> = [
  { value: '1-3', label: '1–3' },
  { value: '3-5', label: '3–5' },
  { value: '5-10', label: '5–10' },
  { value: '10+', label: '10+' },
];

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
  },
  {
    id: 'aadhar-back',
    title: 'Aadhar Card — Back',
    hint: 'JPG/PNG/PDF, max 5MB',
    Icon: FileIcon,
  },
  {
    id: 'pan',
    title: 'PAN Card',
    hint: 'JPG/PNG/PDF, max 5MB',
    Icon: LockIcon,
  },
  {
    id: 'certificate',
    title: 'Astrology Certificate',
    hint: 'JPG/PNG/PDF, max 10MB',
    Icon: CertificateIcon,
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
