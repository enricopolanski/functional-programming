export type Either<L, A> = Left<L, A> | Right<L, A>

export class Left<L, A> {
  constructor(readonly value: L) {}
  map<B>(f: (a: A) => B): Either<L, B> {
    return left(this.value)
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    return fab.fold<Either<L, B>>(left, () =>
      left(this.value)
    )
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return left(this.value)
  }
  fold<R>(f: (l: L) => R, g: (a: A) => R): R {
    return f(this.value)
  }
}

export class Right<L, A> {
  constructor(readonly value: A) {}
  map<B>(f: (a: A) => B): Either<L, B> {
    return right(f(this.value))
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    return fab.fold<Either<L, B>>(left, f =>
      right(f(this.value))
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

export const isLeft = <L, A>(
  fa: Either<L, A>
): fa is Left<L, A> => fa instanceof Left

export const isRight = <L, A>(
  fa: Either<L, A>
): fa is Right<L, A> => fa instanceof Right

export const reduce = <L, A, B>(
  fa: Either<L, A>,
  b: B,
  f: (b: B, a: A) => B
): B => (isRight(fa) ? f(b, fa.value) : b)
