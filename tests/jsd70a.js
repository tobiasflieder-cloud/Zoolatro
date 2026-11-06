// 0.70a: Tutorial-Pause in der Vorschau, Zurück-Knopf, kein Willkommen-Feld, Früh-geschafft-Kasten, Ziele +20 %, Lebensraum-Futter seltener
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
 const ck=s=>{const e=d.querySelector(s);if(!e)return false;e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));return true};
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};screen='tut';screenArg={};renderAll()`);
 T(ev('VERSION')==='0.70a','Version');
 // Werte
 T(ev('HFOODW')===4,'Lebensraum-Futter-Gewicht 4');
 T(ev(`(()=>{const a=[0,1,2,3].map(i=>seTarget(i,true,0,1)),Z=ZLUP.slice();ZLUP.splice(0,4,1,1,1,1);const b=[0,1,2,3].map(i=>seTarget(i,true,0,1));ZLUP.splice(0,4,...Z);return a[0]===b[0]&&[1,2,3].every(i=>Math.abs(a[i]/b[i]-1.2)<.02)})()`),'Zoolatro-Ziele: Frühling gleich, Sommer/Herbst/Winter +20 %');
 T(ev(`seTarget(1,false,0,1)===Math.round(SEASONS[1].target/100)*100||seTarget(1,false,0,1)===Math.round(SEASONS[1].target/1000)*1000`),'Freies Spiel: Ziele unverändert');
 // Tutorial starten
 ck('[data-tutch]');ev('render()');
 T(ev('state.tut&&state.tut.ch')==='zl','Tutorial läuft');
 T(d.getElementById('info').innerHTML===''&&!/Willkommen/.test(d.getElementById('info').textContent),'Kein Willkommen-Feld im Tutorial');
 // Zurück-Knopf
 T(!d.getElementById('tutBack')&&!!d.getElementById('tutMore'),'1. Häppchen: kein Zurück, aber Weiter');
 ck('#tutMore');ev('render()');T(ev('state.tut.k')===1&&!!d.getElementById('tutBack'),'2. Häppchen: Zurück da');
 ck('#tutBack');ev('render()');T(ev('state.tut.k')===0&&!d.getElementById('tutBack'),'Zurück führt zum 1. Häppchen');
 // Pause in der Vorschau: Zebras
 const zi=ev(`TUT.zl.steps.findIndex(s=>s.only==='zebras')`);
 T(ev(`!/Sehen Sie/.test(JSON.stringify(TUT.zl.steps[${zi+1}].t))`),'Alter Weiter-Schritt nach den Zebras entfernt');
 ev(`state.tut.i=${zi};state.tut.k=0;state.tut.pk=0;state.bp=4;if(!state.hand.includes('zebras'))state.hand.push('zebras');selectCard(state.hand.indexOf('zebras'));render()`);
 const place=`(()=>{const st=tutStep0(),rot=tutRotFor('zebras',st.at);state.rot=rot;for(const[q,r]of BOARD){const c=placeCells('zebras',rot,q,r);if(c&&tutCellsEq(c,st.at)){state.preview=previewAt({q,r});break}}render();return rot})()`;
 const rot=ev(place);
 T(ev('!!tutStep()._pv'),'Karte richtig gelegt: Pausen-Text aktiv');
 T(/Sehen Sie/.test(d.getElementById('coach').textContent),'Jasper sagt „Sehen Sie“ in der Vorschau');
 T(ev('tutPvLock()')&&d.getElementById('btnBuild').disabled,'Hammer gesperrt');
 const n0=ev(`state.buildings.length`);ev('build();render()');T(ev('state.buildings.length')===n0,'Bauen gesperrt, solange Häppchen offen');
 T(ev(`(()=>{const c=d=>document.querySelectorAll('#info .resbig.tutglow').length;return c()>0})()`)||ev(`tutGlowAll(tutStep()).includes('#info .resbig')`),'Vorschau-Werte leuchten');
 ev(`state.rot=(state.rot+1)%6;render()`);T(ev('!tutStep()._pv')&&!ev('tutPvLock()'),'Weggedreht: Pausen-Text wartet');
 ev(`state.rot=${rot};render()`);T(ev('!!tutStep()._pv'),'Zurückgedreht: Pausen-Text wieder da');
 ck('#tutMore');ev('render()');
 T(!ev('tutPvLock()')&&!d.getElementById('btnBuild').disabled&&d.getElementById('btnBuild').classList.contains('tutglow'),'Nach dem letzten Häppchen: 🔨 frei und leuchtet');
 ck('#tutBack');ev('render()');T(ev('tutPvLock()'),'Zurück in der Pause sperrt den Hammer wieder');ck('#tutMore');ev('render()');
 ev('build();render()');T(ev(`tB('zebras').length`)>=1&&ev('state.tut.i')>zi,'Zebras gebaut, nächster Schritt');
 // Bratwurst / Giraffe haben die Pause
 T(ev(`['bratwurst','giraffen'].every(k=>{const s=TUT.zl.steps.find(s=>s.only===k);return s&&s.pv&&s.pv.length>1})`),'Bratwurst und Giraffe mit Pause');
 T(ev(`(()=>{const i=TUT.zl.steps.findIndex(s=>s.only==='giraffen');return!/Schauen Sie/.test(JSON.stringify(TUT.zl.steps[i+1].t))})()`),'Alter Giraffen-Weiter-Schritt entfernt');
 // Früh geschafft im Zoolatro-Lauf
 ev(`META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund',true,['wasser','savanne','wueste'],NOPROF);modal=null;syncCtx();render()`);
 T(ev('!TUTNOW&&!!runOf()'),'Zoolatro-Lauf läuft');
 const box=ev(`(()=>{const r=runOf();r.gifts=[];r.bpCarry=0;state.earlyBonus=3*EARLY_BONUS;state.earlyInfo=earlyReward(3);return earlyBoxHtml()})()`);
 T(/Früh geschafft: noch 3 Tage übrig/.test(box)&&/\+3 Baupunkte/.test(box)&&/Umbau-Kiste/.test(box)&&/Reiter 🧰 Umbau/.test(box)&&/Taler/.test(box),'Früh-Kasten: Tage, Taler, Baupunkte, Geschenk mit Reiter');
 T(ev(`(()=>{const r=runOf();r.gifts=[];state.earlyInfo=earlyReward(4);return/Reiter 👥 Team/.test(earlyBoxHtml())})()`),'Profi-Mappe liegt im Reiter Team');
 T(ev(`(()=>{state.earlyR=null;return earlyBoxHtml()===''})()`),'Ohne frühes Schaffen kein Kasten');
 ev(`(()=>{const r=runOf();r.gifts=['gumb'];openShop();modal=null;META.shopT='run';render()})()`);
 T(/🎁/.test((d.querySelector('[data-shtab="umb"]')||{}).textContent||''),'Reiter Umbau zeigt 🎁');
 ev(`META.shopT='umb';render()`);T(d.querySelectorAll('.item.giftgo').length===1,'Geschenk leuchtet im Shop');
 ev(`(()=>{const f=fixedItems(),i=f.findIndex(x=>x.kind==='gumb');const b=document.querySelector('[data-item="f'+i+'"]');if(b)b.click();render()})()`);
 T(d.querySelectorAll('.item.giftgo').length===0&&!/🎁/.test((d.querySelector('[data-shtab="umb"]')||{}).textContent||''),'Genommen: kein Leuchten, kein Abzeichen');
}catch(e){L('EXC',e.stack)}process.exit(0)},300);
