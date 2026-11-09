# Tests

Einmalig: `cd tests && npm install` (installiert jsdom). Python 3 und Node.js 18+ werden gebraucht.

## Alles prüfen

```
bash tests/pruefen.sh            # baut das Spiel, alle jsd-Tests + Tutorial-Durchlauf + Bot, Vergleich mit HEAD
bash tests/pruefen.sh v0.69a     # Vergleich mit einem anderen Git-Stand
SCHNELL=1 bash tests/pruefen.sh  # nur die jsd-Tests (ca. 2 Minuten)
```

`pruefen.sh` baut den Stand aus dem Commit (`git archive`) mit und lässt jeden Test auf beiden laufen.
Gemeldet werden nur **Unterschiede**: `<` = Meldung, die es vorher gab, `>` = neue Meldung. Alte Tests, die wegen
gewollter Änderungen fehlschlagen, stören so nicht. Prüfungen auf „Version“ und „Neuigkeiten“ werden ausgeblendet.

## Einzelne Werkzeuge

Alle lesen das Spiel aus `build/zoodeck.html` (vorher `python3 quelltext/mache.py`) oder aus `ZF=pfad`.

| Datei | Zweck |
|---|---|
| `jsd61a.js` … `jsd72a.js` | Tests je Version (Ausgabe mit FAIL/ERR/WINERR/MISSING = Problem). `jsd67a`/`jsd68a`/`jsd70a` = Jasper-Tutorial |
| `jsd93.js`, `jsd94.js`, `jsd96.js` | breite Regel-Tests (Winter, Lebensräume, Umbauten, Grunddeck) |
| `tutcal5.js` | spielt das Jasper-Tutorial komplett durch (Häppchen, feste Felder, Rückgängig, Neu ziehen, Ausbau, Umzug, Shops, freier Rest per Bot). `MEAS=1` misst Punkte je Tag, `V=1` ausführlich. Dauert einige Minuten |
| `sim94.js` + `bot7.js` | Bot-Lauf: `Z2=1 node sim94.js 1 /tmp/x.json` – nur als Absturz-Test |
| `jsddaten.js` | Spielstand aus 0.73a (`daten/spielstand-0.73a.json`, kompletter Gerätespeicher) muss laden und mit festem Zufall genau gleich weiterspielen; dazu Stufen 1–8 wie vorher und alle Daten aus `daten/` mit Wirkung eingebaut |
| `textvergleich.sh` | Vergleicht alle angezeigten Texte zwischen Git-Stand (Standard HEAD) und Quelltext: `textbild.js` (Menüs, Lexikon, Fenster, Shop, Zoolatro-Lauf Stufe 1 und 8 mit festem Zufall) und `textbild-tutorial.js` (Tutorial wie `tutcal5`). Gleich = „nur alt 0 … nur neu 0“ |
| `referenz/referenz.js` | 51 feste Zoo-Aufstellungen mit erwarteten Punkten je Gebäude prüfen (`erzeuge` = neu erzeugen, nur bei gewollter Wertungsänderung). Siehe `referenz/README.md` |

Neuer Test: `jsd68a.js` kopieren, Prüfungen mit `T(bedingung,'Beschreibung')` schreiben.
Ältere Werkzeuge (Screenshots, Messreihen, Excel-Liste) liegen nicht im Repo; bei Bedarf neu schreiben.
