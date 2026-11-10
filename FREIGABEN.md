# Freigaben

Die Vorschau-Adresse ist öffentlich erreichbar. Deshalb hat jede Textdatei und jeder Blogbeitrag im Kopf (Frontmatter) die Angabe `freigabe`.

- `freigabe: true`: erscheint auf der Website.
- `freigabe: false`: erscheint **nicht**. Nur wenn beim Build die Variable `PUBLIC_SHOW_ENTWUERFE=true` gesetzt ist, wird der Inhalt mitgebaut und mit dem Label «Entwurf – nicht freigegeben» markiert. Für die Produktion (Branch `main`) diese Variable nie setzen.

**So gibt Charlotte einen Inhalt frei:** In der Datei `freigabe: false` auf `freigabe: true` ändern (das kann Claude Code per Auftrag machen) und hier das Datum eintragen.

Französisch: Zu jeder Datei unter `de/` gibt es dieselbe Datei unter `fr/`. Sie ist noch nicht übersetzt (`uebersetzt: false`), deshalb zeigt die französische Seite den deutschen Text. Der Freigabe-Status der FR-Dateien entspricht dem der DE-Dateien. Mit der Übersetzung werden die FR-Texte separat freigegeben.

Wer freigibt (gemäss CLAUDE.md): Texte in Charlottes Namen, Bilder von ihr, Partner, Comeback/Gesundheit, Impressum und Datenschutz: **Charlotte**. Layout, Tippfehler, Rennkalender und Resultate: **Michel**.

## Texte der Startseite (`src/content/texte/de/`)

| Inhalt | Datei | freigabe | Freigegeben von Charlotte am |
|--------|-------|----------|------------------------------|
| Titel und Beschreibung für Suchmaschinen, Angaben JSON-LD | `startseite.md` | true | |
| Hero | `hero.md` | true | |
| 01 Portrait mit Steckbrief | `portrait.md` | true | |
| Zitat | `zitat.md` | true | |
| 02 Resultate (Texte; Resultate selbst siehe unten) | `resultate.md` | true | |
| Rennkalender (Texte; Rennen selbst siehe unten) | `rennkalender.md` | true | |
| 03 Mein Weg (Titel, «Meine ganze Geschichte») | `weg.md` | true | |
| Station 01 Zermatt und Wallis | `weg/station-01-zermatt.md` | true | |
| Station 02 Liechtenstein | `weg/station-02-liechtenstein.md` | true | |
| Station 03 Europacup und WM | `weg/station-03-europacup.md` | true | |
| Station 04 Comeback, **Fassung mit Diagnose** («Drei Kreuzbandrisse …») | `weg/station-04-comeback.md` | **false** | |
| Station 04 Comeback, Kurzfassung ohne Diagnose («Drei Verletzungen …») | `weg/station-04-comeback-kurz.md` | true | |
| Station Ziel Olympia 2030 | `weg/station-05-ziel.md` | true | |
| Geschichte: Wo alles begann | `weg/geschichte-01-wo-alles-begann.md` | true | |
| Geschichte: Meine Jahre im Wallis | `weg/geschichte-02-wallis.md` | true | |
| Geschichte: Ein neuer Anfang | `weg/geschichte-03-neuer-anfang.md` | true | |
| Geschichte: Meine schönsten Resultate | `weg/geschichte-04-resultate.md` | true | |
| Geschichte: **Rückschläge, die mich stärker gemacht haben** (Jahre, Orte, Hergang der Verletzungen) | `weg/geschichte-05-rueckschlaege.md` | **false** | |
| Geschichte: Bereit für diese Saison | `weg/geschichte-06-bereit.md` | true | |
| Unterwegs (Instagram-Hinweis) | `unterwegs.md` | true | |
| Blog (Überschrift) | `blog.md` | true | |
| 04 Partner (Texte; Partner selbst siehe unten) | `partner.md` | true | |
| Sponsor werden | `partner-werden.md` | true | |
| Fanpost (Text) | `fanpost.md` | true | |
| **Fanpost-Adresse** | `fanpost-adresse.md` | **false** | |
| Kontakt | `kontakt.md` | true | |
| Impressum (nur Gerüst «Inhalt folgt.») | `impressum.md` | true | |
| Datenschutz (nur Gerüst «Inhalt folgt.») | `datenschutz.md` | true | |

