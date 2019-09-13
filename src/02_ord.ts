/*

  Dato un tipo `A` è possibile definire una istanza di semigruppo
  per `Ord<A>`. Cosa rappresenta?

*/

import {
  getSemigroup,
  contramap,
  ordString,
  ordNumber,
  ordBoolean,
  getDualOrd
} from 'fp-ts/lib/Ord'
import { fold } from 'fp-ts/lib/Semigroup'
import { sort } from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/pipeable'

interface User {
  id: number
  name: string
  age: number
  rememberMe: boolean
}

const byName = pipe(
  ordString,
  contramap((p: User) => p.name)
)

const byAge = pipe(
  ordNumber,
  contramap((p: User) => p.age)
)

const byRememberMe = pipe(
  ordBoolean,
  contramap((p: User) => p.rememberMe)
)

const S = getSemigroup<User>()

const users: Array<User> = [
  { id: 1, name: 'Guido', age: 47, rememberMe: false },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true }
]

// un ordinamento classico:
// prima per nome, poi per età, poi per `rememberMe`

const O1 = fold(S)(byName, [byAge, byRememberMe])
console.log(sort(O1)(users))
/*
[ { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/

// adesso invece voglio tutti gli utenti con
// `rememberMe = true` per primi

const O2 = fold(S)(getDualOrd(byRememberMe), [
  byName,
  byAge
])
console.log(sort(O2)(users))
/*
[ { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/
