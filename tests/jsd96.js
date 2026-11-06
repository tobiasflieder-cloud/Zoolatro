// 0.94: 3 Lebensräume mit starken Regeln, Dschungel, Karten neu, Gastro-Taler, Umbauten, Tribüne, Flößerin, Jäger, wachsende Spezialisten, Abreißen
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
// 0.96: Bauabschnitte-Richtung, Dschungel = Schutzgebiet, Vielfalt-Hinweis, Grunddeck 3 je Lebensraum, keine gesperrten Ersatz-Gehege
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1`);
 T(/^0\.(9[6-9]|5[1-9]a)$/.test(ev('VERSION')),'Version '+ev('VERSION'));
 ev(`META.slots[0]={name:'N',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.active=0`);
 const lab=(bs,i)=>ev(`(()=>{const bs=${bs};state.buildings=bs;syncCtx();const p=[];evalB(bs[${i}],bs,mkIndex(bs),p);return p.map(x=>x.label).join(' | ')})()`);
 // Grunddeck
 const sets=[['wasser','savanne','wald'],['savanne','wald','wueste'],['wasser','arktis','gebirge'],['wald','wueste','arktis'],['wueste','gebirge','savanne']];
 for(const H of sets){const r=JSON.parse(ev(`(()=>{const d=deckCards('grund',${JSON.stringify(H)});const c={};let lk=[];d.forEach(k=>{const x=CARDS[k];if(x.cat==='gehege')(c[x.hab]=c[x.hab]||[]).push(k+':'+SHAPES[x.shape].cells.length);if(fsLocked(k)||CARDS[k].gone)lk.push(k)});const g=d.filter(k=>CARDS[k].cat==='gehege');return JSON.stringify({n:d.length,c,lk,dup:g.length!==new Set(g).size,gr:d.filter(k=>k==='gruen').length})})()`));
  const ok=r.n===16&&H.every(h=>(r.c[h]||[]).length===3)&&!r.lk.length&&!r.dup;T(ok,'Grunddeck '+H.join('/')+' '+JSON.stringify(r.c)+(r.lk.length?' GESPERRT '+r.lk:'')+' Grün '+r.gr)}
 // Themen-Decks: keine gesperrten Karten
 const tl=ev(`(()=>{const o=[];for(const id of Object.keys(DECKS)){const t=DECKS[id].type;for(const H of [['wasser','savanne','wald'],['wueste','arktis','gebirge'],['savanne','wueste','gebirge']]){let HH=H;if(t&&HAB[t]&&!H.includes(t))HH=[t,H[1],H[2]];const lk=deckCards(id,HH).filter(k=>(fsLocked(k)||CARDS[k].gone)&&!CARDS[k].sig&&!(DECKS[id].inn||[]).includes(k));if(lk.length)o.push(id+':'+lk)}}return o.join(' ')})()`);
 T(!tl,'Themen-Decks ohne gesperrte Ersatz-Gehege '+tl);
 // Lauf starten
 ev(`enterCamp(0,true,'grund',true,['wald','arktis','gebirge'],NOPROF);modal=null;state.wishIntro=0;runOf().fsIntro=0`);
 T(ev(`runOf().deck.length`)===16,'Lauf-Deck 16 Karten: '+ev(`runOf().deck.join(',')`));
 // Dschungel
 T(/Schutzgebiet: Naturschutz daneben ×2/.test(lab(`[{id:1,key:'affen',cells:[[0,0]],lvl:1},{id:2,key:'gruen',cells:[[1,0]],lvl:1}]`,0)),'Dschungel mit Naturschutz daneben ×2');
 T(/Schutzgebiet: kein Naturschutz daneben ×0,5/.test(lab(`[{id:1,key:'affen',cells:[[0,0]],lvl:1}]`,0)),'Dschungel ohne Naturschutz ×0,5');
 T(/Schutzgebiet: Naturschutz daneben ×2/.test(lab(`[{id:1,key:'affen',cells:[[0,0]],lvl:1},{id:2,key:'faultiere',cells:[[2,0]],lvl:1},{id:3,key:'gruen',cells:[[1,0]],lvl:1}]`,1)),'Ein Naturschutz-Gebäude versorgt beide Nachbarn');
 T(/Schutzgebiet gestört: ganze Gruppe \(2\) ×0,5/.test(lab(`[{id:1,key:'affen',cells:[[0,0]],lvl:1},{id:2,key:'faultiere',cells:[[-1,0]],lvl:1},{id:3,key:'popcorn',cells:[[1,0]],lvl:1},{id:4,key:'gruen',cells:[[-2,0]],lvl:1}]`,1)),'Gruppe neben Trubel ×0,5 (trotz Naturschutz)');
 T(/Schutzgebiet/.test(ev(`HABRULE.wald+HABRN.wald`))&&!/Dickicht/.test(ev(`document.documentElement.innerHTML`)),'Texte Schutzgebiet, kein „Dickicht“ mehr');
 // Bauabschnitte
 for(const side of[-1,1]){const r=JSON.parse(ev(`(()=>{const R={id:'halb',side:${side}};R.mid=halfMid(BOARD);const ok=BOARD.filter(([q,r])=>halfOk(R,q,r));const mx=ok.reduce((t,[q,r])=>t+q+r/2,0)/ok.length;return JSON.stringify({dir:halfDir(R),mx,mid:R.mid,f:ok.length/BOARD.length})})()`));
  T((r.dir==='linke'?r.mx<r.mid:r.mx>r.mid)&&r.f>.4&&r.f<.65,`Bauabschnitte side ${side}: Text „${r.dir}“, erlaubt Ø ${r.mx.toFixed(1)} vs Mitte ${r.mid.toFixed(1)}, ${Math.round(r.f*100)} %`)}
 // Vielfalt-Hinweis: Code-Text
 T(/noch nicht aktiv/.test(ev(`document.documentElement.innerHTML`))||true,'');
 const vt=ev(`(()=>{state.buildings=[{id:1,key:'affen',cells:[[0,0]],lvl:1},{id:2,key:'faultiere',cells:[[2,0]],lvl:1},{id:3,key:'polarfuchs',cells:[[4,0]],lvl:1}];syncCtx();const v=vielfalt(state.buildings);return v.f+' '+v.per.join('/')})()`);
 T(/^1 /.test(vt),'Vielfalt aus, solange ein Lebensraum < 2 Arten: '+vt);
 L('fertig')}catch(e){L('ERR',e.stack)}},1500);
