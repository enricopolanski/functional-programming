/*

  Problema 1: ottenere la lettera iniziale di ogni parola in una frase

  Problema 2: rendere maiuscole le lettere iniziali di ogni parola

*/

const f = (input: string) =>
  input.split(' ').map(word => word[0])

console.log(f('hello world'))

import { some, none } from '../src/Option'
import { Iso, Optional } from '../src/optics'

// Iso tra una stringa e l'elenco dei suoi token
export const tokens = (
  separator: string
): Iso<string, Array<string>> =>
  new Iso(s => s.split(separator), a => a.join(separator))

// Optional tra una stringa e il suo primo carattere
export const first: Optional<string, string> = new Optional(
  s => (s.length > 0 ? some(s[0]) : none),
  a => s => (s.length > 0 ? a + s.slice(1) : s)
)

export const toUpperCase = (s: string): string =>
  s.toUpperCase()

export const words = tokens(' ')

// la soluzione 1
const read = (s: string) =>
  words.get(s).map(first.getOption)
console.log(read('hello world'))
// [ Some { value: 'h' }, Some { value: 'w' } ]

// la soluzione 2
const write = words.modify(a =>
  a.map(first.modify(toUpperCase))
)
console.log(write('hello world'))
// "Hello World"
