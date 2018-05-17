/*

  Vi ricordate la demo `state.ts`?

  Abbiamo migliorato le API usando State, eppure
  potremmo migliorare ancora il modello:

  è possibile svincolare il modello da `State`?

  Proviamo a generalizzare il contesto monadico
  in cui vengono eseguite le computazioni

*/

import { HKT } from 'fp-ts/lib/HKT'
import { Option } from 'fp-ts/lib/Option'
import { Monad } from 'fp-ts/lib/Monad'

export interface MonadStore<F, A> extends Monad<F> {
  getValue: (key: string) => HKT<F, Option<A>>
  setValue: (key: string, value: A) => HKT<F, void>
}

/*

  Ora posso riscrivere la funzione `update` in modo
  del tutto generale sfruttando le capabilities
  definite e l'interfaccia delle monadi che mi
  permette di sequenziare le azioni

*/

const update = <F, A>(M: MonadStore<F, A>) => (
  key: string,
  f: (a: A) => A
): HKT<F, void> =>
  M.chain(M.getValue(key), o =>
    o.fold(M.of(undefined), a => M.setValue(key, f(a)))
  )

/*

  Alla stessa stregua posso riscrivere il programma
  in modo del tutto generale

*/

const double = (n: number): number => n * 2

function program<F>(
  M: MonadStore<F, number>
): HKT<F, void> {
  return M.chain(
    M.chain(M.setValue('a', 1), () => M.setValue('b', 2)),
    () => update(M)('c', double)
  )
}

/*

  Ora definiamo due istanze per `MonadStore`, una per `IO`
  e una per `State` importando le API definite in `state.ts`

*/

import {
  getValue,
  setValue,
  getValue2,
  setValue2,
  store,
  Store
} from './state'
import { IO, io } from 'fp-ts/lib/IO'
import { State, state } from 'fp-ts/lib/State'

/** istanza di produzione */
const monadStoreIO: MonadStore<'IO', number> = {
  getValue: getValue,
  setValue: setValue,
  ...io
} as any

/** istanza di test */
const monadStoreState: MonadStore<'State', number> = {
  getValue: getValue2,
  setValue: setValue2,
  ...state
} as any

export const ioResult = program(monadStoreIO) as IO<void>

// ioResult.run()
console.log(store) // { c: 6, a: 1, b: 2 }

export const stateResult = program(
  monadStoreState
) as State<Store<number>, void>

// console.log(stateResult.exec({})) // { a: 1, b: 2 }
// console.log(stateResult.exec({ c: 3 })) // { c: 6, a: 1, b: 2 }
