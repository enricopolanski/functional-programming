import { Semigroup, reduce, stringSemigroup, multiplicationSemigroup, getProductSemigroup } from './Semigroup'

export interface Monoid<A> extends Semigroup<A> {
  empty(): A
}

export class NonEmptyArray<A> {
  readonly head: A;
  readonly tail: Array<A>;
  constructor(head: A, tail: Array<A>) {
    this.head = head
    this.tail = tail
  }
  inspect() {
    return `(${this.head}, [${this.tail}])`
  }
}

function getNonEmptyArraySemigroup<A>(): Semigroup<NonEmptyArray<A>> {
  return {
    concat: (x, y) => new NonEmptyArray(x.head, x.tail.concat(y.head).concat(y.tail))
  }
}

console.log(
  getNonEmptyArraySemigroup<number>().concat(
    new NonEmptyArray(1, [2]),
    new NonEmptyArray(3, [4, 5])
  )
) // => (1, [2,3,4,5])

export function reduceLeft<A>(monoid: Monoid<A>, as: Array<A>): A {
  return reduce(monoid, monoid.empty(), as)
}

const stringMonoid: Monoid<string> = {
  empty: () => '',
  concat: stringSemigroup.concat
}

export const multiplicationMonoid: Monoid<number> = {
  empty: () => 1,
  concat: multiplicationSemigroup.concat
}

console.log(reduceLeft(stringMonoid, ['a', 'b', 'c'])) // => 'abc'
console.log(reduceLeft(multiplicationMonoid, [2, 3, 4])) // => 24
console.log(reduceLeft(multiplicationMonoid, [])) // => 1

function getProductMonoid<A, B>(monoidA: Monoid<A>, monoidB: Monoid<B>): Monoid<[A, B]> {
  return {
    empty: () => ([monoidA.empty(), monoidB.empty()]),
    concat: getProductSemigroup(monoidA, monoidB).concat
  }
}

console.log(
  reduceLeft(
    getProductMonoid(multiplicationMonoid, stringMonoid),
    [[2, 'a'], [3, 'b']]
  )
) // => [6, 'ab']

console.log(
  reduceLeft(
    getProductMonoid(multiplicationMonoid, stringMonoid),
    []
  )
) // => [1, '']
