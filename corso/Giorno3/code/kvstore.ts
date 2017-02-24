import { IO } from './IO'
import { Maybe } from './Maybe'

type Store<V> = { [key: string]: V | undefined }

function put<V>(store: Store<V>, k: string, v: V): IO<void> {
  return new IO(() => {
    store[k] = v
  })
}

function get<V>(store: Store<V>, k: string): IO<Maybe<V>> {
  return new IO(() => new Maybe(store[k]))
}

function remove<V>(store: Store<V>, k: string): IO<void> {
  return new IO(() => {
    delete store[k]
  })
}

const store: Store<number> = {}

const initProgram = put(store, 'a', 1)

const readAndWriteProgram = get(store, 'a')
  .chain(x => x.fold(() => IO.of(undefined), a => put(store, 'b', a * 2)))

const program = initProgram.chain(() => readAndWriteProgram)

program.run()
// console.log(store)
