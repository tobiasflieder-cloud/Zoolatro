extends Control
## Eine Handkarte. Zeichnet sich selbst (Comic-Look), federt beim Auswählen, seltene Karten glänzen.

signal angetippt(karte)

var key := ""
var gewaehlt := false
var zu_teuer := false
var _glanz: ColorRect
var _bild: TextureRect
var _ruhe := Vector2.ZERO   # Ruheposition (wird von der Hand gesetzt)
var _tw: Tween

const GLANZ_SHADER := """
shader_type canvas_item;
uniform float zeit = 0.0;
uniform vec4 farbe : source_color = vec4(1.0, 1.0, 1.0, 0.7);
void fragment() {
	float x = UV.x + UV.y * 0.6 - mod(zeit * 0.45, 2.6) + 0.6;
	float band = smoothstep(0.0, 0.08, x) * (1.0 - smoothstep(0.08, 0.22, x));
	COLOR = vec4(farbe.rgb, farbe.a * band);
}
"""

func richte_ein(k: String) -> void:
	key = k
	custom_minimum_size = Vector2(196, 300)
	size = custom_minimum_size
	pivot_offset = size / 2.0
	mouse_filter = Control.MOUSE_FILTER_STOP
	var c := Regeln.karte(key)
	var tex := Aussehen.bild(c.get("bild", ""))
	if tex:
		_bild = TextureRect.new()
		_bild.texture = tex
		_bild.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		_bild.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		_bild.position = Vector2(30, 58)
		_bild.size = Vector2(136, 110)
		_bild.mouse_filter = Control.MOUSE_FILTER_IGNORE
		add_child(_bild)
	var rar: String = c.get("rar_anzeige", c.get("rar", ""))
	if rar == "selten" or rar == "sehr selten":
		_glanz = ColorRect.new()
		_glanz.size = size
		_glanz.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var m := ShaderMaterial.new()
		var sh := Shader.new()
		sh.code = GLANZ_SHADER
		m.shader = sh
		m.set_shader_parameter("farbe", Color(1, 1, 1, 0.75) if rar == "selten" else Color(1, 0.85, 1, 0.9))
		_glanz.material = m
		add_child(_glanz)
	queue_redraw()

func _process(_d: float) -> void:
	if _glanz and Einstellungen.effekte:
		(_glanz.material as ShaderMaterial).set_shader_parameter("zeit", Time.get_ticks_msec() / 1000.0)
	if _glanz:
		_glanz.visible = Einstellungen.effekte

func _gui_input(e: InputEvent) -> void:
	if e is InputEventMouseButton and e.pressed and e.button_index == MOUSE_BUTTON_LEFT:
		angetippt.emit(self)
		accept_event()

## Ruheposition setzen (federt dorthin)
func gehe_zu(p: Vector2, sofort := false) -> void:
	_ruhe = p
	var ziel := p + Vector2(0, -46 if gewaehlt else 0)
	if sofort:
		position = ziel
		return
	_feder(ziel, Vector2.ONE * (1.07 if gewaehlt else 1.0))

func waehle(an: bool) -> void:
	gewaehlt = an
	_feder(_ruhe + Vector2(0, -46 if an else 0), Vector2.ONE * (1.07 if an else 1.0))
	queue_redraw()

func _feder(ziel: Vector2, skala: Vector2) -> void:
	if _tw:
		_tw.kill()
	var f: float = Einstellungen.w("federn")
	if f <= 0.01:
		position = ziel
		scale = skala
		return
	_tw = create_tween().set_parallel(true)
	_tw.tween_property(self, "position", ziel, 0.25 + 0.3 * f).set_trans(Tween.TRANS_ELASTIC if f > 1.2 else Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	_tw.tween_property(self, "scale", skala, 0.2 + 0.25 * f).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)

## Hüpfer (z. B. beim Ziehen oder wenn etwas nicht geht)
func huepfe(staerke := 1.0) -> void:
	var f: float = Einstellungen.w("federn") * staerke
	if f <= 0.01:
		return
	var t := create_tween()
	t.tween_property(self, "scale", Vector2.ONE * (1.0 + 0.18 * f), 0.08)
	t.tween_property(self, "scale", Vector2.ONE * (1.07 if gewaehlt else 1.0), 0.35).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)

