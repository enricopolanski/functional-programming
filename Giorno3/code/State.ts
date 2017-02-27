export class State<S, A> {
  static of<S1, B>(b: B): State<S1, B> {
    return new State<S1, B>(s => [b, s])
  }
  constructor(public value: (s: S) => [A, S]) {}
  run(s: S): [A, S] {
    return this.value(s)
  }
  eval(s: S): A {
    return this.run(s)[0]
  }
  exec(s: S): S {
    return this.run(s)[1]
  }
  map<B>(f: (a: A) => B): State<S, B> {
    return new State<S, B>(s => {
      const [a, s1] = this.run(s)
      return [f(a), s1]
    })
  }
  chain<B>(f: (a: A) => State<S, B>): State<S, B> {
    return new State<S, B>(s => {
      const [a, s1] = this.run(s)
      return f(a).run(s1)
    })
  }
}

import { Maybe } from './Maybe'

interface Store<V> { [key: string]: V | undefined }

function put<V>(k: string, v: V): State<Store<V>, void> {
  return new State<Store<V>, void>(s => [undefined, { ...s, [k]: v }])
}

function get<V>(k: string): State<Store<V>, Maybe<V>> {
  return new State<Store<V>, Maybe<V>>(s => [new Maybe(s[k]), s])
}

function remove<V>(k: string): State<Store<V>, void> {
  return new State<Store<V>, void>(s => {
    const store = { ...s }
    delete store[k]
    return [undefined, store]
  })
}

const store: Store<number> = {}

const initProgram = put('a', 1)

const readAndWriteProgram = get<number>('a')
  .chain(x => x.fold(() => State.of<Store<number>, void>(undefined), a => put('b', a * 2)))

const program = initProgram.chain(() => readAndWriteProgram)

// console.log(program.run(store))
