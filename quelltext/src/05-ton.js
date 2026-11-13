//@@ modul: 05-ton
const Sfx={ctx:null,master:null,muted:false,
  init(){try{if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();
      const comp=this.ctx.createDynamicsCompressor();this.master=this.ctx.createGain();this.master.gain.value=.7;this.master.connect(comp).connect(this.ctx.destination)}
    if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){}},
  boom(){this.tone(150,.5,'sine',.5,0,.25);this.tone(75,.6,'sine',.4,.01,.45);this.tone(500,.07,'square',.05,0,.3)},
  tone(f,dur=.12,type='triangle',vol=.15,when=0,slide=0){if(this.muted||!this.ctx)return;try{const c=this.ctx,t=c.currentTime+when,o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
    o.connect(g).connect(this.master);o.start(t);o.stop(t+dur+.03)}catch(e){}},
  noise(dur=.1,vol=.12,freq=2000,when=0,q=1){if(this.muted||!this.ctx)return;try{const c=this.ctx,t=c.currentTime+when,n=Math.floor(c.sampleRate*dur),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=buf;f.type='bandpass';f.frequency.value=freq;f.Q.value=q;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);s.connect(f).connect(g).connect(this.master);s.start(t)}catch(e){}},
  semis(i,n){return i*Math.min(3,30/Math.max(1,n-1))},
  heat:0,
  chip(i,n,hasA=true,hasS=true){const f=300*2**((this.semis(i,n)+this.heat*3)/12);if(hasA){this.tone(f,.09,'square',.055);this.noise(.03,.07,5000,0,2)}if(hasS)this.tone(f*1.5,.12,'triangle',.08,hasA?.03:0);if(!hasA&&!hasS)this.tone(f,.05,'sine',.04)},
  bonus(i,n,k=0){const f=600*2**((this.semis(i,n)+3+k*4)/12);this.tone(f,.14,'sine',.12,.05+k*.05)},
  neg(){this.tone(480,.14,'sine',.1,0,.45);this.tone(240,.08,'triangle',.03,.02)}, // weiches Plopp nach unten
  mult(i=0){const b=2**(Math.min(i,6)*2/12);[784,988,1175].forEach((f,j)=>{this.tone(f*b,.16,'triangle',.11,j*.07);this.tone(f*b*2,.12,'sine',.045,j*.07)});this.tone(1568*b,.4,'sine',.08,.21);this.tone(3136*b,.25,'sine',.03,.27)},
  coin(when=0){const f=[1568,1760,2093,2349,2637][Math.floor(Math.random()*5)]*(1+Math.random()*.03);
    this.tone(f,.07,'triangle',.05,when);this.tone(f*2.76,.05,'sine',.025,when+.004)},
  coins(dur){const n=Math.round(dur/.04);for(let i=0;i<n;i++)this.coin(i*.04+Math.random()*.02)},
  till(){this.tone(1319,.08,'square',.05);this.tone(1976,.25,'triangle',.08,.06);this.noise(.05,.08,4000,0,1.5)},
  build(){this.tone(150,.16,'sine',.3,0,.45);this.noise(.08,.12,700)},
  rotate(){this.tone(520,.04,'square',.04);this.tone(780,.05,'triangle',.05,.03)},
  select(){this.tone(880,.05,'triangle',.07)},
  cardpick(){const f=340+Math.random()*30;this.tone(f,.11,'sine',.17,0,.6);this.tone(f*2,.08,'triangle',.07,.01,.6)},
  total(up){const b=up?[587,740,880]:[523,659,784];b.forEach((f,i)=>{this.tone(f,.16,'triangle',up?.09:.07,i*.07);this.tone(f*2,.1,'sine',.025,i*.07)});if(up)this.tone(1175,.25,'sine',.05,.21)},
  drawSoft(){},
  hover(){this.tone(1200,.025,'sine',.025)},
  draw(){this.tone(430,.07,'sine',.05,0,.7);this.tone(540,.06,'sine',.035,.05,.7)},
  deal(n=4){for(let i=0;i<Math.min(5,Math.max(1,n));i++)this.tone(520+i*45,.035,'sine',.025,i*.06,.8)},
  shop(){this.tone(170,.14,'sine',.07);this.noise(.05,.03,600,0,.6)},
  combo(){[523,659,784,1047,1319,1568].forEach((f,i)=>{this.tone(f,.16,'square',.05,i*.055);this.tone(f*2,.2,'triangle',.06,i*.055)});this.tone(2093,.6,'sine',.07,.36);this.noise(.3,.06,6000,.3,.8)},
  sparkle(){[1568,2093,2637,3136].forEach((f,i)=>this.tone(f,.12,'sine',.05,.04+i*.05))},
  deny(){this.tone(160,.12,'square',.05)},
  win(){[523,659,784,1047,1319].forEach((f,i)=>this.tone(f,.3,'square',.06,i*.1));this.tone(1047,.8,'triangle',.1,.55)},
  lose(){[392,349,311,262].forEach((f,i)=>this.tone(f,.3,'triangle',.12,i*.16))},
};
try{Sfx.muted=localStorage.getItem('zoodeck-muted')==='1'}catch(e){}
document.addEventListener('pointerdown',()=>Sfx.init(),{capture:true});

