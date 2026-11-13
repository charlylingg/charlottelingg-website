# Lizenzen und Bildrechte

Jedes Bild, Logo und jede fremde Datei auf der Website braucht hier einen Eintrag, **bevor** sie veröffentlicht wird.

> **Achtung**
> - Das imago-Bild **Weltcup Lech 2021** darf **nie** verwendet werden.
> - Shooting **Stefanie Frei**: Nutzungsrechte für die Website erteilt, bestätigt am 10.11.2026 (siehe Fotos). Bildnachweis am Bild.
> - Fotos **Marco Büchel** (Sölden, 23.10.2026): Lizenz geklärt, bestätigt durch Michel Gurnari am 13.11.2026. Bildnachweis am Bild.

## Fotos

| Datei | Fotograf/Quelle | Lizenz/Einwilligung | gültig bis | Bemerkung |
|-------|-----------------|---------------------|------------|-----------|
| `public/bilder/hero-soelden-2026.webp`, `public/bilder/hero-soelden-2026.jpg` | Giovanni Maria Pizzato | Kommerzielle Lizenz vorhanden, Fotograf Giovanni Maria Pizzato, bestätigt durch Michel Gurnari am 10.11.2026 | – | Hero, Weltcup-Riesenslalom Sölden, 24.10.2026. Eintrag `src/content/bilder/hero-soelden-2026.yaml` mit `lizenz_geklaert: true`. |
| `public/bilder/og-charlotte-lingg.jpg` | Giovanni Maria Pizzato | Kommerzielle Lizenz vorhanden, Fotograf Giovanni Maria Pizzato, bestätigt durch Michel Gurnari am 10.11.2026 | – | Vorschaubild beim Teilen (Open Graph, Twitter Card), DE und FR. Eintrag `src/content/bilder/og-charlotte-lingg.yaml` mit `lizenz_geklaert: true`. |
| `public/bilder/portrait-charlotte-lingg.webp`, `public/bilder/portrait-charlotte-lingg.jpg` | Stefanie Frei | Stefanie Frei: Nutzungsrechte für die Website erteilt, bestätigt am 10.11.2026. Bildnachweis am Bild. | – | Sektion 01 Portrait, Aufnahme 28.10.2024. Derzeit nicht im Einsatz (ersetzt durch das Portrait von Marco Büchel; Fallback, solange Lizenz Büchel offen). Eintrag `src/content/bilder/portrait-charlotte-lingg.yaml` mit `lizenz_geklaert: true`. |
| `public/bilder/blog-zurueck-im-weltcup.webp`, `public/bilder/blog-zurueck-im-weltcup.jpg` | Stefanie Frei | Stefanie Frei: Nutzungsrechte für die Website erteilt, bestätigt am 10.11.2026. Bildnachweis am Bild. | – | Blog «Zurück im Weltcup», Aufnahme 28.10.2024. Derzeit nicht im Einsatz (ersetzt durch das Bild von Marco Büchel; Fallback, solange Lizenz Büchel offen). Eintrag `src/content/bilder/blog-zurueck-im-weltcup.yaml` mit `lizenz_geklaert: true`. |
| `public/bilder/portrait-charlotte-lingg-soelden.webp`, `public/bilder/portrait-charlotte-lingg-soelden.jpg` | Marco Büchel | Lizenz geklärt, Fotograf Marco Büchel, bestätigt durch Michel Gurnari am 13.11.2026. Bildnachweis am Bild. | – | Sektion 01 Portrait, Training Sölden, Aufnahme 23.10.2026. Eintrag `src/content/bilder/portrait-charlotte-lingg-soelden.yaml` mit `lizenz_geklaert: true`. |
| `public/bilder/blog-zurueck-im-weltcup-soelden.webp`, `public/bilder/blog-zurueck-im-weltcup-soelden.jpg` | Marco Büchel | Lizenz geklärt, Fotograf Marco Büchel, bestätigt durch Michel Gurnari am 13.11.2026. Bildnachweis am Bild. | – | Blog «Zurück im Weltcup» (Vorschau und Beitragsseite, DE und FR), Sölden, Aufnahme 23.10.2026. Eintrag `src/content/bilder/blog-zurueck-im-weltcup-soelden.yaml` mit `lizenz_geklaert: true`. |

Bilder mit `lizenz_geklaert: false` (in `src/content/bilder/`) werden nur in einem Build mit `PUBLIC_SHOW_ENTWUERFE=true` gezeigt. Sonst bleibt der Platzhalter, und die Datei wird nicht ausgeliefert. Sobald der Fotograf die Nutzung bestätigt: hier Lizenz und Datum eintragen und `lizenz_geklaert: true` setzen.

## Partnerlogos

Die Logos werden mit Zustimmung der Partner im Rahmen der Partnerschaft gezeigt. Dateien in `public/partner/`.

| Datei | Partner | Quelle | Bemerkung |
|-------|---------|--------|-----------|
| `lgt.svg` | LGT | offizielle Website des Partners, 10.11.2026 | |
| `kaiser.png` | Kaiser AG | offizielle Website des Partners, 10.11.2026 | Nur 238 × 52 px, Vektordatei von Kaiser angefragt |
| `mbpi.png` | MBPI | vom Partner geliefert | |
| `loc.png` | Liechtenstein Olympic Committee | offizielle Website des Partners, 10.11.2026 | |
| `ziener.png` | Ziener | offizielle Website des Partners, 10.11.2026 | |
| `leki.svg` | Leki | offizielle Website des Partners, 10.11.2026 | |
| `adler-hitta.svg` | Adler Hitta | vom Partner geliefert | |
| `chez-vrony.svg` | Chez Vrony | vom Partner geliefert | |
| `tc-zermatt.svg` | Tennisclub Zermatt | vom Partner geliefert | |
| `hotel-albana-real.svg` | Hotel Albana Real | vom Partner geliefert | |
| `head.svg` | Head | vom Partner geliefert (Vektordatei), 10.11.2026 | |
| `monnier-immo.svg` | Monnier Immo | vom Partner geliefert (Bilddatei, als Vektor nachgezeichnet), 13.11.2026 | |

## Instagram

Die Bilder in `src/assets/instagram/` (Kacheln in der Sektion «Unterwegs») stammen aus Charlottes eigenem Instagram-Konto @charlotte_lingg und werden automatisch übernommen (siehe README, «Instagram-Feed»).

- Eigene Bilder von Charlotte: Nutzung auf der Website durch Charlotte abgedeckt.
- Fotos von Dritten (im Beitrag mit 📸 genannt): nur, wenn die Nutzung auf der Website mitabgedeckt ist. Sonst den Beitrag ausblenden (ID in `INSTAGRAM_AUSBLENDEN` in `src/config.ts`).

## Schriften

Die Schriften Barlow und Barlow Condensed (Jeremy Tribby) stehen unter der SIL Open Font License 1.1 und werden lokal ausgeliefert (über Fontsource, keine Verbindung zu Google).
