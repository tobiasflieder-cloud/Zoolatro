# Punkte für die Liste nach 0.94a

Während 0.94a gebaut wird, hier gesammelt; nach dem Bauen in `CLAUDE.md` Abschnitt 6 übernehmen.

1. **Umbau „Mehr Natur“ zum Auswählen, „Naturfläche ändern“ nur für bestehende Natur** (Chat 23.11., Tobi: Variante 1):
   - 🌱 Mehr Natur (`UMB.natur3`, Modul 08 ~Z. 61, Wirkung ~Z. 96, `natur3Cells` ~Z. 85): heute 3 zufällige Felder neben bestehender Natur. Neu: wie heute `natur` (`t:'free'`, `n:3`, `pick:'hab'`): bis zu 3 **freie** Felder antippen, „Fertig“ (`data-umbfin`), dann Lebensraum des Laufs wählen. Keine Pflicht, an bestehende Natur anzugrenzen.
     Text: „Bis zu 3 freie Felder werden Naturflächen eines deiner Lebensräume.“ Option „Naturfläche entfernen“ hier **nicht** anbieten.
   - 🌿 Naturfläche ändern (`UMB.natur`): nur noch **bestehende** Naturflächen (bis zu 3, auch bebaute? → nur unbebaute, damit kein Gehege auf falschem Lebensraum steht) wählen, dann anderen Lebensraum oder „entfernen“. Text: „Bis zu 3 Naturflächen bekommen einen anderen Lebensraum deines Laufs oder verschwinden.“
   - Verfügbarkeit (`umbOk` ~Z. 79): Mehr Natur nur, wenn es freie Felder gibt; Naturfläche ändern nur, wenn es unbebaute Naturflächen gibt.
   - Gewicht/Preis beider Umbauten unverändert. Test: Mehr Natur auf Feld ohne Natur-Nachbarn möglich, Lebensraum frei wählbar; Naturfläche ändern lehnt freies Feld ohne Natur ab.
