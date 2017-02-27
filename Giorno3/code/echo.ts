declare var process: any

import { IO, getLine, putStrLn } from './IO'
import { Maybe, none, some } from './Maybe'
import { Left, Right, Either } from './Either'

//
// echo program
//

// function echo() {
//   const s = process.argv[2] || ''
//   console.log(s)
// }

const echo = getLine().chain(putStrLn)

// echo.run()

//
// print first letter program
//

// function printFirstLetter() {
//   const s = process.argv[2] || ''
//   if (s) {
//     console.log(s[0].toUpperCase())
//   } else {
//     console.log('missing input, please run ts-node echo.ts "your sentence here"')
//   }
// }

const firstLetter = (s: string): Maybe<string> => s.length ? some(s[0]): none
const toUpperCase = (s: string): string => s.toUpperCase()
const showHelp = () => 'missing input, please run ts-node echo.ts "your sentence here"'

const printFirstLetter = getLine()
  .map(s => firstLetter(s)
    .map(toUpperCase)
    .getOrElse(showHelp)
  )
  .chain(putStrLn)

// printFirstLetter.run()

//
// inverse program
//

// function main() {
//   const s = process.argv[2] || ''
//   const n = parseInt(s, 10)

//   if (Number.isNaN(n)) {
//     console.log(`Not a number: ${s}`)
//   } else {
//     if (n === 0) {
//       console.log(`Cannot divide by zero`)
//     } else {
//       console.log(1 / n)
//     }
//   }
// }

const parse = (s: string): Either<string, number> => {
  const n = parseFloat(s)
  return Number.isNaN(n) ?
    new Left(`Not a number: ${s}`) :
    new Right<string, number>(n)
}

const integer = (n: number): Either<string, number> => n % 1 === 0 ?
  new Right<string, number>(n) :
  new Left(`Not an integer: ${n}`)

const inverse = (n: number): Either<string, number> => n === 0 ?
  new Left('Cannot divide by zero') :
  new Right<string, number>(1 / n)

const identity = <A>(x: A): A => x

const inverseProgram = getLine()
  .map(s => parse(s)
    .chain(integer)
    .chain(inverse)
    .map(String)
    .fold(identity, identity)
  )
  .chain(putStrLn)

inverseProgram.run()
