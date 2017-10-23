export type Either<L, A> = Left<L, A> | Right<L, A>

export class Left<L, A> {
  value: L
  constructor(value: L) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Either<L, B> {
    return new Left(this.value)
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    return fab.fold<Either<L, B>>(
      l => new Left(l),
      () => new Left(this.value)
    )
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return new Left(this.value)
  }
  fold<R>(f: (l: L) => R, g: (a: A) => R): R {
    return f(this.value)
  }
}

export class Right<L, A> {
  value: A
  constructor(value: A) {
    this.value = value
  }
  map<B>(f: (a: A) => B): Either<L, B> {
    return new Right(f(this.value))
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    return fab.fold<Either<L, B>>(
      l => new Left(l),
      f => new Right(f(this.value))
    )
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return f(this.value)
  }
  fold<R>(f: (l: L) => R, g: (a: A) => R): R {
    return g(this.value)
  }
}

export const left = <L, A>(l: L): Either<L, A> =>
  new Left(l)

export const right = <L, A>(a: A): Either<L, A> =>
  new Right(a)

export const of = right
