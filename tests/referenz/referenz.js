// Referenzfälle für die Wertung (Vorlage für einen Nachbau, z. B. in Godot)
//   node tests/referenz/referenz.js            -> prüft alle Fälle in tests/referenz/faelle/ gegen das aktuelle Spiel
//   node tests/referenz/referenz.js erzeuge    -> erzeugt die Fälle neu (Bot-Läufe mit festem Zufallswert + Sonderfälle)
// Liest das Spiel aus build/zoodeck.html (vorher python3 quelltext/mache.py) oder aus ZF=pfad.
// Ausgabe der Prüfung: je Fall "ok" oder "FAIL <fall>: <was abweicht>".
const {JSDOM}=require(require('path').join(__dirname,'..','node_modules','jsdom'));
const fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'faelle'),MODE=process.argv[2]||'pruefe';
const html=fs.readFileSync(process.env.ZF||path.join(__dirname,'..','..','build','zoodeck.html'),'utf8');
const mulberry=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function makeDom(seed){const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=()=>{};if(seed!=null)w.Math.random=mulberry(seed)}});return dom}
const wait=ms=>new Promise(r=>setTimeout(r,ms));

// ---- im Spiel: Fall laden und werten (gleich für Erzeugen und Prüfen) ----
const GAMESIDE=`
window.refLoad=F=>{for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};
  const run=JSON.parse(JSON.stringify(F.run));run.game=null;
  META.slots[0]={name:'Ref',created:1,last:1,game:null,perks:F.perks||{},games:0,ctype:{},v91:1,run};META.lastSlot=0;META.active=0;META.lastMode='camp';
  applySlot(META.slots[0]);screen=null;modal=null;if(!restoreGame(JSON.parse(JSON.stringify(F.game))))throw new Error('restoreGame');syncCtx()};
window.refEval=()=>{const bs=state.buildings,r=scoreZoo(bs);
  return{A:r.A,S:r.S,total:r.total,
    mults:r.mults.map(m=>({label:m.label,id:m.id,ma:m.ma||null,ms:m.ms||null})),
    buildings:bs.map((b,i)=>{const st=r.steps[i],bd=breakdown(b,bs);return{id:b.id,a:st.a,s:st.s,parts:bd.parts.map(p=>[p.label,p.a,p.s])}})}};
// lesbare Beschreibung des Falls (für den Nachbau)
window.refDescribe=()=>{const rotOf=b=>{const want=b.cells.map(c=>hk(...c)).sort().join('|');for(let rot=0;rot<6;rot++)for(const[q,r]of b.cells){
      const sh=rotCells(SHAPES[CARDS[b.key].shape].cells,rot);for(const[a0,b0]of sh){const cs=placeCells(b.key,rot,q-a0,r-b0);if(cs.map(c=>hk(...c)).sort().join('|')===want)return{rot,anchor:[q-a0,r-b0]}}}return{rot:null,anchor:null}};
  const Z=state.zl||{},run=runOf()||{};
  return{map:state.map,board:BOARD.map(([q,r])=>[q,r]),terrain:[...TERR].map(([k,v])=>[k,v]),
    gold:Z.gold||[],g4:Z.g4||[],crown:Z.crown||null,crown2:Z.crown2||[],
    zoo:state.zoo||0,season:state.season,seasonName:seOf(state.season).name,day:state.day,winter:!!seOf(state.season).winter,
    deck:run.deckId||'grund',stage:run.stage||null,z2:!!run.z2,habs:state.habs||null,zooProfile:Z.prof||null,
    winterCondition:Z.insp||null,winterHard:!!HARD(Z),winterHab:Z.inspHabs||null,
    specialists:(state.spec||[]).slice(),specialistsActive:teamNow(),habitatFood:run.fdl||{},
    progs:(state.progs||[]).slice(),ads:(state.ads||[]).slice(),events:(state.events||[]).map(e=>e.id||e),
    money:state.money,fav:state.fav,foto:state.foto,chaos:state.chaosB||null,
    buildings:state.buildings.map(b=>{const c=CARDS[b.key],ro=rotOf(b);return{id:b.id,key:b.key,base:baseK(b.key),cat:c.cat,hab:c.hab||null,shape:c.shape,
      grund:{B:c.a,N:c.s},cells:b.cells,rot:ro.rot,anchor:ro.anchor,lvl:b.lvl||1,food:fdOf(b.key),imprint:b.pr||null,edition:b.ed||null,traits:traitsOf(c),tags:c.tags}})}};
`;

