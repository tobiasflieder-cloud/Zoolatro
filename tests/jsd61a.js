// 0.94: 3 Lebensräume mit starken Regeln, Dschungel, Karten neu, Gastro-Taler, Umbauten, Tribüne, Flößerin, Jäger, wachsende Spezialisten, Abreißen
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
// 0.61a: Mehrfach/Ausbau vom eigenen Wert, Futterknappheit ab Zoo 3, Profil-Auswahl
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund',true,['wasser','savanne','wald'],NOPROF);modal=null;state.season=1;syncCtx()`);
 T(ev('VERSION')==='0.61a','Version '+ev('VERSION'));
 T(ev('JSON.stringify(LVLW)')==='[0,0,0.75,1.25]','Ausbau +75 % / +50 %');
 const r=JSON.parse(ev(`(()=>{const free=k=>ONBOARD.has(k)&&!TERR.get(k);const C=BOARD.filter(([q,r])=>free(hk(q,r)));const far=C.find(([q,r])=>Math.abs(q-C[0][0])+Math.abs(r-C[0][1])>4);
  const bs=[{id:1,key:'cafe',cells:[C[0]],lvl:1},{id:2,key:'popcorn',cells:[far],lvl:2}];const bs2=[...bs,{id:3,key:'popcorn',cells:[C.find(([q,r])=>Math.abs(q-far[0])+Math.abs(r-far[1])>3&&Math.abs(q-C[0][0])+Math.abs(r-C[0][1])>3)],lvl:1}];
  const own=b=>{const v=evalB(b,bs2,mkIndex(bs2));return v};const st=scoreZoo(bs2).steps;const p2=st.find(x=>x.id===2),p3=st.find(x=>x.id===3),o2=own(bs2[1]),o3=own(bs2[2]);
  return JSON.stringify({p2,p3,o2,o3})})()`));
 T(r.p2.adjA===Math.round(.75*Math.max(0,r.o2.a)),'Ausbau = 75 % des eigenen Werts ('+r.p2.adjA+' von '+r.o2.a+')');
 T(r.p3.adjA===Math.round(-.25*Math.max(0,r.o3.a))||(!r.p3.adjA&&Math.round(-.25*r.o3.a)===0),'2. gleiche Karte: −25 % des eigenen Werts ('+r.p3.adjA+' von '+r.o3.a+')');
 const ins=ev(`(()=>{state.zoo=0;const o=new Set();for(let i=0;i<300;i++){SEEN={i:new Set(),r:new Set()};initZl();o.add(state.zl.insp)}return [...o].join(',')})()`);
 T(!/futter/.test(ins),'Zoo 1: keine Futterknappheit ('+ins+')');
 const ins2=ev(`(()=>{state.zoo=2;const o=new Set();for(let i=0;i<300;i++){SEEN={i:new Set(),r:new Set()};initZl();o.add(state.zl.insp)}state.zoo=0;return [...o].join(',')})()`);
 T(/futter/.test(ins2),'Zoo 3: Futterknappheit möglich');
 const ds=ev(`(()=>{screen='deck';screenArg={slot:0,habs:['wasser','savanne','wald'],zl:'zl'};return deckSelHtml()})()`);
 T(/Nur mit Lebensraum 🏜️ Wüste/.test(ds)&&/Oasen-Dschinn/.test(ds),'Wüsten-Profil ausgegraut sichtbar');
 T(!/Deck-Regel|Mit diesem Deck|Themen-Deck|Jedes Deck/.test(ds),'Profil-Texte auf der Auswahlseite');
 L('fertig')}catch(e){L('ERR',e.stack)}},1500);
