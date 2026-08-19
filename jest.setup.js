/**
 * The screens are tested against an in-memory store, not a server.
 *
 * These mocks live here rather than in a helper because `jest.mock` has to be
 * registered before a test file's own imports run — and a test file imports the
 * screen, which imports the provider, which imports the API. Registering it in
 * setup is what guarantees the order.
 */

jest.mock('./src/services/api', () => require('./__tests__/helpers/apiMock'));

jest.mock('./src/services/filePicker', () => {
  /** The same extensions the old stub produced, so assertions read the same. */
  const EXTENSIONS = { photo: 'jpg', document: 'png', proof: 'png' };

  /**
   * Files are numbered so two picks in a row are distinguishable. The count
   * comes from the mock's own call log rather than a closure variable, so
   * `pickFile.mockClear()` between tests resets it.
   */
  const pickFile = jest.fn(async kind => {
    const name = `${kind}-${pickFile.mock.calls.length}.${EXTENSIONS[kind] ?? 'jpg'}`;
    return { uri: `file:///tmp/${name}`, name, type: 'image/jpeg' };
  });

  return { pickFile };
});

/**
 * Signing in reaches the network, which a screen test has no business doing.
 * The screens are what is being tested; the auth calls just have to resolve.
 */
jest.mock('./src/services/auth', () => ({
  localPhoneOf: value => String(value).replace(/\D/g, '').slice(-10),
  requestLoginOtp: jest.fn(async () => ({
    channel: 'phone',
    destination: '••••••3210',
    expiresInSeconds: 300,
    resendInSeconds: 30,
  })),
  verifyLoginOtp: jest.fn(async () => ({
    accessToken: 'test-access',
    refreshToken: 'test-refresh',
    astrologer: {
      id: 'a-1',
      name: 'Astro Mohan',
      applicationStatus: 'approved',
      onboardingStep: 0,
    },
  })),
  register: jest.fn(async () => ({})),
  signOut: jest.fn(async () => {}),
}));

/** No native keystore in a test run; hold the session in memory instead. */
jest.mock('react-native-keychain', () => {
  const store = new Map();
  return {
    ACCESSIBLE: { AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AfterFirstUnlockThisDeviceOnly' },
    STORAGE_TYPE: { AES_GCM_NO_AUTH: 'KeystoreAESGCM_NoAuth' },
    setGenericPassword: jest.fn(async (username, password, { service }) => {
      store.set(service, { username, password });
      return { service };
    }),
    getGenericPassword: jest.fn(async ({ service }) => store.get(service) ?? false),
    resetGenericPassword: jest.fn(async ({ service }) => store.delete(service)),
  };
});
