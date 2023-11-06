# 纯函数与偏函数(Pure and partial functions)

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

**定义**：_函数_ `f: X ⟶ Y`是`X × Y`的子集。对于每个`x ∈ X`，总是只存在一个`y ∈ Y`，使得`(x, y) ∈ f`.

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

![mutable / immutable](../../images/mutable-immutable.jpg)

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
