// 0.70a: Früh geschafft als eigener Kasten im Sieg-Fenster; Reiter für Geschenke
const giftTab=g=>g==='gprofi'?['run','👥 Team']:['umb','🧰 Umbau & Futter'];
const giftOnTab=k=>{try{if(!state||state.phase!=='shop')return false;return fixedItems().some(it=>EARLYG[it.kind]&&giftTab(it.kind)[0]===k)}catch(e){return false}};
function earlyBoxHtml(){const E=state.earlyR;if(!E||!E.left)return'';const n=E.left,G=E.gift&&EARLYG[E.gift];
  return`<div class="earlybox"><div class="eb1">⚡ Früh geschafft: noch ${n} Tag${n>1?'e':''} übrig</div>
  ${state.earlyBonus?`<div class="ebr">🪙 <b>+${state.earlyBonus} Taler</b></div>`:''}
  <div class="ebr">⚡ <b>+${E.bp} Baupunkt${E.bp>1?'e':''}</b> in der nächsten Jahreszeit (je Tag 1)</div>
  ${E.gtal?`<div class="ebr">🎁 <b>+🪙 ${E.gtal}</b> als Geschenk</div>`:''}
  ${G?`<div class="ebgift"><span class="ebi">${G[0]}</span><div><small>🎁 Geschenk · gratis</small><b>${G[1]}</b><span>liegt im Shop bereit, Reiter ${giftTab(E.gift)[1]}</span></div></div>`:''}</div>`}
//@@ modul: 08-shop-menues
function shopHtml(){const se=seOf(state.season),nx=seOf(state.season+1);try{const LK0=tShopLk()||(gRun()&&state.season===0?{tab:'run'}:null);shopMarkSeen(LK0?LK0.tab:(META.shopT==='umb'&&!umbOn()&&!sackOn()?'run':META.shopT||'run'))}catch(e){}
  if(state.shopSub==='umbau'&&state.umbOpts){const inv=umbInv(),full=inv.length>=UMBMAX;
    if(state.umbRep)return`<h2>🧰 Welcher Umbau fliegt raus?</h2><p>Deine Ablage ist voll (${UMBMAX} Plätze). ${UMB[state.umbRep].icon} <b>${UMB[state.umbRep].name}</b> ersetzt:</p><div style="display:flex;flex-direction:column;gap:6px">${inv.map((id,i)=>`<div class="umbrow"><span class="ti">${UMB[id].icon}</span><div><b>${UMB[id].name}</b><small>${UMB[id].text}</small></div><button class="btn sub" data-umbrep="${i}">Ersetzen</button></div>`).join('')}</div><div class="shopbar"><button class="btn sub" data-umbskip="1">Doch keinen nehmen</button></div>`;
    return`<h2>🧰 Umbau-Kiste</h2><p>Drei Umbauten. Nimm einen, du bewahrst ihn auf (Ablage ${inv.length}/${UMBMAX}) und setzt ihn ein, wann du willst: über 🧰 in der Kartenleiste oder hier im Shop.${full?' <b>Deine Ablage ist voll:</b> Der neue ersetzt einen alten.':''}</p><div style="display:flex;flex-direction:column;gap:8px">${state.umbOpts.map(id=>`<div class="umbrow"><span class="ti">${UMB[id].icon}</span><div><b>${UMB[id].name}</b><small>${UMB[id].text}</small></div><button class="btn main" data-umbtake="${id}">Nehmen</button></div>`).join('')}</div>${tShopLk()?'':'<div class="shopbar"><button class="btn sub" data-umbskip="1">Keinen nehmen</button></div>'}`}
  if(state.shopSub==='mappe'&&state.mappe){const M=state.mappe,full=(state.spec||[]).length>=maxSpec();
    if(M.pick)return`<h2>📁 Wen ersetzt ${SPEC[M.pick].icon} ${SPEC[M.pick].name}?</h2><p>Dein Team ist voll (${maxSpec()} Plätze). Wähle, wer gehen muss.</p><div style="display:flex;flex-direction:column;gap:6px">${(state.spec||[]).filter(id=>SPEC[id]).map(id=>specCard(id,`<button class="btn sub" data-marep="${id}">Ersetzen</button>`)).join('')}</div><div class="shopbar"><button class="btn sub" data-mapback="1">Zurück</button></div>`;
    return`<h2>${M.pro?'💼 Profi-Mappe':'📁 Bewerbermappe'}</h2><p>Drei Bewerbungen${M.pro?', mindestens eine selten oder legendär':''}. Stelle eine ein, sie bleibt für den ganzen Lauf.${full?' <b>Dein Team ist voll:</b> Der Neue ersetzt jemanden.':''}</p><div style="display:flex;flex-direction:column;gap:8px">${M.opts.map(id=>specCard(id,`<button class="btn main" data-mapick="${id}">Einstellen</button>`)).join('')||'<p style="margin:0;color:var(--muted)">Keine Bewerbungen.</p>'}</div>${teamMini()}${tShopLk()?'':'<div class="shopbar"><button class="btn sub" data-maskip="1">Niemanden einstellen</button></div>'}`}
  if(state.shopSub==='sack'&&state.sack){const S=state.sack;return`<h2>🧺 Futtersack</h2><p>${S.opts.length?'Nimm eines der Futter. Es wirkt den ganzen Lauf.':'Leider nichts Passendes im Sack.'}</p><div style="display:flex;flex-direction:column;gap:8px">${S.opts.map(o=>foodCard(o,`<button class="btn main" data-fdpick="${o}">Nehmen</button>`)).join('')}</div><div class="shopbar"><button class="btn sub" data-fdskip="1">${S.opts.length?'Keins nehmen':'Weiter'}</button></div>`}
  if(state.shopSub==='feed'&&state.feedF){const f=state.feedF,F=FOOD[f],all=foodPile().map(x=>x[2]).filter(k=>fdFits(f,k));return`<h2>${F.icon} Wer bekommt ${F.name}?</h2><p>${F.text}. Das Futter bleibt dauerhaft auf der Karte. Futterplätze: gewöhnliche Tiere ${1+(fdTeam('futtermeister')?1:0)}, seltene ${2+(fdTeam('futtermeister')?1:0)}, legendäre ${3+(fdTeam('futtermeister')?1:0)}.</p>${deckRows(all,k=>`<button class="btn main" data-feedk="${k}">Füttern</button>`,fdSlotsHtml)}<div class="shopbar"><button class="btn sub" data-fdback="1">Zurück zum Sack</button></div>`}
  if(state.shopSub==='futter'){const all=[...state.deck,...state.discard,...state.hand].filter(k=>!String(k).includes('^')&&!String(k).includes('~')&&CARDS[k]&&CARDS[k].cat!=='verst'&&!CARDS[k].ms);
    return`<h2>🥕 Welche Karte bekommt die Futterlieferung?</h2><p>Kostet 🪙 ${state.pendItem?state.pendItem.price:0}. Die Karte bekommt eine zufällige Verbesserung (Prägung), zum Beispiel 🎲 Glück, ⭐ Star oder 🫙 Wackelig.</p>${deckRows(all,k=>`<button class="btn main" data-futk="${k}">Füttern</button>`)}<button class="btn sub" id="mBack">Zurück</button>`}
  if(state.shopSub==='remove'){const all=[...state.deck,...state.discard,...state.hand],pr=state.pendItem&&state.pendItem.key==='tierarzt'?state.pendItem.price:priced(10);
    return`<h2>Welche Karte entfernen?</h2><p>Kostet 🪙 ${pr}. Die Karte verschwindet dauerhaft aus deinem Deck. Dein Deck: <b>${all.length} Karten</b>.</p>${deckRows(all,k=>`<button class="btn ${state.rmArm===k?'main':'sub'}" data-rmk="${k}">${state.rmArm===k?'Wirklich?':'Entfernen'}</button>`)}<button class="btn sub" id="mBack">Zurück</button>`}
  const debt=state.money<0?`<p style="color:#ffb3b5"><b>Du hast ${fmt(-state.money)} Taler Schulden.</b> Erst ab 0 kannst du wieder kaufen. <b>Solange du im Minus bist, streiken deine Spezialisten und wirken nicht.</b> Kredit: Schulden kosten jeden Tag 1 Taler je 10.</p>`:'';
  const L=state.ledger||{entry:0,care:0,interest:0,early:0},led=`<div class="bill"><span>Im ${se.name}:</span><span>🎟️ Eintritt ${sgn(L.entry)}</span><span class="${L.care<0?'neg':''}">🌿 Pflege ${sgn(L.care)}</span>${L.interest?`<span class="neg">🏦 Kredit ${sgn(L.interest)}</span>`:''}${L.spec?`<span class="${L.spec<0?'neg':''}">👥 Spezialisten ${sgn(L.spec)}</span>`:''}${L.early?`<span>⏱️ früh fertig ${sgn(L.early)}</span>`:''}</div>`;
  const slots=`<div class="slotrow">${state.progs.map(id=>`<span>${PROGS[id].icon} ${PROGS[id].name}</span>`).join('')||'<span>Noch keine Förderprogramme</span>'}${state.adsNext.map(id=>`<span>${ADS[id].icon} ${ADS[id].name} (${nx.name})</span>`).join('')}${state.bpNext?`<span>🧱 Saison-Bautrupp (${nx.name})</span>`:''}</div>`;
  const mk=state.market,tab=mk&&state.shopTab==='market'?'market':'shop',evs=(state.eventsNext||[]).length?`<h3>Ereignis im ${nx.name}</h3><div class="shopgrid">${state.eventsNext.map(e=>`<div class="item ev"><span class="kind">Gilt die ganze Jahreszeit, auch für bereits Gebautes</span><span class="nm">${evIcon(e)} ${evName(e)}</span><span class="tx">${fxHtml({fx:evFx(e)})}</span></div>`).join('')}</div>`:'';
  const tabs=mk?`<div class="stabs"><button class="${tab==='shop'?'on':''}" data-stab="shop">🛒 Shop <i>${cnt(state.shop.items,x=>!x.sold)}</i></button><button class="${tab==='market'?'on':''} ${mk.seen?'':'new'}" data-stab="market" title="Spezialisten: wirken den ganzen Lauf">👥 Stellenmarkt <i>${mk.bought?0:mk.items.length}</i></button></div>`:'';
  if(tab==='market')return`<h2>Saisonende · ${monHtml(state.money)}</h2>${tabs}<p class="shopd">👥 Spezialisten wirken den ganzen Lauf, über alle Zoos.</p>${debt}${marketHtml()}
    <div class="shopbar"><button class="btn sub" id="mMkRoll" ${mk.bought||!canPay(marketRoll())?'disabled':''}>🎲 Andere Bewerber · 🪙 ${marketRoll()}</button><button class="btn main" id="mLeave">Weiter zum ${nx.name}</button></div>`;
  return`<h2>${mk?'Saisonende':'Zoo-Shop'} · ${monHtml(state.money)}</h2>${tabs}${led}${debt}${state.shop.note?`<p style="color:var(--gold)">${state.shop.note}</p>`:''}
    ${evs}
    ${!mk?(()=>{const LK=tShopLk()||(gRun()&&state.season===0?{tab:'run'}:null);if(LK)META.shopT=LK.tab;const T=META.shopT||'run';return`<div class="stabs shtabs">${[['run','👥 Team'],['umb','🧰 Umbau &amp; Futter'],['more','🎟️ Extras']].filter(([k])=>k!=='umb'||umbOn()||sackOn()).map(([k,t])=>`<button class="${(T==='umb'&&!umbOn()&&!sackOn()?'run':T)===k?'on':''}" data-shtab="${k}" ${LK&&LK.tab!==k?'disabled':''}>${t}${giftOnTab(k)?' <span class="gbadge">🎁</span>':shopDot(k)?'<span class="shdot" title="Hier gibt es noch etwas, das du dir leisten kannst"></span>':''}</button>`).join('')}</div>`})():''}
    ${(()=>{const T0=META.shopT||'run',T=mk?null:(T0==='umb'&&!umbOn()&&!sackOn()?'run':T0),tabOf=shopTabOf,shelf=shopShelf,fxd=fixedItems();return[['run','👥 Dein Team','Spezialisten wirken über alle Zoos dieses Laufs.'],['deck','🃏 Fürs Deck','Karten kommen in dein Deck und werden normal gezogen und gebaut.'],['foerd','📣 Förderung',`Förderprogramme wirken dauerhaft bis Zoo-Ende (höchstens ${MAXPROGS}), Werbung ⏳ nur im ${nx.name}.`],['season','⏳ Nur nächste Jahreszeit',`Wirkt nur im ${nx.name}, danach ist es vorbei.`],['umb','🧰 Umbauten','Einmalige Effekte zum Aufbewahren (3 Plätze). Einsetzen im Spiel über 🧰 in der Kartenleiste, Umbauten ohne Ziel auch hier.'],['food','🧺 Futter','Futter wirkt den ganzen Lauf. Einzelfutter bleibt auf einer Karte, Lebensraum-Futter hebt alle Gehege eines Lebensraums.'],['once','🃏 Einmal-Karten','Wirken sofort oder in der nächsten Jahreszeit. Jede Jahreszeit kommen neue.'],['ausb','🏗️ Zoo-Ausbau','Einer je Zoo, wirkt den ganzen Lauf.'],['zoo','🏛️ Für diesen Zoo','Wirkt bis zum Ende dieses Zoos.']].map(([g,t,d])=>{const body=state.shop.items.map((it,i)=>[it,i]).filter(([it])=>shelf(it.kind)===g&&!(it.kind==='einmal'&&!EINMAL[it.key])&&!(it.kind==='ausbau'&&!AUSBAU[it.key])).map(([it,i])=>itemHtml(it,i,false)).join('')+fxd.map((it,i)=>[it,i]).filter(([it])=>shelf(it.kind)===g).map(([it,i])=>itemHtml(it,i,true)).join('');return body&&(!T||tabOf(g)===T)?`<h3>${t}</h3>${d?`<p class="shopd">${d}</p>`:''}<div class="shopgrid">${body}</div>`:''}).join('')})()}
    ${umbOn()&&umbInv().length&&(mk||(META.shopT||'run')==='umb')?`<h3>🧰 Deine Umbauten ${umbInv().length}/${UMBMAX}</h3>${umbTrayHtml(true)}`:''}
    ${mk||(META.shopT||'run')==='run'||((META.shopT==='umb')&&!umbOn()&&!sackOn())?teamHtml(state.mode==='camp'?'msell':null):''}
    <div class="shopbar"><button class="btn main${(tShopSt()||{}).leave?' tutgo':''}" id="mLeave" ${tShopLk()?'disabled':''}>Weiter zum ${nx.name}</button></div>`}

// 0.80a: Shop-Reiter mit Leuchtpunkt: mindestens ein Angebot leistbar und der Reiter in dieser Jahreszeit noch nicht (mit diesen Angeboten) geöffnet
const shopShelf=k=>['card','remove'].includes(k)?'deck':k==='prog'||k==='ad'?'foerd':['bp','tv'].includes(k)?'season':k==='sack'||k==='gsack'?'food':k==='gumb'?'umb':k==='gprofi'?'run':k==='ausbau'?'ausb':k==='spec'||k==='mappe'||k==='profi'?'run':k==='umbau'?'umb':k==='einmal'?'once':'zoo';
const shopTabOf=g=>g==='run'?'run':g==='umb'||g==='food'?'umb':'more';
function shopTabItems(T){if(!state||!state.shop)return[];let fx=[];try{fx=fixedItems()}catch(e){}return[...(state.shop.items||[]),...fx].filter(it=>it&&!it.sold&&shopTabOf(shopShelf(it.kind))===T&&!(it.kind==='einmal'&&!EINMAL[it.key])&&!(it.kind==='ausbau'&&!AUSBAU[it.key]))}
const shopSig=T=>`${state.zoo||0}|${state.season}|`+shopTabItems(T).map(it=>it.kind+':'+it.key).join(',');
function shopDot(T){if(!state||!state.shop||gRun())return false;const L=shopTabItems(T);if(!L.some(it=>it.price!=null&&canPay(it.price)))return false;return(state.shopSeen||{})[T]!==shopSig(T)}
function shopMarkSeen(T){if(!state||!state.shop)return;state.shopSeen=state.shopSeen||{};state.shopSeen[T]=shopSig(T)}
const foerdOk=()=>!!state&&!!state.shop&&modal==='shop'&&(state.shop.items||[]).some(it=>!it.sold&&(it.kind==='prog'||it.kind==='ad')&&canPay(it.price));
// ===== 0.94 Umbauten: einmalige Effekte, im Shop 1 aus 3 (25 Taler), aufbewahrt in run.umb (3 Plätze), einsetzbar im Spiel und (ohne Ziel) im Shop =====
const UMBMAX=3,UMBPRICE=25;
// t = Ziel: 'cell' freies Feld/Felsen · 'free' freies Feld · 'geh' Gehege · 'bld' Gehege/Gebäude · null = sofort
const UMB={
  natur:{icon:'🌿',name:'Naturfläche ändern',text:'Ein freies Feld wird zu einer Naturfläche eines deiner Lebensräume (oder die Naturfläche verschwindet).',t:'free',pick:'hab'},
  habw:{icon:'🔄',name:'Lebensraum ändern',text:'Ein gebautes Gehege zählt ab jetzt als anderer Lebensraum deines Laufs.',t:'geh',pick:'hab'},
  fels:{icon:'🪨',name:'Felsen setzen oder wegbaggern',text:'Ein Felsen verschwindet, oder auf ein freies Feld kommt ein Felsen (gut fürs Gebirge).',t:'cell'},
  erw:{icon:'📐',name:'Gelände erweitern',text:'Das Gelände bekommt 1 Feld mehr am Rand.',t:null},
  vergr:{icon:'🏗️',name:'Gehege vergrößern',text:'Ein Gehege bekommt 1 Feld dazu: erst das Gehege, dann ein freies Feld daneben antippen.',t:'geh',two:1},
  tausch:{icon:'🔁',name:'Karte tauschen',text:'Eine Karte aus deiner Hand wird gegen eine zufällige andere derselben Kategorie getauscht, auch im Deck.',t:'hand'},
  umzug:{icon:'🚚',name:'Umzugstag',text:'Heute (bzw. am nächsten Spieltag) ist Umziehen beliebig oft gratis.',t:null},
  abbau:{icon:'🏚️',name:'Abbau',text:'Ein Gehege/Gebäude wird abgebaut, die Karte kommt sofort zurück ins Deck.',t:'bld'},
  aufst:{icon:'⬆️',name:'Aufstieg',text:'Ein Gehege/Gebäude steigt eine Stufe auf.',t:'bld'},
  neu:{icon:'🎲',name:'Alles neu',text:'Tippe ein Gehege an: Alle Gehege seines Lebensraums bekommen gemeinsam einen neu ausgelosten Lebensraum deines Laufs. Vielleicht auch wieder denselben.',t:'geh'},
  natur3:{icon:'🌱',name:'Mehr Natur',text:'3 neue Naturflächen entstehen neben schon bestehenden.',t:null},
  woist:{icon:'❓',name:'Wo ist es hin?',text:'Ein zufälliges Gebäude (kein Gehege) verschwindet. Dafür +40 Taler und am nächsten Tag +2 Baupunkte.',t:null},
  tierweg:{icon:'🐾',name:'Das Tier ist weg',text:'Ein zufälliges Gehege verschwindet. Dafür +40 Taler und am nächsten Tag +2 Baupunkte.',t:null},
  x2:{icon:'✨',name:'×2-Feld',text:'Auf einem zufälligen freien Feld erscheint ein goldenes ×2-Feld.',t:null},
  krone:{icon:'👑',name:'Mehr Kronen',text:'Auf einem zufälligen freien Feld erscheint ein weiteres Kronenfeld (×1,3 Besucher mit einem 4-Feld-Gehege darauf).',t:null},
  x4:{icon:'💥',name:'×4?!',text:'Mit 20 % Chance erscheint ein ×4-Feld. Sonst passiert nichts.',t:null},
  luck:{icon:'🍀',name:'Good Luck',text:'Eine seltene oder legendäre Karte deiner Lebensräume kommt auf die Hand.',t:null},
  bauplan:{icon:'📜',name:'Bauplan',text:'+1 Baupunkt für den laufenden Tag (im Shop eingesetzt: am nächsten Spieltag).',t:null},
  baum:{icon:'👷',name:'Baumeister',text:'Heute (bzw. am nächsten Spieltag) kostet jede Karte 0 Baupunkte. Neu ziehen ist dann nicht erlaubt.',t:null}};
