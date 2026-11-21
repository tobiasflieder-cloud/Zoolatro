# Ensembles, Verstärker, Spezialisten, Auflagen-Kategorien (Chat 21.11.2026)

Quelle: Tabelle „Weltreise-Plan“, Blätter „Neue Ideen“ und „Auflagen-Kategorien“ (Stand Rev. 51). Tobi: „setz die anderen Sachen auf die Liste“.
Werte mit „Vorschlag“ in der Tabelle sind Claudes Vorschläge, von Tobi nicht gestrichen. Entwurf: `docs/stil/ensemble-verstaerker-entwurf.html`.
Der Shop bleibt, wie er ist (nach Frühling, Sommer, Herbst).

## A · Ensembles (wie Freundschaften zu entdecken)

Gruppe aus 3 passenden Karten, die **zusammenhängen** (jede grenzt an mindestens eine andere der Gruppe). Bonus gilt für jede der 3.
Auf dem Brett goldener Umriss + Schild, beim ersten Mal Einblendung „✨ Neu entdeckt · Ensemble“ (`bigPop`), im Zoo-Buch beim Reiter Freundschaften
(„Freundschaften & Ensembles“, unentdeckte als „???“). Daten am besten in eigener `daten/ensembles.json`, Wirkung über Kennung.

| Symbol | Name | Bedingung | Wirkung |
|---|---|---|---|
| 🍔 | Food Corner | 3 **verschiedene** Gastro-Gebäude | je ×1,25 B, +1 🪙 pro Tag |
| 🎠 | Vergnügungsmeile | 3 Attraktionen | je ×1,25 B |
| 🍃 | Stilles Eck | 3 scheue Tiere, keins gestresst | je ×1,2 N |
| 🐇 | Sicherer Hain | 3 Beutetiere, keins gestresst | je ×1,2 B und N |
| 🛡️ | Schutzzone | 3 bedrohte Tiere, keins gestresst | je ×1,5 B und N |

- Unter der Auflage „Gastronomische Vielfalt“ ist die Food Corner unmöglich – gewollt.
- Mehr als 3 zusammenhängende: zählt einmal als Ensemble (alle Karten der Gruppe bekommen den Bonus) – oder je 3er-Gruppe? Vorschlag: alle Mitglieder einer zusammenhängenden Gruppe ab 3 bekommen ihn, nur einmal je Karte.
- Ein Gehege kann in mehreren Ensembles stecken (z. B. bedroht + scheu): Boni multiplizieren.

## B · Show-Bonus

Showtier je benachbartes Gastro-Gebäude oder Attraktion **×1,35** statt ×1,25 (höchstens 2 zählen). Trubel und Tribüne verdoppeln weiter. Referenzfälle mit `aktualisiere`.

## C · Verstärker stärker und auffälliger

Aussehen wie im Entwurf: eigener violett-eisblauer Rahmen mit umlaufendem Leuchten, Wert groß in der Mitte, auf dem Brett Strahlen zu den verstärkten Nachbarn
mit „×1,5“-Schildchen, beim Zählen Einblendung „⚡ ×1,5 B“. `prefers-reduced-motion` beachten.

Verstärker werden zu **Promis** (frei erfundene Namen, keine echten Personen). Jede Karte bekommt unter der Wirkung einen kurzen **Story-Satz**
(kursiv, z. B. im Kartentext und im Zoo-Buch). Namen/Storys in `texte_de.json`, interne Kennungen bleiben (Spielstände!).

| heute | neu: Name (Promi-Typ) | Wirkung neu | Story |
|---|---|---|---|
| 🥣 Futterküche | **Chef Carmen** (TV-Koch, männlich) | ×1,5 N je benachbartes Gehege, Preis +1 | Chef Carmen eröffnet sein Pop-up-Lokal im Zoo, die Tiere nebenan bekommen das Beste vom Besten. |
| 🧭 Besucherlotse | **Mia Megaviral** (Influencerin) | ×1,5 B für alle Nachbarn, Preis +1 | Mia Megaviral streamt live aus dem Zoo, ihre Follower stürmen jedes Gehege in ihrer Nähe. |
| 🔦 Scheinwerfer | **Stella Starr** (Filmstar) | ×2,5 für das stärkste Nachbar-Gehege | Stella Starr dreht ihren neuen Film im Zoo, und das schönste Gehege bekommt die Hauptrolle. |
| 🎭 Bühne | **Nova** (Popstar) | Show-Bonus doppelt, bis ×2,5 | Nova gibt ein Konzert im Zoo, und die Showtiere tanzen mit. |
| ❄️ Winterquartier | **Sven Frost** (Abenteurer) | Nachbarn ohne Winter-Bedingung, dazu ×1,2 im Winter | Sven Frost überwintert im Zoo, und mit ihm frieren selbst die Nachbarn nicht. |
| 🤫 Ruhezone | **Luna Lotus** (Wellness-Guru) | kein Trubel für scheue Nachbarn, dazu ×1,25 N | Luna Lotus gibt Meditationskurse, und die scheuen Tiere finden endlich Ruhe. |

