<!-- markdownlint-disable-file MD033 -->
# 用幺半群建模组合(Modeling composition through Monoids)

让我们回顾一下到目前为止所看到的内容。

我们已经看到一个**代数结构**涉及以下条件:

- 一些类型`A`
- 一些涉及类型`A`的运算
- 一些定律

我们看到的第一个代数结构是原群，它是定义在某种类型`A`上定义的代数结构，带有一个`concat`运算。`Magma<A>`中没有涉及任何定律，唯一的要求是`concat`必须在`A`上 _闭合_，这意味着它的结果必须仍然是一个`A`的元素。

```ts
concat(first: A, second: A) => A
```

紧接着我们看到了，如果给该运算添加一个限制，让其满足 _结合律_ ，我们便可以从原群`Magma<A>`得到半群`Semigroup<A>`。
我们也看到了结合律是如何体现并行运算的可能性的。

现在我们要对半群添加另一个条件。

给定一个定义在集合`A`上的半群，假设`A`中存在一个元素 _empty_。
若对于任意`A`中的元素`a`，`concat(a, empty) = a`均成立，则称 _empty_ 为**右单位元**。
若对于任意`A`中的元素`a`，`concat(empty, a) = a`均成立，则称 _empty_ 为**左单位元**。
若 _empty_ 同时为左单位元及右单位元，则称之为**双边单位元**，简称**单位元(unit element)**。

若半群中存在单位元，则该半群被称为**幺半群(Monoid)**。

**注**：在本节中的剩余部分，我们将称`empty`为**单位**。也可以称它为恒等元(identity element)、中立元(neutral element)。

我们已经看到了如何在TypeScript中用接口建模原群和半群。对幺半群也可以进行同样的操作。

```ts
import { Semigroup } from 'fp-ts/Semigroup';

interface Monoid<A> extends Semigroup<A> {
  readonly empty: A;
}
```

我们在前面几节中看到的许多半群都可以扩展为幺半群。我们需要找到的只是`A`的单位元。

```ts
import { Monoid } from 'fp-ts/Monoid';

/** 加法下的number `Monoid` */
const MonoidSum: Monoid<number> = {
  concat: (first, second) => first + second,
  empty: 0,
};

/** 乘法下的number `Monoid` */
const MonoidProduct: Monoid<number> = {
  concat: (first, second) => first * second,
  empty: 1,
};

const MonoidString: Monoid<string> = {
  concat: (first, second) => first + second,
  empty: '',
};

/** 逻辑与下的boolean monoid */
const MonoidAll: Monoid<boolean> = {
  concat: (first, second) => first && second,
  empty: true,
};

/** 逻辑或下的boolean monoid */
const MonoidAny: Monoid<boolean> = {
  concat: (first, second) => first || second,
  empty: false,
};
```

**测验**：在半群的章节中，我们已经看到了如何实现`ReadonlyArray<string>`的`Semigroup`实例:

```ts
import { Semigroup } from 'fp-ts/Semigroup';

const Semigroup: Semigroup<ReadonlyArray<string>> = {
  concat: (first, second) => first.concat(second),
};
```

你能找到这个半群的单位元吗？如果能，是否可以将结果推广到`ReadonlyArray<A>`？

**测验**(更复杂)：证明给定一个幺半群，单位元是唯一的。

证明的结果表示，每一个幺半群只能有一个单位元，因此当找到一个单位元后便不必再继续寻找。

每个幺半群都是半群，反之则不成立。

<img src="../../images/monoid.png" width="300" alt="Magma vs Semigroup vs Monoid" />

**例**：

```ts
import { pipe } from 'fp-ts/function';
import { intercalate } from 'fp-ts/Semigroup';
import * as S from 'fp-ts/string';

const SemigroupIntercalate = pipe(S.Semigroup, intercalate('|'));

console.log(S.Semigroup.concat('a', 'b')); // => 'ab'
console.log(SemigroupIntercalate.concat('a', 'b')); // => 'a|b'
console.log(SemigroupIntercalate.concat('a', '')); // => 'a|'
```

对于此半群，不存在一个`empty`使`concat(a, empty) = a`成立。

再让我们最后看一个有点“怪”的例子，涉及函数。

**例**：

**自同态(endomorphism)** 是输入类型与输出类型相同的函数：

```ts
type Endomorphism<A> = (a: A) => A;
```

给定类型`A`，可以通过下列方法使定义在`A`上的自同态构成一个幺半群：

- `concat`是组合函数(flow)
- `empty`是恒等函数(identity)

```ts
import { Endomorphism, flow, identity } from 'fp-ts/function';
import { Monoid } from 'fp-ts/Monoid';

export const getEndomorphismMonoid = <A,>(): Monoid<Endomorphism<A>> => ({
  concat: flow,
  empty: identity,
});
```

**注**：`identity`函数有且只有一种可能实现。

```ts
const identity = (a: A) => a;
```

不论我们输入什么，它都会返回给我们相同的值。

<!--
TODO:
我们可以开始初步了解`identity`函数的重要性了。虽然这个函数本身显然没有什么用处，但它对于定义函数的幺半群至关重要。在本例中是自同态。事实上，在组合方面，_什么都不做_ ，_空_ ， _中立_ 是一个非常有价值的属性。我们可以将`identity`函数视为函数的`0`。
-->

## `concatAll` 函数

与半群相比，幺半群的一大特性是多个元素的串联变得更加容易：不再需要提供初始值。

```ts
import { concatAll } from 'fp-ts/Monoid';
import * as S from 'fp-ts/string';
import * as N from 'fp-ts/number';
import * as B from 'fp-ts/boolean';

console.log(concatAll(N.MonoidSum)([1, 2, 3, 4])); // => 10
console.log(concatAll(N.MonoidProduct)([1, 2, 3, 4])); // => 24
console.log(concatAll(S.Monoid)(['a', 'b', 'c'])); // => 'abc'
console.log(concatAll(B.MonoidAll)([true, false, true])); // => false
console.log(concatAll(B.MonoidAny)([true, false, true])); // => true
```

**测验**：为什么不需要提供初始值？

## 乘积幺半群(Product monoid)

正如我们在半群中看到的那样，如果我们能够为复杂结构的每个字段定义一个幺半群实例，则可以为复杂结构定义一个幺半群实例。

**例**：

```ts
import { Monoid, struct } from 'fp-ts/Monoid';
import * as N from 'fp-ts/number';

type Point = {
  readonly x: number;
  readonly y: number;
};

const Monoid: Monoid<Point> = struct({
  x: N.MonoidSum,
  y: N.MonoidSum,
});
```

**注**：有一个类似于`struct`的combinator可以与元组一起使用：`tuple`.

```ts
import { Monoid, tuple } from 'fp-ts/Monoid';
import * as N from 'fp-ts/number';

type Point = readonly [number, number];

const Monoid: Monoid<Point> = tuple(N.MonoidSum, N.MonoidSum);
```

**测验**：是否可以为泛型`A`定义一个"自由幺半群"?

**Demo** (实现一个在画布上绘制几何形状的系统)

[`03_shapes.ts`](../03_shapes.ts)
