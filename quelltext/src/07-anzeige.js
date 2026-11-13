//@@ modul: 07-anzeige
function render(){try{return render0()}catch(e){logErr('Anzeige',e);showErr('⚠️ Anzeigefehler: '+String(e&&e.message||e).slice(0,120)+' – bitte „📋 Lauf kopieren“ an Claude schicken.')}}

// 0.64a Ansicht: META.view = auto | hoch | quer. auto: breit+quer → 3 Spalten ab 1180 px, sonst 2 Spalten (wie bisher); hoch: immer Handy-Aufbau; quer: immer 3 Spalten
function viewNowK(){const v=META.view||'auto';let wide=false;try{wide=matchMedia('(min-width:860px) and (min-aspect-ratio:1/1)').matches}catch(e){}const w3=wide&&innerWidth>=1180;return v==='hoch'?'':v==='quer'?'l3':w3?'l3':wide?'l2':''}
function applyView(){const k=viewNowK(),B=document.body;if(!B)return;B.classList.toggle('land',!!k);B.classList.toggle('land3',k==='l3');const tm=document.getElementById('team'),rail=document.getElementById('rail'),side=document.querySelector('.app .side');if(tm&&rail&&side){if(k==='l3'&&tm.parentNode!==rail)rail.appendChild(tm);else if(k!=='l3'&&tm.parentNode!==side){const g=side.querySelector('.goal');side.insertBefore(tm,g)}}}
function railRender(){const rail=document.getElementById('rail');if(!rail||!document.body.classList.contains('land3'))return;if(!state||screen){return}let h='';try{h=zooBoxHtml().replace(/<h2>[\s\S]*?<\/h2>/,'')}catch(e){h=''}const tm=document.getElementById('team');const nh=`<h3>🗺️ Zoo ${(state.zoo||0)+1}</h3><div class="zboxes">${h.replace(/^<div class="zboxes">/,'')}`;if(rail.dataset.h!==nh){const open=[...rail.querySelectorAll('.zbox.tile.open')].map(e=>e.className);rail.dataset.h=nh;[...rail.childNodes].forEach(n=>{if(n!==tm)n.remove()});const d=document.createElement('div');d.className='railz';d.innerHTML=nh;d.querySelectorAll('.tnav,#mClose,#zlBack').forEach(e=>e.remove());/* Knöpfe gehören nur ins Fenster: doppelte ids fingen sonst den Klick-Handler ab (Los geht's reagierte im Querformat nicht) */rail.insertBefore(d,rail.firstChild);d.querySelectorAll('.zbox.tile').forEach(t=>{if(open.includes(t.className+' open'))t.classList.add('open');t.onclick=()=>t.classList.toggle('open')})}if(tm&&tm.parentNode===rail&&rail.lastChild!==tm)rail.appendChild(tm)}
window.addEventListener('resize',()=>{try{applyView();railRender()}catch(e){}});
function render0(){try{applyView()}catch(e){}setTimeout(()=>{try{railRender()}catch(e){}},0);document.body.classList.toggle('fxp',fxOn());if(!FXWARM&&state&&state.phase==='play')fxWarm();document.body.classList.toggle('nb',!META.oldBoard);zoomAuto();
  const se=seOf(state.season);
  $('seasonName').textContent=`${isD4(runOf())?'🧪 ':''}${se.winter?'❄️ ':''}${se.name} · Tag ${Math.min(state.day+1,DAYS)}/${DAYS}`;
  $('dots').innerHTML=Array.from({length:DAYS},(_,i)=>`<span class="dot ${i<state.day?'done':i===state.day?'now':''}"></span>`).join('');
  $('sScore').textContent=fmt(state.seasonScore);$('sTarget').textContent=fmt(se.target);
  const p=Math.min(100,state.seasonScore/se.target*100);$('bar').firstElementChild.style.width=p+'%';$('bar').classList.toggle('full',p>=100);
  $('btnMute').textContent=Sfx.muted?'🔇':'🔊';
  {const nb=(state.spec||[]).length,mkOn=false;
   $('evs').innerHTML=(state.mode==='camp'?`<button class="evb zoob" data-ev="zoo" aria-label="Dein Zoo: alle Regeln anzeigen"><span class="zt">${state.zl?'🃏':'🗺️'} Zoo ${state.zoo+1} ▾</span>${(state.events||[]).filter(e=>EVENTS[e.id]).map(e=>`<span class="zev" data-ev="ev:${e.id}" title="${evName(e)}">${evIcon(e)}</span>`).join('')}</button>${wishBadge()}`:(state.rule&&RULES[state.rule.id]?`<button class="evb rl" data-ev="rule" title="Sonderregel" aria-label="Sonderregel: ${RULES[state.rule.id].name}">${RULES[state.rule.id].icon}</button>`:'')+(state.events||[]).filter(e=>EVENTS[e.id]).map(e=>`<button class="evb" data-ev="ev:${e.id}" title="${evName(e)}" aria-label="Ereignis: ${evName(e)}">${evIcon(e)}</button>`).join(''));renderTeam()}
  $('mkBar').classList.remove('on');
  placeZoomBtn();try{renderPts()}catch(e){}
  const mo=$('money');mo.textContent=`🪙 ${fmt(state.money)}`;mo.classList.toggle('neg',state.money<0);
  {const ub=$('btnUmb'),uw=$('umbWrap'),on=umbOn(),n=on?umbInv().length:0;ub.style.display=on?'':'none';ub.innerHTML=`🧰 <span class="un">Umbau</span>${n?`<b>${n}</b>`:''}`;ub.classList.toggle('on',!!state.umbOpen);const sh=on&&state.umbOpen&&state.phase==='play'&&!modal;uw.style.display=sh?'block':'none';uw.innerHTML=sh?umbTrayHtml(false):''}

  const cur=scoreZoo(state.buildings),h=state.phase==='play'?hypo():null;LASTH=h;void 0;
  if(state.phase!=='scoring'){const y=state.yday;setCounters(y.A,y.S,y.total);$('tLabel').textContent=state.phase==='review'?`Tag ${state.day+1}`:state.day||state.season?'Gestern':'Tagesertrag';
    const pv=state.phase==='review'?state.prevY:null,dl=(id,v)=>{const e=$(id);e.textContent=pv?`${sgn(v)} zu gestern`:'';e.classList.toggle('neg',!!pv&&v<0)};
    dl('dA',pv?y.A-pv.A:0);dl('dS',pv?y.S-pv.S:0);dl('dT',pv?y.total-pv.total:0);if(!pv)$('dT').textContent=state.builtToday&&state.phase==='play'?'heute: ?':''}

  const hl={};let links='',badges='';if(h&&h.cut)for(const id of h.cut)hl[id]='hlcut';
  const addLink=(from,to,neg)=>{links+=`<line class="link ${neg?'neg':''}" x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}"/><circle class="ldot ${neg?'neg':''}" cx="${to[0]}" cy="${to[1]}" r="1.6"/>`};
  const badgeAt=(pt,da,ds)=>{const[x,y]=pct(pt);badges+=`<span class="badge ${da+ds<0?'neg':''}" style="left:${x}%;top:${y}%">${bTxt(da,ds)}</span>`};
  const bigBadge=(pt,c,a,s)=>{const[x,y]=pct(pt),da=a-c.a,ds=s-c.s;
    badges+=`<span class="badge big ${da+ds<0?'neg':''}" style="left:${x}%;top:${y}%"><span class="base">${c.a} B · ${c.s} N</span>${da||ds?`<span>${bTxt(da,ds)}</span>`:''}</span>`};
  const byId=Object.fromEntries(state.buildings.map(b=>[b.id,b]));
  if(h&&h.ok){const gc=centroid(h.cells),ownId=h.up?h.up.id:h.move?h.move.id:-1;
    for(const st of h.r.steps){if(st.id===ownId)continue;const old=cur.steps.find(s=>s.id===st.id),da=st.a-old.a,ds=st.s-old.s;if(!da&&!ds)continue;
      const c=centroid(byId[st.id].cells),neg=da+ds<0;hl[st.id]=neg?'hlneg':'hl';addLink(gc,c,neg);badgeAt(c,da,ds)}
    for(const s of h.src){if(hl[s.id]||s.id===ownId)continue;const c=centroid(byId[s.id].cells),neg=s.da+s.ds<0;hl[s.id]=neg?'hlneg':'hl';addLink(c,gc,neg)}
    if(h.up){const old=cur.steps.find(s=>s.id===h.up.id),[x,y]=pct(gc);
      badges+=`<span class="badge big up" style="left:${x}%;top:${y}%"><span class="base">Ausbau → Stufe ${ROMAN[h.b.lvl]}</span><span>${bTxt(h.own.a-old.a,h.own.s-old.s)}</span></span>`}
    else bigBadge(gc,CARDS[h.b.key],h.own.a,h.own.s)}
  else if(state.info!=null&&byId[state.info]&&state.phase==='play'){const b=byId[state.info],bc=centroid(b.cells),st=cur.steps.find(s=>s.id===b.id);
    for(const s of sourcesOf(b,state.buildings)){const c=centroid(byId[s.id].cells),neg=s.da+s.ds<0;hl[s.id]=neg?'hlneg':'hl';addLink(c,bc,neg);badgeAt(c,s.da,s.ds)}
    bigBadge(bc,CARDS[b.key],st.a,st.s)}

  let cellsSvg='',base='',marks='';const idx=mkIndex(state.buildings);
  const selC=selKey()&&state.phase==='play'?CARDS[selKey()]:null,habSel=selC&&selC.cat==='gehege'?selC.hab:null;
  const CK=META.oldBoard?.86:.955;
  let bshd='';for(const[q,r]of BOARD){const[x,y]=px(q,r),k=hk(q,r),t=TERR.get(k);if(t!=='block'){base+=`<polygon class="base" points="${hexPts(x,y,SZ+.6)}"/>`;bshd+=`<polygon class="bshd" points="${hexPts(x,y+2.2,SZ+1.4)}"/>`}
    if(idx.has(k)){if(t&&t!=='block')marks+=`<circle class="natdot" cx="${x+5.5}" cy="${y-4}" r="1.2"/>`;continue}
    if(t==='block'){const pts=hexPts(x,y,SZ*.8);cellsSvg+=`<polygon class="block" data-terr="block" points="${pts}"/><polygon class="hatch" points="${pts}" pointer-events="none"/><text class="tic blk" x="${x}" y="${y}">🪨</text>`}
    else if(t){const ng=habSel&&habSel!==t&&!hasSpec('rb_wild'),go=habSel&&habSel===t;cellsSvg+=`<polygon class="cell t0" data-q="${q}" data-r="${r}" points="${hexPts(x,y,SZ*CK)}"/><polygon class="terr ${t} ${ng?'nogo':''} ${go?'go':''}" data-terr="${t}" data-q="${q}" data-r="${r}" points="${hexPts(x,y,SZ*CK)}"/><polygon class="tpat ${ng?'nogo':''}" fill="url(#pt-${t})" points="${hexPts(x,y,SZ*CK)}"/>${ng?`<text class="tic nogo" x="${x}" y="${y}">🚫</text>`:''}`}
    else cellsSvg+=`<polygon class="cell t${((q-r)%3+3)%3}" data-q="${q}" data-r="${r}" points="${hexPts(x,y,SZ*CK)}"/>`}
  cellsSvg+=ruleOverlay();marks+=strzMarks(selC,idx)+zlMarks()+z2Marks()+twinMarks()+tutMarks();
  const trm={};if(selC){const sc=selC,isFood=c=>c.cat==='essen'||c.cat==='attr',stressFood=c=>(c.cat==='essen'||c.cat==='attr')&&!ruhigC(c),stressedNow=b=>{try{return(evalB(b,state.buildings,idx).st||0)>=1}catch(e){return false}},has_=(c,t)=>(c.tags||[]).includes(t);
    // Wechselwirkungen: grün = gut, rot = schlecht, gelb = beides
    // dazu allgemein: was ein Gebäude als Nachbar der neuen Karte bringt (Symbol der neuen Karte) und was die neue Karte ihm bringt
    const fake={id:-1,key:selKey(),cells:[],lvl:1},bon=(C,nb,self)=>{try{return(C.bonus&&C.bonus(nb,state.buildings,self))||{}}catch(e){return{}}},b0=bon(sc,[],fake);
    const labs=(c,b)=>{const o=[];
      if(!(TUTNOW&&!TUTTR)){{const jg=hasSpec('rb_jagd');if(has_(sc,'beute')&&has_(c,'raubtier'))o.push(jg?['🦁 ×1,25',1]:['🦁 Zoo ×0,95 N',-1]);if(has_(sc,'raubtier')&&has_(c,'beute'))o.push(jg?['Beute ×1,25',1]:stressedNow(b)?['😣 schon gestresst',0]:['Beute Zoo ×0,95 N',-1])}
      {const py=hasSpec('rb_party');if(stressFood(sc)&&has_(c,'scheu'))o.push(py?['Scheu ×1,25',1]:stressedNow(b)?['😣 schon gestresst',0]:['Scheu Zoo ×0,95 N',-1]);if(has_(sc,'scheu')&&stressFood(c))o.push(py?['🙈 ×'+mxs(pctF(STRESS)),1]:['🙈 Zoo ×0,95 N',-1])}
      if(has_(sc,'show')&&isFood(c)&&!ruhigC(c))o.push([trubelC(c)?'🎭 ×1,5':'🎭 ×1,25',1]);if(isFood(sc)&&!ruhigC(sc)&&has_(c,'show'))o.push([trubelC(sc)?'Show ×'+mxs(pctF(2*STRESS)):'Show ×'+mxs(pctF(STRESS)),1]);}
      if(sc.key==='tierarzt'&&c.cat==='gehege'&&(has_(c,'beute')||has_(c,'scheu')))o.push(['kein Stress',1]);if((has_(sc,'beute')||has_(sc,'scheu'))&&c.key==='tierarzt')o.push(['🩺 kein Stress',1]);
      if(sc.cat==='verst'){const t=verstHit(sc.key,c);if(t)o.push([t,1])}if(c.cat==='verst'){const t=verstHit(b.key,sc);if(t)o.push([sc.icon+' '+t,1])}
      {const r=bon(sc,[b],fake),da=(r.a||0)-(b0.a||0),ds=(r.s||0)-(b0.s||0);if(da||ds)o.push([sc.icon+' '+vTxt(da,ds),da+ds>0?1:-1])}
      {const nb=nbrs(b,idx),x0=bon(c,nb,b),x1=bon(c,[...nb,fake],b),da=(x1.a||0)-(x0.a||0),ds=(x1.s||0)-(x0.s||0);if(da||ds)o.push([vTxt(da,ds),da+ds>0?1:-1])}
      return o};
    // ein Mini-Schild je Gebäude: Zahlen zusammengefasst, Sonderregeln als Symbol
    const mini=L=>{let a=0,n=0;const sym=[];for(const[l]of L){if(/schon gestresst/.test(l)){sym.push('😣 schon gestresst');continue}const m=l.match(/^(?:\S+ )?([+−-]\d+ B)?\s*([+−-]\d+ N)?$/);if(m&&(m[1]||m[2])){if(m[1])a+=+m[1].replace('−','-').replace(' B','');if(m[2])n+=+m[2].replace('−','-').replace(' N','');continue}
        const p=(l.match(/[+−-]\d+ ?% ?[BN]?/)||[''])[0].replace(/ /g,''),ic=/kein Trubel|ohne|stärkstes|% [BN]/.test(l)?'🔆':/Show|🎭/.test(l)?'🎭':/Scheu|🙈/.test(l)?'🙈':/Beute|🦁/.test(l)?'🦷':/Stress/.test(l)?'🩺':'';const xm=(l.match(/×\d+(?:,\d+)?/)||[''])[0];sym.push((ic?`<tspan class="ts">${ic}</tspan>`:'')+(ic==='🩺'?'':p||xm||(/ohne/.test(l)?'❄️':/kein Trubel/.test(l)?'🙈':'')))}
      const num=(a?(a>0?'+':'−')+Math.abs(a)+'B':'')+(n?(n>0?'+':'−')+Math.abs(n)+'N':'');return[num,...[...new Set(sym)]].filter(Boolean).join(' ')};
    for(const b of state.buildings){if(b.id===state.moving)continue;const L=labs(CARDS[b.key],b);if(!L.length)continue;const pos=L.some(x=>x[1]>0),neg=L.some(x=>x[1]<0),cls=pos&&neg?'mix':pos?'pos':neg?'neg':'nul';trm[b.id]=cls;const[cx,cy]=centroid(b.cells);
      const l=mini(L),pl=l.replace(/<[^>]+>/g,''),em=(pl.match(/\p{Extended_Pictographic}/gu)||[]).length,w=(pl.length-em)*2.5+em*4.2+3,y=cy+(b.cells.length>1?5:4.2);marks+=`<g class="trl ${cls}"><rect x="${(cx-w/2).toFixed(2)}" y="${(y-3.1).toFixed(2)}" width="${w.toFixed(2)}" height="6.2" rx="3.1"/><text x="${cx.toFixed(2)}" y="${y.toFixed(2)}">${l}</text></g>`}}
  let blds='';for(const b of state.buildings){const c=K(b),[cx,cy]=centroid(b.cells),[fx,fy]=px(...b.cells[0]),d=dupOf(b,state.buildings);
    blds+=`<g class="bld ${clsOf(c)} ${state.info===b.id?'sel':''} ${hl[b.id]||''} ${trm[b.id]?'trm '+trm[b.id]:''} ${state.moving===b.id?'moving':''}" data-bid="${b.id}" role="button" aria-label="${c.name}">${shapeSvg(b.cells)}${!META.oldBoard&&c.cat==='gehege'&&c.hab&&c.hab!=='arktis'?`<circle class="icbg" cx="${cx}" cy="${cy}" r="${b.cells.length>1?7.2:5.4}"/>`:''}${icSvg(c,cx,cy,b.cells.length>1)}</g>`;
    if(c.tags.includes('bedroht')&&!TUTNOW)marks+=`<circle class="rlmark" cx="${fx-5.5}" cy="${fy-4}" r="1.9"/>`;
    if(d)marks+=`<text class="dupm" x="${cx}" y="${cy+(b.cells.length>1?8.5:6.8)}">${d+1}×</text>`;
    if((b.lvl||1)>1)marks+=`<text class="lvlm" x="${cx}" y="${cy-(b.cells.length>1?8.8:6.6)}">${'★'.repeat(b.lvl-1)}</text>`;if(b.ate)marks+=`<text class="lvlm" x="${cx+6}" y="${cy+6}">🍖${b.ate>1?'×'+b.ate:''}</text>`}
  let ghost='';if(selKey()&&state.preview&&state.phase==='play'){const c=CARDS[selKey()],cells=ghostCells().filter(([q,r])=>ONBOARD.has(hk(q,r)));
    if(cells.length){const[cx,cy]=centroid(cells);ghost=`<g class="ghost ${clsOf(c)} ${h&&h.up?'up':''} ${h&&h.ok?'':'bad'}" data-ghost="1">${shapeSvg(cells)}${icSvg(c,cx,cy,cells.length>1)}</g>`}}
  const svg=$b();svg.setAttribute('viewBox',viewNow().join(' '));renderMini();
  svg.innerHTML=`<defs><pattern id="hatch" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3.2"/></pattern></defs>${bshd}<g class="bgrp">${base}</g><g>${cellsSvg}</g><g>${state.buildings.filter(b=>b.id!==state.moving).map(b=>b.cells.map(([q,r])=>{const[x,y]=px(q,r);return`<polygon class="bsh" points="${hexPts(x,y+1.1,SZ*.93)}"/>`}).join('')).join('')}</g><g>${blds}</g><g>${marks}</g><g>${ghost}</g><g id="fxl">${links}</g>`;
  $('fxh').innerHTML=badges;

  {const edSeen={};$('hand').innerHTML=state.hand.map((k,i)=>{const ed=CARDS[k].ed||'';const zd=state.zl&&!(INSP[state.zl.insp]||{}).pos&&zlDead({key:baseK(k),cells:SHAPES[CARDS[k].shape].cells},state.buildings,false);const c=CARDS[k],poor=!affordable(k),d=cnt(state.buildings,b=>b.key===baseK(k));const rg=rgOf(c.rar);return`<button class="card ${state.selected===i?'sel':''} ${poor?'poor':''} ${c.ms?'ms':''} ${rg} ${drag&&drag.active&&drag.i===i?'dragging':''}" data-i="${i}" ${ed?`data-edl="${EDS[ed].icon}" data-ed="${ed}"`:''} ${zd?`data-dead="${zd==='prof'?'🚫':zd==='good'?'🥇':'❄️'}"`:''} ${state.phase!=='play'?'disabled':''} aria-label="${c.name}, kostet ${costOf(k)} Baupunkte" style="--mkc:color-mix(in srgb,${colOf(c)} 45%,#fff)${ed?';'+holoD(i):''}">${glzHtml(rg,i)}
    <span class="band" style="background:${colOf(c)}"></span><span class="cost">${costDots(k)}</span>${c.tags.includes('bedroht')&&!TUTNOW?'<span class="rl" title="Bedrohte Art (Rote Liste)"></span>':''}${d?`<span class="dupc" title="Schon ${d}× gebaut">${d}×</span>`:''}${costOf(k)>state.bpMax?`<span class="lockc" title="Kostet mehr Baupunkte, als du pro Tag hast">🔒</span>`:''}${perkN(k)?`<span class="medal" title="Dauerhaft verbessert">🏅${perkN(k)}</span>`:''}
    ${miniShape(k,state.selected===i?state.rot:0)}<span class="mk-ic">${ic(c)}${traitsOf(c).slice(0,2).map((t,j)=>`<span class="mk-tr t${j}" title="${TRAITNAME[t]}">${TRAITIC[t]}</span>`).join('')}${scopeOf(c,true)?'<span class="mk-zo" title="wirkt im ganzen Zoo">🌐</span>':''}${habIcs(c)?`<span class="mk-hb" title="Bonus mit Lebensraum ${bldHabs(c).map(h=>HAB[h].label).join(' / ')}">${habIcs(c)}</span>`:''}${catDotHtml(c,'mk-cd'+(habIcs(c)?' lo':''))}${fdOf(k).length?`<span class="mk-fd" title="Futter: ${fdOf(k).map(f=>FOOD[f].name).join(', ')}">${fdOf(k).map(f=>FOOD[f].icon).join('')}</span>`:''}</span>
    <span class="nm">${c.name}</span><span class="mk-v"><b class="a ${c.a?'':'z'}">${c.a}</b><b class="s ${c.s?'':'z'}">${c.s}</b></span><span class="tx">${fxHtml(c)}</span></button>`}).join('')+(TUTNOW&&state.hand.length?'<span class="hph" aria-hidden="true"></span>'.repeat(Math.max(0,HAND-state.hand.length)):'')
    ||`<span style="color:var(--muted);font-size:13px;padding:10px">Keine Karten mehr auf der Hand.</span>`;}
  $('bp').innerHTML=`<span>BP</span> ${Array.from({length:Math.max(state.bpMax,state.bp)},(_,i)=>`<i class="${i<state.bp?'on':''} ${i>=state.bpMax?'x':''}"></i>`).join('')}`;
  $('btnDeck').innerHTML=`🂠 ${state.deck.length} · <span class="wd">Ablage</span><span class="nw">Abl.</span> ${state.discard.length}`;
  {const rb=$('btnRedraw'),fr=rdFree();rb.textContent=fr?'🔄 gratis':'🔄 −1';rb.classList.toggle('free',fr);rb.disabled=!(state.phase==='play'&&(state.bp>=1||fr)&&state.hand.length+state.deck.length+state.discard.length>0);rb.classList.toggle('arm',state.infoProg==='redraw')}
  {const fr=MAXPROGS-state.progs.length;$('progs').innerHTML=(state.progs.length||state.ads.length||state.bpSeason?'<span class="prog lbl" title="Förderung: Förderprogramme (dauerhaft) und Werbung (⏳ diese Jahreszeit)">📣</span>':'')+state.progs.map(id=>`<button class="prog" data-prog="${id}" title="${PROGS[id].name}: ${PROGS[id].text} (dauerhaft)">${PROGS[id].icon} ${progShort(PROGS[id])}</button>`).join('')
    +state.ads.map(id=>`<button class="prog ad" data-ad="${id}" title="${ADS[id].name}: ${ADS[id].text} (diese Jahreszeit)">${ADS[id].icon} ${progShort(ADS[id])} ⏳</button>`).join('')
    +(state.bpSeason?`<button class="prog ad" data-ad="bautrupp" title="Saison-Bautrupp: +1 Baupunkt pro Tag (diese Jahreszeit)">🧱 +1 BP ⏳</button>`:'')
    +(state.progs.length&&fr>0?`<span class="prog empty" title="Freie Plätze für Förderprogramme">＋ ${fr} frei</span>`:'');$('progs').classList.toggle('none',!state.progs.length&&!state.ads.length&&!state.bpSeason)}

  setInfo(infoHtml(h,cur));
  const canBuildMore=state.hand.some(affordable);
  {const mvb=state.phase==='play'&&state.moving==null&&state.selected==null&&state.info!=null&&!!byId[state.info],bb=$('btnBuild');
   bb.disabled=mvb?state.bp<moveCost():!(state.phase==='play'&&h&&h.ok)||(typeof tutPvLock==='function'&&tutPvLock());{const t=mvb?'Umziehen':state.moving!=null?'Setzen':h&&h.up?'Ausbauen':'Bauen';bb.textContent=mvb?'🚚':state.moving!=null?'✔':h&&h.up?'⬆':'🔨';bb.title=t;bb.setAttribute('aria-label',t)}
   document.querySelector('.actions').classList.toggle('mvb',mvb);{const dbn=$('btnDem'),b0=mvb&&byId[state.info],ok=!!b0&&!CARDS[b0.key].ms&&!TUTNOW&&state.mode==='camp';dbn.style.display=ok?'grid':'none';if(ok){dbn.disabled=state.bp<1;const arm=state.demArm===b0.id;dbn.textContent=arm?'💥?':'💥';dbn.classList.toggle('arm',arm);dbn.title=arm?'Nochmal tippen: wirklich abreißen (1 BP)':'Abreißen (1 BP, Karte weg für diesen Zoo)'}}}
  const rv=state.phase==='review',seEnd=rv&&(state.seasonScore>=seOf(state.season).target||state.day===DAYS-1);
  $('btnEnd').disabled=!(state.phase==='play'||rv);
  document.querySelector('.actions').classList.toggle('review',rv);
  {const t=rv?(seEnd?'Saison-Ergebnis ansehen':'Nächsten Tag starten'):'Tag beenden';$('btnEnd').textContent=rv?(seEnd?'🏁':'▶'):'💤';$('btnEnd').title=t;$('btnEnd').setAttribute('aria-label',t);$('btnEnd').classList.toggle('go',rv)}
  $('btnEnd').className='btn '+(rv?'main':(state.phase==='play'&&!canBuildMore?'go':'sub'));
  $('btnRot').disabled=!(state.phase==='play'&&selKey()&&costOf(selKey())>1&&!upTarget());
  $('btnUndo').disabled=!(state.phase==='play'&&(state.moving!=null||(state.undo&&state.undo.length)));
  $('skiphint').textContent='';
  renderLog();renderModal();saveSoon();fitUnderInfo();renderCoach();tutCardRender();tutCheck();hintCheck(cur);
  // 0.75a: Auflage zu Beginn des Zoos groß einblenden (vor dem Besucherwunsch, nicht im Tutorial: dort gibt es keine Auflage)
  {const R=state.rule&&RULES[state.rule.id];bigPop('rulePop',state.ruleIntro&&R&&state.phase==='play'&&!modal&&!screen?`<div class="wpi">${R.icon}</div><h3>Auflage: ${R.name}</h3><p class="wpr">${R.text(state.rule)}</p><p class="wph">Sie gilt für den ganzen Zoo. Oben am Zoo-Knopf kannst du sie jederzeit nachlesen.</p><button class="btn main" data-bpok>Los geht's</button>`:'',()=>{state.ruleIntro=0;render()})}
  // 0.75a: Überraschungsfutter groß einblenden (Karte schon mit der neuen Prägung)
  {const u=(state.fsRev||[])[0];bigPop('fsRevPop',u&&!screen&&!state.surprise&&!document.getElementById('surPop')?fsRevHtml(u):'',()=>{state.fsRev.shift();render()})}
  {const U=state.surprise;bigPop('surPop',U&&CARDS[U.key]&&PRAEG[U.pg]&&!screen?`<div class="wpi">🎁</div><h3>Überraschung!</h3><div class="bpcard">${offerCard(U.key,0).replace(/ data-pick="0"/,' tabindex="-1"')}</div><p class="wpw">${PRAEG[U.pg].icon} ${PRAEG[U.pg].name}</p><p class="wpr">${PRAEG[U.pg].text}</p><button class="btn main" data-bpok>Weiter ▸</button>`:'',()=>{state.surprise=null;render()})}
  // 0.89: Besucherwunsch zu Beginn der Jahreszeit einmal groß einblenden
  {let wp=$('wishPop');const W=state.wish,show=state.wishIntro&&!state.ruleIntro&&W&&WISH[W.id]&&state.phase==='play'&&!modal&&!screen;
   if(!show){if(wp)wp.remove()}else if(!wp){const D=WISH[W.id];wp=document.createElement('div');wp.id='wishPop';wp.className='wishpop';
    wp.innerHTML=`<div class="wpc"><div class="wpi">🌟</div><h3>Besucherwunsch im ${seOf(state.season).name}</h3><p class="wpw">${D.ic(W)} ${D.t(W)}</p><p class="wpr">Belohnung: <b>${wRwTxt(D.rw)}</b></p><p class="wph">${D.end?'Wird am Ende der Jahreszeit geprüft.':'Wird am Ende jedes Tages geprüft.'} Oben am Zoo-Knopf siehst du den Stand.</p><button class="btn main" id="wpOk">Los geht's</button></div>`;
    document.body.appendChild(wp);$('wpOk').onclick=()=>{state.wishIntro=0;W.seen=1;Sfx.select();wp.remove();render();setTimeout(popNext,350);const z=document.querySelector('.evb.zoob');if(z){z.classList.remove('pulse');void z.offsetWidth;z.classList.add('pulse')}}}}
  if(state.wishFx&&state.phase==='play'&&!modal){state.wishFx=0;const W=state.wish;if(W&&WISH[W.id]){const bn=document.createElement('div');bn.className='mbanner wban';bn.innerHTML=`<b>🌟 Wunsch erfüllt!</b><span>${WISH[W.id].ic(W)} ${WISH[W.id].t(W)} · ${W.got||''}</span>`;const ba=document.querySelector('.boardarea');if(ba){ba.appendChild(bn);setTimeout(()=>bn.remove(),3200)}}}
}
// Aufzählung der Karteneffekte
// Kurztext für die Sponsoren-Zeile: "×1,2 B", "+20 % Savanne", "+40 % Gastro"
const PSHORT=[[/Savannen-Gehege/,'Savanne'],[/Wasser-Gehege/,'Wasser'],[/Dschungel-Gehege/,'Dschungel'],[/Wüsten-Gehege/,'Wüste'],[/Arktis-Gehege/,'Arktis'],[/Gebirgs-Gehege/,'Gebirge'],[/bedrohte/,'bedrohte'],[/Gastro-Gebäude/,'Gastro'],[/Attraktion/,'Attraktionen'],[/Naturschutz-Gebäude/,'Naturschutz'],[/große/,'große Gehege'],[/1-Feld/,'1-Feld-Gehege'],[/Naturfläche/,'Naturfläche']];
function progShort(P){try{const l=(P.fx||[])[0]||'',v=l.split('|')[0],t=l.split('|')[1]||'';if(/^×/.test(v))return v.replace(' für den ganzen Zoo','');const m=PSHORT.find(([r])=>r.test(t));return(v.match(/^[+−-]\d+ %/)||[v])[0]+(m?' '+m[1]:'')}catch(e){return P.name}}
function fxLine(l){const i=l.indexOf('|'),v=l.slice(0,i),t=l.slice(i+1),neg=/^[−-]/.test(v),word=/^[A-Za-zÄÖÜäöü]/.test(v);
  const cls=word?'w':neg?'neg':(v.includes('B')&&v.includes('N'))?'bn':v.includes('N')?'n':'b';return`<li><b class="${cls}">${v}</b> ${t}</li>`}
