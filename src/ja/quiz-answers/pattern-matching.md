# pattern-matching

## 問題

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

なぜ `head` API は最適ではないのでしょうか？

## 答え

`head` の問題は、その終域（戻り値の型）がリスト要素（`List<A>` 内の） `A` の型または `undefined` であることです。この戻り値の型を扱うことは難しく、バグが混入する可能性を高めます。常に同じ型を返すことができれば、`head` 関数からの2つの異なる戻り値型を処理するために2つの別々のコードを書く必要はありません。
 
実際には、常に同じ型を返すように `match` 関数を実装します（この例とは異なります）。後でこのチュートリアルで、（`List<A>` 内の） `A` と `undefined` を1つの型の下にモデル化する方法を学びます。
