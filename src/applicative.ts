import { Option, of } from './Option'

const sum = (a: number) => (b: number): number => a + b

const sumOptions = (fa: Option<number>) => (
  fb: Option<number>
): Option<number> => {
  return fb.ap(fa.ap(of(sum)))
}

const sumOptions2 = (fa: Option<number>) => (
  fb: Option<number>
): Option<number> => fb.ap(fa.map(sum))

type Function2<A, B, C> = (a: A) => (b: B) => C

const liftA2 = <A, B, C>(
  f: Function2<A, B, C>
): Function2<Option<A>, Option<B>, Option<C>> => fa => fb =>
  fb.ap(fa.map(f))

const sumOptions3 = liftA2(sum)
