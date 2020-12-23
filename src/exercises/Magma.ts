export interface Magma<A> {
  readonly concat: (second: A) => (first: A) => A
}
