import { pipe } from 'fp-ts/function'
import { Semigroup } from 'fp-ts/Semigroup'
import * as fc from 'fast-check'

// -------------------------------------------------------------------------------------
// laws
// -------------------------------------------------------------------------------------

export const laws = {
  semigroup: {
    associativity: <A>(S: Semigroup<A>) => (a: A, b: A, c: A): boolean =>
      pipe(a, S.concat(b), S.concat(c)) ===
      pipe(a, S.concat(pipe(b, S.concat(c))))
  }
}

// -------------------------------------------------------------------------------------
// properties
// -------------------------------------------------------------------------------------

export const properties = {
  semigroup: {
    associativity: <A>(S: Semigroup<A>, arb: fc.Arbitrary<A>) =>
      fc.property(arb, arb, arb, laws.semigroup.associativity(S))
  }
}

// -------------------------------------------------------------------------------------
// tests
// -------------------------------------------------------------------------------------

import { Magma } from 'fp-ts/Magma'

const MagmaSub: Magma<number> = {
  concat: (y) => (x) => x - y
}

fc.assert(properties.semigroup.associativity(MagmaSub, fc.integer()))
