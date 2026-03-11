// ── PIXEL ART OFFICE ─────────────────────────────────────────────────────────
// Per-lesson pixel-art scenes. Each lesson gets its own unique animation.
// Logical pixels = _PX canvas pixels → crisp at any DPI.

const _PX=2, _WH=14;
function _r(ctx,lx,ly,lw,lh,col,a){if(a!=null)ctx.globalAlpha=a;ctx.fillStyle=col;ctx.fillRect(Math.round(lx*_PX),Math.round(ly*_PX),Math.round(lw*_PX),Math.round(lh*_PX));ctx.globalAlpha=1;}
function _ease(t){return t<.5?2*t*t:-1+(4-2*t)*t;}
function _lerp(a,b,t){return a+(b-a)*t;}
function _lbl(ctx,s,lx,ly,col,sz){ctx.font=(sz||7)+"px 'JetBrains Mono',monospace";ctx.fillStyle=col||'#4b5563';ctx.fillText(String(s),Math.round(lx*_PX),Math.round(ly*_PX));}

// ── ROOM (Vattenfall ESH Berlin inspired) ────────────────────────────────────
function _room(ctx,W,H){
  const LW=W/_PX,LH=H/_PX;

  // ── Back wall ──
  _r(ctx,0,0,LW,_WH,'#0f1020');

  // ── Windows with Vattenfall yellow frames ──
  const wins=[{x:8,w:36},{x:55,w:36},{x:103,w:36},{x:152,w:36},{x:200,w:36}];
  wins.forEach(({x,w})=>{
    // Sky outside
    _r(ctx,x,0,w,_WH,'#0b1828');
    // City skyline silhouette
    [[x+2,9,3,5],[x+7,7,4,7],[x+13,10,3,4],[x+18,8,5,6],[x+25,9,4,5],[x+31,6,4,8]].forEach(([bx,by,bw,bh])=>_r(ctx,bx,by,bw,_WH-by,'#0d1f30'));
    // Window pane dividers (cross)
    _r(ctx,x+w/2-0.5,0,1,_WH,'#1a2d40');
    _r(ctx,x,_WH/2-0.5,w,1,'#1a2d40');
    // Vattenfall yellow frame
    ctx.fillStyle='#ffd600';
    ctx.fillRect(x*_PX,0,1,_WH*_PX);                     // left
    ctx.fillRect((x+w)*_PX,0,1,_WH*_PX);                 // right
    ctx.fillRect(x*_PX,(_WH-1.5)*_PX,w*_PX,2);           // bottom sill
    ctx.fillRect(x*_PX,0,w*_PX,2);                        // top bar
    // Subtle light on floor below window
    _r(ctx,x+1,_WH,w-2,6,'rgba(255,230,80,.04)');
  });

  // ── Wall columns between windows ──
  [{x:0,w:8},{x:44,w:11},{x:91,w:12},{x:139,w:13},{x:188,w:12},{x:236,w:14}].forEach(({x,w})=>{
    _r(ctx,x,0,w,_WH,'#131525');
    _r(ctx,x,0,1,_WH,'#0a0c18');
  });

  // ── Ceiling light strip ──
  _r(ctx,0,0,LW,1,'rgba(255,220,80,.06)');
  ctx.fillStyle='rgba(255,230,100,.03)';
  ctx.fillRect(0,0,W,3);

  // ── Floor: warm wood planks ──
  const planks=['#28180a','#2e1c0c','#261709','#311e0d','#2a1a0b'];
  for(let py=_WH;py<LH;py+=3){
    _r(ctx,0,py,LW,2.5,planks[Math.floor((py-_WH)/3)%planks.length]);
    // Plank seam
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(0,py*_PX,W,1);
    // Subtle highlight on each plank
    ctx.fillStyle='rgba(255,200,100,.03)';ctx.fillRect(0,py*_PX+1,W,1);
  }
  // Long plank lines (vertical grain, very subtle)
  ctx.strokeStyle='rgba(0,0,0,.08)';ctx.lineWidth=1;
  for(let x=0;x<W;x+=30*_PX){ctx.beginPath();ctx.moveTo(x,_WH*_PX);ctx.lineTo(x,H);ctx.stroke();}
}

// ── FURNITURE ──────────────────────────────────────────────────────────────────

// Light-wood Vattenfall-style desk with yellow accent strip
function _desk(ctx,lx,ly,lc){
  // Tabletop (light birch wood)
  _r(ctx,lx,ly,26,2,'#c4a96a');_r(ctx,lx,ly+2,26,5,'#b89458');
  _r(ctx,lx,ly,26,1,'#d4b878');       // highlight
  _r(ctx,lx,ly,1,7,'#8a6e3e');        // left shadow
  // Vattenfall yellow front edge strip
  _r(ctx,lx,ly+7,26,1,'#ffd600');
  // Legs
  _r(ctx,lx+1,ly+8,3,8,'#4a3218');_r(ctx,lx+22,ly+8,3,8,'#4a3218');
  _r(ctx,lx+2,ly+8,1,8,'rgba(255,255,255,.1)');
  // Papers / items on desk
  _r(ctx,lx+2,ly+2,5,3,'rgba(220,230,255,.12)');
  _r(ctx,lx+8,ly+3,4,2,'rgba(220,230,255,.08)');
  // Subtle glow from monitor
  _r(ctx,lx+4,ly+1,10,1,lc,.08);
}

function _monitor(ctx,lx,ly,lc){
  const mx=lx+6,my=ly-14;
  // Stand
  _r(ctx,mx+4,my+12,4,3,'#2a2d3e');_r(ctx,mx+3,my+14,6,1,'#1a1c28');
  // Base
  _r(ctx,mx+2,my+11,7,2,'#1e2030');
  // Screen bezel
  _r(ctx,mx,my,13,12,'#12151f');_r(ctx,mx+1,my+1,11,10,'#060a10');
  // Screen glow
  ctx.globalAlpha=.18;ctx.fillStyle=lc;ctx.fillRect((mx+1)*_PX,(my+1)*_PX,11*_PX,10*_PX);ctx.globalAlpha=1;
  // Code lines on screen
  [[9,.85],[7,.6],[8,.5],[5,.42],[7,.52],[6,.4]].forEach(([w,a],i)=>{_r(ctx,mx+1.5,my+2+i*1.45,w,.8,lc,a);});
  // Status bar at bottom of screen
  _r(ctx,mx+1,my+10,11,1,lc,.15);
  // Power LED
  _r(ctx,mx+12,my+11,1,1,'#4ade80',.8);
}

// Dual monitor setup (for l1_1 and multi-monitor scenes)
function _dualMonitor(ctx,lx,ly,lc1,lc2,frame){
  const blink=(frame%50)<25;
  // Left monitor - SAS
  _r(ctx,lx,ly,13,12,'#12151f');_r(ctx,lx+1,ly+1,11,10,'#060a10');
  ctx.globalAlpha=.18;ctx.fillStyle=lc1;ctx.fillRect((lx+1)*_PX,(ly+1)*_PX,11*_PX,10*_PX);ctx.globalAlpha=1;
  [[9,.85],[6,.6],[8,.5],[5,.38]].forEach(([w,a],i)=>_r(ctx,lx+1.5,ly+2+i*1.8,w,.8,lc1,a));
  if(blink)_r(ctx,lx+2,ly+9.5,1,1.5,lc1);
  _r(ctx,lx+4,ly+13,5,2,'#1a1d2e');_lbl(ctx,'SAS',lx+3,ly+16,lc1,6);
  // Right monitor - PySpark
  _r(ctx,lx+16,ly,13,12,'#12151f');_r(ctx,lx+17,ly+1,11,10,'#060a10');
  ctx.globalAlpha=.18;ctx.fillStyle=lc2;ctx.fillRect((lx+17)*_PX,(ly+1)*_PX,11*_PX,10*_PX);ctx.globalAlpha=1;
  [[9,.85],[6,.6],[8,.5],[5,.38]].forEach(([w,a],i)=>_r(ctx,lx+17.5,ly+2+i*1.8,w,.8,lc2,a));
  if(!blink)_r(ctx,lx+18,ly+9.5,1,1.5,lc2);
  _r(ctx,lx+20,ly+13,5,2,'#1a1d2e');_lbl(ctx,'PySpark',lx+15,ly+16,lc2,6);
}

function _chair(ctx,lx,ly){
  // Backrest
  _r(ctx,lx+1,ly-9,7,9,'#1a2d45');_r(ctx,lx+1,ly-9,7,1,'#243f63');
  _r(ctx,lx+2,ly-8,5,6,'rgba(255,255,255,.04)');
  // Seat
  _r(ctx,lx,ly,9,3,'#162438');_r(ctx,lx,ly,9,1,'#1e3350');
  // Armrests
  _r(ctx,lx,ly-2,1,5,'#0f1a28');_r(ctx,lx+9,ly-2,1,5,'#0f1a28');
  // Legs
  _r(ctx,lx+1,ly+3,2,6,'#0d1520');_r(ctx,lx+6,ly+3,2,6,'#0d1520');
  _r(ctx,lx,ly+9,4,1,'#07090f');_r(ctx,lx+6,ly+9,4,1,'#07090f');
}

// Small potted plant (succulent / leafy)
function _plant(ctx,lx,ly){
  // Pot
  _r(ctx,lx+1,ly+6,5,5,'#4a3728');_r(ctx,lx,ly+7,7,4,'#3d2d20');
  _r(ctx,lx,ly+7,7,1,'#5a4030');      // pot rim highlight
  _r(ctx,lx+2,ly+8,3,2,'#2e2016');    // pot shadow
  // Soil
  _r(ctx,lx+1,ly+6,5,2,'#1e140a');
  // Leaves (overlapping ovals)
  _r(ctx,lx+2,ly,2,6,'#2e5e28');      // center stem
  _r(ctx,lx,ly+2,3,4,'#366b2e');      // left leaf
  _r(ctx,lx+4,ly+2,3,4,'#2a5424');    // right leaf
  _r(ctx,lx+1,ly,4,3,'#3a7a32');      // top leaf
  _r(ctx,lx+2,ly+1,2,2,'#4a9040');    // top highlight
}

// Large floor plant (monstera style, Vattenfall offices have these)
function _bigPlant(ctx,lx,ly){
  // Big pot (anthracite)
  _r(ctx,lx+2,ly+20,9,8,'#2a2d35');_r(ctx,lx+1,ly+21,11,7,'#1e2028');
  _r(ctx,lx+1,ly+21,11,1,'#3a3d4a');   // rim highlight
  _r(ctx,lx+3,ly+23,7,3,'#14161c');    // pot shadow
  // Soil
  _r(ctx,lx+2,ly+20,9,3,'#1a1208');
  // Main trunk / stem
  _r(ctx,lx+5,ly+10,3,12,'#2a4020');
  // Large leaves (monstera-like with cutouts)
  _r(ctx,lx,ly+4,8,8,'#2d6028');       // main left leaf
  _r(ctx,lx+1,ly+5,3,3,'#0f1020');     // cutout
  _r(ctx,lx+7,ly+6,7,7,'#3a7832');     // main right leaf
  _r(ctx,lx+10,ly+7,2,3,'#0f1020');    // cutout
  _r(ctx,lx+2,ly,6,6,'#367530');       // top leaf
  _r(ctx,lx+3,ly+1,2,2,'#4a9040');     // top highlight
  _r(ctx,lx,ly+10,5,5,'#28562a');      // lower left
  _r(ctx,lx+9,ly+11,5,5,'#2d6030');    // lower right
  // Leaf shine dots
  _r(ctx,lx+2,ly+6,1,1,'rgba(100,200,80,.3)');
  _r(ctx,lx+9,ly+8,1,1,'rgba(100,200,80,.25)');
  _r(ctx,lx+4,ly+2,1,1,'rgba(100,200,80,.3)');
}

