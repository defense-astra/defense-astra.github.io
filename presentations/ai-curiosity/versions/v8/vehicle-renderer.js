/*
 * Original 8×8 protected-mobility exterior illustration, built from projected
 * geometry. Proportions and exterior vocabulary informed by manufacturer photos
 * of Patria AMV XP and BOXER. This is not an exact vehicle model or simulation.
 * Canvas 2D only; no network assets, third-party code, tactical or control logic.
 * API: VehicleRenderer.create().draw(ctx, {x,y,width,height}, {time})
 * returns absolute canvas camera, wheel centres and groundY. Time is in seconds.
 * getSignals(time) returns {preview,activity,wheels:[4],focusIndex} (0..1).
 */
(function (global) {
  'use strict';
  const TAU=Math.PI*2, AXLES=[-2.92,-1.33,1.16,2.74], TYRE_RADIUS=.63, ROAD_SPEED=.87, ROAD_PERIOD=24;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const point=(x,y,z)=>[x,y,z];
  const mod=(n,m)=>((n%m)+m)%m;
  const wrap=(n,m)=>mod(n+m/2,m)-m/2;
  const project=p=>[500+(p[0]*.92-p[1]*.46)*89,326+(p[0]*.115+p[1]*.285-p[2]*.94)*89];
  const distance=t=>Math.max(0,t)*ROAD_SPEED;
  // One immutable world profile drives road detail, contact and wheel motion.
  // This is a deterministic visual narrative, not a suspension/terrain solver.
  function worldHeight(w){
    const k=TAU/ROAD_PERIOD;
    return .045*Math.sin(w*k*4+.5)+.022*Math.sin(w*k*9+1.4)+.012*Math.sin(w*k*19+2)
      +.205*Math.exp(-Math.pow(wrap(w-5.4,ROAD_PERIOD)/.76,2))
      -.105*Math.exp(-Math.pow(wrap(w-11.8,ROAD_PERIOD)/.92,2))
      +.145*Math.exp(-Math.pow(wrap(w-18.0,ROAD_PERIOD)/1.05,2));
  }
  const terrain=(x,t)=>worldHeight(x+distance(t));
  const wheelAngle=t=>-distance(t)/TYRE_RADIUS;
  function motion(t){
    const heights=AXLES.map(x=>terrain(x,t)),mean=heights.reduce((a,b)=>a+b,0)/4;
    const mx=AXLES.reduce((a,b)=>a+b,0)/4;
    const slope=AXLES.reduce((a,x,i)=>a+(x-mx)*(heights[i]-mean),0)/AXLES.reduce((a,x)=>a+(x-mx)*(x-mx),0);
    return {heights,heave:mean*.64,pitch:clamp(-slope*.50,-.018,.018)};
  }
  function signals(t){
    const wheels=AXLES.map(x=>clamp(Math.abs(terrain(x+.13,t)-terrain(x-.13,t))*7.1+Math.abs(terrain(x,t))*.32+.045));
    const focusIndex=wheels.indexOf(Math.max(...wheels));
    const preview=clamp(Math.abs(terrain(4.7+.27,t)-terrain(4.7-.27,t))*4.1+Math.max(0,terrain(4.7,t))*.8);
    return {preview,activity:clamp(wheels.reduce((a,b)=>a+b,0)/4),wheels,focusIndex};
  }
  function inspectMotion(t){
    const m=motion(t),a=wheelAngle(t);
    return {time:t,distance:distance(t),roadSpeed:ROAD_SPEED,groundVelocity:-ROAD_SPEED,angularVelocity:-ROAD_SPEED/TYRE_RADIUS,wheelAngle:a,tyreRadius:TYRE_RADIUS,
      groundFeatureX:5.4-distance(t),topTreadVelocity:ROAD_SPEED,bottomTreadVelocity:-ROAD_SPEED,
      heights:m.heights,bodyHeave:m.heave,bodyPitch:m.pitch,
      contacts:AXLES.map((x,i)=>({x,groundHeight:m.heights[i],wheelCenterZ:TYRE_RADIUS+m.heights[i],contactZ:m.heights[i]})),
      valve:AXLES.map((x,i)=>project([x+Math.cos(a+.45)*.285,1.529,TYRE_RADIUS+m.heights[i]+Math.sin(a+.45)*.285]))};
  }
  function makeCanvas(w,h){
    let c;
    if(typeof OffscreenCanvas!=='undefined') c=new OffscreenCanvas(w,h);
    else if(typeof document!=='undefined'){c=document.createElement('canvas');c.width=w;c.height=h;}
    else return null;
    return c;
  }
  function create(){
    let bodyCache=null, bodyContext=null, paintTexture=false;
    const wheelCache=new Map();
    function poly(ctx,pts,fill,stroke,width=1){
      ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
      if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke();}
    }
    function path(ctx,pts,color,width=1){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
    function face(ctx,pts,colors,edge='rgba(15,23,19,.83)',width=.9){
      const ps=pts.map(project),ys=ps.map(p=>p[1]),xs=ps.map(p=>p[0]);
      let fill=colors;
      if(Array.isArray(colors)){fill=ctx.createLinearGradient(Math.min(...xs),Math.min(...ys),Math.max(...xs)*.65+Math.min(...xs)*.35,Math.max(...ys));colors.forEach((c,i)=>fill.addColorStop(i/(colors.length-1),c));}
      poly(ctx,ps,fill,edge,width);
      // A subtle dry-paint microtexture is cached with the body, not redrawn each frame.
      if(paintTexture){
        const left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left,h=Math.max(...ys)-top;
        if(w*h>1150){ctx.save();ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();
          const n=Math.min(1100,Math.round(w*h/27));for(let i=0;i<n;i++){
            const xx=left+((i*73.37+17.1)%997)/997*w,yy=top+((i*137.71+89.3)%991)/991*h;
            ctx.fillStyle=i%3?'rgba(226,233,198,.035)':'rgba(8,21,10,.065)';ctx.fillRect(xx,yy,.8+(i%2)*.4,.6);
          }ctx.restore();}
      }
      return ps;
    }
    function line3(ctx,pts,color,width=1){path(ctx,pts.map(project),color,width);}
    function ellipse3(ctx,c,r1,r2,plane,fill,stroke,width=1){
      const ps=[];for(let i=0;i<=64;i++){const a=i*TAU/64;ps.push(project(plane==='roof'?[c[0]+Math.cos(a)*r1,c[1]+Math.sin(a)*r2,c[2]]:[c[0]+Math.cos(a)*r1,c[1],c[2]+Math.sin(a)*r2]));}poly(ctx,ps,fill,stroke,width);
    }
    function bolt(ctx,p,r=1.8){const q=project(p);ctx.fillStyle='#202820';ctx.beginPath();ctx.arc(q[0]+.4,q[1]+.7,r+.5,0,TAU);ctx.fill();ctx.fillStyle='#8d9381';ctx.beginPath();ctx.arc(q[0],q[1],r,0,TAU);ctx.fill();path(ctx,[[q[0]-r*.55,q[1]-.3],[q[0]+r*.45,q[1]+.2]],'#313b31',.7);}
    function box3(ctx,x,y,z,l,w,h,palette){
      const p=palette||['#7d8571','#58624f','#3d493d'];
      face(ctx,[[x,y,z+h],[x+l,y,z+h],[x+l,y+w,z+h],[x,y+w,z+h]],p[0]);
      face(ctx,[[x,y+w,z],[x+l,y+w,z],[x+l,y+w,z+h],[x,y+w,z+h]],p[1]);
      face(ctx,[[x+l,y,z],[x+l,y+w,z],[x+l,y+w,z+h],[x+l,y,z+h]],p[2]);
    }
    function hatch(ctx,x,y,rx,ry,z){
      ellipse3(ctx,[x+.025,y+.01,z-.005],rx+.035,ry+.035,'roof','#18241e',null);
      ellipse3(ctx,[x,y,z+.026],rx,ry,'roof','#7b8270','#a0a68f',1.1);
      ellipse3(ctx,[x,y,z+.034],rx-.075,ry-.075,'roof',null,'#53604b',1.1);
      box3(ctx,x-rx*.56,y-.07,z+.045,.24,.16,.05,['#979b86','#515d4c','#404c40']);
      line3(ctx,[[x+.08,y-.06,z+.1],[x+.08,y-.06,z+.18],[x+.32,y-.06,z+.18],[x+.32,y-.06,z+.1]],'#354438',2.5);
      for(const sy of [-.6,.6])box3(ctx,x-rx-.02,y+ry*sy-.055,z-.03,.14,.11,.08,['#7e8871','#4c5848','#3b493d']);
    }
    function body(ctx){
      paintTexture=true;
      // The lower V-shaped hull and chassis remain visible between the axles.
      face(ctx,[[-3.83,-1.0,.78],[3.66,-1.0,.78],[3.86,.95,.95],[-3.83,.95,.95]],['#333b32','#202a24']);
      face(ctx,[[-3.91,1.08,1.2],[3.83,1.08,1.2],[3.52,.64,.62],[-3.68,.64,.62]],['#3d493c','#1a2722']);
      // Back and far flank first. Rear equipment module has a slight raised roof.
      face(ctx,[[-4.04,-1.32,1.24],[-4.04,1.32,1.24],[-3.86,1.22,2.29],[-3.86,-1.22,2.29]],['#465442','#273b32']);
      face(ctx,[[-4.04,-1.32,1.24],[3.98,-1.32,1.24],[2.89,-1.23,2.13],[-3.86,-1.22,2.29]],['#616e57','#3f503e']);
      // Broad shoulder / inclined side armour, with a narrow rubbed top edge.
      face(ctx,[[-4.04,1.32,1.22],[3.98,1.32,1.22],[2.89,1.18,2.13],[-3.86,1.22,2.29]],['#7b8468','#5e6a50','#3e4c3b']);
      // Roof is one continuous, accurately projected plate.
      face(ctx,[[-3.86,-1.22,2.29],[2.89,-1.23,2.13],[2.89,1.18,2.13],[-3.86,1.22,2.29]],['#a5ab8b','#858e71','#6d7a5d']);
      // Distinct wedge glacis: dark lower face, large sloping upper plate.
      face(ctx,[[2.89,-1.23,2.13],[3.98,-1.32,1.24],[3.98,1.32,1.24],[2.89,1.18,2.13]],['#9aa47d','#667956','#536548']);
      face(ctx,[[3.98,-1.32,1.24],[4.11,-1.22,.94],[4.11,1.22,.94],[3.98,1.32,1.24]],['#5a6a4d','#354733']);
      // Shoulder chamfers and sharp manufactured seams.
      face(ctx,[[-3.86,1.22,2.29],[2.89,1.18,2.13],[2.8,1.29,2.0],[-3.85,1.35,2.15]],['#899475','#667654']);
      line3(ctx,[[-3.86,1.22,2.3],[2.88,1.18,2.14]],'rgba(203,211,165,.68)',1.7);
      line3(ctx,[[2.89,-1.23,2.14],[2.89,1.18,2.14],[3.98,1.32,1.25]],'#b0b792',1.35);
      line3(ctx,[[-3.86,-1.22,2.3],[2.87,-1.23,2.14]],'#b4b997',1.1);
      // Replaceable near-side armour cassettes; each follows the upper body taper.
      const panels=[[-3.7,-2.45],[-2.40,-1.15],[-1.1,.25],[.30,1.58],[1.63,2.62]];
      panels.forEach(([a,b],i)=>{
        const top=x=>2.24-(x+3.86)*.0237;
        face(ctx,[[a,1.345,1.51],[b,1.345,1.51],[b,1.265,top(b)-.12],[a,1.265,top(a)-.12]],['#7f896b','#626f52','#505f45'],'#33432f',1.35);
        line3(ctx,[[a+.035,1.27,top(a)-.145],[b-.035,1.27,top(b)-.145]],'#a3ac85',.85);
        for(const x of [a+.10,b-.10])for(const z of [1.61,top(x)-.23])bolt(ctx,[x,1.355-(z-1.51)*.12,z],1.65);
        // Tiny panel drainage seam, handle and natural edge wear.
        if(i===1||i===3){line3(ctx,[[(a+b)/2-.13,1.36,1.83],[(a+b)/2-.13,1.39,1.89],[(a+b)/2+.13,1.39,1.89],[(a+b)/2+.13,1.36,1.83]],'#303f2d',2.2);}
      });
      // Small access door and hinges at the forward shoulder.
      face(ctx,[[2.65,1.32,1.47],[3.18,1.32,1.47],[2.72,1.24,1.94],[2.65,1.26,1.94]],['#7e8b68','#546747'],'#2f432c',1.1);
      // Roof engine deck aft: long recessed louver bank, precision spaced slats.
      face(ctx,[[-3.47,-.90,2.3],[-1.94,-.90,2.265],[-1.94,.31,2.265],[-3.47,.31,2.3]],'#2f3e30','#a1aa88',1.2);
      for(let i=0;i<18;i++){const x=-3.42+i*.081;line3(ctx,[[x,-.86,2.315+(x+3.42)*-.022],[x,.26,2.315+(x+3.42)*-.022]],i%3===0?'#8f9b77':'#687956',2.9);}
      for(const x of [-3.43,-2.01])for(const y of [-.84,.24])bolt(ctx,[x,y,2.32+(x+3.43)*-.023],1.5);
      // Equipment lids and roof circumferential joints.
      face(ctx,[[-1.68,-1.05,2.28],[-.55,-1.05,2.255],[-.55,-.57,2.255],[-1.68,-.57,2.28]],'#748365','#42543f',1.2);
      for(const x of [-1.58,-.66])bolt(ctx,[x,-.63,2.29],1.4);
      hatch(ctx,-.72,.32,.67,.58,2.25);
      hatch(ctx,1.17,.2,.57,.51,2.2);
      // Low commander cupola/periscopes, no gun or weapon station.
      ellipse3(ctx,[.18,-.69,2.25],.43,.43,'roof','#24382b',null);
      const ring=[];for(let i=0;i<16;i++){let a=i*TAU/16;ring.push([.18+Math.cos(a)*.43,-.69+Math.sin(a)*.43,2.39]);}
      for(let i=0;i<16;i++){const a=ring[i],b=ring[(i+1)%16];face(ctx,[[a[0],a[1],2.25],[b[0],b[1],2.25],b,a],i<8?'#6a7959':'#81906b');}
      ellipse3(ctx,[.18,-.69,2.4],.43,.43,'roof','#8b9977','#adba90',1.1);
      for(const a of [0,.75,1.5,2.25,3.0]){const x=.18+Math.cos(a)*.36,y=-.69+Math.sin(a)*.36;box3(ctx,x-.075,y-.055,2.4,.15,.11,.12,['#8d9a7c','#233b36','#102d30']);}
      // Driver hatch and three compact optical periscopes at the front.
      face(ctx,[[1.99,.24,2.18],[2.67,.24,2.16],[2.67,1.0,2.16],[1.99,1.0,2.18]],'#8c9974','#4c6045',1.2);
      for(let i=0;i<3;i++)box3(ctx,2.56,.29+i*.23,2.17,.17,.17,.12,['#a6ae8b','#233e37','#183e3d']);
      line3(ctx,[[2.12,.55,2.2],[2.12,.55,2.28],[2.30,.55,2.28],[2.30,.55,2.2]],'#344a31',2.0);
      // Frontal applique plate, latches and protected sensor window.
      face(ctx,[[3.0,-.97,2.055],[3.78,-1.04,1.42],[3.78,.96,1.42],[3.0,.90,2.055]],['#8c9c70','#647d50'],'#425b37',1.1);
      line3(ctx,[[3.02,-.96,2.061],[3.02,.90,2.061]],'#b7c398',1.2);
      for(const y of [-.84,.78])for(const x of [3.12,3.62])bolt(ctx,[x,y,2.04-(x-3.02)*.81],1.65);
      box3(ctx,3.09,-.23,1.98,.18,.42,.13,['#82936d','#38553f','#1c3932']);
      face(ctx,[[3.281,-.17,2.005],[3.281,.13,2.005],[3.281,.13,2.095],[3.281,-.17,2.095]],['#153735','#4a6c69','#0b2529'],'#092523',1);
      // Corner headlamp housings and polished glass lenses.
      for(const sy of [-1,1]){
        const y=sy*.99;
        box3(ctx,3.85,y-.15,1.23,.20,.30,.27,['#566c45','#3b5434','#263f2c']);
        const p=project([4.061,y,1.38]);
        ctx.save();ctx.translate(...p);ctx.transform(-.46,.285,0,-.94,0,0);
        const lg=ctx.createRadialGradient(-3,3,1,0,0,8);lg.addColorStop(0,'#e7e7c5');lg.addColorStop(.45,'#b5be9c');lg.addColorStop(.72,'#657761');lg.addColorStop(1,'#1c3328');
        ctx.fillStyle=lg;ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.fill();ctx.strokeStyle='#b4bda1';ctx.lineWidth=1.4;ctx.stroke();
        ctx.fillStyle='#c29b59';ctx.fillRect(-11,-11,6,3);ctx.restore();
        line3(ctx,[[4.08,y-.19,1.17],[4.08,y-.19,1.53],[4.08,y+.19,1.53],[4.08,y+.19,1.17]],'#364e32',2.3);
      }
      // Towing eyes are external visual details only.
      for(const y of [-.78,.78]){
        box3(ctx,4.06,y-.06,.94,.11,.12,.18,['#758362','#425a36','#304b2f']);
        const a=project([4.19,y,.94]);ctx.save();ctx.translate(...a);ctx.rotate(-.46);ctx.strokeStyle='#1c3020';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,3,5.4,8,0,0,TAU);ctx.stroke();ctx.strokeStyle='#84916f';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(-.7,1.8,5,7,0,Math.PI*.85,TAU*1.1);ctx.stroke();ctx.restore();
      }
      line3(ctx,[[4.13,-.82,.90],[4.13,.82,.90]],'#263d2a',5);
      // Folding mirrors. Their long thin arms are visibly separate from armour.
      for(const sy of [-1,1]){
        const y=sy*1.19;
        line3(ctx,[[2.50,y,2.13],[2.71,y+sy*.28,2.35],[2.77,y+sy*.45,2.38]],'#263b29',3);
        line3(ctx,[[2.5,y,2.14],[2.69,y+sy*.27,2.35]],'#869575',1);
        box3(ctx,2.73,y+sy*.45-.055,2.27,.20,.11,.33,['#637658','#233e30','#657d72']);
      }
      // Antenna bases, flexible aerials, tie-down eyes and grab rails.
      for(const [x,y,z,h] of [[-3.53,.92,2.31,.97],[-1.5,-1.0,2.29,.94]]){
        box3(ctx,x-.07,y-.07,z,.14,.14,.13,['#7d8e6d','#344c35','#2d442f']);
        line3(ctx,[[x,y,z+.09],[x-.035,y,z+h*.52],[x-.1,y+.015,z+h]],'#a0b19c',1.3);
        line3(ctx,[[x+.018,y,z+.11],[x-.018,y,z+.34]],'#344d36',2.8);
      }
      for(const x of [-3.45,-1.65,.52,2.15]){
        line3(ctx,[[x,1.22,2.28-(x+3.86)*.023],[x,1.22,2.39-(x+3.86)*.023],[x+.21,1.22,2.39-(x+3.86)*.023],[x+.21,1.22,2.28-(x+3.86)*.023]],'#3a4c33',2.2);
        line3(ctx,[[x+.02,1.22,2.39-(x+3.86)*.023],[x+.19,1.22,2.39-(x+3.86)*.023]],'#a0ac87',.85);
      }
      // Fine wear is stable and sparse, avoiding a noisy procedural appearance.
      for(let i=0;i<76;i++){
        const x=-3.69+((i*37)%101)/101*6.3, y=1.35,z=1.56+((i*53)%89)/89*.48;
        line3(ctx,[[x,y,z],[x+.014+(i%4)*.008,y,z+.002]],i%3?'rgba(164,174,135,.22)':'rgba(27,45,27,.33)',.75);
      }
      // Slim rear side marker and low external step.
      box3(ctx,-3.89,1.36,1.44,.16,.04,.10,['#697d57','#754b39','#44352e']);
      line3(ctx,[[-.38,1.4,1.16],[-.38,1.62,1.03],[.27,1.62,1.03],[.27,1.4,1.16]],'#2e402f',4.2);
      line3(ctx,[[-.36,1.63,1.055],[.25,1.63,1.055]],'#8b9476',1.1);
      paintTexture=false;
    }
    function tyre(ctx,x,y,z,time,near){
      const r=TYRE_RADIUS,innerY=y-.20,outerY=y+.20;
      // A true projected cylinder has separate inner/outer sidewalls and a tread.
      ellipse3(ctx,[x,innerY,z],r,r,'side','#0c1513','#26302a',1);
      for(let j=0;j<56;j++){
        const a=j*TAU/56,b=(j+1)*TAU/56;
        // The visible upper and fore segments receive a soft studio edge light.
        const light=clamp(.30+.43*Math.sin(a)+.18*Math.cos(a));
        const c=Math.round(25+light*25);
        face(ctx,[[x+r*Math.cos(a),innerY,z+r*Math.sin(a)],[x+r*Math.cos(b),innerY,z+r*Math.sin(b)],[x+r*Math.cos(b),outerY,z+r*Math.sin(b)],[x+r*Math.cos(a),outerY,z+r*Math.sin(a)]],`rgb(${c-3},${c+1},${c})`,null);
      }
      // Raised alternating chevron blocks; actual tread geometry is intentionally generic.
      const rot=wheelAngle(time);
      for(let j=0;j<32;j++){
        const a=j*TAU/32+rot, b=a+.095;
        if(Math.sin(a)<-.96)continue;
        for(const side of [-1,1]){
          const yy=y+side*.10,rr=r+.012;
          face(ctx,[[x+rr*Math.cos(a),yy-side*.065,z+rr*Math.sin(a)],[x+rr*Math.cos(b),yy-side*.065,z+rr*Math.sin(b)],[x+(rr+.009)*Math.cos(b+.032),yy+side*.073,z+(rr+.009)*Math.sin(b+.032)],[x+(rr+.009)*Math.cos(a+.032),yy+side*.073,z+(rr+.009)*Math.sin(a+.032)]],Math.sin(a)>.2?'#3b443d':'#242e29','#111e18',.45);
        }
      }
      const center=project([x,outerY+.004,z]);
      const g=ctx.createRadialGradient(center[0]-18,center[1]-24,3,center[0],center[1],58);g.addColorStop(0,near?'#434c40':'#303a32');g.addColorStop(.7,'#222e25');g.addColorStop(1,'#111d17');
      ellipse3(ctx,[x,outerY+.008,z],r*.92,r*.92,'side',g,'#485044',1.4);
      ellipse3(ctx,[x,outerY+.011,z],r*.80,r*.80,'side',null,'#1a261d',1.2);
      ellipse3(ctx,[x,outerY+.012,z],r*.69,r*.69,'side',null,'#4d5544',1);
      // Radial moulded lines and sidewall sipes.
      for(let j=0;j<40;j++){const a=j*TAU/40+rot;line3(ctx,[[x+Math.cos(a)*r*.77,outerY+.013,z+Math.sin(a)*r*.77],[x+Math.cos(a+.022)*r*.87,outerY+.013,z+Math.sin(a+.022)*r*.87]],j%2?'#485043':'#141f18',.8);}
      // Dished olive metal wheel with clean circular lip and distinct hub bolts.
      ellipse3(ctx,[x,outerY+.023,z],.345,.345,'side','#68765b','#9a9e7d',1.5);
      ellipse3(ctx,[x,outerY+.03,z],.296,.296,'side','#34492f','#1e3326',1.1);
      ellipse3(ctx,[x,outerY+.041,z],.245,.245,'side','#617251','#7d8968',1);
      for(let j=0;j<10;j++){
        const a=j*TAU/10+rot;
        const q=project([x+Math.cos(a)*.274,outerY+.033,z+Math.sin(a)*.274]);
        ctx.fillStyle='#182d21';ctx.beginPath();ctx.ellipse(q[0],q[1],3.1,4.0,.1,0,TAU);ctx.fill();
        bolt(ctx,[x+Math.cos(a)*.171,outerY+.052,z+Math.sin(a)*.171],1.7);
      }
      ellipse3(ctx,[x,outerY+.067,z],.116,.116,'side','#73805d','#9fa585',1.2);
      ellipse3(ctx,[x,outerY+.078,z],.069,.069,'side','#3d5336','#253e29',1);
      // The pipe, valve and a single restrained chalk index turn with the wheel.
      // Their asymmetry makes direction legible without relying on repeating treads.
      const rp=(dx,dz,yy)=>[x+dx*Math.cos(rot)-dz*Math.sin(rot),yy,z+dx*Math.sin(rot)+dz*Math.cos(rot)];
      line3(ctx,[rp(0,0,outerY+.085),rp(.16,-.07,outerY+.084),rp(.25,-.08,outerY+.045)],'#263f2c',2.0);
      line3(ctx,[rp(.015,.014,outerY+.09),rp(.16,-.05,outerY+.09)],'#8c9775',.8);
      const va=rot+.45;
      line3(ctx,[[x+Math.cos(va)*.278,outerY+.04,z+Math.sin(va)*.278],[x+Math.cos(va)*.316,outerY+.06,z+Math.sin(va)*.316]],'#b6b9a0',2.7);
      line3(ctx,[rp(-.075,.518,outerY+.018),rp(.025,.526,outerY+.018)],'rgba(190,181,145,.56)',3.0);
    }
    function cachedTyre(ctx,x,y,z,time,near){
      const count=near?96:48,phase=Math.floor(mod(wheelAngle(time),TAU)/TAU*count),key=(near?'n':'f')+phase;
      let tile=wheelCache.get(key);
      const center=project([0,y,TYRE_RADIUS]);
      if(!tile){
        const c=makeCanvas(240,240);
        if(c){const tc=c.getContext('2d');tc.scale(1.5,1.5);tc.translate(80-center[0],80-center[1]);
          // Use the equivalent negative angle so the shared angle function retains sign.
          const phaseTime=(TAU-phase/count*TAU)*TYRE_RADIUS/ROAD_SPEED;
          tyre(tc,0,y,TYRE_RADIUS,phaseTime,near);tile={canvas:c};wheelCache.set(key,tile);}
      }
      if(tile){const dest=project([x,y,z]);ctx.drawImage(tile.canvas,dest[0]-80,dest[1]-80,160,160);}else tyre(ctx,x,y,z,time,near);
    }
    const seed=n=>{const v=Math.sin(n*127.1+31.7)*43758.5453123;return v-Math.floor(v);};
    const edgeAlpha=x=>clamp((6-Math.abs(x))/1.05);
    function groundSurface(ctx,time){
      const d=distance(time),xs=[];
      for(let x=-6;x<=6.01;x+=.10)xs.push(x);
      // Muted earth, two wheel lanes and an irregular, softened verge.
      const strip=(lo,hi,fill)=>{
        const edge=(x,y)=>y+(Math.abs(y)>1.7?.065*Math.sin((x+d)*2.3)+.035*Math.cos((x+d)*4.7):0);
        const ps=xs.map(x=>project([x,edge(x,lo),terrain(x,time)-.015]));
        ps.push(...xs.slice().reverse().map(x=>project([x,edge(x,hi),terrain(x,time)-.015])));
        poly(ctx,ps,fill,null);
      };
      const fade=ctx.createLinearGradient(10,0,995,0);fade.addColorStop(0,'rgba(97,90,67,0)');fade.addColorStop(.14,'rgba(97,90,67,.40)');fade.addColorStop(.76,'rgba(87,82,61,.37)');fade.addColorStop(1,'rgba(87,82,61,0)');
      strip(-1.70,1.78,fade);
      for(let i=0;i<9;i++){ctx.save();ctx.globalAlpha=(8.5-i)/9;strip(1.78+i*.09,1.78+(i+1)*.09,fade);strip(-1.70-(i+1)*.09,-1.70-i*.09,fade);ctx.restore();}
      const rut=ctx.createLinearGradient(20,0,985,0);rut.addColorStop(0,'rgba(25,30,22,0)');rut.addColorStop(.17,'rgba(25,30,22,.42)');rut.addColorStop(.77,'rgba(25,30,22,.42)');rut.addColorStop(1,'rgba(25,30,22,0)');
      strip(-1.50,-.98,rut);strip(1.03,1.55,rut);
      for(const y of [-1.51,-.96,1.01,1.57]){
        const lane=xs.map(x=>project([x,y,terrain(x,time)-.012]));
        const lip=ctx.createLinearGradient(20,0,985,0);lip.addColorStop(0,'rgba(150,137,97,0)');lip.addColorStop(.18,'rgba(150,137,97,.20)');lip.addColorStop(.77,'rgba(150,137,97,.19)');lip.addColorStop(1,'rgba(150,137,97,0)');path(ctx,lane,lip,.8);
      }
      // Permanent marks belong to world coordinates: every detail moves left with the road.
      const first=Math.floor((d-6.5)/.37),last=Math.ceil((d+6.5)/.37);
      for(let k=first;k<=last;k++){
        const wx=k*.37,x=wx-d,alpha=edgeAlpha(x);if(!alpha)continue;
        for(const lane of [-1.24,1.29]){
          if(seed(k*17+lane*9)<.33)continue;
          const z=worldHeight(wx)-.008,jitter=(seed(k+lane*4)-.5)*.04;
          line3(ctx,[[x-.045,lane-.16+jitter,z],[x+.025,lane-.025+jitter,z]],`rgba(155,141,107,${.11*alpha})`,1.15);
          line3(ctx,[[x+.020,lane+.015+jitter,z],[x-.055,lane+.14+jitter,z]],`rgba(155,141,107,${.075*alpha})`,1.0);
        }
      }
      // Uneven dirt colour follows the world surface, with no tiled rectangle edges.
      const patchStart=Math.floor((d-6.4)/.71),patchEnd=Math.ceil((d+6.4)/.71);
      for(let k=patchStart;k<=patchEnd;k++)for(let row=0;row<4;row++){
        const n=k*13+row*29,wx=k*.71+seed(n)*.29,x=wx-d,y=-1.74+row*1.03+(seed(n+11)-.5)*.41;
        const alpha=edgeAlpha(x)*(.025+seed(n+17)*.025);if(!alpha)continue;
        const a=.17+seed(n+7)*.24,b=.13+seed(n+4)*.12,z=worldHeight(wx)-.006;
        const ps=[];for(let j=0;j<9;j++){const ang=j*TAU/9,rr=.72+seed(n+j*3)*.45;ps.push([x+Math.cos(ang)*a*rr,y+Math.sin(ang)*b*rr,z]);}
        face(ctx,ps,`rgba(183,159,109,${alpha})`,null);
      }
      // Pebbles are individual shaded stones, not screen-space noise.
      const from=Math.floor((d-6.4)/.53),to=Math.ceil((d+6.4)/.53);
      for(let k=from;k<=to;k++)for(let row=0;row<7;row++){
        const n=k*19+row*5,wx=k*.53+seed(n)*.35,x=wx-d,alpha=edgeAlpha(x);
        if(!alpha)continue;const y=-1.91+row*.62+(seed(n+3)-.5)*.33;
        const z=worldHeight(wx),r=.020+seed(n+11)*.038;
        ctx.save();ctx.globalAlpha=alpha*(.40+seed(n+7)*.28);
        face(ctx,[[x-r,y-r,z],[x+r,y-r*.6,z],[x+r*.45,y+r,z],[x-r*.7,y+r*.65,z+r*.55]],['#968a6d','#4e5140'],null);
        line3(ctx,[[x-r*.7,y-r*.7,z+.015],[x+r*.4,y-r*.4,z+.024]],'#b1a17f',.7);ctx.restore();
      }
      verge(ctx,time,false);
      // Low dust follows the rear axle; deterministic age keeps seek/replay identical.
      for(let i=0;i<7;i++){
        const age=mod(time*.55+i*.143,1),x=-3.12-age*2.1,y=1.27+(seed(i+60)-.5)*.48,z=terrain(x,time)+.06+age*.25;
        const p=project([x,y,z]),r=7+age*17,alpha=(1-age)*.055;
        const dust=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],r);dust.addColorStop(0,`rgba(155,140,101,${alpha})`);dust.addColorStop(1,'rgba(155,140,101,0)');ctx.fillStyle=dust;ctx.fillRect(p[0]-r,p[1]-r,r*2,r*2);
      }
    }
    function verge(ctx,time,front){
      const d=distance(time),first=Math.floor((d-6.5)/.9),last=Math.ceil((d+6.5)/.9),y0=front?2.12:-2.15;
      for(let k=first;k<=last;k++){
        if(seed(k+23)<.32)continue;
        const wx=k*.9+seed(k+102)*.3,x=wx-d,alpha=edgeAlpha(x)*.64;if(!alpha)continue;
        const y=y0+(seed(k+42)-.5)*.53,z=worldHeight(wx)-.01;
        for(let blade=0;blade<5;blade++){
          const q=seed(k*7+blade+30),h=.055+q*.10;
          line3(ctx,[[x+(blade-2)*.033,y,z],[x+(blade-2)*.040-.016,y+.018,z+h*.65],[x+(blade-2)*.045-.04,y+.025,z+h]],`rgba(${blade%2?'119,124,79':'92,109,71'},${alpha})`,.85);
        }
      }
    }
    function fenders(ctx,bodyLift,pitch){
      ctx.save();ctx.translate(500,220);ctx.rotate(pitch);ctx.translate(-500,-220-bodyLift*89*.94);
      for(const x of AXLES){
        // Open individual arch, not a long skirt that hides the eight-wheel layout.
        const ps=[];for(let i=0;i<=28;i++){const a=Math.PI*.07+i*Math.PI*.86/28;ps.push([x+Math.cos(a)*.75,1.57,.66+Math.sin(a)*.75]);}
        line3(ctx,ps,'#15271b',8);line3(ctx,ps,'#6b7b58',4.6);line3(ctx,ps.map(p=>[p[0],p[1]-.015,p[2]+.027]),'#95a078',1.0);
        for(const side of [-1,1])face(ctx,[[x+side*.73,1.4,.87],[x+side*.75,1.59,.87],[x+side*.72,1.59,.60],[x+side*.69,1.4,.61]],['#344a32','#203526'],null);
      }
      ctx.restore();
    }
    function draw(ctx,box,state={}){
      const time=Number.isFinite(state.time)?state.time:0,s=signals(time);
      const m=motion(time),elevations=m.heights,bodyLift=m.heave,pitch=m.pitch;
      const scale=Math.min(box.width/1000,box.height/440),ox=box.x+(box.width-1000*scale)/2,oy=box.y+(box.height-440*scale)/2;
      const absolute=p=>[ox+p[0]*scale,oy+p[1]*scale];
      ctx.save();ctx.beginPath();ctx.rect(box.x,box.y,box.width,box.height);ctx.clip();ctx.translate(ox,oy);ctx.scale(scale,scale);
      // Soft elliptical studio illumination fades inside the bounds, without a panel edge.
      ctx.save();ctx.translate(495,235);ctx.scale(1,.47);
      const glow=ctx.createRadialGradient(0,0,20,0,0,415);glow.addColorStop(0,'rgba(80,106,89,.075)');glow.addColorStop(1,'rgba(80,106,89,0)');
      ctx.fillStyle=glow;ctx.fillRect(-420,-420,840,840);ctx.restore();
      groundSurface(ctx,time);
      ctx.save();ctx.translate(490,340);ctx.scale(1,.18);const sh=ctx.createRadialGradient(0,0,30,0,0,390);sh.addColorStop(0,'rgba(0,7,4,.75)');sh.addColorStop(.6,'rgba(0,7,4,.36)');sh.addColorStop(1,'rgba(0,7,4,0)');ctx.fillStyle=sh;ctx.beginPath();ctx.arc(0,0,390,0,TAU);ctx.fill();ctx.restore();
      // Each contact patch has only a soft, dark ambient-occlusion shadow.
      for(const y of [-1.24,1.40])AXLES.forEach((x,i)=>{
        const q=project([x,y,elevations[i]-.014]);ctx.save();ctx.translate(q[0],q[1]+1);ctx.rotate(.10);ctx.scale(1,.19);
        const contact=ctx.createRadialGradient(0,0,4,0,0,35);contact.addColorStop(0,'rgba(0,7,4,.70)');contact.addColorStop(.45,'rgba(0,7,4,.48)');contact.addColorStop(1,'rgba(0,7,4,0)');
        ctx.fillStyle=contact;ctx.fillRect(-36,-36,72,72);ctx.restore();
      });
      // Four far wheels, independent vertical travel; chassis shadows between axles.
      AXLES.forEach((x,i)=>cachedTyre(ctx,x,-1.24,TYRE_RADIUS+elevations[i],time,false));
      for(let i=0;i<4;i++){
        const x=AXLES[i],z=TYRE_RADIUS+elevations[i];
        line3(ctx,[[x-.21,.70,.93+bodyLift],[x,1.31,z]],'#182b1f',10);
        line3(ctx,[[x+.24,.78,1.10+bodyLift],[x,1.31,z]],'#4b5c40',5);
      }
      // Cache the hundreds of manufactured details at 1.5× for crisp projection.
      if(!bodyCache){bodyCache=makeCanvas(1500,660);if(bodyCache){bodyContext=bodyCache.getContext('2d');bodyContext.scale(1.5,1.5);body(bodyContext);}}
      ctx.save();ctx.translate(500,220);ctx.rotate(pitch);ctx.translate(-500,-220-bodyLift*89*.94);
      if(bodyCache)ctx.drawImage(bodyCache,0,0,1000,440);else body(ctx);
      ctx.restore();
      // Near wheels remain detailed and animate without regenerating body geometry.
      AXLES.forEach((x,i)=>cachedTyre(ctx,x,1.29,TYRE_RADIUS+elevations[i],time,true));
      fenders(ctx,bodyLift,pitch);
      verge(ctx,time,true);
      const wheelPoints=AXLES.map((x,i)=>project([x,1.50,TYRE_RADIUS+elevations[i]]));
      ctx.restore();
      const cp=project([3.25,.05,2.10]),cx=cp[0]-500,cy=cp[1]-220-bodyLift*89*.94;
      const camera=[500+cx*Math.cos(pitch)-cy*Math.sin(pitch),220+cx*Math.sin(pitch)+cy*Math.cos(pitch)];
      return {camera:absolute(camera),wheels:wheelPoints.map((p,i)=>({x:absolute(p)[0],y:absolute(p)[1],signal:s.wheels[i]})),groundY:oy+390*scale,preview:s.preview,activity:s.activity,focusIndex:s.focusIndex};
    }
    return {draw,getSignals:signals,inspectMotion,destroy(){bodyCache=null;bodyContext=null;wheelCache.clear();}};
  }
  global.VehicleRenderer={create};
})(typeof window!=='undefined'?window:globalThis);
