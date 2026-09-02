/* Local CI shim only. Real projects should install react, react-dom and @types/react. */
declare module 'react' {
  export type ReactNode = any;
  export type CSSProperties = Record<string, string | number | undefined>;
  export type PointerEvent<T = Element> = any;
  export type KeyboardEvent<T = Element> = any;
  export type WheelEvent<T = Element> = any;
  export type ChangeEvent<T = Element> = any;
  export type FocusEvent<T = Element> = any;
  export type MouseEvent<T = Element> = any;
  export type RefObject<T> = { current: T | null };
  export type ComponentType<P = any> = (props: P) => ReactNode;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useRef<T>(initial: T): { current: T };
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: readonly unknown[]): T;
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useLayoutEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useSyncExternalStore<T>(subscribe: (listener: () => void) => () => void, getSnapshot: () => T, getServerSnapshot?: () => T): T;
  export function createContext<T>(value: T): any;
  export function useContext<T>(ctx: any): T;
  export const Fragment: any;
  export default {};
}
declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): { render(node: any): void; unmount(): void };
}
declare namespace JSX {
  interface IntrinsicAttributes { key?: any }
  interface IntrinsicElements { [elemName: string]: any }
}
