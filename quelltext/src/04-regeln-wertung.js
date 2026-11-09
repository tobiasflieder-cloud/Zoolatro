//@@ modul: 04-regeln-wertung
// stärkere Förderprogramme ab Zoo 3: gleiche Wirkung ×1,5, Preis ×1,8
{const sc=(o,f)=>{if(!o)return o;const r={};for(const k in o){const v=o[k];r[k]=k==='ma'||k==='ms'?+(1+(v-1)*f).toFixed(2):k==='a'||k==='s'?Math.round(v*f):+(v*f).toFixed(3)}return r};
 const fxP=t=>String(t).replace(/([+−-])(\d+) %/g,(m,sg,n)=>sg+Math.round(+n*1.5)+' %').replace(/×(\d+),(\d+)/g,(m,a,b)=>'×'+String(+(1+(+(a+'.'+b)-1)*1.5).toFixed(2)).replace('.',','));
 for(const id of Object.keys(PROGS)){const P=PROGS[id];if(P.plus)continue;const Q={icon:P.icon,price:Math.round(P.price*1.8),plus:id};if(P.per)Q.per=(...x)=>sc(P.per(...x),1.5);if(P.mult)Q.mult=(...x)=>sc(P.mult(...x),1.5);
  Object.defineProperties(Q,{name:{get:()=>PROGS[id].name+' Plus',enumerable:true},fx:{get:()=>(PROGS[id].fx||[]).map(fxP),enumerable:true},text:{get:()=>(PROGS[id].fx||[]).map(fxP).map(x=>x.replace('|',' ')).join(' · '),enumerable:true}});PROGS['plus_'+id]=Q}}

// veredelte Karten sind eigene Exemplare: 'affen~s' erbt alles von 'affen', bleibt aber aus Listen und Zufallspools heraus
for(const k of Object.keys(CARDS))for(const e in EDS)Object.defineProperty(CARDS,k+'~'+e,{enumerable:false,value:Object.assign(Object.create(CARDS[k]),{ed:e,base:k,name:CARDS[k].name+' '+EDS[e].icon})});
// Verbesserungen nach jedem Zoo: liegen auf genau einem Exemplar im Deck (Schlüssel 'affen^star')
// Godot-Vorbereitung 2c: Prägungen stehen in daten/praegungen.json; ihre Wirkung steckt in der Wertung (Kennung = Schlüssel)
const PRAEG_DATEN=/*@@DATEN:praegungen@@*/null;
const PRAEG={};for(const d of PRAEG_DATEN.praegungen){const P={};for(const p in d)if(p!=='key')P[p]=d[p];PRAEG[d.key]=P}
const prKey=(k,p)=>String(k).split('^')[0]+'^'+p;
Object.setPrototypeOf(CARDS,new Proxy(Object.prototype,{get(t,k,r){if(typeof k==='string'&&k.includes('#')&&!k.includes('^')){const i=k.indexOf('#'),b0=k.slice(0,i),par=CARDS[b0];if(!par)return undefined;const F=k.slice(i+1).split('.').filter(f=>FOOD[f]);const o=derive(par,{food:F,base:par.base||b0,name:par.name+' '+F.map(f=>FOOD[f].icon).join('')});Object.defineProperty(o,'fx',{get(){return[...F.map(f=>`${FOOD[f].icon}|${FOOD[f].name}: ${FOOD[f].text}`),...(par.fx||[])]}});Object.defineProperty(CARDS,k,{enumerable:false,value:o});return o}
  if(typeof k==='string'&&k.includes('^')){const[b0,pp]=k.split('^'),par=CARDS[b0],P=PRAEG[pp];if(!par||!P)return undefined;const o=derive(par,{pr:pp,base:par.base||b0,name:par.name+' '+P.icon});Object.defineProperty(o,'fx',{get(){return[P.fx,...(par.fx||[])]}});Object.defineProperty(CARDS,k,{enumerable:false,value:o});return o}return Reflect.get(t,k,r)}}));
// ===== 0.64a Futter-System =====
// Einzelfutter liegt dauerhaft auf einer Karte: Schlüssel 'otter#kf.ho' (vor einer Prägung: 'otter#kf^star'), höchstens 2 je Karte (Futtermeister 3).
// Lebensraum-Futter: Lauf-Stufen run.fdl[h]; je Gehege +2^(Stufe−1) B und N. Kauf über den 🧺 Futtersack (2 zufällige verwendbare Futter, eines nehmen).
// Testschalter bei der Lauf-Einrichtung (META.foodOff → run.foodOff): aus = wie 0.63a.
// Godot-Vorbereitung 2b: Futter steht in daten/futter.json; Bedingungen, auf welche Karten es passt, hier in FUTTER_WIRKUNG (Kennung = Futter-Schlüssel)
const FUTTER_DATEN=/*@@DATEN:futter@@*/null;
const FUTTER_WIRKUNG={ok:{
  le:c=>(c.tags||[]).includes('show'),
  kn:c=>(c.tags||[]).includes('raubtier'),
  be:c=>(c.tags||[]).includes('bedroht'),
  mo:c=>(c.tags||[]).includes('beute'),
  mw:c=>(c.tags||[]).includes('scheu'),
  mi:c=>!!c.jt,
  gp:c=>+(String(c.shape||'').replace(/\D/g,'')||1)>=3}};
