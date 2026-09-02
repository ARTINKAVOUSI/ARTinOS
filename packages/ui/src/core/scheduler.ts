export type ScheduleMode = 'immediate' | 'microtask' | 'animationFrame' | 'idle' | 'manual';

export class Scheduler {
  private manualQueue = new Set<() => void>();
  schedule(task: () => void, mode: ScheduleMode = 'animationFrame') {
    if (mode === 'immediate') { task(); return () => undefined; }
    if (mode === 'microtask') { let cancelled = false; queueMicrotask(() => { if (!cancelled) task(); }); return () => { cancelled = true; }; }
    if (mode === 'manual') { this.manualQueue.add(task); return () => { this.manualQueue.delete(task); }; }
    if (mode === 'idle' && 'requestIdleCallback' in globalThis) {
      const id = (globalThis as unknown as { requestIdleCallback(cb: () => void): number }).requestIdleCallback(task);
      return () => (globalThis as unknown as { cancelIdleCallback(id: number): void }).cancelIdleCallback(id);
    }
    const id = requestAnimationFrame(task);
    return () => cancelAnimationFrame(id);
  }
  flush() { const tasks = [...this.manualQueue]; this.manualQueue.clear(); tasks.forEach(task => task()); }
}

export const scheduler = new Scheduler();
