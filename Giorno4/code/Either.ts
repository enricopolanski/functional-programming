// http://thunklife.website/blog/purescript-validation-pt1.html

export class Left<L, A> {
  type: 'Left'
  static of = of
  constructor(private value: L) {}
  fold<R>(f: (l: L) => R, g: (a: A) => R): R {
    return f(this.value)
  }
  map<B>(f: (a: A) => B): Either<L, B> {
    return this as any
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return this as any
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    // if (fab instanceof Left) {
    //   return new Left((fab.value as any).concat(this.value))
    // }
    return this as any // <= solo il primo errore!
  }
}

export class Right<L, A> {
  type: 'Right'
  static of = of
  constructor(private value: A) {}
  fold<R>(f: (l: L) => R, g: (a: A) => R): R {
    return g(this.value)
  }
  map<B>(f: (a: A) => B): Either<L, B> {
    return new Right<L, B>(f(this.value))
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return f(this.value)
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    if (fab instanceof Right) {
      return this.map(fab.value)
    }
    return fab as any
  }
}

function of<L, A>(a: A): Either<L, A> {
  return new Right<L, A>(a)
}

export type Either<L, A> = Left<L, A> | Right<L, A>

// =================

export function liftA2<L, A, B, C>(f: (a: A, b: B) => C): (fa: Either<L, A>, fb: Either<L, B>) => Either<L, C> {
  const curried = (a: A) => (b: B): C => f(a, b)
  return (fa, fb) => fb.ap(fa.map(curried))
}

type Data = {
  email: string,
  phone: string
}

const createData = (email: string, phone: string): Data => ({ email, phone })

const validateEmail = (s: string) => s === 'a@b.com' ?
  new Right<Array<string>, string>(s) :
  new Left([`Invalid email: ${s}`])

const validatePhone = (s: string) => s === '555' ?
  new Right<Array<string>, string>(s) :
  new Left([`Invalid phone: ${s}`])

const validateData = (email: string, phone: string): Either<Array<string>, Data> => {
  return liftA2<Array<string>, string, string, Data>(createData)(validateEmail(email), validatePhone(phone))
}

console.log(validateData('x', 'y'))

