class_name Regeln
## Spielregeln der Spielwiese – Nachbau der Wertung aus dem HTML-Spiel (docs/regeln.md, quelltext/src/04-regeln-wertung.js: evalB/scoreZoo).
## Rechenweg wie im Tutorial-Rahmen des HTML-Spiels: keine Merkmale/Stress/Show, Lebensraum-Regel nur Savanne (Herde), Frühling.
## Reihenfolge je Gebäude: Grundwert → Nachbarn gleichen Lebensraums (+1 B) und Naturfläche (+1 N je Feld) → Kartenbonus →
## Goldfelder (×2 je Feld) → Kombo → Herde → Freundschaft → Innenhof/Allee/Dreiländereck. Danach Mehrfach-Bau, Summe, Kronenfeld ×1,3 B.
## Alle Zuschläge werden einzeln gerundet wie JavaScript Math.round (0,5 → nach oben, auch bei negativen Zahlen).

const DIRS := [Vector2i(1, 0), Vector2i(1, -1), Vector2i(0, -1), Vector2i(-1, 0), Vector2i(-1, 1), Vector2i(0, 1)]
const DUPW := [1.0, 0.75, 0.25]
const KRONE := 1.3
const DATEN := "res://daten/karten.json"

static var karten := {}      # key -> Dictionary
static var formen := {}      # shape -> Array[Vector2i]
static var freunde := []     # [[a,b], …]

static func lade() -> void:
	if not karten.is_empty():
		return
	var f := FileAccess.open(DATEN, FileAccess.READ)
	var d: Dictionary = JSON.parse_string(f.get_as_text())
	for c in d["karten"]:
		karten[c["key"]] = c
	for k in d["formen"]:
		var fe: Array[Vector2i] = []
		for p in d["formen"][k]["felder"]:
			fe.append(Vector2i(int(p[0]), int(p[1])))
		formen[k] = fe
	freunde = d["freunde"]

## JavaScript-Math.round
static func jround(x: float) -> int:
	return int(floor(x + 0.5))

static func karte(key: String) -> Dictionary:
	return karten[key]

# ---------- Hex ----------
static func hk(c: Vector2i) -> String:
	return "%d,%d" % [c.x, c.y]

static func dreh(felder: Array, rot: int) -> Array[Vector2i]:
	var out: Array[Vector2i] = []
	for p in felder:
		var q: int = p.x
		var r: int = p.y
		for i in range(((rot % 6) + 6) % 6):
			var nq := -r
			var nr := q + r
			q = nq
			r = nr
		out.append(Vector2i(q, r))
	return out

static func felder_fuer(key: String, rot: int, anker: Vector2i) -> Array[Vector2i]:
	var out: Array[Vector2i] = []
	for p in dreh(formen[karte(key)["shape"]], rot):
		out.append(p + anker)
	return out

static func hex_scheibe(radius: int) -> Array[Vector2i]:
	var out: Array[Vector2i] = []
	for q in range(-radius, radius + 1):
		for r in range(-radius, radius + 1):
			if abs(q + r) <= radius:
				out.append(Vector2i(q, r))
	return out

## Bildschirm-Mittelpunkt eines Felds (spitze Oberseite, wie px() im HTML-Spiel)
static func pixel(c: Vector2i, groesse: float) -> Vector2:
	return Vector2(groesse * sqrt(3.0) * (c.x + c.y / 2.0), groesse * 1.5 * c.y)

static func feld_bei(p: Vector2, groesse: float) -> Vector2i:
	var q := (sqrt(3.0) / 3.0 * p.x - p.y / 3.0) / groesse
	var r := (2.0 / 3.0 * p.y) / groesse
	var s := -q - r
	var rq := roundi(q)
	var rr := roundi(r)
	var rs := roundi(s)
	var dq := absf(rq - q)
	var dr := absf(rr - r)
	var ds := absf(rs - s)
	if dq > dr and dq > ds:
		rq = -rr - rs
	elif dr > ds:
		rr = -rq - rs
	return Vector2i(rq, rr)

