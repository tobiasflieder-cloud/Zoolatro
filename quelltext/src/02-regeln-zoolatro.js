//@@ modul: 02-regeln-zoolatro
// ===== Zoolatro-Modus: Profile, Inspektionen, Veredelungen, wachsende Spezialisten =====
// Bilder-Liste: ART.card.<Kartenschlüssel> = Bilddatei. Solange nichts eingetragen ist, zeigt das Spiel das Emoji.
const ART={card:{},ui:{}};
const icOf=c=>ic(c);
const ic=c=>c&&ART.card[c.key]?`<img class="art" src="${ART.card[c.key]}" alt="">`:(c?c.icon:'');
const icSvg=(c,x,y,big)=>{const u=ART.card[c.key],r=big?7:5;return u?`<image class="art" href="${u}" x="${x-r}" y="${y-r}" width="${2*r}" height="${2*r}" pointer-events="none"/>`:`<text class="ic ${big?'big':''}" x="${x}" y="${y}">${c.icon}</text>`};
const mxs=v=>{if(+v===0)return'0';const t=String(+(+v).toFixed(2));return(t.includes('.')?t:t+'.0').replace('.',',')};
const cSize=c=>SHAPES[c.shape].cells.length;
const NOPROF='keins'; // 0.91: Profile gestrichen
// 0.93: eine Bedingung je Zoo; ab Zoo 3 verschärft (ht = Text der verschärften Fassung), ab Zoo 5 zusätzlich Winterziel ×1,1
// Godot-Vorbereitung 2b: Winter-Bedingungen stehen in daten/winter.json; Wirkungen hier in WINTER_WIRKUNG (Kennung = Schlüssel, keine = wirkt anderswo, z. B. Teamsitzung in syncCtx)
const WINTER_DATEN=/*@@DATEN:winter@@*/null;
const WINTER_WIRKUNG={fx:{keine:()=>null,
  essen:(b,c)=>c.cat==='essen'?{f:0}:null,
  attr:(b,c,nb,bs,Z)=>c.cat==='attr'?{f:0}:HARD(Z)&&c.cat==='gehege'&&nb.some(n=>isCat(n,'attr'))?{f:.9,l:'Attraktion daneben'}:null,
  nachbar:(b,c,nb,bs,Z)=>nb.length<(HARD(Z)?4:3)?{f:0}:null,
  klein:(b,c,nb,bs,Z)=>b.cells.length===1?{f:HARD(Z)?0:.5}:HARD(Z)&&b.cells.length===2?{f:.5}:null,
  markt:(b,c,nb,bs,Z)=>c.cat==='essen'?{f:1.5}:c.cat==='attr'?{f:0}:c.cat==='gehege'&&!nb.some(n=>isCat(n,'essen'))?{f:HARD(Z)?.7:.85,l:'kein Gastro daneben'}:null,
  zucht:(b,c,nb,bs,Z)=>c.cat!=='gehege'?null:c.tags.includes('bedroht')?{f:2}:{f:HARD(Z)?.5:.7},
  koenig:(b,c,nb,bs,Z)=>kingSet(bs).has(b)?{f:HARD(Z)?2:2.5}:{f:0},
  hab:(b,c,nb,bs,Z)=>c.cat==='gehege'&&(Z.inspHabs||habTop(bs)).includes(c.hab)?{f:HARD(Z)?0:.5}:null,
  schutzp:(b,c,nb,bs,Z)=>c.cat==='gehege'&&!nb.some(n=>isCat(n,'schutz'))?{f:HARD(Z)?.25:.5}:null,
  laerm:(b,c,nb,bs,Z)=>c.cat==='gehege'&&nb.some(n=>isCat(n,'attr')&&n.key!=='lehrpfad')?{fs:HARD(Z)?0:.5}:null,
  gross:(b,c,nb,bs,Z)=>c.cat==='gehege'&&b.cells.length<3&&(b.lvl||1)<2?{f:HARD(Z)?.5:.75}:null, // 0.81a: entschärft (×0,75, verschärft ×0,5), erst ab Zoo 3
  ruhe:(b,c)=>c.cat==='attr'||c.cat==='essen'?{f:0}:null,
  inventur:(b,c,nb,bs)=>c.cat!=='gehege'?null:topSet(bs,'inv').has(b)?null:{f:0},
  wenig:()=>({fa:.7,fs:1.2,l:'B ×0,7, N ×1,2'}),
  chaos:b=>typeof state!=='undefined'&&state&&state.chaosB===b.id?{f:0}:null,
  futter:(b,c,nb,bs)=>topSet(bs,'top10').has(b)?null:{f:0}},
  text:{hab:Z=>{const H=Z.inspHabs||(typeof state!=='undefined'&&state&&state.buildings?habTop(state.buildings):[]);return`Im Winter zählen die Gehege des Lebensraums, von dem du die meisten hast, nur zur Hälfte (Besucher und Natur). Es gilt der Stand zu Winterbeginn.`+(H.length?` ${Z.inspHabs?'Getroffen':'Stand jetzt'}: ${H.map(h=>HAB[h].icon+' '+HAB[h].label).join(' und ')}.`:'')}}};
