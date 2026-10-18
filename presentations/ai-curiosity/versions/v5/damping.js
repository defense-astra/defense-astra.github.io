/* Authored presentation illustration, not measured dynamics or a simulated connectome. */
(function(global){
 'use strict';
 const W=1600,H=660,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const P={bg:'#101b25',ink:'#eeeae0',muted:'#97a5ab',line:'#34434b',amber:'#d2b477',pale:'#b1c5c5'};
 function mount(canvas,options={}){
  if(!canvas||typeof canvas.getContext!=='function')throw Error('DampingScene.mount requires a canvas.');
  canvas.__dampingScene?.destroy();
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas2D unavailable');
  if(!global.VehicleRenderer||!global.BrainRenderer)throw Error('Damping visual modules unavailable');
  canvas.width=W;canvas.height=H;canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label','해외 8×8 장갑차 외형을 참고한 입체 차량과 초파리 뇌 연결지도 형태를 참고한 신경 섬유 시각화. 노면과 바퀴의 움직임에 맞춰 설명용 신호가 흐릅니다. 실측 차량 모델이나 실제 신경 활동은 아닙니다.');
  const vehicle=global.VehicleRenderer.create(),brain=global.BrainRenderer.create();
  let t=0,running=false,destroyed=false,last=null,raf=0,lastPaint=-1,lastSignal=-1;
  function text(s,x,y,size=20,color=P.ink,weight=400,align='left'){
   ctx.font=`${weight} ${size}px Deck,"Noto Sans KR",sans-serif`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillStyle=color;ctx.fillText(s,x,y);
  }
  function line(points,color=P.line,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function dot(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function cubic(p,u){const a=1-u;return [a*a*a*p[0][0]+3*a*a*u*p[1][0]+3*a*u*u*p[2][0]+u*u*u*p[3][0],a*a*a*p[0][1]+3*a*a*u*p[1][1]+3*a*u*u*p[2][1]+u*u*u*p[3][1]];}
  function route(p,color,alpha=.4){ctx.beginPath();ctx.moveTo(...p[0]);ctx.bezierCurveTo(...p[1],...p[2],...p[3]);ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=1.4;ctx.stroke();ctx.globalAlpha=1;}
  function pulse(p,u,color){const q=cubic(p,u);dot(q[0],q[1],3,color);}
  function frame(time){
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);
   const g=ctx.createRadialGradient(470,285,40,470,285,610);g.addColorStop(0,'rgba(28,42,51,.9)');g.addColorStop(1,'rgba(28,42,51,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
   const b=ctx.createRadialGradient(1302,300,20,1302,300,270);b.addColorStop(0,'rgba(28,40,49,.9)');b.addColorStop(1,'rgba(28,40,49,0)');ctx.fillStyle=b;ctx.fillRect(0,0,W,H);
   text('노면을 먼저 읽고',36,46,29,P.ink,600);
   text('8×8 차량 · 야지의 요철과 차륜 반응',37,78,18,P.muted);
   text('전진 →',972,78,16,P.muted,500,'right');
   text('초파리의 시각회로에서 착안',1060,46,26,P.ink,600);
   text('미세한 신경 연결이 정보를 전달하는 방식',1061,78,17,P.muted);
   line([[1022,108],[1022,516]],'#34434b',.8);
   const signals=vehicle.getSignals?.(time)||{preview:.25,activity:.35,wheels:[.2,.3,.4,.2],focusIndex:1};
   const art=vehicle.draw(ctx,{x:26,y:96,width:990,height:442},{time,...signals})||{};
   brain.draw(ctx,{x:1038,y:128,width:514,height:365},{time,preview:signals.preview,activity:signals.activity});
   const camera=art.camera;
   if(camera&&Array.isArray(camera)&&camera.every(Number.isFinite)){
    const p=[camera,[camera[0]+62,camera[1]-20],[1000,194],[1081,241]];
    route(p,P.pale,.33);pulse(p,(time*.14)%1,P.pale);dot(camera[0],camera[1],3,P.pale);
   }
   // A schematic association; no measured control latency is implied.
   const ret=[[1464,428],[1515,481],[1343,512],[1085,512]];
   route(ret,P.amber,.35);pulse(ret,(time*.17+.3)%1,P.amber);
   text('시각 정보',1076,116,15,P.pale,500);
   text('조절 신호',1085,541,16,P.amber,500);
   text('연결지도 형상을 참고한 표현',1546,541,15,P.muted,400,'right');
   // Four axles × two wheels; schematic indicators with no invented units.
   const rowY=529,start=113,gap=216;
   for(let i=0;i<4;i++){
    const x=start+i*gap,s=clamp(signals.wheels?.[i]||0),active=i===signals.focusIndex;
    text(`${4-i}축`,x,rowY,16,active?P.ink:P.muted,500);
    for(let side=0;side<2;side++){
     const xx=x+40+side*55,yy=rowY-9;line([[xx,yy],[xx+40,yy]],'#43525a',3);
     line([[xx,yy],[xx+10+30*s,yy]],active?P.amber:'#92a3a5',3);dot(xx+10+30*s,yy,2.7,active?P.amber:'#b3bfc0');
    }
   }
   line([[36,566],[1560,566]],P.line,1);
   const progress=(time%16)/16,phase=progress<.22?0:progress<.47?1:progress<.74?2:3;
   ['노면 관측','신호 처리','댐퍼 조절','차체 반응'].forEach((label,i)=>{
    const x=38+i*388,active=i===phase;text(`0${i+1}`,x,615,17,active?P.amber:'#6f8089',500);
    text(label,x+43,617,23,active?P.ink:'#8c9ca4',active?600:400);
    if(active)line([[x+43,631],[x+142,631]],P.amber,2);
    if(i<3)line([[x+280,603],[x+288,608],[x+280,613]],'#4b5b64',1.1);
   });
   if(typeof options.onSignal==='function'&&(lastSignal<0||Math.abs(time-lastSignal)>=1/15)){
    options.onSignal({time,preview:signals.preview,activity:signals.activity,wheels:signals.wheels.slice(),illustrative:true});lastSignal=time;
   }
  }
  function tick(stamp){if(!running||destroyed)return;if(last!==null)t+=Math.min((stamp-last)/1000,.08);last=stamp;if(lastPaint<0||stamp-lastPaint>=1000/30){frame(t);lastPaint=stamp;}raf=requestAnimationFrame(tick);}
  const api={
   start(){if(!destroyed&&!running){running=true;last=null;lastPaint=-1;raf=requestAnimationFrame(tick);}return api;},
   stop(){running=false;last=null;cancelAnimationFrame(raf);return api;},pause(){return api.stop();},
   reset(){t=0;last=null;lastSignal=-1;frame(t);return api;},
   seek(seconds){t=Math.max(0,Number(seconds)||0);last=null;lastSignal=-1;frame(t);return api;},
   render(seconds){if(seconds!==undefined)return api.seek(seconds);frame(t);return api;},
   getTime(){return t;},isRunning(){return running;},
   destroy(){api.stop();destroyed=true;vehicle.destroy?.();brain.destroy?.();if(canvas.__dampingScene===api)delete canvas.__dampingScene;}
  };
  canvas.__dampingScene=api;frame(t);if(options.autoStart!==false)api.start();return api;
 }
 global.DampingScene={mount,width:W,height:H};
})(window);
