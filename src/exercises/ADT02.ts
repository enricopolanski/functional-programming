/**
 * Modellare il punteggio di un game di tennis
 */
type Player = 'A' | 'B'

type Game = unknown

/**
 * Punteggio di partenza
 */
const start: Game = null

/**
 * Dato un punteggio e un giocatore che si è aggiudicato il punto restituisce il nuovo punteggio
 */
declare const win: (player: Player) => (game: Game) => Game

/**
 * Restituisce il punteggio in formato leggibile
 */
declare const show: (game: Game) => string

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
