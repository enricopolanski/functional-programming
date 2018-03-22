import {
  Setoid,
  setoidNumber,
  setoidString
} from './Setoid'
import { Semigroup, tryFold, fold } from './Semigroup'

export type Ordering = -1 | 0 | 1

export interface Ord<A> extends Setoid<A> {
  compare: (x: A, y: A) => Ordering
}

const ordNumber: Ord<number> = {
  ...setoidNumber,
  compare: (x, y) => (x < y ? -1 : x > y ? 1 : 0)
}

const ordString: Ord<string> = {
  ...setoidString,
  compare: (x, y) => (x < y ? -1 : x > y ? 1 : 0)
}

const leq = <A>(O: Ord<A>) => (x: A, y: A): boolean =>
  O.compare(x, y) <= 0

const min = <A>(O: Ord<A>) => (x: A, y: A): A =>
  O.compare(x, y) === -1 ? x : y

const max = <A>(O: Ord<A>) => (x: A, y: A): A =>
  O.compare(x, y) === -1 ? y : x

const getMeetSemigroup = <A>(O: Ord<A>): Semigroup<A> => ({
  concat: min(O)
})

const getJoinSemigroup = <A>(O: Ord<A>): Semigroup<A> => ({
  concat: max(O)
})

// console.log(tryFold(getJoinSemigroup(ordNumber))([1, 2, 3])) // some(3)

interface Person {
  name: string
  age: number
}

const persons: Array<Person> = [
  { name: 'Giulio', age: 44 },
  { name: 'Guido', age: 47 }
]

const contramap = <A, B>(
  f: (b: B) => A,
  O: Ord<A>
): Ord<B> => ({
  equals: (x, y) => O.equals(f(x), f(y)),
  compare: (x, y) => O.compare(f(x), f(y))
})

// console.log(
//   tryFold(
//     getMeetSemigroup(
//       contramap((p: Person) => p.age, ordNumber)
//     )
//   )(persons)
// ) // some({ name: 'Giulio', age: 44 })

const sort = <A>(O: Ord<A>, as: Array<A>): Array<A> =>
  as.slice().sort(O.compare)

export const semigroupOrdering: Semigroup<Ordering> = {
  concat: (x, y) => (x !== 0 ? x : y)
}

export const fromCompare = <A>(
  compare: (x: A, y: A) => Ordering
): Ord<A> => {
  return {
    equals: (x, y) => compare(x, y) === 0,
    compare
  }
}

export const getSemigroup = <A = never>(): Semigroup<
  Ord<A>
> => {
  return {
    concat: (x, y) =>
      fromCompare((a, b) =>
        semigroupOrdering.concat(
          x.compare(a, b),
          y.compare(a, b)
        )
      )
  }
}

const ps: Array<Person> = [
  { name: 'A', age: 47 },
  { name: 'C', age: 44 },
  { name: 'B', age: 44 }
]

const byAge: Ord<Person> = contramap(p => p.age, ordNumber)

const byName: Ord<Person> = contramap(
  p => p.name,
  ordString
)

const S = getSemigroup<Person>()
const byAgeAndThenByName = fold(S)(byAge, [byName])

console.log(sort(byAgeAndThenByName, ps))
/*
[ { name: 'B', age: 44 },
  { name: 'C', age: 44 },
  { name: 'A', age: 47 } ]
*/

const getDualOrd = <A>(O: Ord<A>): Ord<A> => {
  return fromCompare((x, y) => O.compare(y, x))
}

console.log(sort(fold(S)(getDualOrd(byAge), [byName]), ps))
/*
[ { name: 'A', age: 47 },
  { name: 'B', age: 44 },
  { name: 'C', age: 44 } ]
*/
