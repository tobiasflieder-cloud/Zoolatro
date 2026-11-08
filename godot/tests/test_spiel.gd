extends SceneTree
## Spielt die Spielwiese einmal automatisch durch (ohne Bildschirm) und prüft, dass nichts abstürzt:
## Karten wählen, drehen, bauen, rückgängig, 5 Tage werten (mit allen Effekten), Einstellungen öffnen, Neustart.
## Aufruf (im Ordner godot/):  godot --headless --script res://tests/test_spiel.gd

var h
var fehler := 0
var E: Node

func _initialize() -> void:
	E = root.get_node_or_null("Einstellungen")
	if E == null:
		print("FAIL Autoload Einstellungen fehlt")
		quit(1)
		return
	E.werte["tempo"] = 3.0
	h = load("res://szenen/haupt.tscn").instantiate()
	root.add_child(h)
	_lauf.call_deferred()

func pruefe(ok: bool, text: String) -> void:
	print(("ok   " if ok else "FAIL ") + text)
	if not ok:
		fehler += 1

func _baue_irgendwas() -> bool:
	for k in h.hand.duplicate():
		if Regeln.kosten(k.key) > h.bp:
			continue
		for c in h.gel["felder"]:
			for rot in 6:
				var fe := Regeln.felder_fuer(k.key, rot, c)
				if Regeln.passt(h.gel, h.gebaeude, fe, k.key):
					h._karte_angetippt(k)
					h._feld_gewaehlt(c)
					for i in rot:
						h._drehen()
					var n: int = h.gebaeude.size()
					h._bauen()
					return h.gebaeude.size() == n + 1
	return false

func _lauf() -> void:
	await process_frame
	pruefe(h.hand.size() == 5, "Hand mit 5 Karten")
	pruefe(h.gel["gold"].size() == 3 and h.gel["krone"] != null, "Gelände mit 3 Goldfeldern und Krone")
	var bloecke := 0
	for k in h.gel["gelaende"]:
		if h.gel["gelaende"][k] == "block":
			bloecke += 1
	pruefe(bloecke == 2, "2 Felsen")
	# Bauen und Rückgängig
	var bp0: int = h.bp
	pruefe(_baue_irgendwas(), "Bauen klappt")
	await create_timer(0.4).timeout
	h._rueckgaengig()
	pruefe(h.gebaeude.is_empty() and h.bp == bp0 and h.hand.size() == 5, "Rückgängig gibt Karte und Baupunkte zurück")
	# Einstellungen
	h._zeige_einstellungen()
	await process_frame
	pruefe(h.panel_einst != null, "Einstellungs-Fenster öffnet")
	h.panel_einst.zu.emit()
	await process_frame
	# 5 Tage spielen
	var summe := 0
	for t in 5:
		while h.bp > 0 and _baue_irgendwas():
			await create_timer(0.05).timeout
		var erwartet: int = Regeln.werte_zoo(h.gel, h.gebaeude)["total"]
		summe += erwartet
		await h._tag_beenden()
		print("     Tag %d: %d Gebäude, %d Punkte, zusammen %d" % [t + 1, h.gebaeude.size(), erwartet, h.punkte])
		if h.spiel_aus:
			break
	pruefe(h.punkte == summe, "Punkte = Summe der Tageswertungen (%d)" % summe)
	pruefe(h.spiel_aus and h.panel_ende != null, "Ende-Fenster („%s“)" % ("Geschafft" if h.punkte >= h.ZIEL else "Leider nicht"))
	h.neues_spiel()
	await process_frame
	pruefe(h.tag == 1 and h.punkte == 0 and h.gebaeude.is_empty() and not h.spiel_aus, "Neues Spiel")
	# Effekte aus: Wertung läuft trotzdem
	E.effekte = false
	_baue_irgendwas()
	await h._tag_beenden()
	pruefe(h.tag == 2, "Wertung mit Effekten aus")
	E.effekte = true
	print("%s: %d Fehler" % ["FERTIG" if fehler == 0 else "FEHLER", fehler])
	quit(1 if fehler else 0)
