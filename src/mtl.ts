/*

  Vi ricordate la demo `state.ts`?

  Abbiamo migliorato le API usando State, eppure
  potremmo migliorare ancora il modello:

  è possibile svincolare il modello da State?

  Proviamo a generalizzare il contesto monadico
  in cui vengono eseguite le computazioni

*/

import { URIS, Type } from 'fp-ts/lib/HKT'
import { Option } from 'fp-ts/lib/Option'

interface MonadKVStore<F extends URIS, A> {
  getValue: (key: string) => Type<F, Option<A>> // IO<Option<A>>, State<Store<A>, Option<A>>
  setValue: (key: string, value: A) => Type<F, void> // IO<void>, State<Store<A>, void>
}

import { Monad1 } from 'fp-ts/lib/Monad'

const update = <F extends URIS, A>(
  M: MonadKVStore<F, A> & Monad1<F>
) => (key: string, f: (a: A) => A): Type<F, void> =>
  M.chain(M.getValue(key), o =>
    o.fold(M.of(undefined), a => M.setValue(key, f(a)))
  )

const double = (n: number): number => n * 2

function program<F extends URIS>(
  M: MonadKVStore<F, number> & Monad1<F>
): Type<F, void> {
  return M.chain(
    M.chain(M.setValue('a', 1), () => M.setValue('b', 2)),
    () => update(M)('c', double)
  )
}

import { fromNullable } from 'fp-ts/lib/Option'
import { IO, io } from 'fp-ts/lib/IO'

interface Store<A> {
  [key: string]: A
}

const store: Store<number> = { c: 3 }

const monadKVStoreIO: MonadKVStore<'IO', number> &
  Monad1<'IO'> = {
  getValue: key => new IO(() => fromNullable(store[key])),
  setValue: (key, value) =>
    new IO(() => {
      store[key] = value
    }),
  ...io
}

const resultIO = program(monadKVStoreIO)
resultIO.run()
console.log(store)
// { c: 6, a: 1, b: 2 }

import { task, fromIO } from 'fp-ts/lib/Task'

const monadKVStoreTask: MonadKVStore<'Task', number> &
  Monad1<'Task'> = {
  getValue: key => fromIO(monadKVStoreIO.getValue(key)),
  setValue: (key, value) =>
    fromIO(monadKVStoreIO.setValue(key, value)),
  ...task
}

const resultTask = program(monadKVStoreTask)
resultTask.run().then(() => console.log(store))
// { c: 12, a: 1, b: 2 }
