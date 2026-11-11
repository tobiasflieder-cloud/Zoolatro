# Referenzfälle für die Wertung

51 feste Zoo-Aufstellungen mit dem erwarteten Ergebnis. Sie dienen als Prüfstein für einen Nachbau (z. B. Godot): Wer dieselben Eingaben
wertet, muss dieselben Zahlen bekommen. Die Regeln dazu stehen in `docs/regeln.md`.

```
node tests/referenz/referenz.js            # prüft alle Fälle gegen das aktuelle Spiel (build/zoodeck.html)
node tests/referenz/referenz.js erzeuge    # erzeugt alle Fälle neu (ca. 3 Minuten)
node tests/referenz/referenz.js aktualisiere # gleiche Aufstellungen behalten, nur „erwartet“ neu rechnen
```
Vorher `python3 quelltext/mache.py`. Ein anderer Spielstand geht mit `ZF=pfad`.

**Wann neu erzeugen?** Nur wenn sich die Wertung **absichtlich** ändert. Meist reicht `aktualisiere` (seit 0.76a): Die Aufstellungen bleiben gleich, nur die Zahlen ändern sich. `erzeuge` spielt die Bot-Läufe neu und ergibt nach Regeländerungen andere Aufstellungen. Dann zeigt der Vergleich der Dateien (git diff), welche Zahlen
sich geändert haben. Bei unabsichtlichen Abweichungen meldet die Prüfung `FAIL <fall>: …`.
Das Erzeugen ist reproduzierbar: Gleicher Code ergibt gleiche Dateien, denn `Math.random` ist durch einen festen Zufallsgenerator ersetzt.

## Woher die Fälle kommen
- **15 Bot-Fälle** (`NN-bot-s<seed>-<profil>-zoo<z>-jz<j>-tag<t>.json`): Bot-Läufe (`tests/bot7.js`) in Zoolatro 2.0 mit 8 festen
  Zufallswerten, Profilen und Stufen. Am Ende jedes Tages wird der Stand festgehalten. Ausgewählt ist so, dass alle Merkmale vorkommen:
  Kronenfeld, Herde, Innenhof, Allee, Dreiländereck, Fluss, Nordlage, Rand/Felsen, Schutzgebiet, Einzelgänger, Goldfelder, Reinheit,
  Vielfalt, Show, Stress, Ausbau, Mehrfach-Bau, Spezialisten, Kombo, Freundschaft, Besucherliebling, Winter. Dazu ist die Auswahl über
  Zoo und Jahreszeit gestreut.
- **33 Winter-Fälle** (`winter-<bedingung>[-verschaerft].json`): die größte Winter-Aufstellung, einmal mit jeder Winter-Bedingung,
  und, wo es sie gibt, in der verschärften Fassung.
- **2 Futter-Fälle** (`futter-jz2/3.json`): eine Sommer- und eine Herbst-Aufstellung, Einzelfutter auf den Gehegen, Lebensraum-Futter Stufe 1–3.
- **1 Gold-Fall** (`gold-schimmernd.json`, ab 0.72a): ein Gehege auf 2 Goldfeldern (×4), ein schimmerndes auf einem Goldfeld (×4), ein doppelt schimmerndes (×3).

## Aufbau einer Datei
```
{ "fall": Name,
  "herkunft": {seed, deck, stage, …},
  "beschreibung": {            ← lesbar, für den Nachbau
     map, board:[[q,r]…], terrain:[["q,r","wasser"|"block"|…]…], gold, g4, crown, crown2,
     zoo (0-basiert), season (0–3), day, winter, deck, stage, habs, winterCondition, winterHard, winterHab,
     specialists (Reihenfolge!), specialistsActive, habitatFood {hab:stufe}, progs, ads, events, money, fav, foto, chaos,
     buildings:[{id, key, base, cat, hab, shape, grund:{B,N}, cells, rot, anchor, lvl, food, imprint, edition, traits, tags}] },
  "erwartet": {                ← Ergebnis des Spiels
     A, S, total,              (Besucher, Natur nach Multiplikatoren; total = A·S)
     mults:[{label, id, ma, ms}],
     buildings:[{id, a, s, parts:[[Text, B, N]…]}] },   (a/s = Wert des Gebäudes vor Zoo-Multiplikatoren)
  "run": …, "perks": …, "game": … }   ← roher Spielstand, nur zum Nachrechnen im Original
```
`parts` sind die Rechenschritte in der Reihenfolge aus `docs/regeln.md` Abschnitt 2. Ein Nachbau kann damit nicht nur die Summe,
sondern jeden einzelnen Schritt vergleichen. `rot`/`anchor` sind aus den Feldern zurückgerechnet (erste passende Drehung).
Bei symmetrischen Formen gibt es mehrere richtige Lösungen.
