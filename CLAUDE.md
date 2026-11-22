# Zoolatro – Projektregeln für Claude

Zoolatro ist Tobis Balatro-artiges Zoo-Deckbuilding-Spiel (Hexfelder, Jahreszeiten, Besucher × Natur).
Es ist eine einzige HTML-Datei, die aus Modulen zusammengebaut und über GitHub Pages gespielt wird
(installierbar als App am Handy). Tobi testet am Handy, seine Frau spielt mit.

## 1. Arbeitsweise (wichtig)

- **Immer auf Deutsch antworten.** Kurz, freundlich, sachlich. Tobi wird geduzt, im Spiel siezt Jasper den Spieler.
- **Nur bauen, wenn Tobi es ausdrücklich sagt** („bauen“, „bauen bitte“, „bau das“).
  „Nimm das auf“, „auf die Liste“, „X ändern“ oder eine Fehlerbeschreibung sind **kein** Bauauftrag:
  dann Ursache klären (im Code nachsehen), Lösung vorschlagen, Punkt in die Liste (Abschnitt 6) eintragen und warten.
  Bei Unklarheit nachfragen. Ideen werden oft im claude.ai-Chat besprochen und kommen hier als fertige Liste an.
- **Sparsam arbeiten:** die Module gezielt durchsuchen (grep), nicht ganz lesen; lange Ausgaben kürzen.
  Bot-Läufe nur als Absturz-Test, keine Messreihen, außer Tobi bittet darum. Screenshots nur auf Wunsch.
- Gewünschter Spielstil: keine fertigen Lösungen anzeigen (kein „bestes Feld“), Spieler sollen knobeln.

## 2. Aufbau des Repos

| Pfad | Inhalt |
|---|---|
| `quelltext/src/` | **Quelle der Wahrheit.** Module 00–11 + `00-seite-und-stil.html` (Kopf, CSS) + `99-ende.html` |
| `daten/` | **Inhalte als Daten** (Godot-Vorbereitung 2a–2c): `karten.json`, `merkmale.json`, `spezialisten.json`, `futter.json`, `winter.json`, `gelaende.json`, `stufen.json`, `profile.json`, `texte_de.json` (alle Namen/Texte aus `TXT`), `tutorial.json`, `foerderprogramme.json`, `werbung.json`, `ereignisse.json`, `praegungen.json`, `herausforderungen.json`, `kontinente.json` (🌍 Weltreise), `ensembles.json`, `auflagen.json` (Kategorien, Kontinente, Vorlieben). Werden von `mache.py` ins Spiel eingebaut |
| `quelltext/mache.py` | baut `build/zoodeck.html` (Tests), `index.html` (GitHub Pages), setzt die Daten aus `daten/` ein und den Cache in `sw.js` |
| `quelltext/huelle/` | Rahmen um das Spiel für Web (`web-*`, mit Service Worker) und App (`app-*`) |
| `index.html`, `sw.js`, `manifest.webmanifest`, Icons | die veröffentlichte Seite. **`index.html` nie von Hand ändern.** |
| `tests/` | jsdom-Tests, Tutorial-Durchlauf, Bot – siehe `tests/README.md` |
| `CHANGELOG.md` | Änderungen je Version in Spielersprache |
| `docs/UEBERGABE-bis-0.69a.md` | alte Übergabe-Notiz: Code-Details aller Versionen, Messwerte, Erledigt-Listen (Nachschlagen) |
| `docs/tutorial/` | Tutorial-Planung (Tabelle, Bauplan Zoo 1, Zooplan) |
| `docs/regeln.md` | vollständige Spielregeln mit Rechenreihenfolge und Verweisen auf den Quelltext (Vorlage für Nachbau), Abschnitt 13 = offene Widersprüche |
| `docs/godot-plan.md` | Vorschlag für einen Port nach Godot 4 |
| `tests/referenz/` | 51 Referenzfälle der Wertung (`node tests/referenz/referenz.js`, neu erzeugen mit `… erzeuge`) |

Module: 01 Karten · 02 Zoolatro-Regeln · 03 Sprache (TXT, Kartentexte) · 04 Wertung · 05 Ton · 06 Spiel ·
07 Anzeige · 08 Shop/Menüs · 09 Speichern/Lauf · 10 Tutorial · 11 Bildschirme.

## 3. Bauen – Ablauf

1. Änderungen in `quelltext/src/…` machen.
2. `const VERSION` hochzählen (in `quelltext/src/01-regeln-karten.js`). Schema: 0.69a → **0.70a** → 0.71a … („a“ bleibt).
3. Direkt unter `VERSION` in `CHANGES` einen Eintrag oben einfügen (`{v,d,t,i:[…]}`, Spielersprache), ab dem 4. Eintrag löschen.
   Das zeigt das Fenster „📜 Neu in Zoolatro“.
4. `CHANGELOG.md` oben ergänzen: `## 0.70a · TT.MM.JJJJ · Titel` + Stichpunkte in Spielersprache (keine Code-Namen).
5. `python3 quelltext/mache.py` (setzt auch den Cache-Namen `zoolatro-v070a` in `sw.js`).
6. Testen: `bash tests/pruefen.sh` (vergleicht mit dem letzten Commit; Unterschiede bewerten). Für Änderungen am Tutorial
   ist der Tutorial-Durchlauf darin wichtig. Für neue Funktionen einen neuen Test `tests/jsdNNa.js` schreiben (Vorlage: `jsd68a.js`).
7. Abschnitt 6 dieser Datei pflegen (Liste leeren, „Erledigt“ kurz notieren, ältere Erledigt-Einträge dürfen nach `docs/` wandern).
8. Commit mit Versionsnummer im Text (z. B. `0.70a: Tutorial-Pause in der Vorschau, Zurück-Knopf …`) und pushen → GitHub Pages ist nach 1–2 Minuten aktuell.
9. Zusammenfassung für Tobi: **Neu · Getestet · Nicht getestet · Abweichungen** von dem, was besprochen war.

Bei Inhaltsänderungen (Karten, Spezialisten, Werte) wünscht sich Tobi manchmal die Excel-Inhaltsliste – nur auf Nachfrage.
App (Android, Capacitor) liegt **nicht** in diesem Repo: `python3 quelltext/mache.py --app` erzeugt `build/app-index.html`,
die Tobi nach `zoolatro-app/www/index.html` kopiert.

## 4. Code-Orientierung (Kurzfassung, Details in docs/)

- **Karten:** Daten in `daten/karten.json` (Werte, Form, Tags, Seltenheit …; Reihenfolge nie ändern, der Zufall hängt daran). Wirkungen, die Code sind,
  stehen in `KARTEN_WIRKUNG` (Modul 01); die Karte nennt in `bonus`/`km`/`mult`/`tal` die Kennung (= Kartenschlüssel). Neue Karte = Eintrag in der JSON
  (+ ggf. Funktion in `KARTEN_WIRKUNG`). Zur Laufzeit wie bisher `CARDS` (Werte, Form, `bonus`), Texte in `TXT.de.card`, Merkmale in `daten/merkmale.json` → `TRAITS` (raubtier/beute/scheu/show/ruhig/trubel),
  `tags` (bedroht, gross, einmalig), Lebensraum-Bindung `rq`. Kartenschlüssel: `basis~variante#futter1.futter2^praegung` (Proxy in `CARDS`).
