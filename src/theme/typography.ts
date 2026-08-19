import type { TextStyle } from 'react-native';

/**
 * Poppins carries the headings and buttons, Inter the body copy — both are
 * bundled with the app (src/assets/fonts) and linked into the iOS and Android
 * projects, so the family names below resolve on either platform.
 */
export const fontFamily = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  bodyRegular: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
} as const;

export const typography = {
  /** "Shree Astro" wordmark on the cosmic hero. */
  wordmark: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 33,
  },
  /** "Discover Your / Cosmic Destiny". */
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 31.2,
  },
  /** Supporting paragraph on the white sheet. */
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 22.4,
  },
  /** "Welcome to Shree Astro". */
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 30,
    lineHeight: 45,
  },
  /** Onboarding slide heading, e.g. "Earn Online, Anytime". */
  slideTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    lineHeight: 33.8,
  },
  /** Onboarding slide paragraph. */
  slideBody: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    lineHeight: 25.5,
  },
  /** Subtitle under "Welcome to Shree Astro". */
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 22.4,
  },
  /** "Welcome Back" — the login screen's title. */
  pageTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    lineHeight: 39,
  },
  /** "Verify OTP" — a title set inside a centred column. */
  pageTitleSmall: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 33,
  },
  /** "Login with your mobile number". */
  pageSubtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
  },
  /** "MOBILE NUMBER" — the all-caps label above a field. */
  fieldLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1,
  },
  /** The wizard's tighter all-caps label, also used for "STEP 1 OF 4". */
  formLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
    lineHeight: 16.5,
    letterSpacing: 0.8,
  },
  /** "Done" on an uploaded row — {@link formLabel} without the tracking. */
  statusLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
    lineHeight: 16.5,
  },
  /** "Pt. Rajesh" on the dashboard, and a headline figure on a stat card. */
  dashboardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 30,
  },
  /** "Good Morning ✨". */
  greeting: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    lineHeight: 19.5,
  },
  /** "Today's Performance" / "Pending Requests". */
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 22.5,
  },
  /** "View All", and the online/offline switch labels. */
  actionLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 12,
    lineHeight: 18,
  },
  /** The online/offline segment labels, set in Poppins. */
  segmentLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 18,
  },
  /** Caption under a headline figure on a stat card. */
  cardCaption: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 16.5,
  },
  /** "LIVE". */
  badgeLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    lineHeight: 15,
  },
  /** "3 New". */
  badgeLabelStrong: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    lineHeight: 16.5,
  },
  /** The figure on a performance statistic. */
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 27,
  },
  /** Its caption. */
  statCaption: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 10,
    lineHeight: 15,
  },
  /** Heading of a dashboard settings card, and its column titles. */
  panelTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 15.6,
  },
  /** A value inside one of those cards. */
  panelValue: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 15.6,
  },
  /** An expertise chip's label. */
  expertiseLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 15.6,
  },
  /** Requester name, and the initials on their tile. */
  requestName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 21,
  },
  requestInitials: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 21,
  },
  /** "2m ago". */
  requestTime: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 16.5,
  },
  /** The channel tag on a request. */
  tagLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    lineHeight: 16.5,
  },
  /** "Accept" / "Decline". */
  requestAction: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 18,
  },
  /** Bottom-navigation label. */
  tabLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  /** Its selected counterpart. */
  tabLabelActive: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    lineHeight: 15,
  },
  /** "Chat History" / "Call History" in the yellow header. */
  screenTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  /** The search pill's placeholder. */
  searchPlaceholder: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  /** "5,00,000" over "Total Earnings". */
  earningsAmount: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    lineHeight: 36,
  },
  earningsCaption: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  /** A field name on a history card. */
  historyLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  /** Its value, and the emphasised variant used for amounts and dashes. */
  historyValue: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 15,
  },
  historyValueStrong: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    lineHeight: 15,
  },
  /** One of the card's three pill actions. */
  historyAction: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  /** A row in the dashboard's profile dropdown, e.g. "Bank Details". */
  dropdownLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
  },

  /* The profile screens (Figma nodes 110:6288, 110:7463) set Poppins on a 1.7
   * leading. Figma reaches for Poppins Light in a few places; only Regular is
   * bundled, so those fall back to it — the same substitution
   * {@link chatBody} documents. */

  /** "Astro Mohan" over the profile card, and the "Edit Profile" heading. */
  profileName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 27.2,
  },
  /** The email and phone beneath it. */
  profileContact: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 20,
  },
  /** "Personal Information" / "About Us". */
  profileSection: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 23.8,
  },
  /** "Astrologer Profile Gallery" — the heavier section heading. */
  profileSectionStrong: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 23.8,
  },
  /** A field name in the personal-information list, and the About paragraph. */
  profileRowLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 20.4,
  },
  /** Its value. */
  profileRowValue: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 20.4,
  },
  /** "Edit" / "Update" / "Cancel" on a profile button. */
  profileButton: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 23.8,
  },
  /** The label on an outlined "Edit" chip beside a gallery. */
  profileEditLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 16,
  },
  /** A label above an edit-profile field, e.g. "Full name". */
  editFieldLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 13.5,
  },
  /** The value typed into one. */
  editFieldValue: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 15.7,
  },
  /** The full-name field sets its value a size larger (node 110:7560). */
  editFieldValueLarge: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 15.7,
  },
  /** The multi-line "About" value, set on a looser leading. */
  editFieldParagraph: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 21.6,
  },
  /** "+91" on a dial-code chip — Figma sets this one in Inter. */
  editDialCode: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
  },

  /* The bank-details flow (Figma nodes 110:6514, 110:6793, 110:6992). */

  /** "Bank Details" over the introductory paragraph. */
  bankHeading: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  /** "Add New Account" / "Bank Attachment" — a sheet's title. */
  sheetHeading: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 21,
  },
  /** "Upload your file(s) or" on the account-proof drop zone. */
  uploadCopy: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  /** The "browse" half of it — Figma sets this one in Inter. */
  uploadLink: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
  },

  /* The documents flow (Figma nodes 110:6999, 110:7414). */

  /** "Uploaded ID Proof 1" — the heading over a group of scans. */
  documentGroupTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  /** "ID Number :" / "Status :" under a scan. */
  documentMetaLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  /** Their values, set a weight heavier. */
  documentMetaValue: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  /** The label on a selected document-type chip. */
  optionChipSelected: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 18,
  },
  /** "Upload your file" / "Max 5 MB files are allowed" on that sheet. */
  uploadHint: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 20,
  },

  /* Help & Support (Figma node 110:12355). Figma sets its headings in Manrope
   * and its body in Manrope / Poppins Light; neither is bundled, so both fall
   * back to the nearest bundled Poppins weight. */

  /** "Quick Help" / "FAQs" / "Raise a Dispute". */
  supportSection: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    lineHeight: 28,
  },
  /** A Quick Help button's label. */
  supportButton: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  /** An FAQ's question. */
  faqQuestion: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  /** Its answer. */
  faqAnswer: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  /** An issue-type tile's label. */
  issueLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  /** The dispute description placeholder. */
  disputeInput: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  /** "Submit Dispute". */
  disputeButton: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
  },

  /* Change Request (Figma node 110:11895). */

  /** A service panel's name, e.g. "Call". */
  serviceTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  /** A rate row's label. */
  rateLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  /** Its value. */
  rateValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },

  /* My Reviews (Figma node 110:12201). */

  /** "Ratings And Reviews" over the banner. */
  reviewBannerTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 15.6,
  },
  /** Its paragraph. */
  reviewBannerBody: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 13.6,
  },
  /** The reviewer's name at the top of a card. */
  reviewName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 18,
  },
  /** A label on a card, e.g. "Order ID:" or "Rating:". */
  reviewLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  /** The value beside it. */
  reviewValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 18,
  },
  /** The replier's name on the strip at the foot of a card. */
  replyName: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 15,
  },
  /** What they wrote. */
  replyBody: {
    fontFamily: fontFamily.regular,
    fontSize: 8,
    lineHeight: 12,
  },
  /** A sidebar menu label, and the profile name above the list. */
  menuLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  /** The phone number under it. */
  menuMeta: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  /** The wallet balance, and the amount being withdrawn. */
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    lineHeight: 60,
  },
  /** The rupee sign beside it. */
  displaySymbol: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 48,
  },
  /** A figure on one of the wallet header's three tiles. */
  tileValue: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
  },
  /** Its caption. */
  tileLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    lineHeight: 16.5,
  },
  /** The amount on a transaction row. */
  amount: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 22.5,
  },
  /** "Astro Rakesh" in the chat header. */
  chatName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  /** "(04:58 mins)" under it. */
  chatTimer: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  /** Message copy. Figma sets it in Cerebri Sans Pro, which is not licensed
   *  here, so it falls back to the bundled Inter at the same metrics. */
  chatBody: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 10,
    lineHeight: 16,
  },
  /** A message's timestamp. */
  chatTime: {
    fontFamily: fontFamily.regular,
    fontSize: 6,
    lineHeight: 9,
  },
  /** "Generate Kundli" on the footer of the details bubble. */
  chatAction: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 13.2,
  },
  /** The composer's placeholder and typed text. */
  composerInput: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
  },
  /** The "X" on the chat header's leave button (Figma node 110:503). */
  closeMark: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    lineHeight: 16,
  },
  /** "Kundli Details" / "Do you want to leave this chat?". */
  sheetTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 18,
  },
  /** "Generate Kundli" on the form sheet's CTA (Figma node 110:3930). */
  sheetAction: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    lineHeight: 18,
  },
  /** Copy inside the leave-chat dialog, and its buttons. */
  dialogBody: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  dialogButton: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  /** The selected tab on the kundli sheet. */
  sheetTabActive: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    lineHeight: 15,
  },
  /** Its unselected counterpart, set lighter. */
  sheetTab: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  /** A dasha table heading. */
  tableHeading: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10,
    lineHeight: 15,
  },
  /** A dasha table cell. */
  tableCell: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  /** "Personal Info" — a wizard step's title. */
  wizardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 27,
  },
  /** Text typed into a wizard field, and its placeholder. */
  inputSmall: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
  },
  /** "+91" beside the wizard's phone field. */
  countryCodeSmall: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 21,
  },
  /** "Male" / "Female" / "Other" — a full-size segmented option. */
  optionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 21,
  },
  /** "3–5" / "₹25" — a tighter segmented option. */
  optionLabelSmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 19.5,
  },
  /** "Profile Photo" — the title of a document row. */
  rowTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 21,
  },
  /** "Application Submitted!" / "Priya Mehta" on the incoming-request popup. */
  headline: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 36,
  },
  /** The initials on that popup's large avatar. */
  initialsLarge: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 42,
  },
  /** A value in its detail list, and the channel tag's label. */
  metaMedium: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
    lineHeight: 19.5,
  },
  /** The paragraph under it, set on a looser leading than {@link pageSubtitle}. */
  successBody: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    lineHeight: 23.8,
  },
  /** "24–48 hours". */
  successBodyStrong: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 14,
    lineHeight: 23.8,
  },
  /** The label of a timeline step that has happened. */
  timelineActive: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    lineHeight: 21,
  },
  /** The number in a pending timeline bullet. */
  stepNumber: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    lineHeight: 19.5,
  },
  /** "+91" beside the phone field. */
  countryCode: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 22.5,
  },
  /** Text typed into a field, and its placeholder. */
  input: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    lineHeight: 22.5,
  },
  /** "or login with". */
  dividerLabel: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
  },
  /** The "G" / "f" marks on the social buttons. */
  socialGlyph: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 18,
    lineHeight: 27,
  },
  /** A digit inside an OTP box. */
  otpDigit: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 30,
  },
  /** "6-digit code sent to …" / "Didn't receive? …". */
  meta: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    lineHeight: 19.5,
  },
  /** The number the code went to. */
  metaStrong: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    lineHeight: 19.5,
  },
  /** The countdown / resend half of the footnote. */
  metaBold: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13,
    lineHeight: 19.5,
  },
  /** Copy inside an advisory card. */
  note: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
  },
  /** Feature chip label. */
  chipLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
  },
  /** Full-width CTA labels. */
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  /** "Login to Your Account" — set bolder than the standard button. */
  buttonStrong: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
  },
  /** "Skip" on the onboarding footer. */
  buttonSmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 22.5,
  },
  /** "Next →" / "Get Started →". */
  buttonSmallStrong: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    lineHeight: 22.5,
  },
  /** Terms & privacy line on the white sheet. */
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  /** Terms & privacy line on the light canvas. */
  captionBody: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    lineHeight: 18,
  },
  /** Zodiac symbols around the orbit — left to the system font so the
   *  glyphs resolve everywhere. */
  glyph: {
    fontSize: 14,
    lineHeight: 21,
  },
} satisfies Record<string, TextStyle>;
