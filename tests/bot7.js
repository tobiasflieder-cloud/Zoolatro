// läuft im Fenster-Kontext des Spiels
render=function(){};renderModal=function(){};saveMeta=function(){};for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};
var BOT={log:[]};
function botCands(key){const c=CARDS[key],bs=state.buildings,idx=mkIndex(bs),out=[],seen=new Set();
  let anchors=BOARD;if(bs.length){const s=new Set();for(const b of bs)for(const[q,r]of b.cells)for(const[dq,dr]of DIRS)for(const[eq,er]of [[0,0],...DIRS]){const k=hk(q+dq+eq,r+dr+er);if(ONBOARD.has(k)&&!idx.has(k))s.add(k)}anchors=[...s].map(k=>k.split(',').map(Number))}
  for(const[q,r]of anchors)for(let rot=0;rot<6;rot++){const cells=placeCells(key,rot,q,r),sig=cells.map(x=>hk(...x)).sort().join('|');if(seen.has(sig))continue;seen.add(sig);if(fits(bs,cells,key)&&!ruleWhy(bs,cells,key))out.push(cells);if(SHAPES[c.shape].cells.length===1)break}
  if(out.length>36){shuffle(out);out.length=36}
  return out}
function botBest(key,base){let best=null;const bs=state.buildings,c=CARDS[key];
  const ed0=CARDS[key].ed,bk0=baseK(key);for(const cells of botCands(key)){const g=scoreZoo([...bs,ed0?{id:-1,key:bk0,cells,lvl:1,ed:ed0}:{id:-1,key:bk0,cells,lvl:1}]).total-base;if(!best||g>best.g)best={g,cells}}
  const nb=best;let ub=null;if(!c.ms)for(const b of bs)if(b.key===baseK(key)&&(b.lvl||1)<MAXLVL){const g=scoreZoo(bs.map(x=>x===b?Object.assign({},b,{lvl:(b.lvl||1)+1}):x)).total-base;if(!ub||g>ub.g)ub={g,up:b}}
  if(ub&&nb){const C=BOT.cmp=BOT.cmp||{up:0,dup:0,r:[]};if(ub.g>nb.g)C.up++;else C.dup++;C.r.push(ub.g/Math.max(1,nb.g))}if(ub&&(!best||ub.g>best.g))best=ub;
  return best}
function botDay(){for(let guard=0;guard<8;guard++){const base=scoreZoo(state.buildings).total;let pick=null;
    state.hand.forEach((key,hi)=>{if(!affordable(key))return;const b=botBest(key,base);if(!b)return;const v=(b.g+0.01*(CARDS[key].a+CARDS[key].s))/costOf(key);if(!pick||v>pick.v)pick={v,hi,key,b}});
    if(!pick||pick.b.g<0)break;
    if(pick.b.up){pick.b.up.lvl=(pick.b.up.lvl||1)+1;if(CARDS[pick.key].pr&&!pick.b.up.pr)pick.b.up.pr=CARDS[pick.key].pr}else if(0);else{const ed=CARDS[pick.key].ed;{const o={id:state.nextId++,key:baseK(pick.key),cells:pick.b.cells,lvl:1};if(ed)o.ed=ed;if(CARDS[pick.key].pr)o.pr=CARDS[pick.key].pr;state.buildings.push(o)};zlBuilt(pick.key,1)}
    {const c0=costOf(pick.key);state.bp-=c0;if(!c0)state.free1=(state.free1||0)+1}state.hand.splice(pick.hi,1);state.builtToday++;BOT.cur.built++}}
function botScore(){if(typeof rollLuck==='function')try{rollLuck()}catch(e){}const bs=state.buildings,r=scoreZoo(bs),byId=Object.fromEntries(bs.map(b=>[b.id,b]));
  for(const st of r.steps){const b=byId[st.id],e=state.stats.cards[b.key]=state.stats.cards[b.key]||{a:0,s:0};e.a+=st.a;e.s+=st.s;const d=BOT.cur.cd[b.key]=BOT.cur.cd[b.key]||0;BOT.cur.cd[b.key]=d+1}
  const inc=dayIncome(r.A,r.S,state.money);state.money+=inc.total;state.lastIncome=inc;{const L=state._L=state._L||{e:0,c:0,i:0,sp:0};L.e+=inc.entry;L.c+=inc.care;L.i+=inc.interest;L.sp+=inc.spec}
  {const L=state.ledger=state.ledger||{entry:0,care:0,interest:0,early:0};L.entry+=inc.entry;L.care+=inc.care;L.interest+=inc.interest;L.spec=(L.spec||0)+(inc.spec||0)}
  {const t=state.stats;t.days++;if(inc.total>0)t.earned+=inc.total;if(!t.best||r.total>t.best.pts)t.best={pts:r.total,season:state.season,day:state.day,zoo:state.zoo}}
  state.prevY=state.yday;state.yday={A:r.A,S:r.S,total:r.total};state.seasonScore+=r.total;state.totalScore+=r.total;state.lastDay=r.total;state.dayPts[state.day]=r.total;state.phase='review';return r}
