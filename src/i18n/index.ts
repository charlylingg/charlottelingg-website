import de from './de.json';
import fr from './fr.json';

export const locales = ['de', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

/** Deutsch ist die Referenz: jeder Schlüssel muss auch in fr.json stehen. */
export type UiKey = keyof typeof de;

const dictionaries: Record<Locale, Record<UiKey, string>> = {
  de,
  fr: fr satisfies Record<UiKey, string>,
};

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

/** Liefert die Sprache aus Astro.currentLocale, sonst Deutsch. */
export function getLocale(current: string | undefined): Locale {
  return isLocale(current) ? current : defaultLocale;
}

/** Fester Oberflächentext in der gewünschten Sprache. */
export function t(locale: Locale, key: UiKey): string {
  return dictionaries[locale][key] ?? dictionaries[defaultLocale][key];
}

/** Text mit Platzhaltern: t(locale, 'rennen.weitere', { n: 11 }) -> «Alle 11 weiteren Rennen» */
export function tf(locale: Locale, key: UiKey, werte: Record<string, string | number>): string {
  return t(locale, key).replace(/\{(\w+)\}/g, (_, name: string) => String(werte[name] ?? `{${name}}`));
}

/**
 * Text zu einem zusammengesetzten Schlüssel, z. B. `land.${code}`.
 * Fehlt der Schlüssel, kommt der Ersatzwert zurück (z. B. der Ländercode selbst).
 */
export function tSchluessel(locale: Locale, key: string, ersatz: string): string {
  const dict = dictionaries[locale] as Record<string, string>;
  const ref = dictionaries[defaultLocale] as Record<string, string>;
  return dict[key] ?? ref[key] ?? ersatz;
}

/** Gibt eine Funktion zurück, die an eine Sprache gebunden ist: const tr = useT('fr'); tr('nav.home') */
export function useT(locale: Locale) {
  return (key: UiKey) => t(locale, key);
}

/** Entfernt das Sprachpräfix: /fr/resultate/ -> /resultate/ */
export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(fr)(\/|$)/);
  return match ? pathname.slice(match[1].length + 1) || '/' : pathname;
}

/** Pfad in einer bestimmten Sprache: localizePath('/resultate/', 'fr') -> /fr/resultate/ */
export function localizePath(pathname: string, locale: Locale): string {
  const base = stripLocale(pathname);
  if (locale === defaultLocale) return base;
  return base === '/' ? `/${locale}/` : `/${locale}${base}`;
}
