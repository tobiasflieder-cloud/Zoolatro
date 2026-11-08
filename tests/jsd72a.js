// 0.72a: Schimmernd und Goldfelder multiplizieren, Texte Lebensraum-Regeln und Showtier
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund',true,['wasser','savanne','wueste'],NOPROF);modal=null;syncCtx()`);
 T(ev('VERSION')==='0.72a','Version');
 // freies Feld-Paar ohne Naturfläche, Felsen, Krone suchen; Zebras (2 Felder) darauf
 const setup=ev(`(()=>{for(const[q,r]of BOARD){const c=placeCells('zebras',0,q,r);if(c.every(([a,b])=>ONBOARD.has(hk(a,b))&&!TERR.get(hk(a,b))&&hk(a,b)!==state.zl.crown))return JSON.stringify(c)}return null})()`);
 T(!!setup,'Platz gefunden');const cells=JSON.parse(setup),ks=cells.map(c=>c.join(','));
 const val=(gold,ed)=>JSON.parse(ev(`(()=>{state.zl.gold=${JSON.stringify(gold)};state.zl.g4=[];state.zl.insp='frei';state.season=1;state.spec=[];state.buildings=[{id:1,key:'zebras',cells:${setup},lvl:1,ed:${JSON.stringify(ed)}}];syncCtx();const parts=[];evalB(state.buildings[0],state.buildings,mkIndex(state.buildings),parts);let a=CARDS.zebras.a,s=CARDS.zebras.s;for(const p of parts)if(/Goldenes Feld|Schimmernd/.test(p.label)){a+=p.a;s+=p.s}return JSON.stringify([a,s])})()`));
 const b0=val([],''),g1=val([ks[0]],''),g2=val(ks,''),s1=val([],'s'),sg=val([ks[0]],'s'),s2g2=val(ks,'ss');
 L('  Werte ohne/1 Gold/2 Gold/Schimmernd/Schimmernd+Gold/2×Schimmernd+2 Gold:',JSON.stringify([b0,g1,g2,s1,sg,s2g2]));
 const near=(x,y,f)=>x===y*f;
 T(b0[0]>0&&b0[1]>0,'Grundwert positiv');
 T(near(g1[0],b0[0],2)&&near(g1[1],b0[1],2),'1 Goldfeld ×2');
 T(near(g2[0],b0[0],4)&&near(g2[1],b0[1],4),'2 Goldfelder ×4 (bisher ×3)');
 T(near(s1[0],b0[0],2)&&near(s1[1],b0[1],2),'Schimmernd ×2');
 T(near(sg[0],b0[0],4)&&near(sg[1],b0[1],4),'Schimmernd + Goldfeld ×4 (bisher ×3)');
 T(near(s2g2[0],b0[0],12)&&near(s2g2[1],b0[1],12),'2× Schimmernd (×3) und 2 Goldfelder (×4) = ×12');
 // Texte
 const hr=ev('JSON.stringify(HABRULE)');
 T(/ganze Kette nur ×0,5/.test(hr)&&/einzelnes Wasser-Gehege ohne Wasser-Nachbarn bleibt bei ×1/i.test(hr),'Hilfe Wasser: ganze Kette ×0,5, einzeln ×1');
 T(/ganze Gruppe zusammenhängender Gebirgs-Gehege nur ×0,5/.test(hr)&&/ganze Gruppe zusammenhängender Arktis-Gehege nur ×0,5/.test(hr),'Hilfe Gebirge/Arktis: ganze Gruppe ×0,5');
 T(/zählen doppelt, zusammen höchstens \+120 %/.test(ev(`JSON.stringify(TXT)`)),'Showtier-Text: Trubel doppelt, höchstens +120 %');
}catch(e){L('EXC',e.stack)}process.exit(0)},300);
