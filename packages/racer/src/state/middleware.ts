/**
 * Racer.js State Management – Built-in Middleware
 *
 * Provides common middleware that can be composed into any store.
 */

import type {
  Action,
  DevtoolsOptions,
  LoggerOptions,
  Middleware,
  PersistOptions,
} from './types'

// ---------------------------------------------------------------------------
// Logger Middleware
// ---------------------------------------------------------------------------

/**
 * Logs every dispatched action together with the previous and next state.
 *
 * @example
 * ```ts
 * const store = createStore({
 *   initialState: { count: 0 },
 *   middleware: [loggerMiddleware()],
 * })
 * ```
 */
export function loggerMiddleware<S = any>(
  options: LoggerOptions = {}
): Middleware<S> {
  const {
    enabled = true,
    filter,
    log = console.log,
  } = options

  return (api) => (next) => (action) => {
    if (!enabled) {
      return next(action)
    }
    if (filter && !filter(action)) {
      return next(action)
    }

    const prevState = api.getState()
    log(`%c[${action.type}] prev`, 'color: #9E9E9E', prevState)
    log(`%c[${action.type}] action`, 'color: #03A9F4', action)

    next(action)

    const nextState = api.getState()
    log(`%c[${action.type}] next`, 'color: #4CAF50', nextState)
  }
}

// ---------------------------------------------------------------------------
// Thunk Middleware
// ---------------------------------------------------------------------------

/**
 * Allows dispatching asynchronous "thunk" actions — functions that receive
 * `dispatch` and `getState` and can perform side-effects before dispatching
 * plain actions.
 *
 * @example
 * ```ts
 * const store = createStore({
 *   initialState: { data: null, loading: false },
 *   reducer,
 *   middleware: [thunkMiddleware()],
 * })
 *
 * store.dispatch(((dispatch, getState) => {
 *   dispatch({ type: 'FETCH_START' })
 *   fetch('/api/data')
 *     .then(r => r.json())
 *     .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
 * }) as any)
 * ```
 */
export function thunkMiddleware<S = any>(): Middleware<S> {
  return (api) => (next) => (action: any) => {
    if (typeof action === 'function') {
      return action(api.dispatch, api.getState)
    }
    return next(action)
  }
}

// ---------------------------------------------------------------------------
// Persistence Middleware
// ---------------------------------------------------------------------------

/**
 * Persists state changes to a storage backend (e.g. localStorage).
 *
 * On store creation call `hydrateStore()` to load persisted state.
 *
 * @example
 * ```ts
 * const persist = persistMiddleware({ key: 'app-state' })
 * const store = createStore({
 *   initialState: { count: 0 },
 *   middleware: [persist],
 * })
 * // On startup: hydrateStore(store, { key: 'app-state' })
 * ```
 */
export function persistMiddleware<S = any>(
  options: PersistOptions<S>
): Middleware<S> {
  const {
    key,
    storage = typeof globalThis !== 'undefined' &&
    typeof (globalThis as any).localStorage !== 'undefined'
      ? (globalThis as any).localStorage
      : null,
    select,
    debounceMs = 100,
  } = options

  let timer: ReturnType<typeof setTimeout> | null = null

  return (api) => (next) => (action) => {
    next(action)

    if (!storage) return

    // Debounce writes
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      const stateToPersist = select
        ? select(api.getState())
        : api.getState()
      try {
        storage.setItem(key, JSON.stringify(stateToPersist))
      } catch {
        // Silently ignore storage errors (e.g. quota exceeded)
      }
    }, debounceMs)
  }
}

/**
 * Load persisted state from storage and merge it into the store.
 */
export async function hydrateStore<S>(
  store: { setState: (updater: Partial<S>) => void },
  options: Pick<PersistOptions<S>, 'key' | 'storage'>
): Promise<void> {
  const {
    key,
    storage = typeof globalThis !== 'undefined' &&
    typeof (globalThis as any).localStorage !== 'undefined'
      ? (globalThis as any).localStorage
      : null,
  } = options

  if (!storage) return

  try {
    const raw = await storage.getItem(key)
    if (raw) {
      const persisted = JSON.parse(raw) as Partial<S>
      store.setState(persisted)
    }
  } catch {
    // Ignore parse / storage errors
  }
}

// ---------------------------------------------------------------------------
// Devtools Middleware
// ---------------------------------------------------------------------------

/**
 * Records dispatched actions and state snapshots so they can be inspected
 * through `getDevtoolsState()`.
 *
 * @example
 * ```ts
 * const devtools = devtoolsMiddleware({ name: 'MyApp' })
 * const store = createStore({
 *   initialState: { count: 0 },
 *   middleware: [devtools],
 * })
 * // Later:
 * console.log(getDevtoolsState())
 * ```
 */

/** Entry recorded by devtools middleware */
export interface DevtoolsEntry {
  action: Action
  prevState: unknown
  nextState: unknown
  timestamp: number
}

// Global devtools log (keyed by store name)
const devtoolsLog = new Map<string, DevtoolsEntry[]>()

export function devtoolsMiddleware<S = any>(
  options: DevtoolsOptions = {}
): Middleware<S> {
  const { name = 'RacerStore', maxAge = 50 } = options

  if (!devtoolsLog.has(name)) {
    devtoolsLog.set(name, [])
  }

  return (api) => (next) => (action) => {
    const prevState = api.getState()

    next(action)

    const nextState = api.getState()
    const entries = devtoolsLog.get(name)!
    entries.push({
      action,
      prevState,
      nextState,
      timestamp: Date.now(),
    })

    // Trim to maxAge
    if (entries.length > maxAge) {
      entries.splice(0, entries.length - maxAge)
    }
  }
}

/**
 * Retrieve the devtools action log for a store (or all stores).
 */
export function getDevtoolsState(
  storeName?: string
): Map<string, DevtoolsEntry[]> | DevtoolsEntry[] | undefined {
  if (storeName) {
    return devtoolsLog.get(storeName)
  }
  return devtoolsLog
}

/**
 * Clear devtools log for a store (or all stores).
 */
export function clearDevtoolsState(storeName?: string): void {
  if (storeName) {
    devtoolsLog.delete(storeName)
  } else {
    devtoolsLog.clear()
  }
}
