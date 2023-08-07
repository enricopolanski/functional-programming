<!-- markdownlint-disable-file MD033 -->
# 函子（Functor）

在上一章，我们讨论了 _TS_ 范畴与函数组合的核心问题：

> 我们如何组合两个泛型函数 `f: (a: A) => B` 和 `g: (c: C) => D`？

为什么找到这个问题的解决方案如此重要？

因为，如果范畴确实可以用于对编程语言进行建模，则态射（_TS_ 范畴中的函数）可以用于对**程序**进行建模。

因此，解决这个抽象问题意味着找到一种**以通用方式编写程序**的具体方法。这对于我们开发者来说真的很有趣，不是吗？

## 函数作为程序

如果我们想用函数来建模程序，我们需要立即解决一个问题：

> 如何用纯函数对产生副作用的程序进行建模？

答案是通过 **作用（effects）** 对副作用进行建模，即**代表**副作用的类型。

让我们看看在JavaScript中执行此操作的两种可能的技术：

- 为作用定义DSL（领域特定语言 domain specific language）
- 使用 _thunk_

第一种技术使用 DSL，意味着修改程序，例如：

```ts
function log(message: string): void {
  console.log(message); // side effect
}
```

更改其到达域使函数返回副作用的**描述**：

```ts
type DSL = ... // 系统中所有可能的作用的和类型

function log(message: string): DSL {
  return {
    type: "log",
    message
  }
}
```

**测验**：新定义的`log`函数真的纯粹吗？实际上`log('foo') !== log('foo')`！

该技术需要一种将作用与解释器的定义结合起来的方法，该解释器能够在启动最终程序时执行副作用。

第二种技术在TypeScript中更简单，是将计算包在 _thunk_ 中：

```ts
// 代表同步副作用的 thunk
type IO<A> = () => A;

const log = (message: string): IO<void> => {
  return () => console.log(message); // returns a thunk
};
```

`log`程序一旦执行，不会立即产生副作用，而是返回**代表计算的值**（也称为 _action_）。

```ts
import { IO } from 'fp-ts/IO';

export const log = (message: string): IO<void> => {
  return () => console.log(message); // returns a thunk
};

export const main = log('hello!');
// 此时输出中没有任何内容
// 因为`main`只是一个代表计算的惰性值

main();
// 只有启动程序时才会看到结果
```

在函数式编程中，倾向于将副作用（以效果的形式）推到执行它们的系统边界（`main`函数），由此可以得到以下方案：

> system = pure core + imperative shell

在 _纯函数式语言_ （如 Haskell、PureScript或Elm）中，这种划分是严格而清晰的，并且是由语言本身强加的。

即使使用第二种技术，我们也需要一种方法来组合作用，这使我们回到了以通用方式编写程序的目标，让我们看看如何实现。

我们首先需要一些（非正式）术语：我们将具有以下签名的函数称为 **纯程序（pure program）**：

```ts
(a: A) => B;
```

这样的签名模拟了一个程序，该程序接受类型`A`的输入并返回类型`B`的结果，但没有任何作用。

**例**：

`len` 程序：

```ts
const len = (s: string): number => s.length;
```

将具有以下签名的函数称为 **有作用的程序（effectful program）**：

```ts
(a: A) => F<B>;
```

这样的签名模拟了一个程序，该程序接受类型`A`的输入并返回类型`B`的结果以及 **作用**`F`，其中`F`是某种类型构造函数。

