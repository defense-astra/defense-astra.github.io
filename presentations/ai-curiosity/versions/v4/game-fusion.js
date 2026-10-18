/*
 * GameFusion — original, deterministic teaching animation.
 * Explains a documented two-process game bridge. This is not game footage,
 * a working commercial-game bridge, or a result produced by REA.
 * No third-party code or graphics. See v2-work/game-fusion-usage.md.
 */
(function(global){
  'use strict';
  const W=1456,H=600,TAU=Math.PI*2;
  const C={bg:'#0b1724',panel:'#10212e',panel2:'#132a36',line:'#294650',mint:'#8ee5cc',gold:'#eac67c',cream:'#f3f0e5',muted:'#9bb1bb',faint:'#49636f'};
  const titles=['카메라를 맞춥니다','화면과 깊이를 합칩니다','게임 속 사건을 전달합니다'];
  const captions=['두 게임은 각자의 로직을 계속 실행합니다.','깊이를 비교하면, 가까운 물체가 앞에 보입니다.','한쪽 게임의 사건을 다른 게임의 동작으로 연결합니다.'];
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
  const mix=(a,b,v)=>a+(b-a)*v;
  const alpha=(hex,a)=>{const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`;};
  const cycle=(t,p)=>((t%p)+p)%p;

  function mount(container,options={}){
    if(!container||typeof container.appendChild!=='function')throw new Error('GameFusion.mount requires a container element.');
    if(container.__gameFusion)container.__gameFusion.destroy();
    const shell=document.createElement('div');shell.className='game-fusion';
    shell.setAttribute('role','group');shell.setAttribute('aria-label','두 게임이 연결되는 원리: 카메라 동기화, 깊이 합성, 사건 전달. 원리 설명용 재구성.');
    const canvas=document.createElement('canvas');canvas.width=W*2;canvas.height=H*2;
    canvas.setAttribute('role','img');canvas.setAttribute('aria-label','GTA V와 Minecraft 연결 방식을 설명하는 직접 제작한 애니메이션. 실제 게임 화면이 아닙니다.');
    const status=document.createElement('div');status.className='gf-a11y';status.setAttribute('aria-live','polite');
    const controls=document.createElement('div');controls.className='gf-controls';
    controls.setAttribute('role','group');controls.setAttribute('aria-label','게임 결합 원리 애니메이션 조작');
    const counter=document.createElement('span');counter.className='gf-counter';counter.setAttribute('aria-live','polite');
    const buttons={};
    function makeButton(key,label,action){
      const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.action=key;
      b.onclick=action;buttons[key]=b;controls.append(b);return b;
    }
    makeButton('prev','이전 단계',()=>prev());controls.append(counter);
    makeButton('next','다음 단계',()=>next());
    makeButton('play','재생',()=>play());makeButton('pause','정지',()=>pause());makeButton('reset','처음부터',()=>reset());
    // Native Enter/Space activation stays inside this local control group.
    controls.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')e.stopPropagation();});
    shell.append(canvas,status,controls);container.appendChild(shell);
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D is unavailable.');
    ctx.scale(2,2);
    let stage=0,time=2.2,running=false,destroyed=false,raf=0,last=null;

    function txt(text,x,y,size=20,color=C.cream,weight=500,align='left'){
      ctx.fillStyle=color;ctx.font=`${Math.round(weight/100)*100} ${size}px Deck, "Noto Sans KR", "Malgun Gothic", sans-serif`;
      ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(text,x,y);
    }
    function path(pts,stroke=C.line,width=1,fill=null,close=false){
      ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));if(close)ctx.closePath();
      if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
    }
    function rect(x,y,w,h,fill,stroke=null,r=0){
      ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);
      if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
    }
    function circle(x,y,r,fill=null,stroke=null,width=1){
      ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
    }
    function glow(x,y,r,color,a=.25){
      const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,alpha(color,a));g.addColorStop(1,alpha(color,0));circle(x,y,r,g);
    }
    function arrow(x1,y1,x2,y2,color=C.mint,width=2,dashed=false){
      ctx.save();if(dashed)ctx.setLineDash([5,7]);path([[x1,y1],[x2,y2]],color,width);ctx.restore();
      const a=Math.atan2(y2-y1,x2-x1);path([[x2-9*Math.cos(a-.5),y2-9*Math.sin(a-.5)],[x2,y2],[x2-9*Math.cos(a+.5),y2-9*Math.sin(a+.5)]],color,width);
    }
    function pill(text,x,y,w,color=C.mint,fill=C.panel2){rect(x,y,w,32,fill,alpha(color,.45),16);txt(text,x+w/2,y+16,16,color,600,'center');}
    function panel(x,y,w,h,label,color){
      rect(x,y,w,h,C.panel,C.line,14);txt(label,x+20,y+26,23,color,650);circle(x+w-25,y+26,4,color);
      path([[x,y+51],[x+w,y+51]],C.line,1);
    }
    function cube(cx,cy,s,color=C.mint,depth=false){
      const d=s*.48,h=s*.94;
      const fillTop=depth?'#bbc8c8':color===C.gold?'#eac67c':'#8ee5cc';
      const fillLeft=depth?'#67777a':color===C.gold?'#716142':'#315d5c';
      const fillRight=depth?'#9aa6a6':color===C.gold?'#aa8d59':'#548c82';
      const A=[cx,cy-h],B=[cx+s*.8,cy-h+d],D=[cx-s*.8,cy-h+d],E=[cx,cy-h+2*d];
      path([A,B,E,D],alpha(color,.8),1,fillTop,true);
      path([D,E,[cx,cy+d],[cx-s*.8,cy]],alpha(color,.75),1,fillLeft,true);
      path([E,B,[cx+s*.8,cy],[cx,cy+d]],alpha(color,.85),1,fillRight,true);
    }
    function grid(x,y,w,h,color=C.mint){
      const vx=x+w*.5,vy=y+h*.37;
      for(let i=-8;i<=8;i++)path([[vx+i*7,vy],[x+w*.5+i*w*.15,y+h]],alpha(color,.13),1);
      for(let j=0;j<9;j++){const yy=vy+(h-(vy-y))*Math.pow(j/8,1.7);path([[x,yy],[x+w,yy]],alpha(color,.13),1);}
    }
    function city(x,y,w,h,t,opts={}){
      ctx.save();rect(x,y,w,h,C.bg);ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
      const sky=ctx.createLinearGradient(0,y,0,y+h);sky.addColorStop(0,'#162b3a');sky.addColorStop(1,'#07131f');rect(x,y,w,h,sky);
      glow(x+w*.68,y+h*.2,w*.35,C.gold,.1);
      const drift=Math.sin(t*.45)*w*.013;
      const buildings=[[.01,.33,.1,.5],[.12,.2,.11,.63],[.26,.42,.1,.4],[.37,.11,.12,.7],[.51,.3,.12,.53],[.66,.19,.12,.65],[.81,.38,.1,.45],[.9,.12,.13,.72]];
      buildings.forEach((b,i)=>{
        let bx=x+b[0]*w+drift,bw=b[2]*w,by=y+b[1]*h,bh=b[3]*h;
        rect(bx,by,bw,bh,i%2?'#253d4a':'#1e3442',alpha(C.gold,.22));
        path([[bx+bw,by],[bx+bw+bw*.22,by+8],[bx+bw+bw*.22,by+bh],[bx+bw,by+bh]],null,1,'#152937',true);
        for(let r=0;r<Math.floor(bh/18)-1;r++)for(let c=0;c<3;c++)if((r+c+i)%3!==0)rect(bx+7+c*bw*.26,by+10+r*18,Math.max(2,bw*.09),3,alpha(C.gold,(r+c)%2?.45:.2));
      });
      path([[x+w*.42,y+h*.67],[x+w*.58,y+h*.67],[x+w*.84,y+h],[x+w*.1,y+h]],null,1,'#13212b',true);
      path([[x+w*.5,y+h*.69],[x+w*.49,y+h]],alpha(C.gold,.38),2);
      for(let n=0;n<3;n++){const z=cycle(n/3+t*.065,1),py=y+h*(.71+.3*z*z),pw=8+z*24;
        rect(x+w*(.6+.1*z),py,pw,pw*.4,'#4c6270',null,3);rect(x+w*(.6+.1*z)+pw*.1,py+2,pw*.3,2,C.gold);
      }
      if(opts.block)cube(x+w*.58+drift,y+h*.79,w*.13,C.mint);
      if(opts.pole){
        const px=x+w*.59+Math.sin(t*.35)*w*.08;
        // Host foreground object is drawn after the guest block: visible depth ordering.
        path([[px,y+h*.12],[px,y+h*.98]],'#eac67c',7);
        path([[px,y+h*.13],[px+w*.12,y+h*.13],[px+w*.14,y+h*.2]],'#eac67c',5);
        glow(px+w*.14,y+h*.2,24,C.gold,.15);
      }
      if(opts.car){rect(x+w*.37,y+h*.77,w*.16,h*.095,'#5e7280',C.gold,6);circle(x+w*.4,y+h*.87,6,C.bg);circle(x+w*.5,y+h*.87,6,C.bg);}
      ctx.restore();
    }
    function voxel(x,y,w,h,t,opts={}){
      ctx.save();rect(x,y,w,h,opts.checker?'#142630':C.bg);ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
      if(opts.checker)for(let row=0;row<h/22;row++)for(let col=0;col<w/22;col++)if((row+col)%2===0)rect(x+col*22,y+row*22,22,22,'#1c303b');
      grid(x,y,w,h,opts.depth?'#bbc8c8':C.mint);
      const shift=Math.sin(t*.45)*w*.013;
      [[.3,.64,.1],[.45,.76,.115],[.62,.6,.12],[.76,.82,.1]].forEach((b,i)=>cube(x+w*b[0]+shift,y+h*b[1],w*b[2],opts.depth?'#b2c5c4':i===2?C.gold:C.mint,opts.depth));
      if(opts.item){cube(x+w*.52,y+h*.68,w*.1,C.gold);txt('TNT',x+w*.52,y+h*.65,Math.max(14,w*.045),C.bg,800,'center');}
      ctx.restore();
    }
    function reticle(x,y,color){
      const r=17;ctx.save();ctx.globalAlpha=.85;
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sy])=>path([[x+sx*r,y+sy*(r-7)],[x+sx*r,y+sy*r],[x+sx*(r-7),y+sy*r]],color,2));
      circle(x,y,2,color);ctx.restore();
    }
    function ray(x,y,ang,color){
      const len=64;path([[x,y],[x+Math.cos(ang-.3)*len,y+Math.sin(ang-.3)*len],[x+Math.cos(ang+.3)*len,y+Math.sin(ang+.3)*len]],alpha(color,.4),1,alpha(color,.1),true);
      circle(x,y,5,color);
    }
    function pulseLink(x1,y1,x2,y2,t,color=C.mint){
      arrow(x1,y1,x2,y2,alpha(color,.5),2);
      for(let n=0;n<3;n++){const u=cycle(t*.3+n/3,1),px=mix(x1,x2,u),py=mix(y1,y2,u);glow(px,py,14,color,.4);circle(px,py,3,color);}
    }
    function heading(){
      txt(String(stage+1).padStart(2,'0'),32,36,20,C.mint,700);txt(titles[stage],80,36,29,C.cream,650);
      pill('원리 설명',W-156,20,124,C.gold);
    }
    function footer(){
      path([[32,526],[W-32,526]],C.line,1);
      txt(captions[stage],32,557,23,C.cream,500);
      const x0=W-300;
      for(let i=0;i<3;i++){rect(x0+i*88,548,70,5,i===stage?C.mint:C.line,null,3);txt(['시점','깊이','사건'][i],x0+i*88+35,578,15,i===stage?C.mint:C.muted,500,'center');}
      txt('직접 제작한 개념 장면 · 실제 게임 화면 아님',32,584,13,C.muted,400);
    }
    function sceneSync(t){
      const x1=32,x2=844,y=82,w=580,h=326;
      panel(x1,y,w,h,'GTA V',C.gold);panel(x2,y,w,h,'Minecraft',C.mint);
      city(x1+1,y+52,w-2,h-53,t);voxel(x2+1,y+52,w-2,h-53,t);
      const cx=x1+w*.52+Math.sin(t*.45)*w*.013,cy=y+52+(h-53)*.55;
      reticle(cx,cy,C.gold);reticle(cx-x1+x2,cy,C.mint);
      const center=728;
      pulseLink(x1+w+18,226,x2-18,226,t,C.mint);
      pill('시점 공유',center-71,248,142,C.mint);
      txt('같은 방향',center,306,18,C.muted,500,'center');
      const bx1=x1+24,bx2=x2+24,by=435;
      rect(bx1,by,532,62,C.panel2,null,12);rect(bx2,by,532,62,C.panel2,null,12);
      const a=-Math.PI/2+Math.sin(t*.45)*.28;ray(bx1+48,by+45,a,C.gold);ray(bx2+48,by+45,a,C.mint);
      txt('도시 · 차량 · 환경',bx1+102,by+31,24,C.gold,550);txt('블록 · 아이템 · 플레이',bx2+102,by+31,24,C.mint,550);
    }
    function sceneDepth(t){
      // Left: actual layers are abstractly illustrated, not screen captures.
      const lx=32,ly=83,lw=450;
      txt('각 게임의 화면',lx+8,ly+8,20,C.muted,500);
      ctx.save();ctx.globalAlpha=.95;rect(lx,ly+30,lw,192,C.panel,C.line,12);city(lx+1,ly+31,lw-2,190,t);ctx.restore();
      pill('GTA V · 도시',lx+18,ly+45,160,C.gold);
      rect(lx+108,ly+157,lw-60,208,C.panel2,alpha(C.mint,.7),12);voxel(lx+109,ly+158,lw-62,206,t,{checker:true});
      pill('Minecraft · 블록',lx+126,ly+174,210,C.mint);
      // Depth grayscale strip directly below the Minecraft colour layer.
      rect(lx+108,ly+378,lw-60,42,C.panel2,C.line,10);
      for(let n=0;n<14;n++){const v=Math.floor(mix(48,215,n/13));rect(lx+122+n*13,ly+391,12,15,`rgb(${v},${v+5},${v+7})`);}
      txt('깊이 정보',lx+378,ly+399,17,C.cream,500,'center');
      pulseLink(550,292,654,292,t,C.mint);txt('합성',602,325,19,C.muted,600,'center');
      const x=680,y=83,w=744,h=418;
      panel(x,y,w,h,'하나로 보이는 장면',C.cream);city(x+1,y+52,w-2,h-53,t,{block:true,pole:true});
      pill('앞쪽 가로등',x+w*.61,y+76,153,C.gold);pill('중간 블록',x+w*.45,y+h-51,136,C.mint);
      txt('먼 건물',x+38,y+175,17,C.muted,500);
    }
    function burst(x,y,u,color){
      if(u<0||u>1)return;
      const e=ease(u);glow(x,y,95,color,.35*(1-u));
      for(let k=0;k<3;k++)circle(x,y,18+e*(70+k*17),null,alpha(color,clamp(1-u-k*.15)),2.5-k*.5);
      for(let n=0;n<10;n++){const a=n*TAU/10+.2;const r=30+u*85;path([[x+Math.cos(a)*r,y+Math.sin(a)*r],[x+Math.cos(a)*(r+8),y+Math.sin(a)*(r+8)]],alpha(color,1-u),3);}
    }
    function sceneEvent(t){
      const x1=32,x2=844,y=82,w=580,h=326;
      panel(x1,y,w,h,'Minecraft',C.mint);panel(x2,y,w,h,'GTA V',C.gold);
      voxel(x1+1,y+52,w-2,h-53,0,{item:true});city(x2+1,y+52,w-2,h-53,0,{car:true});
      const phase=cycle(t,7.5),out=ease((phase-1.4)/1.9),arrived=phase>=3.3;
      arrow(x1+w+18,247,x2-18,247,alpha(C.mint,.4),2,true);
      if(phase>1.4&&phase<3.3){
        const px=mix(x1+w-20,x2+25,out);glow(px,247,44,C.mint,.25);rect(px-47,229,94,36,C.mint,null,8);txt('사건',px,247,20,C.bg,750,'center');
      }
      txt('연결 모드',728,192,22,C.muted,600,'center');
      pill('발생 → 전달',657,282,142,C.mint);
      const px1=x1+w*.52,py1=y+52+(h-53)*.66;
      if(phase>1)burst(px1,py1,(phase-1)/2.1,C.mint);
      if(arrived)burst(x2+w*.45,y+52+(h-53)*.79,(phase-3.3)/2.1,C.gold);
      const activeLeft=phase>=1,activeRight=arrived;
      rect(x1+24,435,w-48,62,activeLeft?'#19392f':C.panel2,null,12);
      rect(x2+24,435,w-48,62,activeRight?'#3a3324':C.panel2,null,12);
      txt('폭발 사건 발생',x1+w/2,466,25,activeLeft?C.mint:C.muted,600,'center');
      txt(activeRight?'GTA V에도 효과 적용':'사건 전달 대기',x2+w/2,466,25,activeRight?C.gold:C.muted,600,'center');
      // Label is intentionally conceptual; no timings or amplitudes are measurements.
    }
    function draw(){
      if(destroyed)return;ctx.clearRect(0,0,W,H);rect(0,0,W,H,C.bg);glow(W*.5,270,430,C.mint,.025);
      heading();if(stage===0)sceneSync(time);else if(stage===1)sceneDepth(time);else sceneEvent(time);footer();
      canvas.dataset.stage=String(stage);canvas.dataset.time=time.toFixed(2);canvas.dataset.playing=String(running);
    }
    function getState(){return {stage,step:stage+1,index:stage,title:titles[stage],time,playing:running,destroyed};}
    function announce(){
      status.textContent=`${stage+1}단계. ${titles[stage]}. ${captions[stage]}`;
      counter.textContent=`${stage+1} / 3`;counter.setAttribute('aria-label',`총 3단계 중 ${stage+1}단계`);
      buttons.prev.disabled=stage===0;buttons.next.disabled=stage===2;
      buttons.play.disabled=running;buttons.pause.disabled=!running;
      buttons.play.setAttribute('aria-pressed',String(running));
      buttons.pause.setAttribute('aria-pressed',String(!running));
      if(typeof options.onChange==='function')options.onChange(getState());
    }
    function tick(ts){if(!running||destroyed)return;if(last!==null)time+=Math.min((ts-last)/1000,.08);last=ts;draw();raf=requestAnimationFrame(tick);}
    function play(){if(destroyed||running)return getState();running=true;last=null;raf=requestAnimationFrame(tick);draw();announce();return getState();}
    function pause(){running=false;last=null;if(raf)cancelAnimationFrame(raf);raf=0;draw();announce();return getState();}
    function go(n){stage=clamp(Math.round(n),0,2);time=stage===2?2.2:2.2;last=null;draw();announce();return getState();}
    function next(){return go(stage+1);}
    function prev(){return go(stage-1);}
    function reset(){pause();stage=0;time=2.2;draw();announce();return getState();}
    function seek(seconds){if(Number.isFinite(seconds)){time=Math.max(0,seconds);last=null;draw();}return getState();}
    function destroy(){if(destroyed)return;running=false;destroyed=true;if(raf)cancelAnimationFrame(raf);shell.remove();if(container.__gameFusion===api)delete container.__gameFusion;}
    const api={next,prev,play,pause,reset,destroy,getState,goTo:go,seek};container.__gameFusion=api;
    draw();announce();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(!destroyed)draw();});
    if(options.autoStart===true)play();return api;
  }
  global.GameFusion={mount,version:'2.0.0',width:W,height:H};
})(window);