# ---------- Gelände-Zustand ----------
## gel = {"felder": Array[Vector2i], "gelaende": {"q,r": "wasser"|"savanne"|"wueste"|"block"}, "gold": ["q,r"…], "krone": "q,r"}

static func index_von(gebaeude: Array) -> Dictionary:
	var idx := {}
	for b in gebaeude:
		for c in b["felder"]:
			idx[hk(c)] = b
	return idx

static func nachbarn(b: Dictionary, idx: Dictionary) -> Array:
	var out := []
	for c in b["felder"]:
		for d in DIRS:
			var o = idx.get(hk(c + d))
			if o != null and o != b and not out.has(o):
				out.append(o)
	return out

static func ist_gehege(b) -> bool:
	return b != null and karte(b["key"])["cat"] == "gehege"

static func lebensraum(b) -> Variant:
	return karte(b["key"])["hab"]

## Passt eine Karte auf diese Felder? (fits() im HTML-Spiel)
static func passt(gel: Dictionary, gebaeude: Array, felder: Array, key: String) -> bool:
	var idx := index_von(gebaeude)
	var auf := {}
	for c in gel["felder"]:
		auf[hk(c)] = true
	var k := karte(key)
	for c in felder:
		var s := hk(c)
		if not auf.has(s) or idx.has(s):
			return false
		var t = gel["gelaende"].get(s)
		if t == null:
			continue
		if t == "block":
			return false
		if k["cat"] != "gehege" or k["hab"] != t:
			return false
	return true

## Baupunkte: je Feld 1, Gehege mit 4 Feldern 1 weniger, mindestens 1 (costParts)
static func kosten(key: String) -> int:
	var n: int = formen[karte(key)["shape"]].size()
	var k := karte(key)
	return maxi(1, n - (1 if k["cat"] == "gehege" and n >= 4 else 0))

# ---------- Wertung eines Gebäudes ----------
static func _zaehle(nb: Array, f: Callable) -> int:
	var n := 0
	for x in nb:
		if f.call(x):
			n += 1
	return n

static func _w(nb: Array, hab: String) -> int:
	return _zaehle(nb, func(x): return ist_gehege(x) and lebensraum(x) == hab)

static func kartenbonus(key: String, nb: Array) -> Vector2i:
	match key:
		"nilpferde":
			return Vector2i(0, 2 * _w(nb, "wasser"))
		"bratwurst":
			return Vector2i(_w(nb, "savanne"), 0)
		"popcorn":
			var neben_show := _zaehle(nb, func(x): return x["key"] == "delfinshow" or x["key"] == "streichelzoo") > 0
			var andere := _zaehle(nb, func(x): return karte(x["key"])["cat"] == "attr" and x["key"] != "delfinshow" and x["key"] != "streichelzoo")
			return Vector2i((5 if neben_show else 0) + 2 * andere, 0)
		"gruen":
			return Vector2i(0, _zaehle(nb, func(x): return ist_gehege(x)))
		"delfinshow":
			return Vector2i(_w(nb, "wasser"), 0)
		"streichelzoo":
			return Vector2i(2 * _zaehle(nb, func(x): return karte(x["key"])["cat"] == "essen"), 0)
	return Vector2i.ZERO

static func kombo(key: String, nb: Array) -> Dictionary:
	if key == "nilpferde" and _w(nb, "wasser") >= 3:
		return {"f": 1.5, "l": "3 Wasser-Gehege daneben"}
	return {}

static func herden_groesse(b: Dictionary, idx: Dictionary) -> int:
	var gesehen := [b]
	var st := [b]
	while not st.is_empty():
		var x = st.pop_back()
		for c in x["felder"]:
			for d in DIRS:
				var n = idx.get(hk(c + d))
				if n != null and not gesehen.has(n) and ist_gehege(n) and lebensraum(n) == "savanne":
					gesehen.append(n)
					st.append(n)
	return gesehen.size()

