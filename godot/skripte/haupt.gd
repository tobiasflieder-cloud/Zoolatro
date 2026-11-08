extends Control
## Hauptbildschirm der Spielwiese: Ablauf (5 Tage, Ziel 6.000), Hand, Bauen, Rückgängig, Wertung mit Effekten.

const TAGE := 5
const ZIEL := 6000
const BP_TAG := 4
const HAND := 5
const DECK := ["zebras", "giraffen", "elefanten", "flamingos", "otter", "nilpferde", "fennek", "bratwurst", "popcorn", "gruen", "delfinshow", "streichelzoo"]

var rng := RandomNumberGenerator.new()
var gel := {}
var gebaeude := []
var stapel := []
var ablage := []
var hand := []            # Karten-Knoten (karte_ui.gd)
var gewaehlt = null       # gewählte Karte
var rot := 0
var anker = null          # Vector2i oder null
var bp := BP_TAG
var tag := 1
var punkte := 0
var _punkte_anzeige := 0.0
var rueck := []           # [{id,key,platz,kosten}]
var naechste_id := 1
var wertung_laeuft := false
var spiel_aus := false

var welt: Control
var brett: Control
var effekte: Control
var handbox: Control
var oben: Control
var l_tag: Label
var l_bp: Label
var l_punkte: Label
var balken: ProgressBar
var l_info: Label
var l_wertung: Label
var k_drehen: Button
var k_rueck: Button
var k_bauen: Button
var k_tag: Button
var k_einst: Button
var dunkel: ColorRect
var panel_einst: PanelContainer
var panel_ende: PanelContainer

func _ready() -> void:
	Regeln.lade()
	theme = Aussehen.thema()
	set_anchors_preset(Control.PRESET_FULL_RECT)
	_baue_oberflaeche()
	resized.connect(_ordne)
	neues_spiel()

# ---------------- Oberfläche ----------------
func _baue_oberflaeche() -> void:
	var hg := ColorRect.new()
	hg.color = Color(0.99, 0.91, 0.72)
	hg.set_anchors_preset(Control.PRESET_FULL_RECT)
	hg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(hg)
	welt = Control.new()
	welt.mouse_filter = Control.MOUSE_FILTER_PASS
	add_child(welt)
	oben = Control.new()
	welt.add_child(oben)
	l_tag = _label(oben, 54, true)
	l_bp = _label(oben, 48, true)
	l_punkte = _label(oben, 46, false)
	balken = ProgressBar.new()
	balken.show_percentage = false
	balken.max_value = ZIEL
	var bg := StyleBoxFlat.new()
	bg.bg_color = Color(1, 1, 1, 0.8)
	bg.set_border_width_all(6)
	bg.border_color = Aussehen.UMRISS
	bg.set_corner_radius_all(20)
	var fg := StyleBoxFlat.new()
	fg.bg_color = Color(0.35, 0.8, 0.3)
	fg.set_corner_radius_all(16)
	balken.add_theme_stylebox_override("background", bg)
	balken.add_theme_stylebox_override("fill", fg)
	oben.add_child(balken)
	k_einst = Button.new()
	k_einst.text = "⚙"
	k_einst.add_theme_font_size_override("font_size", 60)
	k_einst.pressed.connect(_zeige_einstellungen)
	oben.add_child(k_einst)
	l_info = _label(welt, 34, false)
	l_info.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l_info.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	brett = preload("res://skripte/brett.gd").new()
	welt.add_child(brett)
	brett.feld_gewaehlt.connect(_feld_gewaehlt)
	l_wertung = _label(welt, 72, true)
	l_wertung.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l_wertung.visible = false
	k_drehen = _knopf("↻ Drehen", _drehen)
	k_rueck = _knopf("↶", _rueckgaengig)
	k_bauen = _knopf("🔨 Bauen", _bauen)
	k_tag = _knopf("💤 Tag beenden", _tag_beenden)
	handbox = Control.new()
	handbox.mouse_filter = Control.MOUSE_FILTER_PASS
	welt.add_child(handbox)
	effekte = preload("res://skripte/effekte.gd").new()
	effekte.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(effekte)
	dunkel = ColorRect.new()
	dunkel.color = Color(0, 0, 0, 0.45)
	dunkel.set_anchors_preset(Control.PRESET_FULL_RECT)
	dunkel.visible = false
	add_child(dunkel)
	_ordne()
	effekte.setze_wackel_ziel(welt)

