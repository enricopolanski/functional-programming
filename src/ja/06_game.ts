// ====================
// 数字当て
// ====================

import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import { between } from 'fp-ts/Ord'
import { randomInt } from 'fp-ts/Random'
import * as T from 'fp-ts/Task'
import { getLine, putStrLn } from './Console'

// 答えの数字
export const secret: T.Task<number> = T.fromIO(randomInt(1, 100))

// コンビネータ: アクションを実行する前にメッセージを表示する
const withMessage = <A>(message: string, next: T.Task<A>): T.Task<A> =>
  pipe(
    putStrLn(message),
    T.chain(() => next)
  )

// 入力は文字列で行われるので、バリデーションの必要がある
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
  secret: number, // 答えとなる秘密の数字
  guess: number, // ユーザの予想
  ok: T.Task<A>, // ユーザの予想が当たったときどうするか
  ko: T.Task<A> // ユーザの予想が当たらなかったときどうするか
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

// 関数の引数として状態（秘密情報）を保持 (Erlang のように)
const loop = (secret: number): T.Task<void> =>
  pipe(
    answer,
    T.chain((guess) => check(secret, guess, end, loop(secret)))
  )

const program: T.Task<void> = pipe(secret, T.chain(loop))

program()
