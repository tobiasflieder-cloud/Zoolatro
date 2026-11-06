# Zoolatro – Projektregeln für Claude

Zoolatro ist Tobis Balatro-artiges Zoo-Deckbuilding-Spiel (Hexfelder, Jahreszeiten, Besucher × Natur).
Es ist eine einzige HTML-Datei, die aus Modulen zusammengebaut und über GitHub Pages gespielt wird
(installierbar als App am Handy). Tobi testet am Handy, seine Frau spielt mit.

## 1. Arbeitsweise (wichtig)

- **Immer auf Deutsch antworten.** Kurz, freundlich, sachlich. Tobi wird geduzt, im Spiel siezt Jasper den Spieler.
- **Nur bauen, wenn Tobi es ausdrücklich sagt** („bauen“, „bauen bitte“, „bau das“).
  „Nimm das auf“, „auf die Liste“, „X ändern“ oder eine Fehlerbeschreibung sind **kein** Bauauftrag:
  dann Ursache klären (im Code nachsehen), Lösung vorschlagen, Punkt in die Liste (Abschnitt 6) eintragen und warten.
  Bei Unklarheit nachfragen. Ideen werden oft im claude.ai-Chat besprochen und kommen hier als fertige Liste an.
- **Sparsam arbeiten:** die Module gezielt durchsuchen (grep), nicht ganz lesen; lange Ausgaben kürzen.
  Bot-Läufe nur als Absturz-Test, keine Messreihen, außer Tobi bittet darum. Screenshots nur auf Wunsch.
- Gewünschter Spielstil: keine fertigen Lösungen anzeigen (kein „bestes Feld“), Spieler sollen knobeln.

## 2. Aufbau des Repos

| Pfad | Inhalt |
|---|---|
| `quelltext/src/` | **Quelle der Wahrheit.** Module 00–11 + `00-seite-und-stil.html` (Kopf, CSS) + `99-ende.html` |
| `quelltext/mache.py` | baut `build/zoodeck.html` (Tests), `index.html` (GitHub Pages) und setzt den Cache in `sw.js` |
| `quelltext/huelle/` | Rahmen um das Spiel für Web (`web-*`, mit Service Worker) und App (`app-*`) |
| `index.html`, `sw.js`, `manifest.webmanifest`, Icons | die veröffentlichte Seite. **`index.html` nie von Hand ändern.** |
| `tests/` | jsdom-Tests, Tutorial-Durchlauf, Bot – siehe `tests/README.md` |
| `CHANGELOG.md` | Änderungen je Version in Spielersprache |
| `docs/UEBERGABE-bis-0.69a.md` | alte Übergabe-Notiz: Code-Details aller Versionen, Messwerte, Erledigt-Listen (Nachschlagen) |
| `docs/tutorial/` | Tutorial-Planung (Tabelle, Bauplan Zoo 1, Zooplan) |

Module: 01 Karten · 02 Zoolatro-Regeln · 03 Sprache (TXT, Kartentexte) · 04 Wertung · 05 Ton · 06 Spiel ·
07 Anzeige · 08 Shop/Menüs · 09 Speichern/Lauf · 10 Tutorial · 11 Bildschirme.

## 3. Bauen – Ablauf

1. Änderungen in `quelltext/src/…` machen.
2. `const VERSION` hochzählen (in `quelltext/src/01-regeln-karten.js`). Schema: 0.69a → **0.70a** → 0.71a … („a“ bleibt).
3. Direkt unter `VERSION` in `CHANGES` einen Eintrag oben einfügen (`{v,d,t,i:[…]}`, Spielersprache), ab dem 4. Eintrag löschen.
   Das zeigt das Fenster „📜 Neu in Zoolatro“.
4. `CHANGELOG.md` oben ergänzen: `## 0.70a · TT.MM.JJJJ · Titel` + Stichpunkte in Spielersprache (keine Code-Namen).
5. `python3 quelltext/mache.py` (setzt auch den Cache-Namen `zoolatro-v070a` in `sw.js`).
6. Testen: `bash tests/pruefen.sh` (vergleicht mit dem letzten Commit; Unterschiede bewerten). Für Änderungen am Tutorial
   ist der Tutorial-Durchlauf darin wichtig. Für neue Funktionen einen neuen Test `tests/jsdNNa.js` schreiben (Vorlage: `jsd68a.js`).
