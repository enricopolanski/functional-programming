export class Identity<A> {
  static of<B>(b: B): Identity<B> {
    return new Identity(b)
  }
  constructor(private value: A) {}
  map<B>(f: (a: A) => B): Identity<B> {
    return new Identity(f(this.value))
  }
  chain<B>(f: (a: A) => Identity<B>): Identity<B> {
    return f(this.value)
  }
}
