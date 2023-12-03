# 関手

前のセクションでは、圏 _TS_（TypeScript における圏）についてと、関数合成の中核的な問題について話しました：

> どうすれば、2つのジェネリックな関数 `f: (a: A) => B` と `g: (c: C) => D` を合成できるでしょうか？

なぜこの問いに対する答えがそんなに重要なのでしょうか？

なぜなら、圏がプログラミング言語のモデリングに使用できるとすれば、射（圏 _TS_ の関数）は **プログラム** のモデリングに使用できるからです。

したがって、この抽象的な問いに対する答えを見つけることは、**プログラムを包括的に合成する具体的な方法** を見つけることを意味します。そして、それは私たち開発者にとって非常に興味深いことではないでしょうか？

## プログラムとしての関数

関数を使用してプログラムをモデリングする場合、すぐに対処しなければならない問題があります：

> 副作用を持つプログラムを純粋な関数でどうやってモデリングするのでしょうか？

その答えは、**effect** を通じて副作用をモデリングする、つまり副作用を **表す** 型を使用することです。

JavaScript でこれを実現する2つの手法を見てみましょう：

- effect のための DSL（ドメイン固有言語）を定義する
- _thunk_ を使用する

最初の手法、DSLを使用する方法を、次のプログラムを例として見てみます：

```ts
function log(message: string): void {
  console.log(message) // 副作用
}
```

この関数の戻り値の型を変更し、関数が副作用の **記述** を返すようにします：

```ts
type DSL = ... // システムで処理されうるすべての effect を併合する型

function log(message: string): DSL {
  return {
    type: "log",
    message
  }
}
```

**クイズ** 新しく定義された `log` 関数は本当に純粋な関数ですか？実際には `log('foo') !== log('foo')`` です！

この手法は、effect を結合する方法と、最終的なプログラムを実行する際に副作用を実行できるインタプリタ定義が必要です。

2つ目の手法は、TypeScript においてより簡潔で、計算を _thunk_ に閉じ込めるというものです：

```ts
// 同期の副作用を表す thunk
type IO<A> = () => A

const log = (message: string): IO<void> => {
  return () => console.log(message) // thunk を返す
}
```

`log` が実行されると、直ちに副作用は発生しませんが、**計算を表す値**（アクションとも呼ばれる）を返します。

```ts
import { IO } from 'fp-ts/IO'

export const log = (message: string): IO<void> => {
  return () => console.log(message) // returns a thunk
}

export const main = log('hello!')
// この時点では出力には何も表示されません
// `main`は単なる計算を表す不活性な値です

main()
// プログラムを実行する際にのみ結果が表示されます
```

関数型プログラミングでは、副作用を（effect の形で）システムの境界（`main` 関数）に押し込む傾向があり、そこでインタプリタによって実行されることになります。これにより、次のような枠組みが得られます：

> システム = 純粋なコア + 命令型シェル

**純粋関数型** 言語（Haskell、PureScript、Elm など）では、この分離が厳密で明確であり、言語自体によって強制されます。

この thunk 手法（`fp-ts` で使用されているのと同じ手法）を用いた場合でも、effect を結合する方法が必要です。これは、プログラムを包括的な方法で合成するという目標に戻ることを意味します。それでは、どのようにするかを見てみましょう。

まず、いくつか（非公式な）用語が必要です。以下のような関数を **純粋プログラム** と呼ぶことにしましょう：

```ts
(a: A) => B
```

このようなシグネチャは、入力を型 `A` とし、どのような effect も発生させずに型 `B` の結果を返すプログラムをモデリングしています。

**例**

`len` プログラム:

```ts
const len = (s: string): number => s.length
```

以下のようなシグネチャを持つ関数を **作用プログラム** と呼ぶことにしましょう：

```ts
(a: A) => F<B>
```

このようなシグネチャは、入力を型 `A` とし、結果を型 `B` を effect `F` とともに返すプログラムをモデリングしています。ここで `F` は一種の型コンストラクタです。

[型コンストラクタ](https://en.wikipedia.org/wiki/Type_constructor) とは、1つ以上の型を引数に取り、別の型を返す `n` 元の型演算子です。既に `Option`、`ReadonlyArray`、`Either` のような型コンストラクタの例をここまでで取り扱っています。

**例**

`head` プログラム:

```ts
import { Option, some, none } from 'fp-ts/Option'

