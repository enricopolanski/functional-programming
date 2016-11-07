```js
// @flow

export class Leaf<A> {
  value: A;
  constructor(value: A) {
    this.value = value
  }
  toString() {
    return `Leaf(${String(this.value)})`
  }
}

export class Node<A> {
  value: A;
  left: Tree<A>;
  right: Tree<A>;
  constructor(value: A, left: Tree<A>, right: Tree<A>) {
    this.value = value
    this.left = left
    this.right = right
  }
  toString() {
    return `Branch(${String(this.value)}, ${this.left.toString()}, ${this.right.toString()})`
  }
}

export type Tree<A> = Leaf<A> | Node<A>;

const tree: Tree<number> = new Node(1, new Leaf(2), new Node(3, new Leaf(4), new Leaf(5)))
console.log(tree.toString())

// Functor
export function map<A, B>(f: (a: A) => B, fa: Tree<A>): Tree<B> {
  if (fa instanceof Leaf) {
    return new Leaf(f(fa.value))
  }
  return new Node(f(fa.value), map(f, fa.left), map(f, fa.right))
}

const double = n => n * 2
console.log(map(double, tree).toString())

interface Foldable<B> {
  reduce<A>(f: (b: B, a: A) => B, b: B, fa: Tree<A>): B;
}

// Foldable
export function reduce<A, B>(f: (b: B, a: A) => B, b: B, fa: Tree<A>): B {
  if (fa instanceof Leaf) {
    return f(b, fa.value)
  }
  return reduce(f, reduce(f, f(b, fa.value), fa.left), fa.right)
}

console.log(reduce((b, a) => b + a, 0, tree))

const maybe = {
  map<A, B>(f: (a: A) => B, fa: ?A): ?B {
    return fa == null ? null : f(fa)
  },
  ap<A, B>(fab: ?(a: A) => B, fa: ?A): ?B {
    return fab == null ? null : maybe.map(fab, fa)
  }
}

const leaf = a => new Leaf(a)
const node = a => left => right => new Node(a, left, right)

// Traversable
export function traverse<A, B>(f: (a: A) => ?B, ta: Tree<A>): ?Tree<B> {
  if (ta instanceof Leaf) {
    return maybe.map(leaf, f(ta.value))
  }
  return maybe.ap(maybe.ap(maybe.map(node, f(ta.value)), traverse(f, ta.left)), traverse(f, ta.right))
}

console.log(traverse(a => a > 1 ? `value: ${a}` : null, tree))
```