// Zahlen in Eigenschafts-Texten an das Profil anpassen (Ruhezoo: Stress doppelt, Manege: Show doppelt)
function fxDyn(t){return t}
function fxHtml(c,full){const L=(c.fx||[]).filter(l=>!(TUTNOW&&!TUTTR&&(TAGL().has(l)||/Beutetier|Raubtier|Showtier|^🦷|^🐇|^🙈|^🎭|^🤫|^🎉/.test(l)))).map(fxDyn);
  if(full&&c.hab){L.push(`+1 B|je Nachbar-Gehege mit Lebensraum ${HAB[c.hab].label}`,`+1 N|je Feld auf ${HAB[c.hab].label}-Naturfläche`);if(CTX.winter&&cold(c.hab))L.push('−1 B|im Winter (Kälte)');if(CTX.season===1&&hot(c.hab))L.push('−1 B|im Sommer (Hitze)')}
  if(!L.length)return`<ul class="fx"><li class="dim">Keine Spezialwirkung</li></ul>`;return`<ul class="fx">${L.map(fxLine).join('')}</ul>`}
function bTxt(da,ds){const p=[];if(da)p.push(`<span class="${da>0?'a':'n'}">${da>0?'+':'−'}${Math.abs(da)} B</span>`);if(ds)p.push(`<span class="${ds>0?'s':'n'}">${ds>0?'+':'−'}${Math.abs(ds)} N</span>`);return p.join(' ')}
// Wirkungsart: auf Nachbarn oder auf den ganzen Zoo
function scopeOf(c,short){const t=(c.fx||[]).join(' '),z=/ganzen Zoo|im Zoo\b|im Zoo |je Gehege im ganzen|im ganzen Zoo/.test(t)||!!c.mult;return z?`<span class="scope zo" title="wirkt im ganzen Zoo">${short?'🌐':'🌐 wirkt im ganzen Zoo'}</span>`:''}
function tagHtml(c){const t=c.hab?`${habBadge(c.hab)} ${HAB[c.hab].label}-Gehege`:CAT[c.cat].label;return`<span class="tag" style="background:${colOf(c)}">${t} · ${SHAPES[c.shape].label}</span>${traitsOf(c).map(t=>`<span class="tag" style="background:#e9e2cf">${TRAITIC[t]} ${TRAITNAME[t]}</span>`).join('')}${c.tags.includes('bedroht')&&!TUTNOW?'<span class="tag" style="background:var(--bad);color:#fff">Rote Liste</span>':''}${c.tags.includes('einmalig')?'<span class="tag" style="background:var(--gold)">Einmalig</span>':''}`}
const vTxt=(a,s)=>[a?`${a>0?'+':'−'}${Math.abs(a)} B`:'',s?`${s>0?'+':'−'}${Math.abs(s)} N`:''].filter(Boolean).join(' ');
const LOWH=()=>{try{return window.innerHeight<760}catch(e){return false}};let DET=false;try{DET=localStorage.getItem('zoodeck-det')==='1'}catch(e){}
const TAGL=()=>new Set(Object.values((TXT.de||{}).tagfx||{})),fxOwn=c=>{const T=TAGL();return derive(c,{fx:(c.fx||[]).filter(l=>!T.has(l))})},fxTags=c=>{const T=TAGL();return{fx:(c.fx||[]).filter(l=>T.has(l))}};
const detX=inner=>innerWidth>=900?inner:detH(inner);
function setInfo(x){const el=$('info');el.innerHTML=x;const p=x.startsWith('<!--paper-->');el.classList.toggle('paper',p);if(p&&state.selected!=null&&state.hand[state.selected]){const c=CARDS[state.hand[state.selected]];el.style.setProperty('--mkc',`color-mix(in srgb,${colOf(c)} 55%,#fff)`)}}
const detH=inner=>`<button class="detb" data-det="1">Details ${DET?'▴':'▾'}</button>${DET?inner:''}`;
// 0.87: in der kompakten Vorschau-Leiste klappt das Tiersymbol die Rechnung auf (kein Knopf)
const detP=inner=>DET?`<div class="detin">${inner}</div>`:'';
// vollständige Rechnung der Bauvorschau: Karte, Nachbarn, Multiplikatoren, Zoo
// Multiplikatoren vorher/nachher vergleichen (Schlüssel: Quelle + Symbol + Name ohne Zähler)
function multDiff(r0,r1){const k=m=>(m.id!=null?m.id:'')+'|'+(m.icon||'')+'|'+String(m.label).split(':')[0],x=v=>'×'+mxs(v),fv=m=>`${m.ma?x(m.ma)+' B':''}${m.ma&&m.ms?' ':''}${m.ms?x(m.ms)+' N':''}`,M0=new Map(r0.mults.map(m=>[k(m),m])),M1=new Map(r1.mults.map(m=>[k(m),m])),L=[],lost=[],added=[];
  for(const[q,m]of M1){const o=M0.get(q);if(!o){L.push(`✅ ${m.label} ${fv(m)} kommt dazu`);added.push(m)}else L.push(fv(o)!==fv(m)?`${m.label} ${fv(o)} → ${fv(m)}`:`${m.label} ${fv(m)}`)}
  for(const[q,m]of M0)if(!M1.has(q)){L.push(`❌ ${m.label} ${fv(m)} fällt weg`);lost.push(m)}return{L,lost,added,fv}}
function multWarn(h,cur){if(!h||!h.r||!h.ok||!cur.steps.length)return'';const d=multDiff(cur,h.r);return d.lost.length?`<p class="resbad">⚠️ Fällt weg: ${d.lost.map(m=>`${m.icon||''} ${m.label} ${d.fv(m)}`).join(', ')}</p>`:''}
// Warum ändert sich ein anderes Gehege/Gebäude? Vergleicht die Einzelposten vorher/nachher und nennt den größten Unterschied
const whyLab=l=>String(l).replace(/ \+\d+ %$/,'').replace(/ \(\d+ andere Arte?n?( daneben)?\)$/,'').replace(/:.*$/,'').trim();
function chgWhy(b0,bs0,b1,bs1){const P=(b,bs)=>{const p=[];evalB(b,bs,mkIndex(bs),p);const m=new Map();for(const x of p){const k=whyLab(x.label),o=m.get(k)||{a:0,s:0};o.a+=x.a;o.s+=x.s;m.set(k,o)}return m};
  const m0=P(b0,bs0),m1=P(b1,bs1),d=[];for(const k of new Set([...m0.keys(),...m1.keys()])){const o=m0.get(k)||{a:0,s:0},n=m1.get(k)||{a:0,s:0},da=n.a-o.a,ds=n.s-o.s;if(da||ds)d.push([k,Math.abs(da)+Math.abs(ds)])}
  d.sort((x,y)=>y[1]-x[1]);return d.slice(0,2).map(x=>x[0]).join(', ')}
function calcHtml(h,cur){if(!h||!h.r||!h.ok)return'';const id=h.up?h.up.id:h.move?h.move.id:-1,z={a:0,s:0},o0=cur.steps.find(x=>x.id===id)||z,o1=h.r.steps.find(x=>x.id===id)||z,adjD={a:(o1.adjA||0)-(o0.adjA||0),s:(o1.adjS||0)-(o0.adjS||0)},own={a:o1.a-o0.a-adjD.a,s:o1.s-o0.s-adjD.s};let upL='';if(h.up){own.a+=adjD.a;own.s+=adjD.s;upL=o1.adjL||'';adjD.a=0;adjD.s=0}
  const byId=Object.fromEntries(state.buildings.map(b=>[b.id,b])),nbs=[],all1=h.up||h.move?state.buildings.map(x=>x.id===(h.up||h.move).id?h.b:x):[...state.buildings,h.b],why1=b0=>{try{const b1=all1.find(x=>x.id===b0.id)||b0;return chgWhy(b0,state.buildings,b1,all1)}catch(e){return''}};let na=0,ns=0,adj=0,far=0;const near=new Set();for(const[q,r]of h.cells||[])for(const[dq,dr]of DIRS)near.add(hk(q+dq,r+dr));
  for(const st of h.r.steps){if(st.id===id)continue;const q=cur.steps.find(x=>x.id===st.id);if(!q||!byId[st.id])continue;const da=st.a-q.a,ds=st.s-q.s;if(da||ds){na+=da;ns+=ds;{const w=why1(byId[st.id])||((st.adjA||0)!==(q.adjA||0)||(st.adjS||0)!==(q.adjS||0)?((byId[st.id].lvl||1)>1?'Ausbau-Anteil':'Mehrfach-Anteil'):'');nbs.push(`${CARDS[byId[st.id].key].name} ${vTxt(da,ds)}${w?` <i class="cwhy">(${w})</i>`:''}`)}if(byId[st.id].cells.some(([q,r])=>near.has(hk(q,r))))adj++;else far++}}
  let why='';if(h.b&&!h.up&&!h.move&&CARDS[h.b.key].cat==='gehege'&&(CTX.spec||[]).includes('sammler')){const hs=bs=>new Set(bs.filter(n=>isCat(n,'gehege')).map(n=>K(n).hab)).size;if(hs(state.buildings)<4&&hs([...state.buildings,h.b])>=4)why='🧬 Sammlerin: Jetzt hat dein Zoo alle Lebensräume, jedes Gehege bekommt +1 N. '}
  const raw=r=>({a:r.steps.reduce((t,x)=>t+x.a,0),s:r.steps.reduce((t,x)=>t+x.s,0)}),r0=raw(cur),r1=raw(h.r),f=r=>({a:r.mults.reduce((t,m)=>t*(m.ma||1),1),s:r.mults.reduce((t,m)=>t*(m.ms||1),1)}),f0=f(cur),f1=f(h.r),x=v=>'×'+mxs(v),v=(a,b)=>vTxt(a,b)||'±0';
  const ml=multDiff(cur,h.r).L,chg=cur.steps.length>0&&(Math.abs(f0.a-f1.a)>.005||Math.abs(f0.s-f1.s)>.005),hasM=Math.abs(f1.a-1)>.005||Math.abs(f1.s-1)>.005||chg;
  const row=(l,val,sub,cls)=>`<tr class="${cls||''}"><td>${l}${sub?`<small>${sub}</small>`:''}</td><td>${val}</td></tr>`;
  let t=row(h.up?'Ausbau':h.move?'Umzug':'Diese Karte',v(own.a,own.s),upL);
  if(nbs.length)t+=row(far?(adj?'Nachbarn und andere':'Andere Gehege/Gebäude'):'Nachbarn',v(na,ns),why+nbs.join(' · '));
  if(adjD.a||adjD.s)t+=row(h.up?'Ausbau-Anteil':'Mehrfach gebaut',v(adjD.a,adjD.s),o1.adjL||'');
  if(nbs.length||adjD.a||adjD.s)t+=row('Zwischensumme',v(own.a+na+adjD.a,own.s+ns+adjD.s),'','sub');
  if(hasM)t+=row('Multiplikatoren',chg?`${x(f0.a)} → ${x(f1.a)} B · ${x(f0.s)} → ${x(f1.s)} N`:`${x(f1.a)} B · ${x(f1.s)} N`,ml.join(' · ')+(chg?` · Der Bau ändert einen Multiplikator, deshalb ${f1.a*f1.s>=f0.a*f0.s?'wächst':'schrumpft'} der ganze Zoo.`:''));
  t+=row('Zoo',v(h.r.A-cur.A,h.r.S-cur.S),'','sum');
  return`<table class="calc">${t}</table>`}
function brkHtml(c,brk){return`<div class="brk"><span>Grundwert <b>${c.a} B · ${c.s} N</b></span>${brk.parts.map(p=>`<span class="${p.a+p.s<0?'m':'p'}">${p.label} ${vTxt(p.a,p.s)}</span>`).join('')}<span>= <b>${brk.a} B · ${brk.s} N</b></span></div>`}
const habLine=c=>c.hab?` Lebensraum: +1 B je ${HAB[c.hab].label}-Nachbar, +1 N je Feld auf ${HAB[c.hab].label}-Naturfläche.${cold(c.hab)?' Im Winter −1 B (Kälte).':''}${hot(c.hab)?' Im Sommer −1 B (Hitze).':''}`:'';
// was eine Wirkung im jetzigen Zoo bringt (vor Multiplikatoren)
function yieldOf(fn){let a=0,s=0,n=0;const idx=mkIndex(state.buildings);for(const b of state.buildings){let e=fn(b,CARDS[b.key],nbrs(b,idx));if(e&&(e.pa||e.ps||e.fa||e.fs)){const v=evalB(b,state.buildings,idx);const n=e.n==null?1:e.n,fa=e.fa!=null?e.fa:pctF(e.pa||0),fs=e.fs!=null?e.fs:pctF(e.ps||0);e={a:Math.round(v.pa0*(fa**n-1)),s:Math.round(v.ps0*(fs**n-1))}}if(e&&(e.a||e.s)){a+=e.a||0;s+=e.s||0;n++}}return{a,s,n}}
const yieldTxt=y=>`<b>${vTxt(y.a,y.s)||'nichts'}</b>${y.n?` · ${y.n} Gehege/Gebäude`:''}`;
function yieldHtml(P){if(P.per)return`<p class="hint">Aktuell pro Tag: ${yieldTxt(yieldOf(P.per))} (vor Multiplikatoren)</p>`;
  if(P.mult){const m=P.mult(state.buildings);return`<p class="hint">Aktuell: <b>${m?'aktiv':'noch nicht aktiv'}</b></p>`}return''}
