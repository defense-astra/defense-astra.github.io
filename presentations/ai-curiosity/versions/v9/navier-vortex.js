/* Explanatory vortex geometry. This is not a Navier–Stokes solver or CFD data.
 * The core contracts radially faster than axially. Inflow spirals toward the
 * axis and leaves above/below the mid-plane. All displayed scales are finite.
 */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const PERIOD = 12;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const mix = (a, b, t) => a + (b - a) * t;
  const MINT = [158, 201, 187];
  const COPPER = [199, 133, 104];
  const CREAM = [244, 241, 234];
  const rgba = (rgb, a) => `rgba(${rgb.join(',')},${clamp(a)})`;

  function mount(canvas, options = {}) {
    if (!canvas || typeof canvas.getContext !== 'function') throw new TypeError('A canvas is required.');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Canvas 2D is unavailable.');
    const reduced = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    let time = 0;
    let playing = false;
    let destroyed = false;
    let raf = 0;
    let previous = 0;
    let lastNotice = -1;
    let manuallyStarted = false;
    const width = 900;
    const height = 590;
    const origin = { x: 450, y: 296 };
    const cameraYaw = -.38;
    const cameraPitch = .23;

    function phaseAt(t) {
      const local = ((t % PERIOD) + PERIOD) % PERIOD;
      const integral = (slow, fast) => {
        const delta = fast - slow;
        const base = Math.floor(t / PERIOD) * PERIOD * (slow + fast) / 2;
        if (local <= 10.35) return base + slow * local + delta * local * local / (2 * 10.35);
        const tail = local - 10.35;
        return base + 10.35 * (slow + fast) / 2 + fast * tail - delta * tail * tail / (2 * 1.65);
      };
      return {
        local,
        progress: smooth(local / 10.35),
        reset: smooth((local - 10.35) / 1.65),
        // Integrals avoid an angular jump when the conceptual cycle resets.
        spin: integral(.16, .65),
        travel: integral(.048, .14)
      };
    }

    function project(x, y, z) {
      const horizontal = x * Math.cos(cameraYaw) - y * Math.sin(cameraYaw);
      const depth = x * Math.sin(cameraYaw) + y * Math.cos(cameraYaw);
      const perspective = 1 + depth / 1700;
      return {
        x: origin.x + horizontal * perspective,
        y: origin.y - (z * Math.cos(cameraPitch) + depth * Math.sin(cameraPitch)) * perspective,
        depth
      };
    }

    function corePoint(u, phase, sign, p, spin) {
      // Dimensions are schematic, intentionally exaggerated for readability.
      // The axial height also decreases; the column never grows taller.
      const coreRadius = mix(86, 31, p);
      const coreHeight = mix(233, 164, p);
      const r = 252 * Math.pow(1 - u, 2.65) + coreRadius * (.91 + .09 * Math.cos(u * Math.PI));
      const z = sign * (8 + coreHeight * Math.pow(u, 1.24));
      const theta = phase + spin + u * (8.8 + p * 1.5);
      return project(Math.cos(theta) * r, Math.sin(theta) * r, z);
    }

    function line(a, b, color, alpha, thickness) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = rgba(color, alpha);
      ctx.lineWidth = thickness;
      ctx.stroke();
    }

    function arrow(a, b, opacity = 1) {
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      line(a, b, MINT, .45 * opacity, 1.35);
      ctx.beginPath();
      ctx.moveTo(b.x - Math.cos(angle - .45) * 8, b.y - Math.sin(angle - .45) * 8);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(b.x - Math.cos(angle + .45) * 8, b.y - Math.sin(angle + .45) * 8);
      ctx.strokeStyle = rgba(MINT, .65 * opacity);
      ctx.lineWidth = 1.35;
      ctx.stroke();
    }

    function drawFlow(p, spin, travel, opacity) {
      if (opacity < .001) return;
      const coreRadius = mix(86, 31, p);
      const coreHeight = mix(233, 164, p);
      const glow = ctx.createRadialGradient(origin.x, origin.y, 4, origin.x, origin.y, 240);
      glow.addColorStop(0, rgba(MINT, .10 * opacity));
      glow.addColorStop(.4, rgba(MINT, .035 * opacity));
      glow.addColorStop(1, rgba(MINT, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(90, 40, 720, 510);

      // A quiet axial guide makes the two directions legible.
      ctx.setLineDash([3, 9]);
      line(project(0, 0, -265), project(0, 0, 265), MINT, .13 * opacity, 1);
      ctx.setLineDash([]);

      const segments = [];
      const particles = [];
      const ribbons = 17;
      const samples = 116;
      for (const sign of [-1, 1]) {
        for (let ribbon = 0; ribbon < ribbons; ribbon++) {
          const angle = ribbon * TAU / ribbons + (sign < 0 ? .08 : 0);
          const accent = ribbon % 6 === 1;
          const color = accent ? COPPER : MINT;
          let last = corePoint(0, angle, sign, p, spin);
          for (let j = 1; j <= samples; j++) {
            const u = j / samples;
            const point = corePoint(u, angle, sign, p, spin);
            const depth = (last.depth + point.depth) * .5;
            const foreground = clamp(.5 + depth / 550);
            const fadeEnds = smooth(u / .10) * (1 - smooth((u - .86) / .14));
            segments.push({
              a: last, b: point, depth, color,
              alpha: (accent ? .40 : .29) * (.33 + .67 * foreground) * fadeEnds * opacity,
              thickness: (accent ? 1.5 : 1.15) + foreground * .35
            });
            last = point;
          }
          // Long, tapered streaks carry the flow instead of blinking points.
          const position = (travel + ribbon * .173 + (sign < 0 ? .27 : 0)) % 1;
          if (ribbon % 2 === 0) {
            for (let k = 0; k < 13; k++) {
              const u = position - k * .006;
              if (u < .04 || u > .96) continue;
              const a = corePoint(u, angle, sign, p, spin);
              const b = corePoint(Math.min(.99, u + .008), angle, sign, p, spin);
              const fadeEnds = smooth(u / .12) * (1 - smooth((u - .85) / .12));
              particles.push({
                a, b, depth: a.depth, color: accent ? COPPER : CREAM,
                alpha: .86 * Math.pow(1 - k / 13, 1.4) * fadeEnds * opacity,
                thickness: 2.1 - k * .06
              });
            }
          }
        }
      }
      segments.sort((a, b) => a.depth - b.depth);
      particles.sort((a, b) => a.depth - b.depth);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const s of segments) line(s.a, s.b, s.color, s.alpha, s.thickness);
      for (const s of particles) line(s.a, s.b, s.color, s.alpha, s.thickness);

      // The concentrated core is a thin transparent column, not a solid object.
      for (const sign of [-1, 1]) {
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const theta = i / 80 * TAU;
          const q = project(Math.cos(theta) * coreRadius * .72, Math.sin(theta) * coreRadius * .72, sign * coreHeight * .64);
          i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y);
        }
        ctx.strokeStyle = rgba(MINT, .11 * opacity);
        ctx.lineWidth = 1;
        ctx.stroke();
        arrow(project(0, 0, sign * (coreHeight + 7)), project(0, 0, sign * (coreHeight + 29)), opacity);
      }
      // Outer guide arrows point inward, independent of rotation animation.
      for (const theta of [-.38, Math.PI - .38]) {
        arrow(project(Math.cos(theta) * 355, Math.sin(theta) * 355, 0),
          project(Math.cos(theta) * 309, Math.sin(theta) * 309, 0), opacity * .7);
      }
    }

    function state() {
      const phase = phaseAt(time);
      return { playing, time, progress: phase.progress * (1 - phase.reset), resetting: phase.reset > 0 };
    }

    function publish(force = false) {
      if (destroyed) return;
      const now = state();
      canvas.dataset.time = time.toFixed(3);
      canvas.dataset.progress = now.progress.toFixed(4);
      canvas.dataset.playing = String(playing);
      canvas.dataset.resetting = String(now.resetting);
      if (force || Math.floor(time * 5) !== lastNotice) {
        lastNotice = Math.floor(time * 5);
        if (typeof options.onChange === 'function') options.onChange(now);
      }
    }

    function draw() {
      if (destroyed) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      const phase = phaseAt(time);
      drawFlow(phase.progress, phase.spin, phase.travel, 1 - phase.reset);
      if (phase.reset > 0) drawFlow(0, phase.spin, phase.travel, phase.reset);
      publish();
    }

    function tick(timestamp) {
      raf = 0;
      if (destroyed || !playing || document.hidden) return;
      if (previous) time += Math.min(.05, Math.max(0, (timestamp - previous) / 1000));
      previous = timestamp;
      draw();
      raf = window.requestAnimationFrame(tick);
    }

    function schedule() {
      if (!destroyed && playing && !document.hidden && !raf) {
        previous = 0;
        raf = window.requestAnimationFrame(tick);
      }
    }

    function play() {
      if (destroyed) return;
      manuallyStarted = true;
      playing = true;
      schedule();
      publish(true);
    }

    function pause() {
      if (destroyed) return;
      playing = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      previous = 0;
      publish(true);
    }

    function reset() {
      if (destroyed) return;
      time = 0;
      previous = 0;
      draw();
      publish(true);
    }

    function seek(seconds) {
      if (destroyed || !Number.isFinite(seconds)) return;
      time = Math.max(0, seconds);
      previous = 0;
      draw();
      publish(true);
    }

    function visibility() {
      if (document.hidden) {
        if (raf) window.cancelAnimationFrame(raf);
        raf = 0;
        previous = 0;
      } else schedule();
    }

    function motionChanged() {
      if (reduced.matches && !manuallyStarted) pause();
    }

    function destroy() {
      if (destroyed) return;
      pause();
      destroyed = true;
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener?.('change', motionChanged);
      canvas.dataset.playing = 'false';
    }

    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener?.('change', motionChanged);
    draw();
    if (options.autoStart !== false && !reduced.matches) {
      playing = true;
      schedule();
      publish(true);
    }
    return { play, pause, reset, seek, getState: state, destroy };
  }

  window.NavierVortex = Object.freeze({ mount });
})();
