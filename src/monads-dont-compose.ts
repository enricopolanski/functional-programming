// https://wiki.haskell.org/ListT_done_right#Examples
// http://hackage.haskell.org/package/transformers-0.5.5.0/docs/src/Control.Monad.Trans.List.html
// https://github.com/scalaz/scalaz/issues/921
// https://github.com/scalaz/scalaz/blob/fd8dc635d3d0be63ea3e160a572c3e36c94b086d/core/src/main/scala/scalaz/ListT.scala
// https://gist.github.com/tpolecat/1227e22e3161b5816e014c00650f3b57

import { array, flatten } from 'fp-ts/lib/Array'
import { sequence } from 'fp-ts/lib/Traversable'

import { Type, URIS } from 'fp-ts/lib/HKT'
import { Monad1 } from 'fp-ts/lib/Monad'

const getListT = <M extends URIS>(M: Monad1<M>) => {
  const of = <A>(a: A): Type<M, Array<A>> => M.of([a])
  const chain = <A, B>(
    fa: Type<M, Array<A>>,
    f: (a: A) => Type<M, Array<B>>
  ): Type<M, Array<B>> => {
    return M.chain(fa, a =>
      M.chain(sequence(M, array)(a.map(x => f(x))), b =>
        M.of(flatten(b))
      )
    )
  }
  return {
    of,
    chain
  }
}

export const of = <A>(a: A): ArrayArray<A> =>
  new ArrayArray([[a]])

const listTArray = getListT(array)

export class ArrayArray<A> {
  constructor(readonly run: Array<Array<A>>) {}
  chain<B>(f: (a: A) => ArrayArray<B>): ArrayArray<B> {
    return new ArrayArray(
      listTArray.chain(this.run, a => f(a).run)
    )
  }
}

const f = (n: 0 | 1): ArrayArray<0 | 1> => {
  if (n === 0) {
    return new ArrayArray<0 | 1>([[0, 1]])
  } else {
    return new ArrayArray<0 | 1>([[0], [1]])
  }
}

export const composeK = <A, B, C>(
  f: (b: B) => ArrayArray<C>,
  g: (a: A) => ArrayArray<B>
): ((a: A) => ArrayArray<C>) => {
  return a => g(a).chain(f)
}

console.log(composeK(f, composeK(f, f))(0))
/*
ArrayArray {
  run:
   [ [ 0, 1, 0, 0, 1 ],
     [ 0, 1, 1, 0, 1 ],
     [ 0, 1, 0, 0 ],
     [ 0, 1, 0, 1 ],
     [ 0, 1, 1, 0 ],
     [ 0, 1, 1, 1 ] ] }
*/
console.log(composeK(composeK(f, f), f)(0))
/*
ArrayArray {
  run:
   [ [ 0, 1, 0, 0, 1 ],
     [ 0, 1, 0, 0 ],
     [ 0, 1, 0, 1 ],
     [ 0, 1, 1, 0, 1 ],
     [ 0, 1, 1, 0 ],
     [ 0, 1, 1, 1 ] ] }
*/