function botShop(){const m=state.market;
  if(m&&!BOT.noHire&&(state.spec||[]).length<MAXSPEC){const c=m.items.map(id=>({id,pr:(typeof specPrice==='function'?specPrice(id):priced(SPECPRICE[SPEC[id].tier])),t:SPEC[id].tier})).filter(x=>canPay(x.pr)).sort((a,b)=>b.t-a.t)[0];if(c&&hireSpec(c.id)){state.money-=c.pr;state.stats.spent+=c.pr;m.bought=true;BOT.cur.specs.push(c.id)}}
  {const mp=typeof fixedItems==='function'?fixedItems().find(i=>i.kind==='mappe'):null;if(mp&&!BOT.noHire&&canPay(mp.price)&&(state.spec||[]).length<maxSpec()){buy(mp);const o=(state.mappe&&state.mappe.opts)||[],c=o.slice().sort((a,b)=>SPEC[b].tier-SPEC[a].tier)[0];if(c&&hireSpec(c))BOT.cur.specs.push(c);state.shopSub=null;state.mappe=null}}
  for(const kind of['prog','card','ad'])for(const it of state.shop.items)if(it.kind===kind&&!it.sold&&canPay(it.price)&&!(kind==='prog'&&state.progs.length>=MAXPROGS)){buy(it);if(it.sold&&kind==='prog')BOT.cur.progs.push(it.key)}
  const bp=fixedItems().find(i=>i.kind==='bp');if(bp&&canPay(bp.price))buy(bp);
  beginNextSeason();
  // Zoolatro 2.0: Winter-Bedingung wählen (die mit dem besseren Ertrag für den jetzigen Zoo)
  if(modal==='inspPick'&&state.zl&&state.zl.inspOpts){let best=null,bv=-1;for(const i of state.zl.inspOpts){state.zl.insp=i;syncCtx();const v=scoreZoo(state.buildings).total;if(v>bv){bv=v;best=i}}zlInspPick(best);modal=null}}
function botZoo(){const Z={zoo:state.zoo,seasons:[],miles:[],won:false};let safety=0;
  while(safety++<400){const ph=state.phase;
    if(ph==='play'&&state.zl&&!state.zl.prof){const o=state.zl.opts;Z.prof=BOT.prof&&o.includes(BOT.prof)?BOT.prof:o[Math.floor(Math.random()*3)];zlPick(Z.prof);modal=null;Z.rule=state.rule&&state.rule.id;Z.insp=state.zl.insp}
    else if(ph==='play'){for(const t of state.mileNew||[])Z.miles.push({t,season:state.season,day:state.day});botDay();botScore();endDay()}
    else if(ph==='draft'){const base=scoreZoo(state.buildings).total;let bi=0,bv=-1e9;state.offer.forEach((k,i)=>{const b=botBest(k,base),v=b?b.g/costOf(k):-1;if(v>bv){bv=v;bi=i}});BOT.cur.picked[state.offer[bi]]=(BOT.cur.picked[state.offer[bi]]||0)+1;pick(bi)}
    else if(ph==='seasonWon'){Z.seasons.push({m:state.money,L:Object.assign({},state._L),early:(state.ledger||{}).early,spent:state.stats.spent,s:state.season,pts:state.seasonScore,days:state.day+1,target:seOf(state.season).target});state.pendingSeason=true;nextDraft()}
    else if(ph==='shop')botShop();
    else if(ph==='win'){if(state.season===3&&state.zl){const k=state.zl.insp,sc=i=>{state.zl.insp=i;syncCtx();return scoreZoo(state.buildings).total};Z.zr=[sc('zucht'),sc(null),sc('koenig'),state.buildings.filter(b=>CARDS[b.key].cat==='gehege'&&CARDS[b.key].tags.includes('bedroht')).length,state.buildings.filter(b=>CARDS[b.key].cat==='gehege').length];state.zl.insp=k;syncCtx()}Z.seasons.push({s:state.season,pts:state.seasonScore,days:state.day+1,target:seOf(state.season).target});Z.won=true;break}
    else if(ph==='lost'){if(state.season===3&&state.zl){const k=state.zl.insp,sc=i=>{state.zl.insp=i;syncCtx();return scoreZoo(state.buildings).total};Z.zr=[sc('zucht'),sc(null),sc('koenig'),state.buildings.filter(b=>CARDS[b.key].cat==='gehege'&&CARDS[b.key].tags.includes('bedroht')).length,state.buildings.filter(b=>CARDS[b.key].cat==='gehege').length];state.zl.insp=k;syncCtx()}Z.seasons.push({s:state.season,pts:state.seasonScore,days:state.day+1,target:seOf(state.season).target,fail:true});break}
    else throw new Error('phase '+ph)}
  Z.cmp=BOT.cmp;BOT.cmp=null;Z.total=state.totalScore;Z.insp=state.zl&&state.zl.insp;Z.prof=state.zl&&state.zl.prof;Z.season=state.season;Z.past=(state.past||[]).slice();Z.best=Math.max(0,...(state.past||[]).map(()=>0),state.stats.best?state.stats.best.pts:0);Z.eds=state.buildings.filter(b=>b.ed).map(b=>b.ed).join('');Z.tmult=state.tmult;Z.nb=state.buildings.length;Z.money=state.money;Z.deck=deckTotal();Z.kinds={};for(const t in MILE)Z.kinds[t]=mileCount(state.buildings,t);
  Z.built={};for(const b of state.buildings)Z.built[b.key]=(Z.built[b.key]||0)+1;return Z}