// Pendant lamp hanging from ceiling
function _pendantLight(ctx,cx,lc){
  // Wire
  ctx.strokeStyle='rgba(200,180,100,.4)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(cx*_PX,0);ctx.lineTo(cx*_PX,9*_PX);ctx.stroke();
  // Shade (cone shape)
  _r(ctx,cx-3,9,6,1,'#d4c070');          // shade top
  _r(ctx,cx-4,10,8,2,'#b8a060');         // shade body
  _r(ctx,cx-5,12,10,1,'#a08850');        // shade bottom rim
  // Light glow inside shade
  _r(ctx,cx-2,10,4,1,'rgba(255,240,150,.35)');
  // Light pool on surface below (subtle)
  _r(ctx,cx-12,_WH+1,24,3,'rgba(255,230,100,.04)');
}

// Coffee machine / kitchen bar
function _coffeeBar(ctx,lx,ly){
  // Counter
  _r(ctx,lx,ly+8,20,3,'#c4a96a');_r(ctx,lx,ly+8,20,1,'#d4b878');
  _r(ctx,lx,ly+11,20,8,'#2a1c0c');
  // Coffee machine (dark, rounded)
  _r(ctx,lx+2,ly,6,9,'#1e2030');_r(ctx,lx+2,ly,6,1,'#2d3045');
  _r(ctx,lx+3,ly+1,4,3,'#12141e');    // screen area
  _r(ctx,lx+4,ly+2,2,1,'#ffd600',.6); // Vattenfall yellow LED
  _r(ctx,lx+3,ly+5,4,2,'#0a0c14');    // drip tray
  // Cups
  _r(ctx,lx+10,ly+6,3,3,'#eee8d5');_r(ctx,lx+11,ly+6,1,2,'rgba(80,50,20,.6)');
  _r(ctx,lx+14,ly+7,3,2,'#ddd8c5');
  // Steam
  ctx.globalAlpha=.3;ctx.strokeStyle='#ccc';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo((lx+11)*_PX,ly*_PX);ctx.bezierCurveTo((lx+10)*_PX,(ly-2)*_PX,(lx+12)*_PX,(ly-4)*_PX,(lx+11)*_PX,(ly-6)*_PX);ctx.stroke();
  ctx.globalAlpha=1;
  // Label
  _lbl(ctx,'☕',(lx+1),(ly+18),'#6b4422',7);
}

// Background desk (dimmer, smaller — creates depth)
function _bgDesk(ctx,lx,ly,alpha){
  ctx.globalAlpha=alpha||0.38;
  // Desk
  _r(ctx,lx,ly,18,5,'#a08848');_r(ctx,lx,ly,18,1,'#b89a58');
  _r(ctx,lx,ly+5,18,1,'#ffd600');    // yellow strip
  _r(ctx,lx+1,ly+6,3,6,'#3a2a18');_r(ctx,lx+14,ly+6,3,6,'#3a2a18');
  // Monitor
  _r(ctx,lx+4,ly-8,9,8,'#12151f');_r(ctx,lx+5,ly-7,7,6,'#060a10');
  _r(ctx,lx+5,ly-7,7,6,'rgba(100,160,255,.12)');
  [[5,.6],[4,.4],[5,.5],[3,.35]].forEach(([w,a],i)=>_r(ctx,lx+5.5,ly-6+i*1.4,w,.6,'#818cf8',a));
  _r(ctx,lx+7,ly-1,3,2,'#1a1d2e');
  // Silhouette person
  _r(ctx,lx+6,ly-18,4,4,'#2d3550');  // head
  _r(ctx,lx+5,ly-14,6,7,'#222840');  // body
  _r(ctx,lx+4,ly-12,2,4,'#1e2438');  // arm left
  _r(ctx,lx+10,ly-11,2,3,'#1e2438'); // arm right
  ctx.globalAlpha=1;
}

// TV/info screen on wall
function _tvWall(ctx,lx,ly,lc){
  _r(ctx,lx,ly,28,16,'#0a0c12');_r(ctx,lx+1,ly+1,26,14,'#060810');
  _r(ctx,lx+1,ly+1,26,14,lc,.06);
  // Energy dashboard content
  _r(ctx,lx+2,ly+2,24,3,'rgba(255,214,0,.08)');
  _lbl(ctx,'VATTENFALL',lx+3,ly+5,'#ffd600',.7>0?6:0);
  // Bars (energy data)
  [[3,8],[6,12],[4,7],[8,14],[5,9],[7,11]].forEach(([h,x],i)=>{_r(ctx,lx+3+i*4,ly+14-h,2.5,h,lc,.4+i*.06);});
  _r(ctx,lx+2,ly+14,24,1,'rgba(255,255,255,.08)');
  // Frame
  _r(ctx,lx-1,ly-1,30,1,'#1e2030');_r(ctx,lx-1,ly+16,30,1,'#1e2030');
  _r(ctx,lx-1,ly-1,1,18,'#1e2030');_r(ctx,lx+29,ly-1,1,18,'#1e2030');
}

function _shelf(ctx,lx,ly){
  _r(ctx,lx,ly,6,22,'#3d2810');_r(ctx,lx,ly,6,1,'#5a3c18');
  const bc=['#ef4444','#3b82f6','#ffd600','#10b981','#8b5cf6','#ec4899','#06b6d4','#84cc16'];
  let ci=0;for(let row=0;row<3;row++){_r(ctx,lx,ly+1+row*7,6,1,'#2a1c08');let bx=lx+.3;while(bx<lx+5.5){const bw=1+(ci%2?.5:0);_r(ctx,bx,ly+2+row*7,bw,5,bc[ci%bc.length]);_r(ctx,bx,ly+2+row*7,bw,.5,'rgba(255,255,255,.2)');bx+=bw+.3;ci++;}}
  // Small plant on top shelf
  _r(ctx,lx+1,ly-4,4,4,'#2d5a28');_r(ctx,lx+2,ly-5,2,2,'#3a7030');
  _r(ctx,lx+1,ly,4,2,'#3a2810');
}

function _whiteboard(ctx,lx,ly){
  _r(ctx,lx,ly,20,14,'#7a868f');_r(ctx,lx+1,ly+1,18,12,'#edf2f7');_r(ctx,lx+1,ly+1,18,1,'rgba(255,255,255,.5)');
}

// ── CHARACTER ──────────────────────────────────────────────────────────────────
function _char(ctx,lx,ly,state,frame,lc){
  const bob=state==='idle'?Math.round(Math.sin(frame*.07)*.8):0;
  const wc=state==='walking'?Math.sin(frame*.22):0;
  const isSit=state==='typing'||state==='reading';
  const y=ly+bob+(isSit?2:0);
  _r(ctx,lx+3,y-10,4,2,'#1a0e00');_r(ctx,lx+2,y-9,1,1,'#1a0e00');_r(ctx,lx+7,y-9,1,1,'#1a0e00');
  _r(ctx,lx+2,y-8,6,5,'#f5c5a8');
  _r(ctx,lx+3,y-5,1,1,'#0d0d0d');_r(ctx,lx+6,y-5,1,1,'#0d0d0d');
  if(!isSit)_r(ctx,lx+4,y-4,2,1,'#c97060');
  _r(ctx,lx+2,y-3,6,6,lc);_r(ctx,lx+2,y-3,6,1,'rgba(255,255,255,.18)');
  if(state==='pointing'){const ab=Math.round(Math.sin(frame*.1));_r(ctx,lx-1,y-6+ab,3,3,lc);_r(ctx,lx-1,y-6+ab,3,1,'#f5c5a8');_r(ctx,lx+8,y-2,2,4,lc);}
  else{const tr=isSit?Math.round(Math.abs(Math.sin(frame*.35))):0;_r(ctx,lx,y-2,2,4,lc);_r(ctx,lx+8,y-2,2,4+tr,lc);}
  if(isSit){_r(ctx,lx+2,y+3,6,3,'#1e3050');_r(ctx,lx+1,y+5,3,2,'#1e3050');_r(ctx,lx+6,y+5,3,2,'#1e3050');_r(ctx,lx,y+7,4,1,'#0d0a00');_r(ctx,lx+6,y+7,4,1,'#0d0a00');}
  else{const ll=Math.round(wc*2.5),rl=Math.round(-wc*2.5);_r(ctx,lx+2,y+3,3,4+ll,'#1e3050');_r(ctx,lx+5,y+3,3,4+rl,'#1e3050');_r(ctx,lx+1,y+7+ll,4,1,'#0d0a00');_r(ctx,lx+5,y+7+rl,4,1,'#0d0a00');}
}
function _bubble(ctx,lx,ly,text,lc){
  const cx=(lx+5)*_PX,ty=(ly-12)*_PX;
  ctx.font=`bold 9px 'JetBrains Mono',monospace`;
  const tw=ctx.measureText(text).width,pad=5,bh=15,bw=tw+pad*2;
  const bx=Math.max(2,cx-bw/2),by=ty-bh-4;
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(bx+2,by+2,bw,bh);
  ctx.fillStyle='#07090f';ctx.fillRect(bx,by,bw,bh);
  ctx.strokeStyle=lc;ctx.lineWidth=1.5;ctx.strokeRect(bx,by,bw,bh);
  ctx.fillStyle='#07090f';ctx.beginPath();ctx.moveTo(cx-4,by+bh);ctx.lineTo(cx+4,by+bh);ctx.lineTo(cx,by+bh+5);ctx.closePath();ctx.fill();
  ctx.strokeStyle=lc;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-4,by+bh-1);ctx.lineTo(cx,by+bh+5);ctx.stroke();ctx.beginPath();ctx.moveTo(cx+4,by+bh-1);ctx.lineTo(cx,by+bh+5);ctx.stroke();
  ctx.fillStyle=lc;ctx.fillText(text,bx+pad,by+bh-3);
}

// ── PER-LESSON PROPS ────────────────────────────────────────────────────────────

// l1_1 – SAS vs PySpark: two monitors side-by-side with blinking cursor
function _propTwoMonitors(ctx,lx,ly,frame){
  const blink=(frame%50)<25;
  // Left – SAS (orange)
  _r(ctx,lx,ly,11,10,'#1e2235');_r(ctx,lx+1,ly+1,9,8,'#060a10');
  ctx.globalAlpha=.22;ctx.fillStyle='#f59e0b';ctx.fillRect((lx+1)*_PX,(ly+1)*_PX,9*_PX,8*_PX);ctx.globalAlpha=1;
  [[7,.8],[5,.55],[6,.45],[4,.38]].forEach(([w,a],i)=>_r(ctx,lx+1.5,ly+2+i*1.6,w,.7,'#f59e0b',a));
  if(blink)_r(ctx,lx+2,ly+8,1,1.5,'#f59e0b');
  _r(ctx,lx+3,ly+11,5,2,'#1a1d2e');_lbl(ctx,'SAS',lx+2,ly+14,'#f59e0b',6);
  // Right – PySpark (cyan)
  _r(ctx,lx+14,ly,11,10,'#1e2235');_r(ctx,lx+15,ly+1,9,8,'#060a10');
  ctx.globalAlpha=.22;ctx.fillStyle='#38bdf8';ctx.fillRect((lx+15)*_PX,(ly+1)*_PX,9*_PX,8*_PX);ctx.globalAlpha=1;
  [[7,.8],[5,.55],[6,.45],[4,.38]].forEach(([w,a],i)=>_r(ctx,lx+15.5,ly+2+i*1.6,w,.7,'#38bdf8',a));
  if(!blink)_r(ctx,lx+16,ly+8,1,1.5,'#38bdf8');
  _r(ctx,lx+17,ly+11,5,2,'#1a1d2e');_lbl(ctx,'PySpark',lx+11,ly+14,'#38bdf8',6);
  // "vs"
  if(Math.floor(frame/30)%2===0){ctx.globalAlpha=.8;_lbl(ctx,'vs',lx+11.3,ly+6.5,'#374151',7);ctx.globalAlpha=1;}
}

