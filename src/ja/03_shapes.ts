// `npm run shapes -- ja` を実行してください
// 各デモを実行するには、59、70、84-90、100-106、130 行目をそれぞれアンコメントしてください

/*
  課題： キャンバス上に形状を描画するシステムを考案する
*/
import { pipe } from 'fp-ts/function'
import { Monoid, concatAll } from 'fp-ts/Monoid'

// -------------------------------------------------------------------------------------
// モデル
// -------------------------------------------------------------------------------------

export interface Point {
  readonly x: number
  readonly y: number
}

/**
 * Shape は関数であり、与えられた点が形状に属する場合は `true` を、
 * そうでない場合は `false` を返します。
 */
export type Shape = (point: Point) => boolean

/*

  FFFFFFFFFFFFFFFFFFFFFF
  FFFFFFFFFFFFFFFFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFFFFFFFFFFFFFFFF
  FFFFFFFFFFFFFFFFFFFFFF

       ▧▧▧▧▧▧▧▧
       ▧▧▧▧▧▧▧▧
       ▧▧▧▧▧▧▧▧
       ▧▧▧▧▧▧▧▧

*/

// -------------------------------------------------------------------------------------
// プリセット
// -------------------------------------------------------------------------------------

/**
 * 円状の形状を作る
 */
export const disk = (center: Point, radius: number): Shape => (point) =>
  distance(point, center) <= radius

// ユークリッド距離
const distance = (p1: Point, p2: Point) =>
  Math.sqrt(
    Math.pow(Math.abs(p1.x - p2.x), 2) + Math.pow(Math.abs(p1.y - p2.y), 2)
  )

// pipe(disk({ x: 200, y: 200 }, 100), draw)

// -------------------------------------------------------------------------------------
// コンビネータ
// -------------------------------------------------------------------------------------

/**
 * 形状を受け取り、その補集合的な形状（負の形状）を返す最初のコンビネータを定義できます
 */
export const outside = (s: Shape): Shape => (point) => !s(point)

// pipe(disk({ x: 200, y: 200 }, 100), outside, draw)

// -------------------------------------------------------------------------------------
// インスタンス
// -------------------------------------------------------------------------------------

/**
 * `concat` が2つの `Shape` の結合を表すモノイド
 */
export const MonoidUnion: Monoid<Shape> = {
  concat: (first, second) => (point) => first(point) || second(point),
  empty: () => false
}

// pipe(
//   MonoidUnion.concat(
//     disk({ x: 150, y: 200 }, 100),
//     disk({ x: 250, y: 200 }, 100)
//   ),
//   draw
// )

/**
 * `concat` が2つの`Shape` の共通部分を表すモノイド
 */
const MonoidIntersection: Monoid<Shape> = {
  concat: (first, second) => (point) => first(point) && second(point),
  empty: () => true
}

// pipe(
//   MonoidIntersection.concat(
//     disk({ x: 150, y: 200 }, 100),
//     disk({ x: 250, y: 200 }, 100)
//   ),
//   draw
// )

/**
 * 2つのコンビネータ `outside` および `MonoidIntersection` を利用して、
 * リングを表す `Shape` を作成できます
 */
export const ring = (
  point: Point,
  bigRadius: number,
  smallRadius: number
): Shape =>
  MonoidIntersection.concat(
    disk(point, bigRadius),
    outside(disk(point, smallRadius))
  )

// pipe(ring({ x: 200, y: 200 }, 100, 50), draw)

export const mickeymouse: ReadonlyArray<Shape> = [
  disk({ x: 200, y: 200 }, 100),
  disk({ x: 130, y: 100 }, 60),
  disk({ x: 280, y: 100 }, 60)
]

// pipe(concatAll(MonoidUnion)(mickeymouse), draw)

// -------------------------------------------------------------------------------------
// ユーティリティ
// -------------------------------------------------------------------------------------

export function draw(shape: Shape): void {
  const canvas: HTMLCanvasElement = document.getElementById('canvas') as any
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as any
  const width = canvas.width
  const height = canvas.height
  const imagedata = ctx.createImageData(width, height)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const point: Point = { x, y }
      if (shape(point)) {
        const pixelIndex = (point.y * width + point.x) * 4
        imagedata.data[pixelIndex] = 0
        imagedata.data[pixelIndex + 1] = 0
        imagedata.data[pixelIndex + 2] = 0
        imagedata.data[pixelIndex + 3] = 255
      }
    }
  }
  ctx.putImageData(imagedata, 0, 0)
}
