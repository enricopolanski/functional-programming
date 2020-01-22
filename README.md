## Introduction

This is a fork of [Giulio Canti](https://gcanti.github.io/about.html)'s ["Introduction to Functional Programming (Italian)"](https://github.com/gcanti/functional-programming). The author uses this repository as a reference for his lectures and workshops on functional programming.

The spirit of this fork is to provide a reference and an introduction to functional programming targetting the modern web developer based on Giulio's work. Additions to the translation are listed in the final section. 

Contributions are welcome, see the contribution file.

# Table of Content:

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [What is functional programming](#what-is-functional-programming)
- [The two pillars of functional programming](#the-two-pillars-of-functional-programming)
  - [Referential transparency](#referential-transparency)
  - [Composition](#composition)
    - [Combinators](#combinators)
- [Semigroups](#semigroups)
  - [General Definition](#general-definition)
  - [Implementation](#implementation)
  - [The `fold` function](#the-fold-function)
  - [The dual semigroup](#the-dual-semigroup)
  - [Finding a Semigroup instance for any type](#finding-a-semigroup-instance-for-any-type)
  - [Semigroup product](#semigroup-product)
  - [Equality and ordering](#equality-and-ordering)
  - [Equivalence relations as partitions](#equivalence-relations-as-partitions)
- [Ord](#ord)
- [Monoids](#monoids)
  - [Implementation](#implementation-1)
  - [Folding](#folding)
- [Pure and partial functions](#pure-and-partial-functions)
  - [6.1. Funzioni parziali](#61-funzioni-parziali)
- [7. ADT e error handling funzionale](#7-adt-e-error-handling-funzionale)
  - [7.1. Che cos'è un ADT?](#71-che-cos%C3%A8-un-adt)
  - [7.2. Product types](#72-product-types)
    - [7.2.1. Perchè "product" types?](#721-perch%C3%A8-product-types)
    - [7.2.2. Quando posso usare un product type?](#722-quando-posso-usare-un-product-type)
  - [7.3. Sum types](#73-sum-types)
    - [7.3.1. Costruttori](#731-costruttori)
    - [7.3.2. Pattern matching](#732-pattern-matching)
    - [7.3.3. Perchè "sum" types?](#733-perch%C3%A8-sum-types)
    - [7.3.4. Quando dovrei usare un sum type?](#734-quando-dovrei-usare-un-sum-type)
  - [7.4. Functional error handling](#74-functional-error-handling)
    - [7.4.1. Il tipo `Option`](#741-il-tipo-option)
    - [7.4.2. Il tipo `Either`](#742-il-tipo-either)
- [8. Teoria delle categorie](#8-teoria-delle-categorie)
  - [8.1. Definizione](#81-definizione)
    - [8.1.1. Parte I (Costituenti)](#811-parte-i-costituenti)
    - [8.1.2. Parte II (Composizione)](#812-parte-ii-composizione)
  - [8.2. Categorie come linguaggi di programmazione](#82-categorie-come-linguaggi-di-programmazione)
  - [8.3. Una categoria per TypeScript](#83-una-categoria-per-typescript)
  - [8.4. Il problema centrale della composizione](#84-il-problema-centrale-della-composizione)
- [9. Funtori](#9-funtori)
  - [9.1. Funzioni come programmi](#91-funzioni-come-programmi)
  - [9.2. Come il vincolo `B = F<C>` conduce ai funtori...](#92-come-il-vincolo-b--fc-conduce-ai-funtori)
    - [9.2.1. Definizione](#921-definizione)
  - [9.3. Funtori in `fp-ts`](#93-funtori-in-fp-ts)
  - [9.4. Composizione di funtori](#94-composizione-di-funtori)
  - [9.5. Abbiamo risolto il problema generale?](#95-abbiamo-risolto-il-problema-generale)
  - [9.6. Funtori controvarianti](#96-funtori-controvarianti)
- [10. Funtori applicativi](#10-funtori-applicativi)
  - [10.1. Currying](#101-currying)
  - [10.2. Apply](#102-apply)
  - [10.3. Applicative](#103-applicative)
  - [10.4. Lifting](#104-lifting)
  - [10.5. Composizione di funtori applicativi](#105-composizione-di-funtori-applicativi)
  - [10.6. Abbiamo risolto il problema generale?](#106-abbiamo-risolto-il-problema-generale)
- [11. Monadi](#11-monadi)
  - [11.1. Il problema: nested contexts](#111-il-problema-nested-contexts)
  - [11.2. Definizione](#112-definizione)
  - [11.3. Ok ma... perchè?](#113-ok-ma-perch%C3%A8)
  - [11.4. La categoria di Kleisli](#114-la-categoria-di-kleisli)
  - [11.5. Costruzione della composizione passo dopo passo](#115-costruzione-della-composizione-passo-dopo-passo)
  - [11.6. Le leggi](#116-le-leggi)
  - [11.7. Monadi in `fp-ts`](#117-monadi-in-fp-ts)
  - [11.8. Trasparenza referenziale](#118-trasparenza-referenziale)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# What is functional programming

> Though programming was born in mathematics, it has since largely been divorced from it.
> The idea is that there's some higher level than the code in which you need to be able to think precisely,
> and that mathematics actually allows you to think precisely about it - Leslie Lamport

Functional programming's goal is to dominate a system's complexity through the use of formal _models_, careful attention is given to code's proprierties.

> Functional programming will help teach people the mathematics behind program construction: how to write composable code, how to reason about effects, how to write consistent, general, less ad-hoc APIs

**Example**

Why's `map` "more functional" than a `for` loop?

```ts
const xs = [1, 2, 3]

function double(n: number): number {
  return n * 2
}

const ys: Array<number> = []
for (let i = 0; i < xs.length; i++) {
  ys.push(double(xs[i]))
}

const zs = xs.map(double)
```

A `for` loop offers more flexibility: I can modify the starting index (initialization), the looping condition (condition), and the final expression.
This also implies that I may introduce errors and that I have no guarantee about the returned value.

A `map`ping function gives me several guarantees: all the input elements will be passed to the mapping function, regardless of the content of the callback function provided, the resulting array will **always** have the same number of elements of the starting one.

# The two pillars of functional programming

- Referential transparency
- Composition (as universal design pattern)

## Referential transparency

> An **expression** is said to be _referentially transparent_ if it can be replaced with its corresponding value without changing the program's behavior

**Example**

```ts
function double(n: number): number {
  return n * 2
}

const x = double(2)
const y = double(2)
```

The expression `double(2)` benefits the referential transparency property because I can substitute it with its value.

```ts
const x = 4
const y = x
```

Not every expression benefits from referential transparency, let's see an example.

**Example**

```ts
function inverse(n: number): number {
  if (n === 0) throw new Error('cannot divide by zero')
  return 1 / n
}

const x = inverse(0) + 1
```

I can't replace `inverse(0)` with its value, thus it doesn't benefits from referential transparency.

Why is referential transparency so important? Because it allows us to:

- reason better about our code
- **refactor** without changing our system's behavior

**Example**

```ts
declare function question(message: string): Promise<string>

const x = await question('What is your name?')
const y = await question('What is your name?')
```

Can I refactor in this way?

```ts
const x = await question('What is your name?')
const y = x
```

<!-- 
  TODO: Type systems honesty
 -->

## Composition

Functional programming's fundamental pattern is  _composition_: we compose small units of code accomplishing very specific tasks into larger and complex units.

<!--
   TODO: Complex vs complicated
-->

At a higher level the aim is _modular programming_:

> By modular programming I mean the process of building large programs by gluing together smaller programs - Simon Peyton Jones

### Combinators

The term **combinator** refers to the [combinator pattern](https://wiki.haskell.org/Combinator):

> A style of organizing libraries centered around the idea of combining things. Usually there is some type `T`, some "primitive" values of type `T`, and some "combinators" which can combine values of type `T` in various ways to build up more complex values of type `T`

The general form of a combinator is:

```ts
combinator: Thing -> Thing
```

The goal of a combinator is to create new _things_ from _things_ defined before.

Since this new _Thing_ result can be passed around as input we obtain a combinatory explosion of opportunities, which makes this pattern extremely powerful.

If we mix several different combinators together we can obtain an even _bigger_ combinatory explosion.

Thus the usual design you can find in a functional module is:

- a small set of "primitives"
- a set of combinators to combine the primitives in largers structures

**Demo**

> Sometimes, the elegant implementation is just a function. Not a method. Not a class. Not a framework. Just a function. - John Carmack

[`01_retry.ts`](src/01_retry.ts)

Of the two combiners in `01_retry.ts` a special mention goes to `concat` since it's possible to refert to with as another functional programming abstraction: semigroups.

# Semigroups

Another term we could associate to _functional_ programming might be _algebraic_ programming:

> Algebras can be tought as the design patterns for functional programming

An **algebra** is generally defined as whavever combination of:

- sets
- operations
- laws

Algebras are how mathematicians try to capture an idea in its purest form, eliminating everything that is superfluous.

Algebras can be thought as an abstraction of interfaces: when an algebraic structure is modifyed only the operations defined by the algebra are allowed in compliance with its own laws.

Mathematicians work with such interfaces from centuries, and it works.

Let's see our first example of an algebra, a _magma_.

**Definition**. Given `A` a non empty set and `*` a binary operation _closed on_ (or _internal to_) `A` such as `*: A × A ⟶ A`,
then the pair `(A, *)` is called a _magma_.

> Because the binary operation of a magma takes two values of a given type and returns a new value of the same type (*closure property*), this operation can be chained indefinitely.

The fact that the operation has to be _closed_ is a fundamental property. Example given, in the set of the natural numbers, sum is a closed operation, substraction is not.

<!-- 
  TODO: L’operazione di sottrazione non è un’operazione interna all’insieme \mathbb{N} dei numeri naturali.
-->

And this is the encoding of a magma in TypeScript:

- the set is encoded in a type parameter
- the `*` operation is here called `concat`

```ts
// fp-ts/lib/Magma.ts

interface Magma<A> {
  readonly concat: (x: A, y: A) => A
}
```

Magmas do not obey any law, ther'e only the closure requirement. Let's see an algebra that do requires another law: semigroups.

## General Definition

Given `(A, *)` a magma, if `*` è **associative** then it's a _semigroup_.

The term "associative" means that the equation:

```ts
(x * y) * z = x * (y * z)
```

holds for any `x`, `y`, `z` in `A`.

Associativity tells us that we do not have to need to worry about parentheses in expressions and that, we can simply write `x * y * z` (there's no ambiguity).

**Example**

String concatenation benefits from associativity.

```ts
("a" + "b") + "c" = "a" + ("b" + "c") = "abc"
```

<!-- 
  TODO: This part on computations being able to be further split in two sub computations isn't clear. How do I further split "a" + "b" without the presence of a neutral element ""?
 -->

A characteristic of associativity is that:

> Semigroups capture the essence of parallelizable operations

If we know that there is such an operation that follows the associativity law we can further split a computation in two sub computations, each of them could be further split in sub computations.

```ts
a * b * c * d * e * f * g * h = ((a * b) * (c * d)) * ((e * f) * (g * h))
```

Sub computations can be run in parallel mode.

There are many examples of semigroups:

- `(number, +)` where `+` is the usual addition of numbers
- `(number, *)` where `*` is the usual number moltiplication
- `(string, +)` where `+` is the usual string concatenation
- `(boolean, &&)` where `&&` is the [logical conjuction](https://en.wikipedia.org/wiki/Logical_conjunction)
- `(boolean, ||)` where `||` is the [logical disjunction](https://en.wikipedia.org/wiki/Logical_disjunction)

## Implementation

As usual in `fp-ts` the algebra `Semigroup`, contained in the the `fp-ts/lib/Semigroup` module, is implemented through a TypeScript `interface`:

<!-- 
  TODO: implementation of a Magma?
-->

```ts
// fp-ts/lib/Semigroup.ts

interface Semigroup<A> extends Magma<A> {}
```

The following law has to hold true:

- **Associativity**: `concat(concat(x, y), z) = concat(x, concat(y, z))`, for every `x`, `y`, `z` in `A`

**Note**. Sadly it is not possible to encode this law in TypeScript's type system.

The name `concat` makes sense for arrays (as we'll see later) but, depending on the context and the type `A` on whom we're implementing an instance, the `concat` semigroup operation may have different interpretations and meanings:

- "concatenation"
- "merging"
- "fusion"
- "selection"
- "addition"
- "substitution"

and many others.

**Example**

This is how to implement the semigroup `(number, +)` where `+` is the usual addition of numbers:

```ts
/** number `Semigroup` under addition */
const semigroupSum: Semigroup<number> = {
  concat: (x, y) => x + y
}
```

Please note that for the same type it is possible to define more **instances** of the **type class* `Semigroup`.
 

This is the implementation for the semigroup `(number, *)` where `*` is the usual number multiplication:

```ts
/** number `Semigroup` under multiplication */
const semigroupProduct: Semigroup<number> = {
  concat: (x, y) => x * y
}
```

Another example, with two strings this time:

```ts
const semigroupString: Semigroup<string> = {
  concat: (x, y) => x + y
}
```

## The `fold` function

By definition `concat` combines merely two elements of `A` every time, is it possible to combine any _n_ number of them?

The `fold` function takes:
  - an instance of a semigroup
  - an initial value
  - an array of elements

<!--
  TODO: Refactor with HM types.
-->

```ts
import { fold, semigroupSum, semigroupProduct } from 'fp-ts/lib/Semigroup'

const sum = fold(semigroupSum)

sum(0, [1, 2, 3, 4]) // 10

const product = fold(semigroupProduct)

product(1, [1, 2, 3, 4]) // 24
```

**Quiz**. Why do I need to provide an initial value?

**Example**

Lets provide some applications of `fold`, by reimplementing some popular functions of the JavaScript standard library.

```ts
import { Predicate } from 'fp-ts/lib/function'
import { fold, Semigroup, semigroupAll, semigroupAny } from 'fp-ts/lib/Semigroup'

function every<A>(p: Predicate<A>, as: Array<A>): boolean {
  return fold(semigroupAll)(true, as.map(p))
}

function some<A>(p: Predicate<A>, as: Array<A>): boolean {
  return fold(semigroupAny)(false, as.map(p))
}

const semigroupObject: Semigroup<object> = {
  concat: (x, y) => ({ ...x, ...y })
}

function assign(as: Array<object>): object {
  return fold(semigroupObject)({}, as)
}
```

## The dual semigroup

Given a Semigroup instance, it is possible to obtain a new Semigroup instance simply swapping the order in which the operands are combined:

```ts
// this is a Semigroup combinator
function getDualSemigroup<A>(S: Semigroup<A>): Semigroup<A> {
  return {
    concat: (x, y) => S.concat(y, x)
  }
}
```

**Quiz**. This combinator makes sense because generally speaking the `concat` operation is not **commutative**, can you find an example?

<!--  -->

## Finding a Semigroup instance for any type

What happens if, given a specific type `A` we can't find an associative binary operation on `A`?

You can **always** define a semigroup instance for **any**instance for **any** given type using the following constructors:

```ts
// fp-ts/lib/Semigroup.ts

/** Always return the first argument */
function getFirstSemigroup<A = never>(): Semigroup<A> {
  return {
    concat: (x, y) => x
  }
}

/** Always return the second argument */
function getLastSemigroup<A = never>(): Semigroup<A> {
  return {
    concat: (x, y) => y
  }
}
```

**Quiz**: Can you explain the presence of the `= never` for the type parameter `A`? 

Another technique is to define a semigroup instance not for the `A` type but for `Array<A>` (to be precise, it is a semigroup instance not for `A` but for the non-empty arrays of `A`) called the **free semigroup** of `A`.

```ts
function getSemigroup<A = never>(): Semigroup<Array<A>> {
  return {
    concat: (x, y) => x.concat(y)
  }
}
```

and then we can map the elements of `A` to the singleton (a one-dimensional tuple) of `Array<A>` meaning an array with only one A element.

```ts
function of<A>(a: A): Array<A> {
  return [a]
}
```

**Notes**. The `concat` in `getSemigroup` is the native array concat operation, this also explains why concat is the name of `*`, the binary associative operation of semigroups.


The free semigroup of `A` thus is simply the semigroup whose elements are all the possible finite and non-empty combinations of `A` elements.

<!-- 
  TODO: Alphabet and words.
-->

The free semigroup of  `A` can be seen as a *lazy* way of concatenating elements of `A` while preserving the content of `A`.

Even tho I may have an instance of a semigroup for `A`, I could very well decide to use the free semigroup nonetheless becase:

- it avoids executing potentially useless computations
- it avoids passing around the semigroup instance
- allows the consumer of my APIs to decide the merging strategy

## Semigroup product

Let's try defining a semigroup instance for mor complex types:

```ts
import { Semigroup, semigroupSum } from 'fp-ts/lib/Semigroup'

type Point = {
  x: number
  y: number
}

const semigroupPoint: Semigroup<Point> = {
  concat: (p1, p2) => ({
    x: semigroupSum.concat(p1.x, p2.x),
    y: semigroupSum.concat(p1.y, p2.y)
  })
}
```

Too much boilerplate? The good news is that we can construct a semigroup instance for a struct like `Point` if we are able to provide a semigroup instance for each of its fields.

Conveniently the `fp-ts/lib/Semigroup` module exports a `getStructSemigroup` instance:

```ts
import { getStructSemigroup, Semigroup, semigroupSum } from 'fp-ts/lib/Semigroup'

type Point = {
  x: number
  y: number
}

const semigroupPoint: Semigroup<Point> = getStructSemigroup({
  x: semigroupSum,
  y: semigroupSum
})
```

We can keep passing to `getStructSemigroup` the freshly defined `semigroupPoint` instance.:

```ts
type Vector = {
  from: Point
  to: Point
}

const semigroupVector: Semigroup<Vector> = getStructSemigroup({
  from: semigroupPoint,
  to: semigroupPoint
})
```

**Note**. There is a combinator similar to `getStructSemigroup` that works with tuples: `getTupleSemigroup`.

There are other combinators exported from `fp-ts`, here we can see a combinator that allows us to derive a semigroup instance for functions: given an instance of a semigroup `B` we can derive a new semigroup instance for functions with the following signatures: `(a: A) => B` (for every possible `A`).

**Example**

```ts
import { Predicate } from 'fp-ts/lib/function'
import { getFunctionSemigroup, semigroupAll } from 'fp-ts/lib/Semigroup'

/** `semigroupAll` is the boolean semigroup under conjunction */
const semigroupPredicate: Semigroup<Predicate<Point>> = getFunctionSemigroup(
  semigroupAll
)<Point>()
```

Now we can "merge" two predicates defined over `Point`.

```ts
const isPositiveX = (p: Point): boolean => p.x >= 0
const isPositiveY = (p: Point): boolean => p.y >= 0

const isPositiveXY = semigroupPredicate.concat(isPositiveX, isPositiveY)

isPositiveXY({ x: 1, y: 1 }) // true
isPositiveXY({ x: 1, y: -1 }) // false
isPositiveXY({ x: -1, y: 1 }) // false
isPositiveXY({ x: -1, y: -1 }) // false
```

## Equality and ordering

Given that `number` is **a total order** (meaning that whatever two `x` and `y` we choose, one of those two conditions has to hold true: `x <= y` or `y <= x`) we can define another two instances of semigroup using `min` or `max` as operations.

```ts
const meet: Semigroup<number> = {
  concat: (x, y) => Math.min(x, y)
}

const join: Semigroup<number> = {
  concat: (x, y) => Math.max(x, y)
}
```

**Quiz**. Why is it so important that `number` is a *total* order?

Is it possible to capture the notion of being _totally ordered_ for other types that are not `number`? To do so we first need to capture the notion of *equality*.

Eq

*Equivalence relations* capture the concept of *equality* of elements of the same type. The concept of an *equivalence relation* can be implemented in TypeScript with the following type class:

```ts
interface Eq<A> {
  readonly equals: (x: A, y: A) => boolean
}
```

Intuitively:

- if `equals(x, y) = true` then `x = y`
- if `equals(x, y) = false` then `x ≠ y`

**Example**

This is an instance of `Eq` for the `number` type:

```ts
import { Eq } from 'fp-ts/lib/Eq'

const eqNumber: Eq<number> = {
  equals: (x, y) => x === y
}
```

The following laws have to hold:

1. **Reflexivity**: `equals(x, x) === true`, for every `x` in `A`
2. **Symmetry**: `equals(x, y) === equals(y, x)`, for every `x`, `y` in `A`
3. **Transitivity**: if `equals(x, y) === true` and `equals(y, z) === true`, then `equals(x, z) === true`, for every `x`, `y`, `z` in `A`

**Example**

A programmer can thus define a function `elem` (which indicates wheter a value appears in an array) in the following way:

```ts
function elem<A>(E: Eq<A>): (a: A, as: Array<A>) => boolean {
  return (a, as) => as.some(item => E.equals(item, a))
}

elem(eqNumber)(1, [1, 2, 3]) // true
elem(eqNumber)(4, [1, 2, 3]) // false
```

Let's define some instances of `Eq` for more complex types.

```ts
type Point = {
  x: number
  y: number
}

const eqPoint: Eq<Point> = {
  equals: (p1, p2) => p1.x === p2.x && p1.y === p2.y
}
```

We can also try to optimize `equals` by first testing whether there is a *reference equality* (see `fromEquals` in `fp-ts`).

```ts
const eqPoint: Eq<Point> = {
  equals: (p1, p2) => p1 === p2 || (p1.x === p2.x && p1.y === p2.y)
}
```

Too much boilerplate? The good news is that we can write an `Eq` instance for a struct like `Point` if we can provide an `Eq` instance for each of its fields.

Conveniently, the `fp-ts/lib/Eq` module exports a combinator `getStructEq`:

```ts
import { getStructEq } from 'fp-ts/lib/Eq'

const eqPoint: Eq<Point> = getStructEq({
  x: eqNumber,
  y: eqNumber
})
```

We can keep passing the just defined `eqPoint` to `getStructEq`.

```ts
type Vector = {
  from: Point
  to: Point
}

const eqVector: Eq<Vector> = getStructEq({
  from: eqPoint,
  to: eqPoint
})
```

**Note**. There is a combinator similar to `getStructEq` that works on tuples: `getTupleEq`.

There are other combinators exported by fp-ts, here we can see one that allows us to derive an `Eq` instance from an array:

```ts
import { getEq } from 'fp-ts/lib/Array'

const eqArrayOfPoints: Eq<Array<Point>> = getEq(eqPoint)
```

At last, another combinator to create new `Eq` instances is `contramap`: given an `Eq<A>` instance and a function from `B` to `A` we can derive an instance `Eq<B>`

```ts
import { contramap, eqNumber } from 'fp-ts/lib/Eq'
import { pipe } from 'fp-ts/lib/pipeable'

type User = {
  userId: number
  name: string
}

/** two users are equal if their `userId` field is equal */
const eqUser = pipe(
  eqNumber,
  contramap((user: User) => user.userId)
)

eqUser.equals({ userId: 1, name: 'Giulio' }, { userId: 1, name: 'Giulio Canti' }) // true
eqUser.equals({ userId: 1, name: 'Giulio' }, { userId: 2, name: 'Giulio' }) // false
```

**Spoiler**. `contramap` is the fundamental function of [controvariant functors](#controvariant-functors).

## Equivalence relations as partitions

Defining an `Eq<A>` instance is equivalent to defining a *partition* of `A` where two elements `x`, `y` of `A` are members of the same partition if and only if `equals(x, y) = true`. 

**Note**. Every `f: A ⟶ B` function creates an `Eq<A>` instance defined by:

```ts
equals(x, y) = (f(x) = f(y))
```

for every `x`, `y` of `A`.

**Spoiler**. We'll see how this notion will come back useful in the demo: `03_shapes.ts`

# Ord

In the previos chapter regarding `Eq` we were dealing with the concept of **equality**. In this one we'll deal with the concept of **ordering**.

The concept of a total order relation can be implemented in TypScript with the following type class:

```ts
import { Eq } from 'fp-ts/lib/Eq'

type Ordering = -1 | 0 | 1

interface Ord<A> extends Eq<A> {
  readonly compare: (x: A, y: A) => Ordering
}
```

Resulting in:

- `x < y` if and only if `compare(x, y) = -1`
- `x = y` if and only if `compare(x, y) = 0`
- `x > y` if and only if `compare(x, y) = 1`

Thus we can say that `x <= y` holds true only if `compare(x, y) <= 0`.

**Example**

Here we can see an instance of `Ord` for the type `number`:

```ts
const ordNumber: Ord<number> = {
  equals: (x, y) => x === y,
  compare: (x, y) => (x < y ? -1 : x > y ? 1 : 0)
}
```

The following laws have to hold true:

1. **Reflexivity**: `compare(x, x) <= 0`, for every `x` in `A`
2. **Antisymmetry**: if `compare(x, y) <= 0` and `compare(y, x) <= 0` then `x = y`, for every `x`, `y` in `A`
3. **Transitivity**: if `compare(x, y) <= 0` and `compare(y, z) <= 0` then `compare(x, z) <= 0`, for every `x`, `y`, `z` in `A`

`compare` has also to be compatible with the `equals` operation from `Eq`: 

`compare(x, y) === 0` if and only if `equals(x, y) === true`, for every `x`, `y` in `A`

**Nota**. `equals` can be lawfully derived from `compare` in the following way:

```ts
equals: (x, y) => compare(x, y) === 0
```

In fact the `fp-ts/lib/Ord` module exports a handy helper `fromCompare` which allows us to define an `Ord` instance simply by supplying the `compare` function:

```ts
import { fromCompare, Ord } from 'fp-ts/lib/Ord'

const ordNumber: Ord<number> = fromCompare((x, y) => (x < y ? -1 : x > y ? 1 : 0))
```

Thus a programmer can define a `min` function in the following way:

```ts
function min<A>(O: Ord<A>): (x: A, y: A) => A {
  return (x, y) => (O.compare(x, y) === 1 ? y : x)
}

min(ordNumber)(2, 1) // 1
```

The order's **totality** (thus given any `x` e `y`, one of the following conditions holds true: `x <= y` oppure `y <= x`) may look obvious when speaking about numbers, but that's not always the case. Let's consider a more complex case:

```ts
type User = {
  name: string
  age: number
}
```

How can we define an `Ord<User>`?

It always depends on the context, but it's always possible to order the users based on their age:

```ts
const byAge: Ord<User> = fromCompare((x, y) => ordNumber.compare(x.age, y.age))
```

We can eliminate some boilerplate using the combinator `contramap`: given an `Ord` instance for `A` and a function from `B` to `A`, we can derive an instance of `Ord` for `B`

```ts
import { contramap } from 'fp-ts/lib/Ord'
import { pipe } from 'fp-ts/lib/pipeable'

const byAge: Ord<User> = pipe(
  ordNumber,
  contramap((user: User) => user.age)
)
```

**Spoiler**. `contramap` is the fundamental function of [controvariant functors](#controvariant-functors).

Now we can obtain the youngest of two users using `min`:

```ts
const getYounger = min(byAge)

getYounger({ name: 'Guido', age: 48 }, { name: 'Giulio', age: 45 }) // { name: 'Giulio', age: 45 }
```

And what if we wanted to obtain the eldest one? We can invert the order, or better, obtain the *dual* order.

Luckily there's an another combinator for this:

```ts
import { getDualOrd } from 'fp-ts/lib/Ord'

function max<A>(O: Ord<A>): (x: A, y: A) => A {
  return min(getDualOrd(O))
}

const getOlder = max(byAge)

getOlder({ name: 'Guido', age: 48 }, { name: 'Giulio', age: 45 }) // { name: 'Guido', age: 48 }
```

We've seen before that semigroups are helpful every time we want to "concat"enate or "merge" (choose the word that fits your intuition and use case better) different data in one.

There's another way of creating a semigroup instance for `A`: if we already have an `Ord<A>` then we can derive one of semigroup.

Actually we can derive **two** of them:

```ts
import { ordNumber } from 'fp-ts/lib/Ord'
import { getJoinSemigroup, getMeetSemigroup, Semigroup } from 'fp-ts/lib/Semigroup'

/** Takes the minimum of two values */
const semigroupMin: Semigroup<number> = getMeetSemigroup(ordNumber)

/** Takes the maximum of two values  */
const semigroupMax: Semigroup<number> = getJoinSemigroup(ordNumber)

semigroupMin.concat(2, 1) // 1
semigroupMax.concat(2, 1) // 2
```

**Example**

Let's wrap it up with one finale example (taken from [Fantas, Eel, and Specification 4: Semigroup](http://www.tomharding.me/2017/03/13/fantas-eel-and-specification-4/))

Let's suppose of building a system where a client's record are modelled in the following way:

```ts
interface Customer {
  name: string
  favouriteThings: Array<string>
  registeredAt: number // since epoch
  lastUpdatedAt: number // since epoch
  hasMadePurchase: boolean
}
```

For some reason you may end up having duplicate records for the same person.

We need a merging strategy and that's exactly what semigroups take care of!

```ts
import { getMonoid } from 'fp-ts/lib/Array'
import { contramap, ordNumber } from 'fp-ts/lib/Ord'
import { pipe } from 'fp-ts/lib/pipeable'
import {
  getJoinSemigroup,
  getMeetSemigroup,
  getStructSemigroup,
  Semigroup,
  semigroupAny
} from 'fp-ts/lib/Semigroup'

const semigroupCustomer: Semigroup<Customer> = getStructSemigroup({
  // keep the longer name
  name: getJoinSemigroup(
    pipe(
      ordNumber,
      contramap((s: string) => s.length)
    )
  ),
  // accumulate things
  favouriteThings: getMonoid<string>(),
  // keep the least recent date
  registeredAt: getMeetSemigroup(ordNumber),
  // keep the most recent date
  lastUpdatedAt: getJoinSemigroup(ordNumber),
  // boolean semigroup under disjunction
  hasMadePurchase: semigroupAny
})

semigroupCustomer.concat(
  {
    name: 'Giulio',
    favouriteThings: ['math', 'climbing'],
    registeredAt: new Date(2018, 1, 20).getTime(),
    lastUpdatedAt: new Date(2018, 2, 18).getTime(),
    hasMadePurchase: false
  },
  {
    name: 'Giulio Canti',
    favouriteThings: ['functional programming'],
    registeredAt: new Date(2018, 1, 22).getTime(),
    lastUpdatedAt: new Date(2018, 2, 9).getTime(),
    hasMadePurchase: true
  }
)
/*
{ name: 'Giulio Canti',
  favouriteThings: [ 'math', 'climbing', 'functional programming' ],
  registeredAt: 1519081200000, // new Date(2018, 1, 20).getTime()
  lastUpdatedAt: 1521327600000, // new Date(2018, 2, 18).getTime()
  hasMadePurchase: true }
*/
```

**Demo**

[`02_ord.ts`](src/02_ord.ts)

# Monoids

If we add another condition to the definition of a semigroup `(A, *)`, such as exists an element `u` in `A` such as for every element `a` in `A` holds true the following condition: 

```ts
u * a = a * u = a
```

then the triplet `(A, *, u)` is called a *monoid* and the element `u` is called *unity*.
(sinonyms: *neutral element*, *identity element*).

## Implementation

```ts
import { Semigroup } from 'fp-ts/lib/Semigroup'

interface Monoid<A> extends Semigroup<A> {
  readonly empty: A
}
```

The following laws have to hold true:

- **Right identity**: `concat(a, empty) = a`, for every `a` in `A`
- **Left identity**: `concat(empty, a) = a`, for every `a` in `A`

**Note**. The monoids unity is unique.

Many of the semigroups we've seen before are monoids as well:

```ts
/** number `Monoid` under addition */
const monoidSum: Monoid<number> = {
  concat: (x, y) => x + y,
  empty: 0
}

/** number `Monoid` under multiplication */
const monoidProduct: Monoid<number> = {
  concat: (x, y) => x * y,
  empty: 1
}

const monoidString: Monoid<string> = {
  concat: (x, y) => x + y,
  empty: ''
}

/** boolean monoid under conjunction */
const monoidAll: Monoid<boolean> = {
  concat: (x, y) => x && y,
  empty: true
}

/** boolean monoid under disjunction */
const monoidAny: Monoid<boolean> = {
  concat: (x, y) => x || y,
  empty: false
}
```

Let's see some more complex example.

Given a type `A`, the *endomorphisms* (an endomorphism is simply a function whose domain and codomain are the same) on `A` allow a monoid instance:

```ts
type Endomorphism<A> = (a: A) => A

function identity<A>(a: A): A {
  return a
}

function getEndomorphismMonoid<A = never>(): Monoid<Endomorphism<A>> {
  return {
    concat: (x, y) => a => x(y(a)),
    empty: identity
  }
}
```

If the type `M` allows a monoid instance then the type `(a: A) => M` allows a monoid instance for every type `A`:

```ts
function getFunctionMonoid<M>(M: Monoid<M>): <A = never>() => Monoid<(a: A) => M> {
  return () => ({
    concat: (f, g) => a => M.concat(f(a), g(a)),
    empty: () => M.empty
  })
}
```

As a consequence we can see that reducers allow a monoid instance:

```ts
type Reducer<S, A> = (a: A) => (s: S) => S

function getReducerMonoid<S, A>(): Monoid<Reducer<S, A>> {
  return getFunctionMonoid(getEndomorphismMonoid<S>())<A>()
}
```

One could think that every semigroup is also a monoid. That's not the case. Let's see a counter example:

```ts
const semigroupSpace: Semigroup<string> = {
  concat: (x, y) => x + ' ' + y
}
```

It is not possible to find such an `empty` value that `concat(x, empty) = x`.

Lastly we can construct a monoid instance for a structure like `Point`:

```ts
type Point = {
  x: number
  y: number
}
```

if we are able to feed the `getStructMonoid` a monoid instance for each of its fields:

```ts
import { getStructMonoid, Monoid, monoidSum } from 'fp-ts/lib/Monoid'

const monoidPoint: Monoid<Point> = getStructMonoid({
  x: monoidSum,
  y: monoidSum
})
```

We can move further through the freshly defined `getStructMonoid` instance:  

```ts
type Vector = {
  from: Point
  to: Point
}

const monoidVector: Monoid<Vector> = getStructMonoid({
  from: monoidPoint,
  to: monoidPoint
})
```

**Note**. There is a combinator similar to `getStructMonoid` that works with tuples: `getTupleMonoid`.  

## Folding

When we use a monoid instead of a semigroup the folding operation is even easier: we no longer need to feed an initial value, we can use the neutral element for that:

```ts
import {
  fold,
  monoidAll,
  monoidAny,
  monoidProduct,
  monoidString,
  monoidSum
} from 'fp-ts/lib/Monoid'

fold(monoidSum)([1, 2, 3, 4]) // 10
fold(monoidProduct)([1, 2, 3, 4]) // 24
fold(monoidString)(['a', 'b', 'c']) // 'abc'
fold(monoidAll)([true, false, true]) // false
fold(monoidAny)([true, false, true]) // true
```

**Demo**

[`03_shapes.ts`](src/03_shapes.ts)

# Pure and partial functions

> A pure function is a procedure that given the same input always gives the same output and does not have any observable side effect.

Such an informal stament could leave space for some doubts

- what is a "side effect"?
- what does it means "observable"?
- what does it mean "same"?

Let's see a formal definition of the concept of a function.

**Note**. If `X` e `Y` are sets, then with `X × Y`  we indicate their _cartesian product_, meaning the set

```
X × Y = { (x, y) | x ∈ X, y ∈ Y }
```

The following [definition](https://en.wikipedia.org/wiki/History\_of\_the\_function\_concept) was given a century ago:

**Definiton**. A _function:  `f: X ⟶ Y` is a subset of `X × Y` such as
for every `x ∈ X` there's exactly one `y ∈ Y` such that `(x, y) ∈ f`.

The set `X` is called _domain_ of `f`, `Y` it's his _codomain_.

**Example**

The function `double: Nat ⟶ Nat` is the subset of the cartesian product `Nat × Nat` given by `{ (1, 2), (2, 4), (3, 6), ...}`.

In TypeScript

```ts
const f: { [key: number]: number } = {
  1: 2,
  2: 4,
  3: 6
  ...
}
```

Please note that the set `f` has to be described _statically_ when defining the function (meaning that the elements of that set cannot change with time for no reason).
In this way we can exclude any form of side effect and the return value is always the same. 

The one in the example is called an _extensional_ definition of a function, meaning we enumerate one by one each of the elements of its domain.
Obviously, when such a set is infinite this proves to be problematic.

We can get around this issue by introducing the one that is called _intentional_ definition, meaning that we express a condition that has to hold for every couple
Si può ovviare a questo problema introducendo quella che viene detta definizione _intensionale_, `(x, y) ∈ f` meaning `y = x * 2`.
That's the familiar form in which we write the `double` function and its definition in TypeScript:

```ts
function double(x: number): number {
  return x * 2
}
```

The definition of a function as a subset of a cartesian product shows how in mathematics every function is pure: thereìs no action, no state mutation or elements being modified.
In functional programming the implementation of functions has to follow as much as possible this ideal model.

The fact that a function is pure does not imply automatically a ban on local mutability as long as it doesn't leaks out of its scope.

![mutable / immutable](images/mutable-immutable.jpg)

The ultimate goal is to guarantee: **referential transparency**.

> An expresion contains "sode effects" if it doesn't benefits from referential trnsparency 

Functions compose:

**Definition**. Given `f: Y ⟶ Z` and `g: X ⟶ Y` two functions, then the function `h: X ⟶ Z` defined by:

```
h(x) = f(g(x))
```

is called _composition_ of `f` and `g` and is written `h = f ∘ g`

Si noti che affinché due funzioni `f` e `g` possano comporre, il dominio di `f` deve essere contenuto nel codominio di `g`.

## 6.1. Funzioni parziali

**Definizione**. Una funzione _parziale_ è una funzione che non è definita per tutti i valori del dominio.

Viceversa una funzione definita per tutti i valori del dominio è detta _totale_.

**Esempio**

```
f(x) = 1 / x
```

La funzione `f: number ⟶ number` non è definita per `x = 0`.

Una funzione parziale `f: X ⟶ Y` può essere sempre ricondotta ad una funzione totale aggiungendo un valore speciale,
chiamiamolo `None`, al codominio e associandolo ad ogni valore di `X` per cui `f` non è definita

```
f': X ⟶ Y ∪ None
```

Chiamiamo `Option(Y) = Y ∪ None`.

```
f': X ⟶ Option(Y)
```

In ambito funzionale si tende a definire solo funzioni pure e totali.

E' possibile definire `Option` in TypeScript?

# 7. ADT e error handling funzionale

Un buon primo passo quando si sta construendo una nuova applicazione è quello di definire il suo modello di dominio. TypeScript offre molti strumenti che aiutano in questo compito. Gli **Algebraic Data Types** (abbreviato in ADT) sono uno di questi strumenti.

## 7.1. Che cos'è un ADT?

> In computer programming, especially functional programming and type theory, an algebraic data type is a kind of composite type, i.e., **a type formed by combining other types**.

Due famiglie comuni di algebraic data types sono:

- i **product types**
- i **sum types**

Cominciamo da quelli più familiari: i product type.

## 7.2. Product types

Un product type è una collezione di tipi T<sub>i</sub> inidicizzati da un insieme `I`.

Due membri comuni di questa famiglia sono le `n`-tuple, dove `I` è un intervallo di numeri naturali:

```ts
type Tuple1 = [string] // I = [0]
type Tuple2 = [string, number] // I = [0, 1]
type Tuple3 = [string, number, boolean] // I = [0, 1, 2]

// Accessing by index
type Fst = Tuple2[0] // string
type Snd = Tuple2[1] // number
```

e le struct, ove `I` è un insieme di label:

```ts
// I = {"name", "age"}
interface Person {
  name: string
  age: number
}

// Accessing by label
type Name = Person['name'] // string
type Age = Person['age'] // number
```

### 7.2.1. Perchè "product" types?

Se indichiamo con `C(A)` il numero di abitanti del tipo `A` (ovvero la sua **cardinalità**) allora vale la seguente uguaglianza:

```ts
C([A, B]) = C(A) * C(B)
```

> la cardinalità del prodotto è il prodotto delle cardinalità

**Example**

```ts
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Period = 'AM' | 'PM'
type Clock = [Hour, Period]
```

Il tipo `Clock` ha `12 * 2 = 24` abitanti.

### 7.2.2. Quando posso usare un product type?

Ogniqualvolta le sue conponenti sono **indipendenti**.

```ts
type Clock = [Hour, Period]
```

Qui `Hour` e `Period` sono indipendenti, ovvero il valore di `Hour` non influisce sul valore di `Period` e viceversa, tutte le coppie sono legali e hanno senso.

## 7.3. Sum types

Un sum type è una struttura dati che contiene un valore che può assumere diversi tipi (ma fissi). Solo uno dei tipi può essere in uso in un dato momento, e un campo che fa da "tag" indica quale di questi è in uso.

Nella documentazione ufficiale di TypeScript sono denominati _tagged union types_.

**Example** (redux actions)

```ts
type Action =
  | {
      type: 'ADD_TODO'
      text: string
    }
  | {
      type: 'UPDATE_TODO'
      id: number
      text: string
      completed: boolean
    }
  | {
      type: 'DELETE_TODO'
      id: number
    }
```

Il campo `type` fa da tag e assicura che i suoi membri siano disgiunti.

**Nota**. Il nome del campo che fa da tag è a discrezione dello sviluppatore, non deve essere necessariamente "type".

### 7.3.1. Costruttori

Un sum type con `n` membri necessita di (almeno) `n` **costruttori**, uno per ogni membro:

```ts
const add = (text: string): Action => ({
  type: 'ADD_TODO',
  text
})

const update = (id: number, text: string, completed: boolean): Action => ({
  type: 'UPDATE_TODO',
  id,
  text,
  completed
})

const del = (id: number): Action => ({
  type: 'DELETE_TODO',
  id
})
```

I sum type possono essere **polimorfici** e **ricorsivi**.

**Example** (linked lists)

```ts
//        ↓ type parameter
type List<A> = { type: 'Nil' } | { type: 'Cons'; head: A; tail: List<A> }
//                                                              ↑ recursion
```

### 7.3.2. Pattern matching

JavaScript non ha il [pattern matching](https://github.com/tc39/proposal-pattern-matching) (e quindi neanche TypeScript) tuttavia possiamo simularlo in modo grezzo tramite una funzione `fold`:

```ts
const fold = <A, R>(onNil: () => R, onCons: (head: A, tail: List<A>) => R) => (
  fa: List<A>
): R => (fa.type === 'Nil' ? onNil() : onCons(fa.head, fa.tail))
```

**Nota**. TypeScript offre una straordinaria feature legata ai sum type: **exhaustive check**. Ovvero il type checker è in grado di determinare se tutti i casi sono stati gestiti.

**Example** (calculate the length of a `List` recursively)

```ts
const length: <A>(fa: List<A>) => number = fold(() => 0, (_, tail) => 1 + length(tail))
```

### 7.3.3. Perchè "sum" types?

Vale la seguente uguaglianza:

```ts
C(A | B) = C(A) + C(B)
```

> la cardinalità della somma è la somma delle cardinalità

**Example** (the `Option` type)

```ts
type Option<A> =
  | { _tag: 'None' }
  | {
      _tag: 'Some'
      value: A
    }
```

Dalla formula generale `C(Option<A>) = 1 + C(A)` possiamo derivare per esempio la cardinalità di `Option<boolean>`: `1 + 2 = 3` abitanti.

### 7.3.4. Quando dovrei usare un sum type?

Quando le sue componenti sarebbero **dipendenti** se implementate con un product type.

**Example** (component props)

```ts
interface Props {
  editable: boolean
  onChange?: (text: string) => void
}

class Textbox extends React.Component<Props> {
  render() {
    if (this.props.editable) {
      // error: Cannot invoke an object which is possibly 'undefined' :(
      this.props.onChange(...)
    }
  }
}
```

Il problema qui è che `Props` è modellato come un prodotto ma `onChange` **dipende** da `editable`.

Un sum type è una scelta migliore:

```ts
type Props =
  | {
      type: 'READONLY'
    }
  | {
      type: 'EDITABLE'
      onChange: (text: string) => void
    }

class Textbox extends React.Component<Props> {
  render() {
    switch (this.props.type) {
      case 'EDITABLE' :
        this.props.onChange(...) // :)
      ...
    }
  }
}
```

**Example** (node callbacks)

```ts
declare function readFile(
  path: string,
  //         ↓ ---------- ↓ CallbackArgs
  callback: (err?: Error, data?: string) => void
): void
```

Il risultato è modellato con un prodotto:

```ts
type CallbackArgs = [Error | undefined, string | undefined]
```

tuttavia le sue componenti sono **dipendenti**: si riceve un errore **oppure** una stringa:

| err         | data        | legal? |
| ----------- | ----------- | ------ |
| `Error`     | `undefined` | ✓      |
| `undefined` | `string`    | ✓      |
| `Error`     | `string`    | ✘      |
| `undefined` | `undefined` | ✘      |

Un sum type sarebbe una scelta migliore, ma quale?

## 7.4. Functional error handling

Vediamo come gestire gli errori in modo funzionale.

### 7.4.1. Il tipo `Option`

Il tipo `Option` rappresenta l'effetto di una computazione che può fallire oppure restituire un valore di tipo `A`:

```ts
type Option<A> =
  | { _tag: 'None' } // represents a failure
  | { _tag: 'Some'; value: A } // represents a success
```

Costruttori e pattern matching:

```ts
// a nullary constructor can be implemented as a constant
const none: Option<never> = { _tag: 'None' }

const some = <A>(value: A): Option<A> => ({ _tag: 'Some', value })

const fold = <A, R>(onNone: () => R, onSome: (a: A) => R) => (fa: Option<A>): R =>
  fa._tag === 'None' ? onNone() : onSome(fa.value)
```

Il tipo `Option` può essere usato per evitare di lanciare eccezioni e/o rappresentare i valori opzionali, così possiamo passare da...

```ts
//                this is a lie ↓
function head<A>(as: Array<A>): A {
  if (as.length === 0) {
    throw new Error('Empty array')
  }
  return as[0]
}

let s: string
try {
  s = String(head([]))
} catch (e) {
  s = e.message
}
```

...in cui il type system è all'oscuro di un possibile fallimento, a...

```ts
//                              ↓ the type system "knows" that this computation may fail
function head<A>(as: Array<A>): Option<A> {
  return as.length === 0 ? none : some(as[0])
}

import { pipe } from 'fp-ts/lib/pipeable'

const s = pipe(
  head([]),
  fold(() => 'Empty array', a => String(a))
)
```

...ove la possibilità di errore è codificata nel type system.

Ora supponiamo di voler fare un "merge" di due `Option<A>`, ci sono quattro casi:

| x       | y       | concat(x, y) |
| ------- | ------- | ------------ |
| none    | none    | none         |
| some(a) | none    | none         |
| none    | some(a) | none         |
| some(a) | some(b) | ?            |

C'è un problema nell'ultimo caso, ci occorre un modo per fare un "merge" di due `A`.

Ma questo è proprio il lavoro di `Semigroup`! Possiamo richiedere una istanza di semigruppo per `A` e quindi derivare una istanza di semigruppo per `Option<A>`. Questo è come lavora il combinatore `getApplySemigroup` di `fp-ts`:

```ts
import { semigroupSum } from 'fp-ts/lib/Semigroup'
import { getApplySemigroup, some, none } from 'fp-ts/lib/Option'

const S = getApplySemigroup(semigroupSum)

S.concat(some(1), none) // none
S.concat(some(1), some(2)) // some(3)
```

Se abbiamo a disposizione una istanza di monoide per `A` allora possiamo derivare una istanza di monoide per `Option<A>` (via `getApplyMonoid`) e che lavora in questo modo (`some(empty)` fa da elemento neutro):

| x       | y       | concat(x, y)       |
| ------- | ------- | ------------------ |
| none    | none    | none               |
| some(a) | none    | none               |
| none    | some(a) | none               |
| some(a) | some(b) | some(concat(a, b)) |

```ts
import { getApplyMonoid, some, none } from 'fp-ts/lib/Option'

const M = getApplyMonoid(monoidSum)

M.concat(some(1), none) // none
M.concat(some(1), some(2)) // some(3)
M.concat(some(1), M.empty) // some(1)
```

Possiamo derivare altri due monoidi per `Option<A>` (per ogni `A`):

1. `getFirstMonoid`...

Monoid returning the left-most non-`None` value:

| x       | y       | concat(x, y) |
| ------- | ------- | ------------ |
| none    | none    | none         |
| some(a) | none    | some(a)      |
| none    | some(a) | some(a)      |
| some(a) | some(b) | some(a)      |

```ts
import { getFirstMonoid, some, none } from 'fp-ts/lib/Option'

const M = getFirstMonoid<number>()

M.concat(some(1), none) // some(1)
M.concat(some(1), some(2)) // some(1)
```

2. ...e il suo **duale**: `getLastMonoid`

Monoid returning the right-most non-`None` value:

| x       | y       | concat(x, y) |
| ------- | ------- | ------------ |
| none    | none    | none         |
| some(a) | none    | some(a)      |
| none    | some(a) | some(a)      |
| some(a) | some(b) | some(b)      |

```ts
import { getLastMonoid, some, none } from 'fp-ts/lib/Option'

const M = getLastMonoid<number>()

M.concat(some(1), none) // some(1)
M.concat(some(1), some(2)) // some(2)
```

Come esempio, `getLastMonoid` può essere utile per gestire valori opzionali:

```ts
import { Monoid, getStructMonoid } from 'fp-ts/lib/Monoid'
import { Option, some, none, getLastMonoid } from 'fp-ts/lib/Option'

/** VSCode settings */
interface Settings {
  /** Controls the font family */
  fontFamily: Option<string>
  /** Controls the font size in pixels */
  fontSize: Option<number>
  /** Limit the width of the minimap to render at most a certain number of columns. */
  maxColumn: Option<number>
}

const monoidSettings: Monoid<Settings> = getStructMonoid({
  fontFamily: getLastMonoid<string>(),
  fontSize: getLastMonoid<number>(),
  maxColumn: getLastMonoid<number>()
})

const workspaceSettings: Settings = {
  fontFamily: some('Courier'),
  fontSize: none,
  maxColumn: some(80)
}

const userSettings: Settings = {
  fontFamily: some('Fira Code'),
  fontSize: some(12),
  maxColumn: none
}

/** userSettings overrides workspaceSettings */
monoidSettings.concat(workspaceSettings, userSettings)
/*
{ fontFamily: some("Fira Code"),
  fontSize: some(12),
  maxColumn: some(80) }
*/
```

### 7.4.2. Il tipo `Either`

Un uso comune di `Either` è come alternativa ad `Option` per gestire la possibilità di un valore mancante. In questo uso, `None` è sostituito da `Left` che contiene informazione utile. `Right` invece sostituisce `Some`. Per convenzione `Left` è usato per il fallimento mentre `Right` per il successo.

```ts
type Either<E, A> =
  | { _tag: 'Left'; left: E } // represents a failure
  | { _tag: 'Right'; right: A } // represents a success
```

Costruttori e pattern matching:

```ts
const left = <E, A>(left: E): Either<E, A> => ({ _tag: 'Left', left })

const right = <E, A>(right: A): Either<E, A> => ({ _tag: 'Right', right })

const fold = <E, A, R>(onLeft: (left: E) => R, onRight: (right: A) => R) => (
  fa: Either<E, A>
): R => (fa._tag === 'Left' ? onLeft(fa.left) : onRight(fa.right))
```

Tornando all'esempio con la callback:

```ts
declare function readFile(
  path: string,
  callback: (err?: Error, data?: string) => void
): void

readFile('./myfile', (err, data) => {
  let message: string
  if (err !== undefined) {
    message = `Error: ${err.message}`
  } else if (data !== undefined) {
    message = `Data: ${data.trim()}`
  } else {
    // should never happen
    message = 'The impossible happened'
  }
  console.log(message)
})
```

possiamo cambiare la sua firma in:

```ts
declare function readFile(
  path: string,
  callback: (result: Either<Error, string>) => void
): void
```

e consumare l'API in questo modo:

```ts
import { flow } from 'fp-ts/lib/function'

readFile('./myfile', flow(
    fold(err => `Error: ${err.message}`, data => `Data: ${data.trim()}`),
    console.log
  )
)
```

# 8. Teoria delle categorie

Storicamente la prima astrazione avanzata contenuta in `fp-ts` è `Functor`, ma prima di poter parlare di funtori dobbiamo imparare qualcosa sulle **categorie** dato che i funtori sono costruiti su di esse.

Una pietra miliare della programmazione funzionale è la **composizione**.

> And how do we solve problems? We decompose bigger problems into smaller problems. If the smaller problems are still too big,
we decompose them further, and so on. Finally, we write code that solves all the small problems. And then comes the essence of programming: we compose those pieces of code to create solutions to larger problems. Decomposition wouldn't make sense if we weren't able to put the pieces back together. - Bartosz Milewski

Ma cosa significa esattamente? Quando possiamo dire che due cose *compongono*? E quando possiamo dire che due cose compongono *bene*?

> Entities are composable if we can easily and generally combine their behaviors in some way without having to modify the entities being combined. I think of composability as being the key ingredient necessary for acheiving reuse, and for achieving a Combinatorsal expansion of what is succinctly expressible in a programming moupoups Paul Chiusano
General definition general-definition ad una **teoria rigorosa** che possa fornire tionste a domande così implementationamentaliThe `fold` function**the-fold-function di The dual semigroupthe-dual-semigroup 60 anni un vasto gruppo I can't find i-cant-find-an'-instance'umanità (la matematica) si Product semigroupsviluppare  teoriaproduct-semigroup dedicata a questo argomento: la Equality*ering equality-and-ordering> Categories capture the essence of composition.

Saunders Mac Lane

<img src="images/maclane.jpg" width="300" alt="Saunders Mac Lane" />

Samuel Eilenberg

<img src="images/eilenberg.jpg" width="300" alt="Samuel Eilenberg" />

## 8.1. Definizione

La definizione di categoria, anche se non particolarmente complicata, è un po' lunga perciò la dividerò in due parti:

- la prima è tecnica (prima di tutto dobbiamo definire i suoi costituenti)
- la seconda parte contiene ciò a cui siamo più interessati: una nozione di composizione

### 8.1.1. Parte I (Costituenti)

Una categoria è una coppia `(Objects, Morphisms)` ove:

- `Objects` è una collezione di **oggetti**
- `Morphisms` è una collezione di **morfismi** (dette anche "frecce") tra oggetti

**Nota**. Il termine "oggetto" non ha niente a che fare con la OOP, pensate agli oggetti come a scatole nere che non potete ispezionare, oppure come a dei semplici placeholder utili a definire i morfismi.

Ogni morfismo `f` possiede un oggetto sorgente `A` e un oggetto target `B`, dove sia `A` che `B` sono contenuti in `Objects`. Scriviamo `f: A ⟼ B` e diciamo che "f è un morfismo da A a B"

### 8.1.2. Parte II (Composizione)

Esiste una operazione `∘`, chiamata "composizione", tale che valgono le seguenti proprietà:

- (**composition of morphisms**) ogni volta che `f: A ⟼ B` and `g: B ⟼ C` sono due morfismi in `Morphisms` allora deve esistere un terzo morfismo `g ∘ f: A ⟼ C` in `Morphisms` che è detto la _composizione_ di `f` e `g`
- (**associativity**) se `f: A ⟼ B`, `g: B ⟼ C` e `h: C ⟼ D` allora `h ∘ (g ∘ f) = (h ∘ g) ∘ f`
- (**identity**) per ogni oggetto `X`, esiste un morfismo `identity: X ⟼ X` chiamato *il morfismo identità* di `X`, tale che per ogni morfismo `f: A ⟼ X` e ogni morfismo `g: X ⟼ B`, vale `identity ∘ f = f` e `g ∘ identity` = g.

**Example**

(source: [category on wikipedia.org](https://en.wikipedia.org/wiki/Category_(mathematics)))

<img src="images/category.png" width="300" alt="a simple category" />

Questa categoria è molto semplice, ci sono solo tre oggetti e sei morfismi (1<sub>A</sub>, 1<sub>B</sub>, 1<sub>C</sub> sono i morfismi identità di `A`, `B`, `C`).

## 8.2. Categorie come linguaggi di programmazione

Una categoria può essere interpretata come un modello semplificato di un **typed programming language**, ove:

- gli oggetto sono **tipi**
- i morfismi sono **funzioni**
- `∘` è l'usuale **composizione di funzioni**

Il diagramma:

<img src="images/category.png" width="300" alt="a simple programming language" />

può perciò essere interpretato come un immaginario (e molto semplice) linguaggio di programmazione con solo tre tipi e una manciata di funzioni.

Per esempio potremmo pensare a:

- `A = string`
- `B = number`
- `C = boolean`
- `f = string => number`
- `g = number => boolean`
- `g ∘ f = string => boolean`

L'implementazione potrebbe essere qualcosa come:

```ts
function f(s: string): number {
  return s.length
}

function g(n: number): boolean {
  return n > 2
}

// h = g ∘ f
function h(s: string): boolean {
  return g(f(s))
}
```

## 8.3. Una categoria per TypeScript

Possiamo definire una categoria, chiamiamola *TS*, come modello semplificato del linguaggio TypeScript, ove:

- gli **oggetti** sono tutti i tipi di TypeScript: `string`, `number`, `Array<string>`, ...
- i **morfismi** sono tutte le funzioni di TypeScript: `(a: A) => B`, `(b: B) => C`, ... ove `A`, `B`, `C`, ... sono tipi di TypeScript
- i **morfismi identità** sono tutti codificati da una singola funzione polimorfica `const identity = <A>(a: A): A => a`
- la **composizione di morfismi** è l'usuale composizione di funzione (che è associativa)

Come modello di TypeScript, la categoria *TS* a prima vista può sembrare troppo limitata: non ci sono cicli, niente `if`, non c'è *quasi* nulla... e tuttavia questo modello semplificato è abbastanza ricco per soddisfare il nostro obbiettivo principale: ragionare su una nozione ben definita di composizione.

## 8.4. Il problema centrale della composizione

In _TS_ possiamo comporre due funzioni generiche `f: (a: A) => B` and `g: (c: C) => D` fintanto che `C = B`

```ts
function compose<A, B, C>(g: (b: B) => C, f: (a: A) => B): (a: A) => C {
  return a => g(f(a))
}
```

Ma che succede se `B != C`? Come possiamo comporre due tali funzioni? Dobbiamo lasciar perdere?

Nella prossima sezione vedremo sotto quali condizioni una tale composizione è possibile. Parleremo di **funtori**.

# 9. Funtori

Nell'ultima sezione riguardante le categorie ho presentato la categoria *TS* (la categoria di TypeScript) e il problema centrale con la composizione di funzioni:

> Come possiamo comporre due funzioni generiche `f: (a: A) => B` e `g: (c: C) => D`?

Ma perchè trovare soluzioni a questo problema è così importante?

Perchè, se è vero che le categorie possono essere usate per modellare i linguaggi di programmazione, i morfismi (ovvero le funzioni in *TS*) possono essere usate per modellare i **programmi**.

Perciò risolvere quel problema astratto significa anche trovare una via concreta di **comporre i programmi in modo generico**.
E *questo* sì che è molto interessante per uno sviluppatore, non è vero?

## 9.1. Funzioni come programmi

> Come è possibile modellare un programma che produce side effect con una funzione pura?

La risposta è modellare i side effect tramite **effetti**, ovvero tipi che **rappresentano** i side effect.

Vediamo due tecniche possibili per farlo in JavaScript:

- definire un DSL (domain specific language) per gli effetti
- usare i *thunk*

La prima tecnica, usare cioè un DSL, significa modificare un programma come:

```ts
function log(message: string): void {
  console.log(a, b) // side effect
}
```

cambiando il suo codominio e facendo in modo che sia una funzione che restituisce una **descrizione** del side effect:

```ts
type DSL = ... // sum type di tutti i possibili effetti gestiti dal sistema

function log(message: string): DSL {
  return {
    type: "log",
    message
  }
}
```

**Quiz**. La funzione `log` appena definita è davvero pura? Eppure `log('foo') !== log('foo')`!

Questa tecnica presuppone un modo per combinare gli effetti e la definizione di un interprete in grado di eseguire concretamente gli effetti.

Una seconda tecnica è racchiudere la computazione in un thunk:

```ts
interface IO<A> {
  (): A
}

function log(message: string): IO<void> {
  return () => {
    console.log(message)
  }
}
```

Il programma `log`, quando viene eseguito, non provoca immediatamente il side effect ma restituisce **un valore che rappresenta la computazione** (detta anche *azione*).

Vediamo un altro esempio che usa i thunk, leggere e scrivere sul `localStorage`:

```ts
const read = (name: string): IO<string | null> =>
  () => localStorage.getItem(name)

const write = (name: string, value: string): IO<void> =>
  () => localStorage.setItem(name, value)
```

Nella programmazione funzionale si tende a spingere i side effect (sottoforma di effetti) ai confini del sistema (ovvero la funzione `main`)
ove vengono eseguiti da un interprete ottenendo il seguente schema:

> system = pure core + imperative shell

Nei linguaggi *puramente funzionali* (come Haskell, PureScript o Elm) questa divisione è netta ed è imposta dal linguaggio stesso.

Anche con questa seconda tecnica (quella usata da `fp-ts`) occorre un modo per combinare gli effetti, vediamo come fare.

Innanzi tutto un po' di terminologia: chiamiamo **programma puro** una funzione con la seguente firma:

```ts
(a: A) => B
```

Una tale firma modella un programma che accetta un input di tipo `A` e restituisce un risultato di tipo `B`, senza alcun effetto.

**Esempio**

Il programma `len`:

```ts
const len = (s: string): number => s.length
```

Chiamiamo **programma con effetti** una funzione con la seguente firma:

```ts
(a: A) => F<B>
```

Una tale firma modella un programma che accetta un input di tipo `A` e restituisce un risultato di tipo `B` insieme ad un **effetto** `F`, ove `F` è un qualche type constructor.

Ricordiamo che un [type constructor](https://en.wikipedia.org/wiki/Type_constructor) è un operatore a livello di tipi `n`-ario che prende come argomento zero o più tipi e che restituisce un tipo.

**Esempio**

Il programma `head`:

```ts
const head = (as: Array<string>): Option<string> =>
  as.length === 0 ? none : some(as[0])
```

è un programma con effetto `Option`.

Quando parliamo di effetti siamo interessati a type constructor `n`-ari con `n >= 1`, per esempio:

| Type constructor | Effect (interpretation)                     |
| ---------------- | ------------------------------------------- |
| `Array<A>`       | a non deterministic computation             |
| `Option<A>`      | a computation that may fail                 |
| `IO<A>`          | a synchronous computation with side effects |
| `Task<A>`        | an asynchronous computation                 |

ove

```ts
interface Task<A> extends IO<Promise<A>> {}
```

Torniamo ora al nostro problema principale:

> Come possiamo comporre due funzioni generiche `f: (a: A) => B` e `g: (c: C) => D`?

Dato che il problema generale non è trattabile, dobbiamo aggiungere qualche *vincolo* a `B` e `C`.

Sappiamo già che se `B = C` allora la soluzione è l'usuale composizione di funzioni

```ts
function compose<A, B, C>(g: (b: B) => C, f: (a: A) => B): (a: A) => C {
  return a => g(f(a))
}
```

Ma cosa dire degli altri casi?

## 9.2. Come il vincolo `B = F<C>` conduce ai funtori...

Consideriamo il seguente vincolo: `B = F<C>` per un qualche type constructor `F`, o in altre parole (e dopo un po' di renaming):

- `f: (a: A) => F<B>` è un programma con effetti
- `g: (b: B) => C` è un programma puro

Per poter comporre `f` con `g` dobbiamo trovare un procedimento (detto `lift`ing) che permetta di tramutare `g` da una funzione `(b: B) => C` ad una funzione `(fb: F<B>) => F<C>` in modo tale che possiamo usare la normale composizione di funzioni (infatti in questo modo il codominio di `f` sarebbe lo stesso insieme che fa da dominio della nuova funzione).

Perciò abbiamo modificato il problema originale in uno nuovo e diverso: possiamo trovare una funzione `lift` che agisce in questo modo?

Vediamo qualche esempio pratico:

**Example** (`F = Array`)

```ts
function lift<B, C>(g: (b: B) => C): (fb: Array<B>) => Array<C> {
  return fb => fb.map(g)
}
```

**Example** (`F = Option`)

```ts
import { isNone, none, Option, some } from 'fp-ts/lib/Option'

function lift<B, C>(g: (b: B) => C): (fb: Option<B>) => Option<C> {
  return fb => (isNone(fb) ? none : some(g(fb.value)))
}
```

**Example** (`F = Task`)

```ts
import { Task } from 'fp-ts/lib/Task'

function lift<B, C>(g: (b: B) => C): (fb: Task<B>) => Task<C> {
  return fb => () => fb().then(g)
}
```

Tutte queste funzioni `lift` si assomigliano molto. Non è una coincidenza, c'è un pattern molto importante dietro le quinte: tutti questi type constructor (e molti altri) ammettono una **istanza di funtore**.

I funtori sono delle **mappe tra categorie** che preservano la struttura categoriale, ovvero che preservano i morfismi identità e l'operazione di composizione.

Dato che le categorie sono costituite da due cose (gli oggetti e i morfismi) anche un funtore è costituito da due cose:

- una **mappa tra oggetti** che associa ad ogni oggetto in `X` in _C_ un oggetto in _D_
- una **mappa tra morfismi** che associa ad ogni morfismo in _C_ un morfismo in _D_

ove _C_ e _D_ sono due categorie (aka due linguaggi di programmazione).

<img src="images/functor.jpg" width="300" alt="functor" />

(source: [functor on ncatlab.org](https://ncatlab.org/nlab/show/functor))

Anche se una mappa tra due linguaggi di programmazione è un'idea intrigante, siamo più interessati ad una mappa in cui _C_ and _D_ coincidono (con *TS*). In questo caso parliamo di **endofuntori** ("endo" significa "dentro", "interno").

D'ora in poi, se non diversamente specificato, quando scrivo "funtore" intendo un endofuntore in *TS*.

Ora che sappiamo qual'è l'aspetto pratico che ci interessa dei funtori, vediamone la definizione formale.

### 9.2.1. Definizione

Un funtore è una coppia `(F, lift)` ove:

- `F` è un type constructor `n`-ario (`n >= 1`) che mappa ogni tipo `X` in un tipo `F<X>` (**mappa tra oggetti**)
- `lift` è una funzione con la seguente firma:

```ts
lift: <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)
```

che mappa ciascuna funzione `f: (a: A) => B` in una funzione `lift(f): (fa: F<A>) => F<B>` (**mappa tra morfismi**)

Devono valere le seguenti proprietà:

- `lift(1`<sub>X</sub>`)` = `1`<sub>F(X)</sub> (**le identità vanno in identità**)
- `lift(g ∘ f) = lift(g) ∘ lift(f)` (**l'immagine di una composizione è la composizione delle immagini**)

La funzione `lift` è anche conosciuta sottoforma di una sua variante chiamata `map`, che è essenzialmente `lift` ma con gli argomenti riarrangiati:

```ts
lift: <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)
map:  <A, B>(fa: F<A>, f: (a: A) => B) => F<B>
```

Notate che `map` può essere derivata da `lift` (e viceversa).

## 9.3. Funtori in `fp-ts`

Come facciamo a definire una istanza di funtore in `fp-ts`? Vediamo qualche esempio pratico.

La seguente dichiarazione definisce il modello di una risposta di una chiamata ad una API:

```ts
interface Response<A> {
  url: string
  status: number
  headers: Record<string, string>
  body: A
}
```

Notate che il campo `body` è parametrico, questo fatto rende `Response` un buon candidato per cercare una istanza di funtore dato che `Response` è un type constructor `n`-ario con `n >= 1` (una condizione necessaria).

Per poter definire una istanza di funtore per `Response` dobbiamo definire una funzione `map` insieme ad alcuni [dettagli tecnici](https://gcanti.github.io/fp-ts/recipes/HKT.html) resi necessari da `fp-ts`.

```ts
// `Response.ts` module

import { Functor1 } from 'fp-ts/lib/Functor'

export const URI = 'Response'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    Response: Response<A>
  }
}

export interface Response<A> {
  url: string
  status: number
  headers: Record<string, string>
  body: A
}

function map<A, B>(fa: Response<A>, f: (a: A) => B): Response<B> {
  return { ...fa, body: f(fa.body) }
}

// functor instance for `Response`
export const functorResponse: Functor1<URI> = {
  URI,
  map
}
```

## 9.4. Composizione di funtori

I funtori compongono, ovvero dati due funtori `F` e `G`, allora la composizione `F<G<A>>` è ancora un funtore e la `map` della composizione è la composizione delle `map`

**Esempio**

```ts
import { Option, option } from 'fp-ts/lib/Option'
import { array } from 'fp-ts/lib/Array'

export const functorArrayOption = {
  map: <A, B>(fa: Array<Option<A>>, f: (a: A) => B): Array<Option<B>> =>
    array.map(fa, oa => option.map(oa, f))
}
```

Per evitare boilerplate `fp-ts` esporta un helper:

```ts
import { array } from 'fp-ts/lib/Array'
import { getFunctorComposition } from 'fp-ts/lib/Functor'
import { option } from 'fp-ts/lib/Option'

export const functorArrayOption = getFunctorComposition(array, option)
```

## 9.5. Abbiamo risolto il problema generale?

Non ancora. I funtori ci permettono di comporre un programma con effetti `f` con un programma puro `g`, ma `g` deve essere una funzione **unaria**, ovvero una funzione che accetta un solo argomento. Cosa succede se `g` accetta due o più argomenti?

| Program f | Program g               | Composition   |
| --------- | ----------------------- | ------------- |
| pure      | pure                    | `g ∘ f`       |
| effectful | pure (unary)            | `lift(g) ∘ f` |
| effectful | pure (`n`-ary, `n > 1`) | ?             |

Per poter gestire questa circostanza abbiamo bisogno di qualcosa in più, nel prossimo capitolo vedremo un'altra importante astrazione della programmazione funzionale: i **funtori applicativi**.

## 9.6. Funtori controvarianti

Prima di passare ai funtori applicativi voglio mostrarvi una variante del concetto di funtore che abbiamo visto nella sezione precedente: i **funtori controvarianti**.

Ad essere pignoli infatti quelli che abbiamo chiamato semplicemente "funtori" dovrebbero essere più propriamente chiamati **funtori covarianti**.

La definizione di funtore controvariante è del tutto analoga a quella di funtore covariante, eccetto per la firma della sua operazione fondamentale (che viene chiamata `contramap` invece di `map`)

```ts
// funtore covariante
export interface Functor<F> {
  readonly map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>
}

// funtore controvariante
export interface Contravariant<F> {
  readonly contramap: <A, B>(fa: HKT<F, A>, f: (b: B) => A) => HKT<F, B>
}
```

**Nota**: il tipo `HKT` è il modo in cui `fp-ts` rappresenta un generico type constructor (una tecnica proposta nel paper [Lightweight higher-kinded polymorphism](https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf)) perciò quando vedete `HKT<F, X>` potete pensarlo come al type constructor `F` applicato al tipo `X` (ovvero `F<X>`).

Come esempi, abbiamo già visto due tipi notevoli che ammettono una istanza di funtore controvariante: `Eq` e `Ord`.

# 10. Funtori applicativi

Nella sezione riguardante i funtori abbiamo visto che possiamo comporre un programma con effetti `f: (a: A) => F<B>` con un programma puro `g: (b: B) => C` tramite lifting di `g` ad una funzione `lift(g): (fb: F<B>) => F<C>`, ammesso che `F` ammetta una istanza di funtore.

| Program f | Program g    | Composition   |
| --------- | ------------ | ------------- |
| pure      | pure         | `g ∘ f`       |
| effectful | pure (unary) | `lift(g) ∘ f` |

Tuttavia `g` deve essere unaria, ovvero deve accettare un solo argomento in input. Che succede se `g` accetta due argomenti? Possiamo ancora fare un lifting di `g` usando solo l'istanza di funtore? Proviamoci!

## 10.1. Currying

Prima di tutto dobbiamo modellare una funzione che accetta due argomenti, diciamo di tipo `B` e `C` (possiamo usare una tupla per questo) e restituisce un valore di tipo `D`:

```ts
g: (args: [B, C]) => D
```

Possiamo riscrivere `g` usando una tecnica chiamata **currying**.

> Currying is the technique of translating the evaluation of a function that takes multiple arguments into evaluating a sequence of functions, **each with a single argument**. For example, a function that takes two arguments, one from `B` and one from `C`, and produces outputs in `D`, by currying is translated into a function that takes a single argument from `C` and produces as outputs functions from `B` to `C`.

(source: [currying on wikipedia.org](https://en.wikipedia.org/wiki/Currying))

Perciò, tramite currying, possiamo riscrivere `g` come:

```ts
g: (b: B) => (c: C) => D
```

Quello che vogliamo è una operazione di lifting, chiamiamola `liftA2` per distinguerla dalla nostra vecchia `lift` dei funtori, che resituisca una funzione con la seguente firma:

```ts
liftA2(g): (fb: F<B>) => (fc: F<C>) => F<D>
```

Come facciamo ad ottenerla? Siccome adesso `g` è unaria, possiamo usare l'istanza di funtore e la nostra vecchia `lift`:

```ts
lift(g): (fb: F<B>) => F<(c: C) => D>
```

Ma ora siamo bloccati: non c'è alcuna operazione legale fornita dalla istanza di funtore che ci permette di **spacchettare** (`unpack`) il valore `F<(c: C) => D>` in una funzione `(fc: F<C>) => F<D>`.

## 10.2. Apply

Introduciamo perciò una nuova astrazione `Apply` che possiede una tale operazione di spacchettamento (chiamata `ap`):

```ts
interface Apply<F> extends Functor<F> {
  readonly ap: <C, D>(fcd: HKT<F, (c: C) => D>, fc: HKT<F, C>) => HKT<F, D>
}
```

La funzione `ap` è fondamentalmente `unpack` con gli argomenti riarrangiati:

```ts
unpack: <C, D>(fcd: HKT<F, (c: C) => D>) => ((fc: HKT<F, C>) => HKT<F, D>)
ap:     <C, D>(fcd: HKT<F, (c: C) => D>, fc: HKT<F, C>) => HKT<F, D>
```

perciò `ap` può essere derivata da `unpack` (e viceversa).

## 10.3. Applicative

In più sarebbe comodo se esistesse un'altra operazione che sia in grado di fare il **lifting di un valore** di tipo `A` in un valore di tipo `F<A>`. In questo modo potremo chiamare la funzione `liftA2(g)` sia fornendo valori di tipo `F<B>` e `F<C>`, sia tramite lifting di valori di tipo `B` e `C`.

Introduciamo perciò l'astrazione `Applicative` che arricchisce `Apply` e che contiene una tale operazione (chiamata `of`):

```ts
interface Applicative<F> extends Apply<F> {
  readonly of: <A>(a: A) => HKT<F, A>
}
```

Vediamo qualche istanza di `Applicative` per alcuni data type comuni:

**Example** (`F = Array`)

```ts
import { flatten } from 'fp-ts/lib/Array'

export const applicativeArray = {
  map: <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> => fa.map(f),
  of: <A>(a: A): Array<A> => [a],
  ap: <A, B>(fab: Array<(a: A) => B>, fa: Array<A>): Array<B> =>
    flatten(fab.map(f => fa.map(f)))
}
```

**Example** (`F = Option`)

```ts
import { fold, isNone, map, none, Option, some } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'

export const applicativeOption = {
  map: <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> =>
    isNone(fa) ? none : some(f(fa.value)),
  of: <A>(a: A): Option<A> => some(a),
  ap: <A, B>(fab: Option<(a: A) => B>, fa: Option<A>): Option<B> =>
    pipe(
      fab,
      fold(
        () => none,
        f =>
          pipe(
            fa,
            map(f)
          )
      )
    )
}
```

**Example** (`F = Task`)

```ts
import { Task } from 'fp-ts/lib/Task'

export const applicativeTask = {
  map: <A, B>(fa: Task<A>, f: (a: A) => B): Task<B> => () => fa().then(f),
  of: <A>(a: A): Task<A> => () => Promise.resolve(a),
  ap: <A, B>(fab: Task<(a: A) => B>, fa: Task<A>): Task<B> => () =>
    Promise.all([fab(), fa()]).then(([f, a]) => f(a))
}
```

## 10.4. Lifting

Data una istanza di `Apply` per `F` possiamo quindi definire `liftA2`?

```ts
import { HKT } from 'fp-ts/lib/HKT'
import { Apply } from 'fp-ts/lib/Apply'

type Curried2<B, C, D> = (b: B) => (c: C) => D

function liftA2<F>(
  F: Apply<F>
): <B, C, D>(g: Curried2<B, C, D>) => Curried2<HKT<F, B>, HKT<F, C>, HKT<F, D>> {
  return g => fb => fc => F.ap(F.map(fb, g), fc)
}
```

Bene! Ma che succede con le funzioni che accettano **tre** argomenti? Abbiamo bisogno di *un'altra astrazione ancora*?

La buona notizia è che la risposta è no, `Apply` è sufficiente:

```ts
type Curried3<B, C, D, E> = (b: B) => (c: C) => (d: D) => E

function liftA3<F>(
  F: Apply<F>
): <B, C, D, E>(
  g: Curried3<B, C, D, E>
) => Curried3<HKT<F, B>, HKT<F, C>, HKT<F, D>, HKT<F, E>> {
  return g => fb => fc => fd => F.ap(F.ap(F.map(fb, g), fc), fd)
}
```

In realtà data una istanza di `Apply` possiamo scrivere con lo stesso pattern una funzione `liftAn`, **qualsiasi** sia `n`!

**Nota**. `liftA1` non è altro che `lift`, l'operazione fondamentale di `Functor`.

Ora possiamo aggiornare la nostra "tabella di composizione":

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |

ove `liftA1 = lift`

**Demo**

[`04_applicative.ts`](src/04_applicative.ts)

## 10.5. Composizione di funtori applicativi

I funtori applicativi compongono, ovvero dati due funtori applicativi `F` e `G`,
allora la loro composizione `F<G<A>>` è ancora un funtore applicativo.

**Esempio**

```ts
import { array } from 'fp-ts/lib/Array'
import { Option, option } from 'fp-ts/lib/Option'

export const applicativeArrayOption = {
  map: <A, B>(fa: Array<Option<A>>, f: (a: A) => B): Array<Option<B>> =>
    array.map(fa, oa => option.map(oa, f)),
  of: <A>(a: A): Array<Option<A>> => array.of(option.of(a)),
  ap: <A, B>(fab: Array<Option<(a: A) => B>>, fa: Array<Option<A>>): Array<Option<B>> =>
    array.ap(array.map(fab, gab => (ga: Option<A>) => option.ap(gab, ga)), fa)
}
```

Per evitare il boilerplate `fp-ts` esporta un helper:

```ts
import { getApplicativeComposition } from 'fp-ts/lib/Applicative'
import { array } from 'fp-ts/lib/Array'
import { option } from 'fp-ts/lib/Option'

export const applicativeArrayOption = getApplicativeComposition(array, option)
```

## 10.6. Abbiamo risolto il problema generale?

Non ancora. C'è ancora un ultimo importante caso da considerare: quando **entrambi** i programmi sono con effetti.

Ancora una volta abbiamo bisogno di qualche cosa in più, nel capitoloseguente parleremo di una delle astrazioni più importanti in programmazione funzionale: le **monadi**.

# 11. Monadi

Eugenio Moggi is a professor of computer science at the University of Genoa, Italy. He first described the general use of monads to structure programs.

<img src="images/moggi.jpg" width="300" alt="Heinrich Kleisli" />

Philip Lee Wadler is an American computer scientist known for his contributions to programming language design and type theory.

<img src="images/wadler.jpg" width="300" alt="Heinrich Kleisli" />

Nell'ultimo capitolo abbiamo visto che possiamo comporre un programma con effetti `f: (a: A) => M<B>` con un programma `n`-ario puro `g`, ammesso che `M` ammetta una istanza di funtore applicativo:

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |

ove `liftA1 = lift`

Tuttavia dobbiamo risolvere un ultimo (e frequente) caso: quando **entrambi** i programmi sono con effetto.

```ts
f: (a: A) => M<B>
g: (b: B) => M<C>
```

Qual'è la composizione di `f` e `g`?

Per poter gestire questo ultimo caso abbiamo bisogno di qualcosa di più potente di `Functor` dato che è piuttosto semplice ritrovarsi con contesti innestati.

## 11.1. Il problema: nested contexts

Per mostrare meglio perchè abbiamo bisogno di qualcosa in più, vediamo qualche esempio pratico.

**Example** (`M = Array`)

Supponiamo di voler ricavare i follower dei follower di un utente Twitter:

```ts
interface User {
  followers: Array<User>
}

const getFollowers = (user: User): Array<User> => user.followers

declare const user: User

const followersOfFollowers: Array<Array<User>> = getFollowers(user).map(getFollowers)
```

C'è qualcosa di sbagliato, `followersOfFollowers` ha tipo `Array<Array<User>>` ma noi vorremmo `Array<User>`.

Abbiamo bisogno di disinnestare (**flatten**) gli array innestati.

La funzione `flatten: <A>(mma: Array<Array<A>>) => Array<A>` esportata da `fp-ts` fa al caso nostro:

```ts
import { flatten } from 'fp-ts/lib/Array'

const followersOfFollowers: Array<User> = flatten(getFollowers(user).map(getFollowers))
```

Bene! Vediamo con un'altra struttura dati:

**Example** (`M = Option`)

Supponiamo di voler calcolare il reciproco del primo elemento di un array numerico:

```ts
import { head } from 'fp-ts/lib/Array'
import { none, Option, option, some } from 'fp-ts/lib/Option'

const inverse = (n: number): Option<number> => (n === 0 ? none : some(1 / n))

const inverseHead: Option<Option<number>> = option.map(head([1, 2, 3]), inverse)
```

Opss, è successo di nuovo, `inverseHead` ha tipo `Option<Option<number>>` ma noi vogliamo `Option<number>`.

Abbiamo bisogno di disinnestare le `Option` innestate.

```ts
import { head } from 'fp-ts/lib/Array'
import { isNone, none, Option, option } from 'fp-ts/lib/Option'

const flatten = <A>(mma: Option<Option<A>>): Option<A> => (isNone(mma) ? none : mma.value)

const inverseHead: Option<number> = flatten(option.map(head([1, 2, 3]), inverse))
```

Tutte quelle funzioni `flatten`... Non sono una coincidenza, c'è un pattern funzionale dietro le quinte: tutti quei type constructor (e molti altri) ammettono una **istanza di monade** e

> `flatten` is the most peculiar operation of monads

Dunque cos'è una monade?

Ecco come spesso sono presentate le monadi...

## 11.2. Definizione

Una monade è definita da tre cose:

(1) un type constructor `M` che ammette una istanza di funtore

(2) una funzione `of` con la seguente firma:

```ts
of: <A>(a: A) => HKT<M, A>
```

(3) una funzione `flatMap` con la seguente firma:

```ts
flatMap: <A, B>(f: (a: A) => HKT<M, B>) => ((ma: HKT<M, A>) => HKT<M, B>)
```

**Nota**: ricordiamo che il tipo `HKT` è il modo in cui `fp-ts` rappresenta un generico type constructor, perciò quando vedete`HKT<M, X>` potete pensare al type constructor `M` applicato al tipo `X` (ovvero `M<X>`).

Le funzioni `of` e `flatMap` devono obbedire a tre leggi:

- `flatMap(of) ∘ f = f` (**Left identity**)
- `flatMap(f) ∘ of = f` (**Right identity**)
- `flatMap(h) ∘ (flatMap(g) ∘ f) = flatMap((flatMap(h) ∘ g)) ∘ f` (**Associativity**)

ove `f`, `g`, `h` sono tutte funzioni con effetto e `∘` è l'usuale composizione di funzioni.

## 11.3. Ok ma... perchè?

Quando vidi per la prima volta questa definizione la mia prima reazione fu di sconcerto.

Avevo in testa molte domande:

- perchè proprio quelle due operazioni e perchè hanno quella firma?
- come mai il nome "flatMap"?
- perchè devono valere quelle leggi? Che cosa significano?
- ma soprattutto, dov'è la mia `flatten`?

Questo capitolo cercherà di rispondere a tutte queste domande.

Torniamo al nostro problema: che cos'è la composizione di due funzioni con effetto (anche chiamate **Kleisli arrows**)?

<img src="images/kleisli_arrows.png" alt="two Kleisli arrows, what's their composition?" width="450px" />

Per ora non so nemmeno che **tipo** abbia una tale composizione.

Un momento... abbiamo già incontrato una astrazione che parla specificatamente di composizione. Vi ricordate cosa ho detto a proposito delle categorie?

> Categories capture the essence of composition

Possiamo trasformare il nostro problema in un problema categoriale: possiamo trovare una categoria che modella la composizione delle Kleisli arrows?

## 11.4. La categoria di Kleisli

Heinrich Kleisli (Swiss mathematician)

<img src="images/kleisli.jpg" width="300" alt="Heinrich Kleisli" />

Cerchiamo di costruire una categoria *K* (chiamata **categoria di Kleisli**) che contenga *solo* funzioni con effetti:

- gli **oggetti** sono gli stessi oggetti della categoria *TS*, ovvero tutti i tipi di TypeScript.
- i **morfismi** sono costruiti così: ogni volta che c'è una Kleisli arrow `f: A ⟼ M<B>` in _TS_ tracciamo una freccia `f': A ⟼ B` in _K_

<img src="images/kleisli_category.png" alt="above the TS category, below the K construction" width="450px" />

(sopra la categoria _TS_, sotto la costruzione di _K_)

Dunque cosa sarebbe la composizione di `f` e `g` in *K*? E' la freccia tratteggiata chiamata `h'` nell'immagine qui sotto:

<img src="images/kleisli_composition.png" alt="above the composition in the TS category, below the composition in the K construction" width="450px" />

(sopra la categoria _TS_, sotto la costruzione di _K_)

Dato che `h'` è una freccia che va da `A` a `C`, deve esserci una funzione corrispondente `h` che va da `A` a `M<C>` in `TS`.

Quindi un buon candidato per la composizione di `f` e `g` in *TS* è ancora una funzione con effetti con la seguente firma: `(a: A) => M<C>`.

Come facciamo a costruire una tale funzione? Beh, proviamoci!

## 11.5. Costruzione della composizione passo dopo passo

Il punto (1) della definizione di monade ci dice che `M` ammette una istanza di funtore, percò possiamo usare `lift` per trasformare la funzione `g: (b: B) => M<C>` in una funzione `lift(g): (mb: M<B>) => M<M<C>>` (qui sotto sto usando il nome `map` al posto di `lift`, ma sappiamo che sono equivalenti)

<img src="images/flatMap.png" alt="where flatMap comes from" width="450px" />

(da dove nasce `flatMap`)

Ma ora siamo bloccati: non c'è alcuna operazione legale della istanza di funtore che ci permette di disinnestare un valore di tipo `M<M<C>>` in un valore di tipo `M<C>`, abbiamo bisogno di una operazione addizionale `flatten`.

Se riusciamo a definire una tale operazione allora possiamo ottenere la composizione che stavamo cercando:

```
h = flatten ∘ map(g) ∘ f
```

Ma aspettate... `flatten ∘ map(g)` è **flatMap**, ecco da dove viene il nome!

```
h = flatMap(g) ∘ f
```

Ora possiamo aggiornare la nostra "tabella di composizione"

| Program f | Program g     | Composition      |
| --------- | ------------- | ---------------- |
| pure      | pure          | `g ∘ f`          |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f`  |
| effectful | effectful     | `flatMap(g) ∘ f` |

ove `liftA1 = lift`

E per quanto riguarda `of`? Ebbene, `of` proviene dai morfismi identità in *K*: per ogni morfismo identità 1<sub>A</sub> in _K_ deve esserci una corrispondente funzione da `A` a `M<A>` (ovvero `of: <A>(a: A) => M<A>`).

<img src="images/of.png" alt="where of comes from" width="300px" />

(da dove nasce `of`)

## 11.6. Le leggi

Ultima domanda: da dove nascono le leggi? Esse non sono altro che le leggi categoriali in *K* tradotte in *TS*:

| Law            | _K_                               | _TS_                                                            |
| -------------- | --------------------------------- | --------------------------------------------------------------- |
| Left identity  | 1<sub>B</sub> ∘ `f'` = `f'`       | `flatMap(of) ∘ f = f`                                           |
| Right identity | `f'` ∘ 1<sub>A</sub> = `f'`       | `flatMap(f) ∘ of = f`                                           |
| Associativity  | `h' ∘ (g' ∘ f') = (h' ∘ g') ∘ f'` | `flatMap(h) ∘ (flatMap(g) ∘ f) = flatMap((flatMap(h) ∘ g)) ∘ f` |

## 11.7. Monadi in `fp-ts`

In `fp-ts` la funzione `flatMap` è modellata con una sua variante equivalente chiamata `chain`, che è fondamentalmente `flatMap` con gli argomenti riarrangiati:

```ts
flatMap: <A, B>(f: (a: A) => HKT<M, B>) => ((ma: HKT<M, A>) => HKT<M, B>)
chain:   <A, B>(ma: HKT<M, A>, f: (a: A) => HKT<M, B>) => HKT<M, B>
```

Notate che `chain` può essere derivata da `flatMap` (e viceversa).

Se adesso torniamo agli esempi che mostravano il problema con i contesti innestati possiamo risolverli usando `chain`:

```ts
import { array, head } from 'fp-ts/lib/Array'
import { Option, option } from 'fp-ts/lib/Option'

const followersOfFollowers: Array<User> = array.chain(getFollowers(user), getFollowers)

const headInverse: Option<number> = option.chain(head([1, 2, 3]), inverse)
```

## 11.8. Trasparenza referenziale

Vediamo ora come, grazie alla trasparenza referenziale e al concetto di monade, possiamo manipolare i programmi programmaticamente.

Ecco un piccolo programma che legge / scrive su un file

```ts
import { log } from 'fp-ts/lib/Console'
import { IO, chain } from 'fp-ts/lib/IO'
import { pipe } from 'fp-ts/lib/pipeable'
import * as fs from 'fs'

//
// funzioni di libreria
//

const readFile = (filename: string): IO<string> => () =>
  fs.readFileSync(filename, 'utf-8')

const writeFile = (
  filename: string,
  data: string
): IO<void> => () =>
  fs.writeFileSync(filename, data, { encoding: 'utf-8' })

//
// programma
//

const program1 = pipe(
  readFile('file.txt'),
  chain(log),
  chain(() => writeFile('file.txt', 'hello')),
  chain(() => readFile('file.txt')),
  chain(log)
)
```

L'azione:

```ts
pipe(
  readFile('file.txt'),
  chain(log)
)
```

è ripetuta due volte nel programma, ma dato che vale la trasparenza referenziale possiamo mettere a fattor comune l'azione assegnandone l'espressione ad una costante.

```ts
const read = pipe(
  readFile('file.txt'),
  chain(log)
)

const program2 = pipe(
  read,
  chain(() => writeFile('file.txt', 'hello')),
  chain(() => read)
)
```

Possiamo persino definire un combinatore e sfruttarlo per rendere più compatto il codice:

```ts
function interleave<A, B>(
  a: IO<A>,
  b: IO<B>
): IO<A> {
  return pipe(
    a,
    chain(() => b),
    chain(() => a)
  )
}

const program3 = interleave(
  read,
  writeFile('file.txt', 'foo')
)
```

Un altro esempio: implementare una funzione simile a `time` di Unix (la parte relativa al tempo di esecuzione reale) per `IO`.

```ts
import { IO, io } from 'fp-ts/lib/IO'
import { now } from 'fp-ts/lib/Date'
import { log } from 'fp-ts/lib/Console'

export function time<A>(ma: IO<A>): IO<A> {
  return io.chain(now, start =>
    io.chain(ma, a =>
      io.chain(now, end =>
        io.map(log(`Elapsed: ${end - start}`), () => a)
      )
    )
  )
}
```

Esempio di utilizzo

```ts
import { randomInt } from 'fp-ts/lib/Random'
import { fold, monoidVoid } from 'fp-ts/lib/Monoid'
import { getMonoid } from 'fp-ts/lib/IO'
import { replicate } from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/pipeable'
import { chain } from 'fp-ts/lib/IO'

function fib(n: number): number {
  return n <= 1 ? 1 : fib(n - 1) + fib(n - 2)
}

const printFib: IO<void> = pipe(
  randomInt(30, 35),
  chain(n => log(fib(n)))
)

function replicateIO(n: number, mv: IO<void>): IO<void> {
  return fold(getMonoid(monoidVoid))(replicate(n, mv))
}

time(replicateIO(3, printFib))()
/*
5702887
1346269
14930352
Elapsed: 193
*/
```

Stampando anche i parziali

```ts
time(replicateIO(3, time(printFib)))()
/*
3524578
Elapsed: 32
14930352
Elapsed: 125
3524578
Elapsed: 32
Elapsed: 189
*/
```

**Demo**

[`05_game.ts`](src/05_game.ts)
