# 代数的データ型

アプリケーションや機能を作成する際の良い第一歩は、そのドメインモデルを定義することです。TypeScript は、このタスクを達成するのに役立つ多くのツールを提供しています。**代数的データ型**（ADT）は、その中の一つです。

<!--
  What are the other tools?
-->

## ADT とは？

> コンピュータプログラミング、特に関数型プログラミングと型理論において、代数的データ型は、合成型の一種、つまり**他の型を組み合わせて形成される型**です。

代数的データ型の主な族として、以下の2つが挙げられます：

- **直積型**
- **直和型**

<center>
<img src="../../images/adt.png" width="400" alt="ADT" />
</center>

より単純な直積型から見ていきましょう。

## 直積型

直積型は、集合 `I` によってインデックスがつけられた型 `T_i` のコレクションです。

直積型の族に属する2つの型は `n` 列のタプルです。以下の例において `I` は自然数の集合です。

```ts
type Tuple1 = [string] // I = [0]
type Tuple2 = [string, number] // I = [0, 1]
type Tuple3 = [string, number, boolean] // I = [0, 1, 2]

// インデックスによるアクセス
type Fst = Tuple2[0] // string
type Snd = Tuple2[1] // number
```

そして以下は構造体で、`I` はラベルの集合です。

```ts
// I = {"name", "age"}
interface Person {
  name: string
  age: number
}

// ラベルによるアクセス
type Name = Person['name'] // string
type Age = Person['age'] // number
```

直積型は **多態的** であることができます。

**例**

```ts
//                ↓ 型引数
type HttpResponse<A> = {
  readonly code: number
  readonly body: A
}
```

### なぜ「直積」型なのか？

もし、型 `A` の要素数を `C(A)` と表現することにすると、（これは数学的には「濃度 (cardinality)」とも呼ばれます）、次の式が成り立ちます。

```ts
C([A, B]) = C(A) * C(B)
```

> 直積の濃度は、濃度の直積に等しい

**例**

`null` 型は濃度が `1` です。これは、メンバが `null` のみであるためです。

**クイズ**: `boolean` 型の濃度はいくつでしょうか。

**例**

```ts
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Period = 'AM' | 'PM'
type Clock = [Hour, Period]
```

`Hour` 型の濃度は12です。
`Period` 型の濃度は2です。
したがって、`Clock` 型の濃度は `12 * 2 = 24` です。

**クイズ**: 以下の `Clock` 型の濃度はいくつでしょう？

```ts
// 前と同じ
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
// 前と同じ
type Period = 'AM' | 'PM'

// タプルとは異なる実装
type Clock = {
  readonly hour: Hour
  readonly period: Period
}
```

### どのような場合に直積型が使えるのか？

各要素が独立している場合です。

```ts
type Clock = [Hour, Period]
```

ここで、`Hour` と `Period` は独立しています。`Hour` の値は `Period` の値に影響を及ぼしません。`[Hour, Period]` のペアはすべて「意味が通って」おり、論理的な誤りは存在しえません。

## 直和型

直和型は、異なる（しかし限られた）型の値を保持できるデータ型です。一つのインスタンスはこれらの型の中から一つだけ使用でき、通常はこれらの型を区別する「タグ」値があります。

TypeScript の公式ドキュメントでは、これらは [discriminated union](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) と呼ばれます。


重要な点として、直和型のメンバは **素集合** である必要がある、つまり複数のメンバに属する値が存在してはいけません。

**例**

```ts
type StringsOrNumbers = ReadonlyArray<string> | ReadonlyArray<number>

declare const sn: StringsOrNumbers

sn.map() // エラー: この呼び出し処理は行えない
```

この型は非交和ではないのです。なぜなら、空配列 `[]` の値が両方のメンバに属しているからです。

**クイズ**. 以下は素集合系と言えるでしょうか？

```ts
type Member1 = { readonly a: string }
type Member2 = { readonly b: number }
type MyUnion = Member1 | Member2
```

関数型プログラミングにおいて、非交和は頻繁に登場する概念です。

幸い、`TypeScript` には直和型が素集合であることを保証する方法があります。特定のフィールドを **タグ** として追加することです。

