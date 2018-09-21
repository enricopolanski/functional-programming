/*

  # Summary

  In questa demo vedremo come definire un router funzionale.

  L'obiettivo è poter gestire route come

  ```
  users/:user_id/invoice/:invoice_id
  ```

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

import { Option, some, none } from 'fp-ts/lib/Option'

export type Parser3<A> = (
  input: string
) => Option<[A, string]>

/*

  Proviamo ora a definire una istanza di `Monad`

  (tentare un live coding qui?)

*/

const tuple = <A, B>(a: A, b: B): [A, B] => [a, b]

const of_ = <A>(a: A): Parser4<A> =>
  new Parser4(s => some(tuple(a, s)))

export class Parser4<A> {
  constructor(readonly run: Parser3<A>) {}
  chain<B>(f: (a: A) => Parser4<B>): Parser4<B> {
    return new Parser4(s =>
      this.run(s).chain(([a, s2]) => f(a).run(s2))
    )
  }
  map<B>(f: (a: A) => B): Parser4<B> {
    return this.chain(a => of_(f(a))) // <= derived
  }
  ap<B>(fab: Parser4<(a: A) => B>): Parser4<B> {
    return fab.chain(f => this.map(f)) // <= derived
  }
}

/*

  Notate però che non abbiamo mai usato il fatto che l'input
  è una stringa.

  Ma allora possiamo generalizzare anche il tipo di input!

  Definiamo anche una istanza per `Alternative`

*/

export const of = <S, A>(a: A): Parser<S, A> =>
  new Parser(s => some(tuple(a, s)))

export class Parser<S, A> {
  constructor(readonly run: (input: S) => Option<[A, S]>) {}
  map<B>(f: (a: A) => B): Parser<S, B> {
    return this.chain(a => of(f(a))) // <= derived
  }
  ap<B>(fab: Parser<S, (a: A) => B>): Parser<S, B> {
    return fab.chain(f => this.map(f)) // <= derived
  }
  chain<B>(f: (a: A) => Parser<S, B>): Parser<S, B> {
    return new Parser(s =>
      this.run(s).chain(([a, s2]) => f(a).run(s2))
    )
  }
  alt(that: Parser<S, A>): Parser<S, A> {
    return new Parser(s =>
      this.run(s).foldL(() => that.run(s), x => some(x))
    )
  }
}

/** Un parser che fallisce sempre */
export const zero = <S, A>(): Parser<S, A> =>
  new Parser(() => none)

/*

  Adesso definiamo dei parser di base che ci permettano
  di gestire i vari elementi di una route

*/

export type Route = Array<string>

export type Match<A> = Parser<Route, A>

/**
 * Match di uno string literal
 *
 * @example
 * La stringa "users" in "users/1/invoice/42"
 */
export const lit = (literal: string): Match<void> =>
  new Parser(
    s =>
      s.length > 0 && s[0] === literal
        ? some(tuple(undefined, s.slice(1)))
        : none
  )

const isInteger = (n: number): boolean => n % 1 === 0

/**
 * Match di un intero
 *
 * @example
 * L'intero 1 in "users/1/invoice/42"
 */
export const int: Match<number> = new Parser(s => {
  if (s.length > 0) {
    const n = parseInt(s[0], 10)
    if (!isNaN(n) && isInteger(n)) {
      return some(tuple(n, s.slice(1)))
    }
  }
  return none
})

/** Match della fine dell url */
export const end: Match<void> = new Parser(
  s => (s.length === 0 ? some(tuple(undefined, s)) : none)
)

// parser per la route 'users/1'
const users = lit('users').chain(() =>
  int.chain(i => end.map(() => i))
)

// console.log(users.run('users/1'.split('/')))
// Some { value: [ 1, [] ] }

// parser per la route 'users/1/invoice/42'
const invoice = lit('users')
  .chain(() => int)
  .chain(userId =>
    lit('invoice').chain(() =>
      int.chain(invoiceId =>
        end.map(() => ({ userId, invoiceId }))
      )
    )
  )

// console.log(invoice.run('users/1/invoice/42'.split('/')))
/*
some([{
  "userId": 1,
  "invoiceId": 42
}, []])
*/

/*

  Ora che abbiamo la possibilità di controllare una singola route
  definiamo un router sfruttando l'istanza di `Alternative`

  Prima di tutto modelliamo tutte le rotte dell'app

*/

type MyRoutes =
  | {
      type: 'user'
      userId: number
    }
  | {
      type: 'invoice'
      userId: number
      invoiceId: number
    }
  | { type: 'notfound' }

/*

    Definiamo qualche funzione per rendere agevole
    la costruzione delle route

*/

const toUser = (userId: number): MyRoutes => ({
  type: 'user',
  userId
})

const toInvoice = ({
  userId,
  invoiceId
}: {
  userId: number
  invoiceId: number
}): MyRoutes => ({ type: 'invoice', userId, invoiceId })

const notFound: MyRoutes = { type: 'notfound' }

/*

    Il router deve combinare le route in un ordine preciso:
    dalla più specifica alla meno specifica

*/

const router: Parser<Route, MyRoutes> = invoice
  .map(toInvoice)
  .alt(users.map(toUser))

/*

  Infine definiamo una funzione di helper che ci permette
  di gestire anche il caso NotFound

*/

export const run = (path: string): MyRoutes =>
  router.run(path.split('/')).fold(notFound, x => x[0])

// console.log(run('users/1'))
// { type: 'user', userId: 1 }
// console.log(run('users/1/invoice/42'))
// { type: 'invoice', userId: 1, invoiceId: 42 }
// console.log(run('foo'))
// { type: 'notfound' }
