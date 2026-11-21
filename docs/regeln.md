# Zoolatro – Spielregeln (Stand 0.73a)

Vorlage für einen Nachbau (z. B. in Godot). Beschrieben ist das, **was der Code tut**. Wo Kommentar, Hilfetext oder alte Tests etwas
anderes sagen, steht das unter „⚠️ Unklar/Widerspruch“ (gesammelt in Abschnitt 13).
Verweise: `Datei:Funktion` bezieht sich auf `quelltext/src/`. Die Referenzfälle in `tests/referenz/faelle/` zeigen die Wertung an
50 echten Aufstellungen (siehe `tests/referenz/README.md`).

Kurzform: Man baut auf einem Hexfeld-Gelände Gehege und Gebäude aus Handkarten. Jeden Abend ergibt **Besucher (B) × Natur (N)** die
Tagespunkte. Eine Jahreszeit hat 5 Tage und ein Punkteziel. Vier Jahreszeiten sind ein Zoo, fünf Zoos sind ein Zoolatro-Lauf.

---

## 1. Grundbegriffe

### 1.1 Gelände (`01:setBoard`, `01:hexDisc`, `04:genMap`)
- **Hexfelder** in Achsen-Koordinaten `(q,r)`, Schlüssel `"q,r"` (`01:hk`). Nachbarn über `DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]`.
  Die Reihenfolge der Richtungen ist wichtig (Drehung).
- `BOARD` = Liste der Felder, `ONBOARD` = Menge. `TERR` = Map Feld → Geländeart:
  - `'block'` = Felsen (nicht bebaubar, außer mit Spezialist Sprengmeister `spreng`),
  - ein Lebensraum (`wasser`, `savanne`, `wald` = Dschungel, `wueste`, `arktis`, `gebirge`) = **Naturfläche**,
  - kein Eintrag = normales Baufeld.
- **Randfeld** (`isEdge`): Feld mit mindestens einem Nachbarn außerhalb von `BOARD`.

### 1.2 Karten (`daten/karten.json` → `01:CARDS`, Wirkungen in `01:KARTEN_WIRKUNG`)
Jede Karte hat: `cat` (Kategorie), `a` (Grund-Besucher B), `s` (Grund-Natur N), `shape` (Form), optional `hab` (Lebensraum),
`tags`, `rar` (Seltenheit), `bonus` (Nachbar-Bonus, Funktion), `km` (Kombo-Faktor), `mult` (Zoo-Multiplikator), `tal` (Taler je Tag).
- **Kategorien** (`01:CAT`): `gehege`, `attr` (Attraktion), `essen` (Gastro & Shops), `schutz` (Naturschutz), `verst` (Verstärker).
- **Formen** (`01:SHAPES`): `s1` 1 Feld · `s2` 2 · `l3` 3er-Reihe · `t3` Dreieck · `b3` Bogen · `l4` 4er-Reihe · `d4` Raute · `z4` Zickzack.
  Drehung: `rotCells` wendet `rot`-mal `(q,r) → (−r, q+r)` an (60°-Schritte). Platzieren: `placeCells(key,rot,q,r)` = gedrehte Form + Anker.
- **Tags**: `bedroht` (Rote Liste), `gross`, `einmalig` (nur einmal je Zoo baubar, mit Sammler 2×). Merkmale aus `01:TRAITS`:
  `raubtier`, `beute`, `scheu`, `show`, `ruhig`, `trubel` (`traitsOf`; im Tutorial ausgeblendet).
- **Kartenschlüssel** (`basis~variante#futter1.futter2^prägung`): `CARDS` ist ein Proxy, der aus dem Schlüssel eine Karte mit Futter,
  Variante und Prägung macht. `baseK(k)` liefert die Grundart. Futter: `04:fdOf(k)`.
- **Gebäude im Zoo**: `{id, key, cells:[[q,r],…], lvl (1–3), pr (Prägung), ed (Veredelung), ate/ea/es (Jäger)}`. Die Drehung wird nicht
  gespeichert, nur die Felder. Die Referenzfälle rechnen `rot` und `anchor` zurück.

### 1.3 Bauen (`04:fits`, `01:costOf`)
- Alle Felder müssen auf dem Gelände liegen und frei sein, es darf kein Storchennest darauf sein.
- **Felsen** sind gesperrt (außer mit Sprengmeister). Auf **Naturflächen** sind nur **Gehege anderer Lebensräume** gesperrt
  (`fits`: `c.cat!=='gehege'||c.hab===t`). Attraktionen, Gastro und Naturschutz dürfen auf Naturflächen stehen (außer mit der Auflage 🌳 Baumschutz).
  Ausnahme: Wildhüterin `rb_wild` gibt alle Naturflächen auch für fremde Gehege frei, der Natur-Bonus gilt aber nur auf der passenden.
- `einmalig`-Karten nur einmal je Zoo.
- **Baupunkte-Kosten** (`costParts`/`costOf`): Anzahl Felder, Gehege mit ≥4 Feldern 1 weniger, mindestens 1.
  Dazu Profil-Regeln (Freizeit: Attraktion −1, Steppe: 4-Feld-Gehege −1 und 1-Feld-Gehege +1, Dschungel: Attraktion +1),
  Zuschläge (Polier an Tag 1 bei 1-Feld-Karten +1, Teuerung +1), Prägung `leicht` −1, Leichtbauer `rb_leicht`: 1-Feld-Karten 0 BP
  (höchstens 2 je Tag). In der Bau-Modus-Phase des Umbaus (`umbBm`) kostet alles 0.

---

## 2. Wertung eines Gebäudes: `04:evalB(b, bs, idx, parts)`

Eingaben: das Gebäude `b`, alle Gebäude `bs`, Index Feld → Gebäude `idx`. Nachbarn `nb` = alle Gebäude, die an mindestens ein Feld
von `b` grenzen (`04:nbrs`). „Umkreis 2“ = `04:nbrs2` (alle Gebäude bis 2 Felder entfernt). Der Rechenkontext `CTX` kommt aus
`05:syncCtx` (Jahreszeit, Winter, Team, Profil, Zoolatro-Daten …).

Die Schritte laufen **genau in dieser Reihenfolge**. „+x“ addiert. „×f“ bedeutet: zum aktuellen Wert wird `round(max(0,wert)·(f−1))`
addiert, getrennt für B und N. Negative Werte werden also nicht vervielfacht. Jeder Schritt erzeugt eine Zeile `parts` mit Text und
Betrag, das sind die Zeilen in den Referenzfällen.

1. **Grundwert** `a=c.a`, `s=c.s`. Spezialist Querdenker `quer`: bei Attraktion/Gastro B und N tauschen.
2. **Lebensraum** (nur wenn die Karte `hab` hat):
   - `+1 B` je benachbartes **Gehege** desselben Lebensraums („-Nachbarn“).
   - `+1 N` je **eigenes Feld** auf passender Naturfläche („-Naturfläche“).
   - Profil Küste: Wasser-Gehege `+1 N` je benachbartes Wasser-Gehege („Schwarm“), Wüsten-Gehege `−1 N`.
   - Profil Alpen: Gehege `+1 B` je benachbarten Felsen, höchstens +2 (`rocksNb`).
   - **Winterkälte**: im Winter Savanne/Wüste `−1 B` (nicht mit Winterquartier daneben, Winterfest `rb_winter` oder Tropenhaus daneben).
   - **Sommerhitze**: im Sommer Arktis/Gebirge `−1 B` (Arktis nicht mit Polarstation daneben). (`01:cold`, `01:hot`)
3. **Kartenbonus** `c.bonus(nb,bs,b)` → `+a,+s` (je Karte eigene Funktion in `01:CARDS`).
4. **Futter, feste Werte** (`04:fdOf`): Kraftfutter `kf` +2/+2 · Beeren `be` +3 N · Möhrchen `mo` +3 B · Mehlwürmer `mw` +3 N ·
   Großpackung `gp` +3/+3 · Honig `ho` +1 B je Gastro im Umkreis 2.
   **Lebensraum-Futter** (`run.fdl[hab]=n`, nur Gehege): `+2^(n−1)` B und N (`04:fdLvB`: Stufe 1 → +1, 2 → +2, 3 → +4 …).
