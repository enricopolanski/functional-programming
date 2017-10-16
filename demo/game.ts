//====================
// GUESS THE NUMBER
//====================

import { Task, of } from '../src/Task'
import { Option, None, Some } from '../src/Option'
import { prompt, log } from '../src/Console'
import { randomInt } from '../src/Random'

const secret: Task<number> = randomInt(1, 100)

const message = <A>(s: string, next: Task<A>): Task<A> =>
  log(s).chain(() => next)

const question: Task<string> = message(
  'Indovina il numero',
  prompt
)

const parse = (s: string): Option<number> => {
  const n = parseInt(s, 10)
  return isNaN(n) ? new None() : new Some(n)
}

const answer: Task<number> = question.chain(s =>
  parse(s).fold(
    () => message('Devi inserire un intero', answer),
    i => of(i)
  )
)

const check = <A>(
  secret: number,
  guess: number,
  ok: Task<A>,
  ko: Task<A>
): Task<A> => {
  if (guess > secret) {
    return message('Troppo alto', ko)
  } else if (guess < secret) {
    return message('Troppo basso', ko)
  } else {
    return ok
  }
}

const end: Task<void> = log('Hai indovinato!')

const loop = (secret: number): Task<void> =>
  answer.chain(guess =>
    check(secret, guess, end, loop(secret))
  )

const program: Task<void> = secret.chain(loop)

program.run()
