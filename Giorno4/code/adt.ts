export type Person = {
  name: string,
  age: number
}

type PersonTuple = [string, number]

const f = ([name, age]: PersonTuple): Person => ({ name, age })

const g = ({ name, age }: Person): PersonTuple => [name, age]

const constructor = (name: string, age: number): Person => ({ name, age })

type List<A> =
  | { tag: 'Nil' }
  | { tag: 'Cons', head: A, tail: List<A> }

function h<A>(x: List<A>): string {
  switch (x.tag) {
    case 'Nil' :
      return 'Nil'
    case 'Cons' :
      return 'Cons'
  }
}

type Tree<A> =
  | { tag: 'Empty' }
  | { tag: 'Leaf', value: A }
  | { tag: 'Node', left: Tree<A>, right: Tree<A> }

function map<A, B>(f: (a: A) => B, fa: Tree<A>): Tree<B> {
  switch (fa.tag) {
    case 'Empty' :
      return fa as any
    case 'Leaf' :
      return { tag: 'Leaf', value: f(fa.value) }
    case 'Node' :
      return { tag: 'Node', left: map(f, fa.left), right: map(f, fa.right) }
  }
}
