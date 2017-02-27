import { Maybe, some, none } from './Maybe'

const msum = (a: number) => (b: number): number => a + b

const msumA2 = (fa: Maybe<number>) => (fb: Maybe<number>): Maybe<number> => fb.ap(fa.ap(Maybe.of(msum))) // fb.ap(fa.map(msum))

console.log(msumA2(some(1))(some(2))) // Maybe(3)
console.log(msumA2(some(1))(none)) // none

export function liftA2<A, B, C>(f: (a: A, b: B) => C): (fa: Maybe<A>, fb: Maybe<B>) => Maybe<C> {
  const curried = (a: A) => (b: B): C => f(a, b)
  return (fa, fb) => fb.ap(fa.map(curried))
}

const sum = (a: number, b: number): number => a + b

const sumA2 = liftA2(sum)

// console.log(sumA2(some(1), some(2))) // Maybe(3)
// console.log(sumA2(some(1), none)) // none
