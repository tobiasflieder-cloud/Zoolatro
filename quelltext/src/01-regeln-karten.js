//@@ modul: 01-regeln-karten
//ENGINE-START
let VERTAP={n:0,t:0};
const VERSION='0.75a';
// 0.66a Neuigkeiten: gleiche Texte wie CHANGELOG.md (nur die letzten Versionen). Bei jedem Bauen oben ergänzen.
const CHANGES=[
 {v:'0.75a',d:'09.11.2026',t:'Glanz, Legendär, Einblendungen',i:['✨ Seltenheit zeigt sich jetzt als Glanz: Seltene Karten glänzen ab und zu silbern, legendäre öfter und farbig. Die farbige Ecke mit den Sternen ist weg, die Kostenpunkte sitzen wieder an ihrem Platz.','👥 Spezialisten: Stufe Selten glänzt wie seltene Karten, Stufe Legendär wie legendäre. Der Glanz springt beim Antippen nicht mehr und läuft gleichmäßig weiter.','🏷️ „Sehr selten“ heißt jetzt „Legendär“.','📜 Die Auflage wird zu Beginn jedes Zoos groß eingeblendet, danach der Besucherwunsch.','🎁 Überraschungsfutter zeigt die beschenkte Karte groß, mit ihrer neuen Prägung.','🏟️ Die Tribüne ist jetzt legendär: Sie kommt seltener und kostet im Shop 20 statt 15 Taler.']},
 {v:'0.74a',d:'09.11.2026',t:'Querformat repariert',i:['🖥️ Querformat: „Los geht’s“ in der Zoo-Übersicht und „▶ Weiterspielen“ im Menü reagieren wieder (am Rechner und auf Tablets im Querformat).','💡 Tipps warten jetzt, bis ein Fenster geschlossen ist, und verdecken keine Knöpfe mehr. Nur der Winter-Tipp erscheint bei der Winter-Wahl, ganz oben.','⬇️ Die Knöpfe unten in langen Fenstern (zum Beispiel „Schließen“ im Deck oder „Weiter zum …“ im Shop) bleiben immer sichtbar.','🧰 Im Hintergrund: Karten, Texte, Spezialisten, Tutorial und alle anderen Inhalte liegen jetzt als eigene Daten-Dateien vor. Am Spiel ändert sich dadurch nichts.']},
 {v:'0.73a',d:'08.11.2026',t:'Aufgeräumt',i:['🧹 Aufgeräumt: Die alten Modi „Freies Spiel“ und „Zoolatro-Modus“ (Zoolatro 1) sind entfernt, ebenso die längst abgeschalteten Zoo-Profile und alte Tutorial-Teile. Angefangene Läufe dieser alten Modi werden verworfen, Ihre Verbesserungen und Freischaltungen bleiben.','Am Spiel selbst ändert sich nichts: Zoolatro und das Tutorial spielen sich genau wie vorher.']}];
