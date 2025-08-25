/**@type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tests/tsconfig.json'
    }]
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tests/tsconfig.json'
    }
  },
  collectCoverageFrom: [
    'out/**/*.js',
    '!out/**/*.d.ts',
    '!out/**/*.test.js',
    '!out/**/*.spec.js'
  ],
  // Put all test outputs in one folder
  coverageDirectory: 'tests/test-results/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  // Ensure all test artifacts go to test-results folder  
  cacheDirectory: '<rootDir>/tests/test-results/.jest-cache',
  // Optional: Add basic reporters that work with current Jest version
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './tests/test-results/junit',
      outputName: 'test-results.xml'
    }]
  ]
};