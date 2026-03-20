/**
 * Type definitions for Racer.js State Management System
 */

/** Base action type with string discriminator and optional payload */
export interface Action<T extends string = string, P = any> {
  type: T
  payload?: P
}

/** A function that produces a new state given the current state and an action */
export type Reducer<S> = (state: S, action: Action) => S

/** Listener called whenever the store state changes */
export type Listener<S> = (state: S, prevState: S) => void

/** A function that derives a value from the store state */
export type Selector<S, R> = (state: S) => R

/** Unsubscribe function returned by subscribe */
export type Unsubscribe = () => void

/**
 * Middleware receives the store API and returns a function that wraps dispatch.
 *
 * Pattern:
 *   (api) => (next) => (action) => { ... next(action) ... }
 */
export type Middleware<S = any> = (
  api: MiddlewareAPI<S>
) => (next: Dispatch) => (action: Action) => void

/** The subset of the store API exposed to middleware */
export interface MiddlewareAPI<S> {
  getState: () => S
  dispatch: Dispatch
}

/** Dispatch function that accepts an action */
export type Dispatch = (action: Action) => void

/** Configuration used to create a store */
export interface StoreConfig<S> {
  /** Initial state value */
  initialState: S
  /** Reducer function that computes the next state */
  reducer?: Reducer<S>
  /** Middleware pipeline applied to dispatch */
  middleware?: Middleware<S>[]
  /** Human-readable name for debugging */
  name?: string
}

/** Public API of a Racer.js store */
export interface StoreAPI<S> {
  /** Return the current state */
  getState: () => S
  /** Dispatch an action through the reducer and middleware pipeline */
  dispatch: Dispatch
  /** Replace the state directly using an updater function or a partial object */
  setState: (updater: ((state: S) => Partial<S>) | Partial<S>) => void
  /** Subscribe to state changes; returns an unsubscribe function */
  subscribe: (listener: Listener<S>) => Unsubscribe
  /** Derive a value from the current state */
  select: <R>(selector: Selector<S, R>) => R
  /** Remove all listeners and reset to initial state */
  destroy: () => void
  /** Store name (for debugging) */
  name: string
}

/** Options for the persistence middleware */
export interface PersistOptions<S = any> {
  /** Unique key used for the storage entry */
  key: string
  /** Storage backend (must implement getItem / setItem / removeItem) */
  storage?: StorageAdapter
  /** Pick which parts of the state to persist */
  select?: (state: S) => Partial<S>
  /** Debounce writes by this many milliseconds (default 100) */
  debounceMs?: number
}

/** Minimal storage interface (compatible with localStorage, sessionStorage, etc.) */
export interface StorageAdapter {
  getItem(key: string): string | null | Promise<string | null>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

/** Options for the logger middleware */
export interface LoggerOptions {
  /** Whether logging is enabled (default true) */
  enabled?: boolean
  /** Only log actions whose type matches the predicate */
  filter?: (action: Action) => boolean
  /** Custom log function (defaults to console.log) */
  log?: (...args: any[]) => void
}

/** Options for the devtools middleware */
export interface DevtoolsOptions {
  /** Name shown in the devtools panel */
  name?: string
  /** Maximum number of recorded actions (default 50) */
  maxAge?: number
}
