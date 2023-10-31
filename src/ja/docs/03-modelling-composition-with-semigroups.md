<!-- markdownlint-disable-file MD033 -->
# 半群で合成をモデリングする（Modelling composition with Semigroups）

半群（またはセミグループ）は、２つ以上の値を組み合わせる方法です。

半群は代数的構造であり、一般に次の特定の組み合わせとして定義されています。

- 一つ以上の集合（set）
- これらの集合上に対する1つ以上の演算
- 演算は０個以上の法則を満たしている

代数は、数学者が余分なものをすべて取り除き、概念を最も純粋な形で捉えようとする方法です。

> 代数を操作する場合、代数自体によって定義され、その法則に従って行われる演算のみが許可されます。

プログラミングにおける代数に相当するのはインターフェイスです。

> インターフェイスを操作する場合、インターフェイス自体によって定義され、インターフェイスの法則に従って定義された演算のみが許可されます。

半群に入る前に、まずは簡単な代数的構造の例、 **亜群（またはマグマ、magma）** を見てみましょう。

## 亜群の定義

亜群はTypeScriptの`interface`でモデリングできます。

```ts
interface Magma<A> {
  readonly concat: (first: A, second: A) => A;
}
```

上記のコードは、次の性質を持つ代数的構造を記述しています。

- 集合`A`
- 集合`A`の上の二項演算`concat`。この演算は集合`A`において **閉じている（closed）** と言います。つまり、`A`の任意の元`a`、`b`に対して、この演算の結果は再び`A`に属する。言い換えれば、`concat`は`A`の`コンビネータ`です.

`A`が`number`の場合の`Magma<A>`の具体的なインスタンスを実現してみましょう。

```ts
import { Magma } from 'fp-ts/Magma';

const MagmaSub: Magma<number> = {
  concat: (first, second) => first - second,
};

// helper
const getPipeableConcat =
  <A,>(M: Magma<A>) =>
  (second: A) =>
  (first: A): A =>
    M.concat(first, second);

const concat = getPipeableConcat(MagmaSub);

// usage example

import { pipe } from 'fp-ts/function';

pipe(10, concat(2), concat(3), concat(1), concat(2), console.log);
// => 2
```

**クイズ**：`concat`が閉じているという事実は自明な性質ではありません。`A`がJavaScriptの数値型（正と負の浮動小数点数の集合）ではなく、自然数の集合である場合、`MagmaSub`の`concat`で`Magma<Natural>`を定義できますか？自然数において閉じていない他の`concat`演算はありますか？

> [答え](../quiz-answers/magma-concat-closed.md)

**定義**：集合`A`と`A`において閉じている二項演算`*`の対`(A, *)`を **亜群(またはマグマ、magma)** と呼ばれている。

亜群はその上の二項演算が閉じていることを要求するが、それ以外の公理は課しません。
次は、法則を満たさないといけない別の代数的構造である半群を見てみましょう。

## 半群の定義

> **半群** は`concat`が**結合的**な亜群です。

「結合的」または「結合法則」は、`A`の任意の元`x`，`y`，`z`に対して、以下の式が成立することを意味します。

```ts
(x * y) * z = x * (y * z)

// または
concat(concat(a, b), c) = concat(a, concat(b, c))
```

簡単にいうと、結合法則を満たすことは、式の中の括弧を気にする必要がないことを意味しています。単純に`x * y * z`で書けます（曖昧さなし）。

**例**：

文字列の連結は結合法則を満たしています。

```ts
("a" + "b") + "c" = "a" + ("b" + "c") = "abc"
```

すべての半群は亜群ですが、すべての亜群が半群であるわけではありません。

<img src="../../images/semigroup.png" width="300" alt="Magma vs Semigroup" />

**例**：

前節の`MagmaSub`は、`concat`が結合法則を満たしていないため、半群ではありません。

