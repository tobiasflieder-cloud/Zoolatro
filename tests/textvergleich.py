# Vergleicht zwei Textbilder (textbild.js / textbild-tutorial.js): jeder Bildschirm-Stand des neuen Stands muss im alten vorkommen,
# und keine Textzeile darf nur auf einer Seite stehen. Ein einzelner Stand nur im alten Lauf kann ein Zeitpunkt-Effekt sein.
import sys,difflib
a=open(sys.argv[1],encoding='utf8').read().split('\n=====\n');b=open(sys.argv[2],encoding='utf8').read().split('\n=====\n')
A=set(a);B=set(b);na=[x for x in a if x not in B];nb=[x for x in b if x not in A]
print('Stände alt',len(a),'neu',len(b),'nur alt',len(na),'nur neu',len(nb))
# Zeilen, die es nur auf einer Seite gibt (über alle Stände)
la=set(l for x in a for l in x.split('\n'));lb=set(l for x in b for l in x.split('\n'))
print('Textzeilen nur alt:',len(la-lb),'nur neu:',len(lb-la))
for l in sorted(la-lb)[:15]:print('  -',l[:160])
for l in sorted(lb-la)[:15]:print('  +',l[:160])
