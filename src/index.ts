import { IO, io } from 'fp-ts/lib/IO'
import { now } from 'fp-ts/lib/Date'
import { log } from 'fp-ts/lib/Console'

export function time<A>(ma: IO<A>): IO<A> {
  return io.chain(now, start =>
    io.chain(ma, a =>
      io.chain(now, end =>
        io.map(log(`Elapsed: ${end - start}`), () => a)
      )
    )
  )
}

import { randomInt } from 'fp-ts/lib/Random'
import { fold, monoidVoid } from 'fp-ts/lib/Monoid'
import { getMonoid } from 'fp-ts/lib/IO'
import { replicate } from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/pipeable'
import { chain } from 'fp-ts/lib/IO'

function fib(n: number): number {
  return n <= 1 ? 1 : fib(n - 1) + fib(n - 2)
}

const printFib: IO<void> = pipe(
  randomInt(30, 35),
  chain(n => log(fib(n)))
)

function replicateIO(n: number, mv: IO<void>): IO<void> {
  return fold(getMonoid(monoidVoid))(replicate(n, mv))
}

time(replicateIO(3, time(printFib)))()
/*
3524578
Elapsed: 33
3524578
Elapsed: 33
9227465
Elapsed: 80
Elapsed: 146
*/
