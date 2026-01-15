const { dirname } = require("path");
const { fileURLToPath } = require("url");

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      "tmp/**",
      "webhook-server.js",
      "*.js",
      "!next.config.js"
    ]
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "react/no-unescaped-entities": "warn"
    }
  }
];

module.exports = config;
