// Querformat-Test (Playwright, echtes Chromium): Knöpfe in Fenstern im Querformat erreichbar und wirksam.
// Anlass: Im Querformat mit Seitenleiste (body.land3) zeichnete railRender die Zoo-Übersicht samt Knöpfen #mClose/#zlBack
// ein zweites Mal in die Leiste; der Klick-Handler hing am unsichtbaren Doppel, „Los geht's“ reagierte nicht.
//   node tests/quer.js                 -> prüft build/zoodeck.html bei 1280×800, 1600×900 und im Hochformat (Pixel 7)
//   ZF=pfad.html node tests/quer.js    -> anderer Stand;  V=1 -> ausführlich
// Ausgabe: ok / FAIL (Knopf verdeckt, doppelte id, Knopf ohne Wirkung, Ziel nicht erreicht) / HINWEIS (Platzierung, nur zur Info).
// Braucht Playwright mit Chromium (in der Claude-Umgebung vorinstalliert; sonst: npm i -D playwright && npx playwright install chromium).
const {chromium,devices}=require('playwright');const path=require('path');
const FILE='file://'+path.resolve(process.env.ZF||path.join(__dirname,'..','build','zoodeck.html'));
const BOT=require('fs').readFileSync(path.join(__dirname,'bot7.js'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),V=!!process.env.V;
const SEED=`{let S=4242;Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}`;
async function seite(b,vp){const p=vp.dev?await (await b.newContext({...devices[vp.dev]})).newPage():await b.newPage({viewport:vp});p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));await p.addInitScript(SEED);await p.goto(FILE);await p.waitForTimeout(600);
  await p.evaluate(()=>{for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};SCFAST=1});return p}
const zu=p=>p.evaluate(()=>String(screen)+'/'+String(modal)+'/'+(state?state.phase+':'+state.season+':'+state.day:''));
// alle sichtbaren Knöpfe in Fenster und Tutorial-Kasten: verdeckt? außerhalb? doppelte ids im ganzen Dokument?
async function pruefe(p,wo,seen){await p.evaluate(()=>Promise.race([Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))),new Promise(r=>setTimeout(r,1500))])); // Öffnungs-Animation (pop) abwarten
  const r=await p.evaluate(()=>{const out={cov:[],aus:[],dup:[],fuss:[]};const c={};document.querySelectorAll('[id]').forEach(e=>c[e.id]=(c[e.id]||0)+1);out.dup=Object.keys(c).filter(k=>c[k]>1);
   const W=innerWidth,H=innerHeight;const ruecksetzen=()=>{for(const m of document.querySelectorAll('.modal,.overlay'))m.scrollTop=0;scrollTo(0,0);(document.scrollingElement||document.documentElement).scrollTop=0};ruecksetzen();
   for(const b of document.querySelectorAll('.modal>.tnav:last-child button,.modal>.shopbar:last-child button,.modal>.btn:last-child')){if(!b.offsetParent||b.disabled)continue;const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,e=document.elementFromPoint(x,y);
     if(x<0||y<0||x>W||y>H||!(e&&(e===b||b.contains(e)))){const m=b.closest('.modal'),o=b.closest('.overlay'),R=e=>e?Math.round(e.getBoundingClientRect().top)+'–'+Math.round(e.getBoundingClientRect().bottom):'-';out.fuss.push((b.id?'#'+b.id+' ':'')+b.textContent.trim().slice(0,24)+' @'+Math.round(x)+','+Math.round(y)+' (Fenster '+R(m)+', Hintergrund '+R(o)+', Bildschirm 0–'+H+', scrollH '+(m&&m.scrollHeight)+')')}}for(const b of document.querySelectorAll('#modalRoot button, #coach button')){if(!b.offsetParent||b.disabled)continue;const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,nm=(b.id?'#'+b.id+' ':'')+b.textContent.trim().replace(/\s+/g,' ').slice(0,24);
     const frei=()=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>W||y>H)return'aus';const e=document.elementFromPoint(x,y);return e&&(e===b||b.contains(e))?'':(e?e.tagName+(e.id?'#'+e.id:'')+'.'+String(e.className).split(' ')[0]:'?')};
     let f=frei();if(f){b.scrollIntoView({block:'center'});f=frei()} // in langen Fenstern erst hinscrollen, wie ein Spieler
     if(f==='aus')out.aus.push(nm+' @'+Math.round(x)+','+Math.round(y));else if(f)out.cov.push(nm+' von '+f)}
   ruecksetzen();return out});
  const key=wo.replace(/[0-9:]+$/,'');
  for(const d of r.dup){T(false,`${wo}: doppelte id #${d}`)}for(const c of r.cov)T(false,`${wo}: Knopf verdeckt: ${c}`);for(const c of r.fuss)T(false,`${wo}: Knopf der Fußzeile ohne Scrollen nicht sichtbar: ${c}`);
  for(const a of r.aus)if(!seen.has(key+a)){seen.add(key+a);L('HINWEIS',`${wo}: Knopf außerhalb des Bildschirms: ${a}`)}
  if(V)L('   geprüft',wo,await zu(p));return r}
