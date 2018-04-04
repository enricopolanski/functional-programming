//====================
// GUESS THE NUMBER
//====================

import { Task, task } from 'fp-ts/lib/Task'
import { Option, none, some } from 'fp-ts/lib/Option'
import { getLine, putStrLn } from './Console'
import { randomInt } from './Random'
import { between, ordNumber } from 'fp-ts/lib/Ord'

// il numero da indovinare
export const secret: Task<number> = randomInt(1, 100)

// combinatore: stampa un messaggio prima di una azione
const withMessage = <A>(
  message: string,
  next: Task<A>
): Task<A> => putStrLn(message).chain(() => next)

// l'input è una stringa perciò dobbiamo validarlo
const isValidInteger = between(ordNumber)(1, 100)
const parseGuess = (s: string): Option<number> => {
  const n = parseInt(s, 10)
  return isNaN(n) || !isValidInteger(n) ? none : some(n)
}

const question: Task<string> = withMessage(
  'Indovina il numero',
  getLine
)

const answer: Task<number> = question.chain(s =>
  parseGuess(s).foldL(
    () =>
      withMessage(
        'Devi inserire un intero da 1 a 100',
        answer
      ),
    task.of
  )
)

const check = <A>(
  secret: number,
  guess: number,
  ok: Task<A>,
  ko: Task<A>
): Task<A> => {
  if (guess > secret) {
    return withMessage('Troppo alto', ko)
  } else if (guess < secret) {
    return withMessage('Troppo basso', ko)
  } else {
    return ok
  }
}

const end: Task<void> = putStrLn('Hai indovinato!')

// mantengo lo stato (secret) come argomento della funzione (alla Erlang)
const loop = (secret: number): Task<void> =>
  answer.chain(guess =>
    check(secret, guess, end, loop(secret))
  )

const program: Task<void> = secret.chain(loop)

// program.run()
