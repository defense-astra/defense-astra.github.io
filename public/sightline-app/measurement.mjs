/**
 * Photo measurements use original image pixels and millimetres.
 * Coordinates are normalized to the original image, not the current viewport.
 * These helpers do not correct camera perspective, depth, or tire deformation.
 */

const finitePositive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
const validDimensions = (width, height) => finitePositive(width) && finitePositive(height);
const validPoint = point => point && typeof point === 'object'
  && typeof point.x === 'number' && Number.isFinite(point.x) && point.x >= 0 && point.x <= 1
  && typeof point.y === 'number' && Number.isFinite(point.y) && point.y >= 0 && point.y <= 1;
const validPair = points => Array.isArray(points) && points.length === 2 && points.every(validPoint);

function pixelVector(points, width, height) {
  if (!validDimensions(width, height) || !validPair(points)) return null;
  const vector = { x: (points[1].x - points[0].x) * width, y: (points[1].y - points[0].y) * height };
  return Number.isFinite(vector.x) && Number.isFinite(vector.y) ? vector : null;
}

/** A zero-length measured span is valid; reference spans must separately be >= 1 px. */
export function pixelLength(points, width, height) {
  const vector = pixelVector(points, width, height);
  if (!vector) return null;
  const length = Math.hypot(vector.x, vector.y);
  return Number.isFinite(length) ? length : null;
}

export function scaleMmPerPixel(referencePoints, referenceMm, width, height) {
  if (!finitePositive(referenceMm)) return null;
  const pixels = pixelLength(referencePoints, width, height);
  if (pixels === null || pixels < 1) return null;
  const scale = referenceMm / pixels;
  return finitePositive(scale) ? scale : null;
}

export function lengthMillimetres(points, scale, width, height) {
  if (!finitePositive(scale)) return null;
  const pixels = pixelLength(points, width, height);
  if (pixels === null) return null;
  const result = pixels * scale;
  return Number.isFinite(result) ? result : null;
}

/**
 * Orthogonal projection onto the infinite ground line, not its finite segment.
 * The returned foot is normalized and may lie outside the photo boundaries.
 */
export function projectPointToBaseline(point, groundBaseline, width, height) {
  if (!validPoint(point)) return null;
  const baseline = pixelVector(groundBaseline, width, height);
  if (!baseline) return null;
  const length = Math.hypot(baseline.x, baseline.y);
  if (!Number.isFinite(length) || length < 1) return null;
  const deltaX = (point.x - groundBaseline[0].x) * width;
  const deltaY = (point.y - groundBaseline[0].y) * height;
  // Unit-vector form avoids squaring a large pixel distance.
  const ux = baseline.x / length, uy = baseline.y / length;
  const along = deltaX * ux + deltaY * uy;
  const foot = {
    x: groundBaseline[0].x + along * ux / width,
    y: groundBaseline[0].y + along * uy / height
  };
  return Number.isFinite(foot.x) && Number.isFinite(foot.y) ? foot : null;
}

/** Ground clearance from a selected underbody point to a required ground line. */
export function clearanceToBaselineMillimetres(point, groundBaseline, scale, width, height) {
  if (!finitePositive(scale)) return null;
  const foot = projectPointToBaseline(point, groundBaseline, width, height);
  if (!foot) return null;
  const result = Math.hypot((point.x - foot.x) * width, (point.y - foot.y) * height) * scale;
  return Number.isFinite(result) ? result : null;
}

/**
 * Normal component of a two-point span. Kept distinct from point-to-ground
 * clearance: both endpoints must be chosen meaningfully by the caller.
 * A missing ground line explicitly reports its photo-horizontal fallback.
 */
export function clearanceMillimetres(points, groundBaseline, scale, width, height) {
  if (!finitePositive(scale)) return null;
  const span = pixelVector(points, width, height);
  if (!span) return null;
  let normal = { x: 0, y: 1 };
  let reference = 'image-horizontal';
  if (groundBaseline !== null && groundBaseline !== undefined) {
    const baseline = pixelVector(groundBaseline, width, height);
    if (!baseline) return null;
    const length = Math.hypot(baseline.x, baseline.y);
    if (!Number.isFinite(length) || length < 1) return null;
    normal = { x: -baseline.y / length, y: baseline.x / length };
    reference = 'ground-baseline';
  }
  const millimetres = Math.abs(span.x * normal.x + span.y * normal.y) * scale;
  return Number.isFinite(millimetres) ? { millimetres, reference } : null;
}

/**
 * Nominal geometric tire diameter, NOT a measured manufacturer diameter.
 * Inch rims: 365/80 R20 etc. The 560 and 685 metric rims are explicit exceptions;
 * unknown three-digit rim numbers are rejected instead of being read as inches.
 * Inch-section sizes such as 14.00 R20 have no stated aspect ratio and are rejected.
 */
export function parseMetricTireSize(text) {
  if (typeof text !== 'string') return null;
  const match = text.match(/^\s*(\d{3})\s*\/\s*(\d{2,3}(?:\.\d+)?)\s*[rR]\s*(\d{2,3}(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const sectionWidthMm = Number(match[1]), aspectRatioPercent = Number(match[2]), rim = Number(match[3]);
  if (sectionWidthMm < 100 || sectionWidthMm > 999 || aspectRatioPercent < 20 || aspectRatioPercent > 200) return null;
  const metricRim = rim === 560 || rim === 685;
  if (!metricRim && (rim < 10 || rim > 60)) return null;
  const rimUnit = metricRim ? 'mm' : 'in';
  const rimDiameterMm = metricRim ? rim : rim * 25.4;
  const theoreticalDiameterMm = rimDiameterMm + 2 * sectionWidthMm * aspectRatioPercent / 100;
  return {
    designation: `${sectionWidthMm}/${aspectRatioPercent} R${rim}`,
    sectionWidthMm,
    aspectRatioPercent,
    rimUnit,
    rimDiameterMm,
    rimDiameterIn: metricRim ? null : rim,
    theoreticalDiameterMm
  };
}
