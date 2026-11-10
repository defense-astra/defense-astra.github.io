// Self-contained raster PDF reports: Korean labels use the browser's fonts,
// and all image bytes remain in the browser. No print dialog or remote service.
const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM = PAGE_HEIGHT - 42;
const RENDER_SCALE = 2.4;
const FONT = '"IBM Plex Sans KR", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif';
const INK = '#192631';
const GREEN = '#245d50';
const MUTED = '#66776f';
const clean = value => Array.from(String(value ?? '')).filter(char => char.codePointAt(0) >= 32 || '\t\n\r'.includes(char)).join('');

/** Wrap complete text, including long URLs and Korean strings, without clipping. */
export function wrapTextLines(text, maxWidth, measure) {
  if (!(maxWidth > 0) || typeof measure !== 'function') throw new Error('Invalid text layout');
  const output = [];
  for (const paragraph of clean(text).replace(/\r\n?/g, '\n').split('\n')) {
    if (!paragraph) { output.push(''); continue; }
    let line = '';
    for (const char of Array.from(paragraph)) {
      if (line && measure(line + char) > maxWidth) {
        const splitAt = line.lastIndexOf(' ');
        // Keep ordinary words together where practical; split URLs/CJK safely.
        if (splitAt > 0 && splitAt >= line.length * .35) {
          output.push(line.slice(0, splitAt));
          line = line.slice(splitAt + 1) + char;
        } else { output.push(line); line = char; }
      } else { line += char; }
      // An unusually wide grapheme still occupies one complete line.
      while (line.length > 1 && measure(line) > maxWidth) {
        const chars = Array.from(line);
        let cut = chars.length - 1;
        while (cut > 1 && measure(chars.slice(0, cut).join('')) > maxWidth) cut--;
        output.push(chars.slice(0, cut).join(''));
        line = chars.slice(cut).join('');
      }
    }
    if (line) output.push(line);
  }
  return output;
}

