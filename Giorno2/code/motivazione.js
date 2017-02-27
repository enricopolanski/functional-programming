const Maybe = x => ({
  map: f => Maybe(x == null ? null : f(x)),
  inspect: () => `Maybe(${x})`,
  fold: (f, g) => x == null ? f() : g(x)
})

// trim :: string -> string
const trim = s => s.trim()

// x :: Maybe number
const x = Maybe(1)

console.log(x.map(trim))
