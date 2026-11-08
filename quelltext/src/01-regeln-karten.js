//@@ modul: 01-regeln-karten
//ENGINE-START
let VERTAP={n:0,t:0};
const VERSION='0.72a';
// 0.66a Neuigkeiten: gleiche Texte wie CHANGELOG.md (nur die letzten Versionen). Bei jedem Bauen oben ergänzen.
const CHANGES=[
 {v:'0.72a',d:'08.11.2026',t:'Goldfelder ×4, Regeln genauer erklärt',i:['★ Goldene Felder und ✨ Schimmernd multiplizieren sich jetzt: Schimmernd auf einem Goldfeld oder ein Gehege auf zwei Goldfeldern zählt ×4 (bisher ×3).','📖 Lebensraum-Regeln genauer erklärt: Bei Wasser, Gebirge und Arktis zählt bei einem Verstoß die ganze Gruppe nur ×0,5. Ein einzelnes Wasser-Gehege bleibt bei ×1.','🎭 Showtier-Text ergänzt: Trubel-Nachbarn und Tribünen zählen doppelt, zusammen höchstens +120 %.']},
 {v:'0.71a',d:'08.11.2026',t:'Naturfelder, Seltenheit, Futterplätze',i:['🌿 Naturfelder fest verteilt: Jeder Zoo hat 18 Naturfelder, nur in Ihren drei Lebensräumen, als Flecken zu 2–4 Feldern. Jedes Gelände hat seinen Schwerpunkt, das Flusstal einen kürzeren Fluss.','★ Seltene und sehr seltene Karten erkennen Sie an einer farbigen Ecke oben rechts auf der Handkarte. Legendäre Spezialisten glänzen im Team und in der Bewerbermappe.','🍽️ Futterplätze nach Seltenheit: gewöhnliche Tiere 1, seltene 2, sehr seltene 3 (mit Futtermeister je einer mehr). Karten-Info und Futtersack zeigen die freien Plätze.','🏔️ Profilwahl: Alle 8 Stufen sind zu sehen, gesperrte mit 🔒. Nach der Stufenwahl führt ◂ Zurück wieder zur Auswahl.','Tutorial: „Weiter ▸“ steht immer rechts, und an Tag 2 erscheinen gleich die richtigen Handkarten.']},
 {v:'0.70a',d:'06.11.2026',t:'Pause in der Vorschau, Früh-Kasten',i:['🧑‍💼 Jasper erklärt Zebras, Bratwurstbude und Giraffenweide jetzt schon, wenn die Karte richtig liegt – gebaut wird mit 🔨 nach seinem letzten Satz.','◂ Zurück: In Jaspers Texten können Sie einen Satz zurückblättern.','Im Tutorial verdeckt kein Willkommen-Feld mehr das Gelände.','⚡ Früh geschafft: eigener Kasten im Sieg-Fenster mit Talern, Baupunkten und Geschenk. Im Shop zeigt der Reiter 🎁, das Geschenk leuchtet, bis Sie es nehmen.','🎯 Zoolatro-Lauf: Die Ziele in Sommer, Herbst und Winter sind 20 % höher.','🧺 Im Futtersack kommt Lebensraum-Futter seltener (etwa halb so oft).']}];
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

