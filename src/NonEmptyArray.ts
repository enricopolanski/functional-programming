import { Semigroup } from './Semigroup'

class NonEmptyArray<A> {
  constructor(readonly head: A, readonly tail: Array<A>) {}
}

const getNonEmptyArraySemigroup = <A>(): Semigroup<
  NonEmptyArray<A>
> => ({
  concat: (x, y) =>
    new NonEmptyArray(
      x.head,
      x.tail.concat([y.head]).concat(y.tail)
    )
})

console.log(
  getNonEmptyArraySemigroup().concat(
    new NonEmptyArray(1, [2]),
    new NonEmptyArray(3, [4, 5])
  )
) // { head: 1, tail: [ 2, 3, 4, 5 ] }
