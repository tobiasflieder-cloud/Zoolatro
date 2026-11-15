# 🌍 Weltreise – Plan (Stand 15.11.2026)

Abgestimmt mit Tobi im Chat (14./15.11.2026). Arbeitstabelle: Claude-Sheet „Weltreise-Plan“ (dieser Text ist der Stand daraus).
Entwürfe: `docs/stil/weltreise-entwurf.html` (Kontinent-Wahl als Liste + Ankunft beim Zoo-Start),
`docs/stil/weltkarte-entwurf.html` (gezeichnete Weltkarte, kommt in einem späteren Schritt).

## Idee
Zwischen den Zoos wählt man das nächste Ziel aus 2–3 Kontinenten. Jedes Ziel hat einen Lebensraum-Schwerpunkt im Gelände
und eine Auflage mit passender Belohnung. Abwägung: „passt zu meinem Deck“ gegen „was bringt mir die Belohnung“.

## Modus
- Eigener Schalter „🌍 Weltreise“ in der Profilauswahl (neben 🥕 Futter und 🧪 4 Tage), kombinierbar mit „Testlauf 4 Tage“. Wird später der normale Lauf.
- Lauflänge: **4 Zoos**; mit Arktis freigeschaltet **5**, mit Gebirge freigeschaltet **6**.
- Saisonziele: gleiche Kurve wie bisher, für Zoo 5/6 einfach fortgesetzt.
- Highscores: Vergleich bis zum letzten gemeinsamen Zoo. Freischaltungen dürfen an 5 Zoos gebunden bleiben.
- Stufen: die Naturfelder-Stufen (2, 7, 8) sind im Weltreise-Modus aus. **Ab Stufe 2 nur 2 Ziele zur Wahl.** Ersatz für 7/8 kommt später.

## Ziele (Kontinente)
Ziele sind Orte auf einem Kontinent (z. B. „Afrika · Kalahari“), damit sich ein Kontinent wiederholen darf.

| Kontinent | Schwerpunkt (einer wird ausgelost) | verfügbar |
|---|---|---|
| Afrika | Savanne oder Wüste | von Anfang an |
| Australien | Wasser oder Wüste | von Anfang an |
| Südamerika | Dschungel oder Wasser | von Anfang an |
| Asien | Dschungel oder Savanne | von Anfang an |
| Europa | keiner (Ruhe-Zoo) | von Anfang an |
| Antarktis | Arktis oder Wasser | nach Freischaltung Arktis |
| Himalaya | Gebirge oder Savanne | nach Freischaltung Gebirge |

- Auswahl zufällig; **wenn möglich immer 3 Ziele, nie nur schwere**. Vor Zoo 1 auch eine Wahl, dann nur leichte und mittlere Auflagen.
- Ein Kontinent wird nicht angeboten, wenn keiner seiner beiden möglichen Schwerpunkte im Lauf gewählt ist; ist nur einer gewählt, wird dieser genommen.
- **Europa** = Ruhe-Zoo: kein Schwerpunkt, keine Auflage, keine Belohnung, Naturflächen wie heute (gleich verteilt). Springt ein, wenn sonst keine 3 Ziele zusammenkommen.
- Kein Ausgleich der Ziele danach, wie gut ein Kontinent passt.

## Gelände
- Etwa **die Hälfte** des Feldes sind Naturflächen (Testlauf 4 Tage anteilig wie heute).
- Rund **zwei Drittel** davon im ausgelosten Schwerpunkt; die übrigen **gewählten** Lebensräume teilen sich den Rest gleichmäßig.
- Natur-Flecken 4–7 Felder (heute 2–4). Geländeform bleibt zufällig.
- Hinweis: Auf Naturflächen sind nur Gehege **anderer** Lebensräume gesperrt; Gastro, Attraktionen, Naturschutz dürfen dort stehen (siehe `fits`).

