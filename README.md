<!-- markdownlint-disable-file MD033 -->

# functional-programming

这个repo借用TypeScript与fp-ts生态中的库介绍了函数式编程的概念。

这个fork是[Giulio Canti](https://gcanti.github.io/about.html)的["Introduction to Functional Programming (Italian)"](https://github.com/gcanti/functional-programming)的翻译。原作者在他的FP讲座以及workshop中使用了它。

由于译者不会意大利语，因此本翻译参考了[enricopolanski](https://github.com/enricopolanski)的[英译版本](https://github.com/enricopolanski/functional-programming)。

翻译会尽可能地不带有主观意见的，原封不动的传达原作者的意思。译者水平有限，如有错误请多多包涵。

---

## 什么是函数式编程

> 函数式编程是使用纯函数进行编程。数学意义上的函数。

在网上很简单地就能找到如下定义：

> (纯)函数是一个过程，给定相同的输入总是返回相同的输出，没有任何可观察到的副作用。

虽然现在"副作用"这个术语还没有任何具体的含义(将来我们会看到如何给出正式的定义)，但重要的是拥有某种直觉。思考一下打开文件或向数据库写入数据。

目前，我们可以局限地理解为，副作用是函数除了返回一个值之外所做的**任何事情**。

只使用纯函数的程序的结构是什么样的?

函数式的程序往往像在写**pipeline**一样：

```ts
const program = pipe(
  input,
  f1, // 纯函数
  f2, // 纯函数
  f3, // 纯函数
  ...
)
```

上面的程序用语言描述就是，`input`被传递给了第一个函数`f1`，该函数的返回值被传递给了第二个函数`f2`，`f2`的返回值又被传递给了第三个函数`f3`。以此类推。

**Demo**：

[`00_pipe_and_flow.ts`](src/00_pipe_and_flow.ts)

我们将看到，在以这种风格构建代码时，函数式编程如何成为我们的工具。

除了理解函数式编程是什么之外，理解它的目标是什么也很重要。

函数式编程的目标是通过使用形式化模型(formal models)来**控制系统的复杂性**，并十分关注**代码的属性**和重构的容易性。

> 函数式编程帮助人们了解程序构建背后的数学知识：
>
> - 如何编写可组合的代码
> - 如何推理副作用
> - 如何编写一致的，通用的，而非临时的，特殊的(ad-hoc)API

什么叫更关注代码的属性？让我们举个例子。

**例**：

为什么我们说`Array.prototype.map`比`for`循环要更"函数式"？

```ts
// 输入
const xs: Array<number> = [1, 2, 3];

// 转换
const double = (n: number): number => n * 2;

// 结果：我想要一个新的数组，这个数组里的元素是把xs的每个元素翻倍后得到的结果
const ys: Array<number> = [];
for (let i = 0; i <= xs.length; i++) {
  ys.push(double(xs[i]));
}
```

`for`循环带来了很多的复杂性，我可以修改：

- 开始的索引，`let i = 0`
- 循环条件，`i < xs.length`
- 步长变化， `i++`

这同时意味着，我可能会引入某些**错误**，无法对返回值做出任何保证。

**测验**：`for`循环正确吗？

> [答案](src/quiz-answers/for-loop.md)

让我们用`map`来重写它。

```ts
// 输入
const xs: Array<number> = [1, 2, 3];

// 转换
const double = (n: number): number => n * 2;

// 结果：我想要一个新的数组，这个数组里的元素是把xs的每个元素翻倍后得到的结果
const ys: Array<number> = xs.map(double);
```

我们可以注意到，跟`for`相比，`map`缺少了一些灵活性，但它为我们提供了一些保证:

- 输入数组的所有元素都会被处理
- 结果数组的元素数量始终与输入数组相同

在函数式编程中，更强调代码的属性而不是实现细节。**正是由于其局限性**，而让`map`显得有趣。

想想看当审查涉及循环的代码时，`map`会比`for`容易多少。

## 函数式编程的两大基石

函数式编程基于以下的两个支柱

- 引用透明(参照透明)
- 组合(作为通用设计模式)

其余的所有内容都直接或间接地源于这两点。

### 引用透明

> **定义**：如果一个**表达式**可以被替换为相应的值而不改变程序的行为，则该表达式被认为是 _引用透明_ 的

**例** (引用透明意味着使用纯函数)

```ts
const double = (n: number): number => n * 2;

const x = double(2);
const y = double(2);
```

表达式`double(2)`拥有引用透明性因为它可以被它的值所代替(4)。

因此我可以继续进行以下重构。

```ts
const x = 4;
const y = x;
```

并不是所有表达式都是引用透明的。让我们看一个例子。

**例** (引用透明意味着不抛出异常)

```ts
const inverse = (n: number): number => {
  if (n === 0) throw new Error('cannot divide by zero');
  return 1 / n;
};

const x = inverse(0) + 1;
```

我无法用它的值去替代`inverse(0)`，因此它不是引用透明的。

**例** (引用透明需要使用不可变的数据结构)

```ts
const xs = [1, 2, 3];

const append = (xs: Array<number>): void => {
  xs.push(4);
};

append(xs);

const ys = xs;
```

在最后一行，我无法用`xs`最初的值`[1, 2, 3]`来代替它，因为在调用`append`时它改变了。

为什么引用透明如此重要？因为它允许我们：

- 在局部推导代码。不需要去了解外部的代码上下文就可以理解一个代码片段
- 在不改变程序行为的同时对代码进行**重构**

**测验**：假设我们有下列程序。

```ts
// 在 TypeScript 中， `declare` 允许我们在不写具体实现的情况下进行声明
declare const question: (message: string) => Promise<string>;

const x = await question('What is your name?');
const y = await question('What is your name?');
```

我可以进行如下重构吗？程序的行为是否会改变？

```ts
const x = await question('What is your name?');
const y = x;
```

答案是，在不读`question`的 _具体实现_ 的情况下无法做出回答。

如你所见，重构包含非引用透明的表达式的程序可能具有挑战性。
在函数式编程中，每个表达式都是引用透明的，因此进行更改所需的认知负荷将大大减少。

### 组合

函数式编程的基本模式是 _组合_：我们将完成非常具体任务的小的代码单元组合成更大且复杂的单元。

我们能想到的“从最小到最大”的组合模式的例子：

- 组合两个或多个原始值（数字或字符串）
- 组合两个或多个函数
- 组合整个程序

在最后一个例子里，我们可以谈一谈 _模块化编程_

> 我所说的模块化编程是指通过将较小的程序粘合在一起来构建大型程序的过程 - Simon Peyton Jones

这种编程风格可以通过使用 combinators 来实现

术语 **combinator** 指的是 [combinator pattern](https://wiki.haskell.org/Combinator):

> 一种以组合事物为中心的库组织风格。通常有一些类型`T`，一些`T`类型的原语，以及一些 **combinator**。它们可以以各种方式组合`T`类型的值以构建更复杂的`T`类型的值。

combinator 的一般概念相当的模糊，它可以以不同的形式出现，但是最简单的是这样的：

```ts
combinator: Thing -> Thing
```

**例**： 函数 `double` 组合了两个数字。

combinator 的目的是从已定义的事物中创造新的事物。

由于 combinator 输出的新的 _事物_ 可以作为其他的程序或 combinator 的输入，因此我们可以不断地进行组合(组合爆炸)，这使得这种模式非常强大。

**例**：

```ts
import { pipe } from 'fp-ts/function';

const double = (n: number): number => n * 2;

console.log(pipe(2, double, double, double)); // => 16
```

因此，我们在函数式模块中能找到的常见设计是：

- 某种类型`T`的模型
- 一小组`T`的原语
- 一组 combinator 用于在更大的结构中组合原语

让我尝试实现这样一个模块。

**Demo**：

[`01_retry.ts`](src/01_retry.ts)

正如在demo中所演示的，仅用3个原语和两个 combinator，我们就能够表达相当复杂的策略。

仔细思考便可以发现，每添加一个原语或一个 combinator 便可以使表达可能性翻倍。

在这里我想特别提到 `01_retry.ts` 的两个 combinator 中的 `concat`，因为它涉及到一个非常强大的函数式编程抽象：半群(semigroup).

## 用半群建模组合

半群是组合两个或多个值的方法。

半群是一种代数结构，通常定义为以下各项的特定组合：

- 一个或多个集合(set)
- 在这些集合上的一个或多个运算
- 运算满足0或多个定律

代数是数学家试图以最纯粹的形式捕捉一个想法，消除一切多余的东西的方法。

> 当修改代数时，唯一允许的运算是代数本身根据其自身遵循的定律所定义的运算

代数可以被认为是**接口**的抽象

> 当接口被修改时，唯一允许的运算是接口本身根据其自身规律定义的运算

在讨论半群之前，我们首先看一个代数结构的例子，_原群(magma)_。

### 原群(Magma)的定义

原群`Magma<A>`是一个非常简单的代数结构:

- 一个集合或一个类型 (A)
- `concat` 运算
- 不需要遵循任何定律

**注**：在大多数情况下，术语 _集合_ 和 _类型_ 可以互换使用。

我们可以用 TypeScript `interface` 去建模一个原群

```ts
interface Magma<A> {
  readonly concat: (first: A, second: A) => A;
}
```

上述的代码描述了这样一种代数结构，它拥有：

- 一个集合`A`
- 集合`A`上的运算`concat`。集合`A`在该运算下 _闭合(closed)_。这意味着对`A` 的任意元素进行该运算，它的结果仍然是`A`的元素。由于结果仍然是`A`，因此可以再次把它用作`concat`的输入，并根据需要重复任意次。换句话说，`concat`是`A`的`combinator`.

让我们实现一个具体的`Magma<A>`实例，其中`A`是`number`.

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

**测验**：`concat`是一个 _封闭性(Closure)_ 运算这一事实看似不起眼，其实非常重要。如果`A`是自然数的集合而不是 JavaScript的number类型(正负浮点数的集合), 我们能用`MagmaSub`的`concat`去定义`Magma<Natural>`吗? 你能想到其他的定义在自然数上的不具备 _封闭性_ 的`concat`运算吗?

> [答案](src/quiz-answers/magma-concat-closed.md)

**定义**：给定一个非空集合`A`和一个定义在`A`上的二元封闭性运算`*`，我们把组合`(A, *)`叫做 _原群(magma)_ (`A`与`*`构成了原群)。

原群不遵守任何定律，它只需要满足封闭性。让我们看看需要满足另一个定律的代数：半群。

### 半群(semigroup)的定义

> 给定一个原群，如果`concat`满足**结合律**，则它是一个 _半群_。

术语"结合律"意味着下列等式对于`A`中的任意`x`，`y`，`z`成立：

```ts
(x * y) * z = x * (y * z)

// 或
concat(concat(a, b), c) = concat(a, concat(b, c))
```

用通俗的话来说，结合律告诉我们不必担心表达式中的括号，我们可以简单地写成`x * y * z`(没有歧义)。

**例**：

字符串拼接遵循结合律。

```ts
("a" + "b") + "c" = "a" + ("b" + "c") = "abc"
```

每个半群一定是原群，反之则不成立。

<center>
<img src="images/semigroup.png" width="300" alt="Magma vs Semigroup" />
</center>

**例**：

刚才的`MagmaSub`就不是半群因为它的`concat`不遵循结合律。

```ts
import { pipe } from 'fp-ts/function';
import { Magma } from 'fp-ts/Magma';

const MagmaSub: Magma<number> = {
  concat: (first, second) => first - second,
};

pipe(MagmaSub.concat(MagmaSub.concat(1, 2), 3), console.log); // => -4
pipe(MagmaSub.concat(1, MagmaSub.concat(2, 3)), console.log); // => 2
```

半群抓住了可并行运算的本质。

如果我们知道存在这样一个遵循结合律的运算，我们可以将一个计算进一步拆分为两个子计算，每个子计算又可以进一步拆分为子计算。

```ts
a * b * c * d * e * f * g * h = ((a * b) * (c * d)) * ((e * f) * (g * h))
```

子计算可以并列运行。

至于`Magma`, `Semigroup`是通过TypeScript的`interface`实现的:

```ts
// fp-ts/lib/Semigroup.ts

interface Semigroup<A> extends Magma<A> {}
```

以下定律必须成立：

- **结合律**: 如果`S`是一个半群则对任意属于`S`的`x`，`y`，`z`，下式必然成立：

```ts
S.concat(S.concat(x, y), z) = S.concat(x, S.concat(y, z));
```

**注**： 遗憾的是，无法使用TypeScript的类型系统实现该定律.

让我们为`ReadonlyArray<string>`实现一个半群:

```ts
import * as Se from 'fp-ts/Semigroup';

const Semigroup: Se.Semigroup<ReadonlyArray<string>> = {
  concat: (first, second) => first.concat(second),
};
```

`concat`这个名称对于数组来说是有意义的(稍后我们会看到)，但是根据上下文和我们要实现的实例类型`A`，`concat`可能有不同的解释和含义：

- 串联(concatenation)
- 组合(combination)
- 合并(merging)
- 融合(fusion)
- 选择(selection)
- 求和(sum)
- 代换(substitution)

以及许多其它的含义。

**例**：

下方的代码展示了如何实现一个半群`(number, +)`，`+`表示一般的加法运算。

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** 闭合于`加法`运算下的`number`半群 */
const SemigroupSum: Semigroup<number> = {
  concat: (first, second) => first + second,
};
```

**测验**：定义在[`01_retry.ts`](src/01_retry.ts)中的combinator `concat`能否用来给`RetryPolicy`定义一个半群接口？

> [答案](src/quiz-answers/semigroup-demo-concat.md)

下方的代码展示了如何实现一个半群`(number, *)`，`*`表示一般的乘法运算。

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** 闭合于`乘法`运算下的`number`半群 */
const SemigroupProduct: Semigroup<number> = {
  concat: (first, second) => first * second,
};
```

**注**： 这里有一个常见错误是仅将半群与类型一起考虑(而不考虑运算)。对于类型`A`，我们可以定义多个`Semigroup<A>`的**实例**。我们已经看到了对于`number`，我们可以用 _加法_ 或 _乘法_ 去定义一个半群。实际上，类型不同但运算相同的半群也完全存在。`SemigroupSum`也可以由自然数而不是无符号浮点数(number)来实现。

这里有另一个`string`类型的例子：

```ts
import { Semigroup } from 'fp-ts/Semigroup';

const SemigroupString: Semigroup<string> = {
  concat: (first, second) => first + second,
};
```

这里还有一个`boolean`类型的例子：

```ts
import { Semigroup } from 'fp-ts/Semigroup';

const SemigroupAll: Semigroup<boolean> = {
  concat: (first, second) => first && second,
};

const SemigroupAny: Semigroup<boolean> = {
  concat: (first, second) => first || second,
};
```

### `concatAll`函数

根据定义，`concat`每次仅组合`A`的两个元素。是否可以将任意数量的元素组合起来？

`concatAll`函数需要：

- 一个半群的实例
- 一个初始值
- 元素的数组

```ts
import * as S from 'fp-ts/Semigroup';
import * as N from 'fp-ts/number';

const sum = S.concatAll(N.SemigroupSum)(2);

console.log(sum([1, 2, 3, 4])); // => 12

const product = S.concatAll(N.SemigroupProduct)(3);

console.log(product([1, 2, 3, 4])); // => 72
```

**测验**：为什么需要提供一个初始值？

> [答案](src/quiz-answers/semigroup-concatAll-initial-value.md)

**例**：

让我们通过重新实现JavaScript标准库中的一些流行函数来展示`concatAll`的一些应用。

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

**测验**：以下半群实例合法吗(是否遵守半群定律)？

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** 总是返回第一个参数 */
const first = <A,>(): Semigroup<A> => ({
  concat: (first, _second) => first,
});
```

> [答案](src/quiz-answers/semigroup-first.md)

**测验**：以下半群实例合法吗？

```ts
import { Semigroup } from 'fp-ts/Semigroup';

/** 总是返回第二个参数 */
const last = <A,>(): Semigroup<A> => ({
  concat: (_first, second) => second,
});
```

> [答案](src/quiz-answers/semigroup-second.md)

### 对偶半群(dual semigroup)

给定一个半群实例，只需交换运算对象的组合顺序即可获得新的半群实例：

```ts
import { pipe } from 'fp-ts/function';
import { Semigroup } from 'fp-ts/Semigroup';
import * as S from 'fp-ts/string';

// 一个半群combinator
const reverse = <A,>(s: Semigroup<A>): Semigroup<A> => ({
  concat: (first, second) => s.concat(second, first),
});

pipe(S.Semigroup.concat('a', 'b'), console.log); // => 'ab'
pipe(reverse(S.Semigroup).concat('a', 'b'), console.log); // => 'ba'
```

**测验**：这个combinator是有意义的，因为一般来说`concat`运算是不满足[**交换律**](https://en.wikipedia.org/wiki/Commutative_property)的, 你能分别找到一个`concat`满足交换律与不满足交换律的例子吗？

> [答案](src/quiz-answers/semigroup-commutative.md)

### 乘积半群(Semigroup product)

让我们试着为更复杂的类型定义一个半群实例：

```ts
import * as N from 'fp-ts/number';
import { Semigroup } from 'fp-ts/Semigroup';

// 建模一个从原点开始的向量
type Vector = {
  readonly x: number;
  readonly y: number;
};

// 建模两个向量的和
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

<center>
<img src="images/semigroupVector.png" width="300" alt="SemigroupVector" />
</center>

样板太多？好消息是，半群背后的**数学理论**告诉我们，如果我们可以为`Vector`这样的复杂类型的每个字段实现一个半群实例，我们就可以为它本身实现一个半群实例。

`fp-ts/Semigroup`模块导出了一个非常便利的`struct` combinator:

```ts
import { struct } from 'fp-ts/Semigroup';

// 建模两个向量的和
const SemigroupVector: Semigroup<Vector> = struct({
  x: N.SemigroupSum,
  y: N.SemigroupSum,
});
```

**注**：还有一个类似于`struct`的combinator可以用于元祖：`tuple`

```ts
import * as N from 'fp-ts/number';
import { Semigroup, tuple } from 'fp-ts/Semigroup';

// 建模一个从原点开始的向量
type Vector = readonly [number, number];

// 建模两个向量的和
const SemigroupVector: Semigroup<Vector> = tuple(
  N.SemigroupSum,
  N.SemigroupSum,
);

const v1: Vector = [1, 1];
const v2: Vector = [1, 2];

console.log(SemigroupVector.concat(v1, v2)); // => [2, 3]
```

**测验**：给定任意`Semigroup<A>`并从`A`中任意选择一个元素`middle`，如果将其插入`concat`的两个参数之间，结果是否仍然是半群？

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

### 找到任意类型的半群实例

结合律是一个非常严格的限制，如果给定一个特定类型`A`且无法在`A`上找到满足结合律的运算会发生什么？

假设我们有如下的类型定义：

```ts
type User = {
  readonly id: number;
  readonly name: string;
};
```

在数据库中，有同一个`user`的多个副本(例如，修改的历史记录)。

```ts
// 内部API
declare const getCurrent: (id: number) => User;
declare const getHistory: (id: number) => ReadonlyArray<User>;
```

我们需要实现一个公共API

```ts
export declare const getUser: (id: number) => User;
```

它根据某些标准考虑其所有的副本。标准应该返回最新的副本，或最旧的副本，或当前副本，等等。

我们当然可以为每一个标准定义一个API：

```ts
export declare const getMostRecentUser: (id: number) => User;
export declare const getLeastRecentUser: (id: number) => User;
export declare const getCurrentUser: (id: number) => User;
// etc...
```

要返回`User`类型的值，我们需要考虑所有副本并对它们进行**合并**(或**选择**)。这意味着我可以使用`Semigroup<User>`对这个问题进行建模。

话虽如此，但现在还不清楚什么叫做"合并两个`user`"，也不清楚这个合并操作是否满足结合律。

通过为`NonEmptyArray<A>`而不是`A`本身定义半群实例，我们**总是**可以为任意给定的类型`A`定义一个半群实例。这个半群被称作`A`上的**自由半群(free semigroup)**:

```ts
import { Semigroup } from 'fp-ts/Semigroup';

// 代表非空数组，意味着数组中至少有一个A类型的元素
type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & {
  readonly 0: A;
};

// 两个非空数组的串联仍然是非空数组
const getSemigroup = <A,>(): Semigroup<ReadonlyNonEmptyArray<A>> => ({
  concat: (first, second) => [first[0], ...first.slice(1), ...second],
});
```

接下来，我们可以将`A`类型的元素映射到`ReadonlyNonEmptyArray<A>`的"单例"上，意为只有一个元素的数组。

```ts
// 向非空数组中插入一个元素
const of = <A,>(a: A): ReadonlyNonEmptyArray<A> => [a];
```

让我们把这个技术应用在`User`类型上:

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

// 这个半群定义是对`ReadonlyNonEmptyArray<User>`而不是`User`的
const S: Semigroup<ReadonlyNonEmptyArray<User>> = getSemigroup<User>();

declare const user1: User;
declare const user2: User;
declare const user3: User;

// const merge: ReadonlyNonEmptyArray<User>
const merge = S.concat(S.concat(of(user1), of(user2)), of(user3));

// 通过手动将所有的user装进数组中也可以获得相同的结果
const merge2: ReadonlyNonEmptyArray<User> = [user1, user2, user3];
```

可以看到，`A`上的自由半群仍然是一个半群，其中的元素都是`A`的可能，非空，有限序列。

`A`上的自由半群可以被视为一种连接`A`类型元素的"懒惰"的方式，同时保留了其数据内容。

包含`[user1, user2, user3]`的`merge`, 告诉我们要连接的元素以及它们的顺序。

现在，有三种方式去设计`getUser` API:

1. 可以定义`Semigroup<User>`，并且想要直接进行`合并(merge)`。

   ```ts
   declare const SemigroupUser: Semigroup<User>;

   export const getUser = (id: number): User => {
     const current = getCurrent(id);
     const history = getHistory(id);
     return concatAll(SemigroupUser)(current)(history);
   };
   ```

2. 无法定义`Semigroup<User>`，或者想开放将合并策略的实现，因此需要向API的使用者询问:

   ```ts
   export const getUser =
     (SemigroupUser: Semigroup<User>) =>
     (id: number): User => {
       const current = getCurrent(id);
       const history = getHistory(id);
       // 立即合并
       return concatAll(SemigroupUser)(current)(history);
     };
   ```

3. 无法定义`Semigroup<User>`，并且也不想向用户需求它。

   这种情况下，`User`的自由半群可以排上用场：

   ```ts
   export const getUser = (id: number): ReadonlyNonEmptyArray<User> => {
     const current = getCurrent(id);
     const history = getHistory(id);
     // 不继续合并，直接返回user的自由半群
     return [current, ...history];
   };
   ```

应该注意的是，即使确实有一个`Semigroup<A>`实例，使用自由半群可能仍然很方便，原因如下：

- 避免执行可能昂贵且无意义的计算
- 避免传递半群实例
- 允许 API 使用者决定哪个是正确的合并策略（通过使用`concatAll`）。

### 由排序导出的半群(Order-derivable Semigroups)

由于`number`是**全序**(意味着对于任意的x，y，一定满足`x <= y`或`x >= y`)，我们可以用`min`或`max`运算来定义另外两个`Semigroup<number>`实例。

```ts
import { Semigroup } from 'fp-ts/Semigroup';

const SemigroupMin: Semigroup<number> = {
  concat: (first, second) => Math.min(first, second),
};

const SemigroupMax: Semigroup<number> = {
  concat: (first, second) => Math.max(first, second),
};
```

**测验**：为什么`number`是全序这个前提非常重要？

为与`number`不同的类型定义这样的半群(`SemigroupMin`与`SemigroupMax`)将非常有用。

是否有可能表现其他类型的 _全序_ 的概念？在讨论 _排序_ 之前，首先我们需要先讨论 _相等_ 的概念。

## 用`eq`建模等价(Modelling equivalence with `Eq`)

我们仍让可以用TypeScript的接口对等价建模。

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

> [答案](src/quiz-answers/javascript-includes.md)

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

### 使用`Ord`建模排序关系(Modeling ordering relations with `Ord`)

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

### 对偶排序(Dual Ordering)

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

[`02_ord.ts`](src/02_ord.ts)

## 用幺半群建模组合(Modeling composition through Monoids)

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

因为对于一个幺半群来说单位元，因此当找到一个单位元后便不必再继续寻找。

每个幺半群都是半群，反之则不成立。

<center>
<img src="images/monoid.png" width="300" alt="Magma vs Semigroup vs Monoid" />
</center>

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

### `concatAll` 函数

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

### 乘积幺半群(Product monoid)

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

**注**：有一个类似于`struct`的combinator可以与元祖一起使用：`tuple`.

```ts
import { Monoid, tuple } from 'fp-ts/Monoid';
import * as N from 'fp-ts/number';

type Point = readonly [number, number];

const Monoid: Monoid<Point> = tuple(N.MonoidSum, N.MonoidSum);
```

**测验**：是否可以为泛型`A`定义一个"自由幺半群"?

**Demo** (实现一个在画布上绘制几何形状的系统)

[`03_shapes.ts`](src/03_shapes.ts)

## 纯函数与偏函数(Pure and partial functions)

在第一章中，我们看到了纯函数的非正式定义：

> 纯函数是一个过程，给定相同的输入总是返回相同的输出，没有任何可观察到的副作用。

这种非正式的定义可能会带来一些疑问，例如：

- 什么是副作用？
- 什么是可观察到的？
- 什么叫相同？

让我们看看函数概念的正式定义。

**注**：如果`X`与`Y`是集合，则用`X × Y`表示他们的笛卡尔积，即集合。

```plaintext
X × Y = { (x, y) | x ∈ X, y ∈ Y }
```

一个世纪前人们给出了下面的[定义](https://en.wikipedia.org/wiki/History_of_the_function_concept)：

**定义**：_函数_ `f: X ⟶ Y`是`X × Y`的子集，使得对于每个`x ∈ X`，总是只存在一个`y ∈ Y`，使得`(x, y) ∈ f`.

集合`X`称为`f`的 _定义域(Domain)_，`Y`称为 _到达域(Codomain)_.

**例**：

函数`double: Nat ⟶ Nat`，其中`Nat`是自然数，是由`{ (1, 2), (2, 4), (3, 6), ...}`给出的笛卡尔积`Nat × Nat`的子集。

在TypeScript中我们可以这样定义`f`：

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
注意，在定义函数时，必须静态地描述集合`f`（这意味着该集合的元素不能无缘无故地随时间变化）。
通过这种方式，我们可以排除任何形式的副作用，并且返回值始终相同。
-->

示例中的定义称为函数的外延定义，这意味着我们一一枚举其定义域上中的每个元素，并对每个元素指定其相应的到达域中的元素。

当集合是无限的时候，这是不可行的。因为我们无法列出所有函数的定义域与到达域。

我们可以通过引入内涵定义来解决这个问题。这意味着我们表达了一个条件，该条件必须适用于每一对`(x, y) ∈ f`，即`y = x * 2`.

这与我们在TypeScript重定义的`double`函数非常类似。

```ts
const double = (x: number): number => x * 2;
```

将函数定义为笛卡尔积的子集表明了数学中每个函数都是纯粹的：没有动作，没有状态突变或元素被修改。
在函数式编程中，函数的实现必须尽可能遵循这个理想模型。

**测验**：以下哪些过程是纯函数？

```ts
const coefficient1 = 2;
export const f1 = (n: number) => n * coefficient1;

// ------------------------------------------------------

let coefficient2 = 2;
export const f2 = (n: number) => n * coefficient2++;

// ------------------------------------------------------

let coefficient3 = 2;
export const f3 = (n: number) => n * coefficient3;

// ------------------------------------------------------

export const f4 = (n: number) => {
  const out = n * 2;
  console.log(out);
  return out;
};

// ------------------------------------------------------

interface User {
  readonly id: number;
  readonly name: string;
}

export declare const f5: (id: number) => Promise<User>;

// ------------------------------------------------------

import * as fs from 'fs';

export const f6 = (path: string): string =>
  fs.readFileSync(path, { encoding: 'utf8' });

// ------------------------------------------------------

export const f7 = (
  path: string,
  callback: (err: Error | null, data: string) => void,
): void => fs.readFile(path, { encoding: 'utf8' }, callback);
```

函数是纯函数的事实并不意味着禁止局部可变性，只要它不泄漏到其范围之外即可。

![mutable / immutable](images/mutable-immutable.jpg)

**例** (幺半群的`concatAll`函数的实现细节)

```ts
import { Monoid } from 'fp-ts/Monoid';

const concatAll =
  <A,>(M: Monoid<A>) =>
  (as: ReadonlyArray<A>): A => {
    let out: A = M.empty; // <= 局部可变
    for (const a of as) {
      out = M.concat(out, a);
    }
    return out;
  };
```

最终目标是保证**引用透明**。

我们与API使用者的约定由函数签名定义。

```ts
declare const concatAll: <A>(M: Monoid<A>) => (as: ReadonlyArray<A>) => A;
```

而且从尊重引用透明性的承诺来看，该功能的具体实现的技术细节并不重要，也不受审查，因此有最大的自由度。

那么，我们如何定义“副作用”呢？只需要通过否定引用透明​​：

> 如果表达式不具有引用透明性，则它包含“副作用”。

函数不仅是引用透明性的完美实例，也是**组合**的完美实例

函数组合：

**定义**：给定`f: Y ⟶ Z`与`g: X ⟶ Y` 两个函数，则函数`h: X ⟶ Z`定义为:

```plaintext
h(x) = f(g(x))
```

称为`f`与`g`的组合，写作`h = f ∘ g`

注意，为了组合`f`和`g`，`f`的定义域必须与`g`的到达域一致。

**定义**：偏函数是没有为定义域中所有值定义的函数。

相反，为定义域中所有制定义了的函数称为全函数。

**例**：

```plaintext
f(x) = 1 / x
```

函数`f: number ⟶ number`在`x = 0`时没有定义.

**例**：

```ts
// Get the first element of a `ReadonlyArray`
declare const head: <A>(as: ReadonlyArray<A>) => A;
```

**测验**：为什么`head`函数是偏函数？

**测验**：`JSON.parse`是全函数吗？

```ts
parse: (text: string, reviver?: (this: any, key: string, value: any) => any) =>
  any;
```

**测验**：`JSON.stringify`是全函数吗？

```ts
stringify: (
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number,
) => string;
```

在函数领域中，我们倾向于只定义**纯函数和全函数**（从现在开始，“函数”将专指“纯函数和全函数”），当我们碰到偏函数时，我们应该怎么办？

偏函数`f: X ⟶ Y`总是可以通过向到达域添加一个不属于`Y`的特殊值(我们称之为`None`)，并将其与未定义`f`的`X`的每个值相关联，来“恢复”为全函数。

```plaintext
f': X ⟶ Y ∪ None
```

让我们称`Option(Y) = Y ∪ None`.

```plaintext
f': X ⟶ Option(Y)
```

是否可以在TypeScript中定义`Option`？在接下来的章节中，我们将了解如何做到这一点。

## 代数数据类型(Algebraic Data Types)

构建新应用程序的第一步是定义其领域模型(domain model)。TypeScript提供了许多工具来完成这件事。**代数数据类型**是其中之一。

<!--
  还有什么其他的工具？
-->

### 什么是ADT？

> 在计算机编程中，尤其是函数式编程和类型论中，代数数据类型是一种复合类型，即**由其他类型组合而成的类型**。

两个常见的代数数据类型系列是：

- **积类型(product type)**
- **和类型(sum product)**

<center>
<img src="images/adt.png" width="400" alt="ADT" />
</center>

让我们从更熟悉的那个开始：积类型。

### 积类型(Product types)

积类型是由集合`I`索引的类型 T<sub>i</sub> 的集合。

该系列的两个成员分别是n元组，其中`I`是自然数：

```ts
type Tuple1 = [string]; // I = [0]
type Tuple2 = [string, number]; // I = [0, 1]
type Tuple3 = [string, number, boolean]; // I = [0, 1, 2]

// Accessing by index
type Fst = Tuple2[0]; // string
type Snd = Tuple2[1]; // number
```

和结构体(struct)，其中`I`是一组标签(label)：

```ts
// I = {"name", "age"}
interface Person {
  name: string;
  age: number;
}

// 使用label访问
type Name = Person['name']; // string
type Age = Person['age']; // number
```

积类型可以是 **多态的(polimorphic)**。

**例**：

```ts
//                ↓ 类型参数
type HttpResponse<A> = {
  readonly code: number;
  readonly body: A;
};
```

#### 为什么叫积类型？

如果我们用`C(A)`标记`A`类型的元素数量（在数学中也称为**基数(cardinality)**），则以下等式成立：

```ts
C([A, B]) = C(A) * C(B);
```

> 乘积的基数是基数的乘积。

**例**：

`null` 类型的基数为1，因为它只有一个成员：`null`。

**例**：

`boolean`类型的基数为2是多少，因为它有两个成员：`true`和`false`。

**例**：

```ts
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type Period = 'AM' | 'PM';
type Clock = [Hour, Period];
```

`Hour`有12个成员。`Period`有2个成员。所以`Clock`有`12 * 2 = 24`元素。

**测验**：`Clock`的基数是多少？

```ts
// 与之前相同
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
// 与之前相同
type Period = 'AM' | 'PM';

// 不再是元组
type Clock = {
  readonly hour: Hour;
  readonly period: Period;
};
```

#### 什么时候可以使用积类型

每当它的 _组件_ 是 **相互独立** 的时候。

```ts
type Clock = [Hour, Period];
```

这里`Hour`和`Period`是独立的，即`Hour`的值不影响`Period`的值，反之亦然。每对`[Hour, period]`都是合法且有意义的。

### 和类型(Sum types)

和类型是一种数据结构，其中可以保存不同（但固定）类型的值。在单个实例中只能使用其中一种类型，并且通常有一个“标记值”来区分这些类型。

在TypeScript'的官方文档中它们被称作[可辨识联合(discriminated union)](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions).

需要注意的是，联合的成员必须**不相交(disjoint)**，不能有属于多个成员的值。
**注**：可辨识联合(discriminated union)，联合类型(union type)，不相交并集(disjoint union)在本节中是同义的。

**例**：

```ts
type StringsOrNumbers = ReadonlyArray<string> | ReadonlyArray<number>;
```

不是不相交并集，因为`[]`同时属于两个成员。

**测验**：下面的集合是不相交的吗？

```ts
type Member1 = { readonly a: string };
type Member2 = { readonly b: number };
type MyUnion = Member1 | Member2;
```

在函数式编程中，我们倾向于尽可能地使用不相交并集。

幸运的是，在TypeScript中，有一种安全的方法可以确保集合是不相交的：添加一个特殊的`tag`字段。

**例** ([redux actions](https://redux.js.org/introduction/getting-started#basic-example))：

联合类型`Action`对[todo app](https://todomvc.com/)中的部分操作进行了建模。

```ts
type Action =
  | {
      type: 'ADD_TODO';
      text: string;
    }
  | {
      type: 'UPDATE_TODO';
      id: number;
      text: string;
      completed: boolean;
    }
  | {
      type: 'DELETE_TODO';
      id: number;
    };
```

`type`标签确保联合类型中的每个类型是不相交的。

充当标签的字段由开发人员自行决定，不需要一定是`type`（例如，在 fp-ts 中，按照惯例使用名称`_tag`）。

现在我们已经看到了一些例子，我们可以更明确地定义代数数据类型：

> 一般来说，代数数据类型指定一个或多个选项的和，其中每个选项是零或多个字段的乘积。

和类型可以是**多态的**和**递归的**。

**例** (链表)

```ts
//               ↓ 类型参数
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> };
//                                                              ↑ 递归
```

**测验** (TypeScript)：判断下列数据类型是和类型还是积类型。

- `ReadonlyArray<A>`
- `Record<string, A>`
- `Record<'k1' | 'k2', A>`
- `ReadonlyMap<string, A>`
- `ReadonlyMap<'k1' | 'k2', A>`

#### 构造函数

具有n个元素的和类型至少需要n个**构造函数**，每个成员各一个：
A sum type with `n` elements needs at least `n` **constructors**, one for each member:

**例** (redux action)

```ts
export type Action =
  | {
      readonly type: 'ADD_TODO';
      readonly text: string;
    }
  | {
      readonly type: 'UPDATE_TODO';
      readonly id: number;
      readonly text: string;
      readonly completed: boolean;
    }
  | {
      readonly type: 'DELETE_TODO';
      readonly id: number;
    };

export const add = (text: string): Action => ({
  type: 'ADD_TODO',
  text,
});

export const update = (
  id: number,
  text: string,
  completed: boolean,
): Action => ({
  type: 'UPDATE_TODO',
  id,
  text,
  completed,
});

export const del = (id: number): Action => ({
  type: 'DELETE_TODO',
  id,
});
```

**例** (TypeScript，链表)

```ts
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> };

// a nullary constructor can be implemented as a constant
export const nil: List<never> = { _tag: 'Nil' };

export const cons = <A,>(head: A, tail: List<A>): List<A> => ({
  _tag: 'Cons',
  head,
  tail,
});

// equivalent to an array containing [1, 2, 3]
const myList = cons(1, cons(2, cons(3, nil)));
```

#### 模式匹配(Pattern matching)

JavaScript不支持[模式匹配](https://github.com/tc39/proposal-pattern-matching) (TypeScript也不支持)。但我们可以使用`match`函数来模拟它。

**例** (TypeScript，链表)

```ts
interface Nil {
  readonly _tag: 'Nil';
}

interface Cons<A> {
  readonly _tag: 'Cons';
  readonly head: A;
  readonly tail: List<A>;
}

export type List<A> = Nil | Cons<A>;

export const match =
  <R, A>(onNil: () => R, onCons: (head: A, tail: List<A>) => R) =>
  (fa: List<A>): R => {
    switch (fa._tag) {
      case 'Nil':
        return onNil();
      case 'Cons':
        return onCons(fa.head, fa.tail);
    }
  };

// 如果链表为空则返回`true`
export const isEmpty = match(
  () => true,
  () => false,
);

// 返回链表的第一个元素或`undefined`
export const head = match(
  () => undefined,
  (head, _tail) => head,
);

// 递归地返回链表的长度
export const length: <A>(fa: List<A>) => number = match(
  () => 0,
  (_, tail) => 1 + length(tail),
);
```

**测验**：为什么`head` API 不是最优的？

> [答案](src/quiz-answers/pattern-matching.md)

**注**：TypeScript为和类型提供了一个很棒的功能：**[详尽性检查(exhaustive check)](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking)**。类型检查器可以 _检查_ 是否所有可能的情况都由函数体中定义的`switch`处理了。

#### 为什么叫和类型？

因为以下恒等式成立：

```ts
C(A | B) = C(A) + C(B);
```

> 和的基数是基数的和

**例** (`Option`类型)

```ts
interface None {
  readonly _tag: 'None';
}

interface Some<A> {
  readonly _tag: 'Some';
  readonly value: A;
}

type Option<A> = None | Some<A>;
```

从通用公式`C(Option<A>) = 1 + C(A)`我们可以导出`Option<boolean>`类型的基数：`1 + 2 = 3`。

#### 什么时候该使用和类型

当用积类型实现时，组件会**互相依赖**时。

**例** (`React` props)

```tsx
import * as React from 'react';

interface Props {
  readonly editable: boolean;
  readonly onChange?: (text: string) => void;
}

class Textbox extends React.Component<Props> {
  render() {
    if (this.props.editable) {
      // error: Cannot invoke an object which is possibly 'undefined' :(
      this.props.onChange('a');
    }
    return <div />;
  }
}
```

这里的问题是`Props`被建模为一个积，但`onChange`**依赖**`editable`

和类型更适合这种场景：

```ts
import * as React from 'react';

type Props =
  | {
      readonly type: 'READONLY';
    }
  | {
      readonly type: 'EDITABLE';
      readonly onChange: (text: string) => void;
    };

class Textbox extends React.Component<Props> {
  render() {
    switch (this.props.type) {
      case 'EDITABLE':
        this.props.onChange('a'); // :)
    }
    return <div />;
  }
}
```

**例** (node callbacks)

```ts
declare function readFile(
  path: string,
  //         ↓ ---------- ↓ CallbackArgs
  callback: (err?: Error, data?: string) => void,
): void;
```

`readFile`的结果被建模为积类型（准确地地说是一个元组），稍后传递给`callback`：

```ts
type CallbackArgs = [Error | undefined, string | undefined];
```

但是回调的组件(指参数)是互相依赖的：我们**要么**得到一个`Error`**要么**得到一个`string`:

| err         | data        | 合法性 |
| ----------- | ----------- | ------ |
| `Error`     | `undefined` | ✓      |
| `undefined` | `string`    | ✓      |
| `Error`     | `string`    | ✘      |
| `undefined` | `undefined` | ✘      |

这个API显然不是基于以下前提建模的：
This API is clearly not modeled on the following premise:

> 使不可能的状态无法表示

和类型会是更好的选择，但是应该选择哪个呢？让我们看看如何以函数式的方式处理错误。

**测验**：最近，返回`Promise`的API比回调 API 更受欢迎。

```ts
declare function readFile(path: string): Promise<string>;
```

当使用像 TypeScript 这样的静态类型语言时，你能发现`Promise`的一些缺点吗？

### 函数式风格的错误处理(Functional error handling)

让我们看看如何以函数式方式处理错误。

返回错误或引发异常的函数就是部分函数的示例。

在纯函数和偏函数一章中，我们看到每个偏函数`f`总是可以转化为全函数`f'`

```plaintext
f': X ⟶ Option(Y)
```

现在我们对TypeScript中的联合类型有了更多的了解，我们可以毫无问题地定义`Option`。

#### `Option`类型

`Option<A>`类型代表计算的效果(返回值)，该计算可能失败（`None`）或返回类型为`A`的值（`Some<A>`）：

```ts
// 代表失败
interface None {
  readonly _tag: 'None';
}

// 代表成功
interface Some<A> {
  readonly _tag: 'Some';
  readonly value: A;
}

type Option<A> = None | Some<A>;
```

构造函数与模式匹配：

```ts
const none: Option<never> = { _tag: 'None' };

const some = <A,>(value: A): Option<A> => ({ _tag: 'Some', value });

const match =
  <R, A>(onNone: () => R, onSome: (a: A) => R) =>
  (fa: Option<A>): R => {
    switch (fa._tag) {
      case 'None':
        return onNone();
      case 'Some':
        return onSome(fa.value);
    }
  };
```

`Option`类型可用于避免抛出异常或表示可选值，因此我们可以从以下：

```ts
// 类型系统不知道该计算可能会失败
//                                       ↓ 这是一个谎言
const head = <A,>(as: ReadonlyArray<A>): A => {
  if (as.length === 0) {
    throw new Error('Empty array');
  }
  return as[0];
};

let s: string;
try {
  s = String(head([]));
} catch (e) {
  s = e.message;
}
```

改为：

```ts
import { pipe } from 'fp-ts/function';

//                                      ↓ 类型系统现在知道这个计算可能会失败
const head = <A,>(as: ReadonlyArray<A>): Option<A> =>
  as.length === 0 ? none : some(as[0]);

declare const numbers: ReadonlyArray<number>;

const result = pipe(
  head(numbers),
  match(
    () => 'Empty array',
    (n) => String(n),
  ),
);
```

上述代码，**错误的可能性被编码进了类型系统中**。

如果我们在不进行任何检查的情况下尝试访问`Option`的`value`，类型系统将警告我们可能会出现错误：

```ts
declare const numbers: ReadonlyArray<number>;

const result = head(numbers);
result.value; // type checker error: Property 'value' does not exist on type 'Option<number>'
```

访问`Option`中包含的值的唯一方法是使用`match`函数处理失败的情况。

```ts
pipe(result, match(
  () => /** 错误处理 */
  (n) => /** 编写业务逻辑 */
))
```

能否为之前章节中看到的抽象定义`Option`实例？让我们从`Eq`开始。

##### `Eq`实例

假设我们有两个`Option<string>`类型的值，并且我们想要比较它们以检查它们是否相等：

```ts
import { pipe } from 'fp-ts/function';
import { match, Option } from 'fp-ts/Option';

declare const o1: Option<string>;
declare const o2: Option<string>;

const result: boolean = pipe(
  o1,
  match(
    // onNone o1
    () =>
      pipe(
        o2,
        match(
          // onNone o2
          () => true,
          // onSome o2
          () => false,
        ),
      ),
    // onSome o1
    (s1) =>
      pipe(
        o2,
        match(
          // onNone o2
          () => false,
          // onSome o2
          (s2) => s1 === s2, // 字符串相等
        ),
      ),
  ),
);
```

如果我们有两个`Option<number>`类型的值怎么办？再写一遍相同代码会非常烦人，毕竟唯一的区别是我们如何比较`Option`中包含的两个值。

因此，我们可以通过要求用户为`A`提供`Eq`实例来概括必要的代码，然后为`Option<A>`派生一个`Eq`实例。

换句话说，我们可以定义一个 **combinator** `getEq`：给定一个`Eq<A>`这个combinator返回一个`Eq<Option<A>>`：

```ts
import { Eq } from 'fp-ts/Eq';
import { pipe } from 'fp-ts/function';
import { match, Option, none, some } from 'fp-ts/Option';

export const getEq = <A,>(E: Eq<A>): Eq<Option<A>> => ({
  equals: (first, second) =>
    pipe(
      first,
      match(
        () =>
          pipe(
            second,
            match(
              () => true,
              () => false,
            ),
          ),
        (a1) =>
          pipe(
            second,
            match(
              () => false,
              (a2) => E.equals(a1, a2), // `Eq<A>`的相等性检查
            ),
          ),
      ),
    ),
});

import * as S from 'fp-ts/string';

const EqOptionString = getEq(S.Eq);

console.log(EqOptionString.equals(none, none)); // => true
console.log(EqOptionString.equals(none, some('b'))); // => false
console.log(EqOptionString.equals(some('a'), none)); // => false
console.log(EqOptionString.equals(some('a'), some('b'))); // => false
console.log(EqOptionString.equals(some('a'), some('a'))); // => true
```

为`Option<A>`定义`Eq`实例的好处是，能够使用我们之前见过的所有的`Eq`的 combinator。

以下是如何为`Option<readonly [string, number]>`定义`Eq`实例：

```ts
import { tuple } from 'fp-ts/Eq';
import * as N from 'fp-ts/number';
import { getEq, Option, some } from 'fp-ts/Option';
import * as S from 'fp-ts/string';

type MyTuple = readonly [string, number];

const EqMyTuple = tuple<MyTuple>(S.Eq, N.Eq);

const EqOptionMyTuple = getEq(EqMyTuple);

const o1: Option<MyTuple> = some(['a', 1]);
const o2: Option<MyTuple> = some(['a', 2]);
const o3: Option<MyTuple> = some(['b', 1]);

console.log(EqOptionMyTuple.equals(o1, o1)); // => true
console.log(EqOptionMyTuple.equals(o1, o2)); // => false
console.log(EqOptionMyTuple.equals(o1, o3)); // => false
```

如果稍微修改一下导入，我们可以获得`Ord`的类似结果：

```ts
import * as N from 'fp-ts/number';
import { getOrd, Option, some } from 'fp-ts/Option';
import { tuple } from 'fp-ts/Ord';
import * as S from 'fp-ts/string';

type MyTuple = readonly [string, number];

const OrdMyTuple = tuple<MyTuple>(S.Ord, N.Ord);

const OrdOptionMyTuple = getOrd(OrdMyTuple);

const o1: Option<MyTuple> = some(['a', 1]);
const o2: Option<MyTuple> = some(['a', 2]);
const o3: Option<MyTuple> = some(['b', 1]);

console.log(OrdOptionMyTuple.compare(o1, o1)); // => 0
console.log(OrdOptionMyTuple.compare(o1, o2)); // => -1
console.log(OrdOptionMyTuple.compare(o1, o3)); // => -1
```

##### `Semigroup`与`Monoid`实例

现在，假设我们想要“合并”两个不同的`Option<A>`：有四种不同的情况：

| x       | y       | concat(x, y) |
| ------- | ------- | ------------ |
| none    | none    | none         |
| some(a) | none    | none         |
| none    | some(a) | none         |
| some(a) | some(b) | ?            |

最后一种情况有一个问题，我们需要一个方法来“合并”两个不同的`A`。

如果我们有这样的方法就好了...这不正是我们的老朋友`Semigroup`的工作吗！？

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

我们需要做的就是要求用户为`A`提供一个`Semigroup`实例，然后为`Option<A>`派生一个`Semigroup`实例。

```ts
// 实现留给读者作为练习
declare const getApplySemigroup: <A>(S: Semigroup<A>) => Semigroup<Option<A>>;
```

**测验**：是否可以在上面的半群中添加一个单位元使其成为幺半群？

```ts
// 实现留给读者作为练习
declare const getApplicativeMonoid: <A>(M: Monoid<A>) => Monoid<Option<A>>;
```

可以为`Option<A>`定义一个幺半群实例，其行为如下：

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| none     | none     | none                   |
| some(a1) | none     | some(a1)               |
| none     | some(a2) | some(a2)               |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

```ts
// 实现留给读者作为练习
declare const getMonoid: <A>(S: Semigroup<A>) => Monoid<Option<A>>;
```

**测验**：幺半群的`empty`是什么？

> [答案](src/quiz-answers/option-semigroup-monoid-second.md)

**例**：

利用`getMonoid`我们可以派生出另外两个有用的幺半群:

(返回最左边的非`None`值)

| x        | y        | concat(x, y) |
| -------- | -------- | ------------ |
| none     | none     | none         |
| some(a1) | none     | some(a1)     |
| none     | some(a2) | some(a2)     |
| some(a1) | some(a2) | some(a1)     |

```ts
import { Monoid } from 'fp-ts/Monoid';
import { getMonoid, Option } from 'fp-ts/Option';
import { first } from 'fp-ts/Semigroup';

export const getFirstMonoid = <A = never,>(): Monoid<Option<A>> =>
  getMonoid(first());
```

和它的对偶:

(返回最右边的非`None`值)

| x        | y        | concat(x, y) |
| -------- | -------- | ------------ |
| none     | none     | none         |
| some(a1) | none     | some(a1)     |
| none     | some(a2) | some(a2)     |
| some(a1) | some(a2) | some(a2)     |

```ts
import { Monoid } from 'fp-ts/Monoid';
import { getMonoid, Option } from 'fp-ts/Option';
import { last } from 'fp-ts/Semigroup';

export const getLastMonoid = <A = never,>(): Monoid<Option<A>> =>
  getMonoid(last());
```

**例**：

在管理可选值时`getLastMonoid`非常有用。让我们看一个示例，我们想要派生文本编辑器（在本例中为 VSCode）的用户设置。

```ts
import { Monoid, struct } from 'fp-ts/Monoid';
import { getMonoid, none, Option, some } from 'fp-ts/Option';
import { last } from 'fp-ts/Semigroup';

/** VSCode settings */
interface Settings {
  /** 控制 font family */
  readonly fontFamily: Option<string>;
  /** 控制 font size */
  readonly fontSize: Option<number>;
  /** 限制渲染minimap时使用的列数 */
  readonly maxColumn: Option<number>;
}

const monoidSettings: Monoid<Settings> = struct({
  fontFamily: getMonoid(last()),
  fontSize: getMonoid(last()),
  maxColumn: getMonoid(last()),
});

const workspaceSettings: Settings = {
  fontFamily: some('Courier'),
  fontSize: none,
  maxColumn: some(80),
};

const userSettings: Settings = {
  fontFamily: some('Fira Code'),
  fontSize: some(12),
  maxColumn: none,
};

/** userSettings 覆盖 workspaceSettings */
console.log(monoidSettings.concat(workspaceSettings, userSettings));
/*
{ fontFamily: some("Fira Code"),
  fontSize: some(12),
  maxColumn: some(80) }
*/
```

**测验**：假设VSCode每行无法管理超过“80”列，我们如何修改“monoidSettings”的定义以考虑到这一点？

#### `Either`类型

`Either`的常见用途是作为`Option`的替代方案来处理可能失败的计算的影响，同时能够指定失败的原因。

在此用法中，`None`被`Left`替代，其中包含有关错误的有用信息。`Right`代替`Some`。

```ts
// 代表失败
interface Left<E> {
  readonly _tag: 'Left';
  readonly left: E;
}

// 代表成功
interface Right<A> {
  readonly _tag: 'Right';
  readonly right: A;
}

type Either<E, A> = Left<E> | Right<A>;
```

构造函数与模式匹配：

```ts
const left = <E, A>(left: E): Either<E, A> => ({ _tag: 'Left', left });

const right = <A, E>(right: A): Either<E, A> => ({ _tag: 'Right', right });

const match =
  <E, R, A>(onLeft: (left: E) => R, onRight: (right: A) => R) =>
  (fa: Either<E, A>): R => {
    switch (fa._tag) {
      case 'Left':
        return onLeft(fa.left);
      case 'Right':
        return onRight(fa.right);
    }
  };
```

回到之前的回调的例子：

```ts
declare function readFile(
  path: string,
  callback: (err?: Error, data?: string) => void,
): void;

readFile('./myfile', (err, data) => {
  let message: string;
  if (err !== undefined) {
    message = `Error: ${err.message}`;
  } else if (data !== undefined) {
    message = `Data: ${data.trim()}`;
  } else {
    // 理论上永远不会发生
    message = 'The impossible happened';
  }
  console.log(message);
});
```

我们可以修改它的签名为：

```ts
declare function readFile(
  path: string,
  callback: (result: Either<Error, string>) => void,
): void;
```

然后这么使用这个API：

```ts
readFile('./myfile', (e) =>
  pipe(
    e,
    match(
      (err) => `Error: ${err.message}`,
      (data) => `Data: ${data.trim()}`,
    ),
    console.log,
  ),
);
```

## 范畴论(Category theory)

我们已经看到，函数式编程的基石是**组合**。

> 我们如何解决问题？我们将更大的问题分解为更小的问题。如果较小的问题仍然太大，我们会进一步分解它们，依此类推。最后，我们编写解决所有小问题的代码。然后是编程的本质：我们编写这些代码片段来创建更大问题的解决方案。如果我们无法将碎片重新组合在一起，那么分解就没有意义。- Bartosz Milewski

但这到底意味着什么？我们如何判断两个事物是否可以 _组合_？我们怎么判断两个事物是否组合得 _很好_ 呢？

> 如果我们可以轻松且普遍地以某种方式组合实体的行为，而无需修改所组合的实体，则实体是可组合的。我认为可组合性是实现重用以及实现编程模型中可简洁表达的组合扩展所必需的关键要素。- Paul Chiusano

在第一章中我们了解到，函数式程序往往被编写为管道：

```ts
const program = pipe(
  input,
  f1, // 纯函数
  f2, // 纯函数
  f3, // 纯函数
  ...
)
```

但要坚持这种风格谈何容易呢？这真的可行吗？咱们试试吧：

```ts
import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';

const double = (n: number): number => n * 2;

/**
 * 给定一个ReadonlyArray<number>，把它的第一个元素*2然后返回
 */
const program = (input: ReadonlyArray<number>): number =>
  pipe(
    input,
    RA.head, // 编译错误！`Option<number>`不可分配给类型`number`
    double,
  );
```

为什么会编译报错？因为`head`和`double`不能组合。

```ts
head: (as: ReadonlyArray<number>) => Option<number>;
double: (n: number) => number;
```

`head`的到达域与`double`的定义域不一致。

那该怎么办呢？放弃？

应该参考一个**严谨的理论**来回答这些基本问题。我们需要对组合概念进行**正式定义**。

幸运的是，70 多年来，属于人类历史上运行时间最长、规模最庞大的开源项目（数学）的一大批学者一直致力于开发一种针对可组合性的理论：**范畴论**，这是数学的一个分支，由Saunders Mac Lane与Samuel Eilenberg一起创立(1945)。

<center>
<img src="images/maclane.jpg" width="300" alt="Saunders Mac Lane" />

(Saunders Mac Lane)

<img src="images/eilenberg.jpg" width="300" alt="Samuel Eilenberg" />

(Samuel Eilenberg)

</center>

我们将在接下来的章节看到，范畴如何构成了以下内容的基础：

- 通用**编程语言**的模型
- **组合**概念的模型

### 范畴的定义

范畴的定义虽然并不复杂，但有点长，因此我将其分为两部分：

- 第一个仅仅是技术性的（我们需要定义其组成部分）
- 第二部分包含我们更感兴趣的内容：组合的概念

#### 第一部分（组成）

一个范畴包含两类数学对象，`对象（Objects）`与`态射（Morphisms）`，其中：

- `对象（Objects）`是对象（object）的集合
- `态射（Morphisms）`是对象（object）间的态射（morphisms）（也称箭头）的集合

<img src="images/objects-morphisms.png" width="300" alt="Objects and Morphisms" />

**注**：“对象”一词与OOP无关。可以将对象视为无法检查的黑匣子，或者定义态射的简单占位符。

每个态射`f`都有一个源对象`A`和一个目标对象`B`，其中`A`和`B`都包含在`Objects`中。`f: A ⟼ B`读作“`f`是从`A`到`B`的态射”.

<img src="images/morphism.png" width="300" alt="A morphism" />

**注**：为了简单起见，之后的图中仅使用标签表示对象，省略圆圈。

#### 第二部分（组合）

存在一个称为“组合”的运算`∘`，它具有以下性质：

- （**态射的组合**）只要`f: A ⟼ B`和`g: B ⟼ C`是`Morphisms`中的两个态射，则`Morphisms`中必定存在第三个态射`g ∘ f: A ⟼ C`，称为`f`与`g`的 _组合_。

<img src="images/composition.png" width="300" alt="composition" />

- （**结合律**）如果有`f: A ⟼ B`、`g: B ⟼ C`，`h: C ⟼ D`，则 `h ∘ (g ∘ f) = (h ∘ g) ∘ f`

<img src="images/associativity.png" width="500" alt="associativity" />

- (**单位元**) 对于每个对象`X`，都有一个态射`identity: X ⟼ X`称为`X`的 _单位态射_，使得对每个态射`f: A ⟼ X`，都会有`identity ∘ f = f = f ∘ identity`。

<img src="images/identity.png" width="300" alt="identity" />

**Example**：

<img src="images/category.png" width="300" alt="a simple category" />

这个范畴很简单，只有三个对象和六个态射（idA、idB、idC是A、B、C的单位态射）。

### 用范畴建模编程语言

返程可以被视为**类型化编程语言**的简化模型，其中：

- 对象(object)是**类型**
- 态射(morphism)是**函数**
- `∘`是一般的**函数组合**

如下图：

<img src="images/category.png" width="300" alt="a simple programming language" />

可以被视为一种虚构的（且简单的）编程语言，只有三种类型和六个函数

如:

- `A = string`
- `B = number`
- `C = boolean`
- `f = string => number`
- `g = number => boolean`
- `g ∘ f = string => boolean`

实现可能类似于：

```ts
const idA = (s: string): string => s;

const idB = (n: number): number => n;

const idC = (b: boolean): boolean => b;

const f = (s: string): number => s.length;

const g = (n: number): boolean => n > 2;

// gf = g ∘ f
const gf = (s: string): boolean => g(f(s));
```

### 一个TypeScript的范畴

我们可以定义一个范畴，称之为 _TS_，作为 TypeScript 语言的简化模型，其中：

- **对象**是所有可能的TypeScript类型：`string`、`number`、`ReadonlyArray<string>` 等...
- **态射**是所有的TypeScript函数：`(a: A) => B`、`(b: B) => C`、...其中 `A`、`B`、`C`、. .. 是TypeScript类型
- **单位态射**全部编码在单个多态函数`const Identity = <A>(a: A): A => a` 中
- **态射的组合**是通常的函数组合（我们知道它是满足结合律的）

作为TypeScript的模型，_TS_ 范畴可能看起来有点局限：没有循环，没有`if`，几乎什么都没有。话虽这么说，简化的模型足够丰富，可以帮助我们实现我们的目标：推理明确定义的组合概念。

### 函数组合的核心问题

在 _TS_ 范畴中，只要`C = B`，我们就可以组合两个泛型函数`f: (a: A) => B`和`g: (c: C) => D`。

```ts
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return (a) => g(f(a));
}

function pipe<A, B, C>(a: A, f: (a: A) => B, g: (b: B) => C): C {
  return flow(f, g)(a);
}
```

但是如果`B != C`会发生什么？我们如何组合两个这样的函数？

在接下来的章节中，我们将了解在什么条件下可以进行这种组合。

**剧透**：

- 要组合`f: (a: A) => B`与`g: (b: B) => C`，我们使用常用的函数组合。
- 要组合`f: (a: A) => F<B>`与`g: (b: B) => C`，我们需要`F`的 **函子（functor）** 实例。
- 要组合`f: (a: A) => F<B>` with `g: (b: B, c: C) => D`，我们需要`F`的 **可应用的函子（applicative functor）** 实例。
- 要组合`f: (a: A) => F<B>`与`g: (b: B) => F<C>`，我们需要`F`的 **单子（monad）** 实例。

<img src="images/spoiler.png" width="900" alt="The four composition recipes" />

在本章开头提出的问题对应于第二种情况，其中`F`是`Option`类型：

```ts
// A = ReadonlyArray<number>, B = number, F = Option
head: (as: ReadonlyArray<number>) => Option<number>;
double: (n: number) => number;
```

为了解决这个问题，下一章我们将讨论函子。

# Functors

In the last section we've spoken about the _TS_ category (the TypeScript category) and about function composition's core problem:

> How can we compose two generic functions `f: (a: A) => B` and `g: (c: C) => D`?

Why is finding solutions to this problem so important?

Because, if it is true that categories can be used to model programming languages, morphisms (functions in the _TS_ category) can be used to model **programs**.

Thus, solving this abstract problem means finding a concrete way of **composing programs in a generic way**. And _that_ is really interesting for us developers, isn't it?

## Functions as programs

If we want to model programs with functions we need to tackle an issue immediately:

> How is it possible to model a program that produces side effects with a pure function?

The answer is to model side effects through **effects**, meaning types that **represent** side effects.

Let's see two possible techniques to do so in JavaScript:

- define a DSL (domain specific language) for effects
- use a _thunk_

The first technique, using a DSL, means modifying a program like:

```ts
function log(message: string): void {
  console.log(message); // side effect
}
```

changing its codomain to make the function return a **description** of the side effect:

```ts
type DSL = ... // sum type of every possible effect handled by the system

function log(message: string): DSL {
  return {
    type: "log",
    message
  }
}
```

**Quiz**. Is the freshly defined `log` function really pure? Actually `log('foo') !== log('foo')`!

This technique requires a way to combine effects and the definition of an interpreter able to execute the side effects when launching the final program.

The second technique, way simpler in TypeScript, is to enclose the computation in a _thunk_:

```ts
// a thunk representing a synchronous side effect
type IO<A> = () => A;

const log = (message: string): IO<void> => {
  return () => console.log(message); // returns a thunk
};
```

The `log` program, once executed, won't cause immediately a side effect, but returns **a value representing the computation** (also known as _action_).

```ts
import { IO } from 'fp-ts/IO';

export const log = (message: string): IO<void> => {
  return () => console.log(message); // returns a thunk
};

export const main = log('hello!');
// there's nothing in the output at this point
// because `main` is only an inert value
// representing the computation

main();
// only when launching the program I will see the result
```

In functional programming there's a tendency to shove side effects (under the form of effects) to the border of the system (the `main` function) where they are executed by an interpreter obtaining the following schema:

> system = pure core + imperative shell

In _purely functional_ languages (like Haskell, PureScript or Elm) this division is strict and clear and imposed by the very languages.

Even with this thunk technique (the same technique used in `fp-ts`) we need a way to combine effects, which brings us back to our goal of composing programs in a generic way, let's see how.

We first need a bit of (informal) terminology: we'll call **pure program** a function with the following signature:

```ts
(a: A) => B;
```

Such a signature models a program that takes an input of type `A` and returns a result of type `B` without any effect.

**Example**

The `len` program:

```ts
const len = (s: string): number => s.length;
```

We'll call an **effectful program** a function with the following signature:

```ts
(a: A) => F<B>;
```

Such a signature models a program that takes an input of type `A` and returns a result of type `B` together with an **effect** `F`, where `F` is some sort of type constructor.

Let's recall that a [type constructor](https://en.wikipedia.org/wiki/Type_constructor) is an `n`-ary type operator that takes as argument one or more types and returns another type. We have seen examples of such constructors as `Option`, `ReadonlyArray`, `Either`.

**Example**

The `head` program:

```ts
import { Option, some, none } from 'fp-ts/Option';

const head = <A,>(as: ReadonlyArray<A>): Option<A> =>
  as.length === 0 ? none : some(as[0]);
```

is a program with an `Option` effect.

When we talk about effects we are interested in `n`-ary type constructors where `n >= 1`, example given:

| Type constructor   | Effect (interpretation)                        |
| ------------------ | ---------------------------------------------- |
| `ReadonlyArray<A>` | a non deterministic computation                |
| `Option<A>`        | a computation that may fail                    |
| `Either<E, A>`     | a computation that may fail                    |
| `IO<A>`            | a synchronous computation that **never fails** |
| `Task<A>`          | an asynchronous computation **never fails**    |
| `Reader<R, A>`     | reading from an environment                    |

where

```ts
// a thunk returning a `Promise`
type Task<A> = () => Promise<A>;
```

```ts
// `R` represents an "environment" needed for the computation
// (we can "read" from it) and `A` is the result
type Reader<R, A> = (r: R) => A;
```

Let's get back to our core problem:

> How do we compose two generic functions `f: (a: A) => B` e `g: (c: C) => D`?

With our current set of rules this general problem is not solvable. We need to add some _boundaries_ to `B` and `C`.

We already know that if `B = C` then the solution is the usual function composition.

```ts
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return (a) => g(f(a));
}
```

But what about other cases?

## A boundary that leads to functors

Let's consider the following boundary: `B = F<C>` for some type constructor `F`, we have the following situation:

- `f: (a: A) => F<B>` is an effectful program
- `g: (b: B) => C` is a pure program

In order to compose `f` with `g` we need to find a procedure that allows us to derive a function `g` from a function `(b: B) => C` to a function `(fb: F<B>) => F<C>` in order to use the usual function composition (this way the codomain of `f` would be the same of the new function's domain).

<img src="images/map.png" width="500" alt="map" />

We have mutated the original problem in a new one: can we find a function, let's call it `map`, that operates this way?

Let's see some practical example:

**Example** (`F = ReadonlyArray`)

```ts
import { flow, pipe } from 'fp-ts/function';

// transforms functions `B -> C` to functions `ReadonlyArray<B> -> ReadonlyArray<C>`
const map =
  <B, C>(g: (b: B) => C) =>
  (fb: ReadonlyArray<B>): ReadonlyArray<C> =>
    fb.map(g);

// -------------------
// usage example
// -------------------

interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers;
const getName = (user: User): string => user.name;

// getFollowersNames: User -> ReadonlyArray<string>
const getFollowersNames = flow(getFollowers, map(getName));

// let's use `pipe` instead of `flow`...
export const getFollowersNames2 = (user: User) =>
  pipe(user, getFollowers, map(getName));

const user: User = {
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [
    { id: 2, name: 'Terry R. Emerson', followers: [] },
    { id: 3, name: 'Marsha J. Joslyn', followers: [] },
  ],
};

console.log(getFollowersNames(user)); // => [ 'Terry R. Emerson', 'Marsha J. Joslyn' ]
```

**Example** (`F = Option`)

```ts
import { flow } from 'fp-ts/function';
import { none, Option, match, some } from 'fp-ts/Option';

// transforms functions `B -> C` to functions `Option<B> -> Option<C>`
const map = <B, C>(g: (b: B) => C): ((fb: Option<B>) => Option<C>) =>
  match(
    () => none,
    (b) => {
      const c = g(b);
      return some(c);
    },
  );

// -------------------
// usage example
// -------------------

import * as RA from 'fp-ts/ReadonlyArray';

const head: (input: ReadonlyArray<number>) => Option<number> = RA.head;
const double = (n: number): number => n * 2;

// getDoubleHead: ReadonlyArray<number> -> Option<number>
const getDoubleHead = flow(head, map(double));

console.log(getDoubleHead([1, 2, 3])); // => some(2)
console.log(getDoubleHead([])); // => none
```

**Example** (`F = IO`)

```ts
import { flow } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';

// transforms functions `B -> C` to functions `IO<B> -> IO<C>`
const map =
  <B, C>(g: (b: B) => C) =>
  (fb: IO<B>): IO<C> =>
  () => {
    const b = fb();
    return g(b);
  };

// -------------------
// usage example
// -------------------

interface User {
  readonly id: number;
  readonly name: string;
}

// a dummy in-memory database
const database: Record<number, User> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' },
};

const getUser =
  (id: number): IO<User> =>
  () =>
    database[id];
const getName = (user: User): string => user.name;

// getUserName: number -> IO<string>
const getUserName = flow(getUser, map(getName));

console.log(getUserName(1)()); // => Ruth R. Gonzalez
```

**Example** (`F = Task`)

```ts
import { flow } from 'fp-ts/function';
import { Task } from 'fp-ts/Task';

// transforms functions `B -> C` into functions `Task<B> -> Task<C>`
const map =
  <B, C>(g: (b: B) => C) =>
  (fb: Task<B>): Task<C> =>
  () => {
    const promise = fb();
    return promise.then(g);
  };

// -------------------
// usage example
// -------------------

interface User {
  readonly id: number;
  readonly name: string;
}

// a dummy remote database
const database: Record<number, User> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' },
};

const getUser =
  (id: number): Task<User> =>
  () =>
    Promise.resolve(database[id]);
const getName = (user: User): string => user.name;

// getUserName: number -> Task<string>
const getUserName = flow(getUser, map(getName));

getUserName(1)().then(console.log); // => Ruth R. Gonzalez
```

**Example** (`F = Reader`)

```ts
import { flow } from 'fp-ts/function';
import { Reader } from 'fp-ts/Reader';

// transforms functions `B -> C` into functions `Reader<R, B> -> Reader<R, C>`
const map =
  <B, C>(g: (b: B) => C) =>
  <R,>(fb: Reader<R, B>): Reader<R, C> =>
  (r) => {
    const b = fb(r);
    return g(b);
  };

// -------------------
// usage example
// -------------------

interface User {
  readonly id: number;
  readonly name: string;
}

interface Env {
  // a dummy in-memory database
  readonly database: Record<string, User>;
}

const getUser =
  (id: number): Reader<Env, User> =>
  (env) =>
    env.database[id];
const getName = (user: User): string => user.name;

// getUserName: number -> Reader<Env, string>
const getUserName = flow(getUser, map(getName));

console.log(
  getUserName(1)({
    database: {
      1: { id: 1, name: 'Ruth R. Gonzalez' },
      2: { id: 2, name: 'Terry R. Emerson' },
      3: { id: 3, name: 'Marsha J. Joslyn' },
    },
  }),
); // => Ruth R. Gonzalez
```

More generally, when a type constructor `F` admits a `map` function, we say it admits a **functor instance**.

From a mathematical point of view, functors are **maps between categories** that preserve the structure of the category, meaning they preserve the identity morphisms and the composition operation.

Since categories are pairs of objects and morphisms, a functor too is a pair of two things:

- a **map between objects** that binds every object `X` in _C_ to an object in _D_.
- a **map between morphisms** that binds every morphism `f` in _C_ to a morphism `map(f)` in _D_.

where _C_ e _D_ are two categories (aka two programming languages).

<img src="images/functor.png" width="500" alt="functor" />

Even though a map between two different programming languages is a fascinating idea, we're more interested in a map where _C_ and _D_ are the same (the _TS_ category). In that case we're talking about **endofunctors** (from the greek "endo" meaning "inside", "internal").

From now on, unless specified differently, when we write "functor" we mean an endofunctor in the _TS_ category.

Now we know the practical side of functors, let's see the formal definition.

## Definition

A functor is a pair `(F, map)` where:

- `F` is an `n`-ary (`n >= 1`) type constructor mapping every type `X` in a type `F<X>` (**map between objects**)
- `map` is a function with the following signature:

```ts
map: <A, B>(f: (a: A) => B) =>
  (fa: F<A>) =>
    F<B>;
```

that maps every function `f: (a: A) => B` in a function `map(f): (fa: F<A>) => F<B>` (**map between morphism**)

The following properties have to hold true:

- `map(1`<sub>X</sub>`)` = `1`<sub>F(X)</sub> (**identities go to identities**)
- `map(g ∘ f) = map(g) ∘ map(f)` (**the image of a composition is the composition of its images**)

The second law allows to refactor and optimize the following computation:

```ts
import { flow, increment, pipe } from 'fp-ts/function';
import { map } from 'fp-ts/ReadonlyArray';

const double = (n: number): number => n * 2;

// iterates array twice
console.log(pipe([1, 2, 3], map(double), map(increment))); // => [ 3, 5, 7 ]

// single iteration
console.log(pipe([1, 2, 3], map(flow(double, increment)))); // => [ 3, 5, 7 ]
```

## Functors and functional error handling

Functors have a positive impact on functional error handling, let's see a practical example:

```ts
declare const doSomethingWithIndex: (index: number) => string;

export const program = (ns: ReadonlyArray<number>): string => {
  // -1 indicates that no element has been found
  const i = ns.findIndex((n) => n > 0);
  if (i !== -1) {
    return doSomethingWithIndex(i);
  }
  throw new Error('cannot find a positive number');
};
```

Using the native `findIndex` API we are forced to use an `if` branch to test whether we have a result different than `-1`. If we forget to do so, the value `-1` could be unintentionally passed as input to `doSomethingWithIndex`.

Let's see how easier it is to obtain the same behavior using `Option` and its functor instance:

```ts
import { pipe } from 'fp-ts/function';
import { map, Option } from 'fp-ts/Option';
import { findIndex } from 'fp-ts/ReadonlyArray';

declare const doSomethingWithIndex: (index: number) => string;

export const program = (ns: ReadonlyArray<number>): Option<string> =>
  pipe(
    ns,
    findIndex((n) => n > 0),
    map(doSomethingWithIndex),
  );
```

Practically, using `Option`, we're always in front of the `happy path`, error handing happens behind the scenes thanks to `map`.

**Demo** (optional)

[`04_functor.ts`](src/04_functor.ts)

**Quiz**. `Task<A>` represents an asynchronous call that always succeed, how can we model a computation that can fail instead?

## Functors compose

Functors compose, meaning that given two functors `F` and `G` then the composition `F<G<A>>` is still a functor and the `map` of this composition is the composition of the `map`s.

**Example** (`F = Task`, `G = Option`)

```ts
import { flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';

type TaskOption<A> = T.Task<O.Option<A>>;

export const map: <A, B>(
  f: (a: A) => B,
) => (fa: TaskOption<A>) => TaskOption<B> = flow(O.map, T.map);

// -------------------
// usage example
// -------------------

interface User {
  readonly id: number;
  readonly name: string;
}

// a dummy remote database
const database: Record<number, User> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' },
};

const getUser =
  (id: number): TaskOption<User> =>
  () =>
    Promise.resolve(O.fromNullable(database[id]));
const getName = (user: User): string => user.name;

// getUserName: number -> TaskOption<string>
const getUserName = flow(getUser, map(getName));

getUserName(1)().then(console.log); // => some('Ruth R. Gonzalez')
getUserName(4)().then(console.log); // => none
```

## Contravariant Functors

In the previous section we haven't been completely thorough with our definitions. What we have seen in the previous section and called "functors" should be more properly called **covariant functors**.

In this section we'll see another variant of the functor concept, **contravariant** functors.

The definition of a contravariant functor is pretty much the same of the covariant one, except for the signature of its fundamental operation, which is called `contramap` rather than `map`.

<img src="images/contramap.png" width="300" alt="contramap" />

**Example**

```ts
import { map } from 'fp-ts/Option';
import { contramap } from 'fp-ts/Eq';

type User = {
  readonly id: number;
  readonly name: string;
};

const getId = (_: User): number => _.id;

// the way `map` operates...
// const getIdOption: (fa: Option<User>) => Option<number>
const getIdOption = map(getId);

// the way `contramap` operates...
// const getIdEq: (fa: Eq<number>) => Eq<User>
const getIdEq = contramap(getId);

import * as N from 'fp-ts/number';

const EqID = getIdEq(N.Eq);

/*

In the `Eq` chapter we saw:

const EqID: Eq<User> = pipe(
  N.Eq,
  contramap((_: User) => _.id)
)
*/
```

## Functors in `fp-ts`

How do we define a functor instance in `fp-ts`? Let's see some example.

The following interface represents the model of some result we get by calling some HTTP API:

```ts
interface Response<A> {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: A;
}
```

Please note that since `body` is parametric, this makes `Response` a good candidate to find a functor instance given that `Response` is a an `n`-ary type constructor with `n >= 1` (a necessary condition).

To define a functor instance for `Response` we need to define a `map` function along some [technical details](https://gcanti.github.io/fp-ts/recipes/HKT.html) required by `fp-ts`.

```ts
// `Response.ts` module

import { pipe } from 'fp-ts/function';
import { Functor1 } from 'fp-ts/Functor';

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Response: Response<A>;
  }
}

export interface Response<A> {
  readonly url: string;
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly body: A;
}

export const map =
  <A, B>(f: (a: A) => B) =>
  (fa: Response<A>): Response<B> => ({
    ...fa,
    body: f(fa.body),
  });

// functor instance for `Response<A>`
export const Functor: Functor1<'Response'> = {
  URI: 'Response',
  map: (fa, f) => pipe(fa, map(f)),
};
```

## Do functors solve the general problem?

Not yet. Functors allow us to compose an effectful program `f` with a pure program `g`, but `g` has to be a **unary** function, accepting one single argument. What happens if `g` takes two or more arguments?

| Program f | Program g               | Composition  |
| --------- | ----------------------- | ------------ |
| pure      | pure                    | `g ∘ f`      |
| effectful | pure (unary)            | `map(g) ∘ f` |
| effectful | pure (`n`-ary, `n > 1`) | ?            |

To manage this circumstance we need something _more_, in the next chapter we'll see another important abstraction in functional programming: **applicative functors**.

# Applicative functors

In the section regarding functors we've seen that we can compose an effectful program `f: (a: A) => F<B>` with a pure one `g: (b: B) => C` through the transformation of `g` to a function `map(g): (fb: F<B>) => F<C>` (if and only if `F` admits a functor instance).

| Program f | Program g    | Composition  |
| --------- | ------------ | ------------ |
| pure      | pure         | `g ∘ f`      |
| effectful | pure (unary) | `map(g) ∘ f` |

But `g` has to be unary, it can only accept a single argument as input. What happens if `g` accepts two arguments? Can we still transform `g` using only the functor instance?

## Currying

First of all we need to model a function that accepts two arguments of type `B` and `C` (we can use a tuple for this) and returns a value of type `D`:

```ts
g: (b: B, c: C) => D;
```

We can rewrite `g` using a technique called **currying**.

> Currying is the technique of translating the evaluation of a function that takes multiple arguments into evaluating a sequence of functions, **each with a single argument**. For example, a function that takes two arguments, one from `B` and one from `C`, and produces outputs in `D`, by currying is translated into a function that takes a single argument from `C` and produces as outputs functions from `B` to `C`.

(source: [currying on wikipedia.org](https://en.wikipedia.org/wiki/Currying))

Thus, through currying, we can rewrite `g` as:

```ts
g: (b: B) => (c: C) => D;
```

**Example**

```ts
interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

const addFollower = (follower: User, user: User): User => ({
  ...user,
  followers: [...user.followers, follower],
});
```

Let's refactor `addFollower` through currying

```ts
interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

const addFollower =
  (follower: User) =>
  (user: User): User => ({
    ...user,
    followers: [...user.followers, follower],
  });

// -------------------
// usage example
// -------------------

const user: User = { id: 1, name: 'Ruth R. Gonzalez', followers: [] };
const follower: User = { id: 3, name: 'Marsha J. Joslyn', followers: [] };

console.log(addFollower(follower)(user));
/*
{
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [ { id: 3, name: 'Marsha J. Joslyn', followers: [] } ]
}
*/
```

## The `ap` operation

Suppose that:

- we do not have a `follower` but only his `id`
- we do not have a `user` but only his `id`
- that we have an API `fetchUser` which, given an `id`, queries an endpoint that returns the corresponding `User`

```ts
import * as T from 'fp-ts/Task';

interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

const addFollower =
  (follower: User) =>
  (user: User): User => ({
    ...user,
    followers: [...user.followers, follower],
  });

declare const fetchUser: (id: number) => T.Task<User>;

const userId = 1;
const followerId = 3;

const result = addFollower(fetchUser(followerId))(fetchUser(userId)); // does not compile
```

I can't use `addFollower` anymore! How can we proceed?

If only we had a function with the following signature:

```ts
declare const addFollowerAsync: (
  follower: T.Task<User>,
) => (user: T.Task<User>) => T.Task<User>;
```

we could proceed with ease:

```ts
import * as T from 'fp-ts/Task';

interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

declare const fetchUser: (id: number) => T.Task<User>;

declare const addFollowerAsync: (
  follower: T.Task<User>,
) => (user: T.Task<User>) => T.Task<User>;

const userId = 1;
const followerId = 3;

// const result: T.Task<User>
const result = addFollowerAsync(fetchUser(followerId))(fetchUser(userId)); // now compiles
```

We can obviously implement `addFollowerAsync` manually, but is it possible instead to find a transformation which starting with a function like `addFollower: (follower: User) => (user: User): User` returns a function like `addFollowerAsync: (follower: Task<User>) => (user: Task<User>) => Task<User>`?

More generally what we would like to have is a transformation, call it `liftA2`, which beginning with a function `g: (b: B) => (c: C) => D` returns a function with the following signature:

```ts
liftA2(g): (fb: F<B>) => (fc: F<C>) => F<D>
```

<img src="images/liftA2.png" width="500" alt="liftA2" />

How can we obtain it? Given that `g` is now a unary function, we can leverage the functor instance and the good old `map`:

```ts
map(g): (fb: F<B>) => F<(c: C) => D>
```

<img src="images/liftA2-first-step.png" width="500" alt="liftA2 (first step)" />

Now we are blocked: there's no legal operation the functor instance provides us to "unpack" the type `F<(c: C) => D>` into `(fc: F<C>) => F<D>`.

We need to introduce a new operation `ap` which realizes this unpacking:

```ts
declare const ap: <A>(fa: Task<A>) => <B>(fab: Task<(a: A) => B>) => Task<B>;
```

**Note**. Why is it names "ap"? Because it can be seen like some sort of function application.

```ts
// `apply` applies a function to a value
declare const apply: <A>(a: A) => <B>(f: (a: A) => B) => B;

declare const ap: <A>(a: Task<A>) => <B>(f: Task<(a: A) => B>) => Task<B>;
// `ap` applies a function wrapped into an effect to a value wrapped into an effect
```

Now that we have `ap` we can define `liftA2`:

```ts
import { pipe } from 'fp-ts/function';
import * as T from 'fp-ts/Task';

const liftA2 =
  <B, C, D>(g: (b: B) => (c: C) => D) =>
  (fb: T.Task<B>) =>
  (fc: T.Task<C>): T.Task<D> =>
    pipe(fb, T.map(g), T.ap(fc));

interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

const addFollower =
  (follower: User) =>
  (user: User): User => ({
    ...user,
    followers: [...user.followers, follower],
  });

// const addFollowerAsync: (fb: T.Task<User>) => (fc: T.Task<User>) => T.Task<User>
const addFollowerAsync = liftA2(addFollower);
```

and finally, we can compose `fetchUser` with the previous result:

```ts
import { flow, pipe } from 'fp-ts/function';
import * as T from 'fp-ts/Task';

const liftA2 =
  <B, C, D>(g: (b: B) => (c: C) => D) =>
  (fb: T.Task<B>) =>
  (fc: T.Task<C>): T.Task<D> =>
    pipe(fb, T.map(g), T.ap(fc));

interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

const addFollower =
  (follower: User) =>
  (user: User): User => ({
    ...user,
    followers: [...user.followers, follower],
  });

declare const fetchUser: (id: number) => T.Task<User>;

// const program: (id: number) => (fc: T.Task<User>) => T.Task<User>
const program = flow(fetchUser, liftA2(addFollower));

const userId = 1;
const followerId = 3;

// const result: T.Task<User>
const result = program(followerId)(fetchUser(userId));
```

We have found a standard procedure to compose two functions `f: (a: A) => F<B>`, `g: (b: B, c: C) => D`:

1. we transform `g` through currying in a function `g: (b: B) => (c: C) => D`
2. we define the `ap` function for the effect `F` (library function)
3. we define the utility function `liftA2` for the effect `F` (library function)
4. we obtain the composition `flow(f, liftA2(g))`

Let's see how's the `ap` operation implemented for some of the type constructors we've already seen:

**Example** (`F = ReadonlyArray`)

```ts
import { increment, pipe } from 'fp-ts/function';

const ap =
  <A,>(fa: ReadonlyArray<A>) =>
  <B,>(fab: ReadonlyArray<(a: A) => B>): ReadonlyArray<B> => {
    const out: Array<B> = [];
    for (const f of fab) {
      for (const a of fa) {
        out.push(f(a));
      }
    }
    return out;
  };

const double = (n: number): number => n * 2;

pipe([double, increment], ap([1, 2, 3]), console.log); // => [ 2, 4, 6, 2, 3, 4 ]
```

**Example** (`F = Option`)

```ts
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

const ap =
  <A,>(fa: O.Option<A>) =>
  <B,>(fab: O.Option<(a: A) => B>): O.Option<B> =>
    pipe(
      fab,
      O.match(
        () => O.none,
        (f) =>
          pipe(
            fa,
            O.match(
              () => O.none,
              (a) => O.some(f(a)),
            ),
          ),
      ),
    );

const double = (n: number): number => n * 2;

pipe(O.some(double), ap(O.some(1)), console.log); // => some(2)
pipe(O.some(double), ap(O.none), console.log); // => none
pipe(O.none, ap(O.some(1)), console.log); // => none
pipe(O.none, ap(O.none), console.log); // => none
```

**Example** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO';

const ap =
  <A,>(fa: IO<A>) =>
  <B,>(fab: IO<(a: A) => B>): IO<B> =>
  () => {
    const f = fab();
    const a = fa();
    return f(a);
  };
```

**Example** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task';

const ap =
  <A,>(fa: Task<A>) =>
  <B,>(fab: Task<(a: A) => B>): Task<B> =>
  () =>
    Promise.all([fab(), fa()]).then(([f, a]) => f(a));
```

**Example** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader';

const ap =
  <R, A>(fa: Reader<R, A>) =>
  <B,>(fab: Reader<R, (a: A) => B>): Reader<R, B> =>
  (r) => {
    const f = fab(r);
    const a = fa(r);
    return f(a);
  };
```

We've seen how with `ap` we can manage functions with two parameters, but what happens with functions that take **three** parameters? Do we need _yet another abstraction_?

Good news is no, `map` and `ap` are sufficient:

```ts
import { pipe } from 'fp-ts/function';
import * as T from 'fp-ts/Task';

const liftA3 =
  <B, C, D, E>(f: (b: B) => (c: C) => (d: D) => E) =>
  (fb: T.Task<B>) =>
  (fc: T.Task<C>) =>
  (fd: T.Task<D>): T.Task<E> =>
    pipe(fb, T.map(f), T.ap(fc), T.ap(fd));

const liftA4 =
  <B, C, D, E, F>(f: (b: B) => (c: C) => (d: D) => (e: E) => F) =>
  (fb: T.Task<B>) =>
  (fc: T.Task<C>) =>
  (fd: T.Task<D>) =>
  (fe: T.Task<E>): T.Task<F> =>
    pipe(fb, T.map(f), T.ap(fc), T.ap(fd), T.ap(fe));

// etc...
```

Now we cam update ore "composition table":

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure (unary)  | `map(g) ∘ f`    |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |

## The `of` operation

Now we know that given two function `f: (a: A) => F<B>`, `g: (b: B, c: C) => D` we can obtain the composition `h`:

```ts
h: (a: A) => (fc: F<C>) => F<D>;
```

To execute `h` we need a new value of type `A` and a value of type `F<C>`.

But what happens if, instead of having a value of type `F<C>`, for the second parameter `fc` we only have a value of type `C`?

It would be helpful to have an operation which can transform a value of type `C` in a value of type `F<C>` in order to use `h`.

Let's introduce such operation, called `of` (other synonyms: **pure**, **return**):

```ts
declare const of: <C>(c: C) => F<C>;
```

In literature the term **applicative functors** is used for the type constructors which admith _both_ the `ap` and `of` operations.

Let's see how `of` is defined for some type constructors we've already seen:

**Example** (`F = ReadonlyArray`)

```ts
const of = <A,>(a: A): ReadonlyArray<A> => [a];
```

**Example** (`F = Option`)

```ts
import * as O from 'fp-ts/Option';

const of = <A,>(a: A): O.Option<A> => O.some(a);
```

**Example** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO';

const of =
  <A,>(a: A): IO<A> =>
  () =>
    a;
```

**Example** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task';

const of =
  <A,>(a: A): Task<A> =>
  () =>
    Promise.resolve(a);
```

**Example** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader';

const of =
  <R, A>(a: A): Reader<R, A> =>
  () =>
    a;
```

**Demo**

[`05_applicative.ts`](src/05_applicative.ts)

## Applicative functors compose

Applicative functors compose, meaning that given two applicative functors `F` and `G`, their composition `F<G<A>>` is still an applicative functor.

**Example** (`F = Task`, `G = Option`)

The `of` of the composition is the composition of the `of`s:

```ts
import { flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';

type TaskOption<A> = T.Task<O.Option<A>>;

const of: <A>(a: A) => TaskOption<A> = flow(O.of, T.of);
```

the `ap` of the composition is obtained by the following pattern:

```ts
const ap = <A,>(
  fa: TaskOption<A>,
): (<B>(fab: TaskOption<(a: A) => B>) => TaskOption<B>) =>
  flow(
    T.map((gab) => (ga: O.Option<A>) => O.ap(ga)(gab)),
    T.ap(fa),
  );
```

## Do applicative functors solve the general problem?

Not yet. There's one last very important case to consider: when **both** programs are effectful.

Yet again we need something more, in the following chapter we'll talk about one of the most important abstractions in functional programming: **monads**.

# Monads

<center>
<img src="images/moggi.jpg" width="300" alt="Eugenio Moggi" />

(Eugenio Moggi is a professor of computer science at the University of Genoa, Italy. He first described the general use of monads to structure programs)

<img src="images/wadler.jpg" width="300" alt="Philip Lee Wadler" />

(Philip Lee Wadler is an American computer scientist known for his contributions to programming language design and type theory)

</center>

In the last chapter we have seen how we can compose an effectful program `f: (a: A) => F<B>` with an `n`-ary pure program `g`, if and only if the type constructor `F` admits an applicative functor instance:

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure (unary)  | `map(g) ∘ f`    |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |

But we need to solve one last, quite common, case: when **both** programs are effectful:

```ts
f: (a: A) => F<B>;
g: (b: B) => F<C>;
```

What is the composition of `f` and `g`?

## The problem with nested contexts

Let's see few examples on why we need something more.

**Example** (`F = Array`)

Suppose we want to get followers' followers.

```ts
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/ReadonlyArray';

interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers;

declare const user: User;

// followersOfFollowers: ReadonlyArray<ReadonlyArray<User>>
const followersOfFollowers = pipe(user, getFollowers, A.map(getFollowers));
```

There's something wrong here, `followersOfFollowers` has a type `ReadonlyArray<ReadonlyArray<User>>` but we want `ReadonlyArray<User>`.

We need to **flatten** nested arrays.

The function `flatten: <A>(mma: ReadonlyArray<ReadonlyArray<A>>) => ReadonlyArray<A>` exported by the `fp-ts/ReadonlyArray` is exactly what we need:

```ts
// followersOfFollowers: ReadonlyArray<User>
const followersOfFollowers = pipe(
  user,
  getFollowers,
  A.map(getFollowers),
  A.flatten,
);
```

Cool! Let's see some other data type.

**Example** (`F = Option`)
Suppose you want to calculate the reciprocal of the first element of a numerical array:

```ts
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';

const inverse = (n: number): O.Option<number> =>
  n === 0 ? O.none : O.some(1 / n);

// inverseHead: O.Option<O.Option<number>>
const inverseHead = pipe([1, 2, 3], A.head, O.map(inverse));
```

Oops, it happened again, `inverseHead` has type `Option<Option<number>>` but we want `Option<number>`.

We need to flatten again the nested `Option`s.

The `flatten: <A>(mma: Option<Option<A>>) => Option<A>` function exported by the `fp-ts/Option` module is what we need:

```ts
// inverseHead: O.Option<number>
const inverseHead = pipe([1, 2, 3], A.head, O.map(inverse), O.flatten);
```

All of those `flatten` funcitons...They aren't a coincidence, there is a functional pattern behind the scenes: both the type constructors
`ReadonlyArray` and `Option` (and many others) admit a **monad instance** and

> `flatten` is the most peculiar operation of monads

**Note**. A common synonym of `flatten` is **join**.

So, what is a monad?

Here is how they are often presented...

## Monad Definition

**Definition**. A monad is defined by three things:

(1) a type constructor `M` admitting a functor instance

(2) a function `of` (also called **pure** or **return**) with the following signature:

```ts
of: <A,>(a: A) => M<A>;
```

(3) a `chain` function (also called **flatMap** or **bind**) with the following signature:

```ts
chain: <A, B>(f: (a: A) => M<B>) =>
  (ma: M<A>) =>
    M<B>;
```

The `of` and `chain` functions need to obey three laws:

- `chain(of) ∘ f = f` (**Left identity**)
- `chain(f) ∘ of = f` (**Right identity**)
- `chain(h) ∘ (chain(g) ∘ f) = chain((chain(h) ∘ g)) ∘ f` (**Associativity**)

where `f`, `g`, `h` are all effectful functions and `∘` is the usual function composition.

When I saw this definition for the first time I had many questions:

- why exactly those two operation `of` and `chain`? and why to they have those signatures?
- why do they have those synonyms like "pure" or "flatMap"?
- why does laws need to hold true? What do they mean?
- if `flatten` is so important for monads, why it doesn't compare in its definition?

This chapter will try to answer all of these questions.

Let's get back to the core problem: what is the composition of two effectful functions `f` and `g`?

<img src="images/kleisli_arrows.png" alt="two Kleisli arrows, what's their composition?" width="450px" />

<center>(two Kleisli Arrows)</center>

**Note**. An effectful function is also called **Kleisli arrow**.

For the time being I don't even know the **type** of such composition.

But we've already seen some abstractions that talks specifically about composition. Do you remember what we said about categories?

> Categories capture the essence of composition

We can transform our problem into a category problem, meaning: can we find a category that models the composition of Kleisli arrows?

## The Kleisli category

<center>
<img src="images/kleisli.jpg" width="300" alt="Heinrich Kleisli" />

(Heinrich Kleisli, Swiss mathematician)

</center>

Let's try building a category _K_ (called **Kleisli category**) which contains _only_ Kleisli arrows:

- **objects** will be the same objects of the _TS_ category, so all TypeScript types.
- **morphisms** are built like this: every time there is a Kleisli arrow `f: A ⟼ M<B>` in _TS_ we draw an arrow `f': A ⟼ B` in _K_

<center>
<img src="images/kleisli_category.png" alt="above the TS category, below the K construction" width="400px" />

(above the composition in the _TS_ category, below the composition in the _K_ construction)

</center>

So what would be the composition of `f` and `g` in _K_?
It's th red arrow called `h'` in the image below:

<center>
<img src="images/kleisli_composition.png" alt="above the composition in the TS category, below the composition in the K construction" width="400px" />

(above the composition in the _TS_ category, below the composition in the _K_ construction)

</center>

Given that `h'` is an arrow from `A` to `C` in `K`, we can find a corresponding function `h` from `A` to `M<C>` in `TS`.

Thus, a good candidate for the following composition of `f` and `g` in _TS_ is still a Kleisli arrow with the following signature: `(a: A) => M<C>`.

Let's try implementing such a function.

## Defining `chain` step by step

The first point (1) of the monad definition tells us that `M` admits a functor instance, thus we can use the `map` function to transform the function `g: (b: B) => M<C>` into a function `map(g): (mb: M<B>) => M<M<C>>`

<center>
<img src="images/flatMap.png" alt="where chain comes from" width="450px" />

(how to obtain the `h` function)

</center>

We're stuck now though: there is no legal operation for the functor instance that allows us to flatten a value of type `M<M<C>>` into a value of type `M<C>`, we need an additional operation, let's call it `flatten`.

If we can define such operation then we can find the composition we were looking for:

```
h = flatten ∘ map(g) ∘ f
```

By joining the `flatten ∘ map(g)` names we get "flatMap", hence the name!

Thus we can get `chain` in this way

```
chain = flatten ∘ map(g)
```

<center>
<img src="images/chain.png" alt="how chain operates on the function g" width="400px" />

(how `chain` operates on the function `g`)

</center>

Now we can update our composition table

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure (unary)  | `map(g) ∘ f`    |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |
| effectful | effectful     | `chain(g) ∘ f`  |

What about `of`? Well, `of` comes from the identity morphisms in _K_: for every identity morphism 1<sub>A</sub> in _K_ there has to be a corresponding function from `A` to `M<A>` (that is, `of: <A>(a: A) => M<A>`).

<center>
<img src="images/of.png" alt="where of comes from" width="300px" />

(where `of` comes from)

</center>

The fact that `of` is the neutral element for `chain` allows this kind of flux control (pretty common):

```ts
pipe(
  mb,
  M.chain((b) => (predicate(b) ? M.of(b) : g(b))),
);
```

where `predicate: (b: B) => boolean`, `mb: M<B>` and `g: (b: B) => M<B>`.

Last question: where do the laws come from? They are nothing else but the categorical laws in _K_ translated to _TS_:

| Law            | _K_                               | _TS_                                                    |
| -------------- | --------------------------------- | ------------------------------------------------------- |
| Left identity  | 1<sub>B</sub> ∘ `f'` = `f'`       | `chain(of) ∘ f = f`                                     |
| Right identity | `f'` ∘ 1<sub>A</sub> = `f'`       | `chain(f) ∘ of = f`                                     |
| Associativity  | `h' ∘ (g' ∘ f') = (h' ∘ g') ∘ f'` | `chain(h) ∘ (chain(g) ∘ f) = chain((chain(h) ∘ g)) ∘ f` |

If we now go back to the examples that showed the problem with nested contexts we can solve them using `chain`:

```ts
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';

interface User {
  readonly id: number;
  readonly name: string;
  readonly followers: ReadonlyArray<User>;
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers;

declare const user: User;

const followersOfFollowers: ReadonlyArray<User> = pipe(
  user,
  getFollowers,
  A.chain(getFollowers),
);

const inverse = (n: number): O.Option<number> =>
  n === 0 ? O.none : O.some(1 / n);

const inverseHead: O.Option<number> = pipe([1, 2, 3], A.head, O.chain(inverse));
```

Let's see how `chain` is implemented for the usual type constructors we've already seen:

**Example** (`F = ReadonlyArray`)

```ts
// transforms functions `B -> ReadonlyArray<C>` into functions `ReadonlyArray<B> -> ReadonlyArray<C>`
const chain =
  <B, C>(g: (b: B) => ReadonlyArray<C>) =>
  (mb: ReadonlyArray<B>): ReadonlyArray<C> => {
    const out: Array<C> = [];
    for (const b of mb) {
      out.push(...g(b));
    }
    return out;
  };
```

**Example** (`F = Option`)

```ts
import { match, none, Option } from 'fp-ts/Option';

// transforms functions `B -> Option<C>` into functions `Option<B> -> Option<C>`
const chain = <B, C>(g: (b: B) => Option<C>): ((mb: Option<B>) => Option<C>) =>
  match(() => none, g);
```

**Example** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO';

// transforms functions `B -> IO<C>` into functions `IO<B> -> IO<C>`
const chain =
  <B, C>(g: (b: B) => IO<C>) =>
  (mb: IO<B>): IO<C> =>
  () =>
    g(mb())();
```

**Example** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task';

// transforms functions `B -> Task<C>` into functions `Task<B> -> Task<C>`
const chain =
  <B, C>(g: (b: B) => Task<C>) =>
  (mb: Task<B>): Task<C> =>
  () =>
    mb().then((b) => g(b)());
```

**Example** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader';

// transforms functions `B -> Reader<R, C>` into functions `Reader<R, B> -> Reader<R, C>`
const chain =
  <B, R, C>(g: (b: B) => Reader<R, C>) =>
  (mb: Reader<R, B>): Reader<R, C> =>
  (r) =>
    g(mb(r))(r);
```

## Manipulating programs

Let's see now, how thanks to referential transparency and the monad concept we can programmaticaly manipulate programs.

Here's a small program that reads / writes a file:

```ts
import { log } from 'fp-ts/Console';
import { IO, chain } from 'fp-ts/IO';
import { pipe } from 'fp-ts/function';
import * as fs from 'fs';

// -----------------------------------------
// library functions
// -----------------------------------------

const readFile =
  (filename: string): IO<string> =>
  () =>
    fs.readFileSync(filename, 'utf-8');

const writeFile =
  (filename: string, data: string): IO<void> =>
  () =>
    fs.writeFileSync(filename, data, { encoding: 'utf-8' });

// API derived from the previous functions
const modifyFile = (filename: string, f: (s: string) => string): IO<void> =>
  pipe(
    readFile(filename),
    chain((s) => writeFile(filename, f(s))),
  );

// -----------------------------------------
// program
// -----------------------------------------

const program1 = pipe(
  readFile('file.txt'),
  chain(log),
  chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
  chain(() => readFile('file.txt')),
  chain(log),
);
```

The actions:

```ts
pipe(readFile('file.txt'), chain(log));
```

is repeated more than once in the program, but given that referential transparency holds we can factor it and assign it to a constant:

```ts
const read = pipe(readFile('file.txt'), chain(log));
const modify = modifyFile('file.txt', (s) => s + '\n// eof');

const program2 = pipe(
  read,
  chain(() => modify),
  chain(() => read),
);
```

We can even define a combinator and leverage it to make the code more compact:

```ts
const interleave = <A, B>(action: IO<A>, middle: IO<B>): IO<A> =>
  pipe(
    action,
    chain(() => middle),
    chain(() => action),
  );

const program3 = interleave(read, modify);
```

Another example: implementing a function similar to Unix' `time` (the part related to the execution time) for `IO`.

```ts
import * as IO from 'fp-ts/IO';
import { now } from 'fp-ts/Date';
import { log } from 'fp-ts/Console';
import { pipe } from 'fp-ts/function';

// logs the computation lenght in milliseconds
export const time = <A,>(ma: IO.IO<A>): IO.IO<A> =>
  pipe(
    now,
    IO.chain((startMillis) =>
      pipe(
        ma,
        IO.chain((a) =>
          pipe(
            now,
            IO.chain((endMillis) =>
              pipe(
                log(`Elapsed: ${endMillis - startMillis}`),
                IO.map(() => a),
              ),
            ),
          ),
        ),
      ),
    ),
  );
```

**Digression**. As you can notice, using `chain` when it is required to maintain a scope leads to verbose code.
In languages that support monadic style natively there is often syntax support that goes by the name of "do notation" which eases this kind of situations.

Let's see a Haskell example

```haskell
now :: IO Int
now = undefined -- `undefined` in Haskell is equivalent to TypeScript's declare

log :: String -> IO ()
log = undefined

time :: IO a -> IO a
time ma = do
  startMillis <- now
  a <- ma
  endMillis <- now
  log ("Elapsed:" ++ show (endMillis - startMillis))
  return a
```

TypeScript does not support such syntax, but it can be emulated with something similar:

```ts
import { log } from 'fp-ts/Console';
import { now } from 'fp-ts/Date';
import { pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';

// logs the computation lenght in milliseconds
export const time = <A,>(ma: IO.IO<A>): IO.IO<A> =>
  pipe(
    IO.Do,
    IO.bind('startMillis', () => now),
    IO.bind('a', () => ma),
    IO.bind('endMillis', () => now),
    IO.chainFirst(({ endMillis, startMillis }) =>
      log(`Elapsed: ${endMillis - startMillis}`),
    ),
    IO.map(({ a }) => a),
  );
```

Let's see a usage example of the `time` combinator:

```ts
import { randomInt } from 'fp-ts/Random';
import { Monoid, concatAll } from 'fp-ts/Monoid';
import { replicate } from 'fp-ts/ReadonlyArray';

const fib = (n: number): number => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2));

// launches `fib` with a random integer between 30 and 35
// logging both the input and output
const randomFib: IO.IO<void> = pipe(
  randomInt(30, 35),
  IO.chain((n) => log([n, fib(n)])),
);

// a monoid instance for `IO<void>`
const MonoidIO: Monoid<IO.IO<void>> = {
  concat: (first, second) => () => {
    first();
    second();
  },
  empty: IO.of(undefined),
};

// executes `n` times the `mv` computation
const replicateIO = (n: number, mv: IO.IO<void>): IO.IO<void> =>
  concatAll(MonoidIO)(replicate(n, mv));

// -------------------
// usage example
// -------------------

time(replicateIO(3, randomFib))();
/*
[ 31, 2178309 ]
[ 33, 5702887 ]
[ 30, 1346269 ]
Elapsed: 89
*/
```

Logs also the partial:

```ts
time(replicateIO(3, time(randomFib)))();
/*
[ 33, 5702887 ]
Elapsed: 54
[ 30, 1346269 ]
Elapsed: 13
[ 32, 3524578 ]
Elapsed: 39
Elapsed: 106
*/
```

One of the most interesting aspects of working with the monadic interface (`map`, `of`, `chain`) is the possibility to inject dependencies which the program needs, including the **way of concatenating different computations**.

To see that, let's refactor the small program that reads and writes a file:

```ts
import { IO } from 'fp-ts/IO';
import { pipe } from 'fp-ts/function';

// -----------------------------------------
// Deps interface, what we would call a "port" in the Hexagonal Architecture
// -----------------------------------------

interface Deps {
  readonly readFile: (filename: string) => IO<string>;
  readonly writeFile: (filename: string, data: string) => IO<void>;
  readonly log: <A>(a: A) => IO<void>;
  readonly chain: <A, B>(f: (a: A) => IO<B>) => (ma: IO<A>) => IO<B>;
}

// -----------------------------------------
// program
// -----------------------------------------

const program4 = (D: Deps) => {
  const modifyFile = (filename: string, f: (s: string) => string) =>
    pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s))),
    );

  return pipe(
    D.readFile('file.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('file.txt')),
    D.chain(D.log),
  );
};

// -----------------------------------------
// a `Deps` instance, what we would call an "adapter" in the Hexagonal Architecture
// -----------------------------------------

import * as fs from 'fs';
import { log } from 'fp-ts/Console';
import { chain } from 'fp-ts/IO';

const DepsSync: Deps = {
  readFile: (filename) => () => fs.readFileSync(filename, 'utf-8'),
  writeFile: (filename: string, data: string) => () =>
    fs.writeFileSync(filename, data, { encoding: 'utf-8' }),
  log,
  chain,
};

// dependency injection
program4(DepsSync)();
```

There's more, we can even abstract the effect in which the program runs. We can define our own `FileSystem` effect (the effect representing read-write operations over the file system):

```ts
import { IO } from 'fp-ts/IO';
import { pipe } from 'fp-ts/function';

// -----------------------------------------
// our program's effect
// -----------------------------------------

interface FileSystem<A> extends IO<A> {}

// -----------------------------------------
// dependencies
// -----------------------------------------

interface Deps {
  readonly readFile: (filename: string) => FileSystem<string>;
  readonly writeFile: (filename: string, data: string) => FileSystem<void>;
  readonly log: <A>(a: A) => FileSystem<void>;
  readonly chain: <A, B>(
    f: (a: A) => FileSystem<B>,
  ) => (ma: FileSystem<A>) => FileSystem<B>;
}

// -----------------------------------------
// program
// -----------------------------------------

const program4 = (D: Deps) => {
  const modifyFile = (filename: string, f: (s: string) => string) =>
    pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s))),
    );

  return pipe(
    D.readFile('file.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('file.txt')),
    D.chain(D.log),
  );
};
```

With a simple change in the definition of the `FileSystem` effect. we can modify the program to make it run asynchronously

```diff
// -----------------------------------------
// our program's effect
// -----------------------------------------

