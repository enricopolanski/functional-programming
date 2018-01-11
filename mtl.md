# Un esempio di stile MTL

L'esempio riguarda questi requisiti, supponiamo di dover implementare questa funzionalità:

> dato uno user id, tentare di caricare i suoi dati dal localStorage. Se i dati non sono presenti, cercare di caricare i
> dati dal server con n tentativi distanziati tra loro da m millisecondi, e se almeno uno di questi tentativi ha avuto
> successo, immagazzinare i dati nel local storage

Cioè alla fine voglio produrre una API con una firma simile a

```ts
declare function program(times: number, delay: number) => (id: string) => Promise<Option<User>>
```

Il problema con una firma del genere è che guardando la funzione, in particolare il tipo di ritorno, senza aver letto i
requisiti, non ho idea di cosa faccia: `Promise<A>` può visrtualmente effettuare qualsiasi tipo di side effect.

Un vantaggio dello stile MTL è rendere esplicite le capacità coinvolte.

Vediamo quali sono:

* capacità di lanciare eccezioni (utente non trovato nel localStorage o sul server)
* capacità di dialogare con il localStorage
* capacità di fare la catch degli errori (se non trovo i dati nel localStorage, provo a caricarli dal server)
* capacità di ritardare l'esecuzione di una azione
* capacità di caricare i dati di un utente dal server

Per ognuna di queste capacità definiamo una interfaccia apposita che estende `Monad`

```ts
import { HKT2 } from 'fp-ts/lib/HKT'

// interfacce per i kind * -> * -> *
interface Functor2<M, L> {
  readonly URI: M
  map<A, B>(f: (a: A) => B, fa: HKT2<M, L, A>): HKT2<M, L, B>
}

interface Applicative2<M, L> extends Functor2<M, L> {
  of<A>(a: A): HKT2<M, L, A>
  ap<A, B>(fab: HKT2<M, L, (a: A) => B>, fa: HKT2<M, L, A>): HKT2<M, L, B>
}

interface Monad2<M, L> extends Applicative2<M, L> {
  chain<A, B>(f: (a: A) => HKT2<M, L, B>, fa: HKT2<M, L, A>): HKT2<M, L, B>
}

// rappresenta la capacità di lanciare eccezioni
interface MonadThrow<M, E> {
  throwError<A>(e: E): HKT2<M, E, A>
}

// rappresenta la capacità di dialogare con uno storage
interface MonadStorage<M, E> extends MonadThrow<M, E> {
  getItem(name: string): HKT2<M, E, string>
  setItem(name: string, value: string): HKT2<M, E, void>
}

// rappresenta la capacità di fare la catch degli errori
interface MonadError<M, E> extends MonadThrow<M, E> {
  catchError<A>(ma: HKT2<M, E, A>, f: (e: E) => HKT2<M, E, A>): HKT2<M, E, A>
}

// rappresenta la capacità di ritardare l'esecuzione di una azione
interface MonadDelay<M> {
  delay<L, A>(millis: number, ma: HKT2<M, L, A>): HKT2<M, L, A>
}

interface User {
  name: string
}

// rappresenta la capacità di caricare i dati di un utente
interface MonadUser<M, E> {
  fetchUser(id: string): HKT2<M, E, User>
}
```

Infine definiamo l'interfaccia che rappresenta le capacità richieste per eseguire il programma principale

```ts
interface MonadApp<M, E> extends Monad2<M, E>, MonadError<M, E>, MonadStorage<M, E>, MonadDelay<M>, MonadUser<M, E> {}
```

Ora l'obiettivo è scrivere il programma _solo in funzione di `MonadApp`_, in modo tale che sia il più generale possibile
e che l'implementazione concreta possa essere iniettata in un secondo momento.

Incominciamo a definire due utili combinatori che dipendono solo da `MonadError`

```ts
/** prova l'azione `x` e se fallice, prova l'azione `y` */
function alt<E, M>(M: MonadError<M, E>): <A>(x: HKT2<M, E, A>, y: HKT2<M, E, A>) => HKT2<M, E, A> {
  return (x, y) => M.catchError(x, () => y)
}

/** prova l'azione `ma` per un numero `times` di volte */
function attempt<E, M>(M: MonadError<M, E>): (times: number) => <A>(ma: HKT2<M, E, A>) => HKT2<M, E, A> {
  return times => ma => M.catchError(ma, e => (times <= 1 ? M.throwError(e) : attempt(M)(times - 1)(ma)))
}
```

