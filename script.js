function clamp(v, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number(v)));
}

function srgb8ToLinearChannel(v8bit) {
  const v = clamp(Number(v8bit), 0, 255) / 255;
  if (v <= 0.04045) return v / 12.92;

  return ((v + 0.055) / 1.055) ** 2.4;
}

function linear01ToSrgb8(lin) {
  const v = clamp(Number(lin), 0, 1);
  let sr = 0;
  if (v <= 0.0031308) sr = v * 12.92;
  else sr = 1.055 * v ** (1 / 2.4) - 0.055;

  return Math.round(sr * 255);
}

function linear01ToLinear8(lin) {
  return Math.round(clamp(Number(lin), 0, 1) * 255);
}

function linear8ToLinear01(v8) {
  return clamp(Number(v8), 0, 255) / 255;
}

function srgb8ToLinearRgb([R, G, B]) {
  return [
    srgb8ToLinearChannel(R),
    srgb8ToLinearChannel(G),
    srgb8ToLinearChannel(B),
  ];
}

function linearRgbToSrgb8([r, g, b]) {
  return [
    linear01ToSrgb8(r),
    linear01ToSrgb8(g),
    linear01ToSrgb8(b),
  ];
}

function linearRgbToLinear8([r, g, b]) {
  return [
    linear01ToLinear8(r),
    linear01ToLinear8(g),
    linear01ToLinear8(b),
  ];
}

function linear8ToLinearRgb([r8, g8, b8]) {
  return [
    linear8ToLinear01(r8),
    linear8ToLinear01(g8),
    linear8ToLinear01(b8),
  ];
}

