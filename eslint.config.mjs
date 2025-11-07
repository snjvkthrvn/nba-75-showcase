import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import nextPlugin from "@next/eslint-plugin-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tsFileGlobs = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"]; 

const typeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: config.files ?? tsFileGlobs,
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...(config.languageOptions?.parserOptions ?? {}),
      project: path.join(__dirname, "tsconfig.json"),
      tsconfigRootDir: __dirname,
    },
  },
}));

const stylisticConfig = tseslint.configs.stylisticTypeChecked[2];
const enrichedStylisticConfig = {
  ...stylisticConfig,
  files: stylisticConfig.files ?? tsFileGlobs,
  languageOptions: {
    ...stylisticConfig.languageOptions,
    parserOptions: {
      ...(stylisticConfig.languageOptions?.parserOptions ?? {}),
      project: path.join(__dirname, "tsconfig.json"),
      tsconfigRootDir: __dirname,
    },
  },
};

export default [
  {
    ignores: ["node_modules", ".next", "dist", "build", "coverage", "public"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
      "@next/next": nextPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          warnOnUnassignedImports: true,
        },
      ],
    },
  },
  ...typeCheckedConfigs,
  enrichedStylisticConfig,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^ignored" },
      ],
    },
  },
];
