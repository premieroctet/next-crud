module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/__tests__/adapters/prisma/client.ts',
    '<rootDir>/__tests__/adapters/prisma/seed.ts',
  ],
}