function rgbToHsl(R, G, B) {
  const r = clamp(Number(R), 0, 255) / 255;
  const g = clamp(Number(G), 0, 255) / 255;
  const b = clamp(Number(B), 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5
          ? d / (2 - max - min)
          : d / (max - min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b
                             ? 6
                             : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToRgb(H, S, L) {
  const h = Number(H) / 360;
  const s = clamp(Number(S), 0, 100) / 100;
  const l = clamp(Number(L), 0, 100) / 100;

  if (s === 0) {
    const v = Math.round(l * 255);

    return [v, v, v];
  }

  const q = l < 0.5
              ? l * (1 + s)
              : l + s - l * s;
  const p = 2 * l - q;

  const hueToRgb = (a, b, c) => {
    if (c < 0) c += 1;
    if (c > 1) c -= 1;
    if (c < 1 / 6) return a + (b - a) * 6 * c;
    if (c < 1 / 2) return b;
    if (c < 2 / 3) return a + (b - a) * (2 / 3 - c) * 6;

    return p;
  };

  const r = hueToRgb(p, q, h + 1 / 3);
  const g = hueToRgb(p, q, h);
  const b = hueToRgb(p, q, h - 1 / 3);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsv(R, G, B) {
  const r = clamp(Number(R), 0, 255) / 255;
  const g = clamp(Number(G), 0, 255) / 255;
  const b = clamp(Number(B), 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  let h = 0;
  let s = 0;

  const d = max - min;
  if (max === 0) {
    s = 0;
  } else {
    s = d / max;
  }

  if (d === 0) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b
                             ? 6
                             : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, v * 100];
}

function hsvToRgb(H, S, V) {
  const h = (((Number(H) % 360) + 360) % 360) / 360;
  const s = clamp(Number(S), 0, 100) / 100;
  const v = clamp(Number(V), 0, 100) / 100;

  if (s === 0) {
    const val = Math.round(v * 255);

    return [val, val, val];
  }

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0;
  let g = 0;
  let b = 0;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToCmyk(R, G, B) {
  const r = Math.max(0, Math.min(255, Math.round(Number(R))));
  const g = Math.max(0, Math.min(255, Math.round(Number(G))));
  const b = Math.max(0, Math.min(255, Math.round(Number(B))));

  if (r === 0 && g === 0 && b === 0) {
    return [0, 0, 0, 100];
  }

  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);

  return [c * 100, m * 100, y * 100, k * 100];
}

function cmykToRgb(c, m, y, k) {
  c = clamp(Number(c), 0, 100);
  m = clamp(Number(m), 0, 100);
  y = clamp(Number(y), 0, 100);
  k = clamp(Number(k), 0, 100);

  const C = c / 100;
  const M = m / 100;
  const Y = y / 100;
  const K = k / 100;

  const r = Math.round(255 * (1 - C) * (1 - K));
  const g = Math.round(255 * (1 - M) * (1 - K));
  const b = Math.round(255 * (1 - Y) * (1 - K));

  return [r, g, b];
}

function rgbToOklab_linear01(r, g, b) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_c = Math.cbrt(l);
  const m_c = Math.cbrt(m);
  const s_c = Math.cbrt(s);

  const L = 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c;
  const a = 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c;
  const bV = 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c;

  return [L * 100, a * 100, bV * 100];
}

function oklabToRgb_linear01(oklab_L, oklab_a, oklab_b) {
  const L = Number(oklab_L) / 100;
  const a = Number(oklab_a) / 100;
  const b = Number(oklab_b) / 100;

  const l_c = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_c = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_c = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_c * l_c * l_c;
  const m = m_c * m_c * m_c;
  const s = s_c * s_c * s_c;

  const rgb_r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const rgb_g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const rgb_b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  return [rgb_r, rgb_g, rgb_b];
}

function rgbToYCbCr_limited(r, g, b) {
  const Kr = 0.2126;
  const Kg = 0.7152;
  const Kb = 0.0722;

  const Y_MIN = 16.0;
  const Y_MAX = 235.0;
  const C_MIN = 16.0;
  const C_MAX = 240.0;

  const Y_SCALE = (Y_MAX - Y_MIN);
  const C_SCALE = (C_MAX - C_MIN);
  const C_MID = (C_MIN + C_MAX) / 2.0;

  r = Number(r);
  g = Number(g);
  b = Number(b);

  const Yf = Kr * r + Kg * g + Kb * b;

  const denomCb = 2 * (1 - Kb);
  const denomCr = 2 * (1 - Kr);

  const CbF = (b - Yf) / denomCb;
  const CrF = (r - Yf) / denomCr;

  const Yint = Y_MIN + Yf * Y_SCALE;
  const CbInt = C_MID + CbF * C_SCALE;
  const CrInt = C_MID + CrF * C_SCALE;

  return [Yint, CbInt, CrInt];
}

function ycbcrToRgb_limited(Yint, CbInt, CrInt) {
  const Kr = 0.2126;
  const Kg = 0.7152;
  const Kb = 0.0722;

  const Y_MIN = 16.0;
  const Y_MAX = 235.0;
  const C_MIN = 16.0;
  const C_MAX = 240.0;

  const Y_SCALE = (Y_MAX - Y_MIN);
  const C_SCALE = (C_MAX - C_MIN);
  const C_MID = (C_MIN + C_MAX) / 2.0;

  Yint = Number(Yint);
  CbInt = Number(CbInt);
  CrInt = Number(CrInt);

  const Yf = (Yint - Y_MIN) / Y_SCALE;
  const CbF = (CbInt - C_MID) / C_SCALE;
  const CrF = (CrInt - C_MID) / C_SCALE;

  const b = Yf + 2 * (1 - Kb) * CbF;
  const r = Yf + 2 * (1 - Kr) * CrF;
  const g = (Yf - Kr * r - Kb * b) / Kg;

  return [r, g, b];
}

function oklchToAb(L, C, h) {
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  return [a, b];
}

function oklchToRgb_linear01(L100, C, hDeg) {
  const [L, a, b] = oklchToOklab(L100, C, hDeg);

  return oklabToRgb_linear01(L, a, b);
}

function oklchToOklab(L100, C, hDeg) {
  const L = L100 / 100;
  const h = (hDeg * Math.PI) / 180;

  return [
    L,
    C * Math.cos(h),
    C * Math.sin(h),
  ];
}

function rgbToOklch_linear01(r, g, b) {
  const [L, a, bV] = rgbToOklab_linear01(r, g, b);
  const C = Math.sqrt(a * a + bV * bV);
  let h = (Math.atan2(bV, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return [L * 100, C, h];
}

function splashToRgb(splash) {
  const rgbColoursList = [
    [  0,   0, 0], [  0,   0, 28], [  0,   0, 56], [  0,   0, 85], [  0,   0, 113], [  0,   0, 141], [  0,   0, 170], [  0,   0, 198], [  0,   0, 226], [  0,   0, 255],
    [  0,  28, 0], [  0,  28, 28], [  0,  28, 56], [  0,  28, 85], [  0,  28, 113], [  0,  28, 141], [  0,  28, 170], [  0,  28, 198], [  0,  28, 226], [  0,  28, 255],
    [  0,  56, 0], [  0,  56, 28], [  0,  56, 56], [  0,  56, 85], [  0,  56, 113], [  0,  56, 141], [  0,  56, 170], [  0,  56, 198], [  0,  56, 226], [  0,  56, 255],
    [  0,  85, 0], [  0,  85, 28], [  0,  85, 56], [  0,  85, 85], [  0,  85, 113], [  0,  85, 141], [  0,  85, 170], [  0,  85, 198], [  0,  85, 226], [  0,  85, 255],
    [  0, 113, 0], [  0, 113, 28], [  0, 113, 56], [  0, 113, 85], [  0, 113, 113], [  0, 113, 141], [  0, 113, 170], [  0, 113, 198], [  0, 113, 226], [  0, 113, 255],
    [  0, 141, 0], [  0, 141, 28], [  0, 141, 56], [  0, 141, 85], [  0, 141, 113], [  0, 141, 141], [  0, 141, 170], [  0, 141, 198], [  0, 141, 226], [  0, 141, 255],
    [  0, 170, 0], [  0, 170, 28], [  0, 170, 56], [  0, 170, 85], [  0, 170, 113], [  0, 170, 141], [  0, 170, 170], [  0, 170, 198], [  0, 170, 226], [  0, 170, 255],
    [  0, 198, 0], [  0, 198, 28], [  0, 198, 56], [  0, 198, 85], [  0, 198, 113], [  0, 198, 141], [  0, 198, 170], [  0, 198, 198], [  0, 198, 226], [  0, 198, 255],
    [  0, 226, 0], [  0, 226, 28], [  0, 226, 56], [  0, 226, 85], [  0, 226, 113], [  0, 226, 141], [  0, 226, 170], [  0, 226, 198], [  0, 226, 226], [  0, 226, 255],
    [  0, 255, 0], [  0, 255, 28], [  0, 255, 56], [  0, 255, 85], [  0, 255, 113], [  0, 255, 141], [  0, 255, 170], [  0, 255, 198], [  0, 255, 226], [  0, 255, 255],
    [ 28,   0, 0], [ 28,   0, 28], [ 28,   0, 56], [ 28,   0, 85], [ 28,   0, 113], [ 28,   0, 141], [ 28,   0, 170], [ 28,   0, 198], [ 28,   0, 226], [ 28,   0, 255],
    [ 28,  28, 0], [ 28,  28, 28], [ 28,  28, 56], [ 28,  28, 85], [ 28,  28, 113], [ 28,  28, 141], [ 28,  28, 170], [ 28,  28, 198], [ 28,  28, 226], [ 28,  28, 255],
    [ 28,  56, 0], [ 28,  56, 28], [ 28,  56, 56], [ 28,  56, 85], [ 28,  56, 113], [ 28,  56, 141], [ 28,  56, 170], [ 28,  56, 198], [ 28,  56, 226], [ 28,  56, 255],
    [ 28,  85, 0], [ 28,  85, 28], [ 28,  85, 56], [ 28,  85, 85], [ 28,  85, 113], [ 28,  85, 141], [ 28,  85, 170], [ 28,  85, 198], [ 28,  85, 226], [ 28,  85, 255],
    [ 28, 113, 0], [ 28, 113, 28], [ 28, 113, 56], [ 28, 113, 85], [ 28, 113, 113], [ 28, 113, 141], [ 28, 113, 170], [ 28, 113, 198], [ 28, 113, 226], [ 28, 113, 255],
    [ 28, 141, 0], [ 28, 141, 28], [ 28, 141, 56], [ 28, 141, 85], [ 28, 141, 113], [ 28, 141, 141], [ 28, 141, 170], [ 28, 141, 198], [ 28, 141, 226], [ 28, 141, 255],
    [ 28, 170, 0], [ 28, 170, 28], [ 28, 170, 56], [ 28, 170, 85], [ 28, 170, 113], [ 28, 170, 141], [ 28, 170, 170], [ 28, 170, 198], [ 28, 170, 226], [ 28, 170, 255],
    [ 28, 198, 0], [ 28, 198, 28], [ 28, 198, 56], [ 28, 198, 85], [ 28, 198, 113], [ 28, 198, 141], [ 28, 198, 170], [ 28, 198, 198], [ 28, 198, 226], [ 28, 198, 255],
    [ 28, 226, 0], [ 28, 226, 28], [ 28, 226, 56], [ 28, 226, 85], [ 28, 226, 113], [ 28, 226, 141], [ 28, 226, 170], [ 28, 226, 198], [ 28, 226, 226], [ 28, 226, 255],
    [ 28, 255, 0], [ 28, 255, 28], [ 28, 255, 56], [ 28, 255, 85], [ 28, 255, 113], [ 28, 255, 141], [ 28, 255, 170], [ 28, 255, 198], [ 28, 255, 226], [ 28, 255, 255],
    [ 56,   0, 0], [ 56,   0, 28], [ 56,   0, 56], [ 56,   0, 85], [ 56,   0, 113], [ 56,   0, 141], [ 56,   0, 170], [ 56,   0, 198], [ 56,   0, 226], [ 56,   0, 255],
    [ 56,  28, 0], [ 56,  28, 28], [ 56,  28, 56], [ 56,  28, 85], [ 56,  28, 113], [ 56,  28, 141], [ 56,  28, 170], [ 56,  28, 198], [ 56,  28, 226], [ 56,  28, 255],
    [ 56,  56, 0], [ 56,  56, 28], [ 56,  56, 56], [ 56,  56, 85], [ 56,  56, 113], [ 56,  56, 141], [ 56,  56, 170], [ 56,  56, 198], [ 56,  56, 226], [ 56,  56, 255],
    [ 56,  85, 0], [ 56,  85, 28], [ 56,  85, 56], [ 56,  85, 85], [ 56,  85, 113], [ 56,  85, 141], [ 56,  85, 170], [ 56,  85, 198], [ 56,  85, 226], [ 56,  85, 255],
    [ 56, 113, 0], [ 56, 113, 28], [ 56, 113, 56], [ 56, 113, 85], [ 56, 113, 113], [ 56, 113, 141], [ 56, 113, 170], [ 56, 113, 198], [ 56, 113, 226], [ 56, 113, 255],
    [ 56, 141, 0], [ 56, 141, 28], [ 56, 141, 56], [ 56, 141, 85], [ 56, 141, 113], [ 56, 141, 141], [ 56, 141, 170], [ 56, 141, 198], [ 56, 141, 226], [ 56, 141, 255],
    [ 56, 170, 0], [ 56, 170, 28], [ 56, 170, 56], [ 56, 170, 85], [ 56, 170, 113], [ 56, 170, 141], [ 56, 170, 170], [ 56, 170, 198], [ 56, 170, 226], [ 56, 170, 255],
    [ 56, 198, 0], [ 56, 198, 28], [ 56, 198, 56], [ 56, 198, 85], [ 56, 198, 113], [ 56, 198, 141], [ 56, 198, 170], [ 56, 198, 198], [ 56, 198, 226], [ 56, 198, 255],
    [ 56, 226, 0], [ 56, 226, 28], [ 56, 226, 56], [ 56, 226, 85], [ 56, 226, 113], [ 56, 226, 141], [ 56, 226, 170], [ 56, 226, 198], [ 56, 226, 226], [ 56, 226, 255],
    [ 56, 255, 0], [ 56, 255, 28], [ 56, 255, 56], [ 56, 255, 85], [ 56, 255, 113], [ 56, 255, 141], [ 56, 255, 170], [ 56, 255, 198], [ 56, 255, 226], [ 56, 255, 255],
    [ 85,   0, 0], [ 85,   0, 28], [ 85,   0, 56], [ 85,   0, 85], [ 85,   0, 113], [ 85,   0, 141], [ 85,   0, 170], [ 85,   0, 198], [ 85,   0, 226], [ 85,   0, 255],
    [ 85,  28, 0], [ 85,  28, 28], [ 85,  28, 56], [ 85,  28, 85], [ 85,  28, 113], [ 85,  28, 141], [ 85,  28, 170], [ 85,  28, 198], [ 85,  28, 226], [ 85,  28, 255],
    [ 85,  56, 0], [ 85,  56, 28], [ 85,  56, 56], [ 85,  56, 85], [ 85,  56, 113], [ 85,  56, 141], [ 85,  56, 170], [ 85,  56, 198], [ 85,  56, 226], [ 85,  56, 255],
    [ 85,  85, 0], [ 85,  85, 28], [ 85,  85, 56], [ 85,  85, 85], [ 85,  85, 113], [ 85,  85, 141], [ 85,  85, 170], [ 85,  85, 198], [ 85,  85, 226], [ 85,  85, 255],
    [ 85, 113, 0], [ 85, 113, 28], [ 85, 113, 56], [ 85, 113, 85], [ 85, 113, 113], [ 85, 113, 141], [ 85, 113, 170], [ 85, 113, 198], [ 85, 113, 226], [ 85, 113, 255],
    [ 85, 141, 0], [ 85, 141, 28], [ 85, 141, 56], [ 85, 141, 85], [ 85, 141, 113], [ 85, 141, 141], [ 85, 141, 170], [ 85, 141, 198], [ 85, 141, 226], [ 85, 141, 255],
    [ 85, 170, 0], [ 85, 170, 28], [ 85, 170, 56], [ 85, 170, 85], [ 85, 170, 113], [ 85, 170, 141], [ 85, 170, 170], [ 85, 170, 198], [ 85, 170, 226], [ 85, 170, 255],
    [ 85, 198, 0], [ 85, 198, 28], [ 85, 198, 56], [ 85, 198, 85], [ 85, 198, 113], [ 85, 198, 141], [ 85, 198, 170], [ 85, 198, 198], [ 85, 198, 226], [ 85, 198, 255],
    [ 85, 226, 0], [ 85, 226, 28], [ 85, 226, 56], [ 85, 226, 85], [ 85, 226, 113], [ 85, 226, 141], [ 85, 226, 170], [ 85, 226, 198], [ 85, 226, 226], [ 85, 226, 255],
    [ 85, 255, 0], [ 85, 255, 28], [ 85, 255, 56], [ 85, 255, 85], [ 85, 255, 113], [ 85, 255, 141], [ 85, 255, 170], [ 85, 255, 198], [ 85, 255, 226], [ 85, 255, 255],
    [113,   0, 0], [113,   0, 28], [113,   0, 56], [113,   0, 85], [113,   0, 113], [113,   0, 141], [113,   0, 170], [113,   0, 198], [113,   0, 226], [113,   0, 255],
    [113,  28, 0], [113,  28, 28], [113,  28, 56], [113,  28, 85], [113,  28, 113], [113,  28, 141], [113,  28, 170], [113,  28, 198], [113,  28, 226], [113,  28, 255],
    [113,  56, 0], [113,  56, 28], [113,  56, 56], [113,  56, 85], [113,  56, 113], [113,  56, 141], [113,  56, 170], [113,  56, 198], [113,  56, 226], [113,  56, 255],
    [113,  85, 0], [113,  85, 28], [113,  85, 56], [113,  85, 85], [113,  85, 113], [113,  85, 141], [113,  85, 170], [113,  85, 198], [113,  85, 226], [113,  85, 255],
    [113, 113, 0], [113, 113, 28], [113, 113, 56], [113, 113, 85], [113, 113, 113], [113, 113, 141], [113, 113, 170], [113, 113, 198], [113, 113, 226], [113, 113, 255],
    [113, 141, 0], [113, 141, 28], [113, 141, 56], [113, 141, 85], [113, 141, 113], [113, 141, 141], [113, 141, 170], [113, 141, 198], [113, 141, 226], [113, 141, 255],
    [113, 170, 0], [113, 170, 28], [113, 170, 56], [113, 170, 85], [113, 170, 113], [113, 170, 141], [113, 170, 170], [113, 170, 198], [113, 170, 226], [113, 170, 255],
    [113, 198, 0], [113, 198, 28], [113, 198, 56], [113, 198, 85], [113, 198, 113], [113, 198, 141], [113, 198, 170], [113, 198, 198], [113, 198, 226], [113, 198, 255],
    [113, 226, 0], [113, 226, 28], [113, 226, 56], [113, 226, 85], [113, 226, 113], [113, 226, 141], [113, 226, 170], [113, 226, 198], [113, 226, 226], [113, 226, 255],
    [113, 255, 0], [113, 255, 28], [113, 255, 56], [113, 255, 85], [113, 255, 113], [113, 255, 141], [113, 255, 170], [113, 255, 198], [113, 255, 226], [113, 255, 255],
    [141,   0, 0], [141,   0, 28], [141,   0, 56], [141,   0, 85], [141,   0, 113], [141,   0, 141], [141,   0, 170], [141,   0, 198], [141,   0, 226], [141,   0, 255],
    [141,  28, 0], [141,  28, 28], [141,  28, 56], [141,  28, 85], [141,  28, 113], [141,  28, 141], [141,  28, 170], [141,  28, 198], [141,  28, 226], [141,  28, 255],
    [141,  56, 0], [141,  56, 28], [141,  56, 56], [141,  56, 85], [141,  56, 113], [141,  56, 141], [141,  56, 170], [141,  56, 198], [141,  56, 226], [141,  56, 255],
    [141,  85, 0], [141,  85, 28], [141,  85, 56], [141,  85, 85], [141,  85, 113], [141,  85, 141], [141,  85, 170], [141,  85, 198], [141,  85, 226], [141,  85, 255],
    [141, 113, 0], [141, 113, 28], [141, 113, 56], [141, 113, 85], [141, 113, 113], [141, 113, 141], [141, 113, 170], [141, 113, 198], [141, 113, 226], [141, 113, 255],
    [141, 141, 0], [141, 141, 28], [141, 141, 56], [141, 141, 85], [141, 141, 113], [141, 141, 141], [141, 141, 170], [141, 141, 198], [141, 141, 226], [141, 141, 255],
    [141, 170, 0], [141, 170, 28], [141, 170, 56], [141, 170, 85], [141, 170, 113], [141, 170, 141], [141, 170, 170], [141, 170, 198], [141, 170, 226], [141, 170, 255],
    [141, 198, 0], [141, 198, 28], [141, 198, 56], [141, 198, 85], [141, 198, 113], [141, 198, 141], [141, 198, 170], [141, 198, 198], [141, 198, 226], [141, 198, 255],
    [141, 226, 0], [141, 226, 28], [141, 226, 56], [141, 226, 85], [141, 226, 113], [141, 226, 141], [141, 226, 170], [141, 226, 198], [141, 226, 226], [141, 226, 255],
    [141, 255, 0], [141, 255, 28], [141, 255, 56], [141, 255, 85], [141, 255, 113], [141, 255, 141], [141, 255, 170], [141, 255, 198], [141, 255, 226], [141, 255, 255],
    [170,   0, 0], [170,   0, 28], [170,   0, 56], [170,   0, 85], [170,   0, 113], [170,   0, 141], [170,   0, 170], [170,   0, 198], [170,   0, 226], [170,   0, 255],
    [170,  28, 0], [170,  28, 28], [170,  28, 56], [170,  28, 85], [170,  28, 113], [170,  28, 141], [170,  28, 170], [170,  28, 198], [170,  28, 226], [170,  28, 255],
    [170,  56, 0], [170,  56, 28], [170,  56, 56], [170,  56, 85], [170,  56, 113], [170,  56, 141], [170,  56, 170], [170,  56, 198], [170,  56, 226], [170,  56, 255],
    [170,  85, 0], [170,  85, 28], [170,  85, 56], [170,  85, 85], [170,  85, 113], [170,  85, 141], [170,  85, 170], [170,  85, 198], [170,  85, 226], [170,  85, 255],
    [170, 113, 0], [170, 113, 28], [170, 113, 56], [170, 113, 85], [170, 113, 113], [170, 113, 141], [170, 113, 170], [170, 113, 198], [170, 113, 226], [170, 113, 255],
    [170, 141, 0], [170, 141, 28], [170, 141, 56], [170, 141, 85], [170, 141, 113], [170, 141, 141], [170, 141, 170], [170, 141, 198], [170, 141, 226], [170, 141, 255],
    [170, 170, 0], [170, 170, 28], [170, 170, 56], [170, 170, 85], [170, 170, 113], [170, 170, 141], [170, 170, 170], [170, 170, 198], [170, 170, 226], [170, 170, 255],
    [170, 198, 0], [170, 198, 28], [170, 198, 56], [170, 198, 85], [170, 198, 113], [170, 198, 141], [170, 198, 170], [170, 198, 198], [170, 198, 226], [170, 198, 255],
    [170, 226, 0], [170, 226, 28], [170, 226, 56], [170, 226, 85], [170, 226, 113], [170, 226, 141], [170, 226, 170], [170, 226, 198], [170, 226, 226], [170, 226, 255],
    [170, 255, 0], [170, 255, 28], [170, 255, 56], [170, 255, 85], [170, 255, 113], [170, 255, 141], [170, 255, 170], [170, 255, 198], [170, 255, 226], [170, 255, 255],
    [198,   0, 0], [198,   0, 28], [198,   0, 56], [198,   0, 85], [198,   0, 113], [198,   0, 141], [198,   0, 170], [198,   0, 198], [198,   0, 226], [198,   0, 255],
    [198,  28, 0], [198,  28, 28], [198,  28, 56], [198,  28, 85], [198,  28, 113], [198,  28, 141], [198,  28, 170], [198,  28, 198], [198,  28, 226], [198,  28, 255],
    [198,  56, 0], [198,  56, 28], [198,  56, 56], [198,  56, 85], [198,  56, 113], [198,  56, 141], [198,  56, 170], [198,  56, 198], [198,  56, 226], [198,  56, 255],
    [198,  85, 0], [198,  85, 28], [198,  85, 56], [198,  85, 85], [198,  85, 113], [198,  85, 141], [198,  85, 170], [198,  85, 198], [198,  85, 226], [198,  85, 255],
    [198, 113, 0], [198, 113, 28], [198, 113, 56], [198, 113, 85], [198, 113, 113], [198, 113, 141], [198, 113, 170], [198, 113, 198], [198, 113, 226], [198, 113, 255],
    [198, 141, 0], [198, 141, 28], [198, 141, 56], [198, 141, 85], [198, 141, 113], [198, 141, 141], [198, 141, 170], [198, 141, 198], [198, 141, 226], [198, 141, 255],
    [198, 170, 0], [198, 170, 28], [198, 170, 56], [198, 170, 85], [198, 170, 113], [198, 170, 141], [198, 170, 170], [198, 170, 198], [198, 170, 226], [198, 170, 255],
    [198, 198, 0], [198, 198, 28], [198, 198, 56], [198, 198, 85], [198, 198, 113], [198, 198, 141], [198, 198, 170], [198, 198, 198], [198, 198, 226], [198, 198, 255],
    [198, 226, 0], [198, 226, 28], [198, 226, 56], [198, 226, 85], [198, 226, 113], [198, 226, 141], [198, 226, 170], [198, 226, 198], [198, 226, 226], [198, 226, 255],
    [198, 255, 0], [198, 255, 28], [198, 255, 56], [198, 255, 85], [198, 255, 113], [198, 255, 141], [198, 255, 170], [198, 255, 198], [198, 255, 226], [198, 255, 255],
    [226,   0, 0], [226,   0, 28], [226,   0, 56], [226,   0, 85], [226,   0, 113], [226,   0, 141], [226,   0, 170], [226,   0, 198], [226,   0, 226], [226,   0, 255],
    [226,  28, 0], [226,  28, 28], [226,  28, 56], [226,  28, 85], [226,  28, 113], [226,  28, 141], [226,  28, 170], [226,  28, 198], [226,  28, 226], [226,  28, 255],
    [226,  56, 0], [226,  56, 28], [226,  56, 56], [226,  56, 85], [226,  56, 113], [226,  56, 141], [226,  56, 170], [226,  56, 198], [226,  56, 226], [226,  56, 255],
    [226,  85, 0], [226,  85, 28], [226,  85, 56], [226,  85, 85], [226,  85, 113], [226,  85, 141], [226,  85, 170], [226,  85, 198], [226,  85, 226], [226,  85, 255],
    [226, 113, 0], [226, 113, 28], [226, 113, 56], [226, 113, 85], [226, 113, 113], [226, 113, 141], [226, 113, 170], [226, 113, 198], [226, 113, 226], [226, 113, 255],
    [226, 141, 0], [226, 141, 28], [226, 141, 56], [226, 141, 85], [226, 141, 113], [226, 141, 141], [226, 141, 170], [226, 141, 198], [226, 141, 226], [226, 141, 255],
    [226, 170, 0], [226, 170, 28], [226, 170, 56], [226, 170, 85], [226, 170, 113], [226, 170, 141], [226, 170, 170], [226, 170, 198], [226, 170, 226], [226, 170, 255],
    [226, 198, 0], [226, 198, 28], [226, 198, 56], [226, 198, 85], [226, 198, 113], [226, 198, 141], [226, 198, 170], [226, 198, 198], [226, 198, 226], [226, 198, 255],
    [226, 226, 0], [226, 226, 28], [226, 226, 56], [226, 226, 85], [226, 226, 113], [226, 226, 141], [226, 226, 170], [226, 226, 198], [226, 226, 226], [226, 226, 255],
    [226, 255, 0], [226, 255, 28], [226, 255, 56], [226, 255, 85], [226, 255, 113], [226, 255, 141], [226, 255, 170], [226, 255, 198], [226, 255, 226], [226, 255, 255],
    [255,   0, 0], [255,   0, 28], [255,   0, 56], [255,   0, 85], [255,   0, 113], [255,   0, 141], [255,   0, 170], [255,   0, 198], [255,   0, 226], [255,   0, 255],
    [255,  28, 0], [255,  28, 28], [255,  28, 56], [255,  28, 85], [255,  28, 113], [255,  28, 141], [255,  28, 170], [255,  28, 198], [255,  28, 226], [255,  28, 255],
    [255,  56, 0], [255,  56, 28], [255,  56, 56], [255,  56, 85], [255,  56, 113], [255,  56, 141], [255,  56, 170], [255,  56, 198], [255,  56, 226], [255,  56, 255],
    [255,  85, 0], [255,  85, 28], [255,  85, 56], [255,  85, 85], [255,  85, 113], [255,  85, 141], [255,  85, 170], [255,  85, 198], [255,  85, 226], [255,  85, 255],
    [255, 113, 0], [255, 113, 28], [255, 113, 56], [255, 113, 85], [255, 113, 113], [255, 113, 141], [255, 113, 170], [255, 113, 198], [255, 113, 226], [255, 113, 255],
    [255, 141, 0], [255, 141, 28], [255, 141, 56], [255, 141, 85], [255, 141, 113], [255, 141, 141], [255, 141, 170], [255, 141, 198], [255, 141, 226], [255, 141, 255],
    [255, 170, 0], [255, 170, 28], [255, 170, 56], [255, 170, 85], [255, 170, 113], [255, 170, 141], [255, 170, 170], [255, 170, 198], [255, 170, 226], [255, 170, 255],
    [255, 198, 0], [255, 198, 28], [255, 198, 56], [255, 198, 85], [255, 198, 113], [255, 198, 141], [255, 198, 170], [255, 198, 198], [255, 198, 226], [255, 198, 255],
    [255, 226, 0], [255, 226, 28], [255, 226, 56], [255, 226, 85], [255, 226, 113], [255, 226, 141], [255, 226, 170], [255, 226, 198], [255, 226, 226], [255, 226, 255],
    [255, 255, 0], [255, 255, 28], [255, 255, 56], [255, 255, 85], [255, 255, 113], [255, 255, 141], [255, 255, 170], [255, 255, 198], [255, 255, 226], [255, 255, 255],
  ];

  return rgbColoursList[splash];
}

const rgbRed = document.getElementById('rgb-red');
const rgbGreen = document.getElementById('rgb-green');
const rgbBlue = document.getElementById('rgb-blue');

const hslHue = document.getElementById('hsl-hue');
const hslSaturation = document.getElementById('hsl-saturation');
const hslLightness = document.getElementById('hsl-lightness');

const hsvHue = document.getElementById('hsv-hue');
const hsvSaturation = document.getElementById('hsv-saturation');
const hsvValue = document.getElementById('hsv-value');

const cmykCyan = document.getElementById('cmyk-cyan');
const cmykMagenta = document.getElementById('cmyk-magenta');
const cmykYellow = document.getElementById('cmyk-yellow');
const cmykBlack = document.getElementById('cmyk-black');

const srgbRed = document.getElementById('srgb-red');
const srgbGreen = document.getElementById('srgb-green');
const srgbBlue = document.getElementById('srgb-blue');

const oklabL = document.getElementById('oklab-l');
const oklabA = document.getElementById('oklab-a');
const oklabB = document.getElementById('oklab-b');

const oklchL = document.getElementById('oklch-l');
const oklchC = document.getElementById('oklch-c');
const oklchH = document.getElementById('oklch-h');

const ycbcrY = document.getElementById('ycbcr-y');
const ycbcrCb = document.getElementById('ycbcr-cb');
const ycbcrCr = document.getElementById('ycbcr-cr');

const rgbRedVal = document.getElementById('rgb-r-val');
const rgbGreenVal = document.getElementById('rgb-g-val');
const rgbBlueVal = document.getElementById('rgb-b-val');

const hslHueVal = document.getElementById('hsl-h-val');
const hslSaturationVal = document.getElementById('hsl-s-val');
const hslLightnessVal = document.getElementById('hsl-l-val');

const hsvHueVal = document.getElementById('hsv-hue');
const hsvSaturationVal = document.getElementById('hsv-saturation');
const hsvValueVal = document.getElementById('hsv-value');

const cmykCyanVal = document.getElementById('cmyk-c-val');
const cmykMagentaVal = document.getElementById('cmyk-m-val');
const cmykYellowVal = document.getElementById('cmyk-y-val');
const cmykBlackVal = document.getElementById('cmyk-k-val');

const srgbRedVal = document.getElementById('srgb-r-val');
const srgbGreenVal = document.getElementById('srgb-g-val');
const srgbBlueVal = document.getElementById('srgb-b-val');

const oklabLVal = document.getElementById('oklab-l-val');
const oklabAVal = document.getElementById('oklab-a-val');
const oklabBVal = document.getElementById('oklab-b-val');

const oklchLVal = document.getElementById('oklch-l-val');
const oklchCVal = document.getElementById('oklch-c-val');
const oklchHVal = document.getElementById('oklch-h-val');

const ycbcrYVal = document.getElementById('ycbcr-y-val');
const ycbcrCbVal = document.getElementById('ycbcr-cb-val');
const ycbcrCrVal = document.getElementById('ycbcr-cr-val');

const rgbAxis = document.getElementById('rgb-axis');
const hslAxis = document.getElementById('hsl-axis');
const hsvAxis = document.getElementById('hsv-axis');
const srgbAxis = document.getElementById('srgb-axis');
const cmykAxis = document.getElementById('cmyk-axis');
const oklabAxis = document.getElementById('oklab-axis');
const oklchAxis = document.getElementById('oklch-axis');
const ycbcrAxis = document.getElementById('ycbcr-axis');

function updateValues(rgbR, rgbG, rgbB,
                      hslH, hslS, hslL,
                      hsvH, hsvS, hsvV,
                      cmykC, cmykM, cmykY, cmykK,
                      srgbR_lin8, srgbG_lin8, srgbB_lin8,
                      okLabL, okLabA, okLabB,
                      okLchL, okLchC, okLchH,
                      ycbcrY, ycbcrCb, ycbcrCr) {
  rgbRed.value = Math.round(clamp(Number(rgbR), 0, 255));
  rgbGreen.value = Math.round(clamp(Number(rgbG), 0, 255));
  rgbBlue.value = Math.round(clamp(Number(rgbB), 0, 255));

  hslHue.value = Math.round(clamp(Number(hslH), 0, 360));
  hslSaturation.value = clamp(Number(hslS), 0, 100);
  hslLightness.value = clamp(Number(hslL), 0, 100);

  hsvHue.value = Math.round(clamp(Number(hsvH), 0, 360));
  hsvSaturation.value = clamp(Number(hsvS), 0, 100);
  hsvValue.value = clamp(Number(hsvV), 0, 100);

  cmykCyan.value = clamp(Number(cmykC), 0, 100);
  cmykMagenta.value = clamp(Number(cmykM), 0, 100);
  cmykYellow.value = clamp(Number(cmykY), 0, 100);
  cmykBlack.value = clamp(Number(cmykK), 0, 100);

  srgbRed.value = Math.round(clamp(Number(srgbR_lin8), 0, 255));
  srgbGreen.value = Math.round(clamp(Number(srgbG_lin8), 0, 255));
  srgbBlue.value = Math.round(clamp(Number(srgbB_lin8), 0, 255));

  oklabL.value = clamp(Number(okLabL), 0, 100);
  oklabA.value = clamp(Number(okLabA), -150, 150);
  oklabB.value = clamp(Number(okLabB), -150, 150);

  oklchL.value = clamp(Number(okLchL), 0, 100);
  oklchC.value = clamp(Number(okLchC), 0, 100);
  oklchH.value = clamp(Number(okLchH), 0, 360);

  rgbRedVal.textContent = Math.round(clamp(Number(rgbR), 0, 255));
  rgbGreenVal.textContent = Math.round(clamp(Number(rgbG), 0, 255));
  rgbBlueVal.textContent = Math.round(clamp(Number(rgbB), 0, 255));

  hslHueVal.textContent = Math.round(clamp(Number(hslH), 0, 360));
  hslSaturationVal.textContent = Math.round(clamp(Number(hslS), 0, 100));
  hslLightnessVal.textContent = Math.round(clamp(Number(hslL), 0, 100));

  hsvHueVal.textContent = Math.round(clamp(Number(hsvH), 0, 360));
  hsvSaturationVal.textContent = Math.round(clamp(Number(hsvS), 0, 100));
  hsvValueVal.textContent = Math.round(clamp(Number(hsvV), 0, 100));

  cmykCyanVal.textContent = Math.round(clamp(Number(cmykC), 0, 100));
  cmykMagentaVal.textContent = Math.round(clamp(Number(cmykM), 0, 100));
  cmykYellowVal.textContent = Math.round(clamp(Number(cmykY), 0, 100));
  cmykBlackVal.textContent = Math.round(clamp(Number(cmykK), 0, 100));

  srgbRedVal.textContent = Math.round(clamp(Number(srgbR_lin8), 0, 255));
  srgbGreenVal.textContent = Math.round(clamp(Number(srgbG_lin8), 0, 255));
  srgbBlueVal.textContent = Math.round(clamp(Number(srgbB_lin8), 0, 255));

  oklabLVal.textContent = Number(okLabL).toFixed(3);
  oklabAVal.textContent = Number(okLabA).toFixed(3);
  oklabBVal.textContent = Number(okLabB).toFixed(3);

  oklchLVal.textContent = clamp(Number(okLchL), 0, 100);
  oklchCVal.textContent = clamp(Number(okLchC), 0, 100);
  oklchHVal.textContent = clamp(Number(okLchH), 0, 360);

  ycbcrYVal.textContent = Number(ycbcrY).toFixed(3);
  ycbcrCbVal.textContent = Number(ycbcrCb).toFixed(3);
  ycbcrCrVal.textContent = Number(ycbcrCr).toFixed(3);

  switch (rgbAxis.value) {
    case 'r':
      renderColorSliceUnified({
        canvas: document.getElementById('rgb-canvas'),
        width: 256,
        height: 256,
        space: 'rgb',
        xChannel: 'g',
        yChannel: 'b',
        locked: { r: rgbR },
        markerSpace: [rgbR, rgbG, rgbB],
      });
      break;
    case 'g':
      renderColorSliceUnified({
        canvas: document.getElementById('rgb-canvas'),
        width: 256,
        height: 256,
        space: 'rgb',
        xChannel: 'r',
        yChannel: 'b',
        locked: { g: rgbG },
        markerSpace: [rgbR, rgbG, rgbB],
      });
      break;
    case 'b':
      renderColorSliceUnified({
        canvas: document.getElementById('rgb-canvas'),
        width: 256,
        height: 256,
        space: 'rgb',
        xChannel: 'r',
        yChannel: 'g',
        locked: { b: rgbB },
        markerSpace: [rgbR, rgbG, rgbB],
      });
      break;
  }

  switch (srgbAxis.value) {
    case 'r':
      renderColorSliceUnified({
        canvas: document.getElementById('srgb-canvas'),
        width: 256,
        height: 256,
        space: 'srgb',
        xChannel: 'g',
        yChannel: 'b',
        locked: { r: srgbR_lin8 },
        markerSpace: [srgbR_lin8, srgbG_lin8, srgbB_lin8],
      });
      break;
    case 'g':
      renderColorSliceUnified({
        canvas: document.getElementById('srgb-canvas'),
        width: 256,
        height: 256,
        space: 'srgb',
        xChannel: 'r',
        yChannel: 'b',
        locked: { g: srgbG_lin8 },
        markerSpace: [srgbR_lin8, srgbG_lin8, srgbB_lin8],
      });
      break;
    case 'b':
      renderColorSliceUnified({
        canvas: document.getElementById('srgb-canvas'),
        width: 256,
        height: 256,
        space: 'srgb',
        xChannel: 'r',
        yChannel: 'g',
        locked: { b: srgbB_lin8 },
        markerSpace: [srgbR_lin8, srgbG_lin8, srgbB_lin8],
      });
      break;
  }

  switch (hslAxis.value) {
    case 'h':
      renderColorSliceUnified({
        canvas: document.getElementById('hsl-canvas'),
        width: 256,
        height: 256,
        space: 'hsl',
        xChannel: 's',
        yChannel: 'l',
        locked: { h: hslH },
        markerSpace: [hslH, hslS, hslL],
      });
      break;
    case 's':
      renderColorSliceUnified({
        canvas: document.getElementById('hsl-canvas'),
        width: 256,
        height: 256,
        space: 'hsl',
        xChannel: 'h',
        yChannel: 'l',
        locked: { s: hslS },
        markerSpace: [hslH, hslS, hslL],
      });
      break;
    case 'l':
      renderColorSliceUnified({
        canvas: document.getElementById('hsl-canvas'),
        width: 256,
        height: 256,
        space: 'hsl',
        xChannel: 'h',
        yChannel: 's',
        locked: { l: hslL },
        markerSpace: [hslH, hslS, hslL],
      });
      break;
  }

  switch (hsvAxis.value) {
    case 'h':
      renderColorSliceUnified({
        canvas: document.getElementById('hsv-canvas'),
        width: 256,
        height: 256,
        space: 'hsv',
        xChannel: 's',
        yChannel: 'v',
        locked: { h: hsvH },
        markerSpace: [hsvH, hsvS, hsvV],
      });
      break;
    case 's':
      renderColorSliceUnified({
        canvas: document.getElementById('hsv-canvas'),
        width: 256,
        height: 256,
        space: 'hsv',
        xChannel: 'h',
        yChannel: 'v',
        locked: { s: hsvS },
        markerSpace: [hsvH, hsvS, hsvV],
      });
      break;
    case 'v':
      renderColorSliceUnified({
        canvas: document.getElementById('hsv-canvas'),
        width: 256,
        height: 256,
        space: 'hsv',
        xChannel: 'h',
        yChannel: 's',
        locked: { v: hsvV },
        markerSpace: [hsvH, hsvS, hsvV],
      });
      break;
  }

  switch (cmykAxis.value) {
    case 'c-m':
      renderColorSliceUnified({
        canvas: document.getElementById('cmyk-canvas'),
        width: 256,
        height: 256,
        space: 'cmyk',
        xChannel: 'y',
        yChannel: 'k',
        locked: { c: cmykC, m: cmykM },
        markerSpace: [cmykC, cmykM, cmykY, cmykK],
      });
      break;
    case 'c-y':
      renderColorSliceUnified({
        canvas: document.getElementById('cmyk-canvas'),
        width: 256,
        height: 256,
        space: 'cmyk',
        xChannel: 'm',
        yChannel: 'k',
        locked: { c: cmykC, y: cmykY },
        markerSpace: [cmykC, cmykM, cmykY, cmykK],
      });
      break;
    case 'c-k':
      renderColorSliceUnified({
        canvas: document.getElementById('cmyk-canvas'),
        width: 256,
        height: 256,
        space: 'cmyk',
        xChannel: 'm',
        yChannel: 'y',
        locked: { c: cmykC, k: cmykK },
        markerSpace: [cmykC, cmykM, cmykY, cmykK],
      });
      break;
    case 'm-y':
      renderColorSliceUnified({
        canvas: document.getElementById('cmyk-canvas'),
        width: 256,
        height: 256,
        space: 'cmyk',
        xChannel: 'c',
        yChannel: 'k',
        locked: { m: cmykM, y: cmykY },
        markerSpace: [cmykC, cmykM, cmykY, cmykK],
      });
      break;
    case 'm-k':
      renderColorSliceUnified({
        canvas: document.getElementById('cmyk-canvas'),
        width: 256,
        height: 256,
        space: 'cmyk',
        xChannel: 'c',
        yChannel: 'y',
        locked: { m: cmykM, k: cmykK },
        markerSpace: [cmykC, cmykM, cmykY, cmykK],
      });
      break;
    case 'y-k':
      renderColorSliceUnified({
        canvas: document.getElementById('cmyk-canvas'),
        width: 256,
        height: 256,
        space: 'cmyk',
        xChannel: 'c',
        yChannel: 'm',
        locked: { y: cmykY, k: cmykK },
        markerSpace: [cmykC, cmykM, cmykY, cmykK],
      });
      break;
  }

  switch (oklabAxis.value) {
    case 'L':
      renderColorSliceUnified({
        canvas: document.getElementById('oklab-canvas'),
        width: 256,
        height: 256,
        space: 'oklab',
        xChannel: 'a',
        yChannel: 'b',
        locked: { L: okLabL },
        markerSpace: [okLabL, okLabA, okLabB],
      });
      break;
    case 'a':
      renderColorSliceUnified({
        canvas: document.getElementById('oklab-canvas'),
        width: 256,
        height: 256,
        space: 'oklab',
        xChannel: 'L',
        yChannel: 'b',
        locked: { a: okLabA },
        markerSpace: [okLabL, okLabA, okLabB],
      });
      break;
    case 'b':
      renderColorSliceUnified({
        canvas: document.getElementById('oklab-canvas'),
        width: 256,
        height: 256,
        space: 'oklab',
        xChannel: 'L',
        yChannel: 'a',
        locked: { b: okLabB },
        markerSpace: [okLabL, okLabA, okLabB],
      });
      break;
  }
  switch (oklchAxis.value) {
    case 'L':
      renderColorSliceUnified({
        canvas: document.getElementById('oklch-canvas'),
        width: 256,
        height: 256,
        space: 'oklch',
        xChannel: 'c',
        yChannel: 'h',
        locked: { L: okLchL },
        markerSpace: [okLchL, okLchC, okLchH],
      });
      break;
    case 'c':
      renderColorSliceUnified({
        canvas: document.getElementById('oklab-canvas'),
        width: 256,
        height: 256,
        space: 'oklch',
        xChannel: 'L',
        yChannel: 'h',
        locked: { c: okLchC },
        markerSpace: [okLchL, okLchC, okLchH],
      });
      break;
    case 'h':
      renderColorSliceUnified({
        canvas: document.getElementById('oklab-canvas'),
        width: 256,
        height: 256,
        space: 'oklch',
        xChannel: 'L',
        yChannel: 'c',
        locked: { H: okLchH },
        markerSpace: [okLchL, okLchC, okLchH],
      });
      break;
  }
  switch (ycbcrAxis.value) {
    case 'y':
      renderColorSliceUnified({
        canvas: document.getElementById('ycbcr-canvas'),
        width: 256,
        height: 256,
        space: 'ycbcr',
        xChannel: 'Cb',
        yChannel: 'Cr',
        locked: { Y: ycbcrY },
        markerSpace: [ycbcrY, ycbcrCb, ycbcrCr],
      });
      break;
    case 'cb':
      renderColorSliceUnified({
        canvas: document.getElementById('ycbcr-canvas'),
        width: 256,
        height: 256,
        space: 'ycbcr',
        xChannel: 'Y',
        yChannel: 'Cr',
        locked: { Cb: ycbcrCb },
        markerSpace: [ycbcrY, ycbcrCb, ycbcrCr],
      });
      break;
    case 'cr':
      renderColorSliceUnified({
        canvas: document.getElementById('ycbcr-canvas'),
        width: 256,
        height: 256,
        space: 'ycbcr',
        xChannel: 'Y',
        yChannel: 'Cb',
        locked: { Cr: ycbcrCr },
        markerSpace: [ycbcrY, ycbcrCb, ycbcrCr],
      });
      break;
  }
}

function updateFromRgb() {
  const rgb_R = Math.round(clamp(Number(rgbRed.value), 0, 255));
  const rgb_G = Math.round(clamp(Number(rgbGreen.value), 0, 255));
  const rgb_B = Math.round(clamp(Number(rgbBlue.value), 0, 255));

  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);

  const [hsv_H, hsv_S, hsv_V] = rgbToHsv(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);

  const [r_lin, g_lin, b_lin] = srgb8ToLinearRgb([rgb_R, rgb_G, rgb_B]);

  const [oklab_L, oklab_A, oklab_B] = rgbToOklab_linear01(r_lin, g_lin, b_lin);
  const [oklch_L, oklch_C, oklch_H] = rgbToOklch_linear01(r_lin, g_lin, b_lin);

  const [ycbcr_Y, ycbcr_Cb, ycbcr_Cr] = rgbToYCbCr_limited(r_lin, g_lin, b_lin);

  const [sr_lin_R8, sr_lin_G8, sr_lin_B8] = linearRgbToLinear8([r_lin, g_lin, b_lin]);

  const [srgb_R_ui, srgb_G_ui, srgb_B_ui] = [rgb_R, rgb_G, rgb_B];

  updateValues(
    rgb_R, rgb_G, rgb_B,
    hsl_H, hsl_S, hsl_L,
    hsv_H, hsv_S, hsv_V,
    cmyk_C, cmyk_M, cmyk_Y, cmyk_K,
    sr_lin_R8, sr_lin_G8, sr_lin_B8,
    oklab_L, oklab_A, oklab_B,
    oklch_L, oklch_C, oklch_H,
    ycbcr_Y, ycbcr_Cb, ycbcr_Cr,
  );
}

function updateFromSrgb() {
  const sR8 = Math.round(clamp(Number(srgbRed.value), 0, 255));
  const sG8 = Math.round(clamp(Number(srgbGreen.value), 0, 255));
  const sB8 = Math.round(clamp(Number(srgbBlue.value), 0, 255));

  const [r_lin, g_lin, b_lin] = linear8ToLinearRgb([sR8, sG8, sB8]);

  const [rgb_R, rgb_G, rgb_B] = linearRgbToSrgb8([r_lin, g_lin, b_lin]);

  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);
  const [hsv_H, hsv_S, hsv_V] = rgbToHsv(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);

  const [oklab_L, oklab_A, oklab_B] = rgbToOklab_linear01(r_lin, g_lin, b_lin);
  const [oklch_L, oklch_C, oklch_H] = rgbToOklch_linear01(r_lin, g_lin, b_lin);
  const [ycbcr_Y, ycbcr_Cb, ycbcr_Cr] = rgbToYCbCr_limited(r_lin, g_lin, b_lin);

  updateValues(
    rgb_R, rgb_G, rgb_B,
    hsl_H, hsl_S, hsl_L,
    hsv_H, hsv_S, hsv_V,
    cmyk_C, cmyk_M, cmyk_Y, cmyk_K,
    sR8, sG8, sB8,
    oklab_L, oklab_A, oklab_B,
    oklch_L, oklch_C, oklch_H,
    ycbcr_Y, ycbcr_Cb, ycbcr_Cr,
  );
}

function updateFromHsl() {
  const hsl_H = Number(hslHue.value);
  const hsl_S = Number(hslSaturation.value);
  const hsl_L = Number(hslLightness.value);

  const [rgb_R, rgb_G, rgb_B] = hslToRgb(hsl_H, hsl_S, hsl_L);
  const [hsv_H, hsv_S, hsv_V] = rgbToHsv(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);

  const [r_lin, g_lin, b_lin] = srgb8ToLinearRgb([rgb_R, rgb_G, rgb_B]);
  const [oklab_L, oklab_A, oklab_B] = rgbToOklab_linear01(r_lin, g_lin, b_lin);
  const [oklch_L, oklch_C, oklch_H] = rgbToOklch_linear01(r_lin, g_lin, b_lin);
  const [ycbcr_Y, ycbcr_Cb, ycbcr_Cr] = rgbToYCbCr_limited(r_lin, g_lin, b_lin);

  const [sr_lin_R8, sr_lin_G8, sr_lin_B8] = linearRgbToLinear8([r_lin, g_lin, b_lin]);

  updateValues(
    rgb_R, rgb_G, rgb_B,
    hsl_H, hsl_S, hsl_L,
    hsv_H, hsv_S, hsv_V,
    cmyk_C, cmyk_M, cmyk_Y, cmyk_K,
    sr_lin_R8, sr_lin_G8, sr_lin_B8,
    oklab_L, oklab_A, oklab_B,
    oklch_L, oklch_C, oklch_H,
    ycbcr_Y, ycbcr_Cb, ycbcr_Cr,
  );
}

function updateFromHsv() {
  const hsv_H = Number(hsvHue.value);
  const hsv_S = Number(hsvSaturation.value);
  const hsv_V = Number(hsvValue.value);

  const [rgb_R, rgb_G, rgb_B] = hsvToRgb(hsv_H, hsv_S, hsv_V);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);

  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);

  const [r_lin, g_lin, b_lin] = srgb8ToLinearRgb([rgb_R, rgb_G, rgb_B]);
  const [oklab_L, oklab_A, oklab_B] = rgbToOklab_linear01(r_lin, g_lin, b_lin);
  const [oklch_L, oklch_C, oklch_H] = rgbToOklch_linear01(r_lin, g_lin, b_lin);
  const [ycbcr_Y, ycbcr_Cb, ycbcr_Cr] = rgbToYCbCr_limited(r_lin, g_lin, b_lin);

  const [sr_lin_R8, sr_lin_G8, sr_lin_B8] = linearRgbToLinear8([r_lin, g_lin, b_lin]);

  updateValues(
    rgb_R, rgb_G, rgb_B,
    hsl_H, hsl_S, hsl_L,
    hsv_H, hsv_S, hsv_V,
    cmyk_C, cmyk_M, cmyk_Y, cmyk_K,
    sr_lin_R8, sr_lin_G8, sr_lin_B8,
    oklab_L, oklab_A, oklab_B,
    oklch_L, oklch_C, oklch_H,
    ycbcr_Y, ycbcr_Cb, ycbcr_Cr,
  );
}

function updateFromCmyk() {
  const cmyk_C = Number(cmykCyan.value);
  const cmyk_M = Number(cmykMagenta.value);
  const cmyk_Y = Number(cmykYellow.value);
  const cmyk_K = Number(cmykBlack.value);

  const [rgb_R, rgb_G, rgb_B] = cmykToRgb(cmyk_C, cmyk_M, cmyk_Y, cmyk_K);
  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);
  const [hsv_H, hsv_S, hsv_V] = rgbToHsv(rgb_R, rgb_G, rgb_B);

  const [r_lin, g_lin, b_lin] = srgb8ToLinearRgb([rgb_R, rgb_G, rgb_B]);
  const [oklab_L, oklab_A, oklab_B] = rgbToOklab_linear01(r_lin, g_lin, b_lin);
  const [oklch_L, oklch_C, oklch_H] = rgbToOklch_linear01(r_lin, g_lin, b_lin);
  const [ycbcr_Y, ycbcr_Cb, ycbcr_Cr] = rgbToYCbCr_limited(r_lin, g_lin, b_lin);

  const [sr_lin_R8, sr_lin_G8, sr_lin_B8] = linearRgbToLinear8([r_lin, g_lin, b_lin]);

  updateValues(
    rgb_R, rgb_G, rgb_B,
    hsl_H, hsl_S, hsl_L,
    hsv_H, hsv_S, hsv_V,
    cmyk_C, cmyk_M, cmyk_Y, cmyk_K,
    sr_lin_R8, sr_lin_G8, sr_lin_B8,
    oklab_L, oklab_A, oklab_B,
    oklch_L, oklch_C, oklch_H,
    ycbcr_Y, ycbcr_Cb, ycbcr_Cr,
  );
}

