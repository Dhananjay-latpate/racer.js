/**
 * Racer.js State Management – Core Store
 *
 * A lightweight, type-safe state management store inspired by Redux and Zustand.
 * It supports:
 *   - Reducer-based state transitions via dispatch()
 *   - Direct state updates via setState() (Zustand-style)
 *   - A composable middleware pipeline
 *   - Selective subscriptions via selectors
 */

import type {
  Action,
  Dispatch,
  Listener,
  Middleware,
  Reducer,
  Selector,
  StoreAPI,
  StoreConfig,
  Unsubscribe,
} from './types'

/** Internal action types used by the store */
const INIT_ACTION: Action = { type: '@@racer/INIT' }
const SET_STATE_ACTION_TYPE = '@@racer/SET_STATE'

/**
 * Create a new Racer.js state store.
 *
 * @example
 * ```ts
 * import { createStore } from '@racer/core/state'
 *
 * interface CounterState { count: number }
 *
 * const store = createStore<CounterState>({
 *   initialState: { count: 0 },
 *   reducer: (state, action) => {
 *     switch (action.type) {
 *       case 'INCREMENT':
 *         return { ...state, count: state.count + 1 }
 *       case 'DECREMENT':
 *         return { ...state, count: state.count - 1 }
 *       default:
 *         return state
 *     }
 *   },
 * })
 *
 * store.subscribe((state) => console.log('count:', state.count))
 * store.dispatch({ type: 'INCREMENT' })
 * ```
 */
export function createStore<S>(config: StoreConfig<S>): StoreAPI<S> {
  const { initialState, reducer, middleware = [], name = 'RacerStore' } = config

  let state: S = initialState
  const listeners = new Set<Listener<S>>()
  let isDispatching = false

  // ---- helpers --------------------------------------------------------

  function getState(): S {
    return state
  }

  function notify(prevState: S): void {
    for (const listener of listeners) {
      listener(state, prevState)
    }
  }

  // ---- core dispatch (no middleware) ----------------------------------

  function baseDispatch(action: Action): void {
    if (isDispatching) {
      throw new Error(
        `[${name}] dispatch() called during a reducer or listener. ` +
          'This can cause infinite loops.'
      )
    }

    if (!action || typeof action.type !== 'string') {
      throw new Error(
        `[${name}] Actions must have a string "type" property.`
      )
    }

    const prevState = state

    // Handle direct setState actions
    if (action.type === SET_STATE_ACTION_TYPE) {
      const partial = action.payload as Partial<S>
      if (partial && typeof partial === 'object' && Object.keys(partial).length > 0) {
        state = { ...state, ...partial }
      }
    } else if (reducer) {
      isDispatching = true
      try {
        state = reducer(state, action)
      } finally {
        isDispatching = false
      }
    }

    if (state !== prevState) {
      notify(prevState)
    }
  }

  // ---- build middleware chain -----------------------------------------

  // Use a mutable reference so that the middleware API's `dispatch`
  // always points to the fully composed dispatch.  This ensures that
  // nested dispatches (e.g. from thunk middleware) traverse the entire
  // middleware chain rather than bypassing it.
  let dispatch: Dispatch = baseDispatch

  function buildDispatch(): Dispatch {
    if (middleware.length === 0) {
      return baseDispatch
    }

    const api = {
      getState,
      dispatch: (action: Action) => dispatch(action),
    }
    const chain = middleware.map((mw) => mw(api))

    // compose: chain[0](chain[1](...chain[n](baseDispatch)))
    let composed: Dispatch = baseDispatch
    for (let i = chain.length - 1; i >= 0; i--) {
      composed = chain[i](composed)
    }

    return composed
  }

  dispatch = buildDispatch()

  // ---- public API ----------------------------------------------------

  function setState(
    updater: ((state: S) => Partial<S>) | Partial<S>
  ): void {
    const partial =
      typeof updater === 'function'
        ? (updater as (s: S) => Partial<S>)(state)
        : updater

    dispatch({ type: SET_STATE_ACTION_TYPE, payload: partial })
  }

  function subscribe(listener: Listener<S>): Unsubscribe {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function select<R>(selector: Selector<S, R>): R {
    return selector(state)
  }

  function destroy(): void {
    listeners.clear()
    state = initialState
  }

  // ---- initialise -----------------------------------------------------

  // Run the INIT action through the reducer so that each reducer branch
  // can return its default state.
  baseDispatch(INIT_ACTION)

  return {
    getState,
    dispatch,
    setState,
    subscribe,
    select,
    destroy,
    name,
  }
}