7. Abschnitt 6 dieser Datei pflegen (Liste leeren, „Erledigt“ kurz notieren, ältere Erledigt-Einträge dürfen nach `docs/` wandern).
8. Commit mit Versionsnummer im Text (z. B. `0.70a: Tutorial-Pause in der Vorschau, Zurück-Knopf …`) und pushen → GitHub Pages ist nach 1–2 Minuten aktuell.
9. Zusammenfassung für Tobi: **Neu · Getestet · Nicht getestet · Abweichungen** von dem, was besprochen war.

Bei Inhaltsänderungen (Karten, Spezialisten, Werte) wünscht sich Tobi manchmal die Excel-Inhaltsliste – nur auf Nachfrage.
App (Android, Capacitor) liegt **nicht** in diesem Repo: `python3 quelltext/mache.py --app` erzeugt `build/app-index.html`,
die Tobi nach `zoolatro-app/www/index.html` kopiert.

## 4. Code-Orientierung (Kurzfassung, Details in docs/)

- **Karten:** `CARDS` (Werte, Form, `bonus`), Texte in `TXT.de.card`, Merkmale in `TRAITS` (raubtier/beute/scheu/show/ruhig/trubel),
  `tags` (bedroht, gross, einmalig), Lebensraum-Bindung `rq`. Kartenschlüssel: `basis~variante#futter1.futter2^praegung` (Proxy in `CARDS`).
- **Wertung:** `evalB(b,bs,idx,parts)` je Gebäude, `scoreZoo` mit Multiplikatoren (Kronenfeld, Reinheit, Vielfalt, Stress …).
  Lebensraum-Regeln `habRule`/`habRulesOn`, Formen `shapesOf` (Innenhof, Allee, Dreiländereck), Zusatz-Faktoren `extra92`.
- **Lauf:** Zoolatro-Lauf `sl.run`, `state` = laufender Zoo, `META` = Geräte-Speicher. `TUTNOW` = gerade Tutorial.
- **Shop:** `fixedItems()`, Reiter `META.shopT` (`run` Team · `umb` Umbau & Futter · `more` Extras), Unteransichten `state.shopSub`.
- **Futter:** `FOOD`, `HFOOD`, `rollFood`, Futtersack (`state.sack`), Lebensraum-Futter in `run.fdl`.
- **Früh geschafft:** `earlyReward(left)` → `run.bpCarry`, Geschenke `run.gifts` (`gsack`/`gumb`/`gprofi`), Anzeige `earlyInfo` im Sieg-Fenster.

### Tutorial (Modul 10) – Jasper, Zoo 1
- Kapitel `TUT.zl` (Frühling), `zlsh` (Frühlings-Shop), `zs` (Sommer), `zssh` (Sommer-Shop), `zh` (Herbst Tag 1 + Abschied).
  `TUTGUIDED=['zl','zs','zh']`, Start über `TUTCH`. Herbst ab Tag 2 und Winter spielt man frei; Ende = Jasper-Endtext, Knopf `data-gend`.
  Alte Kapitel `zls/zlh/zlw` sind ungenutzt (können weg).
- Schritt-Felder: `t` (Text oder Häppchen-Liste, Häppchen auch `{t,glow,mark}`), `h`, `only` (Karte), `at` (Zielfelder), `rot`, `setup`, `done`,
  `btn`, `end`, `glow`, `mark`, `undo`, `redraw`, `mv`, `up`, `lock` (Shop-Sperre `{tab,kind}`), `spec` (erzwungener Bewerber), `food` (erzwungenes Futter), `leave`, `arot`,
  `pv` (Häppchen, solange die Karte genau auf `at` liegt; 🔨 gesperrt bis zum letzten, Zähler `state.tut.pk`; `tutPvOn`/`tutPvLock`).
  Helfer `tPut(key,at,t,o)`, `tDay`, `tNat`, `tRock`, `tEndS`, `tSetHand`.
- Häppchen: am Handy einzeln (`tutStep()` liefert ein Lese-Objekt `_read` mit „Weiter ▸“ und ab dem 2. „◂ Zurück“), im Querformat (`body.land`) alles in einer Box.
  Markierungen über `tutMarkAll`, Leuchten über `tutGlowAll`.