-interface FileSystem<A> extends IO<A> {}
+interface FileSystem<A> extends Task<A> {}
```

now all there's left is to modify the `Deps` instance to adapt to the new definition.

```ts
import { Task } from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';

// -----------------------------------------
// our program's effect (modified)
// -----------------------------------------

interface FileSystem<A> extends Task<A> {}

// -----------------------------------------
// dependencies (NOT modified)
// -----------------------------------------

interface Deps {
  readonly readFile: (filename: string) => FileSystem<string>;
  readonly writeFile: (filename: string, data: string) => FileSystem<void>;
  readonly log: <A>(a: A) => FileSystem<void>;
  readonly chain: <A, B>(
    f: (a: A) => FileSystem<B>,
  ) => (ma: FileSystem<A>) => FileSystem<B>;
}

// -----------------------------------------
// program (NOT modified)
// -----------------------------------------

const program5 = (D: Deps) => {
  const modifyFile = (filename: string, f: (s: string) => string) =>
    pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s))),
    );

  return pipe(
    D.readFile('file.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('file.txt')),
    D.chain(D.log),
  );
};

// -----------------------------------------
// a `Deps` instance (modified)
// -----------------------------------------

import * as fs from 'fs';
import { log } from 'fp-ts/Console';
import { chain, fromIO } from 'fp-ts/Task';

