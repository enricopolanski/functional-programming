import { function as F, taskEither as TE } from 'fp-ts'

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
    F.pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s)))
    )

  return F.pipe(
    D.readFile('src/file.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('src/file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('src/file.txt')),
    D.chain(D.log)
  )
}

// -----------------------------------------
// istanza per `Deps`
// -----------------------------------------

import * as fs from 'fs'
import { console as C } from 'fp-ts'
import { Abortable } from 'events';

type ReadFileOptions = | ({
  encoding: BufferEncoding;
  flag?: string | undefined;
} & Abortable)
| BufferEncoding

const readFile = TE.taskify<string,ReadFileOptions, NodeJS.ErrnoException, string>(fs.readFile)

const DepsAsync: Deps = {
  readFile: (filename) => readFile(filename, 'utf-8'),
  writeFile: TE.taskify<string, string, Error, void>(fs.writeFile),
  log: (a) => TE.fromIO(C.log(a)),
  chain: TE.chain
}

// dependency injection
program5(DepsAsync)().then(console.log)
