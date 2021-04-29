/**
 * Definire una istanza di `Eq` per `Tree`
 */
import { Eq } from 'fp-ts/Eq'
import * as S from 'fp-ts/string'

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

const make = <A>(value: A, forest: Forest<A> = []): Tree<A> => ({
  value,
  forest
})

const E = getEq(S.Eq)

const t = make('a', [make('b'), make('c')])

assert.deepStrictEqual(E.equals(t, make('a')), false)
assert.deepStrictEqual(E.equals(t, make('a', [make('b')])), false)
assert.deepStrictEqual(E.equals(t, make('a', [make('b'), make('d')])), false)
assert.deepStrictEqual(
  E.equals(t, make('a', [make('b'), make('c'), make('d')])),
  false
)
assert.deepStrictEqual(E.equals(t, make('a', [make('b'), make('c')])), true)