## Auflagen (ersetzen die zufällige Auflage beim Zoo-Start)
Ziel-Auflagen: **Frist Ende Winter, sonst ist der Zoo gescheitert.** Schild mit Stand in der Leiste (im Winter rot), eigener Text im Scheitern-Fenster.

| | Name | Stufe | Regel | Art |
|---|---|---|---|---|
| 🍽️ | Gastronomische Vielfalt | leicht | Gastro-Gebäude nicht direkt nebeneinander | bisher (`gastro`) |
| 🚶 | Besucherwege | leicht | Attraktion/Gastro braucht ein freies Nachbarfeld, auch später | bisher (`wege`) |
| 🌳 | Artenschutz am Naturfeld | leicht | Naturschutz-Gebäude grenzt an eine Naturfläche | bisher (`schutzn`) |
| 🎡 | Attraktionsviertel | leicht | Alle Attraktionen hängen zusammen | bisher (`viertel`) |
| 🚧 | Bauabschnitte | leicht | Im Frühling nur eine Hälfte bebaubar | bisher (`halb`) |
| 📦 | Weniger ist mehr | leicht | Jedes Gebäude nur einmal | bisher (`einzel`) |
| 🔌 | Anschluss | mittel | Attraktion nur neben ein schon gebautes Gebäude | bisher (`anschl`) |
| 🚧 | **Baugrube** | mittel | 5 **zusammenhängende** Felder bleiben frei (markiert) | umgebaut aus `achse` (Sichtachse, 6 in einer Linie) |
| 🚪 | Eingang | mittel | Am Rand liegt der Eingang, alles verbunden | bisher (`eingang`) |
| 🚫 | Raubtier-Abstand | mittel | Raubtier nicht neben Beute | bisher (`raub`) |
| 🏚️ | Lockere Bebauung | mittel | Neues grenzt an höchstens 3 andere | bisher (`locker`, im Testlauf 4 Tage aus) |
| 🏗️ | Großbaustelle | mittel | Höchstens 2 Karten pro Tag bauen/ausbauen | bisher (`gross2`) |
| ⭐ | Ausbau-Ziel | mittel | Mindestens 3 Gehege auf Stufe II | neu, Ziel |
| 🎨 | Vielfalt | mittel | Jeder gewählte Lebensraum mit mindestens 2 Gehegen | neu, Ziel |
| 🍽️ | Schlemmermeile | mittel | Mindestens 5 Gastro-Gebäude | neu, Ziel (Name Arbeitstitel) |
| 🎡 | Rummelplatz | mittel | Mindestens 5 Attraktionen | neu, Ziel (Name Arbeitstitel) |
| 🐾 | Artenschutz-Ziel | mittel | Mindestens 2 bedrohte Tiere (Gehege zählen) | neu, Ziel |
| ✋ | Höchstens drei | schwer | Höchstens 3 Gehege desselben Lebensraums zusammenhängend | bisher (`max3`) |
| 🏝️ | Inselzoo | schwer | Gehege verschiedener Lebensräume berühren sich nicht | bisher (`insel`) |
| 🌿 | Lebensraum als Grundlage | schwer | Gebäude nur an Gehege eines Lebensraums | bisher (`grundl`) |
| 🌳 | Baumschutz | schwer | Attraktion/Gastro/Naturschutz nicht auf Naturflächen | bisher (`baum`) |
| 🦓 | Auswilderung | schwer | 1. Sommertag und 1. Wintertag: je ein zufälliges Gehege weg, Karte aus dem Deck | neu, Ereignis |
| ⭐ | Vorzeigegehege | schwer | Mindestens 2 Gehege auf Stufe III | neu, Ziel |
| 🍼 | Nachwuchs | schwer | Mindestens 1 Jungtier im Zoo | neu, Ziel |

