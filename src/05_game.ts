// ====================
// GUESS THE NUMBER
// ====================

import * as T from 'fp-ts/lib/Task'
import * as O from 'fp-ts/lib/Option'
import { getLine, putStrLn } from './Console'
import { randomInt } from 'fp-ts/lib/Random'
import { between, ordNumber } from 'fp-ts/lib/Ord'
import { pipe } from 'fp-ts/lib/pipeable'

// il numero da indovinare
export const secret: T.Task<number> = T.fromIO(
  randomInt(1, 100)
)

// combinatore: stampa un messaggio prima di una azione
function withMessage<A>(
  message: string,
  next: T.Task<A>
): T.Task<A> {
  return pipe(
    putStrLn(message),
    T.chain(() => next)
  )
}

// l'input è una stringa perciò dobbiamo validarlo
const isValidInteger = between(ordNumber)(1, 100)
function parseGuess(s: string): O.Option<number> {
  const n = parseInt(s, 10)
  return isNaN(n) || !isValidInteger(n) ? O.none : O.some(n)
}

const question: T.Task<string> = withMessage(
  'Indovina il numero',
  getLine
)

const answer: T.Task<number> = pipe(
  question,
  T.chain(s =>
    pipe(
      parseGuess(s),
      O.fold(
        () =>
          withMessage(
            'Devi inserire un intero da 1 a 100',
            answer
          ),
        a => T.task.of(a)
      )
    )
  )
)

function check<A>(
  secret: number,
  guess: number,
  ok: T.Task<A>,
  ko: T.Task<A>
): T.Task<A> {
  if (guess > secret) {
    return withMessage('Troppo alto', ko)
  } else if (guess < secret) {
    return withMessage('Troppo basso', ko)
  } else {
    return ok
  }
}

const end: T.Task<void> = putStrLn('Hai indovinato!')

// mantengo lo stato (secret) come argomento della funzione (alla Erlang)
function loop(secret: number): T.Task<void> {
  return pipe(
    answer,
    T.chain(guess =>
      check(secret, guess, end, loop(secret))
    )
  )
}

const program: T.Task<void> = pipe(
  secret,
  T.chain(loop)
)

program()