// l1_2 – Data types: animated schema table
function _propTypeTable(ctx,lx,ly,lc,frame){
  const rows=[{n:'name',t:'String',c:'#3b82f6'},{n:'alter',t:'Int',c:'#10b981'},{n:'datum',t:'Date',c:'#f59e0b'},{n:'aktiv',t:'Bool',c:'#8b5cf6'},{n:'betrag',t:'Double',c:'#ef4444'}];
  const t=((frame%240)/240);
  _r(ctx,lx,ly,26,3,'#1e2a3a');_lbl(ctx,'SPALTE',lx+1,ly+2.2,'#374151',5);_lbl(ctx,'TYP',lx+14,ly+2.2,'#374151',5);
  rows.forEach((row,i)=>{
    const a=_ease(Math.min(1,Math.max(0,t*6-i*.5)));
    _r(ctx,lx,ly+3+i*4.5,26,4,'#111827',a);_r(ctx,lx,ly+3+i*4.5,12,4,row.c+'18',a);
    ctx.globalAlpha=a;_lbl(ctx,row.n,lx+1,ly+6.2+i*4.5,'#94a3b8',6);_r(ctx,lx+13,ly+4+i*4.5,12,3,row.c+'33');_lbl(ctx,row.t,lx+14,ly+6.2+i*4.5,row.c,6);ctx.globalAlpha=1;
  });
}

// l2_1 – WHERE filter: funnel with rows bouncing through
function _propFunnel(ctx,lx,ly,lc,frame){
  const rows=[{c:'#3b82f6',ok:true},{c:'#8b5cf6',ok:false},{c:'#10b981',ok:true},{c:'#f59e0b',ok:false},{c:'#06b6d4',ok:true}];
  // Funnel shape
  for(let i=0;i<5;i++){const fw=16-i*2;_r(ctx,lx+(16-fw)/2,ly+i*2,fw,2,'#1e2a3a');}
  _r(ctx,lx+7,ly+10,2,8,'#1e2a3a');
  _lbl(ctx,'IN',lx+6,ly-1,'#4b5563',5);_lbl(ctx,'OUT',lx+5,ly+19,'#4b5563',5);
  const t=((frame%100)/100);
  rows.forEach((r,i)=>{
    const off=((t+i/5)%1);
    if(off<.45){const ry=_lerp(ly-3,ly+8,_ease(off/.45));_r(ctx,lx+1+i*2.8,ry,2.5,2.5,r.c,1);}
    else if(r.ok){const ry=_lerp(ly+10,ly+19,_ease((off-.45)/.55));_r(ctx,lx+7.3,ry,1.5,2.5,r.c,.9);}
    else{ctx.globalAlpha=Math.max(0,1-((off-.45)/.3)*1.2);_r(ctx,lx+1+i*2.8,ly+8+((off-.45)/.55)*5,2.5,2.5,r.c);ctx.globalAlpha=1;}
  });
}

// l3_1 – Sonderzeichen: magnifying glass scanning names
function _propMagnifier(ctx,lx,ly,lc,frame){
  const rows=[{t:'Mueller',ok:true},{t:'Fisch!r',ok:false},{t:"O'Brien",ok:true},{t:'Mül@er',ok:false},{t:'Wagner',ok:true}];
  rows.forEach((r,i)=>{
    _r(ctx,lx,ly+i*4.8,22,4,'#111827');_lbl(ctx,r.t,lx+1,ly+i*4.8+3,r.ok?'#6b7280':'#ef4444',6);
    _lbl(ctx,r.ok?'✓':'✗',lx+18,ly+i*4.8+3,r.ok?'#10b981':'#ef4444',7);
  });
  // Scanning lens moving vertically
  const scanY=ly+((frame*.15)%(rows.length*4.8));
  ctx.globalAlpha=.22;ctx.fillStyle=lc;ctx.fillRect(lx*_PX,scanY*_PX,22*_PX,_PX*2);ctx.globalAlpha=1;
  // Lens circle
  const gx=lx+14,gy=scanY+2;
  ctx.strokeStyle=lc+'bb';ctx.lineWidth=2;ctx.beginPath();ctx.arc((gx+3)*_PX,gy*_PX,4*_PX,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle=lc;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo((gx+6)*_PX,(gy+3)*_PX);ctx.lineTo((gx+9)*_PX,(gy+6)*_PX);ctx.stroke();
}

// l3_2 – Namen bereinigen: before/after name cleaning
function _propClean(ctx,lx,ly,lc,frame){
  const t=_ease(((frame%140)/140));
  const dirty=[' Müll@r ','van  Berg','Fischer1'];
  const clean=['Müllr','van Berg','Fischer'];
  _lbl(ctx,'VORHER',lx,ly-1,'#4b5563',5);
  dirty.forEach((d,i)=>{_r(ctx,lx,ly+2+i*6,26,5,'#2d1515');_lbl(ctx,d,lx+1,ly+5.5+i*6,'#ef4444',6);});
  if(t>.3){
    const a=_ease((t-.3)/.7);
    ctx.globalAlpha=a;_lbl(ctx,'NACHHER',lx+28,ly-1,lc,5);
    clean.forEach((c,i)=>{_r(ctx,lx+28,ly+2+i*6,22,5,'#0d2a1e');_lbl(ctx,c,lx+29,ly+5.5+i*6,lc,6);});
    ctx.globalAlpha=1;
    // Arrow
    ctx.globalAlpha=a;ctx.strokeStyle=lc;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo((lx+27)*_PX,(ly+10)*_PX);ctx.lineTo((lx+27)*_PX,(ly+14)*_PX);ctx.stroke();ctx.globalAlpha=1;
  }
  // Sweeping animation line
  const sx=_lerp(lx,lx+25,t);
  ctx.globalAlpha=.3;ctx.fillStyle=lc;ctx.fillRect(sx*_PX,ly*_PX,2,22*_PX);ctx.globalAlpha=1;
}

// l3_3 – DQ Framework: rows with check/cross results streaming
function _propDQRows(ctx,lx,ly,lc,frame){
  const rows=[{n:'Mueller',ok:true,dup:false},{n:'Fisch!r',ok:false,dup:false},{n:'Schmidt',ok:true,dup:false},{n:'Schmidt',ok:true,dup:true},{n:'NULL',ok:false,dup:false}];
  const t=((frame%160)/160);
  rows.forEach((r,i)=>{
    const a=_ease(Math.min(1,Math.max(0,t*7-i*.6)));
    _r(ctx,lx,ly+i*5,22,4,'#111827',a);
    const col=r.ok&&!r.dup?'#6b7280':r.dup?'#f59e0b':'#ef4444';
    ctx.globalAlpha=a;_lbl(ctx,r.n,lx+1,ly+i*5+2.8,col,6);
    _lbl(ctx,r.ok&&!r.dup?'OK':r.dup?'DUP':'ERR',lx+16,ly+i*5+2.8,col,6);ctx.globalAlpha=1;
  });
  const ok=Math.round(t*2);const err=Math.round(t*2);
  _lbl(ctx,'OK:'+ok+' ERR:'+err,lx,ly+27,lc,5);
}

// l4_1 – GROUP BY: whiteboard with growing bars
function _propBars(ctx,lx,ly,lc,frame){
  _whiteboard(ctx,lx,ly);
  const barH=[4,7,3,8,5,6];const t=((frame%150)/150);
  barH.forEach((h,i)=>{
    const a=Math.min(1,Math.max(0,t*3-i*.3));const ah=Math.round(h*a);
    if(ah>0){_r(ctx,lx+2+i*2.3,ly+11-ah,1.8,ah,lc,.9);_r(ctx,lx+2+i*2.3,ly+11-ah,1.8,.5,'rgba(255,255,255,.3)',a);}
  });
  _lbl(ctx,'GROUP BY',lx+1,ly+13.5,'#374151',5);
}

// l5_1 – JOIN: two tables with link lines + person walking
function _propJoin(ctx,lx,ly,lc,frame,W){
  const LW=W/_PX,half=(LW-lx*2)/2;
  // Table A
  _r(ctx,lx,ly,half-4,3,'#1e3050');_lbl(ctx,'Kunden',lx+1,ly+2.3,'#3b82f6',5);
  ['K001','K002','K003'].forEach((v,i)=>{ _r(ctx,lx,ly+3+i*3.5,half-4,3,'#111827');_lbl(ctx,v,lx+1,ly+5.3+i*3.5,'#6b7280',5); });
  // Table B
  const bx=lx+half+2;
  _r(ctx,bx,ly,half-4,3,'#1e3050');_lbl(ctx,'Bestellungen',bx+1,ly+2.3,'#38bdf8',5);
  ['K001','K001','K003'].forEach((v,i)=>{ _r(ctx,bx,ly+3+i*3.5,half-4,3,'#111827');_lbl(ctx,v,bx+1,ly+5.3+i*3.5,'#6b7280',5); });
  // Link lines for matching rows
  const t=((frame%80)/80);
  [[0,0],[2,2]].forEach(([ai,bi])=>{
    const a=_ease(Math.min(1,t*3-ai*.4));ctx.globalAlpha=a*0.5;ctx.strokeStyle=lc;ctx.lineWidth=1;ctx.setLineDash([2,2]);
    ctx.beginPath();ctx.moveTo((lx+half-4)*_PX,(ly+4.5+ai*3.5)*_PX);ctx.lineTo(bx*_PX,(ly+4.5+bi*3.5)*_PX);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
  });
}

// l6_1 – DB Connect: server rack with animated packet
function _propServer(ctx,lx,ly,lc,frame){
  _r(ctx,lx,ly,14,24,'#0f172a');_r(ctx,lx,ly,14,1,'#1e2a3a');_r(ctx,lx,ly,1,24,'#1e2a3a');
  for(let u=0;u<5;u++){
    _r(ctx,lx+1,ly+2+u*4,12,3,'#0d1b2a');_r(ctx,lx+1,ly+2+u*4,12,1,'#1e3a5f');
    const blink=(frame+u*14)%60<30;
    _r(ctx,lx+2,ly+3+u*4,1,1,blink?lc:'#0d2a1e');
    _r(ctx,lx+5,ly+3+u*4,6,.6,'#1e3a5f',.6);
  }
  // Animated packet along cable
  const t=((frame%90)/90);
  const px=(lx+15)+_lerp(0,16,_ease(t));
  ctx.strokeStyle=lc+'44';ctx.lineWidth=1.5;ctx.setLineDash([2,3]);
  ctx.beginPath();ctx.moveTo((lx+15)*_PX,(ly+11)*_PX);ctx.lineTo((lx+31)*_PX,(ly+11)*_PX);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.arc(px*_PX,(ly+11)*_PX,2,0,Math.PI*2);ctx.fillStyle=lc;ctx.fill();
  _lbl(ctx,'JDBC',lx+15,ly+9,'#374151',5);
}

// l7_1 – Performance: speedometer gauge
function _propGauge(ctx,lx,ly,lc,frame){
  const cx=(lx+11)*_PX,cy=(ly+14)*_PX,r=9*_PX;
  const t=_ease((Math.sin(frame*.03)+1)/2);
  ctx.strokeStyle='#1e2535';ctx.lineWidth=5;ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*.75,Math.PI*.25+Math.PI,false);ctx.stroke();
  const cIdx=Math.floor(t*2.99);
  ctx.strokeStyle=['#10b981','#f59e0b','#ef4444'][cIdx];ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*.75,Math.PI*.75+Math.PI*1.5*t,false);ctx.stroke();
  const angle=Math.PI*.75+Math.PI*1.5*t;
  ctx.strokeStyle=lc;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(angle)*(r-2),cy+Math.sin(angle)*(r-2));ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,2.5,0,Math.PI*2);ctx.fillStyle=lc;ctx.fill();
  _lbl(ctx,Math.round(t*100)+'%',lx+7,ly+18,lc,7);_lbl(ctx,'PERF',lx+7,ly+21,'#374151',5);
}

