import { Option, Some } from './Option'
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

const of = <A>(a: A) =>
  new ArrayOption(applicativeArray.of(new Some(a)))
