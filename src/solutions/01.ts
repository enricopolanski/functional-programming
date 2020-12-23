import { Magma } from './Magma'

const fromArray = <A>(M: Magma<A>) => (
  as: ReadonlyArray<readonly [string, A]>
): Record<string, A> => {
  const out: Record<string, A> = {}
  for (const [k, a] of as) {
    if (out.hasOwnProperty(k)) {
      out[k] = M.concat(a)(out[k])
    } else {
      out[k] = a
    }
  }
  return out
}

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const magmaSum: Magma<number> = {
  concat: (second) => (first) => first + second
}

// una istanza di Magma che semplicemente ignora il primo argomento
const lastMagma: Magma<number> = {
  concat: (second) => (_first) => second
}

// una istanza di Magma che semplicemente ignora il secondo argomento
const firstMagma: Magma<number> = {
  concat: (_second) => (first) => first
}

const input: ReadonlyArray<readonly [string, number]> = [
  ['a', 1],
  ['b', 2],
  ['a', 3]
]

assert.deepStrictEqual(fromArray(magmaSum)(input), { a: 4, b: 2 })
assert.deepStrictEqual(fromArray(lastMagma)(input), { a: 3, b: 2 })
assert.deepStrictEqual(fromArray(firstMagma)(input), { a: 1, b: 2 })
