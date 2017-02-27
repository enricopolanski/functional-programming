export class Maybe<A> {
  static of<B>(b: B): Maybe<B> {
    return new Maybe(b)
  }
  value: A | null | undefined;
  constructor(value: A | null | undefined) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Maybe<B> {
    return this.value == null ? none : new Maybe(f(this.value))
  }
  inspect() {
    return `Maybe(${this.value})`
  }
  fold<B>(f: () => B, g: (a: A) => B): B {
    return this.value == null ? f() : g(this.value)
  }
  chain<B>(f: (a: A) => Maybe<B>): Maybe<B> {
    return this.fold(() => none, f)
  }
  ap<B>(fab: Maybe<(a: A) => B>): Maybe<B> {
    const v = this.value
    return v == null ? none : fab.map(f => f(v))
  }
  getOrElse(f: () => A): A {
    return this.fold(f, x => x)
  }
}

export const none: Maybe<any> = new Maybe(null)

export function some<A>(a: A): Maybe<A> {
  return new Maybe(a)
}
