import { prepareWithSegments, measureNaturalWidth } from '@chenglou/pretext';

const cache = new Map();
let canvasCtx = null;

function getCanvasCtx() {
  if (canvasCtx) return canvasCtx;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvasCtx = canvas.getContext('2d');
  return canvasCtx;
}

function fallbackMeasure(text, font) {
  const ctx = getCanvasCtx();
  if (!ctx) return text.length * 14;
  ctx.font = font;
  return ctx.measureText(text).width;
}

/**
 * 어절(공백 없는 단일 텍스트 토큰)의 폭을 측정.
 * pretext 우선 시도 (letterSpacing 반영), 실패 시 canvas measureText fallback.
 * 한국어 word-break: keep-all 적용.
 *
 * @param {string} text - 측정 대상 텍스트
 * @param {string} font - CSS font shorthand
 * @param {number} letterSpacing - 자간 px (음수=좁힘) [Optional, 기본값: 0]
 */
export default function measureWord(text, font, letterSpacing = 0) {
  const key = `${font}\x00${letterSpacing}\x00${text}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  let width;
  try {
    const prepared = prepareWithSegments(text, font, { wordBreak: 'keep-all', letterSpacing });
    width = measureNaturalWidth(prepared);
    if (!Number.isFinite(width) || width <= 0) {
      width = fallbackMeasure(text, font) + letterSpacing * Math.max(0, text.length - 1);
    }
  } catch {
    width = fallbackMeasure(text, font) + letterSpacing * Math.max(0, text.length - 1);
  }
  cache.set(key, width);
  return width;
}

export function clearMeasureCache() {
  cache.clear();
}