const CARDS={
  pinguine:{icon:'🐧',cat:'gehege',hab:'wasser',shape:'s1',a:3,s:2,rar:'gewöhnlich',
    bonus:nb=>({a:CTX.winter?2:0})},
  flamingos:{icon:'🦩',cat:'gehege',hab:'wasser',shape:'s2',a:2,s:3,rar:'gewöhnlich',
    bonus:nb=>({s:cnt(nb,n=>n.key==='gruen'),a:sea(1)?1:0})},
  schildkroeten:{icon:'🐢',cat:'gehege',hab:'wasser',shape:'s1',a:1,s:3,tags:['bedroht'],rar:'gewöhnlich',text:'Bedrohte Art.'},
  seeloewen:{icon:'🦭',cat:'gehege',hab:'wasser',shape:'s2',a:5,s:1,rar:'gewöhnlich'},
  otter:{icon:'🦦',cat:'gehege',hab:'wasser',shape:'l3',a:3,s:3,rar:'gewöhnlich',
    bonus:nb=>({s:2*cnt(nb,n=>n.key==='gruen'||n.key==='wasserfall')})},
  nilpferde:{icon:'🦛',cat:'gehege',hab:'wasser',shape:'d4',a:6,s:4,tags:['bedroht'],rar:'selten',text:'Großes Gehege. Bedrohte Art.',bonus:nb=>({s:2*cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'wasser'))})},
  affen:{icon:'🐒',cat:'gehege',hab:'wald',shape:'s1',a:4,s:1,rar:'gewöhnlich'},
  pandas:{icon:'🐼',cat:'gehege',hab:'wald',shape:'s2',a:4,s:4,tags:['bedroht'],rar:'selten',text:'Bedrohte Art. Publikumsliebling.'},
  // 0.90 Signatur-Karten: gibt es nur im jeweiligen Deck (nie im Angebot), werden mit dem Deck freigeschaltet
  hafen:{icon:'⚓',cat:'gehege',hab:'wasser',shape:'t3',a:3,s:3,tags:[],rar:'signatur',sig:'kueste',bonus:nb=>{const w=cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'wasser'));return{a:w>=3?2:0,s:w+(w>=3?Math.round((3+w)*.5):0)}}},
  gnu:{icon:'🐂',cat:'gehege',hab:'savanne',shape:'d4',a:4,s:4,tags:['beute'],rar:'signatur',sig:'steppe',bonus:nb=>({s:cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'savanne'))})},
  regenkuppel:{icon:'🐸',cat:'gehege',hab:'wald',shape:'s2',a:2,s:4,tags:[],rar:'signatur',sig:'dschungel',bonus:nb=>({s:2*cnt(nb,n=>has(n,'scheu'))})},
  karawane:{icon:'🏕️',cat:'gehege',hab:'wueste',shape:'s2',a:4,s:2,tags:[],rar:'signatur',sig:'oase'},
  achterbahn:{icon:'🎠',cat:'attr',shape:'l3',a:4,s:0,rar:'signatur',sig:'freizeit',bonus:(nb,bs,b)=>({a:cnt(bs||[],n=>n!==b&&isCat(n,'attr'))})},
  foodcourt:{icon:'🍱',cat:'essen',shape:'s2',a:3,s:0,rar:'signatur',sig:'geniesser',bonus:nb=>({a:2*cnt(nb,n=>isCat(n,'essen'))})},
  fstation:{icon:'🔬',cat:'schutz',shape:'s1',a:1,s:2,rar:'signatur',sig:'forscher'},
  eisgrotte:{icon:'❄️',cat:'gehege',hab:'arktis',shape:'s2',a:3,s:3,tags:[],rar:'signatur',sig:'polar',bonus:()=>CTX.winter?{a:6,s:6}:{a:0,s:0}},
  adlerhorst:{icon:'🪺',cat:'gehege',hab:'gebirge',shape:'s1',a:2,s:2,tags:[],rar:'signatur',sig:'alpen',bonus:(nb,bs,b)=>({a:rocksR2(b)})},
  tiger:{icon:'🐯',cat:'gehege',hab:'wald',shape:'t3',a:6,s:4,tags:['bedroht'],rar:'selten',text:'Großes Gehege. Bedrohte Art.'},
  faultiere:{icon:'🦥',cat:'gehege',hab:'wald',shape:'s1',a:3,s:2,rar:'gewöhnlich',
    bonus:nb=>({s:cnt(nb,n=>isCat(n,'essen')||isCat(n,'attr'))?0:2})},
  woelfe:{icon:'🐺',cat:'gehege',hab:'wald',shape:'b3',a:4,s:3,rar:'gewöhnlich',
    bonus:nb=>({s:cnt(nb,n=>isCat(n,'gehege'))})},
  reptilien:{icon:'🦎',cat:'gehege',hab:'wueste',shape:'s1',a:3,s:3,rar:'gewöhnlich',bonus:nb=>({s:cnt(nb,n=>isCat(n,'gehege')&&!isHab(n,'wueste'))}),text:'Ruhige Tiere, solider Artenschutz.'},
  erdmaennchen:{icon:'🦙',cat:'gehege',hab:'wueste',shape:'s1',a:3,s:1,rar:'gewöhnlich',gone:1},
  addax:{icon:'🦌🏜️',cat:'gehege',hab:'wueste',shape:'b3',a:5,s:3,tags:['bedroht'],rar:'selten'},
  kamele:{icon:'🐫',cat:'gehege',hab:'wueste',shape:'l3',a:4,s:2,rar:'gewöhnlich',bonus:nb=>({s:cnt(nb,n=>isCat(n,'gehege')&&!isHab(n,'wueste'))}),text:'Großes Gehege, langgezogen.'},
  fennek:{icon:'🦊',cat:'gehege',hab:'wueste',shape:'s1',a:3,s:2,rar:'gewöhnlich',
    bonus:nb=>({a:cnt(nb,n=>isCat(n,'schutz'))+2*cnt(nb,n=>n.key==='nachtfuehrung')})},
  skorpione:{icon:'🦂',cat:'gehege',hab:'wueste',shape:'s1',a:3,s:2,rar:'gewöhnlich',
    bonus:nb=>({a:cnt(nb,n=>isCat(n,'gehege')&&!isHab(n,'wueste'))})},
  giraffen:{icon:'🦒',cat:'gehege',hab:'savanne',shape:'b3',a:5,s:3,rar:'gewöhnlich',text:'Großes Gehege, gebogen.'},
  zebras:{icon:'🦓',cat:'gehege',hab:'savanne',shape:'t3',a:4,s:3,rar:'gewöhnlich',text:'Großes Gehege, kompakt.'},
  warzenschweine:{icon:'🐗',cat:'gehege',hab:'savanne',shape:'s1',a:2,s:2,rar:'gewöhnlich',
    bonus:nb=>({a:cnt(nb,n=>has(n,'gross')&&isCat(n,'gehege'))})},
  geparden:{icon:'🐆',cat:'gehege',hab:'savanne',shape:'s2',a:4,s:2,tags:['bedroht'],rar:'selten',text:'Bedrohte Art.'},
  elefanten:{icon:'🐘',cat:'gehege',hab:'savanne',shape:'d4',a:6,s:4,tags:['bedroht'],rar:'selten',text:'Großes Gehege. Bedrohte Art.'},
  loewen:{icon:'🦁',cat:'gehege',hab:'savanne',shape:'l4',a:8,s:2,rar:'selten',text:'Großes Gehege, sehr lang. Sehr beliebt.'},
  nashoerner:{icon:'🦏',cat:'gehege',hab:'savanne',shape:'z4',a:3,s:7,tags:['bedroht'],rar:'sehr selten',text:'Großes Gehege. Bedrohte Art, starker Artenschutz.'},

  delfinshow:{icon:'🐬',cat:'attr',shape:'s2',a:6,s:0,rar:'gewöhnlich',
    bonus:nb=>({s:-cnt(nb,n=>isCat(n,'gehege')&&!isHab(n,'wasser'))})},
  turm:{icon:'🗼',cat:'attr',shape:'s1',a:1,s:0,rar:'gewöhnlich',
    bonus:nb=>({a:4*cnt(nb,n=>has(n,'gross')&&isCat(n,'gehege'))})},
  streichelzoo:{icon:'🐑',cat:'attr',shape:'s1',a:3,s:1,rar:'gewöhnlich',
    bonus:nb=>({a:2*cnt(nb,n=>isCat(n,'essen'))})},
  spielplatz:{gone:1,icon:'🛝',cat:'attr',shape:'s1',a:2,s:0,rar:'gewöhnlich',
    bonus:nb=>({a:2*cnt(nb,n=>isCat(n,'essen')||n.key==='streichelzoo')})},
  zoobahn:{gone:1,icon:'🚂',cat:'attr',shape:'l4',a:3,s:0,rar:'selten',
    bonus:nb=>({a:cnt(nb,n=>isCat(n,'gehege'))})},
  tropenhaus:{icon:'🌴',cat:'attr',shape:'t3',a:5,s:5,rar:'sehr selten',
    bonus:nb=>({s:cnt(nb,n=>isCat(n,'gehege'))*(CTX.winter?2:1)})},
  nachtfuehrung:{icon:'🌙',cat:'attr',shape:'s1',a:2,s:0,rar:'sehr selten',
    
    mult:(nb,all)=>cnt(all,n=>isCat(n,'gehege'))>=4?{ma:1.3}:null},
  glashaus:{icon:'🪴',cat:'attr',shape:'s2',a:3,s:2,rar:'winter',
    bonus:nb=>({a:(CTX.winter?3:1)*cnt(nb,n=>cold(K(n).hab))})},

  popcorn:{icon:'🍿',cat:'essen',shape:'s1',a:1,s:0,rar:'gewöhnlich',
    
    bonus:nb=>({a:5*cnt(nb,n=>n.key==='delfinshow')+2*cnt(nb,n=>isCat(n,'attr')&&n.key!=='delfinshow'),s:essenMalus(nb)})},
  eiswagen:{icon:'🍦',cat:'essen',shape:'s1',a:2,s:0,rar:'gewöhnlich',
    
    bonus:nb=>({a:(CTX.winter?1:sea(1)?3:2)*cnt(nb,n=>isCat(n,'gehege')),s:essenMalus(nb)})},
  bratwurst:{icon:'🌭',cat:'essen',shape:'s1',a:2,s:0,rar:'gewöhnlich',
    
    bonus:nb=>({a:cnt(nb,n=>isCat(n,'gehege'))+cnt(nb,n=>isHab(n,'savanne')),s:essenMalus(nb)})},
  cafe:{icon:'☕',cat:'essen',shape:'s1',a:2,s:0,rar:'gewöhnlich',
    
    bonus:nb=>({a:2*cnt(nb,n=>isCat(n,'schutz'))+(CTX.season>=2?2:0),s:essenMalus(nb)})},
  getraenke:{gone:1,icon:'🥤',cat:'essen',shape:'s1',a:1,s:0,rar:'selten',
    
    bonus:nb=>({a:nb.length,s:essenMalus(nb)})},
  crepes:{gone:1,icon:'🥞',cat:'essen',shape:'s1',a:2,s:0,rar:'selten',
    
    bonus:nb=>({a:2*cnt(nb,n=>isCat(n,'attr')),s:essenMalus(nb)})},
  picknick:{icon:'🧺',cat:'essen',shape:'s2',a:1,s:1,rar:'gewöhnlich',
    
    bonus:nb=>({s:cnt(nb,n=>isCat(n,'gehege'))+(CTX.season<2?1:0),a:cnt(nb,n=>isCat(n,'essen'))-(CTX.winter?1:0)})},
  bistro:{icon:'🍽️',cat:'essen',shape:'s1',a:2,s:0,rar:'selten',
    
    bonus:nb=>({a:5*cnt(nb,n=>isHab(n,'savanne')),s:essenMalus(nb)})},
  souvenir:{gone:1,icon:'🛍️',cat:'essen',shape:'s1',a:3,s:0,rar:'gewöhnlich',
    
    bonus:nb=>({a:cnt(nb,n=>isCat(n,'attr')),s:essenMalus(nb)})},
  weihnachtsmarkt:{icon:'🎄',cat:'essen',shape:'s2',a:2,s:0,rar:'winter',
    
    bonus:nb=>({a:cnt(nb,n=>isCat(n,'essen'))+(CTX.winter?6:0),s:essenMalus(nb)})},

  gruen:{icon:'🌳',cat:'schutz',shape:'s1',a:1,s:1,rar:'gewöhnlich',
    bonus:nb=>({s:cnt(nb,n=>isCat(n,'gehege'))+(sea(0)?1:0)})},
  wasserfall:{icon:'🏞️',cat:'schutz',shape:'s1',a:1,s:1,rar:'gewöhnlich',
    bonus:nb=>{let w=cnt(nb,n=>isHab(n,'wasser'));if(CTX.winter)w=Math.floor(w/2);return{a:w,s:w}}},
  infozentrum:{icon:'📚',cat:'schutz',shape:'s1',a:1,s:1,rar:'gewöhnlich',
    bonus:nb=>({s:2*cnt(nb,n=>isCat(n,'attr'))})},
  tierarzt:{icon:'🩺',cat:'schutz',shape:'s1',a:0,s:2,rar:'gewöhnlich',
    bonus:nb=>({s:cnt(nb,n=>isCat(n,'gehege'))})},
  zucht:{icon:'🥚',cat:'schutz',shape:'s1',a:0,s:2,rar:'selten',
    
    bonus:nb=>({s:nb.filter(n=>has(n,'bedroht')).reduce((t,n)=>t+K(n).s,0)})},
  vielfalt:{icon:'🧬',cat:'schutz',shape:'s1',a:0,s:1,rar:'selten',
    bonus:(nb,all)=>({s:new Set(all.filter(n=>isCat(n,'gehege')).map(n=>spK(n.key))).size})},
  labor:{gone:1,icon:'🔬',cat:'schutz',shape:'s1',a:0,s:2,rar:'selten',
    bonus:(nb,all)=>({s:cnt(all,n=>isCat(n,'gehege'))})},
  stiftung:{icon:'🏛️',cat:'schutz',shape:'s1',a:0,s:1,rar:'sehr selten',
    mult:()=>({ms:1.3})},
};
// Bonus-Karten: werden pro Speicherplatz nach einem Sieg freigeschaltet
Object.assign(CARDS,{
  gorillas:{icon:'🦍',cat:'gehege',hab:'wald',shape:'t3',a:6,s:5,tags:['bedroht'],rar:'selten',bonus_:1,bonus:nb=>({s:cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'wald'))})},
  koalas:{icon:'🐨',cat:'gehege',hab:'wald',shape:'s1',a:4,s:3,tags:['bedroht'],rar:'selten',bonus_:1,bonus:nb=>({a:cnt(nb,n=>isCat(n,'schutz'))?2:0})},
  eisbaeren:{icon:'🐻‍❄️',cat:'gehege',hab:'wasser',shape:'b3',a:7,s:3,tags:['bedroht'],rar:'selten',bonus_:1,bonus:()=>({a:CTX.winter?2:0})},
  krokodile:{icon:'🐊',cat:'gehege',hab:'wasser',shape:'s2',a:5,s:2,rar:'selten',bonus_:1,bonus:nb=>({a:2*cnt(nb,n=>isCat(n,'essen'))})},
  schneeleoparden:{icon:'🐆❄️',cat:'gehege',hab:'wueste',shape:'s2',a:5,s:4,tags:['bedroht'],rar:'selten',bonus_:1,bonus:()=>({a:CTX.winter?3:0})},
  kaengurus:{icon:'🦘',cat:'gehege',hab:'wueste',shape:'l3',a:5,s:3,rar:'selten',bonus_:1,bonus:nb=>({a:cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'wueste'))})},
  aquarium:{icon:'🐠',cat:'attr',shape:'t3',a:5,s:2,rar:'selten',bonus_:1,bonus:nb=>({a:2*cnt(nb,n=>isHab(n,'wasser'))})},
  biergarten:{icon:'🍺',cat:'essen',shape:'s2',a:3,s:0,rar:'selten',bonus_:1,bonus:nb=>({a:2*cnt(nb,n=>isCat(n,'essen'))+(sea(1)?3:0),s:essenMalus(nb)})},
  schmetterling:{icon:'🦋',cat:'schutz',shape:'s2',a:2,s:3,rar:'selten',bonus_:1,
    bonus:(nb,all,b)=>{const own=new Set(b.cells.map(c=>hk(...c))),seen=new Set();for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr),t=TERR.get(k);if(t&&t!=='block'&&!own.has(k))seen.add(k)}return{s:seen.size}}},
});
// Ergänzungen, damit jeder Lebensraum 7 Grundkarten und 2 Bonus-Karten hat, Attraktionen, Essen und Naturschutz je 9 und 2
Object.assign(CARDS,{
  schwan:{icon:'🦢',cat:'gehege',hab:'wasser',shape:'s2',a:3,s:3,rar:'gewöhnlich',bonus:nb=>({s:cnt(nb,n=>isCat(n,'schutz'))})},
  eulen:{icon:'🦉',cat:'gehege',hab:'wald',shape:'s1',a:2,s:3,rar:'gewöhnlich',bonus:nb=>({s:cnt(nb,n=>has(n,'scheu')),a:2*cnt(nb,n=>n.key==='nachtfuehrung')})},
  papageien:{icon:'🦜',cat:'gehege',hab:'wald',shape:'s2',a:5,s:2,rar:'gewöhnlich'},
  schlangen:{icon:'🐍',cat:'gehege',hab:'wueste',shape:'s1',a:3,s:2,rar:'gewöhnlich',bonus:nb=>({a:cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'wueste'))})},
  wuestenigel:{icon:'🦔',cat:'gehege',hab:'wueste',shape:'s1',a:2,s:3,rar:'gewöhnlich',bonus:nb=>({s:cnt(nb,n=>isCat(n,'schutz'))})},
  bueffel:{icon:'🐃',cat:'gehege',hab:'savanne',shape:'d4',a:7,s:4,rar:'selten',bonus_:1,bonus:nb=>({a:cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'savanne'))})},
  antilopen:{icon:'🦌',cat:'gehege',hab:'savanne',shape:'t3',a:5,s:4,tags:['bedroht'],rar:'selten',bonus_:1},
  karussell:{gone:1,icon:'🎠',cat:'attr',shape:'s1',a:3,s:0,rar:'gewöhnlich',bonus:nb=>({a:cnt(nb,n=>isCat(n,'attr')||isCat(n,'essen'))})},
  arena:{icon:'🤹',cat:'attr',shape:'t3',a:6,s:0,rar:'selten',bonus:nb=>({a:cnt(nb,n=>isCat(n,'gehege')),s:0})},
  bienen:{icon:'🐝',cat:'schutz',shape:'s1',a:0,s:2,rar:'gewöhnlich',bonus:nb=>({s:cnt(nb,n=>isCat(n,'schutz'))+cnt(nb,n=>n.key==='gruen')})},
  baumschule:{icon:'🌱',cat:'schutz',shape:'s1',a:1,s:1,rar:'gewöhnlich',bonus:nb=>{const w=cnt(nb,n=>isHab(n,'wald'));return{a:w,s:w}}},
  wasserloch:{icon:'🫗',cat:'schutz',shape:'s1',a:1,s:1,rar:'gewöhnlich',bonus:nb=>{const w=cnt(nb,n=>isHab(n,'savanne'));return{a:w,s:w}}},
  oase:{icon:'🏝️',cat:'schutz',shape:'s1',a:1,s:1,rar:'gewöhnlich',bonus:nb=>{const w=cnt(nb,n=>isHab(n,'wueste'));return{a:w,s:w}}},
  pizzeria:{icon:'🍕',cat:'essen',shape:'s2',a:4,s:0,rar:'selten',bonus_:1,bonus:nb=>({a:2*cnt(nb,n=>isCat(n,'attr')),s:essenMalus(nb)})},
});
// Saison-Karten: tauchen nur in ihrer Jahreszeit in Auswahl und Shop auf
Object.assign(CARDS,{
  blumenschau:{gone:1,icon:'🌷',cat:'attr',shape:'s2',a:2,s:2,rar:'saison',only:0,bonus:nb=>({a:sea(0)?3:0,s:cnt(nb,n=>n.key==='gruen')})},
  wasserspiel:{icon:'💦',cat:'attr',shape:'s2',a:3,s:0,rar:'saison',only:1,bonus:nb=>({a:(sea(1)?4:0)+cnt(nb,n=>isHab(n,'wasser'))})},
  kuerbisfest:{icon:'🎃',cat:'essen',shape:'s2',a:2,s:0,rar:'saison',only:2,bonus:nb=>({a:(sea(2)?5:0)+cnt(nb,n=>isCat(n,'essen')),s:essenMalus(nb)})},
  eisbahn:{gone:1,icon:'⛸️',cat:'attr',shape:'t3',a:4,s:0,rar:'winter',bonus:()=>({a:CTX.winter?5:0})},
});
// Meilenstein-Karten: Geschenk ab 5 Gehegen eines Lebensraums bzw. 6 Gebäuden einer Art
const spK=k=>(CARDS[k]&&CARDS[k].par)||String(k).split(/[#^]/)[0]; // 0.64a: Futter/Prägung ändern die Art nicht // Jungtier zählt als seine Elternart
const others=(all,b,f)=>new Set(all.filter(n=>n!==b&&spK(n.key)!==spK(b.key)&&!K(n).ms&&f(n)).map(n=>spK(n.key))).size; // verschiedene andere Arten
Object.assign(CARDS,{
  orca:{icon:'🐋',cat:'gehege',hab:'wasser',shape:'d4',a:8,s:4,rar:'meilenstein',ms:1,bonus:(nb,all,b)=>({a:2*others(all,b,n=>isHab(n,'wasser'))})},
  grossesavanne:{icon:'🦬',cat:'gehege',hab:'savanne',shape:'z4',a:6,s:6,rar:'meilenstein',ms:1,bonus:(nb,all,b)=>{const n=others(all,b,x=>isHab(x,'savanne'));return{a:n,s:n}}},
  orangutan:{icon:'🦧',cat:'gehege',hab:'wald',shape:'t3',a:6,s:6,tags:['bedroht'],rar:'meilenstein',ms:1,bonus:(nb,all,b)=>({s:2*others(all,b,n=>isHab(n,'wald'))})},
  greifvogel:{icon:'🦅',cat:'gehege',hab:'wueste',shape:'s2',a:7,s:4,rar:'meilenstein',ms:1,bonus:(nb,all,b)=>({a:2*others(all,b,n=>isHab(n,'wueste'))})},
  // --- Arktis und Gebirge (0.53) ---
  korallenriff:{icon:'🪸',cat:'gehege',hab:'wasser',shape:'s1',a:3,s:2,rar:'gewöhnlich'},
  kraken:{icon:'🐙',cat:'gehege',hab:'wasser',shape:'s2',a:2,s:4,rar:'selten',bonus:nb=>({s:cnt(nb,n=>isCat(n,'schutz'))?2:0})},
  dingos:{icon:'🐕',cat:'gehege',hab:'wueste',shape:'s2',a:4,s:2,rar:'selten',bonus:nb=>({a:cnt(nb,n=>isHab(n,'wueste'))})},
  polarfuchs:{icon:'🐾',cat:'gehege',hab:'arktis',shape:'s1',a:3,s:2,rar:'gewöhnlich',bonus:()=>({s:CTX.winter?2:0})},
  schneehasen:{icon:'🐇',cat:'gehege',hab:'arktis',shape:'s1',a:2,s:2,rar:'gewöhnlich',bonus:nb=>({a:cnt(nb,n=>isHab(n,'arktis'))})},
  moschusochsen:{icon:'🦣',cat:'gehege',hab:'arktis',shape:'b3',a:4,s:4,rar:'gewöhnlich',bonus:nb=>({s:cnt(nb,n=>isHab(n,'arktis'))})},
  rentiere:{icon:'🫎',cat:'gehege',hab:'arktis',shape:'t3',a:5,s:3,rar:'gewöhnlich',bonus:()=>({a:CTX.winter?2:0})},
  belugas:{icon:'🐳',cat:'gehege',hab:'arktis',shape:'l3',a:6,s:3,tags:['bedroht'],rar:'selten'},
  schneegaense:{icon:'🪿',cat:'gehege',hab:'arktis',shape:'s2',a:3,s:3,rar:'gewöhnlich',bonus:nb=>({s:cnt(nb,n=>isHab(n,'wasser')||isHab(n,'arktis'))})},
  lemminge:{icon:'🐹',cat:'gehege',hab:'arktis',shape:'s1',a:1,s:2,rar:'gewöhnlich',bonus:nb=>({s:cnt(nb,n=>isHab(n,'arktis'))})},
  polarstation:{icon:'📡',cat:'schutz',shape:'s1',a:1,s:1,rar:'gewöhnlich',rq:'arktis',bonus:nb=>{const w=cnt(nb,n=>isHab(n,'arktis'));return{a:w,s:w}}},
  beduinen:{icon:'⛺',cat:'essen',shape:'s1',a:2,s:0,rar:'gewöhnlich',rq:'wueste',bonus:nb=>({a:cnt(nb,n=>isHab(n,'wueste'))+(CTX.winter?2:0)})},
  teestube:{icon:'🫖',cat:'essen',shape:'s1',a:2,s:0,rar:'gewöhnlich',rq:'arktis',bonus:nb=>({a:cnt(nb,n=>isHab(n,'arktis'))+(CTX.winter?3:0)})},
  polarlicht:{icon:'🌌',cat:'gehege',hab:'arktis',shape:'d4',a:8,s:4,rar:'meilenstein',ms:1,bonus:(nb,all,b)=>({a:2*others(all,b,n=>isHab(n,'arktis'))})},
  steinboecke:{icon:'🐐',cat:'gehege',hab:'gebirge',shape:'s2',a:3,s:3,rar:'gewöhnlich',bonus:(nb,all,b)=>({a:Math.min(2,rocksNb(b))})},
  murmeltiere:{icon:'🦫',cat:'gehege',hab:'gebirge',shape:'s1',a:2,s:3,rar:'gewöhnlich',bonus:nb=>({a:cnt(nb,n=>isHab(n,'gebirge'))})},
  mufflons:{icon:'🐏',cat:'gehege',hab:'gebirge',shape:'s2',a:4,s:2,rar:'gewöhnlich',bonus:(nb,all,b)=>({a:edgeN(b)})},
  yaks:{icon:'🐄',cat:'gehege',hab:'gebirge',shape:'t3',a:5,s:3,rar:'gewöhnlich',bonus:()=>({a:CTX.season>=2?2:0})},
  braunbaeren:{icon:'🐻',cat:'gehege',hab:'gebirge',shape:'b3',a:6,s:3,rar:'selten',bonus:nb=>({s:2*cnt(nb,n=>isHab(n,'wald'))})},
  luchse:{icon:'🐈',cat:'gehege',hab:'gebirge',shape:'s1',a:4,s:2,rar:'selten',bonus:nb=>({a:cnt(nb,n=>isCat(n,'essen')||isCat(n,'attr'))?0:3})},
  rotepandas:{icon:'🦝',cat:'gehege',hab:'gebirge',shape:'s2',a:4,s:3,tags:['bedroht'],rar:'selten',bonus:nb=>({a:cnt(nb,n=>isCat(n,'schutz'))?2:0})},
  pfeifhasen:{icon:'🐁',cat:'gehege',hab:'gebirge',shape:'s1',a:2,s:2,rar:'gewöhnlich',bonus:(nb,all,b)=>({s:Math.min(2,rocksNb(b))})},
  seilbahn:{icon:'🚡',cat:'attr',shape:'l3',a:4,s:0,rar:'selten',rq:'gebirge',bonus:nb=>({a:2*cnt(nb,n=>isHab(n,'gebirge'))})},
  berghuette:{icon:'🛖',cat:'essen',shape:'s1',a:2,s:0,rar:'gewöhnlich',rq:'gebirge',bonus:nb=>({a:cnt(nb,n=>isHab(n,'gebirge'))+(CTX.winter?2:0)})},
  bergwacht:{icon:'⛑️',cat:'schutz',shape:'s1',a:1,s:1,rar:'gewöhnlich',rq:'gebirge',bonus:nb=>{const w=cnt(nb,n=>isHab(n,'gebirge'));return{a:w,s:w}}},
  // Verstärker: zählen selbst nicht, verstärken nur ihre Nachbarn (jeder Verstärker zählt pro Nachbar einmal)
  futterkueche:{tags:['einmalig'],icon:'🥕',cat:'verst',shape:'s1',a:0,s:0,rar:'selten'},
  besucherlotse:{tags:['einmalig'],icon:'🪧',cat:'verst',shape:'s1',a:0,s:0,rar:'selten'},
  scheinwerfer:{tags:['einmalig'],icon:'🔦',cat:'verst',shape:'s1',a:0,s:0,rar:'selten'},
  winterquartier:{tags:['einmalig'],icon:'🧣',cat:'verst',shape:'s1',a:0,s:0,rar:'selten'},
  buehne:{tags:['einmalig'],icon:'🎤',cat:'verst',shape:'s1',a:0,s:0,rar:'selten'},
  ruhezone:{tags:['einmalig'],icon:'🍃',cat:'verst',shape:'s1',a:0,s:0,rar:'selten'},
  gipfel:{icon:'🏔️',cat:'gehege',hab:'gebirge',shape:'z4',a:7,s:5,rar:'meilenstein',ms:1,bonus:(nb,all,b)=>({a:2*others(all,b,n=>isHab(n,'gebirge'))})},
  weltzoo:{icon:'🌍',cat:'attr',shape:'s2',a:4,s:4,rar:'meilenstein',ms:1,bonus:nb=>{const k=new Set(nb.map(n=>K(n).cat).filter(c=>CATS4.includes(c))).size;return{a:k,s:k}}},
  lehrpfad:{icon:'🥾',cat:'attr',shape:'s2',a:2,s:1,rar:'gewöhnlich',bonus:nb=>({a:2*cnt(nb,n=>isCat(n,'schutz'))})},
  besucherzentrum:{icon:'🗺️',cat:'attr',shape:'s1',a:1,s:0,rar:'selten',bonus:nb=>({a:Math.min(8,2*new Set(nb.map(n=>K(n).cat).filter(c=>CATS4.includes(c))).size)})},
  abenteuer:{icon:'🎢',cat:'attr',shape:'t3',a:8,s:0,rar:'meilenstein',ms:1,bonus:(nb,all,b)=>({a:2*others(all,b,n=>isCat(n,'attr'))})},
  restaurant:{icon:'🍝',cat:'essen',shape:'s2',a:6,s:0,rar:'meilenstein',ms:1,bonus:(nb,all,b)=>({a:2*others(all,b,n=>isCat(n,'essen'))})},
  ausstellung:{icon:'🖼️',cat:'schutz',shape:'s2',a:2,s:6,rar:'meilenstein',ms:1,bonus:(nb,all,b)=>({s:2*others(all,b,n=>isCat(n,'schutz'))})},
});
// Größen- und Typ-Anpassungen: weniger Einser, je 13 Arten bei Attraktionen, Essen und Naturschutz
{const big={cafe:[3,0],souvenir:[4,0],bistro:[3,0],infozentrum:[2,2],tierarzt:[0,3],zucht:[0,3],labor:[0,3],stiftung:[0,2],streichelzoo:[4,2],nachtfuehrung:[3,0],eulen:[3,4],fennek:[4,3],schlangen:[4,3]};
  for(const k in big){CARDS[k].shape='s2';CARDS[k].a=big[k][0];CARDS[k].s=big[k][1]}
  CARDS.zebras.shape='s2';CARDS.zebras.text='Mittelgroßes Gehege.';CARDS.tropenhaus.cat='schutz';CARDS.blumenschau.cat='schutz';
  {const S=(k,sh,a,s_,r)=>{const c=CARDS[k];c.shape=sh;c.a=a;c.s=s_;if(r)c.rar=r};
    // je Lebensraum genau ein 4-Felder-Gehege (für das Kronenfeld), alle gewöhnlich
    S('gorillas','d4',7,6,'gewöhnlich');S('kamele','l4',5,3);S('belugas','l4',7,4,'gewöhnlich');S('yaks','d4',6,4);S('nilpferde','d4',6,4,'gewöhnlich');S('elefanten','d4',6,4,'gewöhnlich');
    S('loewen','t3',7,2);S('nashoerner','b3',3,6);S('bueffel','t3',6,3)}
  CARDS.pinguine.hab='arktis';CARDS.eisbaeren.hab='arktis';CARDS.schneeleoparden.hab='gebirge';
  CARDS.wasserfall.rq='wasser';CARDS.aquarium.rq='wasser';CARDS.delfinshow.rq='wasser';CARDS.bistro.rq='savanne';CARDS.baumschule.rq='wald';CARDS.wasserloch.rq='savanne';CARDS.oase.rq='wueste'}
// 0.92 Glücks-Kombo-Karten
CARDS.zirkus={icon:'🎪',cat:'attr',shape:'t3',a:4,s:0,rar:'selten',tags:[]};
CARDS.lotterie={icon:'🎫',cat:'essen',shape:'s1',a:2,s:0,rar:'selten',tags:[]};
const LOCK91_=['kraken','krokodile','nilpferde','antilopen','bueffel','nashoerner','gorillas','koalas','tiger','dingos','kaengurus','addax','belugas','eisbaeren','rentiere','braunbaeren','rotepandas','schneeleoparden','aquarium','nachtfuehrung','seilbahn','biergarten','kuerbisfest','pizzeria','bistro','weihnachtsmarkt','vielfalt','bergwacht','polarstation','schmetterling','tropenhaus','stiftung','zucht'];
// ===== 0.91: Kombo-Wirkungen der 33 Freischalt-Karten (stärker in einer bestimmten Kombination; km = Faktor am Ende der Wertung) =====
{const C=CARDS,W=(nb,h)=>cnt(nb,n=>isCat(n,'gehege')&&isHab(n,h)),S=nb=>cnt(nb,n=>isCat(n,'schutz')),E=nb=>cnt(nb,n=>isCat(n,'essen'));
  C.kraken.km=nb=>W(nb,'wasser')>=2?{f:1.5,l:'2 Wasser-Gehege daneben'}:null;
  C.krokodile.km=nb=>E(nb)>=2?{f:1.5,l:'2 Gastro-Gebäude daneben'}:null;
  C.nilpferde.km=nb=>W(nb,'wasser')>=3?{f:1.5,l:'3 Wasser-Gehege daneben'}:null;
  C.antilopen.bonus=nb=>({s:W(nb,'savanne')});
  C.bueffel.km=nb=>W(nb,'savanne')>=3?{f:1.5,l:'3 Savannen-Gehege daneben'}:null;
  C.nashoerner.km=(nb,bs,b,o)=>!o.st&&W(nb,'savanne')>=2?{f:2,l:'ohne Stress, 2 Savannen-Gehege daneben'}:null;
  C.gorillas.km=nb=>S(nb)?{f:1.5,l:'Naturschutz daneben'}:null;
  C.koalas.km=(nb,bs,b,o)=>!o.st?{f:2,l:'nicht gestresst'}:null;
  C.tiger.km=(nb,bs,b,o)=>!nbrs2(b,o.idx).some(n=>has(n,'beute'))?{fa:1.5,l:'Revier ohne Beute in der Nähe'}:null;
  C.dingos.km=nb=>{const g=nb.filter(n=>isCat(n,'gehege'));return g.length&&g.every(n=>isHab(n,'wueste'))?{f:1.5,l:'nur Wüste daneben'}:null};
  C.kaengurus.km=nb=>W(nb,'wueste')>=3?{f:1.5,l:'3 Wüsten-Gehege daneben'}:null;
  C.addax.bonus=nb=>({s:2*W(nb,'wueste')*(S(nb)?2:1)});
  C.eisbaeren.km=nb=>CTX.winter&&W(nb,'wasser')?{f:1.5,l:'Winter mit Wasser daneben'}:null;
  C.rentiere.bonus=nb=>({a:CTX.winter?2:0,s:W(nb,'arktis')});
  C.braunbaeren.bonus=nb=>({s:2*cnt(nb,n=>isHab(n,'wald')),a:W(nb,'gebirge')});
  C.rotepandas.km=(nb,bs,b,o)=>!o.st?{f:1.5,l:'nicht gestresst'}:null;
  C.schneeleoparden.bonus=(nb,bs,b)=>({a:(CTX.winter?3:0)+Math.min(3,rocksNb(b))});
  C.nachtfuehrung.mult=(nb,all)=>cnt(all,n=>isCat(n,'gehege'))>=4?{ma:cnt(all,n=>isCat(n,'gehege')&&has(n,'scheu'))>=4?1.5:1.3}:null;
  C.seilbahn.bonus=(nb,all)=>({a:2*cnt(nb,n=>isHab(n,'gebirge'))+cnt(all||[],n=>isCat(n,'gehege')&&isHab(n,'gebirge'))});
  C.biergarten.km=nb=>E(nb)>=3?{f:1.5,l:'3 Gastro-Gebäude daneben'}:null;
  C.kuerbisfest.bonus=nb=>({a:sea(2)?5+2*E(nb):0});
  C.pizzeria.bonus=nb=>({a:2*cnt(nb,n=>isCat(n,'attr'))+2*cnt(nb,n=>isCat(n,'essen')&&n.key!=='pizzeria')});
  C.weihnachtsmarkt.bonus=()=>({a:CTX.winter?6:0});C.weihnachtsmarkt.km=nb=>CTX.winter&&E(nb)>=2?{f:1.5,l:'Winter, 2 Gastro-Gebäude daneben'}:null;
  C.vielfalt.km=()=>typeof state!=='undefined'&&state&&(state.miles||{}).bunt?{fs:2,l:'Meilenstein 🎨 Vielfalt'}:null;
  C.schmetterling.km=(nb,bs,b)=>{const own=new Set(b.cells.map(c=>hk(...c))),seen=new Set();for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr),t=TERR.get(k);if(t&&t!=='block'&&!own.has(k))seen.add(k)}return seen.size>=4?{f:1.5,l:'4 Naturflächen-Felder daneben'}:null};
  C.stiftung.mult=all=>({ms:+Math.min(1.8,1.3+.1*new Set((Array.isArray(all)?all:[]).filter(n=>isCat(n,'gehege')&&has(n,'bedroht')).map(n=>spK(n.key))).size).toFixed(2)});
  C.zucht.km=nb=>cnt(nb,n=>isCat(n,'gehege')&&has(n,'bedroht'))>=2?{f:1.5,l:'2 bedrohte Gehege daneben'}:null;
  for(const k of LOCK91_)if(C[k])C[k].bonus_=0}
