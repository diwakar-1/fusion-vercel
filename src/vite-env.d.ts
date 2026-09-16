/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DIWAKAR_CODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