- Im Tutorial aus: Merkmale (`TUTTR=false`), Stress-Felder, Rote Liste, Zucht, Winter-Bedingung (`INSP.frei`), Lebensraum-Regeln außer Savanne,
  Früh-geschafft-Bonus, Prägungen/Veredelungen/fremde Lebensräume in der Kartenwahl. Gelände wird nie gedreht.
- Ziele `TUTT=[5000,50000,80000,150000]`. Zoo 2 des Tutorials plant Tobi noch (dort Merkmale/Regeln einschalten).

## 5. Bekannte Eigenheiten

- `bot7.js` ersetzt `render` durch eine leere Funktion → in UI-Tests vorher sichern und danach zurücksetzen (siehe `tutcal5.js`).
- Tests prüfen oft die Versionsnummer → nach dem Hochzählen schlagen „Version“/„Neuigkeiten“-Prüfungen erwartungsgemäß fehl
  (`pruefen.sh` blendet sie aus).
- Im freien Teil des Tutorials ist der Spielverlauf zufällig; der Durchlauf kann an verschiedenen Tagen enden.

## 6. Liste fürs nächste Bauen (wird 0.71a) – erst bauen, wenn Tobi „bauen“ sagt

(leer)

**Offen / zur Entscheidung:**
- Dingo hat im Tutorial keinen Wirkungstext (Bonus hing an Beutetieren) – prüfen, ob eine andere Karte besser passt.
- Waldfelder auf dem Tutorial-Gelände bleiben, obwohl keine Dschungel-Karten kommen – Tobi fragen, falls es stört.
- Naturflächen-Verteilung im normalen Spiel: (a) gleichmäßiger oder (b) nur Fehler beheben (Umfärben reihum, Bucht-Kap nach innen). Details in docs/.

**Für später:** Tutorial Zoo 2 (Merkmale, Regeln, Winter-Bedingung) · Inhalte (Karten, Futter, Spezialisten, Gelände, Tutorial-Texte)
als Datendateien (JSON) auslagern, als Vorbereitung für einen möglichen Godot-Port · totes Holz entfernen (alte Tutorial-Kapitel,
leere `GUIDE`, abgeschaltete Sommer-Tutorial-Abfrage, Code alter Modi) · Grafikstil · Futter-Balance · neue Meilensteine
(Freundschaften, Ausbaustufen) · Verschmelzen · „Alles zurücksetzen“ · Weiterspielen nach dem Ziel beobachten.

## 7. Erledigt (zuletzt)

- **0.70a:** Tutorial-Pause in der Vorschau (Schritt-Feld `pv` an Zebras/Bratwurst/Giraffe, Hammer gesperrt bis zum letzten Häppchen,
  alte Weiter-Schritte danach entfernt); ◂ Zurück in Häppchen; kein Willkommen-Feld im Tutorial; Früh-geschafft-Kasten (`earlyBoxHtml`,
  `state.earlyR`) mit 🎁-Abzeichen am Shop-Reiter und leuchtendem Geschenk; Zoolatro-Ziele Sommer/Herbst/Winter +20 % (`ZLUP`);
  `HFOODW` 11 → 4 (Lebensraum-Futter etwa halb so oft); `tutcal5.js` Fehler am Ende behoben; neuer Test `jsd70a.js`.
- **0.69a:** Frühlings-Shop-Reiter ganz gesperrt; im Tutorial keine Stress-Felder, keine Rote Liste, keine Zucht;
  Leuchten verschiebt Kostenpunkte/Symbole nicht mehr; Delfinshow-Text.
- **0.68a:** Tutorial-Gelände nicht gedreht, Felsen-Markierung, Platzhalter auf der Hand, „Sehen Sie“ nach dem Bauen, Merkmal-Texte aus,
  Fluss-Warnung aus, Sommer-Shop mit Futtersack (Steppenheu), Wasserfall 2,-1 / Bienen 2,-2, Kartenwahl nur Wasser/Savanne/Wüste.
- **0.67a:** neues Jasper-Tutorial Zoo 1 mit Häppchen-Texten.
