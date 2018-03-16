export interface Setoid<A> {
  equals: (x: A, y: A) => boolean
}

export const setoidNumber: Setoid<number> = {
  equals: (x, y) => x === y
}
