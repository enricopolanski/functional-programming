import { Task } from './Task'
import { Maybe } from './Maybe'

type Store<V> = { [key: string]: V | undefined }

const store: Store<number> = {}

function put(k: string, v: number): Task<void> {
  return new Task(() => {
    store[k] = v
    return Promise.resolve(undefined)
  })
}

function get(k: string): Task<Maybe<number>> {
  return new Task(() => Promise.resolve(new Maybe(store[k])))
}

function remove(k: string): Task<void> {
  return new Task(() => {
    delete store[k]
    return Promise.resolve(undefined)
  })
}

const initProgram = put('a', 1)

const readAndWriteProgram = get('a')
  .chain(x => x.fold(() => Task.of(undefined), a => put('b', a * 2)))

const program = initProgram.chain(() => readAndWriteProgram)

program.run().then(() => console.log(store))
