/**
 * Modellare un albero binario completo, il/i costruttore/i, la funzione di pattern matching
 * e una funzione che converte l'albero in un `ReadonlyArray`
 */
export type BinaryTree<A> =
  | { readonly _tag: 'Leaf'; readonly value: A }
  | {
      readonly _tag: 'Node'
      readonly value: A
      readonly left: BinaryTree<A>
      readonly right: BinaryTree<A>
    }

export const leaf = <A>(value: A): BinaryTree<A> => ({ _tag: 'Leaf', value })

export const node = <A>(
  value: A,
  left: BinaryTree<A>,
  right: BinaryTree<A>
): BinaryTree<A> => ({ _tag: 'Node', value, left, right })

export const fold = <A, B>(
  onLeaf: (a: A) => B,
  onNode: (value: A, left: BinaryTree<A>, right: BinaryTree<A>) => B
) => (tree: BinaryTree<A>): B => {
  switch (tree._tag) {
    case 'Leaf':
      return onLeaf(tree.value)
    case 'Node':
      return onNode(tree.value, tree.left, tree.right)
  }
}

export const toReadonlyArray: <A>(
  tree: BinaryTree<A>
) => ReadonlyArray<A> = fold(
  (value) => [value],
  (value, left, right) =>
    [value].concat(toReadonlyArray(left)).concat(toReadonlyArray(right))
)
