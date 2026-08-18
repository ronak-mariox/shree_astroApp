/**
 * Stands in for the native photo / document picker.
 *
 * No picker library is installed yet, so this hands back a placeholder file so
 * the flows around it are complete: the caller shows the chosen name, uploads
 * it, and the record keeps it. **Replace {@link pickFile}'s body with the real
 * picker** (react-native-image-picker, a document picker, the camera — whatever
 * you settle on); every caller already awaits it and already handles the `null`
 * a cancelled pick returns.
 */

export type PickedFile = {
  name: string;
};

/** What the picker is being opened for; the real one narrows its filter by it. */
export type PickKind = 'photo' | 'document' | 'proof';

const EXTENSIONS: Record<PickKind, string> = {
  photo: 'jpg',
  document: 'png',
  proof: 'png',
};

/** Counted rather than timestamped so two picks in a row are distinguishable. */
let picked = 0;

export async function pickFile(kind: PickKind): Promise<PickedFile | null> {
  picked += 1;
  return { name: `${kind}-${picked}.${EXTENSIONS[kind]}` };
}

/** Resets the counter between tests. Not used by the app itself. */
export function __resetPicker() {
  picked = 0;
}
