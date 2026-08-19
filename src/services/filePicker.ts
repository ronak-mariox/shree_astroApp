/**
 * Choosing a photo or a scan — from the camera, or from the gallery.
 *
 * A screen asking for a file does not care where it came from. It calls
 * {@link pickFile}, waits, and gets back either an asset it can show and
 * upload, or `null` because the user changed their mind.
 *
 * Everything that can go wrong on the way — a cancelled sheet, a refused
 * permission, a device with no camera — resolves to `null` too, after telling
 * the user what happened. A caller never has to handle an error here.
 *
 * Documents go through the image picker as well: people photograph an Aadhaar
 * card far more often than they have a PDF of it on the phone.
 */

import { ActionSheetIOS, Alert, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
  type OptionsCommon,
} from 'react-native-image-picker';

/** What the upload needs: React Native streams the file from the uri itself. */
export type PickedFile = {
  uri: string;
  name: string;
  type: string;
};

/** What the picker is being opened for; it narrows the wording, not the filter. */
export type PickKind = 'photo' | 'document' | 'proof';

const TITLES: Record<PickKind, string> = {
  photo: 'Profile Photo',
  document: 'Upload Document',
  proof: 'Bank Proof',
};

/**
 * How the image is treated before it leaves the device.
 *
 * A modern phone camera produces something like 12 MB and the API refuses
 * anything over 5 MB. Capping the long edge at 1600px keeps a document
 * readable while landing comfortably under that.
 */
const IMAGE_OPTIONS: OptionsCommon = {
  mediaType: 'photo',
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.8,
};

type Source = 'camera' | 'gallery';

/** Asks where the file should come from, using each platform's own chooser. */
function askForSource(kind: PickKind): Promise<Source | undefined> {
  const title = TITLES[kind];

  return new Promise(resolve => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          options: ['Take Photo', 'Choose from Gallery', 'Cancel'],
          cancelButtonIndex: 2,
        },
        index => resolve(index === 0 ? 'camera' : index === 1 ? 'gallery' : undefined),
      );
      return;
    }

    Alert.alert(
      title,
      'Where would you like to get it from?',
      [
        { text: 'Take Photo', onPress: () => resolve('camera') },
        { text: 'Choose from Gallery', onPress: () => resolve('gallery') },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(undefined) },
      ],
      { cancelable: true, onDismiss: () => resolve(undefined) },
    );
  });
}

/**
 * What to say when the picker could not even be opened.
 *
 * Almost always one thing: react-native-image-picker is a *native* module, so
 * it only exists inside the app after a native rebuild. Installing the package
 * and reloading over Metro is not enough — the JS is there, the native half is
 * not, and the call fails the moment it reaches the bridge.
 */
function unavailableMessage(error: unknown): string {
  if (__DEV__) {
    return (
      'The picker is not in this build of the app. Stop Metro, run ' +
      '"npm run android" (or "npm run ios") to rebuild with the native module, ' +
      `then try again.\n\n${String(error)}`
    );
  }
  return 'The picker could not be opened. Please try again.';
}

/** What to tell the user when the picker refuses. */
function messageFor(response: ImagePickerResponse): string {
  if (response.errorCode === 'camera_unavailable') {
    return 'This device does not have a camera available.';
  }
  if (response.errorCode === 'permission') {
    return 'Shree Astro needs permission to use your camera and photos. You can turn it on in Settings.';
  }
  return response.errorMessage || 'That file could not be opened. Please try another.';
}

export async function pickFile(kind: PickKind): Promise<PickedFile | null> {
  const source = await askForSource(kind);
  if (!source) {
    return null;
  }

  let response: ImagePickerResponse;
  try {
    response =
      source === 'camera'
        ? await launchCamera({
            ...IMAGE_OPTIONS,
            /** A profile photo is a selfie; a document is not. */
            cameraType: kind === 'photo' ? 'front' : 'back',
            saveToPhotos: false,
          })
        : await launchImageLibrary({ ...IMAGE_OPTIONS, selectionLimit: 1 });
  } catch (error) {
    /**
     * Without this the rejection would travel up into the screen's `await`,
     * go unhandled, and the tap would look like it did nothing.
     */
    console.error('[filePicker] could not open the picker:', error);
    Alert.alert(TITLES[kind], unavailableMessage(error));
    return null;
  }

  /** Backed out — not a failure, so stay quiet. */
  if (response.didCancel) {
    return null;
  }

  if (response.errorCode) {
    Alert.alert(TITLES[kind], messageFor(response));
    return null;
  }

  const asset = response.assets?.[0];
  if (!asset?.uri) {
    return null;
  }

  return {
    uri: asset.uri,
    name: asset.fileName || `${kind}.jpg`,
    type: asset.type || 'image/jpeg',
  };
}