function updateFromOklab() {
  const oklab_L_val = Number(oklabL.value);
  const oklab_A_val = Number(oklabA.value);
  const oklab_B_val = Number(oklabB.value);

  let [r_lin, g_lin, b_lin] = oklabToRgb_linear01(oklab_L_val, oklab_A_val, oklab_B_val);

  r_lin = clamp(r_lin, 0, 1);
  g_lin = clamp(g_lin, 0, 1);
  b_lin = clamp(b_lin, 0, 1);

  const [sr_lin_R8, sr_lin_G8, sr_lin_B8] = linearRgbToLinear8([r_lin, g_lin, b_lin]);
  const [oklch_L, oklch_C, oklch_H] = rgbToOklch_linear01(r_lin, g_lin, b_lin);
  const [ycbcr_Y, ycbcr_Cb, ycbcr_Cr] = rgbToYCbCr_limited(r_lin, g_lin, b_lin);

  const [rgb_R, rgb_G, rgb_B] = linearRgbToSrgb8([r_lin, g_lin, b_lin]);

  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);
  const [hsv_H, hsv_S, hsv_V] = rgbToHsv(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);

  updateValues(
    rgb_R, rgb_G, rgb_B,
    hsl_H, hsl_S, hsl_L,
    hsv_H, hsv_S, hsv_V,
    cmyk_C, cmyk_M, cmyk_Y, cmyk_K,
    sr_lin_R8, sr_lin_G8, sr_lin_B8,
    oklab_L_val, oklab_A_val, oklab_B_val,
    oklch_L, oklch_C, oklch_H,
    ycbcr_Y, ycbcr_Cb, ycbcr_Cr,
  );
}