const billHtml=inc=>inc&&inc.entry!=null?`<div class="bill"><span>🎟️ Eintritt ${sgn(inc.entry)}</span><span class="${inc.care<0?'neg':''}">🌿 Pflege ${sgn(inc.care)}</span>${inc.interest?`<span class="neg">🏦 Kredit ${sgn(inc.interest)}</span>`:''}${inc.spec?`<span class="${inc.spec<0?'neg':''}">👥 Spezialisten ${sgn(inc.spec)}</span>`:''}${inc.kar?`<span>🐪 Karawanen-Oase ${sgn(inc.kar)}</span>`:''}${inc.gas?`<span>🍿 Gastro ${sgn(inc.gas)}</span>`:''}<span class="sum ${inc.total<0?'neg':''}">Kasse ${sgn(inc.total)} 🪙</span></div>`:`<div class="bill"><span class="sum">Kasse ${sgn((inc||{}).total||0)} 🪙</span></div>`;
// großes Ergebnis beim Platzieren: eigener Wert, Wirkung auf den ganzen Zoo und auf die Kasse
// 0.53a: kompakter Kasten – Chips ✅ ❌ ⚠️ (ohne Buchstabe = B und N)
const chipEsc=t=>String(t).replace(/</g,'&lt;');
function chipIc(L){const m=String(L).match(/^(?:\p{Extended_Pictographic}|★)[\uFE0F\u200D\p{Extended_Pictographic}]*/u);return m?m[0]:''}
function chipV(p){const L=String(p.label),ex=L.match(/(?:^|[\s:])(B|N)\s?×|×\s?[\d.,]+\s?(B|N)\b|%\s?(B|N)\b|%\s(Besucher|Natur)/),u=ex?' '+String(ex[1]||ex[2]||ex[3]||ex[4])[0]:'',fm=L.match(/×\s?(\d+(?:[.,]\d+)?)/),pm=L.match(/([+−-]\s?\d+)\s?%/);return fm?'×'+fm[1].replace('.',',')+u:pm?pm[1].replace(/\s/g,'').replace('-','−')+' %'+u:vTxt(p.a,p.s)}
function chipsOf(parts){const g=[],b=[],n=[];for(const p of parts||[]){const L=String(p.label),ic=chipIc(L);if(/😣/.test(L)){b.push({h:`😣 ×${mxs(1-STRZ)} N`,w:1e9,t:L});continue}const w=Math.abs(p.a||0)+Math.abs(p.s||0);if(!w)continue;const o={h:(ic?ic+' ':'')+chipV(p),w,t:L};if((p.a||0)+(p.s||0)<0)b.push(o);else if(ic)g.push(o);else n.push(o)}const so=x=>x.sort((p,q)=>q.w-p.w);return{g:so(g),b:so(b),n}}
const mkDetB=()=>`<button class="detb mkdet" data-det="1">Details ${DET?'▴':'▾'}</button>`;
function chipRow(cs,warn){let h='';if(cs.g.length)h+='<span class="mklab">✅</span>'+cs.g.map(o=>`<span class="mkc g" title="${chipEsc(o.t||'')}">${o.h}</span>`).join('');if(cs.b.length)h+='<span class="mklab">❌</span>'+cs.b.map(o=>`<span class="mkc b" title="${chipEsc(o.t||'')}">${o.h}</span>`).join('');if(warn&&warn.length)h+='<span class="mklab">⚠️</span>'+warn.map(x=>`<span class="mkc w">${x}</span>`).join('');return`<div class="mkchips">${h}${mkDetB()}</div>`}
function detChips(c,bk){return`<div class="mkchips"><span class="mkc n">Grund ${c.a} B · ${c.s} N</span>${(bk.parts||[]).filter(p=>p.a||p.s||/😣/.test(p.label)).map(p=>{const L=String(p.label),neg=(p.a||0)+(p.s||0)<0||/😣/.test(L);return`<span class="mkc ${neg?'b':chipIc(L)?'g':'n'}">${chipEsc(L)}${p.a||p.s?' '+vTxt(p.a,p.s):''}</span>`}).join('')}<span class="mksum">= ${bk.a} B · ${bk.s} N</span></div>`}
const mkHead=(c,right,lvl)=>`<div class="mkh">${ic(c)} <span class="mkn">${c.name}</span>${lvl&&lvl>1?` <span class="tag" style="background:var(--gold)">${ROMAN[lvl]}</span>`:''}<span class="mktr">${traitsOf(c).map(t=>`<span title="${TRAITNAME[t]}">${TRAITIC[t]}</span>`).join('')}</span><small>${right}</small></div>`;
const mkWhere=c=>(c.hab?HAB[c.hab].icon+' '+HAB[c.hab].label:CAT[c.cat].label)+' · '+(SHAPES[c.shape]?SHAPES[c.shape].label:'');
function prevHtml(h,cur,c,k){const dA=h.r.A-cur.A,dS=h.r.S-cur.S,dK=dayIncome(h.r.A,h.r.S,state.money).base-dayIncome(cur.A,cur.S,state.money).base;
  const cs=chipsOf(h.brk.parts),warn=[],kk=m=>(m.id!=null?m.id:'')+'|'+(m.icon||'')+'|'+String(m.label).split(':')[0],icM=m=>{if(m.icon)return m.icon;const b=m.id!=null&&[...state.buildings,h.b].find(x=>x.id===m.id);return b?CARDS[b.key].icon:''},fvU=m=>m.ma&&m.ms?'':m.ma?' B':' N';
  if(cur.steps.length){const M0=new Map(cur.mults.map(m=>[kk(m),m])),M1=new Map(h.r.mults.map(m=>[kk(m),m]));
    for(const[q,m]of M1){const o=M0.get(q),v1=m.ma||m.ms||1;if(!o){(v1<1?cs.b:cs.g).unshift({h:`${icM(m)} ×${mxs(v1)}${fvU(m)}`,w:1e8,t:m.label});continue}const v0=o.ma||o.ms||1;if(v1<v0)warn.push(`${icM(m)} ×${mxs(v0)}→${mxs(v1)}${fvU(m)}`);else if(v1>v0)cs.g.unshift({h:`${icM(m)} ×${mxs(v0)}→${mxs(v1)}${fvU(m)}`,w:1e8,t:m.label})}
    for(const[q,m]of M0)if(!M1.has(q))warn.push(`<s>${icM(m)} ×${mxs(m.ma||m.ms||1)}${fvU(m)}</s>`)}
  {const dn=cnt(state.buildings,b=>b.key===baseK(k));if(dn)warn.push(`🔁 ${dn}× · ×${mxs(dupW(dn))}`)}
  let nbH='';{const B0=new Map(cur.steps.map(x=>[x.id,x])),L=[];let ta=0,ts=0;for(const st of h.r.steps){if(st.id===h.b.id)continue;const o=B0.get(st.id),da=Math.round(st.a-(o?o.a:0)),ds=Math.round(st.s-(o?o.s:0));if(!da&&!ds)continue;ta+=da;ts+=ds;const bb=state.buildings.find(x=>x.id===st.id);if(bb)L.push({ic:CARDS[bb.key].icon,da,ds,w:Math.abs(da)+Math.abs(ds)})}
    if(L.length){L.sort((p,q)=>q.w-p.w);nbH=`<div class="mkchips"><span class="mknb ${ta+ts<0?'neg':''}" style="margin-left:0">Nachbarn ${vTxt(ta,ts)}</span>${L.slice(0,3).map(x=>`<span class="mkc ${x.da+x.ds<0?'b':'g'}">${x.ic} ${vTxt(x.da,x.ds)}</span>`).join('')}</div>`}}
  const zn=zlNote(h,c)||'',bad=(zn.match(/<p class="resbad"[\s\S]*?<\/p>/g)||[]).filter(x=>!/😣/.test(x)).join(''),rest=zn.replace(/<p class="resbad"[\s\S]*?<\/p>/g,''),tail=resHtml(h,cur).replace(/^<div class="resbig">[\s\S]*?<\/div>/,'');
  return`${lockTxt(k)}<div class="mk">${mkHead(c,mkWhere(c)+' · '+costTxt(k))}<div class="mkr mkr2"><span class="mkv"><i>Karte</i><span class="mkbig"><span class="a">${sgn(h.own.a)} B</span> <span class="s">${sgn(h.own.s)} N</span></span></span><span class="mkv"><i>Zoo</i><span class="mkbig ${dA+dS<0?'neg':''}">${dA||!dS?`<span class="a">${sgn(dA)} B</span>`:''}${dS?` <span class="s">${sgn(dS)} N</span>`:''}</span></span>${dK?`<span class="mknb ${dK<0?'neg':''}">${sgn(dK)} 🪙</span>`:''}</div>${chipRow(cs,warn)}${nbH}${bad}${tail}${DET?detChips(c,h.brk)+(()=>{const ow=fxOwn(c);return ow.fx.length?`<div class="mkfx">${fxHtml(ow)}</div>`:''})()+rest+calcHtml(h,cur):''}</div>`}
function resHtml(h,cur,own){const dA=h.r.A-cur.A,dS=h.r.S-cur.S,dK=dayIncome(h.r.A,h.r.S,state.money).base-dayIncome(cur.A,cur.S,state.money).base,c=CARDS[h.b.key];let mh='';
  if(!h.up&&!h.move&&!c.ms)for(const t in MILE){const M=MILE[t];if(!M.f(c)||(state.miles||{})[t]||state.buildings.some(x=>x.key===h.b.key))continue;const n=mileCount(state.buildings,t)+1;if(n===M.n)mh=`<p class="milehint">🏅 Meilenstein erreicht: morgen gibt es eine besondere Karte!</p>`;else if(n===M.n-1)mh=`<p class="milehint">🏅 Danach fehlt noch 1 weitere ${M.icon}-Art bis zum Meilenstein.</p>`}
  return`<div class="resbig"><span class="a">${own?sgn(own.a):h.own.a} B</span><span class="s">${own?sgn(own.s):h.own.s} N</span><span class="zz ${dA+dS<0?'neg':''}"><i>Zoo</i> ${dA||!dS?`<b class="a">${sgn(dA)} B</b>`:''}${dS?` <b class="s">${sgn(dS)} N</b>`:''}</span>${dK?`<span class="kz ${dK<0?'neg':''}" title="Kasse pro Tag">${sgn(dK)} 🪙</span>`:''}</div>${mh}${(()=>{try{if(h.up||!h.b)return'';const allH=h.move?state.buildings.map(x=>x.id===h.move.id?h.b:x):[...state.buildings,h.b];return habBreakTxt(allH,h.b)}catch(e){return''}})()}`}
function mileInfoHtml(){const v=state.zl?vielfalt(state.buildings):null;return`<h3>🏅 Meilensteine</h3><p class="hint">Ab ${MILE.wasser.n} <b>verschiedenen</b> Gehege-Arten eines Lebensraums oder ${MILE.attr.n} verschiedenen Attraktionen, ${MILE.essen.n} Gastro-Gebäuden, ${MILE.schutz.n} Naturschutz-Gebäuden oder je ${MILE.bunt.n} verschiedenen aus allen vier Kategorien (🎨) gibt es am nächsten Morgen eine besondere Karte. Gleiche Gehege/Gebäude zählen nur einmal.</p><div class="mile">${mileKeys().map(t=>{const M=MILE[t],n=Math.min(M.n,mileCount(state.buildings,t)),ok=(state.miles||{})[t];return`<span class="${ok?'ok':''}">${M.icon} ${ok?'✓ '+CARDS[M.card].name:n+'/'+M.n}</span>`}).join('')}</div>${v?`<p class="hint" style="margin-top:6px">🎨 <b>Vielfalt</b> (Arten je Lebensraum): ${vfTxt(v)}${v.f>1?` · ×${String(+v.f.toFixed(2)).replace('.',',')} Natur`:' · ab je 2 Arten in allen Lebensräumen ×1,1 Natur'}</p>`:''}`}
function moneyInfoHtml(cur){const inc=dayIncome(cur.A,cur.S,state.money),row=(l,v)=>`<tr><td>${l}</td><td class="${v<0?'neg':''}">${sgn(v)}</td></tr>`;
  return`<h3>🪙 Kasse: ${fmt(state.money)} Taler</h3><p class="hint">Wenn du jetzt den Tag beendest:</p><table class="billt">${row(`🎟️ Eintritt · 1 je ${ENTRY} Besucher (${fmt(cur.A)} B)${state.zl?'<br><small style="color:var(--muted)">Zoolatro: die ersten 30 Taler voll, die nächsten 60 halb, darüber ein Viertel</small>':''}`,inc.entry)}${row(`🌿 Pflege · −1 je 8 Natur (${fmt(cur.S)} N)`,inc.care)}${inc.interest?row('🏦 Kredit · −1 je 10 Taler Schulden',inc.interest):''}${inc.don?row('💰 Spendenbox',inc.don):''}${inc.spec?row('👥 Spezialisten',inc.spec):''}${inc.kar?row('🐪 Karawanen-Oase',inc.kar):''}${inc.snk?row('🥜 Besuchersnack',inc.snk):''}${inc.gas?row('🍿 Gastro',inc.gas):''}<tr class="sum"><td>Heute</td><td>${sgn(inc.total)} 🪙</td></tr></table>
    <p class="hint">Erreichst du das Saisonziel früher, gibt es 5 Taler je übrigem Tag. Geld brauchst du nur für den Shop und fürs Neu-Würfeln der Kartenauswahl.${state.money<0?' <b style="color:#ffb3b5">Mit Schulden kannst du nichts kaufen.</b>':''}</p>`}
// 0.89: Team-Reihe oben (bis 5 Spezialisten), antippen = Details, ziehen = umsortieren
const TIERC=['','#7bc96f','#8a7cff','#ffd166'];
function specVal(id){const S=SPEC[id];if(!S)return['','g'];if(S.grw)return[`×${mxs(grwF(S.grw))}`,S.grw==='nat'?'n':'b'];if(S.luck)return[chTxt(S.luck),'g'];if(id==='glueckspilz')return['×2 🎲','g'];if(id==='lotto'&&state&&state.lottoH)return[HAB[state.lottoH].icon+' ×2','b'];if(id==='lotto')return['–','g'];if(id==='doppel'){const L=state.spec||[],n=L[L.indexOf(id)+1];return[n&&SPEC[n]?'= '+SPEC[n].icon:'–','g']}if(S.mult){let m=null;try{m=S.mult(state.buildings)}catch(e){}const f=m?(m.ma||m.ms||1):1;return['×'+mxs(f),m&&m.ms&&!m.ma?'n':'b']}
  const v=((S.fx||[])[0]||'').split('|')[0].replace(' und ','/').replace(/(\d) %/,'$1%').trim();return[v.length>9?v.slice(0,9):v,/N\b/.test(v)&&!/B/.test(v)?'n':/B/.test(v)?'b':'g']}
let TDRAG=null;
function renderTeam(){const el=$('team');if(!el)return;const on=state&&state.mode==='camp'&&!(state.zl==null&&!(state.spec||[]).length);el.classList.toggle('none',!on);if(!on){el.innerHTML='';return}
  const L=(state.spec||[]).filter(id=>SPEC[id]),st=strike();
  el.innerHTML=L.map(id=>{const S=SPEC[id],[v,c]=specVal(id),tag=S.rb?'RB':S.zl&&(S.hg||S.grw||id==='z_rekord'||id==='z_bank')?'wächst':'';const off=!teamAct().includes(id);return`<button class="tm ${st?'st':''} ${off?'off':''} ${S.tier>=3&&!S.rb?'t3':''} ${rgSpec(S)} ${state.infoProg==='sp:'+id?'on':''}" data-sp="${id}" style="--rc:${S.rb?'#ff6b9d':TIERC[S.tier]||'#8a7cff'}" title="${S.name}" aria-label="${S.name}">${glzHtml(rgSpec(S),glzI(id))}${tag?`<span class="tc">${tag}</span>`:''}<span class="ti">${S.icon}</span><span class="tv ${c}">${st?'🪧':v}</span></button>`}).join('')
   +Array.from({length:Math.max(0,maxSpec()-L.length)},()=>`<span class="tm empty" title="Freier Platz im Team">＋</span>`).join('')}
$('team').addEventListener('click',e=>{const b=e.target.closest('[data-sp]');if(!b||!state||TDRAG&&TDRAG.moved)return;const id='sp:'+b.dataset.sp;state.infoProg=state.infoProg===id?null:id;state.selected=null;state.preview=null;state.info=null;Sfx.select();render()});
$('team').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-sp]');if(!b||!state)return;TDRAG={id:b.dataset.sp,x:e.clientX,moved:false}});
window.addEventListener('pointermove',e=>{if(TDRAG&&Math.abs(e.clientX-TDRAG.x)>12){TDRAG.moved=true;const b=document.querySelector(`#team [data-sp="${TDRAG.id}"]`);if(b)b.classList.add('drag')}});
window.addEventListener('pointerup',e=>{const d=TDRAG;if(!d)return;setTimeout(()=>{TDRAG=null},0);if(!d.moved||!state)return;const t=document.elementFromPoint(e.clientX,e.clientY),tb=t&&t.closest&&t.closest('#team [data-sp]');if(!tb||tb.dataset.sp===d.id){render();return}
  const mv=a=>{if(!a)return a;const L=a.filter(x=>x!==d.id),i=L.indexOf(tb.dataset.sp);if(i<0)return a;L.splice(e.clientX>tb.getBoundingClientRect().left+tb.offsetWidth/2?i+1:i,0,d.id);return L};
  state.spec=mv(state.spec);const run=runOf();if(run&&run.spec)run.spec=mv(run.spec);Sfx.select();render()});
