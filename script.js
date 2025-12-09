// ----- Conversion ----- \\

function rgbToHsl(R, G, B) {
  const r = R / 255;
  const g = G / 255;
  const b = B / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = (max + min) / 2;
  let s = (max + min) / 2;
  const l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
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
      default: break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToRgb(H, S, L) {
  const h = H;
  const s = S / 100;
  const l = L / 100;

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

  const hk = (h % 360) / 360;
  const r = hueToRgb(p, q, hk + 1 / 3);
  const g = hueToRgb(p, q, hk);
  const b = hueToRgb(p, q, hk - 1 / 3);

  return [r * 255, g * 255, b * 255];
}

function rgbToCmyk(R, G, B) {
  const r = Math.max(0, Math.min(255, Math.round(R)));
  const g = Math.max(0, Math.min(255, Math.round(G)));
  const b = Math.max(0, Math.min(255, Math.round(B)));

  if (r === 0 && g === 0 && b === 0) {
    return [0, 0, 0, 1];
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
  c = Math.max(0, Math.min(100, c));
  m = Math.max(0, Math.min(100, m));
  y = Math.max(0, Math.min(100, y));
  k = Math.max(0, Math.min(100, k));

  const C = c / 100;
  const M = m / 100;
  const Y = y / 100;
  const K = k / 100;

  const r = Math.round(255 * (1 - C) * (1 - K));
  const g = Math.round(255 * (1 - M) * (1 - K));
  const b = Math.round(255 * (1 - Y) * (1 - K));

  return [r, g, b];
}

function srgbToLinearChannel(v8bit) {
  const v = v8bit / 255;
  if (v <= 0.04045) {
    return v / 12.92;
  }

  return (((v + 0.055) / 1.055) ** 2.4) * 255;
}

function linearToSrgbChannel(lin) {
  const v = Math.min(1, Math.max(0, lin / 255));
  let sr = 0;
  if (v <= 0.0031308) {
    sr = v * 12.92;
  } else {
    sr = 1.055 * v ** (1 / 2.4) - 0.055;
  }

  return Math.round(sr * 255);
}

function rgbToOklab(R, G, B) {
  const r = R / 255;
  const g = G / 255;
  const bV = B / 255;

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * bV;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * bV;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * bV;

  const l_c = Math.cbrt(l);
  const m_c = Math.cbrt(m);
  const s_c = Math.cbrt(s);

  const L = 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c;
  const a = 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c;
  const b = 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c;

  return [L * 100, a * 100, b * 100];
}

function oklabToRgb(oklab_L, oklab_a, oklab_b) {
  const L = oklab_L / 100;
  const a = oklab_a / 100;
  const bV = oklab_b / 100;

  const l_c = L + 0.3963377774 * a + 0.2158037573 * bV;
  const m_c = L - 0.1055613458 * a - 0.0638541728 * bV;
  const s_c = L - 0.0894841775 * a - 1.2914855480 * bV;

  const l = l_c * l_c * l_c;
  const m = m_c * m_c * m_c;
  const s = s_c * s_c * s_c;

  const rgb_r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const rgb_g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const rgb_b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  return [rgb_r * 255, rgb_g * 255, rgb_b * 255];
}

function srgbToLinear(R, G, B) {
  return [
    srgbToLinearChannel(R),
    srgbToLinearChannel(G),
    srgbToLinearChannel(B),
  ];
}

function linearToSrgb(RLin, GLin, BLin) {
  return [
    linearToSrgbChannel(RLin),
    linearToSrgbChannel(GLin),
    linearToSrgbChannel(BLin),
  ];
}

// ----- Selectors ----- \\

const rgbRed = document.getElementById('rgb-red');
const rgbGreen = document.getElementById('rgb-green');
const rgbBlue = document.getElementById('rgb-blue');

const hslHue = document.getElementById('hsl-hue');
const hslSaturation = document.getElementById('hsl-saturation');
const hslLightness = document.getElementById('hsl-lightness');

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

const rgbRedVal = document.getElementById('rgb-r-val');
const rgbGreenVal = document.getElementById('rgb-g-val');
const rgbBlueVal = document.getElementById('rgb-b-val');

const hslHueVal = document.getElementById('hsl-h-val');
const hslSaturationVal = document.getElementById('hsl-s-val');
const hslLightnessVal = document.getElementById('hsl-l-val');

const cmykCyanVal = document.getElementById('cmyk-c-val');
const cmykMagentaVal = document.getElementById('cmyk-m-val');
const cmykYellowVal = document.getElementById('cmyk-y-val');
const cmykBlackVal = document.getElementById('cmyk-b-val');

const srgbRedVal = document.getElementById('srgb-r-val');
const srgbGreenVal = document.getElementById('srgb-g-val');
const srgbBlueVal = document.getElementById('srgb-b-val');

const oklabLVal = document.getElementById('oklab-l-val');
const oklabAVal = document.getElementById('oklab-a-val');
const oklabBVal = document.getElementById('oklab-b-val');

// ----- Updates----- \\

function updateValues(rgbR, rgbG, rgbB, hslH, hslS, hslL, cmykC, cmykM, cmykY, cmykK, srgbR, srgbG, srgbB, okLabL, okLabA, okLabB) {
  rgbRed.value = rgbR;
  rgbGreen.value = rgbG;
  rgbBlue.value = rgbB;

  hslHue.value = hslH;
  hslSaturation.value = hslS;
  hslLightness.value = hslL;

  cmykCyan.value = cmykC;
  cmykMagenta.value = cmykM;
  cmykYellow.value = cmykY;
  cmykBlack.value = cmykK;

  srgbRed.value = srgbR;
  srgbGreen.value = srgbG;
  srgbBlue.value = srgbB;

  oklabL.value = okLabL;
  oklabA.value = okLabA;
  oklabB.value = okLabB;

  rgbRedVal.textContent = rgbR;
  rgbGreenVal.textContent = rgbG;
  rgbBlueVal.textContent = rgbB;

  hslHueVal.textContent = hslH;
  hslSaturationVal.textContent = hslS;
  hslLightnessVal.textContent = hslL;

  cmykCyanVal.textContent = cmykC;
  cmykMagentaVal.textContent = cmykM;
  cmykYellowVal.textContent = cmykY;
  cmykBlackVal.textContent = cmykK;

  srgbRedVal.textContent = srgbR;
  srgbGreenVal.textContent = srgbG;
  srgbBlueVal.textContent = srgbB;

  oklabLVal.textContent = okLabL;
  oklabAVal.textContent = okLabA;
  oklabBVal.textContent = okLabB;
}

function updateFromRgb() {
  const rgb_R = rgbRed.value;
  const rgb_G = rgbGreen.value;
  const rgb_B = rgbBlue.value;

  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);
  const [srgb_R, srgb_G, srgb_B] = srgbToLinear(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);
  const [oklab_L, oklab_A, oklab_B] = rgbToOklab(srgb_R, srgb_G, srgb_B);

  updateValues(rgb_R, rgb_G, rgb_B, hsl_H, hsl_S, hsl_L, cmyk_C, cmyk_M, cmyk_Y, cmyk_K, srgb_R, srgb_G, srgb_B, oklab_L, oklab_A, oklab_B);
}

function updateFromHsl() {
  const hsl_H = hslHue.value;
  const hsl_S = hslSaturation.value;
  const hsl_L = hslLightness.value;

  const [rgb_R, rgb_G, rgb_B] = hslToRgb(hsl_H, hsl_S, hsl_L);
  const [srgb_R, srgb_G, srgb_B] = srgbToLinear(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);
  const [oklab_L, oklab_A, oklab_B] = rgbToOklab(srgb_R, srgb_G, srgb_B);

  updateValues(rgb_R, rgb_G, rgb_B, hsl_H, hsl_S, hsl_L, cmyk_C, cmyk_M, cmyk_Y, cmyk_K, srgb_R, srgb_G, srgb_B, oklab_L, oklab_A, oklab_B);
}

function updateFromCmyk() {
  const cmyk_C = cmykCyan.value;
  const cmyk_M = cmykMagenta.value;
  const cmyk_Y = cmykYellow.value;
  const cmyk_K = cmykBlack.value;

  const [rgb_R, rgb_G, rgb_B] = cmykToRgb(cmyk_C, cmyk_M, cmyk_Y, cmyk_K);
  const [srgb_R, srgb_G, srgb_B] = srgbToLinear(rgb_R, rgb_G, rgb_B);
  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);
  const [oklab_L, oklab_A, oklab_B] = rgbToOklab(srgb_R, srgb_G, srgb_B);

  updateValues(rgb_R, rgb_G, rgb_B, hsl_H, hsl_S, hsl_L, cmyk_C, cmyk_M, cmyk_Y, cmyk_K, srgb_R, srgb_G, srgb_B, oklab_L, oklab_A, oklab_B);
}

