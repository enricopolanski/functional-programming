export const of = <A>(a: A): Task<A> =>
  new Task(() => Promise.resolve(a))

export class Task<A> {
  run: () => Promise<A>
  constructor(run: () => Promise<A>) {
    this.run = run
  }
  map<B>(f: (a: A) => B): Task<B> {
    return new Task(() => this.run().then(f))
  }
  chain<B>(f: (a: A) => Task<B>): Task<B> {
    return new Task(() => this.run().then(a => f(a).run()))
  }
  ap<B>(fab: Task<(a: A) => B>): Task<B> {
    return new Task(() =>
      Promise.all([fab.run(), this.run()]).then(([f, a]) =>
        f(a)
      )
    )
  }
}

export const map = <A, B>(
  f: (a: A) => B,
  fa: Task<A>
): Task<B> => fa.map(f)

export const ap = <A, B>(
  fab: Task<(a: A) => B>,
  fa: Task<A>
): Task<B> => fa.ap(fab)

export const chain = <A, B>(
  f: (a: A) => Task<B>,
  fa: Task<A>
): Task<B> => fa.chain(f)