5. **Feste Boni und Faktor-Boni sammeln** (seit 0.76a Faktoren statt Prozente):
   - Förderprogramme `PROGS[id].per`, Werbung `ADS[id].per`, Spezialisten `SPEC[id].per`: liefern entweder feste `{a,s}` (sofort addiert)
     oder einen Satz `{pa,ps,n}` (gesammelt). Spezialisten wirken nicht im **Streik** (Taler < 0 und Team nicht leer, `01:strike`).
   - Ereignisse der Jahreszeit `EVENTS[id].per` (fest; Eventmanager schneidet Minus ab), Lauf-Boni `RUNB` (fest, × Anzahl).
   - Umrechnung `04:pctF`: Satz X → Faktor **×(1 + 0,8·X), gerundet auf 0,05** (0,15 → ×1,1 · 0,2 → ×1,15 · 0,25 → ×1,2 · 0,3 → ×1,25 ·
     0,4 → ×1,3 · 0,5 → ×1,4 · 0,6 → ×1,5); Abzüge bleiben (−0,1 → ×0,9). „Je Stück“ (`n`): Faktor hoch n.
   - Weitere: Futterküche daneben ×1,25 N (Gehege) · Aquarium daneben ×1,15 N je Aquarium (Wasser-Gehege) · Besucherlotse daneben ×1,25 B ·
     Prägung Gold ×1,2 B · Veredelung Gold ×1,2 B je Stück · Naturbund ×1,1 N je Naturfeld · Bauleiterin ×1,1 B und N je Ausbaustufe.
   - Plus-Förderprogramme (ab Zoo 3) liefern direkt den Faktor `{fa,fs}` = 1 + (Faktor − 1)·1,5 (passt zum Text).
   - **Die Faktoren werden nacheinander multipliziert**, jeweils auf `max(0, aktueller Wert)`, in der Reihenfolge Programme, Werbung,
     Spezialisten, Futterküche, Aquarium, Besucherlotse, Gold, Gold-Ausgabe.
6. **Prägung Lieblingstier** `liebling`: `+z` B und N mit z = Nummer des Zoos (1–5).
7. **Nur im Zoolatro-Lauf** (`CTX.zl`):
   - **Veredelung Schimmernd** (`ed` mit n× `s`): ×(n+1).
   - **Goldenes Feld** (`Z.gold`): je eigenes Feld auf einem goldenen Feld ×2. **×4-Feld** (`Z.g4`): je Feld ×4.
     Seit 0.72a **nacheinander multipliziert** (jeweils auf `max(0,aktueller Wert)`): Schimmernd + 1 Goldfeld = ×4, 2 Goldfelder = ×4,
     2× Schimmernd + 2 Goldfelder = ×12. Reihenfolge: erst Schimmernd, dann die Felder in der Reihenfolge von `b.cells`.
   - **Winter-Bedingung** (Abschnitt 6), wenn Winter, kein Winterquartier daneben, nicht Arktis-Gehege mit Profil Polar.
     Gerechnet mit `inspFx`; Winterfest halbiert Nachteile.
8. **Jungtier** (`c.jt`): neben einem Elterntier (`c.par`) oder mit Aufzuchtmilch `mi` **×2** („Familie“).
9. **Prägung Star** `star`: ×1,25.
10. **Futter-Faktoren**: Frühlingsgras/Wassermelone/Kürbis/Wintervorrat je ×1,5 in ihrer Jahreszeit, Goldhafer ×1,5 immer (multipliziert).
11. **Scheinwerfer** (Verstärker) daneben: das stärkste benachbarte Gehege (nach `a+s` der Karte, bei Gleichstand kleinere id, `04:spotOf`) ×1,5.
12. **Show und Stress** (nicht im Tutorial):
    - **Schutz vor Stress** („vet“): Beruhigungskräuter `kr`, Tierarzt daneben, scheues Tier mit Regenkuppel daneben, Antilopen neben
      Naturschutz, scheues Gebirgstier mit Bergwacht daneben.
    - **Raubtier-Stress** (Beutetier): Anzahl Raubtiere im Umkreis 2 ohne Knochen `kn` (Ereignis „Ausbruch“ ×2). Aus mit Dompteur,
      Friedensstifter oder Jagdrevier.
    - **Trubel-Stress** (scheues Tier): Gastro/Attraktionen ohne `ruhig` im Umkreis 2, mit Profil Dschungel nur direkt daneben.
      Aus mit Ruhezone daneben, Spezialist Ruhepol, Partyzoo.
    - Ein Gebäude ist höchstens **einfach** gestresst (`st=min(1,…)`). Es verliert selbst nichts, sondern zählt für den Zoo-Faktor (Abschnitt 3).
    - **Showtier** (`show`): `sh = min(4, min(2, normale Gastro/Attraktionen daneben + Bühne + 2 bei Savanne neben Bistro) + 2·(Trubel-Gastro/-Attraktionen daneben + Tribünen im Umkreis 2, nicht direkt daneben))`.
      Faktor (0.90a, `04:showF`) `f = min(2,5, 1 + (Leckerli 0,5 | Belugas 0,45 | sonst 0,35) · sh · (Nova/Bühne daneben 2))`, auf 0,05 gerundet; Zuschlag `round(max(0,a)·(f−1))`.
    - Jagdrevier/Partyzoo: statt Stress +30 % je Auslöser direkt daneben, höchstens 2.
13. **Kombo** `c.km(...)` → Faktor (×fa auf B, ×fs auf N).
14. **Zoolatro-Zusätze** `09:extra92` (nur mit `state.zl`). Jeder Eintrag ist entweder fest `{a,s}` oder Faktor `[Text, fa, fs]`,
    jeweils **nacheinander** auf den aktuellen Wert (Faktoren verketten sich hier):
    1. **Lebensraum-Regel** `09:habRule` (wenn `habRulesOn`; im Tutorial nur Savanne, Abschnitt 4),
    2. Jäger-Beute fest `+ea,+es`,
    3. **Freundschaft** ×1,25 je verschiedenes Freundespaar daneben (`09:FRIENDS`, z. B. Zebras–Giraffen),
    4. ~~Formen~~ (Innenhof, Allee, Dreiländereck) seit 0.77a gestrichen,
    5. Storchennest daneben +2 N je Nest (seit 0.80a wird der Storch nicht mehr ausgelost; alte Nester wirken bis Zoo-Ende),
    6. Besucherliebling des Tages ×2, Nachbar des Lieblings ×1,25,
    7. Lebensraum-Lotto ×2 (0.81a: nur an manchen Tagen, `chance(.25)` in `dayRoll`) · Tagesfeld ×3 · Vermesser-Linie ×2 · Panorama ×(1+Randfelder/Felder) · Fotograf ×3 ·
       Zeitungsartikel ×1,5 (Showtiere) · Prägung Wackelig ×2 · Glück ×3 · Zugabe ×2 · Zirkus-Zelt ×2 (Showtiere).
15. **TÜV / Lebensmittelaufsicht** (Winter mit Bedingung `attr` bzw. verschärftem `essen`): Was benachbarte Attraktionen (bzw. Gastro)
    diesem Gebäude bringen, wird zur Hälfte abgezogen (Winterfest: ein Viertel). Gerechnet wird mit einer zweiten Wertung ohne diese Nachbarn.

Ergebnis `{a,s}` (kann negativ sein), dazu `st` (gestresst 0/1).

---

## 3. Wertung des Zoos: `04:scoreZoo` → `scoreZoo0`

1. `V[i] = evalB(b_i)` für alle Gebäude.
2. **Mehrfach-Bau und Ausbau** `04:multiAdj`, gemessen am eigenen Wert `own=max(0,V)`:
   - Das n-te Gebäude **derselben Karte** (gleicher Schlüssel, Reihenfolge der Bau-Liste) zählt `DUPW=[1, 0,75, 0,25]` →
     1. 100 %, 2. 75 %, ab dem 3. 25 %. Zuschlag `round((w−1)·own)`. Ausnahmen: Klonlabor 100 %, Zwilling: der 2. 100 %.
   - **Ausbaustufe** `lvl`: Stufe II `+0,75·w·own`, Stufe III `+1,25·w·own` (`LVLW=[0,0,0,75,1,25]`).
3. Prägung **Publikumsmagnet**: +50 % von dem, was das Gebäude seinen Nachbarn bringt (`06:giveOf`).
4. `A = Σ B`, `S = Σ N` (negative Werte zählen mit).
5. **Zoo-Multiplikatoren** (`mults`, jeweils `ma` für B oder `ms` für N):
   - Karten-Multiplikator `c.mult(nb,bs)` (z. B. Verstärker),
   - **Gestresste Tiere**: N × `(1 − min(0,4; Anzahl·0,05))`,
   - Förderprogramme, Werbung, Spezialisten mit `mult` (nicht im Streik),
   - nur Zoolatro: **Regenbogen** ×1,2^n B (Veredelungen `r` im Zoo), **Kronenfeld** ×1,3 B je Krone (`Z.crown`, `Z.crown2`), wenn
     darauf ein **Gehege mit ≥4 Feldern** steht, **Vielfalt oder Reinheit** (das Bessere, Abschnitt 4.3), Fernsehteam.
