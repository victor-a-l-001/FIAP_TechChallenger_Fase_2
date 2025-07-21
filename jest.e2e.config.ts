import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'e2e',
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/tests/setup.ts',
  setupFiles: ['<rootDir>/tests/setup-env.ts'],
  globalTeardown: '<rootDir>/tests/teardown.ts',
  testMatch: ['**/tests/**/*.e2e.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  maxWorkers: 1,
};

export default config;
