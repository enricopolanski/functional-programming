# `eq`で等価をモデリングする（Modelling equivalence with `Eq`）

前節と似たように、等価の概念をモデル化できます。

**等価関係（Equivalence relations）** は、同じ型の要素の等価性の概念を捉えます。等価関係の概念は、次のインターフェイスを使用してTypeScriptで実装できます。

```ts
interface Eq<A> {
  readonly equals: (first: A, second: A) => boolean;
}
```

直感的に:

- `equals(x, y) = true` の場合、xとyは等しいという
- `equals(x, y) = false`の場合、xとyは異なるという

**例**：

次は`number`型の`Eq`インスタンス：

```ts
import { Eq } from 'fp-ts/Eq';
import { pipe } from 'fp-ts/function';

const EqNumber: Eq<number> = {
  equals: (first, second) => first === second,
};

pipe(EqNumber.equals(1, 1), console.log); // => true
pipe(EqNumber.equals(1, 2), console.log); // => false
```

次の法則を守らなければなりません。

- 反射性：`A`内の任意の`x`に対して、`equals(x, x) === true`
- 対称性：`A`内の任意の`x`と`y`に対して、`equals(x, y) === equals(y, x)`
- 推移性：`A`内の任意の`x`と`y`と`z`に対して、`equals(x, y) === true`かつ`equals(y, z) === true`の場合、`equals(x, z) === true`

**クイズ**：コンビネータ`reverse: <A>(E: Eq<A>) => Eq<A>`は意味を持ちますか？

**クイズ**：コンビネータ`not: <A>(E: Eq<A>) => Eq<A>`は意味を持ちますか？

```ts
import { Eq } from 'fp-ts/Eq';

export const not = <A,>(E: Eq<A>): Eq<A> => ({
  equals: (first, second) => !E.equals(first, second),
});
```

**例**：

まずは、`Eq`抽象化の使用例を見てみましょう。
関数`elem`は、指定された値が`ReadonlyArray`の要素であるかどうかをチェックします。

```ts
import { Eq } from 'fp-ts/Eq';
import { pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';

// もし要素`a`が配列`as`に存在しているのであれば，`true`を返す
const elem =
  <A,>(E: Eq<A>) =>
  (a: A) =>
  (as: ReadonlyArray<A>): boolean =>
    as.some((e) => E.equals(a, e));

pipe([1, 2, 3], elem(N.Eq)(2), console.log); // => true
pipe([1, 2, 3], elem(N.Eq)(4), console.log); // => false
```

なぜネイティブの`Array.prototype.includes`を使わないでしょう？

```ts
console.log([1, 2, 3].includes(2)); // => true
console.log([1, 2, 3].includes(4)); // => false
```

より複雑な型の`Eq`インスタンスを定義しましょう。

```ts
import { Eq } from 'fp-ts/Eq';

type Point = {
  readonly x: number;
  readonly y: number;
};

const EqPoint: Eq<Point> = {
  equals: (first, second) => first.x === second.x && first.y === second.y,
};

console.log(EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: 2 })); // => true
console.log(EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: -2 })); // => false
```

そして、`elem`と`includes`の結果を確認します。

```ts
const points: ReadonlyArray<Point> = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 2 },
];

const search: Point = { x: 1, y: 1 };

console.log(points.includes(search)); // => false :(
console.log(pipe(points, elem(EqPoint)(search))); // => true :)
```

**クイズ**： (JavaScript)。なぜ`includes`が`false`を返しました?

> [答え](../quiz-answers/javascript-includes.md)

等価性の概念を抽象化することはとても重要です。特にJavaScriptような、一部の型において、ユーザー定義の等価性をチェックするための便利なAPIを提供しない言語にとっては、なおさらです。

JavaScriptネイティブの`Set`型にも同じ問題があります。

```ts
type Point = {
  readonly x: number;
  readonly y: number;
};

const points: Set<Point> = new Set([{ x: 0, y: 0 }]);

points.add({ x: 0, y: 0 });

console.log(points);
// => Set { { x: 0, y: 0 }, { x: 0, y: 0 } }
```

`Set`が`===`(「厳密等価」)を使って値の比較を行うことを考慮すると、`points`には`{ x: 0, y: 0 }`が2つ含まれることになります。これは望ましくない結果です。したがって、`Eq` 抽象化を利用して、要素を`Set`に追加するAPIを新たに定義すると便利です。