// Klick wie ein Mensch; fängt ein anderes Element den Klick ab, gibt es einen HINWEIS und nach 4 s einen zweiten Versuch
// Besucherwunsch-Fenster am Tagesbeginn (#wishPop, ganzer Bildschirm): wie ein Spieler wegtippen, vorher dessen Knopf prüfen
async function wunschWeg(p){for(let j=0;j<4;j++){await p.waitForTimeout(150);const h=await p.$('#hintBox.on #hOk');if(!h||!await h.isVisible())break;await h.click({timeout:2000,force:true}).catch(()=>{});await p.waitForTimeout(250)}for(let i=0;i<3;i++){const w=await p.$('#wishPop button, #wishPop .btn, .bigpop [data-bpok]');if(!w||!await w.isVisible())return;
  const frei=await w.evaluate(b=>{const r=b.getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return!!e&&(e===b||b.contains(e))});if(!frei)T(false,'Knopf im Besucherwunsch-Fenster verdeckt');
  await w.click({timeout:2000}).catch(x=>T(false,'Besucherwunsch-Fenster lässt sich nicht wegtippen'));await p.waitForTimeout(300)}}
const HW=new Set();const klick=async(p,sel)=>{if(!/wishPop/.test(sel))await wunschWeg(p);const e=await p.$(sel);if(!e||!await e.isVisible())return false;
  try{await e.click({timeout:1500})}catch(x){const m=/<([a-z]+)( id="[^"]*")?( class="[^"]*")?[^>]*>.*? intercepts pointer events/.exec(x.message);const w=m?m[0].replace(/>.*? intercepts.*/,'>'):'?';
    const k=sel+w;if(!HW.has(k)){HW.add(k);L('HINWEIS',`Klick auf ${sel} wird zuerst abgefangen von ${w}`)}if(/hintBox|hOk/.test(w))await wunschWeg(p);else await p.waitForTimeout(4000);try{await e.click({timeout:1500})}catch(y){T(false,`Klick auf ${sel} bleibt blockiert von ${w}`);return false}}
  await p.waitForTimeout(250);return true};
const klickText=async(p,re)=>{await wunschWeg(p);for(const e of await p.$$('button:not([disabled])')){if(re.test((await e.textContent()).trim())&&await e.isVisible()){try{await e.click({timeout:3000})}catch(x){T(false,`Klick auf „${(await e.textContent()).trim().slice(0,20)}“ blockiert: ${(/<[^>]*> intercepts/.exec(x.message)||['?'])[0]}`);return false}await p.waitForTimeout(250);return true}}return false};
// neuer Lauf über die echten Menüs bis zur Zoo-Übersicht
async function bisUebersicht(p,wo,seen){for(const re of[/^Spielen/,/Neuer Zoo/,/^Anlegen/,/^Lauf starten/,/Zufällig/,/^Weiter zum/,/^Stufe 1$/])if(!await klickText(p,re)){T(false,`${wo}: Menü-Knopf ${re} fehlt (${await zu(p)})`);return false}
  // 0.79a: keine Einführung mit 3 Freischalt-Zielen mehr
  if(await zu(p)!=='null/zoo/play:0:0'){T(false,`${wo}: Zoo-Übersicht fehlt (${await zu(p)})`);return false}await pruefe(p,wo+' Zoo-Übersicht',seen);return true}
