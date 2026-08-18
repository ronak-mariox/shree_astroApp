/**
 * Colour tokens for the Shree Astro astrologer app.
 * Values are lifted directly from the Figma design (nodes 205:5936, 105:6739).
 */

export const colors = {
  /** Canvas behind the onboarding and astrologer welcome screens. */
  canvas: '#F5F4F0',
  /** Canvas behind the cosmic welcome screen. */
  canvasWarm: '#FFFDF8',
  /** Canvas behind the profile screens — a hair warmer than {@link canvas}. */
  canvasSoft: '#FAF9F7',
  /** Hero / brand yellow. */
  brandYellow: '#F0DF20',
  /** Cards and sheets. */
  surface: '#FFFFFF',
  /** Recessed tile — a progress track, an icon well, an unselected bank chip. */
  surfaceInset: '#F8F7F4',
  /** Translucent panel on the dashboard — a settings card or one of its rows. */
  surfaceGlass: 'rgba(255, 255, 255, 0.5)',
  /** Grey wash behind the incoming-request detail list. */
  surfaceSubtle: 'rgba(144, 144, 144, 0.06)',
  /** Header strip across the top of a dashboard settings card. */
  surfaceHeader: '#EFEFF0',
  /** Flat fill of a CTA that is not yet actionable. */
  surfaceDisabled: 'rgba(0, 0, 0, 0.08)',
  /** Scrim behind the leave-chat dialog and the kundli sheet. */
  scrim: 'rgba(0, 0, 0, 0.68)',
  /** Track behind the kundli sheet's segmented tabs. */
  surfaceTrack: '#F9F9F9',
  /** Alternating row on the dasha table. */
  surfaceRow: '#FFECBB',
  /** Ink-filled button — "Request Withdraw Money" (Figma node 112:1230). */
  surfaceDark: '#111111',
  /** Statistic tile on the wallet's yellow header. */
  surfaceOnBrand: 'rgba(17, 17, 17, 0.1)',
  /** Dial-code chip inside an edit-profile phone field, at 10% (node 110:7585). */
  surfaceDialChip: 'rgba(239, 239, 239, 0.1)',
  /** Rule between two documents in a group card, at 10% (node 110:7129). */
  surfaceDocumentRule: 'rgba(243, 243, 243, 0.1)',
  /** The "Raise a Dispute" panel — flat ink at 6% (Figma node 110:12398). */
  surfaceDispute: 'rgba(13, 6, 33, 0.06)',
  /** The reply strip inside a review card, at 50% (node 110:12297). */
  surfaceReply: 'rgba(255, 255, 255, 0.5)',

  /** Verdicts and advisories in the registration wizard. */
  status: {
    success: '#16A34A',
    /** Fill of a document row that has been uploaded. */
    successTint: 'rgba(22, 163, 74, 0.05)',
    /** Well behind the tick on an uploaded row, and the submitted badge. */
    successTintStrong: 'rgba(22, 163, 74, 0.1)',
    /** Well behind a dashboard statistic. */
    successWell: 'rgba(22, 163, 74, 0.07)',
    /** Tag on a voice request, and the "LIVE" badge on the earnings card. */
    successBadge: 'rgba(22, 163, 74, 0.1)',
    info: '#2563EB',
    infoTint: 'rgba(37, 99, 235, 0.06)',
    /** Well behind the consultations statistic. */
    infoWell: 'rgba(37, 99, 235, 0.07)',
    /** Tag on a chat request. */
    infoBadge: 'rgba(37, 99, 235, 0.1)',
    /** The rating statistic, and a new-review notification. */
    warning: '#D97706',
    warningWell: 'rgba(217, 119, 6, 0.07)',
    /** A platform announcement in the notifications feed. */
    accent: '#7C3AED',
    accentWell: 'rgba(124, 58, 237, 0.07)',
    danger: '#DC2626',
    /** Fill of the Decline button on a request card. */
    dangerTint: 'rgba(220, 38, 38, 0.06)',
    dangerTintBorder: 'rgba(220, 38, 38, 0.3)',
    /** Its heavier counterpart on the incoming-request popup. */
    dangerTintStrong: 'rgba(220, 38, 38, 0.1)',
    dangerBorder: 'rgba(220, 38, 38, 0.8)',
    /** Fill of a selected language chip. */
    infoTintStrong: 'rgba(37, 99, 235, 0.08)',
    infoTintBorder: 'rgba(37, 99, 235, 0.15)',
  },

  text: {
    /** Headings on the light canvas. */
    ink: '#111111',
    /** Screen titles and typed input — a hair softer than {@link ink}. */
    inkSoft: '#1A1A1A',
    /** Body copy on the light canvas. */
    body: '#838280',
    /** Headings on the white sheet. */
    primary: '#1F2937',
    /** Body copy on the white sheet. */
    secondary: '#6B7280',
    /** Legal / helper copy, and the label of a disabled CTA. */
    muted: '#9CA3AF',
    /** Text-input placeholder. */
    placeholder: 'rgba(26, 26, 26, 0.5)',
    /** Label in the incoming-request detail list. */
    labelMuted: 'rgba(0, 0, 0, 0.5)',
    /** A row in the profile dropdown on the dashboard header (node 110:6265). */
    dropdown: '#575757',
    /** Email and phone under the profile name (Figma node 110:6297). */
    contact: '#898989',
    /** A label or value inside an edit-profile field (Figma node 110:7560). */
    field: '#4C535F',
    /** The label on an outlined "Edit" chip (Figma node 110:6345). */
    editAction: '#707070',
    /** "Pending" beside a document's status (Figma node 110:7107). */
    statusPending: '#FF0004',
    /** "Max 5 MB files are allowed" on the upload sheet (node 110:7435). */
    uploadHint: '#6D6D6D',
    /** The "Type...." placeholder — design-system `karmaguru blue-50`. */
    placeholderFaint: '#E9EAEF',
    /** Heading on a dashboard settings card — the KarmaGuru slate. */
    slate: '#34364E',
    /** Its supporting copy — design-system token `karmaguru blue-200`. Also the
     *  seeker's chat copy and the dasha table's body. */
    slateMuted: '#989DB5',
    /** Heading on the kundli sheet and the leave-chat dialog. */
    sheet: '#314158',
    /** Button labels on the brand gradient. */
    inverse: '#FFFFFF',
    /** Brand wordmark on the yellow hero. */
    onYellow: '#000000',
    /** Supporting copy on the wallet's yellow header. */
    onYellowMuted: 'rgba(17, 17, 17, 0.6)',
    /** Label on the ink-filled withdraw button, and on the warm CTAs. */
    onDark: '#F0DF20',
    /** Label on a gradient CTA in the wallet flow — the canvas, not pure white. */
    onGradient: '#F5F4F0',
    /** Legal line under the astrologer welcome CTAs — Figma sets it to
     *  rgba(255,255,255,0.3), which all but disappears on the light canvas. */
    onCanvasGhost: 'rgba(255, 255, 255, 0.3)',
  },

  /** Primary CTA gradient — linear-gradient(261.86deg, #F55102 0%, #FFBC01 100%). */
  gradient: {
    from: '#F55102',
    to: '#FFBC01',
  },

  /** Celestial accents inside the cosmic hero. */
  cosmos: {
    /** Solid disc behind the star glyph. */
    badge: '#F87502',
    /** Glow + orbit ring base colour (used with varying opacity). */
    accent: '#FF8C00',
    /** Mid stop of the radial glow. */
    glowMid: '#804600',
    star: '#FFFFFF',
  },

  border: {
    strong: '#000000',
    /** Outline of a yellow-tinted button, chip or icon halo. */
    brandSoft: 'rgba(240, 223, 32, 0.4)',
    brandFaint: 'rgba(240, 223, 32, 0.3)',
    /** Outline of an unread notification card. */
    brandSubtle: 'rgba(240, 223, 32, 0.25)',
    /** Outline of an informational card on the light canvas. */
    brandGhost: 'rgba(240, 223, 32, 0.2)',
    /** A text field or an empty OTP box. */
    field: 'rgba(0, 0, 0, 0.14)',
    /** Rule under the login header, and the outline of a social button. */
    hairline: 'rgba(0, 0, 0, 0.08)',
    /** An OTP box that has taken a digit, or a field that has been filled in. */
    fieldActive: '#F0DF20',
    /** Outline of a selected specialization chip. */
    selected: '#111111',
    /** Outline of a dashboard settings card and its rows. */
    slate: 'rgba(52, 53, 78, 0.2)',
    /** Outline of the incoming-request detail list. */
    glass: 'rgba(255, 255, 255, 0.1)',
    /** Rule between two of its rows. */
    rowFaint: 'rgba(247, 250, 54, 0.06)',
    /** Outline of the composer field — design-system `karmaguru blue-400` at 11%. */
    composer: 'rgba(75, 85, 126, 0.11)',
    /** Outline of the kundli sheet, and the rule under its title. */
    sheet: '#4B557E',
    /** Rule between two rows of the dasha table, and the search pill's outline. */
    tableRow: '#D2D2D2',
    /** Outline of a history card — `karmaguru blue-400` at 25%. */
    historyCard: 'rgba(75, 85, 126, 0.25)',
    /** Rule between two rows of the profile's personal-information list —
     *  `karmaguru blue-200` at 3% (Figma node 110:6309). */
    profileRow: 'rgba(152, 157, 181, 0.03)',
    /** Outline of the "Edit" chip on the profile gallery (node 110:6348). */
    editChip: '#D9D9D9',
    /** Outline of a media card on the edit screen, at 20% (node 110:7691). */
    mediaCard: 'rgba(215, 214, 214, 0.2)',
    /** Outline of an edit-profile field, at 20% (Figma node 110:7563). */
    profileField: 'rgba(128, 131, 138, 0.2)',
    /** Its focused counterpart — the full-name field (node 110:7559). */
    profileFieldActive: '#111111',
    /** Outline of a field on the add-account sheet, at 20% (node 110:6810). */
    sheetField: 'rgba(99, 94, 94, 0.2)',
    /** The dashed drop zone under it, at 10% (node 110:6830). */
    dropZone: 'rgba(49, 65, 88, 0.1)',
    /** Outline of a document group card — `karmaguru blue-400` at 17%. */
    documentCard: 'rgba(75, 85, 126, 0.17)',
    /** An unselected document-type chip (Figma node 110:7437). */
    optionChip: 'rgba(0, 0, 0, 0.1)',
    /** The ring on an unselected radio (Figma node 110:7456). */
    radio: '#E6E6E6',
    /** The "ID Proof No*" field, at 10% (Figma node 110:7451). */
    uploadField: 'rgba(152, 157, 181, 0.1)',
    /** A Quick Help button — `karmaguru blue-400` at 16% (node 110:12366). */
    quickHelp: 'rgba(75, 85, 126, 0.16)',
    /** An FAQ card, a shade fainter (Figma node 110:12380). */
    faq: 'rgba(75, 85, 126, 0.15)',
    /** A reviews filter or search field — the same blue at 5% (node 110:12337). */
    reviewFilter: 'rgba(75, 85, 126, 0.05)',
    /** The rule across a review card (Figma node 110:12287). */
    reviewRule: 'rgba(152, 157, 181, 0.25)',
  },

  /** Track and thumb of the service switches (Figma node 106:6890). */
  toggle: {
    track: '#D6D6D6',
    thumb: '#FFFFFF',
  },

  /** "Delete Account" in the sidebar — a deeper red than {@link status.danger}. */
  delete: '#D30101',

  /** Design-system token `karmaguru orange-500` — the sheet's Close button. */
  brandOrange: '#FF8C1A',

  /** The My Reviews screen's own accents (Figma node 110:12201). */
  review: {
    /** A star that has been given. */
    star: '#FEDB18',
    /** One that has not. */
    starIdle: '#B9B9B9',
    flag: '#F4BC1D',
    pin: '#666666',
    /** Fill of a review card. */
    card: '#F9F9F9',
    /** A value picked out inside a card, e.g. the order id. */
    value: '#5D5D5D',
    /** A year / month filter's label. */
    filterLabel: '#858585',
  },

  /** The Help & Support screen's own accents (Figma node 110:12355). */
  support: {
    liveChat: '#FF7A00',
    emailUs: '#00C48C',
    /** Headings and labels — design-system `karmaguru blue` at its mid step. */
    heading: '#7E7EA9',
    /** Supporting copy inside a card. */
    body: '#B8B8D0',
  },

  /** "Emergency Chat" on the Change Request screen (Figma node 110:12035). */
  emergency: '#AB5454',

  /** The bank-details flow's own accent (Figma nodes 110:6641, 110:6644). */
  bank: {
    accent: '#C8102E',
    /** Fill behind the "View Trangection" button. */
    accentTint: '#FAF3F3',
  },

  /** The history screens' own accents (Figma nodes 110:8948, 110:8964). */
  history: {
    /** An amount received, and the Refund action. */
    credit: '#04971A',
    /** The Block action. */
    block: '#EE0448',
  },

  /** The leave-chat dialog's outlined "Stay" button. */
  leave: {
    border: '#C9182F',
    label: '#C9152E',
  },

  /** Brand marks on the social sign-in buttons. */
  social: {
    google: '#EA4335',
    facebook: '#1877F2',
  },

  /** Faint yellow washes layered over the light canvas. */
  brandTint: {
    /** Fill behind the onboarding icon halo. */
    halo: 'rgba(240, 223, 32, 0.1)',
    /** Fill of a feature chip, and of the SMS advisory card. */
    chip: 'rgba(240, 223, 32, 0.08)',
    /** Fill of an unread notification card — the faintest wash in the app. */
    card: 'rgba(240, 223, 32, 0.04)',
    /** Fill of the consultation-channel tag on the incoming-request popup. */
    tag: 'rgba(240, 223, 32, 0.11)',
    /** Fill of an OTP box that has taken a digit. */
    field: 'rgba(240, 223, 32, 0.14)',
    /** Bloom cast by the onboarding icon halo. */
    glow: 'rgba(240, 223, 32, 0.2)',
    /** Bloom cast by the astrologer welcome badge. */
    glowStrong: 'rgba(240, 223, 32, 0.4)',
  },

  /** Onboarding progress indicator. */
  progress: {
    active: '#16A34A',
    track: 'rgba(2, 76, 38, 0.2)',
  },

  shadow: '#000000',
} as const;

/** Fades a `#RRGGBB` token to an `rgba()` string. */
export function withOpacity(hex: string, alpha: number): string {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Opacities applied to `colors.cosmos.accent` in the hero. */
export const cosmosOpacity = {
  outerRing: 0.3,
  innerRing: 0.5,
  zodiacGlyph: 0.7,
  badgeGlow: 0.5,
  glowInner: 0.25,
  glowMid: 0.125,
} as const;
