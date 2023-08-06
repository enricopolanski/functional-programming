// ====================
// 猜数字
// ====================

import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import { between } from 'fp-ts/Ord'
import { randomInt } from 'fp-ts/Random'
import * as T from 'fp-ts/Task'
import { getLine, putStrLn } from './Console'

// 要猜的数字
export const secret: T.Task<number> = T.fromIO(randomInt(1, 100))

// combinator: 在行动前打印一条信息
const withMessage = <A>(message: string, next: T.Task<A>): T.Task<A> =>
  pipe(
    putStrLn(message),
    T.chain(() => next)
  )

// 因为输入是一个字符串所以我们需要验证它
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
        () => withMessage('您必须输入 1 到 100 之间的整数', answer),
        (a) => T.of(a)
      )
    )
  )
)

const check = <A>(
  secret: number, // 谜底
  guess: number, // 用户输入
  ok: T.Task<A>, // 如果用户猜对
  ko: T.Task<A> // 如果猜错
): T.Task<A> => {
  if (guess > secret) {
    return withMessage('太大', ko)
  } else if (guess < secret) {
    return withMessage('太小', ko)
  } else {
    return ok
  }
}

const end: T.Task<void> = putStrLn('你猜对了！')

// keep the state (secret) as the argument of the function (alla Erlang)
const loop = (secret: number): T.Task<void> =>
  pipe(
    answer,
    T.chain((guess) => check(secret, guess, end, loop(secret)))
  )

const program: T.Task<void> = pipe(secret, T.chain(loop))

program()