6. `A2 = round(A·Π ma)`, `S2 = round(S·Π ms)`, beide mindestens 0. **Tagespunkte `total = A2 · S2`.**

`breakdown(b,bs)` liefert dieselben Zeilen wie die Anzeige: `evalB`-Zeilen + Magnet + Mehrfach/Ausbau.

---

## 4. Lebensraum-Regeln, Reinheit, Vielfalt

### 4.1 Lebensraum-Regeln `09:habRule` (Faktor auf B und N, in Schritt 14.1)
Gilt im Zoolatro-Lauf (`habRulesOn`). Im Tutorial nur Savanne, und erst ab dem Schritt mit `tutHerd`.
| Lebensraum | Regel | Faktor |
|---|---|---|
| 💧 Wasser „Fluss“ | Gruppe = zusammenhängende Wasser-Gehege. Jedes Gehege darf **höchstens 3 Seiten** (Feldkanten) an anderen Wasser-Gehegen haben (`wSides`). | ohne Wasser-Nachbar: kein Faktor; sonst ×(1,5 + 0,25·⌊Gruppengröße/3⌋), höchstens ×2 |
| 🌾 Savanne „Herde“ | Gruppe zusammenhängender Savannen-Gehege (`grpN`) | allein ×0,5; zu zweit ×1; ab 3 ×(1,15 + 0,1·(g−3)), Profil Steppe 0,15, höchstens ×1,75 (0.86a, `HERD3`/`HERDMAX`) |
| 🌿 Dschungel „Schutzgebiet“ | Naturschutz-Gebäude daneben | ×2, sonst ×0,5 |
| 🏜️ Wüste „Einzelgänger“ | Wüsten-Gehege daneben | ×0,5, sonst ×2 |
| 🧊 Arktis „Nordlage“ | Schwerpunkt (mittleres r) nördlich der Gelände-Mitte (`isNorth`) | ×2 |
| ⛰️ Gebirge „Rand/Felsen“ | n = Randfelder + verschiedene angrenzende Felsen (`gebN`) | ×(1,5 + 0,25·(n−1)), höchstens ×2 |

**Gruppenbruch** (`habViol`, nur Wasser/Gebirge/Arktis): Verletzt **ein** Gehege der Gruppe die Regel (Wasser > 3 Seiten, Gebirge n=0,
Arktis südlich), dann zählt **die ganze Gruppe** ×0,5.

### 4.2 ~~Formen~~
Innenhof, Allee und Dreiländereck gibt es seit 0.77a nicht mehr (`shapes92`/`shapesOf` entfernt).

### 4.3 Reinheit und Vielfalt (`04:zlPurity`, `04:vielfalt`, nur Zoolatro)
- **Reinheit**: größte zusammenhängende Gruppe von Gehegen eines Lebensraums. n = Anzahl **verschiedener Arten** (`spK`) + Jäger-Beute
  + einmal +1 für Prägung Zucht. Wüsten-Gehege zählen zusätzlich **ohne Zusammenhang** (wegen „Einzelgänger“).
  Ab `PURN` (Stufe 1–3: 4, ab Stufe 4: 6; gesetzt in `syncCtx`): N × `min(1,6; 1 + 0,15·(n−PURN+1))`.
- **Vielfalt**: für alle Lebensräume des Laufs (`CTX.habs`) die Anzahl verschiedener Gehege-Arten. Der kleinste Wert `lvl` (höchstens 5)
  zählt, ab lvl 2: N × (1 + 0,05·lvl).
- Es gilt **nur das Bessere** von beiden.

---

## 5. Kronenfeld, Goldfelder (`06:initZl`)
- Zu Beginn jedes Zoos wird gelost: **Kronenfeld** = ein zufälliges normales Baufeld (keine Naturfläche, kein Felsen, nicht der Eingang
  der Auflage). **Goldene Felder**: 3 (ab Stufe 3: 2) Felder mit Abstand ≥2 zueinander und zur Krone (notfalls ≥1).
- **Kronenfeld (0.86a, `06:crownPick`/`crownFits`):** unter den freien Feldern ohne Naturfläche (zufällige Reihenfolge, Baugrube zuletzt) das erste ohne Randlage mit mindestens 3 verschiedenen Lagen eines 4-Felder-Geheges (alle Formen der Gehege-Karten, 6 Drehungen; Lage nur auf dem Feld, ohne Felsen, Eingang, Baugrube, Naturflächen höchstens eines Lebensraums), dann dasselbe mit Randfeldern, sonst das Feld mit den meisten Lagen.
- Krone: ×1,3 B für den Zoo, solange ein Gehege mit ≥4 Feldern darauf steht. Gold: Abschnitt 2, Schritt 7.

---

## 6. Winter-Bedingungen (`daten/winter.json` → `02:INSP`, Wirkungen in `02:WINTER_WIRKUNG`, Auswahl in `06:initZl`)
- Ab dem Herbst sichtbar (0.81a): `02:winterHit(b,bs,idx)` liefert den Faktor je Gebäude (gleiche Regeln wie `inspFx` in der Wertung), Schilder `06:winterMarks`, Ansage `winterHitTxt`.
- Je Zoo wird **eine** Bedingung gelost (bevorzugt noch nicht gesehene, `SEEN.i`). `zucht` erst ab Zoo 2, `futter` erst ab Zoo 3.
  Sichtbar ab Herbst (`inspHid`). Einmal je Zoo für 30 Taler tauschbar (`wSwap`).
- **Verschärft** (`Z.hard`) ab Zoo 3. `HARD(Z)` gilt nur für Bedingungen mit verschärfter Fassung (`ht`).
- **Winterziel +10 %** ab Zoo 5 (`Z.wplus`, in `seTarget`).
- Sie wirken nur im Winter (Jahreszeit 4) und nicht, wenn ein Winterquartier daneben steht. f=0 heißt: zählt selbst nicht,
  wirkt aber weiter als Nachbar.

| Schlüssel | Wirkung (normal / verschärft) |
|---|---|
| `essen` | Gastro f=0 / zusätzlich Lebensmittelaufsicht: Gastro-Boni für Nachbarn halb |
| `attr` | Attraktionen f=0, TÜV: Attraktions-Boni halb / zusätzlich Gehege neben Attraktion ×0,9 |
| `nachbar` | Gebäude mit weniger als 3 (verschärft 4) Nachbarn f=0 |
| `klein` | 1-Feld f=0,5 / 1-Feld f=0, 2-Feld f=0,5 |
| `markt` | Gastro ×1,5, Attraktionen f=0, Gehege ohne Gastro daneben ×0,85 / ×0,7 |
| `zucht` | bedrohte Gehege ×2, andere Gehege ×0,7 / ×0,5 |
| `koenig` | Schneekönig: je **Sorte** (`MILE`-Kategorie) nur das beste Gebäude (B+N ohne Winter, × Ausbau) ×2,5 / ×2, alle anderen f=0 (`kingSet0`) |
| `team` | nur die ersten 3 / 2 Spezialisten der Reihe wirken (`05:teamAct`) |
| `hab` | Gehege des häufigsten Lebensraums (Stand Winterbeginn, `habTop`) ×0,5 / f=0 |
| `schutzp` | Gehege ohne Naturschutz daneben ×0,5 / ×0,25 |
| `laerm` | Gehege neben Attraktion (außer Lehrpfad): N ×0,5 / N=0 |
| `gross` | Gehege < 3 Felder und Stufe I ×0,75 / verschärft ×0,5 (0.81a; erst ab Zoo 3 auslosbar) |
| `heiz` | Pflege-Taler ×1,5 / ×2 (keine Punkte-Wirkung, `dayIncome`) |
| `ruhe` | Attraktionen und Gastro f=0 |
| `inventur` | je Lebensraum nur die 3 besten Gehege zählen (`topSet 'inv'`) |
| `glatteis` | kein Umziehen, kein Neu ziehen / zusätzlich 1 BP weniger je Tag |
| `wenig` | alle B ×0,7, N ×1,2 |
| `chaos` | jeden Tag ein zufälliges Gebäude f=0 (`dayRoll`, `state.chaosB`) |
| `futter` | nur die 10 besten Gebäude zählen (`topSet 'top10'`) |
| `frei` | keine (nur Tutorial) |

Mit Winterfest `rb_winter`: Nachteile halb so stark (`inspFx`), König ×3,75.

