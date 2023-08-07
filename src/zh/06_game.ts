// ====================
// 猜数字
// ====================

import {
  function as F,
  number as N,
  option as O,
  ord as Ord,
  random as Random,
  task as T,
  console as Console,
} from 'fp-ts';
import { createInterface } from 'readline';

// utils
// -----------------------------
export const getLine: T.Task<string> = () =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('> ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });

// -----------------------------

/** writes to the standard output */
export const putStrLn = (message: string): T.Task<void> =>
  T.fromIO(Console.log(message));

// 要猜的数字
export const secret: T.Task<number> = T.fromIO(Random.randomInt(1, 100));

// combinator: 在行动前打印一条信息
const withMessage = <A>(message: string, next: T.Task<A>): T.Task<A> =>
  F.pipe(
    putStrLn(message),
    T.chain(() => next),
  );

// 因为输入是一个字符串所以我们需要验证它
const isValidGuess = Ord.between(N.Ord)(1, 100);
const parseGuess = (s: string): O.Option<number> => {
  const n = parseInt(s, 10);
  return isNaN(n) || !isValidGuess(n) ? O.none : O.some(n);
};

const question: T.Task<string> = withMessage('猜数字', getLine);

const answer: T.Task<number> = F.pipe(
  question,
  T.chain((s) =>
    F.pipe(
      s,
      parseGuess,
      O.match(
        () => withMessage('您必须输入 1 到 100 之间的整数', answer),
        (a) => T.of(a),
      ),
    ),
  ),
);

const check = <A>(
  secret: number, // 谜底
  guess: number, // 用户输入
  ok: T.Task<A>, // 如果用户猜对
  ko: T.Task<A>, // 如果猜错
): T.Task<A> => {
  if (guess > secret) {
    return withMessage('太大', ko);
  } else if (guess < secret) {
    return withMessage('太小', ko);
  } else {
    return ok;
  }
};

const end: T.Task<void> = putStrLn('你猜对了！');

// keep the state (secret) as the argument of the function (alla Erlang)
const loop = (secret: number): T.Task<void> =>
  F.pipe(
    answer,
    T.chain((guess) => check(secret, guess, end, loop(secret))),
  );

const program: T.Task<void> = F.pipe(secret, T.chain(loop));

program();

// ---------------------------------------------
