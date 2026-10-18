/*
 * DampingScene — original, deterministic explanatory animation.
 * It is NOT a vehicle simulation, controller, or biological neural model.
 * No third-party code/assets. API documentation: README-damping.md.
 */
(function (global) {
  'use strict';

  const W = 1600, H = 660;
  const C = {
    bg: '#0B1724', lime: '#D7F85B', cyan: '#8EE5CC',
    ink: '#edf5f4', muted: '#9aadb8', line: '#294250'
  };
  const TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const mix = (a, b, u) => a + (b - a) * u;
  const rgba = (s, a) => `rgba(${s},${clamp(a)})`;
  const wrap = (x, p) => ((x + p / 2) % p + p) % p - p / 2;

  function terrain(w) {
    // Arbitrary drawing coordinates, not physical length or measured terrain.
    const k = wrap(w - 650, 1480);
    const q = wrap(w - 1040, 1480);
    return 487 + 11 * Math.sin(w * .008) + 7 * Math.sin(w * .021 + .8)
      + 2.5 * Math.sin(w * .063) - 31 * Math.exp(-Math.pow(k / 77, 2))
      + 17 * Math.exp(-Math.pow(q / 110, 2));
  }
  const slope = w => (terrain(w + 2) - terrain(w - 2)) / 4;

  function graphNodes() {
    const nodes = [];
    // Two deliberately synthetic, irregular lobes. No anatomical mapping.
    for (let side = 0; side < 2; side++) {
      for (let i = 0; i < 87; i++) {
        const a = i * 2.399963229728653;
        const r = Math.sqrt((i + .45) / 87);
        const shape = 1 + .08 * Math.sin(3 * a) + .035 * Math.cos(7 * a);
        nodes.push({
          x: (side ? 1374 : 1175) + Math.cos(a) * 110 * r * shape,
          y: 318 + Math.sin(a) * 146 * r * shape,
          side, seed: i, phase: ((i * 17) % 83) / 83
        });
      }
    }
    // Visible midline links are arbitrary illustration connections.
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      const nearest = nodes.map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
        .filter(v => v.j !== i).sort((a, b) => a.d - b.d).slice(0, 3);
      for (const n of nearest) if (i < n.j) edges.push([i, n.j]);
      if (i < 87 && i % 9 === 0) edges.push([i, 87 + (i * 13) % 87]);
    }
    return { nodes, edges };
  }

  function mount(canvas, options = {}) {
    if (!canvas || typeof canvas.getContext !== 'function') throw new Error('DampingScene.mount requires a canvas.');
    if (canvas.__dampingScene) canvas.__dampingScene.destroy();
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is unavailable.');
    canvas.width = W; canvas.height = H;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '개념 설명용 애니메이션. 일반화한 8×8 차량의 바퀴와 스프링이 노면에 따라 움직이고, 같은 노면 변화에서 만든 설명용 신호가 합성 연결망의 발광에 연결됩니다. 실제 신경 활동이나 차량 성능이 아닙니다.');
    const graph = graphNodes();
    let running = false, destroyed = false, t = 0, lastStamp = null, raf = 0, lastSignalCall = -1;

    function text(txt, x, y, size = 20, color = C.ink, weight = 400, align = 'left') {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px "Deck", "Noto Sans KR", "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
      ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(txt, x, y);
    }
    function path(points, stroke, width = 1.5, fill = null, close = false) {
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      if (close) ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
    }
    function circle(x, y, r, fill, stroke, width = 1) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
    }
    function glow(x, y, r, rgb, opacity) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(rgb, opacity)); g.addColorStop(1, rgba(rgb, 0));
      circle(x, y, r, g);
    }
    function arrow(x, y, angle, color, size = 6) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      path([[-size, -size * .65], [0, 0], [-size, size * .65]], color, 1.6);
      ctx.restore();
    }
    function dotOnCurve(points, u, color, size = 4) {
      // Cubic Bezier, used for a visual signal on a single consistent path.
      const v = 1 - u;
      const x = v*v*v*points[0][0] + 3*v*v*u*points[1][0] + 3*v*u*u*points[2][0] + u*u*u*points[3][0];
      const y = v*v*v*points[0][1] + 3*v*v*u*points[1][1] + 3*v*u*u*points[2][1] + u*u*u*points[3][1];
      circle(x, y, size, color);
    }
    function bezier(points, color, width = 1.5) {
      ctx.beginPath(); ctx.moveTo(...points[0]); ctx.bezierCurveTo(...points[1], ...points[2], ...points[3]);
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
    }

    function frame(time) {
      // The offset lets the featured bump enter from the front, then pass
      // each wheel. It changes only presentation timing, not any physics.
      const world = time * 69 + 1122;
      const xs = [268, 433, 610, 782];
      const ys = xs.map(x => terrain(world + x) - 46);
      const strengths = xs.map(x => clamp(Math.abs(slope(world + x)) * 2.45));
      const lookX = 925, lookY = terrain(world + lookX);
      const preview = clamp(Math.abs(slope(world + lookX)) * 2.45);
      const activity = clamp(strengths.reduce((a, b) => a + b, 0) / 4 * 1.28);
      const bumpX = ((650 - world) % 1480 + 1480) % 1480;
      const focusIndex = xs.reduce((best, x, i) => Math.abs(x - bumpX) < Math.abs(xs[best] - bumpX) ? i : best, 0);
      const focus = xs.map(x => Math.exp(-Math.pow((x - bumpX) / 92, 2)));
      const focusStrength = focus[focusIndex];
      // A repeating narrative, not a measured causal delay or control cycle.
      const nearFront = bumpX > 835 && bumpX < 1060;
      const nearWheel = bumpX >= 208 && bumpX <= 835;
      const phase = nearFront ? 0 : nearWheel ? (Math.abs(xs[focusIndex] - bumpX) > 32 ? 1 : 2) : 3;
      const meanY = ys.reduce((a, b) => a + b, 0) / 4;
      const bodyY = 305 + (meanY - 441) * .52;
      const pitch = clamp((ys[3] - ys[0]) / (xs[3] - xs[0]) * .38, -.028, .028);
      const bodyP = (x, y) => {
        const dx = x - 527, dy = y - 305;
        return [527 + dx * Math.cos(pitch) - dy * Math.sin(pitch), bodyY + dx * Math.sin(pitch) + dy * Math.cos(pitch)];
      };

      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

      // Restrained atmosphere; a diagram, not a tactical or performance scene.
      const atmosphere = ctx.createRadialGradient(540, 280, 20, 540, 280, 520);
      atmosphere.addColorStop(0, '#152c3b'); atmosphere.addColorStop(1, C.bg);
      ctx.fillStyle = atmosphere; ctx.fillRect(0, 0, 1020, 565);
      text('요철을 만나면', 62, 65, 31, C.ink, 600);
      text('이 변화에 맞춰 댐퍼를 조절한다면?', 1052, 65, 25, C.ink, 600);
      text('카메라로 보고, 바퀴와 댐퍼가 반응', 64, 100, 19, C.muted);
      text('노면 변화에 따라 켜지는 설명용 신호', 1054, 100, 18, C.muted);

      // Terrain is a closed continuous path and remains deterministic at seek.
      const ground = [];
      for (let x = 0; x <= 1015; x += 3) ground.push([x, terrain(world + x)]);
      path([[0, 563], ...ground, [1015, 563]], null, 1, '#162d39', true);
      path(ground, '#6b8c91', 2.6);
      // Highlight the same visible terrain feature as it approaches each axle.
      if (bumpX < 1060) {
        const feature = [];
        for (let x = Math.max(0, bumpX - 67); x <= Math.min(1015, bumpX + 67); x += 3) feature.push([x, terrain(world + x)]);
        path(feature, C.cyan, 5);
        glow(bumpX, terrain(world + bumpX), 66, '142,229,204', .11);
      }
      // Soil hatch marks follow the same translated world, without random dots.
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1015, 562); ctx.clip();
      for (let k = Math.floor(world / 78) - 1; k < Math.floor((world + 1060) / 78) + 1; k++) {
        const x = k * 78 - world;
        const y = terrain(k * 78) + 22;
        path([[x, y], [x + 19, y + 8]], '#213b3d', 1.1);
        path([[x + 38, y + 26], [x + 52, y + 30]], '#213b3d', 1.1);
      }
      ctx.restore();
      const terrainFade = ctx.createLinearGradient(965, 0, 1020, 0);
      terrainFade.addColorStop(0, 'rgba(11,23,36,0)'); terrainFade.addColorStop(1, C.bg);
      ctx.fillStyle = terrainFade; ctx.fillRect(965, 420, 60, 145);

      // Camera's illustrative look-ahead footprint. No depth estimation is run.
      const camera = bodyP(838, 279);
      const cone = ctx.createLinearGradient(camera[0], camera[1], lookX, lookY);
      cone.addColorStop(0, rgba('142,229,204', nearFront ? .26 : .13)); cone.addColorStop(1, rgba('142,229,204', .025));
      path([camera, [lookX - 42, terrain(world + lookX - 42)], [lookX + 51, terrain(world + lookX + 51)]], null, 1, cone, true);
      path([camera, [lookX, lookY]], rgba('142,229,204', .40), 1.4);
      ctx.save(); ctx.setLineDash([3, 5]);
      path([[lookX, lookY - 27], [lookX, lookY + 9]], C.cyan, 1.3);
      ctx.restore();
      glow(lookX, lookY, 38, '142,229,204', .12 + preview * .19);
      circle(lookX, lookY, 4.5, C.cyan);

      // Far-side wheel silhouette gives depth without adding a fifth axle.
      for (let i = 0; i < xs.length; i++) {
        circle(xs[i] + 17, ys[i] - 6, 44, '#081015', '#1d3036', 1.7);
      }
      // Suspension. Spring compression is kinematic and illustrative only.
      for (let i = 0; i < xs.length; i++) {
        const x = xs[i], y = ys[i], p = bodyP(x - 8, 344);
        const top = p[1] + 4, bottom = y - 4;
        const s = Math.max(strengths[i] * .55, focus[i]);
        glow(x + 5, (top + bottom) / 2, 70, '215,248,91', focus[i] * .22);
        path([[x - 33, y - 3], [x - 75, p[1] + 4], [x + 36, p[1] + 4]], '#5d7986', 5);
        path([[x - 9, top], [x - 9, bottom]], '#486776', 12);
        path([[x - 9, top], [x - 9, top + (bottom - top) * .61]], mixColor(C.cyan, C.lime, s), 8);
        path([[x - 9, top + (bottom - top) * .55], [x - 9, bottom]], '#d1e0e6', 4);
        const spring = [[x + 13, top], [x + 13, top + 8]];
        for (let k = 0; k < 9; k++) spring.push([x + 13 + (k % 2 ? -10 : 10), mix(top + 11, bottom - 8, k / 8)]);
        spring.push([x + 13, bottom]);
        path(spring, mixColor('#9ab7be', C.lime, s), 3);
        // One restrained vertical bracket makes spring travel visible.
        if (focus[i] > .45) {
          path([[x + 39, top], [x + 47, top], [x + 47, bottom - 6], [x + 39, bottom - 6]], rgba('215,248,91', focus[i] * .9), 2.2);
        }
        circle(x - 9, top, 3.4, C.muted); circle(x - 9, bottom, 3.4, C.muted);
      }

      // Stylized unarmed 8×8 hull: a generic illustration, no model dimensions.
      const hull = [[175,319],[198,281],[277,253],[722,253],[811,272],[871,322],[832,353],[212,353]];
      const hullGrad = ctx.createLinearGradient(0, bodyY - 70, 0, bodyY + 70);
      hullGrad.addColorStop(0, '#607580'); hullGrad.addColorStop(.55, '#425b69'); hullGrad.addColorStop(1, '#2b4354');
      path(hull.map(p => bodyP(...p)), '#a0b8bf', 2, hullGrad, true);
      path([[202,320],[834,320],[856,327]].map(p => bodyP(...p)), '#456167', 2);
      path([[228,342],[811,342]].map(p => bodyP(...p)), '#59797d', 2);
      path([[199,282],[732,266],[808,281]].map(p => bodyP(...p)), '#99ada6', 1.2);
      path([[718,268],[765,274],[797,298],[717,298]].map(p => bodyP(...p)), '#567c82', 1.1, '#0e222b', true);
      path([[776,276],[805,282],[836,311],[811,308]].map(p => bodyP(...p)), '#567c82', 1.1, '#102730', true);
      // Neutral roof hatch and body seams, deliberately no weapon hardware.
      path([[400,252],[412,241],[513,241],[525,252]].map(p => bodyP(...p)), '#8aa39f', 1.5, '#31474c', true);
      path([[546,269],[546,321],[609,321],[609,270]].map(p => bodyP(...p)), '#49636a', 1.2);
      path([[566,284],[584,284]].map(p => bodyP(...p)), '#9cb0ad', 2);
      for (const x of [294, 314, 334, 354]) path([[x,277],[x - 4,302]].map(p => bodyP(...p)), '#11282f', 3);
      // A small recognizable optical block and a stable callout.
      const cp = bodyP(839, 283);
      ctx.save(); ctx.translate(cp[0], cp[1]); ctx.rotate(pitch);
      ctx.fillStyle = '#0b1c25'; ctx.fillRect(-7, -8, 15, 12);
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5; ctx.strokeRect(-7, -8, 15, 12);
      circle(2, -2, 3, C.cyan); ctx.restore();
      path([[camera[0], camera[1] - 16], [880, 219], [973, 219]], rgba('142,229,204', .7), 1.4);
      text('노면 변화 신호', 973, 208, 20, C.cyan, 500, 'right');

      // Main wheels rotate by travelled drawing distance. All contact points
      // use exactly the same terrain() sample as the visible surface.
      for (let i = 0; i < xs.length; i++) {
        const x = xs[i], y = ys[i], s = strengths[i];
        circle(x, y, 51, null, rgba('215,248,91', focus[i] * .75), 3);
        circle(x, y, 46, '#091219', '#728b95', 2.2);
        circle(x, y, 36, '#1b2d34', '#314952', 5);
        ctx.save(); ctx.translate(x, y); ctx.rotate(world / 46);
        for (let n = 0; n < 14; n++) {
          ctx.save(); ctx.rotate(n * TAU / 14);
          path([[39, -5], [44, -3], [44, 5]], '#8a9993', 1.35); ctx.restore();
        }
        for (let n = 0; n < 6; n++) {
          const a = n * TAU / 6;
          path([[Math.cos(a) * 10, Math.sin(a) * 10], [Math.cos(a) * 26, Math.sin(a) * 26]], '#627b7c', 4);
        }
        ctx.restore();
        circle(x, y, 10, '#8caaa6', '#b2c4b7', 1.4);
        circle(x, y, 4, '#21363c');
        const ty = terrain(world + x);
        path([[x - 23, ty + 1], [x + 23, ty + 1]], rgba('215,248,91', .25 + .65 * Math.max(s, focus[i])), 4);
      }

      // Input travels into a synthetic network. Edge opacity and node glow are
      // controlled by the real drawing's slope-derived signal, never random.
      const inputPath = [[camera[0] + 8, camera[1] - 3], [969, 245], [1005, 315], [1087, 315]];
      bezier(inputPath, rgba('142,229,204', .4), 2);
      if (preview > .025) dotOnCurve(inputPath, (time * .42) % 1, rgba('142,229,204', .45 + .55 * preview), 5);
      arrow(1087, 315, 0, C.cyan, 5);

      glow(1188, 318, 166, '142,229,204', .04 + preview * .09);
      glow(1361, 318, 165, '215,248,91', .035 + Math.max(activity, focusStrength) * .10);
      // Ghost contours suggest network volume, without tracing an anatomy.
      for (let side = 0; side < 2; side++) {
        ctx.save(); ctx.translate(side ? 1374 : 1175, 318);
        ctx.beginPath();
        for (let n = 0; n <= 96; n++) {
          const a = n * TAU / 96, shape = 1 + .08 * Math.sin(3 * a) + .035 * Math.cos(7 * a);
          const x = Math.cos(a) * 117 * shape, y = Math.sin(a) * 153 * shape;
          n ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.strokeStyle = rgba(side ? '215,248,91' : '142,229,204', .22); ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      }
      for (const [a, b] of graph.edges) {
        const p = graph.nodes[a], q = graph.nodes[b];
        const source = p.side ? Math.max(activity, focusStrength * .9) : preview;
        const wave = .5 + .5 * Math.sin(time * 3.1 - p.x * .018 + p.phase * 4);
        path([[p.x, p.y], [q.x, q.y]], rgba(p.side ? '215,248,91' : '142,229,204', .12 + source * wave * .49), .95 + source * wave * .7);
      }
      for (const n of graph.nodes) {
        const signal = n.side ? Math.max(activity, focusStrength * .9) : preview;
        const wave = Math.pow(.5 + .5 * Math.sin(time * 3.1 - n.x * .018 + n.phase * 4), 3);
        const alpha = .23 + signal * (.2 + .57 * wave);
        const rgb = n.side ? '215,248,91' : '142,229,204';
        if (signal * wave > .3) glow(n.x, n.y, 11 + signal * 8, rgb, signal * wave * .18);
        circle(n.x, n.y, 1.8 + signal * wave * 2.3, rgba(rgb, alpha));
      }
      text('노면 변화', 1168, 509, 20, C.cyan, 500, 'center');
      text('댐퍼 조절 신호를 가정', 1384, 509, 19, C.lime, 500, 'center');
      text('설명용 연결망 · 실제 초파리 뇌 구조가 아닙니다', 1272, 538, 16, C.muted, 400, 'center');

      // Return route joins the spring directly: no unexplained random blink.
      path([[1452, 442], [1538, 471], [1538, 565]], rgba('215,248,91', .30), 1.8);
      // The return link now visibly ends at the featured spring rather than
      // an unrelated point below the vehicle. Its travel is illustrative.
      const springTop = bodyP(xs[focusIndex] - 8, 344)[1] + 4;
      const springEnd = [xs[focusIndex] - 9, (springTop + ys[focusIndex] - 4) / 2];
      const output = [[1538, 565], [1220, 593], [springEnd[0] + 120, 584], springEnd];
      bezier(output, rgba('215,248,91', .20 + focusStrength * .30), 1.8);
      if (focusStrength > .05) dotOnCurve(output, (time * .42 + .3) % 1, rgba('215,248,91', .55 + .45 * focusStrength), 5);
      arrow(output[3][0], output[3][1], -1.95, rgba('215,248,91', .8), 7);
      text('댐퍼 조절을 설명하기 위한 장면', 67, 554, 18, C.muted, 400);

      // A large four-beat visual guide replaces the duplicate scope caption.
      // The parent slide retains the required non-performance disclaimer.
      const steps = ['요철 접근', '바퀴 움직임', '댐퍼 반응', '가상 신호'];
      const stepX = [76, 450, 824, 1198];
      path([[62, 593], [1538, 593]], '#294250', 1);
      steps.forEach((label, i) => {
        const active = i === phase;
        circle(stepX[i] + 15, 627, 18, active ? C.lime : '#1a3141', active ? C.lime : '#38515f', 1.2);
        text(String(i + 1).padStart(2, '0'), stepX[i] + 15, 633, 16, active ? C.bg : C.muted, 600, 'center');
        text(label, stepX[i] + 49, 636, 25, active ? C.ink : C.muted, active ? 600 : 400);
        if (i < 3) arrow(stepX[i] + 300, 627, 0, '#4d6774', 8);
      });

      if (typeof options.onSignal === 'function' && (Math.abs(time - lastSignalCall) >= 1 / 15 || lastSignalCall < 0)) {
        options.onSignal({ time, preview, activity, wheels: strengths.slice(), illustrative: true });
        lastSignalCall = time;
      }
    }

    function mixColor(a, b, u) {
      const ca = [1,3,5].map(k => parseInt(a.slice(k,k+2),16));
      const cb = [1,3,5].map(k => parseInt(b.slice(k,k+2),16));
      return '#' + ca.map((v,i) => Math.round(mix(v,cb[i],u)).toString(16).padStart(2,'0')).join('');
    }
    function tick(stamp) {
      if (!running || destroyed) return;
      if (lastStamp !== null) t += Math.min((stamp - lastStamp) / 1000, .08);
      lastStamp = stamp; frame(t); raf = requestAnimationFrame(tick);
    }
    const api = {
      start() { if (destroyed || running) return api; running = true; lastStamp = null; raf = requestAnimationFrame(tick); return api; },
      stop() { running = false; lastStamp = null; cancelAnimationFrame(raf); return api; },
      pause() { return api.stop(); },
      reset() { t = 0; lastStamp = null; lastSignalCall = -1; frame(t); return api; },
      seek(seconds) { t = Math.max(0, Number(seconds) || 0); lastStamp = null; lastSignalCall = -1; frame(t); return api; },
      render(seconds) { if (seconds !== undefined) return api.seek(seconds); frame(t); return api; },
      getTime() { return t; },
      isRunning() { return running; },
      destroy() { api.stop(); destroyed = true; if (canvas.__dampingScene === api) delete canvas.__dampingScene; }
    };
    canvas.__dampingScene = api;
    frame(t);
    if (options.autoStart !== false) api.start();
    return api;
  }
  global.DampingScene = { mount, width: W, height: H };
})(window);
