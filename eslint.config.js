import js from "@eslint/js";
import tseslint from "typescript-eslint";

const browserGlobals = {
  // Variables globales del navegador (window, document, console, etc.)
  window: "readonly",
  document: "readonly",
  console: "readonly",
  navigator: "readonly",
  localStorage: "readonly",
  indexedDB: "readonly",
  fetch: "readonly",
  URL: "readonly",
  Blob: "readonly",
  FileReader: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  CustomEvent: "readonly",
  MutationObserver: "readonly",
  alert: "readonly",
  confirm: "readonly",
  crypto: "readonly",
};

const qualityRules = {
  // === Errores críticos ===
  "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // Variables no usadas → advertencia
  "no-undef": "error",       // Variables no definidas → error
  "no-console": "off",       // Permitir console.log (útil en desarrollo)

  // === Buenas prácticas ===
  "prefer-const": "warn",    // Preferir const sobre let cuando la variable no cambia
  "no-var": "warn",          // Evitar el uso de var (obsoleto)
  "eqeqeq": ["warn", "always"], // Usar === en lugar de ==

  // === Calidad de código ===
  "no-duplicate-imports": "error", // No importar el mismo módulo dos veces
  "max-lines": ["warn", { "max": 300, "skipBlankLines": true, "skipComments": true }],
  "max-depth": ["warn", 4],        // Anidacion maxima de 4 niveles
  "complexity": ["warn", 15],      // Complejidad ciclomatica maxima
};

const tsRecommendedRules = {
  ...tseslint.configs.recommended[1].rules,
  ...tseslint.configs.recommended[2].rules,
};

export default [
  {
    // Solo analiza archivos JS del proyecto (excluye node_modules, dist, etc.)
    files: ["src/**/*.js"],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: browserGlobals,
    },

    rules: {
      ...js.configs.recommended.rules,
      ...qualityRules,
    },
  },

  {
    // TypeScript gradual: mismas reglas de calidad, parser TS y reglas recomendadas no type-aware.
    files: ["src/**/*.ts"],

    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,
      sourceType: "module",
      globals: browserGlobals,
    },

    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },

    rules: {
      ...js.configs.recommended.rules,
      ...tsRecommendedRules,
      ...qualityRules,
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
