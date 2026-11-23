// 0.93a: Profil-Knopf und -Fenster, Show-Spektrum im Detail-Fenster, gelangweilte Showtiere
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||90;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const slot=`{name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1,fs:{'h:arktis':1,'h:gebirge':1},z2:{st:{grund:4},ch:{}}}`;
const base=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.d4=0;META.d5=1;META.stAll=0;META.pvOff=0;META.slots[0]=${slot};META.lastSlot=0;META.active=0;screen=null;`;
const start=(w,o={})=>w.eval(base+`META.wr=${o.wr?1:0};enterCamp(0,true,'${o.deck||'grund'}','z2',${JSON.stringify(o.habs||['wasser','savanne','wueste'])},NOPROF,${o.stage||1});if(!${o.wr?1:0}){modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;render()}`);
// Helfer im Spiel: freie Mitte A mit Ring N[0..5]; Karten nach Bedingung (1 Feld); Aufstellen; Zeilen der Wertung
const H=`TERR.clear();var A0=BOARD.find(([q,r])=>DIRS.every(([a,c])=>ONBOARD.has(hk(q+a,r+c))&&DIRS.every(([e,f])=>ONBOARD.has(hk(q+a+e,r+c+f)))));var NB=DIRS.map(([a,c])=>[A0[0]+a,A0[1]+c]);
var one=(f,n,ex)=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return!/[~^#]/.test(k)&&!c.ms&&!c.gone&&!c.jt&&!c.sig&&SHAPES[c.shape].cells.length===1&&f(c)&&!(ex||[]).includes(k)}).slice(0,n||1);
var anyk=(f,n)=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return!/[~^#]/.test(k)&&!c.ms&&!c.gone&&!c.jt&&!c.sig&&f(c)}).slice(0,n||1);
var put=L=>{state.buildings=L.map(([k,cell],i)=>({id:100+i,key:k,cells:[cell],lvl:1}));syncCtx();return state.buildings};
var lines=b=>breakdown(b,state.buildings).parts.map(p=>p.label).join(' | ');var team=L=>{runOf().spec=L.slice();state.spec=L.slice();syncCtx()};`;
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.93a','Version');
 // 1. Profil-Knopf und Fenster
 start(w,{stage:3});ev(H+`state.rule=null;team([]);state.phase='play';render()`);
 const pb=d.getElementById('btnProf');T(!!pb&&!pb.hidden&&/🧑‍💼/.test(pb.textContent)&&/3/.test(pb.textContent),`Profil-Knopf im Lauf sichtbar, Emoji und Stufe (${pb&&pb.textContent})`);
 pb.click();let m=d.getElementById('modalRoot').textContent;
 T(/Der Zoogründer/.test(m)&&/geliehenen Lastwagen/.test(m)&&/Stufe 3/.test(m)&&d.querySelectorAll('[data-proft]').length===3,'Profil-Fenster: Name, Personen-Text, Stufe, 3 Reiter');
 T(/Profil-Regel/.test(m)&&!!d.querySelector('#modalRoot .zstg'),'Reiter Lauf: Profil-Regel, Stufe aufklappbar');
 d.querySelector('[data-proft="deck"]').click();T(!!d.querySelector('#modalRoot .dmix')&&!d.querySelector('#modalRoot [data-ctrim]')&&/Lauf-Deck/.test(d.getElementById('modalRoot').textContent),'Reiter Deck: Übersicht und Liste, nur ansehen');
 d.querySelector('[data-proft="regeln"]').click();T(/Reinheit/.test(d.getElementById('modalRoot').textContent)&&/Gelände/.test(d.getElementById('modalRoot').textContent),'Reiter Regeln: Regeln des Laufs');
 d.getElementById('mClose').click();T(ev('modal')===null,'Schließen');
 ev(`modal='zoo';render()`);m=d.getElementById('modalRoot');T(!m.querySelector('.zstg')&&!d.getElementById('mZooRules')&&!/Lebensraum-Regeln|Wachsende/.test(m.textContent)&&/Dieser Zoo/.test(m.textContent),'Zoo-Übersicht ohne Stufe, Regeln-Knopf, Lauf-Dinge');ev(`modal=null;render()`);
 T(J(`(()=>{const p=PROFIL_DATEN.profile;return p.every(x=>x.person&&x.person.length>20)})()`),'alle Profile haben einen Personen-Text');
 ev(base+`screen='cdeck';screenArg={slot:0,zl:'z2',habs:['wasser','savanne','wueste'],prof:NOPROF};renderAll()`);T(/geliehenen Lastwagen/.test(d.body.textContent),'Personen-Text in der Profilwahl');
 // 2./3. Show-Spektrum und gelangweilte Showtiere
 start(w);ev(H+`state.rule=null;team([])`);
 const sp=J(`(()=>{const s=one(c=>c.cat==='gehege'&&c.tags.includes('show')&&!c.tags.includes('scheu')&&c.key!=='belugas')[0],g=one(c=>c.cat==='essen'&&!c.rq&&!(TRAITS.ruhig||[]).includes(c.key)&&!(TRAITS.trubel||[]).includes(c.key),2),tr=one(c=>c.cat==='essen'&&(TRAITS.trubel||[]).includes(c.key))[0]||one(c=>c.cat==='attr'&&(TRAITS.trubel||[]).includes(c.key))[0];
   const spec=()=>{const b=state.buildings[0],h=showSpecHtml(b,state.buildings,K(b),mkIndex(state.buildings)),t=document.createElement('div');t.innerHTML=h;return{now:(t.querySelector('.dtsnow')||{}).textContent||'',on:(t.querySelector('.dtlad .on')||{}).textContent||'',lad:[...t.querySelectorAll('.dtlad span')].map(x=>x.textContent).join('|')}};
   const o={};put([[s,A0]]);o.z=spec();o.zl=lines(state.buildings[0]);put([[s,A0],[g[0],NB[0]]]);o.e=spec();o.el=lines(state.buildings[0]);
   put([[s,A0],[g[0],NB[0]],[tr,NB[2]],[tr,NB[4]]]);o.v=spec();put([[s,A0],['buehne',NB[0]]]);o.n=spec();put([['belugas',A0],[g[0],NB[0]]]);o.b=spec();
   put([[s,A0]]);const ts=TUTNOW;TUTNOW=true;o.tut=lines(state.buildings[0]);o.tsp=showSpecHtml(state.buildings[0],state.buildings,K(state.buildings[0]),mkIndex(state.buildings));TUTNOW=ts;syncCtx();
   state.phase='play';put([[s,A0]]);META.pvOff=0;render();o.mark=!!document.querySelector('#board .bored');META.pvOff=1;render();o.mark0=!!document.querySelector('#board .bored');META.pvOff=0;return o})()`);
 T(/jetzt ×0,8 B/.test(sp.z.now)&&/höchstens ×2,5/.test(sp.z.now)&&/kein/.test(sp.z.on),`Spektrum 0 Auslöser: jetzt ×0,8 B (${sp.z.now})`);
 T(/jetzt ×1,35/.test(sp.e.now)&&/1×1,35/.test(sp.e.on)&&/2×1,7\|3×2,05\|4\+×2,4/.test(sp.e.lad),`Spektrum 1 Auslöser: jetzt ×1,35, Leiter ${sp.e.lad}`);
 T(/jetzt ×2,4/.test(sp.v.now),`Spektrum 4 Auslöser (2 Trubel): ×2,4 (${sp.v.now})`);
 T(/jetzt ×1,7/.test(sp.n.now)&&/Nova/.test(sp.n.now)&&/×2,5/.test(sp.n.lad),`Spektrum mit Nova: verdoppelte Stufen (${sp.n.lad})`);
 T(/jetzt ×1,45/.test(sp.b.now)&&/Belugas/.test(sp.b.now),`Spektrum Belugas: ×1,45 (${sp.b.now})`);
 T(/😴 Showtier gelangweilt: ×0,8 B/.test(sp.zl)&&!/gelangweilt/.test(sp.el)&&/Showtier: ×1,35/.test(sp.el),'Showtier allein ×0,8 B, mit 1 Gastro ×1,35');
 T(!/gelangweilt/.test(sp.tut)&&sp.tsp==='','nicht im Tutorial');T(sp.mark&&!sp.mark0,'Schild „😴 ×0,8“ nur mit Vorschau');
 // Tutorial: kein Knopf
 ev(base+`screen='tut';screenArg={};renderAll()`);d.querySelector('[data-tutch]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));ev('render()');await wait(50);T(d.getElementById('btnProf').hidden,'Profil-Knopf im Tutorial weg');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
