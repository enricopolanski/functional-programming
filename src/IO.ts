export class IO<A> {
  constructor(readonly run: () => A) {}
  map<B>(f: (a: A) => B): IO<B> {
    return new IO(() => f(this.run()))
  }
}
