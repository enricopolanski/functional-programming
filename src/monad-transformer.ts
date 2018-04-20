import { HKT } from 'fp-ts/lib/HKT'
import { Monad } from 'fp-ts/lib/Monad'

//
// OptionT
//

import { Option, none, some } from 'fp-ts/lib/Option'

const swapOption = <M>(M: Monad<M>) => <A>(
  nma: Option<HKT<M, A>>
): HKT<M, Option<A>> => {
  return nma.fold(M.of(none), ma => M.map(ma, some))
}

//
// EitherT
//

import { Either, left, right } from 'fp-ts/lib/Either'

const swapEither = <M>(M: Monad<M>) => <L, A>(
  nma: Either<L, HKT<M, A>>
): HKT<M, Either<L, A>> => {
  return nma.fold(
    l => M.of(left(l)),
    ma => M.map(ma, a => right(a))
  )
}

//
// ReaderT
//

import { Reader } from 'fp-ts/lib/Reader'

const swapReader = <M>(M: Monad<M>) => <E, A>(
  nma: HKT<M, Reader<E, A>>
): Reader<E, HKT<M, A>> => {
  return new Reader(e =>
    M.map(nma, reader => reader.run(e))
  )
}

//
// StateT
//

const swapState = <M>(M: Monad<M>) => <S, A>(
  nma: HKT<M, (s: S) => [A, S]>
): ((s: S) => HKT<M, [A, S]>) => {
  return s => M.chain(nma, state => M.of(state(s)))
}
