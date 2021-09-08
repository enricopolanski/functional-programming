/*

  Models the dice roll of a role-playing game.

*/
import { pipe } from 'fp-ts/function'
import * as IO from 'fp-ts/IO'
import { Monoid } from 'fp-ts/Monoid'
import * as R from 'fp-ts/Random'

// ------------------------------------
// model
// ------------------------------------

export interface Die extends IO.IO<number> {}

// ------------------------------------
// constructors
// ------------------------------------

export const die = (faces: number): Die => R.randomInt(1, faces)

// ------------------------------------
// combinators
// ------------------------------------

export const modifier = (n: number) => (die: Die): Die =>
  pipe(
    die,
    IO.map((m) => m + n)
  )

const liftA2 = <A, B, C>(f: (a: A) => (b: B) => C) => (fa: IO.IO<A>) => (
  fb: IO.IO<B>
): IO.IO<C> => pipe(fa, IO.map(f), IO.ap(fb))

export const add: (
  second: Die
) => (first: Die) => Die = liftA2((a: number) => (b: number) => a + b)

export const multiply = (n: number) => (die: Die): Die =>
  pipe(
    die,
    IO.map((m) => m * n)
  )

// ------------------------------------
// instances
// ------------------------------------

export const monoidDie: Monoid<Die> = {
  concat: (first, second) => pipe(first, add(second)),
  empty: () => 0 // <= un dado con zero facce
}

// ------------------------------------
// tests
// ------------------------------------

const d6 = die(6)
const d8 = die(8)

// 2d6 + 1d8 + 2
const _2d6_1d8_2 = pipe(d6, multiply(2), add(d8), modifier(2))

console.log(_2d6_1d8_2())
