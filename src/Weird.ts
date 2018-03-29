class Weird<A> {
  constructor(
    readonly value: A,
    readonly endo: (a: A) => A
  ) {}
}

const reduce = <A, B>(
  fa: Weird<A>,
  b: B,
  f: (b: B, a: A) => B
): B => f(b, fa.endo(fa.value))