- **Weitere Daten (2b):** Spezialisten `daten/spezialisten.json` → `SPEC` (Wirkungen `SPEZ_WIRKUNG`, Modul 01), Futter → `FOOD`/`HFOOD` (`FUTTER_WIRKUNG`, Modul 04),
  Winter-Bedingungen → `INSP` (`WINTER_WIRKUNG`, Modul 02), Gelände → `MAPS`/`CAMP`/`NATFOCUS`, Profile → `DECKS`/`DECKRULE`/`UNLOCK_DECK`,
  Stufen → `STAGES`, Wirkung über Kennungen `stAb(k)`/`stW(k,d)` (Modul 08). Namen/Texte, die in `TXT` stehen, fehlen in den JSON-Dateien.
- **Daten (2c):** Texte `daten/texte_de.json` → `TXT.de` (Modul 03; Text ändern = nur dort), Förderprogramme/Werbung/Ereignisse → `PROGS`/`ADS`/`EVENTS`
  (`PROG_WIRKUNG`, `WERBUNG_WIRKUNG`, `EREIGNIS_WIRKUNG` in Modul 01; Ereignis-Texte mit `{k}` = Stärke), Prägungen → `PRAEG`, Herausforderungen → `CHAL` (`CHAL_WIRKUNG`, Modul 08).
- **Wertung:** `evalB(b,bs,idx,parts)` je Gebäude, `scoreZoo` mit Multiplikatoren (Kronenfeld, Reinheit, Vielfalt, Stress …).
  Lebensraum-Regeln `habRule`/`habRulesOn`, Zusatz-Faktoren `extra92` (Formen seit 0.77a gestrichen).
- **Lauf:** Zoolatro-Lauf `sl.run`, `state` = laufender Zoo, `META` = Geräte-Speicher. `TUTNOW` = gerade Tutorial.
- **Shop:** `fixedItems()`, Reiter `META.shopT` (`run` Team · `umb` Umbau & Futter · `more` Extras), Unteransichten `state.shopSub`.
- **Futter:** `FOOD`, `HFOOD`, `rollFood`, Futtersack (`state.sack`), Lebensraum-Futter in `run.fdl`. Futterplätze je Karte `fdMaxK(k)` (Seltenheit `c.rar`).
- **Gelände:** `genMap0` (Form, Felsen) → `shrinkMap` → `natPlace` (18 Naturfelder nach `natQuota`, gewählte Lebensräume `GENHABS`).
- **Früh geschafft:** `earlyReward(left)` → `run.bpCarry`, Geschenke `run.gifts` (`gsack`/`gumb`/`gprofi`), Anzeige `earlyInfo` im Sieg-Fenster.

### Tutorial (Modul 10) – Jasper, Zoo 1
- **Alles in `daten/tutorial.json`** (Gelände `TUTMAP`, Ziele `TUTT`, Kartenwahl `TUTOFF`, Phasen-Texte, Kapitel mit Schritten); `tutSchritt` baut daraus die Schritte.
  Schritt-Arten in der JSON: `bau` (→ `tPut`), `tag_ende` (→ `tEndS`), `ausbau` (→ `tUp`), sonst normale Felder. Bedingungen/Vorbereitungen/Markierungen,
  die Code sind, stehen in `TUT_WIRKUNG` (`done`, `setup`, `mark`) und werden per Kennung genannt; `done:{steht:[Karte,Feld]}`, `mark` auch als Feldliste.
- Kapitel `TUT.zl` (Frühling), `zlsh` (Frühlings-Shop), `zs` (Sommer), `zssh` (Sommer-Shop), `zh` (Herbst Tag 1 + Abschied).
  `TUTGUIDED=['zl','zs','zh']`, Start über `TUTCH`. Herbst ab Tag 2 und Winter spielt man frei; Ende = Jasper-Endtext, Knopf `data-gend`.
- Schritt-Felder: `t` (Text oder Häppchen-Liste, Häppchen auch `{t,glow,mark,karte,leuchten}`, `karte` = große Karte in der Mitte), `h`, `only` (Karte), `at` (Zielfelder), `rot`, `setup`, `done`,
  `btn`, `end`, `glow`, `mark`, `undo`, `redraw`, `mv`, `up`, `lock` (Shop-Sperre `{tab,kind}`), `spec` (erzwungener Bewerber), `food` (erzwungenes Futter), `leave`, `arot`,
  `pv` (Häppchen, solange die Karte genau auf `at` liegt; 🔨 gesperrt bis zum letzten, Zähler `state.tut.pk`; `tutPvOn`/`tutPvLock`).
  Helfer `tPut(key,at,t,o)`, `tDay`, `tNat`, `tRock`, `tEndS`, `tSetHand`.
- Häppchen: am Handy einzeln (`tutStep()` liefert ein Lese-Objekt `_read` mit „Weiter ▸“ und ab dem 2. „◂ Zurück“), im Querformat (`body.land`) alles in einer Box.
  Markierungen über `tutMarkAll`, Leuchten über `tutGlowAll`.
- Im Tutorial aus: Merkmale (`TUTTR=false`), Stress-Felder, Rote Liste, Zucht, Winter-Bedingung (`INSP.frei`), Lebensraum-Regeln außer Savanne,
  Früh-geschafft-Bonus, Prägungen/Veredelungen/fremde Lebensräume in der Kartenwahl. Gelände wird nie gedreht.
- Ziele `TUTT=[5000,50000,80000,150000]`. Zoo 2 des Tutorials plant Tobi noch (dort Merkmale/Regeln einschalten).

## 5. Bekannte Eigenheiten

- `bot7.js` ersetzt `render` durch eine leere Funktion → in UI-Tests vorher sichern und danach zurücksetzen (siehe `tutcal5.js`).
- Tests prüfen oft die Versionsnummer → nach dem Hochzählen schlagen „Version“/„Neuigkeiten“-Prüfungen erwartungsgemäß fehl
  (`pruefen.sh` blendet sie aus).
- Im freien Teil des Tutorials ist der Spielverlauf zufällig; der Durchlauf kann an verschiedenen Tagen enden.
- GitHub Pages: Die Veröffentlichung („pages build and deployment“) kann auf GitHubs Seite mit `startup_failure` scheitern oder in der Warteschlange hängen
  (so bei 0.78a). Dann Lauf abbrechen und mit dem nächsten echten Commit neu auslösen; Stand prüfen über die Actions-Liste.

## 6. Liste fürs nächste Bauen (wird 0.92a) – erst bauen, wenn Tobi „bauen“ sagt

1. **📸 Fotograf nie am selben Tag wie der ❤️ Besucherliebling** (Chat 21.11.): Der Liebling wird in `startDay` (Modul 09 ~Z. 393/394, `state.fav`) vor den Zoo-Momenten ausgelost (~Z. 398).
   Lösung: bei der Momente-Auswahl `foto` ausschließen, wenn `state.fav!=null` (zusätzlich zu `state.season<1`). Kommt dann kein anderer Moment in Frage, gibt es an dem Tag keinen. Test: viele Tage mit gesetztem Liebling → nie `foto`.
