/*

  Problema: trasformare il seguente CSV

*/

const good = `foo;foo@google.com
bar;bar@hotmail.com`

/*

  in una lista di

*/

type ContactInfo = {
  name: string
  email: string
}

/*

  Un primo tentativo...

*/

const toContactInfos1 = (
  csv: string
): Array<ContactInfo> => {
  return csv
    .split('\n')
    .map(line => line.split(';'))
    .map(([name, email]) => ({ name, email }))
}

// console.log(toContactInfos1(good))
/*
[ { name: 'foo', email: 'foo@google.com' },
  { name: 'bar', email: 'bar@hotmail.com' } ]
*/

/*

  Cosa succede se il CSV non ha tutti campi?

*/

const bad = `foo;foo@google.com
bar;bar@hotmail.com
;baz@yahoo.com
quux;`

// console.log(toContactInfos1(bad))
/*
[ { name: 'foo', email: 'foo@google.com' },
  { name: 'bar', email: 'bar@hotmail.com' },
  { name: '', email: 'baz@yahoo.com' },
  { name: 'quux', email: '' } ]
*/

/*

  Potremmo aggiungere la possibilità di specificare delle opzioni

*/

const toContactInfos2 = (
  csv: string,
  // se `true` elimina le righe senza name
  nameRequired: boolean,
  // se `true` elimina le righe senza email
  emailRequired: boolean
): Array<ContactInfo> => {
  return csv
    .split('\n')
    .map(line => line.split(';'))
    .filter(([name, email]) => {
      if (
        (name === '' && nameRequired) ||
        (email === '' && emailRequired)
      ) {
        return false
      }
      return true
    })
    .map(([name, email]) => ({ name, email }))
}

// console.log(toContactInfos2(bad, true, true))
/*
[ { name: 'foo', email: 'foo@google.com' },
  { name: 'bar', email: 'bar@hotmail.com' } ]
*/

/*

  La soluzione sembra funzionare ma cosa ne pensate?

*/

/*

  Separiamo la logica di parsing da quella di filtering e mapping

*/

type Pair<A> = [A, A]

const toPair = (xs: Array<string>): Pair<string> => [
  xs.length > 0 ? xs[0].trim() : '',
  xs.length > 1 ? xs[1].trim() : ''
]

// parsing
const getTokens = (csv: string): Array<Pair<string>> =>
  csv.split('\n').map(line => toPair(line.split(';')))

// mapping
const toContactInfo = ([name, email]: Pair<
  string
>): ContactInfo => ({
  name,
  email
})

const toContactInfos3 = (
  csv: string,
  nameRequired: boolean,
  emailRequired: boolean
): Array<ContactInfo> =>
  // parsing
  getTokens(csv)
    // filtering
    .filter(([name, email]) => {
      if (
        (name === '' && nameRequired) ||
        (email === '' && emailRequired)
      ) {
        return false
      }
      return true
    })
    // mapping
    .map(toContactInfo)

/*

    Separiamo anche la logica di filtering

*/

// Un "predicato" su `A` è una funzione che accetta in input un valore
// di tipo `A` e restituisce un booleano
type Predicate<A> = (a: A) => boolean

// Possiamo ora rendere formale il concetto di "filtro" per le righe del CSV
// Definizione: chiamiamo "filtro" un predicato su `Pair<string>`
type Filter = Predicate<Pair<string>>

// filtering
const getFilter = (
  nameRequired: boolean,
  emailRequired: boolean
): Filter => ([name, email]) => {
  if (
    (name === '' && nameRequired) ||
    (email === '' && emailRequired)
  ) {
    return false
  }
  return true
}

const toContactInfos4 = (
  csv: string,
  nameRequired: boolean,
  emailRequired: boolean
): Array<ContactInfo> =>
  getTokens(csv)
    .filter(getFilter(nameRequired, emailRequired))
    .map(toContactInfo)

/*

  Fino ad ora ho fatto un refactoring che non ha modificato in alcun modo la funzionlità
  Ma adesso è evidente che i parametri aggiuntivi servono solo per creare il predicato.
  Ma allora passiamo direttamente il predicato come argomento!

*/

const toContactInfos = (
  csv: string,
  filter: Filter
): Array<ContactInfo> =>
  getTokens(csv)
    .filter(filter)
    .map(toContactInfo)

/*

  Molto meglio. Ma come costruire un filtro?
  Anche getFilter non è del tutto soddisfacente.
  Usiamo un combinatore!

  Un combinatore su un tipo `A` è una funzione `combinator: A -> A`

*/

type Combinator = (filter: Filter) => Filter

const all: Filter = () => true

const nameRequired: Combinator = next => pair =>
  pair[0] === '' ? false : next(pair)

const emailRequired: Combinator = next => pair =>
  pair[1] === '' ? false : next(pair)

console.log(toContactInfos(bad, all))
/*
[ { name: 'foo', email: 'foo@google.com' },
{ name: 'bar', email: 'bar@hotmail.com' },
{ name: '', email: 'baz@yahoo.com' },
{ name: 'quux', email: '' } ]
*/

console.log(toContactInfos(bad, nameRequired(all)))
/*
[ { name: 'foo', email: 'foo@google.com' },
  { name: 'bar', email: 'bar@hotmail.com' },
  { name: 'quux', email: '' } ]
*/

console.log(
  toContactInfos(bad, emailRequired(nameRequired(all)))
)
/*
[ { name: 'foo', email: 'foo@google.com' },
{ name: 'bar', email: 'bar@hotmail.com' } ]
*/
