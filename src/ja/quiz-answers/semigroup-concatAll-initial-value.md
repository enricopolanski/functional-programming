# semigroup-concatAll-initial-value

## 問題

定義によると、`concat`は毎回`A`の2つの要素だけを結合しています。複数の要素を結合することは可能でしょうか?

`concatAll`関数は、セミグループのインスタンス、初期値、および結合する要素の配列を入力として受け取る必要があります。

```ts
import * as S from 'fp-ts/Semigroup';
import * as N from 'fp-ts/number';

const sum = S.concatAll(N.SemigroupSum)(2);

console.log(sum([1, 2, 3, 4])); // => 12

const product = S.concatAll(N.SemigroupProduct)(3);

console.log(product([1, 2, 3, 4])); // => 72
```

なぜ初期値が必要ですか？

## 答え

`concatAll`は`A`型の値を返します。入力として受け取る要素の配列が空の場合、その中から`A`型の要素を取得して返すことができません。
初期値を強制することで、配列が空の場合にその初期値を返すことができます。

```ts
import * as Semigroup from 'fp-ts/Semigroup'
import * as NEA from 'fp-ts/NonEmptyArray'

const concatAll = <A>(S: Semigroup<A>) => (as: NEA<A>) =>
  Semigroup.concatAll(S)(NEA.tail(as))(NEA.head(as))
```
