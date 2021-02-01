/**
 * Definire una istanza di `Eq` per `Tree`
 */
import { Eq, fromEquals } from 'fp-ts/Eq'
import * as S from 'fp-ts/string'
import * as A from 'fp-ts/ReadonlyArray'

type Forest<A> = ReadonlyArray<Tree<A>>

interface Tree<A> {
  readonly value: A
  readonly forest: Forest<A>
}

const getEq = <A>(E: Eq<A>): Eq<Tree<A>> => {
  const R: Eq<Tree<A>> = fromEquals((second) => (first) =>
    E.equals(second.value)(first.value) &&
    SA.equals(second.forest)(first.forest)
  )
  const SA = A.getEq(R)
  return R
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const make = <A>(value: A, forest: Forest<A> = []): Tree<A> => ({
  value,
  forest
})

const E = getEq(S.Eq)

const t = make('a', [make('b'), make('c')])

assert.deepStrictEqual(pipe(t, E.equals(make('a'))), false)
assert.deepStrictEqual(pipe(t, E.equals(make('a', [make('b')]))), false)
assert.deepStrictEqual(
  pipe(t, E.equals(make('a', [make('b'), make('d')]))),
  false
)
assert.deepStrictEqual(
  pipe(t, E.equals(make('a', [make('b'), make('c'), make('d')]))),
  false
)
assert.deepStrictEqual(
  pipe(t, E.equals(make('a', [make('b'), make('c')]))),
  true
)
