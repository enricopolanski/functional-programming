import { console as Console, task as T } from 'fp-ts';
import { createInterface } from 'readline';

/** reads from the standard input */
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

/** writes to the standard output */
export const putStrLn = (message: string): T.Task<void> =>
  T.fromIO(Console.log(message));
