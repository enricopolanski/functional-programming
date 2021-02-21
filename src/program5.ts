import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

// -----------------------------------------
// effetto del nostro programma
// -----------------------------------------

interface FileSystem<A> extends TE.TaskEither<Error, A> {}

// -----------------------------------------
// dipendenze
// -----------------------------------------

interface Deps {
  readonly readFile: (filename: string) => FileSystem<string>
  readonly writeFile: (filename: string, data: string) => FileSystem<void>
  readonly log: <A>(a: A) => FileSystem<void>
  readonly chain: <A, B>(
    f: (a: A) => FileSystem<B>
  ) => (ma: FileSystem<A>) => FileSystem<B>
}

// -----------------------------------------
// programma
// -----------------------------------------

const program5 = (D: Deps) => {
  const modifyFile = (filename: string, f: (s: string) => string) =>
    pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s)))
    )

  return pipe(
    D.readFile('file.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('file.txt')),
    D.chain(D.log)
  )
}

// -----------------------------------------
// istanza per `Deps`
// -----------------------------------------

import * as fs from 'fs'
import { log } from 'fp-ts/Console'

const readFile = TE.taskify<string, string, Error, string>(fs.readFile)

const DepsAsync: Deps = {
  readFile: (filename) => readFile(filename, 'utf-8'),
  writeFile: TE.taskify<string, string, Error, void>(fs.writeFile),
  log: (a) => TE.fromIO(log(a)),
  chain: TE.chain
}

// dependency injection
program5(DepsAsync)().then(console.log)