// l8_1 – Pipeline SAP→DWH: four stage pipeline with animated packets
function _propPipeline(ctx,W,H,lc,frame){
  const stages=[{n:'SAP',c:'#3b82f6'},{n:'STAGE',c:'#8b5cf6'},{n:'CORE',c:'#10b981'},{n:'MART',c:lc}];
  const LW=W/_PX,sw=18,gap=(LW-stages.length*sw)/(stages.length+1),sy=_WH+8,sh=18;
  stages.forEach((s,i)=>{
    const sx=gap+i*(sw+gap);
    _r(ctx,sx,sy,sw,sh,s.c+'18');_r(ctx,sx,sy,sw,2,s.c);_lbl(ctx,s.n,sx+sw/2-s.n.length*1.9,sy+9,s.c,7);
    _lbl(ctx,[4312,4189,4188,4188][i],sx+1,sy+15,'#374151',5);
    if(i<stages.length-1){
      const ax=sx+sw,ay=sy+sh/2,nx=ax+gap;
      const t=((frame%120)/120);const pt=_ease(((t*stages.length-i+1)%1));
      ctx.strokeStyle=s.c+'66';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax*_PX,ay*_PX);ctx.lineTo(nx*_PX,ay*_PX);ctx.stroke();
      const px=ax+gap*pt;ctx.beginPath();ctx.arc(px*_PX,ay*_PX,2,0,Math.PI*2);ctx.fillStyle=stages[i+1].c;ctx.fill();
    }
  });
}

// l8_2 – MERGE: two stacks slide together
function _propMerge(ctx,lx,ly,lc,frame){
  const t=((frame%120)/120),e=_ease(t);
  const tgt=lx+8;
  const s1x=_lerp(lx-2,tgt,e),s2x=_lerp(lx+18,tgt+6,e);
  [[s1x,'#f59e0b','delta'],[s2x,'#38bdf8','target']].forEach(([sx,c,nm])=>{
    [3,2,1,0].forEach(i=>{_r(ctx,sx+i*.4,ly-.5-i*1.1,18,4,c,.5-i*.1);});
    _lbl(ctx,nm,sx+3,ly+3,c,5);
  });
  if(t>.6){
    const a=_ease((t-.6)/.4);
    _r(ctx,tgt+1,ly+10,16,5,lc+'22',a);
    ctx.globalAlpha=a;_lbl(ctx,'MERGED ✓',tgt+2,ly+14,lc,6);ctx.globalAlpha=1;
  }
  _lbl(ctx,'WHEN MATCHED',lx-1,ly+19,'#374151',5);
}

// l9_1 – SCD2: row versioning with end-date animation
function _propSCD2(ctx,lx,ly,lc,frame){
  const t=((frame%180)/180);
  const p1=_ease(Math.min(1,t*2.5)),p2=_ease(Math.max(0,t*2.5-1));
  const cols=['KDNR','TARIF','AB','BIS','AKT'];const cw=[9,12,10,10,5];
  let x=lx;cols.forEach((c,i)=>{_lbl(ctx,c,x+.5,ly-1.5,'#374151',4.5);x+=cw[i]+1;});
  // Row 1: end-date turns orange
  x=lx;
  [['K1','Basis','2023','9999','●'],['K1','Basis','2023','2024','○']].slice(0,1).forEach(row=>{
    row.forEach((v,i)=>{const col=i===3?(p1>.15?'#fb923c':'#374151'):'#1e3050';_r(ctx,x,ly,cw[i],5.5,col,.8);_lbl(ctx,i===3?(p1>.15?'2024':'9999'):v,x+.5,ly+4,'#94a3b8',4.5);x+=cw[i]+1;});
  });
  // Row 2: new record slides in
  if(p2>.05){
    x=lx;
    [['K1','Prem.','2025','9999','●']].forEach(row=>{
      row.forEach((v,i)=>{_r(ctx,x,ly+7,cw[i],5.5,i===0?'#10b981':'#0d2a1e',p2);ctx.globalAlpha=p2;_lbl(ctx,v,x+.5,ly+11,'#4ade80',4.5);ctx.globalAlpha=1;x+=cw[i]+1;});
    });
    ctx.globalAlpha=p2;_lbl(ctx,'▶ NEU',lx+51,ly+11,'#4ade80',5);ctx.globalAlpha=1;
  }
  _lbl(ctx,'SCD Typ 2',lx,ly+18,lc,5);
}

// l10_1 – Smart Meter: animated electricity counter + bars
function _propMeter(ctx,lx,ly,lc,frame){
  _r(ctx,lx,ly,22,22,'#0d1117');_r(ctx,lx,ly,22,2,lc+'44');
  _r(ctx,lx+2,ly+3,18,8,'#060a10');
  const v=(Math.sin(frame*.04)*220+580).toFixed(1);
  _lbl(ctx,v,lx+3,ly+9,lc,7);_lbl(ctx,'kWh',lx+4,ly+12,'#4b5563',5);
  const bars=[.5,.8,.4,.9,.6,.7,.85,.35];
  bars.forEach((b,i)=>{const bh=Math.round(b*5);_r(ctx,lx+2+i*2.3,ly+21-bh,1.8,bh,lc,.7+b*.2);});
  _lbl(ctx,'15min',lx+4,ly+24,'#374151',5);
  // Lightning bolt
  const flash=(frame%40)<20;ctx.globalAlpha=flash?.9:.4;_lbl(ctx,'⚡',lx+18,ly+14,lc,10);ctx.globalAlpha=1;
}

// l11_1 – DQ Framework: full check dashboard
function _propDQDash(ctx,lx,ly,lc,frame){
  const t=((frame%200)/200);
  const checks=[{n:'NULL-Check',r:3,tot:100},{n:'Duplikate',r:7,tot:100},{n:'Sonderzeichen',r:12,tot:100},{n:'Leerzeichen',r:5,tot:100}];
  _lbl(ctx,'DQ Dashboard',lx,ly-1,lc,6);
  checks.forEach((c,i)=>{
    const a=_ease(Math.min(1,Math.max(0,t*5-i*.5)));
    _r(ctx,lx,ly+3+i*6,30,5,'#111827',a);
    const bw=Math.round((1-c.r/c.tot)*26*a);
    _r(ctx,lx,ly+3+i*6,bw,5,'#10b981',a*.7);
    ctx.globalAlpha=a;_lbl(ctx,c.n,lx+1,ly+7+i*6,'#6b7280',5);
    _lbl(ctx,c.r+'err',lx+22,ly+7+i*6,'#ef4444',5);ctx.globalAlpha=1;
  });
}

// l12_1 – GDPR: masked data with lock animation
function _propGDPR(ctx,lx,ly,lc,frame){
  const t=_ease(((frame%180)/180));
  const rows=[{real:'K.Müller-Berg',mask:'K.M***-B***'},{real:'max@mail.de',mask:'m**@****.de'},{real:'089-123456',mask:'089-***456'}];
  rows.forEach((r,i)=>{
    _r(ctx,lx,ly+i*6,28,5,'#111827');
    _lbl(ctx,t>.2?r.mask:r.real,lx+1,ly+i*6+3.5,t>.2?'#4b5563':'#94a3b8',5.5);
  });
  // Lock icon
  const locked=t>.5;const lkx=lx+20,lky=ly+14;
  _r(ctx,lkx,lky+3,8,7,locked?lc+'44':'#1e2535');
  ctx.strokeStyle=locked?lc:'#374151';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc((lkx+4)*_PX,(lky+2)*_PX,3*_PX,Math.PI,0,false);ctx.stroke();
  _r(ctx,lkx+3,lky+6,2,3,locked?lc:'#374151',locked?1:.5);
  ctx.globalAlpha=locked?.9:0.2;_lbl(ctx,'GDPR 🔒',lx,ly+22,lc,5);ctx.globalAlpha=1;
}

// l13_1 – Macros: spinning gear with code output
function _propMacro(ctx,lx,ly,lc,frame){
  const cx=(lx+9)*_PX,cy=(ly+10)*_PX,r=7*_PX;
  ctx.save();ctx.translate(cx,cy);ctx.rotate(frame*.025);
  ctx.strokeStyle=lc;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(Math.cos(a)*(r-1),Math.sin(a)*(r-1));ctx.lineTo(Math.cos(a)*(r+3),Math.sin(a)*(r+3));ctx.stroke();}
  ctx.fillStyle=lc+'22';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
  ctx.restore();
  // Code lines scrolling right
  const t=((frame%80)/80);
  ['%MACRO run','  DO stuff','%MEND run','%run(A)','%run(B)'].forEach((ln,i)=>{
    const a=_ease(Math.max(0,Math.min(1,t*5-i*.4)));ctx.globalAlpha=a;_lbl(ctx,ln,lx+20,ly+i*4.5+4,lc,5);ctx.globalAlpha=1;
  });
}

// l14_1 – DROP/KEEP: columns with some falling away
function _propDropKeep(ctx,lx,ly,lc,frame){
  const t=_ease(((frame%140)/140));
  const cols=[{n:'id',keep:true},{n:'name',keep:true},{n:'tmp1',keep:false},{n:'datum',keep:true},{n:'tmp2',keep:false},{n:'betrag',keep:true}];
  cols.forEach((c,i)=>{
    const cw=9,cx=lx+i*(cw+2);
    const fallen=!c.keep&&t>.25;
    const ft=fallen?_ease((t-.25)/.75):0;
    const dy=ft*14,a=Math.max(0,1-ft*1.5);
    _r(ctx,cx,ly+dy,cw,8,c.keep?lc+'22':'#2d1515',a);_r(ctx,cx,ly+dy,cw,1,c.keep?lc:'#ef4444',a);
    ctx.globalAlpha=a;_lbl(ctx,c.n,cx+.5,ly+dy+5.5,c.keep?lc:'#ef4444',4.5);ctx.globalAlpha=1;
    if(c.keep)_lbl(ctx,'K',cx+3,ly+12,lc,5);
    else if(t>.95)_lbl(ctx,'✗',cx+3,ly+12,'#ef4444',5);
  });
}

// l14_2 – CAT/CATX: string concatenation animation
function _propConcat(ctx,lx,ly,lc,frame){
  const t=_ease(((frame%130)/130));
  _r(ctx,lx,ly+3,12,6,'#1e2535');_lbl(ctx,"'van'",lx+1,ly+7,'#3b82f6',6);
  _r(ctx,lx+18,ly+3,12,6,'#1e2535');_lbl(ctx,"'Berg'",lx+19,ly+7,'#8b5cf6',6);
  // Plus moving
  const px=_lerp(lx+13,lx+15,Math.abs(Math.sin(frame*.06)));
  _lbl(ctx,'+',px,ly+7,'#374151',8);
  // CAT function label
  ctx.globalAlpha=.7;_lbl(ctx,'CATX',lx+13,ly+1,'#374151',5);ctx.globalAlpha=1;
  // Result appearing
  if(t>.5){
    const a=_ease((t-.5)/.5);
    _r(ctx,lx+4,ly+14,22,6,'#0d2a1e',a);
    ctx.globalAlpha=a;_lbl(ctx,"'van Berg'",lx+5,ly+18,lc,6);
    _lbl(ctx,'→',lx+13,ly+12,'#374151',7);ctx.globalAlpha=1;
  }
}

