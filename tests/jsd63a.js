// 0.94: 3 Lebensräume mit starken Regeln, Dschungel, Karten neu, Gastro-Taler, Umbauten, Tribüne, Flößerin, Jäger, wachsende Spezialisten, Abreißen
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
// 0.63a: Zoom, Lebensraum-Symbol, Tagesfeld, Meldungen, Fluss-Übeltäter, Lexikon, Glossar, Jäger, Karawane-Symbol, Bedrohte
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund',true,['wasser','savanne','wueste'],NOPROF);modal=null;state.season=1;syncCtx();render()`);
 T(ev('VERSION')==='0.63a','Version '+ev('VERSION'));
 const bd=ev(`Object.keys(HAB).map(h=>h+':'+Object.keys(CARDS).filter(k=>!/[~^]/.test(k)&&CARDS[k].cat==='gehege'&&CARDS[k].hab===h&&!CARDS[k].jt&&!CARDS[k].ms&&(CARDS[k].tags||[]).includes('bedroht')).length).join(' ')`);
 T(/wasser:3 savanne:3 wald:3 wueste:3 arktis:3 gebirge:3/.test(bd),'3 bedrohte je Lebensraum: '+bd);
 T(ev(`CARDS['otter~g']?(CARDS['otter~g'].tags||[]).includes('bedroht'):true`)&&!ev(`(CARDS.koalas.tags||[]).includes('bedroht')`),'Varianten übernehmen, Koala nicht mehr bedroht');
 T(ev(`CARDS.karawane.icon`)==='🏕️','Karawane 🏕️');
 T(ev(`habIcs(CARDS.bratwurst)`)==='🌾'&&ev(`habIcs(CARDS.wasserfall)`)==='💧'&&ev(`habIcs(CARDS.zebras)`)===''&&ev(`habIcs(CARDS.gruen)`)==='','Lebensraum-Symbol nur bei passenden Gebäuden');
 T(ev(`(()=>{state.spec=['tagesfeld'];runOf().spec=['tagesfeld'];syncCtx();const b=state.buildings[0]||null;const C=BOARD.find(([q,r])=>ONBOARD.has(hk(q,r))&&!TERR.get(hk(q,r)));state.buildings=[{id:5,key:'gruen',cells:[C],lvl:1}];state.tfeld=hk(...C);render();return /class="ztf on"/.test(document.getElementById('board').innerHTML)&&/⭐×3/.test(document.getElementById('board').innerHTML)&&/Grünfläche<\\/b> ×3/.test(todayHtml())})()`),'Tagesfeld auf bebautem Feld: Rahmen, ⭐×3, Banner nennt Gebäude');
 T(ev(`(()=>{const wp=document.getElementById('wishPop');if(wp)wp.remove();state.ruleIntro=0;document.querySelectorAll('.bigpop').forEach(e=>e.remove());modal=null;screen=null;state.phase='play';POPQ.length=0;POPBUSY=false;POPQ.push(['A!','eins','k1'],['B!','zwei','k2']);popNext();const w=document.querySelector('.wishpop.popwin');const ok=!!w&&/Neu im Zoo \\(2\\)/.test(w.textContent)&&/eins/.test(w.textContent)&&/zwei/.test(w.textContent);w&&w.querySelector('button').click();return ok&&!document.querySelector('.wishpop.popwin')})()`),'Mehrere Meldungen in einem Fenster, zum Wegklicken');
 T(ev(`(()=>{POPQ.push(['C!','drei','k1']);popNext();const w=document.querySelector('.wishpop.popwin');const ok=!!w&&/drei/.test(w.textContent);w&&w.querySelector('button').click();return ok})()`),'Auch bekannte Meldung bleibt stehen');
 T(ev(`(()=>{const f0=ZOOM;zoomAt(2,100,300);const a=ZOOM&&ZOOM.f===2;zoomAt(.5,100,300);return a&&ZOOM===null})()`),'Zoom stufenlos, zurück auf ×1');
 T(ev(`(()=>{const bs=[{id:1,key:'loewen',cells:[[0,0],[1,0],[2,0]],lvl:1,ate:2}];return zlPurity(bs,mkIndex(bs)).n})()`)===3,'Jäger: gefressene Beute zählt für die Reinheit');
 T(/Freischalten/.test(ev(`glossSpec()`))&&/🔒/.test(ev(`glossSpec()`)),'Glossar: gesperrte Spezialisten mit 🔒');
 T(/blur\(5px\)/.test(d.documentElement.innerHTML),'Lexikon: Schatten verwischt');
 L('fertig')}catch(e){L('ERR',e.stack)}process.exit(0)},1500);
