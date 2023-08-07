<!-- markdownlint-disable-file MD033 -->
# 应用函子（applicative functor）

在关于函子的部分中，我们已经看到，我们可以通过将`g`转换为`map(g): (fb: F<B>) => F<C>`来组合`f: (a: A) => F<B>`与`g: (b: B) => C`（当且仅当`F`承认函子实例）。

| `f`       | `g`        | 组合          |
| --------- | ---------- | ------------ |
| pure      | pure       | `g ∘ f`      |
| effectful | pure (一元) | `map(g) ∘ f` |

但`g`必须是一元的，它只能接受单个参数作为输入。如果`g`接受两个参数会发生什么？我们仍然可以仅使用函子实例来转换`g`吗？

## 柯里化（Currying）

首先，我们需要建模一个函数，它接受两个参数，类型分别为`B`和`C`（我们可以使用元组），并返回一个`D`类型的值：

```ts
g: (b: B, c: C) => D;
```

我们可以使用一种称为 **柯里化** 的技术来重写`g`。

> 柯里化是一种将带有多个参数的函数的求值转换为求值一系列函数的技术，**每个函数都有一个参数**。例如，一个函数接受两个参数`B`、`C`，并返回`D`。通过柯里化，该函数会被转换为一个接受单个参数`C`，并返回一个接受`B`返回`C`的函数。