---

## 7. Tagesablauf, Baupunkte, Geld

### 7.1 Ablauf (`06:startDay`, `07:endDay`, `07:nextDraft`, `07:advance`)
1. **Morgen** (`startDay`): Baupunkte auffüllen, Hand auf `HAND=5` Karten ziehen (`04:drawHand`; nicht gebaute Karten bleiben auf der Hand,
   leerer Stapel → Ablage mischen). Ereignisse des Tages (`09:dayRoll`: Besucherliebling ab Sommer, Lotto, Tagesfeld, Vermesser,
   Schneechaos, Zoo-Momente, Jäger).
2. **Bauen**: Karten auf freie Felder legen, mit Baupunkten bezahlen. Zusätzlich möglich: Ausbauen (gleiche Karte auf ein Gehege
   ziehen → Stufe II/III, `MAXLVL=3`), Umziehen (`moveCost`), Neu ziehen (1 BP, einmal je Jahreszeit gratis; Profil Grund 2×; ab Stufe 6 nie gratis),
   Rückgängig innerhalb des Tages.
3. **Abend** (Tag beenden): `scoreZoo` → `total` wird zu Jahreszeit und Zoo addiert, Taler aus `dayIncome`.
4. `endDay`: Ziel der Jahreszeit erreicht? → `seasonWon` (bzw. `win` nach dem Winter). Sonst am letzten Tag → `lost`.
   Sonst **Kartenwahl** (`draft`): je heute gebautes Gebäude eine Wahl aus `OFFER=2` Karten (`06:newOffer`, `04:makeOffer`, gewichtet nach
   Seltenheit `RARW`), die Karte kommt in die Ablage. Danach nächster Tag.

### 7.2 Baupunkte (`01:bpBase`, `06:startDay`)
`BP=4` je Tag, +1 mit Polier. Abzüge: Ereignis Baustelle am Tag 1 −1, ab Stufe 7 am Tag 1 jeder Jahreszeit −1, Glatteis verschärft −1,
mindestens 1. Dazu Extra-Baupunkte (`bpWish`), z. B. „früh geschafft“: je übrigen Tag +1 BP an einem Tag der nächsten Jahreszeit (`run.bpCarry`).

### 7.3 Taler (`04:dayIncome`)
- Eintritt `flatC(A/9)` minus Pflege `flatC(S/8)`. `flatC` (nur Zoolatro) flacht ab: bis 30 voll, 30–90 halb, über 90 ein Viertel.
  Profil-Faktoren: Genießer Eintritt ×1,2 und Pflege ×1,25, Oase Eintritt ×0,9 und Pflege ×0,75, Heizkosten im Winter ×1,5/×2.
- Dazu: Schuldzinsen (−1 je angefangene 10 Taler Minus), Kassenwart +3, Spekulant −5, Spenden-Prägung, Karawane, `tal`-Karten,
  Besuchersnack +1.
- **Früh geschafft**: `EARLY_BONUS=5` Taler je übrigen Tag, Geschenk ab 2/3/4 Tagen (Futtersack/Umbau-Kiste/Profi-Mappe, `01:earlyReward`).
- Unter 0 Taler: **Streik**, Spezialisten wirken nicht.

---

## 8. Jahreszeiten und Ziele (`01:SEASONS`, `05:seTarget`, `05:seOf`)
- 4 Jahreszeiten mit je `DAYS=5` Tagen (`DAYS0`; Testlauf „4 Tage“ `run.d4`: 4 Tage, gesetzt in `05:syncCtx`): Frühling 9.500 · Sommer 51.000 · Herbst 118.000 · Winter 267.000 (Grundziele).
- **Zoolatro**: `Ziel = Grund · ZLUP[i] · ZLSEAS[i]^zoo · deckTF · deckSF(i) · stTF · (Winter ab Zoo 5: 1,1) · d4TF · einTF(i)`.
  - `d4TF` (0.78a): Testlauf „4 Tage“ ×0,6. `einTF(i)` (0.80a): Profil mit `einstieg` in `daten/profile.json` (Zoogründer) nur auf Stufe 1: seit 0.82a alle ×0,8.
  - Preise im Testlauf (0.80a): `priced` ×0,8, aufgerundet.
  - `ZLUP=[1, 1,2, 1,2, 1,2]` (0.70a), `ZLSEAS=[1,15, 1,35, 1,6, 1,55]` (0.81a: Sommer 1,46 → 1,35; 0.82a: Herbst 1,68 → 1,6) (Steigerung je Zoo, zoo = 0 … 4),
  - `deckSF`: Profil Polar Sommer ×1,15, Winter ×0,85,
  - `stTF` (Stufen): ×1,1 ab Stufe 2, nochmals ab Stufe 5, nochmals ab Stufe 8.
  - Rundung: ab 100.000 auf Tausender, sonst auf Hunderter.
- Freies Spiel: `Grund · tmult`. Tutorial: feste Ziele `TUTT`.
- Ereignisse je Jahreszeit (`rollSeason`, `EVENTS`), im Zoolatro statt Ereignissen Besucherwünsche (`wishEval`).

---

## 9. Shop (`07:openShop`, `07:fixedItems`, `08:shopHtml`)
Nach jeder gewonnenen Jahreszeit (außer Winter). Reiter: 👥 Team · 🧰 Umbau & Futter · 🎟️ Extras (`META.shopT`).
- **Feste Angebote**: Geschenke aus „früh geschafft“ (gratis), 📁 Bewerbermappe (3 zufällige Spezialisten, `25+10·n` Taler),
  💼 Profi-Mappe (mindestens einer selten/legendär, `45+15·n`), 🧺 Futtersack (2 Angebote aus `rollFood`, `20+10·n`),
  🧰 Umbau (`UMBPRICE`), Karte aussortieren (10), Felsen räumen (12).
- **Wechselnde Angebote**: Einmal-Angebote (`EINMAL`: Futterlieferung, Zeitungsartikel, Glückslos), ein Zoo-Ausbau je Zoo (`AUSBAU`:
  größere Hand, mehr Büros, Kartenautomat …), Stellenmarkt (`state.market`).
- Preise: `priced(p) = p · inflation · (Stufe ≥4: 1,25) · (Genießer 0,8)`; Mappe/Profi ebenso, Freizeit ×1,25 für Spezialisten.
- **Futtersack** (`04:rollFood`): Kandidaten = Lebensraum-Futter für jeden Lebensraum des Laufs (Gewicht `HFOODW=4`) + jedes Einzelfutter,
  das auf mindestens eine Karte in Stapel/Hand/Ablage passt (Gewicht `FOODR=[6,3,1]` nach Seltenheit). Ziehen ohne Zurücklegen.
  **Futterplätze** je Karte `fdMaxK`: gewöhnlich 1, selten 2, sehr selten 3, Futtermeister +1.
- Spezialisten (`daten/spezialisten.json` → `01:SPEC`, Wirkungen in `01:SPEZ_WIRKUNG`): höchstens `MAXSPEC=5` (+1 Profil Freizeit, +1 Ausbau „Mehr Büros“). Stufe 1–3 (`SPECTIER`), Regelbrecher (`rb`).
  Die Reihenfolge im Team zählt (Doppelgänger, Teamsitzung).

---

## 10. Zoolatro-Lauf

### 10.1 Aufbau (`09:enterCamp`, `04:CAMP`, `09:finishGame`)
- **5 Zoos** (`CAMP_GOAL = CAMP.length = 5`), je 4 Jahreszeiten. Jeder Zoo startet mit dem **Lauf-Deck**, mit Spezialisten und Lebensraum-Futter des Laufs.
- Gelände je Zoo gewürfelt (`mapRoll`, ohne Wiederholung, Zerklüftet erst ab Zoo 3). Felsen: Zoo 1 keine, sonst `max(MAPROCKS, 2·zoo−2)`,
  Zerklüftet 3, Profil Alpen +3. Naturfelder: 18 (Abschnitt 11).
- Auflagen (`06:RULES`, z. B. Eingang, halbes Gelände, Achse) je Zoo. Eingang (0.80a): nur Randfelder mit mindestens 2 bebaubaren Nachbarn (Naturflächen zählen, Felsen nicht); gibt es keins, werden Felsen daneben entfernt.
- Zwischen den Zoos (`newReward`, Bildschirm `creward`): Vorschau des nächsten Zoos → Verbesserung/Prägung (`perk`) → neue Karten
  (die erste gratis, weitere aus der Zoo-Kasse = übrige Taler) → Aussortieren → Spezialist → Start.
- Verlieren einer Jahreszeit beendet den Lauf.

