/**
 * The astrologer's own profile — the record both profile screens read, and the
 * one the edit form writes back.
 * Figma: nodes 110:6288 (read) and 110:7463 (edit).
 */

export type AstrologerProfile = {
  /** Assigned when the account is approved; the astrologer cannot change it. */
  astroCode: string;
  fullName: string;
  email: string;
  /** Both numbers are held without the dial code, as the edit form types them. */
  primaryMobile: string;
  secondaryMobile: string;
  gender: string;
  dob: string;
  language: string;
  experience: string;
  /** A comma-separated list, as the design prints it. */
  skill: string;
  about: string;
  /** The astrologer's uploaded photo, as a fully-qualified URL from the server. */
  photoUrl?: string;
  /**
   * Where the application has reached (`registered` … `approved`/`rejected`).
   * Only ever present when read straight from the server via `fetchProfile`
   * — the fixtures and `saveProfile`'s own return value don't carry it,
   * since nothing about editing the profile can change it.
   */
  applicationStatus?: string;
};

/** One row of the personal-information list — a label and its value. */
export type ProfileRow = {
  label: string;
  value: string;
};

/** The list the read screen prints, in Figma's order (nodes 110:6306 – 110:6332). */
export function personalInformationOf(
  profile: AstrologerProfile,
): ProfileRow[] {
  return [
    { label: 'Astro Code :', value: profile.astroCode },
    { label: 'DOB :', value: profile.dob },
    { label: 'Gender :', value: profile.gender },
    { label: 'Secondary Mobile :', value: `+91 ${profile.secondaryMobile}` },
    { label: 'Languages :', value: profile.language },
    { label: 'Experience :', value: profile.experience },
    { label: 'Expertises :', value: profile.skill },
  ];
}

/** How the read screen prints the primary number (Figma node 110:6298). */
export const primaryMobileOf = (profile: AstrologerProfile) =>
  `+91 ${profile.primaryMobile}`;

/** What the pickers behind the edit form's select fields offer. */
export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Bengali',
  'Marathi',
  'Tamil',
  'Telugu',
];

/** Skills are picked several at a time and printed as a comma-separated list. */
export const SKILL_OPTIONS = [
  'Vedic',
  'Numerology',
  'Tarot',
  'FaceReading',
  'Nadi',
  'Vastu',
  'Palmistry',
];

