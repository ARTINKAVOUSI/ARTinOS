export type EventListener<T = unknown> = (payload: T) => void;

export class EventBus {
  private listeners = new Map<string, Set<EventListener>>();
  on<T = unknown>(type: string, fn: EventListener<T>) {
    const set = this.listeners.get(type) ?? new Set<EventListener>();
    set.add(fn as EventListener);
    this.listeners.set(type, set);
    return () => { set.delete(fn as EventListener); };
  }
  once<T = unknown>(type: string, fn: EventListener<T>) {
    const off = this.on<T>(type, payload => { off(); fn(payload); });
    return off;
  }
  emit<T = unknown>(type: string, payload: T) {
    for (const fn of [...(this.listeners.get(type) ?? [])]) fn(payload);
    for (const fn of [...(this.listeners.get('*') ?? [])]) fn({ type, payload });
  }
  clear(type?: string) { type ? this.listeners.delete(type) : this.listeners.clear(); }
}
