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
| `daten/` | **Inhalte als Daten** (Godot-Vorbereitung 2a–2c): `karten.json`, `merkmale.json`, `spezialisten.json`, `futter.json`, `winter.json`, `gelaende.json`, `stufen.json`, `profile.json`, `texte_de.json` (alle Namen/Texte aus `TXT`), `tutorial.json`, `foerderprogramme.json`, `werbung.json`, `ereignisse.json`, `praegungen.json`, `herausforderungen.json`. Werden von `mache.py` ins Spiel eingebaut |
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

## 6. Liste fürs nächste Bauen (wird 0.79a) – erst bauen, wenn Tobi „bauen“ sagt

(leer)

**Offen / zur Entscheidung:**
- Dingo hat im Tutorial keinen Wirkungstext (Bonus hing an Beutetieren) – prüfen, ob eine andere Karte besser passt.
- Waldfelder auf dem Tutorial-Gelände bleiben, obwohl keine Dschungel-Karten kommen – Tobi fragen, falls es stört.

**Godot-Vorbereitung (Stand):** 2a–2c fertig und mit 0.74a in main. Nächster Schritt laut `docs/godot-plan.md`: Wertung in Godot gegen die Referenzfälle.
  Werkzeuge: Textvergleich alt/neu `bash tests/textvergleich.sh`, Querformat-Test `node tests/quer.js` (auch in `pruefen.sh`).

**Für später:** Tutorial Zoo 2 (Merkmale, Regeln, Winter-Bedingung) · Grafikstil · Futter-Balance · neue Meilensteine
(Freundschaften, Ausbaustufen) · Verschmelzen · „Alles zurücksetzen“ · Weiterspielen nach dem Ziel beobachten.
· **Stufen:** schwere Winter-Bedingung ab Stufe 5 (Rest, nicht in 0.76a) · **Winter-Bedingungen** in leicht und schwer teilen · neue Winter-Ideen:
am 1. Wintertag werden 2 zufällige Tiere ausgewildert (Gehege und Karte weg); Bauverbot für Gastro, Attraktionen oder Naturschutz.

## 7. Erledigt (zuletzt)

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