// 0.94 neue Karten: Tribüne (nur ganz von Gehegen umschlossen), Floß-Teil (kommt über die Flößerin auf die Hand)
CARDS.tribuene={icon:'🏟️',cat:'attr',shape:'s1',a:6,s:0,rar:'selten',tags:[]}; // 0.64a: Variante B – Trubel, Show-Bonus für Showtiere im Umkreis 2
CARDS.flossteil={icon:'🛶',cat:'attr',shape:'s1',a:0,s:0,rar:'spezial',sig:'floss',tags:[]};
const tribOk=b=>{try{const idx=mkIndex(state.buildings),own=new Set(b.cells.map(c=>hk(...c)));for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr);if(own.has(k))continue;const n=idx.get(k);if(!n||!isCat(n,'gehege'))return false}return true}catch(e){return false}};
// ===== 0.94: Karten nach Tobis Planungstabelle (Gehege meist nur noch Merkmal, Gastro bringt Taler, Naturschutz +2 N) =====
{const C=CARDS,W=(nb,h)=>cnt(nb,n=>isCat(n,'gehege')&&isHab(n,h)),S=nb=>cnt(nb,n=>isCat(n,'schutz')),E=nb=>cnt(nb,n=>isCat(n,'essen')),G=nb=>cnt(nb,n=>isCat(n,'gehege'));
  const val={otter:[5,4],schildkroeten:[1,4],schwan:[3,2],krokodile:[5,3],bueffel:[7,4]};for(const k in val)if(C[k]){C[k].a=val[k][0];C[k].s=val[k][1]}
  // nur noch Merkmal (Bonus fällt weg)
  for(const k of['schlangen','flamingos','schwan','krokodile','giraffen','loewen','warzenschweine','antilopen','nashoerner','eulen','faultiere','woelfe','koalas','fennek','kamele','skorpione','wuestenigel','dingos','kaengurus','addax','lemminge','pinguine','polarfuchs','schneehasen','luchse','mufflons','murmeltiere','pfeifhasen','steinboecke','yaks','rotepandas','schneeleoparden','reptilien','otter','elefanten','moschusochsen','schneegaense'])if(C[k])delete C[k].bonus;
  C.hafen.bonus=()=>({});C.hafen.km=nb=>W(nb,'wasser')>=3?{f:1.5,l:'3 Wasser-Gehege daneben'}:null;C.orca.bonus=(nb,all,b)=>({a:2*cnt(all||[],n=>n!==b&&isCat(n,'gehege')&&isHab(n,'wasser'))});
  C.gnu.bonus=nb=>({a:W(nb,'savanne'),s:W(nb,'savanne')});
  // Kombos neu
  C.dingos.km=(nb,bs,b,o)=>nbrs2(b,o.idx).some(n=>has(n,'beute'))?{f:1.5,l:'Beutetier in der Nähe'}:null;
  C.kaengurus.km=nb=>cnt(nb,n=>isCat(n,'gehege')&&!isHab(n,'wueste'))>=3?{f:1.5,l:'3 andere Gehege daneben'}:null;
  C.eisbaeren.km=nb=>CTX.winter&&cnt(nb,n=>isCat(n,'attr'))&&E(nb)?{f:1.5,l:'Winter mit Attraktion und Gastro daneben'}:null;
  C.braunbaeren.bonus=()=>({});C.braunbaeren.km=null;C.braunbaeren.bonus=nb=>({s:2*W(nb,'wald')});
  // Attraktionen
  C.delfinshow.bonus=nb=>({a:W(nb,'wasser')});C.wasserspiel.bonus=()=>({a:sea(1)?4:0});
  C.popcorn.bonus=nb=>({a:(nb.some(n=>n.key==='delfinshow'||n.key==='streichelzoo')?5:0)+2*cnt(nb,n=>isCat(n,'attr')&&n.key!=='delfinshow'&&n.key!=='streichelzoo')});
  // Gastro: B und Taler (tal = Taler am Tag)
  const gt=(k,f)=>{C[k].bonus=nb=>({a:f(nb)});C[k].tal=nb=>f(nb)};
  gt('beduinen',nb=>W(nb,'wueste'));gt('bratwurst',nb=>W(nb,'savanne'));gt('picknick',nb=>E(nb));gt('cafe',nb=>S(nb));gt('berghuette',nb=>W(nb,'gebirge'));gt('teestube',nb=>W(nb,'arktis'));
  C.eiswagen.bonus=nb=>({a:(sea(1)?3:1)*G(nb)});C.eiswagen.tal=nb=>(sea(1)?3:1)*G(nb);
  C.biergarten.bonus=nb=>({a:E(nb)+(sea(1)?3:0)});C.biergarten.tal=nb=>E(nb);
  C.kuerbisfest.bonus=nb=>({a:sea(2)?5+2*E(nb):0});C.kuerbisfest.tal=()=>sea(2)?2:0;
  C.bistro.bonus=nb=>({a:2*W(nb,'savanne')});C.bistro.tal=nb=>2*W(nb,'savanne');
  C.weihnachtsmarkt.bonus=()=>({a:CTX.winter?5:0});C.weihnachtsmarkt.tal=()=>CTX.winter?2:0;
  // Naturschutz
  for(const[k,h]of[['baumschule','wald'],['oase','wueste'],['wasserfall','wasser'],['wasserloch','savanne'],['bergwacht','gebirge'],['polarstation','arktis']])if(C[k])C[k].bonus=nb=>({s:2*W(nb,h)});
  C.bienen.bonus=nb=>({s:2*cnt(nb,n=>isCat(n,'schutz')&&n.key!=='bienen')});C.gruen.bonus=nb=>({s:G(nb)});
}
// Taler aus Gastro-Gebäuden je Tag
const talOf=bs=>{let t=0;try{const ix=mkIndex(bs);for(const b of bs){const c=K(b);if(c&&c.tal)t+=Math.max(0,c.tal(nbrs(b,ix),bs,b)||0)}}catch(e){}return t};
const MILE={wasser:{card:'orca',n:6,label:'Wasser-Gehege',icon:'💧',f:c=>c.hab==='wasser'},savanne:{card:'grossesavanne',n:6,label:'Savannen-Gehege',icon:'🌾',f:c=>c.hab==='savanne'},
  wald:{card:'orangutan',n:6,label:'Dschungel-Gehege',icon:'🌿',f:c=>c.hab==='wald'},wueste:{card:'greifvogel',n:6,label:'Wüsten-Gehege',icon:'🏜️',f:c=>c.hab==='wueste'},
  attr:{card:'abenteuer',n:6,label:'Attraktionen',icon:'🎡',f:c=>c.cat==='attr'},essen:{card:'restaurant',n:6,label:'Gastro-Gebäude',icon:'🍿',f:c=>c.cat==='essen'},schutz:{card:'ausstellung',n:7,label:'Naturschutz-Gebäude',icon:'🌳',f:c=>c.cat==='schutz'}};