2. **Zoo-Übersicht zeigt die Stufe** (Chat 22.11.): `zooBoxHtml` (Modul 06 ~Z. 452) nennt Zoo, Jahreszeit und Tag, aber nicht die Stufe des Laufs (`run.stage`). Neu: in der Zeile `.zwhen` „· 🏔️ Stufe n“ (plus „🧪“ bei Testlauf bzw. „Stufen-Test“ bei `run.stTest`).
   Antippen öffnet die Wirkungen dieser Stufe wie in der Stufenwahl (`stageBox`, nur ansehen). Gilt auch für die Seitenleiste im Querformat (`rail`). Im Tutorial nichts anzeigen. Test: Lauf auf Stufe 3 → Übersicht enthält „Stufe 3“.
3. **Ensemble für Naturschutz ergänzen** (Chat 22.11., wurde vergessen): 🌳 **Naturlehrpfad** = 3 **verschiedene** Naturschutz-Gebäude, die zusammenhängen → je ×1,25 N. Neuer Eintrag in `daten/ensembles.json`
   (`{"key":"pfad","icon":"🌳","wer":"natur","fa":1,"fs":1.25,"verschieden":3}`), Kennung `natur` in `ENS_WIRKUNG` (Modul 04, Kategorie Naturschutz wie `gastro`/`attr`), Name/Text in `texte_de.json` (ensemble), Regisseur ×1,25 → ×1,5 gilt automatisch.
   Zoo-Buch, Einblendung und Brett-Markierung laufen über die bestehenden Wege (`ensBuchHtml`, `ensDiscover`, `ensMarks`). Plan-Datei Abschnitt A nachziehen. Test: 3 verschiedene Naturschutz zusammen → ×1,25 N, 3 gleiche → nichts.
4. **📰 Zeitungsartikel sichtbar machen und nicht doppelt anbieten** (Chat 22.11.): Wirkt bis Zoo-Ende (`state.zl.news`, Kauf Modul 07 ~Z. 725, Wertung Modul 09 ~Z. 378), sichtbar aber nur als Zeile im Detail-Fenster.
   Neu: Chip in der Zoo-Übersicht (Chips-Zeile in `zooBoxHtml`, wie Boni): „📰 Zeitungsartikel: Showtiere ×1,5 (bis Zoo-Ende)“; ebenso „🎟️ Glückslos: nächster Jahreszeit-Start Chancen ×2“, solange `state.luckNext` offen.
   `genEinmal` (Modul 07 ~Z. 660) bietet `zeitung` nicht mehr an, wenn `state.zl.news` schon gesetzt ist (heute kann man ihn ein zweites Mal ohne Wirkung kaufen), ebenso `glueckslos` bei offenem `state.luckNext`. Test: nach Kauf kein zweites Angebot, Chip da.
5. **Gratis-Geschenke auch mit Schulden abholen** (Chat 22.11.): `canPay(p)` (Modul 07 ~Z. 717) verlangt `state.money>=0` auch bei Preis 0 → Geschenke aus `run.gifts` (Futtersack, Umbaukiste, Profi-Mappe; `price:0`, ~Z. 715) sind im Minus gesperrt.
   Lösung: `canPay(p)` gibt bei `p<=0` immer `true`. Alles mit Preis bleibt im Minus gesperrt (Schulden-Hinweis „Erst ab 0 kannst du wieder kaufen“ bleibt, ggf. „außer Geschenke“ ergänzen). Test: Kasse −10, Geschenk abholbar, Karte mit Preis nicht.
6. **Detail-Fenster: Listen werden abgeschnitten** (Chat 22.11., Screenshot Krakengrotte: „Grundwert und dazu“ und „Möglich, wirkt gerade nicht“ zeigen nur 1½ Zeilen, „Faktoren“ nur 2 von 5 – die Rechnung darunter hat ×1,25 ×1,5 ×2 ×2 ×1,75).
   Ursache CSS (`00-seite-und-stil.html` ~Z. 884/893): `.dsh` ist eine Flex-Spalte mit `max-height:88vh;overflow:auto`, die Kinder dürfen schrumpfen (`flex-shrink:1`), und `.dtrows` hat `overflow:hidden` → bei langem Inhalt werden die Listen gestaucht und abgeschnitten, statt dass das Fenster scrollt.
7. **Stufe 4: größerer Sprung bei den Zielen** (Chat 22.11., Tobi: Grundschwierigkeit nicht erhöhen, aber Stufe 4 höher ansetzen; Lauf Stufe 4 im Testlauf meist 115–186 %): `daten/stufen.json` Stufe 4 `ziel` 1,1 → **1,2**
   (zusammen ab Sommer: Stufe 2–3 ×1,1, ab 4 ×1,32, ab 7 ×1,45). Text „Saisonziele ab Sommer ×1,2 · Reinheit erst ab 6 Tieren“; Stufen-Kasten (`stageBox`) rechnet die Summe selbst. Frühling bleibt unberührt (`stTF`). Test: Stufe 4 Sommerziel ×1,32 gegenüber Stufe 1.
8. **Kleine Küche schwächer** (Chat 22.11.: stand in jedem Endstand, kostet kaum etwas): ×1,3 B → **×1,2 B** bei höchstens 2 Gastro (`SPEZ_WIRKUNG.kl_kueche` Modul 01, Text `texte_de.json`). Ebenso **Ruhige-Lage-Planer** und **Naturpur-Leiterin** ×1,3 → ×1,2 (Tobi: ja).
   Referenzfälle prüfen (vermutlich keiner betroffen).
9. **Lauf-Protokoll zeigt Ensembles** (Chat 22.11.): Je Zoo eine Zeile wie bei den Meilensteinen, z. B. „Ensembles: 🍔 Food Corner (Herbst, Tag 2) · 🍃 Stilles Eck (Winter, Tag 1)“ bzw. „Ensembles: -“.
   Zeitpunkt beim ersten Auftreten im Zoo merken (im Zoo-Protokoll `logZoo`, Modul 06, neben den Meilensteinen; Quelle `ensFind` am Tagesende). Test: Zoo mit Ensemble → Zeile im `runText`.
   Lösung: `.dsh>*{flex-shrink:0}` (oder `.dtrows,.dtcalc{flex:none}`); im Querformat (`body.land .dsh`, `height:100%`) dasselbe. Test (`quer.js`, Hochformat 360×740): Detail-Fenster einer Karte mit vielen Faktoren → jede `.dtrw` voll sichtbar (Höhe > 0, nicht abgeschnitten), Fenster scrollt.

**Nach 0.91a beobachten:** Ensembles (Stärke, wie oft sie entstehen), Promi-Verstärker (Preis +1 genug?), Vorlieben-Auflagen (×1,5/×0,5), Kleiner Etat, Schwerpunkt-Pflicht.

**Nächster Schritt Weltreise:** Ersatz für die Stufen 7/8 im Weltreise-Modus (Plan `docs/plan/weltreise.md` „Für später“).
   Nach ein paar Reisen prüfen: Schwierigkeit der Ziel-Auflagen (z. B. Nachwuchs, Vorzeigegehege), Natur-Anteil 0,4 und Fleckgröße; Savanne nach der Abschwächung beobachten; Meilensteine auf Felsen weiter testen.

