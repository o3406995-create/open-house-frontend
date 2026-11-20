/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  setupFiles: ["<rootDir>/jest.polyfills.cjs"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "babel-jest",
      {
        babelrc: false,
        configFile: false,
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript",
        ],
        // Turns import.meta.env.X into process.env.X, which Jest can run
        plugins: ["babel-plugin-transform-vite-meta-env"],
      },
    ],
  },
  moduleNameMapper: {
    "\\.(css|svg|png|jpe?g|gif|webp|woff2?)$": "<rootDir>/jest.fileMock.cjs",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  resetMocks: true,
}
