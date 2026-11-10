# CLAUDE.md – Website Charlotte Lingg

Diese Datei gilt für jede Aufgabe in diesem Repository. Lies sie vollständig, bevor du etwas änderst.

## Worum es geht
Website von Charlotte Lingg, Skirennfahrerin im Nationalkader des Liechtensteinischen Skiverbands (Slalom, Riesenslalom, Europacup und Weltcup). Domain charlottelingg.com. Sprachen: Deutsch (Standard, ohne Präfix) und Französisch (/fr/). Gepflegt von Charlotte Lingg und Michel Gurnari, beide ohne Programmierkenntnisse. Sie beschreiben Änderungen in normaler Sprache und prüfen das Ergebnis in der Vorschau.

## Arbeitsablauf (verbindlich)
- Arbeite immer auf einem neuen Branch und eröffne einen Pull Request. Schreib nie direkt auf main. Merge nie selbst.
- Ein Pull Request, eine Änderung, ein klarer deutscher Titel (z. B. «Resultat Levi eingetragen»).
- Beschreibung im Pull Request auf Deutsch, in einfachen Worten: was geändert wurde, was in der Vorschau zu prüfen ist.
- Ändere nur, was verlangt ist. Texte nicht ungefragt umformulieren.
- Vor jedem Pull Request: npm run build und npm run check fehlerfrei, Mobilansicht 375px ohne horizontales Scrollen, alle geänderten Links funktionieren.

## Struktur
- design/tokens.json, src/styles/tokens.css: Designsystem (Website: Thema «Beere»; Dossier: Thema «Torlauf»). Einzige Quelle für Farben, Schriften, Abstände, Formen.
- design/referenz/startseite.dc.html: freigegebenes Design der Startseite, massgebend für die Website.
- src/content/texte/de und src/content/texte/fr: Texte der Sektionen.
- src/content/resultate, src/content/rennen, src/content/partner: strukturierte Daten. Länder als ISO-Alpha-3 wie bei der FIS (LIE, SUI, AUT).
- src/i18n/de.json, src/i18n/fr.json: feste Oberflächentexte.
- src/components, src/layouts, src/pages: Layout. Für reine Inhaltsänderungen nicht anfassen.
- public/bilder: Bilder. LIZENZEN.md: Nachweis für jedes Bild.

## Design
- Massgebend für die Website ist das Design in design/referenz/startseite.dc.html.
- Die Website nutzt das Thema «Beere» aus design/tokens.json (themen.beere), gespiegelt in src/styles/tokens.css. Keine Werte ausserhalb der Tokens: Farben, Schriften, Schriftgrössen, Abstände, Masse, Schatten und Deckkraft immer über var(--…). Fehlt ein Wert, zuerst in beiden Token-Dateien ergänzen. Breakpoints stehen in tokens.json und werden in Media Queries wörtlich geschrieben. Ausnahme: technische Hilfen für Screenreader (visually-hidden, 1px).
- Das Thema «Torlauf» (themen.torlauf) gilt nur für das Dossier und wird auf der Website nicht verwendet.
- Schriften: Barlow Condensed für Titel, Zahlen, Kicker, Navigation, Buttons und Labels; Barlow für Fliesstext (17px). Schriften lokal (Fontsource).
- Radius 0. Rund sind nur Medaillen und das Instagram-Zeichen. Erkennungszeichen ist die Schräge -12deg (Flaggen, Kicker, Schnittkanten).
- Text in schrägen Flächen steht gerade (keine Kursivschrift): nur die Fläche wird schräg gestellt (Klassen kicker-flagge, schraeg-flaeche).
- Kontrast nach WCAG AA: kleine Schrift mindestens 4.5:1, grosse Schrift (ab 24px fett) mindestens 3:1. rosa nur für Flächen ohne Text, Linien, Flaggen, Torstangen, Kurslinien und grosse Zahlen. Kleine Schrift nie rosa (wird beere); Buttons und Flaggen mit Schrift haben eine beere Fläche mit weisser Schrift (Hover/Fokus aubergine).
- Formularfelder mindestens 16px Schrift (Design: 17px).
- Landesflagge in der Kopfzeile bleibt (Farben flagge-* in den Tokens).

