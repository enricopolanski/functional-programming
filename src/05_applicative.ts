/*

  建模RGP游戏的掷骰子

*/
import { function as F, io as IO , random as R ,monoid as M, } from 'fp-ts'

// ------------------------------------
// 模型
// ------------------------------------

export interface Die extends IO.IO<number> {}

// ------------------------------------
// 构造函数
// ------------------------------------

export const die = (faces: number): Die => R.randomInt(1, faces)

// ------------------------------------
// combinators
// ------------------------------------

export const modifier = (n: number) => (die: Die): Die =>
  F.pipe(
    die,
    IO.map((m) => m + n)
  )

const liftA2 = <A, B, C>(f: (a: A) => (b: B) => C) => (fa: IO.IO<A>) => (
  fb: IO.IO<B>
): IO.IO<C> => F.pipe(fa, IO.map(f), IO.ap(fb))

export const add: (
  second: Die
) => (first: Die) => Die = liftA2((a: number) => (b: number) => a + b)

export const multiply = (n: number) => (die: Die): Die =>
  F.pipe(
    die,
    IO.map((m) => m * n)
  )

// ------------------------------------
// 实例
// ------------------------------------

export const monoidDie: M.Monoid<Die> = {
  concat: (first, second) => F.pipe(first, add(second)),
  empty: () => 0 // 面数为0的骰子
}

// ------------------------------------
// tests
// ------------------------------------

const d6 = die(6)
const d8 = die(8)

// 2d6 + 1d8 + 2
const _2d6_1d8_2 = F.pipe(d6, multiply(2), add(d8), modifier(2))

console.log(_2d6_1d8_2())