### 10.2 Profile (Decks) `daten/profile.json` → `04:DECKS`, `04:DECKRULE`
Startdeck mit 16 Karten (`deckCards`, `grundDeck`: Gehege passend zu den 3 gewählten Lebensräumen + Grundgebäude). Themen-Profile
bringen Themen- und Signatur-Karten und eine Regel mit Vorteil und Kehrseite:
Grund (2× gratis neu ziehen) · Küste (Schwarm, Wüste −1 N) · Steppe (Herde stärker, 1-Feld +1 BP; seit 0.86a kein 4-Feld-Rabatt mehr) ·
Dschungel (Trubel-Stress nur direkt daneben, Attraktion +1 BP) · Oase (+40 Taler je Zoo, Pflege −25 %, Eintritt −10 %) ·
Freizeit (Attraktion −1 BP, +1 Team-Platz, Spezialisten +25 %) · Genießer (Eintritt +20 %, Shop −20 %, Pflege +25 %) ·
Forscher (Meilensteine 1 Art weniger, 1 Karte weniger zur Auswahl) · Polar (Winterziel −15 %, Arktis ohne Winter-Bedingung, Sommerziel +15 %) ·
Alpen (+1 B je Felsen daneben, höchstens 2, 3 Felsen mehr).
Freischalten über Ziele (`09:FSG`, `fsCheck`; Texte und Zahlen in `daten/freischaltungen.json`, seit 0.79a):
- Alle Ziele zählen in jedem Lauf (keine 3 gezogenen Ziele mehr, keine Gruppen „leichteste zuerst“). Nicht im Tutorial, Testlauf „4 Tage“ und Seed-Lauf.
- **Kunststück** (`kunststueck`): innerhalb eines Zoos/Laufs, geprüft je nach `ev` (Ende jeder Jahreszeit, Zoo geschafft, Lauf beendet, Tagesende …); Bestwert in `sl.fsb`.
- **Fleiß** (`fleiss`): Zähler je Spielstand `sl.fl` über alle Läufe (auch verlorene), mehrere Freischaltungen können einen Zähler teilen.
  Gezählt wird: Bauen (`flBuilt`, Rückgängig zieht ab; Gehege je Lebensraum, Raubtiere/Show/scheu, Attraktionen, Gastro, Gebirgs-Gehege an Felsen),
  Tagesauswertung (`flDay`: B der Dschungel-Gehege, N der Naturschutz-Gebäude, B und Taler der Gastro-Gebäude selbst), Shop/Kartenwahl
  (seltene/legendäre Karten, Futtersäcke, Spezialisten eingestellt), Zoo-Ende (Zoos geschafft, Taler ausgegeben, im Winter gescheitert), Lauf-Ende (Läufe).
  Startwerte einmalig aus `statOf(sl)` und `cuOf(sl)` (`flOf`). Erreicht = sofort frei (ev `any`), was frei ist, bleibt frei.

### 10.3 Stufen (Zoolatro 2.0, `daten/stufen.json` → `08:STAGES`, Wirkungen über `stAb`/`stW`, `stOf`, `stMax`)
Je Profil Stufe 1–8. Die nächste wird frei, wenn man mit der höchsten freien Stufe Zoo 3 schafft. Jede Stufe enthält alle davor.
Seit 0.76a kann eine Stufe mehrere Wirkungen haben; kommt eine Kennung mehrfach vor, gilt die höchste erreichte Stufe, nur `ziel` multipliziert sich.
| Stufe | Verschärfung | Kennung → Code |
|---|---|---|
| 1 | Grundstufe (3 Goldfelder ×2, Kronenfeld ×1,3, 18 Naturfelder, Reinheit ab 4) | – |
| 2 | Saisonziele +10 % · nur 15 Naturfelder | `ziel` → `stTF` · `natur` → `natNow`/`natQuota` (Schwerpunkt anteilig) |
| 3 | nur 1 goldenes Feld | `gold` → `initZl` |
| 4 | Saisonziele +10 % · Reinheit erst ab 6 | `ziel` · `reinheit` → `PURN` (in `syncCtx`) |
| 5 | Shop und Stellenmarkt ×1,25 | `teurer` → `priced`, `mappePrice`, `profiPrice` |
| 6 | Krone ×1,15 · Tag 1 jeder Jahreszeit 1 BP weniger | `krone` → `CROWNF` (in `syncCtx`) · `bp_erster_tag` → `startDay` |
| 7 | Saisonziele +10 % · nur 12 Naturfelder | `ziel` · `natur` |
| 8 | keine Besucherwünsche (keine 🎈 Wunscherfüllerin) · keine Gold- und Kronenfelder · nur 9 Naturfelder | `keine_wuensche` → `wishOn`, `rollSpecs` · `gold` 0, `keine_krone` → `initZl` · `natur` |
Das ×4-Feld aus dem Shop bleibt auch auf Stufe 8 möglich. Ziele gesamt: Stufe 1 ×1, 2–3 ×1,1, 4–6 ×1,21, 7–8 ×1,33.

### 10.4 Meilensteine (`01:MILE`, `mileCount`)
Je Sorte (Wasser-, Savannen-, Dschungel-, Wüsten-, Arktis-, Gebirgs-Gehege, Attraktionen, Gastro: 6 verschiedene Arten; Naturschutz 7;
„Arten je Kategorie“ 4) → am nächsten Tag eine besondere Meilenstein-Karte (`ms`). Forscher-Profil: 1 weniger.
Die Sorten bestimmen auch den Schneekönig.

---

## 11. Gelände erzeugen (`daten/gelaende.json`; `04:genMap` = `genMap0` → `shrinkMap` → `natPlace`)
- `genMap0`: Form je Gelände (Wiese Sechseck Radius 5, Flusstal 13×7, Bucht/Zerklüftet Sternform, Zwei Hügel zwei Scheiben mit Brücke)
  und Felsen (`addRocks`). `shrinkMap` behält 80 % (`MAPSHRINK`) der Felder um die Mitte, zusammenhängend (Testlauf `run.d4`: nochmals ×0,8, Naturfelder ×0,8 in `natNow`).
- `natPlace` (0.71a): alle Naturflächen werden neu gelegt, **18** (`NATN`), nur in den gewählten Lebensräumen (`GENHABS`), Mengen nach
  `natQuota`: Wiese gleich verteilt · Flusstal Wasser 8 · Bucht Wasser 7 + Wüste 7 · Zwei Hügel Wald 8 (sonst Savanne 8) · Zerklüftet Wüste 8.
  Der Rest wird gleichmäßig auf die übrigen gewählten Lebensräume verteilt, ungerade Reste reihum.
  Flecken zu 2–4 Feldern, die möglichst nichts anderes berühren. Flusstal: Wasser als zusammenhängender Strang von links nach rechts.
  Bucht: Wasser und Wüste am Rand.
- Während des Zoos wächst die Landschaft am Ende jeder Jahreszeit mit 40 % Chance (`09:seasonTurn`): Dschungel +1, Wüste +2, oder eine Quelle zwischen Wasser-Gehegen.

---

## 12. Weitere Bausteine (nur Verweise)
Prägungen (`b.pr`: gold, star, liebling, magnet, zucht, wackel, leicht, spende …, vergeben über `perk` und Futterlieferung) ·
Veredelungen (`b.ed`, `02:EDS`: Gold +25 % B, Schimmernd ×2, Regenbogen ×1,2 B für den Zoo) · Verstärker (`cat:'verst'`,
`04:verstHit`) · Jungtiere/Zucht (`z2Breed`, `c.jt`) · Förderprogramme `PROGS`, Werbung `ADS`, Ereignisse `EVENTS` (Daten in `daten/foerderprogramme.json`, `werbung.json`, `ereignisse.json`), Lauf-Boni `RUNB`
(`01`) · wachsende Spezialisten (`grw`, `09:grwF`) · Glück (`state.luckNow`, `LK`) · Besucherwünsche (`wishEval`) ·
Zoo-Momente (`09:MOMENTS`).

---

## 13. ⚠️ Unklar / widersprüchlich (gefunden beim Aufschreiben)

