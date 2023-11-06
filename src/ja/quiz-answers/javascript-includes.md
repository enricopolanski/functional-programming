# javascript-includes

## 問題

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

なぜ`includes`が`false`を返しました?

## 答え

`includes`は、プリミティブ値の場合は値を比較し、それ以外の場合は参照を比較します。

[ここ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)で説明したように，`includes()`は`sameValueZero`アルゴリズムを使用して、指定された要素が見つかるかどうかを判断します。

`sameValueZero`アルゴリズムは`===`で使用されるアルゴリズムに非常に似ており([詳細はこちら](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#same-value-zero_equality))，オブジェクトは値ではなく参照で比較されます。

```ts
console.log({ foo: 'bar' } === { foo: 'bar' }) // => false

const foo = { foo: 'bar' }
console.log(foo === foo) // => true
```