const head = <A>(as: ReadonlyArray<A>): Option<A> =>
  as.length === 0 ? none : some(as[0])
```

は、 `Option` という effect を持つプログラムです。

effect は、`n >= 1` として `n` 元の型コンストラクタと結びつきます。例を挙げます：

| 型コンストラクタ | Effect (解釈)                        |
| ------------------ | ---------------------------------------------- |
| `ReadonlyArray<A>` | 非決定的な計算                |
| `Option<A>`        | 失敗する可能性のある計算                   |
| `Either<E, A>`     | 失敗する可能性のある計算                 |
| `IO<A>`            | **絶対に失敗しない** 同期的な計算 |
| `Task<A>`          | **絶対に失敗しない** 非同期の計算    |
| `Reader<R, A>`     | 環境から読み取る計算                    |

ここで

```ts
// `Promise` を返す thunk
type Task<A> = () => Promise<A>
```

```ts
// `R` は計算に必要な（「読み取り」可能な）「環境」を表し、`A` は結果です
type Reader<R, A> = (r: R) => A
```

核心の問題に戻りましょう：

> どうすれば、2つのジェネリックな関数 `f: (a: A) => B` と `g: (c: C) => D` を合成できるでしょうか？

現在のルールだけでは、この包括的な問題を解決することはできません。`B` と `C` にいくつかの「制約」を追加する必要があります。

`B = C` なら、通常の関数合成で解決できることは先に述べました：

```ts
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return (a) => g(f(a))
}
```

しかし、そうでない場合はどうでしょうか？

## 関手へと導く制約

制約を考えていきましょう。
ある型コンストラクタ `F` に対して `B = F<C>` であり、以下が成り立つとします。

- `f: (a: A) => F<B>` は作用プログラム
- `g: (b: B) => C` は純粋プログラム

`f` と `g` を通常の関数合成で合成するには、`g` を `(b: B) => C` から `(fb: F<B>) => F<C>` に変換する処理が必要です（これによって `f` の戻り値の型と新たに生み出した関数の引数の型が一致します）。

<img src="../../images/map.png" width="500" alt="map" />

問題の言い換えを行いました。では上で述べたような処理を行う関数（`map` と呼ぶことにします）を見つけることができるでしょうか？

実際の例を見てみましょう：

**例** (`F = ReadonlyArray`)

```ts
import { flow, pipe } from 'fp-ts/function'

// 関数 `B -> C` を、関数 `ReadonlyArray<B> -> ReadonlyArray<C>` に変換する
const map = <B, C>(g: (b: B) => C) => (
  fb: ReadonlyArray<B>
): ReadonlyArray<C> => fb.map(g)

// -------------------
// 使用例
// -------------------

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers
const getName = (user: User): string => user.name

// getFollowersNames: User -> ReadonlyArray<string>
const getFollowersNames = flow(getFollowers, map(getName))

// `flow` の代わりに `pipe` を使ってみると……
export const getFollowersNames2 = (user: User) =>
  pipe(user, getFollowers, map(getName))

const user: User = {
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [
    { id: 2, name: 'Terry R. Emerson', followers: [] },
    { id: 3, name: 'Marsha J. Joslyn', followers: [] }
  ]
}

console.log(getFollowersNames(user)) // => [ 'Terry R. Emerson', 'Marsha J. Joslyn' ]
```

**例** (`F = Option`)

```ts
import { flow } from 'fp-ts/function'
import { none, Option, match, some } from 'fp-ts/Option'

// 関数 `B -> C` を、関数 `Option<B> -> Option<C>` に変換する
const map = <B, C>(g: (b: B) => C): ((fb: Option<B>) => Option<C>) =>
  match(
    () => none,
    (b) => {
      const c = g(b)
      return some(c)
    }
  )

