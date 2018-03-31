export type Function1<I, O> = (i: I) => O

// prima g poi f
const compose = <I, A, B>(
  f: (a: A) => B,
  g: (i: I) => A
): ((i: I) => B) => {
  return i => f(g(i))
}

// istanza di funtore covariante
const functorFunction1 = {
  map: compose
}

// prima f poi g
const pipe = <B, A, O>(
  f: (b: B) => A,
  g: (a: A) => O
): ((b: B) => O) => {
  return b => g(f(b))
}

// istanza di funtore controvariante
const contravariantFunction1 = {
  contramap: pipe
}
