# semigroup-concatAll-initial-value

## 问题

根据定义，`concat`每次仅组合`A`的两个元素。是否可以将任意数量的元素组合起来？

`concatAll`函数需要：

- 一个半群的实例
- 一个初始值
- 元素的数组

```ts
import * as S from 'fp-ts/Semigroup'
import * as N from 'fp-ts/number'

const sum = S.concatAll(N.SemigroupSum)(2)

console.log(sum([1, 2, 3, 4])) // => 12

const product = S.concatAll(N.SemigroupProduct)(3)

console.log(product([1, 2, 3, 4])) // => 72
```

为什么需要提供一个初始值？

## 答案

`concatAll`方法必须返回一个`A`类型的元素。如果提供的元素数组为空，则我们无法从中获取任何类型为“A”的元素返回。
强制提供初始值可确保我们可以在数组为空时返回该初始值。


```ts
import * as Semigroup from 'fp-ts/Semigroup'
import * as NEA from 'fp-ts/NonEmptyArray'

const concatAll = <A>(S: Semigroup<A>) => (as: NEA<A>) =>
  Semigroup.concatAll(S)(NEA.tail(as))(NEA.head(as))
```
