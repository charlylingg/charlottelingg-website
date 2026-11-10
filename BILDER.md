# Bildstellen

Liste aller Bildstellen aus dem Design (`design/referenz/startseite.dc.html`). Bis die Bilder ausgewählt sind, steht auf der Website an jeder Stelle ein Platzhalter mit dem richtigen Seitenverhältnis, z. B. «[BILD: Hero, Querformat 3:2]».

Regeln (CLAUDE.md): Jedes Bild braucht vorher einen Eintrag in `LIZENZEN.md`. Format WebP, längste Seite max. 1600 px auf der Website. Alt-Text auf Deutsch und Französisch. Das imago-Bild Weltcup Lech 2021 nie verwenden. Shooting Stefanie Frei (12.2024) erst nach eingetragener Einwilligung.

«Mindestgrösse» = so gross muss das gelieferte Bild mindestens sein (längste Seite 1600 px, das ist zugleich das Maximum auf der Website).

## Fotos

| Nr. | Sektion | Format | Mindestgrösse | Was zu sehen sein soll | Alt-Text DE (aus dem Design) | Alt-Text FR (Vorschlag) |
|-----|---------|--------|---------------|------------------------|------------------------------|-------------------------|
| 1 | Hero (ganz oben) | Querformat 3:2; auf dem Laptop breiter zugeschnitten (ca. 19:10, volle Breite, 760 px hoch) | 1600 × 1067 px | Charlotte im Riesenslalom in Sölden, in Aktion. Motiv eher links und oben: Rechts unten liegt auf dem Laptop das dunkle Textfeld darüber. Im Design ist der Bildausschnitt bei ca. 40 % von links und 32 % von oben. | Charlotte Lingg im Riesenslalom in Sölden | Charlotte Lingg en slalom géant à Sölden |
| 2 | 01 Portrait | Hochformat 3:4 | 1200 × 1600 px | Porträt von Charlotte, Gesicht im oberen Drittel (Ausschnitt bei ca. 20 % von oben). Links unten wird das Bild schräg angeschnitten (Schnittkante). | Porträt Charlotte Lingg | Portrait de Charlotte Lingg |
| 3 | Blog «Zurück im Weltcup» (Vorschau und Beitragsseite) | Querformat 16:10 | 1600 × 1000 px | Saisonstart Sölden, Oktober 2026: Charlotte am Start oder im Rennen. | im Design ohne Alt-Text (schmückend) | – |
| 4 | Blog «Drei Kreuzbandrisse, drei Comebacks» | Querformat 16:10 | 1600 × 1000 px | Im Design dasselbe Porträt wie Nr. 2. Ruhiges, persönliches Bild; keine Bilder von Verletzung oder Spital. Beitrag ist noch nicht freigegeben. | im Design ohne Alt-Text (schmückend) | – |
| 5 | Blog «Qualität statt Quantität» | Querformat 16:10 | – | Im Design kein Foto, sondern eine Grafik mit zwei Torflaggen (bereits umgesetzt). Später optional ein Trainingsbild. | – | – |

**Stand Hero (Nr. 1):** Bild geliefert: `hero-soelden-2026.webp` / `.jpg` (1600 × 1067 px), Weltcup-Riesenslalom Sölden, 24.10.2026, Fotograf Giovanni Maria Pizzato. Kommerzielle Lizenz vorhanden, bestätigt durch Michel Gurnari am 10.11.2026 (`lizenz_geklaert: true` in `src/content/bilder/hero-soelden-2026.yaml`): Das Bild erscheint auf der Website. Alt-Text DE: «Charlotte Lingg im Riesenslalom beim Weltcup in Sölden 2026», FR: «Charlotte Lingg en slalom géant lors de la Coupe du monde de Sölden 2026». Bildausschnitt bis 1099 px Breite 60 % / 45 % (`ausschnitt`, Charlotte und Tor bleiben auf dem Handy sichtbar). Ab 1100 px liegt das Bild nicht mehr hinter dem Textfeld: Es füllt den Bereich links davon, das Textfeld steht rechts mit schräger linker Kante (-12°). Ausschnitt dort 62 % / 45 % (`ausschnitt_breit`); zwischen 1100 und etwa 1370 px wird das Bild automatisch etwas weiter nach links geschoben, damit Charlotte ganz sichtbar bleibt (das Tor ist dort links angeschnitten). Bildnachweis «Foto: Giovanni Maria Pizzato» unten links im Bild.

