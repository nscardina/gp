import type HitboxShape from "../physics/HitboxShape"
import { CirclesIntersect, PointInsideCircle } from "./IntersectionAlgorithms"
import Point from "./Point"

export default class Circle implements HitboxShape {

    #center: Point
    
    #radius: number

    constructor(center?: Point, radius?: number) {
        this.#center = center ?? new Point()
        this.#radius = radius ?? 0
    }

    get center(): Point {
        return this.#center
    }

    set center(center: Point) {
        this.#center = center
    }

    getCenter(): Point {
        return this.#center
    }

    get radius(): number {
        return this.#radius
    }

    set radius(radius: number) {
        this.#radius = radius
    }

    translate(deltaX: number, deltaY: number): void {
        this.#center.x += deltaX
        this.#center.y += deltaY
    }

    collidesWith(shape: HitboxShape): boolean {
        if (shape instanceof Point) {
            return PointInsideCircle(shape, this)
        }

        if (shape instanceof Circle) {
            return CirclesIntersect(shape, this)
        }
        
        throw `Unimplemented collision: ${shape} with circle`
    }

    toString() {
        return `Circle[center: ${this.#center}, radius: ${this.#radius}]`
    }

}