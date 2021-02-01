/**
 * Definire una istanza di `Ord` per `ReadonlyArray`
 */
import { fromCompare, Ord } from 'fp-ts/Ord'
import * as N from 'fp-ts/number'

const getOrd = <A>(O: Ord<A>): Ord<ReadonlyArray<A>> =>
  fromCompare((second) => (first) => {
    const aLen = first.length
    const bLen = second.length
    const len = Math.min(aLen, bLen)
    for (let i = 0; i < len; i++) {
      const ordering = O.compare(second[i])(first[i])
      if (ordering !== 0) {
        return ordering
      }
    }
    return N.Ord.compare(bLen)(aLen)
  })

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const O = getOrd(N.Ord)

assert.deepStrictEqual(pipe([1], O.compare([1])), 0)
assert.deepStrictEqual(pipe([1], O.compare([1, 2])), -1)
assert.deepStrictEqual(pipe([1, 2], O.compare([1])), 1)
assert.deepStrictEqual(pipe([1, 2], O.compare([1, 2])), 0)
assert.deepStrictEqual(pipe([1, 1], O.compare([1, 2])), -1)
assert.deepStrictEqual(pipe([1, 1], O.compare([2])), -1)