function updateFromSrgb() {
  const srgb_R = srgbRed.value;
  const srgb_G = srgbGreen.value;
  const srgb_B = srgbBlue.value;

  const [rgb_R, rgb_G, rgb_B] = srgbToLinear(srgb_R, srgb_G, srgb_B);
  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);
  const [oklab_L, oklab_A, oklab_B] = rgbToOklab(srgb_R, srgb_G, srgb_B);

  updateValues(rgb_R, rgb_G, rgb_B, hsl_H, hsl_S, hsl_L, cmyk_C, cmyk_M, cmyk_Y, cmyk_K, srgb_R, srgb_G, srgb_B, oklab_L, oklab_A, oklab_B);
}

function updateFromOklab() {
  const oklab_L = oklabL.value;
  const oklab_A = oklabA.value;
  const oklab_B = oklabB.value;

  const [srgb_R, srgb_G, srgb_B] = oklabToRgb(oklab_L, oklab_A, oklab_B);
  const [rgb_R, rgb_G, rgb_B] = srgbToLinear(srgb_R, srgb_G, srgb_B);
  const [sr, sg, sb] = srgbToLinear(rgb_R, rgb_G, rgb_B);
  const [hsl_H, hsl_S, hsl_L] = rgbToHsl(rgb_R, rgb_G, rgb_B);
  const [cmyk_C, cmyk_M, cmyk_Y, cmyk_K] = rgbToCmyk(rgb_R, rgb_G, rgb_B);

  updateValues(rgb_R, rgb_G, rgb_B, hsl_H, hsl_S, hsl_L, cmyk_C, cmyk_M, cmyk_Y, cmyk_K, srgb_R, srgb_G, srgb_B, oklab_L, oklab_A, oklab_B);
}

// ----- Init ----- \\

[rgbRed, rgbGreen, rgbBlue].forEach((e) => {
  e.addEventListener('input', updateFromRgb);
});

[hslHue, hslSaturation, hslLightness].forEach((e) => {
  e.addEventListener('input', updateFromHsl);
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
