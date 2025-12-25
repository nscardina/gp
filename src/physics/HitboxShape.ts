import { isCircleJSONData, type CircleJSONData } from "../geometry/Circle"
import { isPointJSONData, type PointJSONData } from "../geometry/Point"
import type Point from "../geometry/Point"
import { isPolygonJSONData, type PolygonJSONData } from "../geometry/Polygon"

export type HitboxShapeJSONData = 
    ({ type: "point" } & PointJSONData)
    | ({ type: "circle" } & CircleJSONData)
    | ({ type: "polygon" } & PolygonJSONData)

export function isHitboxShapeJSONData(object: unknown): object is HitboxShapeJSONData {
    return typeof(object) === "object"
    && object != null
    && "type" in object
    && (
        (
            object.type === "point"
            && isPointJSONData(object)
        ) || (
            object.type === "circle"
            && isCircleJSONData(object)
        ) || (
            object.type === "polygon"
            && isPolygonJSONData(object)
        )
    )
}

export default interface HitboxShape {
    getCenter(): Point
    translate(deltaX: number, deltaY: number): void
    collidesWith(shape: HitboxShape): boolean
}