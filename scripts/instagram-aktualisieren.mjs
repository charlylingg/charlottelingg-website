#!/usr/bin/env node
/**
 * Instagram-Feed aktualisieren: npm run instagram
 *
 * Holt die neuesten Beiträge von @charlotte_lingg aus dem Behold-JSON-Feed (INSTAGRAM_FEED_URL in
 * src/config.ts), lädt die Vorschaubilder nach src/assets/instagram/<id>.jpg und schreibt
 * src/data/instagram.json. Die Website liefert die Bilder danach selbst aus: Besucher laden nichts
 * von Instagram, Meta oder Behold.
 *
 * - Beiträge, deren id in INSTAGRAM_AUSBLENDEN (src/config.ts) steht, werden übersprungen.
 * - Gespeichert werden nur id, Link, Datum, Typ und Bildmasse. Keine Bildunterschriften, Likes,
 *   Followerzahlen oder Erwähnungen.
 * - Bei jedem Fehler (Feed nicht erreichbar, kein gültiges JSON, kein Beitrag, Download gescheitert)
 *   endet das Skript mit Fehlercode 1 und verändert nichts.
 * - Haben sich die Beiträge nicht geändert, bleibt alles, wie es ist (kein leerer Commit).
 *
 * Reines Node 22 ohne Abhängigkeiten. Läuft nie beim Build, nur von Hand oder im Workflow
 * .github/workflows/instagram.yml.
 */
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, copyFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ANZAHL = 6;
const ZEITLIMIT_MS = 30_000;
const MAX_BILDGROESSE = 15 * 1024 * 1024;
const TYPEN = new Set(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']);

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = join(wurzel, 'src/config.ts');
const BILDER_ORDNER = join(wurzel, 'src/assets/instagram');
const DATEN = join(wurzel, 'src/data/instagram.json');

class Abbruch extends Error {}
const abbrechen = (meldung) => {
  throw new Abbruch(meldung);
};

/**
 * Einstellungen aus src/config.ts lesen. Die Datei ist TypeScript und nutzt import.meta.env,
 * darum wird sie hier als Text gelesen statt importiert.
 */
function einstellungenLesen() {
  const quelltext = readFileSync(CONFIG, 'utf8');
  const url = quelltext.match(/export\s+const\s+INSTAGRAM_FEED_URL\s*=\s*['"]([^'"]+)['"]/)?.[1];
  if (!url || !url.startsWith('https://')) abbrechen('INSTAGRAM_FEED_URL fehlt in src/config.ts oder ist keine https-Adresse.');
  const liste = quelltext.match(/export\s+const\s+INSTAGRAM_AUSBLENDEN\b[^=]*=\s*\[([^\]]*)\]/);
  if (!liste) abbrechen('INSTAGRAM_AUSBLENDEN fehlt in src/config.ts.');
  // Kommentare in der Liste ignorieren, dann alle Zeichenketten einsammeln
  const ohneKommentare = liste[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const ausblenden = new Set([...ohneKommentare.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1].trim()));
  return { url, ausblenden };
}

async function holen(url) {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(ZEITLIMIT_MS), headers: { 'User-Agent': 'charlottelingg-website' } });
  } catch (fehler) {
    const grund = fehler.cause?.message ?? fehler.cause;
    abbrechen(`${url} nicht erreichbar: ${fehler.message}${grund ? ` (${grund})` : ''}`);
  }
}

