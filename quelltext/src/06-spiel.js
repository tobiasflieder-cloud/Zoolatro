//@@ modul: 06-spiel
let VIEWMAP=null;
function newGame(key='wiese',m=genMap(key),opt={}){ZOOM=null;ZAUTO=false;SHIFT=0;SHX=0;screen=null;setBoard(m.cells);TERR=m.terr;VIEWMAP=key;computeView();
  state=Object.assign(DEFAULTS(),{map:key,board:m.cells,season:0,day:0,seasonScore:0,totalScore:0,buildings:[],nextId:1,deck:shuffle(opt.deck||START_DECK),discard:[],hand:[],bp:BP,
    selected:null,rot:0,preview:null,phase:'play',offer:[],pendingSeason:false,lastDay:0,info:null,terr:[...TERR]},opt.state||{});
  if(!state.north)state.north=northOf(BOARD,ROT); // 0.87a: Arktis-Zone nach der Lage beim Zoo-Start (bleibt beim Drehen gleich)
  if(state.rule&&!opt.plan){initRule();state.terr=[...TERR]}
  if(state.zl&&!opt.plan)initZl();
  state.events=opt.events||rollSeason(0);syncCtx();state.bpMax=bpBase();const sl=activeSlot();if(sl&&state.mode!=='tut'){if(state.mode==='camp'){if(sl.run)sl.run.game=state}else sl.game=state;sl.last=Date.now()}startDay()}
// 0.86a: Kronenfeld nur dort, wo ein 4-Felder-Gehege hinpasst: Zahl der verschiedenen Lagen aller 4-Felder-Formen (alle Drehungen) über dem Feld,
// ohne Rand, Felsen, Eingang, Baugrube und mit Naturflächen höchstens eines Lebensraums. Bevorzugt ≥ 3 Lagen und kein Randfeld, sonst das Feld mit den meisten Lagen.
let SHAPES4L=null;const SHAPES4=()=>SHAPES4L||(SHAPES4L=[...new Set(Object.keys(CARDS).filter(k=>CARDS[k].cat==='gehege'&&!CARDS[k].gone).map(k=>CARDS[k].shape))].filter(s=>SHAPES[s]&&SHAPES[s].cells.length===4));
function crownFits(k,ek,bad){const[q0,r0]=k.split(',').map(Number),seen=new Set();for(const s of SHAPES4())for(let rot=0;rot<6;rot++){const C=rotCells(SHAPES[s].cells,rot);for(const[aq,ar]of C){const P=C.map(([q,r])=>[q-aq+q0,r-ar+r0]),key=P.map(c=>hk(...c)).sort().join(';');if(seen.has(key))continue;
    const ok=P.every(([q,r])=>{const h=hk(q,r);return ONBOARD.has(h)&&TERR.get(h)!=='block'&&h!==ek&&!(bad&&bad(h))})&&new Set(P.map(c=>TERR.get(hk(...c))).filter(Boolean)).size<=1;if(ok)seen.add(key)}}return seen.size}
function crownPick(L,ek,bad){if(!L.length)return null;let best=null,bn=-1;const edge=k=>{const[q,r]=k.split(',').map(Number);return isEdge(q,r)};
  for(const pass of[0,1])for(const k of L){if(pass===0&&edge(k))continue;const n=crownFits(k,ek,bad);if(n>=3)return k;if(n>bn){bn=n;best=k}}return best||L[0]}
function initZl(){const Z=state.zl,ek=state.rule&&state.rule.entry?hk(...state.rule.entry):null,all=BOARD.map(([q,r])=>hk(q,r)).filter(k=>TERR.get(k)!=='block'&&k!==ek),plain=shuffle(all.filter(k=>!TERR.get(k))),rest=shuffle(all);
  const R0=state.rule,bad=k=>!!R0&&R0.id==='achse'&&(R0.ax?R0.ax.includes(k):+k.split(',')[1]===R0.row),hd=(a,b)=>{const[q1,r1]=a.split(',').map(Number),[q2,r2]=b.split(',').map(Number),dq=q1-q2,dr=r1-r2;return(Math.abs(dq)+Math.abs(dr)+Math.abs(dq+dr))/2};
  Z.crown=stAb('keine_krone')?null:crownPick(plain.filter(k=>!bad(k)).concat(plain.filter(bad)),ek,bad);{const ng=stW('gold',3)+(wrBon('gold')?1:0),g=[];for(const minD of[2,1])for(const k of rest){if(g.length>=ng)break;if(k===Z.crown||g.includes(k)||bad(k))continue;if([...g,Z.crown].filter(Boolean).every(x=>hd(x,k)>=minD))g.push(k)}Z.gold=g}{const io0=Object.keys(INSP).filter(k=>k!=='frei'&&!(k==='zucht'&&!(state.zoo>0)||k==='futter'&&!((state.zoo||0)>=2)||k==='gross'&&(state.zoo||0)<2)&&!(wrHardRule()&&INSP[k].stufe==='schwer')),io1=io0.filter(k=>!SEEN.i.has(k)),io=shuffle(io1.length>=(isZ2()?2:1)?io1:io0);Z.insp=io[0];Z.inspOpts=undefined;Z.hard=state.mode==='camp'&&(state.zoo||0)>=2;Z.wplus=state.mode==='camp'&&(state.zoo||0)>=4}const hasI=i=>(Z.inspOpts||[Z.insp]).includes(i);if(hasI('hab'))shuffle(habsNow().slice()); /* 0.88a: inspHab entfernt (wirkte nicht mehr); Zufallszug bleibt, damit Seeds gleich bleiben */
  Z.opts=[]}
// Der nächste Zoo wird schon vor den Belohnungen ausgewürfelt und im Lauf gespeichert
// Seeds: gleicher Seed = gleiche Zoos (Spielfeld, Regel, Winter-Bedingungen, Goldfelder), unabhängig von Entscheidungen
let PENDSEED=null;
function seedHash(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^=h>>>16)>>>0}}
function seedRng(str){let a=seedHash(str)();return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function withSeed(key,f){if(!key)return f();const R0=Math.random;Math.random=seedRng(key);try{return f()}finally{Math.random=R0}}
const seedNew=()=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let o='';for(let i=0;i<6;i++)o+=A[Math.floor(Math.random()*A.length)];return o};
const seedClean=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,16);
// Lauf-Protokoll für „📋 Lauf kopieren“
function logSeason(ok){try{const r=runOf();if(!r||state.mode!=='camp'||r.tut)return;(r.log=r.log||[]).push({z:state.zoo||0,s:state.season,p:Math.round(state.seasonScore),t:seOf(state.season).target,d:state.day+1,ok:ok?1:0,m:Math.round(state.money||0),sp:(state.spec||[]).slice(),pg:(state.progs||[]).slice(),w:state.wish&&WISH[state.wish.id]?{t:WISH[state.wish.id].t(state.wish),ok:state.wish.ok?1:0}:null});try{rpSnap(r,ok)}catch(e){console.warn(e)}}catch(e){}}
// 0.99a: 🔍 Lauf-Rückblick – Schnappschuss am Ende jeder Jahreszeit (auch gescheitert) in run.replay[zoo][season], mit gespeicherter Wertung (nicht später neu rechnen)
function rpSnap(r,ok){const bs=state.buildings,sc=scoreZoo(bs),Z=state.zl||{},R2=x=>Math.round(x||0),wg=(()=>{try{return wrOn()?wrGoal():null}catch(e){return null}})(),D=state.wrDest;
  const S={o:ok?1:0,p:R2(state.seasonScore),t:R2(seOf(state.season).target),d:state.day+1,m:R2(state.money),dp:(state.dayPts||[]).map(R2),
    g:{B:BOARD.map(([q,r])=>q+','+r).join(' '),T:[...TERR].map(([k,v])=>k+'='+v).join(' '),go:(Z.gold||[]).join(' '),g4:(Z.g4||[]).join(' '),cr:[Z.crown,...(Z.crown2||[])].filter(Boolean).join(' '),rot:ROT?1:0},
    b:bs.map(b=>{const st=sc.steps.find(x=>x.id===b.id),bk=breakdown(b,bs);return[b.key,b.cells.map(c=>c.join(',')).join(' '),b.lvl||1,b.ed||'',b.pr||'',R2(st?st.a:bk.a),R2(st?st.s:bk.s),bk.parts.filter(p=>p.label).map(p=>[p.label,R2(p.a),R2(p.s)])]}),
    x:sc.mults.map(m=>[m.icon||'',m.label,m.ma||0,m.ms||0]),A:sc.A,S:sc.S,
    au:state.rule&&RULES[state.rule.id]?(RULES[state.rule.id].icon||'')+' '+(RULES[state.rule.id].name||state.rule.id):'',
    wg:wg?[wg.Z.icon+' '+wg.Z.name,wg.n,wg.need,wg.ok?1:0]:null,ws:Z.insp&&INSP[Z.insp]?(INSP[Z.insp].icon||'❄️')+' '+INSP[Z.insp].name:'',
    wi:state.wish&&WISH[state.wish.id]?[WISH[state.wish.id].t(state.wish),state.wish.ok?1:0]:null,ev:(state.events||[]).map(e=>evIcon(e)+' '+evName(e)),
    sp:(state.spec||[]).filter(id=>SPEC[id]).map(id=>SPEC[id].icon+' '+SPEC[id].name),pg:[...(state.progs||[]),...(state.ads||[])].map(id=>{const P=PROGS[id]||ADS[id];return P?(P.icon||'')+' '+(P.name||id):String(id)}),
    rg:D?[D.ort||'',D.k&&typeof wrK==='function'&&wrK(D.k)?wrK(D.k).name:'']:null};
  const z=state.zoo||0;r.replay=r.replay||[];(r.replay[z]=r.replay[z]||[])[state.season]=S}
function logZoo(won){try{const r=runOf();if(!r||state.mode!=='camp'||r.tut)return;const bs=state.buildings,sc=scoreZoo(bs),byId=Object.fromEntries(bs.map(b=>[b.id,b])),cnt0={};for(const b of bs){const k=baseK(b.key);cnt0[k]=(cnt0[k]||0)+1}
  const top=sc.steps.slice().sort((x,y)=>(y.a+y.s)-(x.a+x.s)).slice(0,5).map(x=>{const b=byId[x.id];return b?`${CARDS[b.key].name}${b.lvl>1?' '+ROMAN[b.lvl]:''} ${x.a}B/${x.s}N`:''}).filter(Boolean);
  (r.zlog=r.zlog||[]).push({z:state.zoo||0,won:won?1:0,pts:Math.round(state.totalScore||0),map:state.map,rule:state.rule&&state.rule.id,insp:state.zl&&state.zl.insp,ih:state.zl&&state.zl.insp==='hab'&&state.zl.inspHabs?state.zl.inspHabs.map(h=>HAB[h]?HAB[h].label:h).join('/'):null, /* 0.88a: wirklich gewerteter Lebensraum */prof:state.zl&&state.zl.prof,A:sc.A,S:sc.S,mult:sc.mults.map(m=>`${m.label} ${m.ma?'×'+mxs(m.ma)+' B':''}${m.ms?'×'+mxs(m.ms)+' N':''}`),built:cnt0,top,deck:deckTotal?deckTotal():null,ml:(state.mileLog||[]).slice(),en:(state.ensLog||[]).slice()})}catch(e){}}
// 0.92a: Ensembles fürs Lauf-Protokoll: erstes Auftreten je Zoo (Jahreszeit, Tag) am Tagesende
function ensLog(){if(!state||!ensOn())return;const r=runOf();if(!r||r.tut)return;const L=state.ensLog=state.ensLog||[];for(const g of ensFind(state.buildings).groups)if(!L.some(x=>x.k===g.key))L.push({k:g.key,s:state.season,d:state.day||0})}
// 0.51a: Fehlerprotokoll – letzter Fehler in META.lastErr (auch in „Lauf kopieren“), kurze Meldung oben
function logErr(where,e){try{console.warn('Zoolatro-Fehler',where,e);const st=String(e&&e.stack||'').split('\n').slice(0,4).map(x=>x.trim()).join(' ← ').slice(0,500);
  META.lastErr={t:Date.now(),v:VERSION,w:where,m:String(e&&e.message||e).slice(0,200),s:st,sz:state?`Zoo ${(state.zoo||0)+1} · ${SEASONS[state.season]?SEASONS[state.season].name:state.season} Tag ${(state.day||0)+1} · ${state.phase} · modal ${modal||'-'}`:'kein Spiel'};try{saveMeta()}catch(e2){}}catch(e3){}}
function showErr(t){try{let d=document.getElementById('errNote');if(!d){d=document.createElement('div');d.id='errNote';d.style.cssText='position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:9999;max-width:min(92vw,460px);background:#5a1f22;color:#fff;border:2px solid #ff5a5f;border-radius:12px;padding:9px 13px;font:600 13.5px/1.35 var(--f-body,sans-serif);box-shadow:0 8px 24px #0009';d.onclick=()=>d.remove();document.body.appendChild(d)}d.textContent=t;clearTimeout(d._t);d._t=setTimeout(()=>{try{d.remove()}catch(e){}},9000)}catch(e){}}
const errTxt=run=>{const E=META.lastErr;if(!E)return'';if(run&&(run.t0?E.t<run.t0:E.v!==VERSION))return'';return`Letzter Fehler (${new Date(E.t).toLocaleString('de-DE')}, ${E.v}): ${E.w} – ${E.m} · ${E.sz} · ${E.s}`};
window.addEventListener('error',ev=>{logErr('Unbekannt',ev.error||ev.message)});window.addEventListener('unhandledrejection',ev=>{logErr('Unbekannt (async)',ev.reason)});
function runText(run){const L=[],nm=k=>CARDS[k]?CARDS[k].name:k,sn=i=>SEASONS[i]?SEASONS[i].name:i;if(run&&!run.tut&&runDays(run)===5)L.push('🐢 5 Tage je Jahreszeit');if(run&&run.stTest)L.push('🧪 Stufen-Test (Stufe über dem Fortschritt)');if(run&&run.wr)L.push(`🌍 Weltreise (${runGoal(run)} Zoos) · Route: ${(run.wrRoute||[]).map(x=>`Zoo ${x.z+1} ${x.ort} (${wrK(x.k).name})`).join(' → ')||'-'} · Boni: ${(run.boni||[]).map(k=>WRB[k]?WRB[k].name:k).join(', ')||'-'}${(run.wrGone||[]).length?' · Ausgewildert: '+run.wrGone.map(k=>CARDS[k]?CARDS[k].name:k).join(', '):''}`);
  L.push(`Zoolatro ${VERSION} · Lauf ${run.zl?(run.z2?'2.0 Stufe '+(run.stage||1):'Zoolatro'):'klassisch'}${run.seed?' · Seed '+run.seed:''}`);
  L.push(`Lebensräume: ${(run.habs||[]).map(h=>HAB[h]?HAB[h].label:h).join(', ')} · Deck: ${(DECKS[run.deckId]||{}).name||run.deckId}`);
  L.push(foodOnRun(run)?`Futter: an · Stufen ${Object.keys(run.fdl||{}).filter(h=>run.fdl[h]>0).map(h=>(HAB[h]?HAB[h].label:h)+' '+run.fdl[h]).join(', ')||'-'}${(run.fdlog||[]).length?' · '+run.fdlog.join(' · '):''}`:`Futter: ${run.tut?'-':'aus (Test)'}`);
  L.push(`Zoos geschafft: ${run.zoo} · Punkte gesamt: ${fmt(run.total||0)}`);
  for(const z of run.zlog||[]){L.push('');L.push(`== Zoo ${z.z+1} ${z.won?'geschafft':'nicht geschafft'} · ${fmt(z.pts)} · ${MAPS[z.map]?MAPS[z.map].name:z.map} · Auflage ${z.rule&&RULES[z.rule]?RULES[z.rule].name||z.rule:'-'} · Winter ${z.insp&&INSP[z.insp]?INSP[z.insp].name:'-'}${z.ih?' ('+z.ih+')':''}`);
    for(const s of (run.log||[]).filter(x=>x.z===z.z))L.push(`  ${sn(s.s)}: ${fmt(s.p)} / ${fmt(s.t)} (${Math.round(s.p/s.t*100)} %, ${s.d} Tage)${s.ok?'':' GESCHEITERT'} · Kasse ${s.m} · Team ${s.sp.map(id=>SPEC[id]?SPEC[id].name:id).join(', ')||'-'} · Programme ${s.pg.map(id=>PROGS[id]?PROGS[id].name:id).join(', ')||'-'}${s.w?` · Wunsch: ${s.w.t} ${s.w.ok?'✓':'✗'}`:''}`);
    L.push(`  Endstand: ${z.A} B × ${z.S} N · Multiplikatoren: ${z.mult.join(' · ')||'-'}`);
    L.push(`  Meilensteine: ${(z.ml||[]).map(m=>(MILE[m.t]?MILE[m.t].icon+' '+MILE[m.t].label:m.t)+' ('+sn(m.s)+', Tag '+(m.d+1)+')').join(', ')||'-'}`);
    L.push(`  Ensembles: ${(z.en||[]).map(m=>(ENS[m.k]?ENS[m.k].icon+' '+ENS[m.k].name:m.k)+' ('+sn(m.s)+', Tag '+(m.d+1)+')').join(' · ')||'-'}`);
    L.push(`  Beste: ${z.top.join(' · ')}`);
    L.push(`  Gebaut: ${Object.entries(z.built).sort((a,b)=>b[1]-a[1]).map(([k,n])=>nm(k)+(n>1?' ×'+n:'')).join(', ')}`)}
  L.push('');L.push(`Deck jetzt (${(run.deck||[]).length}): ${(run.deck||[]).map(k=>nm(k)+(String(k).includes('~')?' '+(EDS[String(k).split('~')[1]]||{icon:''}).icon:'')).join(', ')}`);
  L.push('',`Freigeschaltet in diesem Lauf: ${(run.fsAll||[]).map(unName).join(', ')||'nichts'}`);
  {const et=errTxt(run);if(et)L.push('',et)}
  return L.join('\n')}
