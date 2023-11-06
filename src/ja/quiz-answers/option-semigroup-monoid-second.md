# option-semigroup-monoid-second

## 問題

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

このモノイドにおいて `empty` は何に当たりますか？

## 答え

`none` がこのモノイドの empty メンバです。これを使用したときにモノイド則をすべて満たすことを確認しましょう：

**結合法則**
```ts
concat(none, concat(none, concat(none))) === concat(concat(none, none), none)
concat(none, concat(none, concat(some(z)))) === concat(concat(none, none), some(z))
concat(none, concat(some(y), concat(none))) === concat(concat(none, some(y)), none)
concat(none, concat(some(y), concat(some(z)))) === concat(concat(none, some(y)), some(z))
concat(some(x), concat(none, concat(none))) === concat(concat(some(x), none), none)
...
concat(some(x), concat(some(y), concat(some(z)))) === concat(concat(some(x), some(y)), some(z))
```

**右単位元**
```ts
concat(some(x), none) === some(x)
```

**左単位元**
```ts
concat(none, some(x)) === some(x)
```
