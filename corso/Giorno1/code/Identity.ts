export const Identity = x => ({
  map: f => Identity(f(x)),
  inspect: () => `Identity(${x})`,
  fold: f => f(x)
})

console.log(Identity(1)) // => Identity(1)