func _label(eltern: Control, groesse: int, umriss: bool) -> Label:
	var l := Label.new()
	l.add_theme_font_override("font", Aussehen.titel() if umriss else Aussehen.schrift())
	l.add_theme_font_size_override("font_size", groesse)
	if umriss:
		l.add_theme_color_override("font_color", Color.WHITE)
		l.add_theme_color_override("font_outline_color", Aussehen.UMRISS)
		l.add_theme_constant_override("outline_size", 14)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	eltern.add_child(l)
	return l

func _knopf(text: String, f: Callable) -> Button:
	var b := Button.new()
	b.text = text
	b.add_theme_font_size_override("font_size", 40)
	b.clip_text = true
	b.pressed.connect(func():
		Klang.spiele("tick", 0.8, 0.6)
		f.call())
	welt.add_child(b)
	return b

func _ordne() -> void:
	if welt == null:
		return
	var w := size.x
	var h := size.y
	welt.size = size
	oben.position = Vector2.ZERO
	oben.size = Vector2(w, 220)
	l_tag.position = Vector2(36, 26)
	l_bp.position = Vector2(36, 104)
	balken.position = Vector2(330, 40)
	balken.size = Vector2(w - 330 - 170, 56)
	l_punkte.position = Vector2(340, 104)
	k_einst.position = Vector2(w - 140, 26)
	k_einst.size = Vector2(110, 110)
	l_info.position = Vector2(30, 178)
	l_info.size = Vector2(w - 60, 100)
	var unten_h := 300 + 150 + 60
	var brett_h := h - 290 - unten_h
	brett.position = Vector2(0, 280)
	brett.size = Vector2(w, brett_h)
	brett.passe_groesse()
	l_wertung.position = Vector2(0, 290)
	l_wertung.size = Vector2(w, 100)
	var ky := h - unten_h + 10
	var bw := (w - 5 * 24) / 3.95
	var x := 24.0
	for b in [k_drehen, k_rueck, k_bauen, k_tag]:
		var breite := bw * (0.6 if b == k_rueck else (1.35 if b == k_tag else 1.0))
		b.position = Vector2(x, ky)
		b.size = Vector2(breite, 120)
		x += breite + 24
	handbox.position = Vector2(0, h - 330)
	handbox.size = Vector2(w, 330)
	_lege_hand(true)
	effekte.setze_wackel_ziel(welt)

# ---------------- Spielablauf ----------------
func neues_spiel() -> void:
	rng.randomize()
	gel = Gelaende.erzeuge(rng)
	gebaeude = []
	naechste_id = 1
	stapel = DECK.duplicate()
	_mische(stapel)
	ablage = []
	for k in hand:
		k.queue_free()
	hand = []
	tag = 1
	punkte = 0
	_punkte_anzeige = 0
	spiel_aus = false
	if panel_ende:
		panel_ende.queue_free()
		panel_ende = null
	dunkel.visible = false
	brett.gel = gel
	brett.gebaeude = gebaeude
	_neuer_tag()
	l_info.text = "Karte antippen, dann aufs Feld tippen. ↻ dreht, 🔨 baut. Ziel: %s Punkte in %d Tagen." % [_fmt(ZIEL), TAGE]

func _mische(a: Array) -> void:
	for i in range(a.size() - 1, 0, -1):
		var j := rng.randi_range(0, i)
		var t = a[i]
		a[i] = a[j]
		a[j] = t

