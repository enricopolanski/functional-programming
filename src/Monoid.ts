import { Semigroup, getProductSemigroup } from './Semigroup'

export interface Monoid<A> extends Semigroup<A> {
  empty: A
}

type Endomorphism<A> = (a: A) => A

const getEndomorphismMonoid = <A>(): Monoid<
  Endomorphism<A>
> => ({
  concat: (x, y) => a => x(y(a)),
  empty: a => a
})

export const getFunctionMonoid = <M>(M: Monoid<M>) => <
  A
>(): Monoid<(a: A) => M> => ({
  concat: (f, g) => a => M.concat(f(a), g(a)),
  empty: () => M.empty
})

type Reducer<S, A> = (a: A) => (s: S) => S

const getReducerMonoid = <S, A>(): Monoid<Reducer<S, A>> =>
  getFunctionMonoid(getEndomorphismMonoid<S>())<A>()

const getProductMonoid = <A, B>(
  MA: Monoid<A>,
  MB: Monoid<B>
): Monoid<[A, B]> => ({
  ...getProductSemigroup(MA, MB),
  empty: [MA.empty, MB.empty]
})

export const fold = <A>(M: Monoid<A>) => (
  as: Array<A>
): A => as.reduce((a, b) => M.concat(a, b), M.empty)

const product: Monoid<number> = {
  concat: (x, y) => x * y,
  empty: 1
}

const str: Monoid<string> = {
  concat: (x, y) => x + y,
  empty: ''
}

// console.log(fold(str)(['a', 'b', 'c'])) // 'abc'
// console.log(fold(product)([2, 3, 4])) // 24
// console.log(fold(product)([])) // 1

export const all: Monoid<boolean> = {
  concat: (x, y) => x && y,
  empty: true
}

export const any: Monoid<boolean> = {
  concat: (x, y) => x || y,
  empty: false
}