**クイズ**：このAPIシグネチャーはなんでしょうか？

`EqPoint`にはボイラープレートコードが多い？嬉しいことに、数学理論が再び`Point`のような構造体の`Eq`インスタンスの実現可能性を提供してくれました。フィールドごとに`Eq`インスタンスが定義可能なら、その構造体の `Eq` インスタンスもまた実装可能なのです。

`fp-ts/Eq`は便利なコンビネータ`struct`をエクスポートしています。

```ts
import { Eq, struct } from 'fp-ts/Eq';
import * as N from 'fp-ts/number';

type Point = {
  readonly x: number;
  readonly y: number;
};

const EqPoint: Eq<Point> = struct({
  x: N.Eq,
  y: N.Eq,
});
```

**注**：半群と似たように、`struct`類似のデータ型のみならず、タプルのためのコンビネータ`tuple`も存在します。

```ts
import { Eq, tuple } from 'fp-ts/Eq';
import * as N from 'fp-ts/number';

type Point = readonly [number, number];

const EqPoint: Eq<Point> = tuple(N.Eq, N.Eq);

console.log(EqPoint.equals([1, 2], [1, 2])); // => true
console.log(EqPoint.equals([1, 2], [1, -2])); // => false
```

`fp-ts`がエクスポートしている他のコンビネータもあります。次のコンビネータは`ReadonlyArray`の`Eq`インスタンスを導出できます。

```ts
import { Eq, tuple } from 'fp-ts/Eq';
import * as N from 'fp-ts/number';
import * as RA from 'fp-ts/ReadonlyArray';

type Point = readonly [number, number];

const EqPoint: Eq<Point> = tuple(N.Eq, N.Eq);

const EqPoints: Eq<ReadonlyArray<Point>> = RA.getEq(EqPoint);
```

半群と似たように、同じ型に対して、複数の`Eq`インスタンスを定義できます。
次の型で`User`をモデリングしているとします。

```ts
type User = {
  readonly id: number;
  readonly name: string;
};
```

`struct`コンビネータで「標準」な`Eq<User>`を定義できます。

```ts
import { Eq, struct } from 'fp-ts/Eq';
import * as N from 'fp-ts/number';
import * as S from 'fp-ts/string';

type User = {
  readonly id: number;
  readonly name: string;
};

const EqStandard: Eq<User> = struct({
  id: N.Eq,
  name: S.Eq,
});
```

**注**：Haskell のような言語では、`User`のような構造体の標準`Eq`インスタンスはコンパイラによって自動的に生成されます。

```haskell
data User = User Int String
     deriving (Eq)
```

違うコンテキストでは、ユーザーの等価が異なる意味を持つ可能性があります。例えば、`id`が等しい場合、同じユーザーだとみなします。

```ts
const EqID: Eq<User> = {
  equals: (first, second) => N.Eq.equals(first.id, second.id),
};
```

「2つの値を比較する」という抽象的な概念をデータ構造で具体化したので、他のデータ構造と同様に`Eq`インスタンスをプログラムで操作できます。
具体例を見てみましょう。

**例**：手動で`EqId`を定義するより、`contramap`コンビネータを使った方が便利です。`Eq<A>`のインスタンスと`B`から`A`への関数が与えられる場合、`Eq<B>`のインスタンスが導出できます。

```ts
import { Eq, struct, contramap } from 'fp-ts/Eq';
import { pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';
import * as S from 'fp-ts/string';

type User = {
  readonly id: number;
  readonly name: string;
};

const EqStandard: Eq<User> = struct({
  id: N.Eq,
  name: S.Eq,
});

const EqID: Eq<User> = pipe(
  N.Eq,
  contramap((user: User) => user.id),
);

console.log(
  EqStandard.equals({ id: 1, name: 'Giulio' }, { id: 1, name: 'Giulio Canti' }),
); // => false (`name`が異なる)

console.log(
  EqID.equals({ id: 1, name: 'Giulio' }, { id: 1, name: 'Giulio Canti' }),
); // => true (`name`が異なっても)

console.log(EqID.equals({ id: 1, name: 'Giulio' }, { id: 2, name: 'Giulio' }));
// => false (`name`が同じくでも)
```

**クイズ**：型`A`が与えれる場合、`Semigroup<Eq<A>>`が定義できますか？それは何を表していますか？
