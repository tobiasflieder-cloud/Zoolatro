//@@ modul: 09-speichern-lauf
function restoreGame(s){const ok=s&&Array.isArray(s.deck)&&Array.isArray(s.terr)&&s.buildings.every(b=>Array.isArray(b.cells)&&CARDS[b.key])&&[...s.hand,...s.deck,...s.discard].every(k=>CARDS[k]);
  if(!ok)return false;try{state=Object.assign(DEFAULTS(),s);setBoard(Array.isArray(s.board)&&s.board.length?s.board:hexDisc(5));state.board=BOARD;if(!MAPS[state.map])state.map='wiese';
    if(!Array.isArray(state.undo))state.undo=[];VIEWMAP=state.map||null;state.msg=null;state.moving=null;state.miles=state.miles||{};TERR=new Map(s.terr);ZOOM=null;computeView();
    state.progs=state.progs.filter(id=>PROGS[id]);state.ads=state.ads.filter(id=>ADS[id]);state.adsNext=state.adsNext.filter(id=>ADS[id]);
    if(state.phase==='scoring'||(state.phase==='draft'&&!state.picks)||(state.phase==='shop'&&!state.shop)||state.phase==='market')state.phase='play';
    syncCtx();return true}catch(e){console.warn('Spielstand verworfen',e);return false}}
const RUNPERK=5; // dauerhafte + Lauf-Verbesserungen zusammen
function mergePerks(a,b){const o={};for(const p of[a||{},b||{}])for(const k in p){const q=o[k]=o[k]||{};q.a=(q.a||0)+(p[k].a||0);q.s=(q.s||0)+(p[k].s||0)}return o}
function applyRun(run){const sl=activeSlot();applyPerks(mergePerks({},run.perks));UNLOCK=new Set(run.cards||[])}
const BONI2SPEC={artenschutz:'artenschuetzer',raubtierhaus:'dompteur',gastro:'gastro',freizeit:'animateur',baumeister:'bauleiterin'};
function migrateRun(run){if(run.v===2)return;const sp=[];for(const id in run.boni||{}){const t=BONI2SPEC[id]||('pfleger_'+id.split('_')[0]);if(SPEC[t]&&!sp.includes(t)&&sp.length<maxSpec())sp.push(t)}
  run.spec=sp;delete run.boni;run.deckId=run.deckId||'grund';run.added=run.added||[];run.deck=deckCards(run.deckId).concat(run.added);run.v=2;
  if(run.game){run.game.spec=sp.slice();run.game.boni={}}if(run.reward&&run.reward.step==='bonus'){run.reward.step='spec';run.reward.opts=null}}
const runKind=r=>r.z2?'z2':r.zl?'zl':'camp',normK=zl=>zl==='z2'?'z2':zl?'zl':'camp';
const runFor=(sl,zl)=>[sl.run,sl.runAlt].find(r=>r&&runKind(r)===normK(zl))||null;
function useRun(sl,zl){if(zl==null)return;const k=normK(zl);if(sl.run&&runKind(sl.run)!==k){const t=sl.run;sl.run=sl.runAlt||null;sl.runAlt=t}if(!sl.run&&sl.runAlt&&runKind(sl.runAlt)===k){sl.run=sl.runAlt;sl.runAlt=null}}
function enterCamp(i,fresh,deckId,zl,habs,prof,stage){META.active=i;META.lastSlot=i;META.lastMode='camp';const sl=META.slots[i];sl.last=Date.now();useRun(sl,zl);
  if(fresh||!sl.run)sl.run={v:2,t0:Date.now(),test:META.testVerst&&i!=='tut'?1:undefined,tut:i==='tut'||undefined,foodOff:META.foodOff&&i!=='tut'?1:undefined,zoo:0,perks:{},cards:[],spec:[],deckId:deckId||'grund',deck:deckCards(deckId||'grund',habs||null).concat(META.testVerst&&i!=='tut'?['futterkueche','besucherlotse']:[]),habs:habs||undefined,prof:prof||undefined,z2:zl==='z2'?1:undefined,stage:zl==='z2'?Math.max(1,Math.min(8,stage||1)):undefined,added:[],stats:newStats(),total:0,game:null,reward:null};
  if(zl&&!sl.run.zl){sl.run.zl=true;sl.run.grow={}}
  if(fresh&&PENDSEED&&i!=='tut'){sl.run.seed=PENDSEED;sl.run.test=1}PENDSEED=null;
  const run=sl.run;migrateRun(run);applyRun(run);if(fresh&&run.seed&&run.zl&&!run.plan)run.plan=rollPlan(run);if(fresh&&run.zl)try{fsPickRun(sl,run,true)}catch(e){console.warn(e)}
  if(run.reward){if(run.reward.step==='spec'&&!run.reward.opts)run.reward.opts=rollSpecs(3);state=null;if(run.reward.step!=='won'&&!(run.plan&&run.plan.zoo===run.zoo))run.plan=rollPlan(run);modal=null;screen='creward';screenArg=run.reward;saveMeta();renderAll();return}
  if(run.game&&restoreGame(run.game)){run.game=state;screen=null;modal=null;saveMeta();renderAll();return}
  startZoo()}
function startZoo(){const sl=activeSlot(),run=sl.run;if(run&&(run.spec||[]).includes('floss')&&!run.flossGot){run.flossGot=1;for(let i=0;i<6;i++)run.deck.push('flossteil')}mapRoll(run);const cf=cfOf(run),pl=run.plan&&run.plan.zoo===run.zoo&&Array.isArray(run.plan.cells)?run.plan:null,ev0=pl?pl.ev:(run.reward&&run.reward.ev);run.reward=null;run.plan=null;applyRun(run);modal=null;
  const zl0={prof:null,opts:null,fix:false,gold:[],crown:null,insp:null,ban:null,tv:false,tvNext:false,edq:{},grow:Object.fromEntries(Object.entries(run.grow||{}).filter(([k])=>!/^z_(wald|wasser|wueste|savanne|arktis|gebirge)$/.test(k)))};
  if(pl&&run.zl)Object.assign(zl0,{prof:pl.prof||run.prof||null,opts:pl.opts,gold:pl.gold,crown:pl.crown,insp:pl.insp||(pl.inspOpts&&pl.inspOpts[0]),inspOpts:undefined,inspHab:pl.inspHab,ban:null});
  if(run.zl)zl0.prof=run.prof||NOPROF;
  GENHABS=run.habs||null;const gm=run.tut&&run.zoo===0?{cells:hexDisc(5),terr:new Map(TUTMAP.terr)}:pl?{cells:pl.cells,terr:new Map(pl.terr)}:genMap(cf.map,Math.random,cf.rocks);GENHABS=null;newGame(cf.map,gm,{deck:run.deck,events:ev0,plan:!!pl,state:Object.assign({mode:'camp',money:10+(run.deckId==='oase'&&run.zl&&!run.tut?40:0),habs:run.habs||null,zoo:run.zoo,tmult:run.zl?ZLMULT(run.zoo):cf.mult,spec:(run.spec||[]).slice(),stats:run.stats||newStats()},run.zl?Object.assign({zl:zl0},pl?(pl.rule?{rule:pl.rule,infoProg:'rule'}:{}):!run.tut?{rule:{id:(SEEN=seenOf(run,run.zoo),ruleRoll())}}:{}):{})});SEEN={r:new Set(),i:new Set()};if(run.zl&&!run.tut)noteOffered(run);if(run.tut&&run.zoo===0){state.zl.prof=NOPROF;state.zl.insp='frei';state.zl.inspHab=null;state.zl.gold=TUTMAP.gold.slice();state.zl.crown=TUTMAP.crown;state.tgf=.4;state.tT=TUTT.slice();state.events=[];state.tut={ch:'zl',i:0};syncCtx();TUT.zl.steps[0].setup(state)}if((!run.zl||state.zl.prof)&&!run.tut)modal='zoo';saveMeta();renderAll()}
const UNLOCK_DECK=JSON.parse(JSON.stringify(PROFIL_DATEN.freischalten)); // Godot-Vorbereitung 2b: daten/profile.json
function cuOf(sl){if(!sl.cu){sl.ulv=ULV;const c=sl.ctype||{};sl.cu={wB:0,eB:0,aB:Math.round(c.attr||0),sN:Math.round(c.schutz||0),wald:0,day:0,sav:0,open:Object.keys(DECKS).filter(id=>DECKS[id].type&&(c[DECKS[id].type]||0)>=DECKGOAL)}}return sl.cu}
// ab 0.66: Decks sind erst offen, wenn sie freigeschaltet wurden (höchstens eine Freischaltung je geschafftem Zoo); alte Spielstände behalten, was schon offen war
const ULV=2,OLDGOAL={dschungel:7,oase:70000,steppe:20};
function ulMig(sl){const cu=sl.cu;if(!cu||sl.ulv===ULV)return;for(const id in UNLOCK_DECK){const U=UNLOCK_DECK[id];if(!cu.open.includes(id)&&(cu[U.k]||0)>=(OLDGOAL[id]||U.goal))cu.open.push(id)}sl.ulv=ULV}
const deckOpen=(sl,id)=>{if(!DECKS[id].type||DECKS[id].free)return true;const cu=cuOf(sl);ulMig(sl);return cu.open.includes(id)||!!(sl.fs&&sl.fs['d:'+id])};

// am Ende jedes Kampagnen-Zoos: Fortschritt der Freischalt-Aufgaben und Lauf-Statistik fortschreiben (nur neu gesetzte Gebäude, Ausbau zählt nicht)
function tallyUnlock(sl,run){const cu=cuOf(sl),before=Object.keys(DECKS).filter(id=>deckOpen(sl,id)),bs=state.buildings,n=f=>cnt(bs,b=>f(CARDS[b.key]));
  cu.wB+=n(c=>c.cat==='gehege'&&c.hab==='wasser');cu.arB=(cu.arB||0)+n(c=>c.cat==='gehege'&&c.hab==='arktis');if(cu.arB>=100&&!run.tut){sl.vu=sl.vu||{};sl.vu.winterquartier=sl.vu.winterquartier||'pending'}cu.eB+=n(c=>c.cat==='essen');
  const cs=state.stats.cards||{},sum=(cat,f)=>Object.keys(cs).reduce((t,k)=>t+(CARDS[k]&&CARDS[k].cat===cat?Math.max(0,cs[k][f]||0):0),0),A=sum('attr','a'),S=sum('schutz','s');
  cu.aB+=Math.max(0,Math.round(A-(run.snapA||0)));cu.sN+=Math.max(0,Math.round(S-(run.snapS||0)));run.snapA=A;run.snapS=S;
  cu.wald=Math.max(cu.wald,new Set(bs.filter(b=>{const c=CARDS[b.key];return c.cat==='gehege'&&c.hab==='wald'&&!c.ms}).map(b=>b.key)).size);
  if(state.stats.best)cu.day=Math.max(cu.day,state.stats.best.pts);
  run.sav=(run.sav||0)+n(c=>c.cat==='gehege'&&c.hab==='savanne');cu.sav=Math.max(cu.sav,run.sav);
  run.newNow=[];
  run.zooPts=(run.zooPts||[]).concat([state.totalScore]);run.miles=(run.miles||0)+Object.keys(state.miles||{}).length}
// Zoolatro-Start (0.91): 1. vier von sechs Lebensräumen (mit Seed), 2. Profil; Profile gibt es nicht mehr
function zlSetupHtml(){const a=screenArg,i=a.slot,sl=META.slots[i];
  return`<div class="bar2"><h2>🃏 Neuer Lauf · 1 von 2</h2><button class="btn sub" data-zsback="1">Zurück</button></div><p style="margin:0;color:var(--muted)">Wähle <b>3 Lebensräume</b>. Jeder hat eine eigene starke Regel. Nur deren Tiere kommen in dein Deck, ins Kartenangebot und als Naturflächen auf den Zooplan. Danach wählst du dein Profil.</p>
    <div class="seedbox"><b>🌱 Seed</b> <small>(Testlauf: gleiche Zoos, alle Spezialisten wählbar, zählt nicht für Fortschritt)</small><div class="seedrow"><input id="zsSeed" maxlength="16" placeholder="leer = normaler Lauf" value="${a.seed||''}" autocomplete="off"><button class="btn sub" data-zsseed="1">Übernehmen</button><button class="btn sub" data-zsseedr="1">🎲</button>${a.seed?'<button class="btn sub" data-zsseedx="1">✕</button>':''}</div>${a.seed?`<small style="color:var(--gold)">Seed <b>${a.seed}</b> aktiv.</small>`:''}</div>
    <div class="habpick">${Object.keys(HAB).map(h=>{const on=a.habs.includes(h),op=habOpen(sl,h);return`<button class="hp ${on?'on':''} ${op?'':'lk'}" data-zshab="${h}"><span class="hpi">${op?HAB[h].icon:'🔒'}</span><span>${HAB[h].label}</span><small class="hpc">${op?'📜 '+HABRN[h]:fsHowTxt('h:'+h)}</small>${op?`<small class="hpt">${trLine(trCount(habPool(h).filter(k=>!fsLocked(k,sl))))}</small>`:''}${on?'<small>✓</small>':''}</button>`}).join('')}</div>
    <div class="habrules">${a.habs.length?a.habs.map(h=>`<p>${HABRULE[h]}</p>`).join(''):'<p>Wähle drei Lebensräume, dann stehen hier ihre Regeln.</p>'}</div><p style="margin:0;text-align:center;font-size:12px;color:var(--muted)">🦷 Raubtiere · 🐇 Beute · 🎭 Showtiere · 🙈 Scheue (Anzahl der Gehege-Karten)</p><p style="margin:0;text-align:center;font-weight:700">${a.habs.length} von 3 gewählt</p>
    <div class="shopbar"><button class="btn sub" data-zsfood="1" title="Nur für Tests">🧺 Futter: ${META.foodOff?'aus':'an'}</button><button class="btn sub" data-zsrand="1">🎲 Zufällig</button><button class="btn main" data-zsnext="1" ${a.habs.length===3?'':'disabled'}>Weiter zum Profil</button></div>`}
// Verteilung der Eigenschaften: je Lebensraum (Pool ohne Meilensteine) und je Deck
const HABCHAR={wasser:'🌿 ruhig, wenig Stress',savanne:'🦷 viel Jagd',wald:'🙈 viele Scheue',wueste:'🦷 Jagd und Herden',arktis:'🦷 Jagd im Eis',gebirge:'🦷🙈 Jagd und viele Scheue'};
const trCount=ks=>{const o={raubtier:0,beute:0,show:0,scheu:0};for(const k of ks){const c=CARDS[k];if(!c||c.cat!=='gehege')continue;for(const t in o)if(c.tags.includes(t))o[t]++}return o};
const trLine=o=>`🦷${o.raubtier} 🐇${o.beute} 🎭${o.show} 🙈${o.scheu}`;
const habPool=h=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return c.cat==='gehege'&&c.hab===h&&!c.ms&&!c.gone&&!c.sig&&!k.includes('~')&&!k.includes('^')});
function deckStatHtml(cs){const g=cs.filter(k=>CARDS[k]&&CARDS[k].cat==='gehege'),hb={};for(const k of g)hb[CARDS[k].hab]=(hb[CARDS[k].hab]||0)+1;const o=trCount(g),tips=[];
  if(o.raubtier&&o.beute)tips.push('Raubtiere und Beute: auf Abstand achten');if(o.scheu>=3)tips.push('viele Scheue: ruhige Ecken einplanen');if(o.show>=3)tips.push('viele Showtiere: Gastro und Attraktionen daneben');
  return`<p class="dstat"><span>Lebensräume: ${Object.keys(HAB).filter(h=>hb[h]).map(h=>HAB[h].icon+' '+hb[h]).join(' · ')}</span><span>Eigenschaften: ${trLine(o)}</span><span>Spielt sich: ${tips.slice(0,2).join(', ')||'unkompliziert'}</span></p>`}
