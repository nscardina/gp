import Circle from "../geometry/Circle"
import type { Color } from "../geometry/Color"
import Point from "../geometry/Point"
import Polygon from "../geometry/Polygon"
import { isHitboxShapeJSONData, type HitboxShapeJSONData } from "../physics/HitboxShape"
import type HitboxShape from "../physics/HitboxShape"

export type CollisionAreaJSONData = {
    type: CollisionEffect,
    shape: HitboxShapeJSONData
}

export function isCollisionAreaJSONData(object: unknown): object is CollisionAreaJSONData {
    return typeof(object) === "object"
    && object !== null
    && "type" in object
    && isCollisionEffect(object.type)
    && "shape" in object
    && isHitboxShapeJSONData(object.shape)
}

export class CollisionArea {

    #effect: CollisionEffect

    #shape: HitboxShape

    constructor(effect: CollisionEffect, shape: HitboxShape) {
        this.#effect = effect
        this.#shape = shape
    }

    get effect(): CollisionEffect {
        return this.#effect;
    }

    set effect(value: CollisionEffect) {
        this.#effect = value;
    }

    get shape(): HitboxShape {
        return this.#shape;
    }

    set shape(value: HitboxShape) {
        this.#shape = value;
    }

    static deserialize(json: unknown): CollisionArea {
        if (isCollisionAreaJSONData(json)) {
            if (json.shape.type === "point") {
                return new CollisionArea(
                    json.type,
                    Point.deserialize(json.shape)
                )
            }

            if (json.shape.type === "circle") {
                return new CollisionArea(
                    json.type,
                    Circle.deserialize(json.shape)
                )
            }

            if (json.shape.type === "polygon") {
                return new CollisionArea(
                    json.type,
                    Polygon.deserialize(json.shape)
                )
            }
        }

        throw `Unable to deserialize "${json}" to CollisionArea`
    }

}

export enum CollisionEffect {
    LIGHT_OFFROAD = "LIGHT_OFFROAD",
    MEDIUM_OFFROAD = "MEDIUM_OFFROAD",
    HEAVY_OFFROAD = "HEAVY_OFFROAD",
    OUT_OF_BOUNDS = "OUT_OF_BOUNDS",
    CAMERA_SHAKE = "CAMERA_SHAKE",

}

export function isCollisionEffect(value: unknown): value is CollisionEffect {
    return Object.values(CollisionEffect).includes(value as any)
}

export function getCollisionEffectDebugColor(effect: CollisionEffect): Color {
    switch (effect) {
        case "LIGHT_OFFROAD":
            return { red: 153, green: 255, blue: 0, alpha: 1.0 }
        case "MEDIUM_OFFROAD":
            return { red: 21, green: 255, blue: 0, alpha: 1.0 }
        case "HEAVY_OFFROAD":
            return { red: 0, green: 255, blue: 145, alpha: 1.0 }
        case "OUT_OF_BOUNDS":
            return { red: 255, green: 0, blue: 0, alpha: 1.0 }
        case "CAMERA_SHAKE":
            return { red: 144, green: 0, blue: 255, alpha: 1.0 }
        default:
            return { red: 0, green: 0, blue: 0, alpha: 1.0 }
    }
}