function specYield(id){const S=SPEC[id];if(!state)return'';if(S.per)return`<p class="hint">Aktuell pro Tag: ${yieldTxt(yieldOf((b,c,nb)=>S.per(b,c,nb,state.buildings)))}</p>`;if(S.mult){return`<p class="hint">Aktuell: <b>${S.mult(state.buildings)?'aktiv':'noch nicht aktiv'}</b></p>`}return''}
function infoHtml(h,cur){
  if(state.umbT)return umbHintHtml();
  if(state.msg)return`<h3>${state.msg.title}</h3><p class="hint">${state.msg.text}</p>`;
  if(state.phase==='review'&&state.info==null){const se=seOf(state.season),prev=state.dayPts[state.day-1],d=prev!=null?state.lastDay-prev:null,inc=state.lastIncome||{total:0},rest=se.target-state.seasonScore;
    return`<h3>Tag ${state.day+1}: ${fmt(state.lastDay)} Punkte</h3>${billHtml(inc)}<div class="vals"><span class="chip ${rest<=0?'s':'n'}">${rest<=0?'Saisonziel erreicht!':`noch ${fmt(rest)} bis zum Saisonziel`}</span></div><p class="hint">Tippe auf Gehege/Gebäude, um ihre Punkte zu sehen. Weiter geht es mit dem Button.</p>`}
  if(state.phase==='scoring')return`<h3>Der Zoo zahlt aus…</h3><p class="hint">Linien zeigen, welche Nachbarn den Bonus liefern. Tippen beschleunigt.</p>`;
  if(state.hoverTerr){const t=state.hoverTerr;return t==='block'?`<h3>🪨 Felsen</h3><p class="hint">Nicht bebaubar. Im Shop kannst du einen Felsen wegbaggern lassen.</p>`
    :`<h3>${HAB[t].icon} ${HAB[t].label}-Naturfläche</h3><p class="hint"> Gehege nur mit Lebensraum ${HAB[t].label}, die bekommen +1 Natur je Feld darauf. Attraktionen, Gastro & Shops und Naturschutz-Gebäude dürfen hier ohne Bonus stehen.</p>`}
  {const mb=movingB();if(mb&&state.phase==='play'){const c=CARDS[mb.key];return`<h3>🚚 Umzug: ${ic(c)} ${c.name}${(mb.lvl||1)>1?` <span class="tag" style="background:var(--gold)">Stufe ${ROMAN[mb.lvl]}</span>`:''}</h3><p class="hint">Tippe auf den neuen Platz oder ziehe die Vorschau, mit ↻ drehst du. „Setzen“ kostet 1 BP. ↶ bricht ab.</p>${h&&h.ok?resHtml(h,cur)+detH(brkHtml(c,h.brk)+calcHtml(h,cur)):h&&h.why?`<p class="resbad">${h.why}</p>`:''}`}}
  if(state.infoProg==='zf:gold')return`<h3><span style="color:var(--gold)">★ Goldenes Feld · ×2</span></h3><p class="hint">Das Gehege/Gebäude, das auf diesem Feld steht, zählt doppelt: Besucher und Natur. Bedeckt ein großes Gehege/Gebäude mehrere goldene Felder, zählt jedes extra.</p>`;
  if(state.infoProg==='zf:crown')return`<h3><span style="color:#d9b3ff">👑 Kronenfeld · ×1,3</span></h3><p class="hint">×1,3 Besucher für den ganzen Zoo, sobald hier ein <b>Gehege mit 4 Feldern</b> steht. Alles andere verbaut das Feld, dann ist der Bonus für diesen Zoo weg.</p>`;
  if(state.infoProg==='rule'&&state.rule)return ruleInfoHtml();
  if(state.infoProg==='mile'){const m=mileInfoHtml();if(!((state.spec||[]).length||state.mode==='camp'))return m;state.infoProg='boni';const b=infoHtml(h,cur);state.infoProg='mile';return m+'<hr class="infhr">'+b}
  if(state.infoProg==='money')return moneyInfoHtml(cur);
  if(state.infoProg&&state.infoProg.startsWith('sp:')){const id=state.infoProg.slice(3),S=SPEC[id];if(S)return`<h3>${S.icon} ${S.name}</h3><p class="hint">${SPECTIER[S.tier]||''}${S.rb?' · Regelbrecher':''} · Platz ${(state.spec||[]).indexOf(id)+1} von ${maxSpec()}${strike()?' · <b style="color:#ffb3b5">streikt (Kasse im Minus)</b>':''}</p>${fxHtml(S)}${specYield(id)}<p class="hint">Zum Umsortieren nach links oder rechts ziehen.</p>`}
  if(state.infoProg==='wish'){if(state.wish)state.wish.seen=1;return wishInfoHtml()}
  if(state.infoProg==='redraw')return`<h3>🔄 Hand neu ziehen?</h3><p class="hint">${rdFree()?'<b>Gratis</b> (einmal pro Jahreszeit). Danach kostet es 1 Baupunkt.':'Kostet <b>1 Baupunkt</b>. Der Gratis-Neuzug dieser Jahreszeit ist schon verbraucht.'} Alle Handkarten gehen auf die Ablage, du ziehst fünf neue. Nicht rückgängig, auch die heutigen Züge davor sind danach fest. <b>Nochmal auf 🔄 tippen</b> zum Bestätigen.</p>`;
  if(state.infoProg==='boni'){const L=(state.spec||[]).filter(id=>SPEC[id]),ks=Object.keys(PERKS).filter(k=>CARDS[k]&&perkN(k));
    return`<h3>🎖️ Deine Spezialisten ${L.length}/${maxSpec()}</h3>${strike()?'<p class="hint" style="color:#ffb3b5"><b>🪧 Dein Team streikt.</b> Die Kasse ist im Minus, deshalb wirkt kein Spezialist, bis du wieder bei 0 Talern oder darüber bist.</p>':''}${L.length?L.map(id=>{const S=SPEC[id],st=strike();return`<div class="${st?'specoff':''}"><p class="hint" style="margin:0"><b style="color:var(--text)">${st?'🪧 ':''}${S.icon} ${S.name}</b>${st?' <i>streikt</i>':''}</p>${fxHtml(S)}${specYield(id)}</div>`}).join(''):'<p class="hint">Noch niemand eingestellt. Spezialisten gibt es im Stellenmarkt (nach jeder Jahreszeit, als Reiter neben dem Shop) und nach jedem geschafften Zoo.</p>'}${ks.length?`<p class="hint">Verbesserte Karten: ${ks.map(k=>CARDS[k].icon+' +'+perkN(k)).join(' · ')}</p>`:''}`}
  if(state.infoProg&&state.infoProg.startsWith('ev:')){const e=(state.events||[]).find(x=>'ev:'+x.id===state.infoProg);if(e)return`<h3>${evIcon(e)} ${evName(e)}</h3><p class="hint">Ereignis · gilt die ganze Jahreszeit, auch für bereits Gebautes</p>${fxHtml({fx:evFx(e)})}${EVENTS[e.id].per?yieldHtml({per:(b,c)=>EVENTS[e.id].per(b,c,e.k||1)}):''}`}
  if(state.infoProg==='bautrupp')return`<h3>🧱 Saison-Bautrupp</h3><p class="hint">Diese Jahreszeit +1 Baupunkt pro Tag.</p>`;
  if(state.infoProg){const P=PROGS[state.infoProg]||ADS[state.infoProg];if(P)return`<h3>${P.icon} ${P.name}</h3><p class="hint">${ADS[state.infoProg]?'Werbung · nur diese Jahreszeit':'Förderprogramm · bis Zoo-Ende, auch für bereits gebaute'}</p>${fxHtml(P)}${yieldHtml(P)}`}
  if(state.selected!=null){const k=state.hand[state.selected],c=CARDS[k];
    const placeH='<p class="hint">Ziehe die Karte aufs Gelände oder tippe auf ein Feld.</p>';let place='';
    const tg=fxTags(c),tgH=tg.fx.length?fxHtml(tg):'',ow=fxOwn(c),ownH=ow.fx.length?fxHtml(ow):'',habH=c.hab?fxHtml({fx:[],hab:c.hab},1):'';
    const twin=!c.ms&&state.buildings.find(b=>b.key===baseK(k)&&(b.lvl||1)<MAXLVL),dn=cnt(state.buildings,b=>b.key===baseK(k)),dupL=dn?`<p class="hint" style="color:#7fd8ff">🔁 Steht schon ${dn}× im Zoo (leuchtet blau). Neu gebaut bringt es ×${mxs(dupW(dn))} seines eigenen Werts.${twin?' Auf ein vorhandenes gezogen wird es stattdessen <b>ausgebaut</b>.':''}</p>`:'';
    if(h&&h.ok)place=zlNote(h,c)+(h.up?'':ownH)+(h.up?detH:detP)(brkHtml(c,h.brk)+calcHtml(h,cur)+(h.up?'':habH+tgH+dupL));
    if(h&&h.up){const old=cur.steps.find(x=>x.id===h.up.id);return`<h3>⬆ Ausbau: ${ic(c)} ${c.name} → Stufe ${h.ok?ROMAN[h.b.lvl]:'III'}</h3>${h.ok?resHtml(h,cur,{a:h.own.a-old.a,s:h.own.s-old.s}):''}${h.ok&&state.zl&&state.zl.insp==='koenig'&&!inspHid()?(()=>{const bs1=state.buildings.map(x=>x.id===h.up.id?h.b:x),k0=kingCmp(h.up,state.buildings),k1=kingCmp(h.b,bs1);if(!k1)return'';return`<p class="${k1.king?'resgood':'hint'}">⛄ Schneekönig: ${k1.king?(k0&&k0.king?'bleibt König':'wird damit König')+' der Sorte '+k1.label:'bleibt hinter ⛄ '+CARDS[k1.best.key].name+', es fehlen noch '+fmt(k1.gap)}.</p>`})():''}${place}<p class="hint">${costOf(k)} BP. Braucht keinen neuen Platz und zählt nicht als Wiederholung.</p>`}
    const dupC=dn?`<span class="dupchip">🔁 schon ${dn}× im Zoo · bringt ×${mxs(dupW(dn))}</span>`:'',trH=traitsOf(c).map(t=>`<span class="tag tr">${TRAITIC[t]} ${TRAITNAME[t]}</span>`).join('');
    if(!h)return`<!--paper--><div class="pc-row" style="--mkc:color-mix(in srgb,${colOf(c)} 55%,#fff)"><button class="pc-sm" data-det="1" title="Mehr ein/aus">${ic(c)}<i>${DET?'▴':'▾'}</i></button><div class="pc-col"><div class="pc-strip"><b>${c.name}</b>${traitsOf(c).map(t=>`<span class="pc-tr" title="${TRAITNAME[t]}">${TRAITIC[t]}</span>`).join('')}<small><span style="color:#c46a00">${c.a} B</span> · <span style="color:#00857a">${c.s} N</span> · ${costTxt(k)}</small>${dupC}${fdSlotsHtml(k)}</div>${lockTxt(k)}${LOWH()?'':ownH}</div></div>${DET?`<div class="detin">${LOWH()?ownH:''}${tagHtml(c)}${habH}${tgH}</div>`:''}`;
    if(h&&h.ok&&!h.up)return prevHtml(h,cur,c,k);
    return`<!--paper--><div class="pc-row" style="--mkc:color-mix(in srgb,${colOf(c)} 55%,#fff)"><button class="pc-sm" data-det="1" title="Details ein/aus">${ic(c)}<i>${DET?'▴':'▾'}</i></button><div class="pc-col"><div class="pc-strip"><b>${c.name}</b>${traitsOf(c).map(t=>`<span class="pc-tr" title="${TRAITNAME[t]}">${TRAITIC[t]}</span>`).join('')}<small>${c.a} B · ${c.s} N · ${costTxt(k)}</small>${dupC}${fdSlotsHtml(k)}</div>${lockTxt(k)}${h?(h.ok?resHtml(h,cur)+multWarn(h,cur)+place:`<p class="resbad">${h.why}</p>`+(tutFix()?'':(LOWH()&&!DET?'':ownH)+((habH+tgH+dupL)?detX(habH+tgH+dupL):''))):ownH+detX(habH+tgH+dupL+placeH)}</div></div>`}
  if(state.hover!=null&&state.hand[state.hover]){const k=state.hand[state.hover],c=CARDS[k],d=cnt(state.buildings,b=>b.key===baseK(k));
    return`<h3>${ic(c)} ${c.name} ${tagHtml(c)} ${scopeOf(c)}</h3>${lockTxt(k)}<p class="hint">${c.a} B · ${c.s} N · ${costTxt(k)}${d?` · schon ${d}× gebaut: neu gebaut bringt es nur ×${mxs(dupW(d))} seines eigenen Werts${c.ms?'':', oder ausbauen'}`:''}</p>${fxHtml(c,1)}`}
  if(state.info!=null){const b=state.buildings.find(b=>b.id===state.info);if(b){const c=edCard(b),m=cur.mults.find(m=>m.id===b.id),n=moveCost(),can=state.phase==='play'&&state.bp>=n;
    return`${(()=>{const bs=state.buildings,bk=breakdown(b,bs),bs2=bs.filter(x=>x!==b),i1=mkIndex(bs),i2=mkIndex(bs2);let ga=0,gs=0;for(const n of bs2){const v1=evalB(n,bs,i1),v2=evalB(n,bs2,i2);ga+=v1.a-v2.a;gs+=v1.s-v2.s}ga=Math.round(ga);gs=Math.round(gs);
      const dd=zlDead(b,bs,false),kc=state.zl&&state.zl.insp==='koenig'&&!inspHid()?kingCmp(b,bs):null,kl=kc?(kc.king?`<p class="resgood">⛄ König der Sorte ${kc.label}: zählt im Winter 2,5-fach.</p>`:`<p class="resdead">❄️ Schneekönig: Zählt im Winter nicht. König der Sorte ${kc.label} ist ⛄ ${CARDS[kc.best.key].name} mit ${vTxt(kc.bv.a,kc.bv.s)}, dieses hat ${vTxt(kc.me.a,kc.me.s)}. Es fehlen <b>${fmt(kc.gap)}</b> (B und N zusammen).${Math.round(ga)||Math.round(gs)?` Den Nachbarn gibt es weiter ${vTxt(Math.round(ga),Math.round(gs))}.`:''}</p>`):'',ddl=kc?kl:dd==='good'?`<p class="resgood">🥇 ${INSP[state.zl.insp].name}: zählt im Winter mehrfach.</p>`:dd&&dd!=='half'?`<p class="resdead">${dd==='prof'?'🚫':'❄️'} Zählt selbst nicht (${deadWhy(dd)})${ga||gs?`, gibt den Nachbarn aber <b>${vTxt(ga,gs)}</b>`:''}. Für Meilensteine, Reinheit und Spezialisten zählt es weiter.</p>`:dd==='half'?`<p class="reswin">❄️ ${INSP[state.zl.insp].name}: ${state.zl.insp==='laerm'?'bringt im Winter nur die halbe Natur':'zählt im Winter nur zur Hälfte'}.</p>`:'';
      return`${ddl}<div class="mk">${mkHead(c,mkWhere(c),b.lvl)}${fdSlotsHtml(b.key)}<div class="mkr"><span class="mkbig"><span class="a">${bk.a} B</span> <span class="s">${bk.s} N</span></span>${ga||gs?`<span class="mknb ${ga+gs<0?'neg':''}">Nachbarn ${vTxt(ga,gs)}</span>`:''}${m?`<span class="mknb">${m.ma?'×'+mxs(m.ma)+' B':'×'+mxs(m.ms)+' N'} Zoo</span>`:''}</div>${chipRow(chipsOf(bk.parts),[])}${DET?detChips(c,bk)+(()=>{const ow=fxOwn(c);return ow.fx.length?`<div class="mkfx">${fxHtml(ow)}</div>`:''})():''}</div>`})()}
      ${hasSpec('ausw')&&state.phase==='play'&&isCat(b,'gehege')&&!CARDS[b.key].ms?(state.auswS===(state.zoo||0)+'/'+state.season?'<p class="hint">🌿 In dieser Jahreszeit hast du schon ausgewildert.</p>':`<button class="btn sub" data-ausw="${b.id}">🌿 Auswildern: weg aus Zoo und Deck, heute ×1,5 N</button>`):''}`}}
  if(state.day===0&&!state.builtToday&&state.phase==='play'&&(state.events||[]).length)return`<h3>Ereignis im ${seOf(state.season).name}: ${state.events.map(e=>evIcon(e)+' '+evName(e)).join(' · ')}</h3>${fxHtml({fx:state.events.flatMap(evFx)})}`;
  if(!state.buildings.length&&state.day===0&&state.season===0&&TUTNOW)return''; // 0.70a: im Tutorial kein Willkommen-Feld (verdeckt das Gelände)
  if(!state.buildings.length&&state.day===0&&state.season===0)return`<h3>Willkommen! Gelände: ${MAPS[state.map].icon} ${MAPS[state.map].name}</h3><p class="hint">4 Baupunkte pro Tag, jedes Feld kostet 1 (Gehege mit 4 Feldern 1 weniger). Naturflächen (💧🌾🌿🏜️) geben passenden Gehegen Bonus. Mehr im Menü ☰.</p>`;
  if(!state.hand.some(affordable))return`<h3>Fertig für heute</h3><p class="hint">Keine Karte passt mehr in deine Baupunkte. Tippe auf 💤 „💤 Tag beenden“.</p>`;
  return`<h3 class="tday">Tag ${state.day+1}</h3>${todayHtml()}`;
}
function renderLog(){const se=seOf(state.season),vals=Array.from({length:DAYS},(_,i)=>state.dayPts[i]);
  const mx=Math.max(1,...vals.filter(v=>v!=null)),W=300,H=70,top=14,bot=14,bw=W/DAYS;
  let g=`<line class="grid" x1="0" y1="${H-bot}" x2="${W}" y2="${H-bot}"/>`;
  vals.forEach((v,i)=>{const x=i*bw+bw*.2,w=bw*.6;
    if(v==null){g+=`<rect class="lb empty" x="${x}" y="${H-bot-4}" width="${w}" height="4" rx="2"/>`}
    else{const hgt=Math.max(3,(H-top-bot)*v/mx),y=H-bot-hgt;
      g+=`<path class="lb" d="M${x},${H-bot}V${y+4}Q${x},${y} ${x+4},${y}H${x+w-4}Q${x+w},${y} ${x+w},${y+4}V${H-bot}Z"><title>Tag ${i+1}: ${fmt(v)} Punkte</title></path><text class="v" x="${x+w/2}" y="${y-4}">${fmt(v)}</text>`}
    g+=`<text x="${x+w/2}" y="${H-3}">Tag ${i+1}</text>`});
  const past=state.past.map(p=>`<span>${p.name} <b>${fmt(p.pts)}</b> ✓</span>`).join('');
  const inc=state.lastIncome?`<span>Letzte Bilanz: Eintritt ${sgn(state.lastIncome.base)}, Zinsen ${sgn(state.lastIncome.interest)}</span>`:'';
  $('log').innerHTML=`<h4><span>${MAPS[state.map].icon} ${MAPS[state.map].name} · ${se.name}</span><span>noch ${fmt(Math.max(0,se.target-state.seasonScore))} bis zum Ziel</span></h4><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Punkte pro Tag">${g}</svg><div class="past">${inc}${past}</div>`}
// ===== 0.81a: Detail-Fenster für Gehege und Gebäude (von unten, im Querformat rechts) =====
// Alle Zeilen und die Rechnung kommen aus derselben Wertung (breakdown → evalB mit Faktor-Angabe fa/fs je Schritt), gerundet wird wie dort: nach jedem Faktor-Schritt.
const fF=f=>String(+(+f).toFixed(2)).replace('.',',');
const detIc=l=>{const m=String(l).match(/^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*)\s*/u);return m?[m[1],String(l).slice(m[0].length)]:['',String(l)]};
function detCalc(a0,parts,k,fin){const F=k==='a'?'fa':'fs';let v=a0,grp=[String(a0)],out='';const flush=()=>{if(grp.length>1)out+=(out?' ':'')+'('+grp.join(' ')+')';else out+=(out?' ':'')+grp[0];grp=null};
  for(const p of parts){const d=p[k]||0;if(p[F]!=null&&p[F]!==1&&(p.fa!=null||p.fs!=null)){if(grp)flush();v+=d;out+=` × ${fF(p[F])} → ${v}`}else if(p.fa==null&&p.fs==null&&d){v+=d;if(grp)grp.push((d<0?'− ':'+ ')+Math.abs(d));else out+=` ${d<0?'−':'+'} ${Math.abs(d)} → ${v}`}else if((p.fa!=null||p.fs!=null)&&d){v+=d;out+=` ${d<0?'−':'+'} ${Math.abs(d)} → ${v}`}}
  if(grp)flush();return{t:out.replace(/ → (-?\d+)$/,'')+` = ${fin}`,ok:v===fin,v}}
function detSheetHtml(b,bs,pre){const c=edCard(b),bk=breakdown(b,bs),P=bk.parts||[],a0=bk.a0!=null?bk.a0:c.a,s0=bk.s0!=null?bk.s0:c.s,idx=mkIndex(bs),cur=scoreZoo(bs);
  const plus=P.filter(p=>p.fa==null&&p.fs==null&&(p.a||p.s)),fac=P.filter(p=>p.fa!=null||p.fs!=null),zoo=P.filter(p=>!p.a&&!p.s&&/😣/.test(p.label));
  const vB=(a,s)=>[a?`${a>0?'+':'−'}${Math.abs(a)} B`:'',s?`${s>0?'+':'−'}${Math.abs(s)} N`:''].filter(Boolean).join(' · ');
  const cls=(a,s)=>a&&s?'bn':a?'b':'n';
  const row=(ic,t,sm,v,vc,neg,off)=>`<div class="drw${neg?' neg':''}${off?' off':''}"><span class="dri">${ic}</span><span class="drt"><b>${t}</b>${sm?`<small>${sm}</small>`:''}</span><span class="dv ${neg?'neg':vc}">${v}</span></div>`;
  const rP=plus.map(p=>{const[i,t]=detIc(p.label);return row(i||'➕',t,'',vB(p.a,p.s),cls(p.a,p.s),(p.a||0)+(p.s||0)<0)});
  const rF=fac.map(p=>{const[i,t]=detIc(p.label);const fa=p.fa==null?1:p.fa,fs=p.fs==null?1:p.fs,v=fa===fs?'×'+fF(fa):[fa!==1?'B ×'+fF(fa):'',fs!==1?'N ×'+fF(fs):''].filter(Boolean).join(' · ');return row(i||'✖️',t.replace(/:?\s*×\d+(,\d+)?\s*$/,''),'',v,fa!==1&&fs!==1?'bn':fa!==1?'b':'n',Math.min(fa,fs)<1)});
  const off=[];{const k=b.key;if(c.cat==='gehege'&&!c.ms&&foodOn()){const fr=fdMaxK(k)-fdOf(k).length;if(fr>0)off.push(row('🍽️',`Futterplatz frei${fr>1?' ('+fr+')':''}`,'Futter würde hier dauerhaft wirken','–','',false,true))}
    const has=t=>(c.tags||[]).includes(t);if((has('beute')||has('scheu'))&&!zoo.length&&!(TUTNOW&&!TUTTR))off.push(row('😣','Stress',has('beute')?'Beute: gerade kein Raubtier in der Nähe':'Scheu: gerade kein Trubel in der Nähe','–','',false,true));
    if(has('show')&&!P.some(p=>/🎭/.test(p.label))&&!(TUTNOW&&!TUTTR))off.push(row('🎭','Showtier','gerade kein Gastro-Gebäude und keine Attraktion daneben','–','',false,true));
    if(state.season===2){const h=winterHit(b,bs,idx);if(h)off.push(row('❄️',`Im Winter: ${INSP[state.zl.insp].name}`,'gilt ab dem Winter',h.t,'',false,true))}}
  const zl=[...zoo.map(p=>`😣 Dieses Tier ist gestresst: ×${mxs(1-STRZ)} Natur für den <b>ganzen Zoo</b>. Siehe Aufstellung am N-Zähler.`),...cur.mults.filter(m=>m.id===b.id).map(m=>`${m.icon||c.icon} ${m.label}: ${m.ma?'×'+fF(m.ma)+' B':''}${m.ma&&m.ms?' · ':''}${m.ms?'×'+fF(m.ms)+' N':''} für den <b>ganzen Zoo</b>. Siehe Aufstellung am ${m.ma?'B':'N'}-Zähler.`)];
  const cA=detCalc(a0,P,'a',bk.a),cS=detCalc(s0,P,'s',bk.s),sh=SHAPES[c.shape]?SHAPES[c.shape].cells.length:b.cells.length,fdn=c.cat==='gehege'&&!c.ms&&foodOn()?` · 🍽️ ${fdOf(b.key).length}/${fdMaxK(b.key)}`:'';
  const sub=[c.hab?`${HAB[c.hab].icon} ${HAB[c.hab].label}`:CAT[c.cat].label,`${b.cells.length} ${b.cells.length===1?'Feld':'Felder'}`,`${costOf(b.key)} BP`,...traitsOf(c).map(t=>`${TRAITIC[t]} ${TRAITNAME[t]}`)].join(' · ')+fdn;
  return`<div class="dsh" role="dialog" aria-label="Details ${esc(c.name)}"><div class="dgrip"></div><button class="dx" data-dsx="1" aria-label="Schließen">✕</button>
    <div class="dhead"><div class="dic" style="background:color-mix(in srgb,${colOf(c)} 35%,#fff)">${ic(c)}</div><div><div class="dnm">${c.name}${(b.lvl||1)>1?' '+ROMAN[b.lvl]:''}${pre?' <small>(Vorschau)</small>':''}</div><div class="dsub">${sub}</div></div></div>
    <div class="dres"><div class="drb"><b>${bk.a}</b><span>👥 Besucher</span></div><div class="drn"><b>${bk.s}</b><span>🌿 Natur</span></div></div>
    <div class="dsec">➕ Grundwert und dazu</div><div class="drows">${row(ic(c),'Grundwert','von der Karte',`${a0} B · ${s0} N`,'bn',false)}${rP.join('')}</div>
    ${rF.length?`<div class="dsec">✖️ Faktoren</div><div class="drows">${rF.join('')}</div>`:''}
    ${off.length?`<div class="dsec">💤 Möglich, wirkt gerade nicht</div><div class="drows">${off.join('')}</div>`:''}
    <div class="dcalc"><span class="dk kb">👥 B</span><span>${cA.t.replace(/= (-?\d+)$/,'= <span class="deq">$1</span>')}</span><span class="dk kn">🌿 N</span><span>${cS.t.replace(/= (-?\d+)$/,'= <span class="deq">$1</span>')}</span></div>
    ${zl.map(z=>`<div class="dzoo">${z}</div>`).join('')}</div>`}
function detTarget(){if(!state)return null;if(state.info!=null){const b=state.buildings.find(x=>x.id===state.info);if(b)return{b,bs:state.buildings,pre:false}}
  if(state.selected!=null&&state.preview){const h=hypo();if(h&&h.ok&&h.b){const skip=new Set([h.up&&h.up.id,h.move&&h.move.id].filter(x=>x!=null)),bs=[...state.buildings.filter(x=>!skip.has(x.id)),h.b];return{b:h.b,bs,pre:true}}}return null}
function detOpen(){const T=detTarget();if(!T)return false;detClose();const el=document.createElement('div');el.id='detSheet';el.className='detov';el.innerHTML=detSheetHtml(T.b,T.bs,T.pre);document.body.appendChild(el);
  el.addEventListener('click',e=>{if(e.target===el||e.target.closest('[data-dsx]')){try{Sfx.select()}catch(x){}detClose()}});return true}
function detClose(){const el=document.getElementById('detSheet');if(el)el.remove()}
// 0.81a: Aufstellung am Zähler: Gebäude zusammen, dann die Zoo-Faktoren in der Reihenfolge der Wertung (scoreZoo0: mults), gerundet wird erst am Ende
function aufOf(r){const by=Object.fromEntries((state.buildings||[]).map(b=>[b.id,b]));let ra=0,rs=0;for(const st of r.steps||[]){ra+=st.a;rs+=st.s}
  return{ra,rs,A:r.A,S:r.S,m:(r.mults||[]).map(m=>({ic:m.icon||(m.id!=null&&by[m.id]?CARDS[by[m.id].key].icon:'✖️'),l:m.label,ma:m.ma||0,ms:m.ms||0}))}}
