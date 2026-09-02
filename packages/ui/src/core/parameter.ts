import { signal } from './signal.js';
import { EventBus } from './events.js';
import { History } from './history.js';
import type { ParameterDefinition, ParameterGraphSnapshot, ParameterSetOptions, ParameterType, ParameterSource, Signal } from './types.js';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
function roundToStep(value: number, step?: number, base = 0) {
  if (!step || !Number.isFinite(step)) return value;
  const stepped = base + Math.round((value - base) / step) * step;
  const decimals = Math.min(10, Math.max(0, String(step).split('.')[1]?.length ?? 0));
  return Number(stepped.toFixed(decimals));
}

export class Parameter<T = unknown> {
  readonly graph: ParameterGraph;
  readonly id: string;
  readonly type: ParameterType;
  label: string;
  description: string;
  readonly default: T;
  min?: number;
  max?: number;
  step?: number;
  unit: string | null;
  options: readonly unknown[] | null;
  presentation: string | null;
  meta: Record<string, any>;
  persistent: boolean;
  readonly: boolean;
  disabled: boolean;
  lastSource: ParameterSource = 'init';
  revision = 0;
  private readonly state: Signal<T>;

  constructor(definition: ParameterDefinition<T>, graph: ParameterGraph) {
    this.graph = graph;
    this.id = definition.id;
    this.type = definition.type ?? inferType(definition.value);
    this.label = definition.label ?? humanize(this.id.split('.').at(-1));
    this.description = definition.description ?? '';
    this.default = (definition.default ?? definition.value) as T;
    this.min = definition.min; this.max = definition.max; this.step = definition.step;
    this.unit = definition.unit ?? null; this.options = definition.options ?? null;
    this.presentation = definition.presentation ?? null; this.meta = { ...(definition.meta ?? {}) };
    this.persistent = definition.persistent !== false; this.readonly = Boolean(definition.readonly); this.disabled = Boolean(definition.disabled);
    this.state = signal(this.normalize(definition.value));
  }

  normalize(value: unknown): T {
    if (this.type === 'number' || this.type === 'integer') {
      let n = Number(value); if (!Number.isFinite(n)) n = Number(this.default) || 0;
      n = clamp(n, this.min ?? -Infinity, this.max ?? Infinity); n = roundToStep(n, this.step, this.min ?? 0);
      return (this.type === 'integer' ? Math.round(n) : n) as T;
    }
    if (this.type === 'boolean') return Boolean(value) as T;
    if (this.type === 'range' && Array.isArray(value)) {
      const [a = this.min ?? 0, b = this.max ?? 1] = value;
      const lo = clamp(Number(a), this.min ?? -Infinity, this.max ?? Infinity);
      const hi = clamp(Number(b), this.min ?? -Infinity, this.max ?? Infinity);
      return [Math.min(lo, hi), Math.max(lo, hi)] as T;
    }
    return value as T;
  }

  get value() { return this.state.value; }
  set value(next: T) { this.set(next); }
  set(next: T, { source = 'api', history = true, force = false }: ParameterSetOptions = {}) {
    if ((this.readonly || this.disabled) && !force && source !== 'restore' && source !== 'system') return this.value;
    const normalized = this.normalize(next); const prev = this.value;
    if (same(prev, normalized)) return normalized;
    const apply = (value: T, applySource: ParameterSource = source) => {
      this.lastSource = applySource; this.revision += 1; this.state.value = value;
      this.graph.events.emit('parameter:change', { parameter: this, value, source: applySource, revision: this.revision });
    };
    apply(normalized);
    if (history) this.graph.history.record({ label: `Set ${this.label}`, undo: () => apply(prev, 'history'), redo: () => apply(normalized, 'history') });
    return normalized;
  }
  reset(options?: ParameterSetOptions) { return this.set(this.default, { source: 'reset', ...options }); }
  subscribe(fn: (value: T, previous: T) => void, options?: { immediate?: boolean }) { return this.state.subscribe(fn, options); }
  toJSON() { return { id: this.id, type: this.type, value: this.value, presentation: this.presentation, meta: this.meta }; }
}

function same(a: unknown, b: unknown) {
  return Object.is(a, b) || (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => Object.is(v, b[i])));
}

export class ParameterGraph {
  readonly parameters = new Map<string, Parameter>();
  readonly events = new EventBus();
  readonly history: History;
  readonly version = 1;
  constructor({ historyLimit = 200 } = {}) { this.history = new History({ limit: historyLimit }); }
  define<T>(definition: ParameterDefinition<T>): Parameter<T> {
    if (!definition?.id) throw new Error('Parameter requires an id');
    const existing = this.parameters.get(definition.id); if (existing) return existing as Parameter<T>;
    const p = new Parameter(definition, this); this.parameters.set(p.id, p as Parameter); this.events.emit('parameter:add', { parameter: p }); return p;
  }
  defineMany(definitions: ParameterDefinition[]) { return Object.fromEntries(definitions.map(def => [def.id, this.define(def)])); }
  get<T = unknown>(id: string) { return this.parameters.get(id) as Parameter<T> | undefined; }
  has(id: string) { return this.parameters.has(id); }
  remove(id: string) { const p = this.parameters.get(id); if (!p) return false; this.parameters.delete(id); this.events.emit('parameter:remove', { parameter: p }); return true; }
  set<T>(id: string, value: T, options?: ParameterSetOptions) { const p = this.get<T>(id); if (!p) throw new Error(`Unknown parameter: ${id}`); return p.set(value, options); }
  subscribe<T>(id: string, fn: (value: T, previous: T) => void, options?: { immediate?: boolean }) { const p = this.get<T>(id); if (!p) throw new Error(`Unknown parameter: ${id}`); return p.subscribe(fn, options); }
  transaction<T>(label: string, fn: () => T) { this.history.begin(label); try { const result = fn(); this.history.commit(); this.events.emit('transaction:commit', { label }); return result; } catch (error) { this.history.cancel(); this.events.emit('transaction:cancel', { label, error }); throw error; } }
  values() { return Object.fromEntries([...this.parameters].map(([id, p]) => [id, p.value])); }
  serialize(): ParameterGraphSnapshot { return { version: this.version, parameters: [...this.parameters.values()].filter(p => p.persistent).map(p => p.toJSON()) }; }
  restore(snapshot: ParameterGraphSnapshot | null | undefined, { history = false } = {}) {
    if (!snapshot?.parameters) return;
    if (history) this.history.begin('Restore parameters');
    for (const entry of snapshot.parameters) this.parameters.get(entry.id)?.set(entry.value, { source: 'restore', history, force: true });
    if (history) this.history.commit(); this.events.emit('restore', { snapshot });
  }
}

export function inferType(value: unknown): ParameterType {
  if (typeof value === 'boolean') return 'boolean'; if (typeof value === 'number') return 'number'; if (typeof value === 'function') return 'action';
  if (typeof value === 'string') return /^#[0-9a-f]{6,8}$/i.test(value) ? 'color' : 'string';
  if (Array.isArray(value)) {
    if (value.length === 2 && value.every(Number.isFinite)) return 'vec2'; if (value.length === 3 && value.every(Number.isFinite)) return 'vec3'; if (value.length === 4 && value.every(Number.isFinite)) return 'vec4';
    if (value.length >= 2 && value.every(v => typeof v === 'string' && /^#[0-9a-f]{6,8}$/i.test(v))) return 'gradient'; return 'array';
  }
  return 'object';
}

export function humanize(value: unknown) { return String(value ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
