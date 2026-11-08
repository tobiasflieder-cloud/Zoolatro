extends SceneTree
## Rechnet Referenzfälle des HTML-Spiels mit regeln.gd nach und vergleicht Punkte je Gebäude, Rechenschritte und Gesamtwertung.
## Aufruf (im Ordner godot/):  godot --headless --script res://tests/test_referenz.gd
## Liest tests/referenz/spielwiese/*.json aus dem Repo (erzeugt mit node tests/referenz/spielwiese.js erzeuge),
## sonst die Kopie in godot/tests/faelle/. Standard: die 5 „rein-*“-Fälle; mit -- alle auch die „voll-*“-Fälle.

func _init() -> void:
	Regeln.lade()
	var alle := OS.get_cmdline_user_args().has("alle")
	var ordner := ProjectSettings.globalize_path("res://").path_join("../tests/referenz/spielwiese")
	if not DirAccess.dir_exists_absolute(ordner):
		ordner = ProjectSettings.globalize_path("res://tests/faelle")
	var dateien := Array(DirAccess.get_files_at(ordner)).filter(func(f): return f.ends_with(".json") and (alle or f.begins_with("rein-")))
	dateien.sort()
	var fehler := 0
	for f in dateien:
		var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(ordner.path_join(f)))
		var meldungen := pruefe(d)
		if meldungen.is_empty():
			print("ok   ", f, "  Punkte ", d["erwartet"]["total"])
		else:
			fehler += 1
			print("FAIL ", f, ": ", " | ".join(meldungen.slice(0, 4)))
	print("%d/%d Referenzfälle gleich (Ordner %s)" % [dateien.size() - fehler, dateien.size(), ordner])
	quit(1 if fehler > 0 or dateien.is_empty() else 0)

static func gelaende_aus(d: Dictionary) -> Dictionary:
	var felder: Array[Vector2i] = []
	for p in d["board"]:
		felder.append(Vector2i(int(p[0]), int(p[1])))
	var gel := {}
	for e in d["terrain"]:
		gel[e[0]] = e[1]
	return {"felder": felder, "gelaende": gel, "gold": d["gold"], "krone": d["crown"]}

func pruefe(d: Dictionary) -> Array:
	var gel := gelaende_aus(d)
	var gebaeude := []
	for b in d["buildings"]:
		var fe: Array[Vector2i] = []
		for p in b["cells"]:
			fe.append(Vector2i(int(p[0]), int(p[1])))
		# Felder auch aus Drehung und Anker nachrechnen (prüft die Drehung)
		var aus_rot := Regeln.felder_fuer(b["key"], int(b["rot"]), Vector2i(int(b["anchor"][0]), int(b["anchor"][1])))
		if aus_rot != fe:
			return ["Drehung passt nicht bei Gebäude %d" % b["id"]]
		gebaeude.append({"id": int(b["id"]), "key": b["key"], "felder": fe})
	var r := Regeln.werte_zoo(gel, gebaeude)
	var e: Dictionary = d["erwartet"]
	var m := []
	for k in ["A", "S", "total"]:
		if int(r[k]) != int(e[k]):
			m.append("%s erwartet %d, Godot %d" % [k, int(e[k]), int(r[k])])
	for i in e["buildings"].size():
		var eb: Dictionary = e["buildings"][i]
		var gb: Dictionary = r["schritte"][i]
		if int(eb["a"]) != gb["a"] or int(eb["s"]) != gb["s"]:
			m.append("Gebäude %d (%s): erwartet %d B / %d N, Godot %d B / %d N" % [eb["id"], d["buildings"][i]["key"], int(eb["a"]), int(eb["s"]), gb["a"], gb["s"]])
		var et := []
		for p in eb["parts"]:
			et.append([int(p[1]), int(p[2])])
		var gt := []
		for p in gb["teile"]:
			gt.append([p[1], p[2]])
		if et != gt:
			m.append("Gebäude %d Schritte: erwartet %s, Godot %s" % [eb["id"], str(et), str(gt)])
	var em := []
	for x in e["mults"]:
		em.append(x["label"])
	var gm := []
	for x in r["mults"]:
		gm.append(x["label"])
	if em != gm:
		m.append("Multiplikatoren: erwartet %s, Godot %s" % [str(em), str(gm)])
	return m
