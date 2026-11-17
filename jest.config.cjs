module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(sanitize-html|htmlparser2|dom.*|entities|marked)/)',
  ],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.cjs',
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.[jt]s?(x)',
  ],
};
