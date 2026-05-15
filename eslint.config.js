import js from "@eslint/js";

export default [
  // Reglas recomendadas para JavaScript moderno
  js.configs.recommended,

  {
    // Solo analiza archivos JS del proyecto (excluye node_modules, dist, etc.)
    files: ["src/**/*.js"],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
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
      },
    },

    rules: {
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
    },
  },
];
