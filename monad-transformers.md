# Monad transformers

**Senario 1**

Supponiamo di avere definto le seguenti API:

```ts
import { head } from 'fp-ts/lib/Array'
import { Option } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { map, Task, task } from 'fp-ts/lib/Task'

function fetchUserComments(
  id: string
): Task<Array<string>> {
  return task.of(['comment1', 'comment2'])
}

function fetchFirstComment(
  id: string
): Task<Option<string>> {
  return pipe(
    fetchUserComments(id),
    map(head)
  )
}
```

Il tipo del codominio della funzione `fetchFirstComment` è `Task<Option<string>>` ovvero una struttura dati innestata.

È possibile associare una istanza di monade?

**Senario 2**

Per modellare una chiamata AJAX, il type constructor `Task` non è sufficiente dato che rappresenta una computazione
asincrona che non può mai fallire, come possiamo modellare anche i possibili errori restituiti dalla chiamata (`403`, `500`, etc...)?

Più in generale supponiamo di avere una computazione con le seguenti proprietà:

- asincrona
- può fallire

Come possiamo modellarla?

Sappiamo che questi due effetti possono essere rispettivamente codificati dai seguenti tipi:

- `Task<A>` (asincronicità)
- `Either<E, A>` (possibile fallimento)

e che ambedue hanno una istanza di monade.

Come posso combinare questi due effetti?

In due modi:

- `Task<Either<L, A>>` rappresenta una computazione asincrona che può fallire
- `Either<L, Task<A>>` rappresenta una computazione che può fallire oppure che restituisce una computazione asincrona

Diciamo che sono interessato al primo dei due modi:

```ts
interface TaskEither<L, A> extends Task<Either<L, A>> {}
```

È possibile definire una istanza di monade per `TaskEither`?

## Le monadi non compongono

In generale le monadi non compongono, ovvero date due istanze di monade, una per `M<A>` e una per `N<A>`,
allora non è detto che `M<N<A>>` ammetta ancora una istanza di monade.

**Quiz**. Perchè? Provare a definire la funzione `flatten`.

Che non compongano in generale però non vuol dire che non esistano dei casi particolari ove questo succede.

Vediamo qualche esempio, se `M` ammette una istanza di monade allora ammettono una istanza di monade i seguenti tipi:

- `OptionT<M, A> = M<Option<A>>`
- `EitherT<M, L, A> = M<Either<L, A>>`

Più in generale i **monad transformer** sono un elenco di "ricette" specifiche che mostrano come a `M<N<A>>` può essere associata una istanza di monade quando `M` e `N` ammettono una istanza di monade.

Per operare comodamente abbiamo bisogno di operazioni che permettono di immergere le computazioni che girano nelle monadi costituenti la monade target: le _lifting_ functions.