**Entscheidungen von Tobi (08.11.2026):** 1. Reinheit ab **4** ist richtig · 2. das 3. gleiche Gehege **25 %** ist richtig ·
4. **1 Störer je Tier** bleibt · 5. **ganze Gruppe ×0,5** ist richtig · 6. Schimmernd + Goldfeld **soll ×4** sein → gebaut in 0.72a,
Referenzfall `51-gold-schimmernd`. 3. Show: Code bleibt (Trubel doppelt, höchstens +120 %), nur der Text wird angepasst · einzelnes Wasser-Gehege ohne Wasser-Nachbar bleibt ×1. Offen: 7–15.
1. **Reinheit ab 4 oder 6?** `04` setzt `PURN=6`, `05:syncCtx` überschreibt bei jedem Aufruf mit `PURN=4`. Kommentare, Hilfetexte und
   alte Tests (`jsd93`: „Reinheit ab 6“) sagen 6. Es gilt also 4.
2. **Mehrfach-Bau**: Der Kommentar in `evalB` sagt „2. 75 %, 3. 50 %, ab 4. 25 %“, der Code (`DUPW=[1,.75,.25]`) gibt dem 3. schon 25 %.
3. **Showtier „höchstens +60 %“** (Text bis 0.71a; seit 0.72a erklärt der Text die Doppelzählung): Laut Code kann `sh` bis 4 gehen, weil Trubel doppelt zählt. Mit Bühne ×2 sind bis
   +240 % möglich (Manege gibt es seit 0.73a nicht mehr). Entschieden: Code bleibt, Text erklärt es.
4. **Stress „Störer max. 2“** (Kommentar): Der Code zählt je Tier höchstens 1 (`st=min(1,…)`), der Zoo-Faktor dann −5 % je gestresstes Tier.
5. **Gebirge/Arktis/Wasser-Text** (`HABRULE`, Hilfe): „Ganz innen nur ×0,5“. Laut Code bricht dann **die ganze Gruppe** (×0,5 für alle).
   Ein einzeln stehendes Wasser-Gehege bekommt gar keinen Faktor, laut Text „Kette ×1,5“.
6. ~~Schimmernd + Goldfeld addieren sich~~ → seit 0.72a multipliziert (×4).
7. **Lauf-Länge**: Ein Zoolatro-Lauf hat **5 Zoos** (`CAMP`). Die Stufe schaltet nach Zoo 3 frei, der Lauf geht aber weiter.
   Der Auftrag sprach von 3 Zoos.
8. ~~Zoo-Profile abgeschaltet, aber noch abgefragt~~ → in 0.73a ganz entfernt (mit Manege, Stadtzoo, Ruhezoo, Erlebnis, Bau …).
9. **Winter-Bedingung „koenig“ verschärft schwächer**: verschärft ×2, normal ×2,5. Da die anderen ohnehin 0 zählen, ist „verschärft“
   hier nur ein kleinerer Bonus. Vermutlich gewollt, aber auffällig.
10. **`nachbar`, `koenig` u. a. ohne `text`**: Manche Bedingungen haben nur die verschärfte Fassung `ht`, der normale Text kommt aus `daten/texte_de.json` (TXT).
    Bei `ruhe`, `inventur`, `wenig`, `chaos`, `futter` gibt es keine verschärfte Fassung, auch ab Zoo 3 gilt dort die normale.
11. **Meilensteine**: Alte Tests (`jsd93`) erwarten „Meilensteine 7, Naturschutz 8, Vielfalt 4“, der Code hat 6/7/4. Die Tests schlagen
    seit Langem fehl, `pruefen.sh` meldet sie als „gleich“.
12. ~~Prozent-Boni nicht verkettet~~ → seit 0.76a sind alle Boni Faktoren und werden nacheinander multipliziert (Schritt 5 und 14). Die Reihenfolge in `extra92` ändert das Ergebnis nur durch die Rundung. Für den Nachbau genau übernehmen.
13. **Rundung**: Jeder Zuschlag wird einzeln gerundet (`Math.round`, .5 → aufwärts, bei negativen Zahlen Richtung +∞). GDScript `round()`
    rundet .5 von null weg, also anders bei −x,5. Im Nachbau `floor(x+0.5)` nehmen.
14. ~~Teil-Listen bei Formen~~ → entfällt, Formen gibt es seit 0.77a nicht mehr.
15. **Abhängigkeit vom globalen Zustand**: `evalB` liest außer `CTX` auch `state` (Liebling, Nester, Chaos, Tagesfeld …) und `TERR`/`BOARD`.
    Im Nachbau alles als Eingabe der Wertung übergeben.

## 14. Detail-Fenster und Aufstellung (0.81a)
- `evalB` gibt bei Faktor-Schritten `fa`/`fs` mit (`add(label,da,ds,{fa,fs})`), die Werte selbst bleiben gleich. `breakdown` ergänzt Wiederholung/Ausbau als Faktor-Zeile (`own:1`).
- `07:detCalc(a0,parts,k,fin)` baut die Rechnung aus denselben Schritten: Plus-Werte in Klammern, dann je Faktor „× f → Zwischenwert“ (gerundet wie die Wertung, nach jedem Schritt).
  Geprüft für alle 1.689 Gebäude der Referenzfälle: Ergebnis = Wertung.
- Aufstellung am Zähler (`aufOf`, `aufBlock`): Summe der Gebäude (`r.steps`), dann `r.mults` in Reihenfolge; gerundet wird erst am Ende (`scoreZoo0`). `state.yday.auf` speichert sie zum Zählerwert.

## 15. Gruppen-Bonus der Spezialisten (0.82a)
- `01:SPGRP`: Pflegerinnen (Gehege des Lebensraums), Kleintier-Expertin (1-Feld-Gehege), Architektin (Gehege ab 3 Feldern, nur B), Raubtier-Dompteur (Raubtiere, nur B),
  Artenschützerin (bedroht, nur N), Bauleiterin (ausgebaute, Zahl = Summe der Ausbaustufen `lvl−1`), Sammlerin (Gehege, nur N, nur bei Vielfalt-Stufe ≥ 2).
- Jedes betroffene Gebäude ×(1 + `schritt` × Anzahl im Zoo), `schritt` in `daten/spezialisten.json` (0,1 / 0,15 / 0,05). Als Faktor-Schritt in `evalB` (`pctAdd` mit `fa/fs`).
- „Aktuell pro Tag“: `07:yieldCmp` = `scoreZoo` (A und S nach Zoo-Faktoren) mit minus ohne die Wirkung.
- Heizkosten (`dayIncome`): Pflege ×1,25, verschärft ×1,5.

## 16. 🌍 Weltreise-Modus (0.85a, `run.wr`; Plan `docs/plan/weltreise.md`, Daten `daten/kontinente.json` → `06:WR_DATEN`)
- **Start:** Schalter `META.wr` bei der Lebensraum-Wahl → `09:enterCamp` setzt `run.wr`, `run.wrN` (Lauflänge `06:wrGoalN` = 4 + je 1 für freigeschaltete Arktis/Gebirge, `habOpen`) und `run.boni=[]`.
  Ohne Plan für den aktuellen Zoo zeigt `enterCamp` die Kontinent-Wahl (`run.reward={step:'wr',first:1}`). `06:runGoal(run)` ersetzt `CAMP_GOAL` überall, wo der Lauf endet.
- **Auslosung** `06:wrRollOpts` (mit Seed: `seed|wr|zoo|stufe`), seit 0.86a über **Regionen** (`regionen`, `06:WRREG`): eine Region zählt, wenn einer ihrer `foki` im Lauf gewählt und freigeschaltet ist
  (und, falls `frei` gesetzt, einer dieser Lebensräume freigeschaltet ist, z. B. Antarktis → Arktis); ein Kontinent zählt, wenn er eine solche Region hat und in `run.wrRoute` noch nicht vorkommt (alte Kennungen über `alt`, `wrKOf`).
  Bis zu `lauf.ziele` (3, ab Stufe 2 `ziele_ab_stufe2` = 2) Kontinente zufällig, je eine zufällige Region und darin ein zufälliger passender Schwerpunkt. Fehlen Ziele und war Europa noch nicht dran, kommt **Europa** dazu
  (Stadtname aus `staedte`, kein Schwerpunkt, keine Auflage, keine Belohnung); wäre gar kein Ziel übrig, kommt Europa immer. Schwierigkeit je Ziel zufällig
  (vor Zoo 1 nur leicht/mittel), nie nur schwere; Auflage aus `auflagen` mit dieser Schwierigkeit, keine doppelt in einer Wahl, bevorzugt noch nicht gesehene (`seenOf`), im Testlauf ohne `locker`.
  Belohnung: leicht keine, mittel eine aus `belohnungen.sofort` (Speisekammer nur mit Futter), schwer eine noch nicht erhaltene aus `belohnungen.dauerhaft` (sonst sofort).
  Je Ziel wird der Plan vorab erzeugt (`rollPlan0` mit `WRCTX={foc,rule,rw,eu}`, eigenes Gelände `run.maps[zoo]` je Ziel), die Vorschau zeigt dieses echte Gelände. Anzeige: Region als Name, Kontinent darunter.
