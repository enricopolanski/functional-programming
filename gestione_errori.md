# Gestione degli errori

Lanciare eccezioni è un side effect, quindi è proibito. Quindi come si fa? Come abbiamo già visto per altri casi (funzioni non totali) si allarga il codominio, i due signori usati di più sono `Maybe` e `Either`. `Maybe` l'abbiamo già visto, `Either` è una unione di due tipi `L | R` dove per convenzione il "left" (`L`) denota il tipo dell'errore e il "right" (`R`) denota il tipo del successo. `Either` viene usato quando si ha l'esigenza di specificare meglio qual'è il problema (`Maybe` si limita a segnalare che c'è stato un problema). Se l'operazione ha successo si mette il risultato dentro il right, se è fallita si mette la ragione dentro il left.

In Flow potrebbe per esempio essere implementato così

```js
type Either<L, R> = { type: 'Left', left: L } | { type: 'Right', right: R };
```

Domanda: ad `Either` può essere associata un'istanza di funtore? Hint: attenzione che un funtore è associato ad un kind `* -> *`, mentre `Either` ha kind `* -> * -> *`.
