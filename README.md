# Introduzione alla programmazione funzionale

* [Dispense del corso](./fp.pdf) (PDF)
* [Slide del talk "Frecce dritte e frecce storte"](./frecce/frecce.pdf) (PDF)
* [risorse](./risorse.md) (blog, libri, ecc...)
* [librerie](./librerie.md) (TypeScript, Java, Scala, ecc...)

**Nota**. Se volete aggiungere voci a "risorse" e/o "liberie", le PR sono ben accette.

# Come eseguire le demo

**Prerequisiti**. node e npm installati sulla macchina.

```sh
# installa globalmente ts-node e il compilatore di typescript
npm install -g typescript ts-node

git clone https://github.com/gcanti/functional-programming.git
cd functional-programming
npm install
```

Per lanciare la demo contenuta, per esempio, nel file `src/combinator.ts` eseguire il comando

```sh
ts-node src/combinator.ts
```
