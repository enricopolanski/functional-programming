<!-- markdownlint-disable-file MD033 -->
# 单子（Monad）

<img src="../../images/moggi.jpg" width="300" alt="Eugenio Moggi" />

（Eugenio Moggi是意大利热那亚大学计算机科学教授。他首先描述了 monad 构建程序的一般用途）

<img src="../../images/wadler.jpg" width="300" alt="Philip Lee Wadler" />

（Philip Lee Wadler是一位美国计算机科学家，因其对编程语言设计和类型理论的贡献而闻名）

在上一章里，我们看到了如何用一个`n`元纯程序`g`来编写一个有作用的程序`f: (a: A) => F<B>`，当且仅当类型构造函数`F`承认一个应用函子实例：

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure (unary)  | `map(g) ∘ f`    |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |

但我们需要解决最后一个非常常见的情况：当**两个**程序都有作用时：

```ts
f: (a: A) => F<B>;
g: (b: B) => F<C>;
```

`f`和`g`的组合是什么？

## 嵌套上下文的问题

让我们看几个例子来说明为什么我们需要更多工具。

**例** (`F = Array`)

假设我们想获得followe的followers。

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

这里有一些问题，`followersOfFollowers`的类型为`ReadonlyArray<ReadonlyArray<User>>`，但我们想要的是`ReadonlyArray<User>`。

我们需要 **展平（flatten）** 嵌套数组。

`fp-ts/ReadonlyArray`导出的函数`flatten: <A>(mma: ReadonlyArray<ReadonlyArray<A>>) => ReadonlyArray<A>`正是我们所需要的：

```ts
// followersOfFollowers: ReadonlyArray<User>
const followersOfFollowers = pipe(
  user,
  getFollowers,
  A.map(getFollowers),
  A.flatten,
);
```

看起来不错！让我们看看其他的数据类型。

**例** (`F = Option`)

假设要计算number数组第一个元素的倒数：

```ts
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/ReadonlyArray';

const inverse = (n: number): O.Option<number> =>
  n === 0 ? O.none : O.some(1 / n);

// inverseHead: O.Option<O.Option<number>>
const inverseHead = pipe([1, 2, 3], A.head, O.map(inverse));
```

类似的事情在这里也发生了。`inverseHead`的类型是`Option<Option<number>>`，但我们想要的是`Option<number>`。

我们需要展平嵌套的`Option`。

`fp-ts/Option`导出的函数`flatten: <A>(mma: Option<Option<A>>) => Option<A>`正是我们所需要的：

```ts
// inverseHead: O.Option<number>
const inverseHead = pipe([1, 2, 3], A.head, O.map(inverse), O.flatten);
```

所有这些`flatten`并不是巧合。在幕后有一个函数模式：两个类型构造函数`ReadonlyArray`和`Option`（以及其他）承认 **monad 实例** 并且

> `flatten`是单子最特殊的运算

**注**：`flatten`的常见同义词是**join**.

所以，什么是单子？

以下是它们经常被呈现的方式。

## 单子定义

**定义**：单子由三部分组成：

(1) 承认函子实例的类型构造函数`M`

(2) 具有以下签名的`of`（也叫 **pure** 或 **return**）函数：

```ts
of: <A,>(a: A) => M<A>;
```

(3) 具有以下签名的`chain`（也叫 **flatMap** 或 **bind**）函数：

```ts
chain: <A, B>(f: (a: A) => M<B>) => (ma: M<A>) => M<B>;
```

`of`与`chain`需要遵守三个定律：

- `chain(of) ∘ f = f` (**左单位元**)
- `chain(f) ∘ of = f` (**右单位元**)
- `chain(h) ∘ (chain(g) ∘ f) = chain((chain(h) ∘ g)) ∘ f` (**结合律**)

其中`f`、`g`、`h`都是effectful函数，`∘`是通常的函数组合。

当第一次看到这个定义时，我有很多疑问：

- 为什么需要`of`和`chain`？为什么他们需要这样的签名？
- 为什么它们有`pure`或`flatMap`等同义词？
- 为什么需要遵守三个定律？他们的意思是什么？
- 如果`flatten`对于单子如此重要，为什么它的定义不具有可比性？

这一章将尝试回答上述问题。

让我们回到核心问题：两个effectful函数`f`和`g`的组合是什么？

<img src="../../images/kleisli_arrows.png" alt="two Kleisli arrows, what's their composition?" width="450px" />

（两个Kleisli箭头）

**注**：effectful函数也称为**Kleisli箭头**。

目前为止我甚至不知道这种组合的**类型**。

但我们已经看到了一些专门讨论组合的抽象概念。还记得范畴吗？

> 范畴抓住了组合的本质

我们可以将我们的问题转化为范畴问题，也就是说：我们能否找到一个模拟Kleisli箭头组合的范畴？

## Kleisli范畴

<img src="../../images/kleisli.jpg" width="300" alt="Heinrich Kleisli" />

