// 0.66a: Futtersack lesbar, Früh geschafft (Baupunkte + Geschenke), Neuigkeiten
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund',true,['wasser','savanne','wueste'],NOPROF);modal=null;syncCtx();render()`);
 T(ev('VERSION')==='0.66a','Version '+ev('VERSION'));
 // 1 Futtersack lesbar
 const css=ev(`document.querySelector('style').textContent`);
 T(/\.fdc\{[^}]*background:var\(--panel2\)[^}]*color:var\(--text\)/.test(css)&&!/var\(--card,#fff\)/.test(css),'Futter-Karten: dunkler Hintergrund, helle Schrift');
 // 2 Früh geschafft
 T(ev(`(()=>{const r=runOf();r.bpCarry=0;r.gifts=[];const t=earlyReward(2);return r.bpCarry===2&&r.gifts.join()==='gsack'&&/\\+2 Baupunkte/.test(t)&&/Futtersack/.test(t)})()`),'2 Tage früher: +2 Baupunkte, Gratis-Futtersack');
 T(ev(`(()=>{const r=runOf();r.bpCarry=0;r.gifts=[];earlyReward(1);const a=r.gifts.length===0&&r.bpCarry===1;r.gifts=[];earlyReward(3);const b=r.gifts.join()==='gumb';r.gifts=[];earlyReward(4);const c=r.gifts.join()==='gprofi';r.gifts=[];r.bpCarry=0;return a&&b&&c})()`),'1 Tag: nur Baupunkt · 3 Tage: Umbau-Kiste · 4 Tage: Profi-Mappe');
 T(ev(`(()=>{const r=runOf();r.foodOff=1;r.gifts=[];const m=state.money;earlyReward(2);const ok=r.gifts.length===0&&state.money===m+20;r.foodOff=undefined;r.bpCarry=0;return ok})()`),'Futter aus: 20 Taler statt Futtersack');
 T(ev(`(()=>{const r=runOf();r.tut=1;r.gifts=[];earlyReward(3);const ok=r.gifts.length===0&&r.bpCarry===3;r.tut=undefined;r.bpCarry=0;return ok})()`),'Tutorial: nur Baupunkte, kein Geschenk');
 T(ev(`(()=>{const r=runOf();r.bpCarry=2;state.bpMax=4;startDay();const a=state.bp;const b=r.bpCarry;return a===5&&b===1})()`),'Baupunkt-Übertrag: +1 je Tag');
 T(ev(`(()=>{const r=runOf();r.gifts=['gsack','gumb','gprofi'];state.season=0;state.phase='review';state.money=0;openShop();modal='shop';const f=fixedItems().filter(i=>EARLYG[i.kind]);return f.length===3&&f.every(i=>i.price===0)})()`),'Geschenke im Shop, gratis');
 T(ev(`(()=>{const it=fixedItems().find(i=>i.kind==='gsack');buy(it);const ok=state.shopSub==='sack'&&state.sack.opts.length===2&&!(runOf().gifts||[]).includes('gsack')&&(state.sackN||0)===0;state.sack=null;state.shopSub=null;return ok})()`),'Gratis-Futtersack öffnet den Sack, zählt nicht als gekauft');
 T(ev(`(()=>{buy(fixedItems().find(i=>i.kind==='gumb'));const a=state.shopSub==='umbau'&&state.umbOpts.length===3;state.shopSub=null;buy(fixedItems().find(i=>i.kind==='gprofi'));const b=state.shopSub==='mappe'&&state.mappe.pro;state.shopSub=null;state.mappe=null;return a&&b&&(runOf().gifts||[]).length===0})()`),'Gratis-Umbau-Kiste und Gratis-Profi-Mappe');
 T(ev(`(()=>{META.shopT='run';runOf().gifts=['gprofi'];render();const h=document.getElementById('modalRoot').innerHTML;runOf().gifts=[];return /Gratis: Profi-Mappe/.test(h)})()`),'Geschenk sichtbar im Reiter');
 // 3 Neuigkeiten
 T(ev(`CHANGES[0].v===VERSION&&CHANGES.length>=3`),'Neuigkeiten: aktuelle Version oben');
 T(ev(`(()=>{showNews();const o=document.getElementById('newsOv');const ok=!!o&&/Neu in Zoolatro 0\\.66a/.test(o.innerHTML);document.getElementById('newsOk').click();return ok&&!document.getElementById('newsOv')})()`),'Neuigkeiten-Fenster öffnen und schließen');
 T(ev(`(()=>{modal='help';render();const b=document.getElementById('mNews');if(!b)return false;b.click();const ok=!!document.getElementById('newsOv');document.getElementById('newsOv').remove();modal=null;return ok})()`),'Menü: 📜 Neuigkeiten');
 T(ev(`(()=>{META.seenVer='0.65a';saveMeta();NEWSPEND=0;start(null);const a=META.seenVer===VERSION;return a})()`),'Nach Update: Version gemerkt');
 L('fertig')}catch(e){L('ERR',e.stack)}setTimeout(()=>{try{L('popup nach start:',!!d.getElementById('newsOv'))}catch(e){}process.exit(0)},700)},300);
