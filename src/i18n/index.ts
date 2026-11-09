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
