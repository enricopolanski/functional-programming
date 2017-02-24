import { Task } from './Task'
import { Maybe } from './Maybe'

type Store<V> = { [key: string]: V | undefined }

function put<V>(store: Store<V>, k: string, v: V): Task<void> {
  return new Task(() => {
    store[k] = v
    return Promise.resolve(undefined)
  })
}

function get<V>(store: Store<V>, k: string): Task<Maybe<V>> {
  return new Task(() => Promise.resolve(new Maybe(store[k])))
}

function remove<V>(store: Store<V>, k: string): Task<void> {
  return new Task(() => {
    delete store[k]
    return Promise.resolve(undefined)
  })
}

const store: Store<number> = {}

const initProgram = put(store, 'a', 1)

const readAndWriteProgram = get(store, 'a')
  .chain(x => x.fold(() => Task.of(undefined), a => put(store, 'b', a * 2)))

const program = initProgram.chain(() => readAndWriteProgram)

program.run().then(() => console.log(store))
