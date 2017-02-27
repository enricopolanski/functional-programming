```js
// @flow

//
// tipi
//

type IO<A> = () => A;
type Listener = IO<void>;
type Unsubscribe = () => void;
type Store<A, S> = {
  subscribe(listener: Listener): IO<Unsubscribe>,
  dispatch(action: A): IO<A>;
  getState(): IO<S>;
};
type Reducer<A, S> = (s: S, a: A) => S;

//
// implementazione
//

import type { Store as ReduxStore } from 'redux'
import { createStore as reduxCreateStore } from 'redux'

function createStore<A: { type: $Subtype<string> }, S>(reducer: Reducer<A, S>, initialState: S): Store<A, S> {
  const store: ReduxStore<S, A> = reduxCreateStore(reducer, initialState)
  return {
    subscribe(listener) {
      return () => {
        const unsubscribe = store.subscribe(() => listener())
        return () => unsubscribe()
      }
    },
    dispatch(action) {
      return () => {
        store.dispatch(action)
        return action
      }
    },
    getState() {
      return () => store.getState()
    }
  }
}

//
// costruisco il mio store
//

type State = number;
type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' };

function reducer(s, a) {
  switch(a.type) {
    case 'INCREMENT' :
      return s + 1
    case 'DECREMENT' :
      return s - 1
    default :
      return s
  }
}

const store: Store<Action, State> = createStore(reducer, 0)

//
// definizione della monade IO
//

const io = {
  of<A>(a: A): IO<A> {
    return () => a
  },
  map<A, B>(f: (a: A) => B, fa: IO<A>): IO<B> {
    return () => f(fa())
  },
  chain<A, B>(f: (a: A) => IO<B>, fa: IO<A>): IO<B> {
    return () => f(fa())()
  }
}

//
// definizione degli effetti
//

// questo effetto stampa il contenuto dello store sulla console
const listenerIO: IO<void> = io.map(console.log.bind(console), store.getState())

// questo effetto fa un dispatch dell'evento INCREMENT
const incrementIO = store.dispatch({ type: 'INCREMENT' })

// questo effetto fa un dispatch dell'evento DECREMENT
const decrementIO = store.dispatch({ type: 'DECREMENT' })

//
// esempio di programma ed esecuzione
//

// stampo lo store e poi ascolto i cambiamenti
const subscribeIO: IO<Unsubscribe> = io.chain(() => store.subscribe(listenerIO), listenerIO)

// dopo aver ascoltato mando un paio di eventi
const dispatchIO: IO<Action> = io.chain(() => decrementIO, io.chain(() => incrementIO, subscribeIO))

// fine del programma
const mainIO: IO<Action> = () => dispatchIO()

// esecuzione del programma
console.log(mainIO())

// risultato sulla console
// 0
// 1
// 0
// { type: 'DECREMENT' }
```