const FOOD={};for(const d of FUTTER_DATEN.futter){const F={};for(const p in d){if(p==='key')continue;F[p]=d[p];if(p==='ok'){F.ok=FUTTER_WIRKUNG.ok[d.ok];if(!F.ok)throw new Error('Wirkung fehlt: ok '+d.ok)}}FOOD[d.key]=F}
const FOODR=FUTTER_DATEN.seltenheit_gewicht.slice(),FOODRN=FUTTER_DATEN.seltenheit_name.slice(),HFOODW=FUTTER_DATEN.lebensraum_gewicht;
const HFOOD=JSON.parse(JSON.stringify(FUTTER_DATEN.lebensraum_futter));
const fdOf=k=>{const m=/#([^~^]*)/.exec(String(k));return m&&m[1]?m[1].split('.').filter(f=>FOOD[f]):[]};
const fdHas=(b,f)=>!!b&&fdOf(b.key).includes(f);
const fdKey=(k,f)=>{const s=String(k),i=s.indexOf('^'),head=i<0?s:s.slice(0,i),tail=i<0?'':s.slice(i),j=head.indexOf('#'),b0=j<0?head:head.slice(0,j),L=fdOf(head);L.push(f);return b0+'#'+L.join('.')+tail};
const fdLvB=n=>n>0?2**(n-1):0;
const foodOnRun=r=>!!r&&!!r.zl&&(!r.tut||(typeof state!=='undefined'&&state&&state.season>=1))&&!r.foodOff;
function foodOn(){try{return foodOnRun(runOf())&&!!state&&state.mode==='camp'}catch(e){return false}}
function foodLvNow(){try{const r=runOf();return foodOnRun(r)?(r.fdl||{}):{}}catch(e){return{}}}
const fdTeam=id=>{try{return(state&&state.spec||[]).includes(id)}catch(e){return false}};
// 0.71a: Futterplätze nach Seltenheit: gewöhnlich 1, selten 2, sehr selten 3; Futtermeister +1
const fdMaxK=k=>{const c=CARDS[k];const r=c&&c.rar;return(r==='sehr selten'?3:r==='selten'?2:1)+(fdTeam('futtermeister')?1:0)};
const fdSlotsHtml=k=>{try{const c=CARDS[k];if(!c||c.cat!=='gehege'||c.ms||!foodOn())return'';const n=fdOf(k).length,m=fdMaxK(k),fr=Math.max(0,m-n);return`<span class="fdslot${fr?'':' full'}" title="Futterplätze">🍽️ ${n}/${m}${fr?` · ${fr} frei`:' · voll'}</span>`}catch(e){return''}};
const sackPrice=()=>Math.round((20+10*(state.sackN||0))*(fdTeam('tierern')?.75:1));
const sackOn=()=>foodOn();
function foodPile(){return['deck','discard','hand'].flatMap(p=>(state[p]||[]).map((k,i)=>[p,i,k]))}
function fdFits(f,k){const c=CARDS[k];if(!c||c.cat!=='gehege'||c.ms)return false;const F=fdOf(k);if(F.length>=fdMaxK(k)||F.includes(f))return false;return!FOOD[f].ok||FOOD[f].ok(c)}
const ueFits=k=>{const c=CARDS[k];return!!c&&c.cat==='gehege'&&!c.pr&&!c.jt&&!c.sig&&!c.ms};
function rollFood(n){const P=foodPile(),C=[];for(const h of habsNow())if(HFOOD[h])C.push(['h:'+h,HFOODW]);
  for(const f in FOOD){const ok=f==='ue'?P.some(x=>ueFits(x[2])):P.some(x=>fdFits(f,x[2]));if(ok)C.push([f,FOODR[FOOD[f].r]])}
  const out=[];while(out.length<n&&C.length){const tot=C.reduce((a,x)=>a+x[1],0);let r=Math.random()*tot,i=0;for(;i<C.length-1;i++){r-=C[i][1];if(r<=0)break}out.push(C.splice(i,1)[0][0])}return out}
function foodCard(o,btn){const run=runOf()||{};if(o.startsWith('h:')){const h=o.slice(2),H=HFOOD[h],n=(run.fdl||{})[h]||0,v0=fdLvB(n),v1=fdLvB(n+1);
    return`<div class="fdc hab"><span class="fdi">${H.icon}</span><div class="fdt"><small>🌍 Lebensraum-Futter · ganzer Lauf</small><b>${H.name}</b><span>Alle ${HAB[h].icon} ${HAB[h].label}-Gehege: Stufe ${n} → <b>${n+1}</b>, je Gehege <b>+${v1} B +${v1} N</b>${n?` (bisher +${v0})`:''}.</span></div>${btn}</div>`}
  const F=FOOD[o];return`<div class="fdc r${F.r}"><span class="fdi">${F.icon}</span><div class="fdt"><small>${o==='ue'?'🎁 sofort':'🐾 Einzelfutter · für '+F.for} · ${FOODRN[F.r]}</small><b>${F.name}</b><span>${F.text}.${o==='ue'?'':' Du wählst die Karte, das Futter bleibt dauerhaft auf ihr.'}</span></div>${btn}</div>`}
function foodLogAdd(t){const run=runOf();if(!run)return;(run.fdlog=run.fdlog||[]).push(`Zoo ${(run.zoo||0)+1} ${(seOf(state.season)||{}).name||''}: ${t}`)}
function foodBoxHtml(){const run=runOf();if(!run||!foodOnRun(run))return'';const L=run.fdl||{},hs=Object.keys(L).filter(h=>L[h]>0);
  return(hs.length?hs.map(h=>`${HFOOD[h].icon} ${HFOOD[h].name} · ${HAB[h].label} <b>Stufe ${L[h]}</b>: je Gehege +${fdLvB(L[h])} B +${fdLvB(L[h])} N`).join('<br>'):'Noch kein Lebensraum-Futter.')+'<br><span class="hint">Futter gibt es im Shop im Reiter 🧰 Umbau &amp; Futter: 🧺 Futtersack.</span>'}
const edFx={g:'+25 % B|🪙 Gold-Ausgabe',s:'×2|✨ Schimmernd: das Gehege/Gebäude zählt doppelt',r:'×1,2 B|🌈 Regenbogen: für den ganzen Zoo'};
for(const k of Object.keys(CARDS))for(const e in EDS)Object.defineProperty(CARDS[k+'~'+e],'fx',{get(){return[edFx[e],...(CARDS[k].fx||[])]}});
// Zoolatro 2.0: Jungtiere ('zebras~j'): 1 Feld, halber Grundwert (aufgerundet), gleiche Eigenschaften; neben der Elternart zählen sie doppelt
for(const k of Object.keys(CARDS)){const P=CARDS[k];if(P.cat!=='gehege'||P.ms)continue;const o=Object.create(P);
  Object.defineProperties(o,{key:{value:k+'~j'},par:{value:k},jt:{value:1},shape:{value:'s1'},rar:{value:'Jungtier'},bonus_:{value:0},tags:{value:P.tags.filter(t=>t!=='gross'&&t!=='einmalig')},
    a:{get:()=>Math.ceil(CARDS[k].a/2)},s:{get:()=>Math.ceil(CARDS[k].s/2)},name:{get:()=>CARDS[k].name+' 🍼'},
    fx:{get:()=>['×2|🍼 Familie: neben einem Gehege der Elternart',...(CARDS[k].fx||[])]},text:{get:()=>'Jungtier. Neben der Elternart zählt es doppelt. '+(CARDS[k].text||'')}});
  Object.defineProperty(CARDS,k+'~j',{enumerable:false,value:o})}
const ZLMULT=z=>Math.pow(2,z); // Ziele verdoppeln sich mit jedem Zoo
const GROWMAX=3,gf=(id,st,mx=GROWMAX)=>Math.min(mx,+(1+st*(((CTX.zl||{}).grow||{})[id]||0)).toFixed(2));
const HGROW={ma:.05,ms:.05},HGMAX=1.5;
const PURN=4,CROWNF=1.3; // Reinheit ab 4 verschiedenen Arten (vorher hier 6, syncCtx setzte 4)
// Vielfalt: je Lebensraum mit mindestens 2 verschiedenen Gehege-Arten ×1,05 Natur (es gilt Vielfalt oder Reinheit, das Bessere)
function vielfalt(bs){const H=(CTX&&CTX.habs)||DEFHABS,m={};for(const h of H)m[h]=new Set();for(const b of bs){const c=K(b);if(c.cat!=='gehege'||!c.hab||!m[c.hab])continue;m[c.hab].add(spK(b.key))}const per=H.map(h=>m[h].size),lvl=Math.min(5,Math.min(...per));return{lvl,per,habs:H,f:lvl>=2?1+.05*lvl:1}}
const vfTxt=v=>v.habs.map((h,i)=>HAB[h].icon+v.per[i]).join(' ');
// Reinheit: verschiedene Gehege-Arten in einer zusammenhängenden Gruppe eines Lebensraums (gleiche Arten halten die Gruppe nur zusammen)
const purF=n=>n>=PURN?Math.min(1.6,+(1+.15*(n-PURN+1)).toFixed(2)):1;
function zlPurity(bs,idx){let best=0,bh=null,zu=0;const seen=new Set();for(const b of bs){if(seen.has(b)||!isCat(b,'gehege'))continue;const h=K(b).hab,st=[b],ks=new Set();seen.add(b);let z=0;
    while(st.length){const x=st.pop();ks.add(spK(x.key));z+=x.ate||0;if(x.pr==='zucht'&&!zu){zu=1;z+=1}for(const y of nbrs(x,idx))if(!seen.has(y)&&isCat(y,'gehege')&&K(y).hab===h){seen.add(y);st.push(y)}}const n=ks.size+z;if(n>best){best=n;bh=h}}{const WB=bs.filter(b=>isCat(b,'gehege')&&K(b).hab==='wueste'),W=new Set(WB.map(b=>spK(b.key))),wn=W.size+WB.reduce((t,b)=>t+(b.ate||0),0);if(wn>best){best=wn;bh='wueste'}}return{n:best,hab:bh}}
// Profile der Kampagne: 16 Karten, zwei davon gegen den Schwerpunkt getauscht
// Godot-Vorbereitung 2b: Profile und Startdeck-Bausteine stehen in daten/profile.json, die Regeln wirken über den Profil-Schlüssel
const PROFIL_DATEN=/*@@DATEN:profile@@*/null;
const DECKGOAL=PROFIL_DATEN.ziel;
// ab 0.85: jedes Profil hat eine eigene kleine Regel (gilt im ganzen Lauf, nicht im Tutorial)
const DECKRULE=Object.fromEntries(PROFIL_DATEN.profile.map(d=>[d.key,d.regel]));
const runDeck=()=>{try{const r=runOf();return r&&r.zl&&!r.tut?r.deckId||'grund':''}catch(e){return''}};
const maxSpec=()=>MAXSPEC+(runDeck()==='freizeit'?1:0)+(runAus('team')?1:0);
const dkNow=()=>{try{if(typeof state==='undefined'||!state||state.mode!=='camp')return'';const sl=activeSlot(),r=sl&&sl.run;return r&&r.zl&&!r.tut?r.deckId||'grund':''}catch(e){return''}};
const kuDisc=key=>false;
const DECKS={};for(const d of PROFIL_DATEN.profile){const D={};for(const p in d)if(p!=='key'&&p!=='regel')D[p]=Array.isArray(d[p])?d[p].slice():d[p];DECKS[d.key]=D}
// 0.90 Startdecks (16 Karten): Tier-Decks = 6 Kern-Gebäude + 4 Gehege aus den anderen Lebensräumen + 3 Themen-Tiere + Signatur + 2 Themen-Gebäude; Gebäude-Decks = 8 Gehege + 2 Kern + 5 Themen-Gebäude + Signatur
const KERN=PROFIL_DATEN.startdeck.kern.slice(),G8=PROFIL_DATEN.startdeck.g8.slice();
const deckCards0=id=>{const D=DECKS[id]||DECKS.grund;if(!D.type)return START_DECK.slice();if(HAB[D.type])return KERN.concat(['_o2','_o1','_o2','_o1'],D.inn);return G8.concat(D.core||[],D.inn)};
// Profil an die gewählten Lebensräume anpassen: Gehege aus abgewählten Lebensräumen werden gegen gleich große aus den neuen getauscht; Platzhalter _o1/_o2 = Gehege (1/2 Felder) aus den anderen gewählten Lebensräumen
const HABSUB=JSON.parse(JSON.stringify(PROFIL_DATEN.startdeck.habsub));
// 0.96: Grunddeck = je gewähltem Lebensraum 3 Gehege (1 / 2 / 3–4 Felder) + 7 Gebäude; Ersatz-Gehege nie gesperrt
const GRBLD=PROFIL_DATEN.startdeck.grund_gebaeude.slice(),GRPREF=PROFIL_DATEN.startdeck.grund_vorzug.slice();
const okK=k=>{try{return!isLocked(k)}catch(e){return true}},gSz=k=>SHAPES[CARDS[k].shape].cells.length;
function gehege3(H){const out=[],used=new Set();for(const h of H){const all=[...GRPREF,...Object.keys(CARDS)].filter((k,i,a)=>a.indexOf(k)===i&&CARDS[k]&&CARDS[k].cat==='gehege'&&CARDS[k].hab===h&&!CARDS[k].sig&&!CARDS[k].gone&&!String(k).includes('~'));
  for(const sz of[[1],[2],[3,4]]){const pick=all.find(k=>!used.has(k)&&sz.includes(gSz(k))&&okK(k))||all.find(k=>!used.has(k)&&okK(k))||all.find(k=>!used.has(k));if(pick){used.add(pick);out.push(pick)}}}
  return out}
const RQS1={...PROFIL_DATEN.startdeck.ersatz};
const bldFix=(L,H)=>L.map(k=>CARDS[k]&&CARDS[k].rq&&!H.includes(CARDS[k].rq)?(RQS1[k]||'gruen'):k);
function grundDeck(H){return gehege3(H).concat(bldFix(GRBLD,H))}
const deckCards=(id,habs)=>{const D=DECKS[id]||DECKS.grund;if(!D.type&&habs)return grundDeck(habs);if(D.type&&!HAB[D.type]&&habs)return gehege3(habs).concat(bldFix([...(D.core||[]),...D.inn],habs));const d=deckCards0(id),H=habs||DEFHABS,used=new Set(d.filter(k=>k[0]!=='_'));
  if(D.type&&HAB[D.type]){const oth=H.filter(h=>h!==D.type);let oi=0;return d.map(k=>{if(k[0]!=='_')return k;const n=+k.slice(2),h=oth[oi++%Math.max(1,oth.length)]||H[0],L=[...(HABSUB[h][n]||[]),...(HABSUB[h][1]||[]),...(HABSUB[h][2]||[])],pick=L.find(x=>!used.has(x)&&okK(x))||L.find(okK)||L[0];used.add(pick);return pick})}
  if(!habs)return d;const U=DEFHABS.filter(h=>!habs.includes(h)),N=NEWHABS.filter(h=>habs.includes(h)),RQS={delfinshow:'lehrpfad',baumschule:'gruen',wasserfall:'gruen',wasserloch:'gruen',oase:'gruen',beduinen:'popcorn',teestube:'popcorn',berghuette:'popcorn',glashaus:'turm',polarstation:'gruen',bergwacht:'gruen',seilbahn:'turm'};
  return d.map(k=>{const rq=CARDS[k].rq;if(rq&&!habs.includes(rq))return RQS[k]||'gruen';const h=CARDS[k].hab;if(!h||habs.includes(h))return k;const to=N[U.indexOf(h)]||habs[Math.max(0,U.indexOf(h))%habs.length],n=Math.min(3,SHAPES[CARDS[k].shape].cells.length),L=[...(HABSUB[to][n]||[]),...(HABSUB[to][2]||[]),...(HABSUB[to][1]||[])],pick=L.find(x=>!used.has(x)&&okK(x))||L.find(okK)||L[0];used.add(pick);return pick})};
const typeOfCard=c=>c.hab||c.cat;
// Kampagne: jeder Zoo wird schwerer (Gelände, Felsen, Ereignisse, Ziele)
// Godot-Vorbereitung 2b: Kampagne, Würfel-Pool, Felsen, Schrumpfen und Naturfelder stehen in daten/gelaende.json
const CAMP=JSON.parse(JSON.stringify(GELAENDE_DATEN.kampagne));
const CAMP_GOAL=CAMP.length;
// ab 0.85: Gelände je Zoo gewürfelt (ohne Wiederholung, Zerklüftet erst ab Zoo 3), gespeichert in run.maps
const MAPPOOL=GELAENDE_DATEN.wuerfel_pool.slice();
function mapRoll(run){if(!run||!run.zl||run.tut)return;run.maps=run.maps||{};if(run.maps[run.zoo])return;const used=Object.keys(run.maps).filter(k=>+k<run.zoo).map(k=>run.maps[k]);
  let pool=MAPPOOL.filter(m=>!used.includes(m)&&!(m==='zerkluftet'&&run.zoo<2));if(!pool.length)pool=MAPPOOL.filter(m=>!(m==='zerkluftet'&&run.zoo<2));run.maps[run.zoo]=pool[Math.floor(Math.random()*pool.length)]}
const MAPROCKS={...GELAENDE_DATEN.felsen};
const cfOf=run=>{const c=campCfg(run.zoo),m=run.maps&&run.maps[run.zoo];if(!m)return run.deckId==='alpen'&&run.zl&&!run.tut?{...c,rocks:(c.rocks||0)+3}:c;const z=run.zoo||0,rk=(z===0?0:m==='zerkluftet'?3:Math.max(MAPROCKS[m]||0,2*z-2))+(run.deckId==='alpen'&&run.zl&&!run.tut?3:0);return{...c,map:m,rocks:rk}};
function campCfg(z){if(z<CAMP.length)return CAMP[z];const ks=Object.keys(MAPS),e=z-CAMP.length+1;return{map:ks[z%ks.length],rocks:6+2*e,k:3,n:2,spring:true,hard:true,mult:2.2+.5*e}}
const axXY=(q,r)=>[Math.sqrt(3)*(q+r/2),1.5*r];
function connectedPart(cells){if(!cells.length)return cells;const set=new Set(cells.map(c=>hk(...c)));
  let start=cells.reduce((b,c)=>Math.hypot(...axXY(...c))<Math.hypot(...axXY(...b))?c:b,cells[0]);
  const seen=new Set([hk(...start)]),q=[start];while(q.length){const[a,b]=q.pop();for(const[dq,dr]of DIRS){const k=hk(a+dq,b+dr);if(set.has(k)&&!seen.has(k)){seen.add(k);q.push([a+dq,b+dr])}}}
  return cells.filter(c=>seen.has(hk(...c)))}
// star-shaped outline around the centre: rim(angle) gives the radius
function starShape(rim,lo,hi){let best=null;
  for(let base=3;base<9;base+=.05){const cells=connectedPart(hexDisc(10).filter(([q,r])=>{const[x,y]=axXY(q,r),d=Math.hypot(x,y)/Math.sqrt(3);return d<=base+rim(Math.atan2(y,x))}));
    if(cells.length>=lo&&cells.length<=hi)return cells;if(cells.length>hi)return best||cells;best=cells}return best}
function addPatches(t,set,habs,rnd,minSize=2,maxSize=4){const pick=a=>a[Math.floor(rnd()*a.length)],cells=[...set].map(k=>k.split(',').map(Number));
  const touches=([q,r],own)=>DIRS.some(([dq,dr])=>{const k=hk(q+dq,r+dr);return t.has(k)&&!own.has(k)});
  for(const h of habs){for(let tries=0;tries<80;tries++){const seed=pick(cells);if(t.has(hk(...seed))||touches(seed,new Set()))continue;
    const size=minSize+Math.floor(rnd()*(maxSize-minSize+1)),patch=[seed],own=new Set([hk(...seed)]);
    for(let g=0;g<40&&patch.length<size;g++){const[pq,pr]=pick(patch),[dq,dr]=pick(DIRS),n=[pq+dq,pr+dr],k=hk(...n);
      if(set.has(k)&&!t.has(k)&&!own.has(k)&&!touches(n,own)){patch.push(n);own.add(k)}}
    if(patch.length>=Math.min(2,minSize)){patch.forEach(p=>t.set(hk(...p),h));break}}}}
function addRocks(t,set,n,rnd){const cells=[...set];let placed=0;
  for(let tries=0;placed<n&&tries<300;tries++){const k=cells[Math.floor(rnd()*cells.length)];if(t.has(k))continue;
    const[q,r]=k.split(',').map(Number);if(DIRS.some(([dq,dr])=>t.get(hk(q+dq,r+dr))==='block'))continue;t.set(k,'block');placed++}}
// 0.91: Gelände etwa 80 %: die äußersten Felder (mit etwas Zufall) fallen weg, das Gelände bleibt zusammenhängend
const MAPSHRINK=GELAENDE_DATEN.schrumpfen;
function shrinkMap(m,rnd){const n0=m.cells.length,keep=Math.round(n0*MAPSHRINK);if(keep>=n0)return m;let cx=0,cy=0;for(const c of m.cells){const[x,y]=axXY(...c);cx+=x;cy+=y}cx/=n0;cy/=n0;
  const sc=m.cells.map(c=>{const[x,y]=axXY(...c);return[c,Math.hypot(x-cx,y-cy)+rnd()*1.8]}).sort((a,b)=>a[1]-b[1]),cells=connectedPart(sc.slice(0,keep).map(e=>e[0])),set=new Set(cells.map(c=>hk(...c)));
  for(const k of[...m.terr.keys()])if(!set.has(k))m.terr.delete(k);return{...m,cells}}
// 0.71a: Naturfelder fest verteilen – 18 je Zoo, nur gewählte Lebensräume, Flecken zu 2–4 (Flusstal: Wasser als Fluss-Strang)
// Schwerpunkt je Gelände: die erste Variante, deren Lebensräume alle gewählt sind, sonst die letzte
const NATN=GELAENDE_DATEN.naturfelder,NATFOCUS=Object.fromEntries(Object.entries(GELAENDE_DATEN.natur_fokus).map(([k,V])=>[k,H=>({...(V.find(v=>Object.keys(v).every(h=>H.includes(h)))||V[V.length-1])})]));
function natQuota(key,H,n=NATN){const F=(NATFOCUS[key]||(()=>({})))(H),q={};let left=n;for(const h of H)if(F[h]){q[h]=F[h];left-=F[h]}
  const rest=H.filter(h=>!F[h]);if(!rest.length){const fs=H.filter(h=>F[h]);let i=0;while(left>0){q[fs[i%fs.length]]++;left--;i++}return q}
  const b=Math.floor(left/rest.length);let r=left-b*rest.length;rest.forEach(h=>{q[h]=b+(r>0?1:0);if(r>0)r--});return q}
function natPlace(m,key,H,rnd){const t=m.terr,set=new Set(m.cells.map(c=>hk(...c))),pick=a=>a[Math.floor(rnd()*a.length)];
  for(const[k,v]of[...t])if(HAB[v])t.delete(k);
  const free=k=>set.has(k)&&!t.has(k),nbs=k=>{const[q,r]=k.split(',').map(Number);return DIRS.map(([dq,dr])=>hk(q+dq,r+dr))};
  const touch=(k,own)=>nbs(k).some(n=>t.has(n)&&HAB[t.get(n)]&&!own.has(n));
  const edge=[...set].filter(k=>nbs(k).some(n=>!set.has(n)));
  const Q=natQuota(key,H);let placed=0;
  // Flusstal: Wasser als zusammenhängender Strang von links nach rechts
  if(key==='flusstal'&&Q.wasser){const X=k=>axXY(...k.split(',').map(Number))[0];const xs=[...set].map(X),xmin=Math.min(...xs);
    for(let tries=0;tries<60;tries++){const st=pick([...set].filter(k=>free(k)&&X(k)<xmin+3));if(!st)break;const path=[st],own=new Set([st]);
      while(path.length<Q.wasser){const cur=path[path.length-1],c=nbs(cur).filter(n=>free(n)&&!own.has(n)&&X(n)>=X(cur)-.1&&!nbs(n).some(z=>own.has(z)&&z!==cur));if(!c.length)break;const e=c.filter(n=>X(n)>X(cur)+.5),nx=e.length&&rnd()<.75?pick(e):pick(c);path.push(nx);own.add(nx)}
      if(path.length===Q.wasser){path.forEach(k=>t.set(k,'wasser'));placed+=path.length;Q.wasser=0;break}}}
  const sizes=n=>{const o=[];while(n>0){const s=n<=4?n:2+Math.floor(rnd()*Math.min(3,n-3));o.push(s);n-=s}return o};
  const patch=(h,size,strict)=>{const seeds=(key==='bucht'&&(h==='wasser'||h==='wueste')?edge:[...set]).filter(k=>free(k)&&(!strict||!touch(k,new Set())));
    for(let tries=0;tries<40&&seeds.length;tries++){const sd=pick(seeds),p=[sd],own=new Set([sd]);
      for(let g=0;g<60&&p.length<size;g++){const c=nbs(pick(p)).filter(n=>free(n)&&!own.has(n)&&(!strict||!touch(n,own)));if(c.length){const n=pick(c);p.push(n);own.add(n)}}
      if(p.length===size){p.forEach(k=>t.set(k,h));return size}}return 0};
  const order=Object.keys(Q).filter(h=>Q[h]>0).sort((a,b)=>Q[b]-Q[a]);
  for(const h of order)for(const sz of sizes(Q[h])){let got=patch(h,sz,true)||patch(h,sz,false);if(!got){for(let s2=sz-1;s2>=1&&!got;s2--)got=patch(h,s2,false)}placed+=got}
  return m}
function genMap(key,rnd=Math.random,extra=0){const m=shrinkMap(genMap0(key,rnd,extra),rnd);const H=(GENHABS&&GENHABS.length?GENHABS:DEFHABS).filter(h=>HAB[h]);return natPlace(m,key,H,rnd)}
function genMap0(key,rnd=Math.random,extra=0){const t=new Map(),pick=a=>a[Math.floor(rnd()*a.length)],habs=DEFHABS.slice();let cells;
  if(key==='flusstal'){cells=[];for(let row=0;row<7;row++)for(let c=0;c<13;c++)cells.push([c-Math.floor(row/2),row]);
    let row=2+Math.floor(rnd()*3);const at=(c,rw)=>hk(c-Math.floor(rw/2),rw);
    for(let c=0;c<13;c++){t.set(at(c,row),'wasser');if(c<12&&rnd()<.55){const nr=Math.max(1,Math.min(5,row+(rnd()<.5?-1:1)));if(nr!==row){t.set(at(c,nr),'wasser');row=nr}}}
    const set=new Set(cells.map(c=>hk(...c)));addPatches(t,set,['savanne','wald','wueste'],rnd);addRocks(t,set,4,rnd)}
  else if(key==='bucht'){const ph=rnd()*Math.PI*2,ph2=rnd()*Math.PI*2;
    cells=starShape(a=>1.25*Math.cos(3*(a-ph))+.35*Math.cos(5*a+ph2),88,95);const set=new Set(cells.map(c=>hk(...c)));
    const edge=cells.filter(([q,r])=>DIRS.some(([dq,dr])=>!set.has(hk(q+dq,r+dr))));
    const angd=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));const ang=c=>{const[x,y]=axXY(...c);return Math.atan2(y,x)};
    const bay=ph+Math.PI/3+2*Math.PI/3*Math.floor(rnd()*3),cape=ph+2*Math.PI/3*Math.floor(rnd()*3);
    edge.filter(c=>angd(ang(c),bay)<.5).slice(0,9).forEach(c=>t.set(hk(...c),'wasser'));
    edge.filter(c=>angd(ang(c),cape)<.35&&!t.has(hk(...c))).slice(0,6).forEach(c=>t.set(hk(...c),'wueste'));
    addPatches(t,set,['savanne','wald'],rnd);addRocks(t,set,4,rnd)}
  else if(key==='huegel'){const flip=rnd()<.5,ca=flip?[-2,-4]:[-4,-2],cb=flip?[2,4]:[4,2],A=hexDisc(3,...ca),B=hexDisc(3,...cb);
    const inAB=new Set([...A,...B].map(c=>hk(...c))),line=[],N=12;
    for(let i=0;i<=N;i++){let fq=ca[0]+(cb[0]-ca[0])*i/N,fr=ca[1]+(cb[1]-ca[1])*i/N,fs=-fq-fr,q=Math.round(fq),r=Math.round(fr),s2=Math.round(fs);
      const dq=Math.abs(q-fq),dr=Math.abs(r-fr),ds=Math.abs(s2-fs);if(dq>dr&&dq>ds)q=-r-s2;else if(dr>ds)r=-q-s2;if(!inAB.has(hk(q,r)))line.push([q,r])}
    const bridge=new Map();line.forEach(([q,r])=>{for(const[dq,dr]of[[0,0],...DIRS]){const c=[q+dq,r+dr];if(!inAB.has(hk(...c)))bridge.set(hk(...c),c)}});
    cells=[...A,...bridge.values(),...B];const set=new Set(cells.map(c=>hk(...c)));
    for(const ctr of[ca,cb]){t.set(hk(...ctr),'wald');const nb=DIRS.map(([dq,dr])=>[ctr[0]+dq,ctr[1]+dr]);for(let i=0;i<3;i++){const n=pick(nb);t.set(hk(...n),'wald')}}
    line.forEach(c=>t.set(hk(...c),'savanne'));[...bridge.values()].forEach(c=>{if(!t.has(hk(...c))&&rnd()<.3)t.set(hk(...c),'savanne')});
    addPatches(t,set,['wasser','wueste'],rnd);addRocks(t,set,4,rnd)}
  else if(key==='zerkluftet'){const ph=rnd()*Math.PI*2,ph2=rnd()*Math.PI*2,j=Array.from({length:12},()=>rnd()*.6-.3);
    cells=starShape(a=>.9*Math.cos(5*(a-ph))+.55*Math.cos(9*a+ph2)+j[Math.floor(((a+Math.PI)/(2*Math.PI))*12)%12],96,102);
    const set=new Set(cells.map(c=>hk(...c)));addPatches(t,set,['wueste','wueste',pick(habs),pick(habs)],rnd);addRocks(t,set,11,rnd)}
  else{cells=hexDisc(5);const set=new Set(cells.map(c=>hk(...c)));addPatches(t,set,[...habs,pick(habs),pick(habs)],rnd);addRocks(t,set,5,rnd)}
  if(extra)addRocks(t,new Set(cells.map(c=>hk(...c))),extra,rnd);
  return{key,cells,terr:t}}