async function evalCase(F){const dom=makeDom(1);await wait(250);const w=dom.window;w.eval(GAMESIDE);w.refLoad(F);const r=w.refEval();dom.window.close();return r}

// ---- Vergleich ----
function diff(exp,got){const out=[];const cmp=(p,a,b)=>{if(JSON.stringify(a)!==JSON.stringify(b))out.push(`${p}: erwartet ${JSON.stringify(a)}, jetzt ${JSON.stringify(b)}`)};
  cmp('A',exp.A,got.A);cmp('S',exp.S,got.S);cmp('total',exp.total,got.total);cmp('Multiplikatoren',exp.mults,got.mults);
  const G=new Map(got.buildings.map(b=>[b.id,b]));for(const b of exp.buildings){const g=G.get(b.id);if(!g){out.push(`Gebäude ${b.id} fehlt`);continue}cmp(`Gebäude ${b.id} B`,b.a,g.a);cmp(`Gebäude ${b.id} N`,b.s,g.s);cmp(`Gebäude ${b.id} Teile`,b.parts,g.parts)}
  return out}

async function pruefe(){const files=fs.readdirSync(DIR).filter(f=>f.endsWith('.json')).sort();let bad=0;
  for(const f of files){const F=JSON.parse(fs.readFileSync(path.join(DIR,f),'utf8'));let d;try{d=diff(F.erwartet,await evalCase(F))}catch(e){d=['EXC '+e.message]}
    if(d.length){bad++;console.log(`FAIL ${f}: ${d.slice(0,3).join(' | ')}${d.length>3?` (+${d.length-3})`:''}`)}else console.log('ok',f)}
  console.log(`${files.length-bad}/${files.length} Fälle gleich`);return bad}

// ---- Erzeugen ----
const BOTRUNS=[{seed:11,deck:'grund',stage:1},{seed:12,deck:'grund',stage:3},{seed:13,deck:'kueste',stage:1},{seed:14,deck:'steppe',stage:2},
  {seed:15,deck:'dschungel',stage:1},{seed:16,deck:'polar',stage:1},{seed:17,deck:'alpen',stage:5},{seed:18,deck:'grund',stage:8}];
async function botSnaps(R){const dom=makeDom(R.seed);await wait(250);const w=dom.window;
  let src=fs.readFileSync(path.join(__dirname,'..','bot7.js'),'utf8');
  const o1="const HB=shuffle(Object.keys(HAB)).slice(0,4);",o2="enterCamp(0,true,'grund',!!BOT.zl,HB)";if(!src.includes(o1)||!src.includes(o2))throw new Error('bot7 geändert');
  src=src.replace(o1,`const HB=(()=>{const T=(DECKS['${R.deck}']||{}).type,h=shuffle(Object.keys(HAB));if(T&&HAB[T]){const r=h.filter(x=>x!==T).slice(0,2);r.push(T);return r}return h.slice(0,3)})();`).replace(o2,`enterCamp(0,true,'${R.deck}','z2',HB,BOT.prof,${R.stage})`);
  w.eval(src);w.eval('BOT.zl=true');w.eval(GAMESIDE);
  w.eval(`window.SNAPS=[];const _ed=endDay;endDay=function(){try{const run=runOf();const g=JSON.parse(JSON.stringify(state));g.undo=[];const r=JSON.parse(JSON.stringify(run));r.game=null;r.t0=0;
    SNAPS.push({zoo:state.zoo||0,season:state.season,day:state.day,n:state.buildings.length,game:g,run:r,perks:JSON.parse(JSON.stringify(META.slots[0].perks||{})),live:scoreZoo(state.buildings).total})}catch(e){SNAPS.push({err:String(e)})}return _ed.apply(this,arguments)}`);
  try{w.eval('botRun()')}catch(e){console.log('Bot-Fehler',R.seed,String(e).slice(0,120))}
  const S=JSON.parse(w.eval('JSON.stringify(SNAPS.filter(s=>!s.err))'));dom.window.close();return S.map(s=>({...s,src:R}))}