```ts
import { pipe } from 'fp-ts/function';
import { Magma } from 'fp-ts/Magma';

const MagmaSub: Magma<number> = {
  concat: (first, second) => first - second,
};

pipe(MagmaSub.concat(MagmaSub.concat(1, 2), 3), console.log); // => -4
pipe(MagmaSub.concat(1, MagmaSub.concat(2, 3)), console.log); // => 2
```

半群は並列処理の本質を捉えています。

結合法則を満たす演算`*`が存在するのであれば、1つ演算を2つのサブ演算に分割し、それぞれをさらにサブ演算に分割できます。

```ts
a * b * c * d * e * f * g * h = ((a * b) * (c * d)) * ((e * f) * (g * h))
```

サブ演算は並列で実行できます。

`Magma`と同様に、`Semigroup`もTypeScriptの`interface`で定義できます。

```ts
// fp-ts/lib/Semigroup.ts

interface Semigroup<A> extends Magma<A> {}
```

以下の条件を満たさないといけません：

- **結合の法則**: `A`の各元`x`，`y`，`z`に対して、以下の式が成り立つ。

```ts
S.concat(S.concat(x, y), z) = S.concat(x, S.concat(y, z));
```

**注**：残念ながら、この法則はTypeScriptの型システムでは実現できません。

`ReadonlyArray<string>`の一つの半群インスタンスを実装してみましょう。

```ts
import * as Se from 'fp-ts/Semigroup';

const Semigroup: Se.Semigroup<ReadonlyArray<string>> = {
  concat: (first, second) => first.concat(second),
};
```

`concat`という名前は配列にとって意味がありますが（後で説明します）、コンテキストと型`A`に応じて、`concat`は異なる解釈と意味を持つ可能性があります。

- 連結(concatenation)
- 組み合わせ(combination)
- マージ(merging)
- 融合(fusion)
- 選択(selection)
- 和(sum)
- 入れ換え(substitution)

他にもたくさんあります。

**例**：

以下は半群`(number, +)`の実装です。ここで`+`は通常の加算です。

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** `number`と加算の半群 */
const SemigroupSum: Semigroup<number> = {
  concat: (first, second) => first + second,
};
```

**クイズ**：[`01_retry.ts`](../01_retry.ts)で定義されたコンビネータの`concat`を使って、`RetryPolicy`の半群を定義できますか？

> [答え](../quiz-answers/semigroup-demo-concat.md)

以下は半群`(number, *)`の実装です。ここで`*`は通常の乗算です。

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** `number`と乗算の半群 */
const SemigroupProduct: Semigroup<number> = {
  concat: (first, second) => first * second,
};
```

**注**： ここでよくある間違いは、半群を型のみと結びつく（例えば、数値型の半群という考え方）ことです。同じ型`A`に対して、`Semigroup<A>`のインスタンスを複数定義することが可能です。数値型について、加算と乗算で半群を定義する方法を見てきました。同じ操作を共有するが型が異なる半群も存在します。 `SemigroupSum`は、数値型のような符号なし浮動小数点数の代わりに、自然数で実現することもできます。

`string`型の例：

```ts
import { Semigroup } from 'fp-ts/Semigroup';

const SemigroupString: Semigroup<string> = {
  concat: (first, second) => first + second,
};
```

`boolean`型の例：

```ts
import { Semigroup } from 'fp-ts/Semigroup';

const SemigroupAll: Semigroup<boolean> = {
  concat: (first, second) => first && second,
};

const SemigroupAny: Semigroup<boolean> = {
  concat: (first, second) => first || second,
};
```

## `concatAll`関数

定義によると、`concat`は毎回`A`の2つの要素だけを結合しています。複数の要素を結合することは可能でしょうか?

`concatAll`関数は、半群のインスタンス、初期値、および結合する要素の配列を入力として受け取る必要があります。

