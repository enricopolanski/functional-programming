export class Maybe<A> {
  readonly value: A | null;
  constructor(value: A | null) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Maybe<B> {
    return this.value == null ? new Maybe<B>(null) : new Maybe(f(this.value))
  }
  inspect() {
    return `Maybe(${this.value})`
  }
  fold<B>(f: () => B, g: (a: A) => B) {
    return this.value == null ? f() : g(this.value)
  }
}

