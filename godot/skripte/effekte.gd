extends Control
## Effekt-Ebene über dem Spielfeld: aufploppende Zahlen, Kombo-Explosion, Münzregen, Bildschirmwackeln.
## Alle Stärken hängen an den Reglern in Einstellungen (wackeln, partikel); „Effekte aus“ schaltet alles ab.

var wackel_ziel: Control      # dieser Knoten wird beim Wackeln verschoben
var _wackel := 0.0
var _ruhe := Vector2.ZERO
var _muenze: Texture2D
var _stern: Texture2D
var _funke: Texture2D

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_muenze = Aussehen.kreis(14, Aussehen.GOLD, Aussehen.UMRISS, 4)
	_stern = Aussehen.stern(18, Color.WHITE)
	_funke = Aussehen.kreis(6, Color.WHITE, Color.WHITE, 0)

func _process(delta: float) -> void:
	if wackel_ziel == null:
		return
	if _wackel > 0.01:
		wackel_ziel.position = _ruhe + Vector2(randf_range(-1, 1), randf_range(-1, 1)) * _wackel
		_wackel = lerpf(_wackel, 0.0, 1.0 - exp(-delta * 9.0))
	elif wackel_ziel.position != _ruhe:
		wackel_ziel.position = _ruhe

func setze_wackel_ziel(z: Control) -> void:
	wackel_ziel = z
	_ruhe = z.position

## Bildschirmwackeln, staerke in Pixeln bei Regler 1
func wackeln(staerke: float) -> void:
	var w: float = Einstellungen.w("wackeln")
	if w <= 0.0:
		return
	_wackel = maxf(_wackel, staerke * w)

## Zahl, die aufploppt und nach oben schwebt
func zahl(pos: Vector2, text: String, farbe: Color, groesse := 56, dauer := 0.9) -> void:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", Aussehen.titel())
	l.add_theme_font_size_override("font_size", groesse)
	l.add_theme_color_override("font_color", farbe)
	l.add_theme_color_override("font_outline_color", Aussehen.UMRISS)
	l.add_theme_constant_override("outline_size", maxi(8, groesse / 5))
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(l)
	l.reset_size()
	l.pivot_offset = l.size / 2.0
	l.position = pos - l.size / 2.0
	var tempo: float = Einstellungen.werte.get("tempo", 1.0)
	var d := dauer / tempo
	if not Einstellungen.effekte:
		var t0 := create_tween()
		t0.tween_interval(d)
		t0.tween_callback(l.queue_free)
		return
	l.scale = Vector2(0.2, 0.2)
	var t := create_tween()
	t.tween_property(l, "scale", Vector2.ONE * 1.25, d * 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	t.tween_property(l, "scale", Vector2.ONE, d * 0.12)
	t.parallel().tween_property(l, "position:y", l.position.y - 90, d).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	t.tween_property(l, "modulate:a", 0.0, d * 0.3)
	t.tween_callback(l.queue_free)

## Kombo-Explosion: Sterne und Funken in alle Richtungen, heller Ring
func explosion(pos: Vector2, staerke := 1.0) -> void:
	var p: float = Einstellungen.w("partikel")
	if p > 0.0:
		_teilchen(pos, _stern, int(26 * staerke * p), 520.0 * sqrt(staerke), [Color(1, 0.95, 0.4), Color(1, 0.5, 0.2), Color(1, 1, 1)], 0.0, 0.8)
		_teilchen(pos, _funke, int(40 * staerke * p), 760.0 * sqrt(staerke), [Color(1, 1, 0.8), Color(1, 0.7, 0.3)], 0.0, 0.5)
		_ring(pos, 160.0 * staerke)
	wackeln(18.0 * staerke)
	Klang.spiele("bumm", 1.0 / maxf(0.7, sqrt(staerke)), 0.9)
	if OS.has_feature("mobile") and Einstellungen.w("wackeln") > 0.0:
		Input.vibrate_handheld(int(30 * staerke * Einstellungen.w("wackeln")))

## Münzregen (Gastro bringt Taler)
func muenzen(pos: Vector2, anzahl := 8) -> void:
	var p: float = Einstellungen.w("partikel")
	if p > 0.0:
		var t := _teilchen(pos + Vector2(0, -60), _muenze, int(anzahl * p), 420.0, [Color.WHITE], 1400.0, 1.3)
		t.direction = Vector2(0, -1)
		t.spread = 55.0
	Klang.spiele("muenze", randf_range(0.95, 1.1))

func _teilchen(pos: Vector2, tex: Texture2D, n: int, tempo: float, farben: Array, schwerkraft: float, leben: float) -> CPUParticles2D:
	var t := CPUParticles2D.new()
	t.position = pos
	t.texture = tex
	t.amount = maxi(1, n)
	t.one_shot = true
	t.explosiveness = 0.95
	t.lifetime = leben
	t.spread = 180.0
	t.initial_velocity_min = tempo * 0.4
	t.initial_velocity_max = tempo
	t.gravity = Vector2(0, schwerkraft)
	t.damping_min = 80.0
	t.damping_max = 160.0
	t.angular_velocity_min = -360.0
	t.angular_velocity_max = 360.0
	t.scale_amount_min = 0.6
	t.scale_amount_max = 1.4
	var g := Gradient.new()
	g.colors = PackedColorArray([farben[0], farben[min(1, farben.size() - 1)], Color(1, 1, 1, 0)])
	g.offsets = PackedFloat32Array([0.0, 0.6, 1.0])
	t.color_ramp = g
	add_child(t)
	t.emitting = true
	get_tree().create_timer(leben + 0.5).timeout.connect(t.queue_free)
	return t

func _ring(pos: Vector2, r: float) -> void:
	var ring := _Ring.new()
	ring.position = pos
	ring.radius_end = r
	add_child(ring)

class _Ring extends Node2D:
	var radius_end := 160.0
	var t := 0.0
	func _process(d: float) -> void:
		t += d * 2.6
		queue_redraw()
		if t >= 1.0:
			queue_free()
	func _draw() -> void:
		draw_arc(Vector2.ZERO, radius_end * t, 0, TAU, 48, Color(1, 1, 0.85, 1.0 - t), 18.0 * (1.0 - t) + 2.0)
