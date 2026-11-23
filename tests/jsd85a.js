// 0.85a: 🌍 Weltreise-Modus (Schalter, Lauflänge, Auslosung, Gelände, Ziel-Auflagen, Auswilderung, Boni, Ablauf zwischen den Zoos, Wunsch nur im Sommer)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||85;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const base=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.klassik=1;META.fbOff=1;META.d4=0;META.d5=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;`;
const start=(w,wr,habs,stage)=>w.eval(base+`META.wr=${wr?1:0};META.klassik=(${wr?1:0})?0:1;enterCamp(0,true,'grund','z2',${JSON.stringify(habs||['wasser','savanne','wueste'])},NOPROF,${stage||1});`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.85a','Version');
 // 1. Schalter in der Lebensraum-Auswahl
 ev(base+`META.wr=0;META.klassik=(0)?0:1;screen='zlsetup';screenArg={slot:0,step:'habs',prof:NOPROF,opts:[],habs:[],z2:true};renderAll()`);
 const b=d.querySelector('[data-zswr]');T(!!b&&/Weltreise: aus/.test(b.textContent),'Schalter „🌍 Weltreise: aus“ in der Auswahl');if(b)b.click();
 T(ev('META.wr')===1&&/Weltreise: an/.test((d.querySelector('[data-zswr]')||{}).textContent||''),'Schalter schaltet an');
 start(w,1);T(ev('runOf().wr')===1,'Laufstart setzt run.wr');
 T(ev(`screen==='creward'&&screenArg.step==='wr'&&screenArg.first===1`),'vor Zoo 1: Kontinent-Wahl');
 T(!!d.querySelector('.wpin')&&!!d.querySelector('[data-wrgo]')&&/Wohin geht die Reise/.test(d.body.textContent),'Kontinent-Wahl wird angezeigt');
 T(J(`runOf().wrOpts.map(o=>o.lv||'')`).every(l=>l!=='schwer'),'vor Zoo 1 keine schweren Auflagen');
 // 2. Lauflänge
 T(ev('runGoal(runOf())')===4,'Lauflänge 4 ohne Arktis/Gebirge');
 T(ev(`(()=>{const sl=META.slots[0];fsOf(sl)['h:arktis']=1;const a=wrGoalN(sl);fsOf(sl)['h:gebirge']=1;const b=wrGoalN(sl);delete fsOf(sl)['h:arktis'];delete fsOf(sl)['h:gebirge'];return a===5&&b===6})()`),'Lauflänge 5 mit Arktis, 6 mit Gebirge');
 T(ev(`runGoal({})`)===ev('CAMP_GOAL'),'normaler Lauf: weiter 5 Zoos');
 // 3. Auslosung (viele Ziehungen)
 const roll=(n,z)=>J(`(()=>{const r=runOf(),o=[];const z0=r.zoo;r.zoo=${z};for(let i=0;i<${n};i++){const x=wrRollOpts0(r);o.push(x.map(q=>({k:q.k,lv:q.lv||null,rule:q.rule||null,rw:q.rw||null,eu:!!q.eu,foc:q.foc,nat:q.nat,n:q.plan.cells.length-q.plan.terr.filter(e=>e[1]==='block').length})))}r.zoo=z0;return o})()`);
 let R=roll(40,2);T(R.every(o=>o.length===3),'Stufe 1: immer 3 Ziele (40 Ziehungen)');
 T(R.every(o=>!o.filter(x=>!x.eu).every(x=>x.lv==='schwer')),'nie nur schwere Auflagen');
 T(R.some(o=>o.some(x=>x.lv==='schwer')),'schwere Auflagen kommen ab Zoo 2 vor');
 T(R.every(o=>new Set(o.map(x=>x.k)).size===o.length),'kein Kontinent doppelt in einer Wahl');
 T(R.every(o=>o.every(x=>x.eu||(x.lv==='leicht'?x.rw===null:!!x.rw))),'leicht ohne Belohnung, mittel/schwer mit');
 T(R.every(o=>o.every(x=>x.eu||x.lv!=='schwer'||['gold','helfer','forscher','boden'].includes(x.rw))),'schwer → dauerhafte Belohnung');
 T(R.every(o=>o.every(x=>x.eu||x.lv!=='mittel'||['mitbringsel','speisekammer','partner','praegung','bewerber','bau'].includes(x.rw))),'mittel → sofortige Belohnung');
 const R0=roll(30,0);T(R0.every(o=>o.every(x=>x.lv!=='schwer')),'vor Zoo 1 nie schwer (30 Ziehungen)');
 // Gelände: etwa die Hälfte Natur, davon 2/3 Schwerpunkt
 const all=[].concat(...R).filter(x=>!x.eu),nat=x=>Object.values(x.nat).reduce((a,b)=>a+b,0),half=all.map(x=>nat(x)/x.n),fq=all.map(x=>(x.nat[x.foc]||0)/Math.max(1,nat(x)));
 const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;L(`  Natur-Anteil ⌀ ${avg(half).toFixed(2)}, Schwerpunkt-Anteil ⌀ ${avg(fq).toFixed(2)}`);
 T(avg(half)>.33&&avg(half)<.47,'Gelände etwa zu 40 % Naturflächen (0.87a)');T(avg(fq)>.58&&avg(fq)<.75,'Schwerpunkt etwa zwei Drittel der Naturflächen');
 T(all.every(x=>Object.keys(x.nat).every(h=>['wasser','savanne','wueste'].includes(h))),'nur gewählte Lebensräume als Natur');
 // Kontinent ohne passenden Schwerpunkt fehlt, Europa füllt auf (ohne Auflage/Belohnung)
 start(w,1,['wueste','wald','gebirge']);
 const R2=J(`(()=>{const r=runOf(),o=[];r.zoo=2;for(let i=0;i<25;i++)o.push(wrRollOpts0(r).map(q=>({k:q.k,rule:q.rule||null,rw:q.rw||null,eu:!!q.eu,foc:q.foc})));r.zoo=0;return o})()`);
 T(R2.every(o=>!o.some(x=>x.k==='polar')),'Polargebiete fehlen ohne Arktis');
 start(w,1,['wueste','arktis','gebirge']);
 const R3=J(`(()=>{const r=runOf(),o=[];fsOf(META.slots[0])['h:arktis']=1;fsOf(META.slots[0])['h:gebirge']=1;r.wrRoute=['afrika','suedamerika','nordamerika','asien'].map((k,z)=>({k,ort:k,z}));r.zoo=4;for(let i=0;i<25;i++)o.push(wrRollOpts0(r).map(q=>({k:q.k,rule:q.rule||null,rw:q.rw||null,eu:!!q.eu,foc:q.foc})));r.zoo=0;r.wrRoute=[];return o})()`);
 T(R3.every(o=>!o.some(x=>['afrika','suedamerika','nordamerika','asien'].includes(x.k))),'schon besuchte Kontinente kommen nicht wieder');
 T(R3.every(o=>o.length===3&&o.some(x=>x.k==='europa')),'Europa füllt auf 3 auf');
 T(R3.every(o=>o.filter(x=>x.k==='europa').every(x=>!x.rule&&!x.rw&&!x.foc)),'Europa ohne Schwerpunkt, Auflage und Belohnung');
 T(R3.every(o=>o.filter(x=>x.k==='polar').every(x=>x.foc==='arktis')),'nur ein gewählter Schwerpunkt → dieser wird genommen');
 // Stufe 2 → 2 Ziele
 start(w,1,['wasser','savanne','wueste'],2);T(ev('runOf().wrOpts.length')===2,'ab Stufe 2 nur 2 Ziele');
 // 7. Ablauf: Ziel wählen, Boni
 start(w,1);ev(`(()=>{const r=runOf(),o=r.wrOpts[0];o.rw='gold';o.lv='schwer';o.rule='max3';o.plan.rule={id:'max3'}})()`);
 ev(`screenArg.wrSel=0;renderScreen()`);const go=d.querySelector('[data-wrgo]');T(!!go&&!go.disabled&&/reisen/.test(go.textContent),'Knopf „Nach … reisen“');if(go)go.click();
 T(ev(`screen===null&&!!state&&state.zoo===0`),'Zoo 1 startet nach der Wahl');
 T(J('runOf().boni').join()==='gold','dauerhafte Belohnung in run.boni');
 T(ev(`state.wrDest&&state.wrDest.k===runOf().wrRoute[0].k`),'Reiseziel im Zoo gespeichert');
 ev(`modal=null;render()`);T(/Willkommen/.test((d.getElementById('rulePop')||{}).textContent||''),'Einblendung „Willkommen“');
 const zb=ev(`zooBoxHtml()`),pf=ev(`(PROFT='lauf',profHtml())`);T(/Weltreise/.test(zb)&&/Goldader/.test(pf),'Zoo-Menü zeigt Reiseziel, Profil-Fenster die Boni (seit 0.93a)');
 // nächster Zoo: Goldader wirkt, wird nicht noch einmal angeboten
 ev(`(()=>{const r=runOf();r.zoo=1;r.wrOpts=null;wrRollOpts(r)})()`);
 T(J(`runOf().wrOpts.map(o=>o.plan.gold.length)`).every(n=>n===4),'Goldader: im nächsten Zoo 4 statt 3 Goldfelder');
 const Rb=J(`(()=>{const r=runOf(),o=[];for(let i=0;i<40;i++)o.push(...wrRollOpts0(r).map(q=>q.rw));return o})()`);T(!Rb.includes('gold'),'Goldader wird nicht noch einmal angeboten (40 Ziehungen)');
 T(ev(`(()=>{const r=runOf(),rk=p=>p.terr.filter(e=>e[1]==='block').length,one=()=>{const z=r.maps;r.maps={};const R0=Math.random;let S=7;Math.random=()=>{S=(S*9301+49297)%233280;return S/233280};try{const o=r.wrOpts[0];WRCTX={foc:o.foc,rule:null,rw:null};const p=rollPlan0(r);return rk(p)}finally{WRCTX=null;Math.random=R0;r.maps=z}};const a=one();r.boni=['gold','boden'];const b=one();r.boni=['gold'];return a-b===Math.min(3,a)})()`),'Leichter Boden: 3 Felsen weniger');
 T(ev(`(()=>{const r=runOf();r.boni.push('forscher');const n=rollMarket(2).length;r.boni.pop();return n===3})()`),'Gastforscher: +1 Bewerber im Stellenmarkt');
 T(ev(`(()=>{const r=runOf();r.boni.push('helfer');state.season=0;state.day=0;state.bpMax=4;startDay();const a=state.bp;r.boni.pop();state.day=0;startDay();return a-state.bp===1})()`),'Fleißige Helfer: +1 BP am 1. Tag');
 ev(`runOf().zoo=0`);
 // Prägungs-Schritt fehlt, Ablauf Karten → Team → Reiseziel
 T(J(`(()=>{const r=runOf(),a=newReward(r);return[a.step,!!a.cards,r.plan===null]})()`).join()==='card,true,true','nach dem Zoo: direkt Kartenwahl, kein Prägungs-Schritt, keine Vorschau');
 // 5. Ziel-Auflage: nicht erfüllt → gescheitert, erfüllt → geschafft
 const winter=(rule,lvl3,day)=>J(`(()=>{state.rule={id:'${rule}'};state.season=3;state.day=${day};state.phase='play';state.wrFail=0;const g=state.buildings.filter(b=>CARDS[b.key].cat==='gehege');state.buildings=[];const k=Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab==='wasser'&&!CARDS[k].ms);for(let i=0;i<${lvl3};i++)state.buildings.push({id:900+i,key:k,cells:[[i,0]],lvl:3});state.seasonScore=seOf(3).target+1;state.wish=null;try{endDay()}catch(e){return['EXC',String(e)]}return[state.phase,state.wrFail||0]})()`);
 let r1=winter('z_vorzeige',1,ev('DAYS')-1);T(r1[0]==='lost'&&r1[1]===1,`Vorzeigegehege 1/2 am letzten Wintertag → Zoo gescheitert (${r1})`);
 ev(`modal=null;renderModal()`);T(/Auflage nicht erfüllt/.test(d.getElementById('modalRoot').textContent),'eigener Text im Scheitern-Fenster');
 r1=winter('z_vorzeige',2,ev('DAYS')-1);T(r1[0]==='win','Vorzeigegehege 2/2 → Zoo geschafft');
 r1=winter('z_vorzeige',0,1);T(r1[0]!=='lost'&&r1[0]!=='win','Saisonziel früh erreicht, Auflage offen → es geht weiter');
 ev(`state.rule={id:'z_vorzeige'};state.season=3;state.phase='play';render()`);T(!!d.querySelector('.wrb.bad'),'Schild in der Leiste, im Winter rot');
 // 6. Auswilderung
 const aus=J(`(()=>{const r=runOf(),k=r.deck.find(k=>CARDS[k].cat==='gehege');state.rule={id:'auswild'};state.buildings=[{id:950,key:baseK(k),cells:[[0,0]],lvl:1}];state.wrAus={};state.season=1;state.day=0;state.phase='play';const n0=r.deck.length,c0=r.deck.filter(x=>baseK(x)===baseK(k)).length;wrAuswild();return{b:state.buildings.length,dn:n0-r.deck.length,dk:c0-r.deck.filter(x=>baseK(x)===baseK(k)).length,pop:!!state.wrAusPop}})()`);
 T(aus.b===0&&aus.dn===1&&aus.dk===1&&aus.pop,`Auswilderung: Gehege weg, Karte aus dem Lauf-Deck, Einblendung (${JSON.stringify(aus)})`);
 ev(`modal=null;state.ruleIntro=0;render()`);T(/Auswilderung/.test((d.getElementById('wrAusPop')||{}).textContent||''),'Auswilderung wird eingeblendet');
 T(ev(`(()=>{state.buildings=[{id:951,key:Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'),cells:[[0,0]],lvl:1}];wrAuswild();return state.buildings.length})()`)===1,'nur einmal je Jahreszeit');
 // 8. Wunsch nur im Sommer, neue Belohnungen
 T(J(`[0,1,2,3].map(s=>{state.season=s;return wishOn()})`).join()==='false,true,false,false','Weltreise: Besucherwunsch nur im Sommer');
 T(ev(`(()=>{state.season=1;return WISH.arten5.need===6&&WISH.arten5.se.includes(1)&&wRw({id:'hab2'})[1]===30})()`),'Weltreise: 6 Arten im Sommer, +30 Taler für 2 Gehege');
 T(ev(`(()=>{state.wpick=null;state.season=1;state.phase='play';modal=null;wishGive(['starW',1]);render();return !!document.querySelector('[data-wpk]')})()`),'Karte nach Wahl: Auswahl-Fenster');
 ev(`(()=>{const b=document.querySelector('[data-wpk]');b.click()})()`);T(ev(`!state.wpick&&[...state.deck,...state.discard].some(k=>String(k).includes('^star'))`),'gewählte Karte ist ⭐ Star');
 // 10. normaler Modus unverändert
 start(w,0);T(ev(`!runOf().wr&&screen===null&&!!state`),'normaler Lauf startet ohne Kontinent-Wahl');
 T(J(`[0,1,2,3].map(s=>{state.season=s;return wishOn()})`).join()==='true,true,true,false','normaler Lauf: Wünsche Frühling bis Herbst');
 T(ev(`newReward(runOf()).step`)==='prev','normaler Lauf: Vorschau-Schritt bleibt');
 T(J(`(()=>{const o=new Set();for(let i=0;i<400;i++)o.add(ruleRoll());return[...o]})()`).every(id=>!['auswild','z_ausbau','z_vielfalt','z_schlemmer','z_rummel','z_arten','z_vorzeige','z_nachwuchs'].includes(id)),'normaler Lauf: keine Weltreise-Auflagen');
 T(ev(`(()=>{state.season=1;return WISH.arten5.need===5&&!WISH.arten5.se.includes(1)&&wRw({id:'hab2'})[1]===15})()`),'normaler Lauf: Wünsche wie bisher');
 // Baugrube: 5 zusammenhängende Felder
 const bg=J(`(()=>{const o=[];for(let i=0;i<20;i++){state.rule={id:'achse'};initRule();const ax=state.rule.ax||[];const S=new Set(ax),seen=new Set([ax[0]]),st=[ax[0]];while(st.length){const[q,r]=st.pop().split(',').map(Number);for(const[a,b]of DIRS){const k=hk(q+a,r+b);if(S.has(k)&&!seen.has(k)){seen.add(k);st.push(k)}}}o.push([ax.length,seen.size,ax.every(k=>ONBOARD.has(k)&&TERR.get(k)!=='block')])}return o})()`);
 T(bg.every(x=>x[0]===5&&x[1]===5&&x[2]),'Baugrube: 5 zusammenhängende freie Felder (20 Versuche)');
 T(ev(`RULES.achse.name==='Baugrube'&&RULES.achse.icon==='🚧'`),'Sichtachse heißt jetzt 🚧 Baugrube');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