**Offen / zur Entscheidung:**
- Dingo hat im Tutorial keinen Wirkungstext (Bonus hing an Beutetieren) – prüfen, ob eine andere Karte besser passt.
- Waldfelder auf dem Tutorial-Gelände bleiben, obwohl keine Dschungel-Karten kommen – Tobi fragen, falls es stört.

**Godot-Vorbereitung (Stand):** 2a–2c fertig und mit 0.74a in main. Nächster Schritt laut `docs/godot-plan.md`: Wertung in Godot gegen die Referenzfälle.
  Werkzeuge: Textvergleich alt/neu `bash tests/textvergleich.sh`, Querformat-Test `node tests/quer.js` (auch in `pruefen.sh`).

**Für später (aus dem Chat 13.11.):** Gruppen-Bonus nach ein paar Läufen prüfen (evtl. Schritt 0,05 statt 0,1, in `daten/spezialisten.json` `schritt`) · Förderung attraktiver: erst Nutzen
im aktuellen Zoo anzeigen („heute etwa +X B“), danach ggf. Preis/Wirkung; im Tutorial Zoo 2 zeigen · Winter-Bedingung „Mindestgröße“ zur Gruppe „schwer“ ·
Feedback per Online-Formular (vor Veröffentlichung, mit Datenschutz-Hinweis) · Schalter für Ereignisse und Glück in der Auswahl.

**Für später (Chat 21.11., Endgame):** Wer Stufe 8 geschafft hat, schaltet einen 7. Zoo frei: eine sagenhafte oder unentdeckte Region (z. B. Atlantis, verlorenes Tal) mit eigenen Karten wie Dinosauriern, Einhörnern usw.

**Für später:** Tutorial Zoo 2 (Merkmale, Regeln, Winter-Bedingung) · Grafikstil · Futter-Balance · neue Meilensteine
(Freundschaften, Ausbaustufen) · Verschmelzen · Weiterspielen nach dem Ziel beobachten.
· **Stufen:** schwere Winter-Bedingung ab Stufe 5 (Rest, nicht in 0.76a) · **Winter-Bedingungen** in leicht und schwer teilen · neue Winter-Ideen:
am 1. Wintertag werden 2 zufällige Tiere ausgewildert (Gehege und Karte weg); Bauverbot für Gastro, Attraktionen oder Naturschutz.

## 7. Erledigt (zuletzt)

- **0.91a** (als 0.90a beauftragt, Nummer war schon vergeben; [Auftrag](docs/auftraege/0.90a-ensembles-promis-spezialisten-auflagen.md), Plan `docs/plan/ensembles-spezialisten-auflagen.md`, Regeln `docs/regeln.md` 21): Show `showF` (×1,35 je Auslöser, Belugas 1,45, Leckerli 1,5, Nova doppelt, max ×2,5);
  Stress aus `evalB` nach `strOf` gezogen; Ensembles `daten/ensembles.json` → `ENS`/`ENS_WIRKUNG`/`ensFind` (Zwischenspeicher je Brett-Array)/`ensOf` (Prozent-Schritt in `evalB`)/`ensTaler` (`dayIncome.ens`), Entdecken `ensDiscover` (`sl.ens`, `state.ensNew` → `#ensPop`, `state.ensSeen`), Brett `ensMarks`, Zoo-Buch `ensBuchHtml`;
  Promis: Namen/Story (`story`) in `texte_de.json`, Icons in `karten.json`, `preis:1` in `costParts`, Look `.card.vst`/`.ocard.vst` (`vstVal`), Strahlen `vstMarks`, „⚡“ beim Zählen; 10 Spezialisten (`zweiraum` in `SPGRP`, `hirtin`/`grenz` per, `naturpur`/`kl_kueche`/`ruhlage`/`frueh`/`spurt` mult, `wetterfrosch` über `inspHid`/`winterSee`, `regie` in `ensF`, Freischaltung `s:regie`);
  Auflagen `daten/auflagen.json` (`AUFK`/`AUFA`/`aufK`/`aufPasst`/`aufKatHtml`, `WRLV` von dort, `kontinente.json` ohne `auflagen`), `ruleRoll`/`wrRollOpts0` mit Kategorien und Kontinenten, neue `show3`/`raub2`/`klein4`/`misch` (`ruleWhy`), `etat` (`buy`, `state.shop.etat`), `spflicht` (`wrGoal`), Vorlieben `VORL`/`vorlOf`/`vorlMarks`.
  Referenzfälle mit `aktualisiere`: alle 51 neu (Gesamt ×0,86–×2,1, Median ×1,13); Gegenprobe mit alten Show-/Verstärker-Werten und ohne Ensembles ergab alle Zahlen wie 0.89a.
  Tests: neu `jsd91a.js`; angepasst `jsd64a` (Show/Leckerli/Tribüne, Profi-Mappe ×1,4, Showtier-Zeile genau), `jsd72a`/`jsd78a` (Show-Texte), `jsd88a` (Belohnung vor `wrGo` auf null, war zufallsabhängig), `jsddaten` (Texte mit `ensemble`, Wertung nur noch > 0).
  Bekannt (schon 0.89a): `WR=1 sim94.js` meldet `click is not a function` (SVG-Punkt der Weltkarte im jsdom).
- **0.90a** (Chat 21.11., Tobi: „Vorschau aus funktioniert nicht“): Schalter wirkte nur auf Nachbar-Schilder beim Platzieren. Jetzt `pvHide()` (Modul 07, `META.pvOff`, nicht im Tutorial) auch für Auswahl-Hinweise (`trm`/`labs`-Schilder `.trl`, Hervorhebung),
  Info-Feld beim Platzieren (`infoHtml`: `h=null` → nur Karteninfo), Winter-Wirkungen (`winterMarks`, Handkarten `data-dead`, `zlDead`-Markierungen außer Profil/„Betroffene zeigen“, Info-Zeilen). Bleiben: Umriss, `ruleOverlay`, Naturflächen passt/nicht, „passt nicht, weil“. Test neu `jsd90a.js`.

- **0.89a** ([Auftrag](docs/auftraege/0.89a-schliff-stufen-umbau-auflagen.md), Regeln `docs/regeln.md` 20): Weltreise höchstens 2× derselbe Schwerpunkt (`wrRollOpts0`, Paare Region/Schwerpunkt, zweiter Durchgang erlaubt Gleichheit);
  Umbau-Fenster `umbConfHtml`/`umbConfOk` (`state.umbConf`, `#umbConfPop`, `data-umbcx`); Raubtier-Kenner `ms`; `META.pvOff`/`data-pvm` (Vorschau-Schilder/Linien aus, nicht im Tutorial); Eingang-„frei“-Regel gestrichen;
  Stufenwahl `data-stsel` → `screenArg.stSel`, Kasten `stageBox` (alle Wirkungen bis n, Ziele zusammengefasst, Start `data-cdeck`+`data-stage`); verbotene Paare `gelaende.json` `verbotene_paare` (`paarVerboten`, `ruleRoll(mapId)`, `mapRoll` mit `WRCTX`);
  Bratwurst `rq:savanne` (+ `RQS`/`ersatz`); `stTF(i)` Frühling 1. Nebenbei: `pointerleave` auf Brett/Hand und Brett-Klick ohne laufenden Zoo abgesichert. Referenzfälle unverändert (kein Fall mit Raubtier-Kenner).
  Tests: neu `jsd89a.js`, angepasst `jsd71a`/`jsd88a` (Stufe antippen + Start-Knopf), `quer.js` Schritt 15 und Menüweg mit „▶ Mit Stufe 1 starten“.

