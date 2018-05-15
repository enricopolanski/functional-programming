/*

  # Summary

  In questa demo vedremo come gestire l'ordinamento
  di una tabella contenente una serie di utenti
  tramite un protocollo che specifica
  i campi (e la direzione) su cui ordinare.

  Il protocollo ha eusta forma

  <field>:<direction>*

  Esempio:

  la stringa "name:asc,age:desc" indica di
  ordinare prima per il campo `name` in ordine
  ascendente, e poi sul campo `age` in ordine discendente

*/

import {
  Ord,
  contramap,
  ordString,
  ordNumber,
  getDualOrd
} from 'fp-ts/lib/Ord'
import {
  Option,
  some,
  none,
  option
} from 'fp-ts/lib/Option'
import { traverse } from 'fp-ts/lib/Traversable'
import { array, sortBy } from 'fp-ts/lib/Array'

/*

  Incominciamo col modellare i dati dell'utente

*/

export interface User {
  name: string
  age: number
}

type Direction = 'asc' | 'desc'

type Field = 'name' | 'age'

/*

  Definiamo tutti gli ordinamenti possibili
  sottoforma di istanze di `Ord`

*/

const byName = contramap((p: User) => p.name, ordString)

const byAge = contramap((p: User) => p.age, ordNumber)

/*

  Definiamo ora una funzione che converte
  un `Field` nella corrispondente istanza di `Ord`

*/

const fromField = (field: Field): Ord<User> => {
  switch (field) {
    case 'name':
      return byName
    case 'age':
      return byAge
  }
}

/*

  Gestire l'ordinamento discendente per una istanza di `Ord`
  vuol dire prenderne il suo duale

*/

const fromDirection = <A>(
  direction: Direction,
  ord: Ord<A>
): Ord<A> => (direction === 'asc' ? ord : getDualOrd(ord))

/*

  Definiamo le varie funzioni di parsing.

  Una funzione di parsing per il tipo `A` in generale ha la forma

  (s: string) => Option<A>

*/

const parseDirection = (s: string): Option<Direction> => {
  return s === 'asc' || s === 'desc'
    ? some<Direction>(s)
    : none
}

const parseField = (s: string): Option<Field> => {
  return s === 'name' || s === 'age' ? some<Field>(s) : none
}

type Pair<A> = [A, A]

const isPair = <A>(as: Array<A>): as is Pair<A> =>
  as.length === 2

const parsePair = (
  s: string,
  sep: string
): Option<Pair<string>> => {
  const ss = s.split(sep)
  return isPair(ss) ? some(ss) : none
}

const parseFragment = (s: string): Option<Ord<User>> =>
  parsePair(s, ':').chain(([fst, snd]) =>
    parseDirection(snd).chain(direction =>
      parseField(fst).map(field =>
        fromDirection(direction, fromField(field))
      )
    )
  )

// traverse!

const parseProtocol = (
  s: string
): Option<Array<Ord<User>>> => {
  const fragments = s.split(',')
  return traverse(option, array)(fragments, parseFragment)
}

export const sortPersons = (
  s: string,
  persons: Array<User>
): Array<User> =>
  parseProtocol(s)
    .chain(ords => sortBy(ords))
    .map(sort => sort(persons))
    .getOrElse(persons)

export const persons = [
  { name: 'a', age: 1 },
  { name: 'b', age: 3 },
  { name: 'c', age: 2 },
  { name: 'b', age: 2 }
]

console.log(sortPersons('name:asc,age:asc', persons))
// console.log(sortPersons('name:asc,age:desc', persons))
// console.log(sortPersons('age:asc,name:asc', persons))
// console.log(sortPersons('name:asc', persons))
// console.log(sortPersons('', persons))
