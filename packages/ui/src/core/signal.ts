import type { Signal } from './types.js';

export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  const listeners = new Set<(value: T, previous: T) => void>();
  return {
    get value() { return value; },
    set value(next: T) {
      if (Object.is(next, value)) return;
      const prev = value;
      value = next;
      for (const fn of [...listeners]) fn(value, prev);
    },
    peek() { return value; },
    set(next: T) { this.value = next; return value; },
    update(fn: (current: T) => T) { this.value = fn(value); return value; },
    subscribe(fn, { immediate = false } = {}) {
      listeners.add(fn);
      if (immediate) fn(value, value);
      return () => { listeners.delete(fn); };
    },
    clear() { listeners.clear(); },
    get subscriberCount() { return listeners.size; }
  };
}

export function computed<T>(read: () => T, sources: Array<Signal<unknown>> = []) {
  const out = signal(read()) as Signal<T> & { dispose?: () => void };
  const unsubs = sources.map(src => src.subscribe(() => { out.value = read(); }));
  out.dispose = () => unsubs.forEach(fn => fn());
  return out;
}
