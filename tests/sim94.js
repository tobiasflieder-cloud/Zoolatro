// wie sim12, aber PROF=profil (bevorzugt, wenn angeboten) und HABS=a,b (Pflicht-Lebensräume, Rest zufällig)
const {JSDOM}=require('jsdom');const fs=require('fs');let html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
if(process.env.MEAS){const o='const seOf=i=>{const x=SEASONS[i];if(!x)return undefined;';if(!html.includes(o))throw 'meas';html=html.replace(o,o+'if(state&&state.mode==="camp")return{...x,target:state.day===DAYS-1?0:1e18};')}
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.console.error=()=>{};if(process.env.LOG)w.console.log=(...a)=>console.log(...a)}});
const w=dom.window,N=+process.argv[2],out=process.argv[3];
let src=fs.readFileSync(require('path').join(__dirname,'bot7.js'),'utf8');const old='shuffle(Object.keys(HAB)).slice(0,4)';if(!src.includes(old))throw 'patch';
if(process.env.Z2){const o3="enterCamp(0,true,'grund',!!BOT.zl,HB)";if(!src.includes(o3))throw 'patch3';const DK=process.env.DECK||'grund';src=src.replace("const HB=shuffle(Object.keys(HAB)).slice(0,4);","const HB=(()=>{const T=(DECKS['"+DK+"']||{}).type,h=shuffle(Object.keys(HAB));if(T&&HAB[T]){const r=h.filter(x=>x!==T).slice(0,2);r.push(T);return r}return h.slice(0,3)})();");src=src.replace(o3,"enterCamp(0,true,'"+DK+"','z2',HB,BOT.prof,"+(+process.env.Z2)+")")}
if(process.env.FORCE){const o2="enterCamp(0,true,'grund',!!BOT.zl,HB)";if(!src.includes(o2))throw 'patch2';src=src.replace(o2,"enterCamp(0,true,'grund',!!BOT.zl,HB,BOT.prof)")}
if(process.env.SEED){const o4="enterCamp(0,true,";if(!src.includes(o4))throw 'patch4';src=src.split(o4).join('PENDSEED='+JSON.stringify(process.env.SEED)+';'+o4)}
src=src.replace(old,`(()=>{const f=${JSON.stringify((process.env.HABS||'').split(',').filter(Boolean))};return f.concat(shuffle(Object.keys(HAB).filter(h=>!f.includes(h)))).slice(0,+(process.env.NH||3))})()`);
// 0.85a: WR=1 spielt einen Weltreise-Lauf (Kontinent-Wahl zufällig, Mitbringsel/Prägung erste Wahl)
if(process.env.D5){const o5="META.slots[0]={name:'Bot'";if(!src.includes(o5))throw 'patch5';src=src.split(o5).join("META.d5=1;"+o5)} // 0.94a: Bot mit 5 Tagen (Standard 4)
if(process.env.WR){const P=[["META.slots[0]={name:'Bot'","META.wr=1;META.slots[0]={name:'Bot'"],["for(let z=0;z<CAMP_GOAL;z++)","for(let z=0;z<runGoal(META.slots[0].run||{});z++)"]];for(const[a,b]of P){if(!src.includes(a))throw 'patchWR '+a;src=src.split(a).join(b)}
  if(!src.includes("botClick('[data-cstart]');break"))throw 'patchWR3';src=src.split("botClick('[data-cstart]');break").join("if(!botClick('[data-cstart]')){botClick('[data-cwr]');botWr()}break");
  src=src.replace(/(enterCamp\(0,true,[^;]*\));/,"$1;botWr();");
  src+="\nfunction botWr(){let g=0;while(screen==='creward'&&g++<12){const a=META.slots[0].run&&META.slots[0].run.reward;if(!a)break;if(a.step==='wr'){const o=[...document.querySelectorAll('[data-wrsel]')];if(!o.length)break;o[Math.floor(Math.random()*o.length)].click();botClick('[data-wrgo]')}else if(a.step==='wrgift'){if(!botClick('[data-wrgk]'))break}else if(a.step==='perk'){if(!a.ppick){if(!botClick('[data-cpr]'))botClick('[data-cskip=\"perk\"]')}else if(!botClick('[data-cprk]'))botClick('[data-cskip=\"perk\"]')}else break}}\n"}
if(process.env.NEW91)src=src.replace("games:0,ctype:{}}","games:0,ctype:{},v91:1,fs:{},fsb:{},fsMig91:1}");
setTimeout(()=>{w.eval(src);if(process.env.BOT)w.eval(fs.readFileSync(process.env.BOT,'utf8'));
  if(process.env.INSP)w.eval(`(()=>{const F=${JSON.stringify(process.env.INSP)},_iz=initZl;initZl=function(){_iz();state.zl.insp=F;state.zl.inspOpts=undefined;if(F==='hab')state.zl.inspHab=state.zl.inspHab||habsNow()[0]}})()`);
  if(process.env.RB)w.eval(`z2Rb=function(run,opts){if(!run||!run.z2||(run.spec||[]).some(id=>SPEC[id]&&SPEC[id].rb))return;const av=Object.keys(SPEC).filter(id=>SPEC[id].rb);opts[0]=av[Math.floor(Math.random()*av.length)]}`);w.eval('BOT.zl=true');if(process.env.PROF)w.eval(`BOT.prof=${JSON.stringify(process.env.PROF)}`);const res=[];
  for(let i=0;i<N;i++){try{res.push(w.eval('botRun()'))}catch(e){console.log('ERR',e.stack.split('\n').slice(0,5).join('\n'));res.push({err:String(e)})}fs.writeFileSync(out,JSON.stringify(res))}
  console.log('done');process.exit(0)},200);
