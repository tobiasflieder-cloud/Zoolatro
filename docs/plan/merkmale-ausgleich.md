# Plan: Merkmale ausgleichen (Show, Scheu, Raubtier/Beute) – Stand 26.11.2026

Anlass (Tobi, Chat 26.11.): Auf hohen Stufen braucht man Showtiere und ihre Boni. In den Stufe-5-Protokollen stehen unter „Beste“ fast nur Showtiere
(Korallenriff, Yakweide, Mufflons, Papageien, Affen, Seelöwen, Skorpione). Ziel: **mehrere gleich starke Wege**, Show etwas schwächer.

Status: **Vorschlag, Zahlen und Zuordnung von Tobi noch zu bestätigen.** Noch kein Bauauftrag.

## Ist-Stand (Code)

- Show (`evalB`, Modul 04 Z. ~233/273): je benachbartes Gastro/Attraktion (egal ob ruhig/trubel) ×1,35 (Belugas 1,45, Leckerli 1,5), Nova verdoppelt, höchstens ×2,5, auf B **und** N. Ohne Auslöser „gelangweilt“ ×0,8 B.
- Scheu (`strOf`, Z. ~282): Stress durch nicht-ruhige Gastro/Attraktionen im Umkreis **2** (`nbrs2`; Profil Dschungel: nur Nachbarn). Kein eigener Bonus.
- Beute: Stress durch Raubtiere im Umkreis **2**. Raubtier: kein eigener Bonus (nur Spezialisten Jagdrevier usw.).
- Merkmale `ruhig`/`trubel` (`daten/merkmale.json`): 9 ruhig, 13 trubel, **20 Gastro/Attraktionen ohne beides**.
- Verstärker (Promis): mehrere können auf dasselbe Gehege wirken.

## Vorschlag

### 1. Jedes Gastro-Gebäude und jede Attraktion ist ruhig oder trubelig
Neu zugeordnet (in `merkmale.json`, `karten.json` `tags`):

| Karte | Seltenheit | neu |
|---|---|---|
| Popcornstand | gewöhnlich | 🎉 trubel |
| Eiswagen | gewöhnlich | 🤫 ruhig |
| Zoo-Café | gewöhnlich | 🤫 ruhig |
| Souvenirshop | gewöhnlich | 🎉 trubel |
| Beduinenzelt | gewöhnlich | 🤫 ruhig |
| Berghütte | gewöhnlich | 🤫 ruhig |
| Getränkestand | selten | 🎉 trubel |
| Crêpes-Wagen | selten | 🎉 trubel |
| Safari-Bistro | selten | 🤫 ruhig |
| Pizzeria | selten | 🎉 trubel |
| Streichelzoo | gewöhnlich | 🎉 trubel |
| Spielplatz | gewöhnlich | 🎉 trubel |
| Karussell | gewöhnlich | 🎉 trubel |
| Zoo-Bahn | selten | 🎉 trubel |
| Aquarium | selten | 🤫 ruhig |
| Seilbahn | selten | 🤫 ruhig |
| Eisbahn | winter | 🎉 trubel |
| Weltzoo-Pavillon | meilenstein | 🤫 ruhig |

Ergebnis: gewöhnliche Karten 7 trubel / 8 ruhig, insgesamt 23 trubel / 17 ruhig.

### 2. Show nur noch durch Trubel, etwas schwächer
- Auslöser: nur **trubelige** Nachbarn (ruhige zählen nicht mehr).
- Je Auslöser **×1,3** (statt 1,35), Belugas 1,4, Leckerli 1,45, Nova weiter doppelt, höchstens **×2,25** (statt 2,5).
- Gelangweilt (kein trubeliger Nachbar) bleibt ×0,8 B.

### 3. Scheu bekommt das Gegenstück: Ruhe-Bonus
- Je **ruhiger** Nachbar (Gastro/Attraktion) **×1,3** auf B und N, höchstens **×2,25** (wie Show).
- Stress weiter durch **trubelige** Nachbarn (siehe 4). Luna Lotus (Ruhezone) bleibt Schutz gegen Stress.

### 4. Störeffekt wieder nur 1 Feld
- Scheu: Stress nur durch direkt benachbarte trubelige Gastro/Attraktionen.
- Beute: Stress nur durch direkt benachbarte Raubtiere.
- Achtung: Profil-Regel „Dschungelforscher“ (heute: scheu nur Nachbarn statt Umkreis 2) wird dadurch wirkungslos → neue kleine Regel nötig (Vorschlag: Ruhe-Bonus für scheue Tiere ×1,35 statt ×1,3).

### 5. Nur ein Verstärker je Gehege
- Liegen mehrere Promis an einem Gehege, wirkt **nur der stärkste** (der mit dem größten Zuwachs für dieses Gehege). Anzeige: die anderen Linien/Strahlen grau, Hinweis „wirkt schon: …“.

### 6. Raubtier und Beute: eigener Hebel (anderes Prinzip als Show/Scheu)
Show/Scheu hängen an **Gebäuden** daneben; Raubtier/Beute an **Tieren** und am **Abstand**:
- **Beute – Herdenschutz:** je benachbartes **anderes Beute-Gehege** ×1,2 (B und N), höchstens ×2,0. Beute will Gruppen bilden.
- **Raubtier – Revier:** je Beute-Gehege in **genau 2 Feldern Abstand** (nicht direkt daneben) ×1,25, höchstens ×2,25. Das Raubtier „beobachtet“ die Herde, darf aber nicht daneben stehen (sonst Stress bei der Beute).
- Ergibt ein Knobel-Bild: Beute-Herde in der Mitte, Raubtiere im Ring mit einem Feld Abstand.
- Zu prüfen: Überschneidung mit der Savannen-Herdenregel (`HERD3`), Spezialisten Jagdrevier/Dompteur/Frieden, Ensemble „Sicherer Hain“.

## Offene Fragen an Tobi
1. Zuordnung ruhig/trubel so ok?
2. Zahlen Show ×1,3 / max ×2,25, Scheu gleich?
3. Raubtier/Beute-Hebel so (Herdenschutz + Revier im Abstand 2)?
4. Profil Dschungelforscher: Ersatzregel ×1,35 ok?
