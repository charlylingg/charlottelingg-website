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

Kein Bild nötig für: die sechs Kacheln bei «Unterwegs» (im Design Flächen mit Instagram-Zeichen, kein eingebetteter Feed).

## Partnerlogos

Bis die Logodateien da sind, steht ein Platzhalter mit dem Partnernamen. Gewünscht: SVG (Vektor), sonst WebP oder PNG mit transparentem Hintergrund, mind. 600 px breit. Logo-Datei unter `public/partner/` ablegen, in der Partner-Datei `logo: /partner/<datei>` eintragen und in `LIZENZEN.md` vermerken.

| Partner | Kategorie | Datei | Pflichtlogo | Pflichtlink | Höhe im Design |
|---------|-----------|-------|-------------|-------------|----------------|
| LGT | Kopfsponsoren | `src/content/partner/lgt.yaml` | nein | nein | 150 px |
| Kaiser AG | Kopfsponsoren | `src/content/partner/kaiser.yaml` | **ja** | **ja** (https://www.kaiser.li) | 56 px |
| Monnier Immo | Mobilitätspartner | `src/content/partner/monnier-immo.yaml` | nein | nein | 120 px |
| MBPI | Trinkflaschenpartner | `src/content/partner/mbpi.yaml` | **ja** | nein | 110 px |
| Liechtenstein Olympic Committee (LOC) | Anstellung | `src/content/partner/loc.yaml` | nein | nein | 110 px |
| Head | Ausrüster | `src/content/partner/head.yaml` | nein | nein | 36 px |
| Ziener | Ausrüster | `src/content/partner/ziener.yaml` | nein | nein | 46 px |
| Leki | Ausrüster | `src/content/partner/leki.yaml` | nein | nein | 54 px |
| Adler Hitta | Unterstützer | `src/content/partner/adler-hitta.yaml` | nein | nein | 84 px |
| Chez Vrony | Unterstützer | `src/content/partner/chez-vrony.yaml` | nein | nein | 104 px |
| Tennisclub Zermatt | Unterstützer | `src/content/partner/tennisclub-zermatt.yaml` | nein | nein | im Design ohne Logo, nur Name in Schrift |
| Hotel Albana Real | Heimat | `src/content/partner/hotel-albana-real.yaml` | nein | nein | 104 px |

## Noch offen (nicht im Design)

- Vorschaubild für Social Media (`og:image`), 1200 × 630 px, sobald ein freigegebenes Bild vorliegt.