(async()=>{const b=await chromium.launch();try{
 for(const vp of[{width:1280,height:800},{width:1600,height:900},{dev:'Pixel 7'}]){const wo=vp.dev?'Handy '+vp.dev:vp.width+'×'+vp.height,seen=new Set();
  // 1) Neuer Lauf: Übersicht → „Los geht's“ → erster Spieltag
  let p=await seite(b,vp);L('==',wo,'body:',await p.evaluate(()=>{applyView();return document.body.className}));
  if(await bisUebersicht(p,wo,seen)){await klick(p,'#mClose');T(await zu(p)==='null/null/play:0:0',`${wo}: neuer Lauf über die Zoo-Übersicht bis zum ersten Spieltag (${await zu(p)})`)}
  // 2) Menü ☰ und Zoo-Übersicht im laufenden Spiel öffnen und schließen
  for(const [sel,name,zu1] of[['#btnHelp','Menü ☰','#mClose'],['[data-ev="zoo"]','Zoo-Übersicht im Spiel','#mClose'],['#btnDeck','Deck','#mClose']]){
   if(!await klick(p,sel)){T(false,`${wo}: ${name} lässt sich nicht öffnen`);continue}const m=await p.evaluate(()=>modal);await pruefe(p,`${wo} ${name}`,seen);
   const ok=await klick(p,zu1)||await klickText(p,/Schließen|Zurück|Weiterspielen|^✕$/);T(ok&&await p.evaluate(()=>!modal),`${wo}: ${name} (${m}) schließt`)}
  // 2b) Winter-Wahl mit Winter-Tipp: der einzige Tipp, der bei offenem Fenster erscheint (oben), darf nichts verdecken; andere Tipps warten
  await p.evaluate(()=>{const sl=hintSlot();sl.hints=sl.hints||{};delete sl.hints.winter;META.noHints=0;state.hintNow=null;state.zl.inspOpts=['essen','koenig'];modal='inspPick';renderAll()});await p.waitForTimeout(300);
  T(/on/.test(await p.evaluate(()=>{const e=document.getElementById('hintBox');return e?e.className+' '+e.dataset.h:''}))&&await p.evaluate(()=>document.getElementById('hintBox').dataset.h==='winter'),`${wo}: Winter-Tipp erscheint in der Winter-Wahl`);
  await pruefe(p,wo+' Winter-Wahl mit Tipp',seen);
  await p.evaluate(()=>{const sl=hintSlot();sl.hints.winter=1;state.hintNow=null;state.zl.inspOpts=null;modal=null;renderAll()});
  // 3) Spielablauf bis in den Sommer: Kartenwahl, Tagesbilanz, Jahreszeit-Ende, Shop (Bot baut, Knöpfe werden geklickt)
  await p.evaluate(()=>{window._r=[render,renderModal,saveMeta,renderAll]});
  await p.evaluate(BOT+';BOT.zl=true;BOT.cur={zoos:[],built:0,cd:{},picked:{},specs:[],progs:[]}').catch(e=>L('FAIL bot',e.message));
  await p.evaluate(()=>{[render,renderModal,saveMeta,renderAll]=window._r});
  const geprueft=new Set();let g=0;
  while(g++<80){const z=await zu(p),ph=z.split('/')[2].split(':')[0];if(/^null\/null\/play:1:/.test(z)){T(true,`${wo}: Sommer erreicht (Kartenwahl, Jahreszeit-Ende und Shop per Klick)`);break}
   if(ph==='play'&&z.split('/')[1]==='null'){await p.evaluate(()=>{botDay();render()});await klick(p,'#btnEnd');for(let i=0;i<40&&(await zu(p)).includes('scoring');i++)await p.waitForTimeout(100);continue}
   const ort=wo+' '+(z.split('/')[1]!=='null'?'Fenster '+z.split('/')[1]:'Phase '+ph);if(!geprueft.has(ort)){geprueft.add(ort);await pruefe(p,ort,seen)}
   if(ph==='review'){if(!await klick(p,'#btnEnd')){T(false,`${ort}: Tagesbilanz ▶ fehlt`);break}}
   else if(ph==='draft'){await wunschWeg(p);const vor=await p.evaluate(()=>JSON.stringify([state.offer,state.deck.length,state.phase]));const c=await p.$$('#modalRoot [data-pick]');if(!c.length){T(false,`${ort}: keine Karte zum Wählen`);break}await c[0].click({timeout:3000}).catch(x=>T(false,`${ort}: Karte nicht klickbar`));await p.waitForTimeout(250);if(await p.evaluate(()=>JSON.stringify([state.offer,state.deck.length,state.phase]))===vor){T(false,`${ort}: Kartenwahl reagiert nicht`);break}}
   else if(ph==='seasonWon'){if(!await klickText(p,/Weiter|Shop|Kartenwahl|weiter/)){await p.evaluate(()=>{state.pendingSeason=true;nextDraft();render()})}}
   else if(ph==='shop'){for(const t of['run','umb','more']){if(await klick(p,`[data-shtab="${t}"]`))await pruefe(p,`${wo} Shop-Reiter ${t}`,seen)}
     const ok=await klick(p,'#mLeave');T(ok,`${wo}: Shop „Weiter zum …“ klickbar`);if(!ok)break}
   else if(ph==='lost'||ph==='win'){L('HINWEIS',`${wo}: Lauf endete (${z})`);break}
   else{await p.waitForTimeout(150)}
   if(g===80)T(false,`${wo}: Sommer nicht erreicht (${z})`)}
  if(p._errs.length)T(false,`${wo}: Seitenfehler: ${p._errs.slice(0,3).join(' | ')}`);await p.close();
  // 4) Zurück in der Zoo-Übersicht
  p=await seite(b,vp);if(await bisUebersicht(p,wo+' (Zurück)',new Set())){await klick(p,'#zlBack');T((await zu(p)).startsWith('cdeck/'),`${wo}: „◂ Zurück“ in der Zoo-Übersicht führt zur Stufenwahl (${await zu(p)})`)}await p.close();
  // 5) Tutorial: Häppchen und Bau-Schritte im Querformat
  p=await seite(b,vp);await p.evaluate(()=>{screen='tut';screenArg={};renderAll()});if(!await klick(p,'[data-tutch]')){T(false,`${wo}: Tutorial startet nicht`)}
  else{let n=0;for(let i=0;i<14;i++){const st=await p.evaluate(()=>state&&state.tut?state.tut.ch+':'+state.tut.i:'-');await pruefe(p,`${wo} Tutorial ${st}`,seen);
     if(await klick(p,'#tutMore')||await klick(p,'#tutBtn')||await klick(p,'[data-gstep]')){n++;continue}
     const S=await p.evaluate(()=>{const s=tutStep();return s&&s.only&&s.only!=='-'&&s.at?{only:s.only,at:s.at}:null});if(!S)break;
     await p.evaluate(S=>{const i=state.hand.indexOf(S.only);selectCard(i);const rot=tutRotFor(S.only,S.at);state.rot=rot;for(const[q,r]of BOARD){const c=placeCells(S.only,rot,q,r);if(c&&tutCellsEq(c,S.at)){state.preview=previewAt({q,r});render();break}}},S);
     await pruefe(p,`${wo} Tutorial-Vorschau ${st}`,seen);for(let k=0;k<6&&await klick(p,'#tutMore');k++);if(!await klick(p,'#btnBuild')){T(false,`${wo}: Tutorial 🔨 nicht klickbar (${st})`);break}n++}
   const jetzt=await p.evaluate(()=>state.tut&&state.tut.ch+':'+state.tut.i);T(jetzt==='zl:5',`${wo}: Tutorial-Knöpfe reagieren bis zum ersten Tagesende (${n} Klicks, Schritt ${jetzt})`)}
  if(p._errs.length)T(false,`${wo}: Seitenfehler: ${p._errs.slice(0,3).join(' | ')}`);await p.close();
  // 6) 0.77a Zoo-Buch: vom Startbildschirm öffnen, alle Reiter antippen, keine Querverschiebung, Zurück
  p=await seite(b,vp);await p.evaluate(()=>{META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;screen='title';screenArg={};modal=null;renderAll()});
  if(!await klick(p,'[data-go="buch"]'))T(false,`${wo}: Zoo-Buch-Knopf fehlt`);else{const tabs=await p.evaluate(()=>[...document.querySelectorAll('.bktabs [data-tab]')].map(b=>b.dataset.tab));let n=0;
   for(const t of tabs){if(await klick(p,`.bktabs [data-tab="${t}"]`)&&await p.evaluate(t=>{const b=document.querySelector(`.bktabs [data-tab="${t}"]`);return!!b&&b.classList.contains('on')},t))n++;
     const qx=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(qx>2)T(false,`${wo}: Zoo-Buch Reiter ${t} breiter als der Bildschirm (${qx} px)`)}
   T(n===tabs.length&&n>=5,`${wo}: Zoo-Buch: alle ${tabs.length} Reiter antippbar`);await klick(p,'.bar2 [data-go="title"]');T((await zu(p)).startsWith('title/'),`${wo}: Zoo-Buch „Zurück“ führt zum Startbildschirm`)}
  if(p._errs.length)T(false,`${wo}: Seitenfehler (Zoo-Buch): ${p._errs.slice(0,3).join(' | ')}`);await p.close();
  // 7) 0.78a Feedback-Kasten nach einem verlorenen Lauf: alles erreichbar, keine Querverschiebung, Überspringen wirkt
  p=await seite(b,vp);await p.evaluate(()=>{META.noHints=1;META.fbOff=0;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;
    enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);const sl=activeSlot();state.phase='lost';sl.run.game=null;state=null;modal=null;endRun(false)});await p.waitForTimeout(300);
  if(!await p.$('.fbbox'))T(false,`${wo}: Feedback-Kasten fehlt`);else{let ok=0;for(const sel of['[data-fbs="5"]','[data-fbd="passt"]','#fbTxt','#fbInc','[data-fbsend]','[data-fbskip]','[data-fboff]']){const e=await p.$(sel);if(!e)continue;await e.scrollIntoViewIfNeeded();
     const frei=await e.evaluate(b=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,el=document.elementFromPoint(x,y);return x>=0&&x<=innerWidth&&!!el&&(el===b||b.contains(el))});if(frei)ok++;else T(false,`${wo}: Feedback-Kasten: ${sel} verdeckt`)}
   T(ok===7,`${wo}: Feedback-Kasten: alle 7 Bedienelemente erreichbar`);const qx=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(qx>2)T(false,`${wo}: Feedback-Kasten breiter als der Bildschirm (${qx} px)`);
   await klick(p,'[data-fbskip]');T(!await p.$('.fbbox')&&(await zu(p)).startsWith('summary/'),`${wo}: Feedback „Überspringen“ führt zur Zusammenfassung`)}
  if(p._errs.length)T(false,`${wo}: Seitenfehler (Feedback): ${p._errs.slice(0,3).join(' | ')}`);await p.close();
  // 8) 0.80a: Enthüllung, „Alles zurücksetzen“-Fenster, Felsen antippen mit Sprengmeisterin
  p=await seite(b,vp);await p.evaluate(()=>{META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;
    enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;
    flOf(activeSlot()).wasserGeh=149;flBuilt({key:Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab==='wasser'&&!CARDS[k].ms&&!fsLocked(k)),cells:[]},1);render()});await p.waitForTimeout(300);
  {const ok=await p.$('#fsRevPop [data-bpok]');if(!ok)T(false,`${wo}: Enthüllung fehlt`);else{await ok.scrollIntoViewIfNeeded();const fr=await ok.evaluate(b=>{const r=b.getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return!!e&&(e===b||b.contains(e))});
    T(fr,`${wo}: Enthüllung „Neu entdeckt“: Weiter erreichbar`);await ok.click();await p.waitForTimeout(200);T(!await p.$('#fsRevPop'),`${wo}: Enthüllung lässt sich schließen`)}}
  await p.evaluate(()=>{modal='help';render()});await p.waitForTimeout(250);
  if(!await klick(p,'#mReset'))T(false,`${wo}: „Alles zurücksetzen“ fehlt im Menü`);else{
    for(const[sel,nx]of[['[data-rs="2"]',1],['[data-rs="0"]',0]]){const e=await p.$('#resetPop '+sel);if(!e){T(false,`${wo}: Zurücksetzen-Fenster: ${sel} fehlt`);break}
      const fr=await e.evaluate(b=>{const r=b.getBoundingClientRect(),el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.top>=0&&r.bottom<=innerHeight&&!!el&&(el===b||b.contains(el))});if(!fr)T(false,`${wo}: Zurücksetzen-Fenster: ${sel} verdeckt`);
      if(nx){const g=await p.$('#resetPop [data-rs="go"]');T(!g,`${wo}: „LÖSCHEN“ erst in der 2. Abfrage`)}await e.click();await p.waitForTimeout(200);if(nx)T(!!await p.$('#resetPop [data-rs="go"]'),`${wo}: Zurücksetzen: 2. Abfrage mit LÖSCHEN`)}
    T(!await p.$('#resetPop')&&await p.evaluate(()=>!!localStorage.getItem(SAVE_KEY)),`${wo}: Zurücksetzen abbrechen löscht nichts`)}
  await p.evaluate(()=>{modal=null;state.phase='play';state.spec=['spreng'];runOf().spec=['spreng'];syncCtx();const free=BOARD.filter(([q,r])=>!TERR.get(hk(q,r))&&!state.buildings.some(b=>b.cells.some(c=>c[0]===q&&c[1]===r)));
    let rk=BOARD.find(([q,r])=>TERR.get(hk(q,r))==='block');if(!rk){rk=free[5];TERR.set(hk(...rk),'block')}window._rk=rk;const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===1&&!fsLocked(x)&&(CARDS[x].hab==='wasser'||CARDS[x].hab==='savanne'));
    state.hand=[k];state.selected=0;state.preview=null;state.rot=0;render()});await p.waitForTimeout(250);
  {const rk=await p.evaluate(()=>window._rk),el=await p.$(`#board polygon.block`);if(!el)T(false,`${wo}: kein Felsen auf dem Feld`);else{const bb=await p.evaluate(rk=>{const pts=[...document.querySelectorAll('#board polygon.block')];const[x,y]=px(...rk);const svg=document.getElementById('board');const pt=svg.createSVGPoint();pt.x=ROT?-y:x;pt.y=ROT?x:y;const m=svg.getScreenCTM();const s=pt.matrixTransform(m);return{x:s.x,y:s.y}},rk);
    await p.mouse.click(bb.x,bb.y);await p.waitForTimeout(250);const pv=await p.evaluate(()=>state.preview&&[state.preview.q,state.preview.r]);T(!!pv&&pv[0]===rk[0]&&pv[1]===rk[1],`${wo}: Felsen antippen (Sprengmeisterin) setzt die Vorschau (${JSON.stringify(pv)} / ${JSON.stringify(rk)})`)}}
  if(p._errs.length)T(false,`${wo}: Seitenfehler (0.80a): ${p._errs.slice(0,3).join(' | ')}`);await p.close();
  // 9) 0.81a: Aufstellung am Zähler und Detail-Fenster
  p=await seite(b,vp);await p.evaluate(()=>{META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;
    enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;state.infoProg=null;
    const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===1&&!fsLocked(x)&&CARDS[x].hab==='wasser');const fr=BOARD.filter(([q,r])=>!TERR.get(hk(q,r)));
    state.buildings=[{id:901,key:k,cells:[fr[3]],lvl:1},{id:902,key:k,cells:[fr[4]],lvl:2}];const r=scoreZoo(state.buildings);state.yday={A:r.A,S:r.S,total:r.total,auf:aufOf(r)};state.phase='review';state.info=902;render()});await p.waitForTimeout(300);
  for(const c of['#cA','#cS']){if(!await klick(p,c)){T(false,`${wo}: Zähler ${c} nicht antippbar`);continue}const pop=await p.$('#aufPop');T(!!pop,`${wo}: Aufstellung an ${c} öffnet`);
    if(pop){const bb=await pop.boundingBox(),vw=await p.evaluate(()=>innerWidth);T(bb.x>=0&&bb.x+bb.width<=vw+1,`${wo}: Aufstellung ${c} im Bildschirm`)}await p.mouse.click(5,5);await p.waitForTimeout(150);T(!await p.$('#aufPop'),`${wo}: Aufstellung schließt beim Tippen daneben`)}
  if(!await klick(p,'#info [data-det]'))T(false,`${wo}: Details-Knopf fehlt`);else{const x=await p.$('#detSheet [data-dsx]');T(!!x&&!!await p.$('#detSheet .dcalc'),`${wo}: Detail-Fenster mit Rechnung`);
    if(x){const fr=await x.evaluate(b=>{const r=b.getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return!!e&&(e===b||b.contains(e))});T(fr,`${wo}: ✕ im Detail-Fenster erreichbar`);
      const qx=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);if(qx>2)T(false,`${wo}: Detail-Fenster breiter als der Bildschirm (${qx} px)`);await x.click();await p.waitForTimeout(150);T(!await p.$('#detSheet'),`${wo}: Detail-Fenster schließt`)}}
  if(p._errs.length)T(false,`${wo}: Seitenfehler (0.81a): ${p._errs.slice(0,3).join(' | ')}`);await p.close()}
}catch(e){L('EXC',e.stack)}await b.close();process.exit(0)})();