So kommt ein Bild auf die Website: Datei in `public/bilder/` ablegen, in `src/content/bilder/` einen Eintrag anlegen (`datei`, `alt_de`, `alt_fr`, `fotograf`, `lizenz_geklaert`) und in `LIZENZEN.md` vermerken. Mit `lizenz_geklaert: false` erscheint das Bild nur in der Vorschau mit Entwürfen.

Kein Bild nötig für: die sechs Kacheln bei «Unterwegs» (im Design Flächen mit Instagram-Zeichen, kein eingebetteter Feed).

## Partnerlogos

Logos in Originalfarben auf weissem Grund, ohne Filter. Pro Kategorie einheitliche optische Grösse (Breitformate niedriger, Hochformate höher), Kopfsponsoren etwas grösser. Fehlt die Logodatei, steht ein Platzhalter mit dem Partnernamen. Gewünscht für neue Logos: SVG (Vektor), sonst WebP oder PNG mit transparentem Hintergrund, mind. 600 px breit. Logo-Datei unter `public/partner/` ablegen, in der Partner-Datei `logo: /partner/<datei>` eintragen und in `LIZENZEN.md` vermerken. Kleine Bilddateien nie hochskalieren: `logo_max_breite` = Breite der Datei.

| Partner | Kategorie | Datei | Logo | Pflichtlogo | Pflichtlink | Höhe auf der Website |
|---------|-----------|-------|------|-------------|-------------|----------------------|
| LGT | Kopfsponsoren | `src/content/partner/lgt.yaml` | `lgt.svg` | nein | nein | 110 px |
| Kaiser AG | Kopfsponsoren | `src/content/partner/kaiser.yaml` | `kaiser.png` (238 × 52 px, höchstens 238 px breit; Vektordatei angefragt) | **ja** | **ja** (https://www.kaiser.li) | 52 px |
| Monnier Immo | Mobilitätspartner | `src/content/partner/monnier-immo.yaml` | fehlt noch (Platzhalter, ohne Link) | nein | nein | 80 px |
| MBPI | Trinkflaschenpartner | `src/content/partner/mbpi.yaml` | `mbpi.png` | **ja** | nein | 80 px |
| Liechtenstein Olympic Committee (LOC) | Anstellung | `src/content/partner/loc.yaml` | `loc.png` (höchstens 205 px breit) | nein | nein | 80 px |
| Head | Ausrüster | `src/content/partner/head.yaml` | fehlt noch (Platzhalter) | nein | nein | 40 px |
| Ziener | Ausrüster | `src/content/partner/ziener.yaml` | `ziener.png` (höchstens 316 px breit) | nein | nein | 40 px |
| Leki | Ausrüster | `src/content/partner/leki.yaml` | `leki.svg` | nein | nein | 46 px |
| Adler Hitta | Unterstützer | `src/content/partner/adler-hitta.yaml` | `adler-hitta.svg` | nein | nein | 56 px |
| Chez Vrony | Unterstützer | `src/content/partner/chez-vrony.yaml` | `chez-vrony.svg` | nein | nein | 96 px |
| Tennisclub Zermatt | Unterstützer | `src/content/partner/tennisclub-zermatt.yaml` | `tc-zermatt.svg` (ersetzt den Namen in Schrift) | nein | nein | 88 px |
| Hotel Albana Real | Heimat | `src/content/partner/hotel-albana-real.yaml` | `hotel-albana-real.svg` | nein | nein | 46 px |

## Noch offen (nicht im Design)

- Vorschaubild für Social Media (`og:image`, Twitter Card), 1200 × 630 px: geliefert (`og-charlotte-lingg.jpg`, Giovanni Maria Pizzato). Kommerzielle Lizenz vorhanden, bestätigt durch Michel Gurnari am 10.11.2026 (`lizenz_geklaert: true` in `src/content/bilder/og-charlotte-lingg.yaml`): Beim Teilen erscheint das Vorschaubild.
