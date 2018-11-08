import { Type, URIS } from 'fp-ts/lib/HKT'
import { Monad1 } from 'fp-ts/lib/Monad'

interface MonadConsole<M extends URIS> extends Monad1<M> {
  readLine: Type<M, string>
  putStrLn: (message: string) => Type<M, void>
}

const echo = <M extends URIS>(M: MonadConsole<M>): Type<M, void> => {
  return M.chain(M.readLine, M.putStrLn)
}

import * as I from 'fp-ts/lib/IO'
import * as U from './utils'

const monadConsoleIO: MonadConsole<I.URI> = {
  ...(I.io as Monad1<I.URI>),
  readLine: U.prompt,
  putStrLn: U.alert
}

const actualEchoIO = echo(monadConsoleIO)

// actualEchoIO.run()
// mostra un prompt e poi un alert nel browser

import * as T from 'fp-ts/lib/Task'

const monadConsoleTask: MonadConsole<T.URI> = {
  ...(T.task as Monad1<T.URI>),
  readLine: U.question,
  putStrLn: U.log
}

const actualEchoTask = echo(monadConsoleTask)

// actualEchoTask.run()

const logger: Array<string> = []

const monadConsoleIOTest: MonadConsole<I.URI> = {
  ...(I.io as Monad1<I.URI>),
  readLine: new I.IO(() => 'hello'), // simulo l'input utente
  putStrLn: message =>
    new I.IO(() => {
      logger.push(message) // scrivo sul `logger` invece che sulla console
    })
}

import * as assert from 'assert'

const actualEchoIOTest = echo(monadConsoleIOTest)

actualEchoIOTest.run()
assert.deepEqual(logger, ['hello'])
