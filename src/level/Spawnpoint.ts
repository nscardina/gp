import { isPointJSONData, type PointJSONData } from "../geometry/Point";
import Point from "../geometry/Point";

export type SpawnpointJSONData = {
    location: PointJSONData,
    id: number,
    spawnAngle: number
}

export const isSpawnpointJSONData = (object: unknown): object is SpawnpointJSONData => (
    typeof(object) === "object"
    && object !== null
    && "location" in object
    && isPointJSONData(object.location)
    && "id" in object
    && typeof(object.id) === "number"
    && "spawnAngle" in object
    && typeof(object.spawnAngle) === "number"
)

export class Spawnpoint {

    #location: Point

    #id: number

    #spawnAngle: number

    constructor(point: Point, id: number, spawnAngle: number) {
        this.#location = point
        this.#id = id
        this.#spawnAngle = spawnAngle
    }

    get location(): Point {
        return this.#location
    }

    set location(location: Point) {
        this.#location = location
    }

    get id(): number {
        return this.#id
    }

    set id(id: number) {
        this.#id = id
    }

    get spawnAngle(): number {
        return this.#spawnAngle
    }

    set spawnAngle(spawnAngle: number) {
        this.#spawnAngle = spawnAngle
    }

    static deserialize(json: unknown): Spawnpoint {
        if (isSpawnpointJSONData(json)) {
            return new Spawnpoint(Point.deserialize(json.location), json.id, json.spawnAngle)
        }

        throw new Error(`Unable to deserialize ${json} to Spawnpoint`)
    }

}