function updateFromOklch() {
  const oklch_L_val = Number(oklchL.value);
  const oklch_C_val = Number(oklchC.value);
  const oklch_H_val = Number(oklchH.value);

  let [r_lin, g_lin, b_lin] = oklchToRgb_linear01(oklch_L_val, oklch_C_val, oklch_H_val);

  r_lin = clamp(r_lin, 0, 1);
  g_lin = clamp(g_lin, 0, 1);
  b_lin = clamp(b_lin, 0, 1);

  const [sr_lin_R8, sr_lin_G8, sr_lin_B8] = linearRgbToLinear8([r_lin, g_lin, b_lin]);
  const [oklab_L, oklab_A, oklab_B] = rgbToOklab_linear01(r_lin, g_lin, b_lin);
  const [ycbcr_Y, ycbcr_Cb, ycbcr_Cr] = rgbToYCbCr_limited(r_lin, g_lin, b_lin);

  const [rgb_R, rgb_G, rgb_B] = linearRgbToSrgb8([r_lin, g_lin, b_lin]);

  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);
  const [hsv_H, hsv_S, hsv_V] = rgbToHsv(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);

  updateValues(
    rgb_R, rgb_G, rgb_B,
    hsl_H, hsl_S, hsl_L,
    hsv_H, hsv_S, hsv_V,
    cmyk_C, cmyk_M, cmyk_Y, cmyk_K,
    sr_lin_R8, sr_lin_G8, sr_lin_B8,
    oklab_L, oklab_A, oklab_B,
    oklch_L_val, oklch_C_val, oklch_H_val,
    ycbcr_Y, ycbcr_Cb, ycbcr_Cr,
  );
}

