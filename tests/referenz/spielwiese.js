// Referenzfälle für den Godot-Prototyp „Spielwiese“ (godot/)
// Wertet zufällige, gültige Aufstellungen der 12 Spielwiesen-Karten mit dem echten HTML-Spiel im Tutorial-Rahmen
// (keine Merkmale/Stress/Show, Lebensraum-Regel nur Savanne-Herde, Frühling, keine Spezialisten, keine Ereignisse).
//   node tests/referenz/spielwiese.js            -> prüft tests/referenz/spielwiese/*.json gegen das aktuelle Spiel
//   node tests/referenz/spielwiese.js erzeuge    -> erzeugt sie neu (fester Zufallswert)
// Dateien „rein-*“ enthalten nur: Grundwert, Nachbarn gleichen Lebensraums, Naturfläche, Kartenbonus, Goldfeld, Kronenfeld, Herde.
// Dateien „voll-*“ enthalten zusätzlich Mehrfach-Bau, „extra-*“ (dicht gebaut) Freundschaft, Innenhof/Allee/Dreiländereck, Nilpferd-Kombo.
const {JSDOM}=require(require('path').join(__dirname,'..','node_modules','jsdom'));
const fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'spielwiese'),MODE=process.argv[2]||'pruefe';
const html=fs.readFileSync(process.env.ZF||path.join(__dirname,'..','..','build','zoodeck.html'),'utf8');
const mulberry=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const KEYS=['zebras','giraffen','elefanten','flamingos','otter','nilpferde','fennek','bratwurst','popcorn','gruen','delfinshow','streichelzoo'];
const PURE=/-Nachbarn|-Naturfläche|Kartenbonus|Goldenes Feld|Herde/;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function game(){const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=()=>{}}});await wait(250);const w=dom.window;
  w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;startGuide();modal=null;screen=null;
  window.swSetup=F=>{setBoard(F.board);TERR=new Map(F.terrain);state.board=BOARD;state.terr=[...TERR];state.zl.gold=F.gold.slice();state.zl.g4=[];state.zl.crown=F.crown;state.zl.crown2=[];
    state.season=0;state.day=0;state.spec=[];state.events=[];state.progs=[];state.ads=[];state.fav=null;state.foto=null;state.nests=[];state.tutHerd=1;state.zl.insp='frei';
    state.buildings=F.buildings.map(b=>({id:b.id,key:b.key,cells:b.cells.map(c=>c.slice()),lvl:1}));state.nextId=99;syncCtx()};
  window.swEval=()=>{const bs=state.buildings,r=scoreZoo(bs);return{A:r.A,S:r.S,total:r.total,mults:r.mults.map(m=>({label:m.label,ma:m.ma||null,ms:m.ms||null})),
    buildings:bs.map((b,i)=>({id:b.id,a:r.steps[i].a,s:r.steps[i].s,parts:breakdown(b,bs).parts.map(p=>[p.label,p.a,p.s])}))}};`);
  return dom}

// Gelände wie in godot/skripte/gelaende.gd: Wiese Radius 5, Naturflecken Wasser/Savanne/Wüste, 2 Felsen, 3 Goldfelder, 1 Krone
function makeMap(rnd){const disc=[];for(let q=-5;q<=5;q++)for(let r=-5;r<=5;r++)if(Math.abs(q+r)<=5)disc.push([q,r]);
  const hk=(q,r)=>q+','+r,DIRS=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]],terr=new Map(),pick=a=>a[Math.floor(rnd()*a.length)];
  const free=k=>!terr.has(k),inB=new Set(disc.map(c=>hk(...c)));
  for(const[h,n]of[['wasser',4],['savanne',4],['wueste',3]]){for(let t=0;t<50;t++){const s=pick(disc),k=hk(...s);if(!free(k))continue;const p=[s];terr.set(k,h);
    for(let g=0;g<40&&p.length<n;g++){const[q,r]=pick(p),[dq,dr]=pick(DIRS),k2=hk(q+dq,r+dr);if(inB.has(k2)&&free(k2)){terr.set(k2,h);p.push([q+dq,r+dr])}}break}}
  for(let i=0;i<2;i++){for(let t=0;t<50;t++){const k=hk(...pick(disc));if(free(k)){terr.set(k,'block');break}}}
  const plain=disc.map(c=>hk(...c)).filter(free);const crown=pick(plain);const gold=[];for(let t=0;t<200&&gold.length<3;t++){const k=pick(plain);if(k!==crown&&!gold.includes(k))gold.push(k)}
  return{board:disc,terrain:[...terr],gold,crown}}

async function erzeuge(){fs.mkdirSync(DIR,{recursive:true});for(const f of fs.readdirSync(DIR))if(f.endsWith('.json'))fs.unlinkSync(path.join(DIR,f));
  const rnd=mulberry(20261108),dom=await game(),w=dom.window;let pure=0,full=0,extra=0,tries=0;const seen=new Set();
  while((pure<5||full<5||extra<5)&&tries++<6000){const dense=pure>=5&&full>=5;const M=makeMap(rnd);w.swSetup({...M,buildings:[]});
    // zufällig gültig bauen (wie ein Spieler): 6–12 Karten, Drehung und Anker zufällig, Platz mit fits() des Spiels
    const n=(dense?10:6)+Math.floor(rnd()*7),bs=[];let id=1;
    for(let i=0;i<n;i++){const key=KEYS[Math.floor(rnd()*KEYS.length)];for(let t=0;t<60;t++){const rot=Math.floor(rnd()*6);let[q,r]=M.board[Math.floor(rnd()*M.board.length)];
      if(dense&&bs.length){const c=bs[Math.floor(rnd()*bs.length)].cells[0];q=c[0]+Math.floor(rnd()*5)-2;r=c[1]+Math.floor(rnd()*5)-2}
      const cells=JSON.parse(w.eval(`JSON.stringify(placeCells(${JSON.stringify(key)},${rot},${q},${r}))`));
      if(w.eval(`fits(state.buildings,${JSON.stringify(cells)},${JSON.stringify(key)})`)){bs.push({id:id++,key,cells,rot,anchor:[q,r]});w.swSetup({...M,buildings:bs});break}}}
    const res=w.swEval(),labels=[...res.mults.map(m=>m.label),...res.buildings.flatMap(b=>b.parts.map(p=>p[0]))];
    const isPure=labels.every(l=>PURE.test(l)||/Kronenfeld/.test(l)),hasCrown=res.mults.some(m=>/Kronenfeld/.test(m.label)),hasGold=labels.some(l=>/Goldenes/.test(l)),hasHerd=labels.some(l=>/Herde/.test(l));
    const others=labels.filter(l=>!PURE.test(l)&&!/Kronenfeld/.test(l));
    if(others.some(l=>!/Freundschaft|Innenhof|Allee|Dreiländereck|Kombo|des eigenen Werts/.test(l)))continue; // etwas Unerwartetes: nicht verwenden
    let name=null;
    if(isPure&&pure<5&&(pure>0||hasCrown)&&(pure!==1||hasGold)&&(pure!==2||hasHerd))name=`rein-${++pure}`;
    else if(!isPure&&!dense&&full<5)name=`voll-${++full}`;
    else if(dense&&extra<5){const ft=['Freundschaft','Innenhof','Allee','Dreiländereck','Kombo'].filter(x=>labels.some(l=>l.includes(x)));const nf=ft.find(x=>!seen.has(x));if(nf||(ft.length>=2&&seen.size>=5)){ft.forEach(x=>seen.add(x));name=`extra-${++extra}`}}
    if(!name)continue;
    const F={fall:name,regeln:isPure?'rein':'voll',...M,buildings:bs,erwartet:res};
    fs.writeFileSync(path.join(DIR,name+'.json'),JSON.stringify(F,null,1));console.log(name,'Gebäude',bs.length,'Punkte',res.total,'Krone',hasCrown,'Gold',hasGold,'Herde',hasHerd,others.length?'+ '+[...new Set(others.map(l=>l.split(':')[0].split(' ').slice(0,2).join(' ')))].join(', '):'')}
  dom.window.close();console.log('fertig nach',tries,'Versuchen')}

async function pruefe(){const dom=await game(),w=dom.window;let bad=0;const files=fs.readdirSync(DIR).filter(f=>f.endsWith('.json')).sort();
  for(const f of files){const F=JSON.parse(fs.readFileSync(path.join(DIR,f),'utf8'));w.swSetup(F);const r=w.swEval();const ok=JSON.stringify(r)===JSON.stringify(F.erwartet);if(!ok)bad++;console.log(ok?'ok':'FAIL',f,ok?'':`erwartet ${F.erwartet.total}, jetzt ${r.total}`)}
  dom.window.close();console.log(`${files.length-bad}/${files.length} Spielwiesen-Fälle gleich`);return bad}

(async()=>{try{if(MODE==='erzeuge'){await erzeuge();process.exit(0)}else process.exit(await pruefe()?1:0)}catch(e){console.log('EXC',e.stack);process.exit(2)}})();
