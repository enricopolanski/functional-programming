# `Task` versus `Promise`

`Task` è una astrazione simile a `Promise`, la differenza chiave è che `Task` rappresenta una computazione asincrona
mentre `Promise` rappresenta solo un risultato (ottenuto in maniera asincrona).

Se abbiamo un `Task`

- possiamo far partire la computazione che rappresenta (per esempio una richiesta network)
- possiamo scegliere di non far partire la computazione
- possiamo farlo partire più di una volta (e potenzialmente ottenere risultati diversi)
- mentre la computazione si sta svolgendo, possiamo notificargli che non siamo più interessati al risultato e la computazione può scegliere di terminarsi da sola
- quando la computazione finisce otteniamo il risultato

Se abbiamo una `Promise`

- la computazione si sta già svolgendo (o è addirittura già finita) e non abbiamo controllo su questo
- quando è disponible otteniamo il risultato
- due consumatori della stessa `Promise` ottengono lo stesso risultato
