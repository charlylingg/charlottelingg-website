# Website Charlotte Lingg

Quellcode der Website [charlottelingg.com](https://charlottelingg.com) – Charlotte Lingg, Ski Alpin, Liechtenstein. Deutsch unter `/`, Französisch unter `/fr/`.

Gebaut mit [Astro](https://astro.build) als statische Website. Keine Datenbank, keine Tracker, keine externen Skripte.

## Wie Änderungen laufen

1. **Auftrag an Claude Code** – in normaler Sprache beschreiben, was sich ändern soll.
2. **Pull Request** – Claude Code macht die Änderung auf einem eigenen Branch und eröffnet einen Pull Request auf GitHub.
3. **Vorschau** – zum Pull Request gibt es eine Vorschau-Adresse. Dort prüfen, auf Laptop und Handy.
4. **Merge** – passt alles, wird der Pull Request von euch gemergt. Danach ist die Änderung live.

Claude Code mergt nie selbst.

## Wo Inhalte liegen

| Was | Ort |
|-----|-----|
| Texte der Sektionen (DE / FR) | `src/content/texte/de/` und `src/content/texte/fr/` |
| Resultate | `src/content/resultate/` (eine Datei pro Rennen, FIS-Link ist Pflicht) |
| Rennkalender | `src/content/rennen/` |
| Partner | `src/content/partner/`, Logos in `public/partner/` |
| Feste Wörter (Navigation, Buttons) | `src/i18n/de.json` und `src/i18n/fr.json` |
| Farben, Schriften, Abstände | `design/tokens.json` und `src/styles/tokens.css` |
| Bildrechte | `LIZENZEN.md` |

Einträge mit `beispiel: true` sind Vorlagen und erscheinen nicht auf der Website.

## Für Entwickler

```bash
nvm use        # Node-Version aus .nvmrc
npm install
npm run dev    # lokale Vorschau
npm run build  # statische Ausgabe nach dist/
npm run check  # Typen und Astro-Dateien prüfen
```

Hosting: `netlify.toml` (Netlify) bzw. `public/_headers` (Cloudflare Pages). Sonst ist nichts hosting-spezifisch.