- **0.88a** ([Auftrag](docs/auftraege/0.88a-weltkarte-highscores-stufen.md), Regeln `docs/regeln.md` 19): Meilenstein `habSel` ohne `c.ms`; Auslosung nie nur leicht; Protokoll `ih` aus `inspHabs` (`inspHab` weg); `statOff` (Testlauf zählt, Bestwerte getrennt, `run.tv`);
  Highscores `deck` + `sum` (`sumSlim`/`csPrune`/`sumTags`, `data-hsum`, `summary` mit `view`, `data-sumback`); `META.stAll`/`data-zsstall`, `run.stTest`, `run.stNewAll`; Profil ohne Lebensraum mit `data-hdlock`/`.hdhint`;
  Weltkarte `wrWorldSvg`/`WMLAND`/`wrLage` (Daten `lage`, `staedte_lage`), Liste weg, `.wrlay` (Querformat zweispaltig), Klick über `[data-wrsel]` im Bildschirm-Handler. Tests: neu `jsd88a.js`, angepasst `jsd85a`/`jsd86a` (Karte statt Liste), `quer.js` Schritt 12 (Karte).

- **0.87a** ([Auftrag](docs/auftraege/0.87a-schliff-weltreise-arktis.md), Regeln `docs/regeln.md` 18): Naturfläche ändern 3 Felder (`UMB.natur.n`, `T.sel`, `data-umbfin`, `umbSelOverlay`); `earlyReward` im Testlauf +1 Stufe;
  Detail-Fenster `calcData`/`zooFxHtml` (genau = Zoo, Zeile „Sonstiges“ für Faktor-Änderung/Rundung, nur Vorschau, `detTarget` liefert `h`); Futter-Label „Wasser-Futter … (Stufe n)“ + Unterzeile; `winter.json` `stufe`, `wrHardRule` in `initZl`/`wSwap`, `inspStufeTag`;
  Auswilderung Sommer/Herbst; `natur_anteil` 0,4; Leichter Boden nicht mit Gebirge; Arktis-Zone `viewRotFor`/`northOf`/`state.north` (+ Plan `north`), ⅔-Regel in `natPlace`; Meilensteine `fits` (`c.ms`), `noRocks` für die Vorschau.
  Referenzfälle mit `aktualisiere` (nur Futter-Beschriftung in 2 Fällen, alle Zahlen gleich). Tests: neu `jsd87a.js`, angepasst `jsd85a` (Natur 0,4), `quer.js` Schritt 14 (Arktis-Zone hoch/quer, Drehen).

- **0.86a** ([Auftrag](docs/auftraege/0.86a-regionen-zoomenue-savanne.md), Regeln `docs/regeln.md` 16/17): Weltreise-Regionen: `kontinente.json` mit `kontinente` (7, Europa `staedte`), `regionen` (25, `foki`, Antarktis `frei`), `alt` (0.85a-Kennungen);
  `wrRollOpts0` schließt besuchte Kontinente aus (`wrKOf`, auch Europa), ein Ziel je Kontinent, Europa Auffüller bzw. Ersatz; Anzeige Region (`o.ort`) mit Kontinent darunter. Zoo-Menü neu: `zooBoxHtml(rail)` mit `ZT`/`ZD`,
  `zuchtNow`, `ZRULES`/`zooRulesHtml` (`#mZooRules`, `#mZooBack`), Rail ohne Knöpfe. Herde `HERD3`/`HERDMAX` in `habRule` (2 → ×1, ab 3 ×1,15, +0,1/Steppe +0,15, max ×1,75), Steppe-4er-Rabatt aus `costParts` entfernt.
  15 Freischalt-Gehege +1 Hauptwert (`karten.json`). Kronenfeld `crownPick`/`crownFits` in `initZl` (≥ 3 Lagen aller 4-Felder-Gehegeformen, ohne Rand bevorzugt, sonst meiste Lagen). Nebenbei: `shrinkMap` → `connectedPart(cells,[cx,cy])` startet in der Mitte (Flusstal schrumpfte selten auf 1 Feld, auch schon in 0.84a). Referenzfälle mit `aktualisiere`: 46 von 51 neu (39 mit anderer Gesamtzahl, ×0,91–×1,02). Tests: neu `jsd86a.js`, angepasst `jsd85a` (Regionen), `quer.js` Schritt 13 (Zoo-Menü).

- **0.85a** ([Auftrag](docs/auftraege/0.85a-weltreise.md), Regeln `docs/regeln.md` Abschnitt 16): 🌍 Weltreise-Modus `run.wr` (Schalter `META.wr`/`data-zswr`), Daten `daten/kontinente.json` → `WR_DATEN` (Modul 06, Abschnitt „Weltreise“).
  Lauflänge `runGoal(run)`/`wrGoalN` (statt `CAMP_GOAL`), Auslosung `wrRollOpts` (Pläne je Ziel vorab, `WRCTX` steuert Auflage, `wrQuota`/Fleckgrößen in `natPlace`, Leichter Boden in `genMap`), Wahl `wrPickHtml`/`wrGo`
  (Schritte `wr`, `wrgift`, `perk` mit `a.wrPerk`; vor Zoo 1 `reward.first`, ◂ Zurück über `zlBack`), Start `wrArrive` + `wrWelcomeHtml` im `rulePop`. Ziel-Auflagen `wrGoal`/`wrBadge`, Prüfung in `endDay` (`state.wrWait`, `state.wrFail`),
  Auswilderung `wrAuswild` (`#wrAusPop`, `run.wrGone`). Boni `run.boni`/`wrBon` (Gold `initZl`, Helfer `startDay`, Forscher `rollMarket`). Wunsch nur Sommer (`wishOn`, `WRWISH`/`wRw`, Getter in `WISH.arten5`,
  Geschenk `gmappe`, `state.wbp2`, Fenster `state.wpick`/`wpickDo`). Highscores `csCmp` mit `goal`/`zp`/`wr`. Kartenwahl-Lose `zkPools`/`zkDeal` (Modul 11) ausgelagert. Sichtachse → 🚧 Baugrube (5 zusammenhängende, `R.ax`).
  Tests: neu `jsd85a.js`, `quer.js` Schritt 12, `sim94.js` mit `WR=1` (Bot spielt eine Reise, `LOG=1` zeigt Seiten-Ausgaben).