/** Encode one full-page RGB JPEG per PDF page; offsets count bytes, not characters. */
export function encodeJpegPdf(pages) {
  if (!Array.isArray(pages) || !pages.length || pages.length > 200) throw new Error('PDF page count is invalid');
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let length = 0;
  const append = value => {
    const bytes = typeof value === 'string' ? encoder.encode(value) : value;
    chunks.push(bytes); length += bytes.length;
  };
  const object = (id, body) => {
    offsets[id] = length;
    append(`${id} 0 obj\n`); body(); append('\nendobj\n');
  };
  append('%PDF-1.4\n');
  append(new Uint8Array([37, 226, 227, 207, 211, 10]));
  object(1, () => append('<< /Type /Catalog /Pages 2 0 R >>'));
  object(2, () => append(`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>`));
  pages.forEach((page, i) => {
    const { jpeg, width, height } = page;
    const pageWidth = page.pageWidth ?? PAGE_WIDTH;
    const pageHeight = page.pageHeight ?? PAGE_HEIGHT;
    if (!(jpeg instanceof Uint8Array) || jpeg.length < 4 || jpeg[0] !== 255 || jpeg[1] !== 216 || jpeg.at(-2) !== 255 || jpeg.at(-1) !== 217) throw new Error('Invalid JPEG page');
    if (![width, height].every(n => Number.isInteger(n) && n > 0 && n <= 20000)) throw new Error('Invalid JPEG dimensions');
    if (![pageWidth, pageHeight].every(n => typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= 14400)) throw new Error('Invalid PDF dimensions');
    const pageId = 3 + i * 3, imageId = pageId + 1, contentId = pageId + 2;
    object(pageId, () => append(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`));
    object(imageId, () => {
      append(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
      append(jpeg); append('\nendstream');
    });
    const stream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ\n`;
    object(contentId, () => append(`<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}endstream`));
  });
  const xref = length;
  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (let i = 1; i < offsets.length; i++) append(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const result = new Uint8Array(length);
  let cursor = 0;
  for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; }
  return result;
}

function jpegBytes(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob(async blob => {
    if (!blob) { reject(new Error('PDF 페이지 이미지를 생성하지 못했습니다.')); return; }
    try { resolve(new Uint8Array(await blob.arrayBuffer())); } catch (error) { reject(error); }
  }, 'image/jpeg', .93));
}

/**
 * Build a downloadable PDF Blob for one or more vehicle measurement scenes.
 * sceneCanvas includes annotations and the whole original photograph, without a UI frame.
 * Optional metadata fields are strings; absent lists produce a clear empty-state notice.
 */
export async function buildMeasurementReport({ vehicles, createdAt = new Date() } = {}) {
  if (!Array.isArray(vehicles) || !vehicles.length || vehicles.length > 10) throw new Error('PDF로 저장할 차량을 선택하세요.');
  if (typeof document === 'undefined') throw new Error('PDF 보고서는 브라우저에서 생성합니다.');
  // Already-loaded browser fonts are sufficient; font fetching is never required.
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const dateText = Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ko-KR', { hour12: false });
  const pages = [];
  let canvas, ctx, y, pageNumber = 0, currentVehicle;
  const font = (size = 10, weight = 400) => { ctx.font = `${weight} ${size}px ${FONT}`; };
  const text = (value, x, baseline, size = 10, color = INK, weight = 400) => {
    font(size, weight); ctx.fillStyle = color; ctx.fillText(clean(value), x, baseline);
  };
  const rule = (yy, color = '#dde5df') => { ctx.strokeStyle = color; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(MARGIN, yy); ctx.lineTo(PAGE_WIDTH - MARGIN, yy); ctx.stroke(); };
  async function finishPage() {
    if (!canvas) return;
    rule(PAGE_HEIGHT - 31);
    text('8×8 VEHICLE LAB | 사진 기반 사용자 측정 - 공인 제원이 아닙니다.', MARGIN, PAGE_HEIGHT - 16, 8, MUTED);
    ctx.textAlign = 'right'; text(String(pageNumber), PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 16, 8, MUTED); ctx.textAlign = 'left';
    pages.push({ jpeg: await jpegBytes(canvas), width: canvas.width, height: canvas.height });
    // Release the large bitmap as soon as it is encoded; long reports remain bounded.
    canvas.width = 1; canvas.height = 1; canvas = null;
    if (pages.length >= 200) throw new Error('PDF 페이지가 너무 많습니다. 차량별로 나누어 저장하세요.');
  }
  async function newPage(continuation = false) {
    await finishPage();
    canvas = document.createElement('canvas');
    canvas.width = Math.round(PAGE_WIDTH * RENDER_SCALE);
    canvas.height = Math.round(PAGE_HEIGHT * RENDER_SCALE);
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('PDF용 그림 영역을 생성하지 못했습니다.');
    ctx.scale(canvas.width / PAGE_WIDTH, canvas.height / PAGE_HEIGHT);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    ctx.textBaseline = 'alphabetic'; pageNumber++;
    ctx.fillStyle = GREEN; ctx.fillRect(MARGIN, 23, 25, 3);
    text('8×8 VEHICLE LAB / MEASUREMENT REPORT', MARGIN + 34, 28, 8.5, GREEN, 700);
    ctx.textAlign = 'right'; text(dateText, PAGE_WIDTH - MARGIN, 28, 8, MUTED); ctx.textAlign = 'left';
    text(continuation ? `${currentVehicle.name} · 검토 기록 계속` : `${currentVehicle.name} · 측정 검토`, MARGIN, 58, 21, INK, 700);
    y = 79;
    if (currentVehicle.variant) await paragraph(currentVehicle.variant, { size: 9.5, color: MUTED, gap: 5 });
    else y += 2;
    rule(y + 4); y += 19;
  }
  async function ensure(height) { if (y + height > BOTTOM) await newPage(true); }
  async function paragraph(value, { size = 10, color = INK, weight = 400, gap = 8, indent = 0, lineHeight = size * 1.55 } = {}) {
    font(size, weight);
    const lines = wrapTextLines(value, CONTENT_WIDTH - indent, s => ctx.measureText(s).width);
    for (const line of lines) {
      await ensure(lineHeight);
      text(line, MARGIN + indent, y + size, size, color, weight);
      y += lineHeight;
    }
    y += gap;
  }
  async function section(label) {
    await ensure(45);
    y += 5;
    ctx.fillStyle = '#edf4ef'; ctx.fillRect(MARGIN, y, CONTENT_WIDTH, 23);
    text(label, MARGIN + 9, y + 15, 11, GREEN, 700);
    y += 33;
  }
  for (const vehicle of vehicles) {
    if (!vehicle?.sceneCanvas || !vehicle.sceneCanvas.width || !vehicle.sceneCanvas.height) throw new Error('차량 사진을 불러온 뒤 PDF를 저장하세요.');
    currentVehicle = { ...vehicle, name: clean(vehicle.name || '차량') };
    await newPage(false);
    const imageHeight = Math.min(286, BOTTOM - y - 115);
    const factor = Math.min(CONTENT_WIDTH / vehicle.sceneCanvas.width, imageHeight / vehicle.sceneCanvas.height);
    const width = vehicle.sceneCanvas.width * factor, height = vehicle.sceneCanvas.height * factor;
    ctx.fillStyle = '#f4f6f3'; ctx.fillRect(MARGIN, y, CONTENT_WIDTH, imageHeight);
    ctx.drawImage(vehicle.sceneCanvas, MARGIN + (CONTENT_WIDTH - width) / 2, y + (imageHeight - height) / 2, width, height);
    y += imageHeight + 13;
    await paragraph('축척 · ' + (vehicle.scaleSummary || '미설정'), { size: 10, color: GREEN, weight: 700, gap: 6 });
    await paragraph('사진의 원근·렌즈 왜곡·현가 및 타이어 변형은 보정하지 않습니다. 높이 기준은 사진과 같은 형식·장비 구성 및 동일한 상하 기준점을 사용해야 합니다.', { size: 9, color: MUTED, gap: 7 });
    if (vehicle.photoCredit) await paragraph('사진 · ' + vehicle.photoCredit, { size: 8, color: MUTED, gap: 9 });
    if (vehicle.photoNote) await paragraph('사진 확인사항 · ' + vehicle.photoNote, { size: 8.5, color: MUTED, gap: 9 });

    await section('측정 기록');
    const measurements = Array.isArray(vehicle.measurements) ? vehicle.measurements : [];
    if (!measurements.length) await paragraph('저장된 측정 기록이 없습니다.', { color: MUTED });
    for (let i = 0; i < measurements.length; i++) {
      const row = measurements[i];
      await paragraph(`${i + 1}. ${clean(row.label || row.type || '측정')}  |  ${clean(row.type || '')}  |  ${clean(row.value || '표시값 없음')}`, { size: 10.5, gap: 7 });
    }

    await section('공개 제원 · 적용 기준');
    const specs = Array.isArray(vehicle.specs) ? vehicle.specs : [];
    if (!specs.length) await paragraph('확인된 공개 제원이 없습니다. 알려진 실측 길이를 직접 사용하세요.', { color: MUTED });
    for (const spec of specs) {
      await ensure(40);
      await paragraph(`${clean(spec.label)} · ${clean(spec.value)}`, { size: 10.5, weight: 700, gap: 3 });
      if (spec.note) await paragraph(spec.note, { size: 9.3, color: MUTED, gap: 9 });
    }

    await section('자료 출처');
    const sources = Array.isArray(vehicle.sources) ? vehicle.sources : [];
    if (!sources.length) await paragraph('별도 출처가 입력되지 않았습니다.', { color: MUTED });
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      await ensure(34);
      await paragraph(`${i + 1}. ${clean(source.title || '자료')}`, { size: 9.5, weight: 600, gap: 3 });
      if (source.url) await paragraph(source.url, { size: 8.5, color: GREEN, gap: 9 });
    }
  }
  await finishPage();
  return new Blob([encodeJpegPdf(pages)], { type: 'application/pdf' });
}
