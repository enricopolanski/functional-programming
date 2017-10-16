/*

  Prima di tutto occorre modellare un parser.
  Un parser di tipo `A` è una funzione che, dato un input di tipo stringa
  restituisce un valore di tipo `A`

*/

export type Parser1<A> = (input: string) => A

/*

  In questo modo però abbiamo modellato un parser che esegue
  tutto il lavoro in un passo solo. Modelliamoolo in modo che compia
  solo un lavoro parziale

*/

export type Parser2<A> = (input: string) => [A, string]

/*

  Un parser quindi, oltre a restituire un valore di tipo `A` restituisce
  anche il resto della stringa da parsare.
  Tuttavia questo è un modello in cui il parsing non fallisce mai, mentre
  sappiamo che può accadere

*/

import { Option, Some, None } from '../src/Option'

export type Parser3<A> = (
  input: string
) => Option<[A, string]>

const tuple = <A, B>(a: A, b: B): [A, B] => [a, b]

export class Parser4<A> {
  run: Parser3<A>
  static of = <A>(a: A): Parser4<A> =>
    new Parser4(s => new Some(tuple(a, s)))
  constructor(run: Parser3<A>) {
    this.run = run
  }
  chain<B>(f: (a: A) => Parser4<B>): Parser4<B> {
    return new Parser4(s =>
      this.run(s).chain(([a, s2]) => f(a).run(s2))
    )
  }
  map<B>(f: (a: A) => B): Parser4<B> {
    return this.chain(a => Parser4.of(f(a))) // <= derived
  }
  ap<B>(fab: Parser4<(a: A) => B>): Parser4<B> {
    return fab.chain(f => this.map(f)) // <= derived
  }
}

/*

  Notate però che non abbiamo mai usato il fatto che l'input
  è una stringa. Ma allora possiamo generalizzare anche il tipo di input!

*/

export class Parser<S, A> {
  run: (input: S) => Option<[A, S]>
  static of = <S, A>(a: A): Parser<S, A> =>
    new Parser(s => new Some(tuple(a, s)))
  constructor(run: (input: S) => Option<[A, S]>) {
    this.run = run
  }
  chain<B>(f: (a: A) => Parser<S, B>): Parser<S, B> {
    return new Parser(s =>
      this.run(s).chain(([a, s2]) => f(a).run(s2))
    )
  }
  map<B>(f: (a: A) => B): Parser<S, B> {
    return this.chain(a => Parser.of(f(a))) // <= derived
  }
  alt(that: Parser<S, A>): Parser<S, A> {
    return new Parser(s =>
      this.run(s).fold(() => that.run(s), x => new Some(x))
    )
  }
}

/*

  Adesso definiamo dei parser di base che ci permettano
  di gestire i vari elementi di una route

*/

type Route = Array<string>

type Match<A> = Parser<Route, A>

const lit = (literal: string): Match<void> =>
  new Parser(
    s =>
      s.length > 0 && s[0] === literal
        ? new Some(tuple(undefined, s.slice(1)))
        : new None()
  )

const int: Match<number> = new Parser(s => {
  if (s.length > 0) {
    const n = parseInt(s[0], 10)
    if (!isNaN(n)) {
      return new Some(tuple(n, s.slice(1)))
    }
  }
  return new None()
})

// parser per la route 'users/1'
const users = lit('users').chain(() => int)
// .map(userId => ({ userId }))

console.log(users.run('users/1'.split('/')))
// Some { value: [ 1, [] ] }

// parser per la route 'users/1/invoice/42'
const invoice = users.chain(userId =>
  lit('invoice')
    .chain(() => int)
    .map(invoiceId => ({ userId, invoiceId }))
)

console.log(invoice.run('users/1/invoice/42'.split('/')))
// Some { value: [ { userId: 1, invoiceId: 42 }, [] ] }

/*

  Ora che abbiamo la possibilità di controllare una singola route
  definiamo un router sfruttando il metodo `alt`

*/

type Routes =
  | {
      type: 'user'
      userId: number
    }
  | {
      type: 'invoice'
      userId: number
      invoiceId: number
    }
  | { type: 'NotFound' }

/*

    Il router deve combinare le route in un ordine preciso:
    dalla più specifica alla meno specifica

*/

const router: Parser<Route, Routes> = invoice
  .map(({ userId, invoiceId }): Routes => ({
    type: 'invoice',
    userId,
    invoiceId
  }))
  .alt(
    users.map((userId): Routes => ({
      type: 'user',
      userId
    }))
  )

/*

  Infine definiamo una funzione di helper che ci permette
  di gestire anche il caso NotFound

*/

const run = (path: string): Routes =>
  router
    .run(path.split('/'))
    .fold((): Routes => ({ type: 'NotFound' }), x => x[0])

console.log(run('users/1'))
// { type: 'user', userId: 1 }
console.log(run('users/1/invoice/42'))
// { type: 'invoice', userId: 1, invoiceId: 42 }
console.log(run('foo'))
// { type: 'NotFound' }
