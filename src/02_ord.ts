/*

  **Quiz**. Given a type `A` is it possible to define a semigroup instance
  for `Ord<A>`. What could it represent?
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
    O.fromCompare((a1, a2) => {
      const ordering = first.compare(a1, a2)
      return ordering !== 0 ? ordering : second.compare(a1, a2)
    })
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

// a classic ordering:
// first by name, then by age, then by `rememberMe`

const byNameAgeRememberMe = concatAll(SemigroupOrdUser)(byName)([
  byAge,
  byRememberMe
])
pipe(users, sort(byNameAgeRememberMe), console.log)
/*
[ { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/

// now I want all the users with
// `rememberMe = true` first

const byRememberMeNameAge = concatAll(SemigroupOrdUser)(
  O.reverse(byRememberMe)
)([byName, byAge])
pipe(users, sort(byRememberMeNameAge), console.log)
/*
[ { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/