const umbInv=()=>{const r=runOf();if(!r)return[];return r.umb=r.umb||[]};
const umbOn=()=>!!(state&&state.mode==='camp'&&state.zl&&runOf()&&(!runOf().tut||state.season>=1||state.phase==='shop'));
function rollUmb(n){return shuffle(Object.keys(UMB)).slice(0,n)}
const umbBm=()=>!!(state&&state.bmDay&&state.bmDay===dayKeyNow());
const umbUz=()=>!!(state&&state.uzDay&&state.uzDay===dayKeyNow());
// Machbarkeit (für die Rückfrage „kein Platz“)
function umbOk(id){const fc=freeCells(),idx=mkIndex(state.buildings);
  switch(id){case'natur':return fc.length>0;case'habw':case'neu':return state.buildings.some(b=>isCat(b,'gehege'))&&habsNow().length>1;case'fels':return fc.length>0||[...TERR.values()].includes('block');
    case'erw':return erwCells().length>0;case'vergr':return state.buildings.some(b=>isCat(b,'gehege')&&growCells(b,idx).length);case'tausch':return state.hand.some(k=>CARDS[k]&&!CARDS[k].ms);
    case'abbau':case'aufst':return state.buildings.some(b=>!CARDS[b.key].ms&&(id!=='aufst'||(b.lvl||1)<MAXLVL));case'natur3':return natur3Cells().length>0;
    case'woist':return state.buildings.some(b=>!isCat(b,'gehege')&&!CARDS[b.key].ms);case'tierweg':return state.buildings.some(b=>isCat(b,'gehege')&&!CARDS[b.key].ms);
    case'x2':case'krone':case'x4':return fc.some(k=>cellRuleOk(k)&&!(state.zl.gold||[]).includes(k)&&k!==state.zl.crown&&!(state.zl.crown2||[]).includes(k)&&!(state.zl.g4||[]).includes(k));
    case'luck':return luckPool().length>0;default:return true}}
const erwCells=()=>{const out=new Set();for(const[q,r]of BOARD)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr);if(!ONBOARD.has(k))out.add(k)}return[...out]};
const growCells=(b,idx)=>{const out=new Set();for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr);if(ONBOARD.has(k)&&!idx.has(k)&&TERR.get(k)!=='block')out.add(k)}return[...out]};
const natur3Cells=()=>{const idx=mkIndex(state.buildings),H=habsNow();return BOARD.map(([q,r])=>hk(q,r)).filter(k=>!TERR.get(k)&&!idx.has(k)&&(()=>{const[q,r]=k.split(',').map(Number);return DIRS.some(([dq,dr])=>{const t=TERR.get(hk(q+dq,r+dr));return t&&t!=='block'&&H.includes(t)})})())};
const luckPool=()=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return(c.rar==='selten'||c.rar==='sehr selten')&&!k.includes('^')&&!k.includes('~')&&c.cat!=='verst'&&!c.ms&&!isLocked(k)&&(!c.hab||habsNow().includes(c.hab))&&(!c.rq||habsNow().includes(c.rq))});
const pickRnd=L=>L[Math.floor(Math.random()*L.length)];
function umbMsg(t){state.bannerQ=(state.bannerQ||[]).concat([[t[0],t[1],'umb:'+t[0]]]);try{flushBanners()}catch(e){}}
// sofort wirkende Umbauten
function umbNow(id){const Z=state.zl,fc=freeCells(),idx=mkIndex(state.buildings),U=UMB[id];let out=null;
  if(id==='erw'){const L=erwCells();if(L.length){const k=pickRnd(L),c=k.split(',').map(Number);state.board=(state.board||BOARD.map(x=>x.slice())).concat([c]);setBoard(state.board);try{computeView()}catch(e){}out='Das Gelände ist um 1 Feld gewachsen.'}}
  else if(id==='umzug'){state.uzDay=state.phase==='play'?dayKeyNow():'next';out='Umziehen ist '+(state.phase==='play'?'heute':'am nächsten Spieltag')+' beliebig oft gratis.'}
  else if(id==='bauplan'){if(state.phase==='play'){state.bp=(state.bp||0)+1;out='+1 Baupunkt für heute.'}else{state.bpWish=(state.bpWish||0)+1;state.bpWhy=(state.bpWhy||[]).concat('📜 Bauplan');out='+1 Baupunkt am nächsten Spieltag.'}}
  else if(id==='baum'){state.bmDay=state.phase==='play'?dayKeyNow():'next';out='Jede Karte kostet '+(state.phase==='play'?'heute':'am nächsten Spieltag')+' 0 Baupunkte. Neu ziehen geht dann nicht.'}
  else if(id==='neu'){const H=habsNow();let n=0;for(const b of state.buildings){if(!isCat(b,'gehege')||CARDS[b.key].ms)continue;const cur=K(b).hab,o=H.filter(h=>h!==cur);if(o.length){b.hab=pickRnd(o);if(b.hab===CARDS[b.key].hab)delete b.hab;n++}}out=`${n} Gehege haben einen neuen Lebensraum.`}
  else if(id==='natur3'){const L=shuffle(natur3Cells()).slice(0,3),H=habsNow();for(const k of L){const[q,r]=k.split(',').map(Number),ts=DIRS.map(([dq,dr])=>TERR.get(hk(q+dq,r+dr))).filter(t=>t&&t!=='block'&&H.includes(t));TERR.set(k,pickRnd(ts))}state.terr=[...TERR];out=`${L.length} neue Naturflächen.`}
  else if(id==='woist'||id==='tierweg'){const L=state.buildings.filter(b=>(id==='tierweg')===isCat(b,'gehege')&&!CARDS[b.key].ms);if(L.length){const b=pickRnd(L);state.buildings=state.buildings.filter(x=>x!==b);state.money+=40;state.stats.earned+=40;state.bpWish=(state.bpWish||0)+2;state.bpWhy=(state.bpWhy||[]).concat(id==='woist'?'❓ Wo ist es hin?':'🐾 Das Tier ist weg');out=`${CARDS[b.key].icon} ${CARDS[b.key].name} ist verschwunden. +40 Taler, am nächsten Tag +2 Baupunkte.`}}
  else if(id==='x2'||id==='krone'||id==='x4'){const L=fc.filter(k=>cellRuleOk(k)&&!(Z.gold||[]).includes(k)&&k!==Z.crown&&!(Z.crown2||[]).includes(k)&&!(Z.g4||[]).includes(k));if(L.length){const k=pickRnd(L);
      if(id==='x2'){Z.gold=(Z.gold||[]).concat([k]);out='Ein neues ×2-Feld ist erschienen.'}else if(id==='krone'){Z.crown2=(Z.crown2||[]).concat([k]);out='Ein neues Kronenfeld ist erschienen.'}else if(Math.random()<.2){Z.g4=(Z.g4||[]).concat([k]);out='Glück gehabt: ein ×4-Feld ist erschienen!'}else out='Leider nichts: diesmal kein ×4-Feld.'}}
  else if(id==='luck'){const L=luckPool();if(L.length){const k=pickRnd(L);if(state.phase==='play')state.hand.push(k);else state.discard.push(k);out=`${CARDS[k].icon} ${CARDS[k].name} kommt ${state.phase==='play'?'auf die Hand':'ins Deck (für diesen Zoo)'}.`}}
  syncCtx();return out||'Kein Platz für den Effekt, der Umbau ist verpufft.'}
// Einsetzen aus der Ablage (i = Platz)
function umbUse(i,force){const inv=umbInv(),id=inv[i],U=UMB[id];if(!U||!umbOn())return;if(state.phase==='scoring'){Sfx.deny();return}
  const inShop=modal==='shop'||state.phase!=='play';if(U.t&&inShop){Sfx.deny();state.umbNote=`${U.icon} ${U.name} setzt du auf dem Spielfeld ein (in der Bauphase).`;render();return}
  if(!force&&!umbOk(id)){state.umbAsk=i;render();return}state.umbAsk=null;
  if(!U.t||!umbOk(id)){inv.splice(i,1);const t=umbNow(id);state.umbNote=null;umbMsg([`${U.icon} ${U.name}`,t]);state.umbOpen=false;Sfx.till&&Sfx.till();saveSoon();render();return}
  state.umbT={i,id,step:0};state.umbOpen=false;state.selected=null;state.preview=null;state.info=null;Sfx.select();render()}
function umbCancel(){state.umbT=null;state.umbPick=null;Sfx.select();render()}
function umbDone(t){const T=state.umbT,inv=umbInv();if(T){const U=UMB[T.id];inv.splice(T.i,1);umbMsg([`${U.icon} ${U.name}`,t])}state.umbT=null;state.umbPick=null;state.undo=[];syncCtx();Sfx.build();saveSoon();render()}
// Klick aufs Spielfeld im Zielmodus
function umbClick(q,r){const T=state.umbT;if(!T)return false;const U=UMB[T.id],k=hk(q,r),idx=mkIndex(state.buildings),b=idx.get(k),blk=TERR.get(k)==='block';
  if(!ONBOARD.has(k)){Sfx.deny();return true}
  if(T.id==='vergr'&&T.step===1){const g=state.buildings.find(x=>x.id===T.b);if(!g||!growCells(g,idx).includes(k)){Sfx.deny();return true}g.cells=g.cells.concat([[q,r]]);umbDone(`${CARDS[g.key].name} ist um 1 Feld gewachsen.`);return true}
  if(U.t==='free'&&(b||blk)){Sfx.deny();return true}
  if(U.t==='cell'&&b){Sfx.deny();return true}
  if((U.t==='geh'||U.t==='bld')&&(!b||CARDS[b.key].ms||(U.t==='geh'&&!isCat(b,'gehege')))){Sfx.deny();return true}
  if(T.id==='fels'){if(blk){TERR.delete(k);state.terr=[...TERR];umbDone('Der Felsen ist weg.')}else{TERR.set(k,'block');state.terr=[...TERR];umbDone('Ein Felsen steht jetzt hier.')}return true}
  if(T.id==='abbau'){state.buildings=state.buildings.filter(x=>x!==b);state.deck.splice(Math.floor(Math.random()*(state.deck.length+1)),0,b.key);umbDone(`${CARDS[b.key].name} ist abgebaut, die Karte ist zurück im Deck.`);return true}
  if(T.id==='aufst'){if((b.lvl||1)>=MAXLVL){Sfx.deny();return true}b.lvl=(b.lvl||1)+1;umbDone(`${CARDS[b.key].name} ist jetzt Stufe ${['','I','II','III'][b.lvl]}.`);return true}
  if(T.id==='vergr'){if(!growCells(b,idx).length){Sfx.deny();return true}T.step=1;T.b=b.id;Sfx.select();render();return true}
  if(T.id==='neu'){const src=K(b).hab,H=habsNow(),to=pickRnd(H);let n=0;for(const x of state.buildings){if(!isCat(x,'gehege')||CARDS[x.key].ms||K(x).hab!==src)continue;n++;if(to===src)continue;x.hab=to;if(to===CARDS[x.key].hab)delete x.hab}umbDone(to===src?`🎲 Ausgelost: ${HAB[to].label}. Alles bleibt, wie es war.`:`🎲 Alle ${n} ${HAB[src].label}-Gehege sind jetzt ${HAB[to].label}-Gehege!`);return true}
  if(U.pick==='hab'){state.umbPick={k,b:b?b.id:null};Sfx.select();render();return true}
  return true}
function umbHab(h){const P=state.umbPick,T=state.umbT;if(!P||!T)return;if(T.id==='natur'){if(h)TERR.set(P.k,h);else TERR.delete(P.k);state.terr=[...TERR];umbDone(h?`Das Feld ist jetzt ${HAB[h].label}-Naturfläche.`:'Die Naturfläche ist weg.')}
  else{const b=state.buildings.find(x=>x.id===P.b);if(!b)return umbCancel();b.hab=h;if(h===CARDS[b.key].hab)delete b.hab;umbDone(`${CARDS[b.key].name} zählt jetzt als ${HAB[h].label}-Gehege.`)}}
// Hand-Ziel: Karte tauschen
function umbHand(hi){const T=state.umbT;if(!T||T.id!=='tausch')return false;const k=state.hand[hi],c=CARDS[k];if(!c||c.ms){Sfx.deny();return true}
  const L=Object.keys(CARDS).filter(x=>{const d=CARDS[x];return x!==k&&d.cat===c.cat&&!x.includes('^')&&!x.includes('~')&&!d.ms&&!isLocked(x)&&(!d.hab||habsNow().includes(d.hab))&&(!d.rq||habsNow().includes(d.rq))});if(!L.length){Sfx.deny();return true}
  const n=pickRnd(L),run=runOf();state.hand[hi]=n;if(run){const j=run.deck.indexOf(k);if(j>=0)run.deck[j]=n}umbDone(`${c.icon} ${c.name} → ${CARDS[n].icon} ${CARDS[n].name} (auch im Deck).`);return true}
// Anzeige: Knopf, Ablage, Zielhinweis
function umbTrayHtml(shop){const inv=umbInv();return`<div class="umbtray ${shop?'inshop':''}">${inv.map((id,i)=>{const U=UMB[id],ask=state.umbAsk===i;return`<button class="ub" data-umbuse="${i}" title="${U.text}"><span class="ti">${U.icon}</span><span class="nm">${U.name}</span><span class="tv">${ask?'Kein Platz – trotzdem?':shop&&U.t?'nur auf dem Spielfeld':'einsetzen'}</span></button>`}).join('')}${Array.from({length:Math.max(0,UMBMAX-inv.length)},()=>'<span class="ub empty">＋ frei</span>').join('')}</div>${state.umbNote?`<p class="umbnote">${state.umbNote}</p>`:''}`}
function umbHintHtml(){const T=state.umbT;if(!T)return'';const U=UMB[T.id];
  if(state.umbPick){const P=state.umbPick,H=habsNow();return`<h3>${U.icon} ${U.name}</h3><p class="hint">Welcher Lebensraum?</p><div class="umbhabs">${H.map(h=>`<button class="btn sub" data-umbhab="${h}">${HAB[h].icon} ${HAB[h].label}</button>`).join('')}${T.id==='natur'?'<button class="btn sub" data-umbhab="">✕ keine Naturfläche</button>':''}<button class="btn sub" data-umbx="1">Abbrechen</button></div>`}
  const w={free:'ein freies Feld',cell:'einen Felsen oder ein freies Feld',geh:'ein Gehege',bld:'ein Gehege oder Gebäude',hand:'eine Karte in deiner Hand'}[U.t]||'';
  return`<h3>${U.icon} ${U.name}</h3><p class="hint">${T.id==='vergr'&&T.step===1?'Tippe jetzt ein freies Feld direkt neben dem Gehege an.':'Tippe '+w+' an.'} ${U.text}</p><button class="btn sub" data-umbx="1">Abbrechen</button>`}
