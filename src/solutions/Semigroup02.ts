/**
 * Definire un semigruppo per i predicati su `Point`
 */
import { pipe, Predicate } from 'fp-ts/function'
import { getFunctionSemigroup, Semigroup, semigroupAll } from 'fp-ts/Semigroup'

type Point = {
  readonly x: number
  readonly y: number
}

const isPositiveX: Predicate<Point> = (p) => p.x >= 0
const isPositiveY: Predicate<Point> = (p) => p.y >= 0

const S: Semigroup<Predicate<Point>> = getFunctionSemigroup(
  semigroupAll
)<Point>()

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

// restituisce `true` se il punto appartiene al primo quadrante, ovvero se ambedue le sue `x` e `y` sono positive
const isPositiveXY = pipe(isPositiveX, S.concat(isPositiveY))

assert.deepStrictEqual(isPositiveXY({ x: 1, y: 1 }), true)
assert.deepStrictEqual(isPositiveXY({ x: 1, y: -1 }), false)
assert.deepStrictEqual(isPositiveXY({ x: -1, y: 1 }), false)
assert.deepStrictEqual(isPositiveXY({ x: -1, y: -1 }), false)
