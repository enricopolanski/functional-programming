## Question

```ts
import { Eq } from 'fp-ts/Eq'

type Point = {
  readonly x: number
  readonly y: number
}

const EqPoint: Eq<Point> = {
  equals: (first, second) => first.x === second.x && first.y === second.y
}

const points: ReadonlyArray<Point> = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 2 }
]

const search: Point = { x: 1, y: 1 }

console.log(points.includes(search)) // => false :(
console.log(pipe(points, elem(EqPoint)(search))) // => true :)
```

Why does the `includes` method returns `false`?

## Answer

The `includes` method compares by value in case of primitive values, and by reference in other cases.

As [explained here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes), includes() uses the `sameValueZero` algorithm to determine whether the given element is found.

The `sameValueZero` algorithm is very close to the one used by `===` (see [details here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality)) and objects are compared through their references instead of their values:

```ts
console.log({ foo: 'bar' } === { foo: 'bar' }) // => false

const foo = { foo: 'bar' }
console.log(foo === foo) // => true
```
