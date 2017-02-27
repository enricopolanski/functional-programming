export const Tuple = x => ({
  map: f => Tuple([x[0], f(x[1])]),
  inspect: () => `Tuple(${x})`
})

console.log(Tuple(['a', 1]).map(x => x * 2)) // => Tuple(a,2)
