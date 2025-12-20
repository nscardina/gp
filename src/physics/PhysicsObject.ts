import type HitboxShape from "./HitboxShape";

export default class PhysicsObject {

    #hitbox: HitboxShape

    #velocity: number

    #maximumVelocity: number
    
    #minimumVelocity: number

    #angle: number

    constructor(hitbox: HitboxShape, maximumVelocity: number, minimumVelocity?: number) {
        this.#hitbox = hitbox
        this.#velocity = 0
        this.#maximumVelocity = maximumVelocity
        this.#minimumVelocity = minimumVelocity ?? -maximumVelocity
        this.#angle = 0
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

    get angle(): number {
        return this.#angle
    }

    set angle(angle: number) {
        this.#angle = angle
    }

    update() {
        this.#hitbox.translate(
            this.#velocity * Math.cos(this.#angle),
            this.#velocity * Math.sin(this.#angle)
        )
    }

}