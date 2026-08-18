/** Spacing scale used across the app (matches the Figma 4pt rhythm). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  section: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  /** Filled CTA. */
  button: 9,
  /** Outlined CTA. */
  buttonOutline: 16,
  /** The taller Accept / Decline pair on the incoming-request popup. */
  buttonLarge: 18,
  /** Feature chip on the astrologer welcome screen. */
  chip: 20,
  /** Rounded square behind the welcome badge icon. */
  badge: 24,
  /** Text field, social button, and a CTA that is not yet actionable. */
  field: 14,
  /** A wizard field, a segmented option, an advisory card, an icon well. */
  input: 12,
  /** A bank quick-select chip, and the upload action tile. */
  chipSmall: 8,
  /** The wizard's step-progress bar. */
  progressBar: 2,
  /** The squared corner that points a chat bubble at its sender. */
  bubbleTail: 4,
  /** Chat composer field. */
  composer: 16,
  /** The kundli sheet's corners. */
  kundliSheet: 18,
  /** A pill on its segmented tabs. */
  sheetTab: 9,
  /** Dashboard stat card and the performance panel. */
  card: 20,
  /** Dashboard settings card, and a request card. */
  panel: 16,
  /** Icon well on a stat card. */
  well: 10,
  /** Accept / Decline buttons. */
  action: 10,
  /** Channel tag on a request. */
  tag: 6,
  /** The "Add/Update" link on an expertise card. */
  linkChip: 5,
  /** The online/offline segmented control. */
  segment: 14,
  /** Its selected pill. */
  segmentPill: 13,
  /** A single OTP box. */
  otpBox: 12,
  /** Advisory card. */
  note: 10,
  /** Icon tile in the login header. */
  iconTile: 16,
  /** Icon tile above a centred title. */
  iconTileSmall: 14,
  /** The disabled "Send OTP" — Figma softens it further than {@link field}. */
  buttonDisabled: 16,
  /** Progress dot / bar. */
  progress: 4,
  /** White sheet on the cosmic welcome screen. */
  sheet: 32,
  /** A gallery thumbnail, and the outlined "Edit" chip beside it. */
  thumb: 5,
  /** A media card on the edit-profile screen. */
  mediaCard: 8,
  /** The dial-code chip inside an edit-profile phone field. */
  dialChip: 4,
  /** The multi-line "About" box (Figma node 110:7677). */
  textArea: 4.928,
  /** The avatar on either profile screen — Figma rounds it well past a circle. */
  avatar: 67,
  /** The cancelled cheque on the bank-attachment sheet, and a document scan. */
  attachment: 15,
  /** The "Update" button over a document scan. */
  documentAction: 6,
  /** The bin beside it. */
  documentBin: 7,
} as const;

/** Hairline used for outline buttons, chips and the orbit rings. */
export const hairline = 0.755;

/** Border of the onboarding icon halo — twice a hairline, then some. */
export const stroke = 1.51;

/** The artboard the design was drawn on — used to keep the star field
 *  proportional on other screen sizes. */
export const designFrame = {
  width: 389.991,
  heroHeight: 484.407,
} as const;
