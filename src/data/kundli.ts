/**
 * The kundli the consultation header shows: what the form offers, and the
 * seeker's saved chart it opens (GET /chats/:chatId/kundli — see
 * SeekerKundli below).
 *
 * KUNDLI_TABLE_ROWS is the design's filled example ("Kundli Details of
 * mithu", nodes 110:4478 and 110:4751) — kept only as a design reference;
 * the sheet prints the seeker's real chart.
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

/** A planet as the seeker's saved chart lists it (backend kundliNormalize's normalizePlanets). */
export type KundliPlanet = {
  planet: string;
  sign?: string;
  house?: number;
  isRetrograde?: boolean;
  nakshatra?: string;
};

/** One mahadasha period; `current` marks the one running today. */
export type KundliDashaPeriod = { lord: string; start?: string | null; end?: string | null; current?: boolean };

/** Who a chart is for, as filed. `dateOfBirth` is ISO (UTC midnight), `timeOfBirth` 24-hour "HH:mm". */
export type KundliBirthDetails = {
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  place?: string;
};

/**
 * The seeker's already-generated kundli for this consultation — or, when
 * they have none for the person on the intake, `found: false` with the
 * intake's birth details (to pre-fill the form).
 */
export type SeekerKundli =
  | {
      found: true;
      profileId: string;
      status?: string;
      birthDetails?: KundliBirthDetails;
      chart?: { url?: string | null };
      lagna?: string;
      nakshatra?: string;
      keyPositions?: ReadonlyArray<{ label: string; sign?: string }>;
      planetaryPositions: ReadonlyArray<KundliPlanet>;
      mahadasha: ReadonlyArray<KundliDashaPeriod>;
    }
  | { found: false; birthDetails?: KundliBirthDetails };

const pad2 = (value: number) => String(value).padStart(2, '0');

/** Stored birth details → the generate form's own fields (a pre-filled form). */
export function draftFromBirthDetails(details?: KundliBirthDetails): KundliDraft {
  const draft = { ...EMPTY_KUNDLI_DRAFT };
  if (!details) return draft;
  draft.name = details.fullName ?? '';
  const gender = (details.gender ?? '').toLowerCase();
  draft.gender = GENDERS.find(option => option.toLowerCase() === gender) ?? '';
  const date = details.dateOfBirth ? new Date(details.dateOfBirth) : null;
  if (date && !Number.isNaN(date.getTime())) {
    draft.day = pad2(date.getUTCDate());
    draft.month = MONTHS[date.getUTCMonth()];
    draft.year = String(date.getUTCFullYear());
  }
  const time = details.timeOfBirth?.match(/^(\d{2}):(\d{2})$/);
  if (time) {
    draft.hour = time[1];
    draft.minute = time[2];
  }
  draft.birthPlace = details.place ?? '';
  return draft;
}

/** Whether the form still describes the stored chart's person (same date and time of birth) — only then is that chart shown for it. */
export function draftMatchesBirthDetails(draft: KundliDraft, details?: KundliBirthDetails): boolean {
  const stored = draftFromBirthDetails(details);
  return (
    Boolean(stored.day) &&
    draft.day === stored.day &&
    draft.month === stored.month &&
    draft.year === stored.year &&
    (!stored.hour || (draft.hour === stored.hour && draft.minute === stored.minute))
  );
}

/** "1995-08-15T00:00:00.000Z" -> "15 Aug 1995" (UTC fields — a birth date is stored at UTC midnight). */
export function formatKundliDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${pad2(date.getUTCDate())} ${MONTHS[date.getUTCMonth()].slice(0, 3)} ${date.getUTCFullYear()}`;
}

/** "22:30" -> "10:30 PM". */
export function formatKundliTime(value?: string): string {
  const time = value?.match(/^(\d{2}):(\d{2})$/);
  if (!time) return '—';
  const hour = Number(time[1]);
  return `${pad2(hour % 12 === 0 ? 12 : hour % 12)}:${time[2]} ${hour >= 12 ? 'PM' : 'AM'}`;
}
