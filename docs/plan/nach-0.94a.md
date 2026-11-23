# Punkte für die Liste nach 0.94a

Während 0.94a gebaut wird, hier gesammelt; nach dem Bauen in `CLAUDE.md` Abschnitt 6 übernehmen.

1. **Umbau „Mehr Natur“ zum Auswählen, „Naturfläche ändern“ nur für bestehende Natur** (Chat 23.11., Tobi: Variante 1):
   - 🌱 Mehr Natur (`UMB.natur3`, Modul 08 ~Z. 61, Wirkung ~Z. 96, `natur3Cells` ~Z. 85): heute 3 zufällige Felder neben bestehender Natur. Neu: wie heute `natur` (`t:'free'`, `n:3`, `pick:'hab'`): bis zu 3 **freie** Felder antippen, „Fertig“ (`data-umbfin`), dann Lebensraum des Laufs wählen. Keine Pflicht, an bestehende Natur anzugrenzen.
     Text: „Bis zu 3 freie Felder werden Naturflächen eines deiner Lebensräume.“ Option „Naturfläche entfernen“ hier **nicht** anbieten.
   - 🌿 Naturfläche ändern (`UMB.natur`): nur noch **bestehende** Naturflächen (bis zu 3, auch bebaute? → nur unbebaute, damit kein Gehege auf falschem Lebensraum steht) wählen, dann anderen Lebensraum oder „entfernen“. Text: „Bis zu 3 Naturflächen bekommen einen anderen Lebensraum deines Laufs oder verschwinden.“
   - Verfügbarkeit (`umbOk` ~Z. 79): Mehr Natur nur, wenn es freie Felder gibt; Naturfläche ändern nur, wenn es unbebaute Naturflächen gibt.
   - Gewicht/Preis beider Umbauten unverändert. Test: Mehr Natur auf Feld ohne Natur-Nachbarn möglich, Lebensraum frei wählbar; Naturfläche ändern lehnt freies Feld ohne Natur ab.
2. **Sommerziele steigen stärker je Zoo** (Chat 23.11., Tobi nach Weltreise Stufe 4: Zoo 6 Sommer 539 % an 1 Tag; „Sommer darf ruhig etwas mehr steigen, Frühling so lassen“; Sammlerin/Stella Starr bleiben):
   `ZLSEAS` (Modul 05 ~Z. 153) Sommer 1,35 → **1,45** (Vorschlag, Wert noch zu bestätigen). Frühling 1,15, Herbst 1,6, Winter 1,55 unverändert. Zoo 1 bleibt gleich, Zoo 5 Sommer etwa ×1,33, Zoo 6 etwa ×1,42 gegenüber heute.
3. **Stufen neu: 5 statt 8, Ziele steigen mit jeder Stufe** (Chat 23.11., Tobi): `daten/stufen.json` neu (Frühling bleibt immer ×1, `stTF`):
   | Stufe | Verschärfung | `ziel`-Schritt | Ziele ab Sommer gesamt |
   |---|---|---|---|
   | 1 | Grundstufe | – | ×1 |
   | 2 | 15 Naturfelder · nur 1 goldenes Feld | 1,15 | ×1,15 |
   | 3 | Reinheit ab 6 Tieren · Shop/Stellenmarkt ×1,25 | 1,15 | ×1,32 (= heutige Stufe 4, Tobi hat sie gut geschafft) |
   | 4 | Krone ×1,15 · 1. Tag jeder Jahreszeit 1 Baupunkt weniger · 12 Naturfelder | 1,21 | ×1,6 |
   | 5 | Keine Besucherwünsche · keine Gold- und Kronenfelder · 9 Naturfelder | 1,25 | ×2,0 |
   Naturfelder-Zahlen gelten für 5 Tage, bei 4 Tagen ×0,8 (wie heute `natNow`). Stufen-Kasten (`stageBox`) rechnet die Summe selbst.
   Alte Spielstände umrechnen (laufende Läufe `run.stage` und freigeschaltete Stufen je Profil): alt 1 → 1, 2–3 → 2, 4–5 → 3, 6–7 → 4, 8 → 5. Stufenwahl mit 5 statt 8 Knöpfen (`.stgrid`), „🏔️ Alle Stufen“, Highscores/Protokoll zeigen die neue Nummer (alte Einträge umrechnen oder „(alt n)“).
   Alles, was „Stufe 8“ meint, gilt für Stufe 5 (Weltreise-Notiz „Ersatz für Stufen 7/8“, Endgame-Idee 7. Zoo). Freischaltungen, die eine Stufe nennen (z. B. Belugas „Zoo auf Stufe 2 oder höher“), prüfen. `docs/regeln.md` nachziehen.
4. **Futter und Weltreise immer an, Test-Schalter weg** (Chat 23.11., Tobi: „So wird das Spiel in Zukunft aussehen. Die Optionen kannst du weg machen, nur die 5-Tage-Option ist vielleicht noch nützlich“):
   - Lauf-Einrichtung (Modul 09 ~Z. 55, Klicks Modul 11 ~Z. 244–248): Schalter `data-zsfood` (🧺 Futter), `data-zswr` (🌍 Weltreise), `data-zsstall` (🏔️ Alle Stufen) entfallen; es bleibt nur „🐢 5 Tage“ (aus 0.94a).
   - Jeder neue Lauf: Futter an (`run.foodOff` nie gesetzt, `META.foodOff` ignorieren), Weltreise an (`run.wr` immer, `META.wr` ignorieren). Der normale Lauf ohne Weltreise ist dann nicht mehr wählbar; Code dafür darf bleiben (alte laufende Läufe ohne `wr` müssen weiter laden und zu Ende spielbar sein).
   - Auch der Menü-Schalter „🧪 Test: Verstärker an/aus“ (`META.testVerst`, Modul 08 ~Z. 260/386, Modul 11 ~Z. 212/232, Hinweis Modul 09 ~Z. 95) entfällt (Annahme: zählt zu „Optionen weg“, Tobi kann widersprechen). `run.tv`/`run.stTest` in alten Läufen weiter beachten.
   - Texte, die Weltreise/Futter als Option beschreiben (Schalter-Hinweise, Zoo-Buch-Regeln, `regeln.md`, Weltreise-Willkommen), anpassen. Highscores: das Kennzeichen „🌍 Weltreise“ wird überflüssig (nur noch bei alten Einträgen ohne Weltreise ggf. „klassisch“).
   - Tutorial unverändert (ohne Weltreise, Futter wie heute im Tutorial).
