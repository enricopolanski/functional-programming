# javascript-includes

## 问题

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

为什么`includes`方法返回了`false`?

## 答案

`includes`方法在基本类型时比较值，其他情况下比较引用。

正如[这里](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)解释的，includes()使用`零值相等`算法去确定给定的值是否能被找到.

`零值相等`算法非常接近在`===`中使用的算法([细节请看这里](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality))，对象比较它们的引用而不是它们的值：

```ts
console.log({ foo: 'bar' } === { foo: 'bar' }) // => false

const foo = { foo: 'bar' }
console.log(foo === foo) // => true
```
