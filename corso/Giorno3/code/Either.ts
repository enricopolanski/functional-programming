export class Left<L, A> {
  type: 'Left'
  static of = of
  constructor(private value: L) {}
  map<B>(f: (a: A) => B): Either<L, B> {
    return this as any
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return this as any
  }
  fold<R>(f: (l: L) => R, g: (a: A) => R): R {
    return f(this.value)
  }
}

export class Right<L, A> {
  type: 'Right'
  static of = of
  constructor(private value: A) {}
  map<B>(f: (a: A) => B): Either<L, B> {
    return new Right<L, B>(f(this.value))
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return f(this.value)
  }
  fold<R>(f: (l: L) => R, g: (a: A) => R): R {
    return g(this.value)
  }
}

function of<L, A>(a: A): Either<L, A> {
  return new Right<L, A>(a)
}

export type Either<L, A> = Left<L, A> | Right<L, A>

type AnyDictionary = { [key: string]: any }

const validateObject = (o: any): Either<string, AnyDictionary> =>
  typeof o === 'object' && o !== null ?
    new Right<string, AnyDictionary>(o) :
    new Left('not an object')

const validateString = (key: string) => (o: any): Either<string, AnyDictionary> =>
  typeof o[key] === 'string' ?
    new Right<string, AnyDictionary>(o) :
    new Left(`${key} is not a string`)

const obj = { name: 'Giulio', surname: 'Canti' }
const obj1 = { name: 'Giulio' }
const obj2 = { surname: 'Canti' }

// console.log(
//   validateObject(obj)
//     .chain(validateString('name'))
//     .chain(validateString('surname'))
// )
