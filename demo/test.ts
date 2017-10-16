import * as task from '../src/Task'
import { Task } from '../src/Task'

interface Monad {
  map: <A, B>(f: (a: A) => B, fa: Task<A>) => Task<B>
  of: <A>(a: A) => Task<A>
  ap: <A, B>(fab: Task<(a: A) => B>, fa: Task<A>) => Task<B>
  chain: <A, B>(
    f: (a: A) => Task<B>,
    fa: Task<A>
  ) => Task<B>
}

interface MonadUser extends Monad {
  validateUser: (session: string) => Task<string>
  facebookToken: (userId: string) => Task<string>
}

interface MonadFB extends Monad {
  findPost: (url: string) => Task<string>
  sendLike: (
    token: string
  ) => (postId: string) => Task<boolean>
}

interface MonadLike extends Monad, MonadUser, MonadFB {}

const likePost = <M>(M: MonadLike) => (session: string) => (
  url: string
): Task<boolean> => {
  const token = M.validateUser(session).chain(userId =>
    M.facebookToken(userId)
  )
  const post = M.findPost(url)
  const result = post.ap(
    token.map(token => M.sendLike(token))
  )
  return result.chain(x => x)
}

const delay = <A>(a: A): Task<A> =>
  new Task(
    () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve(a)
        }, 500)
      })
  )

const taskInstance = {
  ...task,
  validateUser: (session: string) => delay('user_id'),
  facebookToken: (userId: string) => delay('token'),
  findPost: (url: string) => delay('postId'),
  sendLike: (token: string) => (postId: string) =>
    delay(true)
}

likePost(taskInstance)('sesssion')('https://foo.com')
  .run()
  .then(x => console.log(x))

import * as identity from '../src/Identity'

const identityInstance = {
  ...task,
  validateUser: (session: string) => identity.of('user_id'),
  facebookToken: (userId: string) => identity.of('token'),
  findPost: (url: string) => identity.of('postId'),
  sendLike: (token: string) => (postId: string) =>
    identity.of(true)
} as any

console.log(
  (likePost(identityInstance)('sesssion')(
    'https://foo.com'
  ) as any).value
)
