/**
 * Convertire la funzione `parseJSON` in stile funzionale usando l'implementazione di `Either` in `fp-ts`
 */
import { right, left } from 'fp-ts/Either'
import { Json } from 'fp-ts/Json'

// may throw a SyntaxError
export const parseJSON = (input: string): Json => JSON.parse(input)

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

assert.deepStrictEqual(parseJSON('1'), right(1))
assert.deepStrictEqual(parseJSON('"a"'), right('a'))
assert.deepStrictEqual(parseJSON('{}'), right({}))
assert.deepStrictEqual(parseJSON('{'), left(new SyntaxError()))
