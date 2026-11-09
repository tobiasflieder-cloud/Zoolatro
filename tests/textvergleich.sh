#!/usr/bin/env bash
# Vergleicht alle angezeigten Texte zwischen einem Git-Stand (Standard: HEAD) und dem aktuellen Quelltext (Godot-Vorbereitung 2c).
#   bash tests/textvergleich.sh          -> Vergleich mit dem letzten Commit
#   bash tests/textvergleich.sh 0964157  -> Vergleich mit einem anderen Stand
# Ausgabe je Teil: Anzahl Bildschirm-Stände und Textzeilen, die es nur alt (-) oder nur neu (+) gibt. Gleich = „nur alt 0 … nur neu 0“.
set -u
cd "$(dirname "$0")/.."
REF="${1:-HEAD}"
python3 quelltext/mache.py >/dev/null || exit 1
TMP=$(mktemp -d)
mkdir -p "$TMP/q/src" "$TMP/daten"
git archive "$REF" quelltext/src | tar -x -C "$TMP/q" --strip-components=1 2>/dev/null
git archive "$REF" daten 2>/dev/null | tar -x -C "$TMP" 2>/dev/null
python3 - "$TMP/q/src" "$TMP/alt.html" "$TMP/daten" <<'P'
import os,sys,re,json
d=sys.argv[1];fs=sorted(os.listdir(d));rd=lambda f:open(os.path.join(d,f),encoding='utf8').read()
g=rd('00-seite-und-stil.html')+''.join(rd(f) for f in fs if f.endswith('.js'))+rd('99-ende.html')
g=re.sub(r'/\*@@DATEN:([a-z0-9_]+)@@\*/null',lambda m:json.dumps(json.load(open(os.path.join(sys.argv[3],m.group(1)+'.json'),encoding='utf8')),ensure_ascii=False,separators=(',',':')).replace('</','<\\/'),g)
open(sys.argv[2],'w',encoding='utf8').write(g)
P
cd tests
for st in 1 8; do
  ZF="$TMP/alt.html" ST=$st OUT="$TMP/a$st.txt" node textbild.js >/dev/null 2>&1
  ST=$st OUT="$TMP/n$st.txt" node textbild.js >/dev/null 2>&1
  echo "== Menüs, Lexikon, Fenster, Zoolatro-Lauf Stufe $st"; python3 textvergleich.py "$TMP/a$st.txt" "$TMP/n$st.txt"
done
ZF="$TMP/alt.html" OUT="$TMP/at.txt" node textbild-tutorial.js >/dev/null 2>&1
OUT="$TMP/nt.txt" node textbild-tutorial.js >/dev/null 2>&1
echo "== Tutorial"; python3 textvergleich.py "$TMP/at.txt" "$TMP/nt.txt"
rm -rf "$TMP"
