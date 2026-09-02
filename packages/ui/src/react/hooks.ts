import { useCallback, useSyncExternalStore } from 'react';
import type { Parameter } from '../core/parameter.js';

export function useParameterValue<T>(parameter: Parameter<T>) {
  const subscribe = useCallback((listener: () => void) => parameter.subscribe(() => listener()), [parameter]);
  const getSnapshot = useCallback(() => parameter.value, [parameter]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useParameterRevision(parameter: Parameter) {
  const subscribe = useCallback((listener: () => void) => parameter.subscribe(() => listener()), [parameter]);
  const getSnapshot = useCallback(() => parameter.revision, [parameter]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