/* ---------- geometry & drawing ---------- */
const SZ=10,SQ3=Math.sqrt(3);
let ROT=false,EDGE=[];
const px=(q,r)=>{const x=SZ*SQ3*(q+r/2),y=SZ*1.5*r;return ROT?[-y,x]:[x,y]};
function hexPts(cx,cy,s){let p=[];for(let i=0;i<6;i++){const a=Math.PI/180*(60*i+(ROT?0:-30));p.push((cx+s*Math.cos(a)).toFixed(2)+','+(cy+s*Math.sin(a)).toFixed(2))}return p.join(' ')}
function setRot(v){ROT=v;EDGE=DIRS.map(([dq,dr])=>{const[x,y]=px(dq,dr),t=Math.atan2(y,x),d=Math.PI/6;return[[Math.cos(t-d),Math.sin(t-d)],[Math.cos(t+d),Math.sin(t+d)]]})}
setRot(false);
function withRot(v,fn){const o=ROT;setRot(v);try{return fn()}finally{setRot(o)}}
function shapeSvg(cells,sz=SZ){const set=new Set(cells.map(([q,r])=>hk(q,r)));let polys='',d='';
  for(const[q,r]of cells){const[x,y]=px(q,r);polys+=`<polygon class="hx" points="${hexPts(x,y,sz)}"/>`;
    DIRS.forEach(([dq,dr],i)=>{if(set.has(hk(q+dq,r+dr)))return;const[[a1,b1],[a2,b2]]=EDGE[i];
      d+=`M${(x+a1*sz).toFixed(2)},${(y+b1*sz).toFixed(2)}L${(x+a2*sz).toFixed(2)},${(y+b2*sz).toFixed(2)}`})}
  return polys+`<path class="fence" d="${d}"/>`}
const centroid=cells=>{let x=0,y=0;for(const[q,r]of cells){const p=px(q,r);x+=p[0];y+=p[1]}return[x/cells.length,y/cells.length]};
let VB=[0,0,1,1];
function bbox(cells){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[q,r]of cells){const[x,y]=px(q,r);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}return[x0,y0,x1,y1]}
// Long maps are shown upright on portrait screens so they stay large
function computeView(){const[x0,y0,x1,y1]=withRot(false,()=>bbox(BOARD)),bw=x1-x0+SZ*2,bh=y1-y0+SZ*2,ar=bw/bh;
  const area=document.querySelector('.boardarea'),W=area?area.clientWidth:0,H=area?area.clientHeight:0;let rot;
  // die Info-Leiste oben verdeckt einen Teil der Fläche: nur drehen, wenn das Gelände dann im freien Bereich größer wird
  if(W>0&&H>0){const inf=document.getElementById('info'),ar0=area.getBoundingClientRect(),ov=inf&&getComputedStyle(inf).position==='absolute'?Math.max(0,Math.min(H*.5,inf.getBoundingClientRect().bottom-ar0.top)):0,He=Math.max(1,H-ov),flat=Math.min(W/bw,He/bh),up=Math.min(W/bh,He/bw);rot=up>flat*1.08}
  else rot=!(innerWidth>=860&&innerWidth>=innerHeight)&&ar>1.3;
  {const mk=VIEWMAP||(state&&state.map);if(MAPS[mk]&&MAPS[mk].norot)rot=false}if(TUTNOW)rot=false;
  setRot(rot);const[a0,b0,a1,b1]=bbox(BOARD),pad=SZ+2;VB=[a0-pad,b0-pad,a1-a0+2*pad,b1-b0+2*pad];
  document.getElementById('bwrap').style.setProperty('--ar',(VB[2]/VB[3]).toFixed(4))}
