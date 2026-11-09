// Godot-Vorbereitung 2a–2c (Daten in daten/*.json): ein Spielstand aus 0.73a muss weiter laden und genau gleich weiterspielen.
//   node tests/jsddaten.js              -> prüft den Spielstand tests/daten/spielstand-0.73a.json gegen das aktuelle Spiel
//   node tests/jsddaten.js erzeuge      -> erzeugt den Spielstand neu (nur mit dem alten Stand 0.73a sinnvoll: ZF=pfad/zu/0.73a.html)
// Der Spielstand ist der komplette Gerätespeicher (localStorage) mit einem laufenden Zoolatro-Lauf (Zoo 2, mitten in einer Jahreszeit).
// Geprüft wird: Laden klappt, Lauf geht weiter, Wertung des Zoos gleich, und 3 weitere Bot-Tage mit festem Zufall ergeben dieselben Punkte.
const {JSDOM}=require('jsdom');const fs=require('fs'),path=require('path');
const FIX=path.join(__dirname,'daten','spielstand-0.73a.json');
const html=fs.readFileSync(process.env.ZF||path.join(__dirname,'..','build','zoodeck.html'),'utf8');
const mulberry=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m);
function dom(seed,store){return new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,
  beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,200));w.addEventListener('error',e=>console.log('WINERR',e.message));
    if(store)for(const k in store)w.localStorage.setItem(k,store[k]);w.Math.random=mulberry(seed)}})}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const bot=fs.readFileSync(path.join(__dirname,'bot7.js'),'utf8')+";BOT.zl=true;BOT.cur={zoos:[],built:0,cd:{},picked:{},specs:[],progs:[]};";
// 3 Bot-Tage weiterspielen, Tagespunkte zurückgeben
const weiter=w=>JSON.parse(w.eval(`(()=>{const out=[];let g=0;while(out.length<3&&g++<60){const ph=state.phase;
  if(ph==='play'){botDay();botScore();out.push({season:state.season,day:state.day,pts:state.lastDay,n:state.buildings.length});endDay()}
  else if(ph==='draft'){const base=scoreZoo(state.buildings).total;let bi=0,bv=-1e9;state.offer.forEach((k,i)=>{const b=botBest(k,base),v=b?b.g/costOf(k):-1;if(v>bv){bv=v;bi=i}});pick(bi)}
  else if(ph==='seasonWon'){state.pendingSeason=true;nextDraft()}else if(ph==='shop')botShop();else break}return JSON.stringify(out)})()`));
