type SelectedArray<A> = {
  items: Array<A>, // <= lista di items
  current: number  // <= indice dell'item selezionato
}

type Zipper<A> = {
  prev: Array<A>,
  current: A,
  next: Array<A>
}
