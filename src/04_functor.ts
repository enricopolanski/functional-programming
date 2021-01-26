// Adapted from https://adrian-salajan.github.io/blog/2021/01/25/images-functor
// run `npm run parcel` to execute

import { Endomorphism } from 'fp-ts/function'

interface Color {
  readonly red: number
  readonly green: number
  readonly blue: number
}

const color = (red: number, green: number, blue: number): Color => ({
  red,
  green,
  blue
})

const BLACK: Color = color(0, 0, 0)

const WHITE: Color = color(255, 255, 255)

interface Loc {
  readonly x: number
  readonly y: number
}

interface Image<A> {
  (loc: Loc): A
}

const map = <A, B>(f: (a: A) => B) => (fa: Image<A>): Image<B> => (loc) =>
  f(fa(loc))

const brightness = (c: Color): number => (c.red + c.green + c.blue) / 3

export const identity: Endomorphism<Color> = (c) => c

// grayscale colors
export const grayscale: Endomorphism<Color> = (c) => {
  const n = brightness(c)
  return color(n, n, n)
}

// invert colors
export const invert: Endomorphism<Color> = (c) =>
  color(255 - c.red, 255 - c.green, 255 - c.red)

// if brightness over some value V then put White else put Black
export const threshold: Endomorphism<Color> = (c) =>
  brightness(c) < 100 ? BLACK : WHITE

function main(f: Endomorphism<Image<Color>>) {
  const canvas: HTMLCanvasElement = document.getElementById('canvas') as any
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as any
  const bird: HTMLImageElement = document.getElementById('bird') as any
  bird.onload = function () {
    function getImage(imageData: ImageData): Image<Color> {
      const data = imageData.data
      return (loc) => {
        const pos = loc.x * 4 + loc.y * 632 * 4
        return color(data[pos], data[pos + 1], data[pos + 2])
      }
    }

    function setImage(imageData: ImageData, image: Image<Color>): void {
      const data = imageData.data
      for (let x = 0; x < 632; x++) {
        for (let y = 0; y < 421; y++) {
          const pos = x * 4 + y * 632 * 4
          const { red, green, blue } = image({ x, y })
          data[pos] = red
          data[pos + 1] = green
          data[pos + 2] = blue
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    ctx.drawImage(bird, 0, 0)
    const imageData = ctx.getImageData(0, 0, 632, 421)
    setImage(imageData, f(getImage(imageData)))
  }
}

main(map(identity))
