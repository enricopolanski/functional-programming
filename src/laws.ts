import { pipe } from 'fp-ts/function'
import * as Se from 'fp-ts/Semigroup'
import * as fc from 'fast-check'

// -------------------------------------------------------------------------------------
// laws
// -------------------------------------------------------------------------------------

export const laws = {
  semigroup: {
    associativity: <A>(S: Se.Semigroup<A>) => (a: A, b: A, c: A): boolean =>
      S.concat(S.concat(a, b), c) === S.concat(a, S.concat(b, c))
  }
}

// -------------------------------------------------------------------------------------
// properties
// -------------------------------------------------------------------------------------

export const properties = {
  semigroup: {
    associativity: <A>(S: Se.Semigroup<A>, arb: fc.Arbitrary<A>) =>
      fc.property(arb, arb, arb, laws.semigroup.associativity(S))
  }
}

// -------------------------------------------------------------------------------------
// tests
// -------------------------------------------------------------------------------------

import { Magma } from 'fp-ts/Magma'

export const MagmaSub: Magma<number> = {
  concat: (x, y) => x - y
}

// prova che MagmaSub non è un semigruppo
fc.assert(properties.semigroup.associativity(MagmaSub, fc.integer()))

// prova che `last` e `first` producono dei semigruppi
// fc.assert(properties.semigroup.associativity(Se.first<number>(), fc.integer()))
// fc.assert(properties.semigroup.associativity(Se.last<number>(), fc.integer()))
