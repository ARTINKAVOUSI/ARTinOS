export type ParameterType =
  | 'number' | 'integer' | 'boolean' | 'string' | 'enum' | 'range'
  | 'vec2' | 'vec3' | 'vec4' | 'color' | 'gradient' | 'action' | 'array' | 'object' | string;

export type ParameterSource = 'init' | 'api' | 'pointer' | 'precision' | 'keyboard' | 'wheel' | 'reset' | 'history' | 'restore' | 'system' | string;

export interface ParameterMeta {
  emphasis?: 'hero' | 'standard' | 'utility' | string;
  labelMode?: 'external' | 'integrated' | 'contextual' | 'stacked' | string;
  importance?: number;
  ticks?: number | readonly unknown[];
  signal?: string;
  continuous?: boolean;
  action?: (parameter: unknown) => void;
  format?: (value: unknown, parameter: unknown) => string;
  [key: string]: unknown;
}

export interface ParameterDefinition<T = unknown> {
  id: string;
  type?: ParameterType;
  label?: string;
  description?: string;
  value: T;
  default?: T;
  min?: number;
  max?: number;
  step?: number;
  unit?: string | null;
  options?: readonly unknown[] | null;
  presentation?: string | null;
  meta?: ParameterMeta;
  persistent?: boolean;
  readonly?: boolean;
  disabled?: boolean;
}

export interface ParameterSetOptions {
  source?: ParameterSource;
  history?: boolean;
  force?: boolean;
}

export interface Signal<T> {
  value: T;
  peek(): T;
  set(next: T): T;
  update(fn: (current: T) => T): T;
  subscribe(fn: (value: T, previous: T) => void, options?: { immediate?: boolean }): () => void;
  clear(): void;
  readonly subscriberCount: number;
}

export interface ParameterSnapshot {
  id: string;
  type: ParameterType;
  value: unknown;
  presentation: string | null;
  meta: ParameterMeta;
}

export interface ParameterGraphSnapshot {
  version: number;
  parameters: ParameterSnapshot[];
}

export interface MetaCompContext {
  width?: number;
  height?: number;
  modality?: 'pointer' | 'touch' | 'pen' | string;
  preference?: string;
  presentation?: string | null;
  density?: string;
  importance?: number;
  labelMode?: string | null;
  emphasis?: string;
  [key: string]: unknown;
}
