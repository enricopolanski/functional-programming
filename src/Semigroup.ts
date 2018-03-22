import { Option, some, none } from './Option'

export interface Semigroup<A> {
  concat: (x: A, y: A) => A
}

export const sum: Semigroup<number> = {
  concat: (x, y) => x + y
}

export const product: Semigroup<number> = {
  concat: (x, y) => x * y
}

export type Predicate<A> = (a: A) => boolean

export const getPredicateSemigroup = <A>(
  S: Semigroup<boolean>
): Semigroup<Predicate<A>> => ({
  concat: (x, y) => a => S.concat(x(a), y(a))
})

export const fold = <A>(S: Semigroup<A>) => (
  a: A,
  as: Array<A>
): A => as.reduce((a, b) => S.concat(a, b), a)

export const tryFold = <A>(S: Semigroup<A>) => (
  as: Array<A>
): Option<A> =>
  as.length === 0 ? none : some(fold(S)(as[0], as.slice(1)))

// console.log(tryFold(sum)([1, 2, 3])) // some(6)
// console.log(tryFold(sum)([])) // none

const all: Semigroup<boolean> = {
  concat: (x, y) => x && y
}

const every = <A>(p: Predicate<A>, as: Array<A>): boolean =>
  fold(all)(true, as.map(p))

const any: Semigroup<boolean> = {
  concat: (x, y) => x || y
}

// const some = <A>(p: Predicate<A>, as: Array<A>): boolean =>
//   fold(any)(false, as.map(p))

const obj: Semigroup<Object> = {
  concat: (x, y) => ({ ...x, ...y })
}

const assign = (as: Array<Object>): Object =>
  fold(obj)({}, as)

export const getDualSemigroup = <A>(
  S: Semigroup<A>
): Semigroup<A> => ({
  concat: (x, y) => S.concat(y, x)
})

const getFirstSemigroup = <A>(): Semigroup<A> => ({
  concat: (x, y) => x
})

const getLastSemigroup = <A>(): Semigroup<A> => ({
  concat: (x, y) => y
})

const getConstSemigroup = <A>(a: A): Semigroup<A> => ({
  concat: () => a
})

export const getFreeSemigroup = <A>(): Semigroup<
  Array<A>
> => ({
  concat: (x, y) => x.concat(y)
})

const of = <A>(a: A): Array<A> => [a]

const getOptionSemigroup = <A>(
  S: Semigroup<A>
): Semigroup<Option<A>> => ({
  concat: (x, y) =>
    x.fold(
      () => y,
      ax => y.fold(() => x, ay => some(S.concat(ax, ay)))
    )
})

fold(getOptionSemigroup(sum))(none, [
  some(2),
  none,
  some(3)
]) // Some(5)

const getPromiseSemigroup = <A>(
  S: Semigroup<A>
): Semigroup<Promise<A>> => ({
  concat: (x, y) =>
    Promise.all([x, y]).then(([ax, ay]) => S.concat(ax, ay))
})

// fold(getPromiseSemigroup(sum))(Promise.resolve(0), [
//   Promise.resolve(2),
//   Promise.resolve(0),
//   Promise.resolve(3)
// ]).then(x => console.log(x)) // 5

export const getProductSemigroup = <A, B>(
  A: Semigroup<A>,
  B: Semigroup<B>
): Semigroup<[A, B]> => ({
  concat: ([ax, bx], [ay, by]) => [
    A.concat(ax, ay),
    B.concat(bx, by)
  ]
})

const str: Semigroup<string> = {
  concat: (x, y) => x + y
}

getProductSemigroup(sum, str).concat([2, 'a'], [3, 'b']) // [ 5, 'ab' ]

const meet: Semigroup<number> = {
  concat: (x, y) => Math.min(x, y)
}

const join: Semigroup<number> = {
  concat: (x, y) => Math.max(x, y)
}
