import { Option, option } from 'fp-ts/lib/Option'
import { array } from 'fp-ts/lib/Array'

export const of = <A>(a: A) =>
  new ArrayOption(array.of(option.of(a)))

export class ArrayOption<A> {
  constructor(readonly value: Array<Option<A>>) {}
  map<B>(f: (a: A) => B): ArrayOption<B> {
    return new ArrayOption(this.value.map(o => o.map(f)))
  }
  ap<B>(fab: Array<Option<(a: A) => B>>): Array<Option<B>> {
    return array.ap(
      array.map(fab, h => (ga: Option<A>) => ga.ap(h)),
      this.value
    )
  }
}

export const reduce = <A, B>(
  fa: ArrayOption<A>,
  b: B,
  f: (b: B, a: A) => B
): B => fa.value.reduce((b, o) => option.reduce(o, b, f), b)

import { some, none } from 'fp-ts/lib/Option'

console.log(
  reduce(
    new ArrayOption([some('a'), none, some('b')]),
    '',
    (b, a) => b + a
  )
) // ab