const INSP={};for(const d of WINTER_DATEN.bedingungen){const I={};for(const p in d){if(p==='key')continue;const v=d[p];if(p==='fx'){I.fx=WINTER_WIRKUNG.fx[v];if(!I.fx)throw new Error('Wirkung fehlt: fx '+v)}else if(p==='text_wirkung')I.text=WINTER_WIRKUNG.text[v];else I[p]=v}INSP[d.key]=I}
// 0.93: Winter-Bedingung einmal je Zoo gegen 30 Taler tauschen (bis zum Winterbeginn)
const WSWAP=WINTER_DATEN.tausch_preis,canWSwap=()=>!!(state&&state.zl&&state.mode==='camp'&&!state.zl.inspOpts&&!state.zl.swapped&&(state.season<3||(state.season===3&&state.day===0&&!state.builtToday))&&state.phase!=='scoring'&&!inspHid()&&!(runOf()&&runOf().tut));
const wSwapBtn=()=>{try{if(!(state&&state.zl&&state.mode==='camp'&&!state.zl.inspOpts&&state.season>=2&&state.phase!=='scoring'&&!inspHid()&&!(runOf()&&runOf().tut)))return''}catch(e){return''}if(canWSwap()&&state.money>=WSWAP)return`<button class="btn sub" data-iswap="1" style="margin-top:8px">🔄 Andere Winter-Bedingung · 🪙 ${WSWAP} <small>(einmal je Zoo)</small></button>`;const why=state.zl.swapped?'schon getauscht (einmal je Zoo)':!canWSwap()?'nur bis zum ersten Bauen im Winter':`zu wenig Taler (${Math.max(0,state.money)}/${WSWAP})`;return`<button class="btn sub" disabled style="margin-top:8px">🔄 Andere Winter-Bedingung · ${why}</button>`};
function wSwap(){if(!canWSwap()||state.money<WSWAP){Sfx.deny();return}const Z=state.zl,L=shuffle(Object.keys(INSP).filter(k=>k!==Z.insp&&!(k==='zucht'&&!(state.zoo>0)||k==='futter'&&!((state.zoo||0)>=2)||k==='gross'&&(state.zoo||0)<2)));Z.insp=L[0];Z.swapped=1;if(Z.insp==='hab')Z.inspHab=shuffle(habsNow().slice())[0];state.money-=WSWAP;syncCtx();Sfx.till&&Sfx.till();render()}
const HARD=Z=>!!(Z&&Z.hard&&INSP[Z.insp]&&INSP[Z.insp].ht);
// Inventur/Futterknappheit: beste Gehege/Gebäude nach eigenem Wert (ohne Winter-Bedingung), je Liste zwischengespeichert
let TOPS=null;const topSet=(bs,kind)=>{if(TOPS&&TOPS.bs===bs&&TOPS.n===bs.length&&TOPS[kind])return TOPS[kind];if(!TOPS||TOPS.bs!==bs||TOPS.n!==bs.length)TOPS={bs,n:bs.length};
  const idx=mkIndex(bs),keep=CTX.ni;CTX.ni=true;let L;try{L=bs.map(b=>{const v=evalB(b,bs,idx);return{b,v:(v.a+v.s)*(1+(LVLW[b.lvl||1]||0))}})}finally{CTX.ni=keep}
  let set;if(kind==='inv'){set=new Set();const by={};for(const o of L){const c=CARDS[o.b.key];if(c.cat!=='gehege')continue;(by[c.hab]=by[c.hab]||[]).push(o)}for(const h in by)by[h].sort((x,y)=>y.v-x.v||x.b.id-y.b.id).slice(0,3).forEach(o=>set.add(o.b))}
  else set=new Set(L.filter(o=>!CARDS[o.b.key].ms).sort((x,y)=>y.v-x.v||x.b.id-y.b.id).slice(0,10).map(o=>o.b));TOPS[kind]=set;return set};
