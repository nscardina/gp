import type HitboxShape from "../physics/HitboxShape";
import { PointInsideRectangle } from "./IntersectionAlgorithms";
import Point from "./Point";

export type RectangleJSONData = {
    x: number,
    y: number,
    width: number,
    height: number
}

export const isRectangleJSONData = (obj: unknown): obj is RectangleJSONData => (
    typeof(obj) === "object"
    && obj !== null
    && "x" in obj
    && typeof(obj.x) === "number"
    && "y" in obj
    && typeof(obj.y) === "number"
    && "width" in obj
    && typeof(obj.width) === "number"
    && "height" in obj
    && typeof(obj.height) === "number"
)

export default class Rectangle implements HitboxShape {

    #x: number

    #y: number

    #width: number

    #height: number

    constructor(x: number, y: number, width: number, height: number) {
        this.#x = x
        this.#y = y
        this.#width = width
        this.#height = height
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

    get width(): number {
        return this.#width
    }

    set width(width: number) {
        this.#width = width
    }

    get height(): number {
        return this.#height
    }

    set height(height: number) {
        this.#height = height
    }

    getCenter(): Point {
        return new Point(
            this.#x + this.#width / 2,
            this.#y + this.#height / 2
        )
    }

    translate(dx: number, dy: number) {
        this.#x += dx
        this.#y += dy
    }

    collidesWith(shape: HitboxShape): boolean {
        if (shape instanceof Point) {
            return PointInsideRectangle(shape, this)
        }

        throw "Unsupported collision between rectangle and " + shape
    }

    static deserialize(json: unknown) {
        if (isRectangleJSONData(json)) {
            return new Rectangle(json.x, json.y, json.width, json.height)
        }

        throw new Error(`Unable to deserialize ${json} to Rectangle`)
    }

}