// -------------------
// 使用例
// -------------------

import * as RA from 'fp-ts/ReadonlyArray'

const head: (input: ReadonlyArray<number>) => Option<number> = RA.head
const double = (n: number): number => n * 2

// getDoubleHead: ReadonlyArray<number> -> Option<number>
const getDoubleHead = flow(head, map(double))

console.log(getDoubleHead([1, 2, 3])) // => some(2)
console.log(getDoubleHead([])) // => none
```

**例** (`F = IO`)

```ts
import { flow } from 'fp-ts/function'
import { IO } from 'fp-ts/IO'

// 関数 `B -> C` を、関数 `IO<B> -> IO<C>` に変換する
const map = <B, C>(g: (b: B) => C) => (fb: IO<B>): IO<C> => () => {
  const b = fb()
  return g(b)
}

// -------------------
// 使用例
// -------------------

interface User {
  readonly id: number
  readonly name: string
}

// ダミーのインメモリデータベース
const database: Record<number, User> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' }
}

const getUser = (id: number): IO<User> => () => database[id]
const getName = (user: User): string => user.name

// getUserName: number -> IO<string>
const getUserName = flow(getUser, map(getName))

console.log(getUserName(1)()) // => Ruth R. Gonzalez
```

**例** (`F = Task`)

```ts
import { flow } from 'fp-ts/function'
import { Task } from 'fp-ts/Task'

// 関数 `B -> C` を、関数 `Task<B> -> Task<C>` に変換する
const map = <B, C>(g: (b: B) => C) => (fb: Task<B>): Task<C> => () => {
  const promise = fb()
  return promise.then(g)
}

// -------------------
// 使用例
// -------------------

interface User {
  readonly id: number
  readonly name: string
}

// ダミーのリモートデータベース
const database: Record<number, User> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' }
}

const getUser = (id: number): Task<User> => () => Promise.resolve(database[id])
const getName = (user: User): string => user.name

// getUserName: number -> Task<string>
const getUserName = flow(getUser, map(getName))

getUserName(1)().then(console.log) // => Ruth R. Gonzalez
```

**例** (`F = Reader`)

```ts
import { flow } from 'fp-ts/function'
import { Reader } from 'fp-ts/Reader'

// 関数 `B -> C` を、関数 `Reader<R, B> -> Reader<R, C>` に変換する
const map = <B, C>(g: (b: B) => C) => <R>(fb: Reader<R, B>): Reader<R, C> => (
  r
) => {
  const b = fb(r)
  return g(b)
}

// -------------------
// 使用例
// -------------------

interface User {
  readonly id: number
  readonly name: string
}

interface Env {
  // ダミーのインメモリデータベース
  readonly database: Record<string, User>
}

const getUser = (id: number): Reader<Env, User> => (env) => env.database[id]
const getName = (user: User): string => user.name

// getUserName: number -> Reader<Env, string>
const getUserName = flow(getUser, map(getName))

