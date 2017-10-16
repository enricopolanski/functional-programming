import { Semigroup } from './Semigroup'

export interface Monoid<A> extends Semigroup<A> {
  empty: () => A
}

export const fold = <A>(M: Monoid<A>) => (
  as: Array<A>
): A => as.reduce((a, b) => M.concat(a)(b), M.empty())

export const all: Monoid<boolean> = {
  concat: x => y => x && y,
  empty: () => true
}

export const any: Monoid<boolean> = {
  concat: x => y => x || y,
  empty: () => false
}

/*

  Dato il tipo (a: A) => M, possiamo costruire una istanza
  di monoide se abbiamo a disposizione una istanza di monoide
  per M

*/
export const getFunctionMonoid = <M>(M: Monoid<M>) => <
  A
>(): Monoid<(a: A) => M> => ({
  concat: f => g => a => M.concat(f(a))(g(a)),
  empty: () => () => M.empty()
})
