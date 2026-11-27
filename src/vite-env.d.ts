/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  /** "true" makes the dev server answer the secret and variable routes with mock data. */
  readonly VITE_MOCK_STORE_API?: string;
}
