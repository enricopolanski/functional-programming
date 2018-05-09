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

import { Applicative1 } from 'fp-ts/lib/Applicative'
import { URIS, Type } from 'fp-ts/lib/HKT'
import { task } from 'fp-ts/lib/Task'
import { traverse as t } from 'fp-ts/lib/Traversable'

const traverse = <F extends URIS>(F: Applicative1<F>) => <
  A,
  B
>(
  ta: ArrayOption<A>,
  f: (a: A) => Type<F, B>
): Type<F, ArrayOption<B>> => {
  return F.map(
    t(F, array)(ta.value, o => t(F, option)(o, f)),
    a => new ArrayOption(a)
  )
}

traverse(task)(
  new ArrayOption([some('foo'), none, some('quux')]),
  a => task.of(a.length)
)
  .run()
  .then(x => console.log(x))
/*
ArrayOption([some(3), none, some(4)])
*/
