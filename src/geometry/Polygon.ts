import type HitboxShape from "../physics/HitboxShape";
import { PointInsidePolygon } from "./IntersectionAlgorithms";
import Point from "./Point";

export default class Polygon implements HitboxShape {
    #points: Point[]
    #area: number
    #center: Point

    constructor(points: Point[]) {
        this.#points = points
        this.#area = calculateArea(this)
        this.#center = calculateCentroid(this)
    }

    get points(): Point[] {
        return this.#points
    }

    set points(points: Point[]) {
        this.#points = points
        this.#area = calculateArea(this)
        this.#center = calculateCentroid(this)
    }

    get area(): number {
        return this.#area
    }

    set area(area: number) {
        this.#area = area
    }

    getCenter(): Point {
        return this.#center
    }

    translate(deltaX: number, deltaY: number): void {
        for (const point of this.#points) {
            point.translate(deltaX, deltaY)
        }
    }

    collidesWith(shape: HitboxShape): boolean {
        if (shape instanceof Point) {
            return PointInsidePolygon(shape, this)
        }

        else {
            throw `Unimplemented collision: ${shape} with polygon`
        }
    }
}

function calculateArea(polygon: Polygon): number {
    let area = 0
    const points = polygon.points
    let point1: Point
    let point2: Point

    for (let i = 0; i < points.length; i++) {
        point1 = points[i]
        point2 = points[(i + 1) % points.length]

        area += point1.x * point2.y - point2.x * point1.y
    }

    return area / 2
}

function calculateCentroid(polygon: Polygon): Point {
    const term = polygon.area * 2
    const points = polygon.points

    let cx = 0
    let cy = 0
    let point1: Point
    let point2: Point

    for (let i = 0; i < points.length; i++) {
        point1 = points[i]
        point2 = points[(i + 1) % points.length]

        cx += point1.x + point2.x
        cy += point1.y + point2.y
    }

    cx *= term * points.length / (6 * polygon.area)
    cy *= term * points.length / (6 * polygon.area)

    return new Point(cx, cy)
}