// Klicks rund um Umbauten (Kartenleiste, Info-Kasten, Shop)
document.addEventListener('click',e=>{const t=e.target.closest('[data-umbuse],[data-umbhab],[data-umbx],[data-umbtake],[data-umbrep],[data-umbskip],#btnUmb');if(!t||!state)return;
  if(t.id==='btnUmb'){if(!umbOn()||state.phase!=='play'){Sfx.deny();return}state.umbOpen=!state.umbOpen;state.umbAsk=null;state.umbNote=null;Sfx.select();render();return}
  const d=t.dataset;e.stopPropagation();
  if(d.umbuse!=null){const i=+d.umbuse;umbUse(i,state.umbAsk===i);return}
  if(d.umbhab!=null){umbHab(d.umbhab||null);return}
  if(d.umbx){umbCancel();return}
  if(d.umbtake){const inv=umbInv();if(inv.length>=UMBMAX){state.umbRep=d.umbtake;Sfx.select();render();return}inv.push(d.umbtake);state.umbOpts=null;state.shopSub=null;Sfx.win();saveSoon();render();return}
  if(d.umbrep!=null){const inv=umbInv();inv[+d.umbrep]=state.umbRep;state.umbRep=null;state.umbOpts=null;state.shopSub=null;Sfx.win();saveSoon();render();return}
  if(d.umbskip){state.umbRep=null;state.umbOpts=null;state.shopSub=null;Sfx.select();render();return}},true);
/* ---------- start screen: choose the park ---------- */
function mapPreviewSvg(m,mk){return withRot(false,()=>{const[x0,y0,x1,y1]=bbox(m.cells),p=SZ+1;let g='';const gold=new Set(mk&&mk.gold||[]),ek=mk&&mk.entry?hk(...mk.entry):null,hs=mk&&mk.half;
  for(const[q,r]of m.cells){const[x,y]=px(q,r),k=hk(q,r),t=m.terr.get(k);g+=`<polygon class="mp ${t||'g'}" points="${hexPts(x,y,SZ*.93)}"/>`;
    if(gold.has(k))g+=`<polygon points="${hexPts(x,y,SZ*.8)}" fill="#ffd16655" stroke="#ffd166" stroke-width="1.4"/><text x="${x}" y="${y}" font-size="5.5" font-weight="900" fill="#fff" stroke="#3a2a00" stroke-width=".5" paint-order="stroke" text-anchor="middle" dominant-baseline="central">×2</text>`;
    if(mk&&mk.crown===k)g+=`<polygon points="${hexPts(x,y,SZ*.8)}" fill="#b06cff55" stroke="#b06cff" stroke-width="1.4"/><text x="${x}" y="${y}" font-size="7" text-anchor="middle" dominant-baseline="central">👑</text>`;
    if(hs&&!halfOk({side:hs,mid:halfMid(m.cells)},q,r))g+=`<polygon points="${hexPts(x,y,SZ*.93)}" fill="#0009" pointer-events="none"/>`;
    if(ek===k)g+=`<polygon points="${hexPts(x,y,SZ*.8)}" fill="#ffffff44" stroke="#fff" stroke-width="1.4"/><text x="${x}" y="${y}" font-size="7" text-anchor="middle" dominant-baseline="central">🚪</text>`}
  return`<svg viewBox="${x0-p} ${y0-p} ${x1-x0+2*p} ${y1-y0+2*p}" aria-hidden="true">${g}</svg>`})}

/* ---------- tutorial slideshow ---------- */
function tutSlides(){return withRot(false,()=>{
  const at=(ox,oy,q,r)=>{const[x,y]=px(q,r);return[ox+x,oy+y]};
  const grass=(ox,oy,list)=>list.map(([q,r])=>{const[x,y]=at(ox,oy,q,r);return`<polygon class="tt-grass" points="${hexPts(x,y,SZ*.9)}"/>`}).join('');
  const shp=(ox,oy,cells,cls,icon,extra='')=>{const[cx,cy]=centroid(cells);return`<g transform="translate(${ox},${oy})"><g class="${cls} ${extra}">${shapeSvg(cells)}</g><text class="tt-ic ${cells.length>1?'big':''}" x="${cx}" y="${cy}">${icon}</text></g>`};
  const terr=(ox,oy,q,r,h,icon)=>{const[x,y]=at(ox,oy,q,r),pts=hexPts(x,y,SZ*.9);return`<polygon class="tt-terr ${h}" points="${pts}"/>${h!=='block'?`<polygon fill="url(#pt-${h})" points="${pts}"/>`:''}${icon&&h==='block'?`<text class="tt-ic sm" x="${x}" y="${y}">${icon}</text>`:''}`};
  const badge=(x,y,lines,neg)=>{const w=Math.max(...lines.map(l=>l.t.length))*4.3+10,h=lines.length*9+5;
    return`<g transform="translate(${(x-w/2).toFixed(1)},${(y-h/2).toFixed(1)})"><rect class="tt-badge ${neg?'neg':''}" width="${w.toFixed(1)}" height="${h}" rx="4"/>${lines.map((l,i)=>`<text class="tt-bt ${l.c||''}" x="${(w/2).toFixed(1)}" y="${9+i*9}">${l.t}</text>`).join('')}</g>`};
  const box=(x,y,w,h,cls,label,val)=>`<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/><text class="tt-lab ${cls}" x="${x+w/2}" y="${y+11}">${label}</text><text class="tt-val ${cls}" x="${x+w/2}" y="${y+h-8}">${val}</text>`;
  const card=(x,y,icon,name,col,sel)=>`<g transform="translate(${x},${y})"><rect class="tt-card ${sel?'sel':''}" width="40" height="52" rx="5"/><rect width="40" height="5" rx="2" style="fill:${col}"/><text class="tt-ic" x="20" y="21" style="font-size:15px">${icon}</text><text class="tt-cn" x="20" y="40">${name}</text></g>`;
  const arrow=(x1,y1,x2,y2,bend=-18)=>`<path class="tt-arrow" d="M${x1},${y1} Q${(x1+x2)/2},${Math.min(y1,y2)+bend} ${x2},${y2}" marker-end="url(#tta)"/>`;
  const link=(a,b,neg)=>`<line class="tt-link ${neg?'neg':''}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
  const t=(x,y,txt,cls='')=>`<text class="tt-t ${cls}" x="${x}" y="${y}">${txt}</text>`;
  const btn=(x,y,w,txt,cls='')=>`<rect class="tt-btn ${cls}" x="${x}" y="${y}" width="${w}" height="17" rx="5"/><text class="tt-bt2 ${cls}" x="${x+w/2}" y="${y+11.5}">${txt}</text>`;
  const svg=inner=>`<svg viewBox="0 0 240 124" role="img"><defs><marker id="tta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="tt-gold"/></marker></defs>${inner}</svg>`;
  const spf=(ox,oy,q,r,txt,col)=>{const[x,y]=at(ox,oy,q,r);return`<polygon points="${hexPts(x,y,SZ*.8)}" fill="${col}44" stroke="${col}" stroke-width="1.3" stroke-dasharray="2 1.5"/><text class="tt-ic sm" style="opacity:1;font-size:7px;fill:#fff;font-weight:700" x="${x}" y="${y}">${txt}</text>`};
  const G7=[[0,0],[1,0],[-1,0],[0,-1],[1,-1],[0,1],[-1,1]];
  const W=[[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,-1],[0,-1],[1,-1],[2,-1],[-2,1],[-1,1],[0,1],[1,1]];
  return[
  {title:'Das Ziel',text:'Jeden Abend zahlt dein ganzer Zoo aus: <b>Besucher × Natur</b> ergibt die Tagespunkte. Sammle genug Punkte, um das Ziel jeder Jahreszeit zu erreichen.',
   svg:svg(box(16,14,58,44,'tt-a','BESUCHER','12')+t(86,42,'×','big')+box(98,14,58,44,'tt-s','NATUR','8')+t(168,42,'=','big')+box(180,14,46,44,'tt-tot','TAG','96')
     +`<rect class="tt-bar" x="16" y="78" width="210" height="9" rx="4.5"/><rect class="tt-barfill" x="16" y="78" width="132" height="9" rx="4.5"/>`+t(16,102,'Saison 380','l')+t(226,102,'Ziel 600','r')+t(121,118,'Jede Nacht kommen die Tagespunkte zur Saison dazu.','m'))},
  {title:'Karten bauen',text:'Ziehe eine Karte aufs Gelände oder tippe sie an und dann auf ein Feld. Richte sie mit <b>↻ Drehen</b> aus und bestätige mit <b>🔨 Bauen</b>. Jeden Tag hast du <b>4 Baupunkte</b>, jedes Feld kostet 1. Gehege mit 4 Feldern kosten 1 weniger.',
   svg:svg(card(14,22,'🦒','Giraffen','var(--h-savanne)',true)+`<g>${[0,1,2].map(i=>`<circle class="tt-gold" cx="${40+i*-6+8}" cy="30" r="1.8"/>`).join('')}</g>`+arrow(58,40,118,50)
     +grass(160,56,W)+shp(160,56,[[-1,0],[0,0],[0,1]],'hab-savanne','🦒','tt-ghost')
     +t(34,98,'Baupunkte','m')+`${[0,1,2,3].map(i=>`<circle class="${i<4?'tt-gold':''}" cx="${18+i*11}" cy="108" r="4"/>`).join('')}`+btn(122,98,52,'↻ Drehen')+btn(180,98,46,'Bauen','gold'))},
  {title:'Nachbarn zählen',text:'Viele Karten bekommen Boni von direkten Nachbarn. <b>Goldene Linien</b> zeigen Gewinne, <b>rote</b> zeigen Verluste. Das Schild zeigt oben grau den Grundwert, darunter die Boni.',
   svg:svg(grass(120,74,W)+shp(120,74,[[-2,0],[-1,0]],'cat-attr','🐬')+shp(120,74,[[0,0]],'cat-essen','🍿')+shp(120,74,[[1,0]],'hab-wald','🐒')
     +link(at(120,74,-1.5,0),at(120,74,0,0))+link(at(120,74,1,0),at(120,74,0,0),true)
     +badge(at(120,74,0,0)[0],at(120,74,0,0)[1]-26,[{t:'1 B · 0 N',c:'b'},{t:'+5 B  −1 N',c:''}])
     +t(66,116,'Delfinshow: +5 B','m')+t(176,116,'Gehege daneben: −1 N','m'))},
  {title:'Lebensräume und Gelände',text:'Gehege mit <b>gleichem Lebensraum</b> nebeneinander bringen +1 Besucher. Auf einer <b>passenden Naturfläche</b> gibt es +1 Natur je Feld. Andere Gebäude dürfen dort ohne Bonus stehen, <b>Felsen</b> sind gesperrt.',
   svg:svg(grass(44,60,[[0,0],[1,0],[0,-1],[-1,1]])+shp(44,60,[[0,0]],'hab-savanne','🦓')+shp(44,60,[[1,0]],'hab-savanne','🦒')+badge(at(44,60,.5,0)[0],30,[{t:'+1 B',c:'a'}])+t(52,100,'gleicher','m')+t(52,110,'Lebensraum','m')
     +grass(126,60,[[0,-1],[1,-1],[-1,1]])+terr(126,60,0,0,'wasser','')+terr(126,60,1,0,'wasser','💧')+shp(126,60,[[0,0]],'hab-wasser','🐧','tt-onterr')+badge(at(126,60,0,0)[0],32,[{t:'+1 N',c:'s'}])+t(134,100,'Wasser-Fläche:','m')+t(134,110,'nur Wasser-Gehege','m')
     +terr(206,60,0,0,'block','🪨')+`<path class="tt-x" d="M198,52L214,68M214,52L198,68"/>`+t(206,100,'Felsen:','m')+t(206,110,'nicht bebaubar','m'))},
  {title:'Besondere Tiere',text:'Ein <b>roter Punkt</b> markiert die <b>Rote Liste</b>. Bedrohte Tiere belohnen <b>Tierarztpraxis</b>, <b>Zuchtstation</b> und der <b>EU-Artenschutzfonds</b>. <b>Stress:</b> Jedes Raubtier bis 2 Felder neben einem <b>Beutetier</b> und jedes Gastro-Gebäude oder jede Attraktion bis 2 Felder neben einem <b>scheuen</b> Tier kostet den ganzen Zoo ×0,95 Natur (🤫 ruhige Gebäude stören nicht, höchstens −40 %). <b>Showtiere</b> bekommen ×1,25 mit einem Gastro-Gebäude oder einer Attraktion daneben, ×1,5 mit zweien. Die Eigenschaft steht auf jeder Karte neben dem Lebensraum.',
   svg:svg(grass(84,64,[[-1,0],[0,0],[1,0],[2,0],[-1,1],[0,1],[1,1],[0,-1],[1,-1],[2,-1]])+shp(84,64,[[-1,0],[0,0]],'hab-wald','🐼')
     +`<circle class="tt-rl" cx="${at(84,64,-1,0)[0]-5.5}" cy="${at(84,64,-1,0)[1]-4}" r="2.4"/>`+shp(84,64,[[1,0]],'cat-schutz','🩺')
     +link(at(84,64,-.5,0),at(84,64,1,0))+badge(at(84,64,1,0)[0],at(84,64,1,0)[1]-24,[{t:'0 B · 2 N',c:'b'},{t:'+2 N',c:'s'}])
     +`<circle class="tt-rl" cx="168" cy="30" r="3.2"/>`+t(176,33,'Rote Liste','l')
     +t(162,54,'🩺 Tierarztpraxis  +2 N','l')+t(162,68,'🥚 Zuchtstation','l')+t(162,82,'🇪🇺 EU-Fonds (Shop)','l')
     +t(84,112,'Panda neben Tierarzt','m'))},
  {title:'Tag beenden',text:'Mit <b>💤 Tag beenden</b> wird ausgezählt. Gebaute Karten sind <b>verbraucht</b>: Für jede darfst du danach <b>1 von 2</b> neuen Karten wählen. Übrige Handkarten kommen auf die Ablage.',
   svg:svg(grass(56,62,G7)+shp(56,62,[[0,0]],'hab-wasser','🐧')+shp(56,62,[[1,0]],'cat-schutz','🌳')+shp(56,62,[[-1,1]],'cat-essen','🍦')
     +`<text class="tt-float a" x="56" y="44">+4 B</text><text class="tt-float s" x="76" y="38" style="animation-delay:.5s">+3 N</text>`+btn(28,100,62,'Tag beenden')
     +arrow(112,62,140,62,-4)+card(156,34,'🦦','Otter','var(--h-wasser)')+card(184,26,'🍿','Popcorn','var(--c-essen)',true)+t(190,108,'1 aus 2 je gebauter Karte','m'))},
  {title:'Wiederholen oder ausbauen',text:'Eine <b>zweite gleiche Anlage</b> bringt nur ×0,75 ihres <b>eigenen Werts</b> (Grundwert plus die Boni, die sie selbst bekommt), ab der dritten nur ×0,25. Boni, die sie Nachbarn gibt, zählen voll. Ziehst du die Karte stattdessen auf dein <b>vorhandenes Gehege oder Gebäude</b>, wird es ausgebaut: ×1,75 seines eigenen Werts, Stufe III ×2,25, ohne neuen Platz. Karten mit <b>Einmalig</b> gibt es nur einmal im Zoo.',
   svg:svg(grass(50,58,[[0,0],[1,0],[0,1],[1,-1]])+shp(50,58,[[0,0]],'hab-wald','🐒')+shp(50,58,[[1,0]],'hab-wald','🐒')+t(at(50,58,1,0)[0],at(50,58,1,0)[1]+7.5,'2×','ink')
     +badge(at(50,58,1,0)[0],30,[{t:'nur ×0,75',c:'n'}],true)+t(58,106,'neu bauen','m')+t(120,62,'oder','m')
     +grass(186,58,[[0,0],[1,0],[-1,0],[0,1]])+shp(186,58,[[0,0]],'hab-wald','🐒','tt-up')+`<text class="tt-star" x="186" y="47">★</text>`
     +badge(186,24,[{t:'Stufe II',c:'b'},{t:'+1 B  +1 N',c:''}])+t(186,96,'ausbauen','m')+t(186,108,'gleiche Kosten','m'))},
  {title:'Geld und Shop',text:'Besucher bringen <b>Eintritt</b>, Natur kostet <b>Pflege</b>, Schulden kosten <b>Kredit</b>. Nach jeder Jahreszeit kaufst du im <b>Shop</b> Förderprogramme, Werbung, seltene Karten oder einen Baupunkt mehr.',
   svg:svg(`<circle class="tt-coin" cx="40" cy="44" r="22"/><text class="tt-ic" x="40" y="45" style="font-size:22px">🪙</text>`
     +t(40,84,'+1 je 9 B','a')+t(40,96,'−1 je 8 N','n')+t(40,108,'−1 je 10 Schulden','m')
     +`<g transform="translate(92,16)"><rect class="tt-card" width="66" height="84" rx="6"/><text class="tt-kind" x="33" y="12">FÖRDERPROGRAMM</text><text class="tt-ic" x="33" y="32" style="font-size:16px">🌾</text><text class="tt-cn" x="33" y="50">Savannen-</text><text class="tt-cn" x="33" y="58">Patenschaft</text><text class="tt-price" x="33" y="76">🪙 50</text></g>`
     +`<g transform="translate(166,16)"><rect class="tt-card" width="66" height="84" rx="6"/><text class="tt-kind" x="33" y="12">WERBUNG</text><text class="tt-ic" x="33" y="32" style="font-size:16px">📺</text><text class="tt-cn" x="33" y="50">TV-Spot</text><text class="tt-cn" x="33" y="58">×1,3 B</text><text class="tt-price" x="33" y="76">🪙 28</text></g>`
     +t(162,116,'Preise steigen jede Saison','m'))},
  {title:'Jahreszeiten und Helfer',text:'Erreichst du ein Ziel früher, gibt es <b>5 Taler je übrigem Tag</b>. Im <b>Winter</b> frieren Savanne und Wüste. <b>↶</b> nimmt heutige Züge zurück, <b>🚚 Umziehen</b> kostet 1 Baupunkt, <b>🔍</b> zoomt ins Gelände. Im Menü ☰ findest du Regeln, dieses Tutorial und ein neues Spiel.',
   svg:svg([['🌱','Frühling'],['☀️','Sommer'],['🍂','Herbst'],['❄️','Winter']].map(([i,n],k)=>`<rect class="tt-chip ${k===3?'w':''}" x="${10+k*56}" y="14" width="52" height="40" rx="8"/><text class="tt-ic" x="${36+k*56}" y="30" style="font-size:14px">${i}</text><text class="tt-cn lt" x="${36+k*56}" y="47">${n}</text>`).join('')
     +t(120,72,'Ziel früh erreicht: +5 🪙 je übrigem Tag','gold')
     +btn(14,90,40,'↶')+btn(62,90,86,'🚚 Umziehen · 1 BP')+btn(156,90,70,'☰ Menü'))},
  {title:'Zoolatro: Sonderfelder',text:'Auf dem Gelände liegen drei goldene <b>×2-Felder</b> (was darauf steht, zählt doppelt) und ein <b>Kronenfeld 👑</b> (×1,3 Besucher für den Zoo mit einem 4-Felder-Gehege darauf). Alles steht hinter dem Knopf „Zoo ▾“ oben links.',
   svg:svg(grass(120,66,W)+spf(120,66,-1,0,'×2','#ffd166')+spf(120,66,1,-1,'👑','#b06cff')+shp(120,66,[[0,0]],'hab-wald','🐒')+badge(at(120,66,-1,0)[0],at(120,66,-1,0)[1]+24,[{t:'zählt doppelt',c:''}])+badge(at(120,66,1,-1)[0]+22,at(120,66,1,-1)[1]-22,[{t:'×1,3 B mit 4 Feldern',c:''}]))},
  {title:'Zoolatro: Veredelungen und Reinheit',text:'<b>Veredelte Karten:</b> 🪙 Gold ×1,2 Besucher, ✨ Schimmernd zählt doppelt, 🌈 Regenbogen ×1,2 Besucher für den Zoo. Bis zu drei pro Gehege, sie bleiben beim Ausbauen. <b>🧬 Reinheit:</b> Ab 4 verschiedenen zusammenhängenden Gehege-Arten eines Lebensraums (Wüste: irgendwo im Zoo) ×1,15 Natur, je weiterer Art +0,15 (höchstens ×1,6).',
   svg:svg(grass(120,66,W)+shp(120,66,[[-2,0]],'hab-wasser','🐧')+shp(120,66,[[-1,0],[0,0]],'hab-wasser','🦭')+shp(120,66,[[1,0]],'hab-wasser','🐢')+shp(120,66,[[0,-1],[1,-1]],'hab-wasser','🦩')+t(at(120,66,-0.5,0)[0]+9,at(120,66,0,0)[1]-9,'🪙')+badge(120,at(120,66,0,1)[1]+14,[{t:'4 Wasser-Gehege zusammen',c:'b'},{t:'×1,1 Natur für den Zoo',c:''}]))},
  {title:'Zoolatro: Auflage und Winter',text:'Jeder Zoo hat eine <b>Auflage</b> (Bauregel) und eine <b>Winter-Bedingung</b>, die nur im Winter gilt. Statt Ereignissen gibt es in Frühling, Sommer und Herbst einen <b>Besucherwunsch</b> 🌟 mit Belohnung. Dein <b>Profil</b> wählst du einmal und behältst es den ganzen Lauf. Den nächsten Zoo siehst du schon vor den Belohnungen.',
   svg:svg(grass(120,62,W)+shp(120,62,[[-1,0]],'cat-essen','🍿')+shp(120,62,[[0,0],[1,0]],'hab-wasser','🦭')+t(at(120,62,-1,0)[0]-6,at(120,62,-1,0)[1]-7,'❄️')+badge(at(120,62,-1,0)[0]-6,at(120,62,-1,0)[1]+24,[{t:'zählt selbst nicht',c:'b'},{t:'gibt +2 B weiter',c:''}])+badge(at(120,62,2,-1)[0]+6,at(120,62,2,-1)[1]-20,[{t:'💸 +1 BP',c:''}]))},
  ]})}

