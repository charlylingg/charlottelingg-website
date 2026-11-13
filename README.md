# Website Charlotte Lingg

Quellcode der Website [charlottelingg.com](https://charlottelingg.com) – Charlotte Lingg, Ski Alpin, Liechtenstein. Deutsch unter `/`, Französisch unter `/fr/`.

Gebaut mit [Astro](https://astro.build) als statische Website. Keine Datenbank, keine Tracker, keine externen Skripte.

## Wie Änderungen laufen

1. **Auftrag an Claude Code** – in normaler Sprache beschreiben, was sich ändern soll.
2. **Pull Request** – Claude Code macht die Änderung auf einem eigenen Branch und eröffnet einen Pull Request auf GitHub.
3. **Vorschau** – Cloudflare erstellt zu jedem Branch und Pull Request automatisch eine Vorschau-Adresse. Dort prüfen, auf Laptop und Handy.
4. **Merge** – passt alles, wird der Pull Request von euch gemergt. Danach ist die Änderung live.

Claude Code mergt nie selbst.

## Wo Inhalte liegen

| Was | Ort |
|-----|-----|
| Texte der Sektionen (DE / FR) | `src/content/texte/de/` und `src/content/texte/fr/` |
| Resultate | `src/content/resultate/` (eine Datei pro Rennen, FIS-Link ist Pflicht) |
| Rennkalender | `src/content/rennen/` (eine Datei pro Rennen, Ordner pro Saison) |
| Blogbeiträge | `src/content/blog/de/` und `src/content/blog/fr/` (eigene Seite `/blog/<dateiname>`) |
| Partner | `src/content/partner/`, Logos in `public/partner/` |
| Bilder | Dateien in `public/bilder/`, Angaben (Alt-Text, Fotograf, Lizenz) in `src/content/bilder/`, jedes Bild mit Eintrag in `LIZENZEN.md` |
| Feste Wörter (Navigation, Buttons) | `src/i18n/de.json` und `src/i18n/fr.json` |
| Farben, Schriften, Abstände | `design/tokens.json` und `src/styles/tokens.css` (Website: Thema «Beere») |
| Bildrechte | `LIZENZEN.md` |
| Instagram-Kacheln | automatisch, siehe «Instagram-Feed» unten |

Einträge mit `beispiel: true` sind Vorlagen und erscheinen nicht auf der Website.

Freigaben: Inhalte mit `freigabe: false` erscheinen nur in einem Build mit `PUBLIC_SHOW_ENTWUERFE=true` (als Entwurf markiert). Übersicht in `FREIGABEN.md`. Bildstellen und gesuchte Bilder: `BILDER.md`. Design-Referenz der Startseite: `design/referenz/startseite.dc.html`.

## Für Entwickler

```bash
nvm use        # Node-Version aus .nvmrc
npm install
npm run dev    # lokale Vorschau
npm run build  # statische Ausgabe nach dist/
npm run check  # Typen und Astro-Dateien prüfen
npm test       # Tests des Kontaktformulars (Worker)
PUBLIC_SHOW_ENTWUERFE=true npm run build  # Build mit Entwürfen (nur für die Vorschau)
```

Hosting: Cloudflare Workers mit statischen Assets (Workers Builds). Konfiguration in `wrangler.jsonc`, Header in `public/_headers`. Produktion ist der Branch `main`.

Lokal mit Worker (Kontaktformular) testen: `npm run build`, dann `npx wrangler dev`. Für einen echten Versand den Resend-Schlüssel in eine Datei `.dev.vars` schreiben (`RESEND_API_KEY=...`). Diese Datei nie committen (steht in `.gitignore`).

## Kontaktformular

Das Formular in der Sektion Kontakt schickt Nachrichten über einen kleinen Worker (`worker/kontakt.ts`, Adresse `/api/kontakt`) und Resend (EU-Region) per E-Mail. Auf der Website wird nichts gespeichert. Anfragen zu «Sponsoring und Partnerschaft» gehen an `sponsoring@charlottelingg.com`, alle anderen an `contact@charlottelingg.com`.

**Empfänger ändern**

1. In `worker/kontakt.ts` die Konstanten `EMPFAENGER_KONTAKT` bzw. `EMPFAENGER_SPONSORING` anpassen (Auftrag an Claude Code genügt).
2. Ändert sich die offizielle Adresse, auch `EMAIL_KONTAKT` in `src/config.ts` sowie Impressum und Datenschutz (`src/content/texte/de|fr/`) nachführen.

**API-Schlüssel erneuern**

1. Bei Resend anmelden, unter «API Keys» einen neuen Schlüssel erstellen (Berechtigung «Sending access» genügt).
2. In Cloudflare: Workers & Pages → charlottelingg → Settings → Variables and Secrets → Secret `RESEND_API_KEY` bearbeiten und den neuen Schlüssel eintragen, speichern.
3. Den alten Schlüssel bei Resend löschen.
4. Auf der Website eine Testnachricht schicken.

## Instagram-Feed

Die sechs Kacheln in der Sektion «Unterwegs» zeigen die neuesten Instagram-Beiträge. Der Workflow «Instagram aktualisieren» (GitHub, Reiter Actions) holt sie zweimal täglich und stellt sie direkt auf `main`. Die Bilder liegen im Repository (`src/assets/instagram/`) und werden von der Website selbst ausgeliefert. Diese Dateien und `src/data/instagram.json` nie von Hand ändern.

**Beitrag ausblenden**

1. ID des Beitrags in `src/data/instagram.json` nachschlagen (Feld `id`, das Feld `permalink` daneben zeigt, welcher Beitrag es ist).
2. Die ID in `src/config.ts` in die Liste `INSTAGRAM_AUSBLENDEN` eintragen, z. B. `['18012345678901234']`, per Pull Request (Auftrag an Claude Code genügt).
3. Nach dem Merge auf GitHub unter Actions den Workflow «Instagram aktualisieren» wählen und mit «Run workflow» manuell starten. Danach erscheint an seiner Stelle der nächste Beitrag.

Von Hand aktualisieren (lokal): `npm run instagram`.

## Go-live-Merkliste

Bis zum Go-live ist die Website für Suchmaschinen gesperrt. Beim Go-live genau diese Stellen ändern:

1. `src/config.ts`: `SITE_INDEXABLE` auf `true` setzen (entfernt `<meta name="robots" content="noindex">`).
2. `public/_headers`: die Zeile `X-Robots-Tag: noindex` löschen.
3. `public/robots.txt`: `Disallow: /` ersetzen durch `Allow: /`.
4. Die Stilprobe löschen: `src/pages/stilprobe.astro`.
5. Datenschutzerklärung: Abschnitt Instagram (Bilder werden von der Website selbst ausgeliefert, keine Daten an Meta beim Seitenaufruf; erst der Klick auf eine Kachel führt zu Instagram).
6. Datenschutzerklärung: Abschnitt Kontaktformular und E-Mail nennt Resend und Proton (erledigt).