- **0.84a** ([Auftrag](docs/auftraege/0.84a-flusstal-kartenwahl.md)): Flusstal: Ursache war nicht die Drehung (Flusstal hat `norot`), sondern das senkrechte Verschieben
  ohne Zoom (`SHIFT` durch Wischen oder `fitUnderInfo`): Das SVG ist beim flachen Gelände nur so hoch wie das Gelände (`--ar`), verschobene Felder wurden an seiner Kante abgeschnitten.
  Lösung CSS `.boardwrap:not(.zoomed) #board{overflow:visible}`; `quer.js` Schritt 11 (Gegenprobe ohne Korrektur: 9–13 Felder verdeckt). Kartenwahl `crewardStep('card')`:
  Pools `rare`/`comm`, Platz 1 selten, Platz 2 zu 50 %, Platz 3 gewöhnlich (Forscher 2). `WISH.early.gone`, Filter in `wishRoll` und Glossar. `regeln.md` 1.3 korrigiert. Test neu `jsd84a.js`, angepasst `jsd76a` (Kartenwahl: nur seltene glänzen).
- **0.83a** (Chat 13.11.): Testlauf „4 Tage“ schaltet Stufen und Herausforderungen frei (`z2After` schließt nur noch `run.seed` aus); Highscores/Bestwerte bleiben getrennt.
  Einmalig nachträglich in `loadMeta`: laufender Testlauf (`sl.run`/`runAlt`, `d4`, `zoo>=3`) → nächste Stufe, Merker `run.d4st`. Abgeschlossene Läufe sind nicht gespeichert (`sl.run=null`, Highscores ohne Profil),
  dafür gibt es keine Nachholung. Hinweistext am Schalter angepasst. Test neu `jsd83a.js`.
- **0.82a** ([Auftrag](docs/auftraege/0.82a-reparatur-gruppenbonus-kurven.md)): Futter-/Deck-Liste repariert: Detail-Fenster-Klassen umbenannt (`.dtrows`, `.dtrw`, `.dtv` … statt `.drows` …),
  `quer.js` Schritt 10 prüft Überlappung und Kontrast. `ruleRoll` ohne `locker` bei `run.d4`. Gruppen-Bonus `SPGRP`/`spGrpPer`/`spGrpF`/`spGrpFx` (Texte aus `schritt`), Label „💧 Name (n …) ×f“,
  `specVal` zeigt den Faktor. „Aktuell pro Tag“ über `yieldCmp` (scoreZoo mit/ohne, auch für Förderung). `einstieg` alle 0,8, `ZLSEAS` Herbst 1,6, Heizkosten 1,25/1,5,
  Kasse `monTxt`/`monHtml` (`.mneg`). Referenzfälle: 39 von 51 neu (Gruppen-Bonus, Gesamt meist ×1,0–1,2, höchstens ×1,97). Tests: neu `jsd82a.js`, angepasst `jsd80a` (Einstieg ×0,8).
- **0.81a** ([Auftrag](docs/auftraege/0.81a-winter-details-lotto.md)): Winter sichtbar: `winterHit(b,bs,idx)` (Modul 02, Faktor wie `inspFx`), Schilder `winterMarks` in `zlMarks`
  (Herbst blau `.wnt.pre`, Winter rot), `winterHitTxt()` im Wetterbericht und im Winter-Fenster `modal==='insp'`. `gross` ×0,75 / verschärft ×0,5, erst ab Zoo 3 (Auswahl in `initZl` und `wSwap`).
  `mxs(0)` = „0“. Aufstellung am Zähler: `aufOf(r)`/`aufBlock`/`aufHtml`/`aufToggle` (`#aufPop`), `state.yday.auf`; bei Bauen „Stand jetzt“ dazu.
  Detail-Fenster: `evalB`-`add` mit `{fa,fs}` je Faktor-Schritt, `breakdown` mit `a0/s0` und Faktor für Wiederholung/Ausbau; `detCalc`, `detSheetHtml`, `detTarget` (Gebäude oder Vorschau),
  `detOpen` über `data-det` im Info-Feld (`#detSheet`, Querformat rechts). Lotto `chance(.25)`, `specVal` „–“. `flSl`/`fsCheck` schließen `run.d4` nicht mehr aus (Bestwerte `cu` bleiben getrennt).
  `ZLSEAS` Sommer 1,35. Referenzfälle: nur 38/39 (Mindestgröße) mit neuen Zahlen. Tests: neu `jsd81a.js`, `quer.js` (Schritt 9), angepasst `jsd77a`/`jsd79a` (Testlauf zählt für Freischaltungen).
- **0.80a** ([Auftrag](docs/auftraege/0.80a-schliff-einstieg-shop.md)): Gesperrtes geheim: `buchCard` (❔/„???“, Farbe bleibt), `glossSpec` (nur Weg), `progHtml` und `fsNextHtml` über `unNameL`
  (Lebensräume sichtbar); Enthüllung `fsRevHtml` als `bigPop('fsRevPop')` bei `fsCheck('fl')` (`state.fsRev`), sonst `fsNewHtml` „✨ Neu entdeckt!“ mit `fsCardHtml` (`offerCard`/`specCard`).
  „Alles zurücksetzen“: `resetAsk(1|2)` (Fenster `#resetPop`, „LÖSCHEN“ `data-rs="go"`), `resetAll` löscht `SAVE_KEY` + `zoodeck-*`, `RESETTING` sperrt `saveMeta`, dann `location.reload()`.
  Werte ohne Prozente (Stress „×0,95“, Wiederholung „×0,75“, Ausbau „×1,75/×2,25“, Winter-/Profil-/Stufen-Texte), Wahrscheinlichkeiten bleiben. `priced` im Testlauf ×0,8 (aufgerundet).
  `.pcard.rg1/.rg2` kräftiger Glanz. Zoo-Übersicht ohne Freischalt-Kasten. `einTF(i)` aus `profile.json` `einstieg` (Zoogründer Stufe 1, Hinweis in der Stufenwahl).
  Eingang ≥ 2 bebaubare Nachbarn (`initRule`). Brett-Klick ohne `[data-q]` → `hexAt` (Felsen mit Sprengmeisterin). `runText`/`fbText` mit „🧪 Testlauf 4 Tage“, `fbAsk` auch im Testlauf.
  Shop-Leuchtpunkt `shopDot`/`shopMarkSeen` (Signatur je Reiter in `state.shopSeen`, `shopShelf`/`shopTabOf` jetzt global), Hinweis `foerd` (darf im Shop-Fenster erscheinen).
  Storch `MOMW.storch=0` und aus der Auswahl gefiltert. Referenzfälle mit `aktualisiere` (50 Fälle, nur Beschriftungen, alle Zahlen gleich). Tests: neu `jsd80a.js`, `jsd65a` (Leuchtpunkt ohne Leerzeichen), angepasst `jsd78a` (Feedback im Testlauf), `jsd79a` (Team geheim), `jsd93` (×1,1 mit Einstieg, Storch), `quer.js` (Schritt 8).
