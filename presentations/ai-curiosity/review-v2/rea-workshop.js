(function (global) {
  'use strict';
  const SCENES = {
    bridge: {
      captions: ['프로그램을 분석하는 도구는 이미 있었습니다.', 'REA가 AI와 분석 도구를 연결합니다.', 'AI의 질문이 도구 호출로 전달됩니다.', '도구에서 확인한 내용으로 다음 질문을 이어갑니다.'],
      labels: ['분석 도구', '연결', '질문 전달', '근거 확인']
    },
    context: {
      captions: ['프로그램 전체를 한 번에 읽을 필요는 없습니다.', '지금 궁금한 함수부터 꺼내 봅니다.', '관련된 호출 관계를 따라갑니다.', '필요한 부분을 모아 맥락을 이해합니다.'],
      labels: ['전체 프로그램', '함수 선택', '연결 추적', '범위 좁히기']
    },
    session: {
      captions: ['처음 열 때는 분석을 준비합니다.', '한 번 연 분석 상태를 유지합니다.', '다음 질문도 같은 분석에서 이어갑니다.', '기억을 이어가며 더 구체적으로 묻습니다.'],
      labels: ['처음 분석', '준비 완료', '다음 질문', '계속 분석']
    },
    tools: {
      captions: ['AI가 쓸 수 있는 작업을 도구로 연결합니다.', '함수를 읽고, 역할을 확인합니다.', '누가 이 함수를 부르는지 찾습니다.', '알아낸 역할에 맞게 이름을 붙입니다.'],
      labels: ['도구 준비', '함수 보기', '호출 관계', '이름 붙이기']
    },
    receipt: {
      captions: ['답만 받는 게 아니라, 근거도 함께 받습니다.', '어떤 대상을 어떤 도구로 봤는지 남깁니다.', '확인한 내용과 아직 모르는 내용을 구분합니다.', '설명에 근거를 연결해 다시 확인할 수 있습니다.'],
      labels: ['분석 결과', '대상·도구', '확인·한계', '근거 연결']
    },
    dynamic: {
      captions: ['코드에서 읽은 내용은 실제 동작과 맞을까요?', '설명용 입력값 7을 넣어 봅니다.', '코드에서 예상한 값과 실행 결과를 비교합니다.', '이 입력에서는 일치. 다른 조건도 확인해야 합니다.'],
      labels: ['코드 확인', '실행 관찰', '결과 비교', '범위 확인']
    }
  };
  function route(extra) {
    return '<svg class="rw-route ' + (extra || '') + '" viewBox="0 0 1456 505" aria-hidden="true"><path class="rw-route-shadow" d="M 358 326 C 510 326, 445 218, 658 218 S 962 218, 1153 326"/><path class="rw-route-line" d="M 358 326 C 510 326, 445 218, 658 218 S 962 218, 1153 326"/><circle cx="358" cy="326" r="8"/><circle cx="1153" cy="326" r="8"/></svg>';
  }
  function fileLines(n) {
    return Array.from({length:n}, (_,i) => '<i style="width:' + [81,64,91,56,72,87,59,78][i%8] + '%"></i>').join('');
  }
  const question = (text,cls) => '<div class="rw-question '+(cls||'')+'">'+text+'</div>';
  function sceneMarkup(scene, step) {
    if (scene === 'bridge') {
      const prompts = ['이 함수는 무슨 일을 할까?','이 함수는 무슨 일을 할까?','함수 내용을 보여 주세요.','이 함수를 어디에서 부를까?'];
      return route() + '<div class="rw-bridge-hub"><b>REA</b><span>연결 도구</span></div>' +
        question(step === 0 ? '이 함수는 무슨 일을 할까?' : prompts[step], step===2?'rw-send':step===3?'rw-reply':'') +
        (step>=2 ? '<div class="rw-result rw-appear"><span>도구에서 확인</span><strong>입력값을 2배로 반환</strong></div>':'') +
        '<div class="rw-machine-tag">Ghidra</div><div class="rw-ai-tag">AI</div>';
    }
    if (scene === 'context') {
      return route('rw-context-route') + '<div class="rw-paper-stack"><div class="rw-sheet rw-back-sheet"></div><div class="rw-sheet rw-mid-sheet"></div><div class="rw-sheet rw-front-sheet"><div class="rw-paper-label">프로그램</div><div class="rw-code-lines">'+fileLines(10)+'</div><div class="rw-function-outline"></div></div></div>'+
        '<div class="rw-function-piece"><span>선택한 함수</span><strong>adjust( )</strong><div class="rw-mini-code-lines">'+fileLines(3)+'</div></div>'+
        (step>=2?'<div class="rw-call-chain rw-appear"><span>이 함수를 부르는 곳</span><div><b>화면 입력</b><i>→</i><b>adjust( )</b></div></div>':'')+
        '<div class="rw-machine-tag">분석에 보관</div><div class="rw-ai-tag">필요한 부분 확인</div>';
    }
    if (scene === 'session') {
      return route()+'<div class="rw-session-indicator"><i></i><div><b>'+(step===0?'분석 준비 중':'분석 유지')+'</b><span>'+(step===0?'처음 한 번 대상 열기':'같은 연결에서 계속 확인')+'</span></div></div>'+
        '<div class="rw-session-battery" aria-hidden="true">'+Array.from({length:5},(_,i)=>'<i style="--i:'+i+'"></i>').join('')+'</div>'+
        question(['파일을 열어 주세요.','이 함수는 무슨 일을 하나요?','이 값은 어디에서 오나요?','그러면 누가 이 함수를 부르나요?'][step],step>=2?'rw-send':'')+
        '<div class="rw-machine-tag">Ghidra</div><div class="rw-ai-tag">AI</div>'+
        (step===3?'<div class="rw-session-trail rw-appear">처음 질문에서 다음 질문으로</div>':'');
    }
    if (scene === 'tools') {
      const names=['함수 보기','호출 관계','이름 붙이기'],ids=['analyze_function','xrefs','set_addresses_names'];
      return route()+'<div class="rw-console"><div class="rw-console-top"><span>REA</span><i></i><i></i><i></i></div>'+names.map((n,i)=>'<div class="rw-tool-row '+(step===i+1?'rw-tool-active':'')+'"><div><b>'+n+'</b><code>'+ids[i]+'</code></div><span class="rw-tool-knob">'+(step===i+1?'✓':'')+'</span></div>').join('')+'</div>'+
        (step ? '<div class="rw-tool-output rw-appear">'+['','adjust( ) → 입력값 × 2','화면 입력 → adjust( )','FUN_001 → adjust'][step]+'</div>':'')+
        '<div class="rw-machine-tag">분석 도구</div><div class="rw-ai-tag">AI가 호출</div>';
    }
    if (scene === 'receipt') {
      return '<div class="rw-receipt-paper"><div class="rw-receipt-heading"><b>분석 근거</b><span>설명용 근거 A</span></div><div class="rw-receipt-row '+(step>=1?'rw-known':'')+'"><span>대상</span><b>'+(step>=1?'adjust 함수':'—')+'</b></div><div class="rw-receipt-row '+(step>=1?'rw-known':'')+'"><span>도구</span><b>'+(step>=1?'analyze_function':'—')+'</b></div><div class="rw-receipt-row '+(step>=2?'rw-known':'')+'"><span>확인 내용</span><b>'+(step>=2?'입력값을 2배로 반환':'—')+'</b></div><div class="rw-receipt-row rw-receipt-question '+(step>=2?'rw-known':'')+'"><span>남은 의문</span><b>'+(step>=2?'예외 입력은 미확인':'—')+'</b></div></div>'+
        (step===3?'<div class="rw-claim rw-appear">“입력값을 두 배로 만든다”<span>↳ 설명용 근거 A</span></div>':'')+
        '<div class="rw-machine-tag">확인한 기록</div><div class="rw-ai-tag">근거를 다시 확인</div>';
    }
    const val=step>=2?'14':'?';
    return '<div class="rw-dynamic-lab"><div class="rw-code-screen"><div class="rw-screen-label">코드에서 예상</div><code>adjust(x)<br><b>return 2 × x</b></code><div class="rw-answer">예상값 <strong>'+val+'</strong></div></div><div class="rw-runtime-screen"><div class="rw-screen-label">실행해서 관찰</div><div class="rw-input-line"><span>입력</span><b>'+(step>=1?'7':'—')+'</b><i>→</i><span>출력</span><b class="rw-live-output">'+(step>=2?'14':'—')+'</b></div><div class="rw-scope-label">설명용 계산 예시</div></div></div>'+
      (step>=1?'<div class="rw-input-token '+(step===1?'rw-drop-input':'')+'">7</div>':'')+
      (step===3?'<div class="rw-compare-seal rw-appear"><b>14 = 14</b><span>이 입력에서는 일치</span></div>':'')+
      '<div class="rw-machine-tag">코드의 흔적</div><div class="rw-ai-tag">실제 동작과 대조</div>';
  }
  function mount(container, options) {
    if (!container || typeof container.appendChild !== 'function') throw new TypeError('REAWorkshop.mount requires a container element');
    options = options || {};
    const scene = SCENES[options.scene] ? options.scene : 'bridge';
    const model = SCENES[scene];
    const root = document.createElement('section');
    root.className='rw-workshop'; root.dataset.scene=scene; root.dataset.first='true'; root.dataset.motion='running'; root.setAttribute('aria-label','REA 원리 설명 애니메이션');
    const base = String(options.assetBase || 'assets/').replace(/\/?$/, '/');
    root.innerHTML='<div class="rw-world"><div class="rw-backlight"></div><div class="rw-floor"></div><img class="rw-machine" src="'+base+'rea-machine.webp" alt="열린 분석 기계를 표현한 일러스트"><img class="rw-researcher" src="'+base+'rea-researcher.webp" alt="분석하는 AI 연구자를 표현한 일러스트"><div class="rw-scene-body"></div><p class="rw-caption" aria-live="polite"></p></div><div class="rw-controls"><span class="rw-disclaimer">원리 설명용 애니메이션</span><div class="rw-progress" aria-label="진행 단계"></div><button type="button" class="rw-prev" aria-label="이전 단계">이전</button><button type="button" class="rw-play">재생</button><button type="button" class="rw-next">다음</button><button type="button" class="rw-reset" aria-label="처음 단계로">처음</button></div>';
    container.appendChild(root);
    const body=root.querySelector('.rw-scene-body'), caption=root.querySelector('.rw-caption'), progress=root.querySelector('.rw-progress');
    const prevButton=root.querySelector('.rw-prev'), playButton=root.querySelector('.rw-play'), nextButton=root.querySelector('.rw-next'), resetButton=root.querySelector('.rw-reset');
    let step=0, playing=false, timer=null, destroyed=false;
    function render() {
      if(destroyed) return;
      root.dataset.step=String(step);root.dataset.playing=String(playing);
      body.innerHTML=sceneMarkup(scene,step); caption.textContent=model.captions[step];
      progress.innerHTML=model.labels.map((l,i)=>'<span class="rw-progress-dot '+(i===step?'rw-current':i<step?'rw-complete':'')+'" aria-label="'+(i+1)+'. '+l+'"'+(i===step?' aria-current="step"':'')+'></span>').join('')+'<span class="rw-step-label">'+(step+1)+' / '+model.labels.length+' · '+model.labels[step]+'</span>';
      prevButton.disabled=step===0;nextButton.disabled=step===model.labels.length-1;playButton.textContent=playing?'일시정지':step===model.labels.length-1?'다시 재생':'재생';
      playButton.setAttribute('aria-pressed',String(playing));
    }
    function clearTimer(){ if(timer!==null){global.clearTimeout(timer);timer=null;} }
    function schedule(){clearTimer();if(playing&&!destroyed)timer=global.setTimeout(function(){timer=null;if(step<model.labels.length-1){step++;render();schedule();}else{pause();}},options.intervalMs||4800);}
    function next(){if(destroyed)return;root.dataset.first='false';root.dataset.motion='running';clearTimer();step=Math.min(step+1,model.labels.length-1);if(step===model.labels.length-1)playing=false;render();schedule();return getState();}
    function prev(){if(destroyed)return;root.dataset.first='false';root.dataset.motion='running';clearTimer();step=Math.max(step-1,0);render();schedule();return getState();}
    function play(){if(destroyed)return;if(step===model.labels.length-1)step=0;root.dataset.first='false';root.dataset.motion='running';playing=true;render();schedule();return getState();}
    function pause(){if(destroyed)return;playing=false;clearTimer();root.dataset.playing='false';root.dataset.motion='paused';playButton.textContent=step===model.labels.length-1?'다시 재생':'재생';playButton.setAttribute('aria-pressed','false');return getState();}
    function reset(){if(destroyed)return;playing=false;step=0;clearTimer();root.dataset.first='true';root.dataset.motion='running';render();return getState();}
    function destroy(){if(destroyed)return;clearTimer();destroyed=true;playing=false;root.remove();}
    function getState(){return {scene:scene,step:step,stepCount:model.labels.length,playing:playing,destroyed:destroyed,label:model.labels[step]};}
    prevButton.addEventListener('click',prev);nextButton.addEventListener('click',next);resetButton.addEventListener('click',reset);playButton.addEventListener('click',function(){playing?pause():play();});
    render();if(options.autoStart)play();
    return {next:next,prev:prev,play:play,pause:pause,reset:reset,destroy:destroy,getState:getState};
  }
  global.REAWorkshop={mount:mount,scenes:Object.keys(SCENES),version:'2.0.0'};
})(window);
