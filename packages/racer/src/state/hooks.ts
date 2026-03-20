/**
 * Racer.js State Management – React Hooks
 *
 * Provides React hooks for consuming a Racer store inside components.
 * These hooks work with any store created by `createStore()`.
 *
 * NOTE: React (>= 18) must be installed in the consuming application
 * because these hooks rely on `useSyncExternalStore`.
 */

import type { Selector, StoreAPI } from './types'

/**
 * Lazily resolve React at call time. This avoids a hard build-time
 * dependency on React while providing clear errors when the hooks are
 * used in environments that lack it.
 */
function getReact(): any {
  try {
    return require('react')
  } catch {
    throw new Error(
      '[Racer.js] React is required to use state management hooks. ' +
        'Install React in your project: npm install react'
    )
  }
}

/**
 * Subscribe to the entire store state. The component re-renders whenever
 * the state reference changes.
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const state = useStore(counterStore)
 *   return <div>{state.count}</div>
 * }
 * ```
 */
export function useStore<S>(store: StoreAPI<S>): S {
  const React = getReact()
  const { useSyncExternalStore } = React

  return useSyncExternalStore(
    (onStoreChange: () => void) => store.subscribe(onStoreChange),
    () => store.getState(),
    () => store.getState()
  )
}

/**
 * Select a slice of the store state. The component only re-renders when
 * the selected value changes (using `Object.is` equality by default).
 *
 * @example
 * ```tsx
 * function CountDisplay() {
 *   const count = useSelector(counterStore, (s) => s.count)
 *   return <span>{count}</span>
 * }
 * ```
 */
export function useSelector<S, R>(
  store: StoreAPI<S>,
  selector: Selector<S, R>,
  equalityFn: (a: R, b: R) => boolean = Object.is
): R {
  const React = getReact()
  const { useSyncExternalStore, useRef, useCallback } = React

  const prevRef = useRef(selector(store.getState()))

  const getSnapshot = useCallback(() => {
    const next = selector(store.getState())
    if (equalityFn(prevRef.current, next)) {
      return prevRef.current
    }
    prevRef.current = next
    return next
  }, [store, selector, equalityFn])

  return useSyncExternalStore(
    (onStoreChange: () => void) => store.subscribe(onStoreChange),
    getSnapshot,
    getSnapshot
  )
}

/**
 * Returns the store's dispatch function.
 *
 * @example
 * ```tsx
 * function IncrementButton() {
 *   const dispatch = useDispatch(counterStore)
 *   return <button onClick={() => dispatch({ type: 'INCREMENT' })}>+1</button>
 * }
 * ```
 */
export function useDispatch<S>(store: StoreAPI<S>): StoreAPI<S>['dispatch'] {
  return store.dispatch
}

/**
 * Returns a bound version of the store's `setState` for direct updates.
 *
 * @example
 * ```tsx
 * function ResetButton() {
 *   const setState = useSetState(counterStore)
 *   return <button onClick={() => setState({ count: 0 })}>Reset</button>
 * }
 * ```
 */
export function useSetState<S>(store: StoreAPI<S>): StoreAPI<S>['setState'] {
  return store.setState
}