const boardCenter=()=>[VB[0]+VB[2]/2,VB[1]+VB[3]/2];
// Zoom: eine Stufe, zeigt einen Ausschnitt des Geländes
const ZF=1.5;let ZOOM=null,ZAUTO=false,ZPREV=null,ZSH=null;
// Zoom als Standard auf schmalen Bildschirmen (Handy), außer der Spieler hat zuletzt herausgezoomt; nicht im Tutorial
function zoomAuto(){if(ZAUTO||!state||!state.buildings)return;ZAUTO=true;try{const sl=activeSlot();if(innerWidth>=900||META.zoomOut||(sl&&sl.run&&sl.run.tut))return;const bs=state.buildings,f=bs.length?centroid(bs.flatMap(b=>b.cells)):boardCenter();ZOOM={cx:f[0],cy:f[1]}}catch(e){}}
let OVPX=0,BHPX=1,SHIFT=0,COV=0,coachMin=false,coachKey='',coachPh=''; // OVPX: so viele Pixel des Geländes verdeckt die Info-Leiste oben
let VNC=null;addEventListener('resize',()=>{VNC=null});
function viewNow(){if(!ZOOM){const my=Math.max(OVPX*VB[3]/BHPX,VB[3]*.3),ny=Math.max(COV*VB[3]/BHPX,VB[3]*.3),mx=0;SHIFT=Math.max(-ny,Math.min(my,SHIFT));SHX=Math.max(-mx,Math.min(mx,SHX));return[VB[0]-SHX,VB[1]-SHIFT,VB[2],VB[3]]}
  // im Zoom füllt das Gelände die ganze Fläche: gleicher Maßstab, aber breiterer bzw. höherer Ausschnitt
  const now=performance.now();if(!VNC||now-VNC.t>120){const ar=document.querySelector('.boardarea');VNC={t:now,AW:ar?ar.clientWidth:0,AH:ar?ar.clientHeight:0}}const AW=VNC.AW,AH=VNC.AH,zf=ZOOM.f||ZF;let w=VB[2]/zf,h=VB[3]/zf;
  if(AW>0&&AH>0){const s0=Math.min(AW/VB[2],AH/VB[3])*zf;w=AW/s0;h=AH/s0}
  // 0.93: oben (Infokasten) und unten (Knopfleiste) zusätzlichen Spielraum, damit jedes Feld frei gezogen werden kann
  if(!VNC.bot){const ac=document.querySelector('.actions.ov');VNC.bot=ac?ac.offsetHeight+14:60}
  const ext=Math.max(OVPX*h/BHPX,h*.08),extB=(AH>0?VNC.bot*h/AH:h*.12),mx=VB[0]+VB[2]/2,my=VB[1]+VB[3]/2,ex=w*.06;
  ZOOM.cx=w>=VB[2]+2*ex?mx:Math.max(VB[0]+w/2-ex,Math.min(VB[0]+VB[2]-w/2+ex,ZOOM.cx));ZOOM.cy=h>=VB[3]+ext+extB?my-ext/2+extB/2:Math.max(VB[1]+h/2-ext,Math.min(VB[1]+VB[3]-h/2+extB,ZOOM.cy));
  return[ZOOM.cx-w/2,ZOOM.cy-h/2,w,h]}
