import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // Override a few strict rules to warnings so builds don't fail on non-critical lint issues
  {
    rules: {
      // Allow using any while we incrementally type things
      "@typescript-eslint/no-explicit-any": "warn",
      // Don't fail builds on quotes in text content
      "react/no-unescaped-entities": "off",
      // Treat unused vars as warnings and allow underscore-prefixed intentionally unused vars
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Prefer-const shouldn't fail builds
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