function aufBlock(au,k,title){const B=k==='a',L=au.m.filter(m=>B?m.ma:m.ms),u=B?'B':'N',raw=B?au.ra:au.rs,fin=B?au.A:au.S;
  return`<div class="aufb">${title?`<div class="auft">${title}</div>`:''}<div class="aufr"><span>Gebäude zusammen</span><b>${fmt(raw)} ${u}</b></div>${L.map(m=>`<div class="aufr ${(B?m.ma:m.ms)<1?'neg':''}"><span>${m.ic} ${m.l}</span><b>×${mxs(B?m.ma:m.ms)}</b></div>`).join('')}<div class="aufr sum"><span>=</span><b>${fmt(fin)} ${u}</b></div></div>`}
function aufHtml(k){const y=state.yday||{},cur=aufOf(scoreZoo(state.buildings)),B=k==='a',now=B?cur.A:cur.S,was=B?y.A:y.S,t=state.phase==='review'?`Tag ${state.day+1}`:state.day||state.season?'Gestern':'';
  const head=`<div class="aufh">${B?'👥 Besucher':'🌿 Natur'}</div>`;
  if(!y.auf||(state.phase==='play'&&state.builtToday&&now!==was))return head+(y.auf?aufBlock(y.auf,k,t)+aufBlock(cur,k,'Stand jetzt (wenn du den Tag beendest)'):aufBlock(cur,k,'Stand jetzt'));
  return head+aufBlock(y.auf,k,t)}
function aufToggle(k){let el=document.getElementById('aufPop');const was=el&&el.dataset.k;if(el)el.remove();if(!k||was===k||!state||state.phase==='scoring')return;
  const c=$(k==='a'?'cA':'cS');el=document.createElement('div');el.id='aufPop';el.dataset.k=k;el.className='aufpop';el.innerHTML=aufHtml(k);document.body.appendChild(el);
  const r=c.getBoundingClientRect(),w=Math.min(300,window.innerWidth-16);el.style.width=w+'px';el.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.left+r.width/2-w/2))+'px';el.style.top=(r.bottom+6+window.scrollY)+'px'}
$('cA').addEventListener('click',e=>{e.stopPropagation();try{Sfx.select()}catch(x){}aufToggle('a')});$('cS').addEventListener('click',e=>{e.stopPropagation();try{Sfx.select()}catch(x){}aufToggle('s')});
document.addEventListener('click',e=>{const p=document.getElementById('aufPop');if(p&&!p.contains(e.target))p.remove()});
function setCounters(a,s,t){$('vA').textContent=fmt(a);$('vS').textContent=fmt(s);if(t!=null)$('vT').textContent=fmt(t)}
function bump(id){const e=$(id);if(e&&e.animate&&!reduced){e.animate([{transform:'scale(1)'},{transform:'scale(1.14)',offset:.5},{transform:'scale(1)'}],{duration:300,easing:'ease'});return}e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');
  if(Sfx.heat>=2&&!reduced)for(let i=0;i<Sfx.heat+1;i++){const sp=document.createElement('span');sp.className='csp';sp.style.left=(8+Math.random()*84)+'%';sp.style.animationDelay=(Math.random()*.25).toFixed(2)+'s';sp.style.setProperty('--dx',Math.round(Math.random()*20-10)+'px');e.appendChild(sp);setTimeout(()=>sp.remove(),1400)}}
function sparks(pt,n=8){const[x,y]=pct(pt);for(let i=0;i<n;i++){const a=i/n*Math.PI*2+Math.random()*.4,sp=document.createElement('span');sp.className='spark';sp.textContent='✦';
  sp.style.left=x+'%';sp.style.top=y+'%';const d=28+Math.random()*(n>8?42:14);sp.style.setProperty('--dx',Math.cos(a)*d+'px');sp.style.setProperty('--dy',Math.sin(a)*d+'px');$('fxh').appendChild(sp);setTimeout(()=>sp.remove(),850)}}
function floatAt(pt,txt,cls){let[x,y]=pct(pt);x=Math.max(9,Math.min(91,x));y=Math.max(6,Math.min(94,y));const f=document.createElement('span');f.className='float '+cls;f.style.left=x+'%';f.style.top=y+'%';f.textContent=txt;$('fxh').appendChild(f);setTimeout(()=>f.remove(),1000)}

/* ---------- input: tap ---------- */
let lastPtr='mouse';$('board').addEventListener('pointerdown',e=>{lastPtr=e.pointerType||'mouse'},{capture:true});
let suppressClick=false;
$('board').addEventListener('click',e=>{if(state&&state.umbT&&state.phase==='play'){if(!state.umbPick){const hx=hexAt(e.clientX,e.clientY);if(hx)umbClick(hx.q,hx.r)}return}if(state.phase==='review'&&!suppressBoard){const bl=e.target.closest('.bld');state.info=bl&&state.info!==+bl.dataset.bid?+bl.dataset.bid:null;Sfx.select();render();return}
  if(state.phase!=='play'||suppressBoard)return;state.infoProg=null;
  if(state.moving!=null){if(e.target.closest('[data-ghost]')&&lastPtr!=='touch'){build();return}const hx=hexAt(e.clientX,e.clientY);if(hx){state.preview={q:hx.q,r:hx.r};Sfx.hover();render()}return}
  if(e.target.closest('[data-ghost]')){
    if(lastPtr!=='touch'){build();return}
    const hx=hexAt(e.clientX,e.clientY);if(hx&&state.selected!=null){state.preview=previewAt(hx);Sfx.hover();render()}return}
  if(state.selected!=null){const bl=e.target.closest('.bld');if(bl){const b=state.buildings.find(x=>x.id===+bl.dataset.bid);
    if(b&&b.key===baseK(state.hand[state.selected])&&!CARDS[b.key].ms){state.preview={q:b.cells[0][0],r:b.cells[0][1],up:b.id};Sfx.hover();render();return}}}
  if(state.zl&&state.selected==null&&!e.target.closest('.bld')){const hx=hexAt(e.clientX,e.clientY),k=hx&&hk(hx.q,hx.r),f=k&&(state.zl.gold.includes(k)?'zf:gold':(state.zl.crown===k||(state.zl.crown2||[]).includes(k))?'zf:crown':null);if(f&&!mkIndex(state.buildings).has(k)){state.hoverTerr=null;state.info=null;state.infoProg=f;Sfx.select();render();return}}
  const tr=e.target.closest('[data-terr]');
  if(tr&&state.selected==null){state.hoverTerr=state.hoverTerr===tr.dataset.terr?null:tr.dataset.terr;state.info=null;Sfx.select();render();return}
  state.hoverTerr=null;
  const cell=e.target.closest('[data-q]'),bld=e.target.closest('.bld');
  if(cell&&state.selected!=null){state.preview=previewAt({q:+cell.dataset.q,r:+cell.dataset.r});Sfx.hover();render();return}
  // 0.80a: Felsen und andere Gelände-Bilder haben kein data-q → Feld über die Position bestimmen (z. B. Sprengmeisterin auf Felsen)
  if(!cell&&!bld&&state.selected!=null){const hx=hexAt(e.clientX,e.clientY);if(hx&&ONBOARD.has(hk(hx.q,hx.r))){state.preview=previewAt(hx);Sfx.hover();render();return}}
  if(bld){const id=+bld.dataset.bid;state.info=state.info===id?null:id;state.selected=null;state.preview=null;Sfx.select();render()}
  else if(cell){state.info=null;render()}});
function selectCard(i){{const ts=tutStep();if(ts&&ts.only&&state.hand[i]!==ts.only){Sfx.deny();tutNudge();return false}}state.msg=null;state.moving=null;state.hover=null;state.hoverTerr=null;state.infoProg=null;if(!affordable(state.hand[i])){Sfx.deny();
    const k=state.hand[i];state.msg=builtUnique(state.buildings,k)?{title:`${CARDS[k].icon} ${CARDS[k].name}`,text:'Gibt es nur einmal im Zoo und steht schon. Die Karte wandert beim Tagesende auf die Ablage.'}:{title:`${CARDS[k].icon} ${CARDS[k].name}`,text:`Kostet ${costOf(k)} Baupunkte, du hast noch ${state.bp}.`};
    setTimeout(()=>{state.msg=null;if(state.phase==='play')render()},2600);return false}state.selected=i;state.rot=0;state.info=null;return true}
$('hand').addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!fxOn())return;const c=e.target.closest('.card');if(!c)return;const r=c.getBoundingClientRect(),fx=(e.clientX-r.left)/r.width,fy=(e.clientY-r.top)/r.height;c.style.setProperty('--ry',((fx-.5)*16).toFixed(1)+'deg');c.style.setProperty('--rx',((.5-fy)*14).toFixed(1)+'deg');c.style.setProperty('--gx',(fx*100).toFixed(0)+'%');c.style.setProperty('--gy',(fy*100).toFixed(0)+'%');c.classList.add('tilt')});
$('hand').addEventListener('pointerout',e=>{const c=e.target.closest('.card');if(c&&!c.contains(e.relatedTarget))c.classList.remove('tilt')});
$('hand').addEventListener('click',e=>{if(suppressClick)return;const c=e.target.closest('.card');if(!c||state.phase!=='play')return;const i=+c.dataset.i;if(state.umbT){umbHand(i);return}
  state.moving=null;if(state.selected===i){state.selected=null;state.preview=null}else if(selectCard(i)){Sfx.select();if(state.preview&&state.preview.up!=null)state.preview=null}else{state.selected=null;state.preview=null;state.info=null}render()});
$('hand').addEventListener('pointerover',e=>{if(e.pointerType!=='mouse'||state.selected!=null||state.phase!=='play')return;const c=e.target.closest('.card');const i=c?+c.dataset.i:null;
  if(i===state.hover)return;state.hover=i;setInfo(infoHtml(null,scoreZoo(state.buildings)))});
$('hand').addEventListener('pointerleave',()=>{if(state.hover==null)return;state.hover=null;if(state.phase==='play')setInfo(infoHtml(hypo(),scoreZoo(state.buildings)))});
$('board').addEventListener('pointerover',e=>{if(e.pointerType!=='mouse'||state.phase!=='play'||state.selected!=null)return;const t=e.target.closest('[data-terr]');const v=t?t.dataset.terr:null;
  if(v===state.hoverTerr)return;state.hoverTerr=v;setInfo(infoHtml(null,scoreZoo(state.buildings)))});
$('board').addEventListener('pointerleave',()=>{if(!state.hoverTerr)return;state.hoverTerr=null;if(state.phase==='play')setInfo(infoHtml(hypo(),scoreZoo(state.buildings)))});
const rdFree0=()=>!!state&&(state.rdFree!==state.season+'/'+(state.zoo||0)||(runDeck()==='grund'&&state.rdFree2!==state.season+'/'+(state.zoo||0))),rdFree=()=>rdFree0()||mixFree()||(!!state&&(state.rdBonus||0)>0);
function redraw(){if(state.phase!=='play'||winIs('glatteis')||umbBm()||(state.bp<1&&!rdFree())){Sfx.deny();return}{const ts=tutStep();if(ts&&!ts.redraw){Sfx.deny();tutNudge();return}}
  if(state.infoProg!=='redraw'){state.infoProg='redraw';state.moving=null;state.selected=null;state.preview=null;state.info=null;Sfx.select();render();return}
  state.infoProg=null;state.moving=null;if(state.tut)state.tut.redrawn=true;state.discard.push(...state.hand);state.hand=[];if(rdFree0()){const key=state.season+'/'+(state.zoo||0);if(state.rdFree!==key)state.rdFree=key;else state.rdFree2=key}else if(mixFree())state.rdMix=(state.zoo||0)+'/'+state.season+'/'+state.day;else if((state.rdBonus||0)>0)state.rdBonus--;else state.bp-=1;state.undo=[];state.selected=null;state.preview=null;state.hover=null;drawHand(state);Sfx.draw();Sfx.rotate();render()}
$('btnRedraw').addEventListener('click',redraw);
$('money').addEventListener('click',()=>{if(!state||state.phase==='scoring')return;state.infoProg=state.infoProg==='money'?null:'money';state.selected=null;state.preview=null;state.info=null;state.moving=null;Sfx.select();render()});
$('mkBar').addEventListener('click',()=>{if(!state||state.phase!=='play')return;ensureMarket();state.market.seen=true;modal='market';Sfx.shop();render()});
$('info').addEventListener('click',e=>{if(e.target.closest('[data-rexp]')&&state){REXP=!REXP;Sfx.select();render();return}if(!e.target.closest('[data-det]')||!state)return;if(detOpen()){try{Sfx.select()}catch(x){}return}DET=!DET;try{localStorage.setItem('zoodeck-det',DET?'1':'0')}catch(x){}Sfx.select();render()});
$('evs').addEventListener('click',e=>{const b=e.target.closest('[data-ev]');if(!b||!state)return;const id=b.dataset.ev;
  if(id==='zl'||id==='zoo'){modal='zoo';Sfx.select();render();return}
  if(id==='peek'){zlPeek();return}
  if(id==='market'){if(state.phase!=='play')return;ensureMarket();state.market.seen=true;modal='market';Sfx.shop();render();return}
  state.infoProg=state.infoProg===id?null:id;state.selected=null;state.preview=null;state.info=null;Sfx.select();render()});
$('progs').addEventListener('click',e=>{const b=e.target.closest('[data-prog],[data-ad]');if(!b)return;const id=b.dataset.prog||b.dataset.ad;
  state.infoProg=state.infoProg===id?null:id;state.selected=null;state.preview=null;state.info=null;Sfx.select();render()});

$('info').addEventListener('click',e=>{{const aw=e.target.closest('[data-ausw]');if(aw){auswilder(+aw.dataset.ausw);return}}{const dm=e.target.closest('[data-dem]');if(dm){const id=+dm.dataset.dem;if(state.demArm!==id){state.demArm=id;Sfx.select();render()}else demolish(id);return}}if(e.target.closest('#btnMoveCancel')){state.moving=null;state.preview=null;Sfx.select();render();return}
  if(!e.target.closest('#btnMove'))return;const b=state.buildings.find(b=>b.id===state.info);if(!b||state.phase!=='play'||state.bp<moveCost()){Sfx.deny();return}
  startMove(b);Sfx.select();render()});
function undo(){if(state.phase==='play'&&state.moving!=null){state.moving=null;state.preview=null;Sfx.select();render();return}
  if(state.phase!=='play'||!state.undo.length){Sfx.deny();return}const u=state.undo.pop(),put=(k,i)=>state.hand.splice(Math.min(i,state.hand.length),0,k);
  if(u.kd)state.kuUsed=0;if(u.t==='build'){zlBuilt(u.key,-1);try{const ub=state.buildings.find(b=>b.id===u.id);if(ub)flBuilt(ub,-1)}catch(e){}state.buildings=state.buildings.filter(b=>b.id!==u.id);put(u.key,u.hi);state.bp+=u.cost!=null?u.cost:costOf(u.key);if(u.cost===0)state.free1=Math.max(0,(state.free1||0)-1);state.builtToday--}
  else if(u.t==='up'){const b=state.buildings.find(b=>b.id===u.id);if(b){b.lvl=Math.max(1,(b.lvl||1)-1);if(u.ne){b.ed=(b.ed||'').slice(0,-1);if(!b.ed)delete b.ed}if(u.np)delete b.pr;}put(u.key,u.hi);state.bp+=u.cost!=null?u.cost:costOf(u.key);if(u.cost===0)state.free1=Math.max(0,(state.free1||0)-1);state.builtToday--}
  else if(u.t==='mv'){const b=state.buildings.find(b=>b.id===u.id);if(b)b.cells=u.cells;state.bp+=u.mc==null?1:u.mc;if(u.fm)state.freeMv=null}
  else if(u.t==='move'){state.buildings.splice(Math.min(u.i,state.buildings.length),0,u.b);for(let i=0;i<u.n;i++){const j=state.discard.lastIndexOf(u.b.key);if(j>=0)state.discard.splice(j,1)}state.bp+=1}
  state.moving=null;state.selected=null;state.preview=null;state.info=null;Sfx.rotate();Sfx.deal(state.hand.length);render()}
/* ---------- zoom ---------- */
function renderMini(){const bw=$('bwrap');bw.classList.toggle('zoomed',!!ZOOM);if(!ZOOM)return;const v=viewNow();
  let g='';for(const[q,r]of BOARD){const[x,y]=px(q,r);g+=`<circle class="mc ${TERR.get(hk(q,r))==='block'?'block':''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${SZ*.85}"/>`}
  const m=$('mini');m.setAttribute('viewBox',VB.join(' '));m.innerHTML=g+`<rect class="mv" x="${v[0]}" y="${v[1]}" width="${v[2]}" height="${v[3]}" rx="6"/>`}
// Lupe sitzt in einer freien unteren Ecke; ist keine frei, wandert sie in die obere Leiste
function zoomSpot(){return'ab';const br=$('bwrap').getBoundingClientRect(),u=VB[2]/(br.width||1)*42,m=SZ*.9;
  const hit=left=>BOARD.some(([q,r])=>{const[x,y]=px(q,r);return y>VB[1]+VB[3]-u-m&&(left?x<VB[0]+u+m:x>VB[0]+VB[2]-u-m)});
  return!hit(true)?'bl':!hit(false)?'br':'bar'}
let zoomSp='ab';
function placeZoomBtn(){if(!ZOOM)zoomSp=zoomSpot();const b=$('btnZoom'),sp=zoomSp,top=document.querySelector('.top'),bw=$('bwrap');
  if(sp==='ab'){const ac=document.querySelector('.boardarea .actions');if(ac&&b.parentNode!==ac)ac.appendChild(b);b.className='btn sub zoomab'+(ZOOM?' on':'')}
  else if(sp==='bar'){if(b.parentNode!==top)top.insertBefore(b,$('btnMute'));b.className='icbtn zoomtop'+(ZOOM?' on':'')}
  else{if(b.parentNode!==bw)bw.insertBefore(b,$('mini'));b.className='zoombtn '+sp}
  bw.classList.toggle('mini-left',sp==='br')}
function toggleZoom(){META.zoomOut=ZOOM?1:0;try{saveMeta()}catch(e){}if(ZOOM){ZOOM=null}else{let f=boardCenter();
    const h=state.phase==='play'?hypo():null;if(h&&h.cells)f=centroid(h.cells);else if(state.info!=null){const b=state.buildings.find(b=>b.id===state.info);if(b)f=centroid(b.cells)}
    ZOOM={cx:f[0],cy:f[1]}}Sfx.rotate();render()}
$('btnZoom').addEventListener('click',e=>{e.stopPropagation();if(PTLONG){PTLONG=false;return}if(state.phase==='scoring')return;toggleZoom()});
// 0.89: Punkte auf der Karte – nach dem Tag 🏆 die 3 stärksten und rot die 3 schwächsten; Lupe gedrückt halten = alle Zahlen
let PTALL=false,PTLONG=false,PTT=null;
$('btnZoom').addEventListener('pointerdown',()=>{clearTimeout(PTT);PTT=setTimeout(()=>{PTALL=true;PTLONG=true;renderPts()},380)});
['pointerup','pointercancel','pointerleave'].forEach(t=>$('btnZoom').addEventListener(t,()=>{clearTimeout(PTT);if(PTALL){PTALL=false;renderPts()}}));
function renderPts(){const bw=$('bwrap');if(!bw||!state)return;let el=$('ptl');if(!el){el=document.createElement('div');el.id='ptl';el.className='ptl';bw.appendChild(el)}
  const on=PTALL||(state.phase==='review'&&state.mode!=='tut');if(!on||!state.buildings.length){el.innerHTML='';return}
  const bs=state.buildings,L=bs.map(b=>{let k={a:0,s:0};try{k=breakdown(b,bs)}catch(e){}const c=b.cells.map(([q,r])=>px(q,r)),x=c.reduce((t,p)=>t+p[0],0)/c.length,y=c.reduce((t,p)=>t+p[1],0)/c.length;return{b,a:k.a,s:k.s,v:k.a+k.s,x,y}}).sort((p,q)=>q.v-p.v);
  el.innerHTML=L.map((o,i)=>{const top=i<3,low=L.length>=8&&i>=L.length-3;if(!PTALL&&!top&&!low)return'';const[x,y]=pct([o.x,o.y]);if(x<-5||x>105||y<-5||y>105)return'';if(!PTALL)return`<span class="pt sym ${top?'top':'lo'}" style="left:${x}%;top:${y}%" title="${fmt(o.a)} B · ${fmt(o.s)} N">${top?'🏆':'▼'}</span>`;return`<span class="pt ${top?'top':low?'lo':''}" style="left:${x}%;top:${y}%">${top?'🏆 ':''}${fmt(o.a)} B · ${fmt(o.s)} N</span>`}).join('');
  // 0.93: Schilder im sichtbaren Bereich halten
  const W=bw.clientWidth,H=bw.clientHeight;for(const sp of el.children){const w=sp.offsetWidth,h=sp.offsetHeight,x=parseFloat(sp.style.left)/100*W,y=parseFloat(sp.style.top)/100*H;const nx=Math.max(w/2+4,Math.min(W-w/2-4,x)),ny=Math.max(h/2+4,Math.min(H-h/2-4,y));if(W&&nx!==x)sp.style.left=nx+'px';if(H&&ny!==y)sp.style.top=ny+'px'}}
// ziehen auf freier Fläche verschiebt den Ausschnitt
let pan=null,panRaf=0;
let PANSPEED=1.5,glide=0,gliding=false;try{PANSPEED=+localStorage.getItem('zoodeck-pan')||1.5}catch(e){}
// beim Schieben wird nur der Ausschnitt versetzt, das Gelände wird erst am Ende neu gezeichnet
function panView(){$b().setAttribute('viewBox',viewNow().join(' '));renderMini();$('fxh').style.visibility='hidden'}
function panDone(){gliding=false;$('fxh').style.visibility='';render()}
$('board').addEventListener('pointerdown',e=>{if(state.phase==='scoring'||e.target.closest('[data-ghost]'))return;if(gliding){cancelAnimationFrame(glide);panDone()}
  pan={x0:e.clientX,y0:e.clientY,cx:ZOOM?ZOOM.cx:0,cy:ZOOM?ZOOM.cy:0,s0:SHIFT,sx0:SHX,moved:false,lx:e.clientX,ly:e.clientY,lt:performance.now(),vx:0,vy:0}});
