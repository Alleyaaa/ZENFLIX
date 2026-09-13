import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore the ES modules script (we'll use CommonJS for now)
    "scripts/scrape-movies.js",
    // Ignore service worker (plain browser JS, not a module)
    "public/sw.js",
  ]),
  {
    // Disable react-hooks/set-state-in-effect for this project
    // The code works fine with synchronous setState in some useEffect hooks
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;