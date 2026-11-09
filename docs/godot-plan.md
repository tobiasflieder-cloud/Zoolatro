# Zoolatro in Godot 4 – Vorschlag

Stand 0.71a. Das ist ein Vorschlag, nichts davon ist entschieden. Grundlage: `docs/regeln.md` (Regeln mit Verweisen) und
`tests/referenz/` (51 Referenzfälle mit erwarteten Punkten je Gebäude).

## 1. Ausgangslage
- Das Spiel besteht heute aus rund 650 KB JavaScript und 110 KB CSS in einer Datei. Regeln, Anzeige und Speichern sind stark verwoben:
  `evalB` liest globalen Zustand (`state`, `TERR`, `BOARD`, `CTX`), Karten haben Wirkungen als **Funktionen** (`bonus`, `km`, `mult`, `per`, `tal`).
- Die Inhalte stecken als JS-Objekte im Code: 132 Karten, 74 Spezialisten, 30 Förderprogramme, 5 Werbungen, 16 Ereignisse,
  20 Winter-Bedingungen, Futter, Tutorial-Texte.
  Viele Wirkungen sind kleine Programme, z. B. `bonus:(nb)=>({a:cnt(nb,…)})`.
- Daraus folgt: **Die Wertung ist das Herzstück und das Risiko.** Die Oberfläche ist viel Arbeit, aber gut planbar.

## 2. Struktur in Godot 4 (GDScript)

```
res://
  autoload/
    Data.gd          # lädt Inhalte (Karten, Formen, Lebensräume, Futter, Spezialisten, Winter-Bedingungen, Profile, Stufen, Texte)
    Rules.gd         # reine Regel-Funktionen: fits, cost, eval_building, score_zoo, day_income, targets (kein Zugriff auf Szenen)
    Game.gd          # laufender Zoo (früher state): Phase, Tag, Hand/Stapel/Ablage, Gebäude, Taler; Signale an die Oberfläche
    Run.gd           # Zoolatro-Lauf (früher sl.run): Zoo-Nummer, Deck, Team, Futterstufen, Stufe, Profil, Belohnungen
    Meta.gd          # Gerätespeicher (früher META): Speicherplätze, Freischaltungen, Einstellungen, Bestwerte
    Save.gd          # Speichern/Laden (JSON in user://), Versions-Migration
    Rng.gd           # ein RandomNumberGenerator mit Startwert (für Bot, Tests, „Startwert“ im Lauf)
    Sfx.gd           # Töne
  rules/
    effects/         # eine kleine Klasse je Wirkungsart (siehe 3.2), z. B. NeighborBonus.gd, HabitatRule.gd, WinterCondition.gd
    MapGen.gd        # Gelände erzeugen (genMap0, shrinkMap, natPlace)
    Hex.gd           # Hex-Hilfen: DIRS, Nachbarn, Drehung, Randfeld, Abstand
  data/              # Inhalte als JSON/.tres (aus dem JS erzeugt, siehe 4.1)
  scenes/
    Main.tscn        # Bildschirm-Wechsel (Titel, Speicherplätze, Lauf-Einrichtung, Profilwahl, Zoo, Belohnungen, Sieg)
    Zoo.tscn         # Spielfeld: Board (TileMap oder eigene Hex-Zeichnung), Hand, Team-Leiste, Info-Kasten, Knöpfe
    Board.tscn  Card.tscn  HandBar.tscn  TeamBar.tscn  InfoPanel.tscn  Shop.tscn  Draft.tscn  Modal.tscn  Coach.tscn (Jasper)
  tests/
    test_referenz.gd # lädt tests/referenz/faelle/*.json, wertet mit Rules.gd, vergleicht Zeile für Zeile (GUT oder eigenes Skript)
```
- **Autoloads**: `Data`, `Rules`, `Game`, `Run`, `Meta`, `Save`, `Rng`, `Sfx`. `Rules` ist zustandslos und bekommt einen
  **Wertungs-Kontext** (Gelände, Gebäude, Jahreszeit, Team, Lauf-Daten, Tages-Ereignisse) als Objekt übergeben. Es liest keine
  globalen Variablen, so lässt es sich gegen die Referenzfälle testen.
- **Szenen** hören auf Signale von `Game` (`day_started`, `building_placed`, `day_scored(result)`, `phase_changed`) und rufen nur Methoden
  von `Game` auf. Keine Regel-Logik in Szenen.