// misst die Überdeckung und rückt das Gelände nach, wenn die Vorschau unter dem Text liegt
let fitting=false,tutFit=false,SHX=0;
function fitUnderInfo(){const info=$('info'),br=$('bwrap').getBoundingClientRect();BHPX=br.height||1;{const co=$('coach');COV=state&&typeof gRun==='function'&&gRun()&&co&&co.offsetHeight?Math.min(br.height*.6,co.offsetHeight+12):0}
  const abs=getComputedStyle(info).position==='absolute';OVPX=abs?Math.max(0,Math.min(br.height*.7,info.getBoundingClientRect().bottom-br.top+6)):0;
  if(tutFit&&!fitting&&state&&COV>0){tutFit=false;const st=tutStep();let ks=[];try{ks=st?tutMarkAll(st):[]}catch(e){}
    if(ks.length){const v=viewNow(),ys=ks.map(k=>px(...k.split(',').map(Number))[1]),lo=Math.max(...ys)+SZ*1.3,bot=v[1]+v[3]-COV*v[3]/BHPX,need=lo-bot;
      if(need>.5){if(ZOOM)ZOOM.cy+=need;else SHIFT-=need;fitting=true;render();fitting=false}}}
  if(fitting||!state||state.phase!=='play')return;const cells=selKey()&&state.preview?ghostCells():null;const v=viewNow();
  if(cells&&cells.length&&OVPX>0){const top=Math.min(...cells.map(([q,r])=>px(q,r)[1]))-SZ*1.6,need=v[1]+OVPX*v[3]/BHPX-top;
    if(need>.5){if(ZOOM)ZOOM.cy-=need;else SHIFT+=need;fitting=true;render();fitting=false}}
}
const pct=([x,y])=>{const v=viewNow();return[(x-v[0])/v[2]*100,(y-v[1])/v[3]*100]};
function habBadge(h){return withRot(false,()=>{const p=hexPts(0,0,10);return`<svg class="hbx" viewBox="-11 -11 22 22" aria-hidden="true"><polygon class="hbf ${h}" points="${p}"/><polygon fill="url(#pt-${h})" points="${p}"/></svg>`})}
const clsOf=c=>c.cat==='gehege'?'hab-'+c.hab:'cat-'+c.cat;
const colOf=c=>c.cat==='gehege'?HAB[c.hab].col:CAT[c.cat].col;
function miniShape(key,rot=0){const c=CARDS[key],cells=rotCells(SHAPES[c.shape].cells,rot);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const[q,r]of cells){const[x,y]=px(q,r);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)}
  const p=SZ+1.5;return`<svg class="shape ${clsOf(c)}" viewBox="${x0-p} ${y0-p} ${x1-x0+2*p} ${y1-y0+2*p}" aria-hidden="true">${shapeSvg(cells)}</svg>`}
function hexAt(clientX,clientY){const svg=$b(),m=svg.getScreenCTM();if(!m)return null;const pt=svg.createSVGPoint();pt.x=clientX;pt.y=clientY;
  const p=pt.matrixTransform(m.inverse()),X=ROT?p.y:p.x,Y=ROT?-p.x:p.y;let qf=(SQ3/3*X-Y/3)/SZ,rf=(2/3*Y)/SZ,sf=-qf-rf;
  let q=Math.round(qf),r=Math.round(rf),s=Math.round(sf);const dq=Math.abs(q-qf),dr=Math.abs(r-rf),ds=Math.abs(s-sf);
  if(dq>dr&&dq>ds)q=-r-s;else if(dr>ds)r=-q-s;return ONBOARD.has(hk(q,r))?{q,r}:null}

/* ---------- game state ---------- */
const $=id=>document.getElementById(id);
const $b=()=>$('board');
const fmt=n=>Math.round(n).toLocaleString('de-DE');
const sgn=n=>n>0?'+'+fmt(n):n<0?'−'+fmt(-n):'0';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Effekt-Probe (zuschaltbar, META.fxOff): federndes Setzen mit Staub, Punkte fliegen zur Anzeige, Wackeln, Karten kippen und glänzen
const fxOn=()=>!reduced&&!(typeof META!=='undefined'&&META.fxOff);
const fxStrong=()=>fxOn()&&(META.fxPow||'s')==='s';
// Partikel-Explosion auf einer eigenen Zeichenebene (Schwerkraft, Splitter)
let FXC=null,FXP=[];
function fxBurstAt(sx,sy,n,cols){if(!fxStrong())return;if(!FXC){FXC=document.createElement('canvas');FXC.id='fxcan';document.body.appendChild(FXC)}const c=FXC,dpr=1;n=Math.min(n,Math.max(0,120-FXP.length));if(!n)return;
  if(!FXP.length){const ba=document.querySelector('.boardarea'),R=ba?ba.getBoundingClientRect():{left:0,top:0,width:innerWidth,height:innerHeight},pad=60;FXC.ox=Math.max(0,R.left-pad);FXC.oy=Math.max(0,R.top-pad);const W=Math.min(innerWidth-FXC.ox,R.width+2*pad)|0,H=Math.min(innerHeight-FXC.oy,R.height+2*pad)|0;c.style.left=FXC.ox+'px';c.style.top=FXC.oy+'px';c.style.width=W+'px';c.style.height=H+'px';if(c.width!==W||c.height!==H){c.width=W;c.height=H}}
  sx-=FXC.ox||0;sy-=FXC.oy||0;
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=2+Math.random()*7;FXP.push({x:sx,y:sy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-3,r:2+Math.random()*3.5,l:1,d:.012+Math.random()*.02,c:cols[i%cols.length]})}
  if(FXP.length===n){let g=null;try{g=c.getContext('2d')}catch(e){}if(!g){FXP=[];return}const step=()=>{g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,c.width,c.height);FXP=FXP.filter(p=>p.l>0);for(const p of FXP){p.vy+=.28;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.l-=p.d;g.globalAlpha=Math.max(0,p.l);g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.r*(.5+p.l/2),0,7);g.fill()}if(FXP.length)requestAnimationFrame(step);else g.clearRect(0,0,c.width,c.height)};requestAnimationFrame(step)}}
