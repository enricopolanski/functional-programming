const IO = x => ({
  map: f => IO(() => f(x())),
  run: () => x()
})

console.log(IO(() => {
  console.log('IO called')
  return 1
}).map(x => x * 2).run()) // => 'IO called' \n 2
