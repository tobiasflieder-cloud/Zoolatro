#!/usr/bin/env python3
"""Baut das Spiel aus quelltext/src.

  python3 quelltext/mache.py          -> build/zoodeck.html (für Tests) + index.html (GitHub Pages)
                                         + sw.js-Cache passend zu VERSION
  python3 quelltext/mache.py --app    -> zusätzlich build/app-index.html (für zoolatro-app/www/index.html)

Quelle der Wahrheit sind die Module in quelltext/src. index.html nie von Hand ändern.
"""
import os,re,sys
Q=os.path.dirname(os.path.abspath(__file__));ROOT=os.path.dirname(Q);SRC=os.path.join(Q,'src');H=os.path.join(Q,'huelle')
rd=lambda p:open(p,encoding='utf8').read()
def wr(p,s):
    os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'w',encoding='utf8').write(s)
fs=sorted(os.listdir(SRC));js=[f for f in fs if f.endswith('.js')]
game=rd(os.path.join(SRC,'00-seite-und-stil.html'))+''.join(rd(os.path.join(SRC,f)) for f in js)+rd(os.path.join(SRC,'99-ende.html'))
m=re.search(r"const VERSION='([^']+)'",game)
if not m:sys.exit('VERSION nicht gefunden')
ver=m.group(1)
wr(os.path.join(ROOT,'build','zoodeck.html'),game)
wr(os.path.join(ROOT,'index.html'),rd(os.path.join(H,'web-vorne.html'))+game+rd(os.path.join(H,'web-hinten.html')))
sw=os.path.join(ROOT,'sw.js');s=rd(sw);s2=re.sub(r"const CACHE='zoolatro-v[^']*'","const CACHE='zoolatro-v"+ver.replace('.','')+"'",s)
if s2!=s:wr(sw,s2)
if '--app' in sys.argv:
    wr(os.path.join(ROOT,'build','app-index.html'),rd(os.path.join(H,'app-vorne.html'))+game+rd(os.path.join(H,'app-hinten.html')))
print('Version',ver,'| build/zoodeck.html, index.html, sw.js'+(' , build/app-index.html' if '--app' in sys.argv else ''))