let FXR=null;const fxRect=id=>{const now=performance.now();if(!FXR||now-FXR.t>150)FXR={t:now};if(!FXR[id]){const e=$(id);FXR[id]=e?e.getBoundingClientRect():null}return FXR[id]};
function fxScreen(pt){const r=fxRect('fxh');if(!r)return null;const [x,y]=pct(pt);return[r.left+r.width*x/100,r.top+r.height*y/100]}
function fxBurst(pt,n,cols){const p=fxScreen(pt);if(p)fxBurstAt(p[0],p[1],n,cols||['#ffd166','#fff3b0','#ff9e5c','#ffffff'])}
function fxPunch(pt,sc){if(!fxStrong())return;const bd=$b(),[x,y]=pct(pt);if(!bd||!bd.animate)return;bd.style.transformOrigin=`${x}% ${y}%`;bd.animate([{transform:'scale(1)'},{transform:`scale(${sc})`,offset:.3},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.2,1.3,.4,1)'})}
function fxSlam(id,cols){if(!fxStrong())return;const e=$(id);if(!e)return;e.classList.remove('slam');void e.offsetWidth;e.classList.add('slam');const r=e.getBoundingClientRect(),w=document.createElement('span');w.className='shockw';w.style.left=(r.left+r.width/2)+'px';w.style.top=(r.top+r.height/2)+'px';document.body.appendChild(w);setTimeout(()=>w.remove(),650);fxBurstAt(r.left+r.width/2,r.top+r.height/2,26,cols||['#ffd166','#fff3b0','#ffffff'])}
function fxFlash(){if(!fxStrong())return;const f=document.createElement('div');f.className='fxflash';document.body.appendChild(f);setTimeout(()=>f.remove(),420)}
// Einblendung vollständig im Spielfeld halten (Breite messen, linke/obere Kante verschieben)
function fxClamp(el,x,y){const fh=$('fxh');if(!fh)return;const W=fh.clientWidth,H=fh.clientHeight,w=el.offsetWidth,h=el.offsetHeight;if(!W||!w)return;const px0=Math.max(w/2+4,Math.min(W-w/2-4,W*x/100)),py0=Math.max(h/2+4,Math.min(H-h/2-4,H*y/100));el.style.left=px0+'px';el.style.top=py0+'px'}
// Aufwärmen: beim ersten Spielbild alles einmal unsichtbar anlegen (Zeichenfläche, Schriften, Animationen, Töne), damit das erste Kombo nicht hakt
// Spielfläche ändert ihre Größe (z. B. nach der Kartenwahl): Messung sofort erneuern und einmal neu zeichnen
try{let RO0='';const ba=document.querySelector('.boardarea');if(ba&&window.ResizeObserver)new ResizeObserver(()=>{const k=ba.clientWidth+'x'+ba.clientHeight;if(k===RO0)return;RO0=k;VNC=null;if(typeof state!=='undefined'&&state&&ZOOM&&state.phase!=='scoring')requestAnimationFrame(()=>{try{render()}catch(e){}})}).observe(ba)}catch(e){}
let FXWARM=false;function fxWarm(){if(FXWARM||!fxOn()||!state)return;FXWARM=true;setTimeout(()=>{try{const h=$('fxh');if(!h)return;const HS='position:absolute;inset:0;visibility:hidden;opacity:0;pointer-events:none;overflow:hidden',hid=document.createElement('div'),hb=document.createElement('div');hid.style.cssText=HS;hb.style.cssText=HS.replace('absolute','fixed');h.appendChild(hid);document.body.appendChild(hb);if(fxStrong()){const r=fxRect('fxh');if(r)fxBurstAt(r.left+5,r.top+5,1,['rgba(0,0,0,0)'])}
  const els=[['combo max','KOMBO ×4!'],['combo','×3'],['float a big','+1 B'],['float s','+1 N']].map(([c,t])=>{const e=document.createElement('span');e.className=c;e.textContent=t;e.style.left='50%';e.style.top='50%';hid.appendChild(e);return e});
  const w=document.createElement('span');w.className='shockw';hb.appendChild(w);setTimeout(()=>{hid.remove();hb.remove()},1600);
  try{if(Sfx.ctx)Sfx.tone(60,.05,'sine',.00001)}catch(e){}}catch(e){}},700)}
function fxShake(n){if(!fxOn())return;const el=document.querySelector('.boardarea');if(!el)return;el.classList.remove('shk1','shk2','shk3');void el.offsetWidth;el.classList.toggle('pow',fxStrong());el.classList.add('shk'+n);setTimeout(()=>el.classList.remove('shk'+n),fxStrong()?700:520)}
function fxDust(pt){const[x,y]=pct(pt),h=$('fxh');for(let i=0;i<6;i++){const d=document.createElement('span'),a=Math.random()*Math.PI*2;d.className='dust';d.style.left=x+'%';d.style.top=y+'%';d.style.setProperty('--dx',(Math.cos(a)*20).toFixed(1)+'px');d.style.setProperty('--dy',(Math.sin(a)*9+5).toFixed(1)+'px');h.appendChild(d);setTimeout(()=>d.remove(),720)}}
function fxDrop(id){if(!fxOn()||id==null)return;const b=state.buildings.find(x=>x.id===id),el=$b().querySelector(`[data-bid="${id}"]`);if(!b||!el)return;el.classList.remove('drop');el.getBoundingClientRect();el.classList.add('drop');setTimeout(()=>{for(const[q,r]of b.cells)fxDust(px(q,r));fxShake(1);if(fxStrong())fxBurst(centroid(b.cells),8,['#e9dcc0','#c9b98f','#ffffff'])},190)}
function fxFly(pt,cid,cls,n){if(!fxOn())return;const r=fxRect('fxh'),t=fxRect(cid);if(!r||!t)return;const[x,y]=pct(pt),tx=t.left+t.width/2,ty=t.top+t.height/2;
  for(let i=0;i<n;i++)setTimeout(()=>{const sx=r.left+r.width*x/100+(Math.random()-.5)*12,sy=r.top+r.height*y/100+(Math.random()-.5)*12,e=document.createElement('span');e.className='ftok '+cls;e.style.left=sx+'px';e.style.top=sy+'px';document.body.appendChild(e);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{e.style.transform=`translate(${(tx-sx).toFixed(0)}px,${(ty-sy).toFixed(0)}px) scale(.45)`;e.style.opacity='.25'}));setTimeout(()=>e.remove(),600)},i*45)}
