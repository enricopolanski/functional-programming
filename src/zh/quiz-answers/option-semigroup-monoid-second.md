# option-semigroup-monoid-second

## 问题

可以为`Option<A>`定义一个幺半群实例，其行为如下：

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| none     | none     | none                   |
| some(a1) | none     | some(a1)               |
| none     | some(a2) | some(a2)               |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

```ts
// 实现留给读者作为练习
declare const getMonoid: <A>(S: Semigroup<A>) => Monoid<Option<A>>
```

幺半群的`empty`是什么？

## 答案

幺半群的`empty`应该是`none`，因为它遵循所有幺半群定律。让我们检查一下：

**交换律**：

```ts
concat(none, concat(none, concat(none))) === concat(concat(none, none), none)
concat(none, concat(none, concat(some(z)))) === concat(concat(none, none), some(z))
concat(none, concat(some(y), concat(none))) === concat(concat(none, some(y)), none)
concat(none, concat(some(y), concat(some(z)))) === concat(concat(none, some(y)), some(z))
concat(some(x), concat(none, concat(none))) === concat(concat(some(x), none), none)
...
concat(some(x), concat(some(y), concat(some(z)))) === concat(concat(some(x), some(y)), some(z))
```

**右单位元**：

```ts
concat(some(x), none) === some(x)
```

**左单位元**：

```ts
concat(none, some(x)) === some(x)
```
