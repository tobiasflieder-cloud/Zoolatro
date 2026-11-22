// 0.86a: Weltreise-Regionen (jeder Kontinent einmal), Savannen-Herde schwächer, Steppe-4er 3 BP, freischaltbare Gehege stärker, Zoo-Menü neu gegliedert
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||86;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const base=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.d4=0;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;`;
const start=(w,wr,habs,deck)=>w.eval(base+`META.wr=${wr?1:0};enterCamp(0,true,'${deck||'grund'}','z2',${JSON.stringify(habs||['wasser','savanne','wueste'])},NOPROF,1);if(!${wr?1:0}){modal=null;state.ruleIntro=0;state.wishIntro=0}`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.86a','Version');
 // 1. Regionen: viele ganze Reisen (6 Zoos, Arktis und Gebirge freigeschaltet, zufällige Lebensräume)
 start(w,1);
 const R=J(`(()=>{const sl=META.slots[0];fsOf(sl)['h:arktis']=1;fsOf(sl)['h:gebirge']=1;const r=runOf(),HS=Object.keys(HAB),out=[];
   for(let t=0;t<40;t++){const H=shuffle(HS).slice(0,3);r.habs=H;r.wrRoute=[];r.zoo=0;r.boni=[];const run={H,zoos:[]};
     for(let z=0;z<6;z++){r.zoo=z;const o=wrRollOpts0(r).map(q=>({k:q.k,r:q.r||null,ort:q.ort,foc:q.foc,eu:!!q.eu}));run.zoos.push(o);if(!o.length)break;const c=o[Math.floor(Math.random()*o.length)];r.wrRoute.push({k:c.k,r:c.r,ort:c.ort,z})}
     run.route=r.wrRoute.map(x=>x.k);out.push(run)}
   r.zoo=0;r.wrRoute=[];return{out,reg:WRREG}})()`);
 const REG=Object.fromEntries(R.reg.map(x=>[x.id,x]));
 T(R.out.every(x=>x.route.length===6),'6-Zoo-Reise geht bis zum Ende auf (40 Reisen)');
 T(R.out.every(x=>new Set(x.route).size===x.route.length),'nie derselbe Kontinent zweimal, auch Europa nicht');
 T(R.out.every(x=>x.zoos.every(o=>new Set(o.map(q=>q.k)).size===o.length)),'Ziele einer Wahl von verschiedenen Kontinenten');
 T(R.out.every(x=>x.zoos.every(o=>o.every(q=>q.eu||(REG[q.r]&&REG[q.r].k===q.k&&REG[q.r].foki.includes(q.foc)&&x.H.includes(q.foc))))),'nur Regionen mit gewähltem Schwerpunkt, Schwerpunkt aus der Region');
 T(R.out.every(x=>x.zoos[0].length===3),'erste Wahl: 3 Ziele');
 const last=R.out.map(x=>x.zoos[5].length);L(`  Ziele im letzten Zoo: ${[...new Set(last)].sort().join(', ')}`);T(last.every(n=>n>=1&&n<=2),'gegen Ende weniger Ziele (im 6. Zoo höchstens 2)');
 T(R.out.every(x=>x.zoos.every(o=>o.filter(q=>q.eu).every(q=>['Berlin','Wien','Kopenhagen','Zürich','Amsterdam'].includes(q.ort)))),'Europa mit zufälligem Stadtnamen');
 // Polargebiete ohne freigeschaltete Arktis nie
 const P=J(`(()=>{const sl=META.slots[0];delete fsOf(sl)['h:arktis'];const r=runOf();r.habs=['arktis','wasser','savanne'];r.wrRoute=[];const o=[];for(let i=0;i<30;i++)o.push(...wrRollOpts0(r).map(q=>q.k));r.habs=['wasser','savanne','wueste'];return o})()`);
 T(!P.includes('polar'),'Polargebiete fehlen ohne freigeschaltete Arktis');
 // Europa als Ersatz, wenn nichts mehr übrig ist (auch wenn schon besucht)
 T(J(`(()=>{const r=runOf();r.wrRoute=WRK.map((K,z)=>({k:K.id,ort:K.name,z}));r.zoo=7;const o=wrRollOpts0(r);r.wrRoute=[];r.zoo=0;return o.length===1&&o[0].eu})()`),'Europa als Ersatz, wenn kein Kontinent mehr übrig ist');
 // alter Spielstand aus 0.85a (Kontinent-Kennungen antarktis/himalaya, Orte als Namen)
 T(ev(`(()=>{const r=runOf();r.wrRoute=[{k:'antarktis',ort:'Rossmeer',z:0},{k:'himalaya',ort:'Ladakh',z:1}];r.zoo=2;const o=wrRollOpts0(r);const h=wrPickHtml(r,{});r.wrRoute=[];r.zoo=0;return o.length>0&&!o.some(q=>q.k==='polar'||q.k==='asien')&&/wrworld/.test(h)})()`),'alter Spielstand: Antarktis/Himalaya zählen als Polargebiete/Asien (Karte ohne Fehler)');
 // Anzeige: Region als Name, Kontinent darunter
 ev(`(()=>{const r=runOf();r.zoo=0;r.wrRoute=[];r.wrOpts=null;screen='creward';screenArg=r.reward={step:'wr',first:1};wrRollOpts(r);renderAll()})()`);
 ev(`screenArg.wrSel=0;renderAll()`);const c0=d.querySelector('.wrc .wrnm');const o0=J(`runOf().wrOpts[0]`);T(!!c0&&c0.firstChild.textContent.trim()===o0.ort&&/[A-ZÄÖÜ]/.test(c0.querySelector('small').textContent),`Kontinent-Wahl: Region als Name, Kontinent darunter (${c0&&c0.textContent})`);
 ev(`screenArg.wrSel=0;runOf().wrOpts[0].rw=null;wrGo(runOf(),screenArg,0)`);ev(`modal=null;state.ruleIntro=1;render()`);
 T(new RegExp(o0.ort).test((d.getElementById('rulePop')||{}).textContent||'')&&/Willkommen/.test(d.getElementById('rulePop').textContent),'Willkommen-Einblendung mit Region');
 T(new RegExp(o0.ort).test(ev('runText(runOf())')),'Lauf-Text nennt die Region');
 // 4. Zoo-Menü
 ev(`(()=>{const b=document.querySelector('#rulePop [data-bpok]');if(b)b.click();modal='zoo';ZRULES=0;render()})()`);
 let m=d.getElementById('modalRoot');
 T(!!m.querySelector('.zbig')&&!!m.querySelector('.zstand')&&/Dieser Zoo/.test(m.textContent)&&/Dein Stand/.test(m.textContent),'Zoo-Menü: „Dieser Zoo“ und „Dein Stand“');
 const tl=[...m.querySelectorAll('.zbig .ztl')].map(e=>e.className.split(' ')[1]);T(tl[0]==='zwr'&&tl.includes('zwt')&&tl.indexOf('zwt')===tl.length-1,`feste Reihenfolge: Ziel … Winter (${tl.join(',')})`);
 T(m.querySelectorAll('.zstand details').length>=2,'Stand-Zeilen aufklappbar (seit 0.93a: Reinheit, Vielfalt, Zucht; Lauf-Dinge im Profil-Fenster)');
 T(!d.getElementById('mZooRules')&&!!d.getElementById('mClose'),'Knopf „Los geht’s“, kein „📖 Regeln“ mehr (seit 0.93a im Profil-Fenster)');
 ev(`PROFT='regeln';modal='prof';render()`);m=d.getElementById('modalRoot');T(/Stufe/.test(m.textContent)&&/Zucht/.test(m.textContent)&&/Gelände/.test(m.textContent),'Regeln im Profil-Fenster mit Stufe, Zucht, Gelände');
 ev(`modal='zoo';render()`);T(/Dieser Zoo/.test(d.getElementById('modalRoot').textContent),'Zoo-Menü wieder offen');
 T(ev(`(()=>{const ids={};document.querySelectorAll('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);return Object.values(ids).every(n=>n===1)})()`),'keine doppelten ids');
 // 5. Kronenfeld erreichbar (normale Läufe und Weltreise mit halber Natur)
 const kr=J(`(()=>{const r=runOf(),kb=BOARD.map(c=>c.slice()),kt=TERR,out=[];const chk=p=>{if(!p.crown)return;setBoard(p.cells);TERR=new Map(p.terr);const ek=p.rule&&p.rule.entry?hk(...p.rule.entry):null,ax=p.rule&&p.rule.ax,bad=k=>!!ax&&ax.includes(k);out.push(crownFits(p.crown,ek,bad))};
   for(let i=0;i<20;i++){r.zoo=i%5;r.wrOpts=null;wrRollOpts0(r).forEach(o=>chk(o.plan))}const wr=r.wr;r.wr=0;for(let i=0;i<40;i++){r.zoo=i%5;r.maps={};chk(rollPlan0(r))}r.wr=wr;r.zoo=0;r.maps={};setBoard(kb);TERR=kt;return out})()`);
 L(`  Kronenfeld: ${kr.length} Gelände, Lagen min ${Math.min(...kr)}, ≥3 bei ${kr.filter(n=>n>=3).length}`);
 T(kr.length>50&&kr.every(n=>n>=1),'Kronenfeld: immer mindestens 1 passende Lage für ein 4-Felder-Gehege');T(kr.filter(n=>n>=3).length>=kr.length*.9,'Kronenfeld: meist mindestens 3 Lagen');
 // 2. Savannen-Herde
 start(w,0);
 const herde=(g,dk)=>J(`(()=>{const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&CARDS[x].hab==='savanne'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===1);state.buildings=[];for(let i=0;i<${g};i++)state.buildings.push({id:700+i,key:k,cells:[[i-3,0]],lvl:1});const idx=mkIndex(state.buildings),b=state.buildings[0],dk0=CTX.dk;CTX.dk='${dk||'grund'}';const r=habRule(b,CARDS[b.key],nbrs(b,idx),idx);CTX.dk=dk0;return r})()`);
 const hf=(g,dk)=>{const r=herde(g,dk);return r?r[1]:null};
 T(hf(1)===.5,'Herde: allein ×0,5');T(hf(2)===1,'Herde: 2 Gehege ×1');T(hf(3)===1.15,'Herde: 3 Gehege ×1,15');T(hf(4)===1.25,'Herde: 4 Gehege ×1,25');T(hf(9)===1.75&&hf(10)===1.75,'Herde: höchstens ×1,75');
 T(hf(4,'steppe')===1.3&&hf(7,'steppe')===1.75,'Steppe: +0,15 je weiteres, auch höchstens ×1,75');
 // 3. Steppe: 4-Felder-Gehege 3 BP
 start(w,0,['wasser','savanne','wueste'],'steppe');
 T(J(`(()=>{const k4=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===4&&!CARDS[x].pr&&!String(x).includes('~')),k1=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===1&&!CARDS[x].pr&&!String(x).includes('~'));return[dkNow(),costParts(k4).n,costParts(k1).n]})()`).join()==='steppe,3,2','Steppe: 4-Felder-Gehege 3 BP, 1-Feld 2 BP');
 // 4. Kartenwerte
 const W={nilpferde:[7,4],tiger:[7,4],addax:[6,3],nashoerner:[3,7],koalas:[5,3],eisbaeren:[8,3],krokodile:[6,3],schneeleoparden:[6,4],kaengurus:[6,3],antilopen:[6,4],kraken:[2,5],dingos:[5,2],rentiere:[6,3],braunbaeren:[7,3],rotepandas:[5,3],gorillas:null,bueffel:null,belugas:null};
 const cv=J(`Object.fromEntries(${JSON.stringify(Object.keys(W))}.map(k=>[k,CARDS[k]?[CARDS[k].a,CARDS[k].s]:null]))`);
 T(Object.keys(W).filter(k=>W[k]).every(k=>cv[k]&&cv[k][0]===W[k][0]&&cv[k][1]===W[k][1]),'freischaltbare Gehege: neue Grundwerte');
 T(J(`(()=>{const j=CARDS['tiger~j'];return j?[j.a,j.s]:null})()`)!==null,'Jungtier der Tiger vorhanden (erbt die Werte)');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