/* ---------- modals ---------- */
const haveTxt=(nd,d)=>nd||d?[nd?`im Deck: ${nd}×`:'',d?`gebaut: ${d}×`:''].filter(Boolean).join(' · '):'neu für dich';
const inDeckN=k=>cnt([...state.hand,...state.deck,...state.discard],x=>x===k);
function offerCard(k,i){const c=CARDS[k],d=cnt(state.buildings,b=>b.key===baseK(k)),nd=inDeckN(k),rg=rgOf(c.rar);return`<button class="ocard${tutDraft()?(i?' tutno':' tutgo'):''}${rg?' '+rg:''}" data-pick="${i}">${glzHtml(rg,i||0)}
  <span class="band" style="background:${colOf(c)}">${metaTxt(c)}${rg?' · '+rgName(rg):''}${habIcs(c)?' '+habIcs(c):''}${catDotHtml(c)} · ${costTxt(k)}</span>
  <span class="ic">${ic(c)}</span>${miniShape(k)}<span class="nm">${c.name}</span><span class="st"><span class="a">${c.a} B</span><span class="s">${c.s} N</span></span>
  ${c.ed?`<span class="edl">${EDS[c.ed].icon} ${EDS[c.ed].name}: ${EDS[c.ed].text}</span>`:''}<span class="scopes">${scopeOf(c)}</span><span class="tx">${fxHtml(c)}</span>${perkN(k)?`<span class="rar">🏅 ${perkN(k)}× verbessert</span>`:''}${c.cat==='verst'?`<span class="rar" style="color:#d26a00">🔆 Verstärker: zählt selbst nicht${vNew(k)?' · ✨ Neu':''}</span>`:''}${c.tags.includes('einmalig')?'<span class="rar">Einmalig im Zoo</span>':''}${c.tags.includes('bedroht')&&!TUTNOW?'<span class="rar" style="color:#c0392b">● Rote Liste</span>':''}<span class="rar" style="color:${nd||d?'#c0392b':'#2e7d32'}">${haveTxt(nd,d)}</span>${c.cat==='gehege'&&state.buildings.some(b=>b.key===baseK(k)&&(b.lvl||1)<MAXLVL)?'<span class="rar">ausbaubar</span>':''}${c.rar!=='gewöhnlich'&&!rg?`<span class="rar">${rarLabel(c)}</span>`:''}</button>`}
function pileHtml(keys){if(!keys.length)return'<em>leer</em>';const m={};keys.forEach(k=>m[k]=(m[k]||0)+1);
  return Object.keys(m).sort((a,b)=>CARDS[a].name.localeCompare(CARDS[b].name,'de')).map(k=>`<span style="border-left-color:${colOf(CARDS[k])}">${CARDS[k].icon} ${CARDS[k].name}${m[k]>1?' ×'+m[k]:''}</span>`).join('')}
let helpOpen=false;
// 0.62a: Übersicht der Eigenschaften und ihrer Wechselwirkungen
function traitsMapHtml(){const N=(ic,t,cl)=>`<span class="tmn ${cl||''}"><b>${ic}</b>${t}</span>`,R=(a,lab,b,note)=>`<div class="tmr">${a}<span class="tma"><small>${lab}</small><i></i></span>${b}</div>${note?`<p class="tmx">${note}</p>`:''}`;
  return`<h2>🔗 Eigenschaften</h2><p class="hint" style="margin:0">Wer wirkt auf wen? Die Symbole stehen auf den Karten neben dem Lebensraum.</p><div class="tmap">
  ${R(N('🦷','Raubtier','bad'),'stresst · bis 2 Felder',N('🐇','Beute'))}
  ${R(N('🍔🎡','Gastro / Attraktion','bad'),'stresst · bis 2 Felder',N('🙈','Scheu'),'🤫 <b>Ruhig</b> stört scheue Tiere nicht.')}
  ${R(N('🍔🎡','direkt daneben','good'),'×1,25 je · höchstens 2',N('🎭','Showtier'),'🎉 <b>Trubel</b> zählt doppelt, 🤫 <b>Ruhig</b> zählt gar nicht. Die 🏟️ <b>Tribüne</b> wirkt schon bis 2 Felder weit (wie Trubel).')}
  ${R(N('🩺','Tierarzt daneben','good'),'hebt Stress auf',N('😣','gestresst'),'Bei scheuen Tieren hilft auch die 🌿 Regenwald-Kuppel.')}
  </div><ul class="tml"><li>😣 <b>Stress:</b> Jedes gestresste Tier kostet den ganzen Zoo Natur: ×0,95 je Tier (zwei ×0,9 …), höchstens einmal je Tier, insgesamt höchstens ×0,6.</li><li>🔴 <b>Bedroht:</b> keine Wirkung auf Nachbarn, zählt aber für Ziele, Spezialisten und das ❄️ Zuchtprogramm (doppelt).</li><li>🎉 <b>Trubel</b> und 🤫 <b>Ruhig</b> tragen nur Gastro-Gebäude und Attraktionen.</li></ul><button class="btn main big" id="mTrBack">Zurück zum Menü</button>`}
function helpHtml(){const rs=(()=>{try{const r=runOf();return r&&r.seed?r.seed:''}catch(e){return''}})();return`<h2>Menü</h2>${rs?`<p class="seedline">🌱 Seed: <b class="seedv">${rs}</b> <button class="btn sub" id="mSeed" style="padding:3px 10px">Kopieren</button></p>`:''}<button class="btn main big" id="mClose">▶ Weiterspielen</button>
  ${(()=>{try{const r=runOf();return r&&!r.tut&&state&&state.mode==='camp'}catch(e){return false}})()?'<button class="btn sub" id="mRunCopy" style="align-self:center;padding:6px 14px">📋 Lauf kopieren</button>':''}<div class="viewsel"><span>📐 Ansicht</span>${[['auto','Automatisch'],['hoch','Hochformat'],['quer','Querformat']].map(([k,t])=>`<button class="btn sub${(META.view||'auto')===k?' on':''}" data-view="${k}">${t}</button>`).join('')}</div><div class="menubtns"><button class="btn sub" id="mHome">🏠 Hauptmenü</button><button class="btn sub" id="mTut">📖 Kurzübersicht</button><button class="btn sub" id="mTraits">🔗 Eigenschaften</button><button class="btn sub" id="mNews">📜 Neuigkeiten</button><button class="btn sub" id="mRestart">${state&&(state.mode==='tut'||gRun())?'✕ Tutorial beenden':state&&state.mode==='camp'?'🏳 Lauf beenden':'⟲ Neues Spiel'}</button></div>
  <div class="setrow"><span>Ton:</span>${[[0,'🔊 An'],[1,'🔇 Aus']].map(([v,l])=>`<button class="chip2 ${(Sfx.muted?1:0)===v?'on':''}" data-mute="${v}">${l}</button>`).join('')}</div>
  <div class="setrow"><span>🗑️ Neu anfangen:</span><button class="chip2" id="mReset">Alles zurücksetzen</button></div>
  <div class="setrow"><span>💬 Feedback nach dem Lauf:</span>${[[0,'An'],[1,'Aus']].map(([v,l])=>`<button class="chip2 ${(META.fbOff?1:0)===v?'on':''}" data-fbm="${v}">${l}</button>`).join('')}</div>
  ${META.dev?`<div class="setrow"><span>🌿 Spielfeld:</span>${[[0,'neu'],[1,'alt']].map(([v,l])=>`<button class="chip2 ${(META.oldBoard?1:0)===v?'on':''}" data-nbm="${v}">${l}</button>`).join('')}</div>
  <div class="setrow"><span>💥 Wucht:</span>${[['s','stark'],['n','normal']].map(([v,l])=>`<button class="chip2 ${(META.fxPow||'s')===v?'on':''}" data-pwm="${v}">${l}</button>`).join('')}</div>
  <div class="setrow"><span>✨ Effekt-Probe:</span>${[[0,'an'],[1,'aus']].map(([v,l])=>`<button class="chip2 ${(META.fxOff?1:0)===v?'on':''}" data-fxm="${v}">${l}</button>`).join('')}</div>
  <div class="setrow"><span>🧪 Test:</span>${[[1,'Verstärker an'],[0,'aus']].map(([v,l])=>`<button class="chip2 ${(META.testVerst?1:0)===v?'on':''}" data-vtm="${v}">${l}</button>`).join('')}</div>`:''}
  <div class="setrow"><span>Auszähl-Tempo:</span>${[[0,'Normal'],[1,'Schnell']].map(([v,l])=>`<button class="chip2 ${SCFAST===v?'on':''}" data-scf="${v}">${l}</button>`).join('')}</div>
  <div class="setrow"><span>Schiebe-Tempo im Zoom:</span>${[[1.5,'Normal'],[2.25,'Schnell'],[3,'Sehr schnell']].map(([v,l])=>`<button class="chip2 ${PANSPEED===v?'on':''}" data-pan="${v}">${l}</button>`).join('')}</div>
  <button class="btn sub" id="mRules">${helpOpen?'▾ Spielregeln ausblenden':'▸ 📜 Spielregeln anzeigen'}</button>
  ${helpOpen?`<ul>
  <li>Jeden Morgen ziehst du 5 Karten aus deinem Deck und hast <b>4 Baupunkte</b>. Jedes Feld einer Karte kostet 1 Baupunkt, Gehege mit 4 Feldern kosten 1 weniger.</li>
  <li>Karte aufs Gelände ziehen oder antippen und aufs Feld tippen, mit <b>↻ Drehen</b> ausrichten, dann <b>🔨 Bauen</b>. Du kannst mehrere Karten pro Tag bauen.</li>
  <li><b>Tag beenden:</b> Übrige Handkarten kommen auf die Ablage, dann zählt der ganze Zoo: <b>Summe Besucher × Summe Natur</b>.</li>
  <li><b>Seltenheit:</b> Seltene Karten glänzen ab und zu, legendäre öfter und farbig. Bei Spezialisten gilt dasselbe für die Stufen Selten und Legendär.</li>
  <li>Gebaute Karten sind <b>verbraucht</b>. Für jede gebaute Karte wählst du nach dem Tag 1 von 2 neuen Karten.</li>
  <li><b>Wiederholung:</b> Die zweite Anlage derselben Art bringt nur ×0,75 ihrer Besucher und Natur (samt Boni), ab der dritten nur noch ×0,25. Besucher wollen Abwechslung.</li>
  <li><b>Jahreszeiten-Karten:</b> Manche Karten wirken je nach Jahreszeit stärker oder schwächer, das steht auf der Karte. Wasserspielplatz, Kürbisfest und die Winter-Karten gibt es nur in ihrer Jahreszeit zur Auswahl.</li>
  <li><b>Meilensteine:</b> Ab ${MILE.wasser.n} verschiedenen Gehege-Arten eines Lebensraums oder ${MILE.attr.n} verschiedenen Attraktionen, ${MILE.essen.n} Gastro-Gebäuden, ${MILE.schutz.n} Naturschutz-Gebäuden oder je ${MILE.bunt.n} verschiedenen aus allen vier Kategorien (🎨) bekommst du am nächsten Morgen eine besondere Karte. Sie ersetzt eine deiner fünf Handkarten. Den Fortschritt zeigt 🏅 oben neben „Saison“.</li>
  <li><b>Stress:</b> Jedes Raubtier (Löwen, Tiger, Geparden, Wölfe …) im Umkreis von 2 Feldern um ein Beutetier (Zebras, Giraffen, Mendesantilopen …) und jedes Gastro-Gebäude oder jede Attraktion im Umkreis von 2 Feldern um ein <b>scheues</b> Tier (Pandas, Faultiere, Schildkröten …) macht das Tier gestresst. Jedes gestresste Tier kostet den ganzen Zoo Natur: ×0,95 je Tier (egal wie viele Störer), insgesamt höchstens ×0,6. 🤫 Ruhige Gebäude stören nicht, 🎉 Trubel gibt Showtieren den doppelten Bonus. <b>Showtiere</b> (Seelöwen, Pinguine, Affen, Papageien, Skorpione, Giraffen, Warzenschweine) bekommen umgekehrt ×1,25 mit einem benachbarten Gastro-Gebäude oder einer Attraktion, ×1,5 mit zweien. Ein <b>Tierarzt</b> daneben hebt Stress auf.</li>
  <li><b>Pause:</b> Nach jeder Auszählung kannst du dir den Zoo in Ruhe anschauen. Weiter geht es mit „Nächsten Tag starten“.</li>
  <li><b>Lebensraum:</b> +1 Besucher je benachbartes Gehege mit gleichem Lebensraum. Auf <b>Naturflächen</b> dürfen nur passende Gehege (mit +1 Natur je Feld), andere Gehege nicht. Attraktionen, Gastro-Gebäude und Naturschutz-Gebäude dürfen dort ohne Bonus stehen.</li>
  <li><b>Umziehen:</b> Gebautes antippen, dann wird der mittlere Knopf zu 🚚 „Umziehen“. Neuen Platz wählen und mit „Setzen“ bestätigen. Einmal am Tag gratis, danach 1 Baupunkt; die Ausbaustufe bleibt. ↶ bricht vorher ab.</li><li><b>Abreißen:</b> Gebautes antippen, dann „💥 Abreißen“: kostet 1 Baupunkt, die Karte ist für diesen Zoo weg (Karten aus deinem Deck sind im nächsten Zoo wieder da).</li>
  <li><b>Ausbauen:</b> Ziehe eine Gehege-Karte auf ein gleiches Gehege. Gleiche Kosten, +1 B und +1 N je angefangene 2 Felder pro Stufe, bis Stufe III. Zählt nicht als Wiederholung.</li>
  <li><b>Bonus-Karten:</b> Schaffst du alle vier Jahreszeiten, schaltest du 1 von 3 Bonus-Karten für deinen Speicherplatz frei.</li>
  <li><b>Speicherplätze und Verbesserungen:</b> Jeder der drei Speicherplätze hat seinen eigenen Zoo. Nach jedem beendeten Spiel verbesserst du eine Karte dauerhaft um +1 B oder +1 N (🏅, bis zu 3-mal pro Karte).</li>
  <li><b>🔍 Zoom</b> sitzt in einer freien Ecke des Geländes oder oben in der Leiste. Auf freier Fläche ziehen verschiebt den Ausschnitt. Beim Tagesende geht der Zoom aus.</li>

  <li><b>Zoolatro:</b> Zoo um Zoo wird es schwerer. Du startest mit einem Profil. Nach jedem geschafften Zoo gibt es Belohnungen: Verbesserungen, neue Karten, Aussortieren und einen Spezialisten. Jeder Zoo beginnt mit deinem Lauf-Deck; Gelände, Taler und Förderprogramme beginnen neu.</li>
  <li><b>Spezialisten</b> (nur Zoolatro): Mitarbeiter mit Sonderregel, höchstens 4, gelten für den ganzen Lauf. Du bekommst sie im Stellenmarkt 👥 (nach jeder Jahreszeit als Reiter neben dem Shop, jeweils höchstens einen) und nach jedem Zoo. 🎖️ oben zeigt dein Team.</li>
  <li><b>🔄 Neu ziehen:</b> Einmal pro Jahreszeit gratis, danach für 1 Baupunkt wirfst du die ganze Hand ab und ziehst fünf neue Karten. Zweimal tippen zum Bestätigen. Das lässt sich nicht rückgängig machen, und die Züge davor sind danach fest.</li>
  <li><b>↶ Rückgängig</b> nimmt Bauen, Ausbauen und Umziehen des heutigen Tages Schritt für Schritt zurück.</li>
  <li><b>Einmalig:</b> Gehege/Gebäude mit Bonus für den ganzen Zoo (Artenvielfalt-Institut, Zoo-Stiftung, Nachtführung) gibt es nur einmal im Zoo.</li>
  <li><b>Rote Liste</b> (roter Punkt): bedrohte Arten. Tierarzt, Zuchtstation und manche Förderprogramme belohnen sie.</li>
  <li><b>Saisonende:</b> Sobald das Ziel erreicht ist, endet die Saison. Jeder übrige Tag bringt +5 Taler.</li>
  <li><b>Geld:</b> Jeder Tag bringt 1 Taler je 9 Besucher und kostet 1 Taler je 8 Natur. Gespartes bringt keine Zinsen, Schulden kosten aber −1 je 10 Taler (Kredit).</li>
  <li><b>Shop</b> nach jeder Saison: 📁 Bewerbermappe (3 zufällige Spezialisten, einen einstellen; 25 Taler, jede weitere im selben Zoo +10; nach jedem geschafften Zoo eine gratis) und 💼 Profi-Mappe (mindestens eine seltene oder legendäre Bewerbung, 45 Taler, jede weitere +15) im Reiter 👥 Team · Umbau-Kiste und 🧺 Futtersack (20 Taler, jeder weitere +10) im Reiter 🧰 Umbau &amp; Futter · Einmal-Karten, Zoo-Ausbau, Karte entfernen und Felsen wegbaggern im Reiter 🎟️ Extras. Mit Schulden kannst du nichts kaufen.</li><li><b>Glück (0.92):</b> 🎲 Glücks-Prägung (1 zu 4: ×3), 🔂 Zugabe (1 zu 3: zählt zweimal), 🫙 Wackelig (×2, zerbricht mit 1 zu 6 am Ende der Jahreszeit), Glücks-Spezialisten, 🍀 Glückspilz verdoppelt alle Chancen. An manchen Tagen ab dem Sommer (25 % am Tag) gibt es einen ❤️ <b>Besucherliebling</b> (×2, Nachbarn ×1,25). <b>Zoo-Momente</b> (📸 Fotograf, 🎂 Kindergeburtstag, 🦓 Herde zieht weiter) kommen mit 10 % am Tag, höchstens 1 pro Jahreszeit. <b>Geheime Freundschaften</b> stehen im 📖 Zoo-Buch. Die <b>Landschaft wächst</b> am Ende jeder Jahreszeit (Dschungel, Wüste im Sommer, Quellen).</li><li><b>Freischalten</b> über Ziele: Profile, Arktis und Gebirge, 33 Karten mit Kombo-Wirkung, legendäre Spezialisten und Verstärker. Jedes Ziel schaltet sofort frei, alles steht im 📖 Zoo-Buch (🔓 Freischalten).</li>
  <li><b>Winter:</b> Savannen- und Wüstengehege frieren (−1 B).</li></ul>
  <div class="habrow">${Object.values(HAB).map(h=>`<span><i style="background:${h.col}"></i>${h.icon} ${h.label}</span>`).join('')}</div>
  <div class="habrow">${['attr','essen','schutz'].map(k=>`<span><i style="background:var(--paper);border:3px solid ${CAT[k].col}"></i>${CAT[k].label}</span>`).join('')}</div>`:''}`}
