import { IO } from './IO'
import { Maybe } from './Maybe'

type Store<V> = { [key: string]: V | undefined }

const store: Store<number> = {}

function put(k: string, v: number): IO<void> {
  return new IO(() => {
    store[k] = v
  })
}

function get(k: string): IO<Maybe<number>> {
  return new IO(() => new Maybe(store[k]))
}

function remove(k: string): IO<void> {
  return new IO(() => {
    delete store[k]
  })
}

const initProgram = put('a', 1)

const readAndWriteProgram = get('a')
  .chain(x => x.fold(() => IO.of(undefined), a => put('b', a * 2)))

const program = initProgram.chain(() => readAndWriteProgram)

program.run()
console.log(store)
