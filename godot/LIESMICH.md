# Zoolatro „Spielwiese“ – Godot-Prototyp

Ein kleiner, spielbarer Ausschnitt von Zoolatro in **Godot 4** zum Ausprobieren von Effekten und Spielgefühl.
Das ist **kein** vollständiger Nachbau. Das eigentliche Spiel bleibt die HTML-Datei im Repo und wird hiervon nicht verändert.
Der Prototyp liegt nur auf dem Zweig `godot-prototyp`.

## Was drin ist
- **Spielfeld:** Wiese mit Radius 5, Naturflecken (Wasser, Savanne, Wüste), 2 Felsen, 3 Goldfelder (×2) und 1 Kronenfeld (×1,3).
  Jedes neue Spiel wird neu gewürfelt.
- **Karten:** 12 echte Karten aus dem HTML-Spiel mit denselben Werten, Formen und Boni (Stand 0.73a), siehe `daten/karten.json`.
  Die Hand hat 5 Karten, gebaute Karten kommen auf den Ablagestapel und später wieder auf die Hand.
- **Bauen:** Karte antippen, aufs Feld tippen oder ziehen (Vorschau, rot = passt nicht), **↻ Drehen**, **🔨 Bauen**,
  **↶** macht den letzten Bau des Tages rückgängig. 4 Baupunkte pro Tag, jedes Feld kostet 1, Gehege mit 4 Feldern 1 weniger.
  Naturflächen sind nur für Gehege des gleichen Lebensraums frei, wie im HTML-Spiel.
- **Wertung bei „💤 Tag beenden“:** Gebäude für Gebäude, im Takt, mit Besucher × Natur. Gerechnet werden:
  - Nachbarn gleichen Lebensraums (+1 B), Naturfläche (+1 N je Feld), Kartenbonus,
  - Goldfeld ×2 (nacheinander, wie seit HTML 0.72a), Savannen-Herde, Kronenfeld ×1,3 B.
  - Damit es beim Spielen nicht vom HTML-Spiel abweicht, außerdem: Freundschaft (Zebras–Giraffen, Flamingos–Nilpferde),
    Innenhof, Allee, Dreiländereck, Nilpferd-Kombo und der Abzug für doppelt gebaute Karten.
  - Nicht drin sind Merkmale (Show, Stress), andere Lebensraum-Regeln, Spezialisten, Futter, Winter, Reinheit/Vielfalt und Taler.
    Das entspricht dem Tutorial-Rahmen des HTML-Spiels.
- **Ablauf:** 5 Tage, Ziel 6.000 Punkte, danach „Geschafft!“ oder „Leider nicht“ und „Neues Spiel“.
- **Effekte:**
  - Zahlen ploppen auf, die Anzeige „B × N“ zählt mit,
  - Kombo-Explosion bei großen Boni (Gold, Herde, Freundschaft, Formen, Kombo),
  - Münzregen bei Gastro, Bildschirmwackeln, kurzes Vibrieren am Handy,
  - federnde Karten beim Ziehen, Wählen und Setzen, Glanz auf seltenen Karten,
  - Töne im Takt der Wertung: jedes Gebäude einen Ton höher.
- **Klänge** werden beim Start selbst berechnet (keine Dateien, keine Lizenzfragen).
- **Schriften:** Fredoka und Luckiest Guy (SIL Open Font License, Lizenztexte in `schrift/`), aus dem npm-Paket `@fontsource`.

> Seltene Karten: Im HTML-Spiel sind alle 12 Karten „gewöhnlich“. Damit man den Glanz sieht, sind **Elefantenpark (selten)** und
> **Nilpferdsee (sehr selten)** im Prototyp nur optisch als selten markiert (`rar_anzeige` in `daten/karten.json`).

## 1. Godot installieren
1. Auf https://godotengine.org/download die **Godot 4.7** Standard-Version für dein System laden (Windows, Mac oder Linux).
   Gebaut und getestet ist das Projekt mit **4.7.2 stable**. Die .NET/C#-Version ist nicht nötig.
2. Entpacken. Godot muss man nicht installieren, die Programmdatei lässt sich direkt starten.

## 2. Projekt öffnen und starten
1. Repo-Zweig `godot-prototyp` herunterladen, z. B. auf GitHub „Code → Download ZIP“ auf diesem Zweig.
2. Godot starten → **Importieren** → im Ordner `godot/` die Datei `project.godot` wählen → **Importieren & Bearbeiten**.
   Beim ersten Öffnen importiert Godot die Schriften, das dauert ein paar Sekunden.
3. Oben rechts auf **▶ (Projekt starten)** klicken oder **F5** drücken.
   Am PC läuft es im Hochformat-Fenster, alles geht mit der Maus.

