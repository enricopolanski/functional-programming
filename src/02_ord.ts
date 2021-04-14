/*

  **Quiz**. Dato un tipo `A` è possibile definire una istanza di semigruppo
  per `Ord<A>`. Cosa potrebbe rappresentare?

*/

import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Ord'
import { sort } from 'fp-ts/ReadonlyArray'
import { concatAll, Semigroup } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'
import * as N from 'fp-ts/number'
import * as B from 'fp-ts/boolean'

/*

  prima di tutto definiamo una istanza di semigrouppo per `Ord<A>`

*/

const getSemigroup = <A = never>(): Semigroup<O.Ord<A>> => ({
  concat: (first, second) =>
    O.fromCompare((a1, a2) =>
      first.compare(a1, a2) === 0 ? second.compare(a1, a2) : 0
    )
})

/*

  adesso vediamola applicata ad un esempio pratico

*/

interface User {
  readonly id: number
  readonly name: string
  readonly age: number
  readonly rememberMe: boolean
}

const byName = pipe(
  S.Ord,
  O.contramap((_: User) => _.name)
)

const byAge = pipe(
  N.Ord,
  O.contramap((_: User) => _.age)
)

const byRememberMe = pipe(
  B.Ord,
  O.contramap((_: User) => _.rememberMe)
)

const SemigroupOrdUser = getSemigroup<User>()

// rappresenta una tabella da ordinare
const users: ReadonlyArray<User> = [
  { id: 1, name: 'Guido', age: 47, rememberMe: false },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true }
]

// un ordinamento classico:
// prima per nome, poi per età, poi per `rememberMe`

const byNameAgeRememberMe = concatAll(SemigroupOrdUser)(byName)([
  byAge,
  byRememberMe
])
console.log(sort(byNameAgeRememberMe)(users))
/*
[ { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/

// adesso invece voglio tutti gli utenti con
// `rememberMe = true` per primi

const byRememberMeNameAge = concatAll(SemigroupOrdUser)(
  O.reverse(byRememberMe)
)([byName, byAge])
console.log(sort(byRememberMeNameAge)(users))
/*
[ { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/
