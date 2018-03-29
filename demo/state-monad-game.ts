/*
  Example use of State monad
  Passes a string of dictionary {a,b,c}
  Game is to produce a number from the string.
  By default the game is off, a `c` toggles the
  game on and off. A 'a' gives +1 and a `b` gives -1.
  E.g
  'ab'    = 0
  'ca'    = 1
  'cabca' = 0
*/

import { State, of, get, put } from '../src/State'

type GameValue = number
type GameState = [boolean, GameValue]

const fold = <R>(
  s: string,
  nil: R,
  cons: (head: string, tail: string) => R
): R => {
  if (s.length === 0) {
    return nil
  } else {
    return cons(s[0], s.substring(1))
  }
}

const end = get<GameState>().chain(([_, score]) =>
  of(score)
)

const playGame = (
  s: string
): State<GameState, GameValue> => {
  return fold(s, end, (head, tail) => {
    return get<GameState>()
      .chain(([on, score]) => {
        if (head === 'a' && on) {
          return put<GameState>([on, score + 1])
        } else if (head === 'b' && on) {
          return put<GameState>([on, score - 1])
        } else if (head === 'c') {
          return put<GameState>([!on, score])
        } else {
          return put<GameState>([on, score])
        }
      })
      .chain(() => playGame(tail))
  })
}

const initialState: GameState = [false, 0]

console.log(playGame('ab').eval(initialState))
console.log(playGame('ca').eval(initialState))
console.log(playGame('cabca').eval(initialState))
console.log(playGame('abcaaacbbcabbab').eval(initialState))
