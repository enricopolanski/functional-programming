import { Setoid, setoidNumber } from './Setoid'
import { Semigroup, tryFold } from './Semigroup'

type Ordering = -1 | 0 | 1

interface Ord<A> extends Setoid<A> {
  compare: (x: A, y: A) => Ordering
}

const ordNumber: Ord<number> = {
  ...setoidNumber,
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

console.log(tryFold(getJoinSemigroup(ordNumber))([1, 2, 3])) // some(3)

type Person = {
  name: string
  age: number
}

const persons: Array<Person> = [
  { name: 'Giulio', age: 44 },
  { name: 'Guido', age: 47 }
]

const contramap = <A, B>(
  O: Ord<A>,
  f: (b: B) => A
): Ord<B> => ({
  equals: (x, y) => O.equals(f(x), f(y)),
  compare: (x, y) => O.compare(f(x), f(y))
})

console.log(
  tryFold(
    getMeetSemigroup(
      contramap(ordNumber, (p: Person) => p.age)
    )
  )(persons)
) // some({ name: 'Giulio', age: 44 })
