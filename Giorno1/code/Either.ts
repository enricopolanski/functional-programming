export const Left = x => ({
  map: () => Left(x),
  inspect: () => `Left(${x})`,
  fold: (f, g) => f(x)
})

export const Right = x => ({
  map: f => Right(f(x)),
  inspect: () => `Right(${x})`,
  fold: (f, g) => g(x)
})

const f = e => `error: ${e}`
const g = x => `ok: ${x}`

console.log(Right(1).fold(f, g))
console.log(Left('cannot divide by zero').fold(f, g))