## Sprache und Ton
- Schweizer Rechtschreibung: ss statt ß, Datum TT.MM.JJJJ, CHF mit Apostroph (CHF 15'000).
- Nie gendern (keine Doppelpunkt-, Stern- oder Doppelformen).
- Keine Emojis, keine Kursivschrift, Ausrufezeichen sparsam, keine Werbesprache, keine Superlative ohne Beleg.
- Texte in Charlottes Namen: Ich-Form, bodenständig, zielstrebig, ehrlich. Leitmotive: jeden Tag alles geben, zurückkommen, Schritt für Schritt nach vorne. Rückschläge benennen, nicht dramatisieren. Kein Pathos.
- Deutsch und Französisch immer gemeinsam nachführen. Französisch idiomatisch formulieren, nicht wörtlich übersetzen.

## Inhaltliche Regeln
- Gesundheit: Nur kommunizieren, dass Charlotte nach ihrer Verletzung zurück und fit ist. Keine medizinischen Details, keine Prognosen.
- Resultate: nur gemäss offizieller FIS-Resultatliste. Link als fis_link eintragen und im Pull Request nennen. Nie Resultate, Zahlen oder Zitate erfinden. Fehlt eine Angabe, Platzhalter in eckigen Klammern setzen und im Pull Request darauf hinweisen.
- Partner: nie Beträge, Vertragsinhalte oder Konditionen nennen. Pflichtlogos und Pflichtlinks gemäss src/content/partner (pflicht_logo, pflicht_link) nie entfernen. Neue oder entfernte Partner nur auf ausdrücklichen Auftrag.
- Bilder: nur mit Eintrag in LIZENZEN.md. Das imago-Bild Weltcup Lech 2021 nie verwenden. Format WebP, längste Seite max. 1600px, Alt-Text in DE und FR.

## Technik
- Statische Astro-Site. Keine externen Skripte, keine Verbindungen zu Google, kein Tracking, keine Cookies.
- Schriften lokal (Fontsource).
- Hosting: Cloudflare Workers mit statischen Assets (Workers Builds), verbunden mit diesem Repository. Konfiguration in wrangler.jsonc, ausgeliefert wird der Ordner dist. Produktion = Branch main. Jeder andere Branch und jeder Pull Request erhält automatisch eine Vorschau-Adresse. Sicherheits-Header in public/_headers. Keine Netlify- oder Pages-spezifischen Dateien.
- Formulare (später): eigene Route im Worker, Versand per E-Mail über Resend, keine Speicherung von Anfragen. Spam-Schutz mit Honeypot und Zeitprüfung.
- Instagram-Feed (Sektion «Unterwegs»): Die sechs Kacheln zeigen die neuesten Beiträge von @charlotte_lingg. Quelle ist der öffentliche JSON-Feed von Behold (INSTAGRAM_FEED_URL in src/config.ts). Das Skript scripts/instagram-aktualisieren.mjs (npm run instagram) lädt die Vorschaubilder nach src/assets/instagram/ und schreibt src/data/instagram.json (nur id, Link, Datum, Typ, Bildmasse). Die Website liefert die Bilder selbst aus (astro:assets): Besucher laden nichts von Instagram, Meta oder Behold. Der Build hängt nie vom Netz ab; fehlt die Datei oder ist sie leer, erscheinen Platzhalter-Kacheln.
- Der Workflow .github/workflows/instagram.yml («Instagram aktualisieren») läuft zweimal täglich und lässt sich manuell starten. Bei geänderten Beiträgen baut er zur Kontrolle und committet «Instagram-Feed aktualisiert» als github-actions[bot] direkt auf main. Diese Bot-Commits sind die einzige Ausnahme von «alles über Pull Requests».
- Beitrag ausblenden: ID in INSTAGRAM_AUSBLENDEN (src/config.ts) eintragen, per Pull Request, danach den Workflow manuell starten.
- Dateien in src/assets/instagram/ und src/data/instagram.json nie von Hand ändern, nur über das Skript bzw. den Workflow.

## Freigaben (zur Information)
Freigaben erteilt Michel Gurnari im Auftrag von Charlotte Lingg (Vereinbarung vom 10.11.2026): Layout, Tippfehler, Rennkalender und Resultate sowie Texte in Charlottes Namen, Bilder von ihr, Partner, Comeback/Gesundheit, Impressum und Datenschutz. Weise im Pull Request darauf hin, wenn eine Änderung eine Freigabe braucht.
