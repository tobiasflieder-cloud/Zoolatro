#!/usr/bin/env bash
# Baut das Spiel, lässt die Tests laufen und vergleicht mit einem Git-Stand (Standard: HEAD).
#   bash tests/pruefen.sh            -> Vergleich mit dem letzten Commit
#   bash tests/pruefen.sh v0.69a     -> Vergleich mit einem Tag/Commit
#   SCHNELL=1 bash tests/pruefen.sh  -> ohne Tutorial-Durchlauf und Bot-Lauf
# Ausgabe: je Test "gleich" oder die Zeilen, die neu FAIL/ERR sind (-) bzw. weggefallen sind (+).
set -u
cd "$(dirname "$0")/.."
REF="${1:-HEAD}"
python3 quelltext/mache.py >/dev/null || exit 1
TMP=$(mktemp -d)
mkdir -p "$TMP/q/src"
git archive "$REF" quelltext/src | tar -x -C "$TMP/q" --strip-components=1 2>/dev/null
python3 - "$TMP/q/src" "$TMP/alt.html" <<'P'
import os,sys
d=sys.argv[1];fs=sorted(os.listdir(d));rd=lambda f:open(os.path.join(d,f),encoding='utf8').read()
open(sys.argv[2],'w',encoding='utf8').write(rd('00-seite-und-stil.html')+''.join(rd(f) for f in fs if f.endswith('.js'))+rd('99-ende.html'))
P
cd tests
F='FAIL|ERR|WINERR|MISSING|EXC|STUCK|UNHANDLED'
for t in jsd*.js; do
  a=$(timeout 300 node "$t" 2>&1 | grep -E "$F" | grep -vE "Version|Neuigkeiten" | sort)
  b=$(ZF="$TMP/alt.html" timeout 300 node "$t" 2>&1 | grep -E "$F" | grep -vE "Version|Neuigkeiten" | sort)
  if [ "$a" == "$b" ]; then echo "${t%.js}: gleich"; else echo "== ${t%.js}: Unterschied (< alt, > neu)"; diff <(echo "$b") <(echo "$a") | grep '^[<>]'; fi
done
echo "== Referenzfälle Wertung"; node referenz/referenz.js 2>&1 | grep -E "FAIL|EXC|Fälle gleich" | cut -c1-200
if [ -z "${SCHNELL:-}" ]; then
  echo "== Tutorial-Durchlauf (tutcal5)"; timeout 1200 node tutcal5.js 2>&1 | grep -E "SEASON|GEND|$F|BADOFFER|NO " | cut -c1-160
  echo "== Bot-Lauf (Absturz-Test)"; Z2=1 timeout 900 node sim94.js 1 "$TMP/bot.json" 2>&1 | grep -E "$F|done" | cut -c1-160
fi
rm -rf "$TMP"