document.addEventListener('pointermove',e=>{if(!pan)return;const dx=e.clientX-pan.x0,dy=e.clientY-pan.y0;
  if(!pan.moved&&Math.hypot(dx,dy)<7)return;pan.moved=true;e.preventDefault();const sc=viewNow()[2]/($b().getBoundingClientRect().width||1)*PANSPEED;
  const now=performance.now(),dtm=Math.max(1,now-pan.lt);pan.vx=(e.clientX-pan.lx)/dtm;pan.vy=(e.clientY-pan.ly)/dtm;pan.lx=e.clientX;pan.ly=e.clientY;pan.lt=now;
  if(ZOOM){ZOOM.cx=pan.cx-dx*sc;ZOOM.cy=pan.cy-dy*sc}else{SHIFT=pan.s0+dy*sc;SHX=pan.sx0+dx*sc}
  if(!panRaf)panRaf=requestAnimationFrame(()=>{panRaf=0;if(pan)panView()})},{passive:false});
function endPan(){if(!pan)return;const p=pan;pan=null;if(!p.moved)return;suppressBoard=true;setTimeout(()=>suppressBoard=false,0);
  // Schwung: gleitet nach dem Loslassen kurz weiter
  if(!ZOOM||reduced||performance.now()-p.lt>80){panDone();return}let vx=p.vx,vy=p.vy,last=performance.now();gliding=true;
  const step=now=>{if(!ZOOM||pan){panDone();return}const dtm=now-last;last=now;const sc=viewNow()[2]/($b().getBoundingClientRect().width||1)*PANSPEED;
    ZOOM.cx-=vx*dtm*sc;ZOOM.cy-=vy*dtm*sc;vx*=.92;vy*=.92;panView();if(Math.hypot(vx,vy)>.03)glide=requestAnimationFrame(step);else panDone()};glide=requestAnimationFrame(step)}
$('board').addEventListener('dblclick',e=>{if(ZOOM||!state||state.selected!=null||state.moving!=null||(!SHIFT&&!SHX))return;SHIFT=0;SHX=0;Sfx.select();render()});
document.addEventListener('pointerup',endPan);document.addEventListener('pointercancel',endPan);
// beim Ziehen einer Karte oder der Vorschau an den Rand scrollt der Ausschnitt mit
function edgeScroll(x,y){if(!ZOOM)return false;const r=$b().getBoundingClientRect(),m=38,step=viewNow()[2]*.11;let dx=0,dy=0;
  if(x<r.left+m&&x>r.left-m)dx=-step;else if(x>r.right-m&&x<r.right+m)dx=step;if(y<r.top+m&&y>r.top-m)dy=-step;else if(y>r.bottom-m&&y<r.bottom+m)dy=step;
  if(!dx&&!dy)return false;ZOOM.cx+=dx;ZOOM.cy+=dy;return true}

/* ---------- input: move the preview with a finger or the mouse ---------- */
let gdrag=null,suppressBoard=false;
$('board').addEventListener('pointerdown',e=>{if(state.phase!=='play'||!selKey()||!state.preview||!e.target.closest('[data-ghost]'))return;
  const lift=e.pointerType==='touch'?44:0,hx=hexAt(e.clientX,e.clientY);if(!hx)return;const tb=upTarget();
  gdrag={dq:tb?0:state.preview.q-hx.q,dr:tb?0:state.preview.r-hx.r,x0:e.clientX,y0:e.clientY,active:false,lift,last:null}});
document.addEventListener('pointermove',e=>{if(!gdrag)return;
  if(!gdrag.active){if(Math.hypot(e.clientX-gdrag.x0,e.clientY-gdrag.y0)<7)return;gdrag.active=true}
  e.preventDefault();if(edgeScroll(e.clientX,e.clientY-gdrag.lift)){gdrag.last=null;render()}const hx=hexAt(e.clientX,e.clientY-gdrag.lift);if(!hx)return;const key=hk(hx.q,hx.r);
  if(key!==gdrag.last){gdrag.last=key;const p=previewAt(hx,gdrag.dq,gdrag.dr);if(p&&p.up==null&&upTarget()){p.q=hx.q;p.r=hx.r}state.preview=p;Sfx.hover();render()}},{passive:false});
function endGdrag(){if(!gdrag)return;if(gdrag.active){suppressBoard=true;setTimeout(()=>suppressBoard=false,0)}gdrag=null}
document.addEventListener('pointerup',endGdrag);document.addEventListener('pointercancel',endGdrag);
// 0.63a: Zoom mit zwei Fingern (stufenlos ×1 bis ×2,5, auf die Fingermitte) und Mausrad; die Lupe springt weiter zwischen ×1 und ×1,5
const ZMAX=2.5,PTRS=new Map();let pinch=null;
const svgPt=(x,y)=>{const sv=$b();if(!sv.getScreenCTM)return null;const m=sv.getScreenCTM();if(!m)return null;const p=sv.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(m.inverse())};
function zoomAt(f,x,y){if(!state)return;const W=svgPt(x,y);f=Math.max(1,Math.min(ZMAX,f));
  if(f<1.03){if(ZOOM){ZOOM=null;SHIFT=0;SHX=0}}else{if(!ZOOM){const vb=viewNow();ZOOM={cx:vb[0]+vb[2]/2,cy:vb[1]+vb[3]/2}}ZOOM.f=+f.toFixed(3)}
  VNC=null;$b().setAttribute('viewBox',viewNow().join(' '));if(ZOOM&&W){const W2=svgPt(x,y);if(W2){ZOOM.cx+=W.x-W2.x;ZOOM.cy+=W.y-W2.y}}panView()}
function zoomSave(){META.zoomOut=ZOOM?0:1;try{saveMeta()}catch(e){}}
$('board').addEventListener('pointerdown',e=>{PTRS.set(e.pointerId,[e.clientX,e.clientY]);if(PTRS.size===2&&state&&state.phase!=='scoring'){const[a,b]=[...PTRS.values()];pan=null;gdrag=null;if(gliding){cancelAnimationFrame(glide);gliding=false}
  pinch={d0:Math.hypot(a[0]-b[0],a[1]-b[1])||1,f0:ZOOM?(ZOOM.f||ZF):1};suppressBoard=true}},true);
document.addEventListener('pointermove',e=>{if(!PTRS.has(e.pointerId))return;PTRS.set(e.pointerId,[e.clientX,e.clientY]);if(!pinch||PTRS.size<2)return;e.preventDefault();const[a,b]=[...PTRS.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);
  zoomAt(pinch.f0*d/pinch.d0,(a[0]+b[0])/2,(a[1]+b[1])/2)},{passive:false});
const ptrUp=e=>{PTRS.delete(e.pointerId);if(pinch&&PTRS.size<2){pinch=null;pan=null;zoomSave();render();setTimeout(()=>suppressBoard=false,60)}};
document.addEventListener('pointerup',ptrUp);document.addEventListener('pointercancel',ptrUp);
$('board').addEventListener('wheel',e=>{if(!state||state.phase==='scoring')return;e.preventDefault();const f0=ZOOM?(ZOOM.f||ZF):1;zoomAt(f0*(e.deltaY<0?1.12:1/1.12),e.clientX,e.clientY);clearTimeout(zoomAt.t);zoomAt.t=setTimeout(()=>{zoomSave();render()},250)},{passive:false});
/* ---------- input: drag & drop ---------- */
let drag=null,dragEl=null;
$('hand').addEventListener('pointerdown',e=>{const c=e.target.closest('.card');if(!c||state.phase!=='play'||e.button>0)return;
  if(!affordable(state.hand[+c.dataset.i]))return;
  drag={i:+c.dataset.i,x0:e.clientX,y0:e.clientY,active:false,touch:e.pointerType!=='mouse',last:null}});
document.addEventListener('pointermove',e=>{if(!drag)return;
  if(!drag.active){if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<8)return;drag.active=true;
    if(state.selected!==drag.i)selectCard(drag.i);state.preview=null;
    const k=state.hand[drag.i];dragEl=document.createElement('div');dragEl.className='dragimg';dragEl.innerHTML=`${CARDS[k].icon}${miniShape(k,state.rot)}`;document.body.appendChild(dragEl);
    Sfx.select();render()}
  e.preventDefault();
  const y=e.clientY-(drag.touch?56:0);dragEl.style.left=e.clientX+'px';dragEl.style.top=y+'px';
  if(edgeScroll(e.clientX,y)){drag.last=null;render()}const hx=hexAt(e.clientX,y),key=hx?hk(hx.q,hx.r):null;dragEl.style.opacity=hx?'0':'1';
  if(key!==drag.last){drag.last=key;state.preview=previewAt(hx);if(hx)Sfx.hover();render()}},{passive:false});
function endDrag(){if(!drag)return;const d=drag;drag=null;if(dragEl){dragEl.remove();dragEl=null}
  if(d.active){suppressClick=true;setTimeout(()=>suppressClick=false,0);render()}}
document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);

function rotate(){if(state.phase!=='play'||!selKey()||costOf(selKey())<2||upTarget())return;state.rot=(state.rot+1)%6;Sfx.rotate();render()}
$('btnRot').addEventListener('click',rotate);
$('btnDem').addEventListener('click',()=>{const id=state&&state.info;if(id==null)return;if(state.demArm!==id){state.demArm=id;Sfx.select();render()}else demolish(id)});
const undoOk=()=>{const ts=tutStep();if(ts&&tutGuided()&&state.moving==null&&!ts.undo){Sfx.deny();tutNudge();return false}return true};
$('btnUndo').addEventListener('click',()=>{if(undoOk())undo()});
document.addEventListener('keydown',e=>{if(!state||screen)return;if(e.key==='r'||e.key==='R')rotate();if((e.key==='z'||e.key==='Z')&&state.phase==='play'&&undoOk())undo();if(e.key==='Enter'&&state.phase==='play')build();if(e.key==='Enter'&&state.phase==='review'){state.info=null;endDay()}if(e.key==='Escape'){if(modal!=='inspPick')modal=null;state.moving=null;render()}});
$('btnBuild').addEventListener('click',()=>{if(state.phase==='play'&&state.moving==null&&state.selected==null&&state.info!=null){const b=state.buildings.find(x=>x.id===state.info);if(b&&state.bp>=1){startMove(b);Sfx.select();render()}else Sfx.deny();return}build()});
$('btnEnd').addEventListener('click',()=>{if(state.phase==='review'){state.info=null;endDay();return}if(state.phase!=='play')return;if(tutStep()&&!tutStep().end){Sfx.deny();tutNudge();return}if(!state.mwOk&&!gRun()&&(state.spec||[]).length){try{const r=scoreZoo(state.buildings),inc=dayIncome(r.A,r.S,state.money);if(state.money>=0&&state.money+inc.total<0){state.mwInc=inc.total;modal='mwarn';Sfx.deny&&Sfx.deny();render();return}}catch(e){}}state.mwOk=false;ZPREV=ZOOM;ZSH=[SHIFT,SHX];ZOOM=null;SHIFT=0;SHX=0;state.moving=null;
  state.discard.push(...state.hand);state.hand=[];state.hover=null;state.selected=null;state.preview=null;state.info=null;state.infoProg=null;startScoring()});
$('btnMute').addEventListener('click',()=>{Sfx.muted=!Sfx.muted;try{localStorage.setItem('zoodeck-muted',Sfx.muted?'1':'0')}catch(e){}if(!Sfx.muted){Sfx.init();Sfx.select()}render()});
$('btnHelp').addEventListener('click',()=>{helpOpen=false;modal='help';render()});
$('btnDeck').addEventListener('click',()=>{modal='deck';render()});
document.addEventListener('click',()=>{if(state&&state.phase==='scoring')fast=true},true);
let rsT=null;addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{const o=ROT;computeView();if(o!==ROT&&state&&!screen&&state.phase!=='scoring')render()},150)});

// 0.93: Umziehen einmal am Tag gratis (außer im Tutorial); Abreißen 1 BP, Karte zurück ins Deck
const winIs=id=>!!(state&&state.zl&&state.zl.insp===id&&seOf(state.season)&&seOf(state.season).winter);
const dayKeyNow=()=>(state.zoo||0)+'/'+state.season+'/'+state.day;
const moveCost=()=>winIs('glatteis')?99:umbUz()?0:hasSpec('umzug')||state.freeMv!==dayKeyNow()?0:1;
function demolish(id){const b=state.buildings.find(x=>x.id===id);if(!b||state.phase!=='play'||CARDS[b.key].ms||state.bp<1){Sfx.deny();return}
  state.buildings=state.buildings.filter(x=>x!==b);state.bp-=1;
  state.undo=[];state.info=null;state.demArm=null;state.terr=[...TERR];Sfx.till&&Sfx.till();render()}
function build(){const h=hypo();if(!h||!h.ok||state.phase!=='play')return;if(typeof tutPvLock==='function'&&tutPvLock()){Sfx.deny();return}const bon0=state.zl?{v:vielfalt(state.buildings).f,p:zlPurity(state.buildings,mkIndex(state.buildings)).n}:null;
  if(h.move){const mc=moveCost(),fm=mc===0&&!hasSpec('umzug');if(state.bp<mc){Sfx.deny();return}if(fm)state.freeMv=dayKeyNow();state.undo.push({t:'mv',id:h.move.id,cells:h.move.cells,mc,fm});h.move.cells=h.cells;state.bp-=mc;state.moving=null;state.preview=null;state.info=null;Sfx.build();render();return}const key=state.hand[state.selected],hi=state.selected,cst=costOf(key),kd=kuDisc(key)?1:0;
  let fxId=null;if(h.up){fxId=h.up.id;h.up.lvl=(h.up.lvl||1)+1;const ne=CARDS[key].ed||null;if(ne)h.up.ed=(h.up.ed||'')+ne;const np=CARDS[key].pr&&!h.up.pr?CARDS[key].pr:null;if(np)h.up.pr=np;state.undo.push({t:'up',id:h.up.id,key,hi,ne,np,cost:cst,kd})}
  else{const id=state.nextId++;fxId=id;const ed=CARDS[key].ed,pr=CARDS[key].pr,nb0={id,key:baseK(key),cells:h.cells,lvl:1};if(ed)nb0.ed=ed;if(pr)nb0.pr=pr;if(CARDS[key].cat==='gehege'&&CARDS[key].hab==='gebirge'&&h.cells.some(([q,r])=>TERR.get(hk(q,r))==='block'||DIRS.some(([a,c])=>TERR.get(hk(q+a,r+c))==='block')))nb0.fels=1;state.buildings.push(nb0);zlBuilt(key,1);try{flBuilt(nb0,1)}catch(e){}try{grwBuilt(baseK(key))}catch(e){}state.undo.push({t:'build',id,key,hi,cost:cst,kd})}
  state.bp-=cst;if(kd)state.kuUsed=1;if(!cst)state.free1=(state.free1||0)+1;state.hand.splice(hi,1);state.builtToday++;{let rk=0;for(const[q,r]of h.cells)if(TERR.get(hk(q,r))==='block'){TERR.delete(hk(q,r));rk++}if(rk){state.terr=[...TERR];state.undo=[];if(Math.random()<chance(.25)){state.money+=20;state.stats.earned+=20;state.bannerQ=(state.bannerQ||[]).concat([['🦴 Fossil gefunden!','Unter dem Felsen lag ein Fossil: +20 Taler.']])}}}try{discover92()}catch(e){} // gebaute Karten sind verbraucht
  state.mileSeen=state.mileSeen||{};for(const t in MILE){const M=MILE[t];if((state.miles||{})[t]||state.mileSeen[t]||mileCount(state.buildings,t)<M.n)continue;state.mileSeen[t]=1;
    const bn=document.createElement('div');bn.className='mbanner';bn.innerHTML=`<b>🏅 Meilenstein!</b><span>${M.n} verschiedene ${M.label} · morgen früh bekommst du eine besondere Karte</span>`;document.querySelector('.boardarea').appendChild(bn);setTimeout(()=>bn.remove(),2800);Sfx.combo();setTimeout(()=>sparks(boardCenter(),14),60)}
  if(bon0)try{const v=vielfalt(state.buildings),pu=zlPurity(state.buildings,mkIndex(state.buildings)),fx=f=>'×'+String(+f.toFixed(2)).replace('.',',');let t=null;
    if(v.f>bon0.v)t=`<b>🎨 Vielfalt${bon0.v>1?' steigt':''}!</b><span>Alle Lebensräume, je ${v.lvl}+ Arten · ${fx(v.f)} Natur für den Zoo${pu.n>=PURN&&purF(pu.n)>=v.f?' (deine Reinheit ist gerade stärker)':''}</span>`;
    else if(pu.n>bon0.p&&pu.n>=PURN)t=`<b>🧬 Reinheit${bon0.p>=PURN?' steigt':''}!</b><span>${pu.n} verschiedene ${HAB[pu.hab].label}-Arten zusammen · ${fx(purF(pu.n))} Natur für den Zoo${v.f>purF(pu.n)?' (deine Vielfalt ist gerade stärker)':''}</span>`;
    if(t){const bn=document.createElement('div');bn.className='mbanner';bn.innerHTML=t;const ba=document.querySelector('.boardarea');if(ba){ba.appendChild(bn);setTimeout(()=>bn.remove(),2800)}Sfx.combo();setTimeout(()=>{try{sparks(boardCenter(),14)}catch(e){}},60)}}catch(e){}
  state.selected=null;state.preview=null;state.info=null;Sfx.build();render();fxDrop(fxId);flushBanners()}

/* ---------- scoring ---------- */
async function startScoring(){if(!state)return;state._scM=0;try{await startScoring0()}catch(e){logErr('Auszählen',e);if(!state)return;
  if(!state._scM&&state.phase==='scoring'){try{await startScoring0(1);showErr('⚠️ Beim Auszählen ist ein Fehler passiert, der Tag wurde ohne Effekte ausgezählt. Bitte „📋 Lauf kopieren“ an Claude schicken.');return}catch(e2){logErr('Auszählen (2. Versuch)',e2)}}
  if(state&&state.phase==='scoring'){state.phase='review';try{render()}catch(e3){logErr('Anzeige nach Auszählen',e3)}}showErr('⚠️ Fehler beim Auszählen. Bitte „📋 Lauf kopieren“ an Claude schicken.')}}
