/**
 * Modellare un orologio (minuti e ore)
 *
 * Per completare l'esercizio occorre definire il tipo `Clock`, una sia istanza di `Eq`
 */
import { Eq, tuple } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'

type Hour =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23

const hour = (h: number): Hour => (Math.floor(h) % 24) as any

type Minute =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 46
  | 57
  | 58
  | 59

const minute = (m: number): Minute => (Math.floor(m) % 60) as any

// It's a 24 hour clock going from "00:00" to "23:59".
type Clock = [Hour, Minute]

const eqClock: Eq<Clock> = tuple(N.Eq, N.Eq)

// takes an hour and minute, and returns an instance of Clock with those hours and minutes
const fromHourMin = (h: number, m: number): Clock => [hour(h), minute(m)]

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

assert.deepStrictEqual(
  eqClock.equals(fromHourMin(0, 0), fromHourMin(24, 0)),
  true
)
assert.deepStrictEqual(
  eqClock.equals(fromHourMin(12, 30), fromHourMin(36, 30)),
  true
)
