# 純粋関数と部分関数

最初の章では、純粋関数を厳密ではない形で定義していました：

> (純粋な) 関数は、同じ入力が与えられると常に同じ出力を返し、目に見える副作用がないプロシージャです。

このような形式的でない記述は、次のような疑念を残す可能性があります：

- 「副作用」とは何か？
- 「目に見える」とは何か？
- 「同じ」とは何か？

関数の概念の形式的定義を見てみましょう。

**注**. `X` と `Y` を集合とすると、`X × Y` という表記は、それらの **直積** を示し、つまり、以下の集合を意味します。

```
X × Y = { (x, y) | x ∈ X, y ∈ Y }
```

1世紀前に以下のような [定義](https://en.wikipedia.org/wiki/History_of_the_function_concept) がされています：

**定義**. 関数 `f: X ⟶ Y` は `X × Y` の部分集合であり、すべての `x ∈ X` に対してちょうど1つの `(x, y) ∈ f` なる `y ∈ Y` が存在する。

`X` は `f` の **始域** と呼ばれ、`Y` は `f` の **終域** と呼ばれます。

**例**

関数 `double: Nat ⟶ Nat` は、`Nat × Nat` という直積の部分集合で、`{ (1, 2), (2, 4), (3, 6), ...}` で表されます。

TypeScript では、`f` を次のように定義できます。

```ts
const f: Record<number, number> = {
  1: 2,
  2: 4,
  3: 6
  ...
}
```

<!--
TODO:
Please note that the set `f` has to be described _statically_ when defining the function (meaning that the elements of that set cannot change with time for no reason).
In this way we can exclude any form of side effect and the return value is always the same.
-->

例に挙げたのは、所謂関数の **外延的** 定義であり、始域の元を1つずつ列挙し、それぞれの元に対応する終域の元を指定するものです。

当然、このような集合が無限である場合、問題が発生します。すべての関数の始域と終域を列挙することはできません。

この問題を解決するのに、**内包的** 定義と呼ばれるものが使えます。`(x, y) ∈ f` という組すべてについて成立する条件を表現します。つまり、`y = x * 2` という条件です。

これが、`double` 関数を実際に書くときのおなじみの定義です。TypeScript で定義する際は以下のようになります：

```ts
const double = (x: number): number => x * 2
```

直積の部分集合としての関数の定義は、数学においてはどんな関数も純粋であることを示しており、アクション、状態の変更、元の変更といったものはありません。
関数型プログラミングでは、関数の実装はできる限りこの理想的なモデルに従う必要があります。

**クイズ**. 以下のプロシージャの内、純粋関数はどれでしょうか？

```ts
const coefficient1 = 2
export const f1 = (n: number) => n * coefficient1

// ------------------------------------------------------

let coefficient2 = 2
export const f2 = (n: number) => n * coefficient2++

// ------------------------------------------------------

let coefficient3 = 2
export const f3 = (n: number) => n * coefficient3

// ------------------------------------------------------

export const f4 = (n: number) => {
  const out = n * 2
  console.log(out)
  return out
}

// ------------------------------------------------------

interface User {
  readonly id: number
  readonly name: string
}

export declare const f5: (id: number) => Promise<User>

// ------------------------------------------------------

import * as fs from 'fs'

export const f6 = (path: string): string =>
  fs.readFileSync(path, { encoding: 'utf8' })

// ------------------------------------------------------

export const f7 = (
  path: string,
  callback: (err: Error | null, data: string) => void
): void => fs.readFile(path, { encoding: 'utf8' }, callback)
```

関数が純粋であるという事実は、そのスコープから漏れ出さない限り、局所的なミューテーションを自動的に禁止するわけではありません。

![ミュータブル / イミュータブル](../../images/mutable-immutable.jpg)

**例** (モノイドにおける `concatAll` 関数の実装)

```ts
import { Monoid } from 'fp-ts/Monoid'

const concatAll = <A>(M: Monoid<A>) => (as: ReadonlyArray<A>): A => {
  let out: A = M.empty // <= 局所的なミューテーション
  for (const a of as) {
    out = M.concat(out, a)
  }
  return out
}
```

究極的な目標は、**参照透過性** を保証することです。

API とそのユーザが結ぶ契約は、API のシグネチャによって定義されます：

```ts
declare const concatAll: <A>(M: Monoid<A>) => (as: ReadonlyArray<A>) => A
```

また、参照透明性を重んじるという約束によっても、契約が定義されます。関数の実装方法の技術的な詳細は関係ありません。そのため、実装の自由度が最大限に確保されます。

では、「副作用」はどのように定義するのでしょう？参照透明性を否定することで簡単に定義します。

> ある式に参照透明性がない場合、その式は「副作用」を持つ。

関数は、関数型プログラミングの2つの要素のうちの1つ、参照透明性の完璧な例であるだけでなく、2つ目の要素である **合成** の例でもあります。

関数合成：

**定義**. 関数 `f: Y ⟶ Z` と `g: X ⟶ Y` が与えられた場合、関数 `h: X ⟶ Z` は以下のように定義されます：

```
h(x) = f(g(x))
```

これは `f` と `g` の **合成** と呼ばれ、`h = f ∘ g` と表されます。

`f` と `g` を合成するためには、`f` の始域が `g` の終域に含まれている必要があります。

**定義**. 関数が、その始域のすべての値に対して定義されていない場合、その関数は **部分的である** と言われます。

逆に、その始域のすべての値に対して定義されている場合、その関数は **全域的である** と言われます。

**例**

```
f(x) = 1 / x
```

この関数 `f: number ⟶ number` は `x = 0` の場合に未定義です。

**例**

```ts
// `ReadonlyArray` の最初の要素を取得する
declare const head: <A>(as: ReadonlyArray<A>) => A
```

**クイズ**. なぜ `head` は部分関数と言えるでしょうか？

**クイズ**. `JSON.parse` は全域関数でしょうか？

```ts
parse: (text: string, reviver?: (this: any, key: string, value: any) => any) =>
  any
```

**クイズ**. `JSON.stringify` は全域関数でしょうか？

```ts
stringify: (
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number
) => string
```

関数型プログラミングでは、通常、純粋で全域的な関数のみを定義する傾向があります。今後、「関数」という語を使用する際は、特に「純粋で完全な関数」を指すこととします。では、アプリケーションで部分関数が必要な場合、どのように対処すべきでしょうか？

部分関数 `f: X ⟶ Y` は、常に終域に特別な値（ここでは `None` と呼びましょう）を追加し、関数が定義されていない `X` の各値に対して `f` の出力に `None` を割り当てることによって、常に全域関数に「還元」できます。

```
f': X ⟶ Y ∪ None
```

`Option(Y) = Y ∪ None` と置きます。

```
f': X ⟶ Option(Y)
```


関数型プログラミングでは、純粋で全域的な関数のみを定義する傾向があります。

`TypeScript` で `Option` を定義することは可能なのでしょうか？次の章ではその方法を見ていきます。
