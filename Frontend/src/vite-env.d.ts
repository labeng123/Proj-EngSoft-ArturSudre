/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GESTAO_API_URL: string;
  readonly VITE_INGESTAO_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
