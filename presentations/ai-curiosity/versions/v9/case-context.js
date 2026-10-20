(function (global) {
  'use strict';

  // Static teaching layouts. The host owns the title, footer, and navigation.
  function inputKeys(operator) {
    return '<span class="cc-input">' + ['200', operator, '10', '%', '='].map(function (key) {
      return '<span class="cc-key">' + key + '</span>';
    }).join('') + '</span>';
  }

  function renderCalculator() {
    return `<section class="case-context cc-calculator" aria-label="Windows 계산기 퍼센트 기능의 공개 사례와 설명용 재구현 비교">
      <p class="cc-intro">같은 <strong>10%</strong>라도, 앞에서 선택한 연산자에 따라 계산 방식이 달라집니다.</p>
      <table class="cc-table cc-calculator-table">
        <colgroup><col class="cc-input-col"><col class="cc-rule-col"><col class="cc-result-col"></colgroup>
        <thead><tr><th scope="col">같은 버튼 입력</th><th scope="col">원본 규칙 · 공개 사례</th><th scope="col">같은 규칙으로 재구현</th></tr></thead>
        <tbody>
          <tr>
            <th scope="row"><span class="cc-row-label">더하기 뒤의 %</span>${inputKeys('+')}</th>
            <td><p class="cc-rule">200의 10%인 <strong>20</strong>을 더합니다</p><p class="cc-equation">200 + 20 = <b>220</b></p></td>
            <td><div class="cc-result"><strong>220</strong><span>200 + (200 × 10 ÷ 100)</span></div></td>
          </tr>
          <tr>
            <th scope="row"><span class="cc-row-label">곱하기 뒤의 %</span>${inputKeys('×')}</th>
            <td><p class="cc-rule">10%를 <strong>0.1</strong>로 바꿔 곱합니다</p><p class="cc-equation">200 × 0.1 = <b>20</b></p></td>
            <td><div class="cc-result"><strong>20</strong><span>200 × (10 ÷ 100)</span></div></td>
          </tr>
        </tbody>
      </table>
      <p class="cc-takeaway"><span>REA로 살펴볼 것</span><strong>% 버튼 안에서 두 계산 규칙이 어떻게 나뉘는가</strong></p>
      <p class="cc-disclosure">공개 분석 결과를 풀어 쓴 동작 비교 <span>·</span> 원본 앱의 실행 화면이 아닌 설명용 재구현입니다.</p>
    </section>`;
  }

  function renderBridge() {
    return `<section class="case-context cc-bridge" aria-label="익숙한 작업을 독립적으로 구현한 세 공개 프로그램">
      <p class="cc-intro">다음 세 사례는 익숙한 프로그램의 작업을 <strong>독립적으로 구현한 공개 프로젝트</strong>입니다.</p>
      <table class="cc-table cc-bridge-table">
        <colgroup><col class="cc-familiar-col"><col class="cc-project-col"><col class="cc-task-col"></colgroup>
        <thead><tr><th scope="col">익숙한 프로그램</th><th scope="col">독립 구현 프로젝트</th><th scope="col">살펴볼 작업</th></tr></thead>
        <tbody>
          <tr>
            <th scope="row"><span class="cc-original">Photoshop</span><span class="cc-category">사진 · 레이어</span></th>
            <td><span class="cc-project"><span class="cc-arrow" aria-hidden="true">→</span>PhotoCraft</span></td>
            <td><strong class="cc-task">사진을 열고, 레이어를 나눠 편집하기</strong><span class="cc-task-detail">이미지 편집과 레이어 작업</span></td>
          </tr>
          <tr>
            <th scope="row"><span class="cc-original">AutoCAD</span><span class="cc-category">2D 도면</span></th>
            <td><span class="cc-project"><span class="cc-arrow" aria-hidden="true">→</span>CADCraft</span></td>
            <td><strong class="cc-task">선과 원으로 부품을 그리고 치수 넣기</strong><span class="cc-task-detail">브래킷 도면과 도면 파일</span></td>
          </tr>
          <tr>
            <th scope="row"><span class="cc-original">Excel</span><span class="cc-category">수식 · 표</span></th>
            <td><span class="cc-project"><span class="cc-arrow" aria-hidden="true">→</span>GridCraft</span></td>
            <td><strong class="cc-task">표에 수식을 넣고 합계 계산하기</strong><span class="cc-task-detail">셀 입력과 계산 결과</span></td>
          </tr>
        </tbody>
      </table>
      <p class="cc-disclosure">세 프로젝트가 REA를 사용해 만들어졌는지는 확인되지 않았습니다.</p>
    </section>`;
  }

  global.CaseContext = Object.freeze({
    renderCalculator: renderCalculator,
    renderBridge: renderBridge,
    version: '1.0.0'
  });
})(window);
