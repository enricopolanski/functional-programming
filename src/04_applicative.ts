/*

  Problema:

  Dato
  - dato l'id di un utente (il cui record contiene il valore del suo conto corrente in EUR)
  - e il codice di una valuta
  Calcolare
  - il valore del suo conto corrente in quella valuta.

  I servizi che restituiscono il record dell'utente e il cambio relativo
  alla valuta sono asincroni

*/

/*

  Prima di tutto iniziamo con il modello

*/

interface User {
  id: string
  name: string
  amount: number // EUR
}

type Currency = 'USD' | 'CHF'

import * as T from 'fp-ts/lib/Task'

interface API {
  fetchUser: (id: string) => T.Task<User>
  fetchRate: (currency: Currency) => T.Task<number>
}

/*

  Se potessi ricavare il valore del conto corrente e il cambio
  in modo sincrono, il calcolo sarebbe facile

*/

const getAmountSync = (amount: number) => (
  rate: number
): number => amount * rate

/*

  Quello che vorrei è definire la seguente funzione

  const fetchAmount = (
    userId: string,
    currency: Currency
  ): T.Task<number> => ???

/*

  Scriviamo la versione di liftA2 specializzata per Task

*/

export function liftA2<A, B, C>(
  f: (a: A) => (b: B) => C
): (fa: T.Task<A>) => (fb: T.Task<B>) => T.Task<C> {
  return fa => fb => T.task.ap(T.task.map(fa, f), fb)
}

/*

  L'API finale

*/

import { pipe } from 'fp-ts/lib/pipeable'

const getResult = (api: API) => (
  userId: string,
  currency: Currency
): T.Task<number> => {
  const amount = pipe(
    api.fetchUser(userId),
    T.map(user => user.amount)
  )
  const rate = api.fetchRate(currency)
  const getAmountAsync = liftA2(getAmountSync)
  return getAmountAsync(amount)(rate)
}

/*

  Definiamo una istanza di `API` che simula le chiamate
  per poter testare il programma

*/

const API: API = {
  fetchUser: (id: string): T.Task<User> => () =>
    Promise.resolve({
      id,
      name: 'Foo',
      amount: 100
    }),
  fetchRate: (_: Currency): T.Task<number> => () =>
    Promise.resolve(0.12)
}

// program: (userId: string, currency: Currency) => T.Task<number>
const program = getResult(API)

const result: T.Task<number> = program('42', 'USD')

// run del programma
result().then(console.log)
// 12

// See also: `sequenceT`, `sequenceS` in `fp-ts/lib/Apply`
