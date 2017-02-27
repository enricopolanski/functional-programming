export class Task<A> {
  static of<B>(b: B): Task<B> {
    return new Task(() => Promise.resolve(b))
  }
  constructor(public value: () => Promise<A>) {}
  run(): Promise<A> {
    return this.value()
  }
  map<B>(f: (a: A) => B): Task<B> {
    return new Task(() => this.run().then(f))
  }
  chain<B>(f: (a: A) => Task<B>): Task<B> {
    return new Task(() => this.value().then(a => f(a).run()))
  }
}

