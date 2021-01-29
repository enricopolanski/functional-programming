/**
 * Modellare un orologio (minuti e ore)
 *
 * Per completare l'esercizio occorre definire il tipo `Clock`, una sia istanza di `Eq`
 */
import { Eq } from 'fp-ts/Eq'

// It's a 24 hour clock going from "00:00" to "23:59".
type Clock = unknown

declare const eqClock: Eq<Clock>

// takes an hour and minute, and returns an instance of Clock with those hours and minutes
declare const fromHourMin: (h: number, m: number) => Clock

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(fromHourMin(0, 0), eqClock.equals(fromHourMin(24, 0))),
  true
)
assert.deepStrictEqual(
  pipe(fromHourMin(12, 30), eqClock.equals(fromHourMin(36, 30))),
  true
)