async function startScoring0(retry){state.phase='scoring';fast=!!retry;if(!retry)try{rollLuck()}catch(e){console.warn(e)}render();{const L=LK();if(L&&L.spec.wb&&!reduced)setTimeout(()=>hopTeam('wettbuero','🪙×2'),200)}
  const bs=state.buildings,r=scoreZoo(bs),byId=Object.fromEntries(bs.map(b=>[b.id,b]));let a=0,s=0,i=0;
  setCounters(0,0,0);$('tLabel').textContent=`Tag ${state.day+1}`;
  const quick=()=>fast||reduced;
  // Gesamtdauer gedeckelt: große Zoos zählen schneller, zum Ende hin zieht das Tempo an
  const N=Math.max(1,r.steps.length),budget=SCFAST?1400:2800,base=Math.max(SCFAST?28:45,Math.min(SCFAST?220:340,budget/N));
  const dt=()=>quick()?0:base*(1.3-.6*i/N);
  const posOf=st=>{const sr=sourcesOf(byId[st.id],bs),p=cnt(sr,x=>x.da+x.ds>0),n=cnt(sr,x=>x.da+x.ds<0);return n>p?0:p};
  const maxPos=Math.max(0,...r.steps.map(posOf));let paused=false;
  // Zähler heizen sich auf, je näher das Tagesergebnis ans Saisonziel kommt
  const tgt=seOf(state.season).target,ctr=document.querySelector('.counters');let heat=0;
  const setHeat=v=>{const hNow=quick()?0:v>=tgt?4:v>=tgt*.4?3:v>=tgt*.2?2:v>=tgt*.1?1:0;if(hNow===heat)return;const up=hNow>heat;heat=hNow;Sfx.heat=heat;ctr.classList.remove('h1','h2','h3','h4');if(heat)ctr.classList.add('h'+heat);
    if(up&&heat===3)fxShake(1);if(up&&heat===4)fxShake(3);
    if(heat===4){const z=document.createElement('div');z.className='blazefx';document.body.appendChild(z);setTimeout(()=>z.remove(),950);Sfx.sparkle()}};
  await wait(quick()?0:350);
  if(state.vline&&hasSpec('vermesser')&&!quick()){try{const fx=$('fxl'),L=state.vline.filter(k=>ONBOARD.has(k));L.forEach((k,i)=>{const[q,r]=k.split(',').map(Number),[x,y]=px(q,r);fx.insertAdjacentHTML('beforeend',`<polygon class="vsweep" style="animation-delay:${(i*.05).toFixed(2)}s" points="${hexPts(x,y,SZ*.95)}" pointer-events="none"/>`)});try{Sfx.sparkle()}catch(e){}await wait(Math.min(900,L.length*50+250));setTimeout(()=>fx.querySelectorAll('.vsweep').forEach(e=>e.remove()),1300)}catch(e){}}
  for(const st of r.steps){if(state.zl&&!st.a&&!st.s&&zlDead(byId[st.id],bs)){i++;continue}const b=byId[st.id],c=centroid(b.cells),el=$b().querySelector(`[data-bid="${st.id}"]`);
    if(el&&quick()){el.classList.remove('pulse');el.getBoundingClientRect();el.classList.add('pulse')}
    if(state.tfeld&&hasSpec('tagesfeld')&&!quick()&&b.cells.some(([q,r])=>hk(q,r)===state.tfeld)){const[lx,ly]=pct(c),lab=document.createElement('span');lab.className='combo luck';lab.style.left=lx+'%';lab.style.top=ly+'%';lab.textContent='⭐ ×3!';$('fxh').appendChild(lab);fxClamp(lab,lx,ly);setTimeout(()=>lab.remove(),1500);try{Sfx.combo();sparks(c,22)}catch(e){}await wait(320)}
    if(st.luck&&!quick()){const[lx,ly]=pct(c),lab=document.createElement('span');lab.className='combo luck';lab.style.left=lx+'%';lab.style.top=ly+'%';lab.textContent=st.luck;$('fxh').appendChild(lab);fxClamp(lab,lx,ly);setTimeout(()=>lab.remove(),1500);try{Sfx.combo();sparks(c,16)}catch(e){}await wait(280)}
    {const srcs=sourcesOf(b,bs),pos=cnt(srcs,x=>x.da+x.ds>0),neg=cnt(srcs,x=>x.da+x.ds<0),bad=neg>pos,tier=bad?0:Math.min(4,pos);if(!bad)state.stats.combo=Math.max(state.stats.combo||0,pos);{const S=state.sc=state.sc||{},e=S[b.id]=S[b.id]||{a:0,s:0,p:0,k:b.key};e.a+=Math.max(0,st.a);e.s+=Math.max(0,st.s);if(!bad&&pos>e.p){e.p=pos;e.src=srcs.filter(x=>x.da+x.ds>0&&byId[x.id]).map(x=>byId[x.id].key)}}
      if(el&&!quick()&&fxStrong()&&tier===4){await wait(70)}
      if(el&&!quick()){el.parentNode.appendChild(el);el.style.setProperty('--s',[1.08,1.16,1.3,1.45,1.7][tier]);if(fxStrong()&&tier>=3){if(tier===4)fxPunch(c,1.08);fxBurst(c,tier===4?40:16);if(tier===4)Sfx.boom&&Sfx.boom()}el.classList.remove('pulse','pop','popbig');el.classList.add(tier===4?'popbig':'pop');
        if(bad||tier>0){const f=document.createElementNS('http://www.w3.org/2000/svg','g');f.setAttribute('class','fxfill '+(bad?'neg':'t'+tier));f.innerHTML=shapeSvg(b.cells).replace(/<path[^>]*\/>/,'');el.appendChild(f)}
        const[rx,ry]=c,big=b.cells.length>1,ring=d=>`<polygon class="ring ${tier>=3?'hot':''}" style="animation-delay:${d}s" points="${hexPts(rx,ry,SZ*(big?1.6:1.1))}"/>`;
        if(tier===2)$('fxl').insertAdjacentHTML('beforeend',ring(0));
        if(tier>=3)$('fxl').insertAdjacentHTML('beforeend',ring(0)+ring(.18));
        if(tier===3){sparks(c,8);Sfx.sparkle()}
        if(tier===4){let rays='';for(let i=0;i<12;i++){const an=i/12*Math.PI*2;rays+=`<line x1="${(rx+Math.cos(an)*SZ*.9).toFixed(1)}" y1="${(ry+Math.sin(an)*SZ*.9).toFixed(1)}" x2="${(rx+Math.cos(an)*SZ*3.4).toFixed(1)}" y2="${(ry+Math.sin(an)*SZ*3.4).toFixed(1)}"/>`}
          $('fxl').insertAdjacentHTML('beforeend',`<g class="rays">${rays}</g>`+ring(.36));fxShake(2);sparks(c,14);setTimeout(()=>sparks(c,10),260);Sfx.combo()}
        if(tier>=2){const[lx,ly]=pct(c),lab=document.createElement('span');lab.className='combo '+(tier===4?'max':'');lab.style.left=lx+'%';lab.style.top=ly+'%';lab.textContent=tier===4?`KOMBO ×${pos}!`:`×${pos}`;$('fxh').appendChild(lab);fxClamp(lab,lx,ly);setTimeout(()=>lab.remove(),tier===4?1500:900)}
        }}
    a+=st.a;s+=st.s;{const e=state.stats.cards[b.key]=state.stats.cards[b.key]||{a:0,s:0};e.a+=st.a;e.s+=st.s}
    if(!quick()){{const mx=N>24?1:N>14?2:4;if(st.a>0)fxFly(c,'cA','a',Math.min(mx,1+Math.floor(Math.log10(st.a+1))));if(st.s>0)fxFly(c,'cS','s',Math.min(mx,1+Math.floor(Math.log10(st.s+1))))}}
    {const bg=fxStrong()&&!quick()&&posOf(st)>=2?' big':'';if(st.a)floatAt(c,(st.a>0?'+':'−')+Math.abs(st.a)+' B',(st.a>0?'a':'a neg')+bg);
    if(st.s)floatAt(c,(st.s>0?'+':'−')+Math.abs(st.s)+' N',(st.s>0?'s':'s neg')+bg)}
    if(!quick()&&N<=30&&!strike()){try{const ix=mkIndex(bs),nb=nbrs(b,ix);for(const id of teamAct()){const S=SPEC[id];if(S&&S.per&&S.per(b,CARDS[b.key],nb,bs))twitchTeam(id)}}catch(e){}}
    if(!quick()){Sfx.chip(i,r.steps.length,st.a!==0,st.s!==0);const fx=$('fxl');let k=0;
      for(const src of sourcesOf(b,bs)){const n=centroid(byId[src.id].cells),neg=src.da+src.ds<0;
        fx.insertAdjacentHTML('beforeend',`<line class="link flash ${neg?'neg':''}" x1="${n[0]}" y1="${n[1]}" x2="${c[0]}" y2="${c[1]}"/>`);
        const[x,y]=pct(n),bd=document.createElement('span');bd.className='badge flash'+(neg?' neg':'');bd.style.left=x+'%';bd.style.top=y+'%';bd.innerHTML=bTxt(src.da,src.ds);$('fxh').appendChild(bd);
        setTimeout(()=>bd.remove(),1000);if(neg)Sfx.neg();else Sfx.bonus(i,r.steps.length,k++)}
      setTimeout(()=>fx.querySelectorAll('.flash').forEach(l=>l.remove()),950)}
    setCounters(Math.max(0,a),Math.max(0,s));setHeat(Math.max(0,a)*Math.max(0,s));if(st.a)bump('cA');if(st.s)bump('cS');i++;await wait(dt())}
  const MS=r.mults.reduce((n,m)=>n+(m.ma?1:0)+(m.ms?1:0),0);let mk=0;const mfac=()=>{let tot=0;for(let j=0;j<MS;j++)tot+=Math.max(.25,Math.pow(.8,j));return Math.max(.25,Math.pow(.8,mk))*Math.min(1,(SCFAST?2000:3500)/((SCFAST?600:1050)*tot))};
  let mi=0;for(const m of r.mults){if(m.spec&&!quick())hopTeam(m.spec,m.ma?'×'+mxs(m.ma):m.ms?'×'+mxs(m.ms):'');const src=m.id!=null?byId[m.id]:null,c=src?centroid(src.cells):boardCenter(),ic=m.icon||(src?CARDS[src.key].icon:'');
    for(const[key,cid,unit]of[['ma','cA','B'],['ms','cS','N']]){if(!m[key])continue;const tx='×'+String(m[key]).replace('.',',');
      if(key==='ma')a*=m.ma;else s*=m.ms;
      if(!quick()){const pop=document.createElement('span');pop.className='multpop';pop.innerHTML=`<b>${tx}</b><i>${m.icon||(src?icOf(CARDS[src.key]):'')} ${m.label}</i>`;$(cid).appendChild(pop);setTimeout(()=>pop.remove(),1050);
        floatAt(c,`${ic} ${tx} ${unit}`,'m');const el=src&&$b().querySelector(`[data-bid="${src.id}"]`);
        if(el){el.parentNode.appendChild(el);el.style.setProperty('--s',1.3);el.classList.remove('pop','popbig','pulse');el.classList.add('pop');const f=document.createElementNS('http://www.w3.org/2000/svg','g');f.setAttribute('class','fxfill t2');f.innerHTML=shapeSvg(src.cells).replace(/<path[^>]*\/>/,'');el.appendChild(f)}
        Sfx.mult(mi++);if(fxStrong()){fxSlam(cid,key==='ma'?['#ffb35c','#ffd166','#fff']:['#3fd6c4','#9ff0e6','#fff']);fxShake(1)}await wait((SCFAST?380:620)*mfac())}
      setCounters(Math.max(0,Math.round(a)),Math.max(0,Math.round(s)));setHeat(Math.max(0,a)*Math.max(0,s));bump(cid);await wait(quick()?0:(SCFAST?220:430)*mfac());mk++}}
  if(MS>1&&!quick())await wait(260);
  setCounters(r.A,r.S);
  const dur=quick()?0:Math.min(1.3,.5+Math.log10(Math.max(10,r.total))*.3)*(SCFAST?.5:1);
  if(r.total>0&&dur>0){Sfx.coins(dur);const t0=performance.now();
    await new Promise(res=>{const tick=now=>{const f=Math.min(1,(now-t0)/(dur*1000));$('vT').textContent=fmt(r.total*(1-(1-f)**2));if(f<1&&!fast)requestAnimationFrame(tick);else res()};requestAnimationFrame(tick)})}
  $('vT').textContent=fmt(r.total);bump('cT');if(!quick()&&r.total>0){const big=r.total>((state.yday&&state.yday.total)||0),tg=seOf(state.season).target,reach=state.seasonScore<tg&&state.seasonScore+r.total>=tg;fxSlam('cT');if(reach){fxFlash();fxPunch(boardCenter(),1.05)}if(big||reach)fxShake(reach&&fxStrong()?2:1)}if(r.total>0)Sfx.total(r.total>((state.yday&&state.yday.total)||0));await wait(quick()?0:300);
  // money
  try{flDay(r)}catch(e){}const inc=dayIncome(r.A,r.S,state.money);state.money+=inc.total;state._scM=1;state.lastIncome=inc;strikeNote(state.money-inc.total);
  {const L=state.ledger=state.ledger||{entry:0,care:0,interest:0,early:0};L.entry+=inc.entry;L.care+=inc.care;L.interest+=inc.interest;L.spec=(L.spec||0)+(inc.spec||0)}
  {const t=state.stats;t.days++;if(inc.total>0)t.earned+=inc.total;if(!t.best||r.total>t.best.pts)t.best={pts:r.total,season:state.season,day:state.day,zoo:state.zoo}}
  const mo=$('money');mo.textContent=`🪙 ${fmt(state.money)}`;mo.classList.toggle('neg',state.money<0);mo.classList.remove('pop');void mo.offsetWidth;mo.classList.add('pop');
  floatAt([VB[0]+VB[2]/2,VB[1]+VB[3]*.12],`🪙 ${sgn(inc.total)}`,inc.total>=0?'m':'m neg');if(!quick()&&inc.total)Sfx.till();
  state.prevY=state.day||state.season?state.yday:null;state.yday={A:r.A,S:r.S,total:r.total,auf:aufOf(r)};state.seasonScore+=r.total;state.totalScore+=r.total;state.lastDay=r.total;state.dayPts[state.day]=r.total;
  const se=seOf(state.season);$('sScore').textContent=fmt(state.seasonScore);
  $('bar').firstElementChild.style.width=Math.min(100,state.seasonScore/se.target*100)+'%';renderLog();
  await wait(quick()?0:400);
  Sfx.heat=0;ctr.classList.remove('h1','h2','h3','h4');state.phase='review';state.info=null;Sfx.select();render()}
function endDay(){try{eveMoment()}catch(e){console.warn(e)}const se=seOf(state.season);try{wishEval(false)}catch(e){}try{fsCheck('day')}catch(e){}state.picks=state.pickTotal=state.builtToday;state.earlyBonus=0;state.draftRolls=0;
  const scr=tutGuided();
  if(scr?state.day===DAYS-1&&state.seasonScore>=se.target:state.seasonScore>=se.target){const left=DAYS-1-state.day;try{wishEval(true,left)}catch(e){}try{fsCheck('won',{left})}catch(e){console.warn(e)}z2Breed();if(state.zl&&left>=2&&(state.spec||[]).includes('z_rekord'))state.zl.grow.z_rekord=(state.zl.grow.z_rekord||0)+1;state.earlyR=null;state.earlyBonus=TUTNOW?0:left*EARLY_BONUS;state.money+=state.earlyBonus;state.earlyInfo=TUTNOW?'':earlyReward(left);state.stats.earned+=state.earlyBonus;(state.ledger=state.ledger||{entry:0,care:0,interest:0,early:0}).early+=state.earlyBonus;
    if(state.season<SEASONS.length-1){state.eventsNext=rollSeason(state.season+1);state.evRolled=true}
    logSeason(1);state.phase=state.season===SEASONS.length-1?'win':'seasonWon';Sfx.win();render()}
  else if(state.day===DAYS-1){try{fsCheck('season')}catch(e){}logSeason(0);state.phase='lost';Sfx.lose();render()}
  else nextDraft()}
function nextDraft(){if(state.picks>0){state.phase='draft';newOffer();render()}else advance()}
const draftPrice=()=>5+2*(state.draftRolls||0);
function draftRoll(){if(tutDraft()){Sfx.deny();return}const p=draftPrice();if(state.phase!=='draft'||!canPay(p)){Sfx.deny();return}state.money-=p;state.stats.spent+=p;state.draftRolls=(state.draftRolls||0)+1;newOffer();Sfx.till();Sfx.draw();render()}
const deckTotal=()=>state.hand.length+state.deck.length+state.discard.length,skipOk=()=>deckTotal()>MINSKIP;
const tutDraft=()=>!!(tutGuided()&&state.phase==='draft');
const vNew=k=>{const sl=activeSlot();return CARDS[k].cat==='verst'&&!((sl&&sl.vseen)||{})[baseK(k)]};
function pick(i){if(i==null)return;if(tutDraft()&&i!==0){Sfx.deny();return}{const k=state.offer[i],sl=activeSlot();if(k&&sl&&CARDS[k]&&CARDS[k].cat==='verst'){sl.vseen=sl.vseen||{};sl.vseen[baseK(k)]=1}}try{flRare(state.offer[i])}catch(e){}state.discard.push(state.offer[i]);state.offer=[];state.picks--;Sfx.cardpick();
  if(state.picks>0){newOffer();render()}else advance()}
function advance(){
  if(state.pendingSeason){openShop();return}
  state.day++;startDay()}
function beginNextSeason(){{const turn=(()=>{try{return seasonTurn()}catch(e){console.warn(e);return[]}})();state.newsNext=turn.map(([i,t,x])=>`${i} ${t}`);state.bannerQ=(state.bannerQ||[]).concat(turn.map(([i,t,x])=>[i+' '+t,x]));if(state.luckNext){state.luckNext=0;state.luckBoost='0/'+(state.season+1)}if(runAus('rd'))state.rdBonus=(state.rdBonus||0)+1}if(state.zl){state.zl.tv=!!state.zl.tvNext;state.zl.tvNext=false}state.pendingSeason=false;state.shop=null;state.shopSub=null;
  state.past.push({name:seOf(state.season).name,pts:state.seasonScore});state.sc={};state.season++;state.day=0;state.seasonScore=0;state.dayPts=[];
  state.ads=state.adsNext;state.adsNext=[];state.bpSeason=state.bpNext||0;state.bpNext=0;state.bpMax=bpBase()+state.bpSeason;state.market=null;state.events=state.eventsNext||[];state.eventsNext=[];state.evRolled=false;state.ledger={entry:0,care:0,interest:0,early:0};if(state.zl&&state.zl.insp==='hab'&&seOf(state.season).winter)state.zl.inspHabs=habTop(state.buildings);syncCtx();startDay();if(state.zl&&CTX.winter){modal=state.zl.inspOpts&&!state.zl.inspPicked?'inspPick':'insp';render()}
  else if(state.zl&&state.season===2&&state.mode==='camp'&&(state.zl.insp||state.zl.inspOpts)&&!(activeSlot()&&activeSlot().run&&activeSlot().run.tut)){modal='wetter';render()}}

/* ---------- shop ---------- */
function openShop(){state.phase='shop';state.shopSub=null;state.mappe=null;try{const r=runOf(),G=(r&&r.gifts||[]).filter(g=>g!=='gsack'||sackOn());if(G.length)setTimeout(()=>{try{if(state&&state.shop&&!state.shop.note){state.shop.note='🎁 Geschenk fürs frühe Schaffen: '+G.map(g=>EARLYG[g][0]+' '+EARLYG[g][1]).join(', ')+' (gratis im Shop).';render()}}catch(e){}},0)}catch(e){}if(!state.evRolled){state.eventsNext=rollSeason(state.season+1);state.evRolled=true}state.shop={rerolls:0,items:genEinmal()};{const ab=ausbauItem();if(ab)state.shop.items.push(ab)}state.shopTab='shop';state.market=null;Sfx.shop();render()}
// 0.91 Bewerbermappe: 3 zufällige Spezialisten, einen einstellen; 25 Taler, jede weitere im selben Zoo +10
const EINMAL={futter:{icon:'🥕',name:'Futterlieferung',price:15,text:'Ein zufälliges Gehege deines Decks bekommt eine zufällige Verbesserung (Prägung).'},
  zeitung:{icon:'📰',name:'Zeitungsartikel',price:20,text:'Alle Showtiere zählen bis zum Ende dieses Zoos ×1,5.'},
  glueckslos:{icon:'🎟️',name:'Glückslos',price:12,text:'Am ersten Tag der nächsten Jahreszeit sind alle Chancen doppelt.'}};
const AUSBAU={hand:{icon:'🖐️',name:'Größere Hand',text:'+1 Handkarte, für den ganzen Lauf.'},team:{icon:'🪑',name:'Mehr Büros',text:'+1 Platz im Team, für den ganzen Lauf.'},rd:{icon:'🔄',name:'Kartenautomat',text:'+1 Gratis-Neuziehen in jeder Jahreszeit, für den ganzen Lauf.'},mappe:{icon:'📂',name:'Personalbüro',text:'Bewerbermappen haben 4 statt 3 Bewerbungen, für den ganzen Lauf.'}};
function genEinmal(){const n=state.mode==='camp'?2+(runAus('shop')?1:0):0;return shuffle(Object.keys(EINMAL).filter(k=>!(k==='futter'&&foodOn()))).slice(0,n).map(k=>({kind:'einmal',key:k,price:priced(EINMAL[k].price)}))}
function ausbauItem(){if(state.mode!=='camp'||!state.zl)return null;const run=runOf();if(!run)return null;if(state.ausbauDone)return null;if(state.ausbauKey&&!AUSBAU[state.ausbauKey])state.ausbauKey=null;if(!state.ausbauKey){const av=Object.keys(AUSBAU).filter(k=>!(run.ausbau||[]).includes(k));if(!av.length)return null;state.ausbauKey=av[Math.floor(Math.random()*av.length)]}return{kind:'ausbau',key:state.ausbauKey,price:priced(40)}}
const mappePrice=()=>Math.round((25+10*(state.mappeN||0))*stW('teurer',1)*(runDeck()==='geniesser'?.8:1)*(runDeck()==='freizeit'?1.25:1));
// 0.64a Profi-Mappe: 3 Bewerbungen, mind. 1 selten/legendär, Selten/Legendär 3× so oft; ab Sommer, nicht im Tutorial
const PROFIW=SPEZ_DATEN.profi_gewicht.slice(),profiPrice=()=>Math.round((45+15*(state.profiN||0))*stW('teurer',1)*(runDeck()==='geniesser'?.8:1)*(runDeck()==='freizeit'?1.25:1)),profiOn=()=>!!(state&&state.mode==='camp'&&runOf()&&!runOf().tut);
function runOf(){const sl=activeSlot();return sl&&sl.run}
const specPrice=id=>Math.round(priced(SPECPRICE[SPEC[id].tier])*(1+.25*((state.spec||[]).length))*(runDeck()==='freizeit'?1.25:1));
function rollMarket(n,excl=[]){if((()=>{try{const r=runOf();return r&&r.seed}catch(e){return 0}})())return rollSpecs(n,excl);const out=rollSpecs(n,excl),isM=id=>!!SPEC[id].mult;let g=0;while(out.filter(isM).length>1&&g++<20){const i=out.findIndex((id,j)=>isM(id)&&out.slice(0,j).some(isM)),alt=rollSpecs(8,[...excl,...out]).find(id=>!isM(id));if(!alt)break;out[i]=alt}return out}
const SPECHAB={...SPEZ_DATEN.lebensraum};
const specOff=id=>{const h=SPECHAB[id]||(/^(pfleger|z)_(.+)$/.exec(id)||[])[2];return!!h&&!!HAB[h]&&!habsNow().includes(h)};
function rollSpecs(n,excl=[],WT,guar){WT=WT||[0,8,2,1];const run=runOf(),have=run?run.spec||[]:[],pool=Object.keys(SPEC).filter(id=>id!=='eventmanager'&&!(id==='wunsch'&&stAb('keine_wuensche'))&&!SPEC[id].gone&&!SPEC[id].rb&&!specOff(id)&&!specLocked(id)&&!have.includes(id)&&!excl.includes(id)&&(!SPEC[id].zl||(run&&run.zl))&&(!SPEC[id].food||foodOnRun(run))),out=[];
  if(run&&run.seed&&n<8)return pool.sort((a,b)=>SPEC[b].tier-SPEC[a].tier||SPEC[a].name.localeCompare(SPEC[b].name));
  while(out.length<n&&pool.length){const w=pool.map(id=>WT[SPEC[id].tier]),tot=w.reduce((a,b)=>a+b,0);let r=Math.random()*tot,i=0;for(;i<pool.length-1;i++){r-=w[i];if(r<=0)break}out.push(pool.splice(i,1)[0])}
  // 0.64a Profi-Mappe: mindestens eine seltene oder legendäre Bewerbung
  if(guar&&out.length&&!out.some(id=>SPEC[id].tier>=2)){const hi=pool.filter(id=>SPEC[id].tier>=2);if(hi.length){const w=hi.map(id=>WT[SPEC[id].tier]),tot=w.reduce((a,b)=>a+b,0);let r=Math.random()*tot,i=0;for(;i<hi.length-1;i++){r-=w[i];if(r<=0)break}out[out.length-1]=hi[i]}}
  return out}
function hireSpec(id){const run=runOf();if(!run||!SPEC[id])return false;run.spec=run.spec||[];if(run.spec.length>=maxSpec()||run.spec.includes(id))return false;run.spec.push(id);try{flAdd('specs')}catch(e){}if(id==='floss'&&!run.flossGot){run.flossGot=1;for(let i=0;i<6;i++)run.deck.push('flossteil');try{if(state&&state.mode==='camp'&&Array.isArray(state.deck)){for(let i=0;i<6;i++)state.deck.push('flossteil');state.deck=shuffle(state.deck)}}catch(e){}}
  if(state&&state.mode==='camp'){state.spec=run.spec.slice();if(id==='polier'){state.bpMax++;state.bp++}syncCtx()}return true}
function fireSpec(id,refund){const run=runOf();if(!run||!(run.spec||[]).includes(id))return;run.spec=run.spec.filter(x=>x!==id);
  if(state&&state.mode==='camp'){state.spec=run.spec.slice();if(id==='polier'){state.bpMax--;state.bp=Math.max(0,state.bp-1)}if(refund)state.money+=Math.floor(SPECPRICE[SPEC[id].tier]/2);syncCtx()}}
function ensureMarket(){if(!state.market||state.market.season!==state.season||state.market.end)state.market={season:state.season,items:rollMarket(2),bought:false,rolls:0,seen:false}}
const marketRoll=()=>5+2*(state.market?state.market.rolls:0);
// 0.75a: große Einblendung in der Mitte (Stil wie der Besucherwunsch): inner = Inhalt mit Knopf [data-bpok], ok = beim Schließen; leer = weg
function bigPop(id,inner,ok){let el=document.getElementById(id);if(!inner){if(el)el.remove();return}if(el)return;el=document.createElement('div');el.id=id;el.className='wishpop bigpop';el.innerHTML=`<div class="wpc">${inner}</div>`;document.body.appendChild(el);
  const b=el.querySelector('[data-bpok]');if(b)b.onclick=()=>{Sfx.select();el.remove();ok()}}
