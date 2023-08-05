# pattern-matching

## 问题

```ts
interface Nil {
  readonly _tag: 'Nil'
}

interface Cons<A> {
  readonly _tag: 'Cons'
  readonly head: A
  readonly tail: List<A>
}

export type List<A> = Nil | Cons<A>

export const match = <R, A>(
  onNil: () => R,
  onCons: (head: A, tail: List<A>) => R
) => (fa: List<A>): R => {
  switch (fa._tag) {
    case 'Nil':
      return onNil()
    case 'Cons':
      return onCons(fa.head, fa.tail)
  }
}

export const head = match(
  () => undefined,
  (head, _tail) => head
)
```

为什么`head` API 不是最优的？

## 答案

这里`head`的问题是，它的到达域（返回类型）可以是列表元素`A`的类型（在`List<A>`中）或`undefined`。使用这种返回类型可能具有挑战性，并且增加了引入错误的可能性。如果我们总是可以返回相同的类型，那么我们不需要编写2段单独的代码来处理`head`函数中两种可能的不同返回类型。

事实上，我们总是实现返回相同的类型的`match`函数（与本例不同）。在接下来的教程中，你将看到如何在一种类型下建模`A`（在`List<A>`中）和`undefined`。
