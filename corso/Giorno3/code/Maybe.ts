export class Maybe<A> {
  static flatten<B>(mmb: Maybe<Maybe<B>>): Maybe<B> {
    return mmb.fold(() => none, m => m)
  }
  static of<B>(b: B): Maybe<B> {
    return new Maybe(b)
  }
  value: A | null;
  constructor(value: A | null) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Maybe<B> {
    return this.value == null ? none : new Maybe(f(this.value))
  }
  inspect() {
    return `Maybe(${this.value})`
  }
  fold<B>(f: () => B, g: (a: A) => B) {
    return this.value == null ? f() : g(this.value)
  }
  chain<B>(f: (a: A) => Maybe<B>): Maybe<B> {
    return this.fold(() => none, f)
  }
  getOrElse(f: () => A): A {
    return this.fold(f, x => x)
  }
}

export const none: Maybe<any> = new Maybe(null)

export function some<A>(a: A): Maybe<A> {
  return new Maybe(a)
}

function head<A>(as: Array<A>): Maybe<A> {
  return new Maybe(as.length ? as[0] : null)
}

const inverse = (n: number): Maybe<number> => new Maybe(n !== 0 ? 1 / n : null)

// x :: Maybe<Maybe<number>>
const x = head([2, 3]).map(inverse)

// y :: Maybe<number>
const y = Maybe.flatten(head([2, 3]).map(inverse))

// console.log(head([2, 3]).chain(inverse))