func _neuer_tag() -> void:
	bp = BP_TAG
	rueck = []
	_waehle(null)
	var neu := 0
	while hand.size() < HAND:
		if stapel.is_empty():
			if ablage.is_empty():
				break
			stapel = ablage
			ablage = []
			_mische(stapel)
		var key: String = stapel.pop_back()
		var k := _neue_karte(key)
		k.position = Vector2(size.x + 100, 40)  # kommt von rechts herein
		hand.append(k)
		neu += 1
	_lege_hand(false)
	for i in neu:
		get_tree().create_timer(0.08 * i).timeout.connect(func(): Klang.spiele("karte", 1.0 + 0.08 * i, 0.8))
	_aktualisiere()

func _neue_karte(key: String) -> Control:
	var k: Control = preload("res://skripte/karte_ui.gd").new()
	k.richte_ein(key)
	k.angetippt.connect(_karte_angetippt)
	handbox.add_child(k)
	return k

func _lege_hand(sofort: bool) -> void:
	if handbox == null:
		return
	var n := hand.size()
	var bw := 196.0
	var abstand := minf(16.0, (handbox.size.x - n * bw) / maxf(1, n + 1))
	var gesamt := n * bw + (n - 1) * abstand
	var x0 := (handbox.size.x - gesamt) / 2.0
	for i in n:
		var k = hand[i]
		k.zu_teuer = Regeln.kosten(k.key) > bp
		k.queue_redraw()
		k.gehe_zu(Vector2(x0 + i * (bw + abstand), 14), sofort)

func _karte_angetippt(k) -> void:
	if wertung_laeuft or spiel_aus:
		return
	_waehle(null if gewaehlt == k else k)
	Klang.spiele("karte", 1.25)

func _waehle(k) -> void:
	if gewaehlt and is_instance_valid(gewaehlt):
		gewaehlt.waehle(false)
	gewaehlt = k
	if k:
		k.waehle(true)
		rot = 0
	_aktualisiere_vorschau()

func _feld_gewaehlt(c: Vector2i) -> void:
	if wertung_laeuft or spiel_aus or gewaehlt == null:
		return
	if anker != c:
		anker = c
		_aktualisiere_vorschau()

func _drehen() -> void:
	if gewaehlt == null:
		return
	rot = (rot + 1) % 6
	gewaehlt.huepfe(0.6)
	Klang.spiele("wusch", 1.2, 0.7)
	_aktualisiere_vorschau()

func _vorschau_felder() -> Array:
	if gewaehlt == null or anker == null:
		return []
	return Regeln.felder_fuer(gewaehlt.key, rot, anker)

func _aktualisiere_vorschau() -> void:
	var fe := _vorschau_felder()
	if fe.is_empty():
		brett.vorschau = {}
		if gewaehlt:
			var c := Regeln.karte(gewaehlt.key)
			l_info.text = "%s %s · %d B · %d N · %d BP%s" % [c["icon"], c["name"], c["B"], c["N"], Regeln.kosten(gewaehlt.key), ("\n" + c["text"]) if c["text"] != "" else ""]
	else:
		var ok := Regeln.passt(gel, gebaeude, fe, gewaehlt.key) and Regeln.kosten(gewaehlt.key) <= bp
		brett.vorschau = {"felder": fe, "key": gewaehlt.key, "ok": ok}
		var c := Regeln.karte(gewaehlt.key)
		if not Regeln.passt(gel, gebaeude, fe, gewaehlt.key):
			l_info.text = "%s %s passt hier nicht (frei, kein Felsen, Naturfläche nur für Gehege des gleichen Lebensraums)." % [c["icon"], c["name"]]
		elif Regeln.kosten(gewaehlt.key) > bp:
			l_info.text = "Zu teuer: %d BP, heute noch %d BP." % [Regeln.kosten(gewaehlt.key), bp]
		else:
			var jetzt := Regeln.werte_zoo(gel, gebaeude)
			var probe := gebaeude.duplicate()
			var b := {"id": 999, "key": gewaehlt.key, "felder": fe}
			probe.append(b)
			var dann := Regeln.werte_zoo(gel, probe)
			var eigen: Dictionary = dann["schritte"][-1]
			l_info.text = "%s %s: %d B · %d N   ·   Tagesertrag %s → %s" % [c["icon"], c["name"], eigen["a"], eigen["s"], _fmt(jetzt["total"]), _fmt(dann["total"])]
	brett.queue_redraw()
	_aktualisiere()

