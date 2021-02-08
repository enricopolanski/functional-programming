/**
 * Modellare il punteggio di un game di tennis
 */

// ------------------------------------
// model
// ------------------------------------

type Player = 'A' | 'B'

type Score = 0 | 15 | 30 | 40

type Game =
  | { readonly _tag: 'Score'; readonly A: Score; readonly B: Score }
  | { readonly _tag: 'Advantage'; readonly player: Player }
  | { readonly _tag: 'Deuce' }
  | { readonly _tag: 'Game'; readonly player: Player }

// ------------------------------------
// constructors
// ------------------------------------

const score = (A: Score, B: Score): Game => ({ _tag: 'Score', A, B })
const advantage = (player: Player): Game => ({ _tag: 'Advantage', player })
const deuce: Game = { _tag: 'Deuce' }
const game = (player: Player): Game => ({ _tag: 'Game', player })

/**
 * Punteggio di partenza
 */
const start: Game = {
  _tag: 'Score',
  A: 0,
  B: 0
}

// ------------------------------------
// destructors
// ------------------------------------

const fold = <R>(
  onScore: (scoreA: Score, scoreB: Score) => R,
  onAdvantage: (player: Player) => R,
  onDeuce: () => R,
  onGame: (player: Player) => R
) => (game: Game): R => {
  switch (game._tag) {
    case 'Score':
      return onScore(game.A, game.B)
    case 'Advantage':
      return onAdvantage(game.player)
    case 'Deuce':
      return onDeuce()
    case 'Game':
      return onGame(game.player)
  }
}

import * as O from 'fp-ts/Option'

const next = (score: Score): O.Option<Score> => {
  switch (score) {
    case 0:
      return O.some(15)
    case 15:
      return O.some(30)
    case 30:
      return O.some(40)
    case 40:
      return O.none
  }
}

/**
 * Dato un punteggio e un giocatore che si è aggiudicato il punto restituisce il nuovo punteggio
 */
const win = (player: Player): ((game: Game) => Game) =>
  fold(
    (A, B) =>
      pipe(
        next(player === 'A' ? A : B),
        O.match(
          (): Game => (A === B ? advantage(player) : game(player)),
          (next) => (player === 'A' ? score(next, B) : score(A, next))
        )
      ),
    (current) => (player === current ? game(player) : deuce),
    () => advantage(player),
    game
  )

/**
 * Restituisce il punteggio in formato leggibile
 */
const show: (game: Game) => string = fold(
  (A, B) => `${A} - ${B === A ? 'all' : B}`,
  (player) => `advantage player ${player}`,
  () => 'deuce',
  (player) => `game player ${player}`
)

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(start, win('A'), win('A'), win('A'), win('A'), show),
  'game player A'
)

const fifteenAll = pipe(start, win('A'), win('B'))
assert.deepStrictEqual(pipe(fifteenAll, show), '15 - all')

const fourtyAll = pipe(fifteenAll, win('A'), win('B'), win('A'), win('B'))
assert.deepStrictEqual(pipe(fourtyAll, show), '40 - all')

const advantageA = pipe(fourtyAll, win('A'))
assert.deepStrictEqual(pipe(advantageA, show), 'advantage player A')

assert.deepStrictEqual(pipe(advantageA, win('B'), show), 'deuce')