(来源: [currying on wikipedia.org](https://en.wikipedia.org/wiki/Currying))

因此，通过柯里化，我们可以将 `g` 重写为：

```ts
g: (b: B) => (c: C) => D;
```

**例**：

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

让我们用柯里化重构`addFollower`

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
// 用例
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

## `ap`运算

假设：

- 我们没有一个完整的`follower`只有他的`id`
- 我们没有一个完整的`user`只有他的`id`
- 我们有一个`fetchUser` API，给定一个`id`，他会查询并返回而相应的`User`

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

const result = addFollower(fetchUser(followerId))(fetchUser(userId)); // 无法通过编译
```

我没法再使用`addFollower`了！我们该怎么办？

如果我们有一个具有以下签名的函数：

```ts
declare const addFollowerAsync: (
  follower: T.Task<User>,
) => (user: T.Task<User>) => T.Task<User>;
```

我们可以轻松地继续：

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

很显然，我们可以手动实现`addFollowerAsync`，但是是否可以找到一种方式，将`addFollower: (follower: User) => (user: User): User`转换为 `addFollowerAsync: (follower: Task<User>) => (user: Task<User>) => Task<User>`？

更一般地说，我们想要的是一个转换，称之为`liftA2`，它以函数`g: (b: B) => (c: C) => D`开始，返回一个具有以下签名的函数：

```ts
liftA2(g): (fb: F<B>) => (fc: F<C>) => F<D>
```

<img src="../../images/liftA2.png" width="500" alt="liftA2" />

我们怎样才能获得它呢？鉴于`g`现在是一个一元函数，我们可以利用函子实例和`map`：

```ts
map(g): (fb: F<B>) => F<(c: C) => D>
```

<img src="../../images/liftA2-first-step.png" width="500" alt="liftA2 (first step)" />

现在我们被卡住了：函子实例没有提供合法的操作来将`F<(c: C) => D>`解包为`(fc: F<C>) => F<D>` 。

我们需要引入一个新的操作`ap`来实现这种解包：

```ts
declare const ap: <A>(fa: Task<A>) => <B>(fab: Task<(a: A) => B>) => Task<B>;
```

**注**：为什么要叫`ap`？因为它可以被看作某种函数应用程序。

```ts
// `apply`应用函数到某一个值
declare const apply: <A>(a: A) => <B>(f: (a: A) => B) => B;

declare const ap: <A>(a: Task<A>) => <B>(f: Task<(a: A) => B>) => Task<B>;
// `ap` 将包装在作用中的函数应用于包装在作用中的值
```

有了`ap`现在我们可以定义`liftA2`了:

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

最后，我们可以将`fetchUser`与之前的结果组合起来

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

我们找到了组合`f: (a: A) => F<B>`, `g: (b: B, c: C) => D`的标准过程：

1. 通过柯里化将`g`转化为`g: (b: B) => (c: C) => D`
2. 为作用`F`定义`ap`函数（库函数）
3. 为作用`F`定义utility函数`liftA2`（库函数）
4. 得到组合`flow(f, liftA2(g))`

让我们看看如何为已经见过的一些类型构造函数实现`ap`：

**例** (`F = ReadonlyArray`)

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

**例** (`F = Option`)

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

**例** (`F = IO`)

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

**例** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task';

const ap =
  <A,>(fa: Task<A>) =>
  <B,>(fab: Task<(a: A) => B>): Task<B> =>
  () =>
    Promise.all([fab(), fa()]).then(([f, a]) => f(a));
```

**例** (`F = Reader`)

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

我们已经了解了如何使用`ap`来处理具有两个参数的函数，但是对于采用三个参数的函数该怎么办呢？我们还需要 _另一个抽象_ 吗？

好消息是不需要，`map`和`ap`就足够了：

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

// 等等...
```

现在我们可以更新"组合表"了：

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure (一元)    | `map(g) ∘ f`    |
| effectful | pure, `n`元   | `liftAn(g) ∘ f` |

## `of`运算

现在我们知道，给定两个函数`f: (a: A) => F<B>`，`g: (b: B, c: C) => D`，我们可以得到它们的组合`h`：

```ts
h: (a: A) => (fc: F<C>) => F<D>;
```

为了执行`h`，我们需要一个`A`类型的值与一个`F<C>`类型的值.

但是，如果对于第二个参数`fc`，我们只有`C`类型的值，而没有`F<C>`类型的值，会发生什么情况？

如果有一个操作可以将`C`类型的值转换为`F<C>`类型的值，以便使用`h`，将会很有帮助。

我们来介绍一下这样的操作，称为`of`（其他同义词：**pure**、**return**）：

```ts
declare const of: <C>(c: C) => F<C>;
```

在文献中，术语**应用函子**用于承认`ap`和`of`的类型构造函数。

让我们看看如何为我们已经见过的一些类型构造函数定义`of`：

**例** (`F = ReadonlyArray`)

```ts
const of = <A,>(a: A): ReadonlyArray<A> => [a];
```

**例** (`F = Option`)

```ts
import * as O from 'fp-ts/Option';

const of = <A,>(a: A): O.Option<A> => O.some(a);
```

**例** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO';

const of =
  <A,>(a: A): IO<A> =>
  () =>
    a;
```

**例** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task';

const of =
  <A,>(a: A): Task<A> =>
  () =>
    Promise.resolve(a);
```

**例** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader';

const of =
  <R, A>(a: A): Reader<R, A> =>
  () =>
    a;
```

**Demo**：

[`05_applicative.ts`](../05_applicative.ts)

## 组合应用函子

应用函子，意味着给定两个应用函子`F`和`G`，它们的组合`F<G<A>>`仍然是一个应用函子。

**例** (`F = Task`, `G = Option`)

组合的`of`等于`of`的组合：

```ts
import { flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';

type TaskOption<A> = T.Task<O.Option<A>>;

const of: <A>(a: A) => TaskOption<A> = flow(O.of, T.of);
```

组合的`ap`通过以下方式获得：

```ts
const ap = <A,>(
  fa: TaskOption<A>,
): (<B>(fab: TaskOption<(a: A) => B>) => TaskOption<B>) =>
  flow(
    T.map((gab) => (ga: O.Option<A>) => O.ap(ga)(gab)),
    T.ap(fa),
  );
```

## 应用函子解决了核心问题吗？

还没有。最后一个非常重要的情况需要考虑：当**两个**程序都产生作用时。

我们还需要更多的工具，在下一章中我们将讨论函数式编程中最重要的抽象之一：**单子（monad）**。
