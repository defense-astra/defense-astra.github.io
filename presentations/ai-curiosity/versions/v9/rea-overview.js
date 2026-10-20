(function (global) {
  'use strict';
  // Static explanation. No timer, media, state, or keyboard handler is needed.
  function render() {
    return `<section class="rea-overview" aria-label="REA의 뜻과 질문부터 근거 확인까지의 흐름">
      <div class="ro-definition">
        <div class="ro-name"><strong>Reverse Engineer Anything</strong><span>프로그램을 살펴보고, 작동 원리를 알아내는 일</span></div>
        <p>AI가 <b>분석 도구를 사용하도록</b><br>연결해 주는 도구입니다.</p>
      </div>
      <div class="ro-map">
        <svg class="ro-connections" viewBox="0 0 1456 440" aria-hidden="true" focusable="false">
          <defs><marker id="ro-arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M2 2L10 6L2 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></marker></defs>
          <g class="ro-forward" fill="none" stroke="currentColor" stroke-width="2.5" marker-end="url(#ro-arrow)">
            <path d="M300 226H357"/><path d="M670 226H717"/><path d="M950 226H987"/>
            <path d="M1178 87V121"/>
          </g>
          <g class="ro-feedback" fill="none" stroke="currentColor" stroke-width="2.2" marker-end="url(#ro-arrow)">
            <path d="M1178 315V352Q1178 367 1163 367H860Q845 367 845 352V327"/>
            <path d="M795 315V392Q795 407 780 407H610Q595 407 595 392V327"/>
            <path d="M445 315V410Q445 425 430 425H165Q150 425 150 410V327"/>
          </g>
        </svg>
        <div class="ro-program"><span class="ro-file" aria-hidden="true"><i></i><i></i><i></i></span><div><strong>분석할 프로그램</strong><span>실행 파일 · 앱 등</span></div><small>도구에서 열기</small></div>
        <div class="ro-card ro-question"><p class="ro-role"><span>01</span> 사람의 질문</p><h2>이 버튼을 누르면<br>어떤 계산을 하나요?</h2><p class="ro-detail">궁금한 기능 하나부터</p></div>
        <div class="ro-card ro-agent"><p class="ro-role"><span>02</span> AI</p><h2>필요한 조회를<br>선택합니다</h2><p class="ro-detail">어떤 함수? 어떤 값?</p></div>
        <div class="ro-card ro-bridge"><p class="ro-role"><span>03</span> 호출을 연결</p><h2>REA</h2><p class="ro-detail">AI ↔ 분석 도구</p></div>
        <div class="ro-card ro-tool"><p class="ro-role">프로그램 분석 도구</p><h2>코드와 연결 관계를<br>살펴봅니다</h2><p class="ro-detail">Ghidra · Hopper · IDA 등</p></div>
        <p class="ro-return-label"><span>04</span> 근거 반환</p>
        <p class="ro-evidence-label">코드 · 위치 · 확인한 범위</p>
        <p class="ro-review-label"><span>05</span> 함께 확인하고<br><b>다음 질문으로</b></p>
      </div>
      <p class="ro-takeaway">AI가 근거를 해석하고, <strong>실제 실행 결과와 맞는지 확인</strong>합니다.</p>
    </section>`;
  }
  global.REAOverview = Object.freeze({ render: render, version: '1.0.0' });
})(window);