function copyTxt(t,btn){const ok=()=>{if(btn){btn.textContent='Kopiert ✓'}};try{navigator.clipboard.writeText(t).then(ok,()=>fallbackCopy(t,ok))}catch(e){fallbackCopy(t,ok)}}
function fallbackCopy(t,ok){try{const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();ok()}catch(e){}}
function rollPlan(run){if(run.seed)return withSeed(run.seed+'|zoo'+run.zoo+'|'+(run.stage||1),()=>rollPlan0(run));return rollPlan0(run)}
// schon angebotene Auflagen und Winter-Bedingungen dieses Laufs (nur aus früheren Zoos)
let SEEN={r:new Set(),i:new Set()};
function seenOf(run,z){const o={r:new Set(),i:new Set()};for(const k in run&&run.offered||{}){if(+k>=z)continue;const e=run.offered[k];if(e.r)o.r.add(e.r);for(const i of e.i||[])o.i.add(i)}return o}
// 0.89a: verbotene Paare (Gelände, Auflage) aus daten/gelaende.json
const VPAARE=GELAENDE_DATEN.verbotene_paare||[],paarVerboten=(m,r)=>!!m&&!!r&&VPAARE.some(([a,b])=>a===m&&b===r);
function ruleRoll(mapId){const run=(()=>{try{return runOf()}catch(e){return null}})(),d4=isD4(run),all=Object.keys(RULES).filter(k=>!RULES[k].gone&&!RULES[k].wr&&!(d4&&k==='locker')&&!paarVerboten(mapId,k)), // 0.82a: keine „Lockere Bebauung“ im Testlauf
 seen=new Set([...SEEN.r,...(run?seenOf(run,run.zoo||0).r:[])]),uk=new Set([...seen].map(aufK).filter(Boolean)),c=all.filter(k=>!uk.has(aufK(k))),p0=c.length?c:all, // 0.90a: keine Kategorie zweimal pro Lauf, solange eine unbenutzte geht
 f=p0.filter(k=>!seen.has(k)),pool=f.length?f:p0;return pool[Math.floor(Math.random()*pool.length)]}
function noteOffered(run){try{if(!run||!state||!state.zl)return;(run.offered=run.offered||{})[state.zoo||0]={r:state.rule&&state.rule.id||null,i:(state.zl.inspOpts||[state.zl.insp]).filter(Boolean)}}catch(e){}}
function rollPlan0(run){SEEN=seenOf(run,run.zoo);try{return rollPlan1(run)}finally{SEEN={r:new Set(),i:new Set()}}}
function rollPlan1(run){mapRoll(run);GENHABS=run.habs||null;const cf=cfOf(run),m=(()=>{const r=genMap(cf.map,Math.random,cf.rocks);GENHABS=null;return r})(),keep=state,kb=keep?BOARD.map(c=>c.slice()):null,kt=TERR;setBoard(m.cells);TERR=m.terr;
  const p={zoo:run.zoo,cells:m.cells,terr:[...m.terr],north:northOf(m.cells,viewRotFor(m.cells,cf.map)),ev:cf.spring&&!run.zl?rollEvents({...cf,s:0}):[],rule:null};
  state={zoo:run.zoo,habs:run.habs||null};if(run.zl){if(!run.tut){const rid=WRCTX?WRCTX.rule:ruleRoll(cf.map);if(rid)state.rule={id:rid}}state.zl={};if(state.rule)initRule();initZl();noteOffered(run);p.terr=[...TERR];Object.assign(p,{rule:state.rule||null,gold:state.zl.gold,crown:state.zl.crown,opts:state.zl.opts,insp:state.zl.insp,inspOpts:state.zl.inspOpts,prof:run.prof||NOPROF,ban:null})}
  state=keep;if(keep){setBoard(kb);TERR=kt}return p}
function rollPraeg(){const ids=praegLos(),out=[];while(out.length<3){const pool=ids.filter(i=>!out.includes(i)),t=pool.reduce((x,i)=>x+PRAEG[i].w,0);let r=Math.random()*t;for(const i of pool){r-=PRAEG[i].w;if(r<=0){out.push(i);break}}}return out}
function newReward(run){if(run.wr){run.plan=null;run.wrOpts=null;const a={step:'card',left:3,pstep:'cat'};zkDeal(run,a);return a} // 0.85a: Weltreise ohne Vorschau und Prägungs-Schritt, Ziel erst nach dem Team
  run.plan=rollPlan(run);return{step:'prev',left:3,pstep:'cat'}}
function planHtml(run,a){const pl=run.plan,cf=cfOf(run),zl=!!run.zl,box=ZBOX,m={cells:pl.cells,terr:new Map(pl.terr)},rocks=pl.terr.filter(e=>e[1]==='block').length,R=pl.rule&&RULES[pl.rule.id];
  let h=`<h3 class="sh">Vorschau: Zoo ${run.zoo+1} · ${MAPS[cf.map].icon} ${MAPS[cf.map].name}</h3><p style="margin:0;color:var(--muted);font-size:13.5px">So sieht dein nächster Zoo aus. Wähle Verbesserungen, Karten und Spezialisten passend dazu. Über „🗺️ Nächster Zoo“ kommst du jederzeit hierher zurück.</p>
    <div class="planmap">${mapPreviewSvg(m,{gold:pl.gold,crown:pl.crown,entry:pl.rule&&pl.rule.entry,half:pl.rule&&pl.rule.id==='halb'?pl.rule.side:0})}</div><p class="planleg">${Object.keys(HAB).filter(k=>[...m.terr.values()].includes(k)).map(k=>`<span><i style="background:var(--h-${k})"></i>${HAB[k].label}</span>`).join('')}<span><i style="background:var(--rock)"></i>Felsen</span>${zl?'<span><i style="background:#ffd166"></i>×2-Feld</span><span><i style="background:#b06cff"></i>Krone</span>':''}${pl.rule&&pl.rule.entry?'<span><i style="background:#fff"></i>Eingang</span>':''}</p><div class="zboxes">`;
  h+=box('zt','🎯','Saisonziele',SEASONS.map((x,i)=>`${SEAS_ICON[i]} ${fmt(seTarget(i,zl,run.zoo,cf.mult))}`).join(' · '),`🌱 ${fmt(seTarget(0,zl,run.zoo,cf.mult))} · ❄️ ${fmt(seTarget(3,zl,run.zoo,cf.mult))}`);
  h+=box('zm',MAPS[cf.map].icon,'Gelände: '+MAPS[cf.map].name,MAPS[cf.map].text+' '+(rocks?`${rocks} Felsen.`:'Keine Felsen.'),rocks?`${rocks} Felsen`:'keine Felsen');
  if(R)h+=box('zr',R.icon,'Auflage: '+R.name,withRot(false,()=>R.text(pl.rule)));
  if(zl&&(pl.insp||pl.inspOpts))h+=winterBox({...pl,insp:pl.insp||(pl.inspOpts&&pl.inspOpts[0]),inspOpts:undefined},box,'',true);
  if(zl)h+=box('zpu','🧬','Reinheit','Ab '+PURN+' <b>verschiedenen</b> Gehege-Arten eines Lebensraums, die zusammenhängen (Wüste: irgendwo im Zoo): <b>×1,15 Natur</b> für den ganzen Zoo, je weiterer Art +0,15 (höchstens ×1,6). Gleiche Arten halten die Gruppe zusammen, zählen aber nicht mit.'+(pl.rule&&pl.rule.id==='max3'?'<br><i class="b">Mit der Auflage in diesem Zoo nicht erreichbar.</i>':''),pl.rule&&pl.rule.id==='max3'?'hier nicht erreichbar':'ab 5 verschiedenen Arten ×1,1 N');
  if(zl)h+=box('zf','★','Sonderfelder','<b>×2:</b> Das Gehege/Gebäude auf einem goldenen Feld zählt doppelt (3 Felder).<br><b>👑 ×1,3:</b> Besucher für den ganzen Zoo, wenn auf dem Kronenfeld ein Gehege mit 4 Feldern steht.','3 Felder ×2 · 1 Kronenfeld 👑');
  for(const e of pl.ev||[])if(EVENTS[e.id])h+=box('ze',evIcon(e),`Ereignis im Frühling: ${evName(e)}`,evFx(e).map(l=>l.replace('|',' ')).join(' · '));
  if(!(pl.ev||[]).length)h+=zl?'':box('ze','🌱','Frühling','Kein Ereignis im Frühling.');
  h+='</div><p class="zhint">Tippe auf eine Kachel für den vollen Text.</p>';
  h+=a.step==='prev'?`<button class="btn main big" data-cprev="1">Weiter zu den Belohnungen</button>`:`<button class="btn main big" data-cpeek="0">Zurück</button>`;
  return h}
const ZBOX=(cls,ic,tit,body,short)=>`<div class="zbox tile ${cls}" onclick="if(!event.target.closest('button'))this.classList.toggle('open')"><span class="zi">${ic}</span><div><b>${tit}</b><small>${short||String(body).replace(/<button[\s\S]*?<\/button>/g,'').replace(/<[^>]+>/g,' ')}</small><span class="full">${body}</span></div></div>`;
function zlPeek(){modal=null;state.zlPeek=true;Sfx.select();render();clearTimeout(zlPeek.t);zlPeek.t=setTimeout(()=>{if(state){state.zlPeek=false;render()}},6000)}
function zlBuilt(key,dir){const Z=state.zl;if(!Z)return;const c=CARDS[key];if(c.cat!=='gehege')return;const id='z_'+c.hab;if((state.spec||[]).includes(id))Z.grow[id]=Math.max(0,(Z.grow[id]||0)+dir)}
// Zuchtprogramm angekündigt: im Herbst ist immer mindestens eine bedrohte Art aus den eigenen Lebensräumen im Angebot
function zuchtOffer(base){try{if(!state.zl||state.season!==2||!base.length)return;const Z=state.zl,has=(Z.inspOpts||[Z.insp]).includes('zucht');if(!has)return;if(base.some(k=>(CARDS[k].tags||[]).includes('bedroht')))return;
  const H=habsNow(),pool=Object.keys(CARDS).filter(k=>{const c=CARDS[k];return c.cat==='gehege'&&!c.ms&&!k.includes('~')&&!k.includes('^')&&!c.jt&&(c.tags||[]).includes('bedroht')&&H.includes(c.hab)&&!isLocked(k)&&!base.includes(k)});if(!pool.length)return;base[base.length-1]=pool[Math.floor(Math.random()*pool.length)]}catch(e){}}
function newOffer(){const base=makeOffer(OFFER);if(state.offer&&state.offer.length)state.lastOffer=state.offer.map(baseK);const gr=typeof gRun==='function'&&gRun();if(gr&&tutGuided()){const G=gr.guide=gr.guide||{seen:{}};state.offer=TUTOFF[(G.oi=(G.oi||0)+1)%TUTOFF.length].slice();state.offerEd=null;return}zuchtOffer(base);state.offer=base.map(k=>{if(!state.zl||CARDS[k].cat==='verst'||TUTNOW)return k;const r=Math.random(),e=r<.005?'r':r<.015?'s':r<.035?'g':'';return e?k+'~'+e:k});state.lastOffer=(state.lastOffer||[]).concat(state.offer.map(baseK)).slice(-OFFER);state.offerEd=null}
function startDay(){if(state&&state.zl&&state.zl.inspOpts&&!state.zl.inspPicked){state.zl.insp=state.zl.insp||state.zl.inspOpts[0];state.zl.inspOpts=undefined}if(ZPREV&&!ZOOM&&!META.zoomOut)ZOOM=ZPREV;ZPREV=null;if(ZSH){SHIFT=ZSH[0];SHX=ZSH[1]}ZSH=null;if(!ZOOM){SHIFT=0;SHX=0}if(state.zl&&state.zl.tv&&state.day>0){state.zl.tv=false;syncCtx()}state.moving=null;state.free1=0;state.bp=Math.max(1,state.bpMax-(state.day===0&&hasEv('baustelle')?1:0)-(state.day===0?stW('bp_erster_tag',0):0)-(winIs('glatteis')&&HARD(state.zl)?1:0));{const r=runOf();if(r&&r.bpCarry>0){r.bpCarry--;state.bpWish=(state.bpWish||0)+1;state.bpWhy=(state.bpWhy||[]).concat('⚡ früh geschafft')}}if(state.day===0&&state.season<2&&wrBon('helfer')){state.bpWish=(state.bpWish||0)+1;state.bpWhy=(state.bpWhy||[]).concat('🔨 Fleißige Helfer')}if(state.wbp2>0){state.wbp2--;state.bpWish=(state.bpWish||0)+1;state.bpWhy=(state.bpWhy||[]).concat('🌟 Besucherwunsch')}if(state.bpWish){state.bp+=state.bpWish;const why=[...new Set(state.bpWhy||[])].join(', ');state.bannerQ=(state.bannerQ||[]).concat([[`🧱 +${state.bpWish} Baupunkte heute`,why?'Extra von: '+why:'Extra-Baupunkte für heute.']]);state.bpWish=0;state.bpWhy=[]}try{wrAuswild()}catch(e){console.warn(e)}state.builtToday=0;state.kuUsed=0;if(state.uzDay==='next')state.uzDay=dayKeyNow();if(state.bmDay==='next')state.bmDay=dayKeyNow();state.undo=[];state.selected=null;state.preview=null;state.phase='play';state.luckNow=null;state.news=state.newsNext||[];state.newsNext=null;if(state.day===0&&state.season===0&&runAus('rd'))state.rdBonus=(state.rdBonus||0)+1;
  // Meilenstein-Karten kommen zuerst auf die Hand, dann wird auf fünf aufgefüllt
  state.miles=state.miles||{};state.mileNew=[];for(const t in MILE){const M=MILE[t];if(state.miles[t]||mileCount(state.buildings,t)<M.n)continue;state.miles[t]=1;state.hand.push(M.card);state.mileNew.push(t);(state.mileLog=state.mileLog||[]).push({t,s:state.season,d:state.day})}
  if((state.jtNext||[]).length){state.hand.push(...state.jtNext);state.jtNext=[]} // 0.96a: gestern geborene Jungtiere zusätzlich auf die Hand
  if(state.day===0)for(const pile of['deck','discard'])for(let i=state[pile].length-1;i>=0;i--){const k=state[pile][i];if(CARDS[k]&&CARDS[k].pr==='stamm'&&state.hand.length<HAND){state[pile].splice(i,1);state.hand.push(k)}}
  if(state.day===0)try{wishRoll()}catch(e){}
  try{dayRoll()}catch(e){console.warn(e)}
  drawHand(state);if(state.mileNew.length)Sfx.combo();
  Sfx.deal(state.hand.length);render();flushBanners()}
const movingB=()=>state.moving!=null?state.buildings.find(b=>b.id===state.moving):null;
const selKey=()=>{const m=movingB();return m?m.key:state.selected!=null?state.hand[state.selected]:null};
// Umzug: Drehung und Ankerfeld des stehenden Gebäudes wiederfinden
function startMove(b){{const tf=tutFix();if(tf&&!(tf.mv&&b.key===tf.mv)){Sfx.deny();tutNudge();return}}state.moving=b.id;state.selected=null;state.info=null;state.infoProg=null;state.rot=0;state.preview={q:b.cells[0][0],r:b.cells[0][1]};
  const want=b.cells.map(c=>hk(...c)).sort().join('|');
  for(let rot=0;rot<6;rot++){const rc=rotCells(SHAPES[CARDS[b.key].shape].cells,rot);for(const[q,r]of b.cells){const oq=q-rc[0][0],or=r-rc[0][1];
    if(rc.map(([a,c])=>hk(a+oq,c+or)).sort().join('|')===want){state.rot=rot;state.preview={q:oq,r:or};return}}}}
const affordable=k=>costOf(k)<=state.bp&&!builtUnique(state.buildings,k);
const upTarget=()=>state.preview&&state.preview.up!=null?state.buildings.find(b=>b.id===state.preview.up):null;
function ghostCells(){const key=selKey();if(!key||!state.preview)return null;const tb=upTarget();if(tb)return tb.cells;return placeCells(key,state.rot,state.preview.q,state.preview.r)}
// where a card lands for a hex under the pointer: same gehege there = Ausbau
function previewAt(hx,dq=0,dr=0){if(!hx)return null;if(state.moving!=null)return{q:hx.q+dq,r:hx.r+dr};const key=state.hand[state.selected],tb=mkIndex(state.buildings).get(hk(hx.q,hx.r));
  if(tb&&sameArt(tb.key,key)&&!CARDS[key].ms)return{q:hx.q,r:hx.r,up:tb.id};return{q:hx.q+dq,r:hx.r+dr}}
