import { setDebug } from "../Debug";
import Circle from "../geometry/Circle";
import Point from "../geometry/Point";
import type { KeybindMap, KeyPressedMap } from "../keybind/Keyboard";
import { CollisionEffect, type CollisionArea } from "../level/Collision";
import { loadImage } from "../util/LoadImage";
import PhysicsObject from "./PhysicsObject";

const LIGHT_OFFROAD_SPEED_MODIFIER = 0.7
const LIGHT_TURNING_RADIUS_MODIFIER = 0.8
const LIGHT_CAMERA_ANGLE_OFFSET = 0.1

const MEDIUM_OFFROAD_SPEED_MODIFIER = 0.4
const MEDIUM_TURNING_RADIUS_MODIFIER = 0.7
const MEDIUM_CAMERA_ANGLE_OFFSET = 0.3

const HEAVY_OFFROAD_SPEED_MODIFIER = 0.2
const HEAVY_TURNING_RADIUS_MODIFIER = 0.6
const HEAVY_CAMERA_ANGLE_OFFSET = 0.1

export enum CarImagePath {
    RED = "/car/red_car.png",
    GREEN = "/car/green_car.png",
    BLUE = "/car/blue_car.png",
    PURPLE = "/car/purple_car.png"
}

export default class Car extends PhysicsObject {

    #cameraAngle: number

    #cameraAngleVelocity: number

    #maxCameraAngleOffset: number

    #image: ImageBitmap | null = null

