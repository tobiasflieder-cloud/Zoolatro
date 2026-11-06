// 0.67a: Jasper-Tutorial (Zoo 1): Kapitel, Häppchen, Ziele, Merkmale aus, Ende
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};screen='tut';screenArg={};renderAll()`);
 T(ev('VERSION')==='0.67a','Version');
 T(/Jasper/.test(d.body.innerHTML),'Tutorial-Menü nennt Jasper');
 d.querySelector('[data-tutch]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
 T(ev('runOf().tut&&state.tut&&state.tut.ch')==='zl','Kapitel zl startet');
 T(ev('state.zl.insp')==='frei'&&!ev('modal'),'Keine Winter-Bedingung, kein Zoo-Fenster');
 T(ev('[0,1,2,3].map(i=>seOf(i).target).join()')==='5000,50000,80000,150000','Ziele 5000/50000/80000/150000');
 ev('render()');T(/Jasper/.test(d.getElementById('coach').textContent),'Coach: Jasper');
 const mob=ev('!document.body.classList.contains("land")');
 if(mob){T(!!d.getElementById('tutMore'),'Handy: Häppchen mit Weiter-Knopf');const t1=d.getElementById('coach').textContent;d.getElementById('tutMore').click();ev('render()');T(d.getElementById('coach').textContent!==t1,'Weiter zeigt nächstes Häppchen')}
 ev(`document.body.classList.add("land")`);T(!ev("tutStep()._read"),"Querformat: ganzer Text in einer Box");
 T(ev('traitsOf("zebras").length')===0,'Merkmale im Tutorial aus');
 T(ev('TUTGUIDED.join()')==='zl,zs,zh','Geführte Kapitel Frühling/Sommer/Herbst');
 T(ev('GUIDE.length')===0,'Alte Hinweise entfernt');
 T(ev('CHANGES[0].v')==='0.67a','Neuigkeiten 0.67a');
 L('fertig')}catch(e){L('ERR',e.stack)}process.exit(0)},300);
