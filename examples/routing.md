# Obiettivo

L'obiettivo è produrre un modo per fare sia parsing che formatting di una route in modo che sia type-safe e il più DRY possibile. In pseudo codice si vogliono due funzioni `parse` e `format` tali che

```ts
parse('/users/1') // produce sia una indicazione che si tratta della route "User" che l'intero 1
format(1) // produce la stringa "/users/1"
```

La tattica usata è quella usuale adotattata in programmazione funzionale: modellare il problema in modo che sia possibile suddividerlo in sottoproblemi più semplici e che poi possano essere facilmente ricomposti.

La prima cosa che occorre fare è costruire un modello per i parser e per i formatter

# Parser

Il modello più semplice di un parser è il seguente tipo

```ts
type Parser<A> = (s: string) => [A, string]
```

Un parser per il tipo `A` è una funzione che accetta una stringa da parsare come input e restituisce un valore di tipo `A` più una stringa che rappresenta la parte ancora da parsare. Tuttavia il processo di parsing può fallire, dunque dobbiamo modellare anche questa possibilità di fallimento nel tipo di `Parser`. Il modo più semplice per rappresentare una computazione che produce un valore di tipo `V` ma che può fallire è `Option<V>`. Il modello diventa quindi

```ts
import { Option } from 'fp-ts/lib/Option'

type Parser<A> = (s: string) => Option<[A, string]>
```

Vediamo un paio di esempi di parser

```ts
// helper
const tuple = <A, B>(a: A, b: B): [A, B] => [a, b]

// un parser che ha successo se la stringa inizia con "foo"
const foo: Parser<void> = s => {
  const i = s.indexOf('foo')
  if (i === 0) {
    return some(tuple(undefined, s.substring(3)))
  }
  return none
}

console.log(foo('foobar')) // => some([undefined, "bar"])
console.log(foo('baz')) // => none

// un parser che ha successo se il primo carattere della stringa è un intero
const char: Parser<number> = s => {
  const n = parseInt(s[0], 10)
  if (!isNaN(n)) {
    return some(tuple(n, s.substring(1)))
  }
  return none
}

console.log(char('1foo')) // => some([1, "foo"])
console.log(int('foo')) // => none
```

Ora occorre definire un modo per combinare due parser: se ho un `Parser<A>` e un `Parser<B>` voglio ottenere un `Parser<[A, B]>` che modella l'applicazione sequenziale dei due parser producendo la tupla dei corrispondenti valori

```ts
const then = <A, B>(p1: Parser<A>, p2: Parser<B>): Parser<[A, B]> => s =>
  p1(s).chain(([a, s2]) => p2(s2).map(([b, s3]) => tuple(tuple(a, b), s3)))
```

Notare che il parser combinazione ha successo se e solo se ambedue i parser combinati hanno successo

```ts
const fooThenChar = then(foo, char)

console.log(fooThenChar('foo1bar')) // => some([[undefined, 1], "bar"])
console.log(fooThenChar('foobar')) // => none
```

## Chainable APIs

Per rendere più comoda la definizione dei parser composti possiamo cambiare l'implementazione di `Parser` in modo da poter definire API chainable

```ts
class Parser<A> {
  constructor(readonly run: (s: string) => Option<[A, string]>) {}
  then<B>(that: Parser<B>): Parser<[A, B]> {
    return new Parser(s => this.run(s).chain(([a, s2]) => that.run(s2).map(([b, s3]) => tuple(tuple(a, b), s3))))
  }
}

const fooThenChar = foo.then(char)

console.log(fooThenChar.run('foo1bar')) // => some([[undefined, 1], "bar"])
console.log(fooThenChar.run('foobar')) // => none
```

## (Covariant) Functor instance

L'output di `fooThenChar` non è del tutto soddifacente: `some([[undefined, 1], "bar"])`. Ci interessa solo l'intero dato che il valore `undefined` prodotto da `foo` è poco interessante. Possiamo definire però una istanza di `Functor` per `Parser`

```ts
class Parser<A> {
  ...
  map<B>(f: (a: A) => B): Parser<B> {
    return new Parser(s => this.run(s).map(([a, s2]) => tuple(f(a), s2)))
  }
}

const fooThenChar: Parser<[undefined, number]> = foo.then(char)
const fooThenChar2: Parser<number> = foo.then(char).map(([_, n]) => n)

console.log(fooThenChar2.run('foo1bar')) // => some([1, "bar"])
console.log(fooThenChar2.run('foobar')) // => none
```

## Alternative

Un'altra feature interessante è quella di poter definire una strategia di backtracking: dati due parser, vogliamo provare il primo e se non ha successo provare il secondo. Possiamo definire una istanza di `Alternative` per `Parser` allo scopo

