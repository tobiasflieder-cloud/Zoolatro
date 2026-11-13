// 0.93: Fehler, Oberfläche, Zahlen, Winter neu, Auflagen, Freischalt-Vorschau
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1`);
 T(/^0\.9[3-9]$/.test(ev('VERSION')),'Version '+ev('VERSION'));
 // neuer Spielstand (0.91-Regeln: Freischalten über Ziele)
 ev(`META.slots[0]={name:'Neu',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.active=0;enterCamp(0,true,'grund',true,['wasser','savanne','wald','wueste'],NOPROF)`);
 // 0.79a: keine 3 Ziele je Lauf mehr
 T(!ev(`runOf().fsPick`)&&!ev(`runOf().fsIntro`),'Lauf startet ohne gezogene Freischalt-Ziele (seit 0.79a)');
 ev(`render()`);T(!/Freischalt-Ziele für diesen Lauf/.test(d.getElementById('modalRoot').textContent),'kein Fenster mit 3 Zielen vor dem Lauf');
 ev('modal=null');
 // (Gruppen „leichteste zuerst“ entfallen seit 0.79a)
 T(ev(`(()=>{const g=id=>FSG.find(x=>x.id===id);return g('d:freizeit').n===1&&g('d:geniesser').n===150&&g('g:polar').n===3&&g('g:alpen').n===5&&g('v:besucherlotse').n===1e5&&g('v:scheinwerfer').n===8&&g('c:kraken').n===6&&g('c:bueffel').n===7&&g('d:kueste').n===250&&g('d:kueste').fl==='wasserGeh'&&g('c:rentiere').n===6&&g('c:schmetterling').n===12})()`),'Ziel-Zahlen laut Tabelle 0.79a');
 // alle Kunststück-Ziele zählen in jedem Lauf
 ev(`(()=>{const r=runOf();modal=null;state.wishIntro=0;const F=BOARD.filter(([q,r])=>!TERR.get(hk(q,r)));const W=Object.keys(CARDS).filter(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab==='wasser'&&SHAPES[CARDS[k].shape].cells.length===1&&!CARDS[k].ms).slice(0,1);state.buildings=F.slice(0,8).map((c,i)=>({id:900+i,key:W[0],cells:[c],lvl:1}));fsCheck('season')})()`);
 T(ev(`!!fsOf(activeSlot())['g!c:kraken']`)&&!ev(`fsOf(activeSlot())['g!d:kueste']`),'Kunststück (Kraken, 6 Wasser) schaltet frei; Küste ist jetzt Fleiß (250 über alle Läufe)');
 T(ev(`(runOf().fsr||{})['c:kraken']`)>=6,'Fortschritt je Lauf gemerkt');
 T(/Als Nächstes/.test(ev(`(()=>{const sl=activeSlot();return fsRunHtml(sl.run,sl,'🔓 x')})()`)),'Übersicht „Als Nächstes“ für die Zusammenfassung nach dem Zoo');
 // Meilensteine, Reinheit, Kosten
 T(ev(`MILE.wasser.n===6&&MILE.attr.n===7&&MILE.essen.n===7&&MILE.schutz.n===7&&MILE.bunt.n===4&&PURN===4`),'Meilensteine 6 (Attraktion, Gastro, Naturschutz 7), Vielfalt-Meilenstein 4, Reinheit ab 4');
 T(/Ab 6 <b>verschiedenen/.test(ev(`mileInfoHtml()`)),'Meilenstein-Text nennt 6');
 const k3=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&!CARDS[k].ms&&SHAPES[CARDS[k].shape].cells.length===3&&!k.includes('^'))`),k4=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&!CARDS[k].ms&&SHAPES[CARDS[k].shape].cells.length===4&&!k.includes('^'))`);
 T(ev(`costOf('${k3}')`)===3&&ev(`costOf('${k4}')`)===3,`Kosten: 3er-Gehege 3 BP (${k3}), 4er-Gehege 3 BP (${k4})`);
 // Umziehen gratis, Abreißen
 ev(`state.phase='play';state.bp=4;state.freeMv=null;state.rule=null;syncCtx()`);
 T(ev(`moveCost()`)===0,'Umziehen: einmal am Tag gratis');
 ev(`(()=>{const b=state.buildings[0];startMove(b);const F=BOARD.filter(([q,r])=>!TERR.get(hk(q,r))&&!mkIndex(state.buildings).has(hk(q,r)));state.preview={q:F[5][0],r:F[5][1]};})()`);
 const mv=ev(`(()=>{const h=hypo();if(!h||!h.ok)return 'kein Ziel';build();return state.bp+'/'+moveCost()})()`);
 T(mv==='4/1',`Nach dem Gratis-Umzug kostet der nächste 1 BP (${mv})`);
 const dm=ev(`(()=>{const n=state.buildings.length,d0=state.deck.length,b0=state.bp,id=state.buildings[1].id;demolish(id);return [n-state.buildings.length,state.deck.length-d0,b0-state.bp].join()})()`);
 T(dm==='1,0,1',`Abreißen: weg (Karte nicht zurück ins Deck, seit 0.94), 1 BP (${dm})`);
 ev(`state.info=state.buildings[0].id;render()`);T(d.getElementById('btnDem').style.display==='grid'&&/Abreißen/.test(d.getElementById('btnDem').title),'Gebäude angetippt: 💥-Knopf „Abreißen“ (statt Text im Info-Kasten)');
 // Spezialisten-Gewichte 8/2/1
 const sw=ev(`(()=>{let c={1:0,2:0,3:0};for(let i=0;i<600;i++)for(const id of rollSpecs(3))c[SPEC[id].tier]++;const t=c[1]+c[2]+c[3];return c[1]/t})()`);T(sw>.55,'Spezialisten meist gewöhnlich: '+(sw*100).toFixed(0)+' %');
 // Winter
 T(ev(`!INSP.einmal&&['heiz','ruhe','inventur','glatteis','wenig','chaos','futter'].every(k=>INSP[k]&&INSP[k].name)`),'Winter: Artenzählung weg, 7 neue Bedingungen');
 ev(`(()=>{state.zl.insp='klein';state.zl.hard=true;state.season=3;syncCtx()})()`);
 const one=ev(`(()=>{const b={id:990,key:'flamingos',cells:[[0,0]],lvl:1},bs=[b];return evalB(b,bs,mkIndex(bs)).a})()`);T(one===0,'Platzprüfung verschärft (ab Zoo 3): 1-Feld zählt nicht');
 T(/verschärft ab Zoo 3/.test(ev(`inspText(state.zl)`)),'Text zeigt die verschärfte Fassung');
 ev(`state.zl.hard=false;syncCtx()`);T(ev(`(()=>{const b={id:990,key:'flamingos',cells:[[0,0]],lvl:1},bs=[b];return evalB(b,bs,mkIndex(bs)).a})()`)>0,'Platzprüfung normal: 1-Feld zählt halb');
 ev(`state.zl.insp='wenig';syncCtx()`);const wn=ev(`(()=>{const b={id:990,key:'zebras',cells:[[0,0],[1,0]],lvl:1},bs=[b],v=evalB(b,bs,mkIndex(bs));state.season=1;syncCtx();const v0=evalB(b,bs,mkIndex(bs));state.season=3;syncCtx();return [v.a,v0.a,v.s,v0.s].join()})()`).split(',').map(Number);
 T(Math.abs(wn[0]-Math.round(wn[1]*.7))<=1&&Math.abs(wn[2]-Math.round(wn[3]*1.2))<=1,'Wenig Besuch: B ×0,7, N ×1,2 ('+wn.join(',')+')');
 ev(`state.zl.insp='heiz';state.zl.hard=false;syncCtx()`);const h1=ev(`dayIncome(0,800,0).care`);ev(`state.zl.hard=true;syncCtx()`);const h2=ev(`dayIncome(0,800,0).care`);ev(`state.zl.insp='essen';syncCtx()`);const h0=ev(`dayIncome(0,800,0).care`);
 T(Math.abs(h1-h0*1.25)<=1&&Math.abs(h2-h0*1.5)<=1,`Heizkosten: Pflege ×1,25 / verschärft ×1,5 (seit 0.82a; ${h0} → ${h1} / ${h2})`);
 ev(`state.zl.insp='glatteis';syncCtx()`);T(ev(`moveCost()`)===99,'Glatteis: kein Umziehen im Winter');
 ev(`state.zl.insp='team';state.zl.hard=true;state.spec=['gaertner','tierarzt','gastro'];syncCtx()`);T(ev(`teamAct().length`)===2,'Teamsitzung verschärft: nur 2 Spezialisten');
 try{ev(`state.spec=[];state.zl.insp='futter';state.zl.hard=false;syncCtx()`)}catch(e){L('ERRF',e.stack.split('\n').slice(0,4).join(' | '))}T(ev(`(()=>{const F=BOARD.filter(([q,r])=>!TERR.get(hk(q,r)));const bs=F.slice(0,14).map((c,i)=>({id:700+i,key:'flamingos',cells:[c],lvl:1}));return topSet(bs,'top10').size})()`)===10,'Futterknappheit: nur 10 zählen');
 ev(`state.zl.insp='chaos';state.season=3;syncCtx();dayRoll()`);T(ev(`state.chaosB!=null`),'Schneechaos: ein Gebäude eingeschneit');
 T(ev(`seTarget(3,true,4)`)>ev(`seTarget(3,true,4)/1.1-1`)&&Math.abs(ev(`seTarget(3,true,4)/(SEASONS[3].target*Math.pow(ZLSEAS[3],4)*deckTF()*deckSF(3)*stTF()*ZLUP[3]*einTF(3))`)-1.1)<.02,'Zoo 5: Winterziel ×1,1 (0.80a: Einstieg Zoogründer herausgerechnet)');
 // Tauschen
 ev(`state.season=2;state.zl.insp='essen';state.zl.swapped=0;state.money=50;syncCtx()`);const i0=ev('state.zl.insp');ev(`wSwap()`);
 T(ev('state.zl.insp')!==i0&&ev('state.money')===20&&!ev('canWSwap()'),'Winter-Bedingung einmal für 30 Taler tauschen');
 // Auflagen
 T(ev(`!Object.keys(RULES).filter(k=>!RULES[k].gone).includes('rand')&&['einzel','gastro','viertel','grundl','anschl','schutzn','locker'].every(k=>RULES[k])`),'Auflagen: Randlage raus, 7 neue drin');
 const gk=ev(`Object.keys(CARDS).filter(k=>CARDS[k].cat==='essen'&&SHAPES[CARDS[k].shape].cells.length===1&&!CARDS[k].ms&&!k.includes('^'))[0]`);
 ev(`state.rule={id:'gastro'};state.season=0;syncCtx()`);T(/Gastronomische Vielfalt/.test(ev(`ruleWhy([{id:1,key:'${gk}',cells:[[0,0]]}],[[1,0]],'${gk}')||''`)),'Gastronomische Vielfalt: Gastro nicht nebeneinander');
 ev(`state.rule={id:'einzel'}`);T(/Weniger ist mehr/.test(ev(`ruleWhy([{id:1,key:'${gk}',cells:[[0,0]]}],[[5,0]],'${gk}')||''`)),'Weniger ist mehr: jedes Gebäude nur einmal');
 ev(`state.rule={id:'locker'}`);T(/Lockere/.test(ev(`ruleWhy([[1,0],[0,1],[-1,1],[-1,0]].map((c,i)=>({id:i+1,key:'flamingos',cells:[c]})),[[0,0]],'flamingos')||''`)),'Lockere Bebauung: höchstens 3 Nachbarn');
 ev(`state.rule={id:'grundl'}`);T(/Grundlage/.test(ev(`ruleWhy([{id:1,key:'flamingos',cells:[[1,0]]},{id:2,key:'zebras',cells:[[-1,0],[-2,0]]}],[[0,0]],'${gk}')||''`)),'Lebensraum als Grundlage: Gebäude nur an einen Lebensraum');
 ev(`state.rule={id:'halb',side:1};state.rule.mid=halfMid(BOARD)`);const hf=ev(`BOARD.filter(([q,r])=>halfOk(state.rule,q,r)).length/BOARD.length`);T(hf>.4&&hf<.65,'Bauabschnitte teilt in der Mitte: '+(hf*100).toFixed(0)+' % bebaubar');
 ev(`state.rule=null`);
 // Warteschlange
 ev(`(()=>{state.season=1;state.phase='play';modal=null;screen=null;const wp=document.getElementById('wishPop');if(wp)wp.remove();state.ruleIntro=0;document.querySelectorAll('.bigpop').forEach(e=>e.remove());state.wishIntro=0;POPQ=[];POPBUSY=false;activeSlot().popSeen={};state.bannerQ=[['🧪 Test eins!','A','t1','Erklärung A'],['🧪 Test zwei!','B','t2']];flushBanners()})()`);
 setTimeout(()=>{try{
  T(d.querySelectorAll('.popwin').length===1&&/Erklärung A/.test(d.querySelector('.popwin').textContent)&&/Test zwei/.test(d.querySelector('.popwin').textContent),'Erstes Mal: ein Fenster mit Erklärung, beide Meldungen darin');
  d.querySelector('.popwin button').click();
  setTimeout(()=>{try{
   T(d.querySelectorAll('.popwin').length===0,'Wartende Meldungen kommen zusammen in einem Fenster, danach keins mehr (seit 0.93)');
   ev(`state.bannerQ=[['🧪 Test eins!','A','t1']];flushBanners()`);
   setTimeout(()=>{try{
    T(d.querySelectorAll('.popwin').length===1&&!d.querySelector('.popwin .wph'),'Beim zweiten Mal Fenster ohne Erklärung');{const b=d.querySelector('.popwin button');if(b)b.click()}
    // Wünsche je Lauf, Momente, Liebling
    ev(`state.season=0;dayRoll()`);T(ev('state.fav')===null,'Besucherliebling erst ab Sommer');
    T(ev(`MOMW.foto===.5&&MOMW.storch===0`),'Fotograf halb so oft, Storch gestrichen (0.80a)');
    ev(`(()=>{const r=runOf();r.wishSeen=[];state.wish=null;wishRoll();const a=state.wish&&state.wish.id;state.zoo=1;state.wish=null;wishRoll();state.zoo=0})()`);T(ev(`runOf().wishSeen.length`)>=2&&new Set(ev(`JSON.stringify(runOf().wishSeen)`)&&JSON.parse(ev(`JSON.stringify(runOf().wishSeen)`))).size===ev(`runOf().wishSeen.length`),'Besucherwünsche wiederholen sich im Lauf nicht');
    // 0.77a: Formen gestrichen
    T(ev(`typeof shapesOf==='undefined'`),'Formen gibt es nicht mehr');
    // Oberfläche
    T(/Danke fürs Spielen/.test(ev(`flivHtml()`)),'„Danke fürs Spielen!“');
    T(ev(`(()=>{zoomSp='ab';placeZoomBtn();return document.getElementById('btnZoom').parentNode.classList.contains('actions')})()`),'Lupe sitzt in der Knopfleiste');
    ev(`state.spec=['gaertner'];runOf().spec=['gaertner'];state.phase='shop';state.mappe={opts:rollSpecs(3)};state.shopSub='mappe';modal='shop';render()`);T(/Dein Team 1\//.test(d.getElementById('modalRoot').textContent),'Bewerbermappe zeigt das Team');
    ev(`state.shopSub=null;state.phase='review';openShop();render()`);const m0=ev('state.money');
    const sb=d.querySelector('[data-msell]');T(!!sb,'Shop: Verkaufen-Knopf beim Team');
    if(sb){sb.click();d.querySelector('[data-msell]').click();T(ev('state.money')===m0+10&&ev('state.spec.length')===0,'Verkaufen: +10 Taler (gewöhnlich), Spezialist weg')}
    T(html.includes('<span class="indeck">schon ${nd}× im Deck</span>'),'Kartenwahl markiert „schon n× im Deck“');
    L('fertig')}catch(e){L('ERR',e.stack)}},2200)}catch(e){L('ERR',e.stack)}},1600)}catch(e){L('ERR',e.stack)}},900);
 }catch(e){L('ERR',e.stack)}},1500);
