// 0.96a: Stufen ×1,1, Futter beim Bauen/Ausbau, Art-Vergleiche, Zucht jeden Tag, Verstärker-Info, Deck-Mischung bei Spezialisten, Weltkarte
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=(seed,store)=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){if(store)for(const k in store)w.localStorage.setItem(k,store[k]);w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||90;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const slot=`{name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1,fs:{'h:arktis':1,'h:gebirge':1},z2:{st:{grund:4},ch:{}}}`;
const base=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.klassik=1;META.fbOff=1;META.d4=0;META.d5=0;META.stAll=0;META.pvOff=0;META.slots[0]=${slot};META.lastSlot=0;META.active=0;screen=null;`;
const start=(w,o={})=>w.eval(base+`META.wr=${o.wr?1:0};META.klassik=(${o.wr?1:0})?0:1;enterCamp(0,true,'${o.deck||'grund'}','z2',${JSON.stringify(o.habs||['wasser','savanne','wueste'])},NOPROF,${o.stage||1});if(!${o.wr?1:0}){modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;render()}`);
// Helfer im Spiel: freie Mitte A mit Ring N[0..5]; Karten nach Bedingung (1 Feld); Aufstellen; Zeilen der Wertung
const H=`TERR.clear();var A0=BOARD.find(([q,r])=>DIRS.every(([a,c])=>ONBOARD.has(hk(q+a,r+c))&&DIRS.every(([e,f])=>ONBOARD.has(hk(q+a+e,r+c+f)))));var NB=DIRS.map(([a,c])=>[A0[0]+a,A0[1]+c]);
var one=(f,n,ex)=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return!/[~^#]/.test(k)&&!c.ms&&!c.gone&&!c.jt&&!c.sig&&SHAPES[c.shape].cells.length===1&&f(c)&&!(ex||[]).includes(k)}).slice(0,n||1);
var anyk=(f,n)=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return!/[~^#]/.test(k)&&!c.ms&&!c.gone&&!c.jt&&!c.sig&&f(c)}).slice(0,n||1);
var put=L=>{state.buildings=L.map(([k,cell],i)=>({id:100+i,key:k,cells:[cell],lvl:1}));syncCtx();return state.buildings};
var lines=b=>breakdown(b,state.buildings).parts.map(p=>p.label).join(' | ');var team=L=>{runOf().spec=L.slice();state.spec=L.slice();syncCtx()};`;
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.96a','Version');
 start(w);ev(H);
 // 1. Stufen
 T(JSON.stringify(J(`(()=>{const r=runOf(),o=[];for(let s=1;s<=5;s++){r.stage=s;o.push(stW('teurer',1))}r.stage=1;return o})()`))==='[1,1,1,1,1]','Preise: Stufe 1–5 ohne Preissteigerung (0.98a)');
 // Karte mit passendem Futter (1 Feld, Gehege, Kraftfutter)
 const K0=J(`(()=>{const L=one(c=>c.cat==='gehege'&&fdFits('kf',Object.keys(CARDS).find(k=>CARDS[k]===c)),40);return L.find(k=>fdFits('kf',k))})()`);
 T(!!K0,'Testkarte gefunden: '+K0);
 const play=`state.rule=null;state.phase='play';state.bp=99;state.undo=[];state.builtToday=0;state.moving=null;state.info=null;`;
 // 2. gefütterte Handkarte bauen: Futter bleibt, Vorschau = Ergebnis
 const b1=J(`(()=>{put([]);${play}const fk=fdKey('${K0}','kf');state.hand=[fdKey('${K0}','kf'),'${K0}'];state.selected=1;state.rot=0;state.preview={q:A0[0],r:A0[1]};const h0=hypo();state.selected=0;const h1=hypo();if(!h1||!h1.ok)return{err:JSON.stringify(h1&&{ok:h1.ok,why:h1.why}),tp:typeof tutPvLock==="function"&&tutPvLock()};build();const b=state.buildings[0];if(!b)return{err:"nicht gebaut"};const st=scoreZoo(state.buildings).steps.find(s=>s.id===b.id);return{fk,key:b.key,u:h0.own,f:h1.own,st:{a:st.a,s:st.s}}})()`);
 T(b1.key===b1.fk&&b1.key.includes('#kf'),`gebaut mit Futter: ${b1.key}`);
 T(b1.f.a+b1.f.s>b1.u.a+b1.u.s&&Math.round(b1.st.a)===Math.round(b1.f.a)&&Math.round(b1.st.s)===Math.round(b1.f.s),`Vorschau mit Futter ${JSON.stringify(b1.f)} > ohne ${JSON.stringify(b1.u)}, gleich wie gebaut ${JSON.stringify(b1.st)}`);
 // 3. gefüttertes Gehege mit ungefütterter Karte ausbauen + Rückgängig
 const b2=J(`(()=>{const B=state.buildings[0];${play}state.hand=['${K0}'];state.selected=0;state.preview=previewAt({q:A0[0],r:A0[1]});const up=state.preview.up===B.id,h=hypo();build();const a={up,ok:h&&h.ok,lvl:B.lvl,key:B.key,hand:state.hand.length};undo();return Object.assign(a,{lvl2:B.lvl,key2:B.key,hand2:state.hand.slice()})})()`);
 T(b2.up&&b2.ok&&b2.lvl===2&&b2.key===b1.fk&&b2.hand===0,`gefüttertes Gehege ausbauen geht, Futter bleibt (${b2.key}, Stufe ${b2.lvl})`);
 T(b2.lvl2===1&&b2.key2===b1.fk&&b2.hand2[0]===K0,'Rückgängig: Stufe I, Karte zurück auf der Hand');
 // 4. Ausbau mit gefütterter Karte bringt Futter mit, Rückgängig nimmt es wieder weg
 const b3=J(`(()=>{put([['${K0}',A0]]);const B=state.buildings[0];${play}state.hand=[fdKey('${K0}','kf')];state.selected=0;state.preview=previewAt({q:A0[0],r:A0[1]});const h=hypo();build();const a={hk:h&&h.b&&h.b.key,key:B.key,lvl:B.lvl};undo();return Object.assign(a,{key2:B.key})})()`);
 T(b3.key===b1.fk&&b3.hk===b1.fk&&b3.lvl===2&&b3.key2===K0,`Ausbau mit gefütterter Karte: ${K0} → ${b3.key} (Vorschau ${b3.hk}), Rückgängig → ${b3.key2}`);
 // 5. Wiederholung und Einmalig nach Art
 const b4=J(`(()=>{put([[fdKey('${K0}','kf'),A0],['${K0}',NB[3]]]);return{dup:dupOf(state.buildings[1],state.buildings),same:sameArt(fdKey('${K0}','kf'),'${K0}~g'),bk:bldK(fdKey('${K0}~g','kf')+'^star')}})()`);
 T(b4.dup===1&&b4.same&&b4.bk===b1.fk,`Wiederholung erkennt gefüttert/ungefüttert (${b4.dup}), bldK ohne Ausgabe/Prägung (${b4.bk})`);
 // 6. Zucht: Paar (eins gefüttert, Stufe II) → Jungtier am Tagesende ohne Saisonziel, nächster Tag auf der Hand
 const jk=K0+'~j';
 const z=J(`(()=>{put([[fdKey('${K0}','kf'),A0],['${K0}',NB[0]]]);state.buildings[0].lvl=2;${play}state.day=0;state.seasonScore=0;state.z2jt=[];state.jtNext=[];const r=runOf();r.deck=r.deck.filter(k=>!CARDS[k]||!CARDS[k].jt);
   const zn=zuchtNow();endDay();const a={zn,deck:r.deck.includes('${jk}'),next:state.jtNext.slice(),born:state.z2born.slice(),seen:state.z2bornSeen,day:state.day,ph:state.phase,banner:document.body.textContent.includes('Nachwuchs!')};
   if(state.phase==='draft'){state.picks=0;advance()}a.day2=state.day;a.hand=state.hand.includes('${jk}');a.next2=(state.jtNext||[]).length;a.disc=state.discard.includes('${jk}');
   ${play}endDay();a.born2=state.z2born.length;return a})()`);
 T(z.zn.length===1&&z.deck&&z.born[0]===jk&&z.seen,`Paar gefüttert+ungefüttert → Jungtier ${jk} am Tagesende (ohne Saisonziel), im Lauf-Deck ${JSON.stringify(z)}`);
 T(z.banner,'Banner „🍼 Nachwuchs!“ sofort');
 T(z.day2===1&&z.hand&&z.next2===0&&!z.disc,`nächster Tag: Jungtier zusätzlich auf der Hand (Tag ${z.day2+1}), nicht in der Ablage`);
 T(z.born2===0,'eins pro Art und Zoo: am zweiten Tag kein weiteres');
 // 7. Nachwuchs (Weltreise-Auflage): heute geborenes zählt nur am letzten Wintertag
 const nw=J(`(()=>{state.rule={id:'z_nachwuchs'};put([[fdKey('${K0}','kf'),A0],['${K0}',NB[0]]]);state.z2born=['${jk}'];state.z2bornD=dayKeyNow();const o={};
   const sv=[state.season,state.day];state.season=SEASONS.length-1;state.day=DAYS-1;state.z2bornD=dayKeyNow();o.last=wrGoal().n;state.day=DAYS-2;o.before=wrGoal().n;state.day=DAYS-1;state.z2bornD='x';o.old=wrGoal().n;state.season=sv[0];state.day=sv[1];state.rule=null;return o})()`);
 T(nw.last===1&&nw.before===0&&nw.old===0,`Nachwuchs: am letzten Wintertag zählt das heute Geborene (${JSON.stringify(nw)})`);
 // 8. Verstärker antippen
 const vs=J(`(()=>{const g=one(c=>c.cat==='gehege',1)[0];put([['besucherlotse',A0],[g,NB[0]]]);${play}state.selected=null;state.preview=null;const o={};for(const pv of [0,1]){META.pvOff=pv;state.info=100;render();const inf=document.getElementById('info').innerHTML;o['p'+pv]={line:/⚡ Wirkt auf:.*×1,5 B/.test(document.getElementById('info').textContent),hl:!!document.querySelector('#board .hl'),badge:document.querySelectorAll('.badge').length}}META.pvOff=0;
   put([['besucherlotse',A0]]);state.info=100;render();o.none=document.getElementById('info').textContent.includes('Wirkt gerade auf kein');state.info=null;return o})()`);
 T(vs.p0.line&&vs.p0.hl&&vs.p0.badge>=2,`Verstärker angetippt: Info-Zeile, Hervorhebung, Zuwachs-Schild ${JSON.stringify(vs.p0)}`);
 T(vs.p1.line&&vs.p1.hl,`auch bei „Vorschau aus“ ${JSON.stringify(vs.p1)}`);
 T(vs.none,'ohne Nachbarn: „Wirkt gerade auf kein Nachbar-Gebäude.“');
 // 9. Deck-Mischung bei der Spezialisten-Wahl
 const sp=J(`(()=>{const ids=Object.keys(SPEC).filter(id=>!SPEC[id].rb).slice(0,3),o={};state.market={items:ids,bought:false};o.m=marketHtml().includes('spdmix');
   state.mappe={opts:ids,pro:0};state.shopSub='mappe';o.mp=shopHtml().includes('spdmix');state.mappe.pro=1;o.pro=shopHtml().includes('spdmix');state.shopSub=null;state.mappe=null;
   const run=runOf();run.reward={step:'spec',opts:ids};const sa=screenArg;screenArg=run.reward;o.cs=crewardHtml().includes('spdmix')&&crewardHtml().includes('Dein Deck ('+run.deck.length+' Karten)');screenArg=sa;return o})()`);
 T(sp.m&&sp.mp&&sp.pro&&sp.cs,`Deck-Mischung in Stellenmarkt, Mappe, Profi-Mappe, Auswahl zwischen den Zoos ${JSON.stringify(sp)}`);
 // 10. Weltkarte mit Merkmalen/Gebäuden
 dom.window.close();dom=neu(97);w=dom.window;d=w.document;ev=x=>w.eval(x);J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 start(w,{wr:1});
 const wm=J(`(()=>{const run=runOf();const sh=Object.keys(CARDS).find(k=>!/[~^#]/.test(k)&&(CARDS[k].tags||[]).includes('show')&&CARDS[k].cat==='gehege'),es=Object.keys(CARDS).find(k=>!/[~^#]/.test(k)&&CARDS[k].cat==='essen');run.deck.push(sh,es);const h=wrPickHtml(run,{},'');return{strip:h.includes('Deine Tiere und Gebäude'),show:/wrchip" title="Showtiere">🎭 \\d/.test(h),gastro:/title="Gastro">🍔 \\d/.test(h),D:deckMixData([sh,es])}})()`);
 T(wm.strip&&wm.show&&wm.gastro,`Weltkarte: Leiste „Deine Tiere und Gebäude“ mit 🎭 und 🍔 ${JSON.stringify(wm.D)}`);
 dom.window.close();
}catch(e){L('FAIL Absturz',e&&e.stack||e)}})();
