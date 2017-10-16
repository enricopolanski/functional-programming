export class State<S, A> {
  run: (s: S) => [A, S]
  constructor(run: (s: S) => [A, S]) {
    this.run = run
  }
  map<B>(f: (a: A) => B): State<S, B> {
    return this.chain(a => of(f(a))) // <= derived
  }
  ap<B>(fab: State<S, (a: A) => B>): State<S, B> {
    return fab.chain(f => this.map(f)) // <= derived
  }
  chain<B>(f: (a: A) => State<S, B>): State<S, B> {
    return new State(s => {
      const [a, s1] = this.run(s)
      return f(a).run(s1)
    })
  }
}

export const of = <S, A>(a: A): State<S, A> =>
  new State(s => [a, s])

export const get = <S>(): State<S, S> =>
  new State(s => [s, s])

export const put = <S>(s: S): State<S, undefined> =>
  new State(() => [undefined, s])

export const modify = <S>(
  f: (s: S) => S
): State<S, undefined> => new State(s => [undefined, f(s)])

export const gets = <S, A>(f: (s: S) => A): State<S, A> =>
  new State(s => [f(s), s])

type S = number

const increment = modify<S>(n => n + 1)

const decrement = modify<S>(n => n - 1)

const program = increment
  .chain(() => increment)
  .chain(() => increment)
  .chain(() => decrement)

console.log(program.run(0)) // [undefined, 2]
console.log(program.run(2)) // [undefined, 4]