    constructor(color: CarImagePath) {
        super(new Circle(new Point(100, 100), 6), 0.5, 0.0015)
        this.#cameraAngle = this.angle
        this.#maxCameraAngleOffset = 0
        this.#cameraAngleVelocity = 0
        loadImage(color).then(image => this.#image = image)
    }

    get image(): ImageBitmap | null {
        return this.#image
    }

    set image(image: ImageBitmap | null) {
        this.#image = image
    }

    get cameraAngle(): number {
        return this.#cameraAngle
    }

    set cameraAngle(cameraAngle: number) {
        if (cameraAngle > this.#cameraAngle) {
            if (cameraAngle <= this.angle + this.#maxCameraAngleOffset) {
                this.#cameraAngle = cameraAngle
            } else if (this.#maxCameraAngleOffset === 0) {
                this.#cameraAngle = cameraAngle
            } else {
                this.#cameraAngle = this.angle + this.#maxCameraAngleOffset
            }
        }

        if (cameraAngle < this.#cameraAngle) {
            if (cameraAngle >= this.angle - this.#maxCameraAngleOffset) {
                this.#cameraAngle = cameraAngle
            } else if (this.#maxCameraAngleOffset === 0) {
                this.#cameraAngle = cameraAngle
            } else {
                this.#cameraAngle = this.angle - this.#maxCameraAngleOffset
            }
        }
    }

    get maxCameraAngleOffset(): number {
        return this.#maxCameraAngleOffset
    }

    set maxCameraAngleOffset(maxCameraAngleOffset: number) {
        this.#maxCameraAngleOffset = maxCameraAngleOffset
    }

    carUpdate(
        deltaTime: number,
        keybindMap: KeybindMap, 
        keyPressedMap: KeyPressedMap,
        collision: CollisionArea[]
    ) {

        let shake: boolean = false
        let maxSpeedModifier: number = 1.0
        let turningRadiusModifier: number = 1.0
        let maxCameraAngleOffset: number = 0.0

        // Track object interactions
        for (const collisionArea of collision) {
            if (this.hitbox.getCenter().collidesWith(collisionArea.shape)) {
                switch (collisionArea.effect) {
                    case CollisionEffect.LIGHT_OFFROAD:
                        shake = true
                        maxSpeedModifier = Math.min(maxSpeedModifier, LIGHT_OFFROAD_SPEED_MODIFIER)
                        turningRadiusModifier = Math.min(turningRadiusModifier, LIGHT_TURNING_RADIUS_MODIFIER)
                        maxCameraAngleOffset = Math.max(maxCameraAngleOffset, LIGHT_CAMERA_ANGLE_OFFSET)
                        break

                    case CollisionEffect.MEDIUM_OFFROAD:
                        shake = true
                        maxSpeedModifier = Math.min(maxSpeedModifier, MEDIUM_OFFROAD_SPEED_MODIFIER)
                        turningRadiusModifier = Math.min(turningRadiusModifier, MEDIUM_TURNING_RADIUS_MODIFIER)
                        maxCameraAngleOffset = Math.max(maxCameraAngleOffset, MEDIUM_CAMERA_ANGLE_OFFSET)
                        break

                    case CollisionEffect.HEAVY_OFFROAD:
                        shake = true
                        maxSpeedModifier = Math.min(maxSpeedModifier, HEAVY_OFFROAD_SPEED_MODIFIER)
                        turningRadiusModifier = Math.min(turningRadiusModifier, HEAVY_TURNING_RADIUS_MODIFIER)
                        maxCameraAngleOffset = Math.max(maxCameraAngleOffset, HEAVY_CAMERA_ANGLE_OFFSET)
                        break

                    case CollisionEffect.CAMERA_SHAKE:
                        shake = true
                        break
                }
            }
        }
        this.#maxCameraAngleOffset = maxCameraAngleOffset

        
        
        const accel = keyPressedMap.get(keybindMap.get("ACCELERATE")!)
        const decel = keyPressedMap.get(keybindMap.get("DECELERATE")!)
        const left = keyPressedMap.get(keybindMap.get("LEFT")!)
        const right = keyPressedMap.get(keybindMap.get("RIGHT")!)
        const debugOn = keyPressedMap.get(keybindMap.get("DEBUG_ACTIVATE")!)
        const debugOff = keyPressedMap.get(keybindMap.get("DEBUG_DEACTIVATE")!)

        if (debugOn) {
            setDebug(true)
        }
        if (debugOff) {
            setDebug(false)
        }

        if (this.#maxCameraAngleOffset === 0 || (!left && !right)) {
            this.#cameraAngle -= (this.#cameraAngle - this.angle) * 0.02
        }

        if (accel) {
            this.velocity += 0.005
        }

        if (decel) {
            this.velocity -= 0.005
        }

        if (!accel && !decel) {
            if (this.velocity > 0.005) {
                this.velocity -= 0.005
            } else if (this.velocity < -0.005) {
                this.velocity += 0.005
            } else {
                this.velocity = 0
            }
        }

        if (left) {
            this.angularVelocity -= 0.00075 * turningRadiusModifier
            // this.cameraAngle -= 0.0075 * turningRadiusModifier - 0.02 * maxCameraAngleOffset
            this.cameraAngle += 0.02 * maxCameraAngleOffset
        }

        if (right) {
            this.angularVelocity += 0.00075 * turningRadiusModifier
            // this.cameraAngle += 0.0075 * turningRadiusModifier - 0.02 * maxCameraAngleOffset
            this.cameraAngle -= 0.02 * maxCameraAngleOffset
        }

        if (!left && !right) {
            if (this.angularVelocity > 0.005) {
                this.angularVelocity -= 0.005
            } else if (this.angularVelocity < -0.005) {
                this.angularVelocity += 0.005
            } else {
                this.angularVelocity = 0
            }
        }

        if (
            this.velocity > this.maximumVelocity * maxSpeedModifier
            || this.velocity < this.minimumVelocity * maxSpeedModifier
        ) {
            this.velocity *= 0.95
        }

        if (
            this.angularVelocity > this.maximumAngularVelocity * turningRadiusModifier
            || this.angularVelocity < this.minimumAngularVelocity * turningRadiusModifier
        ) {
            this.angularVelocity *= 0.95
        }

        // update angle / camera angle
        this.angle += this.angularVelocity * deltaTime
        this.cameraAngle += this.angularVelocity * deltaTime

        super.update(deltaTime)

        return {
            shake: shake
        }
    }

    debugText(): string {
        return `Car[x:${this.hitbox.getCenter().x.toFixed(0)} y:${this.hitbox.getCenter().y.toFixed(0)} v:${this.velocity.toFixed(2)} a:${this.angle.toFixed(2)}]`
    }

}