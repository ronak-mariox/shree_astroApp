import { type ImageSourcePropType } from 'react-native';

/**
 * A photo URL straight from the API, or the given placeholder when the
 * astrologer hasn't set one (or picked one) yet.
 */
export const photoOf = (
  url: string | undefined,
  placeholder: ImageSourcePropType,
): ImageSourcePropType => (url ? { uri: url } : placeholder);