func _bauen() -> void:
	if wertung_laeuft or spiel_aus or gewaehlt == null:
		return
	var fe := _vorschau_felder()
	if fe.is_empty() or not Regeln.passt(gel, gebaeude, fe, gewaehlt.key) or Regeln.kosten(gewaehlt.key) > bp:
		Klang.spiele("nein")
		if gewaehlt:
			gewaehlt.huepfe(1.0)
		effekte.wackeln(6.0)
		return
	var k = gewaehlt
	var kosten := Regeln.kosten(k.key)
	var b := {"id": naechste_id, "key": k.key, "felder": fe}
	naechste_id += 1
	gebaeude.append(b)
	bp -= kosten
	var platz := hand.find(k)
	rueck.append({"id": b["id"], "key": k.key, "platz": platz, "kosten": kosten})
	hand.erase(k)
	ablage.append(k.key)
	# Karte fliegt aufs Feld und verschwindet
	var ziel: Vector2 = brett.global_position + brett.mitte_von(fe) - k.size / 2.0 - handbox.global_position
	var t := create_tween().set_parallel(true)
	t.tween_property(k, "position", ziel, 0.22).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	t.tween_property(k, "scale", Vector2(0.3, 0.3), 0.22)
	t.chain().tween_callback(k.queue_free)
	gewaehlt = null
	anker = null
	brett.vorschau = {}
	get_tree().create_timer(0.2).timeout.connect(func():
		Klang.spiele("setzen")
		effekte.wackeln(5.0)
		effekte.zahl(brett.global_position + brett.mitte_von(fe), "-%d BP" % kosten, Color(0.3, 0.6, 1.0), 40, 0.6)
		brett.queue_redraw())
	_lege_hand(false)
	l_info.text = "Gebaut. Noch %d BP heute." % bp
	_aktualisiere()

func _rueckgaengig() -> void:
	if wertung_laeuft or spiel_aus or rueck.is_empty():
		Klang.spiele("nein", 1.0, 0.6)
		return
	var r: Dictionary = rueck.pop_back()
	for b in gebaeude:
		if b["id"] == r["id"]:
			gebaeude.erase(b)
			break
	bp += r["kosten"]
	ablage.erase(r["key"])
	var k := _neue_karte(r["key"])
	k.position = Vector2(handbox.size.x / 2.0, -300)
	hand.insert(clampi(r["platz"], 0, hand.size()), k)
	_waehle(null)
	_lege_hand(false)
	Klang.spiele("wusch", 0.8)
	l_info.text = "Rückgängig gemacht."
	brett.queue_redraw()
	_aktualisiere()

func _tag_beenden() -> void:
	if wertung_laeuft or spiel_aus:
		return
	_waehle(null)
	anker = null
	await werte_tag()

func _aktualisiere() -> void:
	l_tag.text = "Tag %d/%d" % [mini(tag, TAGE), TAGE]
	l_bp.text = "⚡ %d BP" % bp
	l_punkte.text = "%s / %s Punkte" % [_fmt(roundi(_punkte_anzeige)), _fmt(ZIEL)]
	balken.value = _punkte_anzeige
	var aus := wertung_laeuft or spiel_aus
	k_drehen.disabled = aus or gewaehlt == null
	k_rueck.disabled = aus or rueck.is_empty()
	k_bauen.disabled = aus or gewaehlt == null or brett.vorschau.is_empty() or not brett.vorschau.get("ok", false)
	k_tag.disabled = aus
	for k in hand:
		var t: bool = Regeln.kosten(k.key) > bp
		if k.zu_teuer != t:
			k.zu_teuer = t
			k.queue_redraw()