MILE.bunt={card:'weltzoo',n:4,label:'Arten je Kategorie',icon:'🎨',f:()=>false};MILE.arktis={card:'polarlicht',n:6,label:'Arktis-Gehege',icon:'🧊',f:c=>c.hab==='arktis'};MILE.gebirge={card:'gipfel',n:6,label:'Gebirgs-Gehege',icon:'⛰️',f:c=>c.hab==='gebirge'};
const mileKeys=()=>Object.keys(MILE).filter(t=>!HAB[t]||habsNow().includes(t));
const CATS4=['gehege','attr','essen','schutz'],mileCount=(bs,t)=>mileCount0(bs,t)+(bs.some(b=>b.key==='fstation')?1:0)+(t==='essen'&&bs.some(b=>b.key==='foodcourt')?1:0),mileCount0=(bs,t)=>t==='bunt'?Math.min(...CATS4.map(cat=>new Set(bs.filter(b=>!CARDS[b.key].ms&&CARDS[b.key].cat===cat).map(b=>spK(b.key))).size)):new Set(bs.filter(b=>!CARDS[b.key].ms&&MILE[t].f(CARDS[b.key])).map(b=>spK(b.key))).size; // nur verschiedene Arten zählen
for(const k of ['labor','vielfalt','stiftung','nachtfuehrung'])CARDS[k].tags=['einmalig'];
for(const k in CARDS){const c=CARDS[k];c.tags=c.tags||[];if(c.ms)c.tags.push('einmalig');if(SHAPES[c.shape].cells.length>=3)c.tags.push('gross')}
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
const TRAITS={raubtier:['loewen','tiger','geparden','woelfe','eisbaeren','krokodile','schneeleoparden','dingos','luchse','polarfuchs','fennek'],beute:['zebras','giraffen','warzenschweine','addax','flamingos','kamele','kaengurus','wuestenigel','antilopen','schneehasen','rentiere','lemminge','steinboecke','mufflons','pfeifhasen','koalas'],scheu:['pandas','faultiere','schildkroeten','nashoerner','fennek','schwan','eulen','koalas','polarfuchs','murmeltiere','luchse','rotepandas'],show:['seeloewen','korallenriff','affen','papageien','erdmaennchen','skorpione','giraffen','warzenschweine','pinguine','belugas','mufflons','yaks']};
const TRAITNAME={raubtier:'Raubtier',beute:'Beute',scheu:'Scheu',show:'Showtier',ruhig:'Ruhig',trubel:'Trubel'};
// 0.52a: Ruhig (stört scheue Tiere nicht, kein Show-Bonus) / Trubel (Show-Tiere daneben doppelter Show-Bonus)
TRAITS.ruhig=['lehrpfad','picknick','restaurant','teestube','turm','glashaus','besucherzentrum','nachtfuehrung','flossteil'];TRAITS.trubel=['tribuene','arena','zirkus','abenteuer','wasserspiel','delfinshow','biergarten','weihnachtsmarkt','kuerbisfest','bratwurst','lotterie','achterbahn','foodcourt'];
for(const t in TRAITS)for(const k of TRAITS[t])if(CARDS[k]){CARDS[k].tags=CARDS[k].tags||[];if(!CARDS[k].tags.includes(t))CARDS[k].tags.push(t)}
// 0.63a: bedrohte Tiere ausgeglichen (3 je Lebensraum, mindestens 1 von Anfang an frei)
{const ADDB=['otter','kamele','schlangen','pinguine','steinboecke'],DELB=['antilopen','koalas'];for(const k in CARDS){const b=String(k).split(/[~^]/)[0],C=CARDS[k];C.tags=C.tags||[];if(ADDB.includes(b)&&!C.tags.includes('bedroht'))C.tags=['bedroht',...C.tags];if(DELB.includes(b))C.tags=C.tags.filter(t=>t!=='bedroht')}}
const ruhigC=c=>!!c&&((CARDS[baseK(c.key)]||c).tags||[]).includes('ruhig'),trubelC=c=>!!c&&((CARDS[baseK(c.key)]||c).tags||[]).includes('trubel');
const rarLabel=c=>c.rar==='winter'?'nur im Winter':c.rar==='saison'?'nur im '+SEANAME[c.only]:c.rar==='meilenstein'?'Meilenstein':c.rar;
const traitOf=c=>['raubtier','scheu','show','beute'].find(t=>c.tags.includes(t));
const TRAITIC={raubtier:'🦷',beute:'🐇',scheu:'🙈',show:'🎭',ruhig:'🤫',trubel:'🎉'},traitsOf=c=>(typeof TUTNOW!=='undefined'&&TUTNOW&&!TUTTR)?[]:['raubtier','beute','scheu','show','ruhig','trubel'].filter(t=>(c.tags||[]).includes(t));
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