- **Gelände** (`04:natPlace` mit `WRCTX` → `06:wrQuota`): Naturflächen = runde(bebaubare Felder × `natur_anteil` 0,4 – seit 0.87a, vorher 0,5), davon runde(× `schwerpunkt_anteil` ⅔) im Schwerpunkt, der Rest gleichmäßig auf die übrigen gewählten
  Lebensräume; Flecken `fleck_min`–`fleck_max` (4–7). Europa: `europa_naturfelder` (18, im Testlauf ×0,8) gleich verteilt. Stufen-Naturfelder (`stW('natur')`) gelten nicht. Im Testlauf „4 Tage“ ist das Feld ×0,8, die Hälfte davon ergibt sich anteilig.
- **Wahl** `06:wrGo`: Plan übernehmen, `run.wrDest`/`run.wrRoute` merken; dauerhafte Belohnung → `run.boni`; sofort: Speisekammer 2× `gsack`, Bewerberflut `gprofi`, Bauoffensive 2× `gumb` (Geschenke im Shop, `run.gifts`),
  Mitbringsel = Schritt `wrgift` (3 Karten aus dem seltenen Kartenwahl-Los `11:zkPools`), Prägung = Schritt `perk` mit `a.wrPerk` (danach Start), Partnerschaft = beim Start ein zufälliges Förderprogramm (`06:wrArrive`).
- **Dauerhafte Boni** (`06:wrBon`, wirken ab dem Zoo, in dem man sie bekommt): Goldader `initZl` +1 Goldfeld · Fleißige Helfer `startDay` +1 BP am 1. Tag von Frühling und Sommer · Gastforscher `07:rollMarket` +1 Bewerber ·
  Leichter Boden `04:genMap` entfernt 3 Felsen des fertigen Geländes (wird seit 0.87a nicht angeboten, wenn Gebirge im Lauf ist).
- **Ziel-Auflagen** (`ziel_auflagen`, `RULES[..].ziel`, Stand `06:wrGoal`): Prüfung in `07:endDay`, wenn das Winterziel erreicht ist: offen und noch Tage übrig → weiterspielen (Hinweis), offen am letzten Wintertag
  → `state.wrFail`, Zoo gescheitert (eigener Text). Vielfalt zählt Lebensräume mit ≥ 2 Gehegen; Nachwuchs = Gehege mit `jt`. **Auswilderung** (`06:wrAuswild`, aus `startDay`): am 1. Tag von Sommer und Herbst (seit 0.87a) ein zufälliges
  Gehege (ohne Meilenstein) weg, eine passende Karte aus `run.deck` (`run.wrGone`), Einblendung `#wrAusPop`. Weltreise-Auflagen (`RULES[..].wr`) kommen in `ruleRoll` nie vor.
- **Zwischen den Zoos:** `06:newReward` mit `run.wr`: keine Vorschau, kein Prägungs-Schritt; Karten → Team → `data-cwr` → Schritt `wr` (Kontinent-Wahl `06:wrPickHtml`). Beim Start `rulePop` = „Willkommen in …“ (`06:wrWelcomeHtml`).
- **Besucherwunsch** (`08:wishOn`): nur im Sommer; Belohnungen `08:WRWISH` (über `wRw`), `arten5` braucht 6 Arten und darf im Sommer kommen. „Karte nach Wahl“ (Star/Gold) öffnet das Fenster `state.wpick` (`08:wpickDo`).
- **Highscores:** Einträge mit `wr`, `goal`, `zp` (Punkte je Zoo); Sortierung `09:csCmp`: erst erreichte Zoos bis zum kürzeren Ziel, dann Punkte bis dahin.
- **Baugrube** (`achse`, auch im normalen Modus): `06:initRule` wählt 5 zusammenhängende Felder (möglichst mittig, erst ohne Naturflächen), `R.ax`.

## 17. Zoo-Menü (0.86a, `06:zooBoxHtml`, Entwurf `docs/stil/zoomenue-entwurf.html`)
- **„Dieser Zoo“** (`ZT`, feste Reihenfolge): Weltreise-Ziel/Schwerpunkt (nur `run.wr`) · Auflage (Stand aus `wrGoal`, rot solange offen) · Besucherwunsch, sonst Ereignisse, sonst kurzer Hinweis · Winter (`inspHid` → „Herbst“, Wahl, Bedingung mit `#mPeek` und `wSwapBtn`).
- **Chips:** dauerhafte Boni (`run.boni`), Teuerung (`Z.ban`), Geschenk vom Raubtierhaus (`Z.gift`).
- **„Dein Stand“** (`ZD`, `<details>`): Reinheit (`zlPurity`/`purF`), Vielfalt (`vielfalt`), Zucht (`zuchtNow`, gleiche Prüfung wie `z2Breed` ohne Wirkung), wachsende Spezialisten, Futter (`foodBoxHtml`), Lebensraum-Regeln.
- **„📖 Regeln“** (`ZRULES`, `zooRulesHtml`): Stufe, Profil-Regel, Weltreise-Boni, Zucht/Reinheit/Vielfalt ausführlich, Gelände (`zlTerrTile`). Die Seitenleiste im Querformat (`railRender`) zeigt immer die Hauptansicht (`zooBoxHtml(1)`) ohne Knöpfe.

## 18. Schliff 0.87a
- **Winter-Stufe** (`daten/winter.json` `stufe`, `02:inspStufeTag`): Ziel mit schwerer Auflage (`06:wrHardRule`, Schwierigkeit aus `auflagen`) → `initZl` und `wSwap` losen nur `leicht`.
- **Arktis-Zone** (`05:viewRotFor`, `05:northOf`, `05:scrY`): obere Hälfte nach Bildschirm-y (gedreht: `q+r/2`, sonst `r`), Median aller Felder; `state.north={rot,m,ks}` beim Zoo-Start (`newGame`, aus dem Plan `p.north`),
  `09:isNorth` nutzt sie (alte Spielstände ohne `north` wie bisher). `04:natPlace`: mit Arktis im Lauf mindestens ⅔ der Zone (ohne Felsen) neutral/Arktis, sonst größte fremde Flecken in den Süden verlegen (`ALLOW`).
- **Meilensteine** (`04:fits`): `c.ms` ignoriert Naturflächen und Felsen; Felsen unter Gebäuden fallen beim Bauen weg, die Vorschau rechnet über `06:noRocks` schon ohne sie.
- **Naturfläche ändern** (`UMB.natur.n=3`, `umbClick` sammelt `T.sel`, `data-umbfin`, `umbHab` für alle Felder, Markierung `umbSelOverlay`).
- **Früh geschafft im Testlauf** (`01:earlyReward`): Stufe = Tage + 1 (1 → Futtersack, 2 → Umbau-Kiste, 3 → Profi-Mappe).
- **Detail-Fenster** (`07:calcData`, `07:zooFxHtml`): Diese Karte · Nachbarn · Mehrfach · Zwischensumme · Zoo-Faktoren (gerundet) · Sonstiges (Faktor-Änderung, Rundung) = Zoo, genau `ΔA`/`ΔS`.

## 19. 0.88a
- **Weltkarte** (`06:wrWorldSvg`, Daten `lage`/`staedte_lage`): Projektion `X=(Länge+180)·400/360`, `Y=(80−Breite)·1,5`, Umrisse `WMLAND` (mit Kontinent für „besucht“), Lage je Ziel `wrLage` (Region `r`, sonst Name, Europa-Stadt). Punkte `.wpin[data-wrsel]`, Route aus `run.wrRoute` (seit 0.88a mit `r`).
- **Auslosung** (`wrRollOpts0`): bei ≥ 2 Zielen, wenn alle leicht (Europa zählt leicht) → ein Ziel mittel (vor Zoo 1) bzw. mittel/schwer.
- **Statistik** (`09:statOff`): zählt auch `run.d4`; nicht Tutorial, Seed, „Test verstärkt“ (`run.tv`), Stufen-Test (`run.stTest`). Bestwerte (`bestZoo`, `bestRun`) ohne Testlauf.
- **Highscores:** Eintrag mit `deck` und Endbild-Kopie `sum` (`sumSlim`, nur die 20 jüngsten, `csPrune`); `scoresHtml` Zeile `data-hsum` → `summary` mit `view:1` (ohne Feedback/Freischalt-Meldungen, `data-sumback`). `sumTags` im Endbild.
- **Alle Stufen** (`META.stAll`, `data-zsstall`): Stufenwahl bis 8; Lauf über `stMax` → `run.stTest=1`, `run.test=1`, `z2After` schaltet nichts frei. `run.stNewAll`, Endbild `z2NewsHtml(run,1)`.
- **Profilwahl:** Profil ohne gewählten Lebensraum (offen, z2) zeigt Stufen-Knöpfe `data-hdlock` (gesperrt) und Hinweis `.hdhint`.
- **Lebensraum-Prüfung im Protokoll:** `ih` aus `Z.inspHabs`; `inspHab` entfällt (Zufallszug bleibt für gleiche Seeds).

