import { IO } from './IO'
import { createStore as reduxCreateStore, Action as ReduxAction } from 'redux'

type Listener = IO<void>

interface Unsubscribe {
  (): void
}

type Store<A, S> = {
  subscribe(listener: Listener): IO<Unsubscribe>,
  dispatch(action: A): IO<A>;
  getState(): IO<S>;
}

type Reducer<A extends ReduxAction, S> = (s: S, a: A) => S

function createStore<A extends ReduxAction, S>(reducer: Reducer<A, S>, initialState: S): Store<A, S> {
  const store = reduxCreateStore(reducer, initialState)
  return {
    subscribe(listener) {
      return new IO(() => {
        const unsubscribe = store.subscribe(() => listener.run())
        return () => unsubscribe()
      })
    },
    dispatch(action) {
      return new IO(() => {
        store.dispatch(action)
        return action
      })
    },
    getState() {
      return new IO(() => store.getState())
    }
  }
}

//
// costruisco il mio store
//

type State = number;
type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' };

function reducer(s: State, a: Action): State {
  switch(a.type) {
    case 'INCREMENT' :
      return s + 1
    case 'DECREMENT' :
      return s - 1
    default :
      return s
  }
}

const store = createStore(reducer, 0)

//
// definizione degli effetti
//

// questo effetto stampa il contenuto dello store sulla console
const print = store.getState().map(x => console.log(x))

// questo effetto fa un dispatch dell'evento INCREMENT
const increment = store.dispatch({ type: 'INCREMENT' })

// questo effetto fa un dispatch dell'evento DECREMENT
const decrement = store.dispatch({ type: 'DECREMENT' })

//
// esempio di programma ed esecuzione
//

const main =
  // stampo lo store e poi ascolto i cambiamenti
  print.chain(() => store.subscribe(print))
  // mando un paio di eventi
  .chain(() => increment)
  .chain(() => decrement)

// esecuzione del programma
main.run()

// risultato sulla console
// 0
// 1
// 0
