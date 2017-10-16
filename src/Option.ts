export type Option<A> = Some<A> | None<A>

export const of = <A>(a: A): Option<A> => new Some(a)

export class Some<A> {
  value: A
  constructor(value: A) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Option<B> {
    return new Some(f(this.value))
  }
  chain<B>(f: (a: A) => Option<B>): Option<B> {
    return f(this.value)
  }
  ap<B>(fab: Option<(a: A) => B>): Option<B> {
    return fab.map(f => f(this.value))
  }
  fold<R>(f: () => R, g: (a: A) => R): R {
    return g(this.value)
  }
}

export class None<A> {
  map<B>(f: (a: A) => B): Option<B> {
    return new None()
  }
  chain<B>(f: (a: A) => Option<B>): Option<B> {
    return new None()
  }
  ap<B>(fab: Option<(a: A) => B>): Option<B> {
    return new None()
  }
  fold<R>(f: () => R, g: (a: A) => R): R {
    return f()
  }
}

export const map = <A, B>(
  f: (a: A) => B,
  fa: Option<A>
): Option<B> => fa.map(f)

export const ap = <A, B>(
  fab: Option<(a: A) => B>,
  fa: Option<A>
): Option<B> => fa.ap(fab)

export const chain = <A, B>(
  f: (a: A) => Option<B>,
  fa: Option<A>
): Option<B> => fa.chain(f)