## 3. Aufs Handy bringen (Android)
Einmalig einrichten (etwa eine halbe Stunde):
1. In Godot: **Editor → Exportvorlagen verwalten → Herunterladen und installieren**.
2. **OpenJDK 17** installieren (z. B. „Temurin 17“ von adoptium.net) und das **Android SDK**.
   Am einfachsten über Android Studio (developer.android.com/studio): Dort unter „SDK Manager“ die Android SDK Platform-Tools,
   die Build-Tools und eine aktuelle Android-Plattform installieren.
3. In Godot: **Editor → Editoreinstellungen → Export → Android**: „Java SDK Path“ und „Android SDK Path“ eintragen.
   Einen Debug-Keystore legt Godot selbst an.

Danach gibt es zwei Wege:
- **Direkt per Kabel:** Am Handy die Entwickleroptionen und „USB-Debugging“ einschalten und das Handy anschließen.
  In Godot erscheint oben rechts ein Android-Symbol, ein Klick darauf installiert und startet die Spielwiese.
- **Als APK-Datei:** **Projekt → Exportieren → Android** (die Vorlage ist schon angelegt) → „Projekt exportieren“.
  Die Datei `export/zoolatro-spielwiese.apk` aufs Handy kopieren und öffnen (Installation aus unbekannten Quellen erlauben).

## 4. Die Regler (⚙ oben rechts)
| Regler | was er tut |
|---|---|
| **Effekte an** | Hauptschalter: aus = keine Partikel, kein Wackeln, kein Federn, kein Glanz, Zahlen erscheinen ohne Animation |
| **Bildschirm-Wackeln** | Stärke des Wackelns bei Explosionen, beim Bauen und beim Tagesergebnis (0 = aus, 100 % = normal, 200 % = doppelt), auch die Vibration |
| **Partikel-Menge** | Anzahl Sterne, Funken und Münzen (0 = keine) |
| **Wertungs-Tempo** | wie schnell die Gebäude nacheinander gewertet werden (×0,25 sehr langsam bis ×3 sehr schnell) |
| **Lautstärke** | alle Töne (0 = stumm) |
| **Federn der Karten** | wie stark die Karten beim Ziehen, Wählen und Setzen federn (über 120 % elastisch) |
| **Standard** | alles zurück auf die Ausgangswerte |

Die Einstellungen bleiben beim nächsten Start erhalten.

## 5. Eigene Grafiken
Siehe `grafik/LIESMICH.md`. Kurz: `grafik/karten/zebras.png` usw. hineinlegen, dann ersetzt das Bild das Emoji auf Karte und Gebäude.
Für das Gelände gibt es Kacheln (`grafik/gelaende/`), für Töne `grafik/klang/<name>.ogg`.
Farben und Schriften stehen zentral in `skripte/aussehen.gd`.

## 6. Tests (für Claude bzw. ohne Bildschirm)
```
godot --headless --path godot --script res://tests/test_referenz.gd          # 5 Referenzfälle nachrechnen
godot --headless --path godot --script res://tests/test_referenz.gd -- alle   # alle 15
godot --headless --path godot --script res://tests/test_spiel.gd             # ein ganzes Spiel automatisch
```
- Die Referenzfälle kommen aus dem echten HTML-Spiel (`node tests/referenz/spielwiese.js erzeuge`, im Repo `tests/referenz/spielwiese/`).
  `rein-*` enthalten nur die oben genannten Grundregeln, `voll-*` zusätzlich Mehrfach-Bau,
  `extra-*` Freundschaft, Innenhof, Allee, Dreiländereck und Kombo. Verglichen werden Punkte je Gebäude, jeder Rechenschritt und die Gesamtwertung.
- `test_spiel.gd` spielt Karten wählen, drehen, bauen, rückgängig, 5 Tage mit allen Effekten, Einstellungen und Neustart durch.

## 7. Aufbau
| Datei | Inhalt |
|---|---|
| `skripte/regeln.gd` | Wertung und Bau-Regeln (Nachbau von `evalB`/`scoreZoo`, ohne Grafik, testbar) |
| `skripte/gelaende.gd` | Gelände würfeln |
| `skripte/haupt.gd` | Bildschirm, Ablauf, Bauen, Wertung mit Effekten |
| `skripte/brett.gd` | Spielfeld zeichnen, Tippen/Ziehen |
| `skripte/karte_ui.gd` | Handkarte (Comic-Look, Federn, Glanz-Shader) |
| `skripte/effekte.gd` | Zahlen, Explosion, Münzen, Wackeln |
| `skripte/klang.gd` | selbst erzeugte Töne |
| `skripte/einstellungen.gd`, `einstellungen_panel.gd` | Regler |
| `skripte/aussehen.gd` | Farben, Schriften, Bilder |
| `daten/karten.json` | 12 Karten, Formen, Freundespaare (aus dem HTML-Spiel) |