console.log(
  getUserName(1)({
    database: {
      1: { id: 1, name: 'Ruth R. Gonzalez' },
      2: { id: 2, name: 'Terry R. Emerson' },
      3: { id: 3, name: 'Marsha J. Joslyn' }
    }
  })
) // => Ruth R. Gonzalez
```

一般化すると、型コンストラクタ `F` が `map` 関数を持っている場合、それを **関手インスタンス** と呼びます。

数学的な観点から見ると、関手は **圏間の写像** で、圏の構造を保持すると言えます。つまり、恒等射と合成演算を保持します。

圏は対象と射のペアであるため、関手も以下の2つのもののペアです：


- 圏 _C_ の任意の対象 `C` を、圏 _D_ 内の対象に対応付けする **対象の写像**
- 圏 _C_ の任意の射 `f` を、圏 _D_ 内の射 `map(f)` に対応付けする **射の写像**

ここで、_C_ と _D_ は2つの圏（つまり2つのプログラミング言語）です。

<img src="../../images/functor.png" width="500" alt="functor" />

2つの異なるプログラミング言語間の写像というのは確かに魅力的な概念ではありますが、今私たちが問題としているのは _C_ と _D_ が同一（圏 _TS_）の場合です。つまり、**自己関手 (endofunctor)** を問題としています（"endo" はギリシャ語で「内部」の意）。

以降、特段の指定がない限り、「関手」と書くと、圏 _TS_ における自己関手のことを指します。

さて、関手の実用的な側面を知りましたので、形式的な定義を見てみましょう。

## 定義

関手は `(F, map)` というペアで構成されます。ここで:

- `F` は、任意の型 `X` を型 `F<X>` に写像する `n` 項の型コンストラクタです（**対象の対応付け**）
- `map` は、以下のシグネチャを持つ関数です：

```ts
map: <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)
```

`map` は、任意の関数 `f: (a: A) => B` を、関数 `map(f): (fa: F<A>) => F<B>` に対応付けます（**射の対応付け**）

以下の条件を満たす必要があります：

- `map(1`<sub>X</sub>`)` = `1`<sub>F(X)</sub> (**恒等射は恒等射に写る**)
- `map(g ∘ f) = map(g) ∘ map(f)` (**合成の像はその像の合成である**)

2つ目の条件によって、以下の処理をリファクタリング・最適化することができます：

```ts
import { flow, increment, pipe } from 'fp-ts/function'
import { map } from 'fp-ts/ReadonlyArray'

const double = (n: number): number => n * 2

// 配列を2回反復処理
console.log(pipe([1, 2, 3], map(double), map(increment))) // => [ 3, 5, 7 ]

// 1回の反復処理
console.log(pipe([1, 2, 3], map(flow(double, increment)))) // => [ 3, 5, 7 ]
```

## 関手と関数型エラーハンドリング

関手は、関数型エラーハンドリングによい影響を与えます。実際の例を見てみましょう：

```ts
declare const doSomethingWithIndex: (index: number) => string

export const program = (ns: ReadonlyArray<number>): string => {
  // -1 は要素が見つからなかったことを示します
  const i = ns.findIndex((n) => n > 0)
  if (i !== -1) {
    return doSomethingWithIndex(i)
  }
  throw new Error('cannot find a positive number')
}
```

ネイティブ API の `findIndex` を使用すると、結果が `-1` でないことを確認するために `if` 節を使用する必要があります。これを忘れると、`-1` が誤って `doSomethingWithIndex` への入力として渡される可能性があります。

`Option` とその関手インスタンスなら、同じ処理をするのがいかに簡単か見てみましょう：

```ts
import { pipe } from 'fp-ts/function'
import { map, Option } from 'fp-ts/Option'
import { findIndex } from 'fp-ts/ReadonlyArray'

declare const doSomethingWithIndex: (index: number) => string

export const program = (ns: ReadonlyArray<number>): Option<string> =>
  pipe(
    ns,
    findIndex((n) => n > 0),
    map(doSomethingWithIndex)
  )
```

実際には、`Option` を使うと、`map` のおかげでエラーハンドリングが裏で行われ、常に「ハッピー・パス（正しい実行経路）」を辿っていることが保証されるのです。

**デモ** (optional)

[`04_functor.ts`](src/04_functor.ts)

Task<A> は常に成功する非同期呼び出しを表していますが、失敗する可能性のある計算をどのようにモデル化できますか？
**クイズ**. `Task<A>` は常に成功する非同期呼び出しを表しています。では、失敗する可能性のある処理はどのようにモデル化したらよいでしょうか？

## 関手の合成

関手は合成可能です。つまり、2つの関手 `F` と `G` が与えられた場合、合成 `F<G<A>>` もまた関手であり、この合成の `map` は `map` の合成です。

**例** (`F = Task`, `G = Option`)

```ts
import { flow } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'

type TaskOption<A> = T.Task<O.Option<A>>

export const map: <A, B>(
  f: (a: A) => B
) => (fa: TaskOption<A>) => TaskOption<B> = flow(O.map, T.map)

