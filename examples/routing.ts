import { Option, some, none } from 'fp-ts/lib/Option'

// helper
const tuple = <A, B>(a: A, b: B): [A, B] => [a, b]

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

// declare function lit(literal: S): Match<S, void>
// declare var int: Match<S, number>

/** 'users/1' viene rappresentato da ['user', '1'] */
type Route = Array<string>

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

/** m rappresenta un match per la route 'foo/bar/:id' */
const m: Match<Route, number> = lit('foo')
  .then(lit('bar'))
  .then(int)
  .imap(([_, n]) => n, n => [[undefined, undefined], n])

// console.log(m.parser.run('foo/bar/1'.split('/'))) // => some([1, []])
// console.log(m.formatter.run([''], 1).join('/')) // => /foo/bar/1

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
