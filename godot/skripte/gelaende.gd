class_name Gelaende
## Gelände „Wiese“ (Radius 5) – gleiche Bauart wie tests/referenz/spielwiese.js:
## Naturflecken Wasser 4, Savanne 4, Wüste 3 Felder, 2 Felsen, 1 Kronenfeld und 3 Goldfelder auf normalen Feldern.

static func erzeuge(rng: RandomNumberGenerator) -> Dictionary:
	var felder := Regeln.hex_scheibe(5)
	var gel := {}
	var auf := {}
	for c in felder:
		auf[Regeln.hk(c)] = true
	for fleck in [["wasser", 4], ["savanne", 4], ["wueste", 3]]:
		for versuch in 50:
			var s: Vector2i = felder[rng.randi() % felder.size()]
			if gel.has(Regeln.hk(s)):
				continue
			var teil := [s]
			gel[Regeln.hk(s)] = fleck[0]
			for g in 40:
				if teil.size() >= fleck[1]:
					break
				var p: Vector2i = teil[rng.randi() % teil.size()] + Regeln.DIRS[rng.randi() % 6]
				if auf.has(Regeln.hk(p)) and not gel.has(Regeln.hk(p)):
					gel[Regeln.hk(p)] = fleck[0]
					teil.append(p)
			break
	for i in 2:
		for versuch in 50:
			var k := Regeln.hk(felder[rng.randi() % felder.size()])
			if not gel.has(k):
				gel[k] = "block"
				break
	var frei := []
	for c in felder:
		if not gel.has(Regeln.hk(c)):
			frei.append(Regeln.hk(c))
	var krone: String = frei[rng.randi() % frei.size()]
	var gold := []
	for versuch in 200:
		if gold.size() >= 3:
			break
		var k: String = frei[rng.randi() % frei.size()]
		if k != krone and not gold.has(k):
			gold.append(k)
	return {"felder": felder, "gelaende": gel, "gold": gold, "krone": krone}
