import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pixelLength, scaleMmPerPixel, lengthMillimetres,
  projectPointToBaseline, clearanceToBaselineMillimetres, clearanceMillimetres,
  parseMetricTireSize
} from '../public/sightline-app/measurement.mjs';

const near = (actual, expected, tolerance = 1e-9) => {
  assert.equal(typeof actual, 'number');
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
};
const origin = { x: 0, y: 0 };

test('3-4-5 span is evaluated in original, non-square image pixels', () => {
  const points = [origin, { x: .3, y: .8 }];
  near(pixelLength(points, 1000, 500), 500);
  const scale = scaleMmPerPixel(points, 2000, 1000, 500);
  near(scale, 4);
  near(lengthMillimetres([origin, { x: .1, y: .2 }], scale, 1000, 500), 400 * Math.SQRT2);
});

test('calibration and result are unchanged after source resampling or horizontal reflection', () => {
  const reference = [{ x: .2, y: .1 }, { x: .2, y: .9 }];
  const span = [{ x: .3, y: .2 }, { x: .7, y: .5 }];
  const measure = (a, b, w, h) => lengthMillimetres(b, scaleMmPerPixel(a, 1000, w, h), w, h);
  const expected = measure(reference, span, 1200, 800);
  near(measure(reference, span, 2400, 1600), expected);
  const flip = pair => pair.map(p => ({ x: 1 - p.x, y: p.y }));
  near(measure(flip(reference), flip(span), 1200, 800), expected);
});

test('calibration rejects missing, zero, non-finite, and subpixel references', () => {
  const valid = [origin, { x: .5, y: 0 }];
  for (const points of [null, [], [origin], [origin, origin], [origin, { x: .0009, y: 0 }], [origin, { x: NaN, y: 0 }], [origin, { x: 2, y: 0 }]]) {
    assert.equal(scaleMmPerPixel(points, 1000, 1000, 500), null);
  }
  for (const real of [0, -1, NaN, Infinity, '1000', null]) assert.equal(scaleMmPerPixel(valid, real, 1000, 500), null);
  for (const dims of [[0, 500], [-1, 500], [1000, Infinity], [NaN, 500]]) assert.equal(scaleMmPerPixel(valid, 1000, ...dims), null);
  near(scaleMmPerPixel([origin, { x: .001, y: 0 }], 1000, 1000, 500), 1000);
});

test('reference-length edit proportionally recalculates existing spans', () => {
  const reference = [origin, { x: .2, y: 0 }];
  const span = [origin, { x: 0, y: .1 }];
  near(lengthMillimetres(span, scaleMmPerPixel(reference, 1000, 1000, 1000), 1000, 1000), 500);
  near(lengthMillimetres(span, scaleMmPerPixel(reference, 1200, 1000, 1000), 1000, 1000), 600);
});

test('horizontal ground clearance uses point-to-line distance and requires a valid baseline', () => {
  const ground = [{ x: .2, y: .8 }, { x: .8, y: .8 }];
  const point = { x: .4, y: .5 };
  near(clearanceToBaselineMillimetres(point, ground, 2, 1000, 500), 300);
  const foot = projectPointToBaseline(point, ground, 1000, 500);
  near(foot.x, .4); near(foot.y, .8);
  assert.equal(clearanceToBaselineMillimetres(point, null, 2, 1000, 500), null);
  assert.equal(clearanceToBaselineMillimetres(point, [origin, origin], 2, 1000, 500), null);
  assert.equal(clearanceToBaselineMillimetres(point, ground, 0, 1000, 500), null);
});

test('tilted ground projects perpendicularly, not screen-vertically', () => {
  // Pixels: ground (200,400) -> (800,700); underbody (500,300).
  const ground = [{ x: .1, y: .4 }, { x: .4, y: .7 }];
  const point = { x: .25, y: .3 };
  const foot = projectPointToBaseline(point, ground, 2000, 1000);
  near(foot.x, .2); near(foot.y, .5); // (400,500).
  near(clearanceToBaselineMillimetres(point, ground, 2, 2000, 1000), 200 * Math.sqrt(5));
  near(clearanceToBaselineMillimetres(point, [...ground].reverse(), 2, 2000, 1000), 200 * Math.sqrt(5));
});

test('ground projection extends the infinite baseline beyond the selected segment', () => {
  const ground = [{ x: .4, y: .4 }, { x: .6, y: .6 }];
  const foot = projectPointToBaseline({ x: 0, y: .2 }, ground, 1000, 1000);
  near(foot.x, .1); near(foot.y, .1);
  near(clearanceToBaselineMillimetres({ x: 0, y: .2 }, ground, 1, 1000, 1000), 100 * Math.SQRT2);
  const outside = projectPointToBaseline({ x: 0, y: 1 }, [{ x: .9, y: 0 }, { x: 1, y: .2 }], 1000, 1000);
  near(outside.x, 1.12); near(outside.y, .44);
});

test('two-point projected height distinguishes ground-baseline from horizontal fallback', () => {
  const span = [origin, { x: 0, y: .3 }];
  const result = clearanceMillimetres(span, [origin, { x: .8, y: .6 }], 2, 1000, 1000);
  assert.equal(result.reference, 'ground-baseline'); near(result.millimetres, 480);
  const fallback = clearanceMillimetres(span, null, 2, 1000, 1000);
  assert.equal(fallback.reference, 'image-horizontal'); near(fallback.millimetres, 600);
  assert.equal(clearanceMillimetres(span, [], 2, 1000, 1000), null);
  assert.equal(clearanceMillimetres(span, [origin, origin], 2, 1000, 1000), null);
});

test('metric tire sidewall sizes produce explicit theoretical, inch-rim examples', () => {
  const a = parseMetricTireSize(' 395 / 85 r 20 ');
  assert.equal(a.designation, '395/85 R20');
  assert.equal(a.rimUnit, 'in'); near(a.rimDiameterMm, 508);
  near(a.theoreticalDiameterMm, 1179.5);
  near(parseMetricTireSize('365/80R20').theoreticalDiameterMm, 1092);
  near(parseMetricTireSize('315/100R20').theoreticalDiameterMm, 1138);
});

test('known three-digit metric rims are never multiplied by 25.4', () => {
  for (const [size, rim, expected] of [['415/80 R685', 685, 1349], ['395/90 R560', 560, 1271]]) {
    const parsed = parseMetricTireSize(size);
    assert.equal(parsed.rimUnit, 'mm'); assert.equal(parsed.rimDiameterIn, null);
    near(parsed.rimDiameterMm, rim); near(parsed.theoreticalDiameterMm, expected);
  }
});

test('tire parser rejects absent aspect ratios, unknown metric rims, and ambiguous alternatives', () => {
  for (const value of ['14.00 R20', '14R20', '16.00R20', '42x15.5R20', '395/85R999', '395/85R700', '395/85R20 / 365/80R20', '395/85R20 XZL', '395/00R20', '395/85R00', '', null]) {
    assert.equal(parseMetricTireSize(value), null, String(value));
  }
});

test('measurement rejects invalid scales and coordinates without coercion', () => {
  const span = [origin, { x: 1, y: 1 }];
  for (const scale of [0, -1, NaN, Infinity, '1']) assert.equal(lengthMillimetres(span, scale, 1000, 1000), null);
  assert.equal(pixelLength([origin, { x: 0, y: Infinity }], 1000, 500), null);
  assert.equal(pixelLength(span, '1000', 500), null);
  assert.equal(projectPointToBaseline({ x: NaN, y: 0 }, span, 1000, 1000), null);
});
