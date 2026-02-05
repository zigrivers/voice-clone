const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // MSW and interceptors module mappings
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
    "^msw$": "<rootDir>/node_modules/msw/lib/core/index.js",
    "^@mswjs/interceptors/ClientRequest$": "<rootDir>/node_modules/@mswjs/interceptors/lib/node/interceptors/ClientRequest/index.cjs",
    "^@mswjs/interceptors/XMLHttpRequest$": "<rootDir>/node_modules/@mswjs/interceptors/lib/node/interceptors/XMLHttpRequest/index.cjs",
    "^@mswjs/interceptors/fetch$": "<rootDir>/node_modules/@mswjs/interceptors/lib/node/interceptors/fetch/index.cjs",
    "^@mswjs/interceptors/presets/node$": "<rootDir>/node_modules/@mswjs/interceptors/lib/node/presets/node.cjs",
    "^@mswjs/interceptors$": "<rootDir>/node_modules/@mswjs/interceptors/lib/node/index.cjs",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
  ],
  // MSW needs special handling for ESM modules
  transformIgnorePatterns: [
    "/node_modules/(?!(msw|@bundled-es-modules)/)",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
