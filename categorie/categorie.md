# Categorie

## Introduzione

Nell'ambito informatico è esperienza ormai comune che "lavorare a componenti", avere API "componibili", costruire nuovi oggetti tramite "composizione" sono proprietà positive del software.

Ma cosa vuol dire esattamente "componibile"? Quando possiamo davvero dire che due cose "compongono"? E se compongono quando possiamo dire che lo fanno in un modo "buono"?

Sarebbe assai utile poter fare riferimento ad una teoria **rigorosa** che ci possa fornire le risposte a queste importanti domande. Fortunatamente da più di 60 anni un vasto gruppo di studiosi appartenenti al più longevo e mastodontico progetto open source nella storia dell'umanità si occupa di sviluppare una teoria specificatamente dedicata a questo argomento: la **componibilità**.

Il progetto open source si chiama "matematica" e questa teoria sulla componibilità ha preso il curioso nome di "Teoria delle categorie".

Studiare la teoria delle categorie non è perciò un passatempo astratto, ma va dritto al cuore di ciò che facciamo tutti i giorni quando vogliamo sviluppare (buon) software.

**The Rosetta Stone**

```
Category Theory | Physics | Logic       | Computation
-----------------------------------------------------
object          | system  | proposition | data type
morphism        | process | proof       | program
```

## Definizione di categoria

Una categoria `C` è una coppia `(Oggetti, Morfismi)` ove

- `Oggetti`, (inglese "objects") è un insieme di oggetti, non meglio specificati. Considerate un oggetto come un corpo imperscrutabile, senza proprietà distintive se non la sua identità (ovvero considerati due oggetti sappiamo solo che sono diversi ma non il perchè).
- `Morfismi` ("morphisms") è un insieme di "frecce" che collegano gli oggetti. Tipicamente un morfismo `f` è denotato con `f: A -> B` per rendere chiaro che è una freccia che parte da `A` detta "sorgente" ("source") e arriva a `B` detta "destinazione" ("target").

Mentre gli oggetti non hanno ulteriori proprietà da soddisfare, per i morfismi devono valere alcune condizioni note come "leggi" ("laws")

## Leggi

**Nota**. Non è importante memorizzare le leggi da subito ma lo sarà poco più avanti, quindi per ora se volete potete saltate questo paragrafo, ci torneremo quando sarà strettamente necessario.

### Prima legge: morfismi identità

Per ogni oggetto `X` deve esistere un morfismo `idX` (chiamato "morfismo identità per X") tale che `idX: X -> X`

### Seconda legge: composizione di morfismi

Deve esistere una operazione, indichiamola con il simbolo `.`, detta "composizione" tale che per ogni coppia di morfismi `f: B -> C` e `g: A -> B` associa un terzo morfismo `f . g: A -> C`. Inoltre l'operazione `.` di composizione deve soddisfare le seguenti proprietà:

- (*associatività*) se `f: A -> B`, `g: B -> C` e `h: C -> D`, allora `h . (g . f) = (h . g) . f`
- (*identità*) per ogni morfismo `f: A -> B` vale `idB . f = f = f . idA` (ove `idB` e `idA` sono rispettivamente morfismi identità di `A` e `B`)

*Esempio di categoria*

![esempio di categoria](https://upload.wikimedia.org/wikipedia/commons/f/ff/Category_SVG.svg)

