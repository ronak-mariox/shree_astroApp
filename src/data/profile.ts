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
  /** Set once a new avatar has been picked. */
  photoFileName?: string;
};

/**
 * What the record holds before anything is edited. Figma prints these on the
 * read screen (nodes 110:6297 – 110:6332); the edit screen's own mock values
 * are its placeholders, so the record wins there.
 */
export const SEED_PROFILE: AstrologerProfile = {
  astroCode: '2024031009',
  fullName: 'Astro Mohan',
  email: 'mohanram123@gmail.com',
  primaryMobile: '95356 54856',
  secondaryMobile: '6498796543',
  gender: 'Female',
  dob: 'April 10, 2001',
  language: 'English',
  experience: '2 years',
  skill: 'Numerology , FaceReading , Nadi Vedic , Tarot',
  about:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
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

/** How many thumbnails the gallery shows (Figma nodes 110:6337 – 110:6341). */
export const PROFILE_GALLERY_COUNT = 3;

/** The two galleries the edit screen manages, and how many each holds. */
export const EDIT_GALLERIES: ReadonlyArray<{ title: string; count: number }> = [
  { title: 'Astro Ranjan Media', count: 3 },
  { title: 'Profile Gallery', count: 1 },
];