let mapCssDone=false;
// die Gelände-Stile gelten auch für die kleine Karte in der Profilwahl
function mapCss(){if(mapCssDone)return;mapCssDone=true;try{for(const sh of document.styleSheets){let rs;try{rs=[...sh.cssRules]}catch(e){continue}for(const r of rs)if(r.selectorText&&r.selectorText.includes('#board'))sh.insertRule(r.cssText.replace(/#board/g,'.zlmap svg'),sh.cssRules.length)}}catch(e){}}
let FSBACK=null;
function renderModal(){try{return renderModal0()}catch(e){logErr('Fenster '+(modal||'-'),e);try{const root=$('modalRoot');root.innerHTML=`<div class="overlay"><div class="modal" role="dialog" aria-modal="true"><h2>⚠️ Fehler</h2><p>Dieses Fenster konnte nicht angezeigt werden (${String(e&&e.message||e).replace(/</g,'&lt;').slice(0,160)}).</p><p class="hint" style="color:var(--muted)">Bitte über das Menü „📋 Lauf kopieren“ an Claude schicken, der Fehler steht dort.</p><button class="btn sub" id="mErrCopy">📋 Lauf kopieren</button><button class="btn main" id="mErrClose">Schließen</button></div></div>`;$('mErrCopy').onclick=()=>{try{const r=runOf();copyTxt(r?runText(r):errTxt(),$('mErrCopy'))}catch(e5){}};$('mErrClose').onclick=()=>{modal=null;try{renderAll()}catch(e2){root.innerHTML=''}}}catch(e4){}}}
function renderModal0(){const root=$('modalRoot'),se=state?seOf(state.season):null,inGame=!!state&&!screen;let h='',wide=false;
  if((!modal||modal==='zoo')&&inGame&&state.mode==='camp'&&state.phase==='play'){const r=runOf();if(r&&r.fsIntro)r.fsIntro=0}  // 0.79a: keine 3 Ziele je Lauf mehr, also auch keine Einblendung
  if(modal==='fsIntro'&&inGame){const r=runOf(),sl=activeSlot();h=`<h2>🔓 Freischalt-Ziele für diesen Lauf</h2><p style="margin:0">In diesem Lauf kannst du diese ${r.fsPick.length} Dinge freischalten. Andere Ziele kommen in späteren Läufen dran. Nach jedem Zoo siehst du deinen Stand.</p>${fsRunHtml(r,sl)}<button class="btn main big" id="mFsIntroOk">Los geht's</button>`}
  else if(modal==='help')h=helpHtml();else if(modal==='traits')h=traitsMapHtml();
  else if(modal==='zoo'&&inGame){h=zooBoxHtml();wide=true}
  else if(modal==='mwarn'&&inGame){h=`<h2>⚠️ Kasse rutscht ins Minus</h2><p>Heute bringt dein Zoo <b>${state.mwInc} Taler</b>. Deine Kasse fällt damit von ${state.money} auf <b>${state.money+state.mwInc}</b>.</p><p class="hint" style="text-align:left">Im Minus <b>streikt dein Team</b>: Spezialisten wirken nicht, bis die Kasse wieder bei 0 ist. Mehr Besucher bringen Eintritt, mehr Natur kostet Pflege.</p><div class="shopbar"><button class="btn sub" id="mClose">Zurück</button><button class="btn main" id="mEndAnyway">Trotzdem beenden</button></div>`}
  else if(modal==='strike'&&inGame){h=`<h2>🪧 Kasse im Minus</h2><p>Deine Kasse ist unter 0 gerutscht. Solange du im Minus bist:</p><ul class="hint" style="text-align:left"><li><b>Dein Team streikt:</b> Spezialisten wirken nicht.</li><li><b>Shop und Stellenmarkt</b> sind gesperrt.</li><li><b>Kredit:</b> Je 10 Taler Schulden kostet jeder Tag 1 Taler extra.</li></ul><p class="hint">Mehr Besucher bringen Geld, viel Natur kostet Pflege. Sobald du wieder bei 0 bist, geht alles weiter.</p><button class="btn main" id="mClose">Verstanden</button>`}
  else if(modal==='inspPick'&&inGame&&state.zl){h=`<h2>❄️ Der Winter kommt: Wähle die Winter-Bedingung</h2><p style="margin:0">Eine der beiden gilt für den ganzen Winter. Schau dir deinen Zoo an und entscheide.</p><div class="zboxes">${state.zl.inspOpts.map(i=>{const zz={...state.zl,insp:i};if(i==='hab')zz.inspHabs=habTop(state.buildings);return`<div class="zbox zi2"><span class="zi">${inspIcon(zz)}</span><div><b>${INSP[i].name}</b><span>${inspText(zz)}</span><button class="btn main" data-ipick="${i}" style="margin-top:8px;display:block">Diese nehmen</button></div></div>`}).join('')}</div>`}
  else if(modal==='wetter'&&inGame&&state.zl){const Z=state.zl,O=Z.inspOpts&&!Z.inspPicked?Z.inspOpts:[Z.insp];h=`<h2>❄️ Wetterbericht</h2><p style="margin:0">Der Herbst beginnt. ${O.length>1?'Für den Winter sind zwei Bedingungen angesagt, eine davon wählst du zum Winterbeginn:':'Für den Winter ist angesagt:'}</p><div class="zboxes">${O.map(i=>{const zz={...Z,insp:i};return`<div class="zbox zi2"><span class="zi">${inspIcon(zz)}</span><div><b>${INSP[i].name}</b><span>${inspText(zz)}</span></div></div>`}).join('')}</div>${O.length===1?winterHitTxt():''}<p style="margin:0;color:var(--muted);font-size:13px">Du hast den ganzen Herbst, um dich vorzubereiten. Die Bedingung steht ab jetzt auch im Zoo-Fenster, und ❄️-Schilder auf dem Spielfeld zeigen, was sie trifft.</p>${wSwapBtn()}<button class="btn main" id="mClose">Verstanden</button>`}
  else if(modal==='insp'&&inGame&&state.zl){h=`<h2>${inspIcon(state.zl)} Winter-Bedingung</h2><div class="zboxes"><div class="zbox zi2"><span class="zi">${inspIcon(state.zl)}</span><div><b>${INSP[state.zl.insp].name}</b><span>${inspText(state.zl)}</span></div></div></div>${winterHitTxt()}${wSwapBtn()}<button class="btn main" id="mClose">Verstanden</button>`}
  else if(modal==='tut'){const sl=tutSlides(),i=Math.max(0,Math.min(tutIdx,sl.length-1)),S=sl[i];
    h=`<div class="tut"><div class="tuthead"><span>Tutorial · ${i+1} / ${sl.length}</span><button class="icbtn" id="mClose" aria-label="Tutorial schließen">✕</button></div>${S.svg}<h2>${S.title}</h2><p>${S.text}</p>
      <div class="dotsnav">${sl.map((_,j)=>`<i class="${j===i?'on':''}"></i>`).join('')}</div>
      <div class="shopbar"><button class="btn sub" id="tPrev" ${i?'':'disabled'}>‹ Zurück</button><button class="btn main" id="tNext">${i<sl.length-1?'Weiter ›':'Los geht’s'}</button></div></div>`}
  else if(modal==='restart')h=state.mode==='camp'?`<h2>Lauf beenden?</h2><p>Der Zoolatro-Lauf endet hier und kommt mit ${state.zoo} geschafften Zoo${state.zoo===1?'':'s'} in die Bestenliste.</p><div class="shopbar"><button class="btn sub" id="mClose">Abbrechen</button><button class="btn main" id="mRestartYes">Ja, Lauf beenden</button></div>`
    :`<h2>Neues Spiel starten?</h2><p>Dein aktueller Zoo, dein Deck und deine Kasse gehen verloren.</p><div class="shopbar"><button class="btn sub" id="mClose">Abbrechen</button><button class="btn main" id="mRestartYes">Ja, neu starten</button></div>`;
  else if(modal==='deck')h=`<h2>Dein Deck</h2><h3 class="stk">📥 Nachziehstapel <i>${state.deck.length}</i></h3>${state.deck.length?deckRows(state.deck,()=>''):'<div class="pile"><em>leer</em></div>'}
    <h3 class="stk">🗑️ Ablagestapel <i>${state.discard.length}</i></h3>${state.discard.length?deckRows(state.discard,()=>''):'<div class="pile"><em>leer</em></div>'}
    <h3 class="stk">✋ Hand <i>${state.hand.length}</i></h3>${state.hand.length?deckRows(state.hand,()=>''):'<div class="pile"><em>leer</em></div>'}${(state.spec||[]).length?`<h3>Spezialisten</h3><div class="pile">${state.spec.filter(id=>SPEC[id]).map(id=>`<span>${SPEC[id].icon} ${SPEC[id].name}: ${SPEC[id].fx.map(l=>l.replace('|',' ')).join(', ')}</span>`).join('')}</div>`:''}<h3>Meilensteine</h3><div class="mile">${mileKeys().map(t=>{const M=MILE[t],n=Math.min(M.n,mileCount(state.buildings,t)),ok=(state.miles||{})[t];return`<span class="${ok?'ok':''}">${M.icon} ${ok?'✓ '+CARDS[M.card].name:n+'/'+M.n}</span>`}).join('')}</div><button class="btn main" id="mClose">Schließen</button>`;
  else if(inGame&&state.phase==='play'&&(state.mileNew||[]).length){const t=state.mileNew[0],M=MILE[t],c=CARDS[M.card];
    h=`<h2>🏅 Meilenstein erreicht!</h2><p style="margin:0">Du hast <b>${M.n} verschiedene ${M.label}</b> in deinem Zoo. Dafür bekommst du diese besondere Karte. Sie ersetzt heute eine deiner fünf Handkarten und lässt sich nur einmal bauen.</p>
      <div class="milecard"><span class="ic">${ic(c)}</span><span class="nm">${c.name}</span><span style="font-size:12px;font-weight:600;color:#5d6b60">${c.hab?HAB[c.hab].label+'-Gehege':CAT[c.cat].label} · ${costOf(M.card)} BP · Einmalig</span><span class="vals3"><span class="a">${c.a} B</span><span class="s">${c.s} N</span>${miniShape(M.card)}</span>${fxHtml(c)}</div>
      <button class="btn main big" id="mMileOk">Auf die Hand nehmen</button>`}
  else if(inGame&&state.phase==='draft')h=`<h2>Neue Karte ${state.pickTotal-state.picks+1} von ${state.pickTotal}</h2><p>Du hast ${state.pickTotal} Karte${state.pickTotal>1?'n':''} verbaut und darfst genauso viele neue wählen. Sie kommen auf deine Ablage.</p>${state.pendingSeason&&seOf(state.season+1)?evLine(state.eventsNext,'im '+seOf(state.season+1).name):''}<div class="offer">${state.offer.map(offerCard).join('')}</div><div class="shopbar" style="display:grid"><button class="btn sub" id="mDraftRoll" ${canPay(draftPrice())?'':'disabled'}>🎲 Neue Auswahl · 🪙 ${draftPrice()}</button></div><p style="margin:0;font-size:12.5px;color:var(--muted)">Wähle eine der beiden Karten. Dein Deck: <b>${deckTotal()} Karten</b>. In der Kasse: 🪙 ${fmt(state.money)}. Jeder Wurf heute kostet 2 mehr.</p>`;
  else if(inGame&&state.phase==='shop'){h=shopHtml();wide=true}
  else if(inGame&&['seasonWon','win','lost'].includes(state.phase)&&(state.fsNew||[]).length){h=fsNewHtml(state.fsNew)+'<button class="btn main big" id="mFsOk">Super!</button></div>'}
  else if(inGame&&(state.phase==='seasonWon'||state.phase==='win')&&(state.z2born||[]).length&&!state.z2bornSeen){let conf='';if(!reduced)for(let i=0;i<40;i++){const d=(2.4+Math.random()*2.4).toFixed(2);conf+=`<i style="left:${(Math.random()*100).toFixed(1)}%;background:${['#ffd166','#9be7a0','#ff9ec4','#fff','#7cc6ff'][i%5]};animation-duration:${d}s;animation-delay:${(Math.random()*1.2).toFixed(2)}s"></i>`}
    if(!state.z2bornSnd){state.z2bornSnd=1;Sfx.combo()}const nB=state.z2born.length;
    h=`<div class="wconf" aria-hidden="true">${conf}</div><h2>🍼 Nachwuchs!</h2><p style="margin:0">${nB>1?'Zwei Zuchtpaare haben':'Ein Zuchtpaar hat'} Nachwuchs bekommen. ${nB>1?'Die Jungtiere kommen':'Das Jungtier kommt'} in dein Lauf-Deck.</p><div class="bornrow">${state.z2born.map(k=>{const c=CARDS[k];return`<div class="milecard"><span class="ic">${ic(c)}</span><span class="nm">${c.name}</span><span style="font-size:12px;font-weight:600;color:#5d6b60">Jungtier · ${costOf(k)} BP</span><span class="vals3"><span class="a">${c.a} B</span><span class="s">${c.s} N</span>${miniShape(k)}</span>${fxHtml(c)}</div>`}).join('')}</div><p class="hint" style="margin:0">💞 Zucht: zwei gleiche Gehege nebeneinander, eines davon mindestens Stufe II, am Ende einer gewonnenen Jahreszeit. Höchstens 3 Jungtiere im Deck.</p><button class="btn main big" id="mBornOk">Willkommen!</button>`}
  else if(inGame&&state.phase==='win'&&gRun()){h=`<div class="fliv"><div class="fheart">🧑‍💼</div><h2 style="color:var(--gold)">Sie haben es geschafft!</h2><p style="margin:0;text-align:left">„Fantastisch, der Zoo sieht wirklich super aus! Ich sehe schon, Sie lernen schnell. Lassen Sie uns weiterziehen, ich bringe Ihnen die nächste Stufe einer erfolgreichen Zooplanung bei.“ – Jasper</p><p class="hint" style="margin:0;text-align:left">Der zweite Tutorial-Zoo kommt mit einem der nächsten Updates. Bis dahin kann ein echter Lauf starten.</p><button class="btn main big" data-gend="1">🎓 Tutorial abschließen</button></div>`}
  else if(inGame&&state.phase==='seasonWon'){const nx=seOf(state.season+1);
    h=`<h2>${se.name} geschafft${state.day<DAYS-1?` an Tag ${state.day+1}`:''}!</h2><div class="bigscore">${fmt(state.seasonScore)}</div><p>Ziel war ${fmt(se.target)}.${state.earlyBonus&&!state.earlyR?` Früh fertig: <b>+🪙 ${state.earlyBonus}</b> für ${state.earlyBonus/EARLY_BONUS} übrige Tag${state.earlyBonus/EARLY_BONUS>1?'e':''}${state.earlyInfo||''}.`:''} In der Kasse: 🪙 ${fmt(state.money)}. Nach deinen neuen Karten geht es in den Shop. Im ${nx.name} brauchst du <b>${fmt(nx.target)}</b> Punkte.</p>${earlyBoxHtml()}${bestHtml()}${evLine(state.eventsNext,'im '+nx.name)}<button class="btn main" id="mNext">Weiter</button>`}
  else if(inGame&&state.phase==='lost')h=`<h2>Saisonziel verfehlt</h2><div class="bigscore">${fmt(state.seasonScore)} / ${fmt(se.target)}</div><p>Der ${se.name} war zu ruhig. Gesamtpunkte: <b>${fmt(state.totalScore)}</b>. ${state.mode==='camp'?`Dein Lauf endet in Zoo ${state.zoo+1} und kommt in die Zoolatro-Bestenliste.`:'Dein Ergebnis kommt in die Highscore-Liste, und du darfst eine Karte dauerhaft verbessern.'}</p><button class="btn main" id="mFinish">Weiter zur Zusammenfassung</button>`;
  else if(inGame&&state.phase==='win'&&!state.fliv)h=flivHtml();
  else if(inGame&&state.phase==='win')h=state.mode==='camp'?`<h2>Zoo ${state.zoo+1} geschafft!</h2><div class="bigscore">${fmt(state.totalScore)}</div><p>Alle vier Jahreszeiten geschafft. Jetzt geht es zu den Belohnungen: eine Verbesserung, neue Karten (die erste gratis, weitere aus der Zoo-Kasse mit deinen 🪙 ${fmt(Math.max(0,state.money))} übrigen Talern) und ein Spezialist.</p>${bestHtml()}<button class="btn main" id="mFinish">Weiter zur Belohnung</button>`
    :`<h2>Dein Zoo hat das Jahr geschafft!</h2><div class="bigscore">${fmt(state.totalScore)}</div><p>Alle vier Jahreszeiten geschafft. Dein Ergebnis kommt in die Highscore-Liste, und du darfst eine Karte dauerhaft verbessern.</p><button class="btn main" id="mFinish">Weiter zur Zusammenfassung</button>`;
  root.innerHTML=h?`<div class="overlay"><div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true">${guideHtml()}${h}</div></div>`:'';
  root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>pick(+b.dataset.pick));
  root.querySelectorAll('[data-iswap]').forEach(b=>b.onclick=()=>wSwap());root.querySelectorAll('[data-ipick]').forEach(b=>b.onclick=()=>{Sfx.select();zlInspPick(b.dataset.ipick)});
  root.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>pick(null));
  root.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{const v=b.dataset.item,i=+v.slice(1);buy(v[0]==='f'?fixedItems()[i]:state.shop.items[i])});
  root.querySelectorAll('[data-rmk]').forEach(b=>b.onclick=()=>{const k=b.dataset.rmk;if(state.rmArm!==k){state.rmArm=k;Sfx.select();render();return}removeCard(['deck','discard','hand'].find(p=>state[p].includes(k)),k)});
  root.querySelectorAll('[data-mhire]').forEach(b=>b.onclick=()=>{const id=b.dataset.mhire,pr=specPrice(id),m=state.market;if(m.bought||!canPay(pr)||!hireSpec(id)){Sfx.deny();return}state.money-=pr;state.stats.spent+=pr;m.bought=true;m.items=m.items.filter(x=>x!==id);Sfx.till();Sfx.win();render()});
  root.querySelectorAll('[data-fdpick]').forEach(b=>b.onclick=()=>{const o=b.dataset.fdpick,run=runOf();if(!state.sack||!run)return;{const ts=gRun()&&tutStep0();if(ts&&ts.food&&o!==ts.food){Sfx.deny();return}}
    if(o.startsWith('h:')){const h=o.slice(2);run.fdl=run.fdl||{};run.fdl[h]=(run.fdl[h]||0)+1;const v=fdLvB(run.fdl[h]);state.sack=null;state.shopSub=null;state.shop.note=`${HFOOD[h].icon} ${HFOOD[h].name}: ${HAB[h].label} ist jetzt Stufe ${run.fdl[h]}, alle ${HAB[h].label}-Gehege +${v} B +${v} N.`;foodLogAdd(`${HFOOD[h].name} → ${HAB[h].label} Stufe ${run.fdl[h]}`);syncCtx();Sfx.win();render();return}
    if(o==='ue'){const L=foodPile().filter(x=>ueFits(x[2]));state.sack=null;state.shopSub=null;if(!L.length){state.shop.note='🎁 Kein passendes Gehege im Deck.';render();return}const[pile,ix,k]=L[Math.floor(Math.random()*L.length)],P=praegLos(),pg=P[Math.floor(Math.random()*P.length)],nk=prKey(k,pg);state[pile][ix]=nk;const j=run.deck.indexOf(k);if(j>=0)run.deck[j]=nk;state.shop.note=`🎁 Überraschung: ${CARDS[k].name} bekommt ${PRAEG[pg].icon} ${PRAEG[pg].name}: ${PRAEG[pg].text.replace(/\.$/,'')}.`;state.surprise={key:nk,pg};foodLogAdd(`Überraschungsfutter → ${CARDS[k].name} ${PRAEG[pg].name}`);Sfx.win();render();return}
    state.feedF=o;state.shopSub='feed';Sfx.select();render()});
  root.querySelectorAll('[data-fdskip]').forEach(b=>b.onclick=()=>{{const ts=gRun()&&tutStep0();if(ts&&ts.food){Sfx.deny();return}}state.sack=null;state.shopSub=null;render()});
  root.querySelectorAll('[data-fdback]').forEach(b=>b.onclick=()=>{state.feedF=null;state.shopSub='sack';render()});
  root.querySelectorAll('[data-feedk]').forEach(b=>b.onclick=()=>{const k=b.dataset.feedk,f=state.feedF,P=foodPile().find(x=>x[2]===k);if(!P||!f||!fdFits(f,k))return;const nk=fdKey(k,f),run=runOf();state[P[0]][P[1]]=nk;if(run){const i=run.deck.indexOf(k);if(i>=0)run.deck[i]=nk}state.feedF=null;state.sack=null;state.shopSub=null;state.shop.note=`${FOOD[f].icon} ${CARDS[k].name} bekommt ${FOOD[f].name}: ${FOOD[f].text}.`;foodLogAdd(`${FOOD[f].name} → ${CARDS[k].name}`);Sfx.win();render()});
  root.querySelectorAll('[data-futk]').forEach(b=>b.onclick=()=>{const k=b.dataset.futk,it=state.pendItem;if(!it||!canPay(it.price)){Sfx.deny();return}const pile=['deck','discard','hand'].find(p=>state[p].includes(k));if(!pile)return;const P=praegLos().filter(p=>!(PRAEG[p].geh&&CARDS[k].cat!=='gehege')),p=P[Math.floor(Math.random()*P.length)],nk=prKey(k,p),arr=state[pile];arr[arr.indexOf(k)]=nk;const run=runOf();if(run){const i=run.deck.indexOf(k);if(i>=0)run.deck[i]=nk}state.money-=it.price;state.stats.spent+=it.price;it.sold=true;state.pendItem=null;state.shopSub=null;state.shop.note=`🥕 ${CARDS[k].name} bekommt ${PRAEG[p].icon} ${PRAEG[p].name}: ${PRAEG[p].text}.`;Sfx.till();Sfx.win();render()});
  root.querySelectorAll('[data-mapick]').forEach(b=>b.onclick=()=>{const id=b.dataset.mapick,M=state.mappe;if(!M)return;{const ts=gRun()&&tutStep0();if(ts&&ts.spec&&id!==ts.spec){Sfx.deny();return}}if((state.spec||[]).length>=maxSpec()){M.pick=id;Sfx.select();render();return}if(!hireSpec(id)){Sfx.deny();return}state.shopSub=null;state.mappe=null;state.shop.note=`${SPEC[id].icon} ${SPEC[id].name} ist jetzt in deinem Team.`;Sfx.win();saveMeta();render()});
  root.querySelectorAll('[data-marep]').forEach(b=>b.onclick=()=>{const M=state.mappe;if(!M||!M.pick)return;const old=b.dataset.marep,nw=M.pick;fireSpec(old,false);if(!hireSpec(nw)){Sfx.deny();return}state.shopSub=null;state.mappe=null;state.shop.note=`${SPEC[nw].icon} ${SPEC[nw].name} ersetzt ${SPEC[old].icon} ${SPEC[old].name}.`;Sfx.win();saveMeta();render()});
  {const mb=$('mBack');}root.querySelectorAll('[data-mapback]').forEach(b=>b.onclick=()=>{if(state.mappe)state.mappe.pick=null;Sfx.select();render()});
  root.querySelectorAll('[data-maskip]').forEach(b=>b.onclick=()=>{state.shopSub=null;state.mappe=null;state.shop.note='Diesmal niemand eingestellt.';Sfx.select();render()});
  root.querySelectorAll('[data-msell]').forEach(b=>b.onclick=()=>{const id=b.dataset.msell;if(state.sellArm!==id){state.sellArm=id;Sfx.select();render();return}state.sellArm=null;const p=SELLP[SPEC[id].tier]||10;fireSpec(id,false);state.money+=p;if(state.stats)state.stats.earned=(state.stats.earned||0)+p;Sfx.till();render()});
  root.querySelectorAll('[data-mfire]').forEach(b=>b.onclick=()=>{fireSpec(b.dataset.mfire,true);Sfx.till();render()});
  {const mr2=$('mMkRoll');if(mr2)mr2.onclick=()=>{const pr=marketRoll(),m=state.market;if(m.bought||!canPay(pr)){Sfx.deny();return}state.money-=pr;state.stats.spent+=pr;m.rolls++;m.items=rollMarket(3,m.items);Sfx.till();Sfx.shop();render()}}
  root.querySelectorAll('[data-shtab]').forEach(b=>b.onclick=()=>{if(b.disabled){Sfx.deny();return}META.shopT=b.dataset.shtab;saveMeta();Sfx.select();render()});
  root.querySelectorAll('[data-stab]').forEach(b=>b.onclick=()=>{state.shopTab=b.dataset.stab;if(state.market&&state.shopTab==='market')state.market.seen=true;Sfx.select();render()});
  root.querySelectorAll('[data-bhl]').forEach(b=>b.onclick=()=>{root.classList.add('peek');const el=$b().querySelector(`[data-bid="${b.dataset.bhl}"]`);if(el){el.parentNode.appendChild(el);el.style.setProperty('--s',1.6);el.classList.remove('pop','popbig','pulse');el.getBoundingClientRect();el.classList.add('popbig');if(typeof sparks==='function'){const B=state.buildings.find(x=>x.id===+b.dataset.bhl);if(B)sparks(centroid(B.cells),12)}}Sfx.select();setTimeout(()=>root.classList.remove('peek'),1700)});
  {const fi=$('mFsIntroOk');if(fi)fi.onclick=()=>{const r=runOf();if(r)r.fsIntro=0;modal=FSBACK||null;FSBACK=null;Sfx.select();saveMeta();render()}}{const fo=$('mFsOk');if(fo)fo.onclick=()=>{state.fsNew=[];Sfx.select();saveMeta();render()}}
  {const bo=$('mBornOk');if(bo)bo.onclick=()=>{state.z2bornSeen=true;Sfx.select();render()}}
  const mo=$('mMileOk');if(mo)mo.onclick=()=>{state.mileNew.shift();Sfx.select();render()};
  const dr=$('mDraftRoll');if(dr)dr.onclick=draftRoll;
  const bk=$('mBack');if(bk)bk.onclick=()=>{state.shopSub=null;state.rmArm=null;state.pendItem=null;render()};
  const rr=$('mReroll');if(rr)rr.onclick=()=>{const p=rerollPrice();if(!canPay(p)){Sfx.deny();return}state.money-=p;state.stats.spent+=p;state.shop.rerolls++;state.shop.items=genShopItems();state.shop.note=null;Sfx.draw();render()};
  const lv=$('mLeave');if(lv)lv.onclick=()=>{const sh=state.shop;if(sh&&!sh.warned&&!gRun()&&state.money>=50&&(sh.items||[]).some(it=>!it.sold&&(it.kind==='prog'||it.kind==='card')&&canPay(it.price))){sh.warned=1;sh.note=`🪙 Du hast noch ${state.money} Taler. Geld bringt keine Zinsen, nur was du kaufst, hilft deinem Zoo. Tippe nochmal, um weiterzugehen.`;Sfx.deny&&Sfx.deny();render();return}beginNextSeason()};
  const mr=$('mRules');if(mr)mr.onclick=()=>{helpOpen=!helpOpen;Sfx.select();renderModal()};
  const mrc=$('mRunCopy');if(mrc)mrc.onclick=()=>{try{copyTxt(runText(runOf()),mrc)}catch(e){}};
  const mea=$('mEndAnyway');if(mea)mea.onclick=()=>{modal=null;state.mwOk=true;renderModal();$('btnEnd').click()};
  const msd=$('mSeed');if(msd)msd.onclick=()=>{try{navigator.clipboard.writeText(runOf().seed);msd.textContent='Kopiert ✓'}catch(e){}};
  const cl=$('mClose');if(cl)cl.onclick=()=>{const gh=state&&gRun()?guideHint():null;if(gh&&gh.go)gRun().guide.seen[gh.id]=1;modal=null;renderAll()};
  const rs=$('mRestart');if(rs)rs.onclick=()=>{if(state&&gRun()){modal=null;guideEnd(false);return}if(state&&state.mode==='tut'){exitTut(false);return}modal='restart';render()};
  const ry=$('mRestartYes');if(ry)ry.onclick=()=>{state.phase='lost';finishGame()};
  root.querySelectorAll('[data-mute]').forEach(b=>b.onclick=()=>{Sfx.muted=b.dataset.mute==='1';try{localStorage.setItem('zoodeck-muted',Sfx.muted?'1':'0')}catch(e){}if(!Sfx.muted){Sfx.init();Sfx.select()}render()});
  root.querySelectorAll('[data-nbm]').forEach(b=>b.onclick=()=>{META.oldBoard=+b.dataset.nbm;saveMeta();Sfx.select();render()});
  root.querySelectorAll('[data-pwm]').forEach(b=>b.onclick=()=>{META.fxPow=b.dataset.pwm;saveMeta();Sfx.select();renderModal()});
  root.querySelectorAll('[data-fxm]').forEach(b=>b.onclick=()=>{META.fxOff=+b.dataset.fxm;saveMeta();Sfx.select();document.body.classList.toggle('fxp',fxOn());renderModal()});
  {const rb=$('mReset');if(rb)rb.onclick=()=>{Sfx.select();resetAsk(1)}}
  root.querySelectorAll('[data-fbm]').forEach(b=>b.onclick=()=>{META.fbOff=+b.dataset.fbm?1:0;saveMeta();Sfx.select();renderModal()});
  root.querySelectorAll('[data-vtm]').forEach(b=>b.onclick=()=>{META.testVerst=!!+b.dataset.vtm;saveMeta();Sfx.select();renderModal()});
  root.querySelectorAll('[data-scf]').forEach(b=>b.onclick=()=>{SCFAST=+b.dataset.scf;try{localStorage.setItem('zoodeck-fast',SCFAST)}catch(e){}Sfx.select();renderModal()});
  root.querySelectorAll('[data-pan]').forEach(b=>b.onclick=()=>{PANSPEED=+b.dataset.pan;try{localStorage.setItem('zoodeck-pan',PANSPEED)}catch(e){}Sfx.select();renderModal()});
  {const zb=root.querySelector('#zlBack');if(zb)zb.onclick=()=>{zlBack()}}
  {const zm=$('zlMap'),bd=$b();if(zm&&bd){mapCss();const sv=bd.cloneNode(true);sv.removeAttribute('id');sv.setAttribute('viewBox',VB.join(' '));sv.querySelectorAll('[id]').forEach(e=>{if(e.tagName!=='pattern')e.removeAttribute('id')});zm.appendChild(sv)}}
  {const pk=$('mPeek');if(pk)pk.onclick=()=>zlPeek()}
  {const fl=$('mFliv');if(fl)fl.onclick=()=>{state.fliv=true;Sfx.select();render()}}
  {const a=$('mTraits');if(a)a.onclick=()=>{modal='traits';Sfx.select();render()};{const nw=$('mNews');if(nw)nw.onclick=()=>{Sfx.select();showNews()}}document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{META.view=b.dataset.view;saveMeta();Sfx.select();applyView();render();setTimeout(()=>{try{railRender()}catch(e){}},0)});const z=$('mTrBack');if(z)z.onclick=()=>{modal='help';Sfx.select();render()}}const mt=$('mTut');if(mt)mt.onclick=()=>{tutIdx=0;modal='tut';render()};
  const tp=$('tPrev');if(tp)tp.onclick=()=>{tutIdx--;renderAll()};
  const tn=$('tNext');if(tn)tn.onclick=()=>{if(tutIdx>=tutSlides().length-1){modal=null;tutIdx=0}else tutIdx++;renderAll()};
  const nx=$('mNext');if(nx)nx.onclick=()=>{state.pendingSeason=true;nextDraft()};
  const fi=$('mFinish');if(fi)fi.onclick=finishGame;
  const ho=$('mHome');if(ho)ho.onclick=()=>{if(state&&state.mode==='tut'){exitTut(false);screen='title';renderAll();return}saveMeta();modal=null;screen='title';renderAll()}}

/* ---------- Speicher: drei Speicherplätze, Highscores, Verbesserungen ---------- */
const SAVE_KEY='zoodeck-save-v1';
let META={slots:[null,null,null],active:null,lastSlot:null,scores:[]},screen=null,screenArg={},saveT=0;
function loadMeta(){try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const m=JSON.parse(raw);if(m&&Array.isArray(m.slots)&&m.slots.length===3)META=Object.assign({scores:[],cscores:[]},m)}}catch(e){}
  // 0.73a: nur noch Zoolatro (2.0): alte Kampagnen-, Zoolatro-1- und Freies-Spiel-Stände verwerfen, Verbesserungen und Freischaltungen bleiben
  for(const sl of META.slots){if(!sl)continue;const rs=[sl.run,sl.runAlt].filter(r=>r&&r.z2);sl.run=rs[0]||null;sl.runAlt=rs[1]||null;sl.game=null}
  if(META.lastMode&&META.lastMode!=='camp')META.lastMode=null}
