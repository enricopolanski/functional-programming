import { Semigroup, getFreeSemigroup } from './Semigroup'

export type Validation<L, A> = Failure<L, A> | Success<L, A>

export class Failure<L, A> {
  constructor(readonly value: L) {}
  map<B>(f: (a: A) => B): Validation<L, B> {
    return failure(this.value)
  }
  fold<R>(f: (l: L) => R, g: (a: A) => R): R {
    return f(this.value)
  }
}

export class Success<L, A> {
  constructor(readonly value: A) {}
  map<B>(f: (a: A) => B): Validation<L, B> {
    return success(f(this.value))
  }
  fold<R>(f: (l: L) => R, g: (a: A) => R): R {
    return g(this.value)
  }
}

export const failure = <L, A>(l: L): Validation<L, A> =>
  new Failure(l)

export const success = <L, A>(a: A): Validation<L, A> =>
  new Success(a)

export const of = success

export const getAp = <L>(S: Semigroup<L>) => <A, B>(
  fab: Validation<L, (a: A) => B>,
  fa: Validation<L, A>
): Validation<L, B> => {
  return fab.fold(
    l1 =>
      fa.fold(
        l2 => failure(S.concat(l1, l2)),
        () => failure(l1)
      ),
    f => fa.fold(l => failure(l), a => success(f(a)))
  )
}

interface Person {
  name: string
  age: number
}

const validateName = (
  name: any
): Validation<Array<string>, string> =>
  typeof name === 'string'
    ? success(name)
    : failure(['invalid name'])

const validateAge = (
  age: any
): Validation<Array<string>, number> =>
  typeof age === 'number'
    ? success(age)
    : failure(['invalid age'])

const person = (name: string) => (age: number): Person => ({
  name,
  age
})

export const getLiftA2 = <L>(
  S: Semigroup<L>
): (<A, B, C>(
  f: (a: A) => (b: B) => C
) => ((
  fa: Validation<L, A>
) => (fb: Validation<L, B>) => Validation<L, C>)) => {
  const ap = getAp(S)
  return f => fa => fb => ap(fa.map(f), fb)
}

const S = getFreeSemigroup<string>()
const liftedPerson = getLiftA2(S)(person)
console.log(
  liftedPerson(validateName('Giulio'))(validateAge(44))
) // Success { value: { name: 'Giulio', age: 44 } }
console.log(
  liftedPerson(validateName(null))(validateAge('foo'))
) // Failure { value: [ 'invalid name', 'invalid age' ] }