// l14_3 – PRXCHANGE: regex find & replace
function _propRegex(ctx,lx,ly,lc,frame){
  const t=((frame%120)/120);
  _lbl(ctx,'PRXCHANGE:',lx,ly-1,'#374151',5);
  _r(ctx,lx,ly+1,26,5,'#2d1515');_lbl(ctx,"Müll@r 123",lx+1,ly+4.5,'#ef4444',6);
  // Scan beam
  const sx=lx+t*26;ctx.globalAlpha=.3;ctx.fillStyle=lc;ctx.fillRect(sx*_PX,ly*_PX,2,7*_PX);ctx.globalAlpha=1;
  // Highlight illegal chars
  ['@',' ','1','2','3'].forEach((ch,i)=>{
    const hx=lx+7+i*2.5;const hi=t>(hx-lx)/26;
    if(hi){ctx.globalAlpha=.5;ctx.fillStyle='#ef4444';ctx.fillRect(hx*_PX,(ly+1)*_PX,_PX*2.5,5*_PX);ctx.globalAlpha=1;}
  });
  if(t>.5){
    const a=_ease((t-.5)/.5);
    _r(ctx,lx,ly+8,26,5,'#0d2a1e',a);
    ctx.globalAlpha=a;_lbl(ctx,'Müllr',lx+1,ly+11.5,lc,6);_lbl(ctx,'→ clean',lx+1,ly+6,'#374151',5);ctx.globalAlpha=1;
  }
}

// l15_1 – Dates: calendar with highlighted day + countdown
function _propCalendar(ctx,lx,ly,lc,frame){
  _r(ctx,lx,ly,24,22,'#0f1117');_r(ctx,lx,ly,24,3,lc+'44');
  _lbl(ctx,'MAR 2026',lx+3,ly+2.5,lc,6);
  const days=['Mo','Di','Mi','Do','Fr','Sa','So'];
  days.forEach((d,i)=>_lbl(ctx,d,lx+.5+i*3.1,ly+6,'#374151',4.5));
  const today=11,blink=Math.floor(frame/25)%2;
  for(let n=1;n<=31;n++){
    const row=Math.floor((n+3-1)/7),col=(n+3-1)%7;
    const isToday=n===today;
    if(isToday&&blink)_r(ctx,lx+.5+col*3.1,ly+7.5+row*3,2.8,2.5,lc+'44');
    _lbl(ctx,n<10?' '+n:''+n,lx+.5+col*3.1,ly+9.5+row*3,isToday?lc:'#4b5563',4.5);
  }
  // Days remaining countdown
  const remaining=295-Math.floor(frame*.05)%10;
  _lbl(ctx,'Δ '+remaining+'d',lx+15,ly+24,'#374151',5);
}

// l16_1 – SQL dialects: balance scales
function _propScales(ctx,lx,ly,lc,frame){
  const tilt=Math.sin(frame*.035)*3;
  const cx=lx+13;
  // Pole
  _r(ctx,cx,ly+2,1,18,'#374151');
  // Beam
  _r(ctx,cx-13,ly+4,27,1,'#374151');
  // Left pan (SAS)
  const ly1=ly+9+tilt;
  _r(ctx,cx-13,ly1,10,5,'#1e3050');_r(ctx,cx-13,ly1,10,1,'#3b82f6');
  _lbl(ctx,'SAS',cx-10,ly1+3.5,'#f59e0b',6);
  // Right pan (SQL)
  const ly2=ly+9-tilt;
  _r(ctx,cx+4,ly2,10,5,'#1e2a0d');_r(ctx,cx+4,ly2,10,1,'#10b981');
  _lbl(ctx,'SQL',cx+5,ly2+3.5,'#38bdf8',6);
  // Strings
  ctx.strokeStyle='#374151';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo((cx-8)*_PX,(ly+5)*_PX);ctx.lineTo((cx-8)*_PX,(ly1)*_PX);ctx.stroke();
  ctx.beginPath();ctx.moveTo((cx+9)*_PX,(ly+5)*_PX);ctx.lineTo((cx+9)*_PX,(ly2)*_PX);ctx.stroke();
}

// l16_2 – Migration: SAS → Spark code packets
function _propMigrate(ctx,lx,ly,lc,frame){
  const t=((frame%120)/120),e=_ease(t);
  _r(ctx,lx,ly+4,16,10,'#2d1a00');_r(ctx,lx,ly+4,16,2,'#f59e0b');
  _lbl(ctx,'SAS',lx+5,ly+10.5,'#f59e0b',7);
  _r(ctx,lx+26,ly+4,16,10,'#001a2d');_r(ctx,lx+26,ly+4,16,2,'#38bdf8');
  _lbl(ctx,'Spark SQL',lx+27,ly+10.5,'#38bdf8',6);
  // Arrow
  ctx.strokeStyle='#374151';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo((lx+17)*_PX,(ly+9)*_PX);ctx.lineTo((lx+25)*_PX,(ly+9)*_PX);ctx.stroke();
  ctx.fillStyle='#374151';ctx.beginPath();ctx.moveTo((lx+25)*_PX,(ly+9)*_PX);ctx.lineTo((lx+23)*_PX,(ly+7)*_PX);ctx.lineTo((lx+23)*_PX,(ly+11)*_PX);ctx.closePath();ctx.fill();
  // Packet
  const px=_lerp(lx+17,lx+24,e);
  ctx.beginPath();ctx.arc(px*_PX,(ly+9)*_PX,2.5,0,Math.PI*2);ctx.fillStyle=e>.5?'#38bdf8':'#f59e0b';ctx.fill();
  // Code trail
  ['PROC SQL','SELECT *','FROM t','WHERE id>0'].forEach((ln,i)=>{
    const a=_ease(Math.max(0,Math.min(1,t*4-i*.5)));ctx.globalAlpha=a*.7;_lbl(ctx,ln,lx+27,ly+15+i*3.5,lc,4.5);ctx.globalAlpha=1;
  });
}

// ── MAIN RENDER ─────────────────────────────────────────────────────────────────
function _renderOffice(ctx,W,H,lessonId,frame,lc){
  ctx.imageSmoothingEnabled=false;
  _room(ctx,W,H);
  const LW=W/_PX;

  // ── Always-present background layer (depth) ──────────────────────────────

  // Pendant lights (always visible)
  _pendantLight(ctx,55,lc);
  _pendantLight(ctx,125,lc);
  _pendantLight(ctx,195,lc);

  // TV / info screen on back wall (behind everything)
  _tvWall(ctx,90,_WH+1,lc);

  // Background desk clusters (depth / open-plan feel)
  _bgDesk(ctx,20,_WH+20,0.42);
  _bgDesk(ctx,LW/2-9,_WH+20,0.38);
  _bgDesk(ctx,LW-40,_WH+20,0.42);

  // Large plants against back wall (corners)
  _bigPlant(ctx,2,_WH+2);
  _bigPlant(ctx,LW-18,_WH+2);

  // Small plants on windowsills
  _plant(ctx,42,_WH+2);
  _plant(ctx,138,_WH+2);
  _plant(ctx,186,_WH+2);

  // Coffee bar (left side — always present)
  _coffeeBar(ctx,2,_WH+30);

  // Second foreground desk (left area — always visible, gives depth)
  {const dx2=28,dy2=_WH+33,lc2=lc==='#ffd600'?'#818cf8':'#ffd600';
  _desk(ctx,dx2,dy2,lc2);_monitor(ctx,dx2,dy2,lc2);_chair(ctx,dx2+8,dy2+9);}

  // ── Foreground shelf (right side) ────────────────────────────────────────
  _shelf(ctx,LW-8,_WH+14);

  // ── Per-lesson scene ─────────────────────────────────────────────────────

  // Helper: main desk in standard position with character
  function mainDesk(charState,bubble,propFn){
    const dx=LW-50,dy=_WH+34;
    _desk(ctx,dx,dy,lc);
    _monitor(ctx,dx,dy,lc);
    _chair(ctx,dx+8,dy+9);
    if(propFn)propFn();
    const cx=dx+5,cy=dy+16;
    _char(ctx,cx,cy,charState,frame,lc);
    _bubble(ctx,cx,cy-10,bubble,lc);
  }

  // Helper: second desk on left for multi-person scenes
  function leftDesk(charState,bubble,lc2){
    const dx=28,dy=_WH+36;
    _desk(ctx,dx,dy,lc2||lc);
    _monitor(ctx,dx,dy,lc2||lc);
    _chair(ctx,dx+8,dy+9);
    const cx=dx+5,cy=dy+16;
    _char(ctx,cx,cy,charState,frame,lc2||lc);
    if(bubble)_bubble(ctx,cx,cy-10,bubble,lc2||lc);
  }

  switch(lessonId){
    case'l1_1':
      // Two monitors on main desk, second colleague
      {const dx=LW-56,dy=_WH+32;
      _desk(ctx,dx,dy,lc);_chair(ctx,dx+8,dy+9);
      _dualMonitor(ctx,dx,dy,lc,'#818cf8',frame);
      const cx=dx+12,cy=dy+17;
      _char(ctx,cx,cy,'idle',frame,lc);_bubble(ctx,cx,cy-10,'SAS vs PySpark',lc);}
      break;

    case'l1_2':
      mainDesk('reading','Datentypen',()=>_propTypeTable(ctx,35,_WH+28,lc,frame));
      break;

    case'l2_1':
      mainDesk('pointing','WHERE filter',()=>_propFunnel(ctx,46,_WH+26,lc,frame));
      break;

    case'l3_1':
      mainDesk('reading','Sonderzeichen',()=>_propMagnifier(ctx,40,_WH+26,lc,frame));
      break;

    case'l3_2':
      {const dx=LW-50,dy=_WH+34;
      _desk(ctx,dx,dy,lc);_monitor(ctx,dx,dy,lc);_chair(ctx,dx+8,dy+9);
      _propClean(ctx,36,_WH+26,lc,frame);
      _char(ctx,dx+5,dy+16,'typing',frame,lc);_bubble(ctx,dx+5,dy+6,'Bereinigung',lc);}
      break;

    case'l3_3':
      mainDesk('pointing','DQ Report',()=>_propDQRows(ctx,35,_WH+28,lc,frame));
      break;

    case'l4_1':
      {const wbX=36,wbY=_WH+24;
      _propBars(ctx,wbX,wbY,lc,frame);
      const dx=LW-50,dy=_WH+34;
      _desk(ctx,dx,dy,lc);_monitor(ctx,dx,dy,lc);_chair(ctx,dx+8,dy+9);
      _char(ctx,wbX+22,_WH+45,'pointing',frame,lc);_bubble(ctx,wbX+22,_WH+35,'GROUP BY',lc);}
      break;

    case'l5_1':
      {const d1x=24,d2x=LW-52,dy=_WH+34;
      _desk(ctx,d1x,dy,'#ffd600');_monitor(ctx,d1x,dy,'#ffd600');_chair(ctx,d1x+8,dy+9);
      _desk(ctx,d2x,dy,'#818cf8');_monitor(ctx,d2x,dy,'#818cf8');_chair(ctx,d2x+8,dy+9);
      _propJoin(ctx,d1x,_WH+55,lc,frame,W);
      const t=((frame%220)/220),e=_ease(t);
      const cx=Math.round(d1x+28+e*(d2x-d1x-30)),cy=_WH+48;
      _char(ctx,cx,cy,(t>.06&&t<.94)?'walking':'idle',frame,lc);_bubble(ctx,cx,cy-10,'JOIN',lc);}
      break;

    case'l6_1':
      mainDesk('typing','DB Connect',()=>_propServer(ctx,35,_WH+22,lc,frame));
      break;

    case'l7_1':
      {_propGauge(ctx,36,_WH+24,lc,frame);
      const dx=LW-50,dy=_WH+34;_desk(ctx,dx,dy,lc);_monitor(ctx,dx,dy,lc);_chair(ctx,dx+8,dy+9);
      _char(ctx,dx+5,dy+16,'typing',frame,lc);_bubble(ctx,dx+5,dy+6,'Performance',lc);}
      break;

    case'l8_1':
      _propPipeline(ctx,W,H,lc,frame);
      {const cy=_WH+50;_char(ctx,LW/2-5,cy,'walking',frame,lc);_bubble(ctx,LW/2-5,cy-10,'ETL Pipeline',lc);}
      break;

    case'l8_2':
      mainDesk('typing','MERGE',()=>_propMerge(ctx,34,_WH+28,lc,frame));
      break;

    case'l9_1':
      mainDesk('typing','SCD Typ 2',()=>_propSCD2(ctx,34,_WH+28,lc,frame));
      break;

    case'l10_1':
      {_propMeter(ctx,46,_WH+22,lc,frame);
      const dx=LW-50,dy=_WH+34;_desk(ctx,dx,dy,lc);_monitor(ctx,dx,dy,lc);_chair(ctx,dx+8,dy+9);
      _char(ctx,dx+5,dy+16,'reading',frame,lc);_bubble(ctx,dx+5,dy+6,'Smart Meter ⚡',lc);}
      break;

    case'l11_1':
      mainDesk('pointing','DQ Check',()=>_propDQDash(ctx,34,_WH+24,lc,frame));
      break;

    case'l12_1':
      {_propGDPR(ctx,44,_WH+24,lc,frame);
      const dx=LW-50,dy=_WH+34;_desk(ctx,dx,dy,lc);_monitor(ctx,dx,dy,lc);_chair(ctx,dx+8,dy+9);
      _char(ctx,dx+5,dy+16,'idle',frame,lc);_bubble(ctx,dx+5,dy+6,'GDPR 🔒',lc);}
      break;

    case'l13_1':
      {_propMacro(ctx,36,_WH+24,lc,frame);
      const dx=LW-50,dy=_WH+34;_desk(ctx,dx,dy,lc);_monitor(ctx,dx,dy,lc);_chair(ctx,dx+8,dy+9);
      _char(ctx,dx+5,dy+16,'typing',frame,lc);_bubble(ctx,dx+5,dy+6,'%MACRO',lc);}
      break;

    case'l14_1':
      mainDesk('pointing','KEEP/DROP',()=>_propDropKeep(ctx,34,_WH+26,lc,frame));
      break;

    case'l14_2':
      mainDesk('typing','CAT / CATX',()=>_propConcat(ctx,34,_WH+26,lc,frame));
      break;

    case'l14_3':
      mainDesk('reading','PRXCHANGE',()=>_propRegex(ctx,34,_WH+26,lc,frame));
      break;

    case'l15_1':
      {_propCalendar(ctx,44,_WH+22,lc,frame);
      const dx=LW-50,dy=_WH+34;_desk(ctx,dx,dy,lc);_monitor(ctx,dx,dy,lc);_chair(ctx,dx+8,dy+9);
      _char(ctx,dx+5,dy+16,'typing',frame,lc);_bubble(ctx,dx+5,dy+6,'Datum & Zeit',lc);}
      break;

    case'l16_1':
      {_propScales(ctx,46,_WH+26,lc,frame);
      const cy=_WH+52;_char(ctx,LW/2-5,cy,'idle',frame,lc);_bubble(ctx,LW/2-5,cy-10,'SQL Dialekte',lc);}
      break;

    case'l16_2':
      {_propMigrate(ctx,28,_WH+28,lc,frame);
      const cy=_WH+52;_char(ctx,LW/2-5,cy,'walking',frame,lc);_bubble(ctx,LW/2-5,cy-10,'Migration →',lc);}
      break;

    default:
      mainDesk('typing','Coding...',null);break;
  }
}

