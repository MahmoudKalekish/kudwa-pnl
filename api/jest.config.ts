import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Match only TS test files under src/tests or tests
  testMatch: [
    "**/tests/**/*.test.ts"
  ],

  // Ignore dist/ so compiled JS tests don’t run
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};

export default config;