### Welches Modul wohin
| JS-Modul | Inhalt | Godot |
|---|---|---|
| 01 Karten | Konstanten, `CARDS`, `SHAPES`, `HAB`, `TRAITS`, `PROGS/ADS/EVENTS`, `SPEC`, Kosten | `data/*.json` + `Data.gd`; Kosten → `Rules.cost()`; `Hex.gd` |
| 02 Zoolatro-Regeln | Winter-Bedingungen, Schneekönig, Veredelungen | `data/winter.json` + `rules/effects/WinterCondition.gd`; `Rules` |
| 03 Sprache | Texte `TXT` | Godot-Übersetzung (`.po` oder CSV), Schlüssel statt fertiger Sätze |
| 04 Wertung | Futter, Gelände-Erzeugung, `evalB`, `scoreZoo`, Angebote, `dayIncome` | `Rules.gd`, `MapGen.gd`, `data/food.json` |
| 05 Ton | Klänge, **und** `seTarget`/`syncCtx` | `Sfx.gd`; Ziele und Kontext → `Rules.gd`/`Game.gd` |
| 06 Spiel | `newGame`, Tagesbeginn, Bauen, Umziehen, Auflagen, Zoo-Übersicht | `Game.gd` (Ablauf), Auflagen → `rules/effects` |
| 07 Anzeige | Zeichnen, Hand, Info-Kasten, Shop-Logik, Kartenwahl, Abend | Szenen `Zoo/Board/Card/InfoPanel/Shop/Draft`; Shop-**Logik** → `Game.gd`/`Rules.gd` |
| 08 Shop/Menüs | Fenster, Shop-Seiten, Stufen, Hilfe | Szenen `Shop/Modal`, Stufen → `data/stages.json` |
| 09 Speichern/Lauf | Laden, Lauf, Belohnungen, Freischalten, `extra92`, Lebensraum-Regeln, Formen, Momente | `Save.gd`, `Run.gd`, `Meta.gd`; `extra92`/`habRule`/`shapes92` → `Rules.gd` |
| 10 Tutorial | Jasper-Schritte | `data/tutorial.json` + `Coach.tscn`/`Tutorial.gd` (Schritt-Maschine) |
| 11 Bildschirme | Titel, Speicherplätze, Profilwahl, Belohnungen | Szenen unter `scenes/screens/` |
| 00 Seite/Stil | CSS, Kopf | Godot-Theme (`.tres`), Schriften, Farben |

## 3. Die schwierigen Stellen

### 3.1 Wertung genau nachbauen
- Reihenfolge und Rundung aus `docs/regeln.md` Abschnitt 2–3 **wörtlich** übernehmen. Jede Zeile `parts` hat in den Referenzfällen
  einen Gegenwert, so findet man Abweichungen sofort.
- JS `Math.round` rundet .5 Richtung +∞ (auch bei negativen Zahlen). In GDScript `floor(x + 0.5)` statt `round()` verwenden.
- Ganzzahlen: Alle Werte sind ganze Zahlen außer den Faktoren. `total = A·S` erreicht Hunderttausende bis Milliarden: `int` (64 bit) reicht.
- Zwischenergebnisse, die JS zwischenspeichert (`shapesOf` mit voller Liste für Teilmengen, `topSet`, `KING`), müssen sich gleich
  verhalten (`regeln.md` 13.14).

### 3.2 Karten-Wirkungen (Funktionen) in Daten verwandeln
Von 132 Karten haben 70 einen Nachbar-Bonus (`bonus`), 18 eine Kombo (`km`), 2 einen Zoo-Multiplikator. 44 der 74 Spezialisten wirken auf
die Wertung (`per`/`mult`), dazu kommen Programme, Werbung, Ereignisse und Winter-Bedingungen.
Vorschlag: **wenige Wirkungsbausteine** mit Parametern statt Code je Karte, zum Beispiel
`{"typ":"nachbar_zaehlen","wer":{"cat":"essen"},"B":1}`, `{"typ":"faktor","wenn":{"tag":"show"},"N":1.5}`,
`{"typ":"umkreis","radius":2,…}`. Karten, die nicht passen, bekommen eine eigene kleine GDScript-Klasse (`effects/Custom_<karte>.gd`).
Erst auszählen, welche Bausteine es braucht (Skript über `CARDS`). Das ist ein eigener Arbeitsschritt (Teil 2).

### 3.3 Zufall
JS nutzt überall `Math.random`. In Godot über **einen** `Rng` laufen lassen. Dann sind Bot-Läufe, Tests und „Startwert“ reproduzierbar.
Gleiche Zufallsfolgen wie im JS-Spiel sind **nicht** nötig: Die Referenzfälle prüfen nur die Wertung fester Aufstellungen.

