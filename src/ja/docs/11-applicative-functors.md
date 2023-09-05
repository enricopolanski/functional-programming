# アプリカティブ関手

関手の章では、作用プログラム `f: (a: A) => F<B>` と純粋プログラム `g: (b: B) => C` を、（`F` が関手インスタンスの性質を備えているならば）`g` を `map(g): (fb: F<B>) => F<C>` と変換することで、合成することができることを見てきました。

| プログラム f | プログラム g    | 合成  |
| --------- | ------------ | ------------ |
| 純粋      | 純粋         | `g ∘ f`      |
| 作用 | 純粋 (単項) | `map(g) ∘ f` |

しかし、`g` は単項関数である必要があり、単一の引数を受け入れることしかできません。`g` が2つの引数を受け入れる場合でも、関手インスタンスのみで `g` を変換することは可能でしょうか？

## カリー化

まず最初に、型 `B` と型 `C` の2つの引数（タプルを使っても構いません）を受け取り、型 `D` の値を返す関数をモデル化する必要があります：

```ts
g: (b: B, c: C) => D
```

`g` を **カリー化** と呼ばれる技術で書き直すことができます。

> カリー化 (currying, カリー化された=curried) とは、複数の引数をとる関数を、引数が「もとの関数の最初の引数」で戻り値が「もとの関数の残りの引数を取り結果を返す関数」であるような関数にすること（あるいはその関数のこと）である。

