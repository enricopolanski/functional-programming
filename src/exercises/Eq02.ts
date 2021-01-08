/**
 * Definire una istanza di `Eq` per `Tree`
 */
import { Eq, eqString } from 'fp-ts/Eq'

type Forest<A> = ReadonlyArray<Tree<A>>

interface Tree<A> {
  readonly value: A
  readonly forest: Forest<A>
}

declare const getEq: <A>(E: Eq<A>) => Eq<Tree<A>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const make = <A>(value: A, forest: Forest<A> = []): Tree<A> => ({
  value,
  forest
})

const E = getEq(eqString)

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
