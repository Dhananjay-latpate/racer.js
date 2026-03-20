/**
 * Unit tests for Racer.js State Management – Middleware
 */

import { createStore } from '../store'
import {
  loggerMiddleware,
  thunkMiddleware,
  persistMiddleware,
  hydrateStore,
  devtoolsMiddleware,
  getDevtoolsState,
  clearDevtoolsState,
} from '../middleware'
import type { Reducer } from '../types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface CounterState {
  count: number
}

const counterReducer: Reducer<CounterState> = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 }
    case 'DECREMENT':
      return { ...state, count: state.count - 1 }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Logger Middleware
// ---------------------------------------------------------------------------

describe('loggerMiddleware', () => {
  it('logs prev state, action, and next state', () => {
    const logs: any[][] = []
    const log = (...args: any[]) => logs.push(args)

    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [loggerMiddleware({ log })],
    })

    store.dispatch({ type: 'INCREMENT' })

    expect(logs.length).toBe(3)
    // prev
    expect(logs[0][0]).toContain('[INCREMENT] prev')
    expect(logs[0][2]).toEqual({ count: 0 })
    // action
    expect(logs[1][0]).toContain('[INCREMENT] action')
    expect(logs[1][2]).toEqual({ type: 'INCREMENT' })
    // next
    expect(logs[2][0]).toContain('[INCREMENT] next')
    expect(logs[2][2]).toEqual({ count: 1 })
  })

  it('can be disabled', () => {
    const log = jest.fn()
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [loggerMiddleware({ enabled: false, log })],
    })

    store.dispatch({ type: 'INCREMENT' })
    expect(log).not.toHaveBeenCalled()
  })

  it('supports action filter', () => {
    const log = jest.fn()
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [
        loggerMiddleware({
          log,
          filter: (action) => action.type === 'DECREMENT',
        }),
      ],
    })

    store.dispatch({ type: 'INCREMENT' }) // filtered out
    expect(log).not.toHaveBeenCalled()

    store.dispatch({ type: 'DECREMENT' }) // passes filter
    expect(log).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Thunk Middleware
// ---------------------------------------------------------------------------

describe('thunkMiddleware', () => {
  it('dispatches a function as a thunk', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [thunkMiddleware()],
    })

    // Dispatch a thunk
    const thunk = (dispatch: any, getState: any) => {
      expect(getState()).toEqual({ count: 0 })
      dispatch({ type: 'INCREMENT' })
      dispatch({ type: 'INCREMENT' })
    }

    store.dispatch(thunk as any)
    expect(store.getState()).toEqual({ count: 2 })
  })

  it('still passes plain actions through', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [thunkMiddleware()],
    })

    store.dispatch({ type: 'INCREMENT' })
    expect(store.getState()).toEqual({ count: 1 })
  })
})

// ---------------------------------------------------------------------------
// Persistence Middleware
// ---------------------------------------------------------------------------

describe('persistMiddleware', () => {
  it('writes state to storage after dispatch', async () => {
    const storage: Record<string, string> = {}
    const mockStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value
      },
      removeItem: (key: string) => {
        delete storage[key]
      },
    }

    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [
        persistMiddleware({ key: 'test', storage: mockStorage, debounceMs: 0 }),
      ],
    })

    store.dispatch({ type: 'INCREMENT' })

    // Wait for debounce to flush (0ms + tick)
    await new Promise((r) => setTimeout(r, 50))

    expect(JSON.parse(storage['test'])).toEqual({ count: 1 })
  })

  it('supports select option to persist partial state', async () => {
    interface AppState {
      count: number
      temp: string
    }

    const storage: Record<string, string> = {}
    const mockStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value
      },
      removeItem: (key: string) => {
        delete storage[key]
      },
    }

    const store = createStore<AppState>({
      initialState: { count: 0, temp: 'not persisted' },
      middleware: [
        persistMiddleware({
          key: 'partial',
          storage: mockStorage,
          debounceMs: 0,
          select: (s) => ({ count: s.count }),
        }),
      ],
    })

    store.setState({ count: 5 })
    await new Promise((r) => setTimeout(r, 50))

    const persisted = JSON.parse(storage['partial'])
    expect(persisted).toEqual({ count: 5 })
    expect(persisted.temp).toBeUndefined()
  })
})

describe('hydrateStore', () => {
  it('loads persisted state into the store', async () => {
    const mockStorage = {
      getItem: () => JSON.stringify({ count: 99 }),
      setItem: () => {},
      removeItem: () => {},
    }

    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })

    await hydrateStore(store, { key: 'test', storage: mockStorage })
    expect(store.getState()).toEqual({ count: 99 })
  })

  it('handles missing storage gracefully', async () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })

    // Should not throw when storage is null
    await hydrateStore(store, { key: 'test', storage: undefined as any })
    expect(store.getState()).toEqual({ count: 0 })
  })

  it('handles corrupt storage data gracefully', async () => {
    const mockStorage = {
      getItem: () => 'not valid json{{{',
      setItem: () => {},
      removeItem: () => {},
    }

    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })

    // Should not throw
    await hydrateStore(store, { key: 'test', storage: mockStorage })
    expect(store.getState()).toEqual({ count: 0 })
  })
})

// ---------------------------------------------------------------------------
// Devtools Middleware
// ---------------------------------------------------------------------------

describe('devtoolsMiddleware', () => {
  afterEach(() => {
    clearDevtoolsState()
  })

  it('records dispatched actions and state snapshots', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [devtoolsMiddleware({ name: 'test-devtools' })],
    })

    store.dispatch({ type: 'INCREMENT' })
    store.dispatch({ type: 'INCREMENT' })

    const entries = getDevtoolsState('test-devtools') as any[]
    expect(entries).toBeDefined()
    expect(entries.length).toBe(2)

    expect(entries[0].action).toEqual({ type: 'INCREMENT' })
    expect(entries[0].prevState).toEqual({ count: 0 })
    expect(entries[0].nextState).toEqual({ count: 1 })

    expect(entries[1].prevState).toEqual({ count: 1 })
    expect(entries[1].nextState).toEqual({ count: 2 })
  })

  it('respects maxAge and trims old entries', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [devtoolsMiddleware({ name: 'trim-test', maxAge: 3 })],
    })

    for (let i = 0; i < 5; i++) {
      store.dispatch({ type: 'INCREMENT' })
    }

    const entries = getDevtoolsState('trim-test') as any[]
    expect(entries.length).toBe(3)
    // The oldest entries should have been trimmed
    expect(entries[0].prevState).toEqual({ count: 2 })
  })

  it('clearDevtoolsState clears specific store', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [devtoolsMiddleware({ name: 'clear-test' })],
    })

    store.dispatch({ type: 'INCREMENT' })
    expect(getDevtoolsState('clear-test')).toBeDefined()

    clearDevtoolsState('clear-test')
    expect(getDevtoolsState('clear-test')).toBeUndefined()
  })

  it('clearDevtoolsState without name clears all stores', () => {
    createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [devtoolsMiddleware({ name: 'store-a' })],
    }).dispatch({ type: 'INCREMENT' })

    createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [devtoolsMiddleware({ name: 'store-b' })],
    }).dispatch({ type: 'INCREMENT' })

    clearDevtoolsState()

    const all = getDevtoolsState() as Map<string, any[]>
    expect(all.size).toBe(0)
  })
})
