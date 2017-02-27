export class IO<A> {
  static of<B>(b: B): IO<B> {
    return new IO(() => b)
  }
  constructor(private value: () => A) {}
  run(): A {
    return this.value()
  }
  map<B>(f: (a: A) => B): IO<B> {
    return new IO(() => f(this.run()))
  }
  static flatten<B>(mmb: IO<IO<B>>): IO<B> {
    return mmb.run()
  }
  chain<B>(f: (a: A) => IO<B>): IO<B> {
    return new IO(() => f(this.run()).run())
  }
  ap<B>(fab: IO<(a: A) => B>): IO<B> {
    return new IO(() => fab.run()(this.run()))
  }
}