function saveMeta(){if(RESETTING)return;try{const sl=activeSlot();if(sl&&state&&state.mode!=='tut'){if(state.mode==='camp'){if(sl.run)sl.run.game=state}else sl.game=state;sl.last=Date.now()}localStorage.setItem(SAVE_KEY,JSON.stringify(META))}catch(e){}}
// 0.80a: „Alles zurücksetzen“ mit doppelter Abfrage (eigenes Fenster), danach nichts mehr speichern und neu laden
var RESETTING=false;
function resetAsk(step){let el=document.getElementById('resetPop');if(el)el.remove();if(!step)return;el=document.createElement('div');el.id='resetPop';el.className='wishpop bigpop';
  el.innerHTML=`<div class="wpc">${step===1?`<div class="wpi">🗑️</div><h3>Alles zurücksetzen?</h3><p class="wpr">Wirklich alles löschen? Spielstände, Highscores, Statistik, Freischaltungen und Einstellungen gehen verloren.</p><div class="shopbar"><button class="btn sub" data-rs="0">Abbrechen</button><button class="btn main" data-rs="2">Ja, weiter</button></div>`:`<div class="wpi">⚠️</div><h3>Letzte Sicherheitsfrage</h3><p class="wpr">Das lässt sich nicht rückgängig machen. Tippe auf „LÖSCHEN“, um wirklich alles zu löschen.</p><div class="shopbar"><button class="btn sub" data-rs="0">Abbrechen</button><button class="btn rsdel" data-rs="go">LÖSCHEN</button></div>`}</div>`;
  document.body.appendChild(el);el.querySelectorAll('[data-rs]').forEach(b=>b.onclick=()=>{const v=b.dataset.rs;try{Sfx.select()}catch(e){}if(v==='0')resetAsk(0);else if(v==='2')resetAsk(2);else resetAll()})}
