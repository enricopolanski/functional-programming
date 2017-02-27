import { Maybe } from './Maybe'

const trim = (s: string): string => s.trim()

const x: Maybe<number> = new Maybe(1)

console.log(x.map(trim)) // <= error: Type 'number' is not assignable to type 'string'
