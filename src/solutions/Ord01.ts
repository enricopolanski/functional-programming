/**
 * Definire una istanza di `Ord` per `ReadonlyArray`
 */
import { fromCompare, Ord } from 'fp-ts/Ord'
import * as N from 'fp-ts/number'
import { pipe } from 'fp-ts/function'

const getOrd = <A>(O: Ord<A>): Ord<ReadonlyArray<A>> =>
  fromCompare((first, second) => {
    const aLen = first.length
    const bLen = second.length
    const len = Math.min(aLen, bLen)
    for (let i = 0; i < len; i++) {
      const ordering = O.compare(first[i], second[i])
      if (ordering !== 0) {
        return ordering
      }
    }
    return N.Ord.compare(aLen, bLen)
  })

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const O = getOrd(N.Ord)

assert.deepStrictEqual(O.compare([1], [1]), 0)
assert.deepStrictEqual(O.compare([1], [1, 2]), -1)
assert.deepStrictEqual(O.compare([1, 2], [1]), 1)
assert.deepStrictEqual(O.compare([1, 2], [1, 2]), 0)
assert.deepStrictEqual(O.compare([1, 1], [1, 2]), -1)
assert.deepStrictEqual(O.compare([1, 1], [2]), -1)