## 20. 0.89a
- **Weltreise:** `wrRollOpts0` lost je Kontinent ein Paar (Region, Schwerpunkt); im ersten Durchgang nur Schwerpunkte, die noch < 2-mal vorkommen; reicht das nicht, zweiter Durchgang ohne Grenze. Europa zählt nicht.
- **Verbotene Paare** (`daten/gelaende.json` `verbotene_paare`, `06:paarVerboten`): `ruleRoll(mapId)` lässt verbotene Auflagen weg; `04:mapRoll` lässt in der Weltreise (Auflage steht vorher fest) verbotene Gelände weg. Heute: Zerklüftet + Eingang.
- **Eingang:** nur noch Eingangsfeld frei, erstes Gebäude am Eingang, alles verbunden (`entryCut`); zubauen erlaubt.
- **Stufen-Ziele** `08:stTF(i)`: Frühling ×1, ab Sommer Produkt der `ziel`-Wirkungen. Einstieg (`einTF`) und Testlauf (`d4TF`) unverändert.
- **Raubtier-Kenner** `k_raub`: ×(1+0,12·Raubtiere) auf N, höchstens ×1,6.
- **Umbau:** `data-umbuse` öffnet `#umbConfPop` (`umbConfHtml`), „Einsetzen“ ruft `umbUse(i,true)`.
- **Vorschau-Schalter** `META.pvOff`: in `render0` keine `badges`/`links`/Hervorhebungen der Vorschau (nicht im Tutorial).
- **Stufenwahl** `09:stageBox`, Auswahl `screenArg.stSel`.
- **Bratwurstbude** `rq:'savanne'`, Ersatz Popcorn.

## 21. 0.90a – Ensembles, Promis, Spezialisten, Auflagen-Kategorien
- **Show-Bonus** `04:showF(sh,art,nova)`: je Auslöser +0,35 (Belugas 0,45, Leckerli 0,5), Nova verdoppelt, höchstens ×2,5. Vorschau-Schilder nutzen `showF`.
- **Stress** `04:strOf(b,c,nb,idx,vs)` (aus `evalB` herausgezogen, gleiche Rechnung): liefert `st` für die Wertung und die Ensembles.
- **Ensembles** (`daten/ensembles.json` → `04:ENS`, Texte `texte_de.json` `ensemble`, Bedingungen `04:ENS_WIRKUNG`):
  - `04:ensFind(bs,idx)`: je Ensemble alle passenden Karten (bei `ruhig` nur ungestresste nach `strOf`), zusammenhängende Teile (Nachbarschaft wie `nbrs`) ab `mindest` = 3, Food Corner zusätzlich `verschieden` = 3 verschiedene Grundkarten. Ergebnis wird je Brett-Array zwischengespeichert (Signatur aus Gebäuden, Team, Profil, Ereignissen, Winter).
  - Wertung: in `evalB` als Prozent-Schritt (`pct`, vor Gold) je Ensemble `[Icon Ensemble Name, fa, fs, 1]` → eigene Zeile im Detail-Fenster; zwei Ensembles multiplizieren sich, jedes Mitglied genau einmal.
  - Faktoren: Food Corner ×1,25 B, Vergnügungsmeile ×1,25 B, Stilles Eck ×1,2 N, Sicherer Hain ×1,2 B/N, Schutzzone ×1,5 B/N; Ensemble-Regisseur (`regie`): 1,25→1,5, 1,2→1,4, 1,5→1,75 (`regisseur` in der JSON).
  - Taler: `dayIncome` → `ens` = Summe `taler` (Food Corner +1 je Ensemble).
  - Aus, wenn kein `CTX.zl` oder im Tutorial (`04:ensOn`). Entdecken `09:ensDiscover` (in `discover92`): `sl.ens[key]`, Einblendung `#ensPop` (`state.ensNew`), sonst Banner einmal je Zoo (`state.ensSeen`). Brett: `06:ensMarks` (Außenkanten golden, Schild). Zoo-Buch: `09:ensBuchHtml` im Reiter „Freundschaften & Ensembles“.
- **Promi-Verstärker** (Kennungen unverändert): Chef Carmen `futterkueche` ×1,5 N Nachbar-Gehege, Mia Megaviral `besucherlotse` ×1,5 B, beide `preis:1` (`01:costParts`); Stella Starr `scheinwerfer` ×2,5 (stärkstes Nachbar-Gehege), Nova `buehne` (Show doppelt, bis ×2,5), Sven Frost `winterquartier` (ohne Winter-Bedingung, ×1,2 B/N im Winter für Nicht-Verstärker), Luna Lotus `ruhezone` (kein Trubel, ×1,25 N für scheue Gehege). Story in `texte_de.json` `story` (→ `c.story`, `07:fxHtml`). Brett: `06:vstMarks` (Strahlen + Schild), Zählen: „⚡ ×…“ (`07:startScoring0`).
- **Neue Spezialisten** (`daten/spezialisten.json`, Wirkung `01:SPEZ_WIRKUNG`): `zweiraum` (Gruppen-Bonus `SPGRP`, Gehege mit 2 Feldern, ×1,1 B/N je solches), `hirtin` (+2 B je benachbartes Beutetier für Beutetiere), `grenz` (×1,2 N, wenn Nachbar-Gehege aus ≥ 2 Lebensräumen), `naturpur` (×1,3 N bei ≤ 2 Gastro+Attraktionen), `kl_kueche` (×1,3 B bei ≤ 2 Gastro), `ruhlage` (×1,3 B bei ≤ 2 Attraktionen), `frueh` (×1,5 B/N an `state.day===0`), `spurt` (×1,4 B/N an `state.day===DAYS−1`), `wetterfrosch` (`02:inspHid`/`winterSee`: Winter-Bedingung samt Schildern ab Frühling; gewertet wird weiter nur im Winter), `regie` (s. o.; Freischaltung `s:regie` in `LEGEND91`/`FSG`, sobald `sl.ens` ein Ensemble hat).
- **Auflagen-Kategorien** (`daten/auflagen.json` → `06:AUFL_DATEN`; `kategorien`, `auflagen` mit `kat`/`stufe`/`kont`; `WRLV` kommt jetzt von dort):
  - `06:ruleRoll(mapId)`: Kategorien der früheren Zoos (`seenOf(run)` + `SEEN`) meiden, solange möglich; danach wie bisher ungesehene bevorzugen.
  - Weltreise `06:wrRollOpts0`: nur `aufPasst(id, Kontinent)`; Reihenfolge der Kandidaten: gleiche Stufe + neue Kategorie → erlaubte Stufe + neue Kategorie → gleiche Stufe → erlaubte Stufe → alle; `o.lv` = Stufe der gelosten Auflage.
  - Neue Limitierungen in `06:ruleWhy`: `show3` (≤ 3 Showtier-Gehege), `raub2` (≤ 2 Raubtier-Gehege), `klein4` (≤ 2 Gehege mit 4 Feldern), `misch` (gleicher Lebensraum darf sich nicht berühren). `etat`: `07:buy` zählt Karten, Futtersack, Futterlieferung und Umbau je Shop-Besuch (`state.shop.etat`, höchstens 3; Geschenke und Spezialisten nicht).
  - `spflicht` (nur Weltreise, in `kontinente.json` `ziel_auflagen`): `wrGoal` zählt Gehege im Schwerpunkt `state.wrDest.foc`, nötig `max(1, ⌈Gehege/2⌉)`, Prüfung Ende Winter wie die Ziel-Auflagen.
  - Vorlieben (`vorlieben` in der JSON, Gruppen `06:VORL_WIRKUNG`): `06:vorlOf(b,c)` → Faktoren je Gehege/Gebäude auf B und N, in `evalB` als Prozent-Schritt (Zeile im Detail-Fenster), Schild `06:vorlMarks`.
  - Anzeige der Kategorie `06:aufKatHtml` (Auflage-Einblendung, Willkommen der Weltreise, Ziel-Karten, Zoo-Menü); Zoo-Buch Regeln nach Kategorien.
