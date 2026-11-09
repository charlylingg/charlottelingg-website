/** Formatierung von Daten für die Anzeige (Schweizer Schreibweise TT.MM.JJJJ). */
import { tSchluessel, t, type Locale } from '../i18n';

const zweistellig = (n: number) => String(n).padStart(2, '0');

/** Daten aus YAML sind Mitternacht UTC: immer in UTC lesen, damit sich der Tag nicht verschiebt. */
const teile = (d: Date) => ({ tag: d.getUTCDate(), monat: d.getUTCMonth() + 1, jahr: d.getUTCFullYear() });

/** 14.11.2026 */
export function datum(d: Date): string {
  const { tag, monat, jahr } = teile(d);
  return `${zweistellig(tag)}.${zweistellig(monat)}.${jahr}`;
}

/** 14.–15.11.2026 · 30.11.–01.12.2026 · 28.12.2026–02.01.2027 · 22.12.2026 */
export function datumsbereich(von: Date, bis?: Date): string {
  if (!bis || bis.getTime() === von.getTime()) return datum(von);
  const a = teile(von);
  const b = teile(bis);
  if (a.jahr !== b.jahr) return `${datum(von)}–${datum(bis)}`;
  if (a.monat !== b.monat) return `${zweistellig(a.tag)}.${zweistellig(a.monat)}.–${datum(bis)}`;
  return `${zweistellig(a.tag)}.–${datum(bis)}`;
}

/** Monat und Jahr ausgeschrieben, z. B. «Oktober 2026» / «octobre 2026» */
export function monatJahr(jahr: number, monat: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CH' : 'de-CH', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(jahr, monat - 1, 1)));
}

/** Datum eines Blogbeitrags: "2026-10" -> «Oktober 2026», Date -> «24.10.2026», Platzhalter -> undefined */
export function blogDatum(wert: string | Date, locale: Locale): string | undefined {
  if (wert instanceof Date) return datum(wert);
  const monat = wert.match(/^(\d{4})-(\d{2})$/);
  return monat ? monatJahr(Number(monat[1]), Number(monat[2]), locale) : undefined;
}

/** Ländername aus dem ISO-Alpha-3-Code; Platzhalter ergeben undefined */
export function landName(code: string, locale: Locale): string | undefined {
  if (code.startsWith('[')) return undefined;
  return tSchluessel(locale, `land.${code}`, code);
}

/** Rennen-Kürzel: [Slalom, Slalom] -> «2× SL», [Riesenslalom, Slalom] -> «RS, SL», finale -> «Finale» */
export function rennenKuerzel(disziplinen: string[], finale: boolean, locale: Locale): string {
  if (finale) return t(locale, 'rennen.finale');
  const kurz = (d: string) => tSchluessel(locale, `disziplin_kurz.${d}`, d);
  const verschiedene = [...new Set(disziplinen)];
  if (verschiedene.length === 1 && disziplinen.length > 1) return `${disziplinen.length}× ${kurz(verschiedene[0])}`;
  return disziplinen.map(kurz).join(', ');
}
