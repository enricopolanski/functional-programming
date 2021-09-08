// ====================
// GUESS THE NUMBER
// ====================

import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import { between } from 'fp-ts/Ord'
import { randomInt } from 'fp-ts/Random'
import * as T from 'fp-ts/Task'
import { getLine, putStrLn } from './Console'

// the number to guess
export const secret: T.Task<number> = T.fromIO(randomInt(1, 100))

// combinator: print a message before an action
const withMessage = <A>(message: string, next: T.Task<A>): T.Task<A> =>
  pipe(
    putStrLn(message),
    T.chain(() => next)
  )

// the input is a string so we have to validate it
const isValidGuess = between(N.Ord)(1, 100)
const parseGuess = (s: string): O.Option<number> => {
  const n = parseInt(s, 10)
  return isNaN(n) || !isValidGuess(n) ? O.none : O.some(n)
}

const question: T.Task<string> = withMessage('Indovina il numero', getLine)

const answer: T.Task<number> = pipe(
  question,
  T.chain((s) =>
    pipe(
      s,
      parseGuess,
      O.match(
        () => withMessage('Devi inserire un intero da 1 a 100', answer),
        (a) => T.of(a)
      )
    )
  )
)

const check = <A>(
  secret: number, // the secret number to guess
  guess: number, // user attempt
  ok: T.Task<A>, // what to do if the user guessed
  ko: T.Task<A> // what to do if the user did NOT guess
): T.Task<A> => {
  if (guess > secret) {
    return withMessage('Troppo alto', ko)
  } else if (guess < secret) {
    return withMessage('Troppo basso', ko)
  } else {
    return ok
  }
}

const end: T.Task<void> = putStrLn('Hai indovinato!')

// keep the state (secret) as the argument of the function (alla Erlang)
const loop = (secret: number): T.Task<void> =>
  pipe(
    answer,
    T.chain((guess) => check(secret, guess, end, loop(secret)))
  )

const program: T.Task<void> = pipe(secret, T.chain(loop))

program()
