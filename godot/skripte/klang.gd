extends Node
## Selbst erzeugte Klänge (keine Dateien): beim Start werden kurze Töne als AudioStreamWAV berechnet.
## Später lassen sich echte Sounds einsetzen: Datei nach res://grafik/klang/<name>.ogg legen, dann wird sie statt des Tons benutzt.

const RATE := 22050
var toene := {}
var spieler: Array[AudioStreamPlayer] = []
var naechster := 0

func _ready() -> void:
	toene["tick"] = _ton(880.0, 0.06, "sinus", 0.5)
	toene["plopp"] = _ton(520.0, 0.12, "plopp", 0.6)
	toene["muenze"] = _muenze()
	toene["bumm"] = _bumm()
	toene["wusch"] = _rauschen(0.18, 0.35)
	toene["setzen"] = _ton(220.0, 0.14, "plopp", 0.8)
	toene["karte"] = _ton(660.0, 0.05, "dreieck", 0.35)
	toene["nein"] = _ton(140.0, 0.16, "rechteck", 0.3)
	toene["sieg"] = _melodie([523.0, 659.0, 784.0, 1047.0], 0.13)
	toene["niederlage"] = _melodie([392.0, 330.0, 262.0], 0.2)
	for i in 10:
		var p := AudioStreamPlayer.new()
		add_child(p)
		spieler.append(p)

## name: tick, plopp, muenze, bumm, wusch, setzen, karte, nein, sieg, niederlage. hoehe: Tonhöhe (1 = normal)
func spiele(name: String, hoehe: float = 1.0, lauter: float = 1.0) -> void:
	var vol: float = Einstellungen.werte.get("lautstaerke", 0.7) * lauter
	if vol <= 0.001:
		return
	var s: AudioStream = toene.get(name)
	var datei := "res://grafik/klang/%s.ogg" % name
	if ResourceLoader.exists(datei):
		s = load(datei)
	if s == null:
		return
	var p := spieler[naechster]
	naechster = (naechster + 1) % spieler.size()
	p.stream = s
	p.pitch_scale = clampf(hoehe, 0.25, 4.0)
	p.volume_db = linear_to_db(vol)
	p.play()

func _wav(daten: PackedFloat32Array) -> AudioStreamWAV:
	var b := PackedByteArray()
	b.resize(daten.size() * 2)
	for i in daten.size():
		b.encode_s16(i * 2, int(clampf(daten[i], -1.0, 1.0) * 32000.0))
	var w := AudioStreamWAV.new()
	w.format = AudioStreamWAV.FORMAT_16_BITS
	w.mix_rate = RATE
	w.stereo = false
	w.data = b
	return w

func _ton(freq: float, dauer: float, art: String, laut: float) -> AudioStreamWAV:
	var n := int(RATE * dauer)
	var d := PackedFloat32Array()
	d.resize(n)
	var phase := 0.0
	for i in n:
		var t := float(i) / RATE
		var f := freq
		if art == "plopp":
			f = freq * (1.0 + 1.5 * exp(-t * 40.0))
		phase += TAU * f / RATE
		var v := 0.0
		match art:
			"sinus", "plopp":
				v = sin(phase)
			"dreieck":
				v = 2.0 * absf(2.0 * (phase / TAU - floor(phase / TAU + 0.5))) - 1.0
			"rechteck":
				v = 1.0 if sin(phase) > 0.0 else -1.0
		var huelle := minf(1.0, t * 400.0) * exp(-t * (6.0 / dauer))
		d[i] = v * huelle * laut
	return _wav(d)

func _muenze() -> AudioStreamWAV:
	var n := int(RATE * 0.25)
	var d := PackedFloat32Array()
	d.resize(n)
	for i in n:
		var t := float(i) / RATE
		var f := 1568.0 if t < 0.06 else 2093.0
		d[i] = (sin(TAU * f * t) * 0.6 + sin(TAU * f * 2.0 * t) * 0.2) * exp(-t * 14.0) * minf(1.0, t * 600.0)
	return _wav(d)

func _bumm() -> AudioStreamWAV:
	var n := int(RATE * 0.5)
	var d := PackedFloat32Array()
	d.resize(n)
	var rng := RandomNumberGenerator.new()
	rng.seed = 7
	var phase := 0.0
	for i in n:
		var t := float(i) / RATE
		phase += TAU * (55.0 + 120.0 * exp(-t * 18.0)) / RATE
		d[i] = (sin(phase) * 0.8 + rng.randf_range(-1, 1) * 0.35 * exp(-t * 25.0)) * exp(-t * 6.0)
	return _wav(d)

func _rauschen(dauer: float, laut: float) -> AudioStreamWAV:
	var n := int(RATE * dauer)
	var d := PackedFloat32Array()
	d.resize(n)
	var rng := RandomNumberGenerator.new()
	rng.seed = 3
	var alt := 0.0
	for i in n:
		var t := float(i) / RATE
		alt = alt * 0.7 + rng.randf_range(-1, 1) * 0.3
		d[i] = alt * sin(PI * t / dauer) * laut
	return _wav(d)

func _melodie(noten: Array, schritt: float) -> AudioStreamWAV:
	var n := int(RATE * schritt * (noten.size() + 1.5))
	var d := PackedFloat32Array()
	d.resize(n)
	for j in noten.size():
		var start := int(RATE * schritt * j)
		var laenge := int(RATE * schritt * (2.5 if j == noten.size() - 1 else 1.2))
		for i in laenge:
			if start + i >= n:
				break
			var t := float(i) / RATE
			d[start + i] += (sin(TAU * noten[j] * t) * 0.45 + sin(TAU * noten[j] * 2.0 * t) * 0.12) * exp(-t * 4.0) * minf(1.0, t * 300.0)
	return _wav(d)
