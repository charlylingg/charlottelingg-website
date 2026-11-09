/** Build-Variablen der Website (siehe src/config.ts). */
interface ImportMetaEnv {
  /** "true" = Inhalte mit freigabe: false werden mitgebaut und als Entwurf markiert. */
  readonly PUBLIC_SHOW_ENTWUERFE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
