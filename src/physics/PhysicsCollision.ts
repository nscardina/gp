import type Circle from "../geometry/Circle"
import type PhysicsObject from "./PhysicsObject"

export const physicsCollisionCircleWithCircle = (o1: PhysicsObject, o2: PhysicsObject) => {
    
    // Calculate angle phi between the centers of the circles
    const c1 = o1.hitbox.getCenter()
    const c2 = o2.hitbox.getCenter()
    const phi = Math.atan2(c2.y - c1.y, c2.x - c1.x)

    // Calculate velocity components along the line between the centers of the circles
    // v1n is o1's velocity component, and v2n is o2's velocity component
    // These are affected by the collision
    const v1n = o1.velocity * Math.cos(o1.angle - phi)
    const v2n = o2.velocity * Math.cos(o2.angle - phi)

    // Calculate velocity components tangential to the line between the centers of 
    // the circles (90 degrees away from it)
    // These are not affected by the collision
    const v1t = o1.velocity * Math.sin(o1.angle - phi)
    const v2t = o2.velocity * Math.sin(o2.angle - phi)

    // Calculate new velocities along the line between the centers of the circles
    const newV1n = (
        (o1.mass - o2.mass) * v1n + 2 * o2.mass * v2n
    ) / (o1.mass + o2.mass)

    const newV2n = (
        (o2.mass - o1.mass) * v2n + 2 * o1.mass * v1n
    ) / (o1.mass + o2.mass)

    // Calculate new overall velocities and angles for the two physics objects
    const newV1 = Math.sqrt(Math.pow(newV1n, 2) + Math.pow(v1t, 2))
    const newV2 = Math.sqrt(Math.pow(newV2n, 2) + Math.pow(v2t, 2))

    // Move objects away from each other immediately
    const dist = Math.sqrt(Math.pow(c2.y - c1.y, 2) + Math.pow(c2.x - c1.x, 2))
    const r1 = (o1.hitbox as Circle).radius - dist/2
    const r2 = (o2.hitbox as Circle).radius - dist/2
    c1.translate(r1 * Math.cos(phi + Math.PI), r1 * Math.sin(phi + Math.PI))
    c2.translate(r2 * Math.cos(phi), r2 * Math.sin(phi))

    o1.velocity = newV1

    o2.velocity = newV2

}