```ts
import * as S from 'fp-ts/Semigroup';
import * as N from 'fp-ts/number';

const sum = S.concatAll(N.SemigroupSum)(2);

console.log(sum([1, 2, 3, 4])); // => 12

const product = S.concatAll(N.SemigroupProduct)(3);

console.log(product([1, 2, 3, 4])); // => 72
```

**クイズ**：なぜ初期値が必要ですか？

> [答え](../quiz-answers/semigroup-concatAll-initial-value.md)

**例**：

JavaScriptの標準ライブラリのいくつかの関数を再実装することで、`concatAll`の応用を見てみましょう。

```ts
import * as B from 'fp-ts/boolean';
import { concatAll } from 'fp-ts/Semigroup';
import * as S from 'fp-ts/struct';

const every =
  <A,>(predicate: (a: A) => boolean) =>
  (as: ReadonlyArray<A>): boolean =>
    concatAll(B.SemigroupAll)(true)(as.map(predicate));

const some =
  <A,>(predicate: (a: A) => boolean) =>
  (as: ReadonlyArray<A>): boolean =>
    concatAll(B.SemigroupAny)(false)(as.map(predicate));

const assign: (as: ReadonlyArray<object>) => object = concatAll(
  S.getAssignSemigroup<object>(),
)({});
```

**クイズ**：次の半群のインスタンスは半群の定義を満たしていますか？

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** いつでも最初の引数を返します */
const first = <A,>(): Semigroup<A> => ({
  concat: (first, _second) => first,
});
```

> [答え](../quiz-answers/semigroup-first.md)

**クイズ**：次の半群のインスタンスは半群の定義を満たしていますか？

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** いつでも2つ目の引数を返します */
const last = <A,>(): Semigroup<A> => ({
  concat: (_first, second) => second,
});
```

> [答え](../quiz-answers/semigroup-second.md)

## デュアル半群(dual semigroup)

一つの半群のインスタンスに対して、オペランドの順番を入れ替えるだけで、新しい半群のインスタンスを取得できます。

```ts
import { pipe } from 'fp-ts/function';
import { Semigroup } from 'fp-ts/Semigroup';
import * as S from 'fp-ts/string';

// 半群のコンビネータです
const reverse = <A,>(s: Semigroup<A>): Semigroup<A> => ({
  concat: (first, second) => s.concat(second, first),
});

pipe(S.Semigroup.concat('a', 'b'), console.log); // => 'ab'
pipe(reverse(S.Semigroup).concat('a', 'b'), console.log); // => 'ba'
```