Zur Station 04: Es gibt zwei Fassungen mit derselben Position. Solange die Fassung mit Diagnose `freigabe: false` hat, zeigt die Website die Kurzfassung. In der Vorschau mit Entwürfen ersetzt die Fassung mit Diagnose die Kurzfassung. Gibt Charlotte die Fassung mit Diagnose frei, die Kurzfassung löschen.

## Blogbeiträge (`src/content/blog/de/`)

| Beitrag | Datei | Status | freigabe | Freigegeben von Charlotte am |
|---------|-------|--------|----------|------------------------------|
| Zurück im Weltcup | `zurueck-im-weltcup.md` | veroeffentlicht | true | |
| **Drei Kreuzbandrisse, drei Comebacks** (ganzer Beitrag) | `drei-kreuzbandrisse-drei-comebacks.md` | veroeffentlicht | **false** | |
| Qualität statt Quantität | `qualitaet-statt-quantitaet.md` | folgt | true | |

## Bilder (`src/content/bilder/`)

Bilder funktionieren gleich wie Texte, nur heisst die Angabe `lizenz_geklaert`: Bei `false` erscheint das Bild nur in einem Build mit `PUBLIC_SHOW_ENTWUERFE=true` (mit dem Label «Entwurf – nicht freigegeben»). Sonst bleibt der Platzhalter, beim Teilen gibt es kein Vorschaubild, und die Datei wird gar nicht ausgeliefert. Auf `true` erst, wenn die Nutzungsrechte bestätigt und in `LIZENZEN.md` eingetragen sind. Bilder von Charlotte gibt Charlotte frei.

| Bild | Datei | lizenz_geklaert | Rechte bestätigt am | Freigegeben von Charlotte am |
|------|-------|-----------------|---------------------|------------------------------|
| Hero, Weltcup Sölden 2026 (Giovanni Maria Pizzato) | `hero-soelden-2026.yaml` | true | 10.11.2026 (kommerzielle Lizenz, bestätigt durch Michel Gurnari) | |
| Vorschaubild beim Teilen (Giovanni Maria Pizzato) | `og-charlotte-lingg.yaml` | true | 10.11.2026 (kommerzielle Lizenz, bestätigt durch Michel Gurnari) | |

## Daten (Freigabe durch Michel)

**Resultate:** Alle 7 Einträge sind gegen das FIS-Athletenprofil von Charlotte Lingg (competitorid 203810) geprüft, abgerufen am 10.11.2026. Sie haben `geprueft: true` und einen echten `fis_link`. Bei `geprueft: true` sind keine Platzhalter mehr erlaubt (der Build bricht sonst ab).

**Rennkalender:** aus dem Design übernommen und **noch nicht gegen die FIS geprüft**. Jeder Eintrag hat `geprueft: false` und als `fis_link` den Platzhalter `[FIS-LINK]`.

| Was | Ort | Einträge | geprueft | Geprüft von Michel am |
|-----|-----|----------|----------|-----------------------|
| Resultate | `src/content/resultate/` | 7 | true (Daten aus Auftrag 02b, FIS abgerufen 10.11.2026) | |
| Rennkalender 2026/27 | `src/content/rennen/2026-27/` | 23 (13 Weltcup, 10 Europacup) | false | |
| Partner (Freigabe Charlotte) | `src/content/partner/` | 12 | – | |

Monnier Immo ist vorläufig ohne Link: https://www.monnier-immo.ch war nicht erreichbar. Michel bestätigt die richtige Adresse.
