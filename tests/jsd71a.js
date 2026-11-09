// 0.71a: Weiter rechts, Tag-2-Hand, 8 Stufen-Knöpfe, Zurück nach Stufenwahl, Naturfelder, Seltenheits-Ecke, Futterplätze
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
 const ck=s=>{const e=d.querySelector(s);if(!e)return false;e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));return true};
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};screen='tut';screenArg={};renderAll()`);
 T(ev('VERSION')==='0.71a','Version');
 // Naturfelder
 const nat=ev(`(()=>{const HS=[['wasser','savanne','wueste'],['savanne','wald','arktis'],['wasser','wald','gebirge']],bad=[];for(const k of Object.keys(MAPS))for(const H of HS){GENHABS=H;for(let i=0;i<15;i++){const m=genMap(k),c={};let n=0;for(const[x,v]of m.terr)if(HAB[v]){n++;c[v]=(c[v]||0)+1;if(!H.includes(v))bad.push(k+' fremd '+v)}if(n!==18)bad.push(k+' '+n);const q=natQuota(k,H);for(const h of H)if((c[h]||0)!==q[h])bad.push(k+' '+h+' '+c[h]+'/'+q[h]);
   const seen=new Set();for(const[x,v]of m.terr){if(!HAB[v]||seen.has(x))continue;const st=[x];seen.add(x);let s=0;while(st.length){const z=st.pop();s++;const[a,b]=z.split(',').map(Number);for(const[dq,dr]of DIRS){const y=hk(a+dq,b+dr);if(!seen.has(y)&&m.terr.get(y)===v){seen.add(y);st.push(y)}}}if(k==='flusstal'&&v==='wasser'?s!==8:(s<2||s>4))bad.push(k+' Fleck '+v+' '+s)}}}GENHABS=null;return bad.slice(0,5).join(' | ')})()`);
 T(nat==='','Naturfelder: 18, nur gewählte Lebensräume, Flecken 2–4, Fluss 8 am Stück '+nat);
 T(ev(`JSON.stringify(natQuota('wiese',['wasser','savanne','wueste']))`)==='{"wasser":6,"savanne":6,"wueste":6}','Wiese 6/6/6');
 T(ev(`JSON.stringify(natQuota('flusstal',['wasser','savanne','wueste']))`)==='{"wasser":8,"savanne":5,"wueste":5}','Flusstal Wasser 8, Rest 5');
 T(ev(`JSON.stringify(natQuota('flusstal',['savanne','wald','wueste']))`)==='{"savanne":6,"wald":6,"wueste":6}','Flusstal ohne Wasser: 6/6/6');
 T(ev(`JSON.stringify(natQuota('bucht',['wasser','savanne','wueste']))`)==='{"wasser":7,"wueste":7,"savanne":4}','Bucht Wasser 7 + Wüste 7, Rest 4');
 T(ev(`(()=>{const q=natQuota('bucht',['wasser','savanne','wald']);return q.wasser===7&&q.savanne+q.wald===11&&Math.abs(q.savanne-q.wald)===1})()`),'Bucht ohne Wüste: 7 + 6 + 5');
 T(ev(`natQuota('huegel',['wald','savanne','wasser']).wald===8&&natQuota('huegel',['savanne','wasser','wueste']).savanne===8`),'Hügel: Wald 8, sonst Savanne 8');
 T(ev(`natQuota('zerkluftet',['wueste','wasser','wald']).wueste===8`),'Zerklüftet Wüste 8');
 // Tutorial: Weiter rechts, Tag 2
 ck('[data-tutch]');ev('render()');
 T(!!d.querySelector('#coach .tnav #tutMore')||!!d.querySelector('#coach .tnav #tutBtn'),'Weiter-Knopf steht in der rechten Knopfzeile');
 const ai=ev(`TUT.zl.steps.findIndex(s=>/Abrechnung des Tages/.test(JSON.stringify(s.t)))`),bi=ev(`TUT.zl.steps.findIndex(s=>s.only==='bratwurst')`);
 ev(`state.tut.i=${ai};state.tut.k=9;state.phase='play';state.day=1;state.hand=['cafe','papageien','popcorn'];render()`);
 T(ev('state.tut.i')===bi&&ev(`state.hand.join()`)==='bratwurst,giraffen','Tag 2: nach einem Zeichnen gleich Bratwurst-Schritt mit richtiger Hand ('+ev('state.hand.join()')+')');
 // Zoolatro-2.0-Lauf für Futter/Seltenheit
 ev(`META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund',true,['wasser','savanne','wueste'],NOPROF);modal=null;syncCtx();render()`);
 const sel=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].rar==='selten'&&!CARDS[k].ms)`),com='zebras';
 T(ev(`fdMaxK('${com}')`)===1&&ev(`fdMaxK('${sel}')`)===2,'Futterplätze: gewöhnlich 1, selten 2');
 T(ev(`fdMaxK(Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].rar==='sehr selten'))`)===3,'Futterplätze: sehr selten 3');
 T(ev(`(()=>{const k=fdKey('${com}','kf');return fdFits('kf','${com}')&&!fdFits('kr',k)})()`),'Gewöhnliches Tier: nach 1 Futter voll');
 T(ev(`(()=>{state.spec=(state.spec||[]).concat('futtermeister');const ok=fdMaxK('${com}')===2&&fdMaxK('${sel}')===3;state.spec=state.spec.filter(x=>x!=='futtermeister');return ok})()`),'Futtermeister +1 (2/3)');
 T(/1\/1 · voll/.test(ev(`fdSlotsHtml(fdKey('${com}','kf'))`))&&/0\/2 · 2 frei/.test(ev(`fdSlotsHtml('${sel}')`)),'Anzeige freie Futterplätze');
 // Seltenheits-Ecke auf Handkarten
 ev(`state.phase='play';state.hand=['${com}','${sel}'];render()`);
 const cards=d.querySelectorAll('#hand .card');
 T(cards.length===2&&!d.querySelector('.rarc')&&!cards[0].querySelector('.glz')&&!!cards[1].querySelector('.glz')&&cards[1].classList.contains('rg1'),'Nur seltene Karte glänzt (seit 0.75a Glanz statt Ecke)');
 const ss=ev(`Object.keys(CARDS).find(k=>CARDS[k].rar==='sehr selten')`);ev(`state.hand=['${ss}'];render()`);
 T(!!d.querySelector('#hand .card.rg2 .glz'),'Sehr selten (Legendär): eigener Glanz rg2');
 T(/\.glz::before\{[^}]*animation/.test(d.documentElement.innerHTML)&&/\.rg2\{--glzT:4\.5s\}/.test(d.documentElement.innerHTML),'Legendär glänzt öfter (4,5 s)');
 T(/class="pcard t3 rg2"/.test(ev(`specCard(Object.keys(SPEC).find(id=>SPEC[id].tier===3&&!SPEC[id].rb),'')`))&&!/t3|rg\d|glz/.test(ev(`specCard(Object.keys(SPEC).find(id=>SPEC[id].tier===1),'')`)),'Bewerbermappe: Stufe 3 glänzt, Stufe 1 nicht');
 ev(`state.spec=[Object.keys(SPEC).find(id=>SPEC[id].tier===3&&!SPEC[id].rb)];render()`);T(!!d.querySelector('.tm.t3'),'Team-Leiste: Stufe 3 glänzt');
 // Stufen-Knöpfe
 ev(`(()=>{const sl=META.slots[0];delete sl.run;delete sl.runAlt;state=null;modal=null;screen='cdeck';screenArg={slot:0,zl:'z2',prof:null,habs:['wasser','savanne','wueste'],seed:''};renderAll()})()`);
 const g=d.querySelector('.stgrid');
 T(!!g&&g.querySelectorAll('button').length===8,'8 Stufen-Knöpfe');
 T(g&&g.querySelectorAll('[data-stage]').length===ev(`stMax(META.slots[0],'grund')`)&&g.querySelectorAll('.stlk').length===8-ev(`stMax(META.slots[0],'grund')`),'Gesperrte Stufen grau mit 🔒');
 ck('.stgrid .stlk');T(!!d.querySelector('.sthint')&&/Zoo 3 mit Stufe/.test(d.querySelector('.sthint').textContent),'Tipp auf gesperrte Stufe: Hinweis');
 ck('.stgrid [data-stage="1"]');if(ev('modal')==='fsIntro')ev('runOf().fsIntro=0;modal="zoo";render()');
 T(ev('modal')==='zoo'&&!!d.getElementById('zlBack'),'Nach der Stufenwahl: Fenster mit ◂ Zurück');
 ck('#zlBack');
 T(ev('screen')==='cdeck'&&ev('state')===null&&!ev('META.slots[0].run')&&!!d.querySelector('.stgrid'),'Zurück: wieder Profil-/Stufenwahl, Lauf verworfen');
}catch(e){L('EXC',e.stack)}process.exit(0)},300);
