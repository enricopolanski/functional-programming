export const of = <A>(a: A) => new Identity(a)

export class Identity<A> {
  constructor(readonly value: A) {}
  map<B>(f: (a: A) => B): Identity<B> {
    return new Identity(f(this.value))
  }
  chain<B>(f: (a: A) => Identity<B>): Identity<B> {
    return f(this.value)
  }
  ap<B>(fab: Identity<(a: A) => B>): Identity<B> {
    return new Identity(fab.value(this.value))
  }
}

export const map = <A, B>(
  f: (a: A) => B,
  fa: Identity<A>
): Identity<B> => fa.map(f)

export const ap = <A, B>(
  fab: Identity<(a: A) => B>,
  fa: Identity<A>
): Identity<B> => fa.ap(fab)

export const chain = <A, B>(
  f: (a: A) => Identity<B>,
  fa: Identity<A>
): Identity<B> => fa.chain(f)

const reduce = <A, B>(
  fa: Identity<A>,
  b: B,
  f: (b: B, a: A) => B
): B => f(b, fa.value)
