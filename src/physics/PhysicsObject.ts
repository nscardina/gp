import Circle from "../geometry/Circle";
import { DESIRED_MS_PER_TICK } from "../multithreading/GameLoop";
import type HitboxShape from "./HitboxShape";
import { physicsCollisionCircleWithCircle } from "./PhysicsCollision";

export default class PhysicsObject {

    #hitbox: HitboxShape

    #velocity: number

    #maximumVelocity: number
    
    #minimumVelocity: number

    #angle: number

    #angularVelocity: number

    #maximumAngularVelocity: number

    #minimumAngularVelocity: number

    #mass: number

    constructor(
        hitbox: HitboxShape, 
        maximumVelocity: number, 
        maximumAngularVelocity: number,
        mass: number,
        minimumVelocity?: number,
        minimumAngularVelocity?: number
    ) {
        this.#hitbox = hitbox
        this.#velocity = 0
        this.#maximumVelocity = maximumVelocity
        this.#minimumVelocity = minimumVelocity ?? -maximumVelocity
        this.#angle = 0
        this.#angularVelocity = 0
        this.#maximumAngularVelocity = maximumAngularVelocity
        this.#minimumAngularVelocity = minimumAngularVelocity ?? -maximumAngularVelocity
        this.#mass = mass
    }

    get hitbox(): HitboxShape {
        return this.#hitbox
    }

    set hitbox(hitbox: HitboxShape) {
        this.#hitbox = hitbox
    }

    get velocity(): number {
        return this.#velocity
    }

    set velocity(velocity: number) {
        this.#velocity = Math.max(Math.min(velocity, this.#maximumVelocity), this.#minimumVelocity)
    }

    get maximumVelocity(): number {
        return this.#maximumVelocity
    }

    set maximumVelocity(maximumVelocity: number) {
        this.#maximumVelocity = maximumVelocity
    }

    get minimumVelocity(): number {
        return this.#minimumVelocity
    }

    set minimumVelocity(minimumVelocity: number) {
        this.#minimumVelocity = minimumVelocity
    }

    get mass(): number {
        return this.#mass
    }

    set mass(mass: number) {
        this.#mass = mass
    }

    get angle(): number {
        return this.#angle
    }

    set angle(angle: number) {
        this.#angle = angle
    }

    get angularVelocity(): number {
        return this.#angularVelocity
    }

    set angularVelocity(angularVelocity: number) {
        this.#angularVelocity = Math.max(Math.min(angularVelocity, this.#maximumAngularVelocity), this.#minimumAngularVelocity)
    }

    get maximumAngularVelocity(): number {
        return this.#maximumAngularVelocity
    }

    set maximumAngularVelocity(maximumAngularVelocity: number) {
        this.#maximumAngularVelocity = maximumAngularVelocity
    }

    get minimumAngularVelocity(): number {
        return this.#minimumAngularVelocity
    }

    set minimumAngularVelocity(minimumAngularVelocity: number) {
        this.#minimumAngularVelocity = minimumAngularVelocity
    }

    update(deltaTime: number) {
        const timeFactor = deltaTime / DESIRED_MS_PER_TICK

        this.#hitbox.translate(
            this.#velocity * Math.cos(this.#angle) * timeFactor,
            this.#velocity * Math.sin(this.#angle) * timeFactor
        )
    }

    collide(other: PhysicsObject) {
        if (this.hitbox instanceof Circle && other.hitbox instanceof Circle) {
            physicsCollisionCircleWithCircle(this, other)
        }
    }

}