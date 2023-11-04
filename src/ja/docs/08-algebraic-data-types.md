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

TypeScript の公式ドキュメントでは、これらは [discriminated union](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html) と呼ばれます。

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

// TODO ファイルコピーとリンク修正
-> See the [answer here](src/quiz-answers/pattern-matching.md)

**注**. TypeScript は直積型に対する素晴らしい機能 **exhaustive check** を提供しています。型検査によって、関数の中身に定義された `switch` がすべてのあり得るケースが適切に処理しているか確認することができます。

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

From the general formula `C(Option<A>) = 1 + C(A)` we can derive the cardinality of the `Option<boolean>` type: `1 + 2 = 3` members.

### When should I use a sum type?

When the components would be **dependent** if implemented with a product type.

**Example** (`React` props)

```ts
import * as React from 'react'

interface Props {
  readonly editable: boolean
  readonly onChange?: (text: string) => void
}

class Textbox extends React.Component<Props> {
  render() {
    if (this.props.editable) {
      // error: Cannot invoke an object which is possibly 'undefined' :(
      this.props.onChange('a')
    }
    return <div />
  }
}
```

The problem here is that `Props` is modeled like a product, but `onChange` **depends** on `editable`.

A sum type fits the use case better:

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

**Example** (node callbacks)

```ts
declare function readFile(
  path: string,
  //         ↓ ---------- ↓ CallbackArgs
  callback: (err?: Error, data?: string) => void
): void
```

The result of the `readFile` operation is modeled like a product type (to be more precise, as a tuple) which is later on passed to the `callback` function:

```ts
type CallbackArgs = [Error | undefined, string | undefined]
```

the callback components though are **dependent**: we either get an `Error` **or** a `string`:

| err         | data        | legal? |
| ----------- | ----------- | ------ |
| `Error`     | `undefined` | ✓      |
| `undefined` | `string`    | ✓      |
| `Error`     | `string`    | ✘      |
| `undefined` | `undefined` | ✘      |

This API is clearly not modeled on the following premise:

> Make impossible state unrepresentable

A sum type would've been a better choice, but which sum type?
We'll see how to handle errors in a functional way.

**Quiz**. Recently API's based on callbacks have been largely replaced by their `Promise` equivalents.

```ts
declare function readFile(path: string): Promise<string>
```

Can you find some cons of the Promise solution when using static typing like in TypeScript?

## Functional error handling

Let's see how to handle errors in a functional way.

A function that throws exceptions is an example of a partial function.

In the previous chapters we have seen that every partial function `f` can always be brought back to a total one `f'`.

```
f': X ⟶ Option(Y)
```

Now that we know a bit more about sum types in TypeScript we can define the `Option` without much issues.

### The `Option` type

The type `Option` represents the effect of a computation which may fail (case `None`) or return a type `A` (case `Some<A>`):

```ts
// represents a failure
interface None {
  readonly _tag: 'None'
}

// represents a success
interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}

type Option<A> = None | Some<A>
```

Constructors and pattern matching:

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

The `Option` type can be used to avoid throwing exceptions or representing the optional values, thus we can move from:

```ts
//                        this is a lie ↓
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

where the type system is ignorant about the possibility of failure, to:

```ts
import { pipe } from 'fp-ts/function'

//                                      ↓ the type system "knows" that this computation may fail
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

where **the possibility of an error is encoded in the type system**.

If we attempt to access the `value` property of an `Option` without checking in which case we are, the type system will warn us about the possibility of getting an error:

```ts
declare const numbers: ReadonlyArray<number>

const result = head(numbers)
result.value // type checker error: Property 'value' does not exist on type 'Option<number>'
```

The only way to access the value contained in an `Option` is to handle also the failure case using the `match` function.

```ts
pipe(result, match(
  () => ...handle error...
  (n) => ...go on with my business logic...
))
```

Is it possible to define instances for the abstractions we've seen in the chapters before? Let's begin with `Eq`.

### An `Eq` instance

Suppose we have two values of type `Option<string>` and that we want to compare them to check if their equal:

```ts
import { pipe } from 'fp-ts/function'
import { match, Option } from 'fp-ts/Option'

declare const o1: Option<string>
declare const o2: Option<string>

const result: boolean = pipe(
  o1,
  match(
    // onNone o1
    () =>
      pipe(
        o2,
        match(
          // onNone o2
          () => true,
          // onSome o2
          () => false
        )
      ),
    // onSome o1
    (s1) =>
      pipe(
        o2,
        match(
          // onNone o2
          () => false,
          // onSome o2
          (s2) => s1 === s2 // <= qui uso l'uguaglianza tra stringhe
        )
      )
  )
)
```

