/**
 * 对于给定的类型`A`，能否定义`Semigroup<Ord<A>>`实例？它代表的可能是什么？
 */
import {
  function as F,
  ord as O,
  readonlyArray as RA,
  semigroup as SG,
  string as S,
  number as N,
  boolean as B,
} from 'fp-ts';

/**
 * 首先我们定义的`Ord<A>`的semigroup实例
 */

const getSemigroup = <A = never>(): SG.Semigroup<O.Ord<A>> => ({
  concat: (first, second) =>
    O.fromCompare((a1, a2) => {
      const ordering = first.compare(a1, a2);
      return ordering !== 0 ? ordering : second.compare(a1, a2);
    }),
});

/**
 * 现在让我们看看在实际中的应用
 */

interface User {
  readonly id: number;
  readonly name: string;
  readonly age: number;
  readonly rememberMe: boolean;
}

const byName = F.pipe(
  S.Ord,
  O.contramap((_: User) => _.name),
);

const byAge = F.pipe(
  N.Ord,
  O.contramap((_: User) => _.age),
);

const byRememberMe = F.pipe(
  B.Ord,
  O.contramap((_: User) => _.rememberMe),
);

const SemigroupOrdUser = getSemigroup<User>();

// 表示需要排序的一张表
const users: ReadonlyArray<User> = [
  { id: 1, name: 'Guido', age: 47, rememberMe: false },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true },
];

// 经典排序:
// 首先名称，其次年龄，然后`rememberMe`

const byNameAgeRememberMe = SG.concatAll(SemigroupOrdUser)(byName)([
  byAge,
  byRememberMe,
]);

F.pipe(users, RA.sort(byNameAgeRememberMe), console.log);
/**
 * [
 *  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *  { id: 4, name: 'Giulio', age: 44, rememberMe: true },
 *  { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *  { id: 1, name: 'Guido', age: 47, rememberMe: false }
 * ]
 */

// 现在我希望`rememberMe = true`被优先考虑

const byRememberMeNameAge = SG.concatAll(SemigroupOrdUser)(
  O.reverse(byRememberMe),
)([byName, byAge]);
F.pipe(users, RA.sort(byRememberMeNameAge), console.log);
/**
 * [
 *  { id: 4, name: 'Giulio', age: 44, rememberMe: true },
 *  { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *  { id: 1, name: 'Guido', age: 47, rememberMe: false }
 * ]
 */
