extends Node
## Regler zum Ausprobieren (Knopf ⚙ oben rechts). Werte werden in user://einstellungen.cfg gespeichert.

signal geaendert

const DATEI := "user://einstellungen.cfg"

## Name -> [Standard, min, max, Schritt, Anzeige]
const REGLER := {
	"wackeln": [1.0, 0.0, 2.0, 0.1, "Bildschirm-Wackeln"],
	"partikel": [1.0, 0.0, 2.0, 0.1, "Partikel-Menge"],
	"tempo": [1.0, 0.25, 3.0, 0.05, "Wertungs-Tempo"],
	"lautstaerke": [0.7, 0.0, 1.0, 0.05, "Lautstärke"],
	"federn": [1.0, 0.0, 2.0, 0.1, "Federn der Karten"],
}

var werte := {}
var effekte := true

func _ready() -> void:
	for k in REGLER:
		werte[k] = REGLER[k][0]
	var c := ConfigFile.new()
	if c.load(DATEI) == OK:
		for k in REGLER:
			werte[k] = float(c.get_value("regler", k, werte[k]))
		effekte = bool(c.get_value("regler", "effekte", true))

func setze(k: String, v) -> void:
	if k == "effekte":
		effekte = bool(v)
	else:
		werte[k] = float(v)
	speichere()
	geaendert.emit()

func zuruecksetzen() -> void:
	for k in REGLER:
		werte[k] = REGLER[k][0]
	effekte = true
	speichere()
	geaendert.emit()

func speichere() -> void:
	var c := ConfigFile.new()
	for k in werte:
		c.set_value("regler", k, werte[k])
	c.set_value("regler", "effekte", effekte)
	c.save(DATEI)

## Hilfen für die Effekte (0, wenn Effekte aus)
func w(k: String) -> float:
	if not effekte and k != "tempo" and k != "lautstaerke":
		return 0.0
	return werte.get(k, 1.0)