What if we had two values of type `Option<number>`? It would be pretty annoying to write the same code we just wrote above, the only difference afterall would be how we compare the two values contained in the `Option`.

Thus we can generalize the necessary code by requiring the user to provide an `Eq` instance for `A` and then derive an `Eq` instance for `Option<A>`.

In other words we can define a **combinator** `getEq`: given an `Eq<A>` this combinator will return an `Eq<Option<A>>`:

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
              (a2) => E.equals(a1, a2) // <= here I use the `A` equality
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

The best thing about being able to define an `Eq` instance for a type `Option<A>` is being able to leverage all of the combiners we've seen previously for `Eq`.

**Example**:

An `Eq` instance for the type `Option<readonly [string, number]>`:

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

If we slightly modify the imports in the following snippet we can obtain a similar result for `Ord`:

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

### `Semigroup` and `Monoid` instances

Now, let's suppose we want to "merge" two different `Option<A>`s,: there are four different cases:

| x       | y       | concat(x, y) |
| ------- | ------- | ------------ |
| none    | none    | none         |
| some(a) | none    | none         |
| none    | some(a) | none         |
| some(a) | some(b) | ?            |

There's an issue in the last case, we need a recipe to "merge" two different `A`s.

If only we had such a recipe..Isn't that the job our old good friends `Semigroup`s!?

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

All we need to do is to require the user to provide a `Semigroup` instance for `A` and then derive a `Semigroup` instance for `Option<A>`.

```ts
// the implementation is left as an exercise for the reader
declare const getApplySemigroup: <A>(S: Semigroup<A>) => Semigroup<Option<A>>
```

**Quiz**. Is it possible to add a neutral element to the previous semigroup to make it a monoid?

```ts
// the implementation is left as an exercise for the reader
declare const getApplicativeMonoid: <A>(M: Monoid<A>) => Monoid<Option<A>>
```

It is possible to define a monoid instance for `Option<A>` that behaves like that:

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| none     | none     | none                   |
| some(a1) | none     | some(a1)               |
| none     | some(a2) | some(a2)               |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

```ts
// the implementation is left as an exercise for the reader
declare const getMonoid: <A>(S: Semigroup<A>) => Monoid<Option<A>>
```

**Quiz**. What is the `empty` member for the monoid?

-> See the [answer here](src/quiz-answers/option-semigroup-monoid-second.md)

**Example**

Using `getMonoid` we can derive another two useful monoids:

(Monoid returning the left-most non-`None` value)

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

and its dual:

(Monoid returning the right-most non-`None` value)

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

**Example**

`getLastMonoid` can be useful to manage optional values. Let's seen an example where we want to derive user settings for a text editor, in this case VSCode.

```ts
import { Monoid, struct } from 'fp-ts/Monoid'
import { getMonoid, none, Option, some } from 'fp-ts/Option'
import { last } from 'fp-ts/Semigroup'

/** VSCode settings */
interface Settings {
  /** Controls the font family */
  readonly fontFamily: Option<string>
  /** Controls the font size in pixels */
  readonly fontSize: Option<number>
  /** Limit the width of the minimap to render at most a certain number of columns. */
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

/** userSettings overrides workspaceSettings */
console.log(monoidSettings.concat(workspaceSettings, userSettings))
/*
{ fontFamily: some("Fira Code"),
  fontSize: some(12),
  maxColumn: some(80) }
*/
```

**Quiz**. Suppose VSCode cannot manage more than `80` columns per row, how could we modify the definition of `monoidSettings` to take that into account?

### The `Either` type

We have seen how the `Option` data type can be used to handle partial functions, which often represent computations than can fail or throw exceptions.

This data type might be limiting in some use cases tho. While in the case of success we get `Some<A>` which contains information of type `A`, the other member, `None` does not carry any data. We know it failed, but we don't know the reason.

In order to fix this we simply need to another data type to represent failure, we'll call it `Left<E>`. We'll also replace the `Some<A>` type with the `Right<A>`.

```ts
// represents a failure
interface Left<E> {
  readonly _tag: 'Left'
  readonly left: E
}

// represents a success
interface Right<A> {
  readonly _tag: 'Right'
  readonly right: A
}

type Either<E, A> = Left<E> | Right<A>
```

Constructors and pattern matching:

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

Let's get back to the previous callback example:

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
    // should never happen
    message = 'The impossible happened'
  }
  console.log(message)
})
```

we can change it's signature to:

```ts
declare function readFile(
  path: string,
  callback: (result: Either<Error, string>) => void
): void
```

and consume the API in such way:

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
