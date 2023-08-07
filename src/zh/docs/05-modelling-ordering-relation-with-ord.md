# 使用`Ord`建模排序关系(Modelling ordering relations with `Ord`)

在前面关于`Eq`的章节中，我们讨论了**相等**的概念。在这一章中，我们将讨论**排序**的概念。

全序的概念可以在TypeScript中实现，如下所示：

```ts
import { Eq } from 'fp-ts/lib/Eq';

type Ordering = -1 | 0 | 1;

interface Ord<A> extends Eq<A> {
  readonly compare: (x: A, y: A) => Ordering;
}
```

更直观地说：

- 当且仅当`compare(x, y) = -1`时`x < y`
- 当且仅当`compare(x, y) = 0`时`x = y`
- 当且仅当`compare(x, y) = 1`时`x > y`

**例**：

让我们尝试给`number`类型定义一个`Ord`实例：

```ts
import { Ord } from 'fp-ts/Ord';

const OrdNumber: Ord<number> = {
  equals: (first, second) => first === second,
  compare: (first, second) => (first < second ? -1 : first > second ? 1 : 0),
};
```

必须满足以下定律：

1. **自反性**：对于任意属于`A`的`x`，`compare(x, x) <= 0`
2. **反对称**：对于任意属于`A`的`x`、`y`，如果`compare(x, y) <= 0`且`compare(y, x) <= 0`，则`x = y`
3. **传递性**：对于任意属于`A`的`x`、`y`、`z`，如果`compare(x, y) <= 0`且`compare(y, z) <= 0`，则`compare(x, z) <= 0`

`compare`还必须与`Eq`中的`equals`运算兼容:

对于任意属于`A`的`x`、`y`，当且仅当`equals(x, y) === true`时`compare(x, y) === 0`。

**注**：`equals`可以通过下列方式从`compare`派生得到:

```ts
equals: (first, second) => compare(first, second) === 0;
```

事实上，`fp-ts/Ord`模块导出了一个方便的helper `fromCompare`，它允许我们只需提供`compare`函数即可定义`Ord`实例：

```ts
import { Ord, fromCompare } from 'fp-ts/Ord';

const OrdNumber: Ord<number> = fromCompare((first, second) =>
  first < second ? -1 : first > second ? 1 : 0,
);
```

**测验**：是否可以为石头剪刀布定义一个`Ord`实例，其中如果`move2`击败`move1`，则`move1 <= move2`？

让我们通过定义一个对`ReadonlyArray`元素进行排序的`sort`函数来了解`Ord`实例的实际用法。

```ts
import { pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';
import { Ord } from 'fp-ts/Ord';

const sort =
  <A,>(O: Ord<A>) =>
  (as: ReadonlyArray<A>): ReadonlyArray<A> =>
    as.slice().sort(O.compare);

pipe([3, 1, 2], sort(N.Ord), console.log); // => [1, 2, 3]
```

**测验**：(JavaScript)。为什么该实现用到了数组原生的`slice`方法？

让我们通过定义一个返回两个值中最小值的`min`函数来看看另一个`Ord`实际用法：

```ts
import { pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';
import { Ord } from 'fp-ts/Ord';

const min =
  <A,>(O: Ord<A>) =>
  (second: A) =>
  (first: A): A =>
    O.compare(first, second) === 1 ? second : first;

pipe(2, min(N.Ord)(1), console.log); // => 1
```

## 对偶排序(Dual Ordering)

通过`reverse` combinator反转`concat`，我们得到了对偶半群。同样地，我们也可以反转`compare`得到对偶排序。

让我们为`Ord`定义`reverse` combinator：

```ts
import { pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';
import { fromCompare, Ord } from 'fp-ts/Ord';

export const reverse = <A,>(O: Ord<A>): Ord<A> =>
  fromCompare((first, second) => O.compare(second, first));
```

`reverse`的一个用法示例是从`min`函数获取`max`函数：

```ts
import { flow, pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';
import { Ord, reverse } from 'fp-ts/Ord';

const min =
  <A,>(O: Ord<A>) =>
  (second: A) =>
  (first: A): A =>
    O.compare(first, second) === 1 ? second : first;

// const max: <A>(O: Ord<A>) => (second: A) => (first: A) => A
const max = flow(reverse, min);

pipe(2, max(N.Ord)(1), console.log); // => 2
```

当谈到数字时，**全序**可能非常显而易见。但并不总是这样。让我们看一个稍微复杂一点的场景：

```ts
type User = {
  readonly name: string;
  readonly age: number;
};
```

一个用户“小于或等于”另一个用户的定义并不清晰。

我们应该如何定义`Ord<User>`？

实际上这取决于上下文。但一种可能是根据用户的年龄对用户进行排序：

```ts
import * as N from 'fp-ts/number';
import { fromCompare, Ord } from 'fp-ts/Ord';

type User = {
  readonly name: string;
  readonly age: number;
};

const byAge: Ord<User> = fromCompare((first, second) =>
  N.Ord.compare(first.age, second.age),
);
```

我们可以使用`contramap` combinator消除一些样板代码：给定`A`的`Ord`实例和从`B`到`A`的函数，我们可以派生出`B`的`Ord`实例

