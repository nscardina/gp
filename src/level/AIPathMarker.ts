import type { Color } from "../geometry/Color";
import { isPointJSONData, type PointJSONData } from "../geometry/Point";
import Point from "../geometry/Point";

export const getAIPathMarkerDebugColor = (marker: AIPathMarker): Color => {
    if (marker.lockedPath !== null) {
        if (marker.lockedPath.endPath) {
            return { red: 255, green: 0, blue: 255, alpha: 0.7 }
        } else {
            return { red: 128, green: 128, blue: 255, alpha: 0.7 }
        }
    }
    
    return { red: 255, green: 255, blue: 255, alpha: 0.7 }


}

export type AIPathMarkerJSONData = {
    point: PointJSONData,
    number: number,
    lockedPath: AILockedPathJSONData | null
}

export const isAIPathMarkerJSONData = (json: unknown): json is AIPathMarkerJSONData => (
    typeof(json) === "object"
    && json !== null
    && "point" in json
    && isPointJSONData(json.point)
    && "number" in json
    && typeof(json.number) === "number"
    && "lockedPath" in json
    && (json.lockedPath === null || isAILockedPathJSONData(json.lockedPath))
)

export type AILockedPathJSONData = {
    pathNum: number,
    endPath: boolean
}

export const isAILockedPathJSONData = (json: unknown): json is AILockedPathJSONData => (
    typeof(json) === "object"
    && json !== null
    && "pathNum" in json
    && typeof(json.pathNum) === "number"
    && "endPath" in json
    && typeof(json.endPath) === "boolean"
)

export class AIPathMarker {

    #point: Point

    #number: number

    #lockedPath: AILockedPathJSONData | null

    constructor(point: Point, number: number, lockedPath: AILockedPathJSONData | null) {
        this.#point = point
        this.#number = number
        this.#lockedPath = lockedPath
    }

    get point(): Point {
        return this.#point
    }

    set point(point: Point) {
        this.#point = point
    }

    get number(): number {
        return this.#number
    }

    set number(number: number) {
        this.#number = number
    }

    get lockedPath(): AILockedPathJSONData | null {
        return this.#lockedPath
    }

    set lockedPath(lockedPath: AILockedPathJSONData | null) {
        this.#lockedPath = lockedPath
    }

    static deserialize(json: unknown): AIPathMarker {
        if (isAIPathMarkerJSONData(json)) {
            return new AIPathMarker(
                Point.deserialize(json.point), json.number, json.lockedPath
            )
        } else {
            throw new Error(`Unable to deserialize ${json} to AIPathMarker`)
        }
    }

}

export const getNextAIPathMarker = (current: AIPathMarker, all: AIPathMarker[]): AIPathMarker => {
    if (current.lockedPath === null || current.lockedPath.endPath) {
        const nextCandidates = all.filter(m => m.number === current.number + 1)
        if (nextCandidates.length === 0) {
            // If there are no more markers with higher numbers, go back to the 0 marker (start line)
            const zeroMarker = all.filter(m => m.number === 0)
            return zeroMarker[0]
        } else {
            // if there are multiple markers with one higher number, randomly choose one
            const indexToChoose = (Math.random() * nextCandidates.length) | 0
            return nextCandidates[indexToChoose]
        }
    } else {
        // follow the locked path
        const nextCandidates = all.filter(m => m.number === current.number + 1 && m.lockedPath?.pathNum === current.lockedPath?.pathNum)
        // should be only 1 of these
        return nextCandidates[0]
    }
}