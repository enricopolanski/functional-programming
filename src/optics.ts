import { Option } from './Option'

export class Iso<S, A> {
  constructor(
    readonly get: (s: S) => A,
    readonly reverseGet: (a: A) => S
  ) {}
  modify(f: (a: A) => A): (s: S) => S {
    return s => this.reverseGet(f(this.get(s)))
  }
  compose<B>(ab: Iso<A, B>): Iso<S, B> {
    return new Iso(
      s => ab.get(this.get(s)),
      b => this.reverseGet(ab.reverseGet(b))
    )
  }
}

export class Lens<S, A> {
  constructor(
    readonly get: (s: S) => A,
    readonly set: (a: A) => (s: S) => S
  ) {}
  compose<B>(ab: Lens<A, B>): Lens<S, B> {
    return new Lens(
      s => ab.get(this.get(s)),
      b => s => this.set(ab.set(b)(this.get(s)))(s)
    )
  }
  modify(f: (a: A) => A): (s: S) => S {
    return s => this.set(f(this.get(s)))(s)
  }
}

export class Prism<S, A> {
  constructor(
    readonly getOption: (s: S) => Option<A>,
    readonly reverseGet: (a: A) => S
  ) {}
  compose<B>(ab: Prism<A, B>): Prism<S, B> {
    return new Prism(
      s => this.getOption(s).chain(a => ab.getOption(a)),
      b => this.reverseGet(ab.reverseGet(b))
    )
  }
  modify(f: (a: A) => A): (s: S) => S {
    return s =>
      this.getOption(s)
        .map(a => this.reverseGet(f(a)))
        .fold(() => s, s => s)
  }
}

export class Optional<S, A> {
  constructor(
    readonly getOption: (s: S) => Option<A>,
    readonly set: (a: A) => (s: S) => S
  ) {}
  compose<B>(ab: Optional<A, B>): Optional<S, B> {
    return new Optional<S, B>(
      s => this.getOption(s).chain(a => ab.getOption(a)),
      b => s => this.modify(a => ab.set(b)(a))(s)
    )
  }
  modify(f: (a: A) => A): (s: S) => S {
    return s =>
      this.getOption(s)
        .map(a => this.set(f(a))(s))
        .fold(() => s, s => s)
  }
}
