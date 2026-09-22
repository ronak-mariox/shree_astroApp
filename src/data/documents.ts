/**
 * The scans the astrologer has filed, and the form the upload sheet opens with.
 * Figma: nodes 110:6999, 110:7414.
 */

/** One filed scan (Figma nodes 110:7104, 110:7130). */
export type UploadedDocument = {
  id: string;
  /** Which of {@link DOCUMENT_TYPES} it proves. */
  type: string;
  idNumber: string;
  status: string;
  /** The file behind it; the file picker itself is stubbed. */
  fileName: string;
};

/** A heading and the scans filed under it. */
export type DocumentGroup = {
  title: string;
  documents: ReadonlyArray<UploadedDocument>;
};

/**
 * The document types the upload sheet offers. Figma lays them out in two
 * columns, filling the left one first (nodes 110:7443 – 110:7454).
 */
export const DOCUMENT_TYPES: ReadonlyArray<string> = [
  'Id Proof',
  'Aadhar Card Front',
  'PAN Card',
  'Aadhar Card Back',
  'Certificate',
  'Passport',
  'Award',
];

/** Figma opens the sheet with the first type already picked. */
export const DEFAULT_DOCUMENT_TYPE = DOCUMENT_TYPES[0];

/**
 * The backend's `AstrologerProfile.documents[].type` enum (models/constants.js
 * `DOCUMENT_TYPES`) each label above maps to. Naively slugifying the label
 * (`"Aadhar Card Front"` -> `"aadhar_card_front"`) doesn't match the backend's
 * actual ids (`aadhaar_front`, no "card") — this is the real mapping.
 */
export const DOCUMENT_TYPE_IDS: Record<string, string> = {
  'Id Proof': 'id_proof',
  'Aadhar Card Front': 'aadhaar_front',
  'Aadhar Card Back': 'aadhaar_back',
  'PAN Card': 'pan_card',
  Certificate: 'certificate',
  Passport: 'passport',
  Award: 'award',
};

/**
 * Figma titles the three cards "Uploaded ID Proof 1", "Uploaded PAN Proof" and
 * "Uploaded Award Proof" — the type, wrapped in "Uploaded … Proof".
 */
const GROUP_TITLES: Record<string, string> = {
  'Id Proof': 'Uploaded ID Proof 1',
  'PAN Card': 'Uploaded PAN Proof',
  Award: 'Uploaded Award Proof',
};

export const groupTitleFor = (type: string) =>
  GROUP_TITLES[type] ?? `Uploaded ${type}`;

/**
 * Scans grouped by what they prove, in the order the types were first filed —
 * so a newly uploaded kind lands at the bottom rather than reshuffling the page.
 */
export function groupDocuments(
  documents: ReadonlyArray<UploadedDocument>,
): DocumentGroup[] {
  const order: string[] = [];
  const byType = new Map<string, UploadedDocument[]>();

  for (const document of documents) {
    if (!byType.has(document.type)) {
      order.push(document.type);
      byType.set(document.type, []);
    }
    byType.get(document.type)!.push(document);
  }

  return order.map(type => ({
    title: groupTitleFor(type),
    documents: byType.get(type)!,
  }));
}