const FEAT=[['krone',/Kronenfeld/],['herde',/Herde/],['innenhof',/Innenhof/],['allee',/Allee/],['dreieck',/Dreiländereck/],['fluss',/Fluss/],['nord',/Nordlage/],['gebirge',/Rand\/Felsen/],
  ['schutzgebiet',/Schutzgebiet/],['einzel',/Einzelgänger/],['gold',/Goldenes Feld/],['reinheit',/Reinheit/],['vielfalt',/Vielfalt/],['show',/Showtier/],['stress',/Gestresst/],
  ['futter',/Kraftfutter|Beeren|Möhrchen|Mehlwürmer|Großpackung|Honig|Fischmix|Steppenheu|Goldhafer/],['lebensraumfutter',/Stufe \d/],['ausbau',/Ausbau Stufe/],['doppelt',/zählt \d+ % des eigenen/],
  ['spezialist',/./],['kombo',/Kombo/],['freundschaft',/Freundschaft/],['liebling',/Besucherliebling/],['nachbarn',/-Nachbarn/],['naturflaeche',/-Naturfläche/],['winter',/❄️/]];
const featsOf=(r,F)=>{const L=[...r.mults.map(m=>m.label),...r.buildings.flatMap(b=>b.parts.map(p=>p[0]))].join('\n'),o=new Set();for(const[k,re]of FEAT){if(k==='spezialist'){if((F.game.spec||[]).length)o.add(k);continue}if(re.test(L))o.add(k)}return o};