# ---------------- Wertung mit Effekten ----------------
func werte_tag() -> void:
	wertung_laeuft = true
	_aktualisiere()
	var r := Regeln.werte_zoo(gel, gebaeude)
	var tempo: float = Einstellungen.werte.get("tempo", 1.0)
	var schritt := 0.42 / tempo
	var zb := 0.0
	var zn := 0.0
	l_wertung.visible = true
	_zeige_wertung(0, 0)
	var nach_id := {}
	for b in gebaeude:
		nach_id[b["id"]] = b
	for i in r["schritte"].size():
		var s: Dictionary = r["schritte"][i]
		var b: Dictionary = nach_id[s["id"]]
		var c := Regeln.karte(b["key"])
		var pos: Vector2 = brett.global_position + brett.mitte_von(b["felder"])
		brett.leuchten[b["id"]] = 1.0
		brett.queue_redraw()
		Klang.spiele("tick", 1.0 + 0.07 * i)   # im Takt, jedes Gebäude einen Ton höher
		if s["a"] != 0:
			effekte.zahl(pos + Vector2(-50, -10), "%+d B" % s["a"], Aussehen.BESUCHER, 54)
		if s["s"] != 0:
			effekte.zahl(pos + Vector2(50, 30), "%+d N" % s["s"], Aussehen.NATUR, 54)
		# große Boni: Kombo-Explosion
		var extra := 0
		var namen := []
		for t in s["teile"]:
			if t[3] in ["gold", "kombo", "herde", "freund", "form"] and (t[1] + t[2]) > 0:
				extra += t[1] + t[2]
				namen.append(t[0])
		if extra >= 4:
			var st := clampf(extra / 10.0, 0.6, 2.2)
			get_tree().create_timer(schritt * 0.3).timeout.connect(func():
				effekte.explosion(pos, st)
				effekte.zahl(pos + Vector2(0, -90), namen[0].split(":")[0], Color(1, 0.95, 0.4), 40, 1.1))
		if c["cat"] == "essen":
			effekte.muenzen(pos, 10)
		var t2 := create_tween().set_parallel(true)
		var b0 := zb
		var n0 := zn
		t2.tween_method(func(x): _zeige_wertung(roundi(lerpf(b0, b0 + s["a"], x)), roundi(lerpf(n0, n0 + s["s"], x))), 0.0, 1.0, schritt * 0.8)
		zb += s["a"]
		zn += s["s"]
		await get_tree().create_timer(schritt).timeout
		var bid = b["id"]
		var tl := create_tween()
		tl.tween_method(func(x):
			brett.leuchten[bid] = x
			if x <= 0.01:
				brett.leuchten.erase(bid)
			brett.queue_redraw(), 1.0, 0.0, 0.3)
	# Zoo-Multiplikatoren (Kronenfeld)
	for m in r["mults"]:
		var kb = null
		for b in gebaeude:
			if b["id"] == m["id"]:
				kb = b
		var pos: Vector2 = brett.global_position + (brett.mitte_von(kb["felder"]) if kb else brett.size / 2.0)
		effekte.zahl(pos + Vector2(0, -60), "👑 ×1,3 B", Aussehen.GOLD, 66, 1.3)
		effekte.explosion(pos, 1.2)
		var a0 := zb
		var t3 := create_tween()
		t3.tween_method(func(x): _zeige_wertung(roundi(lerpf(a0, r["A"], x)), roundi(zn)), 0.0, 1.0, schritt)
		zb = r["A"]
		await get_tree().create_timer(schritt * 1.4).timeout
	_zeige_wertung(r["A"], r["S"])
	await get_tree().create_timer(schritt * 0.6).timeout
	# Ergebnis A × S
	var mitte_pos: Vector2 = brett.global_position + brett.size / 2.0
	effekte.zahl(mitte_pos, "%s × %s = %s" % [_fmt(r["A"]), _fmt(r["S"]), _fmt(r["total"])], Color.WHITE, 78, 1.8)
	effekte.wackeln(10.0 + minf(30.0, r["total"] / 120.0))
	if r["total"] >= 800:
		effekte.explosion(mitte_pos, clampf(r["total"] / 1500.0, 1.0, 2.5))
	Klang.spiele("plopp", 1.6)
	var p0 := float(punkte)
	punkte += r["total"]
	var tp := create_tween()
	tp.tween_method(func(x):
		_punkte_anzeige = x
		_aktualisiere(), p0, float(punkte), schritt * 2.5).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	await get_tree().create_timer(schritt * 3.0).timeout
	_punkte_anzeige = punkte
	l_wertung.visible = false
	wertung_laeuft = false
	tag += 1
	if tag > TAGE or punkte >= ZIEL:
		_ende()
	else:
		_neuer_tag()
		l_info.text = "Tag %d: %s Punkte heute, zusammen %s von %s." % [tag, _fmt(r["total"]), _fmt(punkte), _fmt(ZIEL)]
	_aktualisiere()

