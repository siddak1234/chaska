import js from "@eslint/js";
import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      // Imported Claude Design artboards — reference material, not app code.
      "design-source/**",
      "next-env.d.ts",
    ],
  },

  js.configs.recommended,
  ...next,
  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    files: ["**/*.{ts,tsx,mts}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // The design has no image host and no <img> anywhere — enforce it.
      "@next/next/no-img-element": "error",
    },
  },

  {
    // Setup scripts are Node programs, not app code.
    files: ["scripts/**/*.{ts,mjs}"],
    rules: {
      "no-console": "off",
    },
  },
);