(引用元: [カリー化 (Wikipedia)](https://ja.wikipedia.org/wiki/%E3%82%AB%E3%83%AA%E3%83%BC%E5%8C%96))

カリー化を用いて `g` を以下のように書き直すことができます：

```ts
g: (b: B) => (c: C) => D
```

**例**

```ts
interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User, user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})
```

`addFollower` をカリー化でリファクタしてみましょう。

```ts
interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User) => (user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

// -------------------
// 使用例
// -------------------

const user: User = { id: 1, name: 'Ruth R. Gonzalez', followers: [] }
const follower: User = { id: 3, name: 'Marsha J. Joslyn', followers: [] }

console.log(addFollower(follower)(user))
/*
{
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [ { id: 3, name: 'Marsha J. Joslyn', followers: [] } ]
}
*/
```

## 関数 `ap`

以下の状況を考えてみます：

- `follower` は持っておらず、彼の `id` のみを持っている
- `user` は持っておらず、彼の `id` のみを持っている
- `fetchUser` という API が存在し、与えられた `id` に対応する `User` を返すエンドポイントを叩く

```ts
import * as T from 'fp-ts/Task'

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User) => (user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

declare const fetchUser: (id: number) => T.Task<User>

const userId = 1
const followerId = 3

const result = addFollower(fetchUser(followerId))(fetchUser(userId)) // コンパイルが通らない
```

`addFollower` はもう使えません！ どうすればよいでしょう？

下のようなシグネチャを持つ関数があれば、：

```ts
declare const addFollowerAsync: (
  follower: T.Task<User>
) => (user: T.Task<User>) => T.Task<User>
```

簡単に処理できます：

```ts
import * as T from 'fp-ts/Task'

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

declare const fetchUser: (id: number) => T.Task<User>

declare const addFollowerAsync: (
  follower: T.Task<User>
) => (user: T.Task<User>) => T.Task<User>

const userId = 1
const followerId = 3

// const result: T.Task<User>
const result = addFollowerAsync(fetchUser(followerId))(fetchUser(userId)) // 今度はコンパイルが通る
```

`addFollowerAsync` を実装するのは簡単ですが、手で実装するのではなく、`addFollower: (follower: User) => (user: User): User` という関数を `addFollowerAsync: (follower: Task<User>) => (user: Task<User>) => Task<User>` のような関数に変換することはできないでしょうか？

これを一般化したのが、 `liftA2` と呼ばれる変換で、`g: (b: B) => (c: C) => D` から次のようなシグネチャの関数を生成します：

```ts
liftA2(g): (fb: F<B>) => (fc: F<C>) => F<D>
```

<img src="../../images/liftA2.png" width="500" alt="liftA2" />

どのように実現したらよいでしょう？ `g` は既に単項関数に変換したので、関手インスタンスと `map` を活用できます：

```ts
map(g): (fb: F<B>) => F<(c: C) => D>
```

<img src="../../images/liftA2-first-step.png" width="500" alt="liftA2 (first step)" />

行き詰ってしまいました。`F<(c: C) => D>` を `(fc: F<C>) => F<D>` に「展開」するような操作は、関手インスタンスに存在しません。

ここで、この「展開」操作を実現する処理 `ap` を導入しなければなりません。

```ts
declare const ap: <A>(fa: Task<A>) => <B>(fab: Task<(a: A) => B>) => Task<B>
```

**注意**. なぜ "ap" という名前なのでしょうか？ この処理自体が、一種の関数の適用 (application) のようなものとして考えることができるからです。

```ts
// `apply` は関数を値に適用します
declare const apply: <A>(a: A) => <B>(f: (a: A) => B) => B

declare const ap: <A>(a: Task<A>) => <B>(f: Task<(a: A) => B>) => Task<B>
// `ap` は effect に包まれた関数を、 effect に包まれた値に適用します
```

`ap` を手に入れたので、`liftA2` を定義できるようになりました：

```ts
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'

const liftA2 = <B, C, D>(g: (b: B) => (c: C) => D) => (fb: T.Task<B>) => (
  fc: T.Task<C>
): T.Task<D> => pipe(fb, T.map(g), T.ap(fc))

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User) => (user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

// const addFollowerAsync: (fb: T.Task<User>) => (fc: T.Task<User>) => T.Task<User>
const addFollowerAsync = liftA2(addFollower)
```

そしてついに、`fetchUser` を前の結果と合成することができます：

```ts
import { flow, pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'

const liftA2 = <B, C, D>(g: (b: B) => (c: C) => D) => (fb: T.Task<B>) => (
  fc: T.Task<C>
): T.Task<D> => pipe(fb, T.map(g), T.ap(fc))

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User) => (user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

declare const fetchUser: (id: number) => T.Task<User>

// const program: (id: number) => (fc: T.Task<User>) => T.Task<User>
const program = flow(fetchUser, liftA2(addFollower))

const userId = 1
const followerId = 3

// const result: T.Task<User>
const result = program(followerId)(fetchUser(userId))
```

これで、2つの関数 `f: (a: A) => F<B>` と `g: (b: B, c: C) => D` を合成する処理を標準化できました：

1. `g` をカリー化して `g: (b: B) => (c: C) => D` にする
2. 作用 `F` において、関数 `ap` を定義する (ライブラリ関数)
3. 作用 `F` において、ユーティリティ関数 `liftA2` を定義する (ライブラリ関数)
4. `flow(f, liftA2(g))` で合成できる

既に見てきた型コンストラクタにおいて、`ap` がどのように実装されるか見てみましょう：

**例** (`F = ReadonlyArray`)

```ts
import { increment, pipe } from 'fp-ts/function'

const ap = <A>(fa: ReadonlyArray<A>) => <B>(
  fab: ReadonlyArray<(a: A) => B>
): ReadonlyArray<B> => {
  const out: Array<B> = []
  for (const f of fab) {
    for (const a of fa) {
      out.push(f(a))
    }
  }
  return out
}

const double = (n: number): number => n * 2

pipe([double, increment], ap([1, 2, 3]), console.log) // => [ 2, 4, 6, 2, 3, 4 ]
```

**例** (`F = Option`)

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

const ap = <A>(fa: O.Option<A>) => <B>(
  fab: O.Option<(a: A) => B>
): O.Option<B> =>
  pipe(
    fab,
    O.match(
      () => O.none,
      (f) =>
        pipe(
          fa,
          O.match(
            () => O.none,
            (a) => O.some(f(a))
          )
        )
    )
  )

const double = (n: number): number => n * 2

pipe(O.some(double), ap(O.some(1)), console.log) // => some(2)
pipe(O.some(double), ap(O.none), console.log) // => none
pipe(O.none, ap(O.some(1)), console.log) // => none
pipe(O.none, ap(O.none), console.log) // => none
```

**例** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO'

const ap = <A>(fa: IO<A>) => <B>(fab: IO<(a: A) => B>): IO<B> => () => {
  const f = fab()
  const a = fa()
  return f(a)
}
```

**例** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task'

const ap = <A>(fa: Task<A>) => <B>(fab: Task<(a: A) => B>): Task<B> => () =>
  Promise.all([fab(), fa()]).then(([f, a]) => f(a))
```

**例** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader'

const ap = <R, A>(fa: Reader<R, A>) => <B>(
  fab: Reader<R, (a: A) => B>
): Reader<R, B> => (r) => {
  const f = fab(r)
  const a = fa(r)
  return f(a)
}
```

`ap` を使用して2つの引数を持つ関数を処理する方法を見てきましたが、**3つの** 引数を持つ関数の場合どうなるでしょう？ またさらに別の概念が必要になるのでしょうか？

嬉しいことに、答えは No です。`map` と `ap` で十分なのです：

```ts
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'

const liftA3 = <B, C, D, E>(f: (b: B) => (c: C) => (d: D) => E) => (
  fb: T.Task<B>
) => (fc: T.Task<C>) => (fd: T.Task<D>): T.Task<E> =>
  pipe(fb, T.map(f), T.ap(fc), T.ap(fd))

const liftA4 = <B, C, D, E, F>(
  f: (b: B) => (c: C) => (d: D) => (e: E) => F
) => (fb: T.Task<B>) => (fc: T.Task<C>) => (fd: T.Task<D>) => (
  fe: T.Task<E>
): T.Task<F> => pipe(fb, T.map(f), T.ap(fc), T.ap(fd), T.ap(fe))

// etc...
```

「合成表」を更新しておきましょう：

| プログラム f | プログラム g     | 合成     |
| --------- | ------------- | --------------- |
| 純粋      | 純粋          | `g ∘ f`         |
| 作用 | 純粋 (単項)  | `map(g) ∘ f`    |
| 作用 | 純粋, `n` 項 | `liftAn(g) ∘ f` |

## 関数 `of`

2つの関数 `f: (a: A) => F<B>` と `g: (b: B, c: C) => D` が与えられたとき、その合成 `h` を得ることが可能であることがわかりました:

```ts
h: (a: A) => (fc: F<C>) => F<D>
```

`h` を実行するには、新たな型 `A` と型 `F<C>` が必要です。

しかし、第2引数に渡すべき型 `F<C>` の値を持っておらず、型 `C` の値しかない場合、どうしたらよいのでしょうか？

`h` を使用するのに、型 `C` の値を型 `F<C>` の値に変換する処理があれば便利です。

これを実現する、`of` と呼ばれる演算を見てみましょう (**pure** や **return** とも呼ばれます):

```ts
declare const of: <C>(c: C) => F<C>
```

**アプリカティブ関手** という用語は、`ap` と `of` の「両方」を備えた型コンストラクタを指します。

ここまでに出てきた型コンストラクタで `of` がどのように定義されるか見てみましょう：

**例** (`F = ReadonlyArray`)

```ts
const of = <A>(a: A): ReadonlyArray<A> => [a]
```

**例** (`F = Option`)

```ts
import * as O from 'fp-ts/Option'

const of = <A>(a: A): O.Option<A> => O.some(a)
```

**例** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO'

const of = <A>(a: A): IO<A> => () => a
```

**例** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task'

const of = <A>(a: A): Task<A> => () => Promise.resolve(a)
```

**例** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader'

const of = <R, A>(a: A): Reader<R, A> => () => a
```

**デモ**

[`05_applicative.ts`](src/05_applicative.ts)

## アプリカティブ関手の合成

アプリカティブ関手は合成可能であり、2つのアプリカティブ関手 `F` と `G` が存在するとき、それらの合成 `F<G<A>>` もまたアプリカティブ関手です。

**例** (`F = Task`, `G = Option`)

合成後の `of` は、合成前の `of` の合成です：

```ts
import { flow } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'

type TaskOption<A> = T.Task<O.Option<A>>

const of: <A>(a: A) => TaskOption<A> = flow(O.of, T.of)
```

合成後の `ap` は、以下のようなやり方で得られます：

```ts
const ap = <A>(
  fa: TaskOption<A>
): (<B>(fab: TaskOption<(a: A) => B>) => TaskOption<B>) =>
  flow(
    T.map((gab) => (ga: O.Option<A>) => O.ap(ga)(gab)),
    T.ap(fa)
  )
```

## アプリカティブ関手は問題を包括的に解くことができるのでしょうか？

まだです。考慮しなければならない非常に重要なケースがもう一つだけあります。それは、**両方** が作用プログラムである場合です。

次の章では、関数型プログラミングにおけるもっとも重要な抽象概念の1つである **モナド** について話します。
