class_name Aussehen
## Farben, Schriften und Bilder an einer Stelle. Gemalte Grafiken später einfach in godot/grafik/ ablegen:
##   grafik/karten/<key>.png   (Bild auf Karte und Gebäude, z. B. grafik/karten/zebras.png)
##   grafik/gelaende/<art>.png (Kachel für wasser, savanne, wueste, block, gras)
## Solange keine Datei da ist, zeichnet das Spiel Farbflächen mit Emoji.

const UMRISS := Color(0.08, 0.07, 0.07)
const PAPIER := Color(1.0, 0.97, 0.88)
const GELAENDE := {
	"gras": Color(0.62, 0.84, 0.36), "wasser": Color(0.33, 0.72, 0.95), "savanne": Color(0.98, 0.78, 0.33),
	"wueste": Color(0.98, 0.62, 0.38), "block": Color(0.55, 0.53, 0.5)}
const KATEGORIE := {
	"gehege": Color(0.45, 0.8, 0.35), "attr": Color(0.95, 0.4, 0.62), "essen": Color(1.0, 0.62, 0.15),
	"schutz": Color(0.2, 0.68, 0.55), "verst": Color(0.6, 0.5, 0.9)}
const LEBENSRAUM := {"wasser": Color(0.25, 0.62, 0.95), "savanne": Color(0.95, 0.72, 0.2), "wueste": Color(0.93, 0.52, 0.28)}
const BESUCHER := Color(0.93, 0.45, 0.05)
const NATUR := Color(0.05, 0.6, 0.5)
const GOLD := Color(1.0, 0.82, 0.15)

static var _schrift: Font
static var _titel: Font
static var _bilder := {}

static func schrift() -> Font:
	if _schrift == null:
		var basis: FontFile = load("res://schrift/fredoka-latin-600-normal.woff2")
		var v := FontVariation.new()
		v.base_font = basis
		var emoji := SystemFont.new()
		emoji.font_names = PackedStringArray(["Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "Twemoji", "EmojiOne Color"])
		v.fallbacks = [emoji]
		_schrift = v
	return _schrift

static func titel() -> Font:
	if _titel == null:
		var basis: FontFile = load("res://schrift/luckiest-guy-latin-400-normal.woff2")
		var v := FontVariation.new()
		v.base_font = basis
		v.fallbacks = [schrift()]
		_titel = v
	return _titel

static func farbe_karte(c: Dictionary) -> Color:
	if c.get("hab") != null and LEBENSRAUM.has(c["hab"]):
		return LEBENSRAUM[c["hab"]]
	return KATEGORIE.get(c["cat"], Color.GRAY)

## Bild einer Karte (oder null, dann Emoji)
static func bild(pfad: String) -> Texture2D:
	if pfad == "" or not ResourceLoader.exists(pfad):
		return null
	if not _bilder.has(pfad):
		_bilder[pfad] = load(pfad)
	return _bilder[pfad]

## Theme für alle Bedienelemente: dicke Umrisse, kräftige Farben
static func thema() -> Theme:
	var t := Theme.new()
	t.default_font = schrift()
	t.default_font_size = 40
	for zustand in ["normal", "hover", "pressed", "disabled", "focus"]:
		var sb := StyleBoxFlat.new()
		sb.bg_color = {"normal": Color(1, 0.86, 0.35), "hover": Color(1, 0.9, 0.5), "pressed": Color(0.95, 0.72, 0.2),
			"disabled": Color(0.82, 0.8, 0.75), "focus": Color(1, 0.86, 0.35, 0)}[zustand]
		sb.set_border_width_all(6)
		sb.border_color = UMRISS
		sb.set_corner_radius_all(26)
		sb.shadow_color = Color(0, 0, 0, 0.35)
		sb.shadow_offset = Vector2(0, 6) if zustand != "pressed" else Vector2(0, 2)
		sb.content_margin_left = 18
		sb.content_margin_right = 18
		sb.content_margin_top = 8
		sb.content_margin_bottom = 8
		if zustand == "focus":
			sb.draw_center = false
			sb.border_color = Color(0, 0, 0, 0)
		t.set_stylebox(zustand, "Button", sb)
	t.set_color("font_color", "Button", UMRISS)
	t.set_color("font_disabled_color", "Button", Color(0.4, 0.4, 0.4))
	t.set_color("font_hover_color", "Button", UMRISS)
	t.set_color("font_pressed_color", "Button", UMRISS)
	t.set_color("font_color", "Label", UMRISS)
	var panel := StyleBoxFlat.new()
	panel.bg_color = PAPIER
	panel.set_border_width_all(8)
	panel.border_color = UMRISS
	panel.set_corner_radius_all(36)
	panel.content_margin_left = 40
	panel.content_margin_right = 40
	panel.content_margin_top = 30
	panel.content_margin_bottom = 30
	panel.shadow_color = Color(0, 0, 0, 0.4)
	panel.shadow_offset = Vector2(0, 12)
	t.set_stylebox("panel", "PanelContainer", panel)
	var grab := StyleBoxFlat.new()
	grab.bg_color = Color(0.3, 0.3, 0.3)
	grab.set_corner_radius_all(8)
	grab.content_margin_top = 10
	grab.content_margin_bottom = 10
	t.set_stylebox("slider", "HSlider", grab)
	return t

## kleine runde Textur (für Partikel, Münzen)
static func kreis(radius: int, farbe: Color, rand: Color, randbreite: int) -> ImageTexture:
	var img := Image.create(radius * 2, radius * 2, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	for y in radius * 2:
		for x in radius * 2:
			var d := Vector2(x + 0.5 - radius, y + 0.5 - radius).length()
			if d <= radius:
				img.set_pixel(x, y, rand if d > radius - randbreite else farbe)
	return ImageTexture.create_from_image(img)

static func stern(radius: int, farbe: Color) -> ImageTexture:
	var img := Image.create(radius * 2, radius * 2, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	for y in radius * 2:
		for x in radius * 2:
			var p := Vector2(x + 0.5 - radius, y + 0.5 - radius)
			var w := atan2(p.y, p.x)
			var r := radius * (0.55 + 0.45 * absf(cos(w * 2.5)))
			if p.length() <= r:
				img.set_pixel(x, y, farbe)
	return ImageTexture.create_from_image(img)
