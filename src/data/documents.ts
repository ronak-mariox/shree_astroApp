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

/** The scans already on file (Figma frames 110:7102, 110:7154, 110:7180). */
export const SEED_DOCUMENTS: ReadonlyArray<UploadedDocument> = [
  {
    id: 'id-proof-1',
    type: 'Id Proof',
    idNumber: '5445GFDT454',
    status: 'Pending',
    fileName: 'id-proof-front.png',
  },
  {
    id: 'id-proof-2',
    type: 'Id Proof',
    idNumber: '5445GFDT454',
    status: 'Pending',
    fileName: 'id-proof-back.png',
  },
  {
    id: 'pan-1',
    type: 'PAN Card',
    idNumber: '5445GFDT454',
    status: 'Pending',
    fileName: 'pan-card.png',
  },
  {
    id: 'award-1',
    type: 'Award',
    idNumber: '5445GFDT454',
    status: 'Pending',
    fileName: 'award.png',
  },
];

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
