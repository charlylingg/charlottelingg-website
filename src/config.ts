/**
 * Globale Einstellungen der Website.
 *
 * SITE_INDEXABLE: Solange false, setzt jede Seite <meta name="robots" content="noindex">.
 * Erst beim Go-live auf true stellen (siehe README, «Go-live-Merkliste»).
 */
export const SITE_INDEXABLE = false;

/**
 * SHOW_ENTWUERFE: Inhalte mit freigabe: false werden nur gebaut, wenn die Build-Variable
 * PUBLIC_SHOW_ENTWUERFE den Wert true hat (z. B. PUBLIC_SHOW_ENTWUERFE=true npm run build).
 * Fehlt die Variable oder hat sie einen anderen Wert, erscheinen Entwürfe nicht.
 * Für die Produktion (Branch main) nie setzen.
 */
export const SHOW_ENTWUERFE = import.meta.env.PUBLIC_SHOW_ENTWUERFE === 'true';