const deckFit=(prof,D)=>{const t=D.type;if(!t||!prof)return'';const good={aqua:['wasser'],safari:['savanne'],dschungel:['wald'],wuestenzoo:['wueste'],polar:['arktis'],alpen:['gebirge'],natur:['schutz'],freizeit:['attr','essen'],erlebnis:['attr','essen'],artenschutz:['schutz'],raub:[],gross:[],klein:[]},bad={aqua:[],natur:['attr'],freizeit:[],artenschutz:['attr']};return(good[prof]||[]).includes(t)?'<span class="tx ph g">✓ passt zu deinem Profil</span>':(bad[prof]||[]).includes(t)?'<span class="tx ph w">⚠️ beißt sich mit deinem Profil</span>':''};
const LEXFACT={"flamingos": "Flamingos sind rosa, weil sie kleine Krebse mit rosa Farbstoff fressen.", "schildkroeten": "Manche Schildkröten werden über 100 Jahre alt.", "seeloewen": "Seelöwen können mit ihren Vorderflossen an Land richtig laufen.", "otter": "Otter können beim Tauchen Ohren und Nase verschließen.", "nilpferde": "Flusspferde sind mit den Walen verwandt.", "krokodile": "Krokodile können nicht schwitzen. Sie kühlen sich mit weit offenem Maul ab.", "schwan": "Schwäne bleiben oft ein Leben lang mit demselben Partner zusammen.", "korallenriff": "Korallen sind Tiere, keine Pflanzen.", "kraken": "Ein Krake hat drei Herzen und blaues Blut.", "giraffen": "Giraffen haben genauso viele Halswirbel wie wir Menschen: sieben.", "zebras": "Jedes Zebra hat sein eigenes Streifenmuster, wie ein Fingerabdruck.", "warzenschweine": "Warzenschweine knien sich zum Fressen auf ihre Vorderbeine.", "geparden": "Geparden sind die schnellsten Landtiere, im Sprint rund 100 km/h schnell.", "elefanten": "Elefanten erkennen sich selbst im Spiegel.", "loewen": "Löwen sind die einzigen Katzen, die in Rudeln leben.", "nashoerner": "Das Horn eines Nashorns besteht aus Keratin, wie unsere Fingernägel.", "bueffel": "Büffel verteidigen sich gemeinsam als Herde, sogar gegen Löwen.", "antilopen": "Manche Antilopen springen vor Freude senkrecht in die Luft.", "affen": "Viele Affen putzen sich gegenseitig das Fell, das stärkt die Freundschaft.", "pandas": "Große Pandas fressen bis zu 14 Stunden am Tag Bambus.", "tiger": "Tiger schwimmen gern und gut.", "faultiere": "Faultiere sind so langsam, dass Algen in ihrem Fell wachsen.", "woelfe": "Wölfe heulen, um ihr Rudel zu finden und ihr Revier zu zeigen.", "gorillas": "Gorillas bauen sich jeden Abend ein neues Schlafnest.", "koalas": "Koalas schlafen bis zu 20 Stunden am Tag.", "eulen": "Eulen können ihren Kopf um etwa 270 Grad drehen.", "papageien": "Manche Papageien können Dutzende Wörter nachsprechen.", "reptilien": "Reptilien wärmen sich in der Sonne auf, weil sie keine eigene Körperwärme erzeugen.", "addax": "Mendesantilopen kommen monatelang ohne Trinken aus, das Wasser holen sie sich aus Pflanzen. In freier Natur leben nur noch sehr wenige.", "erdmaennchen": "Lamas spucken, wenn sie sich ärgern, meistens aber auf andere Lamas.", "kamele": "Im Höcker speichert ein Kamel Fett, kein Wasser.", "fennek": "Fenneks haben riesige Ohren, über die sie Wärme abgeben.", "skorpione": "Skorpione leuchten unter UV-Licht.", "kaengurus": "Ein neugeborenes Känguru ist kaum größer als eine Bohne.", "schlangen": "Schlangen riechen mit ihrer Zunge.", "wuestenigel": "Igel rollen sich bei Gefahr zu einer Stachelkugel zusammen.", "dingos": "Dingos heulen wie Wölfe, bellen aber kaum.", "pinguine": "Kaiserpinguine können über 500 Meter tief tauchen.", "eisbaeren": "Unter dem weißen Fell ist die Haut eines Eisbären schwarz.", "polarfuchs": "Polarfüchse wechseln die Fellfarbe: im Winter weiß, im Sommer braun.", "schneehasen": "Schneehasen haben breite Pfoten, die wie Schneeschuhe wirken.", "moschusochsen": "Bei Gefahr bilden Moschusochsen einen Kreis, die Jungen stehen in der Mitte.", "rentiere": "Bei Rentieren tragen auch die Weibchen ein Geweih.", "belugas": "Belugas heißen auch Kanarienvögel des Meeres, weil sie so viele Laute machen.", "schneegaense": "Schneegänse fliegen jedes Jahr Tausende Kilometer in ihr Winterquartier.", "lemminge": "Dass Lemminge von Klippen springen, ist ein Mythos.", "schneeleoparden": "Schneeleoparden wickeln sich zum Wärmen in ihren langen Schwanz.", "steinboecke": "Steinböcke klettern sogar an fast senkrechten Staumauern.", "murmeltiere": "Murmeltiere pfeifen laut, um ihre Familie vor Gefahr zu warnen.", "mufflons": "Mufflons sind Wildschafe und Vorfahren unserer Hausschafe.", "yaks": "Yaks haben so dichtes Fell, dass ihnen Kälte bis −40 °C nichts ausmacht.", "braunbaeren": "Braunbären fressen sich vor der Winterruhe dicke Fettreserven an.", "luchse": "Luchse haben lange Haarpinsel an den Ohren.", "rotepandas": "Der Rote Panda trug den Namen Panda zuerst, lange vor dem Großen Panda.", "pfeifhasen": "Pfeifhasen sammeln im Sommer Heu als Vorrat für den Winter."};
// Statistik und Tierlexikon je Spielstand (zählt ab 0.66); am Ende jedes Zoos (statZoo) und jedes Laufs (statRun)
const statOf=sl=>sl.stat=sl.stat||{runs:0,zoos:0,bestRun:0,streak:0,cur:0,bestZoo:0,win:{},built:{},spec:{},prof:{},geh:0,jt:0,rb:{}};
const lexKeys=h=>Object.keys(CARDS).filter(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab===h&&!CARDS[k].ms&&!CARDS[k].gone&&!CARDS[k].sig);
function lexBase(k){let b=String(k).split('^')[0];const c=CARDS[b];if(!c)return null;if(c.par)return{k:c.par,jt:1};return{k:c.base||b,jt:0}}
function statZoo(sl,run,won){if(!sl||!run||run.tut||run.test)return;const S=statOf(sl),L=sl.lex=sl.lex||{},z=(state.zoo||0)+1;
  for(const b of state.buildings){const c=CARDS[b.key],B=lexBase(b.key);if(!c||!B)continue;S.built[B.k]=(S.built[B.k]||0)+1;const P=CARDS[B.k];
    if(P&&P.cat==='gehege'&&P.hab&&!P.ms){S.geh++;if(B.jt)S.jt++;const e=L[B.k]=L[B.k]||{n:0,z:0};e.n++;e.z=Math.max(e.z,z);if((b.lvl||1)>=3)e.l3=1;if(B.jt)e.jt=1;if(b.ed||c.ed)e.ed=1}}
  if(state.season===3&&state.zl&&state.zl.insp){const w=S.win[state.zl.insp]=S.win[state.zl.insp]||[0,0];w[1]++;if(won)w[0]++}
  if(won){S.zoos++;S.bestZoo=Math.max(S.bestZoo,state.totalScore||0)}}
function statRun(sl,run){if(!sl||!run||run.tut||run.test)return;const S=statOf(sl);S.runs++;S.bestRun=Math.max(S.bestRun,run.zoo||0);if((run.zoo||0)>=1){S.cur++;S.streak=Math.max(S.streak,S.cur)}else S.cur=0;
  for(const id of run.spec||[]){if(!SPEC[id])continue;S.spec[id]=(S.spec[id]||0)+1;if(SPEC[id].rb)S.rb[id]=1}}
const slotPick=()=>{const ids=META.slots.map((x,i)=>x?i:null).filter(i=>i!=null),pick=screenArg.ps!=null&&META.slots[screenArg.ps]?screenArg.ps:META.lastSlot,id=pick!=null&&pick!=='tut'&&META.slots[pick]?pick:ids.length?ids[0]:null;
  return{id,sl:id!=null?META.slots[id]:null,sel:ids.length>1?`<div class="chips pslots">${ids.map(i=>`<button class="chip2 ${i===id?'on':''}" data-pslot="${i}">${esc(META.slots[i].name)}</button>`).join('')}</div>`:''}};
function statHtml(){const{sl,sel}=slotPick(),back='<div class="bar2"><h2>📊 Statistik</h2><button class="btn sub" data-go="title">Zurück</button></div>'+sel;
  if(!sl)return back+'<p class="empty-note">Lege zuerst einen Spielstand an und spiele einen Lauf.</p>';const S=statOf(sl),cu=cuOf(sl),top=(o,n)=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,n);
  const box=(k,v,d='')=>`<div class="sumbox"><span class="k">${k}</span><span class="v">${v}</span>${d?`<span class="d">${d}</span>`:''}</div>`,tb=top(S.built,5).filter(([k])=>CARDS[k]),fs=top(S.spec,1)[0];
  const rh=(META.runHist||[]).length?`<button class="btn sub" data-runcopy="3" style="align-self:center">📋 Letzte ${(META.runHist||[]).length} Läufe kopieren</button>`:'';
  return back+rh+`<p style="margin:0;color:var(--muted)">Spielstand <b style="color:var(--text)">${esc(sl.name)}</b> · gezählt ab Version 0.66</p>
    <div class="sumgrid">${box('Läufe',S.runs)}${box('Zoos geschafft',S.zoos)}${box('Bester Lauf',S.bestRun+' Zoo'+(S.bestRun===1?'':'s'))}${box('Längste Serie',S.streak,'Läufe mit mindestens 1 Zoo')}${box('Bester Tag',fmt(cu.day||0),'Punkte')}${box('Bester Zoo',fmt(S.bestZoo),'Punkte')}${box('Gehege gebaut',fmt(S.geh))}${box('Jungtiere',S.jt)}</div>
    <h3 class="sh">❄️ Winter je Bedingung</h3>${Object.keys(S.win).length?`<div style="display:flex;flex-direction:column;gap:5px">${Object.entries(S.win).filter(([id])=>INSP[id]).sort((a,b)=>b[1][1]-a[1][1]).map(([id,w])=>`<div class="prow ok"><span class="pic">${INSP[id].icon||'❄️'}</span><div class="pin"><b>${INSP[id].name}: ${w[0]} von ${w[1]} geschafft</b><div class="dprog"><i style="width:${Math.round(w[0]/Math.max(1,w[1])*100)}%"></i></div></div></div>`).join('')}</div>`:'<p style="margin:0;color:var(--muted)">Noch keinen Winter erlebt.</p>'}
    <h3 class="sh">🏗️ Meistgebaut</h3>${tb.length?`<div class="toplist">${tb.map(([k,n],i)=>`<div><span class="rk">${i+1}.</span><span class="nm">${CARDS[k].icon} ${CARDS[k].name}</span><b>${n}×</b></div>`).join('')}</div>`:'<p style="margin:0;color:var(--muted)">Noch nichts gebaut.</p>'}
    <h3 class="sh">❤️ Lieblinge</h3><div class="slotrow"><span>Spezialist: ${fs&&SPEC[fs[0]]?SPEC[fs[0]].icon+' '+SPEC[fs[0]].name+' ('+fs[1]+'×)':'–'}</span><span>Regelbrecher gesehen: ${Object.keys(S.rb).filter(id=>SPEC[id]).map(id=>SPEC[id].icon).join(' ')||'–'}</span></div>`}
function lexHtml(){const{sl,sel}=slotPick(),back='<div class="bar2"><h2>🦒 Tierlexikon</h2><button class="btn sub" data-go="title">Zurück</button></div>'+sel;
  if(!sl)return back+'<p class="empty-note">Lege zuerst einen Spielstand an und spiele einen Lauf.</p>';const L=sl.lex||{},all=Object.keys(HAB).flatMap(lexKeys),got=all.filter(k=>L[k]).length,med=k=>{const e=L[k];return e?1+!!e.l3+!!e.jt+!!e.ed:0},mt=all.reduce((t,k)=>t+med(k),0);
  const card=k=>{const c=CARDS[k],e=L[k];if(!e)return`<div class="lexc un"><span class="lhx" style="background:${c.hab?HAB[c.hab].col:colOf(c)}"><span class="li">${c.icon}</span></span><b>???</b><span class="lf">Noch nicht gebaut</span></div>`;
    return`<div class="lexc"><span class="li">${c.icon}</span><b>${c.name}</b><span><span style="color:#ffb35c">${c.a} B</span> · <span style="color:#3fd6c4">${c.s} N</span>${c.tags.filter(t=>TRAITNAME[t]).map(t=>' · '+TRAITNAME[t]).join('')}</span><span class="lf">${e.n}× gebaut · bis Zoo ${e.z}</span><span class="lb"><span class="on" title="gebaut">🏗️</span><span class="${e.l3?'on':''}" title="Stufe III">⭐</span><span class="${e.jt?'on':''}" title="Jungtier (2.0)">🍼</span><span class="${e.ed?'on':''}" title="veredelt">✨</span></span><span class="lf">${LEXFACT[k]||''}</span></div>`};
  return back+`<p style="margin:0;color:var(--muted)">Spielstand <b style="color:var(--text)">${esc(sl.name)}</b> · <b style="color:var(--gold)">${got} von ${all.length}</b> Arten · 🏅 ${mt} von ${all.length*4} Abzeichen</p><p style="margin:0;color:var(--muted);font-size:12.5px">Abzeichen je Art: 🏗️ gebaut · ⭐ Stufe III · 🍼 Jungtier · ✨ veredelt. Eingetragen wird am Ende jedes Zoos.</p>
    ${(()=>{const F=sl.friends||{},n=FRIENDS.filter(p=>F[p.join('+')]).length;return`<h3 class="sh lexh">🤝 Geheime Freundschaften · ${n} von ${FRIENDS.length}</h3><p style="margin:0;color:var(--muted);font-size:12.5px">Manche Tiere vertragen sich nebeneinander besonders gut (beide ×1,25). Welche, findest du beim Bauen heraus.</p><div class="chips">${FRIENDS.map(p=>F[p.join('+')]?`<span class="chip2 on">${CARDS[p[0]].icon} ${CARDS[p[0]].name} + ${CARDS[p[1]].icon} ${CARDS[p[1]].name}</span>`:'<span class="chip2">❔ + ❔</span>').join('')}</div>`})()}
    ${Object.keys(HAB).map(h=>{const ks=lexKeys(h),g=ks.filter(k=>L[k]).length,m=ks.reduce((t,k)=>t+med(k),0),full=m===ks.length*4;return`<h3 class="sh lexh ${full?'full':''}">${HAB[h].icon} ${HAB[h].label} · ${g}/${ks.length} · 🏅 ${m}/${ks.length*4}${full?' · 🏆 komplett':''}</h3><div class="lexgrid">${ks.map(card).join('')}</div>`}).join('')}`}