## 4. Reihenfolge des Ports
1. **Inhalte exportieren** (JS → JSON) – *Teil 2a erledigt: `daten/karten.json`, `daten/merkmale.json`, Wirkungen über Kennungen in `KARTEN_WIRKUNG`; Teil 2b erledigt: `daten/spezialisten.json` (`SPEZ_WIRKUNG`), `futter.json` (`FUTTER_WIRKUNG`), `winter.json` (`WINTER_WIRKUNG`), `gelaende.json` (Form über `genMap0`), `stufen.json` (Kennungen über `stAb`/`stW`), `profile.json`; Teil 2c erledigt: `texte_de.json` (`TXT`), `tutorial.json` (`TUT_WIRKUNG`), `foerderprogramme.json`, `werbung.json`, `ereignisse.json`, `praegungen.json`, `herausforderungen.json`*: ein Node-Skript liest `build/zoodeck.html` in jsdom und schreibt `CARDS`, `SHAPES`, `HAB`,
   `FOOD`, `HFOOD`, `SPEC` (ohne Funktionen), `INSP`, `DECKS`, `STAGES`, `MILE`, `FRIENDS`, Texte. Das passt zum Punkt „Inhalte als
   Datendateien“ der Liste. Danach die Wirkungs-Bausteine festlegen (3.2).
2. **Wertung** (`Hex.gd`, `Rules.eval_building`, `Rules.score_zoo`) **gegen die Referenzfälle**, Fall für Fall, bis alle 51 Fälle in allen
   Zeilen gleich sind. Erst die Fälle ohne Spezialisten und Winter, dann Winter, dann Spezialisten und Futter.
   Fehlende Bausteine (z. B. Karten, die in keinem Fall vorkommen) mit zusätzlichen Fällen abdecken: `referenz.js erzeuge` erweitern.
3. **Gelände erzeugen** (`MapGen.gd`): Formen, Felsen, Schrumpfen, 18 Naturfelder. Prüfen über Eigenschaften (Anzahl, Fleckgrößen,
   Fluss am Stück), nicht über gleiche Zufallsfolgen (wie `jsd71a.js`).
4. **Spielablauf ohne Oberfläche** (`Game.gd`, `Run.gd`): Tag, Baupunkte, Hand/Stapel, Kartenwahl, Jahreszeit, Ziele, Taler, Shop-Logik,
   Belohnungen zwischen den Zoos, Stufen. Dazu einen **Bot in GDScript** (wie `bot7.js`) als Absturz-Test und für grobe Balance-Vergleiche
   (Punkte je Jahreszeit ähnlich wie im JS-Bot).
5. **Speichern/Laden** (`Save.gd`) mit Versionsnummer.
6. **Oberfläche**: Spielfeld und Hand zuerst (Handy-Hochformat), dann Info-Kasten mit Vorschau, Shop, Kartenwahl, Fenster, Menüs, Querformat.
7. **Tutorial** (Jasper) als Schritt-Maschine aus `data/tutorial.json` (Felder wie heute: `t`, `only`, `at`, `pv`, `glow`, `mark` …).
8. **Ton, Effekte, Feinschliff**, Export Android (ersetzt die Capacitor-App) und Web.

## 5. Offene Fragen (für Tobi)
1. **Regel-Widersprüche** aus `regeln.md` Abschnitt 13 vorher klären: Reinheit ab 4 oder 6, 3. Doppel-Gehege 25 % oder 50 %,
   Show-Obergrenze, Gruppenbruch statt Einzel-Abzug, Schimmernd + Gold. Sonst baut man Eigenheiten nach, die keiner will.
2. ~~Totes Holz~~ → in 0.73a entfernt (Zoo-Profile, alte Modi, alte Tutorial-Kapitel, `GUIDE`).
3. ~~Zoolatro 1 und 2.0~~ → entschieden: nur Zoolatro (2.0) mit Stufen. Das Tutorial nutzt intern noch den alten Zoolatro-1-Rechenweg (`enterCamp(…,true)`);
   im Port reicht ein Modus mit Tutorial-Schaltern.
4. **Grafik**: Emojis wie heute (einfach, plattformabhängig) oder eigene Bilder (`ART`-Tabelle gibt es schon)? Hexfelder als TileMap oder selbst gezeichnet?
5. **Speicherstände**: Sollen alte Spielstände aus der Web-Version übernommen werden? Das ginge über einen Export als JSON.
6. **Plattformen**: Android und Web? iOS? Die Web-Ausgabe von Godot ist deutlich größer als die heutige HTML-Datei.
7. **Sprache**: Nur Deutsch, oder von Anfang an Übersetzungs-Schlüssel (empfohlen, weil `03-sprache` schon teilweise so arbeitet)?
8. **Parallelbetrieb**: Wird die HTML-Version während des Ports weiter verändert? Wenn ja, muss jede Regeländerung doppelt gebaut werden.
   Die Referenzfälle helfen dabei: Nach einer gewollten Änderung neu erzeugen, dann zeigen sie die neuen Sollwerte für Godot.
