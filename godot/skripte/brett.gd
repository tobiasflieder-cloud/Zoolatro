extends Control
## Das Hex-Spielfeld: Gelände, Gebäude, Vorschau. Meldet angetippte/gezogene Felder.

signal feld_gewaehlt(feld: Vector2i)

var gel := {}
var gebaeude := []
var vorschau := {}          # {"felder":[…], "key":…, "ok":bool}
var leuchten := {}          # id -> Stärke 0..1 (bei der Wertung)
var groesse := 50.0
var _gedrueckt := false
var _zeit := 0.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP

func _process(delta: float) -> void:
	_zeit += delta
	if not leuchten.is_empty() or not vorschau.is_empty():
		queue_redraw()

func mitte() -> Vector2:
	return size / 2.0

func passe_groesse() -> void:
	# Radius 5: Breite ≈ 11·√3·g, Höhe ≈ 16·g
	groesse = minf(size.x / (11.4 * sqrt(3.0)), size.y / 16.6)

func feld_pos(c: Vector2i) -> Vector2:
	return mitte() + Regeln.pixel(c, groesse)

func mitte_von(felder: Array) -> Vector2:
	var s := Vector2.ZERO
	for c in felder:
		s += feld_pos(c)
	return s / maxf(1.0, felder.size())

func _gui_input(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.button_index == MOUSE_BUTTON_LEFT:
		_gedrueckt = e.pressed
		if e.pressed:
			_melde(e.position)
	elif e is InputEventMouseMotion and _gedrueckt:
		_melde(e.position)

func _melde(p: Vector2) -> void:
	var c := Regeln.feld_bei(p - mitte(), groesse)
	for f in gel.get("felder", []):
		if f == c:
			feld_gewaehlt.emit(c)
			return

func _ecken(m: Vector2, g: float) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in 6:
		var w := deg_to_rad(60.0 * i - 30.0)
		pts.append(m + Vector2(cos(w), sin(w)) * g)
	return pts

func _draw() -> void:
	if gel.is_empty():
		return
	var idx := Regeln.index_von(gebaeude)
	var schrift := Aussehen.schrift()
	# Gelände
	for c in gel["felder"]:
		var k := Regeln.hk(c)
		var art: String = gel["gelaende"].get(k, "gras")
		var m := feld_pos(c)
		var pts := _ecken(m, groesse * 0.98)
		var tex := Aussehen.bild("res://grafik/gelaende/%s.png" % art)
		if tex:
			draw_colored_polygon(pts, Color.WHITE, _uv(pts, m), tex)
		else:
			draw_colored_polygon(pts, Aussehen.GELAENDE[art])
		var rand := pts.duplicate()
		rand.append(pts[0])
		draw_polyline(rand, Aussehen.UMRISS.lerp(Aussehen.GELAENDE[art], 0.55), 3.0)
		if art == "block":
			draw_circle(m + Vector2(-8, 4), groesse * 0.36, Color(0.42, 0.4, 0.38))
			draw_circle(m + Vector2(10, -6), groesse * 0.28, Color(0.5, 0.48, 0.45))
			draw_arc(m + Vector2(-8, 4), groesse * 0.36, 0, TAU, 20, Aussehen.UMRISS, 4.0)
		if gel["gold"].has(k) and not idx.has(k):
			_text(m, "★", Aussehen.GOLD, groesse * 0.9, true)
			_text(m + Vector2(0, groesse * 0.55), "×2", Aussehen.UMRISS, groesse * 0.36, false)
		if gel["krone"] == k and not idx.has(k):
			_text(m, "👑", Aussehen.GOLD, groesse * 0.8, true)
			_text(m + Vector2(0, groesse * 0.58), "×1,3", Aussehen.UMRISS, groesse * 0.32, false)
	# Gebäude
	for b in gebaeude:
		_zeichne_gebaeude(b, idx, 1.0, false)
	# Vorschau
	if not vorschau.is_empty():
		var puls := 0.55 + 0.25 * sin(_zeit * 6.0)
		var b := {"id": -1, "key": vorschau["key"], "felder": vorschau["felder"]}
		_zeichne_gebaeude(b, {}, puls, true)
		if not vorschau["ok"]:
			for c in vorschau["felder"]:
				var pts := _ecken(feld_pos(c), groesse * 0.92)
				pts.append(pts[0])
				draw_polyline(pts, Color(0.95, 0.15, 0.15), 7.0)

func _zeichne_gebaeude(b: Dictionary, idx: Dictionary, deckkraft: float, geist: bool) -> void:
	var c := Regeln.karte(b["key"])
	var farbe := Aussehen.farbe_karte(c)
	var l: float = leuchten.get(b["id"], 0.0)
	var eigen := {}
	for f in b["felder"]:
		eigen[Regeln.hk(f)] = true
	var hebe := Vector2(0, -6.0 * l)
	for f in b["felder"]:
		var m := feld_pos(f) + hebe
		var pts := _ecken(m, groesse * (1.0 + 0.06 * l))
		var fa := farbe.lightened(0.25 * l)
		fa.a = deckkraft
		draw_colored_polygon(pts, fa)
	# dicker Umriss nur an den Außenkanten des Gebäudes
	for f in b["felder"]:
		var m := feld_pos(f) + hebe
		var pts := _ecken(m, groesse * (1.0 + 0.06 * l))
		for i in 6:
			# Kante i liegt zwischen Ecke i und i+1; Nachbar in dieser Richtung
			var n: Vector2i = f + _richtung_kante(i)
			if eigen.has(Regeln.hk(n)):
				continue
			var um := Aussehen.UMRISS if not geist else Color(1, 1, 1, 0.9)
			draw_line(pts[i], pts[(i + 1) % 6], um, 8.0 if not geist else 6.0, true)
	var mpos := mitte_von(b["felder"]) + hebe
	var tex := Aussehen.bild(c.get("bild", ""))
	var gr := groesse * (1.1 if b["felder"].size() > 1 else 0.85)
	if tex:
		draw_texture_rect(tex, Rect2(mpos - Vector2(gr, gr) / 2.0, Vector2(gr, gr)), false, Color(1, 1, 1, deckkraft))
	else:
		_text(mpos, c["icon"], Color(1, 1, 1, deckkraft), gr * 0.8, false)
	if l > 0.05:
		draw_arc(mpos, groesse * (0.9 + 0.3 * l), 0, TAU, 28, Color(1, 1, 1, 0.6 * l), 6.0)

## Richtung (Nachbar) zur Kante zwischen Ecke i und i+1 bei spitzer Oberseite (Ecken bei -30°, 30°, 90° …)
func _richtung_kante(i: int) -> Vector2i:
	return [Vector2i(1, 0), Vector2i(0, 1), Vector2i(-1, 1), Vector2i(-1, 0), Vector2i(0, -1), Vector2i(1, -1)][i]

func _uv(pts: PackedVector2Array, m: Vector2) -> PackedVector2Array:
	var uv := PackedVector2Array()
	for p in pts:
		uv.append((p - m) / (groesse * 2.0) + Vector2(0.5, 0.5))
	return uv

func _text(m: Vector2, t: String, farbe: Color, groesse_px: float, umriss: bool) -> void:
	var f := Aussehen.schrift()
	var px := int(groesse_px)
	var w := f.get_string_size(t, HORIZONTAL_ALIGNMENT_CENTER, -1, px)
	var p := m + Vector2(-w.x / 2.0, px * 0.35)
	if umriss:
		draw_string_outline(f, p, t, HORIZONTAL_ALIGNMENT_LEFT, -1, px, 8, Aussehen.UMRISS)
	draw_string(f, p, t, HORIZONTAL_ALIGNMENT_LEFT, -1, px, farbe)