function hypo(){const mb=movingB();
  if(mb){if(!state.preview)return null;const cells=ghostCells(),others=state.buildings.filter(b=>b!==mb);
    if(cells.map(c=>hk(...c)).sort().join('|')===mb.cells.map(c=>hk(...c)).sort().join('|'))return{ok:false,move:mb,cells,why:'Hier steht es schon. Wähle einen neuen Platz oder drehe es.'};
    {const tf=tutFix();if(tf&&(!tf.mv||(tf.at&&!tutCellsEq(cells,tf.at))))return{ok:false,move:mb,cells,why:'👉 Auf die leuchtenden Felder legen'+(tf&&tf.rot?' (mit ↻ drehen)':'')}}
    if(!fits(others,cells,mb.key))return{ok:false,move:mb,cells,why:whyNot(cells,mb.key,others)};
    {const rw=ruleWhy(others,cells,mb.key,true);if(rw)return{ok:false,move:mb,cells,why:rw}}
    if(state.rule&&state.rule.id==='eingang'){const cut=[],cutN=entryCut(state.buildings.map(b=>b===mb?Object.assign({},mb,{cells}):b),cut);if(cutN)return{ok:false,move:mb,cells,cut,why:`Auflage Eingang: Dann ${cutN===1?'hängt 1 Gehege/Gebäude':'hängen '+cutN+' Gehege/Gebäude'} nicht mehr am Eingang 🚪.`}}
    const nb=Object.assign({},mb,{cells}),all=state.buildings.map(b=>b===mb?nb:b),r=scoreZoo(all);
    return{ok:true,move:mb,cells,r,b:nb,own:r.steps.find(x=>x.id===mb.id),src:sourcesOf(nb,all),brk:breakdown(nb,all)}}
  if(state.selected==null||!state.preview)return null;const key=state.hand[state.selected],tb=upTarget();
  if(tb&&state.rule&&state.rule.id==='gross2'&&state.builtToday>=2)return{ok:false,up:tb,cells:tb.cells,why:'Auflage Großbaustelle: Heute hast du schon 2 Karten gebaut.'};
  {const tf=tutFix();if(tf&&tf.up&&!tb)return{ok:false,cells:ghostCells()||[],why:'👉 Zieh die Karte auf das leuchtende Gehege, um es auszubauen.'};if(tf&&tb&&!tf.up)return{ok:false,up:tb,cells:tb.cells,why:'👉 Auf die leuchtenden Felder legen'+(tf&&tf.rot?' (mit ↻ drehen)':'')}}
  if(tb){if((tb.lvl||1)>=MAXLVL)return{ok:false,up:tb,cells:tb.cells,why:`${CARDS[key].name} ist schon auf Stufe III, weiter geht es nicht.`};
    const nb=Object.assign({},tb,{lvl:(tb.lvl||1)+1,key:upFdKey(tb.key,key)},CARDS[key].ed?{ed:(tb.ed||'')+CARDS[key].ed}:{},CARDS[key].pr&&!tb.pr?{pr:CARDS[key].pr}:{}),all=state.buildings.map(b=>b===tb?nb:b),r=scoreZoo(all);
    return{ok:true,up:tb,cells:tb.cells,r,b:nb,own:r.steps.find(s=>s.id===tb.id),src:sourcesOf(nb,all),brk:breakdown(nb,all)}}
  const cells=ghostCells();if(!cells)return null;
  {const tf=tutFix();if(tf&&tf.at&&!tutCellsEq(cells,tf.at))return{ok:false,cells,why:'👉 Auf die leuchtenden Felder legen'+(tf&&tf.rot?' (mit ↻ drehen)':'')}}
  if(!fits(state.buildings,cells,key))return{ok:false,cells,why:whyNot(cells,key)};
  {const rw=ruleWhy(state.buildings,cells,key);if(rw)return{ok:false,cells,why:rw}}
  const b={id:-1,key:bldK(key),cells},all=[...state.buildings,b];if(CARDS[key].ed)b.ed=CARDS[key].ed;if(CARDS[key].pr)b.pr=CARDS[key].pr;
  return noRocks(cells,()=>{const r=scoreZoo(all);return{ok:true,cells,r,b,own:r.steps.find(s=>s.id===-1),src:sourcesOf(b,all),brk:breakdown(b,all)}})}
// 0.87a: Vorschau rechnet mit dem Stand nach dem Bauen – Felsen unter dem neuen Gehege/Gebäude (Meilenstein, Sprengmeisterin) sind dann weg
function noRocks(cells,fn){const ks=(cells||[]).map(c=>hk(...c)).filter(k=>TERR.get(k)==='block');if(!ks.length)return fn();for(const k of ks)TERR.delete(k);try{return fn()}finally{for(const k of ks)TERR.set(k,'block')}}
// Test-Szenarien im freien Spiel: je eine Sonderregel fürs Bauen
const RULES={eingang:{icon:'🚪',text:()=>'Am Rand liegt der Eingang 🚪. Das erste Gehege/Gebäude muss ihn berühren, jedes weitere ein schon gebautes oder den Eingang. Beim Umziehen muss alles mit dem Eingang verbunden bleiben.'},
  raub:{icon:'🚫',text:()=>'Raubtiere und Beutetiere dürfen nicht nebeneinander gebaut werden.'},
  rand:{icon:'🧱',gone:1,text:R=>`${HAB[R.hab].icon} ${HAB[R.hab].label}-Gehege dürfen nur gebaut werden, wenn mindestens ein Feld am Rand des Geländes liegt.`}, // 0.93 gestrichen (bleibt für alte Spielstände)
  max3:{icon:'✋',text:()=>'Es dürfen höchstens 3 Gehege desselben Lebensraums zusammenhängend nebeneinander liegen.'}};
applyLang(LANG);
Object.assign(RULES,{
  baum:{icon:'🌳',name:'Baumschutz',text:()=>'Auf Naturflächen dürfen nur passende Gehege stehen. Attraktionen, Gastro-Gebäude und Naturschutz-Gebäude sind dort verboten.'},
  wege:{icon:'🚶',name:'Besucherwege',text:()=>'Jede Attraktion und jedes Gastro-Gebäude braucht mindestens ein freies Nachbarfeld. Du darfst sie auch später nicht ganz zubauen.'},
  halb:{icon:'🚧',name:'Bauabschnitte',text:R=>`Im Frühling ist nur die ${halfDir(R)} Hälfte des Geländes bebaubar (auf dem Gelände markiert). Ab dem Sommer ist alles frei.`},
  achse:{icon:'🚧',name:'Baugrube',text:()=>'5 zusammenhängende Felder sind Baugrube und müssen frei bleiben. Sie sind auf dem Gelände markiert.'}, // 0.85a: früher Sichtachse (6 in einer Linie)
  gross2:{icon:'🏗️',name:'Großbaustelle',text:()=>'Pro Tag darfst du höchstens 2 Karten bauen oder ausbauen, egal wie viele Baupunkte übrig sind. Umziehen zählt nicht mit.'},
  insel:{icon:'🏝️',name:'Inselzoo',text:()=>'Gehege verschiedener Lebensräume dürfen sich nicht berühren. Gebäude dazwischen sind erlaubt.'},
  // neu 0.93 (Planungstabelle Tobi)
  einzel:{icon:'📦',name:'Weniger ist mehr',text:()=>'Jedes Gebäude (Attraktion, Gastro, Naturschutz) darf nur einmal im Zoo stehen. Gehege sind nicht betroffen.'},
  gastro:{icon:'🍽️',name:'Gastronomische Vielfalt',text:()=>'Gastro-Gebäude dürfen nicht direkt nebeneinander liegen.'},
  viertel:{icon:'🎡',name:'Attraktionsviertel',text:()=>'Alle Attraktionen müssen zusammenhängen: Jede neue Attraktion muss an eine schon gebaute grenzen.'},
  grundl:{icon:'🌿',name:'Lebensraum als Grundlage',text:()=>'Gebäude dürfen nur an Gehege <b>eines einzigen</b> Lebensraums grenzen, nie an zwei verschiedene.'},
  anschl:{icon:'🔌',name:'Anschluss',text:()=>'Attraktionen dürfen nur neben ein schon gebautes Gebäude (Attraktion, Gastro oder Naturschutz) gebaut werden.'},
  schutzn:{icon:'🌳',name:'Artenschutz am Naturfeld',text:()=>'Jedes Naturschutz-Gebäude muss an eine Naturfläche (💧🌾🌿🏜️) grenzen.'},
  locker:{icon:'🏚️',name:'Lockere Bebauung',text:()=>'Ein neues Gehege/Gebäude darf an höchstens 3 andere grenzen.'}});
// ===== 0.90a: Auflagen-Kategorien (daten/auflagen.json): Kategorie, Schwierigkeit (Weltreise), Kontinente; neue Limitierungen, Durchmischt, Vorlieben =====
const AUFL_DATEN=/*@@DATEN:auflagen@@*/null,AUFK=AUFL_DATEN.kategorien,AUFA=AUFL_DATEN.auflagen,AUFN=AUFL_DATEN.neu,VORL=AUFL_DATEN.vorlieben;
const aufK=id=>(AUFA[id]||{}).kat||null,aufPasst=(id,k)=>{const A=AUFA[id];if(!A)return false;const ko=A.kont;return ko==='alle'||(ko==='ohne_europa'?k!=='europa':Array.isArray(ko)&&ko.includes(WRALT[k]||k))};
const aufKatHtml=id=>{const K=AUFK[aufK(id)];return K?`<span class="auflk">${K.icon} ${K.name}</span>`:''};
const VORLN={scheu:'scheue Tiere',show:'Showtiere',natur:'Gehege auf passender Naturfläche',ohne_natur:'Gehege ganz ohne passende Naturfläche',gastro:'Gastro-Gebäude',attr:'Attraktionen',ab3:'Gehege ab 3 Feldern',feld1:'Gehege mit 1 Feld',bedroht:'bedrohte Tiere',raubtier:'Raubtiere'};
const VORL_WIRKUNG={scheu:(b,c)=>c.cat==='gehege'&&c.tags.includes('scheu'),show:(b,c)=>c.cat==='gehege'&&c.tags.includes('show'),natur:(b,c)=>c.cat==='gehege'&&!!c.hab&&natCells(b.cells,c.hab)>0,ohne_natur:(b,c)=>c.cat==='gehege'&&!!c.hab&&!natCells(b.cells,c.hab),
  gastro:(b,c)=>c.cat==='essen',attr:(b,c)=>c.cat==='attr',ab3:(b,c)=>c.cat==='gehege'&&b.cells.length>=3,feld1:(b,c)=>c.cat==='gehege'&&b.cells.length===1,bedroht:(b,c)=>c.cat==='gehege'&&c.tags.includes('bedroht'),raubtier:(b,c)=>c.cat==='gehege'&&c.tags.includes('raubtier')};
const vorlRule=()=>{const R=typeof state!=='undefined'&&state&&state.rule;return CTX.zl&&R&&VORL[R.id]?R.id:null};
// Faktoren einer Vorlieben-Auflage für ein Gehege/Gebäude (B und N): [[Name, fa, fs, 1], …]
function vorlOf(b,c){const id=vorlRule();if(!id||!c)return[];const V=VORL[id];return V.regeln.filter(([g])=>VORL_WIRKUNG[g](b,c)).map(([g,f])=>[`${V.icon} ${V.name}: ${VORLN[g]}`,f,f,1])}
for(const id in VORL){const V=VORL[id];RULES[id]={icon:V.icon,name:V.name,vorl:1,text:()=>`Vorliebe der Besucher: ${V.regeln.map(([g,f])=>`${VORLN[g]} zählen ×${mxs(f)}`).join(', ')} (Besucher und Natur).`}}
Object.assign(RULES,{
  show3:{icon:AUFN.show3.icon,name:AUFN.show3.name,text:()=>`Höchstens ${AUFN.show3.n} Showtier-Gehege im Zoo.`},
  raub2:{icon:AUFN.raub2.icon,name:AUFN.raub2.name,text:()=>`Höchstens ${AUFN.raub2.n} Raubtier-Gehege im Zoo.`},
  etat:{icon:AUFN.etat.icon,name:AUFN.etat.name,text:()=>`Pro Shop-Besuch höchstens ${AUFN.etat.n} Käufe. Karten, Futter und Umbauten zählen, Spezialisten nicht.`},
  klein4:{icon:AUFN.klein4.icon,name:AUFN.klein4.name,text:()=>`Höchstens ${AUFN.klein4.n} Gehege mit 4 Feldern im Zoo.`},
  misch:{icon:AUFN.misch.icon,name:AUFN.misch.name,text:()=>'Zwei Gehege desselben Lebensraums dürfen sich nicht berühren.'}});
// Kleiner Etat: Käufe je Shop-Besuch (state.shop.etat)
const etatOn=()=>!!(typeof state!=='undefined'&&state&&state.rule&&state.rule.id==='etat'),etatKind=it=>etatOn()&&(['card','sack','umbau'].includes(it.kind)||(it.kind==='einmal'&&it.key==='futter')),etatLeft=()=>Math.max(0,AUFN.etat.n-((state.shop&&state.shop.etat)||0)),etatAdd=it=>{if(etatKind(it))state.shop.etat=(state.shop.etat||0)+1};
// ===== 0.85a: 🌍 Weltreise-Modus (Plan docs/plan/weltreise.md, Daten daten/kontinente.json) =====
// Lauf mit run.wr: zwischen den Zoos (und vor Zoo 1) wählt man ein Ziel; je Ziel Gelände (vorab erzeugt), Auflage und Belohnung.
const WR_DATEN=/*@@DATEN:kontinente@@*/null,WRL=WR_DATEN.lauf,WRK=WR_DATEN.kontinente,WRLV=Object.fromEntries(Object.entries(AUFA).map(([k,v])=>[k,v.stufe])),WRZ=WR_DATEN.ziel_auflagen,
  WRB=Object.assign({},WR_DATEN.belohnungen.sofort,WR_DATEN.belohnungen.dauerhaft),WRNOW=Object.keys(WR_DATEN.belohnungen.sofort),WRPERM=Object.keys(WR_DATEN.belohnungen.dauerhaft),WRLVN={leicht:'e',mittel:'m',schwer:'h'};
for(const id in WRZ){const Z=WRZ[id];RULES[id]={icon:Z.icon,name:Z.name,wr:1,ziel:1,text:()=>Z.text+' Sonst ist der Zoo gescheitert.'}}
RULES.auswild={icon:'🦓',name:'Auswilderung',wr:1,text:()=>'Am 1. Sommertag und am 1. Herbsttag wird je ein zufälliges Gehege ausgewildert: Das Feld wird frei, die Karte verlässt dein Lauf-Deck.'};
let WRCTX=null; // nur beim Vorab-Erzeugen eines Ziels: {foc, rule, rw, eu}
const wrRun=()=>{try{const r=runOf();return r&&r.wr&&!r.tut?r:null}catch(e){return null}},wrOn=()=>!!wrRun();
// 0.87a: Ziel mit schwerer Auflage → nur leichte Winter-Bedingungen (beim Vorab-Erzeugen über WRCTX, im Zoo über state.rule)
const wrHardRule=()=>{const id=WRCTX?WRCTX.rule:(typeof state!=='undefined'&&state&&state.rule&&state.rule.id);return!!id&&WRLV[id]==='schwer'&&wrOn()};
const wrBon=k=>{if(WRCTX&&WRCTX.rw===k)return true;const r=wrRun();return!!(r&&(r.boni||[]).includes(k))};
const WRREG=WR_DATEN.regionen,WRALT=WR_DATEN.alt||{};
const wrK=k=>WRK.find(x=>x.id===(WRALT[k]||k))||{id:k,icon:'🌍',name:k}; // 0.86a: alte Kontinent-Kennungen aus 0.85a (antarktis, himalaya) zeigen auf den neuen Kontinent
const wrKOf=x=>WRALT[x.k]||x.k; // Kontinent eines Routen-Eintrags/Ziels
// Lauflänge: 4 Zoos, +1 je freigeschaltetem Lebensraum aus lauf.plus (beim Laufstart festgelegt)
const wrGoalN=sl=>WRL.zoos+WRL.plus.filter(h=>{try{return habOpen(sl,h)}catch(e){return false}}).length;
const runGoal=run=>run&&run.wr?(run.wrN||WRL.zoos):CAMP_GOAL;
// Naturflächen: etwa die Hälfte des Feldes, davon 2/3 im Schwerpunkt, Rest gleichmäßig; Europa wie im normalen Modus (18, gleich verteilt)
function wrQuota(m,H){const q={},even=n=>{const b=Math.floor(n/H.length);let r=n-b*H.length;for(const h of H){q[h]=b+(r>0?1:0);if(r>0)r--}return q};
  if(!WRCTX.foc||!H.includes(WRCTX.foc))return even(Math.round(WRL.europa_naturfelder*(d4Now()?.8:1)));
  const N=cnt(m.cells,c=>m.terr.get(hk(...c))!=='block'),n=Math.round(N*WRL.natur_anteil),f=Math.round(n*WRL.schwerpunkt_anteil),rest=H.filter(h=>h!==WRCTX.foc);
  q[WRCTX.foc]=rest.length?f:n;let left=n-f;if(!rest.length)return q;const b=Math.floor(left/rest.length);let r=left-b*rest.length;for(const h of rest){q[h]=b+(r>0?1:0);if(r>0)r--}return q}
