/**
 * Unit tests for Racer.js State Management – Core Store
 */

import { createStore } from '../store'
import type { Action, Reducer } from '../types'

// ---------------------------------------------------------------------------
// Test helpers
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
    case 'SET':
      return { ...state, count: action.payload as number }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// createStore
// ---------------------------------------------------------------------------

describe('createStore', () => {
  it('returns the initial state', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })
    expect(store.getState()).toEqual({ count: 0 })
  })

  it('uses the default store name when none is provided', () => {
    const store = createStore({ initialState: {} })
    expect(store.name).toBe('RacerStore')
  })

  it('accepts a custom store name', () => {
    const store = createStore({ initialState: {}, name: 'TestStore' })
    expect(store.name).toBe('TestStore')
  })
})

// ---------------------------------------------------------------------------
// dispatch
// ---------------------------------------------------------------------------

describe('dispatch', () => {
  it('updates state via reducer', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })
    store.dispatch({ type: 'INCREMENT' })
    expect(store.getState()).toEqual({ count: 1 })
  })

  it('handles multiple dispatches', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })
    store.dispatch({ type: 'INCREMENT' })
    store.dispatch({ type: 'INCREMENT' })
    store.dispatch({ type: 'DECREMENT' })
    expect(store.getState()).toEqual({ count: 1 })
  })

  it('passes payload to reducer', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })
    store.dispatch({ type: 'SET', payload: 42 })
    expect(store.getState()).toEqual({ count: 42 })
  })

  it('throws when action has no type', () => {
    const store = createStore({ initialState: {} })
    expect(() => store.dispatch({} as any)).toThrow('string "type"')
  })

  it('throws when dispatching during a reducer', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: (state, action) => {
        if (action.type === 'BAD') {
          // Attempting to dispatch inside a reducer should throw
          store.dispatch({ type: 'INCREMENT' })
        }
        return state
      },
    })
    expect(() => store.dispatch({ type: 'BAD' })).toThrow('infinite loops')
  })

  it('does not notify listeners when state does not change', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })
    const listener = jest.fn()
    store.subscribe(listener)

    // Unknown action – reducer returns same state reference
    store.dispatch({ type: 'UNKNOWN' })
    expect(listener).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// setState
// ---------------------------------------------------------------------------

describe('setState', () => {
  it('merges a partial object into state', () => {
    interface AppState {
      name: string
      age: number
    }
    const store = createStore<AppState>({
      initialState: { name: 'Alice', age: 30 },
    })
    store.setState({ age: 31 })
    expect(store.getState()).toEqual({ name: 'Alice', age: 31 })
  })

  it('accepts an updater function', () => {
    const store = createStore<CounterState>({
      initialState: { count: 10 },
    })
    store.setState((s) => ({ count: s.count + 5 }))
    expect(store.getState()).toEqual({ count: 15 })
  })
})

// ---------------------------------------------------------------------------
// subscribe
// ---------------------------------------------------------------------------

describe('subscribe', () => {
  it('calls the listener when state changes', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })
    const listener = jest.fn()
    store.subscribe(listener)

    store.dispatch({ type: 'INCREMENT' })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(
      { count: 1 }, // new state
      { count: 0 } // previous state
    )
  })

  it('returns an unsubscribe function', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })
    const listener = jest.fn()
    const unsub = store.subscribe(listener)

    store.dispatch({ type: 'INCREMENT' })
    expect(listener).toHaveBeenCalledTimes(1)

    unsub()
    store.dispatch({ type: 'INCREMENT' })
    expect(listener).toHaveBeenCalledTimes(1) // not called again
  })

  it('supports multiple listeners', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })
    const a = jest.fn()
    const b = jest.fn()
    store.subscribe(a)
    store.subscribe(b)

    store.dispatch({ type: 'INCREMENT' })

    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// select
// ---------------------------------------------------------------------------

describe('select', () => {
  it('derives a value from the current state', () => {
    const store = createStore<CounterState>({
      initialState: { count: 5 },
      reducer: counterReducer,
    })
    const doubled = store.select((s) => s.count * 2)
    expect(doubled).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// destroy
// ---------------------------------------------------------------------------

describe('destroy', () => {
  it('resets state to initialState and clears listeners', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
    })
    const listener = jest.fn()
    store.subscribe(listener)

    store.dispatch({ type: 'INCREMENT' })
    store.dispatch({ type: 'INCREMENT' })
    expect(store.getState()).toEqual({ count: 2 })

    store.destroy()
    expect(store.getState()).toEqual({ count: 0 })

    // listener should no longer fire
    store.dispatch({ type: 'INCREMENT' })
    expect(listener).toHaveBeenCalledTimes(2) // only the 2 before destroy
  })
})

// ---------------------------------------------------------------------------
// middleware
// ---------------------------------------------------------------------------

describe('middleware', () => {
  it('intercepts dispatched actions', () => {
    const actions: Action[] = []

    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [
        (_api) => (next) => (action) => {
          actions.push(action)
          next(action)
        },
      ],
    })

    store.dispatch({ type: 'INCREMENT' })
    store.dispatch({ type: 'DECREMENT' })

    expect(actions).toEqual([
      { type: 'INCREMENT' },
      { type: 'DECREMENT' },
    ])
    expect(store.getState()).toEqual({ count: 0 })
  })

  it('can modify or block actions', () => {
    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [
        (_api) => (next) => (action) => {
          // Block DECREMENT
          if (action.type === 'DECREMENT') return
          next(action)
        },
      ],
    })

    store.dispatch({ type: 'INCREMENT' })
    store.dispatch({ type: 'DECREMENT' }) // blocked
    expect(store.getState()).toEqual({ count: 1 })
  })

  it('composes multiple middleware in order', () => {
    const order: string[] = []

    const store = createStore<CounterState>({
      initialState: { count: 0 },
      reducer: counterReducer,
      middleware: [
        (_api) => (next) => (action) => {
          order.push('A-before')
          next(action)
          order.push('A-after')
        },
        (_api) => (next) => (action) => {
          order.push('B-before')
          next(action)
          order.push('B-after')
        },
      ],
    })

    store.dispatch({ type: 'INCREMENT' })

    expect(order).toEqual([
      'A-before',
      'B-before',
      'B-after',
      'A-after',
    ])
  })
})
