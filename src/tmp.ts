import { Option } from 'fp-ts/lib/Option'

export const placeholder: any = null

export const sum = (a: number) => (b: number): number =>
  a + b

export const sumOptions = (
  fa: Option<number>,
  fb: Option<number>
) => fb.ap(fa.map(sum))
