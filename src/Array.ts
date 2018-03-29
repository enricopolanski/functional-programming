export const functorArray = {
  map: <A, B>(f: (a: A) => B, fa: Array<A>): Array<B> =>
    fa.map(f)
}

export const applicativeArray = {
  ...functorArray,
  of: <A>(a: A): Array<A> => [a],
  ap: <A, B>(
    fab: Array<(a: A) => B>,
    fa: Array<A>
  ): Array<B> =>
    fab.reduce(
      (acc, f) => acc.concat(fa.map(f)),
      [] as Array<B>
    )
}

export const monadArray = {
  ...applicativeArray,
  chain: <A, B>(
    f: (a: A) => Array<B>,
    fa: Array<A>
  ): Array<B> =>
    fa.reduce((acc, a) => acc.concat(f(a)), [] as Array<B>)
}

export const reduce = <A, B>(
  fa: Array<A>,
  b: B,
  f: (b: B, a: A) => B
): B => fa.reduce(f, b)
