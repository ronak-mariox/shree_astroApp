/**
 * The kundli the consultation header generates: what the form offers, and the
 * chart it returns.
 *
 * Figma prints one filled example — "Kundli Details of mithu" — so the rows
 * below are the ones the design lists (nodes 110:4478 and 110:4751).
 */

export const KUNDLI_TABS = [
  { key: 'lagna', label: 'Lagna Chart' },
  { key: 'birth', label: 'Lagna/Birth Chart' },
  { key: 'dasha', label: 'Dasha' },
  { key: 'planets', label: 'Planet Details' },
] as const;

export type KundliTab = (typeof KUNDLI_TABS)[number]['key'];

export type KundliDraft = {
  name: string;
  gender: string;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  birthPlace: string;
};

export const EMPTY_KUNDLI_DRAFT: KundliDraft = {
  name: '',
  gender: '',
  day: '',
  month: '',
  year: '',
  hour: '',
  minute: '',
  birthPlace: '',
};

const range = (from: number, to: number, pad = 2) =>
  Array.from({ length: to - from + 1 }, (_, index) =>
    String(from + index).padStart(pad, '0'),
  );

export const GENDERS = ['Male', 'Female', 'Other'] as const;
export const DAYS = range(1, 31);
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
/** Far enough back for an adult seeker, newest first the way a picker reads. */
export const YEARS = range(1940, 2026, 4).reverse();
export const HOURS = range(0, 23);
export const MINUTES = range(0, 59);
export const BIRTH_PLACES = [
  'Delhi, India',
  'Mumbai, India',
  'Kolkata, India',
  'Chennai, India',
  'Bengaluru, India',
  'Jaipur, India',
  'Lucknow, India',
  'Kochi, India',
] as const;

export type DashaTableRow = {
  /** "Planet" on the dasha tab, "Planets" on the planet-details tab. */
  planet: string;
  /** Rashi — printed under "Start Date" on the dasha tab. */
  rashi: string;
  /** Longitude — printed under "End Date" on the dasha tab. */
  longitude: string;
};

/** Figma lists the panchang first, then the planets (node 110:4485). */
export const KUNDLI_TABLE_ROWS: ReadonlyArray<DashaTableRow> = [
  { planet: 'Nakshatra', rashi: 'Taurus', longitude: '29∘40′22″' },
  { planet: 'Karan', rashi: 'Gemini', longitude: '0∘54′1″' },
  { planet: 'Paksha', rashi: 'Capricorn', longitude: '25∘43′13″' },
  { planet: 'Yog', rashi: 'Gemini', longitude: '19∘9′6″' },
  { planet: 'Day', rashi: 'Aries', longitude: '15∘45′19″' },
  { planet: 'Mars', rashi: 'Leo', longitude: '5∘1′31″' },
  { planet: 'Jupiter', rashi: 'Capricorn', longitude: '25∘43′13″' },
  { planet: 'Saturn', rashi: 'Gemini', longitude: '19∘9′6″' },
  { planet: 'Rahu', rashi: 'Aries', longitude: '15∘45′19″' },
  { planet: 'Ketu', rashi: 'Leo', longitude: '28∘29′40″' },
];

/** The dasha tab heads the same rows with dates (node 110:4487 – 110:4511). */
export const DASHA_HEADINGS = ['Planet', 'Start Date', 'End Date'] as const;
/** The planet-details tab heads them with the chart values (node 110:4760). */
export const PLANET_HEADINGS = ['Planets', 'Rashi', 'Longitude'] as const;
