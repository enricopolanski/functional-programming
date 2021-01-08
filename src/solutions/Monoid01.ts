/**
 * Supponiamo di avere un `ReadonlyArray<A>` ma di non disporre di una istanza di monoide per `A`,
 * possiamo sempre mappare la lista e farla diventare di un tipo per il quale abbiamo una istanza.
 *
 * Questa operazione è realizzata dalla seguente funzione `foldMap` che dovete implementare.
 */
import { fold, Monoid, monoidSum } from 'fp-ts/Monoid'
import { flow, pipe } from 'fp-ts/function'
import { map } from 'fp-ts/ReadonlyArray'

const foldMap = <B>(
  M: Monoid<B>
): (<A>(f: (a: A) => B) => (as: ReadonlyArray<A>) => B) => (f) =>
  flow(map(f), fold(M))

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

interface Bonifico {
  readonly causale: string
  readonly importo: number
}

const bonifici: ReadonlyArray<Bonifico> = [
  { causale: 'causale1', importo: 1000 },
  { causale: 'causale2', importo: 500 },
  { causale: 'causale3', importo: 350 }
]

// calcola la somma dei bonifici
assert.deepStrictEqual(
  pipe(
    bonifici,
    foldMap(monoidSum)((bonifico) => bonifico.importo)
  ),
  1850
)