// 0.75a: Seltenheits-Glanz (rg1 selten, rg2 legendär) für Handkarten und Spezialisten. Gemeinsame Uhr: negative Verzögerung,
// damit der Glanz beim Neuzeichnen dort weiterläuft, wo er war; i verschiebt die Phase, damit nicht alle gleichzeitig glänzen.
const rgOf=r=>r==='selten'?'rg1':r==='sehr selten'?'rg2':'',rgName=rg=>rg==='rg1'?'Selten':rg==='rg2'?'Legendär':'',rgSpec=S=>S.tier===2?'rg1':S.tier>=3&&!S.rb?'rg2':'';
const glzD=(sek,i)=>`--d:-${(((performance.now()/1000)+i*0.6)%sek).toFixed(2)}s`,holoD=i=>`--hd:-${(((performance.now()/1000)+i*0.6)%3.2).toFixed(2)}s`;
const glzI=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%97;return h%7};
const glzHtml=(rg,i)=>rg?`<span class="glz" style="${glzD(rg==='rg2'?2.7:4,i)}" aria-hidden="true"></span>`:'';
function specCard(id,btn){const S=SPEC[id],rg=rgSpec(S);return`<div class="pcard${S.tier>=3&&!S.rb?' t3':''}${rg?' '+rg:''}">${glzHtml(rg,glzI(id))}<span class="ic">${S.icon}</span><div class="info2"><span class="nm">${S.name}</span><span class="tierl tier${S.tier}">${S.rb?'⚡ Regelbrecher':SPECTIER[S.tier]}</span>${fxHtml(S)}</div><div class="pb">${btn}</div></div>`}
const SELLP={...SPEZ_DATEN.verkauf};
const teamMini=()=>{const L=(state&&state.spec||[]).filter(id=>SPEC[id]);return`<div class="tmini"><h4>Dein Team ${L.length}/${maxSpec()}</h4><div>${L.map(id=>{let v='';try{v=specVal(id)[0]}catch(e){}return`<span style="--rc:${TIERC[SPEC[id].tier]||'#8a7cff'}">${SPEC[id].icon} <b>${v}</b> ${SPEC[id].name}</span>`}).join('')||'<span>noch niemand</span>'}</div></div>`};
function teamHtml(mode){const run=runOf(),L=(run&&run.spec||[]).filter(id=>SPEC[id]);
  return`<h3>Deine Spezialisten ${L.length}/${maxSpec()}</h3>${L.length?`<div style="display:flex;flex-direction:column;gap:6px">${L.map(id=>specCard(id,mode==='msell'?`<button class="btn ${state&&state.sellArm===id?'main':'sub'}" data-msell="${id}">${state&&state.sellArm===id?'Wirklich?':'Verkaufen'}<br><b>+🪙 ${SELLP[SPEC[id].tier]||10}</b></button>`:mode?`<button class="btn sub" data-${mode}="${id}">Entlassen${mode==='mfire'?`<br><b>+🪙 ${Math.floor(SPECPRICE[SPEC[id].tier]/2)}</b>`:''}</button>`:'')).join('')}</div>`:'<p style="margin:0;color:var(--muted);font-size:13px">Noch niemand eingestellt.</p>'}`}
function marketHtml(){const m=state.market,full=(state.spec||[]).length>=maxSpec();
  return`<div class="mkt"><p style="margin:0;font-size:13.5px">${(()=>{try{return runOf()&&runOf().seed}catch(e){return 0}})()?'🌱 Seed-Lauf: alle Spezialisten bewerben sich. ':'Nach jeder Jahreszeit bewerben sich drei Spezialisten. '} Du kannst <b>höchstens einen</b> einstellen. Spezialisten bleiben für den ganzen Lauf. Ist die Kasse im Minus, streiken sie.${full?' <b>Dein Team ist voll.</b>':''}</p>
    ${(state.spec||[]).length?`<p class="zhint">Jeder Spezialist im Team macht den nächsten ×1,25 teurer. Höchstens ein Bewerber bringt einen Multiplikator mit.</p>`:''}<div style="display:flex;flex-direction:column;gap:8px">${m.items.map(id=>{const pr=specPrice(id);return specCard(id,`<button class="btn main" data-mhire="${id}" ${m.bought||full||!canPay(pr)?'disabled':''}>Einstellen<br><b>🪙 ${pr}</b></button>`)}).join('')||'<p style="margin:0;color:var(--muted)">Keine Bewerber mehr.</p>'}</div>
    ${m.bought?'<p style="margin:0;color:var(--gold)">Du hast diesmal schon jemanden eingestellt.</p>':''}
    ${teamHtml('mfire')}</div>`}
function genShopItems(){const pick=a=>a.length?a.splice(Math.floor(Math.random()*a.length),1)[0]:null;
  const pbase=id=>PROGS[id].plus||id,owned=id=>state.progs.some(x=>pbase(x)===pbase(id)),progOk=id=>!owned(id)&&!(pbase(id).startsWith('pate_')&&!habsNow().includes(pbase(id).slice(5))),progs=Object.keys(PROGS).filter(id=>!PROGS[id].plus&&progOk(id)),plusP=Object.keys(PROGS).filter(id=>PROGS[id].plus&&progOk(id)),ads=Object.keys(ADS).filter(id=>!state.adsNext.includes(id));
  const nextWinter=!!(seOf(state.season+1)||{}).winter;
  const cards=Object.keys(CARDS).filter(k=>(['selten','sehr selten'].includes(CARDS[k].rar)||(CARDS[k].rar==='winter'&&nextWinter)||(CARDS[k].rar==='saison'&&CARDS[k].only===state.season+1))&&!builtUnique(state.buildings,k)&&!ownsUnique(k)&&!isLocked(k));
  const out=[];let hasM=false;for(const[kind,arr]of[['prog',progs],['prog',progs],...(state.zl&&(state.zoo||0)>=2?[['prog',plusP]]:[]),['ad',ads],['card',cards]]){let k=pick(arr);if(k&&isMultItem(kind,k)){if(hasM){const j=arr.findIndex(x=>!isMultItem(kind,x));k=j>=0?arr.splice(j,1)[0]:null}else hasM=true}if(k)out.push(mkItem(kind,k))}
  return out}
const inflation=()=>1+.5*state.season; // Preise steigen jede Saison um 50 %
const priced=p=>{const x=p*inflation()*stW('teurer',1)*(runDeck()==='geniesser'?.8:1);return isD4(runOf())?Math.ceil(Math.round(x)*.8):Math.round(x)}; // 0.80a: Testlauf „4 Tage“: Preise ×0,8 (aufgerundet)
const isMultItem=(kind,key)=>kind==='prog'?!!PROGS[key].mult:kind==='ad'?!!ADS[key].mult:false;
function mkItem(kind,key){if(kind==='prog'||kind==='ad'){const D=kind==='prog'?PROGS[key]:ADS[key],n=D.mult?(state.multBought||0):0;return{kind,key,price:Math.round(priced(D.price)*(1+.5*n)),sur:n*50}}
  const c=CARDS[key];return{kind,key,price:priced(c.rar==='sehr selten'?20:c.rar==='winter'||c.rar==='saison'?16:15)}}
const hasBlocks=()=>[...TERR.values()].includes('block');
function fixedItems(){const f=[];{const r=runOf();if(r&&state.mode==='camp')(r.gifts||[]).forEach((g,i)=>{if(g!=='gsack'||sackOn())f.push({kind:g,price:0,gi:i})})}if(state.mode==='camp')f.push({kind:'mappe',price:mappePrice()});if(profiOn())f.push({kind:'profi',price:profiPrice()});if(sackOn())f.push({kind:'sack',price:sackPrice()});if(umbOn())f.push({kind:'umbau',price:UMBPRICE});f.push({kind:'remove',price:priced(10)});if(hasBlocks())f.push({kind:'dozer',price:priced(12)});return f}
const rerollPrice=()=>3+state.shop.rerolls;
function canPay(p){return state.money>=0&&state.money>=p}
function buy(it){if(it.sold||!canPay(it.price)){Sfx.deny();return}
  if(it.kind==='prog'&&state.progs.length>=MAXPROGS){Sfx.deny();state.shop.note='Alle 4 Plätze für Förderprogramme sind belegt.';render();return}
  if(it.kind==='remove'){state.shopSub='remove';render();return}
  if(it.kind==='einmal'&&it.key==='futter'){if(!canPay(it.price)){Sfx.deny();return}const L=[];for(const pile of['deck','discard','hand'])state[pile].forEach((k,i)=>{const c=CARDS[k];if(c&&c.cat==='gehege'&&!c.pr&&!c.jt&&!c.sig)L.push([pile,i,k])});if(!L.length){state.shop.note='🥕 Kein Gehege ohne Prägung im Deck.';Sfx.deny();render();return}
    const[pile,ix,k]=L[Math.floor(Math.random()*L.length)],P=Object.keys(PRAEG),pg=P[Math.floor(Math.random()*P.length)],nk=prKey(k,pg);state[pile][ix]=nk;{const run=runOf();if(run){const j=run.deck.indexOf(k);if(j>=0)run.deck[j]=nk}}state.money-=it.price;state.stats.spent+=it.price;it.sold=true;state.shop.note=`🥕 Futterlieferung: ${CARDS[k].name} bekommt ${PRAEG[pg].icon} ${PRAEG[pg].name}: ${PRAEG[pg].text}.`;Sfx.till();Sfx.win();render();return}
  if(it.kind==='einmal'&&it.key==='tierarzt'){state.shopSub='remove';state.pendItem=it;render();return}
  if(it.kind==='einmal'){state.money-=it.price;state.stats.spent+=it.price;it.sold=true;Sfx.till();if(it.key==='zeitung'){state.zl.news=1;state.shop.note='📰 Der Artikel erscheint: Showtiere zählen bis Zoo-Ende ×1,5.'}else if(it.key==='glueckslos'){state.luckNext=1;state.shop.note='🎟️ Glückslos gekauft: Am ersten Tag der nächsten Jahreszeit sind alle Chancen doppelt.'}else if(it.key==='bauplan'){state.bpWish=(state.bpWish||0)+1;state.bpWhy=(state.bpWhy||[]).concat('📐 Bauplan');state.shop.note='📐 Bauplan: +1 Baupunkt am ersten Tag der nächsten Jahreszeit.'}syncCtx();render();return}
  if(it.kind==='ausbau'){state.money-=it.price;state.stats.spent+=it.price;it.sold=true;state.ausbauDone=1;const run=runOf();run.ausbau=(run.ausbau||[]).concat([it.key]);Sfx.till();Sfx.win();state.shop.note=`${AUSBAU[it.key].icon} Zoo-Ausbau „${AUSBAU[it.key].name}“ gilt jetzt für den ganzen Lauf.`;syncCtx();render();return}
  if(it.kind==='umbau'){state.money-=it.price;state.stats.spent+=it.price;state.umbOpts=TUTNOW?['x2','krone','x4']:rollUmb(3);state.umbRep=null;state.shopSub='umbau';state.shop.note=null;Sfx.till();Sfx.shop();render();return}
  if(EARLYG[it.kind]){const r=runOf();if(!r)return;r.gifts=(r.gifts||[]).filter((g,i)=>i!==it.gi);Sfx.till();Sfx.shop();state.shop.note=null;
    if(it.kind==='gsack'){state.sack={opts:rollFood(2)};state.shopSub='sack'}else if(it.kind==='gumb'){state.umbOpts=rollUmb(3);state.umbRep=null;state.shopSub='umbau'}else{state.mappe={opts:rollSpecs(runAus('mappe')?4:3,[],PROFIW,1),pick:null,pro:1};state.shopSub='mappe'}render();return}
  if(it.kind==='sack'){state.money-=it.price;state.stats.spent+=it.price;state.sackN=(state.sackN||0)+1;try{flAdd('futter')}catch(e){}state.sack={opts:rollFood(2)};{const ts=gRun()&&tutStep0();if(ts&&ts.food){const o=rollFood(4).filter(x=>x!==ts.food&&!String(x).startsWith('h:'));state.sack.opts=[ts.food,...o].slice(0,2)}}state.shopSub='sack';state.shop.note=null;Sfx.till();Sfx.shop();render();return}
  if(it.kind==='profi'){state.money-=it.price;state.stats.spent+=it.price;state.profiN=(state.profiN||0)+1;state.mappe={opts:rollSpecs(runAus('mappe')?4:3,[],PROFIW,1),pick:null,pro:1};state.shopSub='mappe';state.shop.note=null;Sfx.till();Sfx.shop();render();return}
  if(it.kind==='mappe'){state.money-=it.price;state.stats.spent+=it.price;state.mappeN=(state.mappeN||0)+1;state.mappe={opts:rollSpecs(runAus('mappe')?4:3),pick:null};{const ts=gRun()&&tutStep0();if(ts&&ts.spec){state.mappe.opts=[ts.spec,...rollSpecs(4,[ts.spec]).filter(x=>x!==ts.spec)].slice(0,3)}}state.shopSub='mappe';state.shop.note=null;Sfx.till();Sfx.shop();render();return}
  if(it.kind==='spec'&&(state.spec||[]).length>=maxSpec()){Sfx.deny();state.shop.note=`Alle ${maxSpec()} Plätze für Spezialisten sind belegt. Entlasse unten zuerst jemanden.`;render();return}
  state.money-=it.price;state.stats.spent+=it.price;if(it.kind==='prog')state.stats.progs++;Sfx.till();state.shop.note=null;
  if(isMultItem(it.kind,it.key))state.multBought=(state.multBought||0)+1;
  if(it.kind==='prog'){state.progs.push(it.key);it.sold=true}
  else if(it.kind==='ad'){state.adsNext.push(it.key);it.sold=true}
  else if(it.kind==='card'){state.discard.push(it.key);it.sold=true;try{flRare(it.key)}catch(e){}}
  else if(it.kind==='spec'){hireSpec(it.key);it.sold=true;Sfx.win()}
  else if(it.kind==='tv'){state.zl.tvNext=true;state.shop.note='Fernsehteam gebucht: Baue am ersten Tag der nächsten Jahreszeit mindestens 3 Gehege/Gebäude.'}
  else if(it.kind==='bp'){state.bpNext=1;state.shop.note='Saison-Bautrupp gebucht: nächste Jahreszeit +1 Baupunkt pro Tag.'}
  else if(it.kind==='dozer'){const blocks=[...TERR.entries()].filter(([k,v])=>v==='block');const[k]=blocks[Math.floor(Math.random()*blocks.length)];TERR.delete(k);state.terr=[...TERR];state.shop.note='Ein Felsen wurde weggebaggert.'}
  syncCtx();render()}
const TYPEORD=['wasser','wald','wueste','savanne','arktis','gebirge','attr','essen','schutz','verst'];
const TRAITL={beute:'Beute',raubtier:'Raubtier',scheu:'scheu',show:'Showtier',bedroht:'bedroht',gross:'groß',einmalig:'einmalig'};
// deckRows: extra(k) = optionale Zusatzzeile in der Infospalte (0.76a: Futterplätze beim Futter verteilen)
function deckRows(keys,btn,extra){const u=[...new Set(keys)].sort((a,b)=>TYPEORD.indexOf(typeOfCard(CARDS[a]))-TYPEORD.indexOf(typeOfCard(CARDS[b]))||CARDS[a].name.localeCompare(CARDS[b].name));let out='',last=null;
  for(const k of u){const c=CARDS[k],t=typeOfCard(c),n=cnt(keys,x=>x===k),col=colOf(c);
    if(t!==last){last=t;const tn=cnt(keys,x=>typeOfCard(CARDS[x])===t);const MT=MILE[t]||{icon:'🔆',label:CAT[t]?CAT[t].label:t};out+=`<div class="drh"><i style="background:${col}"></i>${MT.icon} ${MT.label} · ${tn} Karte${tn===1?'':'n'}</div>`}
    out+=`<div class="drow" style="border-left:9px solid ${col}"><span class="ic">${ic(c)}</span><span class="inf"><b>${c.name}${n>1?' ×'+n:''}</b><small><span class="dtag" style="background:${col}">${c.hab?HAB[c.hab].label:CAT[c.cat].label}</span>${c.tags.filter(x=>TRAITL[x]).map(x=>`<span class="dtr">${TRAITL[x]}</span>`).join('')}</small><small class="dval">${c.a} B · ${c.s} N · ${costTxt(k)}</small>${extra&&extra(k)?`<small class="dex">${extra(k)}</small>`:''}</span>${miniShape(k)}${btn(k)}</div>`}
  return`<div class="drows">${out}</div>`}
function removeCard(pile,key){const pi=state.pendItem&&state.pendItem.key==='tierarzt'?state.pendItem:null,price=pi?pi.price:priced(10);if(pi){pi.sold=true;state.pendItem=null}if(!canPay(price)){Sfx.deny();return}const arr=state[pile],i=arr.indexOf(key);if(i<0)return;arr.splice(i,1);state.money-=price;state.stats.spent+=price;Sfx.till();state.shopSub=null;state.rmArm=null;state.shop.note=`${CARDS[key].name} wurde aus dem Deck entfernt.`;render()}
const tShopSt=()=>{try{return state&&state.phase==='shop'&&gRun()&&tutStep()||null}catch(e){return null}},tShopLk=()=>{const st=tShopSt();return st&&st.lock||null};
function itemHtml(it,idx,fixed){let kind,name,text,icon;
  const nxn=(seOf(state.season+1)||{name:'nächste Jahreszeit'}).name;let band='';
  if(it.kind==='prog'){const P=PROGS[it.key];kind='📣 Förderprogramm · dauerhaft bis Zoo-Ende';band='perm';name=P.name;text=fxHtml(P)+'<span class="tx2">wirkt auch auf bereits gebaute</span>';icon=P.icon}
  else if(it.kind==='ad'){const P=ADS[it.key];kind='📣 Werbung · ⏳ nur im '+nxn;band='temp';name=P.name;text=fxHtml(P);icon=P.icon}
  else if(it.kind==='card'){const c=CARDS[it.key];kind=`🃏 Karte fürs Deck · ${rarLabel(c)}`;band='card';name=c.name+(habIcs(c)?' '+habIcs(c):'')+catDotHtml(c)+' '+miniShape(it.key);text=`${c.a} B · ${c.s} N · ${costOf(it.key)} BP`+fxHtml(c)+`<span class="tx2">${haveTxt(inDeckN(it.key),cnt(state.buildings,b=>b.key===it.key))}</span>`;icon=c.icon}
  else if(it.kind==='spec'){const S=SPEC[it.key];kind=`👥 Spezialist · ganzer Lauf`;band='run';name=S.name;text=fxHtml(S);icon=S.icon}
  else if(it.kind==='einmal'){const E=EINMAL[it.key];kind='🃏 Einmal-Karte';band='once';name=E.name;text=E.text;icon=E.icon}
  else if(it.kind==='ausbau'){const U=AUSBAU[it.key];kind='🏗️ Zoo-Ausbau · ganzer Lauf · einer je Zoo';band='run';name=U.name;text=U.text;icon=U.icon}
  else if(it.kind==='umbau'){kind='🧰 Umbau · einmaliger Effekt';band='run';name='Umbau-Kiste';text=`3 zufällige Umbauten, einen davon nimmst du (oder keinen). Du bewahrst ihn auf und setzt ihn ein, wann du willst.<span class="tx2"> · Ablage ${umbInv().length}/${UMBMAX}</span>`;icon='🧰'}
  else if(it.kind==='mappe'){kind='👥 Spezialist · ganzer Lauf';band='run';name='Bewerbermappe';text=`3 zufällige Bewerbungen, eine davon stellst du ein (oder keine). Jede weitere Mappe in diesem Zoo kostet 10 Taler mehr.<span class="tx2"> · Team ${(state.spec||[]).length}/${maxSpec()}${(state.spec||[]).length>=maxSpec()?' · der Neue ersetzt jemanden':''}</span>`;icon='📁'}
  else if(EARLYG[it.kind]){const G=EARLYG[it.kind];kind='🎁 Geschenk · früh geschafft';band='run';name='Gratis: '+G[1];text='Fürs frühe Schaffen einer Jahreszeit. Kostet nichts.';icon=G[0]}
  else if(it.kind==='sack'){const L=(runOf()||{}).fdl||{},hs=Object.keys(L).filter(h=>L[h]>0);kind='🧺 Futter · ganzer Lauf';band='run';name='Futtersack';text=`2 zufällige Futter, eines davon nimmst du (oder keins): Einzelfutter für eine Karte deines Decks oder Lebensraum-Futter für alle Gehege eines Lebensraums. Jeder weitere Sack in diesem Zoo kostet 10 Taler mehr.${hs.length?`<span class="tx2"> · ${hs.map(h=>HFOOD[h].icon+' '+HAB[h].label+' Stufe '+L[h]).join(' · ')}</span>`:''}`;icon='🧺'}
  else if(it.kind==='profi'){kind='👥 Spezialist · ganzer Lauf';band='run';name='Profi-Mappe';text=`3 Bewerbungen, mindestens eine davon selten oder legendär. Seltene und legendäre kommen 3× so oft. Jede weitere Profi-Mappe in diesem Zoo kostet 15 Taler mehr.<span class="tx2"> · Team ${(state.spec||[]).length}/${maxSpec()}${(state.spec||[]).length>=maxSpec()?' · der Neue ersetzt jemanden':''}</span>`;icon='💼'}
  else if(it.kind==='remove'){kind='✂️ Einmalig · Deck-Pflege';band='once';name='Karte entfernen';text='Nimm eine Karte dauerhaft aus deinem Deck.';icon='✂️'}
  else if(it.kind==='bp'){kind='⏳ Nur im '+nxn;band='temp';name='Saison-Bautrupp';text=fxHtml({fx:[`+1 BP|pro Tag, nur die nächste Jahreszeit (${BP+1} statt ${BP})`]});icon='🧱'}
  else if(it.kind==='tv'){kind='⏳ Erster Tag im '+nxn+' · Wagnis';band='temp';name='Fernsehteam';text=fxHtml({fx:['×3 B|am ersten Tag der nächsten Jahreszeit, wenn du an dem Tag mindestens 3 Gehege/Gebäude baust','×0,5 B|sonst']});icon='📺'}
  else{kind='Einmalig';band='once';name='Felsen wegbaggern';text='Entfernt einen zufälligen Felsen vom Gelände.';icon='🚜'}
  const lk=tShopLk(),off=!!lk&&it.kind!==lk.kind,dis=it.sold||!canPay(it.price)||off;
  const cs=it.kind==='card'&&CARDS[it.key]?` style="border-left:7px solid ${colOf(CARDS[it.key])}"`:'';
  return`<button class="item b-${band} ${it.sold?'sold':''}${lk?(off?' tutno':' tutgo'):''}${EARLYG[it.kind]&&!it.sold&&!lk?' giftgo':''}"${cs} data-item="${fixed?'f':'o'}${idx}" ${dis?'disabled':''}><span class="kind">${kind}</span><span class="nm">${icon} ${name}</span><span class="tx">${text}</span><span class="price">${it.sold?'Gekauft':'🪙 '+it.price}${!it.sold&&it.sur?`<small class="sur">Preis ×${mxs(1+it.sur/100)} · ${it.sur/50+1}. Multiplikator</small>`:''}</span></button>`}