(async()=>{try{
  if(process.argv[2]==='erzeuge'){
    const d=dom(73,null);await wait(300);const w=d.window;w.eval(`window._keep=[render,renderModal,saveMeta];`);w.eval(bot);
    w.eval(`META.slots[0]={name:'Tobi',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);modal=null;runOf().fsIntro=0`);
    // Zoo 1 durchspielen, Belohnungen, dann in Zoo 2 bis Sommer Tag 3
    w.eval(`(()=>{let g=0;while(g++<400){const ph=state&&state.phase;if(!state)break;if(state.zoo>=1&&state.season>=1&&state.day>=2&&ph==='play')break;
      if(ph==='play'){botDay();botScore();endDay()}else if(ph==='draft'){pick(0)}else if(ph==='seasonWon'){state.pendingSeason=true;nextDraft()}else if(ph==='shop')botShop();
      else if(ph==='win'){finishGame();const run=META.slots[0].run;let h=0;while(run.reward&&h++<30){const a=run.reward;if(botClick('[data-vack]')||botClick('[data-cdack]')){}else if(a.step==='prev')botClick('[data-cprev]');else if(a.step==='perk'){if(!botClick('[data-cskip="perk"]'))break}else if(a.step==='card'){if(!botClick('[data-ccard]:not([disabled])'))botClick('[data-cskip="card"]')}else if(a.step==='trim')botClick('[data-cskip="trim"]');else if(a.step==='spec'){if(!botClick('[data-cspec]:not([disabled])'))botClick('[data-cstart]')}else if(a.step==='next'){botClick('[data-cstart]');break}else break}modal=null}
      else break}})()`);
    w.eval(`[render,renderModal,saveMeta]=window._keep;saveMeta()`);
    const store={};for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i);store[k]=w.localStorage.getItem(k)}
    const info=JSON.parse(w.eval(`JSON.stringify({version:VERSION,zoo:state.zoo,season:state.season,day:state.day,n:state.buildings.length,total:scoreZoo(state.buildings).total,spec:state.spec})`));
    d.window.close();
    // Erwartung: Laden in 0.73a und 3 Tage weiter
    const d2=dom(7373,store);await wait(300);const w2=d2.window;w2.eval(bot);w2.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};enterCamp(0,false,null,'z2');modal=null`);
    const total2=w2.eval('scoreZoo(state.buildings).total'),tage=weiter(w2);d2.window.close();
    fs.mkdirSync(path.dirname(FIX),{recursive:true});fs.writeFileSync(FIX,JSON.stringify({erzeugt_mit:info.version,stand:info,erwartet:{total:total2,tage},localStorage:store},null,1));
    L('Spielstand geschrieben:',JSON.stringify(info),'weiter:',JSON.stringify(tage));process.exit(0)}
  const F=JSON.parse(fs.readFileSync(FIX,'utf8'));
  const d=dom(7373,F.localStorage);await wait(300);const w=d.window;w.eval(bot);
  T(w.eval('!!META.slots[0]&&!!META.slots[0].run&&!!META.slots[0].run.z2'),'Spielstand '+F.erzeugt_mit+' geladen: Zoolatro-Lauf vorhanden');
  w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};enterCamp(0,false,null,'z2');modal=null`);
  T(w.eval('!!state&&state.zoo')===F.stand.zoo&&w.eval('state.season')===F.stand.season&&w.eval('state.buildings.length')===F.stand.n,`Lauf geht weiter (Zoo ${F.stand.zoo+1}, Jahreszeit ${F.stand.season+1}, ${F.stand.n} Gebäude)`);
  const tot=w.eval('scoreZoo(state.buildings).total');T(tot===F.erwartet.total,`Wertung gleich (${tot} / erwartet ${F.erwartet.total})`);
  // 0.75a: Tribüne ist legendär (kommt seltener ins Angebot). Für den Vergleich mit dem 0.73a-Ablauf gilt hier die alte Seltenheit.
  w.eval("if(CARDS.tribuene&&CARDS.tribuene.rar==='sehr selten')CARDS.tribuene.rar='selten'");
  const tage=weiter(w);T(JSON.stringify(tage)===JSON.stringify(F.erwartet.tage),`3 weitere Tage gleich: ${tage.map(t=>t.pts).join(', ')} (erwartet ${F.erwartet.tage.map(t=>t.pts).join(', ')})`);
  if(w.eval("typeof STUFEN_DATEN==='undefined'")){L('ok 2b-Prüfungen übersprungen (Stand ohne daten/stufen.json)');d.window.close();process.exit(0)}
  // 2b: Stufen wirken über Kennungen wie früher die festen Nummern (Ziel ×1,1 ab 2/5/8, 2 Goldfelder ab 3, 25 % teurer ab 4, kein Gratis-Neuziehen ab 6, −1 BP am 1. Tag ab 7)
  const st=JSON.parse(w.eval(`(()=>{const sl=META.slots[0],r0=sl.run,o=[];for(let s=1;s<=8;s++){sl.run=Object.assign({},r0,{stage:s});o.push([stOf(),stTF(),stW('gold',3),stW('teurer',1),!!stAb('kein_neuziehen'),stW('bp_erster_tag',0)])}sl.run=r0;return JSON.stringify(o)})()`));
  const soll=[1,2,3,4,5,6,7,8].map(s=>[s,(s>=2?1.1:1)*(s>=5?1.1:1)*(s>=8?1.1:1),s>=3?2:3,s>=4?1.25:1,s>=6,s>=7?1:0]);
  T(JSON.stringify(st)===JSON.stringify(soll),'Stufen 1–8 wirken wie vorher (Ziel, Goldfelder, Preise, Neuziehen, Baupunkte)');
  // 2b: alle Daten eingebaut, jede Kennung hat eine Wirkung
  const dt=JSON.parse(w.eval(`JSON.stringify({spec:Object.keys(SPEC).length===SPEZ_DATEN.spezialisten.length&&SPEZ_DATEN.spezialisten.every(d=>(!d.per||typeof SPEC[d.key].per==='function')&&(!d.mult||typeof SPEC[d.key].mult==='function')),
    food:Object.keys(FOOD).join()===FUTTER_DATEN.futter.map(d=>d.key).join()&&FUTTER_DATEN.futter.every(d=>!d.ok||typeof FOOD[d.key].ok==='function'),
    insp:Object.keys(INSP).join()===WINTER_DATEN.bedingungen.map(d=>d.key).join()&&Object.values(INSP).every(I=>typeof I.fx==='function'&&I.name),
    maps:Object.keys(MAPS).join()===GELAENDE_DATEN.gelaende.map(d=>d.key).join()&&MAPPOOL.every(m=>MAPS[m]),
    decks:Object.keys(DECKS).every(id=>DECKRULE[id]&&deckCards(id).every(k=>CARDS[k])),stages:STAGES.length===9})`));
  for(const k in dt)T(dt[k],'Daten '+k+' vollständig eingebaut');
  // 2c: Texte, Tutorial, Förderprogramme, Werbung, Ereignisse, Prägungen, Herausforderungen
  if(w.eval("typeof TUT_DATEN==='undefined'"))L('ok 2c-Prüfungen übersprungen (Stand ohne daten/tutorial.json)');
  else{const c=JSON.parse(w.eval(`JSON.stringify({texte:Object.keys(TXT.de).join()==='card,spec,insp,tagfx,event,rule,prog,ad',
    tutorial:Object.keys(TUT).join()===Object.keys(TUT_DATEN.kapitel).join()&&Object.values(TUT).every(K=>K.steps.every(st=>st.t&&(!st.done||typeof st.done==='function')&&(!st.setup||typeof st.setup==='function'))),
    tutorial_texte:!JSON.stringify(Object.values(TUT).map(K=>K.steps.map(st=>[st.t,st.h]))).includes('{'+'N}'),
    programme:Object.keys(PROGS).filter(k=>!PROGS[k].plus).join()===PROG_DATEN.programme.map(d=>d.key).join()&&Object.values(PROGS).every(P=>typeof(P.per||P.mult)==='function'&&P.name),
    werbung:Object.keys(ADS).join()===WERBUNG_DATEN.werbung.map(d=>d.key).join()&&Object.values(ADS).every(P=>typeof(P.per||P.mult)==='function'&&P.name),
    ereignisse:Object.keys(EVENTS).join()===EREIGNIS_DATEN.ereignisse.map(d=>d.key).join()&&Object.values(EVENTS).every(E=>E.name&&[1,2,3].every(k=>!JSON.stringify(E.fx(k)).includes('{k}'))),
    praegungen:Object.keys(PRAEG).join()===PRAEG_DATEN.praegungen.map(d=>d.key).join(),
    herausforderungen:Object.values(CHAL).every(C=>typeof C.ok==='function')&&RBFREE.length===CHAL_DATEN.regelbrecher_frei.length})`));
    for(const k in c)T(c[k],'Daten '+k+' vollständig eingebaut')}
  d.window.close();process.exit(0)
}catch(e){L('EXC',e.stack);process.exit(1)}})();