async function erzeuge(){fs.mkdirSync(DIR,{recursive:true});for(const f of fs.readdirSync(DIR))if(f.endsWith('.json'))fs.unlinkSync(path.join(DIR,f));
  let pool=[];for(const R of BOTRUNS){const S=await botSnaps(R);pool=pool.concat(S);console.log('Bot-Lauf',R.seed,R.deck,'Stufe',R.stage,':',S.length,'Momentaufnahmen')}
  // jede Momentaufnahme frisch laden und werten; muss mit der Live-Wertung übereinstimmen
  const cand=[];for(const s of pool.filter((_,i)=>i%2===0||_.day===4)){const r=await evalCase(s);if(r.total!==s.live){console.log('WARN Laden ≠ live',s.src.seed,s.zoo,s.season,s.day,r.total,s.live);continue}cand.push({s,r,f:featsOf(r,s)})}
  // Auswahl: alle Merkmale abdecken, dazu Zoo/Jahreszeit streuen
  const pick=[],have=new Set(),key=c=>c.s.src.seed+'/'+c.s.zoo+'/'+c.s.season+'/'+c.s.day;
  for(const[k]of FEAT){if(have.has(k))continue;const c=cand.filter(c=>c.f.has(k)&&!pick.includes(c)).sort((a,b)=>b.f.size-a.f.size)[0];if(c){pick.push(c);c.f.forEach(x=>have.add(x))}}
  for(const zs of['0/0','0/1','0/2','0/3','1/0','1/1','1/2','1/3','2/0','2/1','2/2','2/3'])if(pick.length<20){const c=cand.find(c=>!pick.includes(c)&&c.s.zoo+'/'+c.s.season===zs&&c.s.day===4);if(c)pick.push(c)}
  console.log('fehlende Merkmale aus Bot-Läufen:',FEAT.map(f=>f[0]).filter(k=>!have.has(k)).join(', ')||'keine');
  let n=0;const save=async(name,F,r)=>{const dom=makeDom(1);await wait(250);const w=dom.window;w.eval(GAMESIDE);w.refLoad(F);const desc=w.refDescribe();dom.window.close();
    n++;const file=`${String(n).padStart(2,'0')}-${name}.json`,J=x=>JSON.stringify(x,null,1);
    fs.writeFileSync(path.join(DIR,file),`{"fall":${JSON.stringify(name)},\n"herkunft":${JSON.stringify(F.src||null)},\n"beschreibung":${J(desc)},\n"erwartet":${J(r)},\n"run":${JSON.stringify(F.run)},\n"perks":${JSON.stringify(F.perks||{})},\n"game":${JSON.stringify(F.game)}}\n`);return file};
  // Sonderfall bauen: Fall laden, im Spiel verändern, Stand zurückholen
  const craft=async(F,js)=>{const dom=makeDom(1);await wait(250);const w=dom.window;w.eval(GAMESIDE);w.refLoad(F);w.eval(js);const g=JSON.parse(w.eval('JSON.stringify(state)'));g.undo=[];const rr=JSON.parse(w.eval('JSON.stringify(runOf())'));rr.game=null;rr.t0=0;dom.window.close();return{...F,game:g,run:rr}};
  for(const c of pick)await save(`bot-s${c.s.src.seed}-${c.s.src.deck}-zoo${c.s.zoo+1}-jz${c.s.season+1}-tag${c.s.day+1}`,c.s,c.r);
  // Winter-Bedingungen: reichste Winter-Momentaufnahme, jede Bedingung (und verschärft, wo es eine verschärfte Fassung gibt)
  const wb=cand.filter(c=>c.s.season===3).sort((a,b)=>b.s.n-a.s.n)[0];
  if(wb){const dom=makeDom(1);await wait(250);const keys=JSON.parse(dom.window.eval('JSON.stringify(Object.keys(INSP).filter(k=>k!=="frei").map(k=>[k,!!INSP[k].ht]))'));dom.window.close();
    for(const[k,ht]of keys)for(const hard of ht?[false,true]:[false]){const F=JSON.parse(JSON.stringify(wb.s));F.src={...wb.s.src,winter:k,hard};F.game.zl.insp=k;F.game.zl.hard=hard?1:0;F.game.zl.inspOpts=undefined;
      if(k==='hab')F.game.zl.inspHabs=null;if(k==='chaos')F.game.chaosB=F.game.buildings[0].id;const r=await evalCase(F);await save(`winter-${k}${hard?'-verschaerft':''}`,F,r)}}
  // Futter: Einzelfutter auf den Gehegen (je eins, auch Jahreszeiten-Futter), Lebensraum-Futter Stufe 1–3
  for(const se of[1,2]){const base=cand.filter(c=>c.s.season===se).sort((a,b)=>b.s.n-a.s.n)[0];if(!base)continue;
    const F=await craft(base.s,`(()=>{const FL=['kf','be','mo','mw','gp','ho','fr','wm','kb','wv','gh','mi','le','kr','kn','sn'].filter(f=>FOOD[f]);let i=0;for(const b of state.buildings){const c=CARDS[b.key];if(c.cat!=='gehege'||c.ms)continue;const f=FL[i++%FL.length];if(!FOOD[f].ok||FOOD[f].ok(c))b.key=fdKey(b.key,f)}
      const r=runOf();r.fdl={};habsNow().forEach((h,j)=>{if(HFOOD[h])r.fdl[h]=j+1});syncCtx()})()`);F.src={...base.s.src,futter:true};const r=await evalCase(F);await save(`futter-jz${se+1}`,F,r)}
  // Goldfelder und Schimmernd (0.72a: multiplizieren): ein Gehege auf 2 Goldfeldern, ein anderes schimmernd auf einem Goldfeld
  {const base=cand.filter(c=>c.s.season===2).sort((a,b)=>b.s.n-a.s.n)[0];if(base){
    const F=await craft(base.s,`(()=>{const Z=state.zl,G=state.buildings.filter(b=>CARDS[b.key].cat==='gehege'&&!CARDS[b.key].ms);const b1=G.find(b=>b.cells.length>=2),b2=G.find(b=>b!==b1);
      const g=new Set(Z.gold);b1.cells.slice(0,2).forEach(c=>g.add(hk(...c)));if(b2){g.add(hk(...b2.cells[0]));b2.ed='s'}const b3=G.find(b=>b!==b1&&b!==b2);if(b3)b3.ed='ss';Z.gold=[...g];syncCtx()})()`);
    F.src={...base.s.src,gold:true};const r=await evalCase(F);await save('gold-schimmernd',F,r)}}
  console.log(n,'Fälle geschrieben nach',DIR)}

(async()=>{try{if(MODE==='erzeuge'){await erzeuge();process.exit(0)}else process.exit(await pruefe()?1:0)}catch(e){console.log('EXC',e.stack);process.exit(2)}})();
