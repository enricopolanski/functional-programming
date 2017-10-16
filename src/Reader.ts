export class Reader<E, A> {
  constructor(readonly run: (e: E) => A) {}
  map<B>(f: (a: A) => B): Reader<E, B> {
    return this.chain(a => of(f(a))) // <= derived
  }
  ap<B>(fab: Reader<E, (a: A) => B>): Reader<E, B> {
    return fab.chain(f => this.map(f)) // <= derived
  }
  chain<B>(f: (a: A) => Reader<E, B>): Reader<E, B> {
    return new Reader(e => f(this.run(e)).run(e))
  }
}

export const of = <E, A>(a: A): Reader<E, A> =>
  new Reader(() => a)

export const ask = <E>(): Reader<E, E> => new Reader(e => e)

export const asks = <E, A>(f: (e: E) => A): Reader<E, A> =>
  new Reader(f)

export const local = <E>(f: (e: E) => E) => <A>(
  fa: Reader<E, A>
): Reader<E, A> => new Reader((e: E) => fa.run(f(e)))
