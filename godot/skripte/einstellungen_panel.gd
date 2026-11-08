extends PanelContainer
## Einstellungs-Fenster (Knopf ⚙ oben rechts): Regler für die Effekte.

signal zu

var _regler := {}

func _ready() -> void:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 18)
	add_child(v)
	var kopf := Label.new()
	kopf.text = "Einstellungen"
	kopf.add_theme_font_override("font", Aussehen.titel())
	kopf.add_theme_font_size_override("font_size", 64)
	kopf.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(kopf)
	var an := CheckButton.new()
	an.text = "Effekte an"
	an.button_pressed = Einstellungen.effekte
	an.add_theme_font_size_override("font_size", 42)
	an.toggled.connect(func(b): Einstellungen.setze("effekte", b))
	v.add_child(an)
	for k in Einstellungen.REGLER:
		var d: Array = Einstellungen.REGLER[k]
		var zeile := VBoxContainer.new()
		var l := Label.new()
		l.add_theme_font_size_override("font_size", 36)
		zeile.add_child(l)
		var s := HSlider.new()
		s.min_value = d[1]
		s.max_value = d[2]
		s.step = d[3]
		s.value = Einstellungen.werte[k]
		s.custom_minimum_size = Vector2(760, 64)
		var setze_text := func(x): l.text = "%s: %s" % [d[4], _anzeige(k, x)]
		setze_text.call(s.value)
		s.value_changed.connect(func(x):
			setze_text.call(x)
			Einstellungen.setze(k, x)
			if k == "lautstaerke":
				Klang.spiele("tick", 1.2))
		zeile.add_child(s)
		v.add_child(zeile)
		_regler[k] = s
	var knoepfe := HBoxContainer.new()
	knoepfe.alignment = BoxContainer.ALIGNMENT_CENTER
	knoepfe.add_theme_constant_override("separation", 24)
	var zur := Button.new()
	zur.text = "Standard"
	zur.pressed.connect(func():
		Einstellungen.zuruecksetzen()
		an.button_pressed = true
		for k in _regler:
			_regler[k].value = Einstellungen.werte[k])
	knoepfe.add_child(zur)
	var fertig := Button.new()
	fertig.text = "Fertig"
	fertig.pressed.connect(func(): zu.emit())
	knoepfe.add_child(fertig)
	v.add_child(knoepfe)

func _anzeige(k: String, x: float) -> String:
	match k:
		"tempo":
			return "×%s" % str(snappedf(x, 0.05)).replace(".", ",")
		"lautstaerke":
			return "%d %%" % roundi(x * 100)
	return "%d %%" % roundi(x * 100)
