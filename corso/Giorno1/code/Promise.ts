export const Pro = x => ({
  x,
  map: f => Pro(x.then(f))
})

Pro(Promise.resolve(1)).map(x => x * 2).x.then(x => console.log(x))