static func freund_index(k1: String, k2: String) -> int:
	for i in freunde.size():
		var p = freunde[i]
		if (p[0] == k1 and p[1] == k2) or (p[0] == k2 and p[1] == k1):
			return i
	return -1

## Formen (shapes92): Innenhof, Allee, Dreiländereck – für alle Gebäude auf einmal
static func formen_im_zoo(gel: Dictionary, gebaeude: Array, idx: Dictionary) -> Dictionary:
	var out := {}  # id -> {"hof":true,…}
	var setze := func(b, k):
		if not out.has(b["id"]):
			out[b["id"]] = {}
		out[b["id"]][k] = true
	for c in gel["felder"]:
		var s := hk(c)
		if idx.has(s) or gel["gelaende"].get(s) == "block":
			continue
		var alle := true
		var ns := []
		for d in DIRS:
			var n = idx.get(hk(c + d))
			if not ist_gehege(n):
				alle = false
				break
			ns.append(n)
		if alle:
			for n in ns:
				setze.call(n, "hof")
	for d in [Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, -1)]:
		for c in gel["felder"]:
			if not ist_gehege(idx.get(hk(c))) or ist_gehege(idx.get(hk(c - d))):
				continue
			var reihe := []
			var p: Vector2i = c
			while ist_gehege(idx.get(hk(p))):
				var b = idx.get(hk(p))
				if not reihe.has(b):
					reihe.append(b)
				p += d
			if reihe.size() >= 4:
				for b in reihe:
					setze.call(b, "allee")
	for c in gel["felder"]:
		var a = idx.get(hk(c))
		if not ist_gehege(a):
			continue
		for i in 6:
			var b1 = idx.get(hk(c + DIRS[i]))
			var b2 = idx.get(hk(c + DIRS[(i + 1) % 6]))
			if ist_gehege(b1) and ist_gehege(b2) and a != b1 and b1 != b2 and a != b2:
				var habs := {}
				for x in [a, b1, b2]:
					habs[lebensraum(x)] = true
				if habs.size() == 3:
					for x in [a, b1, b2]:
						setze.call(x, "drei")
	return out

## Wert eines Gebäudes. teile = Array von [Text, B, N] (wie breakdown im HTML-Spiel). Gibt {"a","s"} zurück.
static func werte_gebaeude(gel: Dictionary, b: Dictionary, gebaeude: Array, idx: Dictionary, formen_z: Dictionary, teile: Array) -> Dictionary:
	var c := karte(b["key"])
	var nb := nachbarn(b, idx)
	var w := {"a": int(c["B"]), "s": int(c["N"])}
	var add := func(label: String, da: int, ds: int, art: String):
		if da == 0 and ds == 0:
			return
		w["a"] += da
		w["s"] += ds
		teile.append([label, da, ds, art])
	var mal := func(label: String, fa: float, fs: float, art: String):
		var aa: int = maxi(0, w["a"])
		var ss: int = maxi(0, w["s"])
		add.call(label, jround(aa * (fa - 1.0)), jround(ss * (fs - 1.0)), art)
	var hab = c["hab"]
	if hab != null:
		add.call("%s-Nachbarn" % _hab_name(hab), _w(nb, hab), 0, "nachbar")
		var nat := 0
		for f in b["felder"]:
			if gel["gelaende"].get(hk(f)) == hab:
				nat += 1
		add.call("%s-Naturfläche" % _hab_name(hab), 0, nat, "natur")
	var kb := kartenbonus(b["key"], nb)
	add.call("Kartenbonus", kb.x, kb.y, "bonus")
	# Goldfelder: je Feld ×2, nacheinander (seit HTML 0.72a)
	for f in b["felder"]:
		if gel["gold"].has(hk(f)):
			var a0: int = maxi(0, w["a"])
			var s0: int = maxi(0, w["s"])
			add.call("★ Goldenes Feld: zählt doppelt", a0, s0, "gold")
	var km := kombo(b["key"], nb)
	if not km.is_empty():
		var aa: int = maxi(0, w["a"])
		var ss: int = maxi(0, w["s"])
		add.call("🔗 Kombo ×1,5: %s" % km["l"], jround(aa * (km["f"] - 1.0)), jround(ss * (km["f"] - 1.0)), "kombo")
	if c["cat"] == "gehege":
		if hab == "savanne":
			var g := herden_groesse(b, idx)
			if g < 2:
				mal.call("🌾 Herde: allein ×0,5", 0.5, 0.5, "herde")
			else:
				# wie +x.toFixed(2) in JavaScript: über die Textform, damit 1,15 genau wie dort 1,1499999… ist
				var f := ("%.2f" % minf(2.0, 1.0 + 0.15 * (g - 1))).to_float()
				mal.call("🌾 Herde aus %d ×%s" % [g, _zahl(f)], f, f, "herde")
		var schon := {}
		for n in nb:
			if not ist_gehege(n) or n["key"] == b["key"]:
				continue
			var i := freund_index(b["key"], n["key"])
			if i >= 0 and not schon.has(i):
				schon[i] = true
				mal.call("🤝 Freundschaft mit %s ×1,25" % karte(n["key"])["name"], 1.25, 1.25, "freund")
		var fo: Dictionary = formen_z.get(b["id"], {})
		if fo.has("hof"):
			mal.call("🏡 Innenhof ×1,2", 1.2, 1.2, "form")
		if fo.has("allee"):
			add.call("🌳 Allee", 2, 0, "form")
		if fo.has("drei"):
			add.call("🔺 Dreiländereck", 0, 2, "form")
	return w