let SCFAST=0;try{SCFAST=+localStorage.getItem('zoodeck-fast')||0}catch(e){}
let state,fast=false,modal=null,tutIdx=0; // modal: 'help' | 'deck' | 'restart' …
const newStats=()=>({cards:{},best:null,combo:0,earned:0,spent:0,progs:0,tally:{},lvl:1,days:0});
const DEFAULTS=()=>({map:'wiese',board:null,undo:[],yday:{A:0,S:0,total:0},builtToday:0,picks:0,pickTotal:0,hover:null,hoverTerr:null,earlyBonus:0,dayPts:[],past:[],money:10,progs:[],ads:[],adsNext:[],bpMax:BP,bpBought:0,bpNext:0,bpSeason:0,shop:null,shopSub:null,infoProg:null,lastIncome:null,msg:null,prevY:null,miles:{},mileNew:[],spec:[],market:null,mileSeen:{},ledger:{entry:0,care:0,interest:0,early:0},draftRolls:0,moving:null,evRolled:false,mode:'free',zoo:0,tmult:1,events:[],eventsNext:[],boni:{},stats:newStats()});
const ZLSEAS=[1.15,1.35,1.6,1.55]; // 0.82a: Herbst 1,68 → 1,6 je Zoo // 0.81a: Sommer 1,46 → 1,35 je Zoo // 0.92 neu gemessen (Glück, Besucherliebling, Formen, Freundschaften) // Zoolatro: Frühling steigt pro Zoo langsamer als Winter
// Spezial-Decks mit schnellerer Reinheit bekommen höhere Ziele (Zoolatro)
const DECKTF={},deckSF=i=>{try{const sl=activeSlot();return sl&&sl.run&&sl.run.zl&&!sl.run.tut&&sl.run.deckId==='polar'?(i===3?.85:i===1?1.15:1):1}catch(e){return 1}},deckTF=()=>{try{const sl=activeSlot();return sl&&sl.run&&sl.run.zl&&!sl.run.tut?(DECKTF[sl.run.deckId]||1):1}catch(e){return 1}};
const ZLUP=[1,1.2,1.2,1.2]; // 0.70a: Zoolatro-Ziele Sommer/Herbst/Winter +20 %
const einTF=i=>{try{const r=runOf();const E=r&&r.zl&&!r.tut&&(r.stage||1)===1&&DECKS[r.deckId]&&DECKS[r.deckId].einstieg;return E?E[i]||1:1}catch(e){return 1}}; // 0.80a: Einstieg (Zoogründer Stufe 1)
const D4TF=.6,d4TF=()=>{try{return isD4(runOf())?D4TF:1}catch(e){return 1}}; // 0.78a: Testlauf „4 Tage“: alle Ziele ×0,6
const seTarget=(i,zl,zoo,tm)=>{const t=SEASONS[i].target*(zl?(ZLUP[i]||1)*Math.pow(ZLSEAS[i]||2,zoo||0)*deckTF()*deckSF(i)*stTF()*(i===3&&(zoo||0)>=4?1.1:1)*d4TF()*einTF(i):(tm||1));return t>=100000?Math.round(t/1000)*1000:Math.round(t/100)*100};
const seOf=i=>{const x=SEASONS[i];if(!x)return undefined;if(state.tT&&state.tT[i])return{...x,target:state.tT[i]};if(i===0&&state.t0)return{...x,target:state.t0};const t=seTarget(i,!!state.zl,state.zoo,state.tmult);return{...x,target:state.tgf&&i>0?Math.round(t*state.tgf/100)*100:t}};
function syncCtx(){try{const r=runOf();DAYS=isD4(r)?4:DAYS0;TUTNOW=!!(r&&r.tut)}catch(e){DAYS=DAYS0;TUTNOW=false}try{PURN=stW('reinheit',4);CROWNF=stW('krone',1.3)}catch(e){PURN=4;CROWNF=1.3}/* 0.76a: Reinheit und Krone je Stufe */CTX={fdl:foodLvNow(),dk:dkNow(),habs:state.habs||DEFHABS,winter:!!seOf(state.season).winter,season:state.season,zoo:state.zoo||0,progs:state.progs,ads:state.ads,ev:state.events||[],boni:{},spec:teamNow(),zl:state.zl?{prof:state.zl.prof,gold:new Set(state.zl.gold),g4:new Set(state.zl.g4||[]),crown:state.zl.crown,crown2:state.zl.crown2||[],insp:state.zl.insp,hard:state.zl.hard,wplus:state.zl.wplus,inspHab:state.zl.inspHab,inspHabs:state.zl.inspHabs||null,tax:state.zl.ban||null,grow:state.zl.grow,tv:state.zl.tv?(()=>state.builtToday>=3?3:.5):null}:null,strike:()=>!!state&&state.money<0&&(state.spec||[]).length>0};document.body.classList.toggle('winter',CTX.winter);setWeather(state.season)}
const teamAct=()=>{const L=state.spec||[];return state.zl&&state.zl.insp==='team'&&seOf(state.season).winter?L.slice(0,HARD(state.zl)?2:3):L};
// Doppelgänger: steht in der Reihe an seiner Stelle der Spezialist rechts daneben noch einmal
const teamNow=()=>{const L=teamAct(),o=[];L.forEach((id,i)=>{if(id==='doppel'){const n=(state.spec||[])[(state.spec||[]).indexOf('doppel')+1];if(n&&n!=='doppel'&&L.includes(n))o.push(n)}else o.push(id)});return o};
let wxSeason=-1;
function edgeSvg(i){const R=(a,b)=>a+Math.random()*(b-a);let b='',t='';
  if(i===0){for(let x=6;x<400;x+=R(14,26)){const hgt=R(10,26),col=['#f9a8c9','#ffd166','#ffffff','#f48fb1'][Math.floor(R(0,4))];b+=`<path d="M${x},54 Q${x+R(-3,3)},${54-hgt/2} ${x},${54-hgt}" stroke="#3f8a3a" stroke-width="1.6" fill="none"/><circle cx="${x}" cy="${54-hgt}" r="${R(2.6,4.2)}" fill="${col}"/><circle cx="${x}" cy="${54-hgt}" r="1.2" fill="#ffe082"/>`}
    for(let x=0;x<400;x+=7)b+=`<path d="M${x},54 l${R(-2,2)},${-R(5,11)}" stroke="#58a84a" stroke-width="1.4"/>`}
  if(i===1){let rays='';for(let k=0;k<12;k++){const an=Math.PI*(.5+k/11*.5);rays+=`<line x1="${352+Math.cos(an)*30}" y1="${8-Math.sin(an)*-30}" x2="${352+Math.cos(an)*58}" y2="${8+Math.sin(an)*58}" stroke="#ffe082" stroke-width="3" stroke-linecap="round" opacity=".8"/>`}
    t=`<circle cx="352" cy="8" r="24" fill="#ffd54f"/><circle cx="352" cy="8" r="34" fill="#ffd54f" opacity=".3"/>${rays}`;
    for(let x=0;x<400;x+=6)b+=`<path d="M${x},54 l${R(-2,2)},${-R(6,14)}" stroke="#7aa63a" stroke-width="1.5"/>`}
  if(i===2){for(let x=-10;x<410;x+=R(22,40)){const w=R(26,44),hh=R(8,16);b+=`<ellipse cx="${x}" cy="54" rx="${w/2}" ry="${hh}" fill="${['#b8431c','#d9772b','#e2b13c','#8a4a1c'][Math.floor(R(0,4))]}"/>`}
    for(let k=0;k<3;k++){const x=R(30,370);b+=`<rect x="${x-1.5}" y="40" width="3" height="9" fill="#f3e6cf"/><path d="M${x-7},41 Q${x},30 ${x+7},41Z" fill="#c0392b"/><circle cx="${x-2}" cy="37.5" r="1" fill="#fff"/><circle cx="${x+2.5}" cy="38.5" r=".9" fill="#fff"/>`}
    t=`<path d="M0,0 L60,26 M22,10 L30,34 M40,18 L62,12" stroke="#5a3a1c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M400,0 L346,22 M372,11 L364,36 M356,18 L336,10" stroke="#5a3a1c" stroke-width="3" fill="none" stroke-linecap="round"/>`}
  if(i===3){let d='M0,54 L0,34';for(let x=0;x<=400;x+=25)d+=` Q${x+12},${R(18,34)} ${x+25},${R(28,38)}`;b=`<path d="${d} L400,54Z" fill="#f4f8fb"/><path d="${d} L400,54Z" fill="#cfe3ee" opacity=".45" transform="translate(0,7)"/>`;
    for(let x=4;x<400;x+=R(9,20)){const l=R(8,26);t+=`<path d="M${x-2.2},0 L${x},${l} L${x+2.2},0Z" fill="#e3f2fb" opacity=".9"/>`}t+=`<rect width="400" height="3" fill="#f4f8fb"/>`}
  const wrap=(c)=>c?`<svg viewBox="0 0 400 ${c===t?70:54}" preserveAspectRatio="none" aria-hidden="true">${c}</svg>`:'';return[wrap(t),wrap(b)]}