```ts
import { pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';
import { contramap, Ord } from 'fp-ts/Ord';

type User = {
  readonly name: string;
  readonly age: number;
};

const byAge: Ord<User> = pipe(
  N.Ord,
  contramap((_: User) => _.age),
);
```

我们可以使用之前定义的`min`函数获取两个`User`中年龄小的那个。

```ts
// const getYounger: (second: User) => (first: User) => User
const getYounger = min(byAge);

pipe(
  { name: 'Guido', age: 50 },
  getYounger({ name: 'Giulio', age: 47 }),
  console.log,
); // => { name: 'Giulio', age: 47 }
```

**测验**：`fp-ts/ReadonlyMap`模块导出了下列API：

```ts
/**
 * 获取`ReadonlyMap`的键的排序后的数组`ReadonlyArray`。
 */
declare const keys: <K>(
  O: Ord<K>,
) => <A>(m: ReadonlyMap<K, A>) => ReadonlyArray<K>;
```

为什么这个API需要`Ord<K>`的实例`O`?

最后让我们回到第一个问题：为不同于`number`的类型定义两个半群`SemigroupMin`和`SemigroupMax`：

```ts
import { Semigroup } from 'fp-ts/Semigroup';

const SemigroupMin: Semigroup<number> = {
  concat: (first, second) => Math.min(first, second),
};

const SemigroupMax: Semigroup<number> = {
  concat: (first, second) => Math.max(first, second),
};
```

有了`Ord`抽象，现在我们可以这么写：

```ts
import { pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';
import { Ord, contramap } from 'fp-ts/Ord';
import { Semigroup } from 'fp-ts/Semigroup';

export const min = <A,>(O: Ord<A>): Semigroup<A> => ({
  concat: (first, second) => (O.compare(first, second) === 1 ? second : first),
});

export const max = <A,>(O: Ord<A>): Semigroup<A> => ({
  concat: (first, second) => (O.compare(first, second) === 1 ? first : second),
});

type User = {
  readonly name: string;
  readonly age: number;
};

const byAge: Ord<User> = pipe(
  N.Ord,
  contramap((_: User) => _.age),
);

console.log(
  min(byAge).concat({ name: 'Guido', age: 50 }, { name: 'Giulio', age: 47 }),
); // => { name: 'Giulio', age: 47 }
console.log(
  max(byAge).concat({ name: 'Guido', age: 50 }, { name: 'Giulio', age: 47 }),
); // => { name: 'Guido', age: 50 }
```

**例**：

让我们用最后一个例子来回顾一下这一切(改编自[Fantas, Eel, and Specification 4: Semigroup](http://www.tomharding.me/2017/03/13/fantas-eel-and-specification-4/)).

假设我们需要构建一个系统，在数据库中存在按以下方式实现的客户记录：

```ts
interface Customer {
  readonly name: string;
  readonly favoriteThings: ReadonlyArray<string>;
  readonly registeredAt: number; // 时间戳(自1970)
  readonly lastUpdatedAt: number; // 时间戳(自1970)
  readonly hasMadePurchase: boolean;
}
```

由于某些原因，同一个人可能有重复的记录。

我们需要一个合并策略。这就是`Semigroup`的用武之地！

```ts
import * as B from 'fp-ts/boolean';
import { pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';
import { contramap } from 'fp-ts/Ord';
import * as RA from 'fp-ts/ReadonlyArray';
import { max, min, Semigroup, struct } from 'fp-ts/Semigroup';
import * as S from 'fp-ts/string';

const SemigroupCustomer: Semigroup<Customer> = struct({
  // 保留长的那个
  name: max(pipe(N.Ord, contramap(S.size))),
  // 累加
  favoriteThings: RA.getSemigroup<string>(),
  // 保留最早的日期
  registeredAt: min(N.Ord),
  // 保留最新的日期
  lastUpdatedAt: max(N.Ord),
  // 或
  hasMadePurchase: B.SemigroupAny,
});

console.log(
  SemigroupCustomer.concat(
    {
      name: 'Giulio',
      favoriteThings: ['math', 'climbing'],
      registeredAt: new Date(2018, 1, 20).getTime(),
      lastUpdatedAt: new Date(2018, 2, 18).getTime(),
      hasMadePurchase: false,
    },
    {
      name: 'Giulio Canti',
      favoriteThings: ['functional programming'],
      registeredAt: new Date(2018, 1, 22).getTime(),
      lastUpdatedAt: new Date(2018, 2, 9).getTime(),
      hasMadePurchase: true,
    },
  ),
);
/*
{ name: 'Giulio Canti',
  favouriteThings: [ 'math', 'climbing', 'functional programming' ],
  registeredAt: 1519081200000, // new Date(2018, 1, 20).getTime()
  lastUpdatedAt: 1521327600000, // new Date(2018, 2, 18).getTime()
  hasMadePurchase: true
}
*/
```

**测验**：对于给定的类型`A`，能否定义`Semigroup<Ord<A>>`实例？它代表的可能是什么？

**Demo**：

[`02_ord.ts`](../02_ord.ts)
