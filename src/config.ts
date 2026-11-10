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

/**
 * Instagram-Feed in der Sektion «Unterwegs» (siehe CLAUDE.md, Abschnitt Technik).
 * INSTAGRAM_FEED_URL: öffentlicher JSON-Feed von Behold. Wird nur vom Skript
 * scripts/instagram-aktualisieren.mjs gelesen, nie von der Website selbst.
 */
export const INSTAGRAM_FEED_URL = 'https://feeds.behold.so/C9qcvHSJvE77P3SS85GS';

/**
 * INSTAGRAM_AUSBLENDEN: IDs von Instagram-Beiträgen, die nicht auf der Website erscheinen sollen,
 * z. B. ['18012345678901234']. Die ID steht in src/data/instagram.json (Feld id).
 * Nach der Änderung den Workflow «Instagram aktualisieren» manuell starten (siehe README).
 */
export const INSTAGRAM_AUSBLENDEN: string[] = [];