const PROGS={
  pate_savanne:{icon:'🌾',price:50,per:(b,c)=>c.hab==='savanne'?{pa:.2,ps:.2}:null},
  pate_wasser:{icon:'💧',price:50,per:(b,c)=>c.hab==='wasser'?{pa:.2,ps:.2}:null},
  pate_wald:{icon:'🌿',price:50,per:(b,c)=>c.hab==='wald'?{pa:.2,ps:.2}:null},
  pate_wueste:{icon:'🏜️',price:50,per:(b,c)=>c.hab==='wueste'?{pa:.2,ps:.2}:null},
  pate_arktis:{icon:'🧊',price:50,per:(b,c)=>c.hab==='arktis'?{pa:.2,ps:.2}:null},
  pate_gebirge:{icon:'⛰️',price:50,per:(b,c)=>c.hab==='gebirge'?{pa:.2,ps:.2}:null},
  eufonds:{icon:'🇪🇺',price:52,per:(b,c)=>c.tags.includes('bedroht')?{ps:.4}:null},
  imbiss:{icon:'🌭',price:45,per:(b,c)=>c.cat==='essen'?{pa:.4}:null},
  naturbund:{icon:'🦋',price:45,per:(b,c)=>c.hab&&natCells(b.cells,c.hab)?{ps:.15*natCells(b.cells,c.hab)}:null},
  familie:{icon:'🎟️',price:45,per:(b,c)=>c.cat==='attr'?{pa:.3}:null},
  gross:{icon:'🏗️',price:50,per:(b,c)=>c.cat==='gehege'&&c.tags.includes('gross')?{pa:.3}:null},
  klein:{icon:'🐭',price:40,per:(b,c)=>c.cat==='gehege'&&b.cells.length===1?{pa:.25,ps:.25}:null},
  forschung:{icon:'🎓',price:45,per:(b,c)=>c.cat==='schutz'?{ps:.4}:null},
  vielfaltspreis:{icon:'🏆',price:55,
    mult:bs=>new Set(bs.filter(n=>isCat(n,'gehege')).map(n=>spK(n.key))).size>=8?{ms:1.25}:null},
  marketing:{icon:'🏙️',price:60,mult:()=>({ma:1.2})},
};
const ADS={
  plakat:{icon:'🪧',price:24,mult:()=>({ma:1.2})},
  social:{icon:'📱',price:20,per:(b,c)=>c.cat==='attr'?{pa:.4}:null},
  tv:{icon:'📺',price:28,mult:()=>({ma:1.3})},
  schule:{icon:'🎒',price:45,mult:()=>({ms:1.2})},
  foodfest:{icon:'🎪',price:20,per:(b,c)=>c.cat==='essen'?{pa:.5}:null},
};
// Saison-Ereignisse: k = Stärke des Nachteils (1 mild, 2 mittel, 3 hart)
const EVENTS={
  hitze:{icon:'☀️',se:[1],fx:k=>[`−${k} B|für jedes Wasser-Gehege`,'+1 B|für jedes Wüsten-Gehege'],per:(b,c,k)=>c.hab==='wasser'?{a:-k}:c.hab==='wueste'?{a:1}:null},
  regen:{icon:'🌧️',se:[0,1,2],fx:k=>[`−${k} B|für jede Attraktion`,'+1 N|für jedes Dschungel-Gehege'],per:(b,c,k)=>c.cat==='attr'?{a:-k}:c.hab==='wald'?{s:1}:null},
  demo:{icon:'🪧',fx:k=>[`−${k} B|für jede Attraktion`,'+1 N|für jedes bedrohte Tier'],per:(b,c,k)=>c.cat==='attr'?{a:-k}:c.tags.includes('bedroht')?{s:1}:null},
  kontrolle:{icon:'🦠',fx:k=>[`−${k} B|für jedes Gastro-Gebäude`],per:(b,c,k)=>c.cat==='essen'?{a:-k}:null},
  ferien:{icon:'🎒',alt:{0:['Osterferien'],1:['Sommerferien'],2:['Herbstferien'],3:['Weihnachtsferien']},fx:k=>['+1 B|für jedes Gastro-Gebäude und jede Attraktion'],per:(b,c)=>c.cat==='essen'||c.cat==='attr'?{a:1}:null},
  schnee:{icon:'🌨️',se:[3],fx:k=>[`−${k} B|für jede Attraktion`,'+1 B|für jedes Wasser-Gehege'],per:(b,c,k)=>c.cat==='attr'?{a:-k}:c.hab==='wasser'?{a:1}:null},
  frost:{icon:'🥶',se:[0,2,3],alt:{0:['Später Frost'],3:['Strenger Frost','❄️']},fx:k=>[`−${k} N|für jedes Savannen-Gehege`],per:(b,c,k)=>c.hab==='savanne'?{s:-k}:null},
  foerder:{icon:'💶',fx:k=>['+1 N|extra je Ausbaustufe eines Geheges/Gebäudes'],per:b=>(b.lvl||1)>1?{s:(b.lvl||1)-1}:null},
  baustelle:{icon:'🚧',hard:1,fx:k=>['−1 BP|am ersten Tag der Jahreszeit']},
  ausbruch:{icon:'🐺',hard:1,fx:k=>['doppelt|stören Raubtiere die Beutetiere daneben']},
};
const HABADJ={wasser:'Wasser',savanne:'Savannen',wald:'Dschungel',wueste:'Wüsten',arktis:'Arktis',gebirge:'Gebirgs'};
for(const h in HAB)EVENTS['doku_'+h]={name:'Doku im Fernsehen',icon:'📺',doku:1,fx:k=>[`+1 B|für jedes ${HABADJ[h]}-Gehege`],per:(b,c)=>c.hab===h?{a:1}:null};
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
const MAPS={
  wiese:{name:'Wiese',icon:'🌼',text:'Kompaktes Sechseck mit zufälligen Naturflächen.'},
  flusstal:{norot:true,name:'Flusstal',icon:'🏞️',text:'Lang und schmal. Ein Fluss schlängelt sich der Länge nach hindurch.'},
  bucht:{name:'Bucht',icon:'🏖️',text:'Ausgefranste Ufer mit Wasser- und Wüstenflächen am Rand.'},
  huegel:{name:'Zwei Hügel',icon:'⛰️',text:'Zwei Zoo-Bereiche mit Dschungel, verbunden durch Savanne.'},
  zerkluftet:{name:'Zerklüftet',icon:'🪨',text:'Unregelmäßiger Rand und viele Felsen. Für Fortgeschrittene.'},
};
// Spezialisten: Mitarbeiter mit Sonderregel, gelten für den ganzen Kampagnen-Lauf (höchstens 5)
const MAXSPEC=5,SPECPRICE=[0,20,35,50],SPECTIER=['','Gewöhnlich','Selten','Legendär'];
const halfHab=(bs,h)=>{const g=bs.filter(n=>isCat(n,'gehege'));return g.length>=4&&cnt(g,n=>isHab(n,h))*2>=g.length};
const SPEC={};
for(const h in HAB)SPEC['pfleger_'+h]={name:HABADJ[h]+'-Pflegerin',icon:HAB[h].icon,tier:1,fx:[`+15 % B und N|für jedes ${HABADJ[h]}-Gehege`],per:(b,c)=>c.hab===h?{pa:.15,ps:.15}:null};
Object.assign(SPEC,{
  gastro:{icon:'🍿',tier:1,per:(b,c,nb)=>c.cat==='essen'?{a:2*others(nb,b,n=>isCat(n,'essen'))}:null},
  kurator:{icon:'🗂️',gone:1,tier:2,mult:bs=>{const n=new Set(bs.filter(b=>isCat(b,'gehege')).map(b=>spK(b.key))).size,f=Math.min(1.6,1+.05*n);return f>1?{ma:+f.toFixed(2)}:null}},
  gaertner:{icon:'🌳',tier:1,per:(b,c,nb)=>c.cat==='schutz'?{s:2*others(nb,b,n=>isCat(n,'schutz'))}:null},
  animateur:{icon:'🎡',tier:1,per:(b,c,nb)=>c.cat==='attr'?{a:2*others(nb,b,n=>isCat(n,'attr'))}:null},
  kassenwart:{icon:'💰',tier:1,fx:['+3 Taler|jeden Tag']},
  kleintier:{icon:'🐭',tier:1,per:(b,c)=>c.cat==='gehege'&&b.cells.length===1?{pa:.2,ps:.2}:null},
  architekt:{icon:'📐',tier:1,per:(b,c)=>c.cat==='gehege'&&c.tags.includes('gross')?{pa:.15}:null},
  meeresbio:{icon:'🐧',tier:2,mult:bs=>halfHab(bs,'wasser')?{ms:1.5}:null},
  safari:{icon:'🦒',tier:2,mult:bs=>halfHab(bs,'savanne')?{ma:1.5}:null},
  foerster:{icon:'🌲',tier:2,mult:bs=>halfHab(bs,'wald')?{ms:1.5}:null},
  wuestenkenner:{icon:'🏜️',tier:2,mult:bs=>halfHab(bs,'wueste')?{ma:1.5}:null},
  polarkenner:{icon:'🧊',tier:2,mult:bs=>halfHab(bs,'arktis')?{ms:1.5}:null},
  bergkenner:{icon:'⛰️',tier:2,mult:bs=>halfHab(bs,'gebirge')?{ma:1.5}:null},
  dompteur:{icon:'🦁',tier:2,per:(b,c)=>c.tags.includes('raubtier')?{pa:.3}:null},
  artenschuetzer:{icon:'🐼',tier:2,per:(b,c)=>c.tags.includes('bedroht')?{ps:.25}:null},
  tierpfleger:{icon:'🤝',tier:2,per:(b,c,nb)=>c.cat==='schutz'?{s:2*cnt(nb,n=>has(n,'scheu'))}:null},
  bauleiterin:{icon:'📈',tier:2,per:b=>(b.lvl||1)>1?{pa:.15*((b.lvl||1)-1),ps:.15*((b.lvl||1)-1)}:null},
  sammler:{icon:'🧬',tier:2,per:(b,c,nb,all)=>{if(c.cat!=='gehege')return null;const h=vielfalt(all).lvl;return h>=2?{ps:.1}:null}},
  eventmanager:{icon:'🎪',tier:2,gone:1,fx:['keine|Nachteile durch Saison-Ereignisse, die Vorteile bleiben']},
  zwilling:{icon:'🔁',tier:3,fx:['100 %|statt 75 % für die zweite gleiche Anlage']},
  polier:{icon:'🧱',tier:3,fx:['+1 BP|jeden Tag','2 BP|kosten Karten mit nur 1 Feld am ersten Tag jeder Jahreszeit']},
  spekulant:{icon:'🎲',tier:3,mult:()=>({ma:1.3})},
  direktor:{icon:'👑',tier:3,mult:()=>({ma:1.15,ms:1.15})},
});
// ===== 0.92: Glücks-Spezialisten und Tobis Ideen (Name und Text stehen hier, nicht in TXT) =====
{const KN=(tag,f,key)=>bs=>{const n=cnt(bs,b=>isCat(b,'gehege')&&has(b,tag));const v=Math.min(1.6,1+f*n);return v>1?{[key]:+v.toFixed(2)}:null};
Object.assign(SPEC,{
  gluecksspielerin:{name:'Glücksspielerin',icon:'🃏',tier:2,luck:1/3,fx:['×1,5 B|mit 1 zu 3 Chance an jedem Tag'],mult:()=>{const L=LK();return L&&L.spec.gl?{ma:1.5}:null}},
  wettbuero:{name:'Wettbüro-Chef',icon:'🏇',tier:2,luck:1/2,fx:['×2 Eintritt|mit 1 zu 2 Chance an jedem Tag, sonst nichts']},
  glueckspilz:{name:'Glückspilz',icon:'🍀',tier:3,fx:['×2|alle Chancen im Zoo (1 zu 4 wird 1 zu 2)']},
  lotto:{name:'Lebensraum-Lotto',icon:'🎰',tier:2,fx:['×2|jeden Morgen für die Gehege eines ausgelosten Lebensraums']},
  mischer:{name:'Kartenmischer',icon:'🔄',tier:1,fx:['1×|jeden Tag gratis neue Handkarten ziehen']},
  spreng:{name:'Sprengmeisterin',icon:'🧨',tier:2,fx:['Felsen|können überbaut werden','🦴|manchmal liegt darunter ein Fossil (+20 Taler)']},
  vermesser:{name:'Vermesser',icon:'📏',tier:2,fx:['×2|jeden Tag für alles auf einer ausgelosten geraden Linie aus 5 Feldern']},
  umzug:{name:'Umzugshelfer',icon:'🚚',tier:1,fx:['0 BP|kostet das Umziehen']},
  wunsch:{name:'Wunscherfüllerin',icon:'🎈',tier:1,fx:['doppelt|Belohnungen der Besucherwünsche']},
  talent:{name:'Talentsucher',icon:'🔍',tier:1,fx:['×2,5|so oft kommen seltene Karten ins Angebot']},
  quer:{name:'Querdenkerin',icon:'🔀',tier:2,fx:['B ⇄ N|Attraktionen und Gastro: Grundwerte Besucher und Natur vertauscht']},
  ausw:{name:'Auswilderung',icon:'🌿',tier:2,fx:['×1,5 N|am Tag, an dem du ein Gehege auswilderst (1× pro Jahreszeit; es verschwindet aus Zoo und Deck)'],mult:()=>state&&state.auswDay===state.day+'/'+state.season?{ms:1.5}:null},
  rand:{name:'Panorama-Lage',icon:'🌄',tier:2,fx:['bis ×2|je Zoo ist ein Drittel der Randfelder Panorama-Lage (markiert); Gehege und Gebäude darauf zählen ×(1 + Anteil ihrer Felder dort)']},
  tagesfeld:{name:'Tagesfeld',icon:'⭐',tier:2,fx:['×3|jeden Tag für ein ausgelostes Feld, bebaut oder frei']},
  grosshand:{name:'Große Hand',icon:'🖐️',tier:2,fx:['6|Handkarten statt 5']},
  k_beute:{name:'Beute-Kennerin',icon:'🐇',tier:2,fx:['×1 N|+0,06 je Beutetier im Zoo (höchstens ×1,6)'],mult:KN('beute',.06,'ms')},
  k_raub:{name:'Raubtier-Kenner',icon:'🦷',tier:2,fx:['×1 B|+0,12 je Raubtier im Zoo (höchstens ×1,6)'],mult:KN('raubtier',.12,'ma')},
  k_scheu:{name:'Scheu-Kennerin',icon:'🙈',tier:2,fx:['×1 N|+0,1 je scheues Tier im Zoo (höchstens ×1,6)'],mult:KN('scheu',.1,'ms')},
  k_show:{name:'Show-Kenner',icon:'🎭',tier:2,fx:['×1 B|+0,1 je Showtier im Zoo (höchstens ×1,6)'],mult:KN('show',.1,'ma')},
  k_rot:{name:'Rote-Liste-Kennerin',icon:'🔴',tier:2,fx:['×1 N|+0,15 je bedrohtes Tier im Zoo (höchstens ×1,6)'],mult:KN('bedroht',.15,'ms')},
  doppel:{name:'Doppelgänger',icon:'🪞',tier:3,fx:['Kopie|wirkt wie der Spezialist rechts daneben in der Team-Reihe']},
  sammel:{name:'Sammlerstück',icon:'🏺',tier:1,fx:['2×|dürfen einzigartige Gebäude gebaut werden']},
  frieden:{name:'Friedensstifter',icon:'🕊️',tier:2,fx:['kein Stress|zwischen Raubtieren und Beutetieren']},
  ruhepol:{name:'Ruhepol',icon:'🧘',tier:1,fx:['kein Stress|für scheue Tiere']}})}
const bpBase=()=>BP+(hasSpec('polier')?1:0)+(CTX.zl&&CTX.zl.prof==='bau'?1:0);
