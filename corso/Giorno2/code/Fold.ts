import { Monoid, reduceLeft, multiplicationMonoid } from './Monoid'

export interface Fold<S, A> {
  foldMap<M>(monoid: Monoid<M>, f: (a: A) => M, s: S): M
}

function getArrayFold<A>(): Fold<Array<A>, A> {
  return {
    foldMap<M>(monoid: Monoid<M>, f: (a: A) => M, s: Array<A>): M {
      return reduceLeft(monoid, s.map(f))
    }
  }
}

const stringArrayFold = getArrayFold<string>()

console.log(stringArrayFold.foldMap(multiplicationMonoid, a => a.length, ['Hello', 'world!'])) // => 30
