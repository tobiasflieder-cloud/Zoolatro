// 0.94: 3 Lebensräume mit starken Regeln, Dschungel, Karten neu, Gastro-Taler, Umbauten, Tribüne, Flößerin, Jäger, wachsende Spezialisten, Abreißen
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
// 0.62a: Karawane, Eigenschaften-Übersicht, Infokasten ⅓, kurze Tutorial-Zeile, App-Hinweis
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund',true,['wasser','savanne','wueste'],NOPROF);modal=null;state.season=1;syncCtx()`);
 T(ev('VERSION')==='0.62a','Version '+ev('VERSION'));
 T(/anderen Lebensraum/.test(ev(`CARDS.karawane.fx.join()`)),'Karawane-Text');
 const kv=JSON.parse(ev(`(()=>{const C=BOARD.filter(([q,r])=>ONBOARD.has(hk(q,r))&&!TERR.get(hk(q,r)));const [q,r]=C.find(([q,r])=>C.some(x=>x[0]===q+2&&x[1]===r)&&C.some(x=>x[0]===q-1&&x[1]===r)&&C.some(x=>x[0]===q&&x[1]===r+1));
   const k=b=>JSON.stringify(dayIncome(100,50,10));state.buildings=[{id:1,key:'karawane',cells:[[q,r],[q+1,r]],lvl:1}];const a=dayIncome(100,50,10);state.buildings.push({id:2,key:'zebras',cells:[[q-1,r]],lvl:1});const b=dayIncome(100,50,10);state.buildings.push({id:3,key:'reptilien',cells:[[q,r+1]],lvl:1});const c=dayIncome(100,50,10);state.buildings=[];return JSON.stringify([a,b,c])})()`));
 L('Karawane Einkommen',JSON.stringify(kv.map(x=>x.kar!=null?x.kar:x)));
 T(JSON.stringify(kv[0])!==JSON.stringify(kv[1])&&JSON.stringify(kv[1])===JSON.stringify(kv[2]),'Karawane: Taler für Savannen-Nachbar, nicht für Wüsten-Nachbar');
 T(ev(`(()=>{modal='help';render();const b=document.getElementById('mTraits');if(!b)return false;b.click();return modal==='traits'&&/Raubtier/.test(document.getElementById('modalRoot').textContent)&&/Showtier/.test(document.getElementById('modalRoot').textContent)})()`),'Menü → Eigenschaften öffnet Übersicht');
 T(ev(`(()=>{document.getElementById('mTrBack').click();return modal==='help'})()`),'Zurück zum Menü');
 T(/max-height:33dvh/.test(d.documentElement.innerHTML),'Infokasten höchstens ⅓');
 T(!/Im Tutorial bitte genau/.test(d.documentElement.innerHTML)&&/Auf die leuchtenden Felder legen/.test(d.documentElement.innerHTML),'Kurze Tutorial-Zeile');
 T(/Als App installieren/.test(ev(`(()=>{modal=null;screen='title';renderAll();return document.body.innerHTML})()`)),'App-Hinweis im Browser');
 L('fertig')}catch(e){L('ERR',e.stack)}},1500);