(Heinrich Kleisli, 瑞士数学家)

让我们尝试构建一个范畴 _K_（称为 **Kleisli 范畴**），其中 _仅_ 包含Kleisli箭头：

- **对象** 与 _TS_ 范畴相同，所以是TypeScript的所有类型
- **态射** 是这样构建的：每当 _TS_ 中有一个 Kleisli 箭头`f: A ⟼ M<B>`时，我们就在 _K_ 中绘制一个箭头`f': A ⟼ B`

<img src="../../images/kleisli_category.png" alt="above the TS category, below the K construction" width="400px" />

（上方是 _TS_ 范畴中的组合，下方是 _K_ 结构中的组合）

那么 _K_ 中的`f`和`g`的组合是什么？它是下图中名为`h`的红色箭头：

<img src="../../images/kleisli_composition.png" alt="above the composition in the TS category, below the composition in the K construction" width="400px" />

假设`h`是`K`中从`A`到`C`的箭头，我们可以在`TS`中找到从`A`到`M<C>`的对应函数`h`。

因此，_TS_ 中`f`和`g`的组合一个很好的候选者仍然是具有以下签名的 Kleisli 箭头：`(a: A) => M<C>`。

让我们尝试实现这样一个函数。

## 逐步定义`chain`

单子定义的第一点 (1) 告诉我们`M`承认一个函子实例，因此我们可以使用`map`将`g: (b: B) => M<C>`转换为`map(g): (mb: M<B>) => M<M<C>>`

<img src="../../images/flatMap.png" alt="where chain comes from" width="450px" />

（如何获得`h`函数）

但这里我们陷入了困境：函子实例没有合法的操作允许我们将`M<M<C>>`展平为`M<C>`。我们需要一个额外的操作，我们称之为`flatten`。

如果我们可以定义这样的操作，那么我们就可以找到我们正在寻找的组合：

```plaintext
h = flatten ∘ map(g) ∘ f
```

通过融合`flatten ∘ map(g)`，我们可以得到`flatMap`，这就是名字的由来。

这样我们就可以得到`chain`

```plaintext
chain = flatten ∘ map(g)
```

<img src="../../images/chain.png" alt="how chain operates on the function g" width="400px" />

（`chain`如何对`g`进行操作）

现在我们可以更新我们的组合表了

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure (unary)  | `map(g) ∘ f`    |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |
| effectful | effectful     | `chain(g) ∘ f`  |

那`of`呢？
`of`来自 _K_ 中的恒等态射：对于 _K_ 中的每个恒等态射 1<sub>A</sub> ，必须有一个从`A`到`M<A>`的对应函数（即，`of: <A>(a: A) => M<A>`）。

<img src="../../images/of.png" alt="where of comes from" width="300px" />

（ `of`的出处）

事实上，`of`是`chain`的单位元素，允许以下的流量控制（很常见）：

```ts
pipe(
  mb,
  M.chain((b) => (predicate(b) ? M.of(b) : g(b))),
);
```

其中，`predicate: (b: B) => boolean`，`mb: M<B>`，`g: (b: B) => M<B>`.

最后一个问题：定律从何而来？只不过是 _K_ 中的范畴定律翻译到了 _TS_ 中：

| Law     | _K_                              | _TS_                                                  |
| ------- | -------------------------------- | ----------------------------------------------------- |
| 左单位元 | 1<sub>B</sub> ∘ `f'` = `f'`       | `chain(of) ∘ f = f`                                   |
| 右单位元 | `f'` ∘ 1<sub>A</sub> = `f'`       | `chain(f) ∘ of = f`                                   |
| 结合律   | `h' ∘ (g' ∘ f') = (h' ∘ g') ∘ f'`| `chain(h) ∘ (chain(g) ∘ f) = chain((chain(h) ∘ g)) ∘ f` |

现在让我们现在回到嵌套上下文的例子，可以使用`chain`来解决它们：

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

让我们看看如何为我们已经见过的常见类型构造函数实现`chain`：

**例** (`F = ReadonlyArray`)

```ts
// 将`B -> ReadonlyArray<C>`转化为`ReadonlyArray<B> -> ReadonlyArray<C>`
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

**例** (`F = Option`)

```ts
import { match, none, Option } from 'fp-ts/Option';

// 将`B -> Option<C>`转化为`Option<B> -> Option<C>`
const chain = <B, C>(g: (b: B) => Option<C>): ((mb: Option<B>) => Option<C>) =>
  match(() => none, g);
```

**例** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO';

// 将`B -> IO<C>`转化为`IO<B> -> IO<C>`
const chain =
  <B, C>(g: (b: B) => IO<C>) =>
  (mb: IO<B>): IO<C> =>
  () =>
    g(mb())();
```

**例** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task';

// 将`B -> Task<C>`转化为`Task<B> -> Task<C>`
const chain =
  <B, C>(g: (b: B) => Task<C>) =>
  (mb: Task<B>): Task<C> =>
  () =>
    mb().then((b) => g(b)());
