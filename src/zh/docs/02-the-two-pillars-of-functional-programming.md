# 函数式编程的两大基石

函数式编程基于以下的两个支柱

- 引用透明(参照透明)
- 组合(作为通用设计模式)

这边教程中剩余的所有内容都直接或间接地源于这两点。

## 引用透明

> **定义**：如果一个**表达式**可以被替换为相应的值而不改变程序的行为，则该表达式被认为是 _引用透明_ 的

**例** (引用透明意味着使用纯函数)

```ts
const double = (n: number): number => n * 2;

const x = double(2);
const y = double(2);
```

表达式`double(2)`拥有引用透明性因为它可以被它的值所代替(4)。

因此可以进行以下重构。

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

我们无法用值去替代`inverse(0)`，因此它不是引用透明的。

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

可以进行如下重构吗？程序的行为是否会改变？

```ts
const x = await question('What is your name?');
const y = x;
```

答案是，在不读`question`的 _具体实现_ 的情况下无法做出回答。

如你所见，重构包含非引用透明的表达式的程序可能具有挑战性。
在函数式编程中，每个表达式都是引用透明的，因此进行更改所需的认知负荷将大大减少。

## 组合

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

由于 combinator 的输出可以作为输入再次传递，因此组合的可能性将爆炸性增长，这使得这种模式非常强大。

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

让我们尝试实现这样一个模块。

**Demo**：

[`01_retry.ts`](../01_retry.ts)

正如在demo中所演示的，仅用3个原语和两个 combinator，我们就能够表达相当复杂的策略。

仔细思考便可以发现，每添加一个原语或一个 combinator 便可以使表达可能性翻倍。

在这里我想特别提到 `01_retry.ts` 的两个 combinator 中的 `concat`，因为它涉及到一个非常强大的函数式编程抽象：半群(semigroup)。
