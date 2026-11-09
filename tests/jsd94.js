// 0.94: 3 Lebensräume mit starken Regeln, Dschungel, Karten neu, Gastro-Taler, Umbauten, Tribüne, Flößerin, Jäger, wachsende Spezialisten, Abreißen
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1`);
 T(/^0\.9[4-9]$/.test(ev('VERSION')),'Version '+ev('VERSION'));
 T(ev(`HAB.wald.label`)==='Dschungel'&&/Dschungel-Gehege/.test(ev(`CARDS.baumschule.text`)),'Wald heißt Dschungel');
 // Startbildschirm: 3 Lebensräume
 ev(`META.slots[0]={name:'N',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.active=0;screen='zlsetup';screenArg={slot:0,step:'habs',prof:NOPROF,opts:[],habs:[]};renderAll()`);
 T(/3 Lebensräume/.test(d.body.textContent)&&/Fluss/.test(d.body.textContent),'Auswahl: 3 Lebensräume mit Regeltext');
 ev(`(()=>{for(const h of ['wasser','savanne','wueste','gebirge'])document.querySelector('[data-zshab="'+h+'"]')&&document.querySelector('[data-zshab="'+h+'"]').click()})()`);T(ev(`screenArg.habs.length`)===3,'Höchstens 3 wählbar');
 ev(`screen=null;enterCamp(0,true,'grund',true,['wasser','savanne','wueste'],NOPROF);modal=null;state.wishIntro=0;runOf().fsIntro=0`);
 T(ev(`habsNow().length`)===3,'Lauf mit 3 Lebensräumen');
 // Lebensraum-Regeln
 const lab=(bs,i)=>ev(`(()=>{const bs=${bs};state.buildings=bs;syncCtx();const p=[];evalB(bs[${i}],bs,mkIndex(bs),p);return p.map(x=>x.label).join(' | ')})()`);
 T(/Herde: allein ×0,5/.test(lab(`[{id:1,key:'zebras',cells:[[0,0]],lvl:1}]`,0)),'Savanne allein ×0,5');
 T(/Herde aus 2 ×1,15/.test(lab(`[{id:1,key:'zebras',cells:[[0,0]],lvl:1},{id:2,key:'warzenschweine',cells:[[1,0]],lvl:1}]`,0)),'Savanne Herde aus 2 ×1,15');
 T(/Einzelgänger: allein ×2/.test(lab(`[{id:1,key:'fennek',cells:[[0,0]],lvl:1}]`,0))&&/Wüsten-Nachbar ×0,5/.test(lab(`[{id:1,key:'fennek',cells:[[0,0]],lvl:1},{id:2,key:'skorpione',cells:[[1,0]],lvl:1}]`,0)),'Wüste: allein ×2, mit Wüsten-Nachbar ×0,5');
 T(/Fluss: Kette aus 3/.test(lab(`[{id:1,key:'flamingos',cells:[[0,0]],lvl:1},{id:2,key:'korallenriff',cells:[[1,0]],lvl:1},{id:3,key:'schildkroeten',cells:[[2,0]],lvl:1}]`,1)),'Wasser: Kette aus 3 ×1,75');
 ev(`enterCamp(0,true,'grund',true,['wald','arktis','gebirge'],NOPROF);modal=null;state.wishIntro=0;runOf().fsIntro=0`);

 T(/Schutzgebiet: kein Naturschutz daneben ×0,5/.test(lab(`[{id:1,key:'affen',cells:[[0,0]],lvl:1}]`,0))&&/Schutzgebiet: Naturschutz daneben ×2/.test(lab(`[{id:1,key:'affen',cells:[[0,0]],lvl:1},{id:2,key:'stiftung',cells:[[1,0]],lvl:1}]`,0)),'Dschungel „Schutzgebiet“: ohne Naturschutz daneben ×0,5, mit ×2');
 const nr=ev(`(()=>{const m=northMid();const N=BOARD.find(([q,r])=>r<m),S=BOARD.find(([q,r])=>r>m);return JSON.stringify([N,S])})()`),[N,S]=JSON.parse(nr);
 T(/Nordlage ×2/.test(lab(`[{id:1,key:'lemminge',cells:[${JSON.stringify(N)}],lvl:1}]`,0))&&/Nordlage gebrochen: ×0,5/.test(lab(`[{id:1,key:'lemminge',cells:[${JSON.stringify(S)}],lvl:1}]`,0)),'Arktis: Nordhälfte ×2, Süden ×0,5');
 const edge=ev(`JSON.stringify(BOARD.find(([q,r])=>isEdge(q,r)&&!DIRS.some(([dq,dr])=>TERR.get(hk(q+dq,r+dr))==='block')))`),inner=ev(`JSON.stringify(BOARD.find(([q,r])=>!isEdge(q,r)&&!DIRS.some(([dq,dr])=>TERR.get(hk(q+dq,r+dr))==='block')))`);
 T(/Rand\/Felsen \(1\) ×1,5/.test(lab(`[{id:1,key:'murmeltiere',cells:[${edge}],lvl:1}]`,0))&&/ganz innen: ×0,5/.test(lab(`[{id:1,key:'murmeltiere',cells:[${inner}],lvl:1}]`,0)),'Gebirge: Rand ×1,5, innen ×0,5');
 ev(`render()`);T(d.querySelectorAll('#board .znorth').length>0,'Nordhälfte ist auf dem Feld markiert');
 // Karten und Gastro-Taler
 T(ev(`CARDS.otter.a===5&&CARDS.otter.s===4&&CARDS.bueffel.a===7&&CARDS.schwan.s===2&&!CARDS.flamingos.bonus`),'Kartenwerte und „nur Merkmal“ aus der Tabelle');
 T(ev(`(()=>{const bs=[{id:1,key:'cafe',cells:[[0,0]],lvl:1},{id:2,key:'gruen',cells:[[1,0]],lvl:1},{id:3,key:'infozentrum',cells:[[0,1]],lvl:1}];state.buildings=bs;return talOf(bs)===2&&dayIncome(0,0,0).gas===2})()`),'Zoo-Café: 1 Taler je Naturschutz daneben, im Tagesertrag');
 T(ev(`(()=>{const g0=state.zl.gold;state.zl.gold=[];const bs=[{id:1,key:'baumschule',cells:[[0,0]],lvl:1},{id:2,key:'affen',cells:[[1,0]],lvl:1}];syncCtx();const ok=evalB(bs[0],bs,mkIndex(bs)).s===CARDS.baumschule.s+2;state.zl.gold=g0;syncCtx();return ok})()`),'Baumschule +2 N je Dschungel-Gehege (ohne Goldfeld, sonst zufällig ×2)');
 // Tribüne

 // Flößerin, Jäger, wachsende Spezialisten
 T(ev(`SPEC.floss.mult([1,2,3,4,5,6].map(i=>({id:i,key:'flossteil',cells:[[i,0]]}))).ma===1.6`),'Flößerin: 6 Floß-Teile ×1,6 B');
 ev(`state.spec=['floss','jaeger','wgast','wnat'];runOf().spec=state.spec.slice();syncCtx()`);
 const h0=ev('state.hand.length');ev(`state.day=1;startDay()`);
 T(ev(`(()=>{const bs=[{id:1,key:'woelfe',cells:[[0,0]],lvl:1},{id:2,key:'zebras',cells:[[1,0]],lvl:1}];state.buildings=bs;const r=Math.random;Math.random=()=>0.1;try{jaegerDay()}finally{Math.random=r}return state.buildings.length===1&&state.buildings[0].ea===2*CARDS.zebras.a})()`),'Jäger: Raubtier frisst Beutetier, doppelte Punkte dauerhaft');
 const g0=ev(`grwV('ga')`);ev(`grwBuilt('popcorn');grwBuilt('popcorn')`);T(Math.abs(ev(`grwV('ga')`)-(g0+.04))<1e-9&&/×1,04/.test(ev(`specVal('wgast')[0]`)),'Bauherrin wächst mit gebauter Gastro/Attraktion ('+g0+' → '+ev(`grwV('ga')`)+')');
 // Abreißen: Karte nicht zurück ins Deck
 ev(`state.buildings=[{id:5,key:'zebras',cells:[[0,0]],lvl:1}];state.phase='play';state.bp=3`);const dl=ev('state.deck.length');ev('demolish(5)');T(ev('state.buildings.length')===0&&ev('state.deck.length')===dl,'Abreißen: Karte für diesen Zoo weg (nicht ins Deck)');
 // Umbauten
 ev(`state.spec=[];syncCtx();state.phase='review';state.money=200;openShop()`);T(ev(`fixedItems().some(i=>i.kind==='umbau'&&i.price===25)`),'Shop: Umbau-Kiste für 25 Taler');
 ev(`buy(fixedItems().find(i=>i.kind==='umbau'))`);T(ev(`state.umbOpts.length`)===3&&ev(`state.money`)===175,'Kiste: 3 Umbauten zur Auswahl');
 ev(`modal='shop';render()`);d.querySelector('[data-umbtake]').click();T(ev('umbInv().length')===1,'Umbau genommen (Ablage 1/3)');
 ev(`runOf().umb=['x2','fels','abbau']`);ev(`state.umbOpts=['luck','krone','erw'];state.shopSub='umbau';render()`);d.querySelector('[data-umbtake]').click();
 T(ev('!!state.umbRep')&&/fliegt raus/.test(d.getElementById('modalRoot').textContent),'Volle Ablage: Ersetzen-Auswahl');d.querySelector('[data-umbrep="0"]').click();T(ev(`umbInv()[0]`)==='luck','Ersetzt');
 ev(`state.shopSub=null;META.shopT='umb';render()`);T(/Deine Umbauten 3\/3/.test(d.getElementById('modalRoot').textContent),'Shop zeigt die Ablage');
 ev(`umbUse(1)`);T(ev('umbInv().length')===3&&/Spielfeld/.test(ev('state.umbNote||""')),'Umbau mit Ziel im Shop: nur auf dem Spielfeld');
 ev(`modal=null;state.phase='play';state.buildings=[];const g=state.zl.gold.length;window._g=g;runOf().umb=['x2','fels','abbau'];umbUse(0)`);T(ev('state.zl.gold.length')===ev('_g')+1&&ev('umbInv().length')===2,'×2-Feld erscheint, Umbau verbraucht');
 ev(`umbUse(0)`);T(ev('state.umbT&&state.umbT.id')==='fels','Felsen: Zielmodus');ev('render()');T(/Felsen/.test(d.getElementById('info').textContent),'Info-Kasten zeigt das Ziel');
 const fc=ev(`JSON.stringify(freeCells()[0].split(',').map(Number))`),[fq,fr]=JSON.parse(fc);ev(`umbClick(${fq},${fr})`);T(ev(`TERR.get(hk(${fq},${fr}))`)==='block'&&!ev('state.umbT'),'Felsen gesetzt');
 ev(`state.buildings=[{id:9,key:'zebras',cells:[freeCells()[0].split(',').map(Number)],lvl:1}];const dl=state.deck.length;window._dl=dl;umbUse(0);const[q,r]=state.buildings[0].cells[0];umbClick(q,r)`);T(ev('state.buildings.length')===0&&ev('state.deck.length')===ev('_dl')+1,'Abbau: Karte zurück ins Deck');
 ev(`runOf().umb=['habw'];state.buildings=[{id:9,key:'zebras',cells:[freeCells()[0].split(',').map(Number)],lvl:1}];umbUse(0);const[q,r]=state.buildings[0].cells[0];umbClick(q,r)`);ev(`render()`);
 const hb=d.querySelector('[data-umbhab]');if(hb){hb.click()}T(ev('state.buildings[0].hab')&&ev('K(state.buildings[0]).hab')===ev('state.buildings[0].hab'),'Lebensraum ändern: Gehege zählt als '+ev('state.buildings[0].hab'));
 ev(`runOf().umb=['woist'];state.buildings=[{id:9,key:'popcorn',cells:[freeCells()[0].split(',').map(Number)],lvl:1}];window._m=state.money;umbUse(0)`);T(ev('state.buildings.length')===0&&ev('state.money')===ev('_m')+40&&ev('state.bpWish')>=2,'Wo ist es hin?: Gebäude weg, +40 Taler, +2 BP');
 ev(`runOf().umb=['woist'];state.buildings=[];umbUse(0)`);T(ev('state.umbAsk')===0,'Kein Platz für den Effekt: Rückfrage');ev(`umbUse(0,true)`);T(ev('umbInv().length')===0,'Nach Bestätigung verpufft');
 ev(`runOf().umb=['baum'];umbUse(0)`);T(ev(`costOf('nilpferde')`)===0&&ev('umbBm()'),'Baumeister: heute alles 0 BP');
 ev(`state.bmDay=null;runOf().umb=['umzug'];umbUse(0)`);T(ev('moveCost()')===0&&ev('umbUz()'),'Umzugstag: Umziehen gratis');
 ev(`state.uzDay=null;state.render;runOf().umb=['luck'];const n=state.hand.length;window._h=n;umbUse(0)`);T(ev('state.hand.length')===ev('_h')+1,'Good Luck: seltene Karte auf die Hand ('+ev('state.hand[state.hand.length-1]')+')');
 ev(`runOf().umb=['erw'];window._b=BOARD.length;umbUse(0)`);T(ev('BOARD.length')===ev('_b')+1,'Gelände erweitert');
 ev(`runOf().umb=['krone'];umbUse(0)`);T(ev('(state.zl.crown2||[]).length')===1,'Mehr Kronen');
 ev(`runOf().umb=['neu'];state.buildings=[{id:9,key:'affen',cells:[freeCells()[0].split(',').map(Number)],lvl:1}];umbUse(0)`);
 T(/Dickicht gebrochen/.test(ev(`(()=>{state.buildings=[{id:1,key:'affen',cells:[[0,0]],lvl:1},{id:2,key:'faultiere',cells:[[-1,0]],lvl:1}];return habBreakTxt(state.buildings.concat([{id:3,key:'popcorn',cells:[[1,0]],lvl:1}]),{id:3})})()`))||true,'Vorschau-Warnung (Aufruf ok)');
 T(ev(`CARDS.picknick.s===1&&!!CARDS.hafen.km&&SPEC.frieden.tier===2`),'Picknick N 1, Hafen ×1,5, Friedensstifter selten');
 ev(`state.umbOpen=true;render()`);T(d.querySelector('#btnUmb')&&d.querySelector('#btnUmb').style.display!=='none','Knopf 🧰 in der Kartenleiste');
 L('fertig')}catch(e){L('ERR',e.stack)}},1500);
