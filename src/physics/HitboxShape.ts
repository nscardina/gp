import type Point from "../geometry/Point"

export default interface HitboxShape {
    getCenter(): Point
    translate(deltaX: number, deltaY: number): void
    collidesWith(shape: HitboxShape): boolean
}