/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': '<rootDir>/tests/mocks/styleMock.js',
  },
  testMatch: ['**/__tests__/**/*.spec.ts', '**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/e2e/'],
};