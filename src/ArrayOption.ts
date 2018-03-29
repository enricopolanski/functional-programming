import { Option } from './Option'
import * as option from './Option'
import { applicativeArray } from './Array'

export class ArrayOption<A> {
  constructor(readonly value: Array<Option<A>>) {}
  map<B>(f: (a: A) => B): ArrayOption<B> {
    return new ArrayOption(this.value.map(o => o.map(f)))
  }
  ap<B>(fab: Array<Option<(a: A) => B>>): Array<Option<B>> {
    return applicativeArray.ap(
      applicativeArray.map(
        h => (ga: Option<A>) => ga.ap(h),
        fab
      ),
      this.value
    )
  }
}

export const of = <A>(a: A) =>
  new ArrayOption(applicativeArray.of(option.of(a)))

export const reduce = <A, B>(
  fa: ArrayOption<A>,
  b: B,
  f: (b: B, a: A) => B
): B => fa.value.reduce((b, o) => option.reduce(o, b, f), b)

import { some, none } from './Option'

console.log(
  reduce(
    new ArrayOption([some('a'), none, some('b')]),
    '',
    (b, a) => b + a
  )
) // ab
