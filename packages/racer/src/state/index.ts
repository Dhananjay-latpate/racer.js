/**
 * Racer.js State Management System
 *
 * A built-in, lightweight state management solution for Racer.js applications.
 *
 * @example
 * ```ts
 * import { createStore, loggerMiddleware } from '@racer/core/state'
 *
 * const store = createStore({
 *   initialState: { count: 0 },
 *   reducer: (state, action) => {
 *     switch (action.type) {
 *       case 'INCREMENT': return { ...state, count: state.count + 1 }
 *       default: return state
 *     }
 *   },
 *   middleware: [loggerMiddleware()],
 *   name: 'counter',
 * })
 * ```
 */

// Core store
export { createStore } from './store'

// Middleware
export {
  loggerMiddleware,
  thunkMiddleware,
  persistMiddleware,
  hydrateStore,
  devtoolsMiddleware,
  getDevtoolsState,
  clearDevtoolsState,
} from './middleware'
export type { DevtoolsEntry } from './middleware'

// React hooks
export { useStore, useSelector, useDispatch, useSetState } from './hooks'

// Types
export type {
  Action,
  Reducer,
  Listener,
  Selector,
  Unsubscribe,
  Middleware,
  MiddlewareAPI,
  Dispatch,
  StoreConfig,
  StoreAPI,
  PersistOptions,
  StorageAdapter,
  LoggerOptions,
  DevtoolsOptions,
} from './types'