function resetKeys(){const ks=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k===SAVE_KEY||/^zoodeck-/.test(k))ks.push(k)}}catch(e){}return ks}
function resetAll(){RESETTING=true;clearTimeout(saveT);try{resetKeys().forEach(k=>localStorage.removeItem(k))}catch(e){}try{location.reload()}catch(e){}}
function saveSoon(){clearTimeout(saveT);saveT=setTimeout(saveMeta,400)}
const activeSlot=()=>META.active!=null?META.slots[META.active]:null;
/* ---------- Zoolatro 2.0: Stufen, Regelbrecher, Zucht, Winter-Wahl, Herausforderungen ---------- */
const isZ2=()=>{try{const sl=activeSlot();return!!(sl&&sl.run&&sl.run.z2)}catch(e){return false}};
const stOf=()=>{try{const sl=activeSlot();return sl&&sl.run&&sl.run.z2?sl.run.stage||1:0}catch(e){return 0}};
// Godot-Vorbereitung 2b: Stufen stehen in daten/stufen.json; jede Stufe nennt eine Kennung, die hier und im Spiel abgefragt wird
const STUFEN_DATEN=/*@@DATEN:stufen@@*/null;
// 0.76a: eine Stufe kann mehrere Wirkungen haben. stAb(k): Wirkung k aus der höchsten schon erreichten Stufe (sonst null); stW(k,d): ihr Wert, sonst d.
// Saisonziele (ziel) multiplizieren sich über alle erreichten Stufen.
const stWirk=()=>{const s=stOf();return STUFEN_DATEN.stufen.filter(x=>x.nr<=s).flatMap(x=>x.wirkungen||[])};
const stAb=k=>{let w=null;for(const x of stWirk())if(x.kennung===k)w=x;return w},stW=(k,d)=>{const x=stAb(k);return x&&x.wert!=null?x.wert:d};
const stTF=()=>stWirk().filter(x=>x.kennung==='ziel').reduce((f,x)=>f*x.wert,1);
const STAGES=['',...STUFEN_DATEN.stufen.map(x=>x.text)];
const z2Of=sl=>{sl.z2=sl.z2||{};sl.z2.st=sl.z2.st||{};sl.z2.ch=sl.z2.ch||{};return sl.z2};
const stMax=(sl,d)=>Math.min(8,z2Of(sl).st[d]||1);
// Godot-Vorbereitung 2c: Herausforderungen stehen in daten/herausforderungen.json; Bedingungen hier in CHAL_WIRKUNG (Kennung = Schlüssel)
const CHAL_DATEN=/*@@DATEN:herausforderungen@@*/null;
const RBFREE=CHAL_DATEN.regelbrecher_frei.slice();
const gehOf=()=>state.buildings.filter(b=>CARDS[b.key].cat==='gehege');
const CHAL_WIRKUNG={ok:{
  zwei:x=>x.won&&gehOf().length>=6&&new Set(gehOf().map(b=>CARDS[b.key].hab)).size<=2,
  ohnegastro:x=>x.won&&x.z===2&&!state.buildings.some(b=>CARDS[b.key].cat==='essen'),
  koenig:x=>x.won&&state.zl&&state.zl.insp==='koenig',
  klein:x=>x.won&&state.buildings.length<=14,
  jung3:x=>(x.run.jtBorn||0)>=3,
  mio:()=>!!(state.stats.best&&state.stats.best.pts>=1e6),
  rein:()=>zlPurity(state.buildings,mkIndex(state.buildings)).n>=10,
  regel:x=>x.won&&(state.spec||[]).some(id=>SPEC[id]&&SPEC[id].rb),
  spar:x=>x.won&&state.money>=300,
  alle5:x=>x.won&&x.z>=CAMP_GOAL-1,
  vielseitig:x=>Object.values(z2Of(x.sl).st).filter(v=>v>=4).length>=3,
  gipfel:x=>Object.values(z2Of(x.sl).st).some(v=>v>=8)}};
const CHAL={};for(const d of CHAL_DATEN.herausforderungen){const C={};for(const p in d){if(p==='key')continue;C[p]=d[p];if(p==='ok'){C.ok=CHAL_WIRKUNG.ok[d.ok];if(!C.ok)throw new Error('Wirkung fehlt: ok '+d.ok)}}CHAL[d.key]=C}
const rbOpen=(sl,id)=>RBFREE.includes(id)||(!!sl&&Object.keys(CHAL).some(c=>CHAL[c].rb===id&&z2Of(sl).ch[c]));
const rbHow=id=>{const c=Object.keys(CHAL).find(c=>CHAL[c].rb===id);return c?`Herausforderung ${CHAL[c].icon} ${CHAL[c].name}`:'von Anfang an'};
// nach einem Zoo: höchstens ein Regelbrecher pro Lauf, mit 25 % als dritter Bewerber
function z2Rb(run,opts){if(!run||!run.z2||(run.spec||[]).some(id=>SPEC[id]&&SPEC[id].rb)||Math.random()>=.25)return;const sl=activeSlot(),av=Object.keys(SPEC).filter(id=>SPEC[id].rb&&rbOpen(sl,id)&&!opts.includes(id));if(av.length)opts[opts.length-1]=av[Math.floor(Math.random()*av.length)]}
// Zucht: zwei gleiche Gehege nebeneinander, eines mindestens Stufe II -> am Ende der Jahreszeit ein Jungtier (eins pro Art und Zoo, höchstens 3 im Deck)
function z2Breed(){state.z2born=[];const sl=activeSlot(),run=sl&&sl.run;if(!run||!run.z2||run.tut||state.mode!=='camp')return[];const idx=mkIndex(state.buildings),born=[];state.z2jt=state.z2jt||[];
  for(const b of state.buildings){const c=CARDS[b.key];if(c.cat!=='gehege'||c.jt||c.ms||state.z2jt.includes(b.key)||born.includes(b.key+'~j'))continue;
    if(cnt(run.deck,k=>CARDS[k]&&CARDS[k].jt)+born.length>=3)break;
    const mate=nbrs(b,idx).find(n=>n.key===b.key);if(!mate||Math.max(b.lvl||1,mate.lvl||1)<2||!CARDS[b.key+'~j'])continue;born.push(b.key+'~j')}
  for(const j of born){state.z2jt.push(CARDS[j].par);state.discard.push(j);run.deck.push(j);run.jtBorn=(run.jtBorn||0)+1}
  state.z2born=born;state.z2bornSeen=!born.length;state.z2bornSnd=0;return born}
// Stress-Felder: solange eine passende Karte gewählt ist, Felder im Umkreis von 2 um mögliche Störer bzw. Gestresste markieren (nur Reichweite, keine Bewertung)
function strzMarks(sc,idx){if(!sc||state.phase!=='play'||(TUTNOW&&!TUTTR))return'';const t=(c,x)=>(c.tags||[]).includes(x),food=c=>(c.cat==='essen'||c.cat==='attr')&&!ruhigC(c),vs=new Set(state.buildings.map(b=>b.key));
  const jOff=hasSpec('dompteur')||hasSpec('rb_jagd')||hasSpec('frieden'),tOff=vs.has('ruhezone')||hasSpec('rb_party')||hasSpec('ruhepol'),src=[];
  if(!jOff){if(t(sc,'beute'))src.push([c=>t(c,'raubtier'),'🦷']);if(t(sc,'raubtier'))src.push([c=>t(c,'beute'),'🦷'])}
  if(!tOff){if(t(sc,'scheu'))src.push([food,'🙈']);if(food(sc))src.push([c=>t(c,'scheu'),'🙈'])}
  if(!src.length)return'';const n=new Map(),ic=new Map(),bk=new Set(BOARD.map(([q,r])=>hk(q,r)));
  for(const b of state.buildings){if(b.id===state.moving)continue;const c=CARDS[b.key];for(const[f,i]of src){if(!f(c))continue;if((t(c,'scheu')||t(c,'beute'))&&!t(sc,'scheu')&&!t(sc,'beute')){let st0=0;try{st0=evalB(b,state.buildings,idx).st||0}catch(e){}if(st0>=1)continue}const seen=new Set();
    for(const[q,r]of b.cells)for(const[dq,dr]of DIRS)for(const[eq,er]of(i==='🙈'&&dkNow()==='dschungel'?[[0,0]]:[[0,0],...DIRS])){const k=hk(q+dq+eq,r+dr+er);if(seen.has(k)||!bk.has(k)||idx.has(k)||TERR.get(k)==='block')continue;seen.add(k);n.set(k,(n.get(k)||0)+1);ic.set(k,i)}}}
  let o='<defs><pattern id="szh" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><rect width="2.6" height="2.6" fill="#ff5a5f22"/><rect width=".8" height="2.6" fill="#ff5a5f77"/></pattern></defs>';
  for(const[k,v]of n){const[q,r]=k.split(',').map(Number),[x,y]=px(q,r);o+=`<polygon class="strz" points="${hexPts(x,y,SZ*.8)}" pointer-events="none"/><text class="strzi" x="${x+4.2}" y="${y-4.2}" pointer-events="none">${ic.get(k)}</text>`}return o}
const zooStress=bs=>{const idx=mkIndex(bs);let n=0;for(const b of bs){const c=CARDS[b.key];if(c&&(c.tags.includes('beute')||c.tags.includes('scheu')))n+=evalB(b,bs,idx).st||0}return n};
// ===== 0.86: Saison-Wünsche (Frühling bis Herbst, nur Belohnung, kein Malus; nicht im Tutorial) =====
const wNew=W=>state.buildings.filter(b=>!(W.ids0||[]).includes(b.id)),wGeh=b=>CARDS[b.key].cat==='gehege',wKinds=cat=>new Set(state.buildings.filter(b=>CARDS[b.key].cat===cat).map(b=>baseK(b.key))).size;
const wSchutzGrp=()=>{const bs=state.buildings.filter(b=>CARDS[b.key].cat==='schutz'),idx=mkIndex(bs),seen=new Set();let best=0;for(const b of bs){if(seen.has(b))continue;let n=0;const st=[b];seen.add(b);while(st.length){const x=st.pop();n++;for(const y of nbrs(x,idx))if(!seen.has(y)){seen.add(y);st.push(y)}}best=Math.max(best,n)}return best};
const wShowFull=()=>{const idx=mkIndex(state.buildings);return cnt(state.buildings,b=>wGeh(b)&&CARDS[b.key].tags.includes('show')&&cnt(nbrs(b,idx),n=>isCat(n,'essen')||isCat(n,'attr'))>=2)};
const wCalmN=()=>cnt(state.buildings,b=>wGeh(b)&&(CARDS[b.key].tags.includes('beute')||CARDS[b.key].tags.includes('scheu')));
const WISH={
  hab2:{hab:1,ic:W=>HAB[W.h].icon,t:W=>`Baue 2 ${HABADJ[W.h]}-Gehege`,need:2,n:W=>cnt(wNew(W),b=>wGeh(b)&&CARDS[b.key].hab===W.h),rw:['tal',15]},
  big4:{se:[1,2],ic:()=>'🐘',t:()=>'Baue ein Gehege mit 4 Feldern',need:1,n:W=>cnt(wNew(W),b=>wGeh(b)&&b.cells.length>=4),rw:['tal',15]},
  gastro3:{ic:()=>'🍦',t:()=>'3 verschiedene Gastro-Gebäude im Zoo',need:3,n:()=>wKinds('essen'),rw:['rd',1]},
  lvl3:{se:[1,2],ic:()=>'⭐',t:()=>'Ein Gehege oder Gebäude auf Stufe III',need:1,n:()=>cnt(state.buildings,b=>(b.lvl||1)>=3),rw:['gold',1]},
  rote2:{ic:()=>'🔴',t:()=>'2 verschiedene bedrohte Arten im Zoo',need:2,n:()=>new Set(state.buildings.filter(b=>wGeh(b)&&CARDS[b.key].tags.includes('bedroht')).map(b=>spK(baseK(b.key)))).size,rw:['tal',20]},
  small4:{ic:()=>'🐭',t:()=>'4 Gehege mit nur 1 Feld im Zoo',need:4,n:()=>cnt(state.buildings,b=>wGeh(b)&&b.cells.length===1),rw:['bp',1]},
  schutz3:{ic:()=>'🌳',t:()=>'3 Naturschutz-Gebäude, die zusammenhängen',need:3,n:()=>wSchutzGrp(),rw:['star',1]},
  show:{ic:()=>'🎭',t:()=>'Ein Showtier mit vollem Show-Bonus (2 Gastro-Gebäude oder Attraktionen daneben)',need:1,n:()=>wShowFull(),rw:['tal',15]},
  arten5:{se:[0],ic:()=>'🦓',t:()=>'5 verschiedene Tierarten im Zoo',need:5,n:()=>new Set(state.buildings.filter(wGeh).map(b=>spK(baseK(b.key)))).size,rw:['rd',1]},
  day4:{se:[1,2],ic:()=>'🏗️',t:()=>'Baue an einem Tag 4 Karten',need:4,n:W=>Math.max(W.best||0,state.builtToday||0),rw:['rd',1]},
  calm:{se:[1,2],end:1,ic:()=>'😌',t:()=>'Beende die Jahreszeit mit mindestens 3 Beute- oder scheuen Tieren, keins davon gestresst',need:1,n:()=>wCalmN()>=3&&!zooStress(state.buildings)?1:0,rw:['bp',1]},
  early:{se:[1,2],end:1,ic:()=>'⏱️',t:()=>'Schaffe das Saisonziel mindestens 2 Tage früher',need:1,n:W=>W.early?1:0,rw:['tal',25]}};
const wRwTxt=r=>r[0]==='tal'?`+${r[1]} Taler`:r[0]==='rd'?'1 Gratis-Neuziehen':r[0]==='bp'?'+1 Baupunkt am nächsten Spieltag':r[0]==='gold'?'eine Karte deines Decks wird 🪙 Gold (×1,2 B)':'eine Karte deines Decks wird ⭐ Star (×1,25)';
const wishOn=()=>{try{const r=runOf();return!!(state&&state.zl&&state.mode==='camp'&&r&&r.zl&&!r.tut&&state.season<3&&!stAb('keine_wuensche'))}catch(e){return false}};
function wishRoll(){if(!wishOn()){state.wish=null;return}if(state.wish&&state.wish.s===state.season&&state.wish.z===(state.zoo||0))return;const run=runOf(),seen=run?(run.wishSeen=run.wishSeen||[]):(state.wishSeen=state.wishSeen||[]);
  const f=()=>{const H=habsNow(),ids=Object.keys(WISH).filter(id=>{const D=WISH[id];if(D.se&&!D.se.includes(state.season))return false;if(seen.includes(id))return false;return true});const sh=shuffle(ids);
    for(const id of sh){const D=WISH[id],W={id,s:state.season,z:state.zoo||0,ids0:state.buildings.map(b=>b.id)};if(D.hab)W.h=H[Math.floor(Math.random()*H.length)];if(!D.end&&D.n(W)>=D.need)continue;return W}return null};
  let W=run&&run.seed?withSeed(run.seed+'|w|'+(state.zoo||0)+'|'+state.season+'|'+(run.stage||1),f):f();if(!W&&seen.length){seen.length=0;W=f()}state.wish=W;if(W){seen.push(W.id);if(!(run&&run.tut))state.wishIntro=1}}