```ts
class Parser<A> {
  ...
  alt(that: Parser<A>): Parser<A> {
    return new Parser(s => this.run(s).alt(that.run(s)))
  }
}

/** un parser che fallisce sempre e non consuma input */
const zero = <A>(): Parser<A> => new Parser(() => none)

const fooOrChar = zero<void | number>().alt(foo).alt(char)

console.log(fooOrChar.run('foobar')) // => some([undefined, "bar"])
console.log(fooOrChar.run('1bar')) // => some([1, "bar"])
console.log(fooOrChar.run('baz')) // => none
```

# Formatter

Il modello per il formatter è il seguente tipo

```ts
class Formatter<A> {
  constructor(readonly run: (s: string, a: A) => string) {}
}
```

Un formatter per il tipo `A` è una funzione che accetta una stringa e un valore di tipo `A` e restituisce una nuova stringa

```ts
const numberFormatter: Formatter<number> = new Formatter((s, n) => s + String(n))

console.log(numberFormatter.run('the number is: ', 1)) // => 'the number is: 1'
```

Come prima vogliamo poter combinare due formatter in modo sequenziale

```ts
class Formatter<A> {
  ...
  then<B>(that: Formatter<B>): Formatter<[A, B]> {
    return new Formatter((s, [a, b]) => that.run(this.run(s, a), b))
  }
}
```

## (Contravariant) Functor instance

Anche in questo caso possiamo aggiustare l'input a piacimento definendo una istanza di funtore, solo che questa volta siamo costretti a farlo per `Contravariant` invece che per `Functor` dato che il tipo `A` appare in posizione controvariante

```ts
class Formatter<A> {
  ...
  contramap<B>(f: (b: B) => A): Formatter<B> {
    return new Formatter((s, b) => this.run(s, f(b)))
  }
}

const lenFormatter: Formatter<string> = numberFormatter.contramap(s => s.length)

console.log(lenFormatter.run('the string length is: ', 'foo')) // => 'the string length is: 3'
```

# Il tipo `Match`

Ora torniamo all'obiettivo principale: quello che vogliamo è una coppia parser / formatter che costituiscano una unità

```ts
class Match<A> {
  constructor(readonly parser: Parser<A>, readonly formatter: Formatter<A>) {}
}
```

e che possa essere combinata con altre unità dello stesso tipo

```ts
class Match<A> {
  ...
  then<B>(that: Match<B>): Match<[A, B]> {
    return new Match(this.parser.then(that.parser), this.formatter.then(that.formatter))
  }
}
```

## (Invariant) Functor instance

Anche in questo caso possiamo aggiustare l'input, ma se `Parser` è covariante e `Formatter` è controvariante, allora `Match` è invariante

```ts
class Match<A> {
  ...
  imap<B>(f: (a: A) => B, g: (b: B) => A): Match<B> {
    return new Match(this.parser.map(f), this.formatter.contramap(g))
  }
}
```

# Primitives

Ora possiamo cominciare a definire una serie di `Match` primitivi che, combinati, possono descrivere un gran numero di use case. In particolare, ai fini di demo, voglio implementare `lit` e `int`

```ts
declare function lit(literal: string): Match<void>
declare var int: Match<number>
```

Incominciamo con `int`

```ts
const int = new Match<number>(
  new Parser(s => {
    const a = s.split('/')
    if (a.length > 0) {
      const n = parseInt(a[0], 10)
      if (!isNaN(n)) {
        return some(tuple(n, a.slice(1).join('/')))
      }
    }
    return none
  }),
  new Formatter((s, n) => s + '/' + String(n))
)
```

C'è un problema però: questo continuo `split` e `join` non è piacevole. La rappresentazione di una route coe stringa non è comoda. Sarebbe vantaggioso rappresentare una route con una struttura dati più comoda da manipolare. Ma come è possibile dati i tipi di `Parser` e `Formatter`. La soluzione viene dalla loro osservazione (riporto qui il codice integrale)

```ts
class Parser<A> {
  constructor(readonly run: (s: string) => Option<[A, string]>) {}
  then<B>(that: Parser<B>): Parser<[A, B]> {
    return new Parser(s => this.run(s).chain(([a, s2]) => that.run(s2).map(([b, s3]) => tuple(tuple(a, b), s3))))
  }
  map<B>(f: (a: A) => B): Parser<B> {
    return new Parser(s => this.run(s).map(([a, s2]) => tuple(f(a), s2)))
  }
  alt(that: Parser<A>): Parser<A> {
    return new Parser(s => this.run(s).alt(that.run(s)))
  }
}

/** un parser che fallisce sempre e non consuma input */
const zero = <A>(): Parser<A> => new Parser(() => none)

class Formatter<A> {
  constructor(readonly run: (s: string, a: A) => string) {}
  then<B>(that: Formatter<B>): Formatter<[A, B]> {
    return new Formatter((s, [a, b]) => that.run(this.run(s, a), b))
  }
  contramap<B>(f: (b: B) => A): Formatter<B> {
    return new Formatter((s, b) => this.run(s, f(b)))
  }
}
```

Sia in `Parser` che in `Formatter` non abbiamo mai sfruttato concretamente il fatto che l'input sia una stringa. Dunque il tipo di input può essere generalizzato. Aggiungiamo allora un type parameter `S` che ne rappresenta il tipo