const wrNatOf=terr=>{const o={};for(const[,v]of terr||[])if(HAB[v])o[v]=(o[v]||0)+1;return o};
// Auslosung der Ziele: möglichst 3 (ab Stufe 2: 2), nie nur schwere, vor Zoo 1 nur leicht/mittel; Kontinent nur mit gewähltem Schwerpunkt; Europa füllt auf
function wrRollOpts(run){const f=()=>wrRollOpts0(run);run.wrOpts=run.seed?withSeed(run.seed+'|wr|'+run.zoo+'|'+(run.stage||1),f):f();return run.wrOpts}
function wrRollOpts0(run){const sl=activeSlot(),H=run.habs||DEFHABS,n=(run.stage||1)>=2?WRL.ziele_ab_stufe2:WRL.ziele,first=(run.zoo||0)===0,d4=isD4(run),pick=a=>a[Math.floor(Math.random()*a.length)];
  // 0.86a: Ziele sind Regionen; jeder Kontinent höchstens einmal pro Lauf (auch Europa), Ziele einer Wahl von verschiedenen Kontinenten
  const done=new Set((run.wrRoute||[]).filter(x=>x.z<run.zoo).map(wrKOf)),okH=h=>H.includes(h)&&(()=>{try{return habOpen(sl,h)}catch(e){return true}})(),regs=K=>WRREG.filter(r=>r.k===K.id&&r.foki.some(okH)&&(!r.frei||r.frei.some(h=>{try{return habOpen(sl,h)}catch(e){return true}})));
  const C=shuffle(WRK.filter(K=>!K.ruhe&&!done.has(K.id)&&regs(K).length)),EU=WRK.find(K=>K.ruhe);
  // 0.89a: höchstens 2 Ziele mit demselben Schwerpunkt; passt ein Kontinent nicht, kommt der nächste dran, erst zum Schluss Gleichheit zulassen
  const opts=[],fc={};for(const pass of[0,1])for(const K of C){if(opts.length>=n)break;if(opts.some(o=>o.k===K.id))continue;const fr=f=>pass||(fc[f]||0)<2,R1=regs(K).filter(r=>r.foki.some(f=>okH(f)&&fr(f)));if(!R1.length)continue;
    const r=pick(R1),f=pick(r.foki.filter(f=>okH(f)&&fr(f)));opts.push({k:K.id,r:r.id,ort:r.name,foc:f});fc[f]=(fc[f]||0)+1}
  if(EU&&(opts.length<n&&!done.has(EU.id)||!opts.length))opts.push({k:EU.id,foc:null,eu:1,ort:pick(EU.staedte||[EU.name])});
  const R=opts.filter(o=>!o.eu),lvs=first?['leicht','mittel']:['leicht','mittel','schwer'];R.forEach(o=>{o.lv=pick(lvs)});if(R.length&&R.every(o=>o.lv==='schwer'))pick(R).lv=pick(['leicht','mittel']);if(opts.length>=2&&R.length&&R.every(o=>o.lv==='leicht'))pick(R).lv=first?'mittel':pick(['mittel','schwer']); /* 0.88a: nie nur leichte (Europa zählt wie leicht) */
  // 0.90a: nur Auflagen, die zum Kontinent passen; keine Kategorie zweimal pro Lauf (solange eine unbenutzte geht); Schwierigkeit wie gelost (sonst die der Auflage)
  const S=seenOf(run,run.zoo),used=new Set(),uk=new Set([...S.r].map(aufK).filter(Boolean));for(const o of R){const base=Object.keys(WRLV).filter(id=>RULES[id]&&!RULES[id].gone&&!(d4&&id==='locker')&&!used.has(id)&&aufPasst(id,o.k)),
      lvl=base.filter(id=>WRLV[id]===o.lv),kat=L=>L.filter(id=>!uk.has(aufK(id))),fresh=L=>{const f=L.filter(id=>!S.r.has(id));return f.length?f:L},
      okL=base.filter(id=>lvs.includes(WRLV[id])),L=[kat(lvl),kat(okL),lvl,okL,base].find(x=>x.length)||[];o.rule=pick(fresh(L))||null;if(o.rule){used.add(o.rule);o.lv=WRLV[o.rule]||o.lv}}
  // 0.94a: weicht eine Auflage von der gelosten Stufe ab, die Regeln „nie nur leicht“ / „nie nur schwer“ wieder herstellen (gleiche Stufe vor neuer Kategorie)
  {const fix=(o,ls)=>{const c=Object.keys(WRLV).filter(id=>RULES[id]&&!RULES[id].gone&&!(d4&&id==='locker')&&!used.has(id)&&aufPasst(id,o.k)&&ls.includes(WRLV[id]));if(!c.length)return;const nc=c.filter(id=>!uk.has(aufK(id))),id=pick(nc.length?nc:c);used.delete(o.rule);o.rule=id;used.add(id);o.lv=WRLV[id]};
   if(opts.length>=2&&R.length&&R.every(o=>o.lv==='leicht'))fix(pick(R),first?['mittel']:['mittel','schwer']);if(R.length&&R.every(o=>o.lv==='schwer'))fix(pick(R),['leicht','mittel'])}
  const uR=new Set(),food=foodOnRun(run);for(const o of R){if(o.lv==='leicht'){o.rw=null;continue}let L=o.lv==='schwer'?WRPERM.filter(k=>!(run.boni||[]).includes(k)&&!uR.has(k)&&!(k==='boden'&&H.includes('gebirge'))):[]; /* 0.87a: Leichter Boden nicht mit Gebirge */if(!L.length)L=WRNOW.filter(k=>!uR.has(k)&&!(k==='speisekammer'&&!food));o.rw=pick(L)||null;if(o.rw)uR.add(o.rw)}
  run.maps=run.maps||{};for(const o of opts){delete run.maps[run.zoo];WRCTX={foc:o.foc,rule:o.rule||null,rw:o.rw||null,eu:!!o.eu};try{o.plan=rollPlan0(run)}finally{WRCTX=null}o.plan.map=run.maps[run.zoo];o.nat=wrNatOf(o.plan.terr)}delete run.maps[run.zoo];
  return opts}
// Ziel wählen: Plan übernehmen, Belohnung geben (dauerhaft in run.boni, sofort über Geschenke/Auswahl/Förderprogramm), dann Zoo starten
function wrGo(run,a,i){const o=(run.wrOpts||[])[i];if(!o||!o.plan)return;run.plan=o.plan;run.maps=run.maps||{};run.maps[run.zoo]=o.plan.map;
  run.wrDest={k:o.k,r:o.r,ort:o.ort,foc:o.foc||null,rule:o.rule||null,lv:o.lv||null,rw:o.rw||null,nat:o.nat||{},eu:o.eu?1:undefined,z:run.zoo};(run.wrRoute=run.wrRoute||[]).push({k:o.k,r:o.r||undefined,ort:o.ort,z:run.zoo});run.wrOpts=null;
  if(o.rw&&WRPERM.includes(o.rw)){run.boni=run.boni||[];if(!run.boni.includes(o.rw))run.boni.push(o.rw)}
  const G={speisekammer:['gsack','gsack'],bewerber:['gprofi'],bau:['gumb','gumb']}[o.rw];if(G)run.gifts=(run.gifts||[]).concat(G);
  if(o.rw==='mitbringsel'){a.step='wrgift';a.wrCards=wrGiftCards(run);saveMeta();renderScreen();window.scrollTo(0,0);return}
  if(o.rw==='praegung'){a.step='perk';a.wrPerk=1;a.pro=null;a.ppick=null;saveMeta();renderScreen();window.scrollTo(0,0);return}
  wrStart()}
function wrStart(){try{startZoo()}catch(e){logErr('Zoo starten',e);showErr('⚠️ Zoo konnte nicht gestartet werden: '+String(e&&e.message||e).slice(0,120)+' – bitte „📋 Lauf kopieren“ an Claude schicken.')}}
function wrGiftCards(run){const P=zkPools(run);return shuffle(P.rare).slice(0,3)}
// beim Zoo-Start: Partnerschaft = ein zufälliges Förderprogramm gratis
function wrArrive(run){const D=run.wrDest;if(!D||D.z!==run.zoo||!state)return;state.wrDest=D;state.ruleIntro=1;
  if(D.rw==='partner'&&!D.got){D.got=1;const L=Object.keys(PROGS).filter(id=>!PROGS[id].plus&&!state.progs.includes(id)&&!(id.startsWith('pate_')&&!habsNow().includes(id.slice(5))));const id=L[Math.floor(Math.random()*L.length)];if(id){state.progs.push(id);D.prog=id;syncCtx()}}}
// Ziel-Auflagen: Stand und Prüfung (Frist Ende Winter)
function wrGoal(bs){const R=state&&state.rule,Z=R&&WRZ[R.id];if(!Z)return null;bs=bs||state.buildings;const G=bs.filter(b=>CARDS[b.key]&&CARDS[b.key].cat==='gehege'),L=b=>b.lvl||1;let n=0,need=Z.n;
  if(R.id==='z_ausbau')n=cnt(G,b=>L(b)>=2);else if(R.id==='z_vorzeige')n=cnt(G,b=>L(b)>=3);
  else if(R.id==='z_vielfalt'){const H=habsNow();need=H.length;n=cnt(H,h=>cnt(G,b=>CARDS[b.key].hab===h)>=Z.n)}
  else if(R.id==='z_schlemmer')n=cnt(bs,b=>isCat(b,'essen'));else if(R.id==='z_rummel')n=cnt(bs,b=>isCat(b,'attr'));
  else if(R.id==='spflicht'){const f=(state.wrDest||{}).foc;n=cnt(G,b=>CARDS[b.key].hab===f);need=Math.max(1,Math.ceil(G.length/2))} // 0.90a: Hälfte aus dem Schwerpunkt
  else if(R.id==='z_arten')n=cnt(G,b=>(CARDS[b.key].tags||[]).includes('bedroht'));else if(R.id==='z_nachwuchs')n=cnt(G,b=>!!CARDS[b.key].jt)+(state.day===DAYS-1&&state.season===SEASONS.length-1&&state.z2bornD===dayKeyNow()?(state.z2born||[]).length:0); // 0.96a: am letzten Wintertag zählt ein heute geborenes Jungtier
  return{id:R.id,Z,n:Math.min(n,need),need,ok:n>=need,unit:R.id==='z_vielfalt'?' Lebensräume':''}}
const wrBadge=()=>{const G=state&&state.zl&&wrOn()&&wrGoal();if(!G)return'';const bad=state.season===3&&!G.ok;return`<button class="evb wbb wrb${G.ok?' ok':''}${bad?' bad':''}" data-ev="zoo" title="Ziel-Auflage ${G.Z.name}: bis Ende Winter" aria-label="Ziel-Auflage ${G.Z.name}: ${G.n} von ${G.need}">${G.Z.icon} ${G.ok?'✓':G.n+'/'+G.need}</button>`};
// Auswilderung: am 1. Sommer- und 1. Herbsttag (0.87a, vorher Winter) ein zufälliges Gehege weg (Feld frei, Karte aus dem Lauf-Deck)
function wrAuswild(){const R=state&&state.rule;if(!R||R.id!=='auswild'||!wrOn()||state.day!==0||!(state.season===1||state.season===2))return;const dn=state.wrAus=state.wrAus||{};if(dn[state.season])return;dn[state.season]=1;
  const G=state.buildings.filter(b=>CARDS[b.key]&&CARDS[b.key].cat==='gehege'&&!CARDS[b.key].ms);if(!G.length)return;const b=G[Math.floor(Math.random()*G.length)],run=wrRun();
  state.buildings=state.buildings.filter(x=>x!==b);state.undo=[];let out=0;if(run){const L=run.deck.map((k,i)=>[k,i]).filter(([k])=>CARDS[k]&&baseK(k)===baseK(b.key)),hit=L.find(([k])=>(CARDS[k].pr||null)===(b.pr||null)&&!CARDS[k].ed===!b.ed)||L[0];
    if(hit){run.deck.splice(hit[1],1);out=1;(run.wrGone=run.wrGone||[]).push(hit[0])}}
  state.wrAusPop={key:b.key,lvl:b.lvl||1,out};try{syncCtx()}catch(e){}}
const wrAusHtml=A=>{const c=CARDS[A.key];return`<div class="wpi">🦓</div><h3>Auswilderung</h3><p class="wpw">${ic(c)} ${c.name}${A.lvl>1?' '+ROMAN[A.lvl]:''}</p><p class="wpr">Dieses Gehege wurde in die Wildnis entlassen. Das Feld ist wieder frei${A.out?', die Karte hat dein Lauf-Deck verlassen':''}.</p><p class="wph">🌍 Auflage Auswilderung: das passiert am 1. Sommertag und am 1. Herbsttag.</p><button class="btn main" data-bpok>Weiter ▸</button>`};
// Einblendung beim Zoo-Start (ersetzt die Auflage-Einblendung)
function wrWelcomeHtml(){const D=state.wrDest;if(!D)return'';const K=wrK(D.k),R=state.rule&&RULES[state.rule.id],B=D.rw&&WRB[D.rw],perm=B&&WRPERM.includes(D.rw),nat=D.nat||{},tot=Object.values(nat).reduce((a,b)=>a+b,0);
  return`<div class="wpi">${K.icon}</div><h3>${esc(D.ort||K.name)}</h3><p class="wph"><b>Willkommen!</b> ${K.icon} ${K.name} · ${D.foc&&HAB[D.foc]?`Viel ${HAB[D.foc].icon} ${HAB[D.foc].label} im Gelände: ${nat[D.foc]||0} von ${tot} Naturflächen`:`Ruhe-Zoo: ${tot} Naturflächen, gleich verteilt`}</p>
    ${R?`<div class="wrrule"><b>${D.lv?`<span class="wrlv ${WRLVN[D.lv]}">${D.lv}</span> `:''}${R.icon} ${R.name}</b> ${aufKatHtml(state.rule.id)}<br>${R.text(state.rule)}</div>`:'<div class="wrrule">Keine Auflage: Hier darfst du frei bauen.</div>'}
    ${B?`<div class="wrrule rw"><b><span class="wrbt ${perm?'p':'i'}">${perm?'dauerhaft':'sofort'}</span> ${B.icon} ${B.name}</b><br>${B.text}${D.prog&&PROGS[D.prog]?` Diesmal: ${PROGS[D.prog].icon} <b>${PROGS[D.prog].name}</b>.`:''}</div>`:''}
    <button class="btn main" data-bpok>Los geht’s</button>`}
// ===== 0.88a: gezeichnete Weltkarte (Entwurf docs/stil/weltkarte-entwurf.html): Ziele als leuchtende Punkte, besuchte Regionen mit goldener Route =====
const WMX=lon=>(lon+180)*400/360,WMY=lat=>(80-lat)*1.5,WMP=a=>a.map(([lo,la])=>[WMX(lo),WMY(la)]);
// Umrisse [Kennung, Kontinent (für „besucht“ abgedunkelt), Eis?, Punkte]
const WMLAND=[['na','nordamerika',0,[[-165,64],[-150,70],[-125,71],[-100,72],[-82,67],[-62,57],[-56,48],[-70,43],[-76,36],[-81,27],[-97,26],[-90,16],[-84,10],[-95,16],[-106,22],[-117,32],[-124,42],[-125,50],[-138,59],[-155,59]]],
  ['gl','polar',1,[[-55,79],[-30,80],[-20,74],[-30,66],[-43,60],[-52,66],[-58,75]]],
  ['sa','suedamerika',0,[[-79,9],[-62,10],[-50,0],[-35,-6],[-39,-20],[-48,-27],[-57,-35],[-65,-42],[-68,-54],[-74,-50],[-73,-38],[-71,-20],[-80,-5]]],
  ['eu','europa',0,[[-9,38],[-9,44],[-4,48],[5,52],[8,57],[5,62],[15,69],[28,71],[42,67],[45,55],[40,46],[30,41],[24,37],[14,40],[9,44],[3,43],[-2,37]]],
  ['af','afrika',0,[[-16,15],[-17,22],[-9,31],[10,37],[22,32],[32,31],[37,20],[43,12],[51,11],[44,-2],[40,-16],[33,-26],[20,-35],[15,-25],[12,-12],[9,-1],[9,4],[-4,5],[-12,8]]],
  ['as','asien',0,[[45,55],[42,67],[60,71],[80,74],[110,76],[140,72],[170,68],[180,66],[163,60],[155,52],[141,47],[130,42],[126,36],[121,30],[121,23],[110,19],[107,11],[103,2],[99,8],[97,17],[92,22],[88,21],[80,15],[77,8],[72,20],[66,25],[57,25],[52,28],[48,30],[44,38],[38,41],[40,46]]],
  ['ar','asien',0,[[35,31],[43,13],[52,15],[58,22],[56,26],[50,27],[48,30],[40,34]]],
  ['bo','asien',0,[[109,1],[113,6],[118,4],[119,-1],[116,-4],[110,-3]]],['su','asien',0,[[95,5],[102,-1],[106,-6],[103,-5],[97,1]]],
  ['au','australien',0,[[114,-22],[122,-17],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[151,-34],[146,-39],[139,-35],[131,-32],[123,-34],[115,-34],[113,-26]]],
  ['nz','australien',0,[[172,-35],[178,-38],[174,-42],[168,-46],[171,-41]]],['sb','polar',1,[[11,78],[18,80.5],[27,80],[22,77]]],
  ['an','polar',1,[[-180,-66],[-120,-70],[-60,-64],[0,-69],[60,-66],[120,-66],[180,-68],[180,-74],[-180,-74]]]];
function wmSmooth(p){const n=p.length,g=i=>p[(i+n)%n];let d=`M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;for(let i=0;i<n;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2),t=.5/3;
  d+=`C${(p1[0]+(p2[0]-p0[0])*t).toFixed(1)},${(p1[1]+(p2[1]-p0[1])*t).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])*t).toFixed(1)},${(p2[1]-(p3[1]-p1[1])*t).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`}return d+'Z'}
// Lage eines Ziels/Routen-Eintrags: Region (lage) oder Europa-Stadt (staedte_lage); alte 0.85a-Einträge ohne Lage fehlen auf der Karte
function wrLage(x){const r=x.r?WRREG.find(q=>q.id===x.r):WRREG.find(q=>q.name===x.ort);if(r&&r.lage)return r.lage;const K=wrK(x.k);if(K.staedte&&K.staedte_lage){const i=K.staedte.indexOf(x.ort);if(i>=0)return K.staedte_lage[i]}return null}
const wmCurve=(a,b,bend)=>{const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,dx=b[0]-a[0],dy=b[1]-a[1];return`M${a[0].toFixed(1)},${a[1].toFixed(1)} Q${(mx-dy*bend).toFixed(1)},${(my+dx*bend).toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`};
function wrWorldSvg(run,opts,sel){const RT=(run.wrRoute||[]).filter(x=>x.z<(run.zoo||0)),done=new Set(RT.map(wrKOf)),pt=l=>[WMX(l[0]),WMY(l[1])];
  let g=`<defs><radialGradient id="wmSea" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#1d5b6e"/><stop offset="1" stop-color="#164b5c"/></radialGradient></defs><rect width="400" height="228" fill="url(#wmSea)"/>`;
  for(const[x,y]of[[20,120],[70,150],[260,195],[300,40],[160,180],[380,110],[60,95],[230,30]])g+=`<path d="M${x},${y} q4,-3 8,0 t8,0" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.2" stroke-linecap="round"/>`;
  for(const[,,,P]of WMLAND)g+=`<path d="${wmSmooth(WMP(P))}" transform="translate(1.6,2.2)" fill="#0b2c37" opacity=".55"/>`;
  for(const[id,k,ice,P]of WMLAND)g+=`<path class="wml${done.has(k)?' done':''}" data-k="${k}" d="${wmSmooth(WMP(P))}" fill="${ice?'#e4f3f8':'#9cbf8f'}" stroke="#0f3542" stroke-width="1.4" stroke-linejoin="round" opacity="${done.has(k)?.45:1}"/>`;
  const V=RT.map(wrLage).filter(Boolean).map(pt);for(let i=1;i<V.length;i++)g+=`<path d="${wmCurve(V[i-1],V[i],-.2)}" fill="none" stroke="#ffd166" stroke-width="2.4" stroke-dasharray="5 4" stroke-linecap="round"/>`;
  const last=V[V.length-1];
  const OP=opts.map((o,i)=>({o,i,l:wrLage(o)})).filter(x=>x.l);
  if(last)for(const{o,i,l}of OP)g+=`<path d="${wmCurve(last,pt(l),.15)}" fill="none" stroke="#fff" stroke-opacity="${i===sel?.95:.35}" stroke-width="1.6" stroke-dasharray="4 4" stroke-linecap="round"/>`;
  RT.forEach((x,n)=>{const l=wrLage(x);if(!l)return;const[px_,py]=pt(l);g+=`<circle cx="${px_.toFixed(1)}" cy="${py.toFixed(1)}" r="5.5" fill="#ffd166" stroke="#0f3542" stroke-width="1.3"/><text x="${px_.toFixed(1)}" y="${(py+2.6).toFixed(1)}" font-size="7" text-anchor="middle" font-family="Lilita One,sans-serif" fill="#1d2a21">${x.z+1}</text>`});
  for(const{o,i,l}of OP){const[x,y]=pt(l),on=i===sel,col=o.foc&&HAB[o.foc]?`var(--h-${o.foc})`:'#ffffff',lab=esc(o.ort||wrK(o.k).name),w=lab.length*4.4,anc=x-w/2<4?'start':x+w/2>396?'end':'middle',tx=anc==='start'?Math.max(4,x-8):anc==='end'?Math.min(396,x+8):x,ty=y>205?y-15:y+22;
    g+=`<circle class="wpulse" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13" fill="${col}" opacity=".55" pointer-events="none"/><g class="wpin${on?' on':''}" data-wrsel="${i}" tabindex="0" role="button" aria-label="${lab}, ${wrK(o.k).name}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9.5" fill="${col}" stroke="${on?'#ffd166':'#0f3542'}" stroke-width="${on?3.2:1.6}"/><text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" font-size="11" text-anchor="middle">${o.foc&&HAB[o.foc]?HAB[o.foc].icon:wrK(o.k).icon}</text><text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="8.5" text-anchor="${anc}" fill="#fff" font-family="Fredoka,sans-serif" font-weight="600" stroke="#0f3542" stroke-width="2.6" paint-order="stroke">${lab}</text></g>`}
  return`<svg class="wrworld" viewBox="0 0 400 228" role="img" aria-label="Weltkarte mit Reiseroute">${g}</svg>`}
// Kontinent-Wahl (zwischen den Zoos und vor Zoo 1)
function wrPickHtml(run,a,head){if(!run.wrOpts)wrRollOpts(run);const opts=run.wrOpts||[],z=run.zoo||0,N=Math.max(runGoal(run),z+1),sel=a.wrSel!=null&&opts[a.wrSel]?a.wrSel:null,RT=run.wrRoute||[];
  let route='';for(let i=0;i<N;i++){const r=RT.find(x=>x.z===i),cls=i<z?'done':i===z?'now':'';route+=(i?`<i class="wrln${i<=z?' done':''}"></i>`:'')+`<div class="wrst ${cls}"><b>${i<z&&r?wrK(r.k).icon:i===z?i+1:i===N-1?'🏁':i+1}</b><span>${i<z&&r?esc(r.ort||wrK(r.k).name):i===z?'?':'Zoo '+(i+1)}</span></div>`}
  const hc={};for(const k of run.deck){const c=CARDS[k];if(c&&c.cat==='gehege'&&c.hab)hc[c.hab]=(hc[c.hab]||0)+1}
  const B=run.boni||[];
  const card=(o,i)=>{const K=wrK(o.k),pr=o.plan||{},R=o.rule&&RULES[o.rule],Bw=o.rw&&WRB[o.rw],perm=Bw&&WRPERM.includes(o.rw),nat=o.nat||{},hs=Object.keys(nat).sort((x,y)=>(y===o.foc)-(x===o.foc)||nat[y]-nat[x]),tot=hs.reduce((t,h)=>t+nat[h],0);
    const m={cells:pr.cells||[],terr:new Map(pr.terr||[])};
    return`<button class="wrc${sel===i?' sel':''}" data-wrsel="${i}" aria-pressed="${sel===i}"><div class="wrmap">${mapPreviewSvg(m,{gold:pr.gold,crown:pr.crown,entry:pr.rule&&pr.rule.entry,half:pr.rule&&pr.rule.id==='halb'?pr.rule.side:0})}</div>
      <div class="wrnm">${esc(o.ort||K.name)}<small>${K.icon} ${K.name}</small></div>
      <div class="wrnat"><div class="wrbar">${hs.map(h=>`<span style="width:${(nat[h]/Math.max(1,tot)*100).toFixed(1)}%;background:var(--h-${h})"></span>`).join('')}</div><div class="wrnt">Naturflächen ${tot}: ${hs.map(h=>h===o.foc?`<b>${HAB[h].icon} ${nat[h]}</b>`:`${HAB[h].icon} ${nat[h]}`).join(' · ')}</div></div>
      <div class="wrnt">${o.foc&&HAB[o.foc]?`Schwerpunkt <b>${HAB[o.foc].icon} ${HAB[o.foc].label}</b>`:'<b>Ruhe-Zoo</b>: kein Schwerpunkt'}</div>
      <div class="wrrow"><div class="wrbox"><span class="k">Auflage${R&&o.lv?` <span class="wrlv ${WRLVN[o.lv]}">${o.lv}</span>`:''}</span><span class="v">${R?R.icon+' '+R.name:'keine'}</span>${R?aufKatHtml(o.rule):''}<span class="t">${R?withRot(false,()=>R.text(pr.rule||{id:o.rule})):'Hier darfst du frei bauen.'}</span></div>
        <div class="wrbox rw${Bw?'':' none'}"><span class="k">Belohnung${Bw?` <span class="wrbt ${perm?'p':'i'}">${perm?'dauerhaft':'sofort'}</span>`:''}</span><span class="v">${Bw?Bw.icon+' '+Bw.name:'keine'}</span><span class="t">${Bw?Bw.text:o.eu?'Ruhe-Zoo ohne Auflage.':'Dafür eine leichte Auflage.'}</span></div></div></button>`};
  const so=sel!=null?{icon:wrK(opts[sel].k).icon,name:opts[sel].ort||wrK(opts[sel].k).name}:null;
  return`${head||''}<h2 class="wrh">🌍 Wohin geht die Reise?</h2><p class="wrsub">Zoo ${z+1} von ${N} · tippen zum Auswählen</p>
    <div class="wrstrip"><b>Deine Gehege-Karten</b>${Object.keys(HAB).filter(h=>hc[h]).sort((x,y)=>hc[y]-hc[x]).map(h=>`<span class="wrchip">${HAB[h].icon} ${hc[h]}</span>`).join('')||'<span class="wrchip">keine</span>'}</div>${(()=>{const D=deckMixData(run.deck),ch=L=>L.map(([i,t,v])=>`<span class="wrchip" title="${t}">${i} ${v}</span>`).join(''),G=[D.mk,D.gb,D.gr].filter(x=>x.length);return G.length?`<div class="wrstrip"><b>Deine Tiere und Gebäude</b>${G.map(ch).join('<i class="wrsep" aria-hidden="true">·</i>')}</div>`:''})()}
    <div class="wrstrip"><b>Deine Boni</b>${B.length?B.map(k=>`<span class="wrchip">${WRB[k].icon} ${WRB[k].name}</span>`).join(''):'<span class="wrchip">noch keine</span>'}</div>
    <div class="wrlay"><div class="wrmapbox">${wrWorldSvg(run,opts,sel)}<div class="wrleg"><span><i class="lv"></i>besucht</span><span><i class="lo"></i>zur Wahl</span></div></div>
    <div class="wrside">${sel!=null?`<div class="wropts">${card(opts[sel],sel)}</div>`:'<p class="wrtap">👆 Tippe auf einen leuchtenden Ort auf der Karte.</p>'}
    <button class="btn main big" data-wrgo="1" ${sel==null?'disabled':''}>${so?`Nach ${so.name} reisen ${so.icon}`:'Ziel wählen'}</button></div></div>${a.first?(ZSTART?'<button class="btn sub" data-wrback="1">◂ Zurück</button>':'')+'<button class="btn sub" data-go="title">Später weiterspielen</button>':'<button class="btn sub" data-go="title">Später weiterspielen</button>'}`}
// auf dem Handy ist das Gelände gedreht: aus links/rechts wird oben/unten
const halfDir=R=>ROT?(R.side<0?'obere':'untere'):(R.side<0?'linke':'rechte');
const halfMid=cells=>{const v=cells.map(([q,r])=>q+r/2).sort((a,b)=>a-b);return v.length?(v[(v.length-1)>>1]+v[v.length>>1])/2:0};
const halfOk=(R,q,r)=>{if(R.mid==null)R.mid=halfMid(BOARD);return R.side*(q+r/2-R.mid)>=0},ruleFree=(k,idx)=>ONBOARD.has(k)&&TERR.get(k)!=='block'&&!idx.has(k);

const VLEN=5;
function panoGen(){const E=BOARD.map(([q,r])=>hk(q,r)).filter(k=>{const[q,r]=k.split(',').map(Number);return isEdge(q,r)&&TERR.get(k)!=='block'});if(!E.length)return[];const goal=Math.ceil(E.length/3),Es=new Set(E),S=new Set(),nseg=E.length>=18?3:2,per=Math.ceil(goal/nseg),pool=shuffle(E.slice()),nbK=k=>{const[q,r]=k.split(',').map(Number);return DIRS.map(([dq,dr])=>hk(q+dq,r+dr))};
  for(let sg=0;sg<nseg&&S.size<goal;sg++){const st=pool.find(k=>!S.has(k)&&!nbK(k).some(n=>S.has(n)));if(!st)break;const Q=[st];let c=0;while(Q.length&&c<per&&S.size<goal){const k=Q.shift();if(S.has(k))continue;S.add(k);c++;for(const n of nbK(k))if(Es.has(n)&&!S.has(n))Q.push(n)}}return[...S]}
const panoSet=()=>{const Z=typeof state!=='undefined'&&state&&state.zl;if(!Z)return new Set();if(!Z.pano)Z.pano=panoGen();return new Set(Z.pano)};
const isEdge=(q,r)=>DIRS.some(([dq,dr])=>!ONBOARD.has(hk(q+dq,r+dr)));
function initRule(){const R=state.rule;if(!R||!RULES[R.id]){state.rule=null;return}
  // 0.80a: Eingang nur an Randfeldern mit mindestens 2 bebaubaren Nachbarn (Naturflächen zählen, Felsen nicht); sonst Felsen daneben entfernen
  if(R.id==='eingang'){const ok=(q,r)=>ONBOARD.has(hk(q,r))&&TERR.get(hk(q,r))!=='block',nf=(q,r)=>DIRS.filter(([dq,dr])=>ok(q+dq,r+dr)).length,pot=(q,r)=>DIRS.filter(([dq,dr])=>ONBOARD.has(hk(q+dq,r+dr))).length;
    const c0=BOARD.filter(([q,r])=>isEdge(q,r)&&!TERR.get(hk(q,r))),c1=c0.filter(([q,r])=>nf(q,r)>=2),c2=c0.filter(([q,r])=>pot(q,r)>=2),c=c1.length?c1:c2.length?c2:c0;R.entry=(c.length?c:BOARD)[Math.floor(Math.random()*(c.length||BOARD.length))].slice();
    if(!c1.length){const[q,r]=R.entry;for(const[dq,dr]of DIRS){if(nf(q,r)>=2)break;const k=hk(q+dq,r+dr);if(ONBOARD.has(k)&&TERR.get(k)==='block')TERR.delete(k)}}}
  if(R.id==='rand'){const hs=habsNow().slice();R.hab=hs[Math.floor(Math.random()*hs.length)]}
  if(R.id==='halb'){R.side=Math.random()<.5?-1:1;R.mid=halfMid(BOARD)}
  // 0.85a: Baugrube (früher Sichtachse): 5 zusammenhängende freie Felder, möglichst mittig und ohne Naturflächen
  if(R.id==='achse'){const ok=k=>ONBOARD.has(k)&&TERR.get(k)!=='block',nbK=k=>{const[q,r]=k.split(',').map(Number);return DIRS.map(([dq,dr])=>hk(q+dq,r+dr))},n0=BOARD.length;let cx=0,cy=0;for(const c of BOARD){const[x,y]=axXY(...c);cx+=x;cy+=y}cx/=n0;cy/=n0;
    const dist=k=>{const[x,y]=axXY(...k.split(',').map(Number));return Math.hypot(x-cx,y-cy)},grow=(st,plain)=>{const S=[st];for(let g=0;g<80&&S.length<5;g++){const c=nbK(S[Math.floor(Math.random()*S.length)]).filter(n=>ok(n)&&!S.includes(n)&&(!plain||!TERR.get(n)));if(c.length)S.push(c[Math.floor(Math.random()*c.length)])}return S.length===5?S:null};
    const cand=BOARD.map(c=>hk(...c)).filter(ok).sort((a,b)=>dist(a)+Math.random()*2.5-dist(b)-Math.random()*2.5);let ax=null;
    for(const plain of[true,false]){for(const st of cand){if(plain&&TERR.get(st))continue;ax=grow(st,plain);if(ax)break}if(ax)break}
    if(ax){R.ax=ax;R.row=null}}
  state.infoProg='rule'}
function habGroup(b,bs){const h=CARDS[b.key].hab,idx=mkIndex(bs),seen=new Set([b]),st=[b];while(st.length){const x=st.pop();for(const n of nbrs(x,idx))if(!seen.has(n)&&CARDS[n.key].cat==='gehege'&&CARDS[n.key].hab===h){seen.add(n);st.push(n)}}return seen.size}
function entryCut(bs,ids){const R=state.rule,ek=hk(...R.entry),idx=mkIndex(bs),seen=new Set(),st=[];for(const b of bs)if(b.cells.some(([q,r])=>DIRS.some(([dq,dr])=>hk(q+dq,r+dr)===ek))){seen.add(b);st.push(b)}while(st.length){const x=st.pop();for(const n of nbrs(x,idx))if(!seen.has(n)){seen.add(n);st.push(n)}}if(ids)for(const b of bs)if(!seen.has(b))ids.push(b.id);return bs.length-seen.size}
function ruleWhy(bs,cells,key,isMove){const R=state&&state.rule;if(!R)return null;const c=CARDS[key],T=c.tags||[],fake={key,cells},idx=mkIndex(bs),nb=nbrs(fake,idx);
  if(R.id==='eingang'){const ek=hk(...R.entry);if(cells.some(([q,r])=>hk(q,r)===ek))return'Hier ist der Eingang 🚪, der bleibt frei.';
    const te=cells.some(([q,r])=>DIRS.some(([dq,dr])=>hk(q+dq,r+dr)===ek));
    if(!bs.length&&!te)return'Sonderregel: Das erste Gehege/Gebäude muss am Eingang 🚪 stehen.';if(!te&&!nb.length)return'Sonderregel: Hier grenzt nichts an. Baue direkt neben ein Gehege/Gebäude oder den Eingang 🚪.'}
  if(R.id==='raub'){if(T.includes('raubtier')&&nb.some(n=>has(n,'beute')))return'Sonderregel: Raubtiere dürfen nicht neben Beutetieren stehen.';if(T.includes('beute')&&nb.some(n=>has(n,'raubtier')))return'Sonderregel: Beutetiere dürfen nicht neben Raubtieren stehen.'}
  if(R.id==='rand'&&c.cat==='gehege'&&c.hab===R.hab&&!cells.some(([q,r])=>isEdge(q,r)))return`Sonderregel: ${HAB[R.hab].label}-Gehege brauchen mindestens ein Feld am Rand.`;
  if(R.id==='baum'&&c.cat!=='gehege'&&cells.some(([q,r])=>{const t=TERR.get(hk(q,r));return t&&t!=='block'}))return'Auflage Baumschutz: Auf Naturflächen dürfen nur passende Gehege stehen.';
  if(R.id==='wege'){const all=mkIndex([...bs,fake]),free=b=>b.cells.some(([q,r])=>DIRS.some(([dq,dr])=>ruleFree(hk(q+dq,r+dr),all))),walk=x=>x==='attr'||x==='essen';
    if(walk(c.cat)&&!free(fake))return'Auflage Besucherwege: Hier bliebe kein freies Nachbarfeld.';const shut=nb.find(n=>walk(CARDS[n.key].cat)&&!free(n));if(shut)return`Auflage Besucherwege: ${CARDS[shut.key].name} hätte dann kein freies Nachbarfeld mehr.`}
  if(R.id==='halb'&&state.season===0&&!cells.every(([q,r])=>halfOk(R,q,r)))return`Auflage Bauabschnitte: Im Frühling ist nur die ${halfDir(R)} Hälfte bebaubar.`;
  if(R.id==='achse'&&cells.some(([q,r])=>R.ax?R.ax.includes(hk(q,r)):r===R.row))return'Auflage Baugrube: Diese Felder müssen frei bleiben.';
  if(R.id==='gross2'&&!isMove&&state.builtToday>=2)return'Auflage Großbaustelle: Heute hast du schon 2 Karten gebaut.';
  if(R.id==='insel'&&c.cat==='gehege'&&nb.some(n=>CARDS[n.key].cat==='gehege'&&CARDS[n.key].hab!==c.hab))return'Auflage Inselzoo: Gehege verschiedener Lebensräume dürfen sich nicht berühren.';
  if(R.id==='einzel'&&key!=='flossteil'&&c.cat!=='gehege'&&!c.ms&&bs.some(b=>sameArt(b.key,key)))return`Auflage Weniger ist mehr: ${c.name} steht schon im Zoo.`;
  if(R.id==='gastro'&&c.cat==='essen'&&nb.some(n=>isCat(n,'essen')))return'Auflage Gastronomische Vielfalt: Gastro-Gebäude dürfen nicht nebeneinander liegen.';
  if(R.id==='viertel'&&key!=='flossteil'&&c.cat==='attr'&&bs.some(b=>isCat(b,'attr'))&&!nb.some(n=>isCat(n,'attr')))return'Auflage Attraktionsviertel: Die neue Attraktion muss an eine schon gebaute grenzen.';
  if(R.id==='grundl'){const ix2=mkIndex([...bs,fake]),hs=x=>new Set(nbrs(x,ix2).filter(n=>isCat(n,'gehege')).map(n=>CARDS[n.key].hab));
    if(c.cat!=='gehege'&&hs(fake).size>1)return'Auflage Lebensraum als Grundlage: Ein Gebäude darf nur an Gehege <b>eines</b> Lebensraums grenzen.';
    if(c.cat==='gehege'){const bad=nb.find(n=>!isCat(n,'gehege')&&hs(n).size>1);if(bad)return`Auflage Lebensraum als Grundlage: ${CARDS[bad.key].name} grenzte dann an zwei Lebensräume.`}}
  if(R.id==='anschl'&&key!=='flossteil'&&c.cat==='attr'&&!nb.some(n=>!isCat(n,'gehege')))return'Auflage Anschluss: Attraktionen nur neben ein schon gebautes Gebäude.';
  if(R.id==='schutzn'&&c.cat==='schutz'&&!cells.some(([q,r])=>DIRS.some(([dq,dr])=>{const t=TERR.get(hk(q+dq,r+dr));return!!t&&t!=='block'})))return'Auflage Artenschutz am Naturfeld: Naturschutz-Gebäude müssen an eine Naturfläche grenzen.';
  if(R.id==='locker'&&nb.length>3)return'Auflage Lockere Bebauung: Hier grenzten mehr als 3 Gehege/Gebäude an.';
  // 0.90a: neue Limitierungen und Durchmischt
  if(R.id==='show3'&&c.cat==='gehege'&&T.includes('show')&&cnt(bs,b=>isCat(b,'gehege')&&has(b,'show'))>=AUFN.show3.n)return`Auflage ${AUFN.show3.name}: Es stehen schon ${AUFN.show3.n} Showtiere im Zoo.`;
  if(R.id==='raub2'&&c.cat==='gehege'&&T.includes('raubtier')&&cnt(bs,b=>isCat(b,'gehege')&&has(b,'raubtier'))>=AUFN.raub2.n)return`Auflage ${AUFN.raub2.name}: Es stehen schon ${AUFN.raub2.n} Raubtiere im Zoo.`;
  if(R.id==='klein4'&&c.cat==='gehege'&&cells.length>=4&&cnt(bs,b=>isCat(b,'gehege')&&b.cells.length>=4)>=AUFN.klein4.n)return`Auflage ${AUFN.klein4.name}: Es stehen schon ${AUFN.klein4.n} Gehege mit 4 Feldern im Zoo.`;
  if(R.id==='misch'&&c.cat==='gehege'&&c.hab&&nb.some(n=>isCat(n,'gehege')&&K(n).hab===c.hab))return`Auflage Durchmischt: Zwei ${HAB[c.hab].label}-Gehege dürfen sich nicht berühren.`;
  if(R.id==='max3'&&c.cat==='gehege'&&habGroup(fake,[...bs,fake])>3)return`Sonderregel: Höchstens 3 ${HAB[c.hab].label}-Gehege dürfen zusammenhängen.`;
  return null}
function ruleOverlay(){const R=state.rule;if(!R)return'';let o='';
  if(R.id==='eingang'){const[x,y]=px(...R.entry);o+=`<polygon class="rentry" points="${hexPts(x,y,SZ*.92)}" pointer-events="none"/><text class="tic rdoor" x="${x}" y="${y}">🚪</text>`}
  const key=state.moving==null&&state.selected!=null?state.hand[state.selected]:null,c=key&&CARDS[key],act=!!c&&state.phase==='play';
  if(R.id==='achse'){const occ=mkIndex(state.buildings);for(const[q,r]of BOARD)if((R.ax?R.ax.includes(hk(q,r)):r===R.row)&&TERR.get(hk(q,r))!=='block'){const[x,y]=px(q,r);o+=`<polygon class="raxis0" points="${hexPts(x,y,SZ*.86)}" pointer-events="none"/><polygon class="raxis" points="${hexPts(x,y,SZ*.86)}" pointer-events="none"/>${occ.has(hk(q,r))?'':`<text class="tic raxe" x="${x}" y="${y}">🚧</text>`}`}}
  if(R.id==='halb'&&state.season===0)for(const[q,r]of BOARD)if(!halfOk(R,q,r)&&TERR.get(hk(q,r))!=='block'){const[x,y]=px(q,r);o+=`<polygon class="rdim" points="${hexPts(x,y,SZ*.92)}" pointer-events="none"/>`}
  if(!act&&R.id!=='eingang')return o;
  const idx=mkIndex(state.buildings),T=c?c.tags||[]:[],ek=R.entry?hk(...R.entry):null,gh=c&&c.cat==='gehege';
  for(const[q,r]of BOARD){const k=hk(q,r);if(idx.has(k)||TERR.get(k)==='block'||k===ek)continue;let cls='';
    const nb=[...new Set(DIRS.map(([dq,dr])=>idx.get(hk(q+dq,r+dr))).filter(Boolean))];
    if(R.id==='eingang'){const ok=nb.length||DIRS.some(([dq,dr])=>hk(q+dq,r+dr)===ek);cls=ok?(act?'rgo':'rgo thin'):(act?'rdim':'')}
    else if(R.id==='raub'){if((T.includes('raubtier')&&nb.some(n=>has(n,'beute')))||(T.includes('beute')&&nb.some(n=>has(n,'raubtier'))))cls='rno'}
    else if(R.id==='rand'){if(gh&&c.hab===R.hab)cls=isEdge(q,r)?'rgo':'rdim'}
    else if(R.id==='baum'){if(!gh&&TERR.get(k))cls='rno'}
    else if(R.id==='insel'){if(gh&&nb.some(n=>CARDS[n.key].cat==='gehege'&&CARDS[n.key].hab!==c.hab))cls='rno'}
    else if(R.id==='max3'){if(gh&&nb.some(n=>CARDS[n.key].cat==='gehege'&&CARDS[n.key].hab===c.hab&&habGroup(n,state.buildings)>=3))cls='rno'}
    if(cls){const[x,y]=px(q,r);o+=`<polygon class="${cls}" points="${hexPts(x,y,SZ*.86)}" pointer-events="none"/>`}}
  return o}
let REXP=false;
const ruleInfoHtml=()=>{const R=state.rule,D=RULES[R.id];return`<button class="rule1" data-rexp="1">${D.icon} <span>${state.zl?'Auflage':'Sonderregel'}: <b>${D.name}</b></span> <i>${REXP?'▴':'▾'}</i></button>`+(REXP?`<p class="hint">${D.text(R)}</p><p class="hint">${state.zl?'Auflage für diesen Zoo.':'Test-Szenario im freien Spiel. Der Highscore landet in einer eigenen Liste.'}</p>`:'')};
function zlDead(b,bs,peek){const Z=state.zl;if(!Z)return null;const c=CARDS[b.key];
  const e=Z.insp&&!inspHid()&&(CTX.winter||peek)&&inspFx(b,c,nbrs(b,mkIndex(bs)),bs,Z);if(e){if(e.fs!=null)return e.fs<1?'half':null;if(e.f===0)return'insp';if(e.f<1)return'half';if(e.f>1)return'good'}return null}
const edN=(b,e)=>(b.ed||'').split(e).length-1,edIcons=ed=>[...(ed||'')].map(e=>EDS[e].icon).join('');
function edCard(b){const c=K(b);if(!b.ed)return c;const fx=[];for(const e of'gsr'){const n=edN(b,e);if(!n)continue;fx.push(e==='g'?`×${mxs(+(pctF(.25)**n).toFixed(2))} B|🪙 Gold-Ausgabe${n>1?' ×'+n:''}`:e==='s'?`×${n+1}|✨ Schimmernd${n>1?' ×'+n:''}: das Gehege/Gebäude zählt ${n+1}-fach`:`×${String(+Math.pow(1.2,n).toFixed(2)).replace('.',',')} B|🌈 Regenbogen${n>1?' ×'+n:''}: für den ganzen Zoo`)}
  return derive(c,{name:c.name+' '+edIcons(b.ed),fx:[...fx,...(c.fx||[])]})}
// was ein Gebäude seinen Nachbarn bringt (auch wenn es selbst nicht zählt)
function giveOf(b,bs){const bs2=bs.filter(x=>x!==b),i1=mkIndex(bs),i2=mkIndex(bs2);let ga=0,gs=0;for(const n of nbrs(b,i1)){const v1=evalB(n,bs,i1),v2=evalB(n,bs2,i2);ga+=v1.a-v2.a;gs+=v1.s-v2.s}return{a:ga,s:gs}}
const deadWhy=dd=>dd==='prof'?'Großwildpark':INSP[state.zl.insp].name;
function zlNote(h,c){const Z=state.zl;if(!Z)return'';let o='';
  if(h.up){if(c.ed)o+=`<p class="resgood">${EDS[c.ed].icon} Veredelung kommt dazu: ${EDS[c.ed].name} (${EDS[c.ed].text})${h.up.ed?' · bisher '+edIcons(h.up.ed):''}</p>`;return o}
  if(h.move)return o;
  if(Z.crown&&h.cells.some(([q,r])=>hk(q,r)===Z.crown))o+=c.cat==='gehege'&&h.cells.length>=4?'<p class="resbad" style="color:#d9b3ff;background:#b06cff22">👑 Kronenfeld aktiv: ×1,3 Besucher für den ganzen Zoo.</p>':'<p class="resbad">👑 Achtung: Das verbaut das Kronenfeld. Der Bonus braucht ein Gehege mit 4 Feldern und ist sonst für diesen Zoo weg.</p>';
  if(h.b){const all=[...state.buildings,h.b],I=Z.insp&&!inspHid()&&INSP[Z.insp],e=I&&inspFx(h.b,CARDS[h.b.key],nbrs(h.b,mkIndex(all)),all,Z),dead=e&&e.f===0,g=dead?giveOf(h.b,all):null,gt=g&&(g.a||g.s)?`, gibt den Nachbarn aber <b>${vTxt(g.a,g.s)}</b>`:'',w=CTX.winter?'jetzt':'im Winter';
    if(e)o+=e.a?`<p class="reswin">❄️ ${I.name}: ${w} ${e.a} B.</p>`:e.fs!=null?`<p class="reswin">❄️ ${I.name}: bringt ${w} nur ${e.fs===.5?'die halbe':Math.round(e.fs*100)+' % der'} Natur.</p>`:dead?`<p class="reswin">❄️ Zählt ${w} selbst nicht (${I.name})${gt}. Bauen geht trotzdem.</p>`:e.f<1?`<p class="reswin">❄️ ${I.name}: zählt ${w} nur ${e.f===.5?'die Hälfte':Math.round(e.f*100)+' %'}${e.l?' ('+e.l+')':''}.</p>`:`<p class="resgood">🥇 ${I.name}: zählt ${w} ${e.f===2?'doppelt':String(e.f).replace('.',',')+'-fach'}.</p>`;
    if(c.cat==='gehege'&&!(state.rule&&state.rule.id==='max3')){const p0=zlPurity(state.buildings,mkIndex(state.buildings)),p1=zlPurity(all,mkIndex(all)),x=n=>'×'+String(+purF(n).toFixed(2)).replace('.',',');if(p1.n>(p0.n||0)&&p1.n>=PURN-2)o+=p1.n<PURN?`<p class="resgood">🧬 Reinheit: ${p1.n} von ${PURN} verschiedenen ${HAB[p1.hab].label}-Arten zusammen. Ab ${PURN} gibt es ×1,15 Natur für den Zoo.</p>`:`<p class="resgood">🧬 Reinheit: ${p1.n} verschiedene ${HAB[p1.hab].label}-Arten zusammen · ${p0.n>=PURN?x(p0.n)+' → ':''}${x(p1.n)} Natur für den Zoo.</p>`}}
  if(h.b&&h.b.key==='flossteil'&&hasSpec('floss')){const n0=flossLen(state.buildings),n1=flossLen([...state.buildings,h.b]);o+=n1>n0?`<p class="resgood">🛶 Floß-Strecke ${n0} → ${n1} · ×${String(+(1+.1*n1).toFixed(2)).replace('.',',')} B für den Zoo</p>`:`<p class="hint" style="color:#ffd88a">🛶 Nicht an der längsten Strecke (${n0} Teile) – zählt nur, wenn sie länger wird</p>`}
  if(h.b&&c.cat==='gehege'){const all=[...state.buildings,h.b],v0=vielfalt(state.buildings),v1=vielfalt(all),fx=f=>'×'+String(+f.toFixed(2)).replace('.',','),nx=Math.max(2,v0.lvl+1);
    if(v1.f>v0.f)o+=`<p class="resgood">🎨 Vielfalt: ${v0.f>1?fx(v0.f)+' → ':''}${fx(v1.f)} Natur für den Zoo (alle Lebensräume, je ${v1.lvl}+ Arten)</p>`;
    else if(v0.lvl<5){const a=v0.per.filter(x=>x>=nx).length,b=v1.per.filter(x=>x>=nx).length;if(b>a){const miss=v1.habs.map((h,i)=>v1.per[i]<nx?`${HAB[h].icon} ${HAB[h].label} ${v1.per[i]}/${nx}`:null).filter(Boolean).join(', ');o+=`<p class="hint" style="color:#ffd88a">🎨 Vielfalt ${v0.f>1?'('+fx(v0.f)+') steigt noch nicht':'noch nicht aktiv'} · fehlt: ${miss} Arten · dann ${fx(1+.05*nx)} Natur</p>`}}}
  if(h.b){const all=[...state.buildings,h.b],s0=zooStress(state.buildings),s1=zooStress(all);if(s1!==s0)o+=`<p class="${s1>s0?'resbad':'resgood'}">😣 Stress: ${s1>s0?'+':'−'}${Math.abs(s1-s0)} gestresste${Math.abs(s1-s0)===1?'s':''} Tier${Math.abs(s1-s0)===1?'':'e'} → ${s1} im Zoo (Zoo ×${mxs(1-Math.min(STRMAX,s1*STRZ))} Natur)</p>`}
  if(h.b&&c.cat==='gehege'&&(CTX.spec||[]).includes('sammler')){const hs=bs=>new Set(bs.filter(n=>isCat(n,'gehege')).map(n=>K(n).hab)).size;if(hs(state.buildings)<4&&hs([...state.buildings,h.b])>=4)o+='<p class="resgood">🧬 Sammlerin aktiv: Jetzt hat dein Zoo alle Lebensräume, jedes Gehege bekommt +1 N.</p>'}
  return o}
const zlTypeName=t=>MILE[t]?MILE[t].label:t;
// Gelände mit Felsen, Naturflächen und Sonderfeldern
function zlTerrTile(box){const Z=state.zl,M=MAPS[state.map],tc=t=>[...TERR.values()].filter(v=>v===t).length,rocks=tc('block'),nat=Object.keys(HAB).map(h=>[h,tc(h)]).filter(x=>x[1]);
  const natT=nat.map(([h,n])=>`${HAB[h].icon} ${n}`).join(' '),sf=Z?' · 3 ★ · 1 👑':'';
  return box('zm',M?M.icon:'🗺️','Gelände: '+(M?M.name:''),(M?M.text+' ':'')+(rocks?`${rocks} Felsen.`:'Keine Felsen.')+(nat.length?' Naturflächen: '+nat.map(([h,n])=>`${n} ${HAB[h].label}`).join(', ')+'.':'')+(Z?'<br><b>★ ×2:</b> Das Gehege/Gebäude auf einem goldenen Feld zählt doppelt (3 Felder).<br><b>👑 ×1,3:</b> Besucher für den ganzen Zoo, wenn auf dem Kronenfeld ein Gehege mit 4 Feldern steht.':''),`${rocks} Felsen${sf}`)}
// gleiche Gehege/Gebäude leuchten, solange eine passende Handkarte ausgewählt ist
const lockTxt=k=>costOf(k)>state.bpMax?`<p class="resbad">🔒 Zu teuer: braucht ${costOf(k)} BP, du hast höchstens ${state.bpMax} pro Tag. Mehr gibt es mit 🧱 Saison-Bautrupp oder dem Polier.</p>`:'';
function twinMarks(){if(state.selected==null||state.phase!=='play')return'';const k=state.hand[state.selected];if(!k)return'';const bk=baseK(k);let o='';const v=ZOOM?viewNow():null;
  for(const b of state.buildings)if(sameArt(b.key,bk)){const[cx,cy]=centroid(b.cells),up=!CARDS[k].ms&&(b.lvl||1)<MAXLVL;o+=`<g class="twing glow" pointer-events="none">${shapeSvg(b.cells)}</g><g class="twing" pointer-events="none">${shapeSvg(b.cells)}</g><text class="twinl" x="${cx}" y="${(cy-(b.cells.length>1?9.5:7.5)).toFixed(2)}" pointer-events="none">${up?'🔁 Ausbauen?':'🔁 schon da'}</text>`;
    if(v&&(cx<v[0]||cx>v[0]+v[2]||cy<v[1]||cy>v[1]+v[3])){const m=7,ax=Math.max(v[0]+m,Math.min(v[0]+v[2]-m,cx)),ay=Math.max(v[1]+m,Math.min(v[1]+v[3]-m,cy)),an=Math.atan2(cy-ay,cx-ax)*180/Math.PI;o+=`<g class="twina" pointer-events="none" transform="translate(${ax.toFixed(2)},${ay.toFixed(2)}) rotate(${an.toFixed(1)})"><circle r="4.2"/><path d="M-1.8,-2.2L2.6,0L-1.8,2.2Z"/></g>`}}return o}
// 0.63a: Gehege, die eine Gruppen-Regel brechen (Klumpen, ganz innen, außerhalb Nordhälfte), rot gestrichelt umranden (auch in der Vorschau)
let LASTH=null;function hvioMarks(){if(!habRulesOn())return'';try{const h=LASTH&&LASTH.ok&&LASTH.b&&!LASTH.up?LASTH:null,all=h?(h.move?state.buildings.map(x=>x.id===h.move.id?h.b:x):[...state.buildings,h.b]):state.buildings,ix=mkIndex(all);let o='';
  for(const b of all){if(!isCat(b,'gehege')||!HABBRK[K(b).hab]||!habViol(b,ix)||grpList(b,ix,K(b).hab).length<2)continue;for(const[q,r]of b.cells){const[x,y]=px(q,r);o+=`<polygon class="hvio" points="${hexPts(x,y,SZ*.9)}" pointer-events="none"/>`}}return o}catch(e){return''}}
// 0.81a: ❄️-Schilder ab dem Herbst: was die Winter-Bedingung trifft (im Herbst blau als Vorschau, im Winter rot bei Abzügen)
function winterMarks(idx){if(!state||!state.zl||!winterSee()||inspHid())return'';let o='',pat=false;const bs=state.buildings,pre=(state.season||0)<3,two=HARD(state.zl);
  // 0.94a: Frost statt Schilder: eisblauer Rand an den Außenkanten, im Winter heller Reif, ❄️ am ersten Feld (verschärft ❄️❄️); im Herbst nur gestrichelt. Vorteile (z. B. König) behalten ihr Schild.
  for(const b of bs){if(b.id===state.moving)continue;const h=winterHit(b,bs,idx);if(!h)continue;const[cx,cy]=centroid(b.cells);
    if(!h.neg){const t='❄️'+h.t,w=(t.length-1)*2.5+5,y=cy-(b.cells.length>1?5:4.2);o+=`<g class="trl wnt pos"><rect x="${(cx-w/2).toFixed(2)}" y="${(y-3.1).toFixed(2)}" width="${w.toFixed(2)}" height="6.2" rx="3.1"/><text x="${cx.toFixed(2)}" y="${y.toFixed(2)}">${t}</text></g>`;continue}
    const set=new Set(b.cells.map(([q,r])=>hk(q,r)));let d='';
    for(const[q,r]of b.cells){const[x,y]=px(q,r);if(!pre){pat=true;o+=`<polygon class="frostf" points="${hexPts(x,y,SZ*.93)}"/>`}
      for(const[dq,dr]of DIRS){if(set.has(hk(q+dq,r+dr)))continue;const[x2,y2]=px(q+dq,r+dr),mx=(x+x2)/2,my=(y+y2)/2,L=Math.hypot(x2-x,y2-y)||1,ux=-(y2-y)/L*SZ*.47,uy=(x2-x)/L*SZ*.47,k=.93;d+=`M${(x+(mx-x)*k+ux).toFixed(2)} ${(y+(my-y)*k+uy).toFixed(2)}L${(x+(mx-x)*k-ux).toFixed(2)} ${(y+(my-y)*k-uy).toFixed(2)}`}}
    o+=`<path class="frostl${pre?' pre':''}" d="${d}"/>`;const[fx,fy]=px(...b.cells[0]);o+=`<g class="frostic${pre?' pre':''}"><circle cx="${(fx+5.2).toFixed(2)}" cy="${(fy-5.2).toFixed(2)}" r="${two?3.6:2.8}"/><text x="${(fx+5.2).toFixed(2)}" y="${(fy-5).toFixed(2)}">${two?'❄️❄️':'❄️'}</text></g>`}
  if(pat)o='<defs><pattern id="rime" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".45" fill="#fff"/><circle cx="2.4" cy="2.2" r=".3" fill="#e8f8ff"/></pattern></defs>'+o;
  return o}
// 0.90a: Ensembles auf dem Brett: goldener Umriss um die Gruppe + Schild; Promi-Verstärker: Strahlen zu den verstärkten Nachbarn mit Schildchen
function ensMarks(idx){if(!state||!state.zl||!ensOn())return'';let o='';try{const R=ensFind(state.buildings,idx);for(const g of R.groups){const E=ENS[g.key],cs=g.m.flatMap(b=>b.cells),set=new Set(cs.map(([q,r])=>hk(q,r)));let d='';
    for(const[q,r]of cs){const[x,y]=px(q,r);for(const[dq,dr]of DIRS){if(set.has(hk(q+dq,r+dr)))continue;const[x2,y2]=px(q+dq,r+dr),mx=(x+x2)/2,my=(y+y2)/2,L=Math.hypot(x2-x,y2-y)||1,ux=-(y2-y)/L*SZ/2,uy=(x2-x)/L*SZ/2;d+=`M${(mx+ux).toFixed(2)} ${(my+uy).toFixed(2)}L${(mx-ux).toFixed(2)} ${(my-uy).toFixed(2)}`}}
    o+=`<path class="ensl glow" d="${d}"/><path class="ensl" d="${d}"/>`;const[cx,cy]=centroid(cs),t=`${E.icon} ${E.name}`,w=(t.length-1)*2.05+6;o+=`<g class="enstag"><rect x="${(cx-w/2).toFixed(2)}" y="${(cy+SZ*.55).toFixed(2)}" width="${w.toFixed(2)}" height="5.6" rx="2.8"/><text x="${cx.toFixed(2)}" y="${(cy+SZ*.55+2.8).toFixed(2)}">${t}</text></g>`}}catch(e){}return o}
// 0.90a: Vorlieben-Auflage: Schild ×1,5 / ×0,5 an jedem betroffenen Gehege/Gebäude
function vorlMarks(){if(!state||!state.zl||!vorlRule())return'';let o='';for(const b of state.buildings){if(b.id===state.moving)continue;const L=vorlOf(b,K(b));if(!L.length)continue;const f=+L.reduce((t,e)=>t*e[1],1).toFixed(2);if(f===1)continue;const[cx,cy]=centroid(b.cells),t='×'+mxs(f),w=t.length*1.9+3,x=cx+(b.cells.length>1?6:4.6),y=cy+(b.cells.length>1?6:4.8);
  o+=`<g class="pref ${f>1?'up':'dn'}"><rect x="${(x-w/2).toFixed(2)}" y="${(y-2.3).toFixed(2)}" width="${w.toFixed(2)}" height="4.6" rx="2.3"/><text x="${x.toFixed(2)}" y="${y.toFixed(2)}">${t}</text></g>`}return o}
// 0.93a: gelangweilte Showtiere (kein Auslöser) mit Schild „😴 ×0,8“; nur mit Vorschau, nicht im Tutorial
function boredMarks(idx){if(!state||!state.zl||(TUTNOW&&!TUTTR)||pvHide())return'';let o='';for(const b of state.buildings){if(b.id===state.moving)continue;const c=K(b);if(c.cat!=='gehege'||!(c.tags||[]).includes('show'))continue;const nb=nbrs(b,idx),vs=new Set(nb.filter(n=>K(n).cat==='verst').map(n=>n.key));if(showN(b,c,nb,idx,vs))continue;
  const[cx,cy]=centroid(b.cells),t='😴 ×'+mxs(SHOWBORED),w=(t.length-1)*2.5+5,y=cy-(b.cells.length>1?5:4.2);o+=`<g class="trl neg bored"><rect x="${(cx-w/2).toFixed(2)}" y="${(y-3.1).toFixed(2)}" width="${w.toFixed(2)}" height="6.2" rx="3.1"/><text x="${cx.toFixed(2)}" y="${y.toFixed(2)}">${t}</text></g>`}return o}
// 0.99a: 🦷 Revier andeuten – Felder in genau 2 Feldern Abstand um ein gewähltes (Vorschau) oder angetipptes Raubtier, ohne Bewertung (knobeln)
function revierMarks(idx){if(!state||(TUTNOW&&!TUTTR)||state.phase!=='play')return'';let cells=null;
  const sk=state.selected!=null?state.hand[state.selected]:null;if(sk&&CARDS[sk]&&(CARDS[sk].tags||[]).includes('raubtier')&&state.preview)cells=ghostCells();
  else if(state.info!=null){const b=state.buildings.find(x=>x.id===state.info);if(b&&has(b,'raubtier'))cells=b.cells}
  if(!cells||!cells.length)return'';const own=new Set(cells.map(c=>hk(...c))),n1=new Set(own),bk=new Set(BOARD.map(([q,r])=>hk(q,r)));
  for(const[q,r]of cells)for(const[a,c]of DIRS)n1.add(hk(q+a,r+c));const ring=new Set();
  for(const k of n1){const[q,r]=k.split(',').map(Number);for(const[a,c]of DIRS){const k2=hk(q+a,r+c);if(!n1.has(k2)&&bk.has(k2)&&TERR.get(k2)!=='block')ring.add(k2)}}
  let o='';for(const k of ring){const[q,r]=k.split(',').map(Number),[x,y]=px(q,r);o+=`<polygon class="revz" points="${hexPts(x,y,SZ*.72)}" pointer-events="none"/>`}return o}
// 0.96a: gebauter Verstärker angetippt – auf welche Nachbarn er gerade wirkt (Scheinwerfer nur auf das stärkste Gehege, Winterquartier nur im Winter), mit Zuwachs
function vstTargets(v,idx){const bs=state.buildings;if(!v||K(v).cat!=='verst')return[];idx=idx||mkIndex(bs);const bs2=bs.filter(x=>x!==v),i2=mkIndex(bs2),L=[];
  for(const n of nbrs(v,idx)){let t=verstHit(v.key,K(n));if(!t)continue;if(v.key==='scheinwerfer'){if(spotOf(v,idx,bs)!==n)continue;t='×2,5'}if(v.key==='winterquartier'&&!CTX.winter)continue;
    const act=vsActive(n,bs,idx);if(act&&act!==v.key){L.push({n,t,da:0,ds:0,by:act});continue} // 0.99a: dort wirkt schon ein stärkerer Verstärker
    let da=0,ds=0;try{const a=evalB(n,bs,idx),b=evalB(n,bs2,i2);da=Math.round(a.a-b.a);ds=Math.round(a.s-b.s)}catch(e){}L.push({n,t,da,ds})}return L}
function vstInfoHtml(v){if(!v||K(v).cat!=='verst')return'';const A=vstTargets(v),L=A.filter(x=>!x.by),B=A.filter(x=>x.by),nm=k=>CARDS[k].icon+' '+CARDS[k].name;
  if(!L.length&&B.length)return`<p class="vstinfo">⚡ Wirkt gerade auf kein Nachbar-Gebäude: ${B.map(x=>`<b>${nm(x.n.key)}</b> (wirkt schon: ${nm(x.by)})`).join(' · ')}. Pro Gehege wirkt nur der stärkste Promi.</p>`;
  return L.length?`<p class="vstinfo">⚡ Wirkt auf: ${L.map(x=>`<b>${nm(x.n.key)}</b> ${x.t}`).join(' · ')}${B.length?`<br><span class="vsoff">Nicht bei ${B.map(x=>`${nm(x.n.key)} (wirkt schon: ${nm(x.by)})`).join(' · ')}</span>`:''}</p>`:`<p class="vstinfo">⚡ Wirkt gerade auf kein Nachbar-Gebäude.${v.key==='winterquartier'&&!CTX.winter?' (Sven Frost wirkt nur im Winter.)':''}</p>`}
function vstMarks(idx){if(!state)return'';let o='';try{for(const v of state.buildings){if(K(v).cat!=='verst'||v.id===state.moving)continue;const[vx,vy]=centroid(v.cells);for(const n of nbrs(v,idx)){let t=verstHit(v.key,K(n));if(!t)continue;if(v.key==='scheinwerfer'){if(spotOf(v,idx,state.buildings)!==n)continue;t='×2,5'}const act=vsActive(n,state.buildings,idx),off=act&&act!==v.key?' off':'';const[nx,ny]=centroid(n.cells),bx=vx+(nx-vx)*.55,by=vy+(ny-vy)*.55,l=(t.match(/×\d+(?:,\d+)?(?: [BN])?/)||[t.replace(/ .*/,'')])[0],w=l.length*1.9+3;
    o+=`<line class="vray${off}" x1="${vx.toFixed(2)}" y1="${vy.toFixed(2)}" x2="${nx.toFixed(2)}" y2="${ny.toFixed(2)}"/><g class="vbadge${off}"><rect x="${(bx-w/2).toFixed(2)}" y="${(by-2.4).toFixed(2)}" width="${w.toFixed(2)}" height="4.8" rx="2.4"/><text x="${bx.toFixed(2)}" y="${by.toFixed(2)}">${l}</text></g>`}}}catch(e){}return o}
function zlMarks(){const Z=state.zl;if(!Z)return'';let o='';const idx=mkIndex(state.buildings);o+=dayMarks(idx);o+=hvioMarks();o+=pvHide()?'':winterMarks(idx);o+=ensMarks(idx);o+=vorlMarks();o+=boredMarks(idx);
  for(const k of Z.gold){const[q,r]=k.split(',').map(Number),[x,y]=px(q,r);o+=`<polygon class="zgold" points="${hexPts(x,y,SZ*.8)}" pointer-events="none"/><text class="tic zst ${idx.has(k)?'sm':''}" x="${idx.has(k)?x-4.6:x}" y="${idx.has(k)?y+5:y}">×2</text>`}
  for(const k of Z.g4||[]){const[q,r]=k.split(',').map(Number),[x,y]=px(q,r);o+=`<polygon class="zgold g4" points="${hexPts(x,y,SZ*.8)}" pointer-events="none"/><text class="tic zst ${idx.has(k)?'sm':''}" x="${idx.has(k)?x-4.6:x}" y="${idx.has(k)?y+5:y}">×4</text>`}
  for(const ck of[Z.crown,...(Z.crown2||[])])if(ck){const[q,r]=ck.split(',').map(Number),[x,y]=px(q,r),cb=idx.get(ck),ok=cb&&isCat(cb,'gehege')&&cb.cells.length>=4;o+=`<polygon class="zcrown ${ok?'ok':''}" points="${hexPts(x,y,SZ*.8)}" pointer-events="none"/>${cb?(ok?`<text class="tic zst sm" x="${x-4.4}" y="${y+5}">👑</text>`:''):`<text class="tic zcr" x="${x}" y="${y-1.6}">👑</text><text class="tic zst sm" x="${x}" y="${y+3.6}">×1,3</text>`}`}
  o+='<defs><pattern id="zhatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#5b657059"/><rect width="1" height="3" fill="#1f262c66"/></pattern></defs>';
  const kg=Z.insp==='koenig'&&!inspHid();
  for(const b of state.buildings){const dd0=zlDead(b,state.buildings,false),dd=pvHide()&&dd0!=='prof'&&!state.zlPeek?null:dd0,pk=!dd&&state.zlPeek&&zlDead(b,state.buildings,true);if(!dd&&!pk)continue;const[cx,cy]=centroid(b.cells),full=dd==='prof'||dd==='insp',dim=kg&&dd==='insp',king=kg&&(dd||pk)==='good';
    if(full||pk||king)for(const[q,r]of b.cells){const[x,y]=px(q,r);o+=`<polygon class="${king?'zking':dim?'zdim':full?'zdead':'zpeek'}" points="${hexPts(x,y,SZ*.92)}" pointer-events="none"/>`}
    {const lo=(b.ed||'').length>=2;o+=`<text class="tic zdi" x="${(lo?cx+4.8:cx-4.6).toFixed(2)}" y="${(lo?cy+4.8:cy-4.6).toFixed(2)}">${dd==='prof'?'🚫':king?'⛄':(dd||pk)==='good'?'🥇':'❄️'}</text>`}
    if(full){const g=giveOf(b,state.buildings);if(g.a>0||g.s>0)o+=`<circle class="zgive" cx="${(cx-4.6).toFixed(2)}" cy="${(cy+4.8).toFixed(2)}" r="2.6"/><text class="tic zgt" x="${(cx-4.6).toFixed(2)}" y="${(cy+4.8).toFixed(2)}">＋</text>`}}
  for(const b of state.buildings)if(b.ed){const[cx,cy]=centroid(b.cells);[...b.ed].forEach((e,i)=>{if(!EDS[e])return;const x=(cx+4.8-i*5.4).toFixed(2),y=(cy-4.6).toFixed(2);o+=`<circle class="zedb ${e}" cx="${x}" cy="${y}" r="3.3"/><text class="tic zed" x="${x}" y="${y}">${EDS[e].icon}</text>`})}
  return o}
// ===== 0.86a: Zoo-Menü aufgeräumt (Entwurf docs/stil/zoomenue-entwurf.html) =====
// „Dieser Zoo“ (feste Reihenfolge: Weltreise-Ziel, Auflage, Thema der Jahreszeit, Winter) · Chips · „Dein Stand“ (aufklappbar, aktueller Wert) · Knopf „📖 Regeln“ (ZRULES)
let ZRULES=0;
const ZT=(cls,ic,t,txt,st,stc,extra)=>`<div class="ztl ${cls}"><span class="zti">${ic}</span><div class="ztx"><b>${t}</b><span>${txt}</span>${extra||''}</div>${st!=null&&st!==''?`<span class="zst ${stc||''}">${st}</span>`:''}</div>`;
const ZD=(ic,k,sm,v,vc,x)=>`<details class="zdt"><summary><span class="zdi">${ic}</span><span class="zdk">${k}${sm?`<small>${sm}</small>`:''}</span><span class="zdv ${vc||''}">${v}</span></summary><div class="zdx">${x}</div></details>`;
const ZTXT={zucht:'Stehen zwei gleiche Gehege nebeneinander und ist eines davon mindestens Stufe II, kommt am Ende des Tages ein <b>Jungtier</b> ins Lauf-Deck und liegt am nächsten Tag zusätzlich auf der Hand: 1 Feld, halber Grundwert, gleiche Eigenschaften. Neben einem Gehege seiner Elternart zählt es doppelt. Eins pro Art und Zoo, höchstens 3 im Deck.',
  rein:()=>'Ab '+PURN+' <b>verschiedenen</b> Gehege-Arten eines Lebensraums, die zusammenhängen (Wüste: irgendwo im Zoo): <b>×1,15 Natur</b> für den ganzen Zoo, je weiterer Art +0,15 (höchstens ×1,6). Gleiche Arten halten die Gruppe zusammen, zählen aber nicht mit.',
  bviel:()=>`Ab ${BVIEL.ab} <b>verschiedenen</b> Gastro-Arten 🍔 oder ab ${BVIEL.ab} verschiedenen Attraktions-Arten 🎡 im Zoo: <b>×${String(BVIEL.f0).replace('.',',')} Besucher</b> für den ganzen Zoo, je weitere Art +${String(BVIEL.schritt).replace('.',',')} (höchstens ×${String(BVIEL.max).replace('.',',')}). Es zählt nur die bessere der beiden Gruppen. Gilt zusätzlich zu Reinheit oder Vielfalt.`,
  viel:'Stehen von <b>allen Lebensräumen</b> mindestens 2 verschiedene Gehege-Arten im Zoo: je 2 Arten ×1,1 Natur, je 3 ×1,15, je 4 ×1,2, je 5 ×1,25. Der Lebensraum mit den wenigsten Arten zählt. Es gilt Vielfalt oder Reinheit, das Bessere.'};
// Zuchtpaare, die am Ende des Tages Nachwuchs bekämen (wie z2Breed, ohne Wirkung; 0.96a: Partner nach Art, Futter egal)
function zuchtNow(){try{const run=runOf();if(!run||!run.z2||run.tut||state.mode!=='camp')return[];const idx=mkIndex(state.buildings),L=[],jt=state.z2jt||[];let room=3-cnt(run.deck,k=>CARDS[k]&&CARDS[k].jt);
  for(const b of state.buildings){const c=CARDS[b.key];if(room<=0)break;const bk=baseK(b.key);if(c.cat!=='gehege'||c.jt||c.ms||jt.includes(bk)||L.includes(bk))continue;const m=nbrs(b,idx).find(n=>sameArt(n.key,b.key));if(!m||Math.max(b.lvl||1,m.lvl||1)<2||!CARDS[bk+'~j'])continue;L.push(bk);room--}return L}catch(e){return[]}}
// 0.92a: Stufe des Laufs in der Zoo-Übersicht, antippen zeigt die Wirkungen (nur ansehen; <details> ohne ids, auch in der Seitenleiste)
function zooStageHtml(){const r=runOf();if(!r||r.tut||!state.zl)return'';const n=r.stage||1,id=r.deckId||'grund';let box='';try{box=stageBox(id,n,n,0,false,true)}catch(e){return''}
  return`<details class="zstg"><summary>🏔️ Stufe ${n}${r.stTest?' · Stufen-Test':''} <small>antippen</small></summary>${box}</details>`}
function zooBoxHtml(rail){const Z=state.zl,R=state.rule&&RULES[state.rule.id],run=wrRun(),D=run&&state.wrDest&&state.wrDest.z===state.zoo?state.wrDest:null,K=D?wrK(D.k):null,se=seOf(state.season);
  let h=`<h2>${Z?'🃏':'🗺️'} Zoo ${(state.zoo||0)+1}${D?' · '+esc(D.ort||K.name):''}</h2><p class="zwhen">${SEAS_ICON[state.season]} ${se.name}, Tag ${Math.min((state.day||0)+1,DAYS)} von ${DAYS}${K?' · '+K.icon+' '+K.name:''}</p><h3 class="zsec">Dieser Zoo</h3><div class="zbig">`;
  // 1) Weltreise-Ziel
  if(Z&&run){const nat=D&&D.nat||{},tot=Object.values(nat).reduce((a,b)=>a+b,0);h+=ZT('zwr',K?K.icon:'🌍',D&&D.foc&&HAB[D.foc]?`Schwerpunkt ${HAB[D.foc].icon} ${HAB[D.foc].label}`:D?'Ruhe-Zoo':'Weltreise',`🌍 Weltreise · Zoo ${(state.zoo||0)+1} von ${runGoal(run)}${D?' · '+(D.foc&&HAB[D.foc]?`${nat[D.foc]||0} von ${tot} Naturflächen sind ${HAB[D.foc].label}`:`${tot} Naturflächen, gleich verteilt`):''}`)}
  // 2) Auflage (Ziel-Auflagen mit Stand, rot solange offen)
  if(R){const G=wrOn()&&wrGoal();h+=ZT('zau',R.icon,`Auflage: ${R.name}${D&&D.lv&&D.rule===state.rule.id?` <span class="wrlv ${WRLVN[D.lv]}">${D.lv}</span>`:''}`,R.text(state.rule),G?(G.ok?'✓ ':'')+G.n+'/'+G.need:'',G?(G.ok?'ok':'open'):'',aufKatHtml(state.rule.id)?`<span>${aufKatHtml(state.rule.id)}</span>`:'')}
  // 3) Thema der Jahreszeit: Besucherwunsch, sonst Ereignisse, sonst ein kurzer Hinweis
  if(state.wish&&WISH[state.wish.id]){const W=state.wish,Dw=WISH[W.id],n=Math.min(Dw.need,Dw.n(W));h+=ZT('zwi',Dw.ic(W),'Besucherwunsch',`${Dw.t(W)} · Belohnung ${wRwTxt(wRw(W))}`,W.ok?'✓':Dw.end?'…':n+'/'+Dw.need,W.ok?'ok':'')}
  else if((state.events||[]).some(e=>EVENTS[e.id])){for(const e of state.events)if(EVENTS[e.id])h+=ZT('zev',evIcon(e),`Ereignis im ${se.name}: ${evName(e)}`,evFx(e).map(l=>l.replace('|',' ')).join(' · ')+' · gilt die ganze Jahreszeit, auch für Gebautes.')}
  else h+=ZT('zwi',SEAS_ICON[state.season],se.name,!Z?'Kein Ereignis in dieser Jahreszeit.':state.season===3?'Im Winter gilt die Winter-Bedingung.':run?(state.season===0?'Im Frühling zählt die Auflage. Der Besucherwunsch kommt im Sommer.':'Im Herbst wird der Winter angekündigt.'):'In dieser Jahreszeit gibt es keinen Besucherwunsch.');
  // 4) Winter
  if(Z){const peek=CTX.winter?'':'<button class="btn sub" id="mPeek">Betroffene Gehege/Gebäude zeigen</button>';
    if(inspHid())h+=ZT('zwt','❄️','Winter','Die Winter-Bedingung wird zu Beginn des Herbstes angekündigt (❄️ Wetterbericht).','Herbst','mu');
    else if(Z.inspOpts&&!Z.inspPicked)h+=ZT('zwt','❄️','Winter: '+Z.inspOpts.map(i=>INSP[i].name).join(' oder '),Z.inspOpts.map(i=>`<b>${inspIcon({insp:i})} ${INSP[i].name}:</b> ${inspText({...Z,insp:i})}`).join('<br>')+'<br>Du wählst eine davon, wenn der Winter beginnt.','Wahl','mu');
    else if(Z.insp&&INSP[Z.insp])h+=ZT('zwt',inspIcon(Z),'Winter: '+INSP[Z.insp].name,inspText(Z),CTX.winter?'jetzt':'','mu',peek+wSwapBtn())}
  h+='</div>';
  // Chips: dauerhafte Boni, Teuerung, Geschenk
  {const C=[];/* 0.93a: Boni der Weltreise stehen im Profil-Fenster */if(Z&&Z.ban)C.push(`<span class="zch">💸 ${zlTypeName(Z.ban)} +1 BP</span>`);if(Z&&Z.gift&&CARDS[Z.gift])C.push(`<span class="zch">🎁 Geschenk: ${CARDS[Z.gift].icon} ${CARDS[Z.gift].name}</span>`);if(Z&&Z.news)C.push('<span class="zch p">📰 Zeitungsartikel: Showtiere ×1,5 (bis Zoo-Ende)</span>');if(state.luckNext)C.push('<span class="zch p">🎟️ Glückslos: nächster Jahreszeit-Start Chancen ×2</span>');/* 0.92a */if(C.length)h+=`<div class="zchips">${C.join('')}</div>`}
  // Dein Stand
  if(Z){const idx=mkIndex(state.buildings),pu=zlPurity(state.buildings,idx),m3=state.rule&&state.rule.id==='max3',x=n=>'×'+String(+purF(n).toFixed(2)).replace('.',','),v=vielfalt(state.buildings),fx=f=>'×'+String(+f.toFixed(2)).replace('.',',');
    h+=`<h3 class="zsec">Dein Stand <small>antippen für Erklärung</small></h3><div class="zstand">`;
    h+=ZD('🧬','Reinheit',m3?'mit dieser Auflage nicht erreichbar':pu.hab?`${HAB[pu.hab].icon} ${pu.n} Arten`:'noch keine Gruppe',!m3&&pu.n>=PURN?x(pu.n)+' N':'–',!m3&&pu.n>=PURN?'n':'o',ZTXT.rein()+'<br>'+(m3?'<i class="b">Mit der Auflage in diesem Zoo nicht erreichbar.</i>':pu.n>=PURN?`Bei dir: ${pu.n} ${HAB[pu.hab].label}-Gehege · ${x(pu.n)} Natur.`:`Größte Gruppe: ${pu.n||0}${pu.hab?' '+HAB[pu.hab].label+'-Gehege':''} · noch ${PURN-(pu.n||0)} bis ×1,15 Natur.`));
    h+=ZD('🎨','Vielfalt',vfTxt(v)||'noch keine Gehege',v.f>1?fx(v.f)+' N':'–',v.f>1?'n':'o',ZTXT.viel+`<br>Bei dir: ${vfTxt(v)||'–'}${v.f>1?' · '+fx(v.f)+' Natur':''}.`);
    {const bv=besVielfalt(state.buildings),nm=bv.cat==='attr'?'Attraktions-Vielfalt':'Gastro-Vielfalt',ic=bv.cat==='attr'?'🎡':'🍔';h+=ZD(ic,nm,`🍔 ${bv.e} · 🎡 ${bv.a} Arten`,bv.f>1?fx(bv.f)+' B':'–',bv.f>1?'b':'o',ZTXT.bviel()+`<br>Bei dir: ${bv.e} Gastro-Arten, ${bv.a} Attraktions-Arten${bv.f>1?' · '+fx(bv.f)+' Besucher':` · noch ${BVIEL.ab-bv.n} bis ×${String(BVIEL.f0).replace('.',',')} Besucher`}.`)}
    if(isZ2()){const zu=zuchtNow();h+=ZD('🍼','Zucht',zu.length?zu.map(k=>CARDS[k].name).join(', '):'kein Paar',zu.length?zu.length+' möglich':'–',zu.length?'n':'o',ZTXT.zucht)}
    h+='</div>'}
  return h+(zlBackOk()?`<div class="tnav" style="justify-content:space-between"><button class="btn sub" id="zlBack">◂ Zurück</button><button class="btn main" id="mClose">Los geht's</button></div>`:`<button class="btn main" id="mClose">Los geht's</button>`)}
// ===== 0.93a: 👤 Profil-Fenster (Knopf #btnProf in der Kopfleiste): alles, was den ganzen Lauf gilt. Reiter PROFT: lauf · deck · regeln =====
let PROFT='lauf';
const profOn=()=>{try{const r=runOf();return!!(state&&state.mode==='camp'&&state.zl&&r&&!r.tut&&!TUTNOW)}catch(e){return false}};
function profBtnHtml(){const r=runOf(),dk=r.deckId||'grund',D=DECKS[dk]||DECKS.grund;return`${D.icon}<b class="stp">${r.stage||1}</b>`}
function profHtml(){const r=runOf(),dk=r.deckId||'grund',D=DECKS[dk]||DECKS.grund,run=wrRun(),n=r.stage||1,tst=r.stTest;
  let h=`<div class="profhd"><span class="profic">${D.icon}</span><div><h2>${D.name}${tst?' <span title="Testlauf">🧪</span>':''}</h2><p class="profsub">🏔️ Stufe ${n}${run?' · 🌍 Weltreise':''} · Zoo ${(state.zoo||0)+1} von ${runGoal(r)}</p>${D.person?`<p class="dkperson">${D.person}</p>`:''}</div></div>
  <div class="stabs proftabs">${[['lauf','🏔️ Lauf'],['deck','🃏 Deck'],['regeln','📖 Regeln']].map(([k,t])=>`<button class="${PROFT===k?'on':''}" data-proft="${k}">${t}</button>`).join('')}</div>`;
  if(PROFT==='deck')return h+`<p style="margin:0;color:var(--muted);font-size:13px">Dein Lauf-Deck: ${r.deck.length} Karten (nur ansehen).</p>${deckMixHtml(r.deck)}${deckRows(r.deck,()=>'')}<button class="btn main" id="mClose">Schließen</button>`;
  if(PROFT==='regeln')return h+zooRulesHtml()+'<button class="btn main" id="mClose">Schließen</button>';
  h+='<div class="zbig">';
  h+=ZT('zpr',D.icon,'Profil-Regel: '+D.name,DECKRULE[dk]||DECKRULE.grund);
  h+='</div>'+zooStageHtml();
  if(run){const R=run.wrRoute||[];h+=`<h3 class="zsec">🌍 Weltreise</h3><div class="zbig">`+ZT('zwr','🗺️','Route',R.length?R.map(x=>`Zoo ${x.z+1} ${esc(x.ort||'')} (${wrK(x.k).icon} ${wrK(x.k).name})`).join(' → '):'noch keine Station');
    if((run.boni||[]).length)h+=ZT('zwr','🎁','Boni',run.boni.filter(k=>WRB[k]).map(k=>`${WRB[k].icon} <b>${WRB[k].name}:</b> ${WRB[k].text}`).join('<br>'));
    if((run.wrGone||[]).length)h+=ZT('zwr','🦓','Ausgewildert',run.wrGone.map(k=>CARDS[k]?CARDS[k].icon+' '+CARDS[k].name:k).join(', '));h+='</div>'}
  let z='';const Z=state.zl;
    const gs=(state.spec||[]).filter(id=>SPEC[id]&&SPEC[id].zl);if(gs.length)z+=ZD('📈','Wachsende Spezialisten',gs.map(id=>SPEC[id].icon).join(' '),gs.length,'b',gs.map(id=>{if(SPEC[id].grw){const f=grwF(SPEC[id].grw);return`${SPEC[id].icon} ${SPEC[id].name}: <b>×${mxs(f)} ${SPEC[id].grw==='nat'?'N':'B'}</b> · ${grwN(SPEC[id].grw)} ${SPEC[id].grw==='nat'?'Naturschutz-Gebäude':'Gastro/Attraktionen'} im Lauf gebaut${f>=GRWMAX?' · Obergrenze erreicht':''}`}if(typeof SPEC[id].mult!=='function')return`${SPEC[id].icon} ${SPEC[id].name}`;const m=SPEC[id].mult()||{};return`${SPEC[id].icon} ${SPEC[id].name}: <b>×${mxs(m.ma||m.ms||1)} ${m.ms?'N':'B'}</b> · ${id==='z_bank'?fmt(Math.max(0,state.money))+' Taler':id==='z_rekord'?(Z.grow[id]||0)+' frühe Ziele':(Z.grow[id]||0)+' Gehege gebaut'}${(m.ma||m.ms||1)>=(id==='z_bank'?2:SPEC[id].hg?HGMAX:GROWMAX)?' · Obergrenze erreicht':''}`}).join('<br>'));
    if(foodOn()){const r2=runOf(),L=(r2&&r2.fdl)||{},hs=Object.keys(L).filter(k=>L[k]>0);z+=ZD('🧺','Futter',hs.length?'Lebensraum-Futter':'noch keins',hs.length?hs.map(k=>HAB[k].icon+' '+L[k]).join(' '):'–',hs.length?'n':'o',foodBoxHtml())}
    if(habRulesOn())z+=ZD('🧭','Lebensraum-Regeln',habsNow().map(k=>HAB[k].icon).join(' '),habsNow().length,'o',habsNow().map(k=>HABRULE[k]).join('<br>'));
  if(z)h+=`<h3 class="zsec">Für den ganzen Lauf <small>antippen für Erklärung</small></h3><div class="zstand">${z}</div>`;
  return h+'<button class="btn main" id="mClose">Schließen</button>'}
// „📖 Regeln“: feste Regeln dieses Laufs (Stufe, Profil-Regel, Boni, lange Erklärtexte, Gelände)
function zooRulesHtml(){const Z=state.zl,run=wrRun(),rb=(c,ic,t,b)=>`<div class="zrl"><b>${ic} ${t}</b><br>${b}</div>`;let h=`<div class="zrules">`;
  if(Z&&isZ2()){const S=stOf();h+=rb('','🏔️','Stufe '+S,S>1?STAGES.slice(2,S+1).join(' · '):'Grundstufe ohne Verschärfung');const dk=dkNow();if(dk&&dk!=='grund'&&DECKS[dk])h+=rb('',DECKS[dk].icon,'Profil-Regel: '+DECKS[dk].name,DECKRULE[dk])}
  if(run&&(run.boni||[]).length)h+=rb('','🌍','Deine Boni der Weltreise',run.boni.filter(k=>WRB[k]).map(k=>`${WRB[k].icon} <b>${WRB[k].name}:</b> ${WRB[k].text}`).join('<br>'));
  if(Z&&isZ2())h+=rb('','🍼','Zucht',ZTXT.zucht);
  if(Z)h+=rb('','🧬','Reinheit',ZTXT.rein())+rb('','🎨','Vielfalt',ZTXT.viel)+rb('','🍔','Gastro- und Attraktions-Vielfalt',ZTXT.bviel());
  h+=zlTerrTile(rb);
  return h+`</div>`}
const flivHtml=()=>{let conf='';if(!reduced)for(let i=0;i<40;i++){const d=(2.4+Math.random()*2.4).toFixed(2);conf+=`<i style="left:${(Math.random()*100).toFixed(1)}%;background:${['#ff6b9d','#ffd166','#ff9ec4','#fff','#ff4d6d'][i%5]};animation-duration:${d}s;animation-delay:${(Math.random()*2).toFixed(2)}s;--dx:${Math.round(Math.random()*120-60)}px"></i>`}
  return`<div class="fliv"><div class="wconf" aria-hidden="true">${conf}</div><div class="fheart">🎉</div><h2>Danke fürs Spielen!</h2><button class="btn main" id="mFliv">Weiter</button></div>`};
function whyNot(cells,key,bs=state.buildings){const idx=mkIndex(bs),c=CARDS[key];if(builtUnique(bs,key))return`${c.name} gibt es nur einmal im Zoo. Du kannst die Karte abwerfen, indem du den Tag beendest.`;
  for(const[q,r]of cells){const k=hk(q,r);if(!ONBOARD.has(k))return'Ragt über den Rand hinaus.';if(idx.has(k))return'Da steht schon etwas.';
    const t=TERR.get(k);if(t==='block')return'Felsen lassen sich nicht bebauen.';
    if(t&&c.cat==='gehege'&&c.hab!==t)return`${HAB[t].icon} ${HAB[t].label}-Naturfläche: nur ${HAB[t].label}-Gehege dürfen hier hin.`}return'Passt hier nicht.'}