function updateFromYcbcr() {
  const ycbcr_Y_val = Number(ycbcrY.value);
  const ycbcr_Cb_val = Number(ycbcrCb.value);
  const ycbcr_Cr_val = Number(ycbcrCr.value);

  let [r_lin, g_lin, b_lin] = ycbcrToRgb_limited(ycbcr_Y_val, ycbcr_Cb_val, ycbcr_Cr_val);

  r_lin = clamp(r_lin, 0, 1);
  g_lin = clamp(g_lin, 0, 1);
  b_lin = clamp(b_lin, 0, 1);

  const [sr_lin_R8, sr_lin_G8, sr_lin_B8] = linearRgbToLinear8([r_lin, g_lin, b_lin]);
  const [oklch_L, oklch_C, oklch_H] = rgbToOklch_linear01(r_lin, g_lin, b_lin);
  const [oklab_L, oklab_A, oklab_B] = rgbToOklab_linear01(r_lin, g_lin, b_lin);

  const [rgb_R, rgb_G, rgb_B] = linearRgbToSrgb8([r_lin, g_lin, b_lin]);

  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);
  const [hsv_H, hsv_S, hsv_V] = rgbToHsv(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);

  updateValues(
    rgb_R, rgb_G, rgb_B,
    hsl_H, hsl_S, hsl_L,
    hsv_H, hsv_S, hsv_V,
    cmyk_C, cmyk_M, cmyk_Y, cmyk_K,
    sr_lin_R8, sr_lin_G8, sr_lin_B8,
    oklab_L, oklab_A, oklab_B,
    oklch_L, oklch_C, oklch_H,
    ycbcr_Y_val, ycbcr_Cb_val, ycbcr_Cr_val,
  );
}

