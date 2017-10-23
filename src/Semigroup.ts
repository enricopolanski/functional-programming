export interface Semigroup<A> {
  concat: (x: A) => (y: A) => A
}

export const fold = <A>(S: Semigroup<A>) => (a: A) => (
  as: Array<A>
): A => as.reduce((a, b) => S.concat(a)(b), a)
