/*

  # Summary

  In questa demo vediamo una nuova struttura dati,
  gli alberi binari, e definiamo una istanza per

  - `Foldable`
  - `Traversable`

*/

//
// data
//

export type BinaryTree<A> = Leaf<A> | Node<A>

export class Leaf<A> {
  readonly _tag: 'Leaf' = 'Leaf'
  constructor(readonly value: A) {}
  toString(): string {
    return `leaf(${this.value})`
  }
}

export class Node<A> {
  readonly _tag: 'Node' = 'Node'
  constructor(
    readonly left: BinaryTree<A>,
    readonly right: BinaryTree<A>
  ) {}
  toString(): string {
    return `node(${this.left}, ${this.right})`
  }
}

export const leaf = <A>(a: A): BinaryTree<A> => new Leaf(a)

export const node = <A>(
  left: BinaryTree<A>,
  right: BinaryTree<A>
): BinaryTree<A> => new Node(left, right)

//
// Foldable instance
//

export const reduce = <A, B>(
  fa: BinaryTree<A>,
  b: B,
  f: (b: B, a: A) => B
): B => {
  switch (fa._tag) {
    case 'Leaf':
      return f(b, fa.value)
    case 'Node':
      return reduce(fa.right, reduce(fa.left, b, f), f)
  }
}

const tree = node(node(leaf('a'), leaf('b')), leaf('c'))
/*
   c
  / b
  \/
   \a
*/

console.log(reduce(tree, '', (b, a) => b + a)) // 'abc

//
// Traversable instance
//

import { Applicative1 } from 'fp-ts/lib/Applicative'
import { URIS, Type } from 'fp-ts/lib/HKT'
import { liftA2 } from 'fp-ts/lib/Apply'

export function traverse<F extends URIS>(
  F: Applicative1<F>
): <A, B>(
  fa: BinaryTree<A>,
  f: (a: A) => Type<F, B>
) => Type<F, BinaryTree<B>> {
  const nodeLifted: <A>(
    fa: Type<F, BinaryTree<A>>
  ) => (
    fb: Type<F, BinaryTree<A>>
  ) => Type<F, BinaryTree<A>> = liftA2(F)(left => right =>
    node(left, right)
  )
  return (fa, f) => {
    switch (fa._tag) {
      case 'Leaf':
        return F.map(f(fa.value), leaf)
      case 'Node':
        return nodeLifted(traverse(F)(fa.left, f))(
          traverse(F)(fa.right, f)
        )
    }
  }
}

import { task } from 'fp-ts/lib/Task'

traverse(task)(tree, a => task.of(a.length))
  .run()
  .then(x => console.log(x.toString()))
// Node(Node(Leaf(1), Leaf(1)), Leaf(1))