// ----- Rendering ----- \\

function renderColorSliceUnified({
  canvas,
  width,
  height,
  space,
  xChannel,
  yChannel,
  locked = {},
  markerSpace = null,
}) {
  const cs = ColorSpaces[space];
  if (!cs) throw new Error(`Unknown color space: " + ${space}`);

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(width, height);
  const { data } = img;

  let ptr = 0;

  const xNorms = Array.from({ length: width }, (_, x) => x / (width - 1));
  const yNorms = Array.from({ length: height }, (_, y) => y / (height - 1));

  for (let py = 0; py < height; py++) {
    const yNorm = yNorms[py];

    for (let px = 0; px < width; px++) {
      const xNorm = xNorms[px];

      // 1) space-specific mapping (x,y ? full coords)
      const coords = cs.mapPixel({
        x: xNorm,
        y: yNorm,
        xChannel,
        yChannel,
        locked,
      });

      // 2) convert to sRGB for display
      const [r, g, b] = cs.toRgb(coords);

      data[ptr++] = r;
      data[ptr++] = g;
      data[ptr++] = b;
      data[ptr++] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);

  // MARKER ----------------------------------------------------
  if (markerSpace) {
    const marker = computeMarkerPosition({
      space,
      xChannel,
      yChannel,
      markerSpace,
      width,
      height,
    });

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(marker.mx, marker.my, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(marker.mx, marker.my, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function normalize(space, channel, value) {
  const [min, max] = ChannelRanges[space][channel];

  return (value - min) / (max - min);
}

function denormalize(space, channel, t) {
  const [min, max] = ChannelRanges[space][channel];

  return min + t * (max - min);
}

function computeMarkerPosition({
  space,
  xChannel,
  yChannel,
  markerSpace,
  width,
  height,
}) {
  const { channels } = ColorSpaces[space];

  const xi = channels.indexOf(xChannel);
  const yi = channels.indexOf(yChannel);

  const marker = {
    x: normalize(space, xChannel, markerSpace[xi]),
    y: normalize(space, yChannel, markerSpace[yi]),
  };

  return {
    mx: Math.round(marker.x * (width - 1)),
    my: Math.round(marker.y * (height - 1)),
  };
}

// ----- Init ----- \\

[rgbRed, rgbGreen, rgbBlue].forEach((e) => {
  e.addEventListener('input', updateFromRgb);
});

[hslHue, hslSaturation, hslLightness].forEach((e) => {
  e.addEventListener('input', updateFromHsl);
});

[hsvHue, hsvSaturation, hsvValue].forEach((e) => {
  e.addEventListener('input', updateFromHsv);
});

[cmykCyan, cmykMagenta, cmykYellow, cmykBlack].forEach((e) => {
  e.addEventListener('input', updateFromCmyk);
});

[srgbRed, srgbGreen, srgbBlue].forEach((e) => {
  e.addEventListener('input', updateFromSrgb);
});

[oklabL, oklabA, oklabB].forEach((e) => {
  e.addEventListener('input', updateFromOklab);
});

[oklchL, oklchC, oklchH].forEach((e) => {
  e.addEventListener('input', updateFromOklch);
});

[ycbcrY, ycbcrCb, ycbcrCr].forEach((e) => {
  e.addEventListener('input', updateFromYcbcr);
});

[rgbAxis, hslAxis, hsvAxis, cmykAxis, srgbAxis, oklabAxis, oklchAxis, ycbcrAxis].forEach((e) => {
  e.addEventListener('change', updateFromRgb);
});

const ChannelRanges = {
  rgb: {
    r: [0, 255],
    g: [0, 255],
    b: [0, 255],
  },

  srgb: {
    r: [0, 255],
    g: [0, 255],
    b: [0, 255],
  },

  hsl: {
    h: [0, 360],
    s: [0, 100],
    l: [0, 100],
  },

  hsv: {
    h: [0, 360],
    s: [0, 100],
    v: [0, 100],
  },

  oklab: {
    L: [0, 100],
    a: [-50, 50],
    b: [-50, 50],
  },

  oklch: {
    L: [0, 100],
    c: [0, 100],
    h: [0, 360],
  },

  cmyk: {
    c: [0, 100],
    m: [0, 100],
    y: [0, 100],
    k: [0, 100],
  },

  ycbcr: {
    Y: [16, 235],
    Cb: [16, 240],
    Cr: [16, 240],
  },
};

/*
 * COLOR SPACE TRANSFORM REGISTRY
 * Every space supplies:
 *  - channels: array of channel IDs
 *  - mapPixel(): convert (xValue, yValue, lockedChannels) ? that space's full coordinate set
 *  - toRgb(): convert from that space ? sRGB 0–255
 */

const ColorSpaces = {
  rgb: {
    channels: ['r', 'g', 'b'],

    mapPixel({
      x,
      y,
      xChannel,
      yChannel,
      locked,
    }) {
      const v = { ...locked };

      v[xChannel] = denormalize('rgb', xChannel, x);
      v[yChannel] = denormalize('rgb', yChannel, y);

      return [v.r ?? 0, v.g ?? 0, v.b ?? 0];
    },

    toRgb([r, g, b]) {
      return [Math.round(r), Math.round(g), Math.round(b)];
    },
  },

  srgb: {
    channels: ['r', 'g', 'b'],

    mapPixel({
      x,
      y,
      xChannel,
      yChannel,
      locked,
    }) {
      const v = { ...locked };

      v[xChannel] = denormalize('srgb', xChannel, x);
      v[yChannel] = denormalize('srgb', yChannel, y);

      return [v.r ?? 0, v.g ?? 0, v.b ?? 0];
    },

    toRgb([r, g, b]) {
      return [Math.round(r), Math.round(g), Math.round(b)];
    },
  },

  hsl: {
    channels: ['h', 's', 'l'],

    mapPixel({
      x,
      y,
      xChannel,
      yChannel,
      locked,
    }) {
      const v = { ...locked };

      v[xChannel] = denormalize('hsl', xChannel, x);
      v[yChannel] = denormalize('hsl', yChannel, y);

      return [v.h ?? 0, v.s ?? 0, v.l ?? 0];
    },

    toRgb([h, s, l]) {
      return hslToRgb(h, s, l);
    },
  },

  hsv: {
    channels: ['h', 's', 'v'],

    mapPixel({
      x,
      y,
      xChannel,
      yChannel,
      locked,
    }) {
      const v = { ...locked };

      v[xChannel] = denormalize('hsv', xChannel, x);
      v[yChannel] = denormalize('hsv', yChannel, y);

      return [v.h ?? 0, v.s ?? 0, v.v ?? 0];
    },

    toRgb([h, s, v]) {
      return hsvToRgb(h, s, v);
    },
  },

  oklab: {
    channels: ['L', 'a', 'b'],

    mapPixel({
      x,
      y,
      xChannel,
      yChannel,
      locked,
    }) {
      const v = { ...locked };

      v[xChannel] = denormalize('oklab', xChannel, x);
      v[yChannel] = denormalize('oklab', yChannel, y);

      return [v.L ?? 0, v.a ?? 0, v.b ?? 0];
    },

    toRgb([L, a, b]) {
      return linearRgbToLinear8(oklabToRgb_linear01(L, a, b));
    },
  },

  oklch: {
    channels: ['L', 'c', 'h'],

    mapPixel({
      x,
      y,
      xChannel,
      yChannel,
      locked,
    }) {
      const v = { ...locked };

      v[xChannel] = denormalize('oklch', xChannel, x);
      v[yChannel] = denormalize('oklch', yChannel, y);

      return [v.L ?? 0, v.c ?? 0, v.h ?? 0];
    },

    toRgb([L, c, h]) {
      return linearRgbToLinear8(oklchToRgb_linear01(L, c, h));
    },
  },

  cmyk: {
    channels: ['c', 'm', 'y', 'k'],

    mapPixel({
      x,
      y,
      xChannel,
      yChannel,
      locked,
    }) {
      const v = { ...locked };

      v[xChannel] = denormalize('cmyk', xChannel, x);
      v[yChannel] = denormalize('cmyk', yChannel, y);

      return [v.c ?? 0, v.m ?? 0, v.y ?? 0, v.k ?? 0];
    },

    toRgb([c, m, y, k]) {
      return cmykToRgb(c, m, y, k);
    },
  },
  ycbcr: {
  channels: ['Y', 'Cb', 'Cr'],

  mapPixel({
    x,
    y,
    xChannel,
    yChannel,
    locked,
  }) {
    const v = { ...locked };

    v[xChannel] = denormalize('ycbcr', xChannel, x);
    v[yChannel] = denormalize('ycbcr', yChannel, y);

    return [v.Y ?? 16, v.Cb ?? 128, v.Cr ?? 128];
  },

  toRgb([Y, Cb, Cr]) {
    function ycbcrToRgb_limited(Yint, CbInt, CrInt) {
      const Kr = 0.2126;
      const Kg = 0.7152;
      const Kb = 0.0722;
      const Y_MIN = 16.0;
      const Y_MAX = 235.0;
      const C_MIN = 16.0;
      const C_MAX = 240.0;
      const Y_SCALE = (Y_MAX - Y_MIN);
      const C_SCALE = (C_MAX - C_MIN);
      const C_MID = (C_MIN + C_MAX) / 2.0;

      const Yf = (Number(Yint) - Y_MIN) / Y_SCALE;
      const CbF = (Number(CbInt) - C_MID) / C_SCALE;
      const CrF = (Number(CrInt) - C_MID) / C_SCALE;

      const b = Yf + 2 * (1 - Kb) * CbF;
      const r = Yf + 2 * (1 - Kr) * CrF;
      const g = (Yf - Kr * r - Kb * b) / Kg;

      return [r, g, b];
    }

    const linearRgb = ycbcrToRgb_limited(Y, Cb, Cr);

    return linearRgbToSrgb8(linearRgb);
  },
},

};

// Initialize display once from existing values
updateFromRgb();