func _draw() -> void:
	if key == "":
		return
	var c := Regeln.karte(key)
	var r := Rect2(Vector2.ZERO, size)
	var hinten := StyleBoxFlat.new()
	hinten.bg_color = Aussehen.PAPIER if not zu_teuer else Aussehen.PAPIER.darkened(0.18)
	hinten.set_border_width_all(7)
	hinten.border_color = Aussehen.UMRISS if not gewaehlt else Color(0.1, 0.45, 0.95)
	hinten.set_corner_radius_all(24)
	hinten.shadow_color = Color(0, 0, 0, 0.35)
	hinten.shadow_size = 10 if gewaehlt else 4
	hinten.shadow_offset = Vector2(0, 8 if gewaehlt else 4)
	draw_style_box(hinten, r)
	# Farbband oben (Lebensraum bzw. Kategorie)
	var band := StyleBoxFlat.new()
	band.bg_color = Aussehen.farbe_karte(c)
	band.corner_radius_top_left = 18
	band.corner_radius_top_right = 18
	draw_style_box(band, Rect2(7, 7, size.x - 14, 44))
	var f := Aussehen.schrift()
	var tf := Aussehen.titel()
	# Kostenpunkte oben rechts
	var kosten := Regeln.kosten(key)
	for i in kosten:
		draw_circle(Vector2(size.x - 24 - i * 22, 29), 8, Aussehen.UMRISS)
	# Mini-Form oben links
	var fe: Array = Regeln.formen[c["shape"]]
	var mini := 7.0
	var mitte_m := Vector2.ZERO
	for p in fe:
		mitte_m += Regeln.pixel(p, mini)
	mitte_m /= fe.size()
	for p in fe:
		var m: Vector2 = Vector2(36, 29) + Regeln.pixel(p, mini) - mitte_m
		var pts := PackedVector2Array()
		for i in 6:
			var w := deg_to_rad(60.0 * i - 30.0)
			pts.append(m + Vector2(cos(w), sin(w)) * mini)
		draw_colored_polygon(pts, Color.WHITE)
		pts.append(pts[0])
		draw_polyline(pts, Aussehen.UMRISS, 2.0)
	# Bild oder Emoji
	if _bild == null:
		var em: String = c["icon"]
		var w := f.get_string_size(em, HORIZONTAL_ALIGNMENT_LEFT, -1, 78)
		draw_string(f, Vector2(size.x / 2.0 - w.x / 2.0, 150), em, HORIZONTAL_ALIGNMENT_LEFT, -1, 78, Color.WHITE)
	# Name
	var name_s: String = c["name"]
	var fs := 30
	while fs > 18 and f.get_string_size(name_s, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x > size.x - 20:
		fs -= 2
	var nw := f.get_string_size(name_s, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x
	draw_string(f, Vector2(size.x / 2.0 - nw / 2.0, 205), name_s, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Aussehen.UMRISS)
	# Werte B / N groß
	_zahl(tf, Vector2(size.x * 0.3, 262), str(int(c["B"])), Aussehen.BESUCHER)
	_zahl(tf, Vector2(size.x * 0.7, 262), str(int(c["N"])), Aussehen.NATUR)
	draw_string(f, Vector2(size.x * 0.3 - 8, 290), "B", HORIZONTAL_ALIGNMENT_LEFT, -1, 22, Aussehen.BESUCHER)
	draw_string(f, Vector2(size.x * 0.7 - 8, 290), "N", HORIZONTAL_ALIGNMENT_LEFT, -1, 22, Aussehen.NATUR)
	var rar: String = c.get("rar_anzeige", "")
	if rar != "":
		var ecke := PackedVector2Array([Vector2(size.x - 7, 52), Vector2(size.x - 50, 52), Vector2(size.x - 7, 95)])
		draw_colored_polygon(ecke, Color(0.18, 0.5, 0.88) if rar == "selten" else Color(0.61, 0.3, 1.0))
		draw_string(f, Vector2(size.x - 32, 76), "★" if rar == "selten" else "★★", HORIZONTAL_ALIGNMENT_LEFT, -1, 16, Color.WHITE)

func _zahl(f: Font, m: Vector2, t: String, farbe: Color) -> void:
	var w := f.get_string_size(t, HORIZONTAL_ALIGNMENT_LEFT, -1, 54)
	var p := m - Vector2(w.x / 2.0, 0)
	draw_string_outline(f, p, t, HORIZONTAL_ALIGNMENT_LEFT, -1, 54, 10, Aussehen.UMRISS)
	draw_string(f, p, t, HORIZONTAL_ALIGNMENT_LEFT, -1, 54, farbe)