// ── CODE ANALYSER ─────────────────────────────────────────────────────────────
// Detects what operations the user's code performs and returns an ordered list.
function analyzeCodeOps(code){
  const c=(code||'').toLowerCase().replace(/\s+/g,' ');
  const ops=[];
  // DATA creation / DataFrame creation
  if(c.includes('datalines')||c.includes('input ')||c.includes('createDataFrame')||c.includes('spark.create'))
    ops.push('create');
  // DB / file load
  if(c.includes('libname')||c.includes('set ')||c.includes('spark.read')||c.includes('.jdbc('))
    ops.push('load');
  // Rename / withColumnRenamed
  if(c.includes('rename')||c.includes('withcolumnrenamed'))
    ops.push('rename');
  // New computed columns
  if(c.includes('withcolumn(')||c.includes('jahresgehalt')||c.includes('= gehalt *')||c.includes('upcase(')||c.includes('f.upper('))
    ops.push('transform');
  // Filter / WHERE
  if(c.includes(' where ')||c.includes('.filter(')||c.includes('if ')||c.includes('isin('))
    ops.push('filter');
  // JOIN
  if(c.includes(' join ')||c.includes('.join('))
    ops.push('join');
  // GROUP BY / aggregation
  if(c.includes('group by')||c.includes('groupby(')||c.includes('.agg(')||c.includes('proc means')||c.includes('proc freq')||c.includes('count(*)')||c.includes('avg('))
    ops.push('group');
  // SORT / ORDER BY
  if(c.includes('proc sort')||c.includes('order by')||c.includes('.orderby(')||c.includes('.sort('))
    ops.push('sort');
  // WINDOW functions
  if(c.includes('.over(')||c.includes('over (partition')||c.includes('window.partition')||c.includes('rank(')||c.includes('lag('))
    ops.push('window');
  // MERGE / upsert
  if(c.includes('merge ')||c.includes('whenmatched')||c.includes('proc append')||c.includes('delta.tables'))
    ops.push('merge');
  // SCD2 history
  if(c.includes('scd')||c.includes('gueltig_von')||c.includes('is_aktuell')||c.includes('row_number'))
    ops.push('scd2');
  // String ops
  if(c.includes('cat(')||c.includes('catx(')||c.includes('cats(')||c.includes('tranwrd(')||c.includes('concat('))
    ops.push('concat');
  // Regex / clean
  if(c.includes('prxmatch')||c.includes('prxchange')||c.includes('regexp_replace')||c.includes('rlike('))
    ops.push('regex');
  // DROP / KEEP columns
  if(c.includes(' drop=')||c.includes(' keep=')||c.includes('.drop(')||c.includes('select('))
    ops.push('columns');
  // Output / write
  if(c.includes('proc print')||c.includes('.show(')||c.includes('.write.')||c.includes('proc freq')||c.includes('display('))
    ops.push('output');
  if(ops.length===0) ops.push('transform');
  return ops;
}

// ── RUN-ANIMATION SCENES ────────────────────────────────────────────────────
// Each draws one conceptual operation onto the full canvas (W×H logical).
// t = 0..1 progress within this operation's time slot.

function _animCreate(ctx,W,H,lc,t){
  const LW=W/_PX,LH=H/_PX;
  // Table header
  const cols=['name','abt','gehalt'],cw=28,ch=8,ox=LW/2-cols.length*cw/2,oy=_WH+4;
  _r(ctx,ox,oy,cols.length*cw+2,ch,lc+'33');
  cols.forEach((c,i)=>_lbl(ctx,c,ox+2+i*cw,oy+5.5,lc,6));
  // Rows appearing one by one
  const rows=[['Schmidt','IT','4500'],['Weber','HR','3800'],['Fischer','FIN','5200'],['Müller','IT','4100']];
  rows.forEach((row,ri)=>{
    const a=_ease(Math.min(1,Math.max(0,t*5-ri*.8)));
    const ry=oy+ch+2+ri*(ch+2);
    // Row slides in from left
    const ox2=ox-_lerp(30,0,a);
    ctx.globalAlpha=a;
    _r(ctx,ox2,ry,cols.length*cw+2,ch,'#1e2a3a');
    _r(ctx,ox2,ry,cols.length*cw+2,1,lc+'44');
    row.forEach((v,ci)=>_lbl(ctx,v,ox2+2+ci*cw,ry+5.5,'#94a3b8',6));
    ctx.globalAlpha=1;
  });
  // "DATA" keyword badge
  const badgeA=_ease(Math.min(1,t*3));
  ctx.globalAlpha=badgeA;_lbl(ctx,'DATA ▶',ox,oy-6,lc,7);ctx.globalAlpha=1;
}

function _animLoad(ctx,W,H,lc,t){
  const LW=W/_PX;
  // Database cylinder
  const dbx=8,dby=_WH+8,dbw=18,dbh=14;
  _r(ctx,dbx,dby,dbw,dbh,'#0f172a');_r(ctx,dbx,dby,dbw,3,'#1e3a5f');
  _r(ctx,dbx,dby+3,dbw,3,'#0d2a4a');_r(ctx,dbx,dby+11,dbw,3,'#1e3a5f');
  _lbl(ctx,'DB',dbx+5,dby+8.5,'#38bdf8',7);
  // Arrow line
  const arrowEnd=LW-36;
  ctx.strokeStyle=lc+'66';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo((dbx+dbw)*_PX,(dby+7)*_PX);ctx.lineTo(arrowEnd*_PX,(dby+7)*_PX);ctx.stroke();ctx.setLineDash([]);
  // Packet flying
  const px=_lerp(dbx+dbw,arrowEnd-2,_ease(t));
  ctx.beginPath();ctx.arc(px*_PX,(dby+7)*_PX,3,0,Math.PI*2);ctx.fillStyle=lc;ctx.fill();
  // DataFrame appearing on right
  const dfx=arrowEnd,dfy=_WH+5;const dfa=_ease(Math.max(0,t-.4)/.6);
  ctx.globalAlpha=dfa;
  _r(ctx,dfx,dfy,26,5,lc+'22');_r(ctx,dfx,dfy,26,1,lc);
  _lbl(ctx,'DataFrame',dfx+1,dfy+3.5,lc,6);
  ['Zeile 1…','Zeile 2…','Zeile 3…'].forEach((r,i)=>{
    _r(ctx,dfx,dfy+5+i*4,26,3.5,'#111827');_lbl(ctx,r,dfx+1,dfy+7.8+i*4,'#4b5563',5);
  });
  ctx.globalAlpha=1;
  _lbl(ctx,'READ ▶',dbx,dby+19,lc,7);
}

function _animFilter(ctx,W,H,lc,t){
  const LW=W/_PX,LH=H/_PX;
  const rows=[{v:'Schmidt',ok:true},{v:'Weber',ok:false},{v:'Fischer',ok:true},{v:'Müller',ok:false},{v:'Bauer',ok:true}];
  const ox=LW/2-30,oy=_WH+4,rh=7,rg=2;
  // Funnel
  const fx=ox+32,fy=oy;
  for(let i=0;i<5;i++){const fw=22-i*4;_r(ctx,fx+(22-fw)/2,fy+i*2,fw,2,'#1e2a3a');}
  _r(ctx,fx+9,fy+10,4,12,'#1e2a3a');
  _lbl(ctx,'WHERE / filter()',fx-6,fy+24,lc,5);
  // Input rows
  rows.forEach((r,i)=>{
    const rowT=Math.min(1,Math.max(0,t*5-i*.5));
    const inProg=Math.min(1,rowT*2);
    const outProg=Math.max(0,rowT*2-1);
    const rx=_lerp(ox-10,fx,_ease(inProg));
    const inA=Math.min(1,inProg*3);
    ctx.globalAlpha=r.ok?inA:inA*(1-_ease(outProg));
    _r(ctx,rx,oy+i*(rh+rg),22,rh,r.ok?'#0d2a1e':'#2d1515');
    _r(ctx,rx,oy+i*(rh+rg),22,1,r.ok?lc:'#ef4444');
    _lbl(ctx,r.v,rx+1.5,oy+i*(rh+rg)+5,'#94a3b8',6);
    ctx.globalAlpha=1;
    // OK rows fall out below funnel
    if(r.ok&&outProg>.1){const ry=_lerp(fy+22,fy+28,_ease(outProg));ctx.globalAlpha=_ease(outProg);_r(ctx,fx+9,ry,4,3,lc+'aa');ctx.globalAlpha=1;}
  });
}

