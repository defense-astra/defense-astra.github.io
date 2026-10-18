/* CAN report presentation — deterministic synthetic data, no external requests. */
(function () {
  'use strict';
  const STEPS = [
    ['필요한 채널 선택', '분석할 신호만 고르기'],
    ['시간축과 단위 맞추기', '같은 기준으로 비교하기'],
    ['조건에 맞는 구간 추출', '필요한 구간만 골라내기'],
    ['그래프·표·보고서 만들기', '반복 작업을 한 번에']
  ];
  const SAMPLE_INTERVAL = 1;
  const THRESHOLD = 40;
  const samples = Array.from({ length: 121 }, (_, t) => {
    const baseSpeed = t < 40 ? 10 + 1.1 * t : t <= 70 ? 54 + 3 * Math.sin((t - 40) * Math.PI / 30) : 54 - .75 * (t - 70);
    const speed = +(baseSpeed + .6 * Math.sin(t * .4)).toFixed(2);
    const rpm = Math.round(820 + 24 * speed + 95 * Math.sin(t / 7) + 20 * Math.sin(t * 1.7));
    const temperature = +(82 + .055 * t + .45 * Math.sin(t / 16)).toFixed(2);
    return Object.freeze({ t, rpm, speed, temperature, rawRpmTimeMs: t * 1000, rawSpeedMps: speed / 3.6 });
  });
  const selected = samples.filter(d => d.speed >= THRESHOLD);
  const first = selected[0], last = selected[selected.length - 1];
  const maxPoint = selected.reduce((a, b) => a.rpm >= b.rpm ? a : b);
  const report = Object.freeze({
    synthetic: true, condition: '차속 ≥ 40 km/h', sampleIntervalSeconds: SAMPLE_INTERVAL,
    startSeconds: first.t, endSeconds: last.t, durationSeconds: last.t - first.t,
    sampleCount: selected.length, totalSampleCount: samples.length,
    maxRpm: maxPoint.rpm, maxRpmTimeSeconds: maxPoint.t,
    meanRpm: selected.reduce((s, d) => s + d.rpm, 0) / selected.length,
    maxCoolantTemperatureC: Math.max(...selected.map(d => d.temperature)),
    minSpeedKmh: Math.min(...selected.map(d => d.speed)),
    maxSpeedKmh: Math.max(...selected.map(d => d.speed))
  });
  const number = (n, decimals) => n.toLocaleString('ko-KR', { minimumFractionDigits: decimals || 0, maximumFractionDigits: decimals || 0 });
  const iconCheck = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
  const iconFile = '<svg viewBox="0 0 36 42" aria-hidden="true"><path d="M5 2h17l9 9v29H5zM22 2v10h9M11 21h14M11 28h14"/></svg>';
  function chart(data, key, settings) {
    const cfg = Object.assign({ width: 1030, height: 262, min: 0, max: 60, color: '#0B1724', label: '', unit: '', selection: false, report: false, showX: true }, settings);
    const w = cfg.width, h = cfg.height;
    const p = { left: 74, right: 30, top: cfg.report ? 42 : 32, bottom: cfg.showX ? 42 : 17 };
    const innerW = w - p.left - p.right, innerH = h - p.top - p.bottom;
    const t0 = data[0].t, t1 = data[data.length - 1].t;
    const x = t => p.left + (t - t0) / (t1 - t0) * innerW;
    const y = v => p.top + (cfg.max - v) / (cfg.max - cfg.min) * innerH;
    const points = data.map((d, i) => `${i ? 'L' : 'M'}${x(d.t).toFixed(2)},${y(d[key]).toFixed(2)}`).join(' ');
    let markup = `<svg class="cr-chart ${cfg.report ? 'cr-report-chart' : ''}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${cfg.label}, ${t0}초에서 ${t1}초, 단위 ${cfg.unit}">`;
    if (cfg.selection) {
      markup += `<rect class="cr-selection-area" x="${x(Math.max(t0, first.t))}" y="${p.top}" width="${x(Math.min(t1, last.t)) - x(Math.max(t0, first.t))}" height="${innerH}" fill="#D7F85B" opacity=".55"/>`;
    }
    for (let j = 0; j <= 2; j++) {
      const value = cfg.min + (cfg.max - cfg.min) * j / 2, yy = y(value);
      markup += `<path d="M${p.left} ${yy}H${w - p.right}" stroke="#BCC4C4" stroke-width="1"/><text x="${p.left - 12}" y="${yy + 7}" text-anchor="end" class="cr-tick">${number(value, cfg.max <= 10 ? 1 : 0)}</text>`;
    }
    markup += `<text x="${p.left}" y="20" class="cr-chart-label">${cfg.label} <tspan class="cr-chart-unit">(${cfg.unit})</tspan></text>`;
    if (cfg.showX) {
      const ticks = cfg.report ? [t0, Math.round((t0 + t1) / 2), t1] : [0, 30, 60, 90, 120];
      ticks.forEach(t => { markup += `<text x="${x(t)}" y="${h - 9}" text-anchor="middle" class="cr-tick">${t}</text>`; });
      markup += `<text x="${w - 2}" y="${h - 9}" text-anchor="end" class="cr-tick">초</text>`;
    }
    if (cfg.threshold != null) {
      markup += `<path d="M${p.left} ${y(cfg.threshold)}H${w - p.right}" stroke="#51740A" stroke-width="2" stroke-dasharray="7 6"/><text x="${w - p.right - 8}" y="${y(cfg.threshold) - 10}" text-anchor="end" class="cr-condition-line">조건 기준 ${cfg.threshold} ${cfg.unit}</text>`;
    }
    markup += `<path class="cr-signal" pathLength="1" d="${points}" fill="none" stroke="${cfg.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (cfg.report) {
      const avgY = y(report.meanRpm);
      markup += `<path d="M${p.left} ${avgY}H${w - p.right}" stroke="#328C87" stroke-width="2" stroke-dasharray="7 7"/><text x="${w - p.right - 5}" y="${avgY + 25}" text-anchor="end" class="cr-average-label">구간 평균 ${number(report.meanRpm)} rpm</text>`;
      markup += `<circle class="cr-peak" cx="${x(maxPoint.t)}" cy="${y(maxPoint.rpm)}" r="7" fill="#0B1724" stroke="#D7F85B" stroke-width="4"/><text x="${x(maxPoint.t)}" y="${y(maxPoint.rpm) - 15}" text-anchor="middle" class="cr-peak-label">최댓값 ${number(maxPoint.rpm)}</text>`;
    }
    return markup + '</svg>';
  }
  function stepOne() {
    const channels = [['엔진 회전수', 'rpm', '속도 변화에 따른 회전수'], ['차속', 'km/h', '분석 구간을 고르는 기준'], ['냉각수 온도', '°C', '같은 구간의 온도 확인']];
    return `<div class="cr-select-layout"><div class="cr-channels"><div class="cr-panel-label">분석에 사용할 신호</div>${channels.map((c, i) => `<div class="cr-channel cr-stagger-${i}"><span class="cr-checkbox">${iconCheck}</span><div><b>${c[0]} <small>${c[1]}</small></b><p>${c[2]}</p></div></div>`).join('')}<div class="cr-log-count"><b>${samples.length}</b>개 샘플 <span>0–120초 · 1초 간격</span></div></div><div class="cr-channel-traces">${chart(samples, 'rpm', { width: 1010, height: 126, min: 600, max: 2600, label: '엔진 회전수', unit: 'rpm', showX: false })}${chart(samples, 'speed', { width: 1010, height: 126, min: 0, max: 60, color: '#168E8A', label: '차속', unit: 'km/h', showX: false })}${chart(samples, 'temperature', { width: 1010, height: 144, min: 80, max: 90, color: '#6B7D18', label: '냉각수 온도', unit: '°C' })}</div></div>`;
  }
  function stepTwo() {
    return `<div class="cr-align-layout"><div class="cr-conversions"><div><span class="cr-conversion-before">엔진 시간 <b>60,000 ms</b></span><span class="cr-conversion-arrow">→</span><span class="cr-conversion-after">공통 시간 <b>60 s</b></span></div><div><span class="cr-conversion-before">차속 원자료 <b>${number(samples[60].rawSpeedMps, 2)} m/s</b></span><span class="cr-conversion-arrow">→</span><span class="cr-conversion-after">표시 단위 <b>${number(samples[60].speed, 1)} km/h</b></span></div></div><div class="cr-aligned-chart">${chart(samples, 'rpm', { width: 1310, height: 245, min: 600, max: 2600, label: '엔진 회전수', unit: 'rpm' })}<div class="cr-sync-marker"><i></i><b>60초</b><span>세 신호가 같은 시점을 가리킵니다</span></div></div></div>`;
  }
  function stepThree() {
    return `<div class="cr-extract-layout"><div class="cr-condition"><span>추출 조건</span><strong>차속 <em>40</em> km/h 이상</strong><div><b>${first.t}–${last.t}초</b><span>${report.durationSeconds}초 구간 · ${selected.length}개 샘플</span></div></div>${chart(samples, 'speed', { width: 1360, height: 300, min: 0, max: 60, color: '#168E8A', label: '차속', unit: 'km/h', selection: true, threshold: THRESHOLD })}<div class="cr-extract-caption"><span class="cr-lime-dot"></span>이 구간의 엔진 회전수와 냉각수 온도를 함께 추출합니다</div></div>`;
  }
  function stepFour() {
    return `<div class="cr-report-paper"><div class="cr-document-heading"><div class="cr-file-mark">${iconFile}</div><div><span>주행 데이터 분석</span><h3>조건 구간 분석 보고서</h3></div><div class="cr-document-meta">차속 40 km/h 이상<br><b>${first.t}–${last.t}초 · ${report.durationSeconds}초 · ${selected.length}개 샘플</b></div></div><div class="cr-report-content"><div class="cr-report-plot">${chart(selected, 'rpm', { width: 980, height: 230, min: 1600, max: 2400, label: '엔진 회전수', unit: 'rpm', color: '#0B1724', report: true })}<p>분석 조건과 추출 구간이 그래프·수치에 함께 반영됩니다.</p></div><dl class="cr-report-numbers"><div><dt>엔진 회전수 최댓값</dt><dd>${number(report.maxRpm)} <small>rpm</small></dd></div><div><dt>엔진 회전수 평균</dt><dd>${number(report.meanRpm)} <small>rpm</small></dd></div><div><dt>냉각수 온도 최댓값</dt><dd>${number(report.maxCoolantTemperatureC, 1)} <small>°C</small></dd></div></dl></div></div>`;
  }
  const builders = [stepOne, stepTwo, stepThree, stepFour];
  function mount(container, options) {
    if (!container || typeof container.appendChild !== 'function') throw new TypeError('CANReport.mount에는 DOM 요소가 필요합니다.');
    const opts = options || {};
    let step = 0, playing = false, timer = null, destroyed = false;
    const root = document.createElement('section');
    root.className = 'can-report';
    root.setAttribute('aria-label', '합성 CAN 데이터로 보고서를 만드는 4단계 설명');
    root.innerHTML = `<div class="cr-progress" aria-label="진행 단계">${STEPS.map((s, i) => `<button class="cr-progress-step" type="button" data-cr-go="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${s[0]}</button>`).join('')}</div><div class="cr-body" aria-live="polite"></div><div class="cr-footer"><p>설명용 합성 데이터 · 실제 회사 로그가 아닙니다</p><div class="cr-controls"><button type="button" data-cr="prev" aria-label="이전 단계">← 이전</button><button type="button" data-cr="next" aria-label="다음 단계">다음 →</button><button type="button" data-cr="play">자동 재생</button></div></div>`;
    container.appendChild(root);
    const body = root.querySelector('.cr-body');
    function paint() {
      if (destroyed) return;
      root.dataset.step = String(step);
      root.querySelectorAll('[data-cr-go]').forEach((b, i) => {
        b.classList.toggle('is-active', i === step); b.classList.toggle('is-done', i < step);
        b.setAttribute('aria-current', i === step ? 'step' : 'false');
      });
      body.innerHTML = builders[step]();
      root.querySelector('[data-cr="prev"]').disabled = step === 0;
      root.querySelector('[data-cr="next"]').disabled = step === STEPS.length - 1;
      updatePlayLabel();
    }
    function updatePlayLabel() {
      if (destroyed) return;
      const b = root.querySelector('[data-cr="play"]');
      b.textContent = playing ? '일시 정지' : step === STEPS.length - 1 ? '처음부터 재생' : '자동 재생';
      b.classList.toggle('is-playing', playing); b.setAttribute('aria-pressed', String(playing));
    }
    function pause() { clearInterval(timer); timer = null; playing = false; updatePlayLabel(); }
    function go(n, manual) {
      if (destroyed) return;
      if (manual !== false) pause();
      step = Math.max(0, Math.min(STEPS.length - 1, n)); paint();
    }
    function play() {
      if (destroyed || playing) return;
      if (step === STEPS.length - 1) go(0, false);
      playing = true; updatePlayLabel();
      timer = setInterval(() => { if (step < STEPS.length - 1) go(step + 1, false); if (step === STEPS.length - 1) pause(); }, opts.intervalMs || 6500);
    }
    function click(e) {
      const button = e.target.closest('button'); if (!button || !root.contains(button)) return;
      if (button.dataset.crGo != null) go(Number(button.dataset.crGo));
      else if (button.dataset.cr === 'prev') go(step - 1);
      else if (button.dataset.cr === 'next') go(step + 1);
      else if (button.dataset.cr === 'play') playing ? pause() : play();
    }
    root.addEventListener('click', click);
    const api = {
      next: () => go(step + 1), prev: () => go(step - 1), play, pause,
      reset: () => go(0),
      destroy: () => { if (destroyed) return; pause(); destroyed = true; root.removeEventListener('click', click); root.remove(); },
      getState: () => ({ step, stepNumber: step + 1, stepTitle: STEPS[step][0], playing, destroyed, dataKind: 'deterministic synthetic', report: Object.assign({}, report) })
    };
    paint(); if (opts.autoStart) play(); return api;
  }
  window.CANReport = Object.freeze({ mount });
})();
