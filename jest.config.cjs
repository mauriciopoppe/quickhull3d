const config = {
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  resolver: 'ts-jest-resolver',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '<rootDir>/{src,test}/**/?(*.)+(spec|test).[jt]s?(x)'],
  // transformIgnorePatterns: ['<rootDir>/node_modules/(?!gl-matrix)'],
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts']
}

module.exports = config