func _zeige_wertung(a: int, s: int) -> void:
	l_wertung.text = "%s B  ×  %s N" % [_fmt(a), _fmt(s)]

func _ende() -> void:
	spiel_aus = true
	var geschafft := punkte >= ZIEL
	Klang.spiele("sieg" if geschafft else "niederlage")
	if geschafft:
		effekte.explosion(size / 2.0, 2.5)
		effekte.muenzen(size / 2.0, 30)
	dunkel.visible = true
	panel_ende = PanelContainer.new()
	var v := VBoxContainer.new()
	v.alignment = BoxContainer.ALIGNMENT_CENTER
	v.add_theme_constant_override("separation", 30)
	panel_ende.add_child(v)
	var t := Label.new()
	t.text = "Geschafft!" if geschafft else "Leider nicht"
	t.add_theme_font_override("font", Aussehen.titel())
	t.add_theme_font_size_override("font_size", 110)
	t.add_theme_color_override("font_color", Aussehen.GOLD if geschafft else Color(0.95, 0.4, 0.3))
	t.add_theme_color_override("font_outline_color", Aussehen.UMRISS)
	t.add_theme_constant_override("outline_size", 18)
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(t)
	var u := Label.new()
	u.text = "%s von %s Punkten" % [_fmt(punkte), _fmt(ZIEL)]
	u.add_theme_font_size_override("font_size", 50)
	u.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(u)
	var k := Button.new()
	k.text = "Neues Spiel"
	k.add_theme_font_size_override("font_size", 56)
	k.pressed.connect(func():
		Klang.spiele("plopp", 1.2)
		neues_spiel())
	v.add_child(k)
	add_child(panel_ende)
	panel_ende.reset_size()
	panel_ende.position = (size - panel_ende.size) / 2.0
	panel_ende.pivot_offset = panel_ende.size / 2.0
	panel_ende.scale = Vector2(0.3, 0.3)
	create_tween().tween_property(panel_ende, "scale", Vector2.ONE, 0.5).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)

func _zeige_einstellungen() -> void:
	if panel_einst:
		return
	dunkel.visible = true
	panel_einst = preload("res://skripte/einstellungen_panel.gd").new()
	add_child(panel_einst)
	panel_einst.zu.connect(func():
		panel_einst.queue_free()
		panel_einst = null
		dunkel.visible = spiel_aus)
	panel_einst.reset_size()
	panel_einst.position = (size - panel_einst.size) / 2.0

static func _fmt(n) -> String:
	var s := str(int(n))
	var neg := s.begins_with("-")
	if neg:
		s = s.substr(1)
	var o := ""
	while s.length() > 3:
		o = "." + s.substr(s.length() - 3) + o
		s = s.substr(0, s.length() - 3)
	return ("-" if neg else "") + s + o
