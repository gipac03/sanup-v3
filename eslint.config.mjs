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
  ]),
  {
    rules: {
      // Testo italiano con apostrofi nei nodi JSX: scelta stilistica, non un bug.
      "react/no-unescaped-entities": "off",
      // Leggere da localStorage dopo il mount richiede setState in effect: e' il
      // pattern corretto per evitare mismatch di hydration in un'app local-first.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