**注**: 非交和型、直和型、タグ付き共用型は同じものを指す語です。

**例** (redux action)

以下に示す `Action` という直和型は、ユーザが[ToDo アプリ](https://todomvc.com/)で実行できる操作の一部をモデル化しています。

```ts
type Action =
  | {
      type: 'ADD_TODO'
      text: string
    }
  | {
      type: 'UPDATE_TODO'
      id: number
      text: string
      completed: boolean
    }
  | {
      type: 'DELETE_TODO'
      id: number
    }
```

`type` タグによって、直和型の各メンバが互いに素な集合であることが保証されます。

**注**. タグとして機能するフィールドの名前は、開発者が決められます。"type" である必要はありません。たとえば `fp-ts` では、通常 `_tag` フィールドの規約が使用されています。

以上の例を見てきたので、代数的データ型が何なのか、さらに明示的に定義できます：

> 一般的に、代数的データ型は、1つまたは複数の選択肢の和であり、各選択肢は0個以上のフィールドの積です。

直和型は `多態的` `再帰的` であることができます。

**例** (linked list)

```ts
//               ↓ 型引数
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }
//                                                              ↑ 再帰
```

**クイズ** (TypeScript). 以下のデータ型はそれぞれ直積型と直和型のどちらに属するでしょうか？

- `ReadonlyArray<A>`
- `Record<string, A>`
- `Record<'k1' | 'k2', A>`
- `ReadonlyMap<string, A>`
- `ReadonlyMap<'k1' | 'k2', A>`

### コンストラクタ

直和型には、その要素数が `n` である場合、少なくとも `n` 個の **コンストラクタ** が必要です。各コンストラクタは各メンバに対応します：

**例** (redux action のクリエータ)

```ts
export type Action =
  | {
      readonly type: 'ADD_TODO'
      readonly text: string
    }
  | {
      readonly type: 'UPDATE_TODO'
      readonly id: number
      readonly text: string
      readonly completed: boolean
    }
  | {
      readonly type: 'DELETE_TODO'
      readonly id: number
    }

export const add = (text: string): Action => ({
  type: 'ADD_TODO',
  text
})

export const update = (
  id: number,
  text: string,
  completed: boolean
): Action => ({
  type: 'UPDATE_TODO',
  id,
  text,
  completed
})

export const del = (id: number): Action => ({
  type: 'DELETE_TODO',
  id
})
```

**例** (TypeScript の linked list)

```ts
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }

// 無引数のコンストラクタは、定数として宣言することができる
export const nil: List<never> = { _tag: 'Nil' }

export const cons = <A>(head: A, tail: List<A>): List<A> => ({
  _tag: 'Cons',
  head,
  tail
})

// [1, 2, 3] という配列と同値
const myList = cons(1, cons(2, cons(3, nil)))
```

### パターンマッチング

JavaScript は（TypeScript もですが） [パターンマッチング](https://github.com/tc39/proposal-pattern-matching) をサポートしていません。しかし、`match` 関数を用いてに似たものを作ることができます。

**例** (TypeScript の linked list)

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

// もしリストが空の場合 `true` を返す
export const isEmpty = match(
  () => true,
  () => false
)

// リストの先頭か `undifined` かを返す
export const head = match(
  () => undefined,
  (head, _tail) => head
)

// 再帰を用いてリストの長さを返す
export const length: <A>(fa: List<A>) => number = match(
  () => 0,
  (_, tail) => 1 + length(tail)
)
```

**クイズ**. なぜ `head` API は最適ではないのでしょうか？

-> [答え](../quiz-answers/pattern-matching.md)

**注**. TypeScript は直積型に対する素晴らしい機能 **exhaustive check** を提供しています。型検査のおかげで、関数の中身に定義された `switch` によってすべてのあり得るケースが適切に処理されているか確認することができます。

### なぜ「直和」型なのか？

以下の等式が成り立つためです：

```ts
C(A | B) = C(A) + C(B)
```

> 濃度の和は和の濃度に等しい

**例** (`Option` 型)

```ts
interface None {
  readonly _tag: 'None'
}

interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}

type Option<A> = None | Some<A>
```

一般化された式 `C(Option<A>) = 1 + C(A)` から、`Option<boolean>` 型の濃度 `1 + 2 = 3` と導出できます。

### どのような場合に直和型を使うべきか？

コンポーネント内の要素間に **依存関係がある** 場合です。

直積型で実装してしまった場合は以下のようになります。

**例** (`React` の props)

```ts
import * as React from 'react'

interface Props {
  readonly editable: boolean
  readonly onChange?: (text: string) => void
}

class Textbox extends React.Component<Props> {
  render() {
    if (this.props.editable) {
      // エラー: `undefined` であり得るオブジェクトのメンバにはアクセスできません :(
      this.props.onChange('a')
    }
    return <div />
  }
}
```

ここで何が問題かというと、`Props` は直積指向でモデル化されていながら、`onChange` が `editable` に **依存している** ことです。


この場合は直和型がより良いです：

```ts
import * as React from 'react'

type Props =
  | {
      readonly type: 'READONLY'
    }
  | {
      readonly type: 'EDITABLE'
      readonly onChange: (text: string) => void
    }

class Textbox extends React.Component<Props> {
  render() {
    switch (this.props.type) {
      case 'EDITABLE':
        this.props.onChange('a') // :)
    }
    return <div />
  }
}
```

**例** (node callbacks)

```ts
declare function readFile(
  path: string,
  //         ↓ ---------- ↓ コールバック引数
  callback: (err?: Error, data?: string) => void
): void
```

`readFile` 操作の結果は直積型で（具体的にはタプルとして）モデル化されており、後で `callback` 関数に渡されます：

```ts
type CallbackArgs = [Error | undefined, string | undefined]
```

コールバックコンポーネントは **依存的** です。`Error` か `string` かの **いずれか一方のみ** を受け取るのです。

| err         | data        | 整合か？ |
| ----------- | ----------- | ------ |
| `Error`     | `undefined` | ✓      |
| `undefined` | `string`    | ✓      |
| `Error`     | `string`    | ✘      |
| `undefined` | `undefined` | ✘      |

この API は明らかに以下の前提に基づいてモデル化されていません：

> あり得ない状態は表現できなくする

直和型がより適切な選択肢でしたが、どの直和型を選ぶべきでしょうか？
関数型の方法でエラーを処理する方法を見ていきます。

**クイズ**. 最近では、コールバックに基づく API は、その `Promise` によって大部分が置き換えられています。

```ts
declare function readFile(path: string): Promise<string>
```

TypeScript のような静的型付けを使用する場合、Promise による解決にデメリットはあるでしょうか？

## 関数型におけるエラーハンドリング

関数型な方法でエラーをハンドリングする方法を見てみましょう。

例外を投げる関数は部分関数の一例です。

以前の章で、すべての部分関数 `f` を常に全域関数 `f'` に変換できることを見てきました。

```
f': X ⟶ Option(Y)
```

TypeScript の直和型について一定の理解をしたので、`Option` をある程度問題なく定義できるでしょう。

### `Option` 型

`Option` 型は、失敗する可能性がある計算の効果を表現します。これは、失敗する場合（`None` ケース）または型 `A` を返す場合（`Some<A>` ケース）があります。

```ts
// 失敗を表す
interface None {
  readonly _tag: 'None'
}

// 成功を表す
interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}

type Option<A> = None | Some<A>
```

コンストラクタとパターンマッチングは以下のようになります：

```ts
const none: Option<never> = { _tag: 'None' }

const some = <A>(value: A): Option<A> => ({ _tag: 'Some', value })

const match = <R, A>(onNone: () => R, onSome: (a: A) => R) => (
  fa: Option<A>
): R => {
  switch (fa._tag) {
    case 'None':
      return onNone()
    case 'Some':
      return onSome(fa.value)
  }
}
```

`Option` 型を使用することで、例外が投げられたり値が存在しなかったりする場合を表現せずに済みます。したがって、以下のような、型システムが失敗の可能性に関知しないコードは、

```ts
//                              これは嘘 ↓
const head = <A>(as: ReadonlyArray<A>): A => {
  if (as.length === 0) {
    throw new Error('Empty array')
  }
  return as[0]
}

let s: string
try {
  s = String(head([]))
} catch (e) {
  s = e.message
}
```

以下のような、 **エラーの可能性を型システムにエンコードした形** に書き換えることができます。

```ts
import { pipe } from 'fp-ts/function'

//                                      ↓ 型システム自体が処理失敗の可能性を「知っている」
const head = <A>(as: ReadonlyArray<A>): Option<A> =>
  as.length === 0 ? none : some(as[0])

declare const numbers: ReadonlyArray<number>

const result = pipe(
  head(numbers),
  match(
    () => 'Empty array',
    (n) => String(n)
  )
)
```

成功・失敗のどちらなのかをチェックせずに `Option` の `value` プロパティにアクセスしようとすると、型システムはエラーの可能性について警告します：

```ts
declare const numbers: ReadonlyArray<number>

const result = head(numbers)
result.value // 型チェックエラー: 'Option<number>' 型に 'value' プロパティは存在しません。
```

`Option` に含まれる値にアクセスする際には、`match` 関数を使用して失敗の場合も処理しなければなりません。

```ts
pipe(result, match(
  () => ...エラーハンドリング...
  (n) => ...任意のビジネスロジック...
))
```

前の章で見た抽象インスタンスを定義することは可能でしょうか？まず、`Eq` から見ていきましょう。

### `Eq` インスタンス

`Option<string>` 型の2つの値を持っており、それらが等しいかどうかをチェックしたいと仮定します：

```ts
import { pipe } from 'fp-ts/function'
import { match, Option } from 'fp-ts/Option'

declare const o1: Option<string>
declare const o2: Option<string>

const result: boolean = pipe(
  o1,
  match(
    // o1 が None のとき
    () =>
      pipe(
        o2,
        match(
          // o2 が None のとき
          () => true,
          // o2 が Some のとき
          () => false
        )
      ),
    // o1 が Some のとき
    (s1) =>
      pipe(
        o2,
        match(
          // o2 が None のとき
          () => false,
          // o2 が Some のとき
          (s2) => s1 === s2 // <= ここでは string の等価性を使用しています
        )
      )
  )
)
```

もし `Option<number>` 型の2つの値があった場合、さきほど書いたコードと同じコードを書くのはかなり面倒です。結局のところ、違いは `Option` に含まれる2つの値をどのように比較するか、という点のみです。

したがって、ユーザーに `A` の `Eq` インスタンスを提供することを要求し、それから `Option<A>` の `Eq` インスタンスを導出することで、必要なコードを一般化できます。

言い換えれば、`getEq` という **コンビネータ** を定義できます。与えられた `Eq<A>` に基づいて、このコンビネータは `Eq<Option<A>>` を返します：

```ts
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import { match, Option, none, some } from 'fp-ts/Option'

export const getEq = <A>(E: Eq<A>): Eq<Option<A>> => ({
  equals: (first, second) =>
    pipe(
      first,
      match(
        () =>
          pipe(
            second,
            match(
              () => true,
              () => false
            )
          ),
        (a1) =>
          pipe(
            second,
            match(
              () => false,
              (a2) => E.equals(a1, a2) // <= ここでは `A` の等価性を使用しています
            )
          )
      )
    )
})

import * as S from 'fp-ts/string'

const EqOptionString = getEq(S.Eq)

console.log(EqOptionString.equals(none, none)) // => true
console.log(EqOptionString.equals(none, some('b'))) // => false
console.log(EqOptionString.equals(some('a'), none)) // => false
console.log(EqOptionString.equals(some('a'), some('b'))) // => false
console.log(EqOptionString.equals(some('a'), some('a'))) // => true
```

`Option<A>` 型の `Eq` インスタンスを定義できて何が一番嬉しいかというと、ここまで見てきた `Eq` インスタンスすべてに対してこれを適用できる点です。

**例**:

`Option<readonly [string, number]>` 型の `Eq` インスタンス：

```ts
import { tuple } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'
import { getEq, Option, some } from 'fp-ts/Option'
import * as S from 'fp-ts/string'

type MyTuple = readonly [string, number]

const EqMyTuple = tuple<MyTuple>(S.Eq, N.Eq)

const EqOptionMyTuple = getEq(EqMyTuple)

const o1: Option<MyTuple> = some(['a', 1])
const o2: Option<MyTuple> = some(['a', 2])
const o3: Option<MyTuple> = some(['b', 1])

console.log(EqOptionMyTuple.equals(o1, o1)) // => true
console.log(EqOptionMyTuple.equals(o1, o2)) // => false
console.log(EqOptionMyTuple.equals(o1, o3)) // => false
```

次のコードスニペットでインポートをちょっと変えれば、`Ord` に対しても同じようなことを実現できます：

```ts
import * as N from 'fp-ts/number'
import { getOrd, Option, some } from 'fp-ts/Option'
import { tuple } from 'fp-ts/Ord'
import * as S from 'fp-ts/string'

type MyTuple = readonly [string, number]

const OrdMyTuple = tuple<MyTuple>(S.Ord, N.Ord)

const OrdOptionMyTuple = getOrd(OrdMyTuple)

const o1: Option<MyTuple> = some(['a', 1])
const o2: Option<MyTuple> = some(['a', 2])
const o3: Option<MyTuple> = some(['b', 1])

console.log(OrdOptionMyTuple.compare(o1, o1)) // => 0
console.log(OrdOptionMyTuple.compare(o1, o2)) // => -1
console.log(OrdOptionMyTuple.compare(o1, o3)) // => -1
```

### `半群` インスタンスと `モノイド` インスタンス

さて、異なる2つの `Option<A>` を「マージ」したいと仮定しましょう。4つの異なるケースがあります：

| x       | y       | concat(x, y) |
| ------- | ------- | ------------ |
| none    | none    | none         |
| some(a) | none    | none         |
| none    | some(a) | none         |
| some(a) | some(b) | ?            |

最後のケースに問題があり、2つの異なる `A` に対する「マージ」処理が必要です。

そういう処理さえあれば……それは古き良き友人、`半群` の役割ではないでしょうか！？

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

あとは、ユーザに `A` の `半群` インスタンスを提供することを要求し、それをもとに `Option<A>` の `半群` インスタンスを導出すればよいです。

```ts
// 実装は読者への宿題とする
declare const getApplySemigroup: <A>(S: Semigroup<A>) => Semigroup<Option<A>>
```

**クイズ**. 前に示した半群に初期値を追加してモノイドにすることはできるでしょうか？

```ts
// 実装は読者への宿題とする
declare const getApplicativeMonoid: <A>(M: Monoid<A>) => Monoid<Option<A>>
```

`Option<A>` に対してモノイドインスタンスを定義することは可能です：

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| none     | none     | none                   |
| some(a1) | none     | some(a1)               |
| none     | some(a2) | some(a2)               |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

```ts
// 実装は読者への宿題とする
declare const getMonoid: <A>(S: Semigroup<A>) => Monoid<Option<A>>
```

**クイズ**. このモノイドにおいて `empty` は何に当たりますか？

-> [答え](../quiz-answers/option-semigroup-monoid-second.md)

**例**

`getMonoid` を使用することで、さらに2つの便利なモノイドを導出できます：

（最も左側の `None` でない値を返すモノイド）

| x        | y        | concat(x, y) |
| -------- | -------- | ------------ |
| none     | none     | none         |
| some(a1) | none     | some(a1)     |
| none     | some(a2) | some(a2)     |
| some(a1) | some(a2) | some(a1)     |

```ts
import { Monoid } from 'fp-ts/Monoid'
import { getMonoid, Option } from 'fp-ts/Option'
import { first } from 'fp-ts/Semigroup'

export const getFirstMonoid = <A = never>(): Monoid<Option<A>> =>
  getMonoid(first())
```

そしてもう一つは：

（最も右側の `None` でない値を返すモノイド）

| x        | y        | concat(x, y) |
| -------- | -------- | ------------ |
| none     | none     | none         |
| some(a1) | none     | some(a1)     |
| none     | some(a2) | some(a2)     |
| some(a1) | some(a2) | some(a2)     |

```ts
import { Monoid } from 'fp-ts/Monoid'
import { getMonoid, Option } from 'fp-ts/Option'
import { last } from 'fp-ts/Semigroup'

export const getLastMonoid = <A = never>(): Monoid<Option<A>> =>
  getMonoid(last())
```

**例**

`getLastMonoid` は存在しないかもしれない値を管理するのに役立つことがあります。以下は、テキストエディター（この場合、VSCode）のユーザー設定を導出したい場合の例です。

```ts
import { Monoid, struct } from 'fp-ts/Monoid'
import { getMonoid, none, Option, some } from 'fp-ts/Option'
import { last } from 'fp-ts/Semigroup'

/** VSCode の設定 */
interface Settings {
  /** フォントファミリーを制御する */
  readonly fontFamily: Option<string>
  /** フォントサイズをピクセル単位で制御する */
  readonly fontSize: Option<number>
  /** ミニマップの幅を制限し、特定の列数を超えないようにレンダリングする */
  readonly maxColumn: Option<number>
}

const monoidSettings: Monoid<Settings> = struct({
  fontFamily: getMonoid(last()),
  fontSize: getMonoid(last()),
  maxColumn: getMonoid(last())
})

const workspaceSettings: Settings = {
  fontFamily: some('Courier'),
  fontSize: none,
  maxColumn: some(80)
}

const userSettings: Settings = {
  fontFamily: some('Fira Code'),
  fontSize: some(12),
  maxColumn: none
}

/** userSettings は workspaceSettings を上書きする */
console.log(monoidSettings.concat(workspaceSettings, userSettings))
/*
{ fontFamily: some("Fira Code"),
  fontSize: some(12),
  maxColumn: some(80) }
*/
```

**クイズ**. VSCode が1行あたり最大で `80` 列しか処理できないと仮定した場合、`monoidSettings` の定義をどのように修正すればよいでしょうか？

### `Either` 型

`Option` というデータ型を使用して、失敗する可能性がある、または例外を投げる可能性がある部分関数を処理する方法を見てきました。

ただし、このデータ型はいくつかのユースケースでは制限されることがあります。成功の場合、型 `A` の情報を含む `Some<A>` を得ますが、もう一方のメンバである `None` にはデータが含まれていません。失敗したことはわかりますが、失敗の理由はわかりません。

これを修正するためには、失敗を表す別のデータ型があれば十分であり、それを `Left<E>` と呼びます。また、`Some<A>` の代わりに `Right<A>` を使用します。

```ts
// 失敗を表す
interface Left<E> {
  readonly _tag: 'Left'
  readonly left: E
}

// 成功を表す
interface Right<A> {
  readonly _tag: 'Right'
  readonly right: A
}

type Either<E, A> = Left<E> | Right<A>
```

コンストラクタとパターンマッチングは以下のようになります：

```ts
const left = <E, A>(left: E): Either<E, A> => ({ _tag: 'Left', left })

const right = <A, E>(right: A): Either<E, A> => ({ _tag: 'Right', right })

const match = <E, R, A>(onLeft: (left: E) => R, onRight: (right: A) => R) => (
  fa: Either<E, A>
): R => {
  switch (fa._tag) {
    case 'Left':
      return onLeft(fa.left)
    case 'Right':
      return onRight(fa.right)
  }
}
```

以前見たコールバックの例に戻りましょう：

```ts
declare function readFile(
  path: string,
  callback: (err?: Error, data?: string) => void
): void

readFile('./myfile', (err, data) => {
  let message: string
  if (err !== undefined) {
    message = `Error: ${err.message}`
  } else if (data !== undefined) {
    message = `Data: ${data.trim()}`
  } else {
    // 起こりえない
    message = 'The impossible happened'
  }
  console.log(message)
})
```

シグネチャを以下のように変更できます：

```ts
declare function readFile(
  path: string,
  callback: (result: Either<Error, string>) => void
): void
```

この API は次のように使用できます：

```ts
readFile('./myfile', (e) =>
  pipe(
    e,
    match(
      (err) => `Error: ${err.message}`,
      (data) => `Data: ${data.trim()}`
    ),
    console.log
  )
)
```
