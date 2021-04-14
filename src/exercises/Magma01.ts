/**
 * Implementare la funzione `fromReadonlyArray`
 */
import { Magma } from 'fp-ts/Magma'

declare const fromReadonlyArray: <A>(
  M: Magma<A>
) => (as: ReadonlyArray<readonly [string, A]>) => Readonly<Record<string, A>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const magmaSum: Magma<number> = {
  concat: (first, second) => first + second
}

// una istanza di Magma che semplicemente ignora il primo argomento
const lastMagma: Magma<number> = {
  concat: (_first, second) => second
}

// una istanza di Magma che semplicemente ignora il secondo argomento
const firstMagma: Magma<number> = {
  concat: (first, _second) => first
}

const input: ReadonlyArray<readonly [string, number]> = [
  ['a', 1],
  ['b', 2],
  ['a', 3]
]

assert.deepStrictEqual(fromReadonlyArray(magmaSum)(input), { a: 4, b: 2 })
assert.deepStrictEqual(fromReadonlyArray(lastMagma)(input), { a: 3, b: 2 })
assert.deepStrictEqual(fromReadonlyArray(firstMagma)(input), { a: 1, b: 2 })
