import { Maybe } from './Maybe'

export interface Semigroup<A> { // <= l'insieme sostegno è rappresentato da un tipo
  concat(x: A, y: A): A; // <= operazione *
}

const additionSemigroup: Semigroup<number> = { // <= provate a sostituire number con boolean
  concat: (x, y) => x + y
}

export const multiplicationSemigroup: Semigroup<number> = {
  concat: (x, y) => x * y
}

export const stringSemigroup: Semigroup<string> = {
  concat: (x, y) => x + y
}

const everySemigroup: Semigroup<boolean> = {
  concat: (x, y) => x && y
}

const someSemigroup: Semigroup<boolean> = {
  concat: (x, y) => x || y
}

const mergeSemigroup: Semigroup<Object> = {
  concat: (x, y) => Object.assign({}, x, y)
}

export function reduce<A>(semigroup: Semigroup<A>, a: A, as: Array<A>): A {
  return as.reduce(semigroup.concat, a)
}

// Array.prototype.every
function every(as: Array<boolean>): boolean {
  return reduce(everySemigroup, true, as)
}
// Array.prototype.some
function some(as: Array<boolean>): boolean {
  return reduce(someSemigroup, false, as)
}
// Object.assign
function assign(as: Array<Object>): Object {
  return reduce(mergeSemigroup, {}, as)
}

console.log(every([true, false, true])) // => false
console.log(some([true, false, true])) // => true

type Endomorphism<A> = (a: A) => A;

function compose<A>(f: Endomorphism<A>, g: Endomorphism<A>): Endomorphism<A> {
  return x => f(g(x))
}

function getEndomorphismSemigroup<A>(): Semigroup<Endomorphism<A>> {
  return { concat: compose }
}

function identity<A>(a: A): A {
  return a
}

function composeAll<A>(as: Array<Endomorphism<A>>): Endomorphism<A> {
  return reduce(getEndomorphismSemigroup<A>(), identity, as) // <= un altro caso in cui è utile identity!
}

function getFreeSemigroup<A>(): Semigroup<Array<A>> {
  return {
    // here concat is the native array method
    concat: (x, y) => x.concat(y)
  }
}

function of<A>(a: A): Array<A> {
  return [a]
}

function getMaybeSemigroup<A>(semigroup: Semigroup<A>): Semigroup<Maybe<A>> {
  return {
    concat: (x, y) => {
      if (x.value == null) {
        return y
      }
      if (y.value == null) {
        return x
      }
      // here we need a semigroup instance for A
      return new Maybe(semigroup.concat(x.value, y.value))
    }
  }
}

console.log(reduce(
    getMaybeSemigroup(additionSemigroup),
    new Maybe(null),
    [new Maybe(2), new Maybe(null), new Maybe(3)]
  )
) // => Maybe(5)

console.log(reduce(
    getMaybeSemigroup(multiplicationSemigroup),
    new Maybe(null),
    [new Maybe(2), new Maybe(null), new Maybe(3)]
  )
) // => Maybe(6)

function getPromiseSemigroup<A>(semigroup: Semigroup<A>): Semigroup<Promise<A>> {
  return {
    concat: (x, y) => Promise.all([x, y])
      // again, here we need a semigroup instance for A
      .then(([ax, ay]) => semigroup.concat(ax, ay))
  }
}

export function getProductSemigroup<A, B>(semigroupA: Semigroup<A>, semigroupB: Semigroup<B>): Semigroup<[A, B]> {
  return {
    concat: ([ax, bx], [ay, by]) => [semigroupA.concat(ax, ay), semigroupB.concat(bx, by)]
  }
}

console.log(
  getProductSemigroup<number, string>(additionSemigroup, stringSemigroup)
    .concat([2, 'a'], [3, 'b'])
) // => [5, 'ab']

const minSemigroup: Semigroup<number> = {
  concat: (x, y) => Math.min(x, y)
}

const maxSemigroup: Semigroup<number> = {
  concat: (x, y) => Math.max(x, y)
}

interface Setoid<A> {
  equals(x: A, y: A): boolean
}

type Ordering = 'LT' | 'EQ' | 'GT';

interface Ord<A> extends Setoid<A> {
  compare(x: A, y: A): Ordering
}

// less than or equal
function leq<A>(ord: Ord<A>, x: A, y: A): boolean {
  return ord.compare(x, y) !== 'GT'
}

function min<A>(ord: Ord<A>, x: A, y: A): A {
  return ord.compare(x, y) === 'LT' ? x : y
}

function max<A>(ord: Ord<A>, x: A, y: A): A {
  return ord.compare(x, y) === 'GT' ? x : y
}

function getMaxSemigroup<A>(ord: Ord<A>): Semigroup<A> {
  return {
    concat: (x, y) => max(ord, x, y)
  }
}

const numberOrd: Ord<number> = {
  equals: (x, y) => x === y,
  compare: (x, y) => x < y ? 'LT' : x === y ? 'EQ' : 'GT'
}

function getMaybeOrd<A>(ord: Ord<A>): Ord<Maybe<A>> {
  return {
    equals: (x, y) => {
      if (x.value == null && y.value == null) return true
      if (x.value != null && y.value != null) return ord.equals(x.value, y.value)
      return false
    },
    compare: (x, y) => {
      if (x.value == null && y.value == null) return 'EQ'
      if (x.value == null) return 'LT'
      if (y.value == null) return 'GT'
      return ord.compare(x.value, y.value)
    }
  }
}

const maxMaybeSemigroup = getMaxSemigroup(getMaybeOrd(numberOrd))

console.log(reduce(
    maxMaybeSemigroup,
    new Maybe(null),
    [new Maybe(2), new Maybe(null), new Maybe(3)]
  )
) // => Maybe(3)
