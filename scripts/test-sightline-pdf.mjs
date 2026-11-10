import test from 'node:test';
import assert from 'node:assert/strict';
import { encodeJpegPdf, wrapTextLines, buildMeasurementReport } from '../public/sightline-app/pdf-report.mjs';

const jpeg = new Uint8Array([255, 216, 255, 224, 0, 6, 128, 129, 254, 0, 255, 217]);
const page = { jpeg, width: 2021, height: 1429 };
const latin = bytes => Buffer.from(bytes).toString('latin1');

test('binary PDF has correctly targeted xref entries and preserves exact JPEG payload', () => {
  const bytes = encodeJpegPdf([page]);
  const data = latin(bytes);
  assert.ok(data.startsWith('%PDF-1.4\n'));
  const startxref = Number(data.match(/startxref\n(\d+)\n%%EOF\n$/)[1]);
  assert.equal(data.slice(startxref, startxref + 4), 'xref');
  const xrefLines = data.slice(startxref).split('\n');
  assert.equal(xrefLines[1], '0 6');
  for (let id = 1; id < 6; id++) {
    const offset = Number(xrefLines[2 + id].slice(0, 10));
    assert.ok(data.slice(offset).startsWith(`${id} 0 obj\n`));
  }
  const imageStart = data.indexOf('stream\n', data.indexOf('/Subtype /Image')) + 7;
  assert.deepEqual(bytes.slice(imageStart, imageStart + jpeg.length), jpeg);
  assert.match(data, /\/MediaBox \[0 0 841\.89 595\.28\]/);
  assert.match(data, /\/Width 2021 \/Height 1429/);
});

test('multi-page report references all images and independent page media boxes', () => {
  const data = latin(encodeJpegPdf([page, { ...page, pageWidth: 600, pageHeight: 400 }, page]));
  assert.match(data, /\/Count 3 \/Kids \[3 0 R 6 0 R 9 0 R\]/);
  assert.equal((data.match(/\/Subtype \/Image/g) || []).length, 3);
  assert.equal((data.match(/\/Type \/Page /g) || []).length, 3);
  assert.match(data, /\/MediaBox \[0 0 600 400\]/);
  assert.match(data, /\/Size 12 \/Root 1 0 R/);
});

test('PDF rejects empty, excessive, invalid image and non-finite dimensions', () => {
  for (const input of [null, [], Array(201).fill(page)]) assert.throws(() => encodeJpegPdf(input));
  for (const bad of [new Uint8Array(), new Uint8Array([255, 216, 0, 0]), 'jpeg']) assert.throws(() => encodeJpegPdf([{ ...page, jpeg: bad }]));
  for (const change of [{ width: 0 }, { width: NaN }, { height: 2.5 }, { pageWidth: Infinity }, { pageHeight: -2 }]) assert.throws(() => encodeJpegPdf([{ ...page, ...change }]));
});

test('long Korean labels and unbroken source URLs wrap completely inside the line width', () => {
  const width = text => Array.from(text).length * 10;
  for (const text of ['공개차량높이측정기준'.repeat(12), 'https://example.test/' + 'a'.repeat(250)]) {
    const lines = wrapTextLines(text, 90, width);
    assert.ok(lines.length > 1);
    assert.equal(lines.join(''), text);
    assert.ok(lines.every(line => width(line) <= 90));
  }
});

test('paragraph wrapping preserves explicit breaks and full long words', () => {
  const measure = s => s.length;
  assert.deepEqual(wrapTextLines('첫줄\n\n마지막줄', 20, measure), ['첫줄', '', '마지막줄']);
  const input = 'height definition unavailable; use exact vehicle variant';
  const lines = wrapTextLines(input, 15, measure);
  assert.equal(lines.join(' ').replace(/\s+/g, ''), input.replace(/\s+/g, ''));
  assert.ok(lines.every(line => line.length <= 15));
});

test('report rejects missing vehicles before any browser export work', async () => {
  await assert.rejects(buildMeasurementReport({ vehicles: [] }), /차량/);
  await assert.rejects(buildMeasurementReport({ vehicles: Array(11).fill({}) }), /차량/);
});

test('complete long reports paginate without dropping records, clipping text, or distorting images', async () => {
  const rendered = [];
  const originalDocument = globalThis.document;
  globalThis.document = {
    createElement(tag) {
      assert.equal(tag, 'canvas');
      const record = { text: [], images: [] };
      rendered.push(record);
      const ctx = {
        scale() {}, fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
        measureText(text) { return { width: Array.from(text).length * 5 }; },
        fillText(text, x, y) { record.text.push({ text, x, y }); },
        drawImage(image, x, y, width, height) { record.images.push({ image, x, y, width, height }); }
      };
      return { width: 0, height: 0, getContext() { return ctx; }, toBlob(done) { done(new Blob([jpeg], { type: 'image/jpeg' })); } };
    }
  };
  try {
    const sources = [{ title: '원문 제조사 제원', url: 'https://example.test/' + 'x'.repeat(900) }];
    const records = Array.from({ length: 120 }, (_, i) => ({ label: `측정기록-${String(i).padStart(3, '0')}`, type: '길이', value: `${i + 10} mm` }));
    const blob = await buildMeasurementReport({ vehicles: [
      { name: '첫 번째 차량', variant: '정측면 사진', sceneCanvas: { width: 1600, height: 900 }, measurements: records, sources, photoNote: '운반차 바닥은 지면이 아닙니다. 안테나 끝이 잘린 사진입니다.' },
      { name: '두 번째 차량', sceneCanvas: { width: 600, height: 1000 }, measurements: [], specs: [{ label: '전고', value: '2500 mm', note: '차체 높이 기준 확인 필요 '.repeat(70) }] }
    ], createdAt: new Date('2026-11-10T00:00:00Z') });
    assert.equal(blob.type, 'application/pdf');
    assert.ok(rendered.length >= 7);
    const texts = rendered.flatMap(p => p.text);
    assert.ok(texts.some(x => x.text.includes('운반차 바닥은 지면이 아닙니다. 안테나 끝이 잘린 사진입니다.')));
    for (let i = 0; i < 120; i++) assert.equal(texts.filter(x => x.text.includes(`측정기록-${String(i).padStart(3, '0')}`)).length, 1);
    assert.ok(texts.every(x => x.y <= 580 && x.y >= 0));
    const images = rendered.flatMap(p => p.images);
    assert.equal(images.length, 2);
    for (const image of images) {
      assert.ok(Math.abs(image.width / image.height - image.image.width / image.image.height) < 1e-9);
      assert.ok(image.x >= 36 && image.x + image.width <= 806);
      assert.ok(image.y + image.height < 554);
    }
    const pdf = latin(new Uint8Array(await blob.arrayBuffer()));
    assert.match(pdf, new RegExp('/Count ' + rendered.length + ' /Kids'));
  } finally { globalThis.document = originalDocument; }
});
