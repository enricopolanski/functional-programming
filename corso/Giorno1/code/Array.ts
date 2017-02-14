export const Arr = x => ({
  map: f => Arr(x.map(f)),
  inspect: () => `Arr(${x})`,
  fold: (f, g) => x.length === 0 ? f() : g(x[0], x.slice(1))
})

const f = () => 'Nil'
const g = (head, tail) => `(${head}, ${Arr(tail).fold(f, g)})`

console.log(Arr([1, 2, 3]).map(x => x * 2)) // => Arr(2,4,6)

console.log(Arr([]).fold(f, g)) // => Nil
console.log(Arr([1, 2, 3]).fold(f, g)) // => (1, (2, (3, Nil)))
