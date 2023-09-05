# for-loop

## 問題

```ts
// input
const xs: Array<number> = [1, 2, 3];

// 変換
const double = (n: number): number => n * 2;

// 結果: 各`xs`no要素が倍になる配列が欲しい
const ys: Array<number> = [];
for (let i = 0; i <= xs.length; i++) {
  ys.push(double(xs[i]));
}
```

`for`ループは正しいですか？

## 答え

正しくないです。条件部分の`i <= xs.length`は`i < xs.length`のはずです。
上記のコードですと，`ys`の値は`[ 2, 4, 6 ]`ではなく、`[ 2, 4, 6, NaN ]`となります。
