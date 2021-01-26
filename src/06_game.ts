// ====================
// GUESS THE NUMBER
// ====================

import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import { getLine, putStrLn } from './Console'
import { randomInt } from 'fp-ts/Random'
import { between, ordNumber } from 'fp-ts/Ord'
import { pipe } from 'fp-ts/function'

// il numero da indovinare
export const secret: T.Task<number> = T.fromIO(randomInt(1, 100))

// combinatore: stampa un messaggio prima di una azione
const withMessage = <A>(message: string, next: T.Task<A>): T.Task<A> =>
  pipe(
    putStrLn(message),
    T.chain(() => next)
  )

// l'input è una stringa perciò dobbiamo validarlo
const isValidInteger = between(ordNumber)(1, 100)
const parseGuess = (s: string): O.Option<number> => {
  const n = parseInt(s, 10)
  return isNaN(n) || !isValidInteger(n) ? O.none : O.some(n)
}

const question: T.Task<string> = withMessage('Indovina il numero', getLine)

const answer: T.Task<number> = pipe(
  question,
  T.chain((s) =>
    pipe(
      parseGuess(s),
      O.fold(
        () => withMessage('Devi inserire un intero da 1 a 100', answer),
        (a) => T.of(a)
      )
    )
  )
)

const check = <A>(
  secret: number, // il numero segreto da indovinare
  guess: number, // tentativo dell'utente
  ok: T.Task<A>, // cosa fare se l'utente ha indovinato
  ko: T.Task<A> // cosa fare se l'utente NON ha indovinato
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

// mantengo lo stato (secret) come argomento della funzione (alla Erlang)
const loop = (secret: number): T.Task<void> =>
  pipe(
    answer,
    T.chain((guess) => check(secret, guess, end, loop(secret)))
  )

const program: T.Task<void> = pipe(secret, T.chain(loop))

program()
