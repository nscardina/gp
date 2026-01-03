import Circle, { isCircleJSONData } from "../geometry/Circle"
import { isPointJSONData, type PointJSONData } from "../geometry/Point"
import Point from "../geometry/Point"
import Polygon, { isPolygonJSONData } from "../geometry/Polygon"
import Rectangle, { isRectangleJSONData } from "../geometry/Rectangle"
import { isHitboxShapeJSONData, type HitboxShapeJSONData } from "../physics/HitboxShape"
import type HitboxShape from "../physics/HitboxShape"

export type CheckpointJSONData = {
    id: number,
    respawnPoint: PointJSONData,
    respawnAngle: number,
    hitbox: HitboxShapeJSONData
}

export const isCheckpointJSONData = (json: unknown): json is CheckpointJSONData => (
    typeof(json) === "object"
    && json !== null
    && "id" in json
    && typeof(json.id) === "number"
    && "respawnPoint" in json
    && isPointJSONData(json.respawnPoint)
    && "respawnAngle" in json
    && typeof(json.respawnAngle) === "number"
    && "hitbox" in json
    && isHitboxShapeJSONData(json.hitbox)
)

export default class Checkpoint {

    #id: number

    #respawnPoint: Point

    #respawnAngle: number

    #hitbox: HitboxShape

    constructor(
        id: number,
        respawnPoint: Point,
        respawnAngle: number,
        hitbox: HitboxShape
    ) {
        this.#id = id
        this.#respawnPoint = respawnPoint
        this.#respawnAngle = respawnAngle
        this.#hitbox = hitbox
    }

    get id(): number {
        return this.#id
    }

    set id(id: number) {
        this.#id = id
    }

    get respawnPoint(): Point {
        return this.#respawnPoint
    }

    set respawnPoint(respawnPoint: Point) {
        this.#respawnPoint = respawnPoint
    }

    get respawnAngle(): number {
        return this.#respawnAngle
    }

    set respawnAngle(angle: number) {
        this.#respawnAngle = angle
    }

    get hitbox(): HitboxShape {
        return this.#hitbox
    }

    set hitbox(hitbox: HitboxShape) {
        this.#hitbox = hitbox
    }

    static deserialize(json: unknown) {
        if (isCheckpointJSONData(json)) {
            if (isCircleJSONData(json.hitbox)) {
                return new Checkpoint(
                    json.id, Point.deserialize(json.respawnPoint), 
                    json.respawnAngle, 
                    Circle.deserialize(json.hitbox)
                )
            } 
            if (isRectangleJSONData(json.hitbox)) {
                return new Checkpoint(
                    json.id, Point.deserialize(json.respawnPoint), 
                    json.respawnAngle, 
                    Rectangle.deserialize(json.hitbox)
                )
            }
            if (isPolygonJSONData(json.hitbox)) {
                return new Checkpoint(
                    json.id, Point.deserialize(json.respawnPoint), 
                    json.respawnAngle, 
                    Polygon.deserialize(json.hitbox)
                )
            }
        }

        throw new Error(`Unable to deserialize ${json} to Checkpoint`)
    }

}