module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // __tests__/helpers holds shared render utilities, not suites of their own.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/helpers/'],
};
