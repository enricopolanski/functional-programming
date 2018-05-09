/*

  Protocollo: name:asc,age:desc

*/

import {
  Ord,
  contramap,
  ordString,
  ordNumber,
  getDualOrd,
  getSemigroup
} from 'fp-ts/lib/Ord'
import {
  Option,
  some,
  none,
  option
} from 'fp-ts/lib/Option'
import { sequence } from 'fp-ts/lib/Traversable'
import {
  array,
  fold as foldArray,
  sort
} from 'fp-ts/lib/Array'
import { fold } from 'fp-ts/lib/Semigroup'

const sortBy = <A>(
  ords: Array<Ord<A>>
): Option<(as: Array<A>) => Array<A>> =>
  foldArray(ords, none, (head, tail) =>
    some(sort(fold(getSemigroup<A>())(head)(tail)))
  )

export interface Person {
  name: string
  age: number
}

const byName = contramap((p: Person) => p.name, ordString)

const byAge = contramap((p: Person) => p.age, ordNumber)

type Direction = 'asc' | 'desc'

type Field = 'name' | 'age'

const parserFromGuard = <A, B extends A>(
  p: (a: A) => a is B
): ((a: A) => Option<B>) => a => (p(a) ? some(a) : none)

const parseDirection = parserFromGuard(
  (s: string): s is Direction => s === 'asc' || s === 'desc'
)

const parseField = parserFromGuard(
  (s: string): s is Field => s === 'name' || s === 'age'
)

const fromField = (field: Field): Ord<Person> => {
  switch (field) {
    case 'name':
      return byName
    case 'age':
      return byAge
  }
}

const fromDirection = <A>(
  direction: Direction,
  ord: Ord<A>
): Ord<A> => (direction === 'asc' ? ord : getDualOrd(ord))

const isTuple = <A>(as: Array<A>): as is [A, A] =>
  as.length === 2

const parseTuple = (
  s: string,
  sep: string
): Option<[string, string]> => {
  const ss = s.split(sep)
  return isTuple(ss) ? some(ss) : none
}

const parseProtocolFragment = (
  s: string
): Option<Ord<Person>> =>
  parseTuple(s, ':').chain(([fst, snd]) =>
    parseDirection(snd).chain(direction =>
      parseField(fst).map(field =>
        fromDirection(direction, fromField(field))
      )
    )
  )

const sequenceOptions = sequence(option, array)

const parseProtocol = (
  s: string
): Option<Array<Ord<Person>>> => {
  const ords = s.split(',').map(parseProtocolFragment)
  return sequenceOptions(ords)
}

export const sortPersons = (
  s: string,
  persons: Array<Person>
): Array<Person> =>
  parseProtocol(s)
    .chain(sortBy)
    .map(sort => sort(persons))
    .getOrElse(persons)

export const persons = [
  { name: 'a', age: 1 },
  { name: 'b', age: 3 },
  { name: 'c', age: 2 },
  { name: 'b', age: 2 }
]

// console.log(sortPersons('name:asc,age:asc', persons))
// console.log(sortPersons('name:asc,age:desc', persons))
// console.log(sortPersons('age:asc,name:asc', persons))
// console.log(sortPersons('name:asc', persons))
// console.log(sortPersons('', persons))