static func _hab_name(h: String) -> String:
	return {"wasser": "Wasser", "savanne": "Savanne", "wueste": "Wüste", "wald": "Dschungel"}.get(h, h)

## wie String(x) in JavaScript, mit Komma (2 → "2", 1.3 → "1,3")
static func _zahl(f: float) -> String:
	var g := snappedf(f, 0.01)
	if is_equal_approx(g, roundf(g)):
		return str(int(roundf(g)))
	return str(g).replace(".", ",")

## Wertung des ganzen Zoos (scoreZoo). Ergebnis:
## {"A","S","total","schritte":[{"id","a","s","teile"}…],"mults":[{"label","ma"}…]}
static func werte_zoo(gel: Dictionary, gebaeude: Array) -> Dictionary:
	var idx := index_von(gebaeude)
	var fz := formen_im_zoo(gel, gebaeude, idx)
	var schritte := []
	var gesehen := {}
	var A := 0
	var S := 0
	for b in gebaeude:
		var teile := []
		var v := werte_gebaeude(gel, b, gebaeude, idx, fz, teile)
		var n: int = gesehen.get(b["key"], 0)
		gesehen[b["key"]] = n + 1
		if n > 0:
			var wf: float = DUPW[mini(n, 2)]
			var da := jround((wf - 1.0) * maxi(0, v["a"]))
			var ds := jround((wf - 1.0) * maxi(0, v["s"]))
			if da != 0 or ds != 0:
				v["a"] += da
				v["s"] += ds
				teile.append(["%d. %s: zählt %d %% des eigenen Werts" % [n + 1, karte(b["key"])["name"], roundi(wf * 100)], da, ds, "doppelt"])
		A += v["a"]
		S += v["s"]
		schritte.append({"id": b["id"], "a": v["a"], "s": v["s"], "teile": teile})
	var mults := []
	var kb = idx.get(gel["krone"]) if gel["krone"] != null else null
	if kb != null and ist_gehege(kb) and kb["felder"].size() >= 4:
		mults.append({"label": "Kronenfeld", "ma": KRONE, "id": kb["id"]})
	var A2 := float(A)
	for m in mults:
		A2 *= m["ma"]
	var a_end := maxi(0, jround(A2))
	var s_end := maxi(0, jround(float(S)))
	return {"A": a_end, "S": s_end, "total": a_end * s_end, "schritte": schritte, "mults": mults, "A_roh": A, "S_roh": S}
