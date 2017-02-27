export const Maybe = x => ({
  map: f => Maybe(x == null ? null : f(x)),
  inspect: () => `Maybe(${x})`,
  fold: (f, g) => x == null ? f() : g(x)
})

const inverse = x => Maybe(x === 0 ? null : 1 / x)

const double = x => x * 2

console.log(inverse(2).map(double)) // Maybe(1)
console.log(inverse(0).map(double)) // Maybe(null)

const f = () => 'error'
const g = x => `ok: ${x}`

console.log(inverse(2).fold(f, g)) // => 'ok: 0.5'
console.log(inverse(0).fold(f, g)) // => 'error'
