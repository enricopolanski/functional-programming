const xs: Array<string> = ['a', 'b', 'b']
const ys: Array<string | undefined> = xs
ys.push(undefined)
xs.map((s) => s.trim()) // explosion at runtime