## Belohnungen (Kopplung: leicht → keine · mittel → sofort · schwer → dauerhaft)
**Sofort** (für diesen Zoo bzw. einmalig):
🎁 Mitbringsel – eine seltene/legendäre Karte zur Wahl · 🥕 Volle Speisekammer – 2 Extra-Futter ·
📣 Partnerschaft – ein zufälliges Förderprogramm gratis, nur dieser Zoo · ✨ Prägung nach Wahl für eine Karte ·
📁 Bewerberflut – 1 Profi-Bewerbermappe · 🧰 Bauoffensive – 2 Umbaukisten.

**Dauerhaft** (Rest des Laufs, jeder höchstens einmal pro Lauf):
🪙 Goldader – +1 Goldfeld in jedem weiteren Zoo · 🔨 Fleißige Helfer – +1 BP am 1. Tag im Frühling und im Sommer ·
🧑‍🔬 Gastforscher – +1 Bewerber im Stellenmarkt · 🪨 Leichter Boden – 3 Felsen weniger in jedem weiteren Zoo.
Gesammelte dauerhafte Boni sieht man bei der Kontinent-Wahl („Deine Boni“) und im Zoo-Menü.

## Zwischen den Zoos
- Prägungs-Schritt entfällt (✨ ist jetzt eine Belohnung).
- Kartenwahl bleibt (1–2 seltene statt 3, kommt schon mit 0.84a für beide Modi), Karten entfernen und Bewerbermappe bleiben.
- Danach die Kontinent-Wahl, beim Zoo-Start Einblendung „Willkommen in …“ mit Auflage und Belohnung (ersetzt die Auflage-Einblendung).

## Jahreszeiten
Ein Thema je Jahreszeit: Frühling Auflage · **Sommer Besucherwunsch (nur noch im Sommer)** · Herbst Winter-Vorschau · Winter Winter-Bedingung (unverändert).

### Besucherwünsche im Weltreise-Modus (stärkere Belohnung, weil nur einmal pro Zoo)
| | Wunsch | heute | neu |
|---|---|---|---|
| 💧 | 2 Gehege eines Lebensraums (`hab2`) | +15 Taler | +30 Taler |
| 🍦 | 3 verschiedene Gastro (`gastro3`) | 1 Gratis-Neuziehen | 2 Gratis-Neuziehen |
| 🦓 | **6** verschiedene Tierarten (`arten5`, heute 5 und nur Frühling) | 1 Gratis-Neuziehen | 2 Gratis-Neuziehen, **im Sommer erlaubt** |
| 🐘 | Gehege mit 4 Feldern (`big4`) | +15 Taler | 1 Umbaukiste |
| 🔴 | 2 bedrohte Arten (`rote2`) | +20 Taler | +40 Taler |
| 🎭 | Showtier mit vollem Show-Bonus (`show`) | +15 Taler | +35 Taler |
| 🐭 | 4 Gehege mit 1 Feld (`small4`) | +1 BP nächster Tag | +1 BP an den nächsten 2 Tagen |
| 🏗️ | 4 Karten an einem Tag (`day4`) | 1 Gratis-Neuziehen | 1 Futtersack |
| 🌳 | 3 Naturschutz zusammenhängend (`schutz3`) | zufällige Karte ⭐ Star | Karte **nach Wahl** ⭐ Star |
| ⭐ | Stufe III (`lvl3`) | zufällige Karte 🪙 Gold | Karte **nach Wahl** 🪙 Gold |
| 😌 | Ruhige Tiere ohne Stress (`calm`) | +1 BP nächster Tag | 1 Bewerbermappe |
| ⏱️ | 2 Tage früher (`early`) | +25 Taler | **gestrichen** (bei 4 Tagen kaum machbar, Glückssache) |

Im normalen Modus bleiben Wünsche und Belohnungen wie heute.

## Für später
- Gezeichnete Weltkarte statt Liste (`docs/stil/weltkarte-entwurf.html`), echtes Gelände als Vorschau.
- Ersatz für die Stufen 7 und 8 im Weltreise-Modus.
