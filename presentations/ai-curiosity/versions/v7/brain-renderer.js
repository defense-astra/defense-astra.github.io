/*
 * Fly-brain connectome illustration, original procedural geometry.
 * Silhouette reference: FlyWire / Dorkenwald et al., Nature 2024.
 * This is NOT measured neuron geometry, connectivity, or neural activity.
 * Canvas2D only; a fixed, slightly oblique 3D fibre view is raster-cached once.
 * Local cached fibre masks and point clusters share one regional activity envelope.
 * All glow textures are built once; playback performs no blur or new view rendering.
 */
(function (global) {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
  const lerp = (a,b,t) => a+(b-a)*t;
  function random(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7,61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function create() {
    const rnd = random(744217), fibres = [], pulses = [], sparkles = [];
    const r = (a,b) => lerp(a,b,rnd());
    const v = (x,y,z) => [x,y,z];
    function curve(ctrl, alpha, width, tone, pulse) {
      const pts = [], count = 24, phase = r(0,TAU), amp = r(.65,2.15), frequency=r(2.1,4.6);
      for (let i=0;i<=count;i++) {
        const t=i/count, u=1-t, env=Math.sin(t*Math.PI);
        const p=[0,0,0];
        for (let k=0;k<3;k++) p[k]=u*u*u*ctrl[0][k]+3*u*u*t*ctrl[1][k]+3*u*t*t*ctrl[2][k]+t*t*t*ctrl[3][k];
        p[0]+=amp*Math.sin(t*TAU*frequency+phase)*env;
        p[1]+=amp*.6*Math.cos(t*TAU*(frequency+.6)+phase)*env;
        p[2]+=amp*.7*Math.sin(t*TAU+phase)*env;
        pts.push(p);
      }
      const f={pts,alpha,width,tone,z:pts.reduce((a,p)=>a+p[2],0)/pts.length}; fibres.push(f);
      if(pulse && pulses.length<120) pulses.push({pts,phase:rnd(),speed:r(.10,.19)});
      return f;
    }
    // Dense central neuropil: irregular arborizations, not a cortical sphere.
    for (const side of [-1,1]) {
      for(let i=0;i<1180;i++) {
        const angle=r(-Math.PI,Math.PI), h=r(-1,1), ring=Math.sqrt(1-h*h), depth=r(.62,1);
        const px=side*(61+65*Math.cos(angle)*ring*depth);
        const py=-34+102*h*depth + 9*Math.sin(angle*3)*ring;
        const pz=58*Math.sin(angle)*ring*depth;
        const origin=v(px,py,pz), inner=v(side*r(4,86),r(-45,62),r(-24,36));
        const branch=v(side*r(12,106),r(-95,49),r(-50,58));
        const f=curve([origin,v(px+side*r(-9,3),py+r(2,18),pz*.93),v(side*r(5,65),r(-35,72),r(-25,45)),inner],r(.13,.34),r(.32,.68),rnd()<.26?1:0,i%89===0);
        // Inward and local arborization, with a few irregular terminal twigs.
        if(i%2===0) {
          const p=f.pts[8+Math.floor(r(0,10))];
          curve([p,v(lerp(p[0],branch[0],.4),p[1]-r(3,17),p[2]+r(-5,9)),v(branch[0],branch[1]+r(4,20),branch[2]),branch],r(.1,.24),r(.22,.42),0,false);
        }
      }
      // Optic lobe medulla: an oblique crescent of many column-like fine fibres.
      // Its layers bend into the central brain through the optic chiasm.
      for(let i=0;i<970;i++) {
        const a=r(-1.30,1.20), ring=r(.78,1.02), z=r(-53,53);
        const y=30+106*Math.sin(a)*ring;
        const x=side*(147+38*Math.cos(a)*ring + .18*z + y*.17);
        const end=v(side*(114+18*Math.cos(a)),y*.65+6,r(-38,34));
        const start=v(x,y,z);
        const f=curve([start,v(side*(179+.12*z+y*.17),y-12,z*.85),v(side*(124+.09*z),y*.88+10,-z*.25),end],r(.11,.28),r(.29,.55),rnd()<.4?1:0,i%151===0);
        if(i%3===0) {
          const p=f.pts[10];
          curve([p,v(p[0]-side*15,p[1]-10,p[2]),v(side*r(92,121),y*.5,r(-36,40)),v(side*r(71,109),y*.48-14,r(-40,48))],r(.12,.24),r(.25,.46),0,false);
        }
      }
      // Tangential fibres trace layered crescent surfaces without coarse mesh rings.
      for(let i=0;i<240;i++) {
        const z=r(-52,50), a=r(-1.1,.5), b=a+r(.32,1.1), rr=r(.79,1.01), pts=[];
        for(let k=0;k<=30;k++) {
          const t=k/30, an=lerp(a,b,t), warp=Math.sin(t*Math.PI)*r(.7,1.4);
          pts.push(v(side*(147+38*Math.cos(an)*rr+.18*z+(30+106*Math.sin(an)*rr)*.17+warp),30+106*Math.sin(an)*rr,z+Math.sin(t*5)*1.1));
        }
        fibres.push({pts,alpha:r(.08,.22),width:r(.25,.5),tone:1,z});
      }
      // A second, smaller inner visual mass gives the lateral body layered depth.
      for(let i=0;i<230;i++) {
        const a=r(0,TAU), z=r(-42,28), rad=r(.6,1);
        const p=v(side*(112+30*Math.cos(a)*rad),34+68*Math.sin(a)*rad,z);
        curve([p,v(side*r(105,134),p[1]*.9,z*.7),v(side*r(65,94),r(-15,45),r(-25,25)),v(side*r(25,61),r(-48,38),r(-20,39))],r(.11,.25),r(.25,.48),0,i%113===0);
      }
      // Ventral projections taper below the central neuropil.
      for(let i=0;i<110;i++) {
        const x=side*r(7,41), z=r(-20,27);
        curve([v(side*r(21,77),r(34,66),z),v(x,81,z*.6),v(side*r(6,20),102,r(-8,8)),v(side*r(2,15),r(107,129),r(-8,8))],r(.1,.3),r(.24,.5),0,i%41===0);
      }
    }
    // Intrinsic fine arborizations fill neuropil interiors, with no single artificial hub.
    // Small curling trajectories give individual fibres a natural, branched texture.
    for(let i=0;i<2350;i++) {
      const side=i%2?1:-1, a=r(0,TAU), h=r(-1,1), ring=Math.sqrt(1-h*h);
      const base=v(side*(51+49*Math.cos(a)*ring),-24+86*h,48*Math.sin(a)*ring);
      const pts=[], phase=r(0,TAU), length=r(16,40), drift=r(-12,12), z0=base[2];
      for(let k=0;k<=26;k++) {
        const t=k/26, bend=t*length;
        pts.push(v(base[0]+Math.sin(phase+t*3)*bend*.42+drift*t,
          base[1]+Math.cos(phase+t*4)*bend*.52,
          z0+Math.sin(phase+t*5)*bend*.36));
      }
      fibres.push({pts,alpha:r(.12,.32),width:r(.27,.55),tone:i%4===0?1:0,z:z0});
    }
    // Compact midline neuropil and ventral central region bridge both halves.
    for(let i=0;i<680;i++) {
      const a=r(0,TAU), h=r(-1,1), ring=Math.sqrt(1-h*h), y=25+57*h;
      const p=v(42*Math.cos(a)*ring,y,39*Math.sin(a)*ring);
      curve([p,v(p[0]*.8+r(-8,8),y-15,p[2]+10),v(r(-34,34),r(-30,61),r(-28,35)),v(r(-39,39),r(-35,74),r(-28,32))],r(.1,.24),r(.26,.5),0,i%145===0);
    }
    // Fine commissural tracts create a coherent whole brain across the midline.
    for(let i=0;i<380;i++) {
      const y=r(-105,38), z=r(-40,48), span=r(34,96);
      curve([v(-span,y+r(-15,14),z),v(-25,y-25+r(-4,9),z+18),v(25,y-26+r(-6,8),z+12),v(span,y+r(-13,16),z+r(-5,5))],r(.1,.25),r(.25,.6),rnd()<.12?1:0,i%77===0);
    }
    fibres.sort((a,b)=>a.z-b.z);

    const CW=1000,CH=660, FIXED_YAW=.045;
    let baseLayer=null, glowRegions=null, glowSprite=null;
    const palette=['189,208,202','129,165,159'];
    function surface(width=CW,height=CH) {
      if(typeof OffscreenCanvas!=='undefined') return new OffscreenCanvas(width,height);
      if(global.document && global.document.createElement) { const c=global.document.createElement('canvas'); c.width=width;c.height=height;return c; }
      if(typeof global.__brainCanvasFactory==='function') return global.__brainCanvasFactory(width,height);
      return null;
    }
    function project(p,angle) {
      const ca=Math.cos(angle),sa=Math.sin(angle), xx=p[0]*ca+p[2]*sa, zz=-p[0]*sa+p[2]*ca;
      const scale=1+zz*.00065;
      // Broad bilateral silhouette, viewed from the front like the reference demos.
      // This remains authored geometry, not sampled or registered neuron data.
      return [CW*.5+xx*2.22*scale,CH*.46+(p[1]*.68-zz*.25)*2.1,zz];
    }
    function renderLayer(angle) {
      const canvas=surface(); if(!canvas) return null; const c=canvas.getContext('2d');
      // Translucent neuropil volumes establish subtle depth under the fine fibres.
      for(const s of [-1,1]) {
        const center=project([s*60,-22,0],angle);
        const g=c.createRadialGradient(center[0]-22,center[1]-40,10,center[0],center[1],220);
        g.addColorStop(0,'rgba(112,140,148,.08)');g.addColorStop(.65,'rgba(99,123,133,.035)');g.addColorStop(1,'rgba(90,110,120,0)');
        c.fillStyle=g;c.fillRect(center[0]-220,center[1]-220,440,440);
      }
      c.lineCap='round'; c.lineJoin='round';
      for(const f of fibres) {
        const pts=f.pts, z=f.z, shade=clamp((z+80)/150), opacity=f.alpha*(.19+shade*.62);
        c.beginPath();
        for(let i=0;i<pts.length;i++) {const q=project(pts[i],angle);if(i)c.lineTo(q[0],q[1]);else c.moveTo(q[0],q[1]);}
        c.strokeStyle='rgba('+palette[f.tone]+','+opacity.toFixed(3)+')'; c.lineWidth=f.width*1.9;c.stroke();
      }
      // A fine point cloud gives the network the stippled appearance of the
      // reference demos. Point locations derive only from our original fibres.
      for(let i=0;i<fibres.length;i+=3) {
        const f=fibres[i],p=f.pts[(i*7)%f.pts.length],q=project(p,angle);
        const depth=clamp((p[2]+65)/120), radius=.55+(i%5)*.15;
        c.fillStyle='rgba(205,224,216,'+(.16+.32*depth).toFixed(3)+')';
        c.beginPath();c.arc(q[0],q[1],radius,0,TAU);c.fill();
        if(i%9===0) {
          sparkles.push({x:q[0],y:q[1],detail:r(.82,1),radius:r(.8,1.65)});
        }
      }
      return canvas;
    }
    function getLayer() {
      // Build once at first paint. Playback and seeking reuse the same raster.
      if(!baseLayer)baseLayer=renderLayer(FIXED_YAW);
      return baseLayer;
    }
    function prepareGlow() {
      if(glowRegions || !baseLayer)return;
      // These are illustrative regions of our original drawing, not registered
      // neuropil boundaries or biological signal measurements.
      const regions=[
        {p:[-165,7,25],rx:88,ry:92,input:true},
        {p:[166,31,25],rx:84,ry:88,input:true},
        {p:[-43,-9,38],rx:88,ry:75,input:false},
        {p:[49,17,31],rx:84,ry:76,input:false},
        {p:[0,81,14],rx:62,ry:70,input:false}
      ];
      glowRegions=[];
      for(const region of regions) {
        const p=project(region.p,FIXED_YAW), pad=28;
        const width=Math.ceil(region.rx*2+pad*2),height=Math.ceil(region.ry*2+pad*2);
        const x=Math.round(p[0]-width/2),y=Math.round(p[1]-height/2);
        const mask=surface(width,height),glow=surface(width,height);
        if(!mask||!glow)continue;
        const m=mask.getContext('2d');
        // A sparse subset of the existing fibres makes a visible local bundle.
        // Never tint the whole base alpha: dense neuropil would become a flat disk.
        m.translate(-x,-y);m.lineCap='round';m.lineJoin='round';
        m.strokeStyle=region.input?'rgba(139,205,186,.66)':'rgba(227,183,133,.60)';
        m.lineWidth=1.30;
        for(let index=0;index<fibres.length;index+=7) {
          const fibre=fibres[index];let connected=false,hasPath=false;m.beginPath();
          for(const point of fibre.pts) {
            const q=project(point,FIXED_YAW);
            const dist=Math.pow((q[0]-p[0])/region.rx,2)+Math.pow((q[1]-p[1])/region.ry,2);
            if(dist<1.05) {
              if(connected)m.lineTo(q[0],q[1]);else m.moveTo(q[0],q[1]);
              connected=true;hasPath=true;
            } else connected=false;
          }
          if(hasPath)m.stroke();
        }
        m.setTransform(1,0,0,1,0,0);
        m.globalCompositeOperation='destination-in';
        m.save();m.translate(width/2,height/2);m.scale(region.rx,region.ry);
        const feather=m.createRadialGradient(0,0,0,0,0,1);
        feather.addColorStop(0,'rgba(255,255,255,.94)');
        feather.addColorStop(.36,'rgba(255,255,255,.86)');
        feather.addColorStop(.74,'rgba(255,255,255,.28)');
        feather.addColorStop(1,'rgba(255,255,255,0)');
        m.fillStyle=feather;m.fillRect(-4,-4,8,8);m.restore();
        const g=glow.getContext('2d');
        // One-time cached halo; no shadow/filter operation occurs in draw().
        g.shadowBlur=10;g.shadowColor=region.input?'rgba(99,177,157,.48)':'rgba(199,133,104,.48)';
        g.drawImage(mask,0,0);g.shadowBlur=0;
        glowRegions.push({...region,texture:glow,x,y,cx:p[0],cy:p[1]});
      }
      // Every point uses the same regional envelope. Spatial weights are fixed,
      // so the highlight reads as one coherent location rather than random dots.
      for(const point of sparkles)point.gains=glowRegions.map(region=>spatialGain(point.x,point.y,region));
      glowSprite=surface(48,48);
      if(glowSprite) {
        const g=glowSprite.getContext('2d'),radial=g.createRadialGradient(24,24,0,24,24,24);
        radial.addColorStop(0,'rgba(255,228,185,.76)');
        radial.addColorStop(.12,'rgba(247,201,136,.48)');
        radial.addColorStop(.34,'rgba(219,164,90,.17)');
        radial.addColorStop(1,'rgba(204,146,70,0)');
        g.fillStyle=radial;g.fillRect(0,0,48,48);
      }
    }
    function spatialGain(x,y,region) {
      const d=Math.pow((x-region.cx)/region.rx,2)+Math.pow((y-region.cy)/region.ry,2);
      if(d>=1)return 0;
      // A broad, steady centre with a soft boundary, restricted to one local area.
      const edge=clamp((1-d)/.64);return edge*edge*(3-2*edge);
    }
    function activityEnvelope(time) {
      // An explanatory route through neighbouring regions. Each region remains
      // clearly lit for 1 second, followed by a 0.35-second hand-over. This timing
      // is presentation choreography, not a biological conduction measurement.
      const order=[0,2,3,1,3,4,2],duration=1.35,hold=1;
      const cycle=order.length*duration,position=((time%cycle)+cycle)%cycle;
      const step=Math.floor(position/duration),local=position-step*duration;
      const blend=clamp((local-hold)/(duration-hold));
      const smooth=blend*blend*(3-2*blend),weights=glowRegions.map(()=>0);
      weights[order[step]]=1-smooth;
      weights[order[(step+1)%order.length]]+=smooth;
      return weights;
    }
    function localActivity(x,y,weights) {
      let value=0;
      for(let i=0;i<glowRegions.length;i++)if(weights[i]>0)value+=weights[i]*spatialGain(x,y,glowRegions[i]);
      return value;
    }
    function drawGlow(ctx,time,activity,preview) {
      if(!glowRegions)return [];
      const weights=activityEnvelope(time);
      for(let i=0;i<glowRegions.length;i++) {
        const region=glowRegions[i],envelope=weights[i];if(envelope<=0)continue;
        const drive=region.input?preview:activity;
        // The complete local fibre bundle shares the same stable intensity.
        ctx.globalCompositeOperation='screen';
        ctx.globalAlpha=envelope*(.14+.20*drive);
        ctx.drawImage(region.texture,region.x,region.y);
        ctx.globalCompositeOperation='source-over';
        ctx.globalAlpha=envelope*(.50+.42*drive);
        ctx.drawImage(region.texture,region.x,region.y);
      }
      for(const point of sparkles) {
        let intensity=0,input=0;
        for(let i=0;i<weights.length;i++) {
          const weight=weights[i]*point.gains[i];
          intensity+=weight;if(glowRegions[i].input)input+=weight;
        }
        intensity*=point.detail*(.64+.36*activity);
        if(intensity<.015)continue;
        ctx.globalAlpha=Math.min(.92,intensity*.92);
        ctx.fillStyle=input>intensity*.5?'#b8ead7':'#f6d5ac';
        ctx.beginPath();ctx.arc(point.x,point.y,point.radius+.35,0,TAU);ctx.fill();
        if(intensity>.65 && glowSprite) {
          ctx.globalAlpha=intensity*.16;
          ctx.drawImage(glowSprite,point.x-10,point.y-10,20,20);
        }
      }
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
      return weights;
    }
    function draw(ctx,box,state={}) {
      const time=Number.isFinite(state.time)?state.time:0;
      const yaw=FIXED_YAW, a=getLayer();
      prepareGlow();
      const size=Math.min(box.width/CW,box.height/CH),w=CW*size,h=CH*size;
      const ox=box.x+(box.width-w)/2,oy=box.y+(box.height-h)/2;
      ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
      ctx.globalCompositeOperation='lighter';
      if(a){ctx.globalAlpha=.9;ctx.drawImage(a,ox,oy,w,h);ctx.globalAlpha=1;}
      ctx.globalCompositeOperation='source-over';
      // Warm signal flecks are explanatory, not recorded or simulated activity.
      const activity=clamp(Number.isFinite(state.activity)?state.activity:.45);
      const preview=clamp(Number.isFinite(state.preview)?state.preview:activity);
      ctx.translate(ox,oy);ctx.scale(size,size);ctx.lineCap='round';
      const regionalWeights=drawGlow(ctx,time,activity,preview);
      // A few moving details stay inside the currently illuminated bundle.
      // Nothing flashes independently elsewhere in the brain.
      for(let i=0;i<pulses.length;i++) {
        if(i%3!==0)continue;
        const f=pulses[i],progress=(f.phase+time*f.speed)%1;
        const tail=.075+.035*activity,n=f.pts.length-1;
        const start=Math.max(0,Math.floor((progress-tail)*n)),end=Math.min(n,Math.floor(progress*n));
        if(end<=start)continue;
        for(let k=start+1;k<=end;k++) {
          const a=project(f.pts[k-1],yaw),b=project(f.pts[k],yaw);
          const strength=localActivity((a[0]+b[0])/2,(a[1]+b[1])/2,regionalWeights);
          if(strength<.04)continue;
          ctx.globalAlpha=strength*.32;
          ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);
          ctx.strokeStyle='#e7d6b5';ctx.lineWidth=1.3;ctx.stroke();
        }
        const p=project(f.pts[end],yaw),strength=localActivity(p[0],p[1],regionalWeights);
        if(strength>.08) {
          ctx.globalAlpha=strength*.48;ctx.fillStyle='#f7e4c6';
          ctx.beginPath();ctx.arc(p[0],p[1],1.3,0,TAU);ctx.fill();
        }
      }
      ctx.globalAlpha=1;
      ctx.restore();
    }
    return {draw,destroy(){baseLayer=null;glowRegions=null;glowSprite=null;sparkles.length=0;}};
  }
  global.BrainRenderer={create};
})(typeof window!=='undefined'?window:globalThis);
