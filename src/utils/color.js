/* ── Color helpers — SVG gradient stops need literal color values ── */
export const hexToRgb = h => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const mix = (a, b, t) => {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  return '#' + ra.map((v, i) => Math.round(v + (rb[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
export const lighten = (c, t) => mix(c, '#ffffff', t);
export const darken  = (c, t) => mix(c, '#000000', t);
