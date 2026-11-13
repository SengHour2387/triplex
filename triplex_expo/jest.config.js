module.exports = {
  preset: 'jest-expo',
  // Reanimated 4 runs on react-native-worklets, which has no native module under Jest; this
  // resolver makes it load its JS implementation instead.
  resolver: 'react-native-worklets/jest/resolver',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/'],
};