const DepsAsync: Deps = {
  readFile: (filename) => () =>
    new Promise((resolve) =>
      fs.readFile(filename, { encoding: 'utf-8' }, (_, s) => resolve(s)),
    ),
  writeFile: (filename: string, data: string) => () =>
    new Promise((resolve) => fs.writeFile(filename, data, () => resolve())),
  log: (a) => fromIO(log(a)),
  chain,
};

// dependency injection
program5(DepsAsync)();
```

**Quiz**. The previous examples overlook, on purpose, possible errors. Example give: the file we're operating on may not exist at all. How could we modify the `FileSystem` effect to take this into account?

```ts
import { Task } from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';

// -----------------------------------------
// our program's effect (modified)
// -----------------------------------------

interface FileSystem<A> extends Task<E.Either<Error, A>> {}

// -----------------------------------------
// dependencies (NOT modified)
// -----------------------------------------

interface Deps {
  readonly readFile: (filename: string) => FileSystem<string>;
  readonly writeFile: (filename: string, data: string) => FileSystem<void>;
  readonly log: <A>(a: A) => FileSystem<void>;
  readonly chain: <A, B>(
    f: (a: A) => FileSystem<B>,
  ) => (ma: FileSystem<A>) => FileSystem<B>;
}

// -----------------------------------------
// program (NOT modified)
// -----------------------------------------

const program5 = (D: Deps) => {
  const modifyFile = (filename: string, f: (s: string) => string) =>
    pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s))),
    );

  return pipe(
    D.readFile('-.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('file.txt')),
    D.chain(D.log),
  );
};

// -----------------------------------------
// `Deps` instance (modified)
// -----------------------------------------

import * as fs from 'fs';
import { log } from 'fp-ts/Console';
import { chain, fromIO } from 'fp-ts/TaskEither';

const DepsAsync: Deps = {
  readFile: (filename) => () =>
    new Promise((resolve) =>
      fs.readFile(filename, { encoding: 'utf-8' }, (err, s) => {
        if (err !== null) {
          resolve(E.left(err));
        } else {
          resolve(E.right(s));
        }
      }),
    ),
  writeFile: (filename: string, data: string) => () =>
    new Promise((resolve) =>
      fs.writeFile(filename, data, (err) => {
        if (err !== null) {
          resolve(E.left(err));
        } else {
          resolve(E.right(undefined));
        }
      }),
    ),
  log: (a) => fromIO(log(a)),
  chain,
};

// dependency injection
program5(DepsAsync)().then(console.log);
```

**Demo**

[`06_game.ts`](src/06_game.ts)
