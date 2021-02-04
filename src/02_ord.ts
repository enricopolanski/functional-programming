/*

  **Quiz**. Dato un tipo `A` è possibile definire una istanza di semigruppo
  per `Ord<A>`. Cosa potrebbe rappresentare?

*/

import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Ord'
import { sort } from 'fp-ts/ReadonlyArray'
import { fold, Semigroup } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'
import * as N from 'fp-ts/number'
import * as B from 'fp-ts/boolean'

/*

  prima di tutto definiamo una istanza di semigrouppo per `Ord<A>`

*/

const getSemigroup = <A = never>(): Semigroup<O.Ord<A>> => ({
  concat: (second) => (first) =>
    O.fromCompare((a2) => (a1) => {
      const ordering = first.compare(a2)(a1)
      return ordering !== 0 ? ordering : second.compare(a2)(a1)
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
  O.contramap((p: User) => p.name)
)

const byAge = pipe(
  N.Ord,
  O.contramap((p: User) => p.age)
)

const byRememberMe = pipe(
  B.Ord,
  O.contramap((p: User) => p.rememberMe)
)

const SemigroupUser = getSemigroup<User>()

const users: ReadonlyArray<User> = [
  { id: 1, name: 'Guido', age: 47, rememberMe: false },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true }
]

// un ordinamento classico:
// prima per nome, poi per età, poi per `rememberMe`

const byNameAgeRememberMe = fold(SemigroupUser)(byName)([byAge, byRememberMe])
console.log(sort(byNameAgeRememberMe)(users))
/*
[ { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/

// adesso invece voglio tutti gli utenti con
// `rememberMe = true` per primi

const byRememberMeNameAge = fold(SemigroupUser)(O.getDual(byRememberMe))([
  byName,
  byAge
])
console.log(sort(byRememberMeNameAge)(users))
/*
[ { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/
