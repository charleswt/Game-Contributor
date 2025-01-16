/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_CLOUD_NAME: string
    readonly VITE_CLOUD_API_KEY: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }