//@@ modul: 10-tutorial
const TUT={};

/* ---------- Geführtes Tutorial: ein ganzer Zoolatro-Zoo mit Einblendungen ---------- */
const gRun=()=>{const sl=activeSlot();return sl&&sl.run&&sl.run.tut?sl.run:null};
const gB=f=>state.buildings.some(b=>f(CARDS[b.key],b)),gH=f=>state.hand.some(k=>f(CARDS[k],k));
// festes Übungsgelände und Drehbuch für den Frühling
// ===== Godot-Vorbereitung 2c: Tutorial (Gelände, Ziele, Kartenwahl, Texte, Schritte) steht in daten/tutorial.json (von mache.py eingebaut).
// Bedingungen und Vorbereitungen, die Code sind, stehen unten in TUT_WIRKUNG und werden über eine Kennung angesprochen.
const TUT_DATEN=/*@@DATEN:tutorial@@*/null;
const TUTMAP=JSON.parse(JSON.stringify(TUT_DATEN.gelaende)); // festes Übungsgelände: Naturfelder/Felsen, ×2-Felder, Kronenfeld
const TUTT=TUT_DATEN.ziele.slice();
const TUTOFF=TUT_DATEN.kartenwahl.map(x=>x.slice()); // Karten der nächsten Tage zuerst
const tFree=k=>!mkIndex(state.buildings).has(k)&&ONBOARD.has(k)&&TERR.get(k)!=='block',tNb=(b)=>{const o=new Set();for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr);if(tFree(k))o.add(k)}return[...o]};
const tAt=(k,cell)=>tB(k).some(b=>b.cells.some(([q,r])=>hk(q,r)===cell)),tNear=(k)=>tB(k).flatMap(tNb);
const tDay=(...ks)=>s=>{tHand(...ks)(s)},tBp=s=>{s.bp=Math.max(s.bp,s.bpMax)};
// Komplett geführt: Frühling (Grundlagen), Sommer (Tiere und Platz), Herbst (Fortgeschritten) – jeder Tag mit vorgegebener Hand und festen Feldern; den Winter spielst du allein.
const tUp=(key,t,h,lvl,o={})=>{const st={t,h,only:key,up:true,mark:()=>tB(key).filter(b=>(b.lvl||1)<lvl).slice(0,1).flatMap(b=>b.cells.map(c=>hk(...c))),done:()=>tB(key).some(b=>(b.lvl||1)>=lvl)};if(o.day)st.setup=s=>tDay(...o.day)(s);return st};
// ===== 0.67a Neues Tutorial (Tobi, 04.11.): Berater Jasper, Zoo 1 geführt bis Herbst Tag 2, danach frei bis Jahresende =====
// Texte als Häppchen: t = Liste; Eintrag = Text oder {t,glow,mark}. Handy: eins nach dem anderen (Weiter ▸), Querformat: alle zusammen.
const tNat=()=>[...TERR.entries()].filter(([k,v])=>v&&v!=='block'&&ONBOARD.has(k)).map(([k])=>k),tRock=()=>[...TERR.entries()].filter(([k,v])=>v==='block').map(([k])=>k);
const tEndS=(day,extra)=>({t:extra||[TUT_DATEN.texte.tag_ende],only:'-',end:true,done:()=>state.phase==='play'&&state.day>=day});
const tPut=(key,at,t,o={})=>Object.assign({t,only:key,at,rot:o.rot!==false&&SHAPES[CARDS[key].shape].cells.length>1,h:o.h||TUT_DATEN.texte.bau_hinweis.replace('{N}',CARDS[key].name).replace('{D}',SHAPES[CARDS[key].shape].cells.length>1&&o.rot!==false?TUT_DATEN.texte.bau_drehen:''),done:()=>tAt(key,at[0])},o.x||{});
const tSetHand=(...ks)=>s=>{s.discard.push(...s.hand.filter(k=>!ks.includes(k)));s.hand=ks.slice();s.selected=null;s.preview=null};
// Kennungen aus daten/tutorial.json: done = erledigt-Bedingung, setup = Vorbereitung, mark = Markierung
const TUT_WIRKUNG={
  done:{
  tagesbilanz:()=>state.phase==='review',
  kartenwahl_oder_tag1:()=>state.phase==='draft'||(state.phase==='play'&&state.day>=1),
  tag1:()=>state.phase==='play'&&state.day>=1,
  jahreszeit_vorbei:()=>!['play','scoring','review'].includes(state.phase),
  nach_ziel:()=>state.phase!=='seasonWon',
  mappe_offen:()=>state.shopSub==='mappe'||(state.spec||[]).length>0,
  pflegerin_da:()=>(state.spec||[]).includes('pfleger_savanne')||state.phase!=='shop',
  sommer_beginnt:()=>state.phase==='play'&&state.season>=1,
  flamingos_weg:()=>!tB('flamingos').length,
  neu_gezogen:()=>!!state.tut.redrawn,
  futtersack_offen:()=>state.shopSub==='sack'||((runOf()||{}).fdl||{}).savanne>0,
  steppenheu_da:()=>((runOf()||{}).fdl||{}).savanne>0,
  herbst_beginnt:()=>state.phase==='play'&&state.season>=2},
  setup:{
  herde:s=>{s.tutHerd=1;syncCtx()},
  mappe_vorbereiten:s=>{s.money=Math.max(s.money,60);META.shopT='run'},
  neu_ziehen_vorbereiten:s=>{s.tut.redrawn=false},
  reiter_umbau:s=>{META.shopT='umb'},
  futtersack_vorbereiten:s=>{META.shopT='umb';const it=(fixedItems()||[]).find(i=>i.kind==='sack');s.money=Math.max(s.money,it?it.price:30)}},
  mark:{natur:tNat,felsen:tRock,goldfelder:()=>(state.zl.gold||[]),krone:()=>[state.zl.crown],
  korallenriff_umziehen:()=>state.moving==null?tB('korallenriff').flatMap(b=>b.cells.map(c=>hk(...c))):[]}};
const tutW=(art,k)=>{const f=TUT_WIRKUNG[art][k];if(!f)throw new Error('Wirkung fehlt: '+art+' '+k);return f};
const tutMk=m=>Array.isArray(m)?(()=>m.slice()):tutW('mark',m);
const tutHp=x=>typeof x==='string'?x:Object.assign({},x,x.mark?{mark:tutMk(x.mark)}:{});
const tutDone=d=>typeof d==='string'?tutW('done',d):()=>tAt(d.steht[0],d.steht[1]);
// Vorbereitung: neue Hand (hand), Hand austauschen (hand_setzen), danach die Vorbereitung mit Kennung (setup)
const tutSetup=d=>{const f=d.setup?tutW('setup',d.setup):null;if(d.hand_setzen)return tSetHand(...d.hand_setzen);if(d.hand){const h=tDay(...d.hand);return f?s=>{h(s);f(s)}:h}return f};
function tutSchritt(d){
  if(d.bau){const x={},su=tutSetup(d);if(su)x.setup=su;if(d.pv)x.pv=d.pv.map(tutHp);if(d.arot)x.arot=true;if(d.done)x.done=tutDone(d.done);const o={x};if(d.h)o.h=d.h;if(d.drehen===false)o.rot=false;return tPut(d.bau,d.at.slice(),d.t.map(tutHp),o)}
  if(d.tag_ende!=null)return tEndS(d.tag_ende);
  if(d.ausbau)return Object.assign(tUp(d.ausbau,'',d.h,d.stufe,d.hand?{day:d.hand.slice()}:{}),{t:d.t.map(tutHp)});
  const st={};for(const p in d){const v=d[p];if(p==='hand'||p==='hand_setzen')continue;if(p==='t')st.t=v.map(tutHp);else if(p==='mark')st.mark=tutMk(v);else if(p==='done')st.done=tutDone(v);else if(p==='setup')continue;else st[p]=Array.isArray(v)?v.slice():v&&typeof v==='object'?{...v}:v}
  const su=tutSetup(d);if(su)st.setup=su;return st}
for(const ch in TUT_DATEN.kapitel){const K=TUT_DATEN.kapitel[ch];TUT[ch]={name:K.name,steps:K.schritte.map(tutSchritt)}}
// Kapitel starten automatisch, sobald ihre Jahreszeit oder ihr Shop beginnt
const TUTCH=[['zlsh',()=>state.season===0&&state.phase==='shop'],['zs',()=>state.season===1&&state.day===0&&state.phase==='play'],['zssh',()=>state.season===1&&state.phase==='shop'],['zh',()=>state.season===2&&state.day===0&&state.phase==='play']];
const tMark=()=>{if(state.tut){state.tut.ids=state.buildings.map(b=>b.id);state.tut.nb=state.buildings.length}},tNew=k=>tB(k).some(b=>!(state.tut&&state.tut.ids||[]).includes(b.id));
const TUTGUIDED=['zl','zs','zh'],tutGuided=()=>!!(state&&state.tut&&TUTGUIDED.includes(state.tut.ch)&&typeof gRun==='function'&&gRun());
function tutChapter(){const run=gRun();if(!run||state.tut||modal)return;const G=run.guide=run.guide||{seen:{}};G.ch=G.ch||{};for(const[ch,f]of TUTCH){if(G.ch[ch])continue;let ok=false;try{ok=f()}catch(e){}if(!ok)continue;G.ch[ch]=1;state.tut={ch,i:0};tMark();const st=tutStep();if(st&&st.setup)st.setup(state);setTimeout(()=>{if(state)render()},0);return}}
const guideHint=()=>null; // 0.73a: alte Tutorial-Hinweise (GUIDE) und Kapitel zls/zlh/zlw entfernt
// Tutorial: Schritt-Wechsel merken; passt die Spielphase nicht zum Schritt, gibt es einen neutralen Text (gilt für den Kasten unten und für die Kästen in Fenstern)
function tutKey(st){const key=state.tut.ch+':'+state.tut.i;if(key!==coachKey){coachKey=key;coachPh=st.ph||state.phase;coachMin=false;tutFit=!!(st.tap&&st.mark)}}
const TUTGEN={...TUT_DATEN.phasen_texte};
function tutGen(st){tutKey(st);const phG=p=>['play','scoring','review'].includes(p)?'play':p;if(phG(state.phase)===phG(coachPh)||(st.ph&&st.ph===state.phase))return null;return TUTGEN[state.phase]||''}
const guideHtml=()=>{const h=guideHint(),st=!h&&gRun()&&state&&!screen&&state.tut?tutStep():null;if(st){const g=tutGen(st);if(g!==null)return g?`<div class="ghint"><div class="gh1">📖 Tutorial</div><p>${g}</p></div>`:''}if(st)return`<div class="ghint"><div class="gh1">🧑‍💼 Jasper</div>${tutText(st)}${tutNav(st,'data-gback="1"','data-gmore="1"',st.btn?`<button class="btn main" data-gstep="1">${st.btn}</button>`:'')}</div>`;return h?`<div class="ghint"><div class="gh1">📖 Tutorial</div><p>${h.t}</p>${h.go?'':`<button class="btn main" data-gok="${h.id}">Verstanden</button>`}</div>`:''};
document.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target:null;if(!t)return;const b=t.closest('[data-gok]'),q=t.closest('[data-gend]'),g=t.closest('[data-gstep]'),gm=t.closest('[data-gmore]'),gb=t.closest('[data-gback]');if(!b&&!q&&!g&&!gm&&!gb)return;const run=gRun();if(!run)return;e.stopPropagation();e.preventDefault();if(gm){tutKAdd(1);Sfx.select();renderAll();return}if(gb){tutKAdd(-1);Sfx.select();renderAll();return}if(g){tutNext();return}
  if(q){Sfx.win();guideEnd(true);return}(run.guide=run.guide||{seen:{}}).seen[b.dataset.gok]=1;Sfx.select();saveMeta();renderAll()},true);
function startGuide(){const lm=META.lastMode,ls=META.lastSlot;META.tutPrev=META.active==='tut'?null:META.active;META.slots.tut={name:'Tutorial',created:1,last:1,game:null,perks:{},games:0,ctype:{}};enterCamp('tut',true,'grund',true);META.lastMode=lm;META.lastSlot=ls;saveMeta()}
function guideEnd(done){if(done){META.tutDone=META.tutDone||{};META.tutDone.zl=1}delete META.slots.tut;META.active=META.tutPrev!=null&&META.slots[META.tutPrev]?META.tutPrev:null;state=null;modal=null;screen='tut';screenArg={done:!!done};document.body.classList.remove('tutmode');$('coach').classList.remove('gshow');$('coach').innerHTML='';
  const sl=activeSlot()||(META.lastSlot!=null?META.slots[META.lastSlot]:null);if(sl)applySlot(sl);else{applyPerks({});UNLOCK=new Set()}saveMeta();renderAll()}
const tutFix=()=>{const st=tutStep();return st&&tutGuided()&&state.phase==='play'?st:null},tutCellsEq=(cells,at)=>cells.map(c=>hk(...c)).sort().join('|')===at.slice().sort().join('|');
const tutStep0=()=>state&&state.tut&&TUT[state.tut.ch]&&(state.mode==='tut'||gRun())?TUT[state.tut.ch].steps[state.tut.i]:null;
const tutWide=()=>{try{return document.body.classList.contains('land')}catch(e){return false}};
const tutChunks=st=>{const t=st&&st.t;return(Array.isArray(t)?t:[t]).filter(x=>x!=null&&x!=='').map(x=>typeof x==='string'?{t:x}:x)};
const tutK=st=>Math.min((state.tut&&(st&&st._pv?state.tut.pk:state.tut.k))||0,Math.max(0,tutChunks(st).length-1));
// 0.70a: Pause in der Vorschau (Schritt-Feld pv): liegt die Karte genau auf den Zielfeldern, aber noch nicht gebaut → eigener Text, 🔨 erst nach dem letzten Häppchen
const tutPvOn=st=>{try{if(!st||!st.pv||!st.at||state.phase!=='play'||state.selected==null||state.hand[state.selected]!==st.only)return false;const c=ghostCells();return!!c&&tutCellsEq(c,st.at)}catch(e){return false}};
const tutPvLock=()=>{try{const st=state&&state.tut?tutStep():null;return!!(st&&st._pv&&tutMore(st))}catch(e){return false}};
const tutKAdd=d=>{const st=tutStep();if(st&&st._pv)state.tut.pk=Math.max(0,tutK(st)+d);else state.tut.k=Math.max(0,tutK(tutStep0())+d)};
// Handy: solange noch Häppchen kommen, ist der Schritt im „Lese“-Zustand (nichts bauen, nichts leuchtet außer dem Häppchen)
const tutStep=()=>{const st=tutStep0();if(!st)return st;if(tutPvOn(st)){const o=Object.create(st);Object.assign(o,{t:st.pv,_pv:true,rot:false,arot:false,h:'Jasper lesen, dann 🔨'});return o}const C=tutChunks(st);if(C.length>1&&!tutWide()&&tutK(st)<C.length-1){const c=C[tutK(st)],o=Object.create(st);Object.assign(o,{only:'-',at:null,mv:null,up:false,end:false,rot:false,undo:false,redraw:false,ev:false,btn:null,leave:false,arot:false,lock:st.lock?{tab:st.lock.tab,kind:'-'}:null,glow:c.glow||[],mark:c.mark||null,done:()=>false,_read:true});return o}return st};
const tutText=st=>{const C=tutChunks(st);if(!C.length)return'';if(tutWide())return C.map(c=>'<p>'+c.t+'</p>').join('');const k=tutK(st);return'<p>'+C[k].t+'</p>'+(C.length>1?`<div class="tdots">${C.map((_,i)=>`<i class="${i<=k?'on':''}"></i>`).join('')}</div>`:'')};
const tutBack=st=>!tutWide()&&tutChunks(st).length>1&&tutK(st)>0; // 0.70a: ◂ Zurück in Häppchen-Texten
const tutNav=(st,back,more,btn)=>{const b=tutBack(st)?`<button class="btn sub" ${back}>◂ Zurück</button>`:'',m=tutMore(st)?`<button class="btn main" ${more}>Weiter ▸</button>`:btn||'';return(b||m)?`<div class="tnav">${b}${m}</div>`:''}; // 0.71a: Knöpfe immer rechts
const tutMore=st=>{const C=tutChunks(st);return!tutWide()&&C.length>1&&tutK(st)<C.length-1};
const tutMarkAll=st=>{let m=[];try{if(st.mark)m=st.mark()||[]}catch(e){}if(st._read)return m;const C=tutChunks(st);(tutWide()?C:[C[tutK(st)]]).forEach(c=>{if(c&&c.mark)try{m=m.concat(c.mark()||[])}catch(e){}});return m};
const tutGlowAll=st=>{const g=[...(st.glow||[])];if(st._pv&&!tutMore(st))g.push('btnBuild');if(tutWide())tutChunks(st).forEach(c=>(c.glow||[]).forEach(x=>g.push(x)));else{const c=tutChunks(st)[tutK(st)];if(c&&c.glow)c.glow.forEach(x=>g.push(x))}return g};
// 0.75a: Häppchen können eine Karte groß in der Mitte zeigen: {t:'…', karte:'giraffen', leuchten:['show','kosten','form','werte','name','symbol']}
// Sie bleibt, solange Häppchen sie nennen (Querformat: alle Häppchen auf einmal, die erste Karte gilt), Hintergrund abgedunkelt, Textbox bleibt bedienbar.
const TUTLEUCHT={kosten:'.band',form:'.shape',werte:'.st',name:'.nm',symbol:'.ic'};
const tutKarte=st=>{if(!st)return null;const C=tutChunks(st);const L=tutWide()?C:[C[tutK(st)]];const c=L.find(x=>x&&x.karte&&CARDS[x.karte]);return c?{karte:c.karte,leuchten:c.leuchten||[]}:null};
function tutCardRender(){const co=$('coach');let el=$('tutCard');let K=null;try{K=state&&state.tut&&gRun()&&!modal&&!screen?tutKarte(tutStep()):null}catch(e){K=null}
  if(!K||!co){if(el)el.remove();return}
  if(!el){el=document.createElement('div');el.id='tutCard';el.className='tcard';co.parentNode.insertBefore(el,co)}
  if(el.dataset.k!==K.karte){el.dataset.k=K.karte;el.innerHTML=offerCard(K.karte,0).replace(/ data-pick="0"/,' tabindex="-1"')}
  el.querySelectorAll('.tutglow').forEach(e=>e.classList.remove('tutglow'));
  for(const l of K.leuchten){if(TUTLEUCHT[l])el.querySelectorAll(TUTLEUCHT[l]).forEach(e=>e.classList.add('tutglow'));
    else if(TRAITIC[l])el.querySelectorAll('.tx > *').forEach(e=>{if(e.textContent.includes(TRAITIC[l]))e.classList.add('tutglow')})}}
function tutRotFor(key,at){for(let rot=0;rot<6;rot++)for(const[q,r]of BOARD){const c=placeCells(key,rot,q,r);if(c&&tutCellsEq(c,at))return rot}return null}
function tutMarks(){const st=tutStep();if(!st||state.phase!=='play')return'';const mk=tutMarkAll(st);if(!st.at&&!mk.length)return'';const cs=st.at&&(!st.mv||state.moving!=null)?st.at:[];const fc=cs.filter(tFree);let ar='';if(fc.length){const[cx,cy]=centroid(fc.map(k=>k.split(',').map(Number)));ar=`<text class="tgar" x="${cx.toFixed(2)}" y="${(cy-SZ*1.25).toFixed(2)}" pointer-events="none">👇</text>`}return[...fc,...mk].map(k=>{const[q,r]=k.split(',').map(Number),[x,y]=px(q,r);return`<polygon class="tgo" points="${hexPts(x,y,SZ*.86)}" pointer-events="none"/>`}).join('')+ar}
function exitTut(done){if(done&&state&&state.tut){META.tutDone=META.tutDone||{};META.tutDone[state.tut.ch]=1}state=null;modal=null;screen='tut';screenArg={};document.body.classList.remove('tutmode');
  const sl=META.lastSlot!=null?META.slots[META.lastSlot]:null;if(sl)applySlot(sl);else applyPerks({});saveMeta();renderAll()}
function tutNext(){const T=TUT[state.tut.ch];state.tut.i++;state.tut.k=0;state.tut.pk=0;tMark();let st=tutStep();while(st&&st.skip&&st.skip()){state.tut.i++;st=tutStep()}if(!st){if(gRun()){state.tut=null;Sfx.sparkle();render();return}exitTut(true);return}if(st.setup)st.setup(state);Sfx.sparkle();render()}
let tutBusy=false;
// 0.71a: mehrere schon erledigte Schritte auf einmal weiterschalten (sonst kurz falsche Hand an Tag 2)
function tutCheck(){let st=tutStep();if(!st||tutBusy||!st.done||!st.done())return;tutBusy=true;try{let n=0;do{tutNext();st=state&&state.tut?tutStep():null}while(st&&st.done&&st.done()&&++n<12)}finally{tutBusy=false}}
function tutNudge(){const c=$('coach');c.classList.remove('nudge');void c.offsetWidth;c.classList.add('nudge')}
function renderCoach(){const gr0=state&&gRun();if(gr0)tutChapter();
  const st=tutStep(),c=$('coach');if(state&&gRun()&&!st){const gh=null;document.body.classList.remove('tutmode');c.classList.remove('small');c.classList.toggle('gshow',!!gh);$('btnUmb').classList.toggle('ugl',!!gh&&gh.id==='umbuse');c.innerHTML=gh?`<div class="ch"><span>📖 Tutorial</span><button id="tutQuit">Tutorial beenden</button></div><p>${gh.t}</p><button class="btn main" data-gok="${gh.id}">Verstanden</button>`:'';return}c.classList.remove('gshow');document.body.classList.toggle('tutmode',!!st);if(!st){c.innerHTML='';document.querySelectorAll('.tutglow').forEach(e=>e.classList.remove('tutglow'));$('btnRot').classList.remove('tutgo');$('btnUndo').classList.remove('tutgo');return}
  const T=TUT[state.tut.ch],w=st.wrong&&state.phase==='play'?st.wrong():null;
  // beim Platzieren klappt der Hinweis auf eine Zeile zusammen, damit das Gelände frei bleibt
  tutKey(st);
  // Phase gewechselt, der Schritt gehört aber zu einer anderen: neutraler Text statt des alten
  const gen=tutGen(st)!==null;if(gen){const gt=tutGen(st);
    c.classList.toggle('small',!gt);c.innerHTML=gt?`<div class="ch"><span>${gRun()?'📖 '+T.name:T.name}</span></div><p>${gt}</p>`:`<div class="ch"><span>Einen Moment…</span></div>`}
  else{const small=!st._pv&&!w&&((!st.btn&&(state.selected!=null||state.moving!=null||state.phase==='scoring'))||(coachMin&&!st.btn));c.classList.toggle('small',small);
  c.innerHTML=small?`<div class="ch" data-cmin="1"><span>Schritt ${state.tut.i+1}/${T.steps.length}${st.h?' · <b>'+st.h+'</b>':''}</span><span class="cmx">▴ aufklappen</span></div>`
    :`<div class="ch"><span>${gRun()?'🧑‍💼 Jasper · '+T.name:'Kapitel '+state.tut.ch+' · '+T.name}</span><span><button data-cmin="1" class="cmb">▾ einklappen</button></span></div>${tutText(st)}${w?`<p class="bad">${w}</p>`:''}${tutNav(st,'id="tutBack"','id="tutMore"',st.btn?`<button class="btn main" id="tutBtn">${st.btn}</button>`:'')}`;
  if(st.arot&&!st._read&&state.phase==='play'&&state.selected!=null&&state.hand[state.selected]===st.only&&state.tut.ar!==state.tut.i){const r0=tutRotFor(st.only,st.at);if(r0!=null){state.tut.ar=state.tut.i;if(state.rot!==r0){state.rot=r0;setTimeout(()=>{try{render()}catch(e){}},0)}}}}
  document.querySelectorAll('#hand .card').forEach((el,i)=>{const k=state.hand[i];el.classList.toggle('tutgo',!!st.only&&k===st.only&&state.selected!==i);el.classList.toggle('tutno',!!st.only&&k!==st.only)});
  $('btnEnd').classList.toggle('tutgo',!!st.end&&(state.phase==='play'||state.phase==='review'));$('btnRot').classList.toggle('tutgo',!!st.rot&&state.selected!=null);$('btnUndo').classList.toggle('tutgo',!!st.undo);document.querySelectorAll('.tutglow').forEach(e=>e.classList.remove('tutglow'));tutGlowAll(st).forEach(id=>{const L=/^[#.\[]/.test(id)?document.querySelectorAll(id):[$(id)];L.forEach(e=>{if(e)e.classList.add('tutglow')})});$('btnRedraw').classList.toggle('tutgo',!!st.redraw);
  document.querySelectorAll('#evs .evb').forEach(e=>e.classList.toggle('tutgo',!!st.ev))}
$('coach').addEventListener('click',e=>{if(e.target.closest('#tutMore')){tutKAdd(1);Sfx.select();render();return}if(e.target.closest('#tutBack')){tutKAdd(-1);Sfx.select();render();return}if(e.target.closest('[data-cmin]')&&!e.target.closest('#tutSkip,#tutQuit,#tutBtn')){coachMin=!coachMin;Sfx.select();render();return}if(e.target.closest('#tutSkip')){if(gRun()&&state.tut){state.tut=null;state.bp=Math.max(state.bp,1);Sfx.select();render()}return}if(e.target.closest('#tutQuit')){if(gRun())guideEnd(false);else exitTut(false);return}if(!e.target.closest('#tutBtn'))return;const st=tutStep();if(!st)return;
  if(st.fin){Sfx.win();exitTut(true);return}if(st.act){const a=st.act;state.tut.i++;const n=tutStep();if(n&&n.setup)n.setup(state);a(state);return}tutNext()});
function tutMenuHtml(){const dn=(META.tutDone||{}).zl;
  return`<div class="bar2"><h2>📖 Tutorial</h2><button class="btn sub" data-go="title">Zurück</button></div>${screenArg&&screenArg.done?'<p style="margin:0;color:var(--gold);font-weight:700">🎓 Tutorial geschafft! Jetzt kann ein echter Lauf starten.</p>':''}
    <div class="slot zlm"><h3>${dn?'✅':'🎓'} Dein erster Zoo</h3><p>Ihr Berater <b>Jasper</b> führt Sie durch Ihren ersten Zoo: Frühling und Sommer Tag für Tag, dazu die ersten Herbsttage. Was zu tun ist, leuchtet. Den Rest des Jahres bauen Sie selbst. Etwa 20 Minuten, Ihre Spielstände bleiben unberührt.</p><div class="acts"><button class="btn main" data-tutch="zl">${dn?'Noch einmal spielen':'Tutorial starten'}</button></div></div>
    <button class="btn sub" id="sTut">🖼️ Kurzübersicht in Bildern</button>`}
function deckChips(deck,hl,trimBtn){const m={};deck.forEach(k=>m[k]=(m[k]||0)+1);const ord={gehege:0,attr:1,essen:2,schutz:3,verst:4},ks=Object.keys(m).sort((a,b)=>ord[CARDS[a].cat]-ord[CARDS[b].cat]||CARDS[a].name.localeCompare(CARDS[b].name,'de'));
  const n=c=>cnt(deck,k=>CARDS[k].cat===c);
  return`<div class="deckchips">${ks.map(k=>trimBtn?`<button data-ctrim="${k}" ${trimBtn.ok?'':'disabled'}>${CARDS[k].icon} ${CARDS[k].name}${m[k]>1?' ×'+m[k]:''} ✕</button>`:`<span class="${k===hl?'hl':''}">${ic(CARDS[k])} ${CARDS[k].name}${m[k]>1?' ×'+m[k]:''}</span>`).join('')}<span class="dist">${deck.length} Karten · Gehege ${n('gehege')} · Attraktionen ${n('attr')} · Gastro & Shops ${n('essen')} · Naturschutz ${n('schutz')}</span></div>`}
function runOverviewHtml(run,open){const sl=activeSlot(),cp=sl&&sl.cperks||{},rp=run.perks||{},ks=[...new Set([...Object.keys(cp),...Object.keys(rp)])].filter(k=>CARDS[k]);
  const sp=(run.spec||[]).filter(id=>SPEC[id]),pk=q=>q?[q.a?`+${q.a} B`:'',q.s?`+${q.s} N`:''].filter(Boolean).join(' '):'';
  return`<details class="runov" ${open?'open':''}><summary>🎖️ Dein Lauf bisher</summary>
    ${(run.deck||[]).some(k=>String(k).includes('^'))?`<h4>Verbesserte Karten</h4><div class="rw">${run.deck.filter(k=>String(k).includes('^')&&CARDS[k]).map(k=>`<span>${CARDS[k].name}: ${PRAEG[CARDS[k].pr].text}</span>`).join('')}</div>`:''}
    <h4>Spezialisten ${sp.length}/${maxSpec()}</h4><div class="rw">${sp.length?sp.map(id=>`<span>${SPEC[id].icon} ${SPEC[id].name}: ${SPEC[id].fx.map(l=>`<b>${l.split('|')[0]}</b> ${l.split('|')[1]}`).join(', ')}</span>`).join(''):'<span>noch keine</span>'}</div>
    <h4>Verbesserte Karten</h4><div class="rw">${ks.length?ks.map(k=>`<span>${CARDS[k].icon} ${CARDS[k].name} <b>${CARDS[k].a} B · ${CARDS[k].s} N</b>${pk(cp[k])?` · 🏅 ${pk(cp[k])} dauerhaft`:''}${pk(rp[k])?` · ${pk(rp[k])} im Lauf`:''}</span>`).join(''):'<span>noch keine</span>'}</div>
    <h4>${DECKS[run.deckId||'grund'].icon} ${DECKS[run.deckId||'grund'].name} · ${run.deck.length} Karten</h4></details>`}
/* ---------- Kampagne: Belohnungen zwischen den Zoos ---------- */
function deckWinHtml(ids,btn){return`<div class="deckwin"><div class="dwi">🎴</div><h2>Neues Profil freigeschaltet!</h2>${ids.filter(id=>DECKS[id]).map(id=>{const U=UNLOCK_DECK[id];return`<div class="dwbox"><div class="dwh"><span>${DECKS[id].icon}</span><div><b>${DECKS[id].name}</b><small>${DECKS[id].text||''}</small></div></div>${U?`<p class="dwg">✓ Geschafft: ${fmt(U.goal)} ${U.txt}</p>`:''}${deckChips(deckCards(id))}</div>`}).join('')}<p style="margin:0;color:var(--muted);font-size:13.5px">Du kannst es beim nächsten Zoolatro-Lauf als Profil wählen.</p>${btn}</div>`}