```ts
class Parser<S, A> {
  constructor(readonly run: (s: S) => Option<[A, S]>) {}
  then<B>(that: Parser<S, B>): Parser<S, [A, B]> {
    return new Parser(s => this.run(s).chain(([a, s2]) => that.run(s2).map(([b, s3]) => tuple(tuple(a, b), s3))))
  }
  map<B>(f: (a: A) => B): Parser<S, B> {
    return new Parser(s => this.run(s).map(([a, s2]) => tuple(f(a), s2)))
  }
  alt(that: Parser<S, A>): Parser<S, A> {
    return new Parser(s => this.run(s).alt(that.run(s)))
  }
}

/** un parser che fallisce sempre e non consuma input */
const zero = <S, A>(): Parser<S, A> => new Parser(() => none)

class Formatter<S, A> {
  constructor(readonly run: (s: S, a: A) => S) {}
  then<B>(that: Formatter<S, B>): Formatter<S, [A, B]> {
    return new Formatter((s, [a, b]) => that.run(this.run(s, a), b))
  }
  contramap<B>(f: (b: B) => A): Formatter<S, B> {
    return new Formatter((s, b) => this.run(s, f(b)))
  }
}

class Match<S, A> {
  constructor(readonly parser: Parser<S, A>, readonly formatter: Formatter<S, A>) {}
  then<B>(that: Match<S, B>): Match<S, [A, B]> {
    return new Match(this.parser.then(that.parser), this.formatter.then(that.formatter))
  }
  imap<B>(f: (a: A) => B, g: (b: B) => A): Match<S, B> {
    return new Match(this.parser.map(f), this.formatter.contramap(g))
  }
}
```

Adesso possiamo scegliere la rappresentazione di input che più ci è comoda, per esempio

```ts
/** 'users/1' viene rappresentato da ['user', '1'] */
type Route = Array<string>
```

`int` non ha più bisogno di giri complicati

```ts
/** `int` cattura un intero */
const int = new Match<Route, number>(
  new Parser(s => {
    if (s.length > 0) {
      const n = parseInt(s[0], 10)
      if (!isNaN(n)) {
        return some(tuple(n, s.slice(1)))
      }
    }
    return none
  }),
  new Formatter((s, n) => s.concat(String(n)))
)
```

Definiamo `lit`

```ts
/** `lit(x)` cattura esattamente la stringa x */
const lit = (literal: string): Match<Route, void> =>
  new Match(
    new Parser(s => {
      if (s.length > 0 && s[0] === literal) {
        return some(tuple(undefined, s.slice(1)))
      }
      return none
    }),
    new Formatter(s => s.concat(literal))
  )
```

Ora vediamo un esempio

```ts
/** m rappresenta un match per la route 'foo/bar/:id' */
const m: Match<Route, [[void, void], number]> = lit('foo').then(lit('bar')).then(int)
```

il tipo `A` è un po' scomodo, sistemiamolo con una passata di `imap`

```ts
/** m rappresenta un match per la route 'foo/bar/:id' */
const m: Match<Route, number> = lit('foo')
  .then(lit('bar'))
  .then(int)
  .imap(([_, n]) => n, n => [[undefined, undefined], n])
```

E adesso vediamolo in azione

```ts
console.log(m.parser.run('foo/bar/1'.split('/'))) // => some([1, []])
console.log(m.formatter.run([''], 1).join('/')) // => /foo/bar/1
```

# Real world example

```ts
class Home {
  readonly _tag: 'Home' = 'Home'
  inspect(): string {
    return this.toString()
  }
  toString(): string {
    return `new Home()`
  }
}
class User {
  readonly _tag: 'User' = 'User'
  constructor(readonly id: number) {}
  inspect(): string {
    return this.toString()
  }
  toString(): string {
    return `new User(${this.id})`
  }
}

class NotFound {
  readonly _tag: 'NotFound' = 'NotFound'
  inspect(): string {
    return this.toString()
  }
  toString(): string {
    return `new NotFound()`
  }
}

type Location = Home | User | NotFound

// matches
const home: Match<Route, Home> = lit('home').imap(() => new Home(), () => undefined)
const user: Match<Route, User> = lit('users').then(int).imap(([_, n]) => new User(n), user => [undefined, user.id])

// router
const router = zero<Route, Location>().alt(home.parser).alt(user.parser)

// helpers
const parse = <S, A>(parser: Parser<S, A>, s: S, a: A): A => parser.run(s).map(([a]) => a).getOrElse(() => a)
const parseLocation = (s: string): Location => parse(router, s.split('/'), new NotFound())
const formatLocation = <A>(match: Match<Route, A>, location: A): string => match.formatter.run([''], location).join('/')

//
// examples
//

// parser
console.log(parseLocation('home')) // => new Home()
console.log(parseLocation('users/1')) // new User(1)
console.log(parseLocation('user/1')) // new NotFound()

// formatter
console.log(formatLocation(user, new User(1))) // => /users/1
```
