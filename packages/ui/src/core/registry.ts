import type { ComponentType } from 'react';
import type { MetaCompContext, ParameterType } from './types.js';
import type { Parameter } from './parameter.js';

export interface ControlRegistration {
  type: ParameterType | '*';
  presentation: string;
  component: ComponentType<any>;
  priority: number;
  accepts?: (parameter: Parameter, context: MetaCompContext) => boolean;
}

export class ControlRegistry {
  private entries = new Map<string, ControlRegistration[]>();
  register(type: ParameterType | '*', presentation: string, component: ComponentType<any>, { priority = 0, accepts }: { priority?: number; accepts?: ControlRegistration['accepts'] } = {}) {
    const list = this.entries.get(type) ?? []; const entry = { type, presentation, component, priority, accepts };
    list.push(entry); list.sort((a, b) => b.priority - a.priority); this.entries.set(type, list);
    return () => this.entries.set(type, list.filter(e => e !== entry));
  }
  resolve(parameter: Parameter, context: MetaCompContext = {}) {
    const requested = context.presentation ?? parameter.presentation;
    const candidates = [...(this.entries.get(parameter.type) ?? []), ...(this.entries.get('*') ?? [])];
    if (requested) { const exact = candidates.find(e => e.presentation === requested && (!e.accepts || e.accepts(parameter, context))); if (exact) return exact; }
    return candidates.find(e => !e.accepts || e.accepts(parameter, context)) ?? null;
  }
  presentations(type: ParameterType) { return (this.entries.get(type) ?? []).map(e => e.presentation); }
}