让我们回想一下，[类型构造函数](https://en.wikipedia.org/wiki/Type_constructor)是一个`n`元类型运算符，它接受一个或多个类型作为参数并返回另一种类型。我们已经看到了`Option`、`ReadonlyArray`、`Either`等构造函数的示例。

**例**：

`head` 程序：

```ts
import { Option, some, none } from 'fp-ts/Option';

const head = <A,>(as: ReadonlyArray<A>): Option<A> =>
  as.length === 0 ? none : some(as[0]);
```

是一个有`Option`作用的程序。

当谈论作用时，我们对`n`元类型构造函数感兴趣，其中“n >= 1”，给出一些例子：

| 类型构造函数         | 作用（解释）          |
| ------------------ | ------------------- |
| `ReadonlyArray<A>` | 不确定性计算          |
| `Option<A>`        | 可能会失败的计算      |
| `Either<E, A>`     | 可能会失败的计算      |
| `IO<A>`            | 永远不会失败的同步计算 |
| `Task<A>`          | 永远不会失败的异步计算 |
| `Reader<R, A>`     | 从环境中读取         |

其中

```ts
// 返回`Promise`的thunk
type Task<A> = () => Promise<A>;
```

```ts
// `R`代表一个计算所需的环境，我们可以从中读取。`A`是结果
type Reader<R, A> = (r: R) => A;
```

让我们回到我们的核心问题：

> 我们如何组合两个泛型函数`f: (a: A) => B`与`g: (c: C) => D`？

按照我们目前的规则，这个普遍问题是无法解决的。我们需要为`B`和`C`添加一些 _边界_。

我们已经知道，如果`B = C`，那么解决方案就是通常的函数组合。

```ts
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return (a) => g(f(a));
}
```

但是其他情况呢？

## 导出函子的约束条件

考虑以下约束：对于`B = F<C>`，我们有以下场景，其中`F`是任意类型构造函数：

- `f: (a: A) => F<B>`是一个有作用的程序
- `g: (b: B) => C`是一个纯程序

为了组合`f`与`g`，我们需要找到一个过程，允许将`g`从函数`(b: B) => C`转换为函数`(fb: F<B>) => F<C>`。这样我们才能使用通常的函数组合。（通过这种方式，`f`的到达域将与新函数的定义域相同）。

<img src="../../images/map.png" width="500" alt="map" />

我们将原来的问题变成了一个新的、不同的问题：我们能否找到一个函数`map`来实现这一点？

让我们看一些实际的例子：

**例** (`F = ReadonlyArray`)

```ts
import { flow, pipe } from 'fp-ts/function';

// 将函数`B -> C`转换为函数`ReadonlyArray<B> -> ReadonlyArray<C>`
const map =
  <B, C>(g: (b: B) => C) =>
  (fb: ReadonlyArray<B>): ReadonlyArray<C> =>
    fb.map(g);

// -------------------
// 用例
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

// 用`pipe`代替`flow`
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

**例** (`F = Option`)

```ts
import { flow } from 'fp-ts/function';
import { none, Option, match, some } from 'fp-ts/Option';

// 将函数从`B -> C`转换为`Option<B> -> Option<C>`
const map = <B, C>(g: (b: B) => C): ((fb: Option<B>) => Option<C>) =>
  match(
    () => none,
    (b) => {
      const c = g(b);
      return some(c);
    },
  );

// -------------------
// 用例
// -------------------

import * as RA from 'fp-ts/ReadonlyArray';

const head: (input: ReadonlyArray<number>) => Option<number> = RA.head;
const double = (n: number): number => n * 2;

// getDoubleHead: ReadonlyArray<number> -> Option<number>
const getDoubleHead = flow(head, map(double));

console.log(getDoubleHead([1, 2, 3])); // => some(2)
console.log(getDoubleHead([])); // => none
```

**例** (`F = IO`)

```ts
import { flow } from 'fp-ts/function';
import { IO } from 'fp-ts/IO';

// 将函数从`B -> C`转换为`IO<B> -> IO<C>`
const map =
  <B, C>(g: (b: B) => C) =>
  (fb: IO<B>): IO<C> =>
  () => {
    const b = fb();
    return g(b);
  };

// -------------------
// 用例
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

**例** (`F = Task`)

```ts
import { flow } from 'fp-ts/function';
import { Task } from 'fp-ts/Task';

// 将函数从`B -> C`转换为`Task<B> -> Task<C>`
const map =
  <B, C>(g: (b: B) => C) =>
  (fb: Task<B>): Task<C> =>
  () => {
    const promise = fb();
    return promise.then(g);
  };

// -------------------
// 用例
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

**例** (`F = Reader`)

```ts
import { flow } from 'fp-ts/function';
import { Reader } from 'fp-ts/Reader';

// 将函数从`B -> C`转换为`Reader<R, B> -> Reader<R, C>`
const map =
  <B, C>(g: (b: B) => C) =>
  <R,>(fb: Reader<R, B>): Reader<R, C> =>
  (r) => {
    const b = fb(r);
    return g(b);
  };

// -------------------
// 用例
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

更一般地，当类型构造函数`F`承认`map`函数时，我们说它承认**函子实例**。

从数学的角度来看，函子是**范畴之间的映射**，它保留了范畴的结构，这意味着它们保留了单位态射和组合运算。

因为范畴由对象与态射组成，因此函子也类似地由以下两者组成：

- 将`C`中的每个`X`对象与`D`中的`F<X>`对象关联起来的**对象间的映射**
- 将`C`中每个态射`f`与`D`中的态射`map(f)`关联起来的**态射间的映射**

其中，_C_ 和 _D_ 是两个范畴（也称为两种编程语言）

<img src="../../images/functor.png" width="500" alt="functor" />

虽然两种编程语言之间的映射是一个有趣的想法，但我们更感兴趣的是 _C_ 和 _D_ 重合的映射（ _TS_ 范畴）。在这种情况下，我们谈论的是 **endofunctors** （来自希腊语“endo”，意思是“内部”）。

从现在开始，当提到函子时，除非另有说明，否则一律指 _TS_ 范畴中的 endofunctor。

知道了函子的应用面之后，接下来让我们看看它的正式定义。

## 函子的定义

函子是`(F, map)`的组合，其中：

- `F`是一个`n`元 (n >= 1) 类型构造函数，它将任何类型`X`映射到类型`F<X>`（**对象间的映射**）
- `map`是具有以下签名的函数，它将每个函数`f: (a: A) => B`映射到函数`map(f): (fa: F<A>) => F<B>`（**态射间的映射**）

```ts
map: <A, B>(f: (a: A) => B) => (fa: F<A>) => F<B>;
```

它遵循以下定律：

- `map(1`<sub>X</sub>`)` = `1`<sub>F(X)</sub> (**单位态射映射到单位态射**)
- `map(g ∘ f) = map(g) ∘ map(f)` (**组合的映射是映射的组合**)

依据第二条定律，我们可以重构和优化以下计算：

```ts
import { flow, increment, pipe } from 'fp-ts/function';
import { map } from 'fp-ts/ReadonlyArray';

const double = (n: number): number => n * 2;

// 对数组进行了两次迭代
console.log(pipe([1, 2, 3], map(double), map(increment))); // => [ 3, 5, 7 ]

// 只有一次迭代
console.log(pipe([1, 2, 3], map(flow(double, increment)))); // => [ 3, 5, 7 ]
```

## 函子与函数式风格的错误处理

函子对函数式风格的错误处理有积极的影响，让我们看一个实际的例子：

```ts
declare const doSomethingWithIndex: (index: number) => string;

export const program = (ns: ReadonlyArray<number>): string => {
  // -1表示没有找到元素
  const i = ns.findIndex((n) => n > 0);
  if (i !== -1) {
    return doSomethingWithIndex(i);
  }
  throw new Error('cannot find a positive number');
};
```

使用原生的`findIndex`，我们被迫使用`if`分支来测试结果是否与`-1`不同。如果我们忘记这样做，`-1`可能会无意中作为输入传递给`doSomethingWithIndex`。

相反，让我们看看如何使用`Option`及其函子实例更轻松地获得类似的结果：

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

在实践中，使用`Option`，我们的面前总是一条康庄大道。这都要得益于`map`，让错误处理发生在幕后。

**Demo** (optional)

[`04_functor.ts`](../04_functor.ts)

**测验**：`Task<A>`表示不会失败的异步计算，我们如何建模可能失败的异步计算？

## 函子组合

函子组合，意味着给定两个函子`F`和`G`，则组合`F<G<A>>`仍然是一个函子，并且该组合的`map`是`map`的组合。

**例** (`F = Task`, `G = Option`)

```ts
import { flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';

type TaskOption<A> = T.Task<O.Option<A>>;

export const map: <A, B>(
  f: (a: A) => B,
) => (fa: TaskOption<A>) => TaskOption<B> = flow(O.map, T.map);

// -------------------
// 用例
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

## 逆变函子（Contravariant Functor）

在继续之前，我想展示一下我们在上一节中看到的函子概念的一个变体：**逆变函子**。

实际上，上一节中提到的函子的更准确的名称是**协变函子（covariant functor）**。

逆变函子的定义与协变函子的定义几乎相同，只是其基本操作的签名不同（称为`contramap`而不是`map`）。

<img src="../../images/contramap.png" width="300" alt="contramap" />

**例**：

```ts
import { map } from 'fp-ts/Option';
import { contramap } from 'fp-ts/Eq';

type User = {
  readonly id: number;
  readonly name: string;
};

const getId = (_: User): number => _.id;

// const getIdOption: (fa: Option<User>) => Option<number>
const getIdOption = map(getId);

// const getIdEq: (fa: Eq<number>) => Eq<User>
const getIdEq = contramap(getId);

import * as N from 'fp-ts/number';

const EqID = getIdEq(N.Eq);

/*

在`Eq`一章，我们看到过：

const EqID: Eq<User> = pipe(
  N.Eq,
  contramap((_: User) => _.id)
)
*/
```

## `fp-ts`中的函子

我们如何在`fp-ts`中定义函子实例？让我们看一些例子。

下面的接口建模了通过调用HTTP API得到的一些结果：

```ts
interface Response<A> {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: A;
}
```

请注意，由于`body`是参数化的，这使得`Response`成为查找函子实例的良好选择，因为`Response`是一个`n`元类型构造函数，且`n >= 1`（必要条件） 。

要为`Response`定义函子实例，我们需要定义`map`函数以及`fp-ts`所需的一些[技术细节](https://gcanti.github.io/fp-ts/#higher-kinded-types)。

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

// `Response<A>`的函子实例
export const Functor: Functor1<'Response'> = {
  URI: 'Response',
  map: (fa, f) => pipe(fa, map(f)),
};
```

## 函子解决了核心问题吗

还没有。函子允许我们用纯程序`g`组成一个有作用的程序`f`，但`g`必须是一个**一元（unary）**函数，接受一个参数。如果`g`接受两个或多个参数该怎么办？

| Program f | Program g          | 组合         |
| --------- | ------------------ | ------------ |
| pure      | pure               | `g ∘ f`      |
| effectful | pure (一元)         | `map(g) ∘ f` |
| effectful | pure (n元, `n > 1`) | ?            |

为了能够处理这种情况，我们需要更多的工具，在下一章中我们将看到函数式编程的另一个重要抽象：**应用函子（applicative functor）**。