Symbol: Personen-Emoji (🧑‍🍳 Chef Carmen, 🤳 Mia Megaviral, 🎬 Stella Starr, 🎤 Nova, 🧗 Sven Frost, 🧘 Luna Lotus) – von Tobi bestätigt (Chat 21.11.).

## D · Neue Spezialisten (+ eine Änderung)

| Symbol | Name (Arbeitstitel) | Wirkung |
|---|---|---|
| 🏠 | Zweiraum-Planerin | Gruppen-Bonus ×1,1 B und N je Gehege mit 2 Feldern (wie Kleintier-Expertin/Architektin, `SPGRP`) |
| 🔭 | Wetterfrosch | Winter-Bedingung samt Schildern schon ab dem Frühling sichtbar (heute ab Herbst) |
| 🌿 | Naturpur-Leiterin | ×1,3 N für den ganzen Zoo, wenn höchstens 2 Gastro- und Attraktions-Gebäude zusammen stehen |
| 🍽️ | Kleine Küche (in der Tabelle noch „XXX“) | ×1,3 B für den ganzen Zoo bei höchstens 2 Gastro-Gebäuden |
| 🏞️ | Ruhige-Lage-Planer | ×1,3 B für den ganzen Zoo bei höchstens 2 Attraktionen |
| 🐑 | Beute-Hirtin | +2 B für jedes Beutetier je benachbartes Beutetier |
| 🎬 | Ensemble-Regisseur | Ensembles wirken stärker: ×1,25 → ×1,5 (×1,2 → ×1,4, ×1,5 → ×1,75) |
| 🌅 | Frühaufsteherin | ×1,5 am ersten Tag jeder Jahreszeit |
| 🏁 | Schlussspurt | ×1,4 am letzten Tag jeder Jahreszeit |
| 🧭 | Grenzgängerin | ×1,2 N für jedes Gehege, das an Gehege von 2 verschiedenen Lebensräumen grenzt |

Raubtier-Kenner gibt N statt B: schon Punkt 3 der Liste 0.89a. Stufe (tier) und Freischaltung der neuen Spezialisten: Vorschlag tier 2, frei von Anfang an,
Wetterfrosch/Ensemble-Regisseur tier 3. Texte in `texte_de.json`, Daten in `spezialisten.json`, Wirkung in `SPEZ_WIRKUNG`.

## E · Zoo-Auflagen in Kategorien

- Jede Auflage gehört zu einer Kategorie: **Platz & Gelände · Gebäude · Limitierung · Lebensräume · Vorlieben · Ziel (nur Weltreise)**.
  Regel beim Auslosen (`ruleRoll`, Weltreise `wrRollOpts`): **keine Kategorie zweimal in einem Lauf**, solange noch eine unbenutzte möglich ist (bei 4 Zoos kommen nicht alle dran).
- **Limitierung** verbietet etwas, **Vorlieben** ändern Werte (Bonus/Malus).
- In der Weltreise passt jede Auflage zu bestimmten Kontinenten (Spalte „Passt zu Kontinent“, „alle“ = überall, „Europa nie“). Pro Ziel nur passende Auflagen auslosen.
- Bestehende Schwierigkeit (leicht/mittel/schwer) und die Regeln aus 0.88a/0.89a (nie nur leicht, verbotene Paare wie zerklüftet + Eingang) bleiben.
- Daten am besten in `daten/auflagen.json` (Kennung, Kategorie, Schwierigkeit, Kontinente), Wirkung weiter im Code.