/** Datum des Beitrags in Schweizer Zeit als YYYY-MM-DD */
function datumZuerich(zeitstempel) {
  const d = new Date(zeitstempel);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Einen Beitrag aus dem Feed prüfen und auf die gespeicherten Felder reduzieren. */
function beitragAuswerten(post, index) {
  const wo = `Beitrag ${index + 1} im Feed`;
  if (!post || typeof post !== 'object') abbrechen(`${wo}: kein Objekt.`);
  const { id, permalink, timestamp, mediaType } = post;
  // Die id wird zum Dateinamen: nur Ziffern, Buchstaben, - und _
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) abbrechen(`${wo}: ungültige id.`);
  if (typeof permalink !== 'string' || !/^https:\/\/(www\.)?instagram\.com\//.test(permalink)) abbrechen(`${wo} (${id}): ungültiger permalink.`);
  const datum = datumZuerich(timestamp);
  if (!datum) abbrechen(`${wo} (${id}): ungültiger timestamp.`);
  if (!TYPEN.has(mediaType)) abbrechen(`${wo} (${id}): unbekannter mediaType «${mediaType}».`);
  // Immer sizes.medium (stabile Adressen von Behold), nie mediaUrl (cdninstagram.com, läuft ab)
  const medium = post.sizes?.medium;
  const bildUrl = medium?.mediaUrl;
  if (typeof bildUrl !== 'string' || !bildUrl.startsWith('https://')) abbrechen(`${wo} (${id}): sizes.medium.mediaUrl fehlt.`);
  if (/cdninstagram\.com|fbcdn\.net/.test(new URL(bildUrl).hostname)) abbrechen(`${wo} (${id}): sizes.medium.mediaUrl zeigt auf Instagram statt auf Behold.`);
  const breite = medium.width;
  const hoehe = medium.height;
  if (!Number.isInteger(breite) || breite <= 0 || !Number.isInteger(hoehe) || hoehe <= 0) abbrechen(`${wo} (${id}): sizes.medium.width/height fehlen.`);
  return { beitrag: { id, permalink, datum, typ: mediaType, bild: `${id}.jpg`, breite, hoehe }, bildUrl };
}

async function bildLaden(url, ziel) {
  const antwort = await holen(url);
  if (!antwort.ok) abbrechen(`Download fehlgeschlagen (${antwort.status}): ${url}`);
  const daten = Buffer.from(await antwort.arrayBuffer());
  if (daten.length === 0 || daten.length > MAX_BILDGROESSE) abbrechen(`Download ungültig (${daten.length} Bytes): ${url}`);
  // JPEG beginnt mit FF D8 FF
  if (daten[0] !== 0xff || daten[1] !== 0xd8 || daten[2] !== 0xff) abbrechen(`Download ist kein JPEG-Bild: ${url}`);
  writeFileSync(ziel, daten);
}

function bisherigeBeitraege() {
  try {
    const daten = JSON.parse(readFileSync(DATEN, 'utf8'));
    return Array.isArray(daten?.beitraege) ? daten.beitraege : [];
  } catch {
    return [];
  }
}

const vorhandeneBilder = () => (existsSync(BILDER_ORDNER) ? readdirSync(BILDER_ORDNER).filter((n) => !n.startsWith('.')) : []);

async function main() {
  const { url, ausblenden } = einstellungenLesen();

  // 1. Feed holen und prüfen
  const antwort = await holen(url);
  if (!antwort.ok) abbrechen(`Feed antwortet mit Status ${antwort.status}.`);
  let feed;
  try {
    feed = JSON.parse(await antwort.text());
  } catch {
    abbrechen('Feed liefert kein gültiges JSON.');
  }
  if (!Array.isArray(feed?.posts)) abbrechen('Feed enthält keine Liste «posts».');

  const auswahl = feed.posts
    .filter((post) => !ausblenden.has(String(post?.id)))
    .slice(0, ANZAHL)
    .map(beitragAuswerten);
  if (auswahl.length < 1) abbrechen('Feed enthält keinen Beitrag.');
  if (new Set(auswahl.map((a) => a.beitrag.id)).size !== auswahl.length) abbrechen('Feed enthält doppelte ids.');
  const beitraege = auswahl.map((a) => a.beitrag);

  // 2. Geändert? Nur dann etwas schreiben
  const bilder = vorhandeneBilder();
  const sollBilder = new Set(beitraege.map((b) => b.bild));
  const gleich =
    JSON.stringify(bisherigeBeitraege()) === JSON.stringify(beitraege) &&
    bilder.length === sollBilder.size &&
    bilder.every((n) => sollBilder.has(n));
  if (gleich) {
    console.log(`Keine Änderung: ${beitraege.length} Beiträge wie bisher.`);
    return;
  }

  // 3. Fehlende Bilder zuerst in ein temporäres Verzeichnis laden und prüfen
  const temp = mkdtempSync(join(tmpdir(), 'instagram-'));
  try {
    const neu = auswahl.filter((a) => !bilder.includes(a.beitrag.bild));
    for (const { beitrag, bildUrl } of neu) {
      await bildLaden(bildUrl, join(temp, beitrag.bild));
      console.log(`Geladen: ${beitrag.bild}`);
    }

    // 4. Austauschen: neue Bilder hinein, dann JSON, dann veraltete Bilder löschen
    mkdirSync(BILDER_ORDNER, { recursive: true });
    mkdirSync(dirname(DATEN), { recursive: true });
    for (const { beitrag } of neu) copyFileSync(join(temp, beitrag.bild), join(BILDER_ORDNER, beitrag.bild));
    const inhalt = { aktualisiert: new Date().toISOString(), beitraege };
    const datenTemp = `${DATEN}.tmp`;
    writeFileSync(datenTemp, `${JSON.stringify(inhalt, null, 2)}\n`);
    renameSync(datenTemp, DATEN);
    for (const name of bilder) {
      if (!sollBilder.has(name)) {
        rmSync(join(BILDER_ORDNER, name), { force: true });
        console.log(`Gelöscht: ${name}`);
      }
    }
    console.log(`Aktualisiert: ${beitraege.length} Beiträge (neu geladene Bilder: ${neu.length}).`);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

main().catch((fehler) => {
  console.error(`Instagram-Feed nicht aktualisiert: ${fehler instanceof Abbruch ? fehler.message : fehler.stack ?? fehler}`);
  console.error('Es wurde nichts verändert. Die bisherigen Bilder bleiben.');
  process.exit(1);
});