```

**例** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader';

// 将`B -> Reader<R, C>`转化为`Reader<R, B> -> Reader<R, C>`
const chain =
  <B, R, C>(g: (b: B) => Reader<R, C>) =>
  (mb: Reader<R, B>): Reader<R, C> =>
  (r) =>
    g(mb(r))(r);
```

## 程序操作

现在让我们看看，如何借助引用透明性和单子，以编程方式操作程序。

这是一个读/写文件的小程序：

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

下列动作

```ts
pipe(readFile('file.txt'), chain(log));
```

在程序中重复多次，但鉴于引用透明性成立，我们可以将其分解并将其分配给一个常量：

```ts
const read = pipe(readFile('file.txt'), chain(log));
const modify = modifyFile('file.txt', (s) => s + '\n// eof');

const program2 = pipe(
  read,
  chain(() => modify),
  chain(() => read),
);
```

我们甚至可以定义一个combinator并利用它使代码更加简洁：

```ts
const interleave = <A, B>(action: IO<A>, middle: IO<B>): IO<A> =>
  pipe(
    action,
    chain(() => middle),
    chain(() => action),
  );

const program3 = interleave(read, modify);
```

再比如：为`IO`实现一个类似Unix的`time`（与执行时间相关的部分）的功能。

```ts
import * as IO from 'fp-ts/IO';
import { now } from 'fp-ts/Date';
import { log } from 'fp-ts/Console';
import { pipe } from 'fp-ts/function';

// 记录计算长度（以毫秒为单位）
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

**注**：如你所见，当需要维护范围时使用`chain`会导致冗长的代码。在原生支持单子风格的语言中，通常支持名为“do notation”的语法，可以缓解这种情况。

让我们看一个Haskell的例子

```haskell
now :: IO Int
now = undefined -- Haskell中`undefined`相当于TypeScript的声明

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

TypeScript 不支持这种语法，但可以用类似的东西来模拟：

```ts
import { log } from 'fp-ts/Console';
import { now } from 'fp-ts/Date';
import { pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';

// 记录计算长度（以毫秒为单位）
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

让我们看一个`time`的用例：

```ts
import { randomInt } from 'fp-ts/Random';
import { Monoid, concatAll } from 'fp-ts/Monoid';
import { replicate } from 'fp-ts/ReadonlyArray';

const fib = (n: number): number => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2));

// 使用 30 到 35 之间的随机整数启动`fib`
// 记录输入和输出
const randomFib: IO.IO<void> = pipe(
  randomInt(30, 35),
  IO.chain((n) => log([n, fib(n)])),
);

// `IO<void>`的monoid实例
const MonoidIO: Monoid<IO.IO<void>> = {
  concat: (first, second) => () => {
    first();
    second();
  },
  empty: IO.of(undefined),
};

// 执行`n`次`mv`计算
const replicateIO = (n: number, mv: IO.IO<void>): IO.IO<void> =>
  concatAll(MonoidIO)(replicate(n, mv));

// -------------------
// 用例
// -------------------

time(replicateIO(3, randomFib))();
/*
[ 31, 2178309 ]
[ 33, 5702887 ]
[ 30, 1346269 ]
Elapsed: 89
*/
```

还记录了部分内容：

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

使用单子接口（`map`、`of`、`chain`）最有趣的方面之一是可以注入程序所需的依赖项，包括**连接不同计算的方式**。

为了看到这一点，让我们重构一下读取和写入文件的小程序：

```ts
import { IO } from 'fp-ts/IO';
import { pipe } from 'fp-ts/function';

// -----------------------------------------
// Deps 接口，在六边形架构中称之为“端口”
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
// 一个 `Deps` 实例，我们在六边形架构中称之为“适配器”
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

// 依赖注入，DI
program4(DepsSync)();
```

不仅如此，我们甚至可以抽象出程序运行的作用。我们可以定义自己的`FileSystem`效果（代表对文件系统的读写操作的作用）：

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

通过简单更改`FileSystem`的定义即可达到效果。我们可以修改程序，使其异步运行

```diff
// -----------------------------------------
// our program's effect
// -----------------------------------------

-interface FileSystem<A> extends IO<A> {}
+interface FileSystem<A> extends Task<A> {}
```

现在剩下的就是修改“Deps”实例以适应新的定义。

```ts
import { Task } from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';

// -----------------------------------------
// our program's effect (修改过的)
// -----------------------------------------

interface FileSystem<A> extends Task<A> {}

// -----------------------------------------
// 依赖 (未修改的)
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
// program (未修改的)
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
// a `Deps` instance (修改的)
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

**测验**：前面的示例故意忽略了可能的错误。示例：我们正在操作的文件可能根本不存在。我们如何修改`FileSystem`效果以考虑到这一点？

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

**Demo**:

[`06_game.ts`](../06_game.ts)
