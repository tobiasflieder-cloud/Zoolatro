# Grafiken und Klänge austauschen

Das Spiel sucht hier nach Dateien. Fehlt eine, nimmt es die eingebaute Farbfläche, das Emoji oder den erzeugten Ton.
Einfach eine Datei mit dem richtigen Namen hineinlegen und Godot einmal öffnen (dann wird sie importiert), fertig.

| Ordner / Datei | wofür | Größe (Vorschlag) |
|---|---|---|
| `karten/<key>.png` | Bild auf der Handkarte und auf dem Gebäude im Zoo | 512×512, durchsichtiger Hintergrund |
| `gelaende/gras.png`, `wasser.png`, `savanne.png`, `wueste.png`, `block.png` | Kachel für ein Hexfeld (wird ins Sechseck geschnitten) | 256×256 |
| `klang/<name>.ogg` | ersetzt einen Ton: `tick`, `plopp`, `muenze`, `bumm`, `wusch`, `setzen`, `karte`, `nein`, `sieg`, `niederlage` | kurz, mono |

Kartenschlüssel (`<key>`): zebras, giraffen, elefanten, flamingos, otter, nilpferde, fennek, bratwurst, popcorn, gruen, delfinshow, streichelzoo.
Der Pfad steht auch je Karte im Feld `bild` in `daten/karten.json` und kann dort geändert werden.
Farben und Schriften stehen zentral in `skripte/aussehen.gd`.