function mkIndex(bs){const m=new Map();for(const b of bs)for(const[q,r]of b.cells)m.set(hk(q,r),b);return m}
// Umkreis von 2 Feldern (für Stress): alle Gebäude, die höchstens 2 Felder entfernt sind
function nbrs2(b,idx){const s=new Set();for(const[q,r]of b.cells)for(const[dq,dr]of DIRS)for(const[eq,er]of[[0,0],...DIRS]){const o=idx.get(hk(q+dq+eq,r+dr+er));if(o&&o!==b)s.add(o)}return[...s]}
function nbrs(b,idx){const s=new Set();for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const o=idx.get(hk(q+dq,r+dr));if(o&&o!==b)s.add(o)}return[...s]}
const natCells=(cells,hab)=>hab?cnt(cells,([q,r])=>TERR.get(hk(q,r))===hab):0;
const upStep=b=>Math.ceil(b.cells.length/2); // Ausbau: +1 B und +1 N je angefangene 2 Felder
// Mehrfach gebaut und ausgebaut: Anteil am eigenen Wert (Grundwert plus die Boni, die es selbst bekommt), seit 0.61a
const DUPW=[1,.75,.25],LVLW=[0,0,.75,1.25]; // 0.61a: Ausbau +75 % / +50 % des eigenen Werts
const dupW=n=>hasSpec('rb_klon')||(n===1&&hasSpec('zwilling'))?1:DUPW[Math.min(n,2)];
const dupOf=(b,bs)=>{let n=0;for(const x of bs){if(x===b)break;if(x.key===b.key)n++}return n};
const STRESS=.3,STRZ0=.05,STRMAX=.4;let STRZ=STRZ0;const strzNow=()=>STRZ0; // Show-Bonus je Auslöser; Stress: −5 % Natur für den ganzen Zoo je Störer, höchstens −40 %
// value of one building, with a labelled breakdown
function evalB(b,bs,idx,parts){const c=K(b),nb=nbrs(b,idx);let a=c.a,s=c.s,stN=0;if((c.cat==='attr'||c.cat==='essen')&&hasSpec('quer')){const t=a;a=s;s=t}const vs=new Set(nb.filter(n=>K(n).cat==='verst').map(n=>n.key)),wq=vs.has('winterquartier');
  const add=(label,da,ds)=>{da=da||0;ds=ds||0;if(!da&&!ds)return;a+=da;s+=ds;if(parts)parts.push({label,a:da,s:ds})};
  if(c.hab){add(`${HAB[c.hab].label}-Nachbarn`,cnt(nb,n=>isCat(n,'gehege')&&isHab(n,c.hab)),0);add(`${HAB[c.hab].label}-Naturfläche`,0,natCells(b.cells,c.hab));
    if(CTX.dk==='kueste'&&c.cat==='gehege'&&c.hab==='wasser')add('🐟 Schwarm (Die Kapitänin)',0,cnt(nb,n=>isCat(n,'gehege')&&isHab(n,'wasser')));
    if(CTX.dk==='kueste'&&c.cat==='gehege'&&c.hab==='wueste')add('Die Kapitänin: Wüste',0,-1);
    if(CTX.dk==='alpen'&&c.cat==='gehege'){const r=Math.min(2,rocksNb(b));if(r)add('⛰️ Der Gipfelstürmer: Felsen',r,0)}
    if(CTX.winter&&cold(c.hab)&&!wq&&!hasSpec('rb_winter')&&!nb.some(n=>n.key==='tropenhaus'))add('Winterkälte',-1,0);if(CTX.season===1&&hot(c.hab)&&!(c.hab==='arktis'&&nb.some(n=>n.key==='polarstation')))add('Sommerhitze',-1,0)}
  if(c.bonus){const r=c.bonus(nb,bs,b);add('Kartenbonus',r.a,r.s)}
  {const F=fdOf(b.key);if(F.length){if(F.includes('kf'))add('🥩 Kraftfutter',2,2);if(F.includes('be'))add('🫐 Beeren',0,3);if(F.includes('mo'))add('🥕 Möhrchen',3,0);if(F.includes('mw'))add('🐛 Mehlwürmer',0,3);if(F.includes('gp'))add('📦 Großpackung',3,3);if(F.includes('ho')){const g=cnt(nbrs2(b,idx),n=>isCat(n,'essen'));if(g)add('🍯 Honig: Gastro in der Nähe',g,0)}}
   if(c.cat==='gehege'&&c.hab&&CTX.fdl){const n=CTX.fdl[c.hab]||0;if(n){const v=fdLvB(n),H=HFOOD[c.hab];add(`${H.icon} ${H.name} Stufe ${n}`,v,v)}}}
  const pct=[],pctAdd=(name,e)=>{if(!e)return;if(e.pa!=null||e.ps!=null)pct.push([name,e.pa||0,e.ps||0]);else add(name,e.a,e.s)};
  for(const id of CTX.progs)pctAdd(PROGS[id].name,PROGS[id].per&&PROGS[id].per(b,c,nb));
  for(const id of CTX.ads)pctAdd(ADS[id].name,ADS[id].per&&ADS[id].per(b,c,nb));
  for(const ev of CTX.ev||[]){const E=EVENTS[ev.id],e=E&&E.per&&E.per(b,c,ev.k||1),em=hasSpec('eventmanager');if(e)add(ev.n||E.name,em?Math.max(0,e.a||0):e.a,em?Math.max(0,e.s||0):e.s)}
  if(!strike())for(const id of CTX.spec||[]){const S=SPEC[id];if(!S)continue;const e=S.per&&S.per(b,c,nb,bs);pctAdd(e&&['gastro','gaertner','animateur'].includes(id)?`${S.name} (${(e.a||e.s)/2} andere ${(e.a||e.s)===2?'Art':'Arten'} daneben)`:S.name,e)}
  for(const id in CTX.boni||{}){const R=RUNB[id],n=CTX.boni[id],e=R&&n&&R.per(b,c);if(e)add(R.name+(n>1?' ×'+n:''),(e.a||0)*n,(e.s||0)*n)}
  // Prozent-Boni aus Förderprogrammen und Werbung: alle auf denselben Grundwert, nicht verkettet
  if(vs.has('futterkueche')&&c.cat==='gehege')pct.push(['🥕 Futterküche',0,.3]);if(c.cat==='gehege'&&c.hab==='wasser'){const aq=cnt(nb,n=>n.key==='aquarium');if(aq)pct.push(['🐠 Aquarium'+(aq>1?' ×'+aq:''),0,.2*aq])}if(vs.has('besucherlotse')&&c.cat!=='verst')pct.push(['🪧 Besucherlotse',.3,0]);
  if(b.pr==='gold')pct.push(['🪙 Gold',.25,0]);{const eg=edN(b,'g');if(eg)pct.push(['🪙 Gold-Ausgabe'+(eg>1?' ×'+eg:''),.25*eg,0])}
  const pa0=Math.max(0,a),ps0=Math.max(0,s);for(const[nm,fa,fs]of pct)add(`${nm} +${Math.round(Math.max(fa,fs)*100)} %`,Math.round(pa0*fa),Math.round(ps0*fs));
  // Wiederholung: die 2. gleiche Anlage bringt 75 %, die 3. 50 %, ab der 4. 25 % (Besucher und Natur)
  if(b.pr==='liebling'){const z=(CTX.zoo||0)+1;add('📈 Lieblingstier',z,z)}
  if(CTX.zl){const Z=CTX.zl;
    {const mul=(l,f)=>{const a0=Math.max(0,a),s0=Math.max(0,s);add(l,a0*(f-1),s0*(f-1))};{const es=edN(b,'s');if(es)mul(es>1?`✨ Schimmernd ×${es}: zählt ${es+1}-fach`:'✨ Schimmernd: zählt doppelt',es+1)}for(const[q,r]of b.cells){if(Z.gold.has(hk(q,r)))mul('★ Goldenes Feld: zählt doppelt',2);if(Z.g4&&Z.g4.has(hk(q,r)))mul('💥 ×4-Feld: zählt vierfach',4)}} // 0.72a: Schimmernd und Goldfelder multiplizieren (×2 · ×2 = ×4)
    if(Z.insp&&CTX.winter&&!CTX.ni&&!wq&&!(CTX.dk==='polar'&&c.cat==='gehege'&&c.hab==='arktis')){const I=INSP[Z.insp],e=inspFx(b,c,nb,bs,Z);if(e){const L='❄️ '+I.name;if(e.a)add(L,e.a,0);else if(e.fa!=null)add(L+(e.l?': '+e.l:''),a>0?Math.round(a*e.fa)-a:0,e.fs!=null&&s>0?Math.round(s*e.fs)-s:0);else if(e.fs!=null)add(L+(e.fs===.5?': nur halbe Natur':e.fs===0?': keine Natur':`: Natur ×${String(e.fs).replace('.',',')}`),0,s>0?Math.round(s*e.fs)-s:0);else if(e.f===0)add(L+': zählt nicht',-a,-s);else if(e.f<1)add(L+(e.l?`: ${e.l}, −${Math.round((1-e.f)*100)} %`:e.f===.5?': nur die Hälfte':`: nur ${Math.round(e.f*100)} %`),a>0?Math.round(a*e.f)-a:0,s>0?Math.round(s*e.f)-s:0);else add(L+(e.f===2?': zählt doppelt':`: zählt ${String(e.f).replace(".",",")}-fach`),Math.round(Math.max(0,a)*(e.f-1)),Math.round(Math.max(0,s)*(e.f-1)))}}}
  if(c.jt&&(nb.some(n=>String(n.key).split(/[#^]/)[0]===c.par)||fdHas(b,'mi')))add((fdHas(b,'mi')&&!nb.some(n=>String(n.key).split(/[#^]/)[0]===c.par)?'🍼 Aufzuchtmilch: ':'🍼 ')+'Familie: zählt doppelt',Math.max(0,a),Math.max(0,s));
  if(b.pr==='star')add('⭐ Star: ×1,25',a>0?Math.round(a*.25):0,s>0?Math.round(s*.25):0);
  {const F=fdOf(b.key);if(F.length){let m=1;const l=[];for(const f of['fr','wm','kb','wv'])if(F.includes(f)&&CTX.season===FOOD[f].se){m*=1.5;l.push(FOOD[f].icon+' '+FOOD[f].name)}if(F.includes('gh')){m*=1.5;l.push('✨ Goldhafer')}if(m>1)add(`${l.join(' + ')}: ×${mxs(m)}`,a>0?Math.round(a*(m-1)):0,s>0?Math.round(s*(m-1)):0)}}
  if(vs.has('scheinwerfer')&&c.cat==='gehege'&&nb.some(n=>n.key==='scheinwerfer'&&spotOf(n,idx)===b))add('🔦 Scheinwerfer: ×1,5',a>0?Math.round(a*.5):0,s>0?Math.round(s*.5):0);
  // Stress und Show (ganz am Ende): Stress (Beute neben Raubtier, scheu neben Essen/Attraktion außer Picknick/Restaurant) zählt Störer (max. 2) für den Zoo-Multiplikator −5 % N je Störer (max. −40 %, in scoreZoo0); Showtier neben Essen/Attraktion: +30 % je, höchstens +60 %, Trubel-Nachbarn und Tribünen zählen doppelt (zusammen höchstens +120 %, Bühne/Manege verdoppeln); Tierarzt daneben hebt den Stress auf
  if(!(TUTNOW&&!TUTTR)){const vet=fdHas(b,'kr')||nb.some(n=>n.key==='tierarzt')||(c.tags.includes('scheu')&&nb.some(n=>n.key==='regenkuppel'))||(c.key==='antilopen'&&nb.some(n=>isCat(n,'schutz')))||(c.hab==='gebirge'&&c.tags.includes('scheu')&&nb.some(n=>n.key==='bergwacht')),n2=!vet&&(c.tags.includes('beute')||c.tags.includes('scheu'))?nbrs2(b,idx):[],pr=!vet&&c.tags.includes('beute')&&!hasSpec('dompteur')&&!hasSpec('frieden')?cnt(n2,n=>has(n,'raubtier')&&!fdHas(n,'kn'))*(hasEv('ausbruch')?2:1):0,sc=!vet&&!vs.has('ruhezone')&&!hasSpec('ruhepol')&&c.tags.includes('scheu')?cnt(CTX.dk==='dschungel'?nb:n2,n=>((isCat(n,'essen')||isCat(n,'attr'))&&!ruhigC(n))):0,jg=hasSpec('rb_jagd'),py=hasSpec('rb_party'),pp=Math.min(2,(jg&&c.tags.includes('beute')?cnt(nb,n=>has(n,'raubtier')):0)+(py&&c.tags.includes('scheu')?cnt(nb,n=>((isCat(n,'essen')||isCat(n,'attr'))&&!ruhigC(n))):0)),pr1=jg?0:pr,sc1=py?0:sc,st=Math.min(1,pr1+sc1),sh=c.tags.includes('show')?Math.min(4,Math.min(2,cnt(nb,n=>(isCat(n,'essen')||isCat(n,'attr'))&&!ruhigC(n)&&!trubelC(n))+(vs.has('buehne')?1:0)+(c.hab==='savanne'&&nb.some(n=>n.key==='bistro')?2:0))+2*(cnt(nb,n=>(isCat(n,'essen')||isCat(n,'attr'))&&trubelC(n))+cnt(nbrs2(b,idx),n=>n.key==='tribuene'&&!nb.includes(n)))):0;
   const ba=Math.max(0,a),bs0=Math.max(0,s);
   if(sh){const f=(fdHas(b,'le')?.5:c.key==='belugas'?.4:STRESS)*sh*(vs.has('buehne')?2:1);add(`🎭 Showtier${vs.has('buehne')?' mit 🎤 Bühne':''}: +${Math.round(f*100)} %`,Math.round(ba*f),Math.round(bs0*f))}
   if(pp){const f=STRESS*pp;add(`${jg&&c.tags.includes('beute')?'🦁 Jagdrevier':'🎉 Partyzoo'}: +${Math.round(f*100)} %`,Math.round(ba*f),Math.round(bs0*f))}
   if(st&&parts)parts.push({label:`😣 Gestresst (${pr1&&sc1?'Raubtier und Trubel':pr1?'Raubtier in der Nähe':'Trubel in der Nähe'}): Zoo −${Math.round(STRZ*100)} % Natur`,a:0,s:0});stN=st}
  if(c.km&&!(TUTNOW&&!TUTTR&&/Beute|Raubtier|scheu|Show/i.test((c.fx||[]).join(' ')))){const m=c.km(nb,bs,b,{st:stN,idx});if(m){const fa=m.fa!=null?m.fa:m.f,fs=m.fs!=null?m.fs:m.f,aa=Math.max(0,a),ss=Math.max(0,s);add(`🔗 Kombo ×${String(Math.max(fa||1,fs||1)).replace('.',',')}: ${m.l}`,fa!=null?Math.round(aa*(fa-1)):0,fs!=null?Math.round(ss*(fs-1)):0)}}
  {const ex=extra92(b,c,nb,bs,idx);for(const e of ex){if(Array.isArray(e)){const[l,fa,fs]=e,aa=Math.max(0,a),ss=Math.max(0,s);add(l+(fa===fs&&!/×/.test(l)?' ×'+mxs(fa):''),Math.round(aa*(fa-1)),Math.round(ss*(fs-1)))}else add(e.l,e.a,e.s)}}
  // TÜV-Prüfung im Winter: was Attraktionen ihren Nachbarn bringen, zählt nur zur Hälfte (nur Gewinne, Trubel bleibt)
  {const tc=CTX.zl&&CTX.winter?(CTX.zl.insp==='attr'?'attr':CTX.zl.insp==='essen'&&HARD(CTX.zl)?'essen':null):null;if(tc&&!CTX.ni&&!CTX.noTuv&&!wq&&c.cat!==tc&&nb.some(n=>isCat(n,tc))){CTX.noTuv=true;try{const bs2=bs.filter(n=>n===b||!isCat(n,tc)),v2=evalB(b,bs2,mkIndex(bs2)),k=hasSpec('rb_winter')?.25:.5,da=a-v2.a,ds=s-v2.s;add(tc==='attr'?'❄️ TÜV-Prüfung: Attraktions-Boni nur halb':'❄️ Lebensmittelaufsicht: Gastro-Boni nur halb',da>0?-Math.round(da*k):0,ds>0?-Math.round(ds*k):0)}finally{CTX.noTuv=false}}}
  return{a,s,nb,pa0,ps0,st:stN}}
// Winter-Bedingung für ein Gebäude (mit Regelbrecher Winterfest: Nachteile nur halb so stark, Vorteile bleiben)
function inspFx(b,c,nb,bs,Z){const e=INSP[Z.insp].fx(b,c,nb,bs,Z);if(!e||!hasSpec('rb_winter'))return e;
  if(Z.insp==='koenig')return e.f>1?{...e,f:+(e.f*1.5).toFixed(2)}:e; // Schneekönig: König ×3,75, die anderen zählen weiter nicht
  const h=v=>v==null||v>=1?v:1+(v-1)/2;return{...e,a:e.a<0?Math.round(e.a/2):e.a,f:h(e.f),fs:h(e.fs)}}
// Scheinwerfer: das stärkste benachbarte Gehege (nach Grundwert, bei Gleichstand das ältere)
const verstHit=(v,c)=>v==='futterkueche'?(c.cat==='gehege'?'+30 % N':null):v==='besucherlotse'?(c.cat!=='verst'?'+30 % B':null):v==='scheinwerfer'?(c.cat==='gehege'?'×1,5 falls stärkstes':null):v==='winterquartier'?(c.cat!=='verst'?'ohne ❄️':null):v==='buehne'?((c.tags||[]).includes('show')?'Show ×2':null):v==='ruhezone'?((c.tags||[]).includes('scheu')?'kein Trubel':null):null;
function spotOf(n,idx){let best=null,bv=-1;for(const g of nbrs(n,idx)){const c=K(g);if(c.cat!=='gehege')continue;const v=c.a+c.s;if(v>bv||(v===bv&&g.id<best.id)){bv=v;best=g}}return best}
function scoreZoo(bs){const idx=mkIndex(bs);let A=0,S=0;const steps=[],mults=[];KING=null;if(CTX.zl&&CTX.zl.insp==='koenig'&&CTX.winter)KING={bs,set:kingSet0(bs)};try{return scoreZoo0(bs,idx,A,S,steps,mults)}finally{KING=null}}
// Summe aller Gehege/Gebäude einer Auswahl (ohne Multiplikatoren)
function rawSum(set){const ix=mkIndex(set);let a=0,s=0;for(const b of set){const v=evalB(b,set,ix);a+=v.a;s+=v.s}return[a,s]}
// Zuschläge/Abzüge für Mehrfach-Bau und Ausbau, gemessen am eigenen Wert (0.61a)
function multiAdj(bs,V){if(!V){const ix=mkIndex(bs);V=bs.map(b=>evalB(b,bs,ix))}const adj=new Map(),seen={};bs.forEach((b,i)=>{const n=seen[b.key]||0;seen[b.key]=n+1;const w=n?dupW(n):1,v=V[i]||{a:0,s:0},oa=Math.max(0,v.a),os=Math.max(0,v.s);let a=0,s=0;const L=[];
  if(n&&w<1){const da=Math.round((w-1)*oa),ds=Math.round((w-1)*os);if(da||ds){a+=da;s+=ds;L.push(`${n+1}. ${CARDS[b.key].name}: zählt ${Math.round(w*100)} % des eigenen Werts`)}}
  let ua=0,us=0;if((b.lvl||1)>1){const f=(LVLW[b.lvl]||0)*w;ua=Math.round(f*oa);us=Math.round(f*os);a+=ua;s+=us;L.push(b.lvl>2?'Ausbau Stufe III: +75 % und +50 % des eigenen Werts':'Ausbau Stufe II: +75 % des eigenen Werts')}
  if(a||s||L.length)adj.set(b.id,{a,s,label:L.join(' · '),ua,us})});return adj}
function scoreZoo0(bs,idx,A,S,steps,mults){STRZ=strzNow();const V=bs.map(b=>evalB(b,bs,idx)),adj=multiAdj(bs,V);let stZ=0;
  for(const[bi,b]of bs.entries()){const c=CARDS[b.key],v=V[bi],j=adj.get(b.id);stZ+=v.st||0;if(j){v.a+=j.a;v.s+=j.s}if(b.pr==='magnet'){const g=giveOf(b,bs);v.a+=Math.round(.5*Math.max(0,g.a));v.s+=Math.round(.5*Math.max(0,g.s))}A+=v.a;S+=v.s;steps.push(j?{id:b.id,a:v.a,s:v.s,ba:c.a,bs:c.s,adjA:j.a,adjS:j.s,adjL:j.label}:{id:b.id,a:v.a,s:v.s,ba:c.a,bs:c.s});{const lk=luckLab(b);if(lk)steps[steps.length-1].luck=lk}
    if(c.mult){const m=c.mult(v.nb,bs);if(m)mults.push({id:b.id,label:c.name,...m})}}
  if(stZ)mults.push({id:null,label:`Gestresste Tiere: ${stZ}`,icon:'😣',ms:+(1-Math.min(STRMAX,stZ*STRZ)).toFixed(2)});
  for(const id of CTX.progs){const m=PROGS[id].mult&&PROGS[id].mult(bs);if(m)mults.push({id:null,label:PROGS[id].name,icon:PROGS[id].icon,...m})}
  for(const id of CTX.ads){const m=ADS[id].mult&&ADS[id].mult(bs);if(m)mults.push({id:null,label:ADS[id].name,icon:ADS[id].icon,...m})}
  if(!strike())for(const id of CTX.spec||[]){const S=SPEC[id],m=S&&S.mult&&S.mult(bs);if(m)mults.push({id:null,label:S.name,icon:S.icon,spec:id,...m})}
  if(CTX.zl){const Z=CTX.zl,rb=bs.reduce((t,b)=>t+edN(b,'r'),0);if(rb)mults.push({id:null,label:rb>1?`Regenbogen ×${rb}`:'Regenbogen',icon:'🌈',ma:+Math.pow(1.2,rb).toFixed(2)});
    for(const ck of[Z.crown,...(Z.crown2||[])]){if(!ck)continue;const cb=idx.get(ck);if(cb&&isCat(cb,'gehege')&&cb.cells.length>=4)mults.push({id:cb.id,label:'Kronenfeld',icon:'👑',ma:CROWNF})}
    const pu=zlPurity(bs,idx),vf=vielfalt(bs),pf=pu.n>=PURN?purF(pu.n):1;if(vf.f>1&&vf.f>pf)mults.push({id:null,label:`Vielfalt: alle Lebensräume, je ${vf.lvl}+ Arten`,icon:'🎨',ms:+vf.f.toFixed(2)});else if(pu.n>=PURN)mults.push({id:null,label:`Reinheit: ${pu.n} ${HAB[pu.hab].label}-Gehege`,icon:HAB[pu.hab].icon,ms:+purF(pu.n).toFixed(2)});
    if(Z.tv){const f=Z.tv();mults.push({id:null,label:f>1?'Fernsehteam: gelungen':'Fernsehteam: zu wenig gebaut',icon:'📺',ma:f})}}
  let A2=A,S2=S;for(const m of mults){if(m.ma)A2*=m.ma;if(m.ms)S2*=m.ms}
  A2=Math.max(0,Math.round(A2));S2=Math.max(0,Math.round(S2));return{steps,mults,A:A2,S:S2,total:A2*S2}}
function breakdown(b,bs){const parts=[];const v=evalB(b,bs,mkIndex(bs),parts);if(b.pr==='magnet'){const g=giveOf(b,bs),ma=Math.round(.5*Math.max(0,g.a)),ms=Math.round(.5*Math.max(0,g.s));if(ma||ms){parts.push({label:'🧲 Publikumsmagnet',a:ma,s:ms});v.a+=ma;v.s+=ms}}const j=multiAdj(bs).get(b.id);if(j&&(j.a||j.s)){parts.push({label:j.label,a:j.a,s:j.s});v.a+=j.a;v.s+=j.s}return{a:v.a,s:v.s,parts}}
function sourcesOf(b,bs){const idx=mkIndex(bs),full=evalB(b,bs,idx),out=[];
  for(const n of full.nb){const bs2=bs.filter(x=>x!==n),v=evalB(b,bs2,mkIndex(bs2));const da=full.a-v.a,ds=full.s-v.s;if(da||ds)out.push({id:n.id,da,ds})}return out}
const builtUnique=(bs,key)=>CARDS[key].tags.includes('einmalig')&&cnt(bs,b=>b.key===baseK(key))>=(hasSpec('sammel')?2:1);
function fits(bs,cells,key){const idx=mkIndex(bs),c=CARDS[key];if(builtUnique(bs,key))return false;
  return cells.every(([q,r])=>{const k=hk(q,r);if(!ONBOARD.has(k)||idx.has(k))return false;if(typeof state!=='undefined'&&state&&(state.nests||[]).includes(k))return false;const t=TERR.get(k);return!t||(t==='block'?hasSpec('spreng'):(c.cat!=='gehege'||c.hab===t||hasSpec('rb_wild')))})}
function weightOf(k){const c=CARDS[k];if(isLocked(k))return 0;return c.rar==='winter'?(CTX.winter?8:0):c.rar==='saison'?(sea(c.only)?8:0):RARW[c.rar]*((c.rar==='selten'||c.rar==='sehr selten')&&hasSpec('talent')?2.5:1)}
function pickWeighted(keys,rnd=Math.random){const tot=keys.reduce((t,k)=>t+weightOf(k),0);let r=rnd()*tot;
  for(const k of keys){r-=weightOf(k);if(r<=0)return k}return keys[keys.length-1]}
const ownsUnique=k=>CARDS[k].tags.includes('einmalig')&&typeof state!=='undefined'&&!!state&&(cnt(state.buildings,b=>b.key===baseK(k))+cnt([...state.hand,...state.deck,...state.discard],x=>baseK(x)===baseK(k)))>=(hasSpec('sammel')?2:1);
function makeOffer(n=3,rnd=Math.random,bs=(typeof state!=='undefined'&&state)?state.buildings:[]){const Z=typeof state!=='undefined'&&state&&state.zl;
  const TH=['wasser','savanne','wueste'],pool=Object.keys(CARDS).filter(k=>weightOf(k)>0&&!builtUnique(bs,k)&&!ownsUnique(k)&&(!TUTNOW||(!k.includes('^')&&!k.includes('~')&&!k.includes('#')&&(!CARDS[k].hab||TH.includes(CARDS[k].hab))&&(!CARDS[k].rq||TH.includes(CARDS[k].rq))))),out=[];
  while(out.length<n){let p=pool.filter(x=>!out.includes(x));{const last=(Z&&state.lastOffer)||[],q=p.filter(x=>!last.includes(x));if(q.length>=n)p=q}
    {const dk=typeof runDeck==='function'?runDeck():'';if(dk&&dk!=='grund'&&DECKS[dk]&&DECKS[dk].type&&rnd()<.2){const T=DECKS[dk].type,t=p.filter(x=>HAB[T]?CARDS[x].hab===T:CARDS[x].cat===T);if(t.length)p=t}}
    out.push(pickWeighted(p,rnd))}return out}
function shuffle(a,rnd=Math.random){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function drawHand(st,rnd=Math.random){const HN=HAND+(st.mode==='camp'&&hasSpec('grosshand')?1:0)+(st.mode==='camp'&&runAus('hand')?1:0);while(st.hand.length<HN){if(!st.deck.length){if(!st.discard.length)break;st.deck=shuffle(st.discard,rnd);st.discard=[]}st.hand.push(st.deck.pop())}}
// money: 1 Taler je 9 Besucher, −1 je 8 Natur; Schulden kosten −1 je 10 Taler (Kredit)
const ENTRY=9;
const flatC=e=>CTX.zl?Math.min(e,30)+Math.min(Math.max(e-30,0),60)/2+Math.max(e-90,0)/4:e,entryOf=A=>flatC(A/ENTRY),careOf=S=>flatC(S/8);
function dayIncome(A,S,money){const LW=LK(),wb=LW&&LW.spec.wb?2:1,lot=LW?LW.lotto:0;const ef=(CTX.dk==='geniesser'?1.2:CTX.dk==='oase'?.9:1),cf=(CTX.dk==='oase'?.75:CTX.dk==='geniesser'?1.25:1)*(CTX.zl&&CTX.winter&&CTX.zl.insp==='heiz'?(HARD(CTX.zl)?2:1.5):1);const base=Math.round(entryOf(A)*ef*wb-careOf(S)*cf),entry=Math.round(entryOf(A)*ef*wb),don=typeof state!=='undefined'&&state&&state.buildings?(2+(state.zoo||0))*state.buildings.filter(b=>b.pr==='spende').length:0;const interest=money>=0?0:-Math.floor(-money/10);const spec=(hasSpec('kassenwart')?3:0)-((CTX.spec||[]).includes('spekulant')?5:0);let kar=0,gas=0,snk=0;if(typeof state!=='undefined'&&state&&state.buildings){snk=state.buildings.filter(b=>fdHas(b,'sn')).length;const ix=mkIndex(state.buildings);for(const b of state.buildings)if(b.key==='karawane')kar+=cnt(nbrs(b,ix),n=>isCat(n,'gehege')&&!isHab(n,'wueste'));gas=talOf(state.buildings)}return{base,interest,spec,don:don+lot,kar,gas,lot,snk,total:base+interest+spec+don+kar+gas+lot+snk,entry,care:base-entry,A,S}}
applyLang(LANG);
//ENGINE-END

/* ---------- sound (synthesised, no files) ---------- */
