import type HitboxShape from "../physics/HitboxShape"
import Circle from "./Circle"
import { PointInsideCircle, PointInsidePolygon } from "./IntersectionAlgorithms"
import Polygon from "./Polygon"

export default class Point implements HitboxShape {
    #x: number
    #y: number

    constructor(x?: number, y?: number) {
        this.#x = x ?? 0
        this.#y = y ?? 0
    }

    get x(): number {
        return this.#x
    }

    set x(x: number) {
        this.#x = x
    }

    get y(): number {
        return this.#y
    }

    set y(y: number) {
        this.#y = y
    }

    distTo(point: Point) {
        return Math.sqrt(Math.pow(this.#x - point.#x, 2) + Math.pow(this.#y - point.#y, 2))
    }

    getCenter(): Point {
        return this
    }

    translate(deltaX: number, deltaY: number): void {
        this.#x += deltaX
        this.#y += deltaY
    }

    collidesWith(shape: HitboxShape): boolean {
        if (shape instanceof Point) {
            return this.#x === shape.#x && this.#y === shape.#y
        }

        if (shape instanceof Circle) {
            return PointInsideCircle(this, shape)
        }

        if (shape instanceof Polygon) {
            return PointInsidePolygon(this, shape)
        }

        throw `Error: Unable to calculate whether point collides with ${shape}`
    }

    toString() {
        return `Point[x: ${this.#x}, y: ${this.#y}]`
    }
}