function setWeather(i){for(let k=0;k<4;k++)document.body.classList.toggle('sea'+k,k===i);if(i===wxSeason)return;const first=wxSeason<0;wxSeason=i;const w=$('wx');w.className='wx sea'+i;
  {const[t,b]=edgeSvg(i);$('wxTop').innerHTML=t;$('wxBot').innerHTML=b}
  if(!first&&!reduced&&i!==1)setTimeout(()=>{for(let k=0;k<16;k++){const g=document.createElement('i');g.className='g';g.style.top=(Math.random()*90)+'%';g.style.left='0';g.style.animationDelay=(Math.random()*.9).toFixed(2)+'s';g.style.setProperty('--dy',Math.round(Math.random()*120-30)+'px');w.appendChild(g);setTimeout(()=>g.remove(),3500)}},50);
  const n=reduced?0:[18,12,22,30][i];let h='';for(let k=0;k<n;k++){const d=(9+Math.random()*9).toFixed(1);h+=`<i style="left:${(Math.random()*100).toFixed(1)}%;animation-duration:${d}s;animation-delay:-${(Math.random()*d).toFixed(1)}s;--dx:${Math.round(Math.random()*80-40)}px;--rot:${Math.round(Math.random()*540-270)}deg"></i>`}w.innerHTML=h}

function rollSeason(i){return[];const cf=state.mode==='camp'?campCfg(state.zoo):{k:1,n:1,spring:false};if(state.zl)return[];return i===0&&!cf.spring?[]:rollEvents({...cf,s:i})}
