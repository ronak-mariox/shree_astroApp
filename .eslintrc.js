module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      /** Jest's globals only exist in the test run and its setup file. */
      files: ['__tests__/**/*.{ts,tsx}', 'jest.setup.js'],
      env: { jest: true },
    },
  ],
};
