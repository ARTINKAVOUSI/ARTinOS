import type { Parameter } from '../core/parameter.js';
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export function keyboardStep(parameter: Parameter<any>, event: { key: string; shiftKey?: boolean; altKey?: boolean }) {
  if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key)) return false;
  if (parameter.readonly || parameter.disabled || (parameter.type !== 'number' && parameter.type !== 'integer')) return false;
  const min = parameter.min ?? 0, max = parameter.max ?? 1, span = max - min, base = parameter.step ?? span / 100;
  const multiplier = event.shiftKey ? 10 : event.altKey ? .1 : 1;
  if (event.key === 'Home') parameter.set(min, { source: 'keyboard' });
  else if (event.key === 'End') parameter.set(max, { source: 'keyboard' });
  else parameter.set(Number(parameter.value) + ((event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp') ? 1 : -1) * base * multiplier * (event.key.startsWith('Page') ? 10 : 1), { source: 'keyboard' });
  return true;
}