**Nota**. Questi due combinatori sono così generali che potrebbe valere la pena di inserirli in una libreria per
`MonadError`.

Poi definiamo due combinatori che dipendono da `MonadStorage`

```ts
/** carica i dati dallo storage */
const parse = <E, M>(M: MonadStorage<M, E> & Functor2<M, E>) => <A>(name: string): HKT2<M, E, A> =>
  M.map(JSON.parse, M.getItem(name))

/** salva i dati nello storage */
const save = <E, M>(M: MonadStorage<M, E> & Functor2<M, E>) => (name: string) => <A>(a: A): HKT2<M, E, A> =>
  M.map(() => a, M.setItem(name, JSON.stringify(a)))
```

E infine definiamo un combinatore che dipende da `MonadError` e `MonadDelay`

```ts
/** prova una azione `times` volte con un intervallo di `millis` */
const delayedAttempts = <E, M>(M: MonadError<M, E> & MonadDelay<M>) => <A>(
  times: number,
  delay: number,
  ma: HKT2<M, E, A>
) => alt(M)(ma, attempt(M)(times - 1)(M.delay(delay, ma)))
```

**Nota**. E' importante che i combinatori siano polimorfici, in modo da avere maggiori garanzie sulla corretta
implementazione.

Ora possiamo scrivere il nostro programma

```ts
/** programma principale */
function program<E, M>(M: MonadApp<M, E>): (times: number, delay: number) => (id: string) => HKT2<M, E, User> {
  const namespace = 'user'
  const parseUser = parse(M)<User>(namespace)
  const saveUser = save(M)(namespace)
  return (times, delay) => id => {
    const attempts = delayedAttempts(M)(times, delay, M.fetchUser(id))
    return alt(M)(parseUser, M.chain(user => saveUser(user), attempts))
  }
}
```

**Nota**. Una cosa interessante da sottolineare è come, avendo reificato il caricamento dei dati dell'utente in un
valore (`M.fetchUser(id)`), è possibile utilizzare il combinatore generale `attempt` per poter eseguire più volte
l'azione.

## Appendice

Vediamo come definire una istanza di `MonadApp` per il tipo `TaskEither`

```ts
import * as te from 'fp-ts/lib/TaskEither'
import * as either from 'fp-ts/lib/Either'
import { Task } from 'fp-ts/lib/Task'

// faked API
const fetchUserAPI = (id: string): Promise<User> => {
  console.log(`fetchUserAPI(${id})`)
  return id === '1' ? Promise.resolve({ name: 'Giulio' }) : Promise.reject(undefined)
}

// helper
const delayTask = (millis: number) => <A>(ma: Task<A>): Task<A> => {
  return new Task(
    () =>
      new Promise(resolve => {
        setTimeout(() => ma.run().then(resolve), millis)
      })
  )
}

// il tipo degli errori
type E = 'user not memoized' | 'user not found'

// istanza (e quick and dirty debugging annesso)
const monadAppTaskEither: MonadApp<te.URI, E> = {
  URI: te.URI,
  map: te.map,
  of: te.of,
  ap: te.ap,
  chain: te.chain,
  fetchUser: id => te.tryCatch(() => fetchUserAPI(id), (): E => 'user not found'),
  throwError: e => te.fromEither(either.left(e)),
  catchError: <A>(ma: te.TaskEither<E, A>, f: (e: E) => te.TaskEither<E, A>) => ma.orElse(f),
  getItem: name => {
    const e = either.fromNullable<E>('user not memoized')(localStorage.getItem(name))
    console.log(e.fold(e => `TaskEither: ${e}`, () => 'TaskEither: user memoized'))
    return te.fromEither(e)
  },
  setItem: (name, value) => {
    console.log(`TaskEither: memoizing ${name} ${value}`)
    return te.of(localStorage.setItem(name, value))
  },
  delay: <L, A>(millis: number, ma: te.TaskEither<L, A>) => {
    return new te.TaskEither(delayTask(millis)(ma.value))
  }
}

// esecuzione del programma
const nrOfAttempts = 3
const millis = 1000
const id = '2'
const load = program(monadAppTaskEither)(nrOfAttempts, millis)
const result = load(id) as te.TaskEither<E, User>
result.run().then(x => console.log(x))
/*
Output:
TaskEither: user not memoized
bundle.js:sourcemap:700 fetchUserAPI(2)
bundle.js:700 fetchUserAPI(2)
bundle.js:700 fetchUserAPI(2)
Left("user not found")
*/
```
