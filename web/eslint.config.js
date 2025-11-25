import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "node_modules/",
    "dist/",
    ".eslintrc.js",
    "eslint.config.*",
    "public/js",
  ]),

  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    settings: {
      react: { version: "detect" },
    },
  },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,

  {
    plugins: {
      "unused-imports": unusedImportsPlugin,
      react: reactPlugin,
    },
  },

  prettier,

  {
    rules: {
      "array-callback-return": "warn",
      "class-methods-use-this": "warn",
      "consistent-return": "warn",
      "default-case": "warn",
      "no-extend-native": [
        "error",
        { exceptions: ["Array", "String", "Date"] },
      ],
      "no-underscore-dangle": "warn",
      "prefer-promise-reject-errors": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*"],
              message: "Use @/ instead of relative imports",
            },
          ],
        },
      ],

      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },
]);
