export interface Setoid<A> {
  equals: (x: A) => (y: A) => boolean
}
