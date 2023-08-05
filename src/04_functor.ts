// 改编自 https://adrian-salajan.github.io/blog/2021/01/25/images-functor
// 执行`npm run functor`启动

import { Endomorphism } from 'fp-ts/Endomorphism';
import * as R from 'fp-ts/Reader';

// -------------------------------------------------------------------------------------
// 模型
// -------------------------------------------------------------------------------------

type Color = {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
};

type Point = {
  readonly x: number;
  readonly y: number;
};

type Image<A> = R.Reader<Point, A>;

// -------------------------------------------------------------------------------------
// 构造函数
// -------------------------------------------------------------------------------------

const color = (red: number, green: number, blue: number): Color => ({
  red,
  green,
  blue,
});

const BLACK: Color = color(0, 0, 0);

const WHITE: Color = color(255, 255, 255);

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

// 亮度
const brightness = (color: Color): number =>
  (color.red + color.green + color.blue) / 3;

// 灰度
export const grayscale = (c: Color): Color => {
  const n = brightness(c);
  return color(n, n, n);
};

export const invert = (c: Color): Color =>
  color(255 - c.red, 255 - c.green, 255 - c.red);

// 如果亮度超过某个值 V，则放置白色，否则放置黑色
export const threshold = (c: Color): Color =>
  brightness(c) < 100 ? BLACK : WHITE;

// -------------------------------------------------------------------------------------
// main
// -------------------------------------------------------------------------------------

// 必须通过传给`main`一个`Endomorphism<Image<RGB>>`转换函数来调用它
main(R.map((c: Color) => c));
// main(R.map(grayscale))
// main(R.map(invert))
// main(R.map(threshold))

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

function main(f: Endomorphism<Image<Color>>) {
  const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
  const ctx = canvas.getContext('2d')!;
  const bird = document.querySelector<HTMLImageElement>('#bird')!;
  bird.onload = function () {
    console.log('hello');
    function getImage(imageData: ImageData): Image<Color> {
      const data = imageData.data;
      return (loc) => {
        const pos = loc.x * 4 + loc.y * 632 * 4;
        return color(data[pos], data[pos + 1], data[pos + 2]);
      };
    }

    function setImage(imageData: ImageData, image: Image<Color>): void {
      const data = imageData.data;
      for (let x = 0; x < 632; x++) {
        for (let y = 0; y < 421; y++) {
          const pos = x * 4 + y * 632 * 4;
          const { red, green, blue } = image({ x, y });
          data[pos] = red;
          data[pos + 1] = green;
          data[pos + 2] = blue;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    ctx.drawImage(bird, 0, 0);
    const imageData = ctx.getImageData(0, 0, 632, 421);
    setImage(imageData, f(getImage(imageData)));
  };
}