function _animJoin(ctx,W,H,lc,t){
  const LW=W/_PX,half=(LW-12)/2;
  const oy=_WH+4,rh=6,rg=2,cw=half-4;
  const leftRows=[['K001','Müller'],['K002','Schmidt'],['K003','Fischer']];
  const rightRows=[['K001','150€'],['K001','280€'],['K003','99€']];
  const slide=_ease(Math.min(1,t*2))*10;
  // Left table
  _r(ctx,6-slide,oy,cw,4,'#1e3050');_lbl(ctx,'Kunden',7-slide,oy+3,'#3b82f6',6);
  leftRows.forEach((r,i)=>{_r(ctx,6-slide,oy+4+i*(rh+rg),cw,rh,'#111827');_lbl(ctx,r.join(' '),7-slide,oy+4+i*(rh+rg)+4,'#94a3b8',6);});
  // Right table
  _r(ctx,LW-cw-6+slide,oy,cw,4,'#1e3050');_lbl(ctx,'Bestellungen',LW-cw-5+slide,oy+3,'#38bdf8',6);
  rightRows.forEach((r,i)=>{_r(ctx,LW-cw-6+slide,oy+4+i*(rh+rg),cw,rh,'#111827');_lbl(ctx,r.join(' '),LW-cw-5+slide,oy+4+i*(rh+rg)+4,'#94a3b8',6);});
  // Result table emerging
  if(t>.5){
    const a=_ease((t-.5)/.5);
    const ry=_WH+28,rw=LW-12;
    ctx.globalAlpha=a;_r(ctx,6,ry,rw,4,'#1e2d3d');_lbl(ctx,'JOIN → Ergebnis',8,ry+3,lc,6);
    [['K001','Müller','150€'],['K001','Müller','280€'],['K003','Fischer','99€']].forEach((r,i)=>{
      _r(ctx,6,ry+4+i*(rh+rg),rw,rh,'#0d2a1e');_lbl(ctx,r.join('  '),8,ry+4+i*(rh+rg)+4,'#4ade80',6);
    });ctx.globalAlpha=1;
  }
}

function _animGroup(ctx,W,H,lc,t){
  const LW=W/_PX;
  // Dots scatter then cluster
  const dots=[
    {x:20,y:_WH+8,g:0,gx:10,gy:_WH+18},
    {x:35,y:_WH+12,g:0,gx:10,gy:_WH+18},
    {x:50,y:_WH+6,g:1,gx:LW/2,gy:_WH+18},
    {x:28,y:_WH+18,g:0,gx:10,gy:_WH+18},
    {x:60,y:_WH+14,g:1,gx:LW/2,gy:_WH+18},
    {x:70,y:_WH+8,g:2,gx:LW-18,gy:_WH+18},
    {x:80,y:_WH+16,g:2,gx:LW-18,gy:_WH+18},
  ];
  const gc=['#3b82f6','#10b981','#8b5cf6'];
  const clusterT=_ease(Math.min(1,t*2));
  dots.forEach(d=>{
    const dx=_lerp(d.x,d.gx,clusterT),dy=_lerp(d.y,d.gy,clusterT);
    ctx.beginPath();ctx.arc(dx*_PX,dy*_PX,4,0,Math.PI*2);ctx.fillStyle=gc[d.g];ctx.fill();
  });
  // Bar chart grows after clustering
  if(t>.5){
    const a=_ease((t-.5)/.5);
    const labels=['IT','HR','FIN'];const vals=[4,2,3];const bw=18,gap=14,ox=LW/2-30,by=H/_PX-10;
    ctx.globalAlpha=a;
    labels.forEach((lb,i)=>{
      const bh=vals[i]*5;
      _r(ctx,ox+i*(bw+gap),by-bh,bw,bh,gc[i],.85);
      _r(ctx,ox+i*(bw+gap),by-bh,bw,1,'rgba(255,255,255,.3)');
      _lbl(ctx,lb,ox+i*(bw+gap)+3,by+4,'#4b5563',6);
      _lbl(ctx,vals[i],ox+i*(bw+gap)+5,by-bh-2,gc[i],6);
    });ctx.globalAlpha=1;
    _lbl(ctx,'GROUP BY →',ox-1,by-30,lc,6);
  }
}

function _animSort(ctx,W,H,lc,t){
  const LW=W/_PX;
  const orig=[5,2,8,1,6,3,7,4],sorted=[1,2,3,4,5,6,7,8];
  const n=orig.length,bw=16,gap=4,ox=(LW-n*(bw+gap)+gap)/2,by=H/_PX-10;
  const pc=['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16'];
  const e=_ease(t);
  orig.forEach((v,i)=>{
    const ti=sorted.indexOf(v);
    const cx=_lerp(ox+i*(bw+gap),ox+ti*(bw+gap),e);
    const bh=v*7;
    _r(ctx,cx,by-bh,bw,bh,pc[i],.85);
    _r(ctx,cx,by-bh,bw,1,'rgba(255,255,255,.25)');
    _lbl(ctx,v,cx+4,by+4,'#4b5563',6);
  });
  _lbl(ctx,t<.5?'ORDER BY…':'sortiert ✓',(LW-30)/2,_WH+6,lc,7);
}

function _animWindow(ctx,W,H,lc,t){
  const LW=W/_PX;
  const vals=[120,180,95,210,160,140,200,110];
  const rh=6,rg=2,ox=8,oy=_WH+4,bw=24;
  // Table rows
  vals.forEach((v,i)=>{
    _r(ctx,ox,oy+i*(rh+rg),bw,rh,'#111827');_lbl(ctx,v,ox+1,oy+i*(rh+rg)+4.5,'#94a3b8',6);
  });
  // Sliding window highlight (3 rows)
  const winPos=Math.floor(t*(vals.length-2));
  for(let wi=0;wi<3;wi++){
    const wy=oy+(winPos+wi)*(rh+rg);ctx.globalAlpha=.35;ctx.fillStyle=lc;ctx.fillRect(ox*_PX,wy*_PX,bw*_PX,rh*_PX);ctx.globalAlpha=1;
  }
  ctx.strokeStyle=lc;ctx.lineWidth=1.5;ctx.setLineDash([2,2]);ctx.strokeRect(ox*_PX,oy*_PX+(winPos*(rh+rg)*_PX),(bw)*_PX,3*(rh+rg)*_PX-rg*_PX);ctx.setLineDash([]);
  // AVG values
  _lbl(ctx,'AVG →',ox+bw+2,oy-1.5,lc,5);
  for(let i=0;i<=winPos+2&&i<vals.length;i++){
    const sl=vals.slice(Math.max(0,i-2),i+1);
    const avg=Math.round(sl.reduce((a,b)=>a+b,0)/sl.length);
    const aw=Math.round(avg/210*20);
    const a=i<=winPos+2?1:.35;
    _r(ctx,ox+bw+2,oy+i*(rh+rg),aw,rh,lc,a*.8);
    ctx.globalAlpha=a;_lbl(ctx,avg,ox+bw+24,oy+i*(rh+rg)+4.5,lc,5);ctx.globalAlpha=1;
  }
}

function _animMerge(ctx,W,H,lc,t){
  const LW=W/_PX;
  const p1=_ease(Math.min(1,t*2));
  const p2=_ease(Math.max(0,t*2-1));
  const ox=6,rh=6,rg=2;
  // Source (delta) table
  _r(ctx,ox,_WH+4,22,4,'#2d1a00');_lbl(ctx,'DELTA (neu)',ox+1,_WH+7.5,'#f59e0b',5);
  const delta=[{k:'K001',v:'Prem.',match:true},{k:'K004',v:'Basis',match:false}];
  delta.forEach((r,i)=>{ _r(ctx,ox,_WH+8+i*(rh+rg),22,rh,'#1a1000');_lbl(ctx,r.k+' '+r.v,ox+1,_WH+12+i*(rh+rg),r.match?'#f59e0b':'#4ade80',6); });
  // Target table
  const tx=LW-30;
  _r(ctx,tx,_WH+4,22,4,'#001a2d');_lbl(ctx,'TARGET',tx+1,_WH+7.5,'#38bdf8',5);
  const target=[{k:'K001',v:'Basis',new:'Prem.'},{k:'K002',v:'Basis',new:null},{k:'K003',v:'Smart',new:null}];
  target.forEach((r,i)=>{
    const isMatch=r.new&&p1>.3;
    _r(ctx,tx,_WH+8+i*(rh+rg),22,rh,isMatch?'#1a2d00':'#0d1b2a');
    _lbl(ctx,r.k+' '+(isMatch?r.new:r.v),tx+1,_WH+12+i*(rh+rg),isMatch?'#4ade80':'#94a3b8',6);
    if(isMatch){ctx.globalAlpha=p1;_lbl(ctx,'↑UPD',tx+17,_WH+12,'#f59e0b',5);ctx.globalAlpha=1;}
  });
  // New INSERT row
  if(p2>.05){ctx.globalAlpha=p2;_r(ctx,tx,_WH+8+target.length*(rh+rg),22,rh,'#0d2a0d');_lbl(ctx,'K004 Basis',tx+1,_WH+12+target.length*(rh+rg),'#4ade80',6);_lbl(ctx,'↑INS',tx+17,_WH+12+target.length*(rh+rg),'#4ade80',5);ctx.globalAlpha=1;}
  // Arrow
  const ax=ox+23,ay=_WH+14;
  ctx.globalAlpha=p1;ctx.strokeStyle=lc;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax*_PX,ay*_PX);ctx.lineTo((tx-1)*_PX,ay*_PX);ctx.stroke();ctx.globalAlpha=1;
}

function _animRename(ctx,W,H,lc,t){
  const LW=W/_PX;
  const cols=[{old:'vorname',newn:'first_name'},{old:'nachname',newn:'last_name'},{old:'alt_id',newn:'kunden_id'}];
  const cw=28,oy=_WH+8;
  cols.forEach((c,i)=>{
    const prog=_ease(Math.min(1,Math.max(0,t*4-i*.6)));
    const ox=LW/2-cw/2;
    // Old name fades out
    ctx.globalAlpha=1-prog;_r(ctx,ox,oy+i*10,cw,6,'#2d1515');_lbl(ctx,c.old,ox+1,oy+i*10+4.5,'#ef4444',6);ctx.globalAlpha=1;
    // Arrow
    ctx.globalAlpha=prog;_lbl(ctx,'→',ox+cw+1,oy+i*10+4.5,'#374151',7);
    // New name fades in
    _r(ctx,ox+cw+8,oy+i*10,cw,6,'#0d2a1e');_lbl(ctx,c.newn,ox+cw+9,oy+i*10+4.5,lc,6);ctx.globalAlpha=1;
  });
  _lbl(ctx,'RENAME / withColumnRenamed',8,_WH+4,lc,5);
}