**クイズ**：普通に`concat`は[**交换法則**](https://en.wikipedia.org/wiki/Commutative_property)を満たさないため、このコンビネータは意味をなしています。交換法則に満たす`concat`の例とそうでない例を見つけられますか？

> [答え](../quiz-answers/semigroup-commutative.md)

## 半群の積(Semigroup product)

より複雑な型の半群インスタンスを定義してみましょう。

```ts
import * as N from 'fp-ts/number';
import { Semigroup } from 'fp-ts/Semigroup';

// 原点から始まるベクトルをモデリングする
type Vector = {
  readonly x: number;
  readonly y: number;
};

// 二つのベクトルの和をモデリングする
const SemigroupVector: Semigroup<Vector> = {
  concat: (first, second) => ({
    x: N.SemigroupSum.concat(first.x, second.x),
    y: N.SemigroupSum.concat(first.y, second.y),
  }),
};
```

**例**：

```ts
const v1: Vector = { x: 1, y: 1 };
const v2: Vector = { x: 1, y: 2 };

console.log(SemigroupVector.concat(v1, v2)); // => { x: 2, y: 3 }
```

<img src="../../images/semigroupVector.png" width="300" alt="SemigroupVector" />

テンプレートコードが多すぎます？一ついいお知らせがあります。半群の裏にある**数学理論**によれば，フィールドごとの半群インスタンスを実現できれば、`Vector`のような複雑の構造の半群インスタンスも実現できます。

`fp-ts/Semigroup`モジュールは便利なコンビネータ`struct`をエクスポートしています。

```ts
import { struct } from 'fp-ts/Semigroup';

// 二つのベクトルの和をモデリングする
const SemigroupVector: Semigroup<Vector> = struct({
  x: N.SemigroupSum,
  y: N.SemigroupSum,
});
```

**注**：`struct`と似たようなタプルを扱うコンビネータもあります：`tuple`

```ts
import * as N from 'fp-ts/number';
import { Semigroup, tuple } from 'fp-ts/Semigroup';

// 原点から始まるベクトルをモデリングする
type Vector = readonly [number, number];

// 二つのベクトルの和をモデリングする
const SemigroupVector: Semigroup<Vector> = tuple(
  N.SemigroupSum,
  N.SemigroupSum,
);

const v1: Vector = [1, 1];
const v2: Vector = [1, 2];

console.log(SemigroupVector.concat(v1, v2)); // => [2, 3]
```

**クイズ**：任意の`Semigroup<A>`に対して、`A`から任意の要素`middle`を選択し，`concat`の二つの引数の間に挿入する場合、結果はまた半群ですか？

```ts
import { pipe } from 'fp-ts/function';
import { Semigroup } from 'fp-ts/Semigroup';
import * as S from 'fp-ts/string';

export const intercalate =
  <A,>(middle: A) =>
  (S: Semigroup<A>): Semigroup<A> => ({
    concat: (first, second) => S.concat(S.concat(first, middle), second),
  });

const SemigroupIntercalate = pipe(S.Semigroup, intercalate('|'));

pipe(
  SemigroupIntercalate.concat('a', SemigroupIntercalate.concat('b', 'c')),
  console.log,
); // => 'a|b|c'
```

## 任意の型の半群インスタンスを見つける

結合法則は非常に強い制限です。特定な型`A`に対して、結合法則に満たす計算が見つからない場合はどうなるのでしょうか。

`User`が次のように定義されているとします。

```ts
type User = {
  readonly id: number;
  readonly name: string;
};
```

データベースでは、同じユーザーの複数の記録が存在します(たとえば、変更履歴)。

```ts
// 内部API
declare const getCurrent: (id: number) => User;
declare const getHistory: (id: number) => ReadonlyArray<User>;
```

そしてパブリックAPIを実装する必要があります。

```ts
export declare const getUser: (id: number) => User;
```

このAPIは、すべての記録において、与えられた条件に満たす内容を検索します。例えば、最新の記録、最も古い記録、現在の記録などを検索する条件があります。

もちろん、条件ごとに特定のAPIを定義できます。

```ts
export declare const getMostRecentUser: (id: number) => User;
export declare const getLeastRecentUser: (id: number) => User;
export declare const getCurrentUser: (id: number) => User;
// etc...
```

`User`型の値を返すには、すべての記録を考慮してマージ(または選択)する必要があります。これは、`Semigroup<User>`を使用してモデリングできることを意味しています。

そうは言っても、現時点では、「二つの`user`をマージする」は何を意味しているのか、またこのマージ操作は結合法則に満たしているか、の問題があります。

`A`自体ではなく、`A`の **自由半群(free semigroup)** と呼ばれる`NonEmptyArray<A>`に対して半群インスタンスを定義することで、任意の型`A`に対して半群インスタンスを定義できます。

```ts
import { Semigroup } from 'fp-ts/Semigroup';

// 空ではない配列を表し、少なくとも1つの要素Aを持つ配列を意味します。
type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & {
  readonly 0: A;
};

// 2つの`NonEmptyArray`を連結しても、`NonEmptyArray`のままです
const getSemigroup = <A,>(): Semigroup<ReadonlyNonEmptyArray<A>> => ({
  concat: (first, second) => [first[0], ...first.slice(1), ...second],
});
```

次に、`A`の要素を`ReadonlyNonEmptyArray<A>`「シングルトン」、つまり要素が1つだけある配列にマップできます。

```ts
// ReadonlyNonEmptyArrayに一つの要素を挿入します
const of = <A,>(a: A): ReadonlyNonEmptyArray<A> => [a];
```

このテクニックを`User`型に使ってみましょう。

```ts
import {
  getSemigroup,
  of,
  ReadonlyNonEmptyArray,
} from 'fp-ts/ReadonlyNonEmptyArray';
import { Semigroup } from 'fp-ts/Semigroup';

type User = {
  readonly id: number;
  readonly name: string;
};

// この半群は`User`に対するものではなく、`ReadonlyNonEmptyArray<User>`に対するものです
const S: Semigroup<ReadonlyNonEmptyArray<User>> = getSemigroup<User>();

declare const user1: User;
declare const user2: User;
declare const user3: User;

// const merge: ReadonlyNonEmptyArray<User>
const merge = S.concat(S.concat(of(user1), of(user2)), of(user3));

// 手動ですべての要素を配列に入れても同じ結果が得られます
const merge2: ReadonlyNonEmptyArray<User> = [user1, user2, user3];
```

`A`の自由半群は半群であり、すべての要素は`A`の可能な、空ではない、有限列です。

`A`の自由半群は、データの中身を保持しながら、`A`の要素を連結する遅延的な方法とみなすことができます。

`[user1, user2, user3]`を含むマージ値は、連結する要素とその順序を示しています。

`getUser` APIを設計するには、次の3つの案が考えられます。

1. `Semigroup<User>`が定義できるかつすぐにマージしたい。

   ```ts
   declare const SemigroupUser: Semigroup<User>;

   export const getUser = (id: number): User => {
     const current = getCurrent(id);
     const history = getHistory(id);
     return concatAll(SemigroupUser)(current)(history);
   };
   ```

2. `Semigroup<User>`が定義できない，あるいはマージの実現を使用者に任せたい。

   ```ts
   export const getUser =
     (SemigroupUser: Semigroup<User>) =>
     (id: number): User => {
       const current = getCurrent(id);
       const history = getHistory(id);
       // すぐにマージする
       return concatAll(SemigroupUser)(current)(history);
     };
   ```

3. `Semigroup<User>`が定義てきない，かつAPIの使用者にも求めない。
   この場合、`User`の自由半群が役に立ちます。

   ```ts
   export const getUser = (id: number): ReadonlyNonEmptyArray<User> => {
     const current = getCurrent(id);
     const history = getHistory(id);
     // マージせず，直接userの自由半群を返す
     return [current, ...history];
   };
   ```

注意する必要があるのは、`Semigroup<A>`インスタンスがあっても、次の理由から、自由半群を使用した方がいい場合があります。

- 高くて無意味な処理を回避する
- 半群インスタンスの引数として渡すことを回避する
- APIの使用者に正しいマージ方法を決めてもらえる（`concatAll`を使用して）。

## 順序から導出可能な半群(Order-derivable Semigroups)

`number`が**全順序**(任意の`x`と`y`に対して、`x <= y`または`y <= x`のどちらかは必ず成立する)であることを考えると 、`min`か`max`を使用して別の2つの`Semigroup<number>`インスタンスを定義できます。

```ts
import { Semigroup } from 'fp-ts/Semigroup';

const SemigroupMin: Semigroup<number> = {
  concat: (first, second) => Math.min(first, second),
};

const SemigroupMax: Semigroup<number> = {
  concat: (first, second) => Math.max(first, second),
};
```

**クイズ**：なぜ、`number`が**全順序**であることは重要でしょうか？

`number`以外の様々な型に対してこのような半群(`SemigroupMin`と`SemigroupMax`)を定義すると非常に便利です。

他の型に対して全順序の概念を表すのは可能でしょうか？

**順序** について話す前に、まず、**等しい** の概念について検討する必要があります。
