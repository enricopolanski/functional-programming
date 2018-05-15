/*

  Problema: gestire uno store chiave / valore

  Cominciamo con un approccio naive:

*/

import { Option, fromNullable } from 'fp-ts/lib/Option'
import { IO, io } from 'fp-ts/lib/IO'

export interface Store<A> {
  [key: string]: A
}

const store: Store<number> = { c: 3 }

const getValue = (key: string): IO<Option<number>> =>
  new IO(() => fromNullable(store[key]))

const setValue = (key: string, value: number): IO<void> =>
  new IO(() => {
    store[key] = value
  })

const double = (n: number): number => n * 2

const program: IO<void> = setValue('a', 1)
  .chain(() => setValue('b', 2))
  .chain(() => getValue('c'))
  .chain(o =>
    o.fold(io.of(undefined), n => setValue('c', double(n)))
  )

program.run()
// console.log(store) // { c: 6, a: 1, b: 2 }

/*

  ```
  .chain(() => getValue('c'))
  .chain(o =>
    o.fold(io.of(undefined), n => setValue('c', double(n)))
  )
  ```

  non è un gran che, si può fare di meglio?

*/

const update = (
  key: string,
  f: (n: number) => number
): IO<void> =>
  getValue(key).chain(o =>
    o.fold(io.of(undefined), n => setValue(key, f(n)))
  )

export const program2: IO<void> = setValue('a', 1)
  .chain(() => setValue('b', 2))
  .chain(() => update('c', double))

/*

  Queste API non sono soddisfacenti, è vero che sono molto semplici ma:

  - il tipo dei valori è fissato
  - può lavorare con un solo store globale
  - il programma non è facilmente testabile

*/

import { State, gets, modify, state } from 'fp-ts/lib/State'

const getValue2 = <A>(
  key: string
): State<Store<A>, Option<A>> =>
  gets(store => fromNullable(store[key]))

const setValue2 = <A>(
  key: string,
  value: A
): State<Store<A>, void> =>
  modify(store => {
    const r = { ...store }
    r[key] = value
    return r
  })

const update2 = <A>(
  key: string,
  f: (a: A) => A
): State<Store<A>, void> =>
  getValue2<A>(key).chain(o =>
    o.fold(state.of(undefined), n => setValue2(key, f(n)))
  )

// che tipo ha `program3`?
export const program3 = setValue2('a', 1)
  .chain(() => setValue2('b', 2))
  .chain(() => update2('c', double))

// console.log(program3.exec({})) // { a: 1, b: 2 }
// console.log(program3.exec({ c: 3 })) // { c: 6, a: 1, b: 2 }
