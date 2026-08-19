import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "playwright-report/**",
      "src-tauri/resources/**",
      "src-tauri/target/**",
      "test-results/**",
      "upgrade/**",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
