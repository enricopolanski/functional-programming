import { foldr } from 'fp-ts/lib/Foldable'
import { array } from 'fp-ts/lib/Array'

console.log(
  array.reduce(['a', 'b', 'c'], '', (b, a) => b + a) // abc
)

console.log(
  foldr(array)(['a', 'b', 'c'], '', (a, b) => b + a) // cba
)
