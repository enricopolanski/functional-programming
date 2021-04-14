/**
 * Definire un semigruppo per i predicati su `Point`
 */
import { pipe, Predicate, getSemigroup } from 'fp-ts/function'
import { Semigroup } from 'fp-ts/Semigroup'
import * as B from 'fp-ts/boolean'

type Point = {
  readonly x: number
  readonly y: number
}

const isPositiveX: Predicate<Point> = (p) => p.x >= 0
const isPositiveY: Predicate<Point> = (p) => p.y >= 0

const S: Semigroup<Predicate<Point>> = getSemigroup(B.SemigroupAll)<Point>()

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

// restituisce `true` se il punto appartiene al primo quadrante, ovvero se ambedue le sue `x` e `y` sono positive
const isPositiveXY = S.concat(isPositiveX, isPositiveY)

assert.deepStrictEqual(isPositiveXY({ x: 1, y: 1 }), true)
assert.deepStrictEqual(isPositiveXY({ x: 1, y: -1 }), false)
assert.deepStrictEqual(isPositiveXY({ x: -1, y: 1 }), false)
assert.deepStrictEqual(isPositiveXY({ x: -1, y: -1 }), false)