| Kategorie | Auflage | Schwierigkeit | Kontinente | Regel | neu? |
|---|---|---|---|---|---|
| Platz & Gelände | 🚪 Eingang | mittel | alle | wie heute (ohne „ein Feld frei“, Punkt 5) | |
| Platz & Gelände | 🚧 Baugrube | mittel | alle außer Europa | wie heute | |
| Platz & Gelände | 🚧 Bauabschnitte | leicht | alle | wie heute | |
| Platz & Gelände | 🌳 Baumschutz | schwer | Südamerika, Asien | wie heute | |
| Gebäude | 🍽️ Gastronomische Vielfalt | leicht | alle | wie heute | |
| Gebäude | 🚶 Besucherwege | leicht | alle | wie heute | |
| Gebäude | 🎡 Attraktionsviertel | leicht | Nordamerika, Australien | wie heute | |
| Gebäude | 🔌 Anschluss | mittel | alle | wie heute | |
| Gebäude | 🌳 Artenschutz am Naturfeld | leicht | Afrika, Südamerika | wie heute | |
| Limitierung | 🏚️ Lockere Bebauung | mittel | Australien, Nordamerika | wie heute | |
| Limitierung | 🏗️ Großbaustelle | mittel | Polargebiete | wie heute | |
| Limitierung | 📦 Weniger ist mehr | leicht | alle | wie heute | |
| Limitierung | 🎪 Höchstens 3 Showtiere | mittel | Südamerika, Asien | höchstens 3 Showtier-Gehege im Zoo | neu |
| Limitierung | 🦁 Höchstens 2 Raubtiere | mittel | Afrika | höchstens 2 Raubtier-Gehege im Zoo | neu |
| Limitierung | 🧺 Kleiner Etat | mittel | alle außer Europa | pro Jahreszeit höchstens 3 Käufe im Shop (Karten, Futter, Umbauten) | neu |
| Limitierung | 🐘 Kleine Gehege | leicht | Asien | höchstens 2 Gehege mit 4 Feldern | neu |
| Lebensräume | 🚫 Raubtier-Abstand | mittel | Afrika, Nordamerika | wie heute | |
| Lebensräume | ✋ Höchstens drei | schwer | alle | wie heute | |
| Lebensräume | 🏝️ Inselzoo | schwer | Australien, Südamerika | wie heute | |
| Lebensräume | 🌿 Lebensraum als Grundlage | schwer | alle | wie heute | |
| Lebensräume | 🔀 Durchmischt | schwer | Südamerika, Asien | zwei Gehege desselben Lebensraums dürfen sich nicht berühren | neu |
| Lebensräume | 🎯 Schwerpunkt-Pflicht | mittel | alle außer Europa, nur Weltreise | mindestens die Hälfte der Gehege aus dem Schwerpunkt-Lebensraum (Prüfung Ende Winter wie Ziel-Auflagen) | neu |
| Vorlieben | 🤫 Stille Wildnis | leicht | Asien, Polargebiete | scheue Tiere ×1,5, Showtiere ×0,5 | neu |
| Vorlieben | 🎭 Showtime | leicht | Nordamerika | Showtiere ×1,5, scheue Tiere ×0,5 | neu |
| Vorlieben | 🌱 Naturnah | leicht | alle | Gehege auf passender Naturfläche ×1,25, ganz ohne passende Naturfläche ×0,8 | neu |
| Vorlieben | 🍿 Feinschmecker | leicht | alle außer Europa | Gastro ×1,5, Attraktionen ×0,5 | neu |
| Vorlieben | 🎢 Nervenkitzel | leicht | Nordamerika, Australien | Attraktionen ×1,5, Gastro ×0,5 | neu |
| Vorlieben | 🦒 Großwild-Fans | mittel | Afrika | Gehege ab 3 Feldern ×1,5, Gehege mit 1 Feld ×0,5 | neu |
| Vorlieben | 🔴 Artenschützer | leicht | Asien, Südamerika | bedrohte Tiere ×1,5, Raubtiere ×0,5 | neu |
| Ziel | ⭐ Ausbau-Ziel, 🎨 Vielfalt, 🍽️ Schlemmermeile, 🎡 Rummelplatz, 🐾 Artenschutz-Ziel, ⭐ Vorzeigegehege, 🍼 Nachwuchs, 🦓 Auswilderung | wie heute | siehe Tabelle | wie heute | |

Vorlieben-Faktoren wirken je Gehege/Gebäude (B und N), sichtbar als Schild und im Detail-Fenster. Europa (Ruhe-Zoo) bleibt ohne Auflage.