// -------------------
// 使用例
// -------------------

interface User {
  readonly id: number
  readonly name: string
}

// ダミーのリモートデータベース
const database: Record<number, User> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' }
}

const getUser = (id: number): TaskOption<User> => () =>
  Promise.resolve(O.fromNullable(database[id]))
const getName = (user: User): string => user.name

// getUserName: number -> TaskOption<string>
const getUserName = flow(getUser, map(getName))

getUserName(1)().then(console.log) // => some('Ruth R. Gonzalez')
getUserName(4)().then(console.log) // => none
```

## 反変関手

前のセクションでは、部分的に定義の厳密さを欠いていました。前のセクションの中で「関手」と呼んでいたものは、**共変関手** と呼ぶ方が適切です。

このセクションでは、、それとは別の変性を持つ関手である **反変関手** を見ていきます。

反変関手の定義は共変関手のそれとほとんど同じですが、その基本的な操作のシグネチャが異なり、`map` の代わりに `contramap` を使います。

<img src="../../images/contramap.png" width="300" alt="contramap" />

**例**

```ts
import { map } from 'fp-ts/Option'
import { contramap } from 'fp-ts/Eq'

type User = {
  readonly id: number
  readonly name: string
}

const getId = (_: User): number => _.id

// `map` 動作...
// const getIdOption: (fa: Option<User>) => Option<number>
const getIdOption = map(getId)

// `contramap` の動作...
// const getIdEq: (fa: Eq<number>) => Eq<User>
const getIdEq = contramap(getId)

import * as N from 'fp-ts/number'

const EqID = getIdEq(N.Eq)

/*

`Eq` は以前の章で見た通り:

const EqID: Eq<User> = pipe(
  N.Eq,
  contramap((_: User) => _.id)
)
*/
```

## `fp-ts` における関手

`fp-ts` において、関手インスタンスをどのように定義しましょうか。いくつか例を見ていきます。

以下のインターフェースは、HTTP API を呼び出して得られる結果のモデルを表しています。

```ts
interface Response<A> {
  url: string
  status: number
  headers: Record<string, string>
  body: A
}
```

`body` がパラメトリックであるため、`Response` は `Response` が `n >= 1` の `n` 項型コンストラクタであるという関手の必要条件を満たすため、関手インスタンスを見出すのに当たり、良い候補であると言えます。

`Response` を関手インスタンスとして定義するには、`fp-ts` が要求する [技術的な詳細](https://gcanti.github.io/fp-ts/#higher-kinded-types) に沿って、`map` 関数を定義する必要があります。

```ts
// `Response.ts` module

import { pipe } from 'fp-ts/function'
import { Functor1 } from 'fp-ts/Functor'

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Response: Response<A>
  }
}

export interface Response<A> {
  readonly url: string
  readonly status: number
  readonly headers: Record<string, string>
  readonly body: A
}

export const map = <A, B>(f: (a: A) => B) => (
  fa: Response<A>
): Response<B> => ({
  ...fa,
  body: f(fa.body)
})

// `Response<A>` を関手インスタンスにする
export const Functor: Functor1<'Response'> = {
  URI: 'Response',
  map: (fa, f) => pipe(fa, map(f))
}
```

## 関手は包括的に問題を解決できるのでしょうか？

まだできません。関手によって作用プログラム `f` と 純粋プログラム `g` の合成は可能になるものの、`g` は **単項** （つまり、引数が1つの）関数でなければなりません。`g` が2つ以上の引数を取る場合、どうなるのでしょうか？

| プログラム f | プログラム g               | 合成  |
| --------- | ----------------------- | ------------ |
| 純粋      | 純粋                    | `g ∘ f`      |
| 作用 | 純粋 (単項)            | `map(g) ∘ f` |
| 作用 | 純粋 (`n`項, `n > 1`) | ?            |

この状況をなんとかするには、「何か」が足りません。この「何か」とは、次の章で見る、関数型プログラミングにおけるもう1つの重要な抽象概念である **Applicative関手** です。
