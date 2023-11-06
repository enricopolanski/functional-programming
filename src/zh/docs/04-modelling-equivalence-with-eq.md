# 用`eq`建模等价(Modelling equivalence with `Eq`)

我们仍然可以用TypeScript的接口对等价建模。

_等价关系(Equivalence relations)_ 体现了同一类型元素 _等价_ 的概念。_等价关系_ 的概念可以在TypeScript中用下列接口实现：

```ts
interface Eq<A> {
  readonly equals: (first: A, second: A) => boolean;
}
```

更直观地说：

- 如果`equals(x, y) = true`，那我们称`x`与`y`是相等的
- 如果`equals(x, y) = false`，那我们称`x`与`y`是不同的

**例**：

这是`number`类型的一个`Eq`实例：

```ts
import { Eq } from 'fp-ts/Eq';
import { pipe } from 'fp-ts/function';

const EqNumber: Eq<number> = {
  equals: (first, second) => first === second,
};

pipe(EqNumber.equals(1, 1), console.log); // => true
pipe(EqNumber.equals(1, 2), console.log); // => false
```

必须满足以下定律：

- 自反性：对于`A`中的每个`x`，`equals(x, x) === true`
- 对称性：对于`A`中的任意`x`、`y`，equals(x, y) === equals(y, x)
- 传递性：如果`equals(x, y) === true`且`equals(y, z) === true`，则对于`A`中的任意`x`、`y`、`z`，`equals(x, z) === true`

**测验**：combinator `reverse: <A>(E: Eq<A>) => Eq<A>`有意义吗？

**测验**：combinator `not: <A>(E: Eq<A>) => Eq<A>`有意义吗？

```ts
import { Eq } from 'fp-ts/Eq';

export const not = <A,>(E: Eq<A>): Eq<A> => ({
  equals: (first, second) => !E.equals(first, second),
});
```

**例**：

让我们看看使用`Eq`抽象的第一个示例，定义一个函数`elem`来检查给定值是否是`ReadonlyArray`的元素。

```ts
import { Eq } from 'fp-ts/Eq';
import { pipe } from 'fp-ts/function';
import * as N from 'fp-ts/number';

// 如果元素`a`存在于数组`as`中，返回`true`
const elem =
  <A,>(E: Eq<A>) =>
  (a: A) =>
  (as: ReadonlyArray<A>): boolean =>
    as.some((e) => E.equals(a, e));

pipe([1, 2, 3], elem(N.Eq)(2), console.log); // => true
pipe([1, 2, 3], elem(N.Eq)(4), console.log); // => false
```

为什么我们不用原生的`Array`的`includes`方法？

```ts
console.log([1, 2, 3].includes(2)); // => true
console.log([1, 2, 3].includes(4)); // => false
```

让我们为更复杂的类型定义一些`Eq`的实例。

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

然后分别验证`elem`和`includes`的结果。

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

**测验**： (JavaScript)。为什么`includes`方法返回了`false`?

> [答案](../quiz-answers/javascript-includes.md)

抽象相等性的概念至关重要，尤其是在像JavaScript这样的语言中，某些数据类型不提供方便的 API 来检查用户定义的相等性。

JavaScript的原生数据类型`Set`也面临同样的问题：

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

由于`Set`使用`===`(严格相等)来比较值，`points`现在包含`{ x: 0, y: 0 }`的**两个相同副本**，这肯定不是我们想要的。因此，定义一个新的 API 来将元素添加到`Set`(利用`Eq`抽象)是很方便的。

**测验**：这个API的签名是什么样的？

`EqPoint`的样板太多？好消息是，理论再次为我们提供了为像`Point`这样的结构实现`Eq`实例的可能性，只要我们能够为它的每个字段定义一个`Eq`实例。

`fp-ts/Eq`模块导出了一个非常便利的`struct` combinator:

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

**注**：与半群一样，不仅对类`struct`的数据类型，也有用于处理元组的combinators: `tuple`

```ts
import { Eq, tuple } from 'fp-ts/Eq';
import * as N from 'fp-ts/number';

type Point = readonly [number, number];

const EqPoint: Eq<Point> = tuple(N.Eq, N.Eq);

console.log(EqPoint.equals([1, 2], [1, 2])); // => true
console.log(EqPoint.equals([1, 2], [1, -2])); // => false
```

`fp-ts`还导出了其他combinator，下面的这个combinator允许我们为`ReadonlyArray`派生一个`Eq`实例。

```ts
import { Eq, tuple } from 'fp-ts/Eq';
import * as N from 'fp-ts/number';
import * as RA from 'fp-ts/ReadonlyArray';

type Point = readonly [number, number];

const EqPoint: Eq<Point> = tuple(N.Eq, N.Eq);

const EqPoints: Eq<ReadonlyArray<Point>> = RA.getEq(EqPoint);
```

与半群类似，可以为同一给定类型定义多个`Eq`实例。假设我们用以下类型建模了一个`User`：

```ts
type User = {
  readonly id: number;
  readonly name: string;
};
```

我们可以用`struct` combinator定义一个“标准的”`Eq<User>`：

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

在像Haskell这样的语言中，像`User`这样的结构的标准`Eq`实例可以由编译器自动生成。

```haskell
data User = User Int String
     deriving (Eq)
```

但是在某些特定情况下，我们可能对不同用户之间的某种类型的相等感兴趣。例如，如果两个用户具有相同的`id`，我们可以认为他们是相等的。

```ts
/** 如果两个user的`id`相同，则他们相同 */
const EqID: Eq<User> = {
  equals: (first, second) => N.Eq.equals(first.id, second.id),
};
```

现在我们通过将抽象概念表示为数据结构来将其具体化，我们可以像处理其他数据结构一样以编程方式操作`Eq`实例。让我们看一个例子。

**例**：我们可以使用`contramap` combinator，而不是手动定义`EqId`：给定一个实例`Eq<A>`和一个从`B`到`A`的函数，我们可以导出一个`Eq<B>`

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
); // => false (因为`name`不同)

console.log(
  EqID.equals({ id: 1, name: 'Giulio' }, { id: 1, name: 'Giulio Canti' }),
); // => true (尽管`name`不同)

console.log(EqID.equals({ id: 1, name: 'Giulio' }, { id: 2, name: 'Giulio' }));
// => false (尽管`name`相同)
```

**测验**：给定一个数据类型`A`，是否可以定义`Semigroup<Eq<A>>`？它能代表什么？