- **0.79a** ([Auftrag](docs/auftraege/0.79a-zoobuch-schliff-fleiss.md)): Freischaltungen: `daten/freischaltungen.json` (`zaehler`, `fleiss`, `kunststueck`) →
  `FREI_DATEN`/`FLZ`/`FLG`, setzt `how`/`n` in `FSG`; Fleiß-Ziele `g.fl`, `ev:'any'`. `fsPickRun` ist leer (kein `run.fsPick`, kein `fsIntro`), `fsCheck('fl')` prüft nur Fleiß.
  Zähler `sl.fl` (`flOf` mit Startwerten aus `statOf`/`cuOf`), `flAdd`, `flBuilt` (in `build`/`undo`, Gebirge an Felsen = `b.fels`), `flDay` (in `startScoring`),
  `flRare` (Shop, Kartenwahl `pick`, zwischen den Zoos), Futtersack, `hireSpec`, `finishGame` (spent über `run.flSpent`, zoos, winterFail), `endRun` (runs); `flSl()` nicht Tutorial/d4/Seed.
  Anzeige `fsProg`/`fsBar` („137/250 … (über alle Läufe)“ bzw. „Bestwert“), `fsNext`/`fsNextHtml` („Als Nächstes“ in Zoo-Übersicht, Sieg-Bildschirm, Freischalten).
  Zoo-Buch: `buchCard` kompakt (`.bkc`, `data-bko` → `screenArg.bkOpen`), Vollansicht `buchFull`; `buchLock` mit Kurztext `s`; Freundschaften `.frgrid/.frt`;
  `glossSpec(sl)` mit Gruppe „🔒 Noch freizuschalten“, `.pcard.locked` grau, Wirkung über `data-spo`. Tests: neu `jsd79a.js`, angepasst `jsd77a` (aufklappen), `jsd93` (keine 3 Ziele), `quer.js` (keine Einführung).
  Auslegung: Belugas = „Einen Zoo auf Stufe 2 oder höher schaffen“ (Tabelle: Zielwert 3).
- **0.78a** ([Auftrag](docs/auftraege/0.78a-feedback-kasten.md)): Feedback-Kasten nach dem Lauf (Modul 09): `endRun` setzt `run.fbAsked` und `sum.fb`, wenn `fbAsk(run)`
  (nicht Tutorial, nicht `run.d4`, nicht `META.fbOff`); `summaryHtml` zeigt vorher `fbHtml()` (Sterne `screenArg.fbS`, Schwierigkeit `fbD`, Text `fbC`, Häkchen `fbInc`).
  `fbText()` wie im Auftrag, `fbSend()`: `navigator.share` → `Capacitor.Plugins.Share` → `copyTxt` + „Kopiert ✓“; Abbrechen lässt den Kasten offen. `fbSave()` → `META.fbHist` (5).
  „Nicht mehr fragen“ → `META.fbOff`, Schalter im Menü `data-fbm`. Show-Schilder `labs()` als `pctF` (×1,25/×1,5, auch 🙈 Partyzoo), `mini()` übernimmt jedes „×a,b“.
  Testlauf-Ziele `D4TF=0,6` über `d4TF()` in `seTarget`. Neuer Test `jsd78a.js`, `quer.js` prüft den Kasten.
- **0.77a** ([Auftrag](docs/auftraege/0.77a-zoobuch-testmodus-aufraeumen.md)): Zoo-Buch `buchHtml` (Modul 11, Bildschirm `buch`, Reiter `screenArg.tab`:
  `cards`/`friends`/`spec`/`progs`/`free`/`zl`; alte Bildschirme `gloss`/`lex`/`prog` leiten über `BUCHALT` um). Kartenzustand `buchInfo` (entdeckt = `sl.lex` oder
  `statOf(sl).built`), Sperrgrund `buchLock` (Signatur → Profil, Verstärker, Lebensraum Arktis/Gebirge, `fsLocked`, Bonus) unabhängig vom laufenden Lauf; Filter `screenArg.bs`.
  `lexHtml`/`glossHtml`/`glossCards` weg, `friendsHtml(sl)`, `progHtml(1)` ohne Kopf. Testlauf „4 Tage“: `META.d4` → `run.d4` (+`run.test`), `DAYS0`/`isD4`,
  `syncCtx` setzt `DAYS`, `shrinkMap` und `natNow` ×0,8; `fsCheck`, `tallyUnlock` (Zustand wird zurückgesetzt), `z2After`, Pokal überspringen Testläufe. Formen (`shapes92`,
  `shapesOf`, `SHAPEN`, Brett-Markierungen) gestrichen, Referenzfälle mit `aktualisiere` (50 von 51 geändert). Shop-Bereich `foerd` (prog + ad), Leiste mit 📣.
  Neuer Test `jsd77a.js`, `jsd93` (Formen-Prüfung ersetzt), `jsddaten` (Gesamtwertung des 0.73a-Spielstands weicht ohne Formen ab), `quer.js` prüft das Zoo-Buch.
  Nebenbei: 4 Freischalt-Ziele „Sehr selten · …“ → „Legendär · …“; Tutorial überall 🎓. Abweichung: 6. Reiter „📜 Regeln“ (Glossar-Regeln und Hinweise-Schalter).
- **0.76a** ([Auftrag](docs/auftraege/0.76a-schliff-stufen-faktoren.md)): Glanz-Takt 4 s / 2,7 s (`glanz1`/`glanz2`, `--glzA`); `deckRows(keys,btn,extra)`
  mit Futterplätzen in der Infospalte, `.dval` ohne Umbruch, Knopf 90 px; Glanz und „Selten“/„Legendär“ in `offerCard` und Lauf-Deck (`cardRow`, `.kcard`, `rgName`).
  Stufen: `stufen.json` mit `wirkungen`, `stAb`/`stW` nehmen die höchste erreichte Stufe, `stTF` multipliziert `ziel`; `natNow` (Schwerpunkt anteilig in `natQuota`),
  `PURN`/`CROWNF` als `let` aus `syncCtx`, `keine_krone`/`gold` in `initZl`, `keine_wuensche` in `wishOn` und `rollSpecs`; altes „kein Gratis-Neuziehen“ entfällt.
  Prozente → Faktoren: `pctF(x)` = ×(1+0,8x) auf 0,05, Abzüge bleiben; `pct`-Einträge `[Name,fa,fs,n]` nacheinander, je Stück hoch n (`n` in `naturbund`,
  `bauleiterin`, Aquarium, Gold-Ausgabe); Show/Jagdrevier/Partyzoo als `pctF(Gesamtzuschlag)`; Plus-Programme liefern `{fa,fs}`. Texte überall „×1,2 B“.
  Referenzfälle mit `referenz.js aktualisiere` (gleiche 51 Aufstellungen, nur „erwartet“ neu). Prägung Gold `aus:1` (`praegLos`). Besucherliebling `chance(.25)`.
  Tests: `jsd64a/71a/72a/jsddaten` an neue Regeln angepasst (nichts gelöscht), neuer Test `jsd76a.js`.
