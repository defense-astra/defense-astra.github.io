(()=>{'use strict';
const $=s=>document.querySelector(s),stage=$('#stage'),slides=window.SLIDES,drawer=$('#drawer'),live=$('#live-modal');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let at=0,scene=null,seqTimer=null,step=0,tourAt=0,presenter=null,started=Date.now(),playing=false;
let renderToken=0,mediaStarted=false,entryEdge='start',pendingNavigation=0;
let sceneObserver=null;
const qs=new URLSearchParams(location.search);if(qs.has('capture'))document.body.classList.add('capture');
// Warm bundled images before the presenter reaches them. This also avoids
// repeating a visible load when returning from the live demo.
const preloadImages=new Set(slides.flatMap(s=>[s.image,s.poster]).filter(Boolean));
['astra-map.jpg','astra-map-detail.jpg','astra-3d-status.jpg','astra-sources.jpg','astra-updates.jpg','flyvis-network-poster.jpg','app-qr.svg'].forEach(x=>preloadImages.add(x));
const warmed=[...preloadImages].map(src=>{const im=new Image();im.src='assets/'+src;return im;});
const chapter=i=>['01 / 제가 만든 장비 검색 웹앱','02 / 요즘 관심 있는 초파리 뇌','03 / REA와 프로그램 분석','04 / 게임도 연결해 보면','05 / 우리 업무에서'][slides[i].chapter];
const eyebrow=i=>`<p class="eyebrow">${chapter(i)}</p>`;
const heading=s=>`<h1>${esc(s.title)}</h1>`;
const actions=s=>s.live?`<div class="actions"><button class="primary" data-live="${esc(s.live)}">웹앱 열기 ↗</button></div>`:'';
const foot=(s,i)=>`<footer class="foot"><span class="credit">${esc(s.label||'')}</span><span class="folio">V4 · ${String(i+1).padStart(2,'0')} / ${slides.length}</span></footer>`;
const flowNames=['앞쪽 노면 촬영','영상의 변화 감지','차량 상태를 보고 판단','감쇠력 조절','차량 움직임 확인'];
const flowDetails=['보정된 카메라 영상으로 시작합니다','영상의 움직임과 커지는 패턴을 찾습니다','깊이 정보와 차량 속도·자세를 함께 봅니다','판단한 결과를 댐퍼 조절 명령으로 바꿉니다','차량이 어떻게 움직였는지 센서로 확인합니다'];

function render(){
 const token=++renderToken;sceneObserver?.disconnect();pendingNavigation=0;mediaStarted=entryEdge==='end';
 if(scene){scene.destroy();scene=null;}clearInterval(seqTimer);seqTimer=null;step=0;playing=false;
 stage.querySelectorAll('video').forEach(v=>v.pause());const s=slides[at];stage.className=(s.theme||'light')+' kind-'+s.kind+(s.id==='S21'?' long-statement':'');let html='';
 if(s.kind==='image'){const full=true;html=full?`<div class="top-media">${eyebrow(at)}<div class="media-heading">${heading(s)}${actions(s)}</div><div class="media-frame"><img src="assets/${s.image}" alt="${esc(s.label||s.title)}"></div></div>`:`<div class="image-layout"><div>${eyebrow(at)}${heading(s)}${actions(s)}</div><div class="media-frame screenshot"><img src="assets/${s.image}" alt="${esc(s.label||s.title)}"></div></div>`;}
 else if(s.kind==='statement')html=`<div class="statement">${eyebrow(at)}${heading(s)}${s.sub?`<p class="sub">${esc(s.sub)}</p>`:''}</div>`;
 else if(s.kind==='quiz')html=`<div class="quiz">${eyebrow(at)}<img class="brain" src="assets/${s.image}" alt="${at===9?'정체를 맞혀볼 공개 연구 이미지':'FlyWire 초파리 뇌 연결 구조 렌더링'}">${heading(s)}</div>`;
 else if(s.kind==='video')html=`<div class="video-layout">${heading(s)}<div class="video-wrap"><video playsinline controls preload="metadata" poster="assets/${s.poster}" src="assets/${s.video}"></video><button class="video-play" data-play>${s.playLabel||'영상 보기 ▶'}</button></div></div>`;
 else if(s.kind==='model')html=`<div class="model-layout"><div>${eyebrow(at)}${heading(s)}<div class="model-steps">신경 연결 지도 <b>+</b> 계산 모델 <b>+</b> 가상 환경</div><p class="sub">FlyVis · 초파리 시각계를 바탕으로 움직임을 처리하는 모델</p></div><div class="video-wrap"><video controls playsinline loop preload="metadata" src="assets/flyvis-network.mp4" poster="assets/flyvis-network-poster.jpg"></video><button class="video-play" data-play>모델 구조 영상 보기 ▶</button></div></div>`;
 else if(s.kind==='damping')html=`<div class="canvas-layout">${heading(s)}<canvas id="damping" width="1600" height="660" aria-label="가상 노면, 차륜, 댐퍼와 합성 연결망이 반응하는 설명 애니메이션"></canvas><div class="canvas-controls"><button data-damp="play" disabled>애니메이션 재생 ▶</button><button data-damp="reset" disabled>처음부터</button></div></div>`;
 else if(s.kind==='tour')html=`<div class="tour-layout">${heading(s)}${actions(s)}<img id="tour-image" class="tour-image" src="assets/astra-map.jpg" alt="실제 웹앱 캡처 모음"><div class="tour-controls"><button data-tour="-1">이전 화면</button><span id="tour-label">1 / 5 · Boxer 검색</span><button data-tour="1">다음 화면</button></div></div>`;
 else if(s.kind==='pipeline')html=`<div class="diagram-layout">${heading(s)}<div class="pipeline-track">${flowNames.map((n,i)=>`${i?'<span class="pipe-arrow">→</span>':''}<div class="pipe-node ${i===0?'active':''}"><small>0${i+1}</small><b>${n}</b></div>`).join('')}</div><div class="feedback-line">← 센서로 측정한 차량 상태 반영</div><p class="diagram-status" id="sequence-text">${flowDetails[0]}</p><div class="diagram-controls"><button data-step>다음 단계 →</button><button data-auto>자동 재생 ▶</button></div></div>`;
 else if(s.kind==='vision')html=`<div class="diagram-layout">${heading(s)}<div class="vision-pair"><div class="vision-item"><h2>시야 속 물체가 움직이는 방향</h2><div class="flow-field">${Array.from({length:18},(_,i)=>`<span style="left:${i%6*130}px;top:${Math.floor(i/6)*102+18}px;animation-delay:-${i%4*.5}s">←</span>`).join('')}</div><p>영상 전체의 움직임: 광류</p></div><div class="vision-item"><h2>다가오면서 커지는 모습</h2><div class="loom-field"><span class="loom-dot"></span></div><p>사방으로 커지는 움직임 감지 · LPLC2 연구</p></div></div></div>`;
 else if(s.kind==='status')html=`<div class="diagram-layout">${heading(s)}<div class="columns"><div class="column"><h2 class="stamp">만들어본 것</h2><p>가정한 차량 모델로 움직임 계산<br>노면 변화에 반응하는 가상 신호<br>노면·댐퍼·신호를 함께 보여주는 애니메이션</p><small>차량 계산은 기존 데모, 애니메이션은 이번 발표용입니다</small></div><div class="column"><h2>앞으로 확인할 것</h2><p>실제 FlyVis 모델을 연결해 실행<br>센서 입력부터 댐퍼 반응까지 걸리는 시간<br>같은 조건에서 기존 제어기와 비교</p><small>실차 성능과 기존 방식 대비 효과는 아직 확인 전입니다</small></div></div></div>`;
 else if(s.kind==='distinction')html=`<div class="diagram-layout">${heading(s)}<div class="columns"><div class="column"><h2>공개 사양과 동작을 보고 직접 만든 프로그램</h2><p>PhotoCraft<br>CADCraft<br>GridCraft</p><small>REA로 만들었는지는 확인하지 못했습니다</small></div><div class="column"><h2>REA로 분석 도구를 사용하는 AI</h2><p>함수가 어떤 입력을 받는지<br>어떤 함수를 부르고 어떤 값을 쓰는지<br>같은 입력을 넣었을 때 결과가 맞는지</p><small>다음은 REA 공식 문서에 나온 분석 사례입니다</small></div></div></div>`;
 else if(s.kind==='dx')html=`<div class="diagram-layout">${heading(s)}<div class="dx-scene"><div class="pan-line"><span class="pan-ball"></span></div><div class="pan-labels"><span>소리가 왼쪽으로</span><span>화면 속 위치에 맞춰 소리가 나는 방향 조절</span><span>소리가 오른쪽으로</span></div><div class="dx-stats"><div><strong>3,205 <span>개 입력값</span></strong>원래 함수와 결과 비교</div><div><strong>63 <span>바이트 일치</span></strong>해당 함수의 컴파일 결과가 일치했다고 보고</div></div></div></div>`;
 else if(s.kind==='rea'||s.kind==='can'||s.kind==='fusion')html=`<div class="module-layout">${eyebrow(at)}${heading(s)}<div id="module-scene"></div></div>`;
 else if(s.kind==='validation')html=`<div class="diagram-layout">${heading(s)}<div class="validation-list"><div><b>01</b>시간축</div><div><b>02</b>단위</div><div><b>03</b>채널이 뜻하는 값</div><div><b>04</b>같은 입력에서 결과가 맞는지</div></div></div>`;
 else if(s.kind==='handoff')html=`<div class="handoff-layout"><div>${eyebrow(at)}${heading(s)}<p>defense-astra.github.io/versions/v6/</p>${actions(s)}</div><img src="assets/app-qr.svg" alt="Defense Astra 웹앱으로 연결하는 QR 코드"></div>`;
 else if(s.kind==='questions')html=`<div class="questions">${eyebrow(at)}${heading(s)}<div class="question-list">${s.questions.map((q,i)=>`<p><span>0${i+1}</span>${q}</p>`).join('')}</div></div>`;
 stage.innerHTML=html+foot(s,at);$('#counter').textContent=`${at+1} / ${slides.length}`;$('#progress').style.width=`${(at+1)/slides.length*100}%`;
 stage.setAttribute('aria-label',`${at+1}번 장표: ${s.title.replace(/\n/g,' ')}`);document.title=`${at+1}. ${s.title.replace(/\n/g,' ')} — 만들어보고 싶은 것들`;
 const entryIsEnd=entryEdge==='end';
 function mounted(module){
  if(token!==renderToken){module.destroy();return;}scene=module;
  if(entryIsEnd){const st=navigationState();if(module.goTo)module.goTo(st.count-1);else if(module.seekStep)module.seekStep(st.count-1);else for(let i=st.index;i<st.count-1;i++)module.next?.();module.pause?.();}
  updateNavigation();if(pendingNavigation){const direction=pendingNavigation;pendingNavigation=0;navigate(direction);}
 }
 if(s.kind==='damping')document.fonts.ready.then(()=>{if(token!==renderToken)return;scene=DampingScene.mount($('#damping'),{autoStart:false,onSignal:x=>{const c=$('#damping');if(c)c.dataset.time=x.time.toFixed(2);}});scene.seek(6.25);stage.querySelectorAll('[data-damp]').forEach(b=>b.disabled=false);updateNavigation();if(pendingNavigation){const direction=pendingNavigation;pendingNavigation=0;navigate(direction);}});
 stage.querySelectorAll('video').forEach(v=>{
  v.addEventListener('play',()=>{mediaStarted=true;v.parentElement.querySelector('[data-play]').hidden=true;updateNavigation();});
  v.addEventListener('pause',()=>updateNavigation());
  v.addEventListener('ended',()=>{const b=v.parentElement.querySelector('[data-play]');b.hidden=false;b.textContent='다시 재생 ↻';updateNavigation();});
  v.addEventListener('error',()=>{const b=v.parentElement.querySelector('[data-play]');b.hidden=false;b.textContent='영상을 불러오지 못했습니다 · 다시 시도';updateNavigation();});
  if(entryIsEnd){const endFrame=()=>{if(token!==renderToken)return;if(Number.isFinite(v.duration)&&v.duration>0)v.currentTime=Math.max(0,v.duration-.05);const b=v.parentElement.querySelector('[data-play]');b.hidden=false;b.textContent='다시 재생 ↻';};if(v.readyState>=1)endFrame();else v.addEventListener('loadedmetadata',endFrame,{once:true});}
 });
 if(s.kind==='tour'){tourAt=entryIsEnd?tours.length-1:0;updateTour();}
 if(s.kind==='pipeline'){step=entryIsEnd?flowNames.length-1:0;updateSeq();}
 if(s.kind==='rea')mounted(REAWorkshop.mount($('#module-scene'),{scene:s.scene,autoStart:false,onChange:()=>updateNavigation()}));
 if(s.kind==='can')mounted(CANReport.mount($('#module-scene'),{autoStart:false}));
 if(s.kind==='fusion')document.fonts.ready.then(()=>{if(token===renderToken)mounted(GameFusion.mount($('#module-scene'),{autoStart:!entryIsEnd,onChange:()=>updateNavigation()}));});
 sceneObserver=new MutationObserver(()=>updateNavigation());sceneObserver.observe(stage,{subtree:true,attributes:true,attributeFilter:['data-step','data-stage','data-playing']});
 updateNavigation();

}
const tours=[['astra-map.jpg','Boxer 검색'],['astra-map-detail.jpg','지도에서 운용 사례 확인'],['astra-3d-status.jpg','3D 기능과 실행 환경 확인'],['astra-sources.jpg','원문 확인'],['astra-updates.jpg','최근 소식']];
function updateTour(){const t=tours[tourAt];$('#tour-image').src=`assets/${t[0]}`;$('#tour-label').textContent=`${tourAt+1} / 5 · ${t[1]}`;}
function updateSeq(){if(slides[at].kind!=='pipeline')return;stage.querySelectorAll('.pipe-node').forEach((x,i)=>x.classList.toggle('active',i===step));$('#sequence-text').textContent=flowDetails[step];const b=stage.querySelector('[data-step]');if(b)b.textContent=step===flowNames.length-1?'다음 장표 →':'다음 단계 →';updateNavigation();}
function stopSequence(){clearInterval(seqTimer);seqTimer=null;playing=false;const b=stage.querySelector('[data-auto]');if(b)b.textContent='자동 재생 ▶';}
function advance(){if(step<flowNames.length-1){step++;updateSeq();}if(step===flowNames.length-1)stopSequence();}
// All pointer, toolbar and presenter commands share this boundary decision.
function navigationPlan(state,direction){
 if(!state.ready)return 'wait';
 if(direction>0){if(state.index<state.count-1)return state.media?'start':'step-next';return 'slide-next';}
 if(state.index>0)return state.media?'reset':'step-prev';return 'slide-prev';
}
function navigationState(){
 const kind=slides[at].kind;
 if(kind==='tour')return {index:tourAt,count:tours.length,label:tours[tourAt][1],ready:true};
 if(kind==='pipeline')return {index:step,count:flowNames.length,label:flowNames[step],ready:true};
 if(['video','model','damping'].includes(kind))return {index:mediaStarted?1:0,count:2,label:mediaStarted?'다음: 다음 장표':kind==='damping'?'다음: 애니메이션 재생':'다음: 영상 재생',media:true,ready:kind!=='damping'||!!scene};
 if(['rea','can','fusion'].includes(kind)){
  const state=scene?.getState?.();const count=kind==='rea'?(state?.stepCount||(slides[at].scene==='all'?24:4)):kind==='can'?4:3;
  const index=kind==='fusion'?(state?.stage??0):(state?.step??0);
  return {index,count,label:state?.label||state?.stepTitle||state?.title||'준비 중',ready:!!scene,playing:!!state?.playing};
 }
 return {index:0,count:1,label:'다음: 다음 장표',ready:true};
}
function updateNavigation(){
 const state=navigationState(),prev=$('#prev'),next=$('#next'),status=$('#nav-status');
 prev.disabled=at===0&&state.index===0;next.disabled=at===slides.length-1&&state.index>=state.count-1;
 prev.setAttribute('aria-label',state.index>0?'이전 단계':'이전 장표');next.setAttribute('aria-label',state.index<state.count-1?(state.media?'영상 또는 애니메이션 재생':'다음 단계'):'다음 장표');
 if(status)status.textContent=!state.ready?'준비 중':state.media?state.label:state.count>1?`단계 ${state.index+1} / ${state.count} · ${state.label}`:'포인터: 다음 / 이전';
 $('#counter').dataset.stepLabel=state.count>1?`${state.index+1}/${state.count} 단계`:'';$('#counter').title=`${at+1} / ${slides.length} 장표${state.count>1?` · ${state.index+1} / ${state.count} 단계`:''}`;
 stage.dataset.slideId=slides[at].id;stage.dataset.navigationStep=String(state.index);stage.dataset.navigationCount=String(state.count);stage.dataset.navigationReady=String(state.ready);
 syncPresenter();
}
function go(i,edge='start'){
 const target=Math.max(0,Math.min(slides.length-1,i));if(target===at&&edge==='keep')return;
 at=target;entryEdge=edge;location.hash=String(at+1);render();
}
function startMedia(){
 if(slides[at].kind==='damping'){mediaStarted=true;scene?.start();const b=stage.querySelector('[data-damp="play"]');if(b)b.textContent='일시정지 Ⅱ';updateNavigation();return;}
 const v=stage.querySelector('video');if(!v)return;mediaStarted=true;updateNavigation();if(v.ended)v.currentTime=0;
 v.play().catch(()=>{const b=v.parentElement.querySelector('[data-play]');b.hidden=false;b.textContent='재생을 누르거나, 다음 장표로 이동하세요';updateNavigation();});
}
function resetMedia(){
 mediaStarted=false;scene?.stop?.();scene?.seek?.(0);const d=stage.querySelector('[data-damp="play"]');if(d)d.textContent='애니메이션 재생 ▶';
 stage.querySelectorAll('video').forEach(v=>{v.pause();v.currentTime=0;const b=v.parentElement.querySelector('[data-play]');b.hidden=false;b.textContent=slides[at].playLabel||'영상 보기 ▶';});updateNavigation();
}
function navigate(direction){
 const state=navigationState(),action=navigationPlan(state,direction);
 if(action==='wait'){pendingNavigation=direction;return;}
 pauseMedia();
 if(action==='slide-next'){if(at<slides.length-1)go(at+1);return;}
 if(action==='slide-prev'){if(at>0)go(at-1,'end');return;}
 if(action==='start'){startMedia();return;}
 if(action==='reset'){resetMedia();return;}
 const kind=slides[at].kind;
 if(kind==='tour'){tourAt+=direction;updateTour();}
 else if(kind==='pipeline'){step+=direction;updateSeq();}
 else {direction>0?scene?.next?.():scene?.prev?.();if(kind==='fusion')scene?.play?.();}
 updateNavigation();
}
function pauseMedia(){scene?.pause?.();scene?.stop?.();const b=stage.querySelector('[data-damp="play"]');if(b)b.textContent='애니메이션 재생 ▶';stage.querySelectorAll('video').forEach(v=>v.pause());stopSequence();}
function openDrawer(title,html){pauseMedia();$('#drawer-title').textContent=title;$('#drawer-body').innerHTML=html;drawer.showModal();}
function showNotes(){const s=slides[at],begin=slides.slice(0,at).reduce((n,x)=>n+x.seconds,0);openDrawer('발표자 노트',`<div class="note-meta">${at+1} / ${slides.length} · ${time(begin)}–${time(begin+s.seconds)} · 권장 ${s.seconds}초</div><h2>${esc(s.title).replace(/\n/g,' ')}</h2><p>${esc(s.note)}</p><div class="note-cue">${esc(s.cue)}</div><div class="note-actions"><button id="presenter-open">별도 발표자 창 열기 ↗</button><a href="speaker.html" target="_blank">전체 발표 대본 ↗</a><a href="sources.html" target="_blank">출처·검증 기록 ↗</a></div>`);}
function showSources(){const s=slides[at];openDrawer('이 장표의 출처와 범위',(s.source||[]).map(id=>sourceHtml(id)).join('')||'<p>이번 발표를 위해 작성한 질문·설명 장표입니다.</p>');$('#drawer-body').insertAdjacentHTML('beforeend','<p><a href="sources.html" target="_blank">전체 미디어·라이선스·확인 범위 ↗</a></p>');}
function sourceHtml(id){const x=SOURCES[id];if(!x)return '';return `<div class="source-entry"><h3>${esc(x.title)}</h3><a href="${esc(x.url)}" target="_blank" rel="noopener">원출처 ↗</a><p>${esc(x.detail)}</p><p>${esc(x.credit)}</p>${x.license?`<a href="${x.license}" target="_blank">라이선스 ↗</a>`:''}</div>`;}
function showOverview(){openDrawer('장표 목록',`<div class="overview-grid">${slides.map((s,i)=>`<button data-go="${i}" class="${i===at?'active':''}"><b>${String(i+1).padStart(2,'0')} · ${s.seconds}초</b>${esc(s.title.replace(/\n/g,' '))}</button>`).join('')}</div>`);}
function time(s){return `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}`;}
function syncPresenter(){if(presenter&&!presenter.closed)presenter.postMessage({type:'deck-state',index:at,elapsed:Math.floor((Date.now()-started)/1000),navigation:navigationState(),hasPrevious:at>0||navigationState().index>0,hasNext:at<slides.length-1||navigationState().index<navigationState().count-1},'*');}
function fullState(on){document.body.classList.toggle('presenting',on);document.body.dataset.presentationMode=on?'on':'off';$('#fullscreen').innerHTML=on?'전체 화면 종료 <kbd>F</kbd>':'전체 화면 <kbd>F</kbd>';resize();}
function toggleFull(){if(document.body.classList.contains('presenting')){fullState(false);if(document.fullscreenElement)document.exitFullscreen?.();}else{fullState(true);document.documentElement.requestFullscreen?.().catch(()=>{document.body.dataset.fullscreenFallback='true';});}}
document.addEventListener('fullscreenchange',()=>{document.body.dataset.nativeFullscreen=document.fullscreenElement?'on':'off';if(!document.fullscreenElement)fullState(false);});
function closeDialogs(){if(live.open){live.close();$('#live-frame').src='about:blank';}if(drawer.open)drawer.close();}
function toggleAnimation(){
 if(scene?.play){scene.getState?.().playing?scene.pause():scene.play();updateNavigation();return;}
 if(slides[at].kind==='damping'){if(scene?.isRunning())pauseMedia();else startMedia();return;}
 const video=stage.querySelector('video');if(video){video.paused?startMedia():video.pause();}
}
document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;
 if(b.hasAttribute('data-close')){b.closest('dialog').close();if(b.closest('#live-modal'))$('#live-frame').src='about:blank';}
 if(b.dataset.live){pauseMedia();$('#live-external').href=b.dataset.live;$('#live-frame').src=b.dataset.live;live.showModal();}
 if(b.hasAttribute('data-play')){const v=b.parentElement.querySelector('video');v.currentTime=0;startMedia();}
 if(b.dataset.damp&&scene){if(b.dataset.damp==='reset')resetMedia();else if(scene.isRunning())pauseMedia();else startMedia();updateNavigation();}
 if(b.dataset.tour)navigate(Number(b.dataset.tour));
 if(b.hasAttribute('data-step'))navigate(1);
 if(b.hasAttribute('data-auto')){if(playing)stopSequence();else{if(step===flowNames.length-1){step=0;updateSeq();}playing=true;b.textContent='일시정지 Ⅱ';seqTimer=setInterval(advance,3800);}}
 if(b.dataset.go!==undefined){drawer.close();go(Number(b.dataset.go));}
 if(b.id==='presenter-open'){presenter=window.open('presenter.html','deck-presenter','width=1000,height=800');if(presenter)drawer.close();}
});
$('#next').onclick=()=>navigate(1);$('#prev').onclick=()=>navigate(-1);$('#overview').onclick=showOverview;$('#notes').onclick=showNotes;$('#sources').onclick=showSources;$('#fullscreen').onclick=toggleFull;
function keyboardCommand(event){
 if(event.ctrlKey||event.metaKey||event.altKey)return null;
 const key=event.key.toLowerCase();
 if(['arrowright','arrowdown','pagedown'].includes(key))return event.shiftKey?'skip-next':'next';
 if(['arrowleft','arrowup','pageup'].includes(key))return event.shiftKey?'skip-prev':'prev';
 if(key===' '||key==='spacebar')return event.shiftKey?'prev':'next';
 if(key==='enter')return 'next';if(key==='backspace')return 'prev';
 return {home:'first',end:'last',escape:'escape',f:'fullscreen',f5:'fullscreen',a:'animate',']':'next','[':'prev',n:'notes',o:'overview',s:'sources'}[key]||null;
}
function command(command){
 if(command==='escape'){if(drawer.open||live.open)closeDialogs();else if(document.body.classList.contains('presenting'))toggleFull();return;}
 if(drawer.open||live.open){if(['next','prev','skip-next','skip-prev','first','last'].includes(command))closeDialogs();return;}
 if(command==='next')navigate(1);if(command==='prev')navigate(-1);
 if(command==='skip-next'&&at<slides.length-1)go(at+1);if(command==='skip-prev'&&at>0)go(at-1,'end');
 if(command==='first')go(0);if(command==='last')go(slides.length-1);
 if(command==='animate')toggleAnimation();if(command==='notes')showNotes();if(command==='overview')showOverview();if(command==='sources')showSources();if(command==='fullscreen')toggleFull();
 if(command==='reset-timer'){started=Date.now();syncPresenter();}
}
// Capture-phase cancellation prevents Enter/Space from also clicking a focused
// button or toggling native video controls after advancing the presentation.
document.addEventListener('keydown',e=>{
 if(e.target.isContentEditable||e.target.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable=""],[role="textbox"]'))return;
 const action=keyboardCommand(e);if(!action)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;command(action);
},true);
window.addEventListener('message',e=>{if(e.source!==presenter)return;if(e.data?.type==='presenter-ready')syncPresenter();if(e.data?.type==='deck-command')command(e.data.command);});
// Read-only state and the normal command path also support regression checks.
window.DeckNavigation=Object.freeze({getState:()=>({slideIndex:at,slideId:slides[at].id,...navigationState()}),command});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseMedia();});
window.addEventListener('hashchange',()=>{const n=parseInt(location.hash.slice(1),10)-1;if(Number.isFinite(n)&&n>=0&&n<slides.length&&n!==at){at=n;entryEdge='start';render();}});
function resize(){const r=$('#viewport').getBoundingClientRect();document.documentElement.style.setProperty('--scale',Math.min(r.width/1600,r.height/900));}window.addEventListener('resize',resize);new ResizeObserver(resize).observe($('#viewport'));setInterval(syncPresenter,1000);const initial=parseInt(location.hash.slice(1),10)-1;at=Number.isFinite(initial)?Math.max(0,Math.min(slides.length-1,initial)):0;render();resize();
})();