// Fortschritt: alles Freischaltbare des Spielstands an einem Ort
function progHtml(){const ids=META.slots.map((x,i)=>x?i:null).filter(i=>i!=null),pick=screenArg.ps!=null&&META.slots[screenArg.ps]?screenArg.ps:META.lastSlot,id=pick!=null&&pick!=='tut'&&META.slots[pick]?pick:ids.length?ids[0]:null,sl=id!=null?META.slots[id]:null;
  const tst=META.testVerst?`<div class="rulebox ptest"><b>🧪 Test-Modus ist an</b><small>Alle Verstärker sind im Spiel verfügbar, auch wenn sie hier noch 🔒 sind. Läufe im Test-Modus zählen nicht für die Bestwerte.</small><button class="chip2" data-vtest="1" style="align-self:flex-start">Test-Modus ausschalten</button></div>`:'';
  const sel=ids.length>1?`<div class="chips pslots">${ids.map(i=>`<button class="chip2 ${i===id?'on':''}" data-pslot="${i}">${esc(META.slots[i].name)}</button>`).join('')}</div>`:'';
  const back='<div class="bar2"><h2>🔓 Fortschritt</h2><button class="btn sub" data-go="title">Zurück</button></div>'+sel+tst;
  if(!sl)return back+'<p class="empty-note">Lege zuerst einen Spielstand an und spiele einen Lauf, dann siehst du hier deinen Fortschritt.</p>';
  fsMig(sl);const cu=cuOf(sl),bar=(v,g)=>`<div class="dprog"><i style="width:${Math.min(100,v/g*100)}%"></i></div>`,mine=(META.cscores||[]).filter(x=>x.slot===id&&!x.test),bestZ=Math.max(0,...mine.map(x=>x.zoos||0),sl.run&&!sl.run.tut?sl.run.zoo||0:0),bestP=Math.max(0,...mine.map(x=>x.pts||0));
  const row=(ok,ic,nm,txt,extra='')=>`<div class="prow ${ok?'ok':'lk'}"><span class="pic">${ok?ic:'🔒'}</span><div class="pin"><b>${nm}</b><small>${txt}</small>${extra}</div><span class="pst">${ok?'✅':''}</span></div>`;
  const ur=u=>{const ok=unOpen(sl,u),[t,k]=u.split(':'),ic=t==='d'?DECKS[k].icon:t==='h'?HAB[k].icon:t==='s'?SPEC[k].icon:CARDS[k].icon,nm=unName(u).replace(/^\S+\s/,''),g=fsGoal(u);return{ok,html:row(ok,ic,nm,(ok?(g&&isNew91(sl)||t==='d'||t==='v'?'✓ '+fsHowTxt(u):'von Anfang an'):'Freischalten: '+fsHowTxt(u))+(t==='c'&&komboTxt(k)?' · '+komboTxt(k):''),ok?'':fsBar(u,sl))}};
  const grp=(t,L)=>{const R=L.map(ur);return{t,R,got:R.filter(x=>x.ok).length}};
  const G=[grp('🎴 Profile',Object.keys(DECKS).filter(d=>DECKS[d].type).map(d=>'d:'+d)),grp('🌍 Lebensräume',NEWHABS.map(h=>'h:'+h)),grp('🔆 Verstärker',Object.keys(VCOND).map(k=>'v:'+k)),grp('👑 Legendäre Spezialisten',LEGEND91.filter(k=>SPEC[k]).map(k=>'s:'+k)),grp('🃏 Karten',LOCK91.map(k=>'c:'+k))];
  const all=G.reduce((t,g)=>t+g.R.length,0),got=G.reduce((t,g)=>t+g.got,0);
  const near=FSG.filter(g=>!fsOf(sl)['g!'+g.id]&&!g.un.every(u=>unOpen(sl,u))&&(sl.fsb[g.id]||0)>0&&g.n>1).map(g=>({g,r:Math.min(.99,(sl.fsb[g.id]||0)/g.n)})).sort((a,b)=>b.r-a.r).slice(0,3);
  return back+`<p style="margin:0;color:var(--muted)">Spielstand <b style="color:var(--text)">${esc(sl.name)}</b> · <b style="color:var(--gold)">${got} von ${all}</b> freigeschaltet</p>${bar(got,all)}
    <p style="margin:0;color:var(--muted);font-size:13px">Jedes Ziel schaltet sofort frei, sobald du es in einem Lauf schaffst. Geprüft wird am Ende jeder Jahreszeit und jedes Zoos. Der Balken zeigt deinen bisher besten Stand.${isNew91(sl)?'':' Dieser Spielstand ist von vor 0.91: Karten, Lebensräume und Spezialisten, die schon offen waren, bleiben offen.'}</p>
    ${near.length?`<h3 class="psec">🔜 Am nächsten dran</h3>${near.map(({g})=>row(false,'',g.un.map(unName).join(' + '),g.how,fsBar(g.un[0],sl))).join('')}`:''}
    ${G.map(g=>`<h3 class="psec">${g.t} · ${g.got} von ${g.R.length}</h3>${g.R.map(x=>x.html).join('')}`).join('')}
    <h3 class="psec">🏆 Bestwerte</h3><div class="prow ok"><span class="pic">🏆</span><div class="pin"><b>Bester Lauf: ${bestZ} Zoo${bestZ===1?'':'s'} · ${fmt(bestP)} Punkte</b><small>Bester Tag: ${fmt(cu.day||0)} Punkte · ${sl.runs||0} Läufe beendet</small></div></div>${z2ProgHtml(sl,row,bar)}`}
// Fortschritt in Zoolatro 2.0: Stufen je Deck, Regelbrecher, Herausforderungen
function z2ProgHtml(sl,row,bar){const Z2=z2Of(sl),ds=Object.keys(DECKS).filter(d=>!DECKS[d].type||DECKS[d].free||deckOpen(sl,d)),chs=Object.keys(CHAL),done=chs.filter(c=>Z2.ch[c]),titles=done.filter(c=>CHAL[c].title).map(c=>CHAL[c].title);
  return`<h3 class="psec">🏔️ Stufen</h3><p style="margin:0;color:var(--muted);font-size:13px">Schaffst du Zoo 3, ist mit diesem Profil die nächste Stufe frei.</p>${ds.map(d=>{const m=stMax(sl,d);return`<div class="prow ok"><span class="pic">${DECKS[d].icon}</span><div class="pin"><b>${DECKS[d].name}: Stufe ${m} von 8</b><small>${m<8?`Nächste: ${STAGES[m+1]}`:'Alle Stufen frei'}</small>${bar(m,8)}</div><span class="pst">${m>=8?'🏔️':''}</span></div>`}).join('')}
    <h3 class="psec">⚡ Regelbrecher</h3>${Object.keys(SPEC).filter(id=>SPEC[id].rb).map(id=>{const S=SPEC[id],ok=rbOpen(sl,id);return row(ok,S.icon,S.name,S.fx.map(l=>l.replace('|',' ')).join(' · ')+(ok?'':` · Freischalten: ${rbHow(id)}`))}).join('')}
    <h3 class="psec">🎯 Herausforderungen · ${done.length} von ${chs.length}</h3>${titles.length?`<p style="margin:0;color:var(--gold);font-size:13.5px">Deine Titel: ${titles.join(' · ')}</p>`:''}${chs.map(c=>{const C=CHAL[c],ok=!!Z2.ch[c];return row(ok,C.icon,C.name,C.txt+` · Belohnung: ${C.rb?'⚡ '+SPEC[C.rb].name:'Titel „'+C.title+'“'}`)}).join('')}`}
function deckSelHtml(){const i=screenArg.slot,sl=META.slots[i],hb=screenArg.habs||null,pf=screenArg.prof||null;
  return`<div class="bar2"><h2>🎴 ${hb?'Neuer Lauf · 2 von 2: ':''}Profil wählen</h2><button class="btn sub" ${hb?'data-zsback2="1"':`data-mode="${i}"`}>Zurück</button></div><p style="margin:0;color:var(--muted)">Jedes Profil bringt ein Startdeck mit 16 Karten. Themen-Profile bringen ihre Themen-Karten und eine eigene Signatur-Karte mit und haben eine Regel mit Vorteil (＋) und Kehrseite (－). Jedes Themen-Profil schaltest du über ein Ziel frei (🔓 Fortschritt). Ein 🏆 zeigt, mit welchem Profil du Zoolatro schon geschafft hast.${screenArg.zl==='z2'?' <b>Stufen:</b> Wähle die Stufe. Schaffst du Zoo 3, ist mit diesem Profil die nächste Stufe frei. Jede Stufe enthält alle Verschärfungen davor.':''}</p>
    ${(()=>{const HD=id=>{const t=DECKS[id].type;return!!(t&&HAB[t]&&!(hb||DEFHABS).includes(t))};return Object.keys(DECKS).sort((a,b)=>HD(a)-HD(b)).map(id=>[id,HD(id)])})().map(([id,hid])=>{const D=DECKS[id],ok=deckOpen(sl,id)&&!hid,U=UNLOCK_DECK[id],pts=U?Math.min(U.goal,Math.round(cuOf(sl)[U.k]||0)):0,cs=hid?[]:deckCards(id,hb),m={};cs.forEach(k=>m[k]=(m[k]||0)+1);
      return`<div class="slot ${ok?'':'locked'}"><h3><span class="dkic">${D.icon}</span> ${D.name}${ok||hid?'':' 🔒'}${(sl.trophy||{})[id]?' 🏆':''}</h3><p>${D.type?`Schwerpunkt ${MILE[D.type].label}. Signatur-Karte: <b>${(c=>c?c.icon+' '+c.name:'')(CARDS[D.inn.find(k=>CARDS[k].sig)])}</b> (gibt es nur mit diesem Profil).`:D.text}${DECKTF[id]?` <b>Ziele +${Math.round((DECKTF[id]-1)*100)} %.</b>`:''}</p><p class="dkrule">📜 <b>Profil-Regel:</b> ${DECKRULE[id]||DECKRULE.grund}</p>
        <div class="deckchips" style="background:none;padding:0">${Object.keys(m).map(k=>`<span class="${(D.inn||[]).includes(k)?'hl':''}">${CARDS[k].icon} ${CARDS[k].name}</span>`).join('')}</div>${hid?'':deckStatHtml(cs)}
        ${hid?`<div class="meta2"><span>🌍 <b>Nur mit Lebensraum ${HAB[D.type].icon} ${HAB[D.type].label}:</b> Gehe zurück und wähle ihn bei den Lebensräumen.</span></div>`:ok?(screenArg.zl==='z2'?(()=>{const mx=stMax(sl,id);return`<div class="meta2"><span>🏔️ Stufe ${mx} von 8 freigeschaltet${mx>1?' · Stufe '+mx+': '+STAGES[mx]:''}</span></div><div class="stgrid">${Array.from({length:8},(_,k)=>k+1).map(n=>n<=mx?`<button class="btn ${n===mx?'main':'sub'}" data-cdeck="${id}" data-stage="${n}">Stufe ${n}</button>`:`<button class="btn sub stlk" data-stlock="${id}:${n}" title="${n===mx+1?`Zoo 3 mit Stufe ${mx} schaffen`:`Erst Stufe ${n-1} freischalten`}">🔒 ${n}</button>`).join('')}</div>${screenArg.stHint&&screenArg.stHint.id===id?`<p class="sthint">🔒 Stufe ${screenArg.stHint.n}: ${screenArg.stHint.n===mx+1?`Zoo 3 mit Stufe ${mx} schaffen`:`erst Stufe ${screenArg.stHint.n-1} freischalten`}.</p>`:''}`})():`<div class="acts"><button class="btn main" data-cdeck="${id}">Mit diesem Profil starten</button></div>`):`<div class="meta2"><span>🔒 <b>Freischalten:</b> ${fsHowTxt('d:'+id)}</span></div>${fsBar('d:'+id,sl)}`}</div>`}).join('')}`}
function tallyZoo(){const t=state.stats;for(const b of state.buildings){t.tally[b.key]=(t.tally[b.key]||0)+1;t.lvl=Math.max(t.lvl||1,b.lvl||1)}}
function summaryOf(st,info){const habs={},cats={attr:0,essen:0,schutz:0};for(const h in HAB)habs[h]=0;
  for(const k in st.tally){const c=CARDS[k];if(!c)continue;if(c.hab)habs[c.hab]+=st.tally[k];else cats[c.cat]+=st.tally[k]}
  const top=Object.entries(st.cards).filter(([k])=>CARDS[k]).map(([k,v])=>({k,a:v.a,s:v.s})).sort((x,y)=>(y.a+y.s)-(x.a+x.s)).slice(0,5);
  return Object.assign({habs,cats,top,best:st.best,combo:st.combo||0,lvl:st.lvl||1,earned:st.earned||0,spent:st.spent||0,progs:st.progs||0,days:st.days||0},info)}
// nach dem Lauf: woran es lag und was als Nächstes fast geschafft ist
function runLook(sl,run){const o={fail:'',near:[]};
  if(state&&state.phase==='lost'&&state.mode==='camp'){const se=seOf(state.season),pc=Math.round(state.seasonScore/se.target*100);
    o.fail=`Zoo ${state.zoo+1}, ${se.name}: ${fmt(state.seasonScore)} von ${fmt(se.target)} Punkten (${pc} %).`+(se.winter&&state.zl&&state.zl.insp?` Winter-Bedingung: ${inspIcon(state.zl)} ${INSP[state.zl.insp].name}.`:'')+(state.day<DAYS-1&&state.seasonScore<se.target?` Lauf an Tag ${state.day+1} beendet.`:'')}
  const cu=cuOf(sl),vu=sl.vu||{},z=run.zoo||0,L=[];
  fsMig(sl);for(const g of FSG){if(fsOf(sl)['g!'+g.id]||g.un.every(u=>unOpen(sl,u)))continue;const v=sl.fsb[g.id]||0;if(v>0&&g.n>1&&v<g.n)L.push({r:v/g.n,t:`🔓 ${g.un.map(unName).join(' + ')}: ${g.how} (bisher ${fmt(Math.floor(v))})`})}
  if(run.z2){const d=run.deckId||'grund',st=run.stage||1;if(stMax(sl,d)<=st&&st<8)L.push({r:Math.min(.95,z/3),t:`🏔️ Stufe ${st+1} mit dem ${DECKS[d].name}: Zoo 3 schaffen (diesmal ${z} geschafft)`});
    const open=Object.keys(CHAL).filter(c=>!z2Of(sl).ch[c]);if(open.length){const C=CHAL[open[0]];L.push({r:.25,t:`🎯 ${open.length} Herausforderungen offen, z. B. ${C.icon} ${C.name}: ${C.txt}`})}}
  o.near=L.sort((a,b)=>b.r-a.r).slice(0,4);return o}