function _animTransform(ctx,W,H,lc,t){
  const LW=W/_PX;
  // Input col
  const rows=[['4500','= gehalt'],['3800','= gehalt'],['5200','= gehalt']];
  const ox=8,oy=_WH+6,rh=7;
  _r(ctx,ox,oy,20,4,'#1e2a3a');_lbl(ctx,'gehalt',ox+1,oy+3,'#94a3b8',6);
  rows.forEach((r,i)=>{_r(ctx,ox,oy+4+i*(rh+2),20,rh,'#111827');_lbl(ctx,r[0],ox+1,oy+4+i*(rh+2)+5,'#6b7280',6);});
  // Formula
  const fx=LW/2-10,fy=oy+6;
  _lbl(ctx,'× 12',fx,fy,'#374151',9);
  ctx.strokeStyle=lc+'44';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo((ox+20)*_PX,fy*_PX);ctx.lineTo(fx*_PX,fy*_PX);ctx.stroke();
  // Output col appearing
  const ox2=LW-28;
  _r(ctx,ox2,oy,24,4,lc+'22');_lbl(ctx,'jahresgehalt',ox2+1,oy+3,lc,6);
  rows.forEach((r,i)=>{
    const a=_ease(Math.min(1,Math.max(0,t*4-i*.5)));
    ctx.globalAlpha=a;_r(ctx,ox2,oy+4+i*(rh+2),24,rh,'#0d2a1e');_lbl(ctx,String(parseInt(r[0])*12),ox2+1,oy+4+i*(rh+2)+5,lc,6);ctx.globalAlpha=1;
  });
}

function _animConcat(ctx,W,H,lc,t){
  const LW=W/_PX,cy=_WH+18;
  const words=["'van'"," + ","'der'"," + ","'Berg'"];
  const colors=[lc,'#374151',lc,'#374151',lc];
  let xpos=8;
  words.forEach((w,i)=>{const ww=w.length*4.5;ctx.globalAlpha=_ease(Math.min(1,Math.max(0,t*5-i*.3)));ctx.font="bold 9px 'JetBrains Mono',monospace";ctx.fillStyle=colors[i];ctx.fillText(w,xpos*_PX,cy*_PX);xpos+=ww;ctx.globalAlpha=1;});
  if(t>.6){
    const a=_ease((t-.6)/.4);ctx.globalAlpha=a;
    _r(ctx,8,cy+4,LW-16,7,'#0d2a1e');_lbl(ctx,"→ 'van der Berg'",10,cy+9,lc,7);ctx.globalAlpha=1;
  }
}

function _animRegex(ctx,W,H,lc,t){
  const LW=W/_PX;
  const text='Müll@r 123!';const clean='Müllr';
  _lbl(ctx,'PRXCHANGE / regexp_replace',6,_WH+4,'#374151',5);
  _r(ctx,6,_WH+7,LW-12,7,'#2d1515');
  // Highlight bad chars as scan progresses
  ctx.font="8px 'JetBrains Mono',monospace";
  let xi=6;
  for(let ci=0;ci<text.length;ci++){
    const ch=text[ci];
    const isBad='@1234!'.includes(ch)||ch===' ';
    const scanPast=t>(ci/text.length*.8);
    const col=scanPast&&isBad?'#ef4444':'#94a3b8';
    if(scanPast&&isBad){ctx.globalAlpha=.4;ctx.fillStyle='#ef4444';ctx.fillRect(xi*_PX,(_WH+7)*_PX,5*_PX,7*_PX);ctx.globalAlpha=1;}
    ctx.fillStyle=col;ctx.fillText(ch,(xi+.5)*_PX,(_WH+12.5)*_PX);xi+=4;
  }
  // Scan beam
  const sx=6+t*.8*(LW-12);
  ctx.globalAlpha=.35;ctx.fillStyle=lc;ctx.fillRect(sx*_PX,(_WH+7)*_PX,2,8*_PX);ctx.globalAlpha=1;
  if(t>.7){const a=_ease((t-.7)/.3);ctx.globalAlpha=a;_r(ctx,6,_WH+18,LW-12,7,'#0d2a1e');_lbl(ctx,'→ '+clean,8,_WH+23,lc,7);ctx.globalAlpha=1;}
}

function _animColumns(ctx,W,H,lc,t){
  const LW=W/_PX;
  const cols=[{n:'id',keep:true},{n:'name',keep:true},{n:'tmp1',keep:false},{n:'datum',keep:true},{n:'tmp2',keep:false},{n:'betrag',keep:true}];
  const cw=10,gap=2,ox=(LW-cols.length*(cw+gap))/2,oy=_WH+8;
  cols.forEach((c,i)=>{
    const fallen=!c.keep&&t>.3;
    const ft=fallen?_ease((t-.3)/.7):0;
    const dy=ft*18,a=Math.max(0,1-ft*1.4);
    ctx.globalAlpha=a;
    _r(ctx,ox+i*(cw+gap),oy+dy,cw,9,c.keep?lc+'22':'#2d1515');
    _r(ctx,ox+i*(cw+gap),oy+dy,cw,1,c.keep?lc:'#ef4444');
    _lbl(ctx,c.n,ox+i*(cw+gap)+.5,oy+dy+6,c.keep?lc:'#ef4444',5);ctx.globalAlpha=1;
  });
  _lbl(ctx,t<.3?'DROP / KEEP':'Spalten entfernt ✓',(LW-40)/2,_WH+4,lc,6);
}

function _animOutput(ctx,W,H,lc,t){
  const LW=W/_PX;
  // Printer-style output animation: lines print out one by one
  const lines=['Bewertung: 8/10','name   abt   gehalt','Schmidt IT    4500','Weber   HR    3800','Fischer FIN   5200','(3 rows)'];
  _r(ctx,6,_WH+4,LW-12,2,'#374151'); // paper top
  lines.forEach((ln,i)=>{
    const a=_ease(Math.min(1,Math.max(0,t*8-i*.8)));
    ctx.globalAlpha=a;
    _r(ctx,6,_WH+6+i*6.5,LW-12,6,'#0d1117');
    const col=i===0?lc:i===1?'#374151':'#94a3b8';
    _lbl(ctx,ln,8,_WH+10.5+i*6.5,col,i<=1?6:6);ctx.globalAlpha=1;
  });
  // Cursor blink
  const last=lines.length-1;const la=_ease(Math.min(1,Math.max(0,t*8-last*.8)));
  if(la>.5&&(Math.floor(t*10)%2)===0){ctx.globalAlpha=la;_lbl(ctx,'█',8+lines[last].length*3.7,_WH+10.5+last*6.5,lc,6);ctx.globalAlpha=1;}
}

// Map op names to renderer functions
const OP_RENDERERS={
  create: _animCreate, load: _animLoad, filter: _animFilter,
  join: _animJoin, group: _animGroup, sort: _animSort,
  window: _animWindow, merge: _animMerge, rename: _animRename,
  transform: _animTransform, concat: _animConcat, regex: _animRegex,
  columns: _animColumns, output: _animOutput, scd2: (ctx,W,H,lc,t)=>_animMerge(ctx,W,H,lc,t),
};
const OP_LABELS={
  create:'Datensatz erstellen',load:'Daten laden',filter:'WHERE / filter()',
  join:'JOIN — verbinden',group:'GROUP BY',sort:'ORDER BY',
  window:'Window Function',merge:'MERGE / Upsert',rename:'Umbenennen',
  transform:'Transformieren',concat:'Strings verbinden',regex:'Regex bereinigen',
  columns:'Spalten auswählen',output:'Ergebnis ausgeben',scd2:'SCD2 Historisierung',
};

// ── FULL RUNNING ANIMATION: cycles through detected ops ────────────────────
function _renderRunning(ctx,W,H,lc,frame,ops){
  const perOp=150; // frames per operation
  const totalFrames=ops.length*perOp;
  const f=frame%totalFrames;
  const opIdx=Math.floor(f/perOp);
  const t=_ease((f%perOp)/perOp);
  const op=ops[opIdx]||'transform';

  // Dark animated background
  ctx.fillStyle='#060810';ctx.fillRect(0,0,W,H);
  // Subtle grid
  ctx.strokeStyle='rgba(255,255,255,.03)';ctx.lineWidth=1;
  for(let x=0;x<W;x+=8*_PX){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=8*_PX){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

  // Render the operation
  const renderer=OP_RENDERERS[op]||_animTransform;
  renderer(ctx,W,H,lc,t);

  // Progress bar at bottom
  const totalT=(f/totalFrames);
  _r(ctx,0,H/_PX-2,W/_PX,2,'#1e2535');
  _r(ctx,0,H/_PX-2,(W/_PX)*totalT,2,lc,.8);

  // Op label + step counter
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,W,_WH*_PX);
  _r(ctx,0,0,W/_PX,_WH,'#060810');
  _lbl(ctx,'⚙ '+OP_LABELS[op],4,9,lc,7);
  _lbl(ctx,'Schritt '+(opIdx+1)+'/'+ops.length,W/_PX-28,9,'#374151',6);
  // Pulsing dot
  if(frame%30<15){ctx.beginPath();ctx.arc(W-8,8,3,0,Math.PI*2);ctx.fillStyle=lc;ctx.fill();}
}

// ── DONE / SUCCESS ANIMATION ────────────────────────────────────────────────
function _renderDone(ctx,W,H,lc,frame){
  const t=Math.min(1,(frame%180)/60);
  ctx.fillStyle='#060810';ctx.fillRect(0,0,W,H);
  // Confetti
  const confColors=['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444'];
  for(let i=0;i<20;i++){
    const cf=frame*.06+i*.3;const x=(Math.sin(cf+i*2.1)*.5+.5)*W;
    const y=((cf*30+i*40)%H);
    ctx.globalAlpha=Math.min(1,t*3);ctx.fillStyle=confColors[i%5];
    ctx.fillRect(x,y,3,3);ctx.globalAlpha=1;
  }
  // Big checkmark
  const cx=W/2,cy=H/2;
  ctx.globalAlpha=_ease(t);
  ctx.strokeStyle=lc;ctx.lineWidth=6;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(cx-20,cy);ctx.lineTo(cx-5,cy+16);ctx.lineTo(cx+22,cy-18);ctx.stroke();
  ctx.globalAlpha=1;
  ctx.font=`bold 10px 'JetBrains Mono',monospace`;ctx.fillStyle=lc;ctx.textAlign='center';
  ctx.fillText('Code analysiert ✓',cx,cy+36);ctx.textAlign='left';
}

// ── LESSON ID LOOKUP ─────────────────────────────────────────────────────────
const _LESSON_LABELS={
  l1_1:'SAS vs PySpark',l1_2:'Datentypen',l2_1:'WHERE Filter',
  l3_1:'Sonderzeichen erkennen',l3_2:'Namen bereinigen',l3_3:'DQ Report',
  l4_1:'GROUP BY',l5_1:'JOIN',l6_1:'DB Connect',l7_1:'Performance',
  l8_1:'ETL Pipeline',l8_2:'MERGE',l9_1:'SCD Typ 2',l10_1:'Smart Meter',
  l11_1:'DQ Framework',l12_1:'GDPR Compliance',l13_1:'Makros',
  l14_1:'DROP & KEEP',l14_2:'CAT / CATX',l14_3:'PRXCHANGE',
  l15_1:'Datum & Zeit',l16_1:'SQL Dialekte',l16_2:'Migration'
};

function detectPixelScene(code,lesson){
  const id=lesson?.id||'';
  const label=_LESSON_LABELS[id]||(lesson?.title||'Coding...');
  return{type:id||'default',label};
}


// ════════════════════════════════════════════════════════════════════════════
// 10. PIXEL ART COMPONENT
// ════════════════════════════════════════════════════════════════════════════