- **0.75a** ([Auftrag](docs/auftraege/0.75a-glanz-einblendungen.md)): Seltenheits-Ecke `.rarc`/`shpWide` entfernt; Glanz-Schicht `<span class="glz">` (erstes Kind,
  `z-index:-1` in eigener Ebene `isolation:isolate`) für Handkarten (`rgOf(c.rar)`: `rg1` selten, `rg2` sehr selten) und Spezialisten (`rgSpec`: Stufe 2 `rg1`,
  Stufe 3 ohne Regelbrecher `rg2`; `.tm` und `.pcard`, alter `t3sh`-Glanz weg); gemeinsame Uhr `glzD`/`holoD` (negative Verzögerung), `no-repeat` auch im Holo.
  „sehr selten“ → „Legendär“ nur in Spielertexten (`rarLabel`, Futterplätze, Good Luck, Futtermeister, `FOODRN`), intern bleibt `rar:'sehr selten'`.
  Einblendungen `bigPop(id,inner,ok)` (Stil `.wishpop`): Auflage beim Zoo-Start (`state.ruleIntro`, vor dem Wunsch, nicht im Tutorial), Überraschungsfutter
  (`state.surprise`, Karte per `offerCard`). Tutorial-Häppchen `{t,karte,leuchten}` → große Karte `#tutCard` (`tutCardRender`, `TUTLEUCHT`). Tribüne `sehr selten`.
  Neuer Test `jsd75a.js`; `quer.js` tippt auch `.bigpop` weg.
- **0.74a:** Godot-Vorbereitung 2a–2c: alle Inhalte in `daten/*.json` (Karten, Merkmale, Spezialisten, Futter, Winter, Gelände, Stufen, Profile,
  Texte `texte_de.json`, Tutorial, Förderprogramme, Werbung, Ereignisse, Prägungen, Herausforderungen), Code-Wirkungen über Kennungen
  (`KARTEN_WIRKUNG`, `SPEZ_WIRKUNG`, `FUTTER_WIRKUNG`, `WINTER_WIRKUNG`, `PROG_/WERBUNG_/EREIGNIS_WIRKUNG`, `CHAL_WIRKUNG`, `TUT_WIRKUNG`, Stufen `stAb`/`stW`);
  Verhalten und alle angezeigten Texte unverändert (Referenzfälle, `textvergleich.sh`, Spielstand 0.73a lädt). Querformat-Fehler (bestand seit 0.73a):
  `railRender` kopierte die Zoo-Übersicht samt `#mClose`/`#zlBack` in die Seitenleiste → doppelte ids, „Los geht's“ und „▶ Weiterspielen“ ohne Wirkung;
  jetzt ohne Knöpfe in der Leiste. Tipp-Kasten `#hintBox` wartet bei offenem Fenster (`hintCheck`: nur `winter` zeigt sich, dann oben, Klasse `inmod`);
  letzte Knopfzeile (`.tnav`/`.shopbar`/`.btn` als letztes Kind von `.modal`) klebt unten. Neue Tests `quer.js` (Playwright), `jsddaten.js`, Textvergleich.
- **0.73a:** Totes Holz entfernt: alte Tutorial-Kapitel (`zls/zlssh/zlh/zlhsh/zlw`, `TUTCH_ALT`), `startTut`, `GUIDE` (→ `guideHint=()=>null`),
  Fenster `tutsolo`, `deckReady`, `fdMax`, doppeltes `PURN` (jetzt `const PURN=4`), Zoo-Profile `ZPROF` mit Profilwahl, `zlPick`, `profHints`,
  `PROFHAB`, `DECKPROF`, Profil-Umbau `zfix` und alle Profil-Abfragen in Wertung/Kosten/Taler (`state.zl.prof` bleibt als `'keins'` im Spielstand).
  Alte Modi: Freies Spiel (`enterSlot`, Gelände-Wahl `openMaps`/`mapsHtml`/`chooseMap`, „Neue Karte freischalten“, Spielende) und Zoolatro 1/Kampagne
  als Spieler-Modus; `loadMeta` behält nur Zoolatro-2.0-Läufe. **Der Zoolatro-1-Rechenweg (`enterCamp(…,true)`) bleibt**, das Tutorial läuft darüber.
  Tests aufgeräumt (`jsd64a/67a/68a/93/94/96` an heutige Regeln angepasst, `jsd94` Gebirge-Rand zufallsfest): alle Einzeltests ohne FAIL.
  Übrig (bewusst gelassen): Bildschirme `summary`/`perk`/`scores` (von Zoolatro mitbenutzt), `tmult`, `exitTut`-Zweige.
- **0.72a:** Schimmernd und Goldfelder/×4-Felder multiplizieren nacheinander (`evalB`, `mul`): Schimmernd + Gold = ×4, 2 Goldfelder = ×4;
  Hilfetext `HABRULE` (ganze Gruppe ×0,5, einzelnes Wasser-Gehege ×1); Showtier-Text (Trubel/Tribüne doppelt, höchstens +120 %);
  neuer Test `jsd72a.js`. Bekannt: `jsd94` „Gebirge: Rand ×1,5“ schlägt zufällig fehl, wenn das Randfeld auch an einen Felsen grenzt.
- **0.71a:** „Weiter ▸“ immer rechts (`tutNav`); `tutCheck` schaltet mehrere erledigte Schritte auf einmal (Tag-2-Hand);
  Profilwahl mit 8 Stufen-Knöpfen (`.stgrid`, gesperrt `data-stlock` + Hinweis); ◂ Zurück nach der Stufenwahl (`ZSTART`, `zlBackOk`, `zlBack`,
  in der Zoo-Übersicht bzw. Zoo-Profilwahl); Naturfelder fest (`NATN=18`, `NATFOCUS`, `natQuota`, `natPlace` in `genMap`, Flusstal-Strang 8);
  Seltenheits-Ecke auf Handkarten (`.rarc.r1/.r2`, Kostenpunkte nach links, `shpWide`), Stufe-3-Spezialisten glänzen (`.tm.t3`, `.pcard.t3`);
  Futterplätze nach Seltenheit (`fdMaxK`, `fdSlotsHtml`); neuer Test `jsd71a.js`.
- **0.70a:** Tutorial-Pause in der Vorschau (Schritt-Feld `pv` an Zebras/Bratwurst/Giraffe, Hammer gesperrt bis zum letzten Häppchen,
  alte Weiter-Schritte danach entfernt); ◂ Zurück in Häppchen; kein Willkommen-Feld im Tutorial; Früh-geschafft-Kasten (`earlyBoxHtml`,
  `state.earlyR`) mit 🎁-Abzeichen am Shop-Reiter und leuchtendem Geschenk; Zoolatro-Ziele Sommer/Herbst/Winter +20 % (`ZLUP`);
  `HFOODW` 11 → 4 (Lebensraum-Futter etwa halb so oft); `tutcal5.js` Fehler am Ende behoben; neuer Test `jsd70a.js`.
- **0.69a:** Frühlings-Shop-Reiter ganz gesperrt; im Tutorial keine Stress-Felder, keine Rote Liste, keine Zucht;
  Leuchten verschiebt Kostenpunkte/Symbole nicht mehr; Delfinshow-Text.
- **0.68a:** Tutorial-Gelände nicht gedreht, Felsen-Markierung, Platzhalter auf der Hand, „Sehen Sie“ nach dem Bauen, Merkmal-Texte aus,
  Fluss-Warnung aus, Sommer-Shop mit Futtersack (Steppenheu), Wasserfall 2,-1 / Bienen 2,-2, Kartenwahl nur Wasser/Savanne/Wüste.
- **0.67a:** neues Jasper-Tutorial Zoo 1 mit Häppchen-Texten.