function botClick(sel){const e=document.querySelector(sel);if(!e)return false;e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true}
function botRun(){META.slots[0]={name:'Bot',created:1,last:1,game:null,perks:{},games:0,ctype:{}};META.lastSlot=0;META.active=0;META.cscores=[];
  BOT.cur={zoos:[],built:0,cd:{},picked:{},specs:[],progs:[]};const HB=shuffle(Object.keys(HAB)).slice(0,4);BOT.cur.habs=HB;enterCamp(0,true,'grund',!!BOT.zl,HB);
  for(let z=0;z<CAMP_GOAL;z++){const Z=botZoo();BOT.cur.zoos.push(Z);const st=state.stats;BOT.cur.cards=JSON.parse(JSON.stringify(st.cards));BOT.cur.best=st.best;finishGame();
    if(!Z.won)break;const run=META.slots[0].run;if(!run||run.reward.step==='won')break;
    let g=0;while(META.slots[0].run&&META.slots[0].run.reward&&g++<40){const a=META.slots[0].run.reward;
      if(botClick('[data-vack]')||botClick('[data-cdack]')){}
      else if(a.step==='prev'){if(!botClick('[data-cprev]')){const o=[...document.querySelectorAll('[data-pprof]')];const w=o.find(x=>x.dataset.pprof===BOT.prof)||o[Math.floor(Math.random()*o.length)];w.click()}}
      else if(a.step==='perk'){if(BOT.noPr){botClick('[data-cskip="perk"]')}else if(!a.ppick){if(!botClick('[data-cpr]'))botClick('[data-cskip="perk"]')}else{const bs=[...document.querySelectorAll('[data-cprk]')];const b=bs[Math.floor(Math.random()*bs.length)];if(b)b.click();else botClick('[data-cskip="perk"]')}}
      else if(a.step==='card'){if(!botClick('[data-ccard]:not([disabled])'))botClick('[data-cskip="card"]')}
      else if(a.step==='trim')botClick('[data-cskip="trim"]');
      else if(a.step==='spec'){const o=BOT.noHire||a.hired?null:document.querySelector('[data-cspec]:not([disabled])');if(o){BOT.cur.specs.push(o.dataset.cspec);botClick('[data-cspec]:not([disabled])')}else{botClick('[data-cstart]');break}}
      else if(a.step==='next'){botClick('[data-cstart]');break}else break}}
  const R=BOT.cur;R.total=R.zoos.reduce((t,z)=>t+z.total,0);R.done=R.zoos.filter(z=>z.won).length;state=null;screen=null;return R}

function botZooTest(id){META.slots[0]={name:'Bot',created:1,last:1,game:null,perks:{},games:0,ctype:{}};META.lastSlot=0;META.active=0;BOT.noHire=true;
  BOT.cur={zoos:[],built:0,cd:{},picked:{},specs:[],progs:[]};enterCamp(0,true,'grund');
  if(id){META.slots[0].run.spec=[id];state.spec=[id];syncCtx();state.bpMax=bpBase();state.bp=state.bpMax}
  const Z=botZoo();const r={won:Z.won,total:Z.total,reached:Z.seasons.length,money:Z.money,pct:Z.seasons.map(s=>s.pts/s.target)};state=null;screen=null;META.slots[0].run=null;return r}
