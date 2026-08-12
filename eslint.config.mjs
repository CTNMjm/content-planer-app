import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "src/generated/**",
    "next-env.d.ts",
  ]),
  {
    extends: [...nextCoreWebVitals],
  },
  {
    // Neue react-hooks-v6-Regeln: bestehende Muster (Fetch-in-Effect,
    // Formular-Init, lokale Pagination-Komponenten) erst mal als Warnung,
    // Refactoring ist als eigener Schritt geplant.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
    },
  },
]);