const lookHtml=L=>(L.fail?`<div class="sumbox" style="text-align:left"><span class="k">🔍 Woran es lag</span><span style="font-size:14px">${L.fail}</span></div>`:'')+(L.near.length?`<h3 class="sh">🔜 Fast geschafft</h3><div style="display:flex;flex-direction:column;gap:6px">${L.near.map(x=>`<div class="prow"><div class="pin"><small style="color:var(--text);font-size:13px">${x.t}</small><div class="dprog"><i style="width:${Math.max(4,Math.round(x.r*100))}%"></i></div></div></div>`).join('')}</div>`:'');
function wonAnim(){const e=$('wonTot');if(!e||reduced)return;const v=+e.dataset.v,t0=performance.now()+1700,dur=1500;e.textContent='0';
  const step=t=>{if(!e.isConnected)return;const p=Math.min(1,Math.max(0,(t-t0)/dur));e.textContent=fmt(Math.round(v*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(step);else{e.textContent=fmt(v);e.classList.add('wpop')}};requestAnimationFrame(step)}
function endRun(won){const sl=activeSlot(),run=sl.run,date=Date.now();if(run.tut){guideEnd(false);return}try{META.lastRunTxt=runText(run);(META.runHist=META.runHist||[]).unshift(META.lastRunTxt);META.runHist=META.runHist.slice(0,10)}catch(e){}META.cscores=META.cscores||[];
  META.cscores.push({name:sl.name,slot:META.active,zoos:run.zoo,pts:run.total||0,won:run.zoo>=CAMP_GOAL,date,zl:run.zl?1:undefined,z2:run.z2?1:undefined,stage:run.z2?run.stage||1:undefined,test:run.test||(META.testVerst?1:undefined)});META.cscores.sort((a,b)=>b.zoos-a.zoos||b.pts-a.pts);META.cscores=META.cscores.slice(0,100);
  const newDecks=run.newDecks||[];
  const sum=summaryOf(run.stats||newStats(),{total:run.total||0,camp:true,zoos:run.zoo,won:run.zoo>=CAMP_GOAL,newDecks,newNow:run.reward&&run.reward.deckAck?[]:(run.newNow||[]),z2news:run.z2?z2NewsHtml(run):'',look:runLook(sl,run)});const n=1+run.zoo;statRun(sl,run);sl.runs=(sl.runs||0)+1;try{if(!run.seed)fsCheck('run')}catch(e){console.warn(e)}sum.fsNow=(run.fsAll||[]).slice();try{const fs=fsOf(sl),L=FSG.filter(g=>!fs['g!'+g.id]&&g.n>1&&(((run.fsPick||[]).includes(g.id))||g.un.some(u=>u.startsWith('d:')))).map(g=>({g,v:Math.min(g.n,(run.fsr||{})[g.id]||0)})).filter(x=>x.v>0).sort((a,b)=>b.v/b.g.n-a.v/a.g.n).slice(0,3);sum.fsNear=L.map(x=>`${unName(x.g.un[0])} ${fmt(x.v)}/${fmt(x.g.n)}`)}catch(e){sum.fsNear=[]}sl.run=null;sl.cperks=sl.cperks||{};applyPerks(sl.cperks);UNLOCK=new Set();state=null;modal=null;
  screen='summary';screenArg={sum,next:{screen:'scores',arg:{f:run.z2?'z2':'zl',hl:date,back:'title'}}};saveMeta();if(sum.won)Sfx.win();else Sfx.lose();renderAll()}
// Verstärker freischalten: Bedingungen am Ende eines geschafften Zoos; neu freigeschaltete kommen sofort einmal ins Deck
function verstUnlock(sl,run){run.vNow=[];run.newNow=[];fsMig(sl);return;sl.vu=sl.vu||{};if(run&&run.seed)return;const bs=state.buildings,n=t=>cnt(bs,b=>CARDS[b.key].cat==='gehege'&&CARDS[b.key].tags.includes(t)),z=state.zoo||0,pu=state.zl?zlPurity(bs,mkIndex(bs)).n:0;
  const idx=mkIndex(bs),G=b=>CARDS[b.key].cat==='gehege',fullShow=cnt(bs,b=>G(b)&&CARDS[b.key].tags.includes('show')&&cnt(nbrs(b,idx),n=>isCat(n,'essen')||isCat(n,'attr'))>=2),calm=cnt(bs,b=>G(b)&&CARDS[b.key].tags.includes('scheu')&&!(evalB(b,bs,idx).st));
  const ok={futterkueche:z>=1,besucherlotse:z>=3,winterquartier:(cuOf(sl).arB||0)>=100,scheinwerfer:pu>=7,buehne:fullShow>=5,ruhezone:calm>=6};
  // höchstens eine Freischaltung je geschafftem Zoo: alles weitere wartet in sl.ulq (wer am längsten wartet, kommt zuerst)
  const q=sl.ulq=sl.ulq||[];for(const k of Object.keys(ok))if((ok[k]||sl.vu[k]==='pending')&&sl.vu[k]!==1&&!q.includes('v:'+k)){q.push('v:'+k);sl.vu[k]='pending'}

  run.vNow=[];run.newNow=[];const g=q.shift();if(g){const[t,k]=g.split(':');if(t==='v'){sl.vu[k]=1;run.deck.push(k);run.vNow=[k]}else{cuOf(sl).open.push(k);run.newNow=[k];run.newDecks=(run.newDecks||[]).concat([k])}}}

// ===== 0.91: Freischalten über Ziele =====
// Neue Spielstände (sl.v91) starten klein: 33 Karten, Arktis und Gebirge, die legendären Spezialisten und die Themen-Decks werden über Ziele freigeschaltet.
// Alte Spielstände behalten alles, was schon offen war (Karten, Lebensräume, Spezialisten); Decks und Verstärker schalten auch dort über die neuen Ziele frei.
// Jedes Ziel wird am Ende jeder Jahreszeit, jedes Zoos und jedes Laufs geprüft und schaltet sofort frei (keine Grenze je Zoo).
const LOCK91=['kraken','krokodile','nilpferde','antilopen','bueffel','nashoerner','gorillas','koalas','tiger','dingos','kaengurus','addax','belugas','eisbaeren','rentiere','braunbaeren','rotepandas','schneeleoparden','aquarium','nachtfuehrung','seilbahn','biergarten','kuerbisfest','pizzeria','bistro','weihnachtsmarkt','vielfalt','bergwacht','polarstation','schmetterling','tropenhaus','stiftung','zucht'];
const LEGEND91=['zwilling','polier','spekulant','direktor','z_rekord','glueckspilz','doppel'];
const isNew91=sl=>!!(sl&&sl.v91);
const fsOf=sl=>{sl.fs=sl.fs||{};sl.fsb=sl.fsb||{};return sl.fs};
const fsSl=()=>{try{const sl=activeSlot();if(!sl||(sl.run&&(sl.run.seed||sl.run.tut)))return null;return sl}catch(e){return null}};
const fsLocked=(k,sl)=>{if(sl===undefined)sl=fsSl();if(!isNew91(sl))return false;const b=baseK(String(k).split('^')[0]);return LOCK91.includes(b)&&!fsOf(sl)['c:'+b]};
const habOpen=(sl,h)=>!NEWHABS.includes(h)||!isNew91(sl)||!!fsOf(sl)['h:'+h];
const specLocked=id=>{const sl=fsSl();return isNew91(sl)&&LEGEND91.includes(id)&&!fsOf(sl)['s:'+id]};
// Zähl-Helfer für den aktuellen Zoo
const fsG=f=>cnt(state.buildings,b=>{const c=CARDS[b.key];return c.cat==='gehege'&&!c.ms&&f(c)}),fsK=f=>new Set(state.buildings.filter(b=>{const c=CARDS[b.key];return!c.ms&&f(c)}).map(b=>spK(baseK(b.key)))).size,fsB=f=>cnt(state.buildings,b=>{const c=CARDS[b.key];return!c.ms&&f(c)});
const fsMile=t=>!!(state.miles||{})[t];
const fsCalm=f=>{const bs=state.buildings,idx=mkIndex(bs);return cnt(bs,b=>{const c=CARDS[b.key];return c.cat==='gehege'&&c.tags.includes('scheu')&&(!f||f(b,idx))&&!(evalB(b,bs,idx).st)})};
const fsShowFull=()=>{const bs=state.buildings,idx=mkIndex(bs);return cnt(bs,b=>{const c=CARDS[b.key];return c.cat==='gehege'&&c.tags.includes('show')&&cnt(nbrs(b,idx),n=>isCat(n,'essen')||isCat(n,'attr'))>=2})};
const fsAdjSav=()=>{const bs=state.buildings,idx=mkIndex(bs);return state.buildings.some(b=>CARDS[b.key].cat==='essen'&&nbrs(b,idx).some(n=>isCat(n,'gehege')&&isHab(n,'savanne')))};
const fsSavGroup=()=>{const g=state.buildings.filter(b=>CARDS[b.key].cat==='gehege'&&CARDS[b.key].hab==='savanne'),idx=mkIndex(g),seen=new Set();let best=0;for(const b of g){if(seen.has(b))continue;let n=0;const st=[b];seen.add(b);while(st.length){const x=st.pop();n++;for(const y of nbrs(x,idx))if(!seen.has(y)){seen.add(y);st.push(y)}}best=Math.max(best,n)}return best};
const fsPair=()=>{const bs=state.buildings,idx=mkIndex(bs);return bs.some(b=>CARDS[b.key].cat==='gehege'&&!CARDS[b.key].ms&&nbrs(b,idx).some(n=>n.key===b.key&&Math.max(b.lvl||1,n.lvl||1)>=2))};
const fsSame=()=>{const n={};for(const b of state.buildings){const c=CARDS[b.key];if(c.cat==='gehege'&&!c.ms){const k=baseK(b.key);n[k]=(n[k]||0)+1}}return Math.max(0,...Object.values(n))};
const fsAttrWater=()=>{const bs=state.buildings,idx=mkIndex(bs);return cnt(bs,b=>CARDS[b.key].cat==='attr'&&nbrs(b,idx).some(n=>isCat(n,'gehege')&&isHab(n,'wasser')))};
const fsNat=()=>cnt(state.buildings,b=>{const c=CARDS[b.key];return c.cat==='gehege'&&c.hab&&natCells(b.cells,c.hab)>0});
// Ziele: ev = wann geprüft wird (season = Ende jeder Jahreszeit, zoo = Zoo geschafft, run = Lauf beendet, day = Tagesende); n/v = Zahl für den Fortschrittsbalken
const FSG=[
 {id:'d:steppe',ev:'run',how:'Einstiegspfad: deinen 1. Lauf beenden',n:1,v:x=>x.sl.runs||0},
 {id:'s:direktor',ev:'run',how:'Einstiegspfad: deinen 2. Lauf beenden',n:2,v:x=>x.sl.runs||0},
 {id:'v:futterkueche',ev:'run',how:'Einstiegspfad: deinen 3. Lauf beenden',n:3,v:x=>x.sl.runs||0},
 {id:'d:kueste',grp:'wasser',how:'8 Wasser-Gehege in einem Zoo',n:8,v:()=>fsG(c=>c.hab==='wasser')},
 {id:'d:dschungel',how:'6 verschiedene Dschungel-Gehege in einem Zoo',n:6,v:()=>fsK(c=>c.cat==='gehege'&&c.hab==='wald')},
 {id:'d:oase',grp:'geld',how:'Eine Jahreszeit mit 150 Talern in der Kasse beenden',n:150,v:()=>Math.max(0,state.money)},
 {id:'d:freizeit',how:'7 verschiedene Attraktionen in einem Zoo',n:7,v:()=>fsK(c=>c.cat==='attr')},
 {id:'d:geniesser',grp:'gastroK',how:'7 verschiedene Gastro-Gebäude in einem Zoo',n:7,v:()=>fsK(c=>c.cat==='essen')},
 {id:'d:forscher',how:'6 Meilensteine in einem Lauf',n:6,v:x=>(x.run.miles||0)+Object.keys(state.miles||{}).length},
 {id:'g:polar',grp:'zoo',un:['h:arktis','d:polar'],ev:'zoo',how:'Zoo 4 schaffen',n:4,v:x=>x.z+1},
 {id:'g:alpen',grp:'zoo',un:['h:gebirge','d:alpen'],ev:'zoo',how:'Zoo 5 schaffen',n:5,v:x=>x.z+1},
 {id:'v:besucherlotse',grp:'tag',how:'100.000 Punkte an einem Tag',n:1e5,v:()=>(state.stats.best&&state.stats.best.pts)||0},
 {id:'v:winterquartier',ev:'winter',how:'Einen Winter bis Tag 3 schaffen',n:1,v:x=>+((x.left||0)>=DAYS-3)},
 {id:'v:scheinwerfer',grp:'rein',how:'Reinheit mit 8 Arten in einem Zoo',n:8,v:()=>state.zl?zlPurity(state.buildings,mkIndex(state.buildings)).n:0},
 {id:'v:buehne',grp:'show',how:'5 Showtiere mit vollem Show-Bonus in einem Zoo',n:5,v:fsShowFull},
 {id:'v:ruhezone',grp:'calm',how:'6 scheue Tiere ganz ohne Stress in einem Zoo',n:6,v:()=>fsCalm()},
 {id:'s:zwilling',how:'3 gleiche Gehege in einem Zoo',n:3,v:fsSame},
 {id:'s:polier',ev:'day',how:'An einem Tag 5 Karten bauen',n:5,v:()=>state.builtToday||0},
 {id:'s:spekulant',grp:'geld',ev:'zoo',how:'Einen Zoo mit 200 Talern in der Kasse schaffen',n:200,v:()=>Math.max(0,state.money)},
 {id:'s:glueckspilz',how:'10 Glückstreffer in einem Lauf (🎲 Glück, 🔂 Zugabe, Glücks-Spezialisten, Zirkus-Zelt)',n:10,v:x=>x.run.luckHits||0},
 {id:'s:doppel',how:'Ein volles Team mit 5 Spezialisten',n:5,v:()=>(state.spec||[]).length},
 {id:'s:z_rekord',ev:'won',how:'Ein Saisonziel mindestens 2 Tage früher schaffen',n:2,v:x=>x.left||0},
 {id:'c:kraken',grp:'wasser',how:'6 Wasser-Gehege in einem Zoo',n:6,v:()=>fsG(c=>c.hab==='wasser')},
 {id:'c:krokodile',grp:'raub',ev:'zoo',how:'Einen Zoo mit 3 Raubtieren schaffen',n:3,v:()=>fsG(c=>c.tags.includes('raubtier'))},
 {id:'c:nilpferde',how:'Meilenstein 💧 Wasser erreichen',n:1,v:()=>+fsMile('wasser')},
 {id:'c:antilopen',how:'6 Savannen-Gehege in einem Zoo',n:6,v:()=>fsG(c=>c.hab==='savanne')},
 {id:'c:bueffel',how:'7 zusammenhängende Savannen-Gehege in einem Zoo',n:7,v:fsSavGroup},
 {id:'c:nashoerner',grp:'rein',how:'Sehr selten · 🧬 Reinzucht: Reinheit ×1,5 (10 Arten eines Lebensraums zusammen)',n:10,v:()=>state.zl?zlPurity(state.buildings,mkIndex(state.buildings)).n:0},
 {id:'c:gorillas',how:'Meilenstein 🌿 Dschungel erreichen',n:1,v:()=>+fsMile('wald')},
 {id:'c:koalas',grp:'calm',how:'3 scheue Tiere ohne Stress in einem Zoo',n:3,v:()=>fsCalm()},
 {id:'c:tiger',grp:'raub',ev:'zoo',how:'Einen Zoo mit 2 Raubtieren schaffen',n:2,v:()=>fsG(c=>c.tags.includes('raubtier'))},
 {id:'c:dingos',how:'6 Wüsten-Gehege in einem Zoo',n:6,v:()=>fsG(c=>c.hab==='wueste')},
 {id:'c:kaengurus',how:'Meilenstein 🏜️ Wüste erreichen',n:1,v:()=>+fsMile('wueste')},
 {id:'c:addax',how:'4 Gehege mit bedrohten Arten in einem Zoo',n:4,v:()=>fsG(c=>c.tags.includes('bedroht'))},
 {id:'c:belugas',grp:'show',how:'3 Showtiere mit vollem Show-Bonus in einem Zoo',n:3,v:fsShowFull},
 {id:'c:eisbaeren',grp:'arktis',how:'7 Arktis-Gehege in einem Zoo',n:7,v:()=>fsG(c=>c.hab==='arktis')},
 {id:'c:rentiere',grp:'arktis',how:'6 Arktis-Gehege in einem Zoo',n:6,v:()=>fsG(c=>c.hab==='arktis')},
 {id:'c:braunbaeren',how:'Je 3 Wald- und Gebirgs-Gehege in einem Zoo',n:3,v:()=>Math.min(fsG(c=>c.hab==='wald'),fsG(c=>c.hab==='gebirge'))},
 {id:'c:rotepandas',how:'2 scheue Tiere neben Naturschutz-Gebäuden, ohne Stress',n:2,v:()=>fsCalm((b,idx)=>nbrs(b,idx).some(n=>isCat(n,'schutz')))},
 {id:'c:schneeleoparden',how:'Meilenstein ⛰️ Gebirge erreichen',n:1,v:()=>+fsMile('gebirge')},
 {id:'c:aquarium',how:'3 Attraktionen neben Wasser-Gehegen in einem Zoo',n:3,v:fsAttrWater},
 {id:'c:nachtfuehrung',grp:'tag',how:'Sehr selten · 💥 Millionen-Tag: 1 Million Punkte an einem Tag',n:1e6,v:()=>(state.stats.best&&state.stats.best.pts)||0},
 {id:'c:seilbahn',grp:'gebirge',how:'6 Gebirgs-Gehege in einem Zoo',n:6,v:()=>fsG(c=>c.hab==='gebirge')},
 {id:'c:biergarten',how:'Meilenstein 🍿 Gastro erreichen',n:1,v:()=>+fsMile('essen')},
 {id:'c:kuerbisfest',ev:'herbst',how:'Einen Herbst mit 5 Gastro-Gebäuden beenden',n:5,v:()=>fsB(c=>c.cat==='essen')},
 {id:'c:pizzeria',grp:'gastroK',how:'5 verschiedene Gastro-Gebäude in einem Zoo',n:5,v:()=>fsK(c=>c.cat==='essen')},
 {id:'c:bistro',how:'4 Savannen-Gehege und ein Gastro-Gebäude neben einem davon',n:4,v:()=>fsAdjSav()?fsG(c=>c.hab==='savanne'):Math.min(3,fsG(c=>c.hab==='savanne'))},
 {id:'c:weihnachtsmarkt',ev:'winter',how:'Einen Winter mit der Bedingung 🎄 Wintermarkt schaffen',n:1,v:()=>+!!(state.zl&&state.zl.insp==='markt')},
 {id:'c:vielfalt',how:'10 verschiedene Tierarten in einem Zoo',n:10,v:()=>fsK(c=>c.cat==='gehege')},
 {id:'c:bergwacht',grp:'gebirge',how:'3 Gebirgs-Gehege in einem Zoo',n:3,v:()=>fsG(c=>c.hab==='gebirge')},
 {id:'c:polarstation',grp:'arktis',how:'3 Arktis-Gehege in einem Zoo',n:3,v:()=>fsG(c=>c.hab==='arktis')},
 {id:'c:schmetterling',how:'10 Gehege auf passender Naturfläche in einem Zoo',n:10,v:fsNat},
 {id:'c:tropenhaus',grp:'zoo',ev:'zoo',how:'Sehr selten · 🏆 Zoodirektion: alle 5 Zoos in einem Lauf schaffen',n:5,v:x=>x.z+1},
 {id:'c:stiftung',grp:'geld',ev:'zoo',how:'Sehr selten · 💰 Sparfuchs: einen Zoo mit 300 Talern in der Kasse schaffen',n:300,v:()=>Math.max(0,state.money)},
 {id:'c:zucht',how:'Zwei gleiche Gehege nebeneinander, eines auf Stufe II',n:1,v:()=>+fsPair()}];
FSG.forEach(g=>{g.un=g.un||[g.id]});
// 0.93: je Lauf 3 Freischalt-Ziele (vor dem Lauf gezeigt); gleiche Bedingung in mehreren Stufen: erst die leichteste
const fsDone=(sl,g)=>{const fs=fsOf(sl);return!!fs['g!'+g.id]||g.un.every(u=>unOpen(sl,u))};
const FSHAB={'d:kueste':['wasser'],'d:dschungel':['wald'],'c:kraken':['wasser'],'c:nilpferde':['wasser'],'c:antilopen':['savanne'],'c:bueffel':['savanne'],'c:gorillas':['wald'],'c:dingos':['wueste'],'c:kaengurus':['wueste'],'c:eisbaeren':['arktis'],'c:rentiere':['arktis'],'c:polarstation':['arktis'],'c:braunbaeren':['wald','gebirge'],'c:schneeleoparden':['gebirge'],'c:seilbahn':['gebirge'],'c:bergwacht':['gebirge'],'c:aquarium':['wasser'],'c:bistro':['savanne']};
const fsEligible=(sl,habs)=>FSG.filter(g=>g.ev!=='run'&&(!habs||!FSHAB[g.id]||FSHAB[g.id].every(h=>habs.includes(h)))&&!fsDone(sl,g)&&(!g.grp||FSG.filter(h=>h.grp===g.grp&&h.n<g.n).every(h=>fsDone(sl,h))));
function fsPickRun(sl,run,intro){if(!sl||!run||run.fsPick||run.tut||!isNew91(sl))return;const L=shuffle(fsEligible(sl,run.habs||(typeof state!=='undefined'&&state&&state.habs)||null));run.fsPick=L.slice(0,3).map(g=>g.id);run.fsIntro=intro&&run.fsPick.length?1:0}
function fsRunHtml(run,sl,title){const h0=fsRunHtml0(run,sl,title);return h0?h0+'<p class="hint" style="margin:4px 0 0">🎴 Ziele für Profile zählen in jedem Lauf zusätzlich.</p>':h0}
function fsRunHtml0(run,sl,title){if(!run||!run.fsPick||!run.fsPick.length)return'';const fs=fsOf(sl);return`<div class="fsrun">${title?`<h3 class="sh">${title}</h3>`:''}${run.fsPick.map(id=>{const g=FSG.find(x=>x.id===id);if(!g)return'';const done=!!fs['g!'+g.id],v=Math.min(g.n,(run.fsr||{})[g.id]||0);
  return`<div class="fsr ${done?'ok':''}"><div class="fsu">${g.un.map(u=>`<b>${unName(u)}</b> <small>${unKind(u)}</small>`).join('<br>')}</div><div class="fsh">${done?'✓ Freigeschaltet!':g.how}</div>${done?'':g.n>1?`<div class="dprog"><i style="width:${Math.round(v/g.n*100)}%"></i></div><small class="fsbn">${fmt(Math.floor(v))} von ${fmt(g.n)} in diesem Lauf</small>`:''}</div>`}).join('')}</div>`}
const fsGoal=u=>FSG.find(g=>g.un.includes(u));
const fsHowTxt=u=>{const g=fsGoal(u);return g?g.how:'von Anfang an'};
const unName=u=>{const[t,k]=u.split(':');return t==='d'?DECKS[k].icon+' '+DECKS[k].name:t==='h'?HAB[k].icon+' '+HAB[k].label:t==='s'?SPEC[k].icon+' '+SPEC[k].name:CARDS[k]?CARDS[k].icon+' '+CARDS[k].name:k};
const komboTxt=k=>{const c=CARDS[k],l=(c&&c.fx||[]).find(x=>String(x).startsWith('🔗'));return l?String(l).replace('|',' '):''};
const unKind=u=>({d:'Profil',h:'Lebensraum',s:'Spezialist (legendär)',v:'Verstärker',c:'Karte'})[u[0]];
function unOpen(sl,u){const[t,k]=u.split(':');if(t==='d')return deckOpen(sl,k);if(t==='v')return(sl.vu||{})[k]===1;if(!isNew91(sl))return true;return!!fsOf(sl)[u]}
function fsMig(sl){if(!sl||sl.fsMig91)return;sl.fsMig91=1;sl.vu=sl.vu||{};for(const k in sl.vu)if(sl.vu[k]==='pending')sl.vu[k]=1;for(const g of sl.ulq||[]){const[t,k]=g.split(':');if(t==='v')sl.vu[k]=1;else if(t==='d'&&DECKS[k])cuOf(sl).open.push(k)}sl.ulq=[];fsOf(sl)}
// Fortschrittsbalken (bester Stand) für ein freischaltbares Ding
function fsBar(u,sl){const g=fsGoal(u);if(!g||!sl)return'';const b=Math.min(g.n,(fsOf(sl),sl.fsb[g.id]||0));return g.n>1?`<div class="dprog"><i style="width:${Math.round(b/g.n*100)}%"></i></div><small class="fsbn">${fmt(Math.floor(b))} von ${fmt(g.n)}</small>`:''}
// Prüfen: ev = 'season' | 'won' | 'winter' | 'herbst' | 'zoo' | 'run' | 'day'
function fsCheck(ev,o={}){const sl=fsSl();if(!sl||(ev!=='run'&&(!state||state.mode!=='camp')))return[];const run=sl.run;if(!run)return[];fsMig(sl);const fs=fsOf(sl),x={sl,run,z:state?state.zoo||0:run.zoo||0,left:o.left||0},got=[];
  const when=g=>{const e=g.ev||'season';if(e==='run')return ev==='run';if(e==='day')return ev==='day'||ev==='season';if(e==='zoo')return ev==='zoo';if(e==='won')return ev==='won';if(e==='winter')return ev==='won'&&state.season===3;if(e==='herbst')return(ev==='won'||ev==='season')&&state.season===2;return ev==='season'||ev==='won'};
  fsPickRun(sl,run,false);for(const g of FSG){if(fs['g!'+g.id]||g.un.every(u=>unOpen(sl,u)))continue;if(run.fsPick&&g.ev!=='run'&&!run.fsPick.includes(g.id)&&!g.un.some(u=>u.startsWith('d:')))continue;if(!when(g))continue;let v=0;try{v=g.v(x)||0}catch(e){v=0}sl.fsb[g.id]=Math.max(sl.fsb[g.id]||0,v);run.fsr=run.fsr||{};run.fsr[g.id]=Math.max(run.fsr[g.id]||0,v);if(v<g.n)continue;fs['g!'+g.id]=1;
    for(const u of g.un){if(unOpen(sl,u))continue;const[t,k]=u.split(':');fs[u]=1;if(t==='d'){const cu=cuOf(sl);if(!cu.open.includes(k))cu.open.push(k)}else if(t==='v'){sl.vu=sl.vu||{};sl.vu[k]=1;if(ev!=='run'){state.discard.push(k);run.deck.push(k)}}else if(t==='c'&&ev!=='run'&&habOkRun(run,k)){state.discard.push(k);run.deck.push(k)}got.push(u)}}
  if(got.length){if(state)state.fsNew=(state.fsNew||[]).concat(got);run.fsAll=(run.fsAll||[]).concat(got);try{Sfx.sparkle()}catch(e){}}return got}
const habOkRun=(run,k)=>{const c=CARDS[k],h=c.hab||c.rq;return!h||(run.habs||DEFHABS).includes(h)};
const fsNewHtml=L=>`<div class="deckwin"><div class="dwi">🔓</div><h2>Neu freigeschaltet!</h2><div class="fslist">${L.map(u=>`<div class="fsrow"><b>${unName(u)}</b><small>${unKind(u)} · ✓ ${fsHowTxt(u)}${u[0]==='c'||u[0]==='v'?' · kommt gleich einmal in dein Deck':''}</small>${u[0]==='c'&&komboTxt(u.slice(2))?`<small style="color:var(--gold)">${komboTxt(u.slice(2))}</small>`:''}</div>`).join('')}</div>`;


// ===== 0.92: Zufall und Glück, Tagesereignisse, Zoo-Momente, Formen, Freundschaften, Landschaft =====
// Glückswürfe passieren am Tagesende (rollLuck in startScoring/botScore) und gelten für diesen Tag (state.luckNow, gelöscht in startDay).
// Tagesereignisse (Besucherliebling, Lotto, Tagesfeld, Vermesser-Linie, Morgen-Momente) werden in startDay gewürfelt und sind schon in der Vorschau sichtbar.
const luckOn=()=>{try{const r=runOf();return!!(state&&state.zl&&state.mode==='camp'&&!(r&&r.tut))}catch(e){return false}};
const LK=()=>typeof state!=='undefined'&&state&&state.luckNow||null;
const chance=p=>Math.min(1,p*(hasSpec('glueckspilz')?2:1)*(state&&state.luckBoost===state.day+'/'+state.season?2:1));
const chTxt=p=>{const c=chance(p);return c>=1?'immer':c>=.5&&Math.abs(1/c-Math.round(1/c))>.05?Math.round(c*100)+' %':'1/'+Math.round(1/c)};
function rollLuck(){if(!luckOn()){state.luckNow=null;return null}const L={lucky:[],encore:[],spec:{},lotto:0,zirkus:0,d:state.day,s:state.season};
  for(const b of state.buildings){if(b.pr==='glueck'&&Math.random()<chance(.25))L.lucky.push(b.id);if(b.pr==='zugabe'&&Math.random()<chance(1/3))L.encore.push(b.id);
    if(b.key==='lotterie')L.lotto+=1+Math.floor(Math.random()*10);if(b.key==='zirkus'&&!L.zirkus&&Math.random()<chance(.2))L.zirkus=1}
  if(hasSpec('gluecksspielerin')&&Math.random()<chance(1/3))L.spec.gl=1;if(hasSpec('wettbuero')&&Math.random()<chance(.5))L.spec.wb=1;
  state.luckNow=L;const n=L.lucky.length+L.encore.length+(L.spec.gl?1:0)+(L.spec.wb?1:0)+L.zirkus;if(n){const r=runOf();if(r)r.luckHits=(r.luckHits||0)+n}return L}
const luckLab=b=>{const L=LK();if(state&&state.foto===b.id)return'📸 FOTO! ×3';if(state&&state.fav===b.id)return'❤️ LIEBLING ×2';if(state&&state.vline&&hasSpec('vermesser')&&b.cells.some(([q,r])=>state.vline.includes(hk(q,r))))return'📏 ×2!';if(!L)return'';return L.lucky.includes(b.id)?'🎲 GLÜCK! ×3':L.encore.includes(b.id)?'🔂 ZUGABE!':L.zirkus&&has(b,'show')&&isCat(b,'gehege')?'🎪 ZIRKUS!':''};
// Geheime Freundschaften: Paare, die nebeneinander beide ×1,25 zählen
const FRIENDS=[['zebras','giraffen'],['flamingos','nilpferde'],['affen','papageien'],['kamele','fennek'],['pinguine','schneegaense'],['steinboecke','murmeltiere'],['elefanten','warzenschweine'],['otter','schwan'],['pandas','rotepandas'],['eulen','faultiere'],['schildkroeten','korallenriff'],['moschusochsen','schneehasen'],['yaks','mufflons'],['reptilien','skorpione'],['seeloewen','pinguine']];
const friendOf=(k1,k2)=>{k1=String(k1).split(/[#^]/)[0];k2=String(k2).split(/[#^]/)[0];return FRIENDS.findIndex(([x,y])=>(x===k1&&y===k2)||(x===k2&&y===k1))};
// Formen: Innenhof (freies Feld ganz von Gehegen umschlossen), Allee (4 Gehege in einer geraden Reihe), Dreiländereck (3 Lebensräume an einer Ecke)
function shapes92(bs,idx){const out=new Map(),put=(b,k)=>{const o=out.get(b.id)||{};o[k]=1;out.set(b.id,o)},G=b=>!!b&&CARDS[b.key].cat==='gehege';
  for(const[q,r]of BOARD){const k=hk(q,r);if(idx.has(k)||TERR.get(k)==='block')continue;const ns=DIRS.map(([dq,dr])=>idx.get(hk(q+dq,r+dr)));if(ns.every(G))ns.forEach(n=>put(n,'hof'))}
  for(const[dq,dr]of[[1,0],[0,1],[1,-1]])for(const[q,r]of BOARD){if(!G(idx.get(hk(q,r)))||G(idx.get(hk(q-dq,r-dr))))continue;const run=[];let x=q,y=r;while(G(idx.get(hk(x,y)))){const b=idx.get(hk(x,y));if(!run.includes(b))run.push(b);x+=dq;y+=dr}if(run.length>=4)run.forEach(b=>put(b,'allee'))}
  for(const[q,r]of BOARD){const a=idx.get(hk(q,r));if(!G(a))continue;for(let i=0;i<6;i++){const[d1q,d1r]=DIRS[i],[d2q,d2r]=DIRS[(i+1)%6],b1=idx.get(hk(q+d1q,r+d1r)),b2=idx.get(hk(q+d2q,r+d2r));if(G(b1)&&G(b2)&&a!==b1&&b1!==b2&&a!==b2&&new Set([a,b1,b2].map(x=>CARDS[x.key].hab)).size===3)[a,b1,b2].forEach(x=>put(x,'drei'))}}
  return out}
// 0.93 schneller: Zahlen-Schlüssel statt Text; Teil-Listen (Hypothesen beim Auszählen) nehmen die Formen der vollen Liste
let SH92=null,SH92F=null;const shKey=bs=>{let h=TERR.size|0;for(const b of bs){const c=b.cells[0];h=(Math.imul(h,31)+b.id*7919+c[0]*131+c[1]*17+b.cells.length)|0}return h+':'+bs.length};
const shapesOf=(bs,idx)=>{const full=state&&state.buildings;
  if(full&&bs!==full&&bs.length<full.length){const fk=shKey(full);if(!SH92F||SH92F.key!==fk)SH92F={key:fk,ids:new Set(full.map(b=>b.id)),idx:null};
    let sub=true;for(const b of bs)if(!SH92F.ids.has(b.id)){sub=false;break}if(sub){if(!SH92F.idx)SH92F.idx=mkIndex(full);return shapesOf(full,SH92F.idx)}}
  const key=shKey(bs);if(!SH92||SH92.key!==key)SH92={key,m:shapes92(bs,idx)};return SH92.m};
const SHAPEN={hof:['🏡','Innenhof','freies Feld ganz von Gehegen umschlossen: alle Gehege daneben ×1,2'],allee:['🌳','Allee','4 Gehege in einer geraden Reihe: je +2 B'],drei:['🔺','Dreiländereck','3 Gehege aus 3 Lebensräumen treffen sich an einer Ecke: je +2 N']};
// alle Zusatz-Wirkungen von 0.92 für ein Gebäude: [Label, Faktor B, Faktor N] oder {a,s}
// 0.94: starke Lebensraum-Regeln (gelten immer im Zoolatro-Lauf, nicht im Tutorial)
// 0.94 neue Spezialisten (floss, jaeger, wgast, wnat): Daten in daten/spezialisten.json, Wirkungen in SPEZ_WIRKUNG (Modul 01)
const grwN=k=>{try{const r=runOf();return(r&&r.grw&&r.grw[k])||0}catch(e){return 0}},GRWMAX=2,grwF=k=>+Math.min(GRWMAX,1+.02*grwN(k)).toFixed(2),grwV=k=>grwF(k);
function grwBuilt(key){const r=runOf(),c=CARDS[key];if(!r||!c)return;r.grw=r.grw||{};if(hasSpec('wgast')&&(c.cat==='essen'||c.cat==='attr')&&key!=='flossteil')r.grw.ga=(r.grw.ga||0)+1;if(hasSpec('wnat')&&c.cat==='schutz')r.grw.nat=(r.grw.nat||0)+1}
function jaegerDay(){if(!hasSpec('jaeger')||!state.zl)return;const idx=mkIndex(state.buildings);for(const b of shuffle(state.buildings.filter(x=>isCat(x,'gehege')&&has(x,'raubtier')))){const prey=nbrs(b,idx).filter(n=>isCat(n,'gehege')&&has(n,'beute')&&!CARDS[n.key].ms);if(!prey.length||Math.random()>=.25)continue;const p=pickRnd(prey),c=CARDS[p.key];
  state.buildings=state.buildings.filter(x=>x!==p);b.ate=(b.ate||0)+1;b.ea=(b.ea||0)+2*c.a;b.es=(b.es||0)+2*c.s;state.bannerQ=(state.bannerQ||[]).concat([['🏹 Der Jäger hat zugeschlagen',`${CARDS[b.key].icon} ${CARDS[b.key].name} hat ${c.icon} ${c.name} gefressen: dauerhaft +${2*c.a} B und +${2*c.s} N.`,'jaeger','Spezialist Jäger: Jeden Tag frisst ein Raubtier mit 25 % Chance ein benachbartes Beutetier. Das Beutetier ist weg, das Raubtier bekommt dauerhaft dessen doppelte Grundpunkte.']]);break}}
const HABRULE={wasser:'💧 <b>Fluss:</b> Wasser-Gehege in einer Kette (höchstens 3 Seiten an anderen Wasser-Gehegen) ×1,5, je 3 Glieder Kettenlänge +0,25 (höchstens ×2). Ein einzelnes Wasser-Gehege ohne Wasser-Nachbarn bleibt bei ×1. Hat ein Gehege mehr als 3 Seiten an Wasser („Klumpen“), zählt die ganze Kette nur ×0,5.',
  savanne:'🌾 <b>Herde:</b> Zusammenhängende Savannen-Gehege ×(1 + 0,15 je weiteres Gehege der Gruppe), höchstens ×2. Allein stehend nur ×0,5.',
  wald:'🌿 <b>Schutzgebiet:</b> Dschungel-Gehege mit einem Naturschutz-Gebäude daneben ×2, ohne nur ×0,5. Ein Naturschutz-Gebäude versorgt alle Dschungel-Gehege rundherum. Attraktionen und Gastro daneben sind erlaubt.',
  wueste:'🏜️ <b>Einzelgänger:</b> Wüsten-Gehege ohne anderes Wüsten-Gehege daneben ×2, mit Wüsten-Nachbar nur ×0,5.',
  arktis:'🧊 <b>Nordlage:</b> Arktis-Gehege in der markierten Nordhälfte des Geländes ×2. Liegt eins außerhalb, zählt seine ganze Gruppe zusammenhängender Arktis-Gehege nur ×0,5.',
  gebirge:'⛰️ <b>Rand und Felsen:</b> Gebirgs-Gehege mit einem Feld am Geländerand oder neben einem Felsen ×1,5, je weiteres +0,25 (höchstens ×2). Steht eins ganz innen, zählt seine ganze Gruppe zusammenhängender Gebirgs-Gehege nur ×0,5.'};
const HABRN={wasser:'Fluss',savanne:'Herde',wald:'Schutzgebiet',wueste:'Einzelgänger',arktis:'Nordlage',gebirge:'Rand und Felsen'};
const QUIET=k=>ruhigC({key:k});
function flossLen(bs){const F=bs.filter(b=>b.key==='flossteil');if(!F.length)return 0;const idx=mkIndex(F),seen=new Set();let best=0;for(const b of F){if(seen.has(b))continue;let n=0;const st=[b];seen.add(b);while(st.length){const x=st.pop();n++;for(const y of nbrs(x,idx))if(!seen.has(y)){seen.add(y);st.push(y)}}best=Math.max(best,n)}return best}
let NMID=null;const northMid=()=>{if(!NMID||NMID.b!==BOARD){const v=BOARD.map(([q,r])=>r).sort((a,b)=>a-b);NMID={b:BOARD,m:v.length?(v[(v.length-1)>>1]+v[v.length>>1])/2:0}}return NMID.m};
const isNorth=cells=>{const r=cells.reduce((t,c)=>t+c[1],0)/cells.length;return r<northMid()};
const habRulesOn=()=>!!(typeof state!=='undefined'&&state&&state.zl&&state.mode==='camp'&&(!TUTNOW||state.tutHerd));
function grpN(b,idx,h){const seen=new Set([b]),st=[b];while(st.length){const x=st.pop();for(const[q,r]of x.cells)for(const[dq,dr]of DIRS){const n=idx.get(hk(q+dq,r+dr));if(n&&!seen.has(n)&&isCat(n,'gehege')&&isHab(n,h)){seen.add(n);st.push(n)}}}return seen.size}
function grpList(b,idx,h){const seen=new Set([b]),st=[b];while(st.length){const x=st.pop();for(const[q,r]of x.cells)for(const[dq,dr]of DIRS){const n=idx.get(hk(q+dq,r+dr));if(n&&!seen.has(n)&&isCat(n,'gehege')&&isHab(n,h)){seen.add(n);st.push(n)}}}return[...seen]}
const wSides=(b,idx)=>{let sd=0;for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const n=idx.get(hk(q+dq,r+dr));if(n&&n!==b&&isCat(n,'gehege')&&isHab(n,'wasser'))sd++}return sd};
const gebN=b=>{const ks=new Set();let e=0;for(const[q,r]of b.cells){if(isEdge(q,r))e++;for(const[dq,dr]of DIRS){const k=hk(q+dq,r+dr);if(TERR.get(k)==='block')ks.add(k)}}return e+ks.size};
// 0.95: Verstoß eines einzelnen Geheges (bricht die ganze Gruppe)
function habViol(b,idx){const c=K(b);if(!c||c.cat!=='gehege')return false;const h=c.hab;if(TUTNOW&&h!=='savanne')return false;
  if(h==='wasser')return wSides(b,idx)>3;if(h==='gebirge')return gebN(b)===0;if(h==='arktis')return!isNorth(b.cells);return false}
const HABBRK={wasser:'Fluss verklumpt',gebirge:'Gebirge: eins ganz innen',arktis:'Nordlage gebrochen'};
function habRule(b,c,nb,idx){if(c.cat!=='gehege'||!c.hab)return null;if(TUTNOW&&c.hab!=='savanne')return null;const h=c.hab,f2=x=>+Math.min(2,x).toFixed(2),fx=x=>String(x).replace('.',',');
  if(HABBRK[h]){const G=grpList(b,idx,h);if(G.some(x=>habViol(x,idx)))return[`${HABBRK[h]}: ${G.length>1?'ganze Gruppe ('+G.length+') ':''}×0,5`,.5,.5];
    if(h==='wasser'){if(!wSides(b,idx))return null;const f=f2(1.5+.25*Math.floor(G.length/3));return[`💧 Fluss: Kette aus ${G.length} ×${fx(f)}`,f,f]}
    if(h==='arktis')return['🧊 Nordlage ×2',2,2];
    if(h==='gebirge'){const n=gebN(b),f=f2(1.5+.25*(n-1));return[`⛰️ Rand/Felsen (${n}) ×${fx(f)}`,f,f]}}
  if(h==='wald')return nb.some(n=>isCat(n,'schutz'))?['🌿 Schutzgebiet: Naturschutz daneben ×2',2,2]:['🌿 Schutzgebiet: kein Naturschutz daneben ×0,5',.5,.5];
  if(h==='savanne'){const g=grpN(b,idx,'savanne');if(g<2)return['🌾 Herde: allein ×0,5',.5,.5];const f=f2(1+(CTX.dk==='steppe'?.2:.15)*(g-1));return[`🌾 Herde aus ${g} ×${fx(f)}`,f,f]}
  if(h==='wueste')return nb.some(n=>isCat(n,'gehege')&&isHab(n,'wueste'))?['🏜️ Einzelgänger: Wüsten-Nachbar ×0,5',.5,.5]:['🏜️ Einzelgänger: allein ×2',2,2];
  return null}
// Vorschau: bricht ein neues Gehege/Gebäude eine Gruppe?
function habBreakTxt(all,nb0){if(!habRulesOn())return'';const ix=mkIndex(all),ix0=mkIndex(all.filter(x=>x!==nb0)),out=[];const cand=new Set();for(const x of all)if(x!==nb0&&isCat(x,'gehege')&&HABBRK[K(x).hab])cand.add(x);
  const done=new Set();for(const x of cand){if(done.has(x))continue;const h=K(x).hab,G=grpList(x,ix,h);G.forEach(y=>done.add(y));const now=G.some(y=>habViol(y,ix));if(!now||G.length<2)continue;const before=grpList(x,ix0,h).some(y=>y!==nb0&&habViol(y,ix0));if(!before){const bad=G.find(y=>habViol(y,ix)),bc=bad&&CARDS[bad.key],who=!bc?'':h==='wasser'?`${bc.icon} ${bc.name} hat ${wSides(bad,ix)} Seiten an Wasser (erlaubt 3). `:h==='gebirge'?`${bc.icon} ${bc.name} steht ganz innen. `:h==='arktis'?`${bc.icon} ${bc.name} liegt außerhalb der Nordhälfte. `:'';out.push(`⚠️ ${HABBRK[h]}: ${who}${G.length} ${HAB[h].label}-Gehege zählen nur ×0,5`)}}
  return out.map(t=>`<p class="resbad">${t}</p>`).join('')}
function extra92(b,c,nb,bs,idx){const o=[];if(!state||!state.zl)return o;if(habRulesOn()){const hr=habRule(b,c,nb,idx);if(hr)o.push(hr)}
  if(b.ea||b.es)o.push({l:`🍖 Jäger: ${b.ate||1}× Beute gefressen (zählt für die Reinheit als ${b.ate||1} Art${(b.ate||1)>1?'en':''} mehr)`,a:b.ea||0,s:b.es||0});const geh=c.cat==='gehege',L=LK(),cells=b.cells.map(([q,r])=>hk(q,r));
  if(geh){const f=new Set();for(const n of nb){if(!isCat(n,'gehege')||n.key===b.key)continue;const i=friendOf(b.key,n.key);if(i>=0&&!f.has(i)){f.add(i);o.push([`🤝 Freundschaft mit ${CARDS[n.key].name}`,1.25,1.25])}}
    const sh=shapesOf(bs,idx).get(b.id);if(sh){if(sh.hof)o.push(['🏡 Innenhof',1.2,1.2]);if(sh.allee)o.push({l:'🌳 Allee',a:2,s:0});if(sh.drei)o.push({l:'🔺 Dreiländereck',a:0,s:2})}
    const ns=(state.nests||[]).filter(k=>b.cells.some(([q,r])=>DIRS.some(([dq,dr])=>hk(q+dq,r+dr)===k))).length;if(ns)o.push({l:'🪺 Storchennest daneben',a:0,s:2*ns})}
  if(state.fav===b.id)o.push(['❤️ Besucherliebling des Tages',2,2]);else if(state.fav!=null&&nb.some(n=>n.id===state.fav))o.push(['❤️ neben dem Besucherliebling',1.25,1.25]);
  if(geh&&state.lottoH&&hasSpec('lotto')&&c.hab===state.lottoH)o.push(['🎰 Lebensraum-Lotto',2,2]);
  if(state.tfeld&&hasSpec('tagesfeld')&&cells.includes(state.tfeld))o.push(['⭐ Tagesfeld',3,3]);
  if(state.vline&&hasSpec('vermesser')&&cells.some(k=>state.vline.includes(k)))o.push(['📏 Vermesser-Linie',2,2]);
  if(hasSpec('rand')){const P=panoSet(),e=cnt(b.cells,([q,r])=>P.has(hk(q,r)));if(e){const f=+(1+e/b.cells.length).toFixed(2);o.push([`🌄 Panorama-Lage (${e} von ${b.cells.length} Feldern)`,f,f])}}
  if(state.foto===b.id)o.push(['📸 Fotograf',3,3]);
  if(geh&&state.zl.news&&c.tags.includes('show'))o.push(['📰 Zeitungsartikel',1.5,1.5]);
  if(b.pr==='wackel')o.push(['🫙 Wackelig',2,2]);
  if(L){if(L.lucky.includes(b.id))o.push(['🎲 GLÜCK!',3,3]);if(L.encore.includes(b.id))o.push(['🔂 Zugabe',2,2]);if(L.zirkus&&geh&&c.tags.includes('show'))o.push(['🎪 Zirkus-Zelt',2,2])}
  return o}
// Tagesereignisse am Morgen
function cellRuleOk(k){const R=state&&state.rule;if(!R)return true;const[q,r]=k.split(',').map(Number);if(R.id==='eingang'&&R.entry&&hk(...R.entry)===k)return false;if(R.id==='halb'&&state.season===0&&!halfOk(R,q,r))return false;if(R.id==='achse'&&(R.ax?R.ax.includes(k):r===R.row))return false;return true}
const freeCells=()=>{const idx=mkIndex(state.buildings),ns=new Set(state.nests||[]);return BOARD.map(([q,r])=>hk(q,r)).filter(k=>!idx.has(k)&&TERR.get(k)!=='block'&&!ns.has(k))};
const MOMENTS={
  foto:{ic:'📸',t:'Ein Fotograf kommt',when:'m',ok:()=>state.buildings.some(b=>isCat(b,'gehege')&&has(b,'show')),go:()=>{const L=state.buildings.filter(b=>isCat(b,'gehege')&&has(b,'show')),b=L[Math.floor(Math.random()*L.length)];state.foto=b.id;return`${CARDS[b.key].icon} ${CARDS[b.key].name} zählt heute ×3`}},
  geburtstag:{ic:'🎂',t:'Kindergeburtstag im Zoo',when:'m',ok:()=>true,go:()=>{state.money+=15;state.stats.earned+=15;return'+15 Taler'}},
  storch:{ic:'🪺',t:'Ein Storch nistet',when:'a',ok:()=>nestCells().length>0,go:()=>{const L=nestCells(),k=L[Math.floor(Math.random()*L.length)];state.nests=(state.nests||[]).concat([k]);return'Gehege neben dem Nest bekommen bis Zoo-Ende +2 N'}},
  herde:{ic:'🦓',t:'Die Herde zieht weiter',when:'a',ok:()=>herdCells().length>0,go:()=>{const L=herdCells(),k=L[Math.floor(Math.random()*L.length)],[q,r]=k.split(',').map(Number);state.buildings.push({id:state.nextId++,key:'warzenschweine',cells:[[q,r]],lvl:1});return'Ein Warzenschwein-Gehege ist gratis dazugekommen'}}};
const MOMW={foto:.5,storch:.5,geburtstag:1,herde:1};
const nestCells=()=>{const idx=mkIndex(state.buildings);return freeCells().filter(k=>{const[q,r]=k.split(',').map(Number);return DIRS.some(([dq,dr])=>{const n=idx.get(hk(q+dq,r+dr));return n&&isCat(n,'gehege')&&isHab(n,'wasser')})})};
const herdCells=()=>{if(!habsNow().includes('savanne'))return[];const idx=mkIndex(state.buildings);return freeCells().filter(k=>{const t=TERR.get(k);if(t&&t!=='savanne')return false;const[q,r]=k.split(',').map(Number);return DIRS.some(([dq,dr])=>{const n=idx.get(hk(q+dq,r+dr));return n&&isCat(n,'gehege')&&isHab(n,'savanne')&&n.cells.length>=2})})};
function dayRoll(){try{jaegerDay()}catch(e){console.warn(e)}state.chaosB=null;if(winIs('chaos')){const L=state.buildings.filter(b=>!CARDS[b.key].ms);if(L.length){const b=L[Math.floor(Math.random()*L.length)];state.chaosB=b.id;state.bannerQ=(state.bannerQ||[]).concat([['🌨️ Schneechaos',`${CARDS[b.key].icon} ${CARDS[b.key].name} ist heute eingeschneit und zählt nicht.`,'chaos','Winter-Bedingung Schneechaos: Jeden Wintertag ist ein zufälliges Gehege/Gebäude eingeschneit (❄️ auf dem Feld) und zählt an diesem Tag nicht.']])}}state.fav=null;state.foto=null;state.lottoH=null;state.tfeld=null;state.vline=null;state.news=state.news||[];state.momEve=null;if(!luckOn())return;
  const G=state.buildings.filter(b=>isCat(b,'gehege'));if(G.length&&state.season>=1){state.fav=G[Math.floor(Math.random()*G.length)].id;const fb=G.find(b=>b.id===state.fav);state.bannerQ=(state.bannerQ||[]).concat([['❤️ Besucherliebling',`${CARDS[fb.key].icon} ${CARDS[fb.key].name} zählt heute ×2`,'fav','Jeden Tag ab dem Sommer wählen die Besucher ein Lieblings-Gehege. Es zählt heute doppelt, die Gehege direkt daneben ×1,25. Du erkennst es am ❤️ auf dem Spielfeld.']])}
  if(hasSpec('lotto')){const H=habsNow();state.lottoH=H[Math.floor(Math.random()*H.length)]}
  const all=BOARD.map(([q,r])=>hk(q,r)).filter(k=>TERR.get(k)!=='block');if(hasSpec('tagesfeld'))state.tfeld=all[Math.floor(Math.random()*all.length)];
  if(hasSpec('vermesser')){const k0=all[Math.floor(Math.random()*all.length)],[q0,r0]=k0.split(',').map(Number),[dq,dr]=[[1,0],[0,1],[1,-1]][Math.floor(Math.random()*3)],seq=[];{let q=q0,r=r0;while(ONBOARD.has(hk(q-dq,r-dr))){q-=dq;r-=dr}while(ONBOARD.has(hk(q,r))){seq.push(hk(q,r));q+=dq;r+=dr}}const nL=Math.min(VLEN,seq.length),i0=Math.floor(Math.random()*(seq.length-nL+1));state.vline=seq.slice(i0,i0+nL)}
  // Zoo-Momente (0.93): 10 % je Tag, höchstens 1 je Jahreszeit; Fotograf und Storch halb so oft, höchstens 1× je Zoo; Fotograf erst ab Sommer
  const mk=state.zoo+'/'+state.season;state.momS=state.momS&&state.momS.k===mk?state.momS:{k:mk,ids:[]};if(!state.momZ||state.momZ.z!==state.zoo)state.momZ={z:state.zoo,ids:[]};
  if(state.momS.ids.length<1&&Math.random()<chance(.1)){const av=Object.keys(MOMENTS).filter(id=>!state.momS.ids.includes(id)&&MOMENTS[id].ok()&&!(MOMW[id]<1&&state.momZ.ids.includes(id))&&!(id==='foto'&&state.season<1));if(av.length){let tot=0;for(const id of av)tot+=MOMW[id]||1;let x=Math.random()*tot,id=av[av.length-1];for(const j of av){x-=MOMW[j]||1;if(x<0){id=j;break}}const M=MOMENTS[id];state.momS.ids.push(id);state.momZ.ids.push(id);if(M.when==='m'){const t=M.go();state.news.push(`${M.ic} ${M.t}`);state.bannerQ=(state.bannerQ||[]).concat([[M.ic+' '+M.t,t]])}else state.momEve=id}}}
// Abends (nach der Abrechnung, in endDay)
function eveMoment(){const id=state.momEve;state.momEve=null;if(!id||!MOMENTS[id]||!MOMENTS[id].ok())return;const M=MOMENTS[id],t=M.go();(state.news=state.news||[]).push(`${M.ic} ${M.t}`);state.bannerQ=(state.bannerQ||[]).concat([[M.ic+' '+M.t,t]]);state.terr=[...TERR]}
// Landschaft wächst (Ende jeder Jahreszeit): Dschungel +1 Feld, Wüste im Sommer +2, Quelle zwischen Wasser-Gehegen (35 %); Wackelige Gebäude zerbrechen mit 1 zu 6
function seasonTurn(){const out=[];if(!luckOn())return out;const idx=mkIndex(state.buildings),H=habsNow(),grow=(h,n)=>{let g=0;for(let i=0;i<n;i++){const C=freeCells().filter(k=>!TERR.get(k)&&!idx.has(k)&&(()=>{const[q,r]=k.split(',').map(Number);return DIRS.some(([dq,dr])=>TERR.get(hk(q+dq,r+dr))===h)})());if(!C.length)break;TERR.set(C[Math.floor(Math.random()*C.length)],h);g++}return g};
  const canGrow=h=>freeCells().some(k=>!TERR.get(k)&&!idx.has(k)&&(()=>{const[q,r]=k.split(',').map(Number);return DIRS.some(([dq,dr])=>TERR.get(hk(q+dq,r+dr))===h)})());
  const qC=()=>freeCells().filter(k=>!TERR.get(k)&&(()=>{const[q,r]=k.split(',').map(Number);return cnt(DIRS,([dq,dr])=>{const n=idx.get(hk(q+dq,r+dr));return!!n&&isCat(n,'gehege')&&isHab(n,'wasser')})>=2})());
  const cand=[];if(H.includes('wald')&&canGrow('wald'))cand.push('wald');if(H.includes('wueste')&&canGrow('wueste'))cand.push('wueste');if(H.includes('wasser')&&qC().length)cand.push('quelle');
  const pickL=cand.length&&Math.random()<chance(.4)?cand[Math.floor(Math.random()*cand.length)]:null;
  if(pickL==='wald'&&grow('wald',1))out.push(['🌳','Der Dschungel wächst','Ein freies Feld ist jetzt Dschungel-Naturfläche.']);
  if(pickL==='wueste'&&grow('wueste',2))out.push(['🏜️','Die Wüste breitet sich aus','Zwei freie Felder sind jetzt Wüsten-Naturfläche.']);
  if(pickL==='quelle'){const C=freeCells().filter(k=>!TERR.get(k)&&(()=>{const[q,r]=k.split(',').map(Number);return cnt(DIRS,([dq,dr])=>{const n=idx.get(hk(q+dq,r+dr));return!!n&&isCat(n,'gehege')&&isHab(n,'wasser')})>=2})());if(C.length){TERR.set(C[Math.floor(Math.random()*C.length)],'wasser');out.push(['💧','Eine Quelle entspringt','Zwischen deinen Wasser-Gehegen ist jetzt Wasser-Naturfläche.'])}}
  const run=runOf();for(const b of state.buildings.slice()){if(b.pr!=='wackel'||Math.random()>=1/6)continue;state.buildings=state.buildings.filter(x=>x!==b);if(run){const i=run.deck.indexOf(prKey(b.key,'wackel'));if(i>=0)run.deck.splice(i,1)}out.push(['🫙',`${CARDS[b.key].name} ist zerbrochen`,'Wackelig: weg aus Zoo und Deck.'])}
  state.terr=[...TERR];return out}
const runAus=id=>{try{const r=runOf();return!!(r&&(r.ausbau||[]).includes(id))}catch(e){return false}};
const mixFree=()=>!!state&&hasSpec('mischer')&&state.rdMix!==(state.zoo||0)+'/'+state.season+'/'+state.day;
function twitchTeam(id){const tb=document.querySelector(`#team [data-sp="${id}"]`);if(!tb||tb.classList.contains('hop'))return;tb.classList.remove('twitch');void tb.offsetWidth;tb.classList.add('twitch')}
function hopTeam(id,txt){const tb=document.querySelector(`#team [data-sp="${id}"]`);if(!tb)return;tb.classList.remove('hop');void tb.offsetWidth;tb.classList.add('hop');try{Sfx.sparkle()}catch(e){}if(txt){const f=document.createElement('span');f.className='tmf';f.textContent=txt;tb.appendChild(f);setTimeout(()=>f.remove(),1600)}}
function auswilder(id){const b=state.buildings.find(x=>x.id===id);if(!b||!isCat(b,'gehege')||!hasSpec('ausw')||state.phase!=='play')return;const key=(state.zoo||0)+'/'+state.season;if(state.auswS===key){Sfx.deny();return}
  state.buildings=state.buildings.filter(x=>x!==b);const run=runOf();if(run){let i=run.deck.indexOf(b.key);if(i<0)i=run.deck.findIndex(k=>baseK(String(k).split('^')[0].split('~')[0])===b.key);if(i>=0)run.deck.splice(i,1)}
  state.auswS=key;state.auswDay=state.day+'/'+state.season;state.undo=[];state.info=null;state.bannerQ=(state.bannerQ||[]).concat([['🌿 Ausgewildert!',`${CARDS[b.key].name} ist in die Freiheit zurück. Heute ×1,5 Natur.`]]);Sfx.win();render();flushBanners()}
function banner92(t,x){const ba=document.querySelector('.boardarea');if(!ba)return;const bn=document.createElement('div');bn.className='mbanner';bn.innerHTML=`<b>${t}</b><span>${x}</span>`;ba.appendChild(bn);setTimeout(()=>bn.remove(),3000)}
// 0.93: eine Warteschlange für alles, was aufploppt – immer nur eins, beim ersten Mal je Spielstand als Fenster mit Erklärung
let POPQ=[],POPBUSY=false;
function popEx(key){const K=String(key);
  if(K.includes('Fotograf'))return'Zoo-Moment: Passiert zufällig, höchstens einer je Jahreszeit. Ein Showtier wird heute fotografiert und zählt bei der Abrechnung dreifach.';
  if(K.includes('Kindergeburtstag'))return'Zoo-Moment: Passiert zufällig, höchstens einer je Jahreszeit. Eine Geburtstagsfeier bringt dir sofort Taler.';
  if(K.includes('Storch'))return'Zoo-Moment: Ein Storch baut ein Nest auf einem freien Feld neben einem Wasser-Gehege. Alle Gehege neben dem Nest bekommen bis zum Ende des Zoos +2 N. Bau das Nest-Feld also besser nicht zu.';
  if(K.includes('Herde'))return'Zoo-Moment: Neben einem großen Savannen-Gehege lässt sich eine Herde nieder. Du bekommst gratis ein Warzenschwein-Gehege dazu.';
  if(K.includes('Freundschaft'))return'Manche Tierarten mögen sich. Stehen ihre Gehege nebeneinander, zählen beide ×1,25. Entdeckte Freundschaften findest du im Tierlexikon.';
  if(K.includes('Form'))return'Formen entstehen durch die Anordnung deiner Gebäude. Sie wirken, solange die Form besteht. Mit der Lupe siehst du, welche Gehege davon profitieren.';
  if(K.includes('Dschungel wächst')||K.includes('Wüste')||K.includes('Quelle'))return'Die Landschaft verändert sich am Ende jeder Jahreszeit von selbst. Neue Naturflächen machen passende Gehege stärker.';
  if(K.includes('zerbrochen'))return'Wackelige Gebäude zählen doppelt, können aber am Ende jeder Jahreszeit mit 1 zu 6 zerbrechen. Dann sind sie weg, auch aus dem Deck.';
  if(K.includes('Ausgewildert'))return'Die Auswilderung nimmt ein Gehege aus Zoo und Deck. Dafür zählt heute die Natur ×1,5.';
  return''}
function flushBanners(){const q=state&&state.bannerQ;if(q&&q.length){state.bannerQ=[];POPQ.push(...q)}setTimeout(popNext,400)}
function popBlocked(){return !state||state.phase!=='play'||!!(document.getElementById('wishPop')||modal||screen||document.querySelector('.popwin'))}
function popNext(){if(POPBUSY||!POPQ.length)return;if(popBlocked()){if(!popNext.t)popNext.t=setTimeout(()=>{popNext.t=0;popNext()},600);return}
  const items=POPQ.splice(0,POPQ.length);let sl=null;try{sl=activeSlot()}catch(e){}POPBUSY=true;const seen=sl?(sl.popSeen=sl.popSeen||{}):{};
  const rows=items.map(([t,x,k,ex0])=>{const key=k||String(t).replace(/!.*$/,'').replace(' entdeckt','').trim(),first=!seen[key];seen[key]=1;const ex=first?(ex0||popEx(key)):'';return{t,x,ex}});try{saveSoon()}catch(e){}
  const w=document.createElement('div');w.className='wishpop popwin';
  w.innerHTML=`<div class="wpc">${rows.length>1?`<h3>Neu im Zoo (${rows.length})</h3><div class="pqlist">${rows.map(r=>`<div class="pqrow"><b>${r.t}</b><span>${r.x}</span>${r.ex?`<small>${r.ex}</small>`:''}</div>`).join('')}</div>`:`<h3>${rows[0].t}</h3><p class="wpw" style="font-weight:600;font-size:15px">${rows[0].x}</p>${rows[0].ex?`<p class="wph" style="font-size:13.5px;color:#4a3a1a">${rows[0].ex}</p>`:''}`}<button class="btn main">Weiter</button></div>`;
  document.body.appendChild(w);try{Sfx.combo()}catch(e){}w.querySelector('button').onclick=()=>{try{Sfx.select()}catch(e){}w.remove();POPBUSY=false;setTimeout(popNext,250)}}
// Entdeckungen beim Bauen: Freundschaft (fürs Lexikon) und Formen (je Zoo einmal groß)
function discover92(){if(!luckOn())return;const sl=activeSlot(),bs=state.buildings,idx=mkIndex(bs);sl.friends=sl.friends||{};state.shapeSeen=state.shapeSeen||{};
  for(const b of bs){if(!isCat(b,'gehege'))continue;for(const n of nbrs(b,idx)){const i=friendOf(b.key,n.key);if(i<0)continue;const id=FRIENDS[i].join('+');if(!state.friendSeen)state.friendSeen={};if(state.friendSeen[id])continue;state.friendSeen[id]=1;const neu=!sl.friends[id];sl.friends[id]=1;state.bannerQ=(state.bannerQ||[]).concat([['🤝 Freundschaft'+(neu?' entdeckt!':'!'),`${CARDS[FRIENDS[i][0]].icon} ${CARDS[FRIENDS[i][0]].name} und ${CARDS[FRIENDS[i][1]].icon} ${CARDS[FRIENDS[i][1]].name} vertragen sich: beide ×1,25${neu?' · steht jetzt im Tierlexikon':''}`]])}}
  const sh=shapesOf(bs,idx),got=new Set();for(const o of sh.values())for(const k in o)got.add(k);for(const k of got){if(state.shapeSeen[k])continue;state.shapeSeen[k]=1;const S=SHAPEN[k];state.bannerQ=(state.bannerQ||[]).concat([[`${S[0]} Form: ${S[1]}!`,S[2]]])}}
// Heute-Zeile im Infokasten
function todayHtml(){if(!state||!state.zl)return'';const L=[],B=id=>{const b=state.buildings.find(x=>x.id===id);return b?CARDS[b.key].icon+' '+CARDS[b.key].name:''};
  if(state.fav!=null&&B(state.fav))L.push(`❤️ <b>${B(state.fav)}</b> ×2`);
  if(state.lottoH&&hasSpec('lotto'))L.push(`🎰 ${HAB[state.lottoH].icon} ${HAB[state.lottoH].label} ×2`);
  if(state.tfeld&&hasSpec('tagesfeld')){const tb=state.buildings.find(b=>b.cells.some(([q,r])=>hk(q,r)===state.tfeld));L.push(tb?`⭐ <b>${CARDS[tb.key].icon} ${CARDS[tb.key].name}</b> ×3`:'⭐ Feld ×3')}if(state.vline&&hasSpec('vermesser'))L.push('📏 Linie ×2');
  for(const n of state.news||[])L.push(n);return L.length?`<div class="today">${L.map(x=>`<span>${x}</span>`).join('')}</div>`:''}
function dayMarks(idx){let o='';const mark=(k,cls,t)=>{const[q,r]=k.split(',').map(Number),[x,y]=px(q,r);o+=`<polygon class="${cls}" points="${hexPts(x,y,SZ*.86)}" pointer-events="none"/>`+(t?`<text class="tic zst ${idx.has(k)?'sm':''}" x="${idx.has(k)?x+4.6:x}" y="${idx.has(k)?y-4.6:y}">${t}</text>`:'')};
  if(habRulesOn()&&habsNow().includes('arktis')){const m=northMid();for(const[q,r]of BOARD){if(r>=m||TERR.get(hk(q,r))==='block')continue;const[x,y]=px(q,r);o+=`<polygon class="znorth" points="${hexPts(x,y,SZ*.95)}" pointer-events="none"/>`}}
  if(state.vline&&hasSpec('vermesser'))for(const k of state.vline)mark(k,'zline','');
  if(hasSpec('rand'))for(const k of panoSet())mark(k,'zpano','');
  if(state.tfeld&&hasSpec('tagesfeld')){if(idx.has(state.tfeld)){const[q,r]=state.tfeld.split(',').map(Number),[x,y]=px(q,r);o+=`<polygon class="ztf on" points="${hexPts(x,y,SZ*.9)}" pointer-events="none"/><text class="tfb" x="${x}" y="${(y-5.6).toFixed(2)}">⭐×3</text>`}else mark(state.tfeld,'ztf','⭐')};
  for(const k of state.nests||[])mark(k,'znest','🪺');
  if(habRulesOn()){for(const x of state.buildings){if(!isCat(x,'gehege')||!HABBRK[K(x).hab]||!habViol(x,idx))continue;if(grpList(x,idx,K(x).hab).length<2&&K(x).hab!=='arktis'&&K(x).hab!=='gebirge'&&K(x).hab!=='wasser'&&K(x).hab!=='wald')continue;const[cx,cy]=centroid(x.cells);o+=`<text class="tic zbrk" x="${(cx+5.5).toFixed(2)}" y="${(cy+5.8).toFixed(2)}" pointer-events="none">⚠️</text>`}}
  if(state.chaosB!=null){const b=state.buildings.find(x=>x.id===state.chaosB);if(b)for(const[q,r]of b.cells)mark(hk(q,r),'zchaos','❄️')}
  if(state.fav!=null){const b=state.buildings.find(x=>x.id===state.fav);if(b){const[cx,cy]=centroid(b.cells);o+=`<text class="tic zfav" x="${(cx+5.5).toFixed(2)}" y="${(cy-5.5).toFixed(2)}" pointer-events="none">❤️</text>`}}
  // 0.95: Formen deutlich: Allee als Linie, Innenhof-Feld markiert, Dreiländereck als Punkt an der Ecke
  if(state.zl&&luckOn()){const bs=state.buildings;try{const G=b=>!!b&&CARDS[b.key].cat==='gehege';
    for(const[dq,dr]of[[1,0],[0,1],[1,-1]])for(const[q,r]of BOARD){if(!G(idx.get(hk(q,r)))||G(idx.get(hk(q-dq,r-dr))))continue;const run=[],cs=[];let x=q,y=r;while(G(idx.get(hk(x,y)))){const b=idx.get(hk(x,y));if(!run.includes(b))run.push(b);cs.push([x,y]);x+=dq;y+=dr}
      if(run.length>=4){const[x1,y1]=px(...cs[0]),[x2,y2]=px(...cs[cs.length-1]);o+=`<line class="zallee" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" pointer-events="none"/><text class="tic zshape" x="${((x1+x2)/2).toFixed(1)}" y="${((y1+y2)/2-3).toFixed(1)}" pointer-events="none">🌳 Allee</text>`}}
    for(const[q,r]of BOARD){const k=hk(q,r);if(idx.has(k)||TERR.get(k)==='block')continue;if(DIRS.every(([dq,dr])=>G(idx.get(hk(q+dq,r+dr))))){const[x,y]=px(q,r);o+=`<polygon class="zhof" points="${hexPts(x,y,SZ*.8)}" pointer-events="none"/><text class="tic zshape" x="${x}" y="${y}" pointer-events="none">🏡</text>`}}
    const seenC=new Set();for(const[q,r]of BOARD){const a=idx.get(hk(q,r));if(!G(a))continue;for(let i=0;i<6;i++){const[d1q,d1r]=DIRS[i],[d2q,d2r]=DIRS[(i+1)%6],b1=idx.get(hk(q+d1q,r+d1r)),b2=idx.get(hk(q+d2q,r+d2r));if(G(b1)&&G(b2)&&a!==b1&&b1!==b2&&a!==b2&&new Set([a,b1,b2].map(x=>CARDS[x.key].hab)).size===3){const P=[[q,r],[q+d1q,r+d1r],[q+d2q,r+d2r]].map(c=>px(...c)),cx=(P[0][0]+P[1][0]+P[2][0])/3,cy=(P[0][1]+P[1][1]+P[2][1])/3,ck=cx.toFixed(1)+','+cy.toFixed(1);if(seenC.has(ck))continue;seenC.add(ck);o+=`<circle class="zdrei" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.6" pointer-events="none"/><text class="tic zshape" x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" pointer-events="none">🔺</text>`}}}
    const done=new Set();for(const b of bs){if(!isCat(b,'gehege'))continue;for(const n of nbrs(b,idx)){if(!isCat(n,'gehege')||friendOf(b.key,n.key)<0)continue;const pk=Math.min(b.id,n.id)+'-'+Math.max(b.id,n.id);if(done.has(pk))continue;done.add(pk);
      let best=null;for(const[q,r]of b.cells)for(const[dq,dr]of DIRS){const m=idx.get(hk(q+dq,r+dr));if(m===n){const[x1,y1]=px(q,r),[x2,y2]=px(q+dq,r+dr);best=[(x1+x2)/2,(y1+y2)/2];break}}if(best)o+=`<text class="tic zfriend" x="${best[0].toFixed(2)}" y="${best[1].toFixed(2)}" pointer-events="none">🤝</text>`}}}catch(e){}}
  return o}

const ulWait=sl=>(sl.ulq||[]).map(g=>{const[t,k]=g.split(':');return t==='v'?CARDS[k].icon+' '+CARDS[k].name:DECKS[k].icon+' '+DECKS[k].name});
function verstWinHtml(ks,btn){return`<div class="deckwin"><div class="dwi">🔆</div><h2>${ks.length>1?'Neue Verstärker':'Neuer Verstärker'} freigeschaltet!</h2>${ks.map(k=>{const c=CARDS[k];return`<div class="dwbox"><div class="dwh"><span>${c.icon}</span><div><b>${c.name}</b><small>${fxHtml(c)}</small></div></div><p class="dwg">✓ Geschafft: ${VCOND[k]}</p></div>`}).join('')}<p style="margin:0;color:var(--muted);font-size:13.5px">Verstärker zählen selbst nicht, sie verstärken nur ihre Nachbarn. Ein Exemplar liegt schon in deinem Deck, ab jetzt tauchen sie auch in Kartenauswahl und Laden auf.</p>${btn}</div>`}
function finishGame(){const sl=activeSlot(),won=state.phase==='win',date=Date.now();logZoo(won);tallyZoo();
  if(state.mode==='camp'&&sl&&sl.run){const run=sl.run;if(won)try{fsCheck('zoo')}catch(e){console.warn(e)}run.total=(run.total||0)+state.totalScore;run.stats=state.stats;run.game=null;if(state.zl)run.grow=state.zl.grow;tallyUnlock(sl,run);statZoo(sl,run,won);
    if(run.z2)z2After(sl,run,won);
    if(!won){endRun(false);return}
    if(!run.tut)verstUnlock(sl,run);
    run.kasse=Math.max(0,Math.round(state.money||0));run.zoo++;state=null;modal=null;if(run.zoo===CAMP_GOAL){sl.trophy=sl.trophy||{};sl.trophy[run.deckId||'grund']=1}run.reward=run.zoo===CAMP_GOAL?{step:'won'}:newReward(run);screen='creward';screenArg=run.reward;saveMeta();Sfx.win();renderAll();return}
  // 0.73a: Ende eines freien Spiels gibt es nicht mehr (nur noch Zoolatro-Läufe)
  state=null;modal=null;screen='title';screenArg={};saveMeta();renderAll()}
function summaryHtml(){if((screenArg.sum.newNow||[]).length&&!screenArg.deckAck)return deckWinHtml(screenArg.sum.newNow,'<button class="btn main big" data-sdack="1">Weiter</button>');
  const m=screenArg.sum,mx=Math.max(1,...Object.values(m.habs)),fav=Object.keys(m.habs).reduce((a,b)=>m.habs[b]>m.habs[a]?b:a),tot=Object.values(m.habs).reduce((a,b)=>a+b,0);
  const head=m.camp?(m.won?`🏆 Zoolatro geschafft`:`Lauf beendet`):(m.won?'🏆 Jahr geschafft':'Spiel beendet');
  const sub=m.camp?`${m.zoos} Zoo${m.zoos===1?'':'s'} geschafft`:`${MAPS[m.map]?MAPS[m.map].icon+' '+MAPS[m.map].name:''} · ${m.won?'alle vier Jahreszeiten':'bis '+SEASONS[m.season].name}`;
  const box=(k,v,d='')=>`<div class="sumbox"><span class="k">${k}</span><span class="v">${v}</span>${d?`<span class="d">${d}</span>`:''}</div>`;
  return`<h2>📊 ${head}</h2><p style="margin:0;color:var(--muted)">${sub}</p><div class="bigscore">${fmt(m.total)}</div>${m.z2news||''}${m.fsNow?`<div class="fsbox">${m.fsNow.length?`<b>🔓 In diesem Lauf freigeschaltet</b><div class="fschips">${m.fsNow.map(u=>`<span>${unName(u)}</span>`).join('')}</div>`:`<b>🔓 Diesmal nichts freigeschaltet</b>${(m.fsNear||[]).length?`<div class="fschips">${m.fsNear.map(x=>`<span>${x}</span>`).join('')}</div><small style="color:var(--muted)">am nächsten dran</small>`:''}`}</div>`:''}${m.look?lookHtml(m.look):''}
    <div class="sumgrid">${box('Bester Tag',m.best?fmt(m.best.pts):'–',m.best?`${m.camp?'Zoo '+((m.best.zoo||0)+1)+' · ':''}${SEASONS[m.best.season].name}, Tag ${m.best.day+1}`:'')}${box('Größte Kombo',m.combo?'×'+m.combo:'–',m.combo>=4?'Nachbarn für ein Gehege/Gebäude':'')}
      ${box('Höchster Ausbau','Stufe '+ROMAN[Math.min(3,m.lvl)])}${box('Freigeschaltet',(m.fsNow||[]).length,'in diesem Lauf')}${box('Taler verdient','🪙 '+fmt(m.earned))}${box('Taler ausgegeben','🪙 '+fmt(m.spent))}</div>
    <h3 class="sh">Dein Zoo</h3><div class="habbars">${tot?Object.keys(HAB).map(h=>`<div class="hbar ${h===fav?'fav':''}"><span>${HAB[h].icon} ${HAB[h].label}${h===fav?' ★':''}</span><span class="tr"><i style="width:${m.habs[h]/mx*100}%;background:${HAB[h].col}"></i></span><b>${m.habs[h]}</b></div>`).join(''):'<span style="color:var(--muted);font-size:13px">Keine Gehege gebaut.</span>'}
      <div class="slotrow" style="margin-top:4px"><span>🎡 Attraktionen: ${m.cats.attr}</span><span>🍿 Gastro-Gebäude: ${m.cats.essen}</span><span>🌳 Naturschutz: ${m.cats.schutz}</span></div></div>
    <h3 class="sh">Deine 5 stärksten Karten</h3>${m.top.length?`<div class="toplist">${m.top.map((t,i)=>`<div><span class="rk">${i+1}.</span><span class="nm">${CARDS[t.k].icon} ${CARDS[t.k].name}</span><span class="a">${fmt(t.a)} B</span><span class="s">${fmt(t.s)} N</span></div>`).join('')}</div><p style="margin:0;color:var(--muted);font-size:12.5px">Summe aller Besucher und Natur, die diese Karten über das ganze Spiel eingebracht haben.</p>`:'<p style="margin:0;color:var(--muted)">Für dieses Spiel wurde noch nicht mitgezählt.</p>'}
    ${m.camp&&META.lastRunTxt?'<button class="btn sub" data-runcopy="2" style="align-self:center">📋 Lauf kopieren</button>':''}<button class="btn main big" data-sumnext="1">Weiter</button>`}
/* ---------- spielbares Tutorial: drei Kapitel auf einem kleinen Übungs-Zoo ---------- */
const tB=(k)=>state.buildings.filter(b=>b.key===baseK(k));
const tAdj=(k,f)=>{const idx=mkIndex(state.buildings);return tB(k).some(b=>nbrs(b,idx).some(n=>f(CARDS[n.key],n)))};
const tHand=(...ks)=>s=>{s.discard.push(...s.hand.filter(k=>!ks.includes(k)));s.hand=ks.slice();s.bp=s.bpMax;s.selected=null;s.preview=null;s.undo=[]};
