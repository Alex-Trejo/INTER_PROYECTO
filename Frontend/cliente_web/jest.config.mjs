import nextJest from "next/jest.js";

// next/jest carga automaticamente next.config.ts, los alias de tsconfig
// (@/...) y las variables de .env.local, para que las pruebas vean lo mismo
// que la aplicacion real.
const crearConfigJest = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};

export default crearConfigJest(config);