function wishGive(r){if(r[0]==='tal'){state.money+=r[1];state.stats.earned+=r[1]}else if(r[0]==='rd')state.rdBonus=(state.rdBonus||0)+r[1];else if(r[0]==='bp'){state.bpWish=(state.bpWish||0)+r[1];state.bpWhy=(state.bpWhy||[]).concat('🌟 Besucherwunsch')}
  else{const piles=['deck','discard'],ok=k=>{const c=CARDS[k];return c&&c.cat!=='verst'&&!String(k).includes('~')&&!String(k).includes('^')&&!c.ms};let L=[];for(const p of piles)state[p].forEach((k,i)=>{if(ok(k))L.push([p,i,k])});const G=L.filter(x=>CARDS[x[2]].cat==='gehege');if(G.length)L=G;
    if(!L.length){state.money+=15;return'+15 Taler (keine passende Karte im Deck)'}const[p,i,k]=L[Math.floor(Math.random()*L.length)],nk=r[0]==='gold'?k+'~g':prKey(k,'star');state[p][i]=nk;return`${CARDS[nk].name} ist jetzt ${r[0]==='gold'?'🪙 Gold':'⭐ Star'}`}return wRwTxt(r)}
// am Tagesende (vor dem nächsten Tag) und zum Saisonende prüfen
function wishEval(seasonEnd,left){const W=state.wish;if(!W||W.ok||!wishOn()&&!seasonEnd)return;const D=WISH[W.id];if(!D)return;W.best=Math.max(W.best||0,state.builtToday||0);if(seasonEnd&&W.id==='early')W.early=left>=2?1:0;
  if(D.end&&!seasonEnd)return;if(D.n(W)>=D.need){W.ok=1;let txt=wishGive(D.rw);if(hasSpec('wunsch'))txt+=' · 🎈 doppelt: '+wishGive(D.rw);W.got=txt;state.wishFx=1;try{Sfx.win();Sfx.sparkle()}catch(e){}}}
const wishBadge=()=>{const W=state.wish;if(!W||!WISH[W.id])return'';const D=WISH[W.id],n=Math.min(D.need,D.n(W));return`<button class="evb wbb ${W.ok?'ok':''} ${W.seen?'':'new'}" data-ev="wish" title="Besucherwunsch: ${D.t(W)}">🌟 ${W.ok?'✓':D.end?'…':n+'/'+D.need}</button>`};
const wishChip=()=>{const W=state.wish;if(!W||!WISH[W.id])return'';const D=WISH[W.id],n=Math.min(D.need,D.n(W));return`<button class="evb wsh ${W.ok?'ok':''} ${W.seen?'':'new'}" data-ev="wish" aria-label="Besucherwunsch">${D.ic(W)} ${W.ok?'✓':D.end?'…':n+'/'+D.need}</button>`};
const wishInfoHtml=()=>{const W=state.wish;if(!W||!WISH[W.id])return`<h3>🌟 Besucherwunsch</h3><p class="hint">In dieser Jahreszeit gibt es keinen Wunsch.</p>`;const D=WISH[W.id],n=Math.min(D.need,D.n(W));
  return`<h3>🌟 Besucherwunsch im ${seOf(state.season).name}</h3><p style="font-size:14px;margin:0"><b>${D.ic(W)} ${D.t(W)}</b></p><p class="hint">Belohnung: <b style="color:var(--gold)">${wRwTxt(D.rw)}</b>${D.end?' · wird am Ende der Jahreszeit geprüft':' · wird am Ende des Tages geprüft'}</p>${W.ok?`<p class="resgood">✓ Erfüllt! ${W.got||''}</p>`:D.end?'':`<p class="hint">Stand: <b>${n} von ${D.need}</b>. Kein Muss: Wer ihn nicht erfüllt, verliert nichts.</p>`}`};
// Erstmal-Hinweise: je Spielstand einmal, wenn etwas zum ersten Mal passiert (nicht im Tutorial)
const HINTS=[
 ['wish','🌟','Besucherwünsche','In Frühling, Sommer und Herbst wünschen sich die Besucher etwas. Erfüllst du den Wunsch, gibt es eine Belohnung, sonst passiert nichts. Tippe oben auf das Wunsch-Symbol für Details.',()=>!!state.wish&&state.phase==='play'],
 ['rule','📜','Auflage',()=>{const R=RULES[state.rule.id];return`Jeder Zoo hat eine <b>Bau-Auflage</b>, sie gilt für den ganzen Zoo. Diesmal: ${R.icon} <b>${R.name}</b>. Was sie genau verlangt, steht oben links unter „Zoo ${(state.zoo||0)+1} ▾“.`},()=>state.phase==='play'&&!!state.rule&&!!RULES[state.rule.id]&&!!RULES[state.rule.id].name],
 ['habr','🌍','Lebensraum-Regeln',X=>`Jeder Lebensraum hat eine eigene Regel. Für dieses Gehege gilt: ${HABRULE[X.sel.hab]} Alle Regeln findest du oben links unter „Zoo ${(state.zoo||0)+1} ▾“.`,X=>X.sel&&X.sel.cat==='gehege'&&!!HABRULE[X.sel.hab]&&habRulesOn()],
 ['jagd','🦷','Raubtier und Beute','Raubtiere stressen Beutetiere bis 2 Felder entfernt. Jedes gestresste Tier kostet den ganzen Zoo Natur (×0,95 je Tier). Die markierten Felder zeigen die Reichweite.',X=>X.sel&&(X.t(X.sel,'raubtier')||X.t(X.sel,'beute'))],
 ['scheu','🙈','Scheue Tiere','Gastro-Gebäude und Attraktionen bis 2 Felder entfernt stressen sie. Gebäude mit 🤫 Ruhig stören nicht.',X=>X.sel&&(X.t(X.sel,'scheu')||(X.food(X.sel)&&state.buildings.some(b=>X.t(CARDS[b.key],'scheu'))))],
 ['stress','😣','Gestresste Tiere','In der Abrechnung siehst du, wie viel Natur dich der Stress gerade kostet. Ein Tierarzt direkt daneben beruhigt ein Tier.',X=>!!X.cur&&(X.cur.mults||[]).some(m=>m.icon==='😣')],
 ['show','🎭','Showtiere','Showtiere lieben Publikum: Ein Gastro-Gebäude oder eine Attraktion daneben bringt ×1,25, zwei bringen ×1,5. 🎉 Trubel zählt doppelt, 🤫 Ruhig gar nicht.',X=>X.sel&&(X.t(X.sel,'show')||(X.food(X.sel)&&state.buildings.some(b=>X.t(CARDS[b.key],'show'))))],
 ['dead','⚠️','Achtung','Ein Gebäude zählt gerade nicht voll. Tippe es an, um zu sehen, warum.',()=>!!state.zl&&state.buildings.some(b=>['insp','half','prof'].includes(zlDead(b,state.buildings)))],
 ['winter','❄️','Der Winter','Der Winter ist die härteste Jahreszeit. Eine Bedingung gilt die ganze Jahreszeit, schau dir deinen Zoo vor der Wahl genau an.',()=>modal==='inspPick'],
 ['mile','🏅','Meilenstein','Sammelst du verschiedene Arten einer Gruppe, bekommst du besondere Karten. Im Deck-Fenster siehst du, was noch fehlt.',()=>(state.mileNew||[]).length>0],
 ['spec','👥','Spezialisten','Spezialisten bleiben für den ganzen Lauf in deinem Team. Manche wachsen mit der Zeit.',()=>(state.spec||[]).length>0],
 ['ed','✨','Veredelungen','Veredelungen machen ein einzelnes Gebäude dauerhaft stärker, auch über mehrere Zoos.',()=>state.hand.some(k=>CARDS[k]&&CARDS[k].ed)||state.buildings.some(b=>b.ed)],
 ['verst','🔆','Verstärker','Verstärker zählen selbst nicht, sie machen ihre Nachbarn stärker.',()=>state.hand.some(k=>CARDS[k]&&CARDS[k].cat==='verst')],
 ['zucht','💞','Zuchtpaar','Zwei gleiche Gehege nebeneinander, eines davon Stufe II, bekommen am Ende der Jahreszeit Nachwuchs.',()=>z2Marks()!==''],
 ['foerd','📣','Förderung','Mit Förderung bekommst du mehr B oder N. Schau mal rein! (Reiter 🎟️ Extras)',()=>foerdOk()],
 ['debt','🪙','Schulden','Im Minus kosten dich Zinsen Taler (1 je 10 Schulden), du kannst nichts kaufen und deine Spezialisten streiken. Plane die nächsten Tage etwas sparsamer.',()=>state.money<0]
].map(([id,ic,t,x,w])=>({id,ic,t,x,w}));
const TUTH=['jagd','scheu','show','zucht'],hintOk=(sl,id)=>!sl.run.tut; // 0.67a: im Tutorial erklärt Jasper alles selbst
function hintSlot(){try{const sl=activeSlot();return sl&&sl.run?sl:null}catch(e){return null}}
function hintHide(){const el=$('hintBox');if(el){el.className='';el.innerHTML=''}}
function hintCheck(cur){let el=$('hintBox');if(!el){el=document.createElement('div');el.id='hintBox';el.setAttribute('role','status');document.body.appendChild(el)}
  const sl=hintSlot();if(!state||!sl||META.noHints||screen||state.wishIntro||state.ruleIntro||state.surprise){hintHide();return}sl.hints=sl.hints||{};
  const X={sel:selKey()&&state.phase==='play'?CARDS[selKey()]:null,cur,t:(c,x)=>(c.tags||[]).includes(x),food:c=>(c.cat==='essen'||c.cat==='attr')&&!ruhigC(c)};
  let H=state.hintNow&&!sl.hints[state.hintNow]&&hintOk(sl,state.hintNow)?HINTS.find(h=>h.id===state.hintNow):null;
  if(!H)for(const h of HINTS){if(sl.hints[h.id]||!hintOk(sl,h.id))continue;let ok=false;try{ok=h.w(X)}catch(e){}if(ok){H=h;break}}
  if(!H){hintHide();return}if(modal&&H.id!=='winter'&&!(H.id==='foerd'&&modal==='shop')){hintHide();return} // Tipp wartet, bis das Fenster zu ist (verdeckte sonst Fenster-Knöpfe)
  const cls=modal?'on inmod':'on';if(state.hintNow!==H.id){state.hintNow=H.id;el.innerHTML=''}if(el.dataset.h===H.id&&el.className===cls)return;el.dataset.h=H.id;el.className=cls;
  el.innerHTML=`<div class="hic">${H.ic}</div><div class="htx"><b>${H.t}</b><span>${typeof H.x==='function'?H.x(X):H.x}</span><div class="hbt"><button class="btn main" id="hOk">Verstanden</button><button class="btn sub" id="hOff">Keine Hinweise mehr</button></div></div>`;
  const done=off=>{sl.hints[H.id]=1;if(off)META.noHints=1;state.hintNow=null;el.dataset.h='';Sfx.select();saveMeta();render()};$('hOk').onclick=()=>done(false);$('hOff').onclick=()=>done(true)}
// Zuchtpaare im Zoo (2.0): 💞 zwischen zwei gleichen benachbarten Gehegen, eines Stufe II, wenn noch Zucht möglich ist
function z2Marks(){const sl=activeSlot(),run=sl&&sl.run;if(!run||!run.z2||run.tut||state.mode!=='camp'||state.phase!=='play')return'';if(cnt(run.deck,k=>CARDS[k]&&CARDS[k].jt)>=3)return'';const idx=mkIndex(state.buildings),done=new Set(),jt=state.z2jt||[];let o='';
  const ctr=b=>{let x=0,y=0;for(const[q,r]of b.cells){const[a,c]=px(q,r);x+=a;y+=c}return[x/b.cells.length,y/b.cells.length]};
  for(const b of state.buildings){const c=CARDS[b.key];if(c.cat!=='gehege'||c.jt||c.ms||jt.includes(b.key)||done.has(b.key)||!CARDS[b.key+'~j'])continue;const m=nbrs(b,idx).find(n=>n.key===b.key&&Math.max(b.lvl||1,n.lvl||1)>=2);if(!m)continue;done.add(b.key);const[x1,y1]=ctr(b),[x2,y2]=ctr(m);o+=`<text class="z2pair" x="${(x1+x2)/2}" y="${(y1+y2)/2+2}" pointer-events="none">💞</text>`}return o}
// Punktebringer der Jahreszeit (Anteil an Besuchern + Natur), beste Kombo, bester Tag
function bestHtml(){const S=state.sc||{},L=Object.entries(S).filter(([id])=>state.buildings.some(b=>b.id===+id)&&CARDS[S[id].k]);if(!L.length)return'';const TA=L.reduce((t,[,e])=>t+e.a,0)||1,TS=L.reduce((t,[,e])=>t+e.s,0)||1;
  const top=L.slice().sort((x,y)=>(y[1].a/TA+y[1].s/TS)-(x[1].a/TA+x[1].s/TS)).slice(0,3),bc=L.slice().sort((x,y)=>y[1].p-x[1].p)[0],dp=state.dayPts||[],bd=dp.reduce((m,v,i)=>v>(dp[m]||0)?i:m,0);
  return`<div class="bestbox"><h3 class="sh" style="margin:0">🏆 Deine Punktebringer</h3>${top.map(([id,e],i)=>`<button class="bestrow" data-bhl="${id}"><span>${i+1}.</span><b>${CARDS[e.k].icon} ${CARDS[e.k].name}</b><i><span class="a">+${fmt(e.a)} B</span> <span class="s">+${fmt(e.s)} N</span></i></button>`).join('')}${bc&&bc[1].p>=2?`<button class="bestrow" data-bhl="${bc[0]}"><span>🎯</span><b>Beste Kombo: ${CARDS[bc[1].k].icon} ${CARDS[bc[1].k].name} ×${bc[1].p}</b><i>${(bc[1].src||[]).map(k=>CARDS[k]?CARDS[k].icon:'').join(' ')}</i></button>`:''}${dp.length?`<p style="margin:0;color:var(--muted);font-size:13px">📅 Bester Tag: Tag ${bd+1} mit ${fmt(dp[bd]||0)} Punkten · Antippen zeigt das Gebäude auf dem Spielfeld.</p>`:''}</div>`}
const bornHtml=()=>(state.z2born||[]).length?`<p class="resgood">🍼 Nachwuchs! ${state.z2born.map(k=>CARDS[k].icon+' '+CARDS[k].name).join(', ')} kommt in dein Lauf-Deck.</p>`:'';
// Winter-Wahl: zwei Bedingungen stehen fest, nach dem Herbst wählst du eine
function zlInspPick(id){const Z=state.zl;if(!Z||!(Z.inspOpts||[]).includes(id))return;Z.insp=id;Z.inspPicked=1;if(id==='hab')Z.inspHabs=habTop(state.buildings);syncCtx();modal='insp';render()}
const winterBox=(Z,box,peek,hid)=>{if(hid||inspHid())return box('zi2','❄️','Winter-Bedingung: noch unbekannt','Wird zu Beginn des Herbstes bekannt gegeben (❄️ Wetterbericht).');if(Z.inspOpts&&!Z.inspPicked)return box('zi2','❄️','Winter: '+Z.inspOpts.map(i=>INSP[i].name).join(' oder '),Z.inspOpts.map(i=>`<b>${inspIcon({insp:i})} ${INSP[i].name}:</b> ${inspText({...Z,insp:i})}`).join('<br>')+'<br><i class="g">Du wählst eine davon, wenn der Winter beginnt.</i>',Z.inspOpts.map(i=>INSP[i].name).join(' oder '));
  return box('zi2',inspIcon(Z),'Winter: '+INSP[Z.insp].name,inspText(Z)+(peek||''))};
// am Ende jedes Zoos: Stufe freischalten (Zoo 3 geschafft) und Herausforderungen prüfen
function z2After(sl,run,won){const z=state.zoo||0,Z2=z2Of(sl),d=run.deckId||'grund',st=run.stage||1;run.stNew=0;run.chNow=[];if(run.seed||run.d4)return;
  if(won&&z>=2&&st<8&&(Z2.st[d]||1)<=st){Z2.st[d]=st+1;run.stNew=st+1}
  const x={won,z,run,sl};for(const id in CHAL){if(Z2.ch[id])continue;let ok=false;try{ok=CHAL[id].ok(x)}catch(e){}if(ok){Z2.ch[id]=1;run.chNow.push(id)}}}
const z2NewsHtml=run=>(run.stNew?`<p style="margin:0;color:var(--gold);font-weight:700">🏔️ Stufe ${run.stNew} für ${DECKS[run.deckId||'grund'].icon} ${DECKS[run.deckId||'grund'].name} freigeschaltet!</p>`:'')+(run.chNow||[]).map(id=>{const C=CHAL[id];return`<p style="margin:0;color:var(--gold);font-weight:700">🎯 Herausforderung geschafft: ${C.icon} ${C.name}${C.rb?` · ⚡ Regelbrecher ${SPEC[C.rb].icon} ${SPEC[C.rb].name} freigeschaltet`:` · Titel „${C.title}“`}</p>`}).join('');
const cperkCount=sl=>Object.values(sl&&sl.cperks||{}).reduce((t,q)=>t+(q.a||0)+(q.s||0),0);
const perkCount=sl=>Object.values(sl&&sl.perks||{}).reduce((t,q)=>t+(q.a||0)+(q.s||0),0);