let NEWSPEND=0;
function showNews(){let o=document.getElementById('newsOv');if(o)o.remove();o=document.createElement('div');o.id='newsOv';o.className='newsov';
  o.innerHTML=`<div class="newsbox"><h2>📜 Neu in Zoolatro ${VERSION}</h2>${CHANGES.map((c,j)=>`<div class="newsv${j?' old':''}"><h3>${c.v} · ${c.t}<small>${c.d}</small></h3><ul>${c.i.map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('')}<button class="btn main big" id="newsOk">Los geht’s</button></div>`;
  document.body.appendChild(o);o.querySelector('#newsOk').onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove()}}
let DAYS=5,TUTNOW=false;const HAND=5,BP=4,MAXPROGS=4,MAXLVL=3,OFFER=2,MINDECK=14,MINSKIP=5;
const ROMAN=['','I','II','III'];
const SEASONS=[{name:'Frühling',target:9500},{name:'Sommer',target:51000},{name:'Herbst',target:118000},{name:'Winter',target:267000,winter:true}]; // 0.91: per Bot neu gemessen (5 Tage, kleineres Gelände, ohne Profile/Förderprogramme)
const EARLY_BONUS=5,EARLYG={gsack:['🧺','Futtersack'],gumb:['🧰','Umbau-Kiste'],gprofi:['💼','Profi-Mappe']};
// 0.66a Früh geschafft: je übrigem Tag +1 Baupunkt in der nächsten Jahreszeit (run.bpCarry, je Tag 1) + Geschenk ab 2/3/4 Tagen (run.gifts, im nächsten Shop gratis)
function earlyReward(left){const r=runOf();if(!r||left<=0)return'';r.bpCarry=(r.bpCarry||0)+left;const ER=state.earlyR={left,bp:left,gift:null,gtal:0};let g=r.tut?null:left>=4?'gprofi':left>=3?'gumb':left>=2?'gsack':null,t=` · ⚡ <b>+${left} Baupunkt${left>1?'e':''}</b> in der nächsten Jahreszeit (je Tag 1)`;
  if(g==='gsack'&&!foodOnRun(r)){state.money+=20;state.stats.earned+=20;ER.gtal=20;t+=' · 🎁 <b>+🪙 20</b>'}else if(g){ER.gift=g;r.gifts=(r.gifts||[]).concat(g);t+=` · 🎁 <b>Gratis ${EARLYG[g][0]} ${EARLYG[g][1]}</b> im nächsten Shop`}return t}
 // Taler je übrigem Tag, wenn das Saisonziel früh erreicht ist
const DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
const hk=(q,r)=>q+','+r;
let BOARD=[],ONBOARD=new Set();
function setBoard(cells){BOARD=cells.map(c=>c.slice());ONBOARD=new Set(BOARD.map(([q,r])=>hk(q,r)))}
const hexDisc=(R,cq=0,cr=0)=>{const o=[];for(let q=-R;q<=R;q++)for(let r=-R;r<=R;r++)if(Math.abs(q+r)<=R)o.push([q+cq,r+cr]);return o};
setBoard(hexDisc(5));
const SHAPES={
  s1:{cells:[[0,0]],label:'1 Feld'},
  s2:{cells:[[0,0],[1,0]],label:'2 Felder'},
  l3:{cells:[[-1,0],[0,0],[1,0]],label:'3er-Reihe'},
  t3:{cells:[[0,0],[1,0],[0,1]],label:'Dreieck'},
  b3:{cells:[[-1,0],[0,0],[0,1]],label:'Bogen'},
  l4:{cells:[[-1,0],[0,0],[1,0],[2,0]],label:'4er-Reihe'},
  d4:{cells:[[0,0],[1,0],[0,1],[1,1]],label:'Raute'},
  z4:{cells:[[-1,0],[0,0],[0,1],[1,1]],label:'Zickzack'},
};
function rotCells(cells,rot){let c=cells.map(x=>x.slice());for(let i=0;i<((rot%6)+6)%6;i++)c=c.map(([q,r])=>[-r,q+r]);return c}
function placeCells(key,rot,q,r){return rotCells(SHAPES[CARDS[key].shape].cells,rot).map(([a,b])=>[a+q,b+r])}
const costParts=key=>{const cl=SHAPES[CARDS[key].shape].cells.length,C=CARDS[key],dk=typeof dkNow==='function'?dkNow():'',n=Math.max(1,cl-(C.cat==='gehege'&&cl>=4?1:0)-(dk==='freizeit'&&C.cat==='attr'?1:0)-(dk==='steppe'&&C.cat==='gehege'&&cl===4?1:0)+(dk==='steppe'&&C.cat==='gehege'&&cl===1?1:0)+(dk==='dschungel'&&C.cat==='attr'?1:0)),x=[];if(cl===1&&hasSpec('polier')&&typeof state!=='undefined'&&state&&state.day===0)x.push(['🧱','Polier']);if(taxed(key))x.push(['💸','Teuerung']);return{n,x}};
const costOf=key=>{if(typeof umbBm==='function'&&umbBm()&&CARDS[key]&&CARDS[key].cat!=='verst')return 0;const p=costParts(key);if(p.n===1&&hasSpec('rb_leicht')&&CARDS[key].cat!=='verst'&&typeof state!=='undefined'&&state&&(state.free1||0)<2)return 0;return Math.max(1,p.n+p.x.length-(CARDS[key].pr==='leicht'?1:0))};
const costTxt=key=>{const p=costParts(key);return`${costOf(key)} BP${CARDS[key].pr==='leicht'?' (🪶 −1)':''}${p.x.length?` <b class="cx">(${p.x.map(e=>e[0]+' '+e[1]+': +1').join(' · ')})</b>`:''}`};
const costDots=key=>{const p=costParts(key);return'<i></i>'.repeat(p.n)+'<i class="x"></i>'.repeat(p.x.length)+(p.x.length?`<em>${p.x.map(e=>e[0]).join('')}</em>`:'')};
const taxed=key=>!!(typeof state!=='undefined'&&state&&state.zl&&CTX.zl&&CTX.zl.tax&&(CARDS[key].hab||CARDS[key].cat)===CTX.zl.tax);

const CAT={gehege:{label:'Gehege',col:'var(--c-gehege)'},attr:{label:'Attraktion',col:'var(--c-attr)'},
  essen:{label:'Gastro & Shops',col:'var(--c-essen)'},schutz:{label:'Naturschutz',col:'var(--c-schutz)'},verst:{label:'Verstärker',col:'var(--c-verst)'}};
const HAB={wasser:{label:'Wasser',icon:'💧',col:'var(--h-wasser)',terr:'Wasser'},savanne:{label:'Savanne',icon:'🌾',col:'var(--h-savanne)',terr:'Savanne'},
  wald:{label:'Dschungel',icon:'🌿',col:'var(--h-wald)',terr:'Dschungel'},wueste:{label:'Wüste',icon:'🏜️',col:'var(--h-wueste)',terr:'Wüste'},
  arktis:{label:'Arktis',icon:'🧊',col:'var(--h-arktis)',terr:'Arktis'},gebirge:{label:'Gebirge',icon:'⛰️',col:'var(--h-gebirge)',terr:'Gebirge'}};
const DEFHABS=['wasser','savanne','wald','wueste'],NEWHABS=['arktis','gebirge'];let GENHABS=null;
// Lebensräume: im Spiel aus CTX, zwischen den Zoos (kein state) aus dem gespeicherten Lauf, sonst Standard
const habsNow=()=>{const live=typeof state!=='undefined'&&state&&typeof CTX!=='undefined'&&CTX&&CTX.habs;if(live)return CTX.habs;try{const sl=activeSlot();if(sl&&sl.run&&sl.run.habs)return sl.run.habs}catch(e){}return(typeof CTX!=='undefined'&&CTX&&CTX.habs)||DEFHABS};
// Felsen und Rand für Gebirgs-Karten
const rocksR2=b=>{if(!b)return 0;const own=new Set(b.cells.map(([q,r])=>hk(q,r))),seen=new Set();for(const[q,r]of b.cells)for(let dq=-2;dq<=2;dq++)for(let dr=-2;dr<=2;dr++){if(Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr)>4)continue;const k=hk(q+dq,r+dr);if(!own.has(k)&&TERR.get(k)==='block')seen.add(k)}return seen.size};
const rocksNb=b=>{const own=new Set(b.cells.map(([q,r])=>hk(q,r))),seen=new Set();for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr);if(!own.has(k)&&TERR.get(k)==='block')seen.add(k)}return seen.size};
const edgeN=b=>cnt(b.cells,([q,r])=>isEdge(q,r));
const RARW={gewöhnlich:10,selten:5,'sehr selten':2,winter:0,saison:0,meilenstein:0,signatur:0,spezial:0};
const SEANAME=['Frühling','Sommer','Herbst','Winter'];
let CTX={winter:false,season:0,progs:[],ads:[],ev:[],boni:{},spec:[]};
// Streik: ist die Kasse im Minus, arbeiten die Spezialisten nicht (der Spekulant kostet trotzdem)
const strike=()=>!!(CTX.strike&&CTX.strike());
// Hinweis, wenn die Kasse ins Minus rutscht (beim allerersten Mal als Fenster) oder wieder auf 0 steigt
function strikeNote(before){if(!state||state.mode==='tut')return;const was=before<0,now=state.money<0;if(was===now)return;const team=(state.spec||[]).length>0;
  if(now&&!META.strikeSeen){META.strikeSeen=1;saveMeta();modal='strike';return}if(!team)return;
  state.msg=now?{title:'🪧 Dein Team streikt',text:'Die Kasse ist im Minus. Deine Spezialisten wirken nicht, bis du wieder bei 0 Talern bist.'}:{title:'✅ Dein Team arbeitet wieder',text:'Die Kasse ist wieder im Plus, deine Spezialisten wirken wieder.'};const m=state.msg;setTimeout(()=>{if(state&&state.msg===m){state.msg=null;render()}},4000)}
const derive=(p,o)=>{const n=Object.create(p);for(const k in o)Object.defineProperty(n,k,{value:o[k],writable:true,enumerable:true,configurable:true});return n};
const baseK=k=>(CARDS[k]&&CARDS[k].base)||k;
const hasSpec=id=>(CTX.spec||[]).includes(id)&&!strike();
const sea=i=>CTX.season===i;
// 0.94: Umbau „Lebensraum ändern“/„Alles neu“: b.hab überschreibt den Lebensraum der Karte
const HABC=new Map(),K=n=>{const c=CARDS[n.key];if(!n.hab||!c||c.hab===n.hab)return c;const k=n.key+'@'+n.hab;let x=HABC.get(k);if(!x){x={...c,hab:n.hab};HABC.set(k,x)}return x};
const has=(n,t)=>(K(n).tags||[]).includes(t);
const isCat=(n,c)=>K(n).cat===c;
const isHab=(n,h)=>K(n).hab===h;
const cnt=(arr,f)=>arr.filter(f).length;
const essenMalus=nb=>0; // Gastro-Gebäude stören nur scheue Tiere
const cold=h=>h==='savanne'||h==='wueste',hot=h=>h==='arktis'||h==='gebirge';

// ===== Godot-Vorbereitung 2a: Kartendaten stehen in daten/karten.json, Merkmale in daten/merkmale.json (von mache.py eingebaut).
// Wirkungen, die Code sind, bleiben hier: die Karte nennt in bonus/km/mult/tal eine Kennung aus KARTEN_WIRKUNG (= Kartenschlüssel).
const KARTEN_DATEN=/*@@DATEN:karten@@*/null,MERKMALE_DATEN=/*@@DATEN:merkmale@@*/null;
const KARTEN_WIRKUNG=(()=>{const W=(nb,h)=>cnt(nb,n=>isCat(n,'gehege')&&isHab(n,h)),S=nb=>cnt(nb,n=>isCat(n,'schutz')),E=nb=>cnt(nb,n=>isCat(n,'essen')),G=nb=>cnt(nb,n=>isCat(n,'gehege'));
  const bonus={},km={},mult={},tal={};
  // Kartenbonus (Nachbarn)
  bonus.nilpferde=nb=>({s:2*cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'wasser'))});
  bonus.hafen=()=>({});
  bonus.gnu=nb=>({a:W(nb,'savanne'),s:W(nb,'savanne')});
  bonus.regenkuppel=nb=>({s:2*cnt(nb,n=>has(n,'scheu'))});
  bonus.achterbahn=(nb,bs,b)=>({a:cnt(bs||[],n=>n!==b&&isCat(n,'attr'))});
  bonus.foodcourt=nb=>({a:2*cnt(nb,n=>isCat(n,'essen'))});
  bonus.eisgrotte=()=>CTX.winter?{a:6,s:6}:{a:0,s:0};
  bonus.adlerhorst=(nb,bs,b)=>({a:rocksR2(b)});
  bonus.delfinshow=nb=>({a:W(nb,'wasser')});
  bonus.turm=nb=>({a:4*cnt(nb,n=>has(n,'gross')&&isCat(n,'gehege'))});
  bonus.streichelzoo=nb=>({a:2*cnt(nb,n=>isCat(n,'essen'))});
  bonus.spielplatz=nb=>({a:2*cnt(nb,n=>isCat(n,'essen')||n.key==='streichelzoo')});
  bonus.zoobahn=nb=>({a:cnt(nb,n=>isCat(n,'gehege'))});
  bonus.tropenhaus=nb=>({s:cnt(nb,n=>isCat(n,'gehege'))*(CTX.winter?2:1)});
  bonus.glashaus=nb=>({a:(CTX.winter?3:1)*cnt(nb,n=>cold(K(n).hab))});
  bonus.popcorn=nb=>({a:(nb.some(n=>n.key==='delfinshow'||n.key==='streichelzoo')?5:0)+2*cnt(nb,n=>isCat(n,'attr')&&n.key!=='delfinshow'&&n.key!=='streichelzoo')});
  bonus.eiswagen=nb=>({a:(sea(1)?3:1)*G(nb)});
  bonus.getraenke=nb=>({a:nb.length,s:essenMalus(nb)});
  bonus.crepes=nb=>({a:2*cnt(nb,n=>isCat(n,'attr')),s:essenMalus(nb)});
  bonus.bistro=nb=>({a:2*W(nb,'savanne')});
  bonus.souvenir=nb=>({a:cnt(nb,n=>isCat(n,'attr')),s:essenMalus(nb)});
  bonus.weihnachtsmarkt=()=>({a:CTX.winter?5:0});
  bonus.gruen=nb=>({s:G(nb)});
  bonus.infozentrum=nb=>({s:2*cnt(nb,n=>isCat(n,'attr'))});
  bonus.tierarzt=nb=>({s:cnt(nb,n=>isCat(n,'gehege'))});
  bonus.zucht=nb=>({s:nb.filter(n=>has(n,'bedroht')).reduce((t,n)=>t+K(n).s,0)});
  bonus.vielfalt=(nb,all)=>({s:new Set(all.filter(n=>isCat(n,'gehege')).map(n=>spK(n.key))).size});
  bonus.labor=(nb,all)=>({s:cnt(all,n=>isCat(n,'gehege'))});
  bonus.gorillas=nb=>({s:cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'wald'))});
  bonus.eisbaeren=()=>({a:CTX.winter?2:0});
  bonus.aquarium=nb=>({a:2*cnt(nb,n=>isHab(n,'wasser'))});
  bonus.biergarten=nb=>({a:E(nb)+(sea(1)?3:0)});
  bonus.schmetterling=(nb,all,b)=>{const own=new Set(b.cells.map(c=>hk(...c))),seen=new Set();for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr),t=TERR.get(k);if(t&&t!=='block'&&!own.has(k))seen.add(k)}return{s:seen.size}};
  bonus.bueffel=nb=>({a:cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'savanne'))});
  bonus.karussell=nb=>({a:cnt(nb,n=>isCat(n,'attr')||isCat(n,'essen'))});
  bonus.arena=nb=>({a:cnt(nb,n=>isCat(n,'gehege')),s:0});
  bonus.bienen=nb=>({s:2*cnt(nb,n=>isCat(n,'schutz')&&n.key!=='bienen')});
  bonus.pizzeria=nb=>({a:2*cnt(nb,n=>isCat(n,'attr'))+2*cnt(nb,n=>isCat(n,'essen')&&n.key!=='pizzeria')});
  bonus.blumenschau=nb=>({a:sea(0)?3:0,s:cnt(nb,n=>n.key==='gruen')});
  bonus.wasserspiel=()=>({a:sea(1)?4:0});
  bonus.kuerbisfest=nb=>({a:sea(2)?5+2*E(nb):0});
  bonus.eisbahn=()=>({a:CTX.winter?5:0});
  bonus.orca=(nb,all,b)=>({a:2*cnt(all||[],n=>n!==b&&isCat(n,'gehege')&&isHab(n,'wasser'))});
  bonus.grossesavanne=(nb,all,b)=>{const n=others(all,b,x=>isHab(x,'savanne'));return{a:n,s:n}};
  bonus.orangutan=(nb,all,b)=>({s:2*others(all,b,n=>isHab(n,'wald'))});
  bonus.greifvogel=(nb,all,b)=>({a:2*others(all,b,n=>isHab(n,'wueste'))});
  bonus.kraken=nb=>({s:cnt(nb,n=>isCat(n,'schutz'))?2:0});
  bonus.rentiere=nb=>({a:CTX.winter?2:0,s:W(nb,'arktis')});
  bonus.polarlicht=(nb,all,b)=>({a:2*others(all,b,n=>isHab(n,'arktis'))});
  bonus.braunbaeren=nb=>({s:2*W(nb,'wald')});
  bonus.seilbahn=(nb,all)=>({a:2*cnt(nb,n=>isHab(n,'gebirge'))+cnt(all||[],n=>isCat(n,'gehege')&&isHab(n,'gebirge'))});
  bonus.gipfel=(nb,all,b)=>({a:2*others(all,b,n=>isHab(n,'gebirge'))});
  bonus.weltzoo=nb=>{const k=new Set(nb.map(n=>K(n).cat).filter(c=>CATS4.includes(c))).size;return{a:k,s:k}};
  bonus.lehrpfad=nb=>({a:2*cnt(nb,n=>isCat(n,'schutz'))});
  bonus.besucherzentrum=nb=>({a:Math.min(8,2*new Set(nb.map(n=>K(n).cat).filter(c=>CATS4.includes(c))).size)});
  bonus.abenteuer=(nb,all,b)=>({a:2*others(all,b,n=>isCat(n,'attr'))});
  bonus.restaurant=(nb,all,b)=>({a:2*others(all,b,n=>isCat(n,'essen'))});
  bonus.ausstellung=(nb,all,b)=>({s:2*others(all,b,n=>isCat(n,'schutz'))});
  // Kombo-Faktor am Ende der Wertung
  km.nilpferde=nb=>W(nb,'wasser')>=3?{f:1.5,l:'3 Wasser-Gehege daneben'}:null;
  km.hafen=nb=>W(nb,'wasser')>=3?{f:1.5,l:'3 Wasser-Gehege daneben'}:null;
  km.tiger=(nb,bs,b,o)=>!nbrs2(b,o.idx).some(n=>has(n,'beute'))?{fa:1.5,l:'Revier ohne Beute in der Nähe'}:null;
  km.nashoerner=(nb,bs,b,o)=>!o.st&&W(nb,'savanne')>=2?{f:2,l:'ohne Stress, 2 Savannen-Gehege daneben'}:null;
  km.weihnachtsmarkt=nb=>CTX.winter&&E(nb)>=2?{f:1.5,l:'Winter, 2 Gastro-Gebäude daneben'}:null;
  km.zucht=nb=>cnt(nb,n=>isCat(n,'gehege')&&has(n,'bedroht'))>=2?{f:1.5,l:'2 bedrohte Gehege daneben'}:null;
  km.vielfalt=()=>typeof state!=='undefined'&&state&&(state.miles||{}).bunt?{fs:2,l:'Meilenstein 🎨 Vielfalt'}:null;
  km.gorillas=nb=>S(nb)?{f:1.5,l:'Naturschutz daneben'}:null;
  km.koalas=(nb,bs,b,o)=>!o.st?{f:2,l:'nicht gestresst'}:null;
  km.eisbaeren=nb=>CTX.winter&&cnt(nb,n=>isCat(n,'attr'))&&E(nb)?{f:1.5,l:'Winter mit Attraktion und Gastro daneben'}:null;
  km.krokodile=nb=>E(nb)>=2?{f:1.5,l:'2 Gastro-Gebäude daneben'}:null;
  km.kaengurus=nb=>cnt(nb,n=>isCat(n,'gehege')&&!isHab(n,'wueste'))>=3?{f:1.5,l:'3 andere Gehege daneben'}:null;
  km.biergarten=nb=>E(nb)>=3?{f:1.5,l:'3 Gastro-Gebäude daneben'}:null;
  km.schmetterling=(nb,bs,b)=>{const own=new Set(b.cells.map(c=>hk(...c))),seen=new Set();for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr),t=TERR.get(k);if(t&&t!=='block'&&!own.has(k))seen.add(k)}return seen.size>=4?{f:1.5,l:'4 Naturflächen-Felder daneben'}:null};
  km.bueffel=nb=>W(nb,'savanne')>=3?{f:1.5,l:'3 Savannen-Gehege daneben'}:null;
  km.kraken=nb=>W(nb,'wasser')>=2?{f:1.5,l:'2 Wasser-Gehege daneben'}:null;
  km.dingos=(nb,bs,b,o)=>nbrs2(b,o.idx).some(n=>has(n,'beute'))?{f:1.5,l:'Beutetier in der Nähe'}:null;
  km.rotepandas=(nb,bs,b,o)=>!o.st?{f:1.5,l:'nicht gestresst'}:null;
  // Multiplikator für den ganzen Zoo
  mult.nachtfuehrung=(nb,all)=>cnt(all,n=>isCat(n,'gehege'))>=4?{ma:cnt(all,n=>isCat(n,'gehege')&&has(n,'scheu'))>=4?1.5:1.3}:null;
  mult.stiftung=all=>({ms:+Math.min(1.8,1.3+.1*new Set((Array.isArray(all)?all:[]).filter(n=>isCat(n,'gehege')&&has(n,'bedroht')).map(n=>spK(n.key))).size).toFixed(2)});
  // Taler je Tag
  tal.eiswagen=nb=>(sea(1)?3:1)*G(nb);
  tal.bistro=nb=>2*W(nb,'savanne');
  tal.weihnachtsmarkt=()=>CTX.winter?2:0;
  tal.biergarten=nb=>E(nb);
  tal.kuerbisfest=()=>sea(2)?2:0;
  // Gastro: B und Taler aus derselben Rechnung
  const gt=(k,f)=>{bonus[k]=nb=>({a:f(nb)});tal[k]=nb=>f(nb)};
  gt('beduinen',nb=>W(nb,'wueste'));gt('bratwurst',nb=>W(nb,'savanne'));gt('picknick',nb=>E(nb));gt('cafe',nb=>S(nb));gt('berghuette',nb=>W(nb,'gebirge'));gt('teestube',nb=>W(nb,'arktis'));
  // Naturschutz: +2 N je benachbartes Gehege eines Lebensraums
  for(const[k,h]of[['baumschule','wald'],['oase','wueste'],['wasserfall','wasser'],['wasserloch','savanne'],['bergwacht','gebirge'],['polarstation','arktis']])bonus[k]=nb=>({s:2*W(nb,h)});
  return{bonus,km,mult,tal}})();
const CARDS={};for(const d of KARTEN_DATEN.karten){const c={};for(const p in d){if(p==='key')continue;const v=d[p];c[p]=Array.isArray(v)?v.slice():v;if((p==='bonus'||p==='km'||p==='mult'||p==='tal')&&typeof v==='string'){c[p]=KARTEN_WIRKUNG[p][v];if(!c[p])throw new Error('Wirkung fehlt: '+p+' '+v)}}CARDS[d.key]=c}
const spK=k=>(CARDS[k]&&CARDS[k].par)||String(k).split(/[#^]/)[0]; // 0.64a: Futter/Prägung ändern die Art nicht // Jungtier zählt als seine Elternart
const others=(all,b,f)=>new Set(all.filter(n=>n!==b&&spK(n.key)!==spK(b.key)&&!K(n).ms&&f(n)).map(n=>spK(n.key))).size; // verschiedene andere Arten
const tribOk=b=>{try{const idx=mkIndex(state.buildings),own=new Set(b.cells.map(c=>hk(...c)));for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr);if(own.has(k))continue;const n=idx.get(k);if(!n||!isCat(n,'gehege'))return false}return true}catch(e){return false}};
// Taler aus Gastro-Gebäuden je Tag
const talOf=bs=>{let t=0;try{const ix=mkIndex(bs);for(const b of bs){const c=K(b);if(c&&c.tal)t+=Math.max(0,c.tal(nbrs(b,ix),bs,b)||0)}}catch(e){}return t};
const MILE={wasser:{card:'orca',n:6,label:'Wasser-Gehege',icon:'💧',f:c=>c.hab==='wasser'},savanne:{card:'grossesavanne',n:6,label:'Savannen-Gehege',icon:'🌾',f:c=>c.hab==='savanne'},
  wald:{card:'orangutan',n:6,label:'Dschungel-Gehege',icon:'🌿',f:c=>c.hab==='wald'},wueste:{card:'greifvogel',n:6,label:'Wüsten-Gehege',icon:'🏜️',f:c=>c.hab==='wueste'},
  attr:{card:'abenteuer',n:6,label:'Attraktionen',icon:'🎡',f:c=>c.cat==='attr'},essen:{card:'restaurant',n:6,label:'Gastro-Gebäude',icon:'🍿',f:c=>c.cat==='essen'},schutz:{card:'ausstellung',n:7,label:'Naturschutz-Gebäude',icon:'🌳',f:c=>c.cat==='schutz'}};
MILE.bunt={card:'weltzoo',n:4,label:'Arten je Kategorie',icon:'🎨',f:()=>false};MILE.arktis={card:'polarlicht',n:6,label:'Arktis-Gehege',icon:'🧊',f:c=>c.hab==='arktis'};MILE.gebirge={card:'gipfel',n:6,label:'Gebirgs-Gehege',icon:'⛰️',f:c=>c.hab==='gebirge'};
const mileKeys=()=>Object.keys(MILE).filter(t=>!HAB[t]||habsNow().includes(t));
const CATS4=['gehege','attr','essen','schutz'],mileCount=(bs,t)=>mileCount0(bs,t)+(bs.some(b=>b.key==='fstation')?1:0)+(t==='essen'&&bs.some(b=>b.key==='foodcourt')?1:0),mileCount0=(bs,t)=>t==='bunt'?Math.min(...CATS4.map(cat=>new Set(bs.filter(b=>!CARDS[b.key].ms&&CARDS[b.key].cat===cat).map(b=>spK(b.key))).size)):new Set(bs.filter(b=>!CARDS[b.key].ms&&MILE[t].f(CARDS[b.key])).map(b=>spK(b.key))).size; // nur verschiedene Arten zählen
for(const k in CARDS){CARDS[k].a0=CARDS[k].a;CARDS[k].s0=CARDS[k].s}
// Progression: dauerhafte Kartenverbesserungen eines Speicherplatzes
const MAXPERK=3;let PERKS={},UNLOCK=new Set();
const habOff=k=>{const c=CARDS[k],h=c.hab||c.rq;return!!h&&!habsNow().includes(h)};
// Forscher-Deck: Meilensteine brauchen 1 Art weniger
for(const t in MILE){const M=MILE[t],b0=M.n;Object.defineProperty(M,'n',{get:()=>{const b1=!TUTNOW&&(t==='attr'||t==='essen')?b0+1:b0;try{return b1-(dkNow()==='forscher'?1:0)}catch(e){return b1}},configurable:true})}
const VCOND={futterkueche:'Zoo 2 schaffen',besucherlotse:'Zoo 4 schaffen',winterquartier:'100 Arktis-Gehege bauen (über alle Läufe)',scheinwerfer:'Reinheit mit 7 Arten in einem Zoo',buehne:'5 Showtiere mit vollem Show-Bonus (je 2 Gastro-Gebäude oder Attraktionen daneben) in einem Zoo',ruhezone:'6 scheue Tiere ganz ohne Stress in einem Zoo'};
const verstOn=k=>{if(typeof META!=='undefined'&&META.testVerst)return true;try{const sl=activeSlot();return!!sl&&(sl.vu||{})[k]===1}catch(e){return false}};
const isLocked=k=>!!CARDS[k].gone||!!CARDS[k].sig||(!!CARDS[k].bonus_&&!UNLOCK.has(k))||habOff(k)||fsLocked(k)||(CARDS[k].cat==='verst'&&!verstOn(baseK(k)));
function applySlot(sl){applyPerks(sl&&sl.perks);UNLOCK=new Set(sl&&sl.unlocked||[])}
function applyPerks(p){PERKS=p||{};for(const k in CARDS){const q=PERKS[k]||{};CARDS[k].a=CARDS[k].a0+(q.a||0);CARDS[k].s=CARDS[k].s0+(q.s||0)}}
const perkN=k=>{const q=PERKS[k];return q?(q.a||0)+(q.s||0):0};
// Tier-Eigenschaften
const TRAITS=Object.fromEntries(Object.entries(MERKMALE_DATEN.merkmale).map(([t,m])=>[t,m.karten.slice()]));
const TRAITNAME=Object.fromEntries(Object.entries(MERKMALE_DATEN.merkmale).map(([t,m])=>[t,m.name]));
const ruhigC=c=>!!c&&((CARDS[baseK(c.key)]||c).tags||[]).includes('ruhig'),trubelC=c=>!!c&&((CARDS[baseK(c.key)]||c).tags||[]).includes('trubel');
const rarLabel=c=>c.rar==='winter'?'nur im Winter':c.rar==='saison'?'nur im '+SEANAME[c.only]:c.rar==='meilenstein'?'Meilenstein':c.rar==='sehr selten'?'Legendär':c.rar; // 0.75a: „sehr selten“ heißt für Spieler „Legendär“ (intern bleibt rar:'sehr selten')
const traitOf=c=>['raubtier','scheu','show','beute'].find(t=>c.tags.includes(t));
const TRAITIC=Object.fromEntries(Object.entries(MERKMALE_DATEN.merkmale).map(([t,m])=>[t,m.icon])),traitsOf=c=>(typeof TUTNOW!=='undefined'&&TUTNOW&&!TUTTR)?[]:['raubtier','beute','scheu','show','ruhig','trubel'].filter(t=>(c.tags||[]).includes(t));
let TUTTR=false; // 0.67a: Merkmale im Tutorial (Zoo 1) aus
// Kurzzeile auf Karten: Lebensraum nur als farbiges Sechseck, dahinter alle Eigenschaften (ab 3 als Symbole)
// 0.63a: Lebensräume, mit denen ein Gebäude (kein Gehege) laut Kartentext zusammenwirkt
const HABRX={wasser:/Wasser/,savanne:/Savanne/,wald:/Dschungel/,wueste:/Wüste/,arktis:/Arktis/,gebirge:/Gebirg/};
const bldHabs=c=>{if(!c||c.cat==='gehege')return[];const t=(fxOwn(c).fx||[]).join(' ');return Object.keys(HABRX).filter(h=>HABRX[h].test(t)||c.rq===h)};
const habIcs=c=>bldHabs(c).map(h=>HAB[h].icon).join('');
// 0.64a Kategorie-Punkt: Bonus hängt laut eigenem Kartentext von Naturschutz (lila) / Gastro (gelb) / Attraktionen (rosa) ab; Showtier-Zeilen zählen nicht (eigene Merkmal-Zeile)
const CATDOT=[['schutz',/Naturschutz/],['essen',/Gastro/],['attr',/Attraktion/]];
const catDots=c=>{if(!c)return[];let t='';try{t=(fxOwn(c).fx||[]).filter(l=>!/🎭/.test(l)).join(' ')}catch(e){}return CATDOT.filter(([k,rx])=>rx.test(t)).map(([k])=>k)};
const catDotHtml=(c,cls)=>{const D=catDots(c);return D.length?`<span class="${cls||'cdots'}" title="Bonus mit ${D.map(k=>CAT[k].label).join(' / ')}">${D.map(k=>`<i style="background:${CAT[k].col}"></i>`).join('')}</span>`:''};
function metaTxt(c,full){if(!c.hab)return CAT[c.cat].label;const t=traitsOf(c),hb=habBadge(c.hab)+' ';if(!t.length)return hb+HAB[c.hab].label+(full?'-Gehege':'');return hb+(t.length>2?t.map(x=>`<span title="${TRAITNAME[x]}">${TRAITIC[x]}</span>`).join(''):t.map(x=>TRAITNAME[x]).join(' · '))}
// Kartentexte als Aufzählung: "Wert|Beschreibung"
const MAL='−1 N|je benachbartes scheues Gehege';
for(const k in CARDS){const c=CARDS[k];c.key=k;c.fx=[]}
const START_DECK=['korallenriff','flamingos','affen','papageien','reptilien','kamele','zebras','giraffen','delfinshow','turm','streichelzoo','popcorn','cafe','gruen','infozentrum','gruen']; // 16 Karten: je Lebensraum zwei Tiere, gemischte Größen, keine doppelten Tiere

// ===== Godot-Vorbereitung 2c: Förderprogramme (daten/foerderprogramme.json), Werbung (daten/werbung.json), Ereignisse (daten/ereignisse.json).
// Wirkungen, die Code sind, bleiben hier und werden über eine Kennung (= Schlüssel) angesprochen. Namen und Texte stehen in daten/texte_de.json.
const PROG_DATEN=/*@@DATEN:foerderprogramme@@*/null,WERBUNG_DATEN=/*@@DATEN:werbung@@*/null,EREIGNIS_DATEN=/*@@DATEN:ereignisse@@*/null;
const PROG_WIRKUNG={per:{
  pate_savanne:(b,c)=>c.hab==='savanne'?{pa:.2,ps:.2}:null,
  pate_wasser:(b,c)=>c.hab==='wasser'?{pa:.2,ps:.2}:null,
  pate_wald:(b,c)=>c.hab==='wald'?{pa:.2,ps:.2}:null,
  pate_wueste:(b,c)=>c.hab==='wueste'?{pa:.2,ps:.2}:null,
  pate_arktis:(b,c)=>c.hab==='arktis'?{pa:.2,ps:.2}:null,
  pate_gebirge:(b,c)=>c.hab==='gebirge'?{pa:.2,ps:.2}:null,
  eufonds:(b,c)=>c.tags.includes('bedroht')?{ps:.4}:null,
  imbiss:(b,c)=>c.cat==='essen'?{pa:.4}:null,
  naturbund:(b,c)=>c.hab&&natCells(b.cells,c.hab)?{ps:.15,n:natCells(b.cells,c.hab)}:null,
  familie:(b,c)=>c.cat==='attr'?{pa:.3}:null,
  gross:(b,c)=>c.cat==='gehege'&&c.tags.includes('gross')?{pa:.3}:null,
  klein:(b,c)=>c.cat==='gehege'&&b.cells.length===1?{pa:.25,ps:.25}:null,
  forschung:(b,c)=>c.cat==='schutz'?{ps:.4}:null},
  mult:{
  vielfaltspreis:bs=>new Set(bs.filter(n=>isCat(n,'gehege')).map(n=>spK(n.key))).size>=8?{ms:1.25}:null,
  marketing:()=>({ma:1.2})}};
const WERBUNG_WIRKUNG={per:{
  social:(b,c)=>c.cat==='attr'?{pa:.4}:null,
  foodfest:(b,c)=>c.cat==='essen'?{pa:.5}:null},
  mult:{
  plakat:()=>({ma:1.2}),
  tv:()=>({ma:1.3}),
  schule:()=>({ms:1.2})}};
const EREIGNIS_WIRKUNG={per:{
  hitze:(b,c,k)=>c.hab==='wasser'?{a:-k}:c.hab==='wueste'?{a:1}:null,
  regen:(b,c,k)=>c.cat==='attr'?{a:-k}:c.hab==='wald'?{s:1}:null,
  demo:(b,c,k)=>c.cat==='attr'?{a:-k}:c.tags.includes('bedroht')?{s:1}:null,
  kontrolle:(b,c,k)=>c.cat==='essen'?{a:-k}:null,
  ferien:(b,c)=>c.cat==='essen'||c.cat==='attr'?{a:1}:null,
  schnee:(b,c,k)=>c.cat==='attr'?{a:-k}:c.hab==='wasser'?{a:1}:null,
  frost:(b,c,k)=>c.hab==='savanne'?{s:-k}:null,
  foerder:b=>(b.lvl||1)>1?{s:(b.lvl||1)-1}:null}};
// Doku im Fernsehen: je Lebensraum
for(const h in HAB)EREIGNIS_WIRKUNG.per['doku_'+h]=(b,c)=>c.hab===h?{a:1}:null;
// Daten in Objekte (Wirkungen über Kennung); Ereignis-Texte: {k} = Stärke
const mitWirkung=(liste,W,felder)=>{const o={};for(const d of liste){const x={};for(const p in d){if(p==='key')continue;const v=d[p];x[p]=Array.isArray(v)?v.slice():v&&typeof v==='object'?JSON.parse(JSON.stringify(v)):v;if(felder.includes(p)){x[p]=W[p][v];if(!x[p])throw new Error('Wirkung fehlt: '+p+' '+v)}}o[d.key]=x}return o};
const PROGS=mitWirkung(PROG_DATEN.programme,PROG_WIRKUNG,['per','mult']);
const ADS=mitWirkung(WERBUNG_DATEN.werbung,WERBUNG_WIRKUNG,['per','mult']);
// Saison-Ereignisse: k = Stärke des Nachteils (1 mild, 2 mittel, 3 hart)
const EVENTS=mitWirkung(EREIGNIS_DATEN.ereignisse,EREIGNIS_WIRKUNG,['per']);for(const id in EVENTS){const T=EVENTS[id].fx;EVENTS[id].fx=k=>T.map(t=>t.replace(/\{k\}/g,k))}
const HABADJ={wasser:'Wasser',savanne:'Savannen',wald:'Dschungel',wueste:'Wüsten',arktis:'Arktis',gebirge:'Gebirgs'};
const evFx=e=>EVENTS[e.id].fx(e.k||1);
const evName=e=>e.n||EVENTS[e.id].name,evIcon=e=>e.ic||EVENTS[e.id].icon;
const evGroup=id=>EVENTS[id].doku?'doku':id;
function rollEvents(cfg,rnd=Math.random){const out=[];let pool=Object.keys(EVENTS).filter(id=>(!EVENTS[id].hard||cfg.hard)&&(cfg.s==null||!EVENTS[id].se||EVENTS[id].se.includes(cfg.s)));
  for(let i=0;i<(cfg.n||1)&&pool.length;i++){const groups=[...new Set(pool.map(evGroup))],g=groups[Math.floor(rnd()*groups.length)],c=pool.filter(id=>evGroup(id)===g);
    {const id=c[Math.floor(rnd()*c.length)],al=(EVENTS[id].alt||{})[cfg.s],e={id,k:cfg.k||1};if(al){e.n=al[0];if(al[1])e.ic=al[1]}out.push(e)}pool=pool.filter(id=>evGroup(id)!==g)}return out}
const evLine=(evs,when)=>(evs||[]).filter(e=>EVENTS[e.id]).map(e=>`<p class="evline"><b>Ereignis ${when}: ${evIcon(e)} ${evName(e)}</b> · ${evFx(e).map(l=>l.replace('|',' ')).join(' · ')}</p>`).join('');
const hasEv=id=>(CTX.ev||[]).some(e=>e.id===id)&&!hasSpec('eventmanager');
// Lauf-Boni der Kampagne: gelten bis zum Ende des Laufs, mehrfach wählbar
const RUNB={};
{const NM=HABADJ;
for(const h in HAB){RUNB[h+'_b']={name:NM[h]+'experte',icon:HAB[h].icon,fx:[`+1 B|für jedes ${NM[h]}-Gehege`],per:(b,c)=>c.hab===h?{a:1}:null};
  RUNB[h+'_n']={name:NM[h]+'pflege',icon:HAB[h].icon,fx:[`+1 N|für jedes ${NM[h]}-Gehege`],per:(b,c)=>c.hab===h?{s:1}:null}}}
Object.assign(RUNB,{
  artenschutz:{name:'Artenschutz',icon:'🌿',fx:['+1 N|für jedes bedrohte Tier'],per:(b,c)=>c.tags.includes('bedroht')?{s:1}:null},
  raubtierhaus:{name:'Raubtierhaus',icon:'🦁',fx:['+1 B|für jedes Raubtier'],per:(b,c)=>c.tags.includes('raubtier')?{a:1}:null},
  gastro:{name:'Gastro-Profi',icon:'🍿',fx:['+1 B|für jedes Gastro-Gebäude'],per:(b,c)=>c.cat==='essen'?{a:1}:null},
  freizeit:{name:'Freizeitpark',icon:'🎡',fx:['+1 B|für jede Attraktion'],per:(b,c)=>c.cat==='attr'?{a:1}:null},
  baumeister:{name:'Baumeister',icon:'🔨',fx:['+1 N|extra je Ausbaustufe eines Geheges/Gebäudes'],per:b=>(b.lvl||1)>1?{s:(b.lvl||1)-1}:null},
});

// terrain: hk -> habitat key or 'block'
let TERR=new Map();
// Godot-Vorbereitung 2b: Gelände stehen in daten/gelaende.json (Form und Felsen berechnet genMap0 in Modul 04, Kennung = Gelände-Schlüssel)
const GELAENDE_DATEN=/*@@DATEN:gelaende@@*/null;
const MAPS={};for(const d of GELAENDE_DATEN.gelaende){const m={};for(const p in d)if(p!=='key')m[p]=d[p];MAPS[d.key]=m}
// Spezialisten: Mitarbeiter mit Sonderregel, gelten für den ganzen Kampagnen-Lauf (höchstens 5)
// ===== Godot-Vorbereitung 2b: Spezialisten stehen in daten/spezialisten.json (von mache.py eingebaut).
// Wirkungen, die Code sind, bleiben hier: der Spezialist nennt in per/mult eine Kennung aus SPEZ_WIRKUNG (= Spezialisten-Schlüssel).
const SPEZ_DATEN=/*@@DATEN:spezialisten@@*/null;
const MAXSPEC=SPEZ_DATEN.max_team,SPECPRICE=SPEZ_DATEN.preis.slice(),SPECTIER=SPEZ_DATEN.stufen_name.slice();
const halfHab=(bs,h)=>{const g=bs.filter(n=>isCat(n,'gehege'));return g.length>=4&&cnt(g,n=>isHab(n,h))*2>=g.length};
const SPEZ_WIRKUNG=(()=>{const per={},mult={};
  // Wirkung je Gehege/Gebäude
  for(const h in HAB)per['pfleger_'+h]=(b,c)=>c.hab===h?{pa:.15,ps:.15}:null;
  Object.assign(per,{
  gastro:(b,c,nb)=>c.cat==='essen'?{a:2*others(nb,b,n=>isCat(n,'essen'))}:null,
  gaertner:(b,c,nb)=>c.cat==='schutz'?{s:2*others(nb,b,n=>isCat(n,'schutz'))}:null,
  animateur:(b,c,nb)=>c.cat==='attr'?{a:2*others(nb,b,n=>isCat(n,'attr'))}:null,
  kleintier:(b,c)=>c.cat==='gehege'&&b.cells.length===1?{pa:.2,ps:.2}:null,
  architekt:(b,c)=>c.cat==='gehege'&&c.tags.includes('gross')?{pa:.15}:null,
  dompteur:(b,c)=>c.tags.includes('raubtier')?{pa:.3}:null,
  artenschuetzer:(b,c)=>c.tags.includes('bedroht')?{ps:.25}:null,
  tierpfleger:(b,c,nb)=>c.cat==='schutz'?{s:2*cnt(nb,n=>has(n,'scheu'))}:null,
  bauleiterin:b=>(b.lvl||1)>1?{pa:.15,ps:.15,n:(b.lvl||1)-1}:null,
  sammler:(b,c,nb,all)=>{if(c.cat!=='gehege')return null;const h=vielfalt(all).lvl;return h>=2?{ps:.1}:null}});
  // Faktor für den ganzen Zoo
  Object.assign(mult,{
  kurator:bs=>{const n=new Set(bs.filter(b=>isCat(b,'gehege')).map(b=>spK(b.key))).size,f=Math.min(1.6,1+.05*n);return f>1?{ma:+f.toFixed(2)}:null},
  meeresbio:bs=>halfHab(bs,'wasser')?{ms:1.5}:null,
  safari:bs=>halfHab(bs,'savanne')?{ma:1.5}:null,
  foerster:bs=>halfHab(bs,'wald')?{ms:1.5}:null,
  wuestenkenner:bs=>halfHab(bs,'wueste')?{ma:1.5}:null,
  polarkenner:bs=>halfHab(bs,'arktis')?{ms:1.5}:null,
  bergkenner:bs=>halfHab(bs,'gebirge')?{ma:1.5}:null,
  spekulant:()=>({ma:1.3}),
  direktor:()=>({ma:1.15,ms:1.15})});
  // 0.92: Glücks-Spezialisten und Tobis Ideen
  {const KN=(tag,f,key)=>bs=>{const n=cnt(bs,b=>isCat(b,'gehege')&&has(b,tag));const v=Math.min(1.6,1+f*n);return v>1?{[key]:+v.toFixed(2)}:null};
  Object.assign(mult,{
  gluecksspielerin:()=>{const L=LK();return L&&L.spec.gl?{ma:1.5}:null},
  ausw:()=>state&&state.auswDay===state.day+'/'+state.season?{ms:1.5}:null,
  k_beute:KN('beute',.06,'ms'),k_raub:KN('raubtier',.12,'ma'),k_scheu:KN('scheu',.1,'ms'),k_show:KN('show',.1,'ma'),k_rot:KN('bedroht',.15,'ms')})}
  // Futter (0.64a)
  mult.ernprof=()=>{const L=CTX&&CTX.fdl||{},n=Object.values(L).reduce((a,b)=>a+(b||0),0);return n?{ma:+(1.05**n).toFixed(3)}:null};
  // Zoolatro 2.0: wachsende Spezialisten (HGROW, HGMAX, gf in Modul 04)
  {const G=(id,k)=>mult[id]=()=>{const f=gf(id,HGROW[k],HGMAX);return f>1?{[k]:f}:null};
  G('z_wald','ma');G('z_wasser','ms');G('z_wueste','ma');G('z_savanne','ms');G('z_arktis','ma');G('z_gebirge','ms');
  mult.z_bank=()=>{const m=typeof state!=='undefined'&&state?state.money:0,f=Math.min(1.5,+(1+.05*Math.max(0,Math.floor(m/10))).toFixed(2));return f>1?{ma:f}:null};
  mult.z_rekord=()=>{const f=gf('z_rekord',.25);return f>1?{ms:f}:null}}
  // 0.94 (flossLen, grwF in Modul 09)
  mult.floss=bs=>{const n=flossLen(bs||[]),f=+(1+.1*n).toFixed(2);return n?{ma:f}:null};
  mult.wgast=()=>{const f=grwF('ga');return f>1?{ma:f}:null};
  mult.wnat=()=>{const f=grwF('nat');return f>1?{ms:f}:null};
  return{per,mult}})();
const SPEC={};for(const d of SPEZ_DATEN.spezialisten){const S={};for(const p in d){if(p==='key')continue;const v=d[p];S[p]=Array.isArray(v)?v.slice():v;if(p==='per'||p==='mult'){S[p]=SPEZ_WIRKUNG[p][v];if(!S[p])throw new Error('Wirkung fehlt: '+p+' '+v)}}SPEC[d.key]=S}
const bpBase=()=>BP+(hasSpec('polier')?1:0);