// Lebensraum mit den meisten Gehegen (bei Gleichstand alle gleichauf)
const habTop=bs=>{const n={};for(const b of bs){const c=CARDS[b.key];if(c&&c.cat==='gehege'&&c.hab)n[c.hab]=(n[c.hab]||0)+1}const m=Math.max(0,...Object.values(n));return m?Object.keys(n).filter(h=>n[h]===m):[]};
// Winter-Bedingung erst ab Herbst sichtbar (Frühling/Sommer verborgen, nicht im Tutorial)
// 0.81a: Winter-Bedingung je Gebäude ab dem Herbst sichtbar: Faktor (fa/fs) oder null
function winterHit(b,bs,idx){try{const Z=state&&state.zl;if(!Z||!Z.insp||!INSP[Z.insp]||Z.insp==='frei'||state.mode!=='camp'||(state.season||0)<2||inspHid())return null;
  const c=K(b),nb=nbrs(b,idx||mkIndex(bs));if(nb.some(n=>n.key==='winterquartier'))return null;if(CTX.dk==='polar'&&c.cat==='gehege'&&c.hab==='arktis')return null;
  const e=inspFx(b,c,nb,bs,Z);if(!e)return null;const fa=e.f!=null?e.f:e.fa!=null?e.fa:1,fs=e.f!=null?e.f:e.fs!=null?e.fs:1;if(fa===1&&fs===1)return null;
  return{fa,fs,t:fa===fs?'×'+mxs(fa):[fa!==1?'B ×'+mxs(fa):'',fs!==1?'N ×'+mxs(fs):''].filter(Boolean).join(' '),neg:Math.min(fa,fs)<1}}catch(e){return null}}
// Winter-Ansage: wie viele Gehege/Gebäude die Bedingung trifft
function winterHitTxt(){try{const bs=state.buildings,idx=mkIndex(bs),G={};for(const b of bs){const h=winterHit(b,bs,idx);if(!h)continue;(G[h.t]=G[h.t]||{h,L:[]}).L.push(b)}
  const L=Object.values(G).map(({h,L})=>{const n=L.length,w=L.every(b=>isCat(b,'gehege'))?'Gehege':'Gebäude',v=n===1?'zählt':'zählen',f=h.fa===h.fs?h.fa:null;
    return`${n} deiner ${w} ${v} ${f===0?'gar nicht':f!=null&&f<1?'nur '+h.t:h.t}`});
  return L.length?`<p class="winhit">❄️ ${INSP[state.zl.insp].name}: ${L.join(' · ')}.</p>`:`<p class="winhit ok">❄️ ${INSP[state.zl.insp].name}: Stand jetzt trifft es keins deiner Gebäude.</p>`}catch(e){return''}}
const inspHid=()=>{try{if(!state||!state.zl||state.mode!=='camp'||state.season>=2)return false;return true}catch(e){return false}};
const inspText=Z=>{const I=INSP[Z.insp],t=HARD(Z)?I.ht:I.text;return(typeof t==='function'?t(Z):t)+(HARD(Z)?' <b class="hardtag">verschärft ab Zoo 3</b>':'')+(Z&&Z.wplus?' <b class="hardtag">Winterziel ×1,1</b>':'')},inspIcon=Z=>INSP[Z.insp].icon||'❄️';
// Schneekönig: je Sorte das Gehege/Gebäude mit dem höchsten eigenen Wert (B + N, ohne Winter-Bedingung)
let KING=null;
function kingSet0(bs){const idx=mkIndex(bs),best={},keep=CTX.ni;CTX.ni=true;for(const b of bs){const c=CARDS[b.key],t=Object.keys(MILE).find(t=>MILE[t].f(c));if(!t)continue;const v=evalB(b,bs,idx),sc=(v.a+v.s)*(1+(LVLW[b.lvl||1]||0));if(!best[t]||sc>best[t].sc)best[t]={b,sc}}CTX.ni=keep;return new Set(Object.values(best).map(x=>x.b))}
// Schneekönig-Vergleich für die Anzeige: Sorte, bester der Sorte und Abstand
function kingCmp(b,bs){const idx=mkIndex(bs),keep=CTX.ni;CTX.ni=true;const sorte=c=>Object.keys(MILE).find(t=>MILE[t].f(c)),t=sorte(CARDS[b.key]);if(!t){CTX.ni=keep;return null}const val=x=>{const v=evalB(x,bs,idx),f=1+(LVLW[x.lvl||1]||0);return{a:Math.round(v.a*f),s:Math.round(v.s*f)}};let best=null;for(const x of bs){if(sorte(CARDS[x.key])!==t)continue;const v=val(x);if(!best||v.a+v.s>best.v.a+best.v.s)best={b:x,v}}const me=val(b);CTX.ni=keep;return{t,label:MILE[t].label,best:best.b,bv:best.v,me,king:best.b===b,gap:best.v.a+best.v.s-me.a-me.s}}
const kingSet=bs=>KING&&KING.bs===bs?KING.set:kingSet0(bs);
const EDS={g:{icon:'🪙',name:'Gold',text:'×1,2 B'},s:{icon:'✨',name:'Schimmernd',text:'zählt doppelt'},r:{icon:'🌈',name:'Regenbogen',text:'×1,2 B für den ganzen Zoo'}};
