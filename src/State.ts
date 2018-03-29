export class State<S, A> {
  constructor(readonly run: (s: S) => [A, S]) {}
  // monad instance
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
  // utils
  eval(s: S): A {
    return this.run(s)[0]
  }
  exec(s: S): S {
    return this.run(s)[1]
  }
}

export const of = <S, A>(a: A): State<S, A> =>
  new State(s => [a, s])

/** legge lo stato corrente */
export const get = <S>(): State<S, S> =>
  new State(s => [s, s])

/** imposta lo stato corrente */
export const put = <S>(s: S): State<S, undefined> =>
  new State(() => [undefined, s])

/** modifica lo stato corrente */
export const modify = <S>(
  f: (s: S) => S
): State<S, undefined> => new State(s => [undefined, f(s)])

/** restituisce un valore in base allo stato corrente */
export const gets = <S, A>(f: (s: S) => A): State<S, A> =>
  new State(s => [f(s), s])

//
// examples
//

// /** `of` set the result value but leave the state unchanged */
// console.log(of('foo').run(1)) // [ 'foo', 1 ]

// /** `get` set the result value to the state and leave the state unchanged */
// console.log(get().run(1)) // [ 1, 1 ]

// /** `put` set the result value to `undefined` and set the state value */
// console.log(put(5).run(1)) // [ undefined, 5 ]

// const inc = (n: number): number => n + 1

// console.log(modify(inc).run(1)) // [ undefined, 2 ]

// console.log(gets(inc).run(1)) // [ 2, 1 ]

// type S = number

// const increment = modify<S>(n => n + 1)

// const decrement = modify<S>(n => n - 1)

// const program = increment
//   .chain(() => increment)
//   .chain(() => increment)
//   .chain(() => decrement)

// console.log(program.run(0)) // [undefined, 2]
// console.log(program.run(2)) // [undefined, 4]
