export const Leaf = x => ({
  map: f => Leaf(f(x)),
  inspect: () => `Leaf(${x})`
})

export const Node = (left, x, right) => ({
  map: f => Node(left.map(f), f(x), right.map(f)),
  inspect: () => `Node(${left.inspect()}, ${x}, ${right.inspect()})`
})

const tree = Node(Node(Leaf(1), 2, Leaf(3)), 4, Leaf(5))

console.log(tree.map(x => x * 2)) // => Node(Node(Leaf(2), 4, Leaf(6)), 8, Leaf(10))
