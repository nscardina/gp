import { Green, Magenta, setDebug, White } from "../Debug";
import { normalizeNegativePositivePi } from "../geometry/Angles";
import Circle from "../geometry/Circle";
import Point from "../geometry/Point";
import type { KeybindMap, KeyPressedMap } from "../keybind/Keyboard";
import { getNextAIPathMarker, type AIPathMarker } from "../level/AIPathMarker";
import type Checkpoint from "../level/Checkpoint";
import { CollisionArea, CollisionEffect } from "../level/Collision";
import { IPCRespawnStartMessage } from "../multithreading/IPC";
import { loadImage } from "../util/Load";
import { getBlueCarStats, getGreenCarStats, getPurpleCarStats, getRedCarStats, type CarStats } from "./CarStats";
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

/**
 * Cars will accelerate, by default, by 0.7 pixels/sec^2. 
 */
const CAR_ACCEL_PER_SEC = 0.7

/**
 * Cars will decelerate, by default, by 0.7 pixels/sec^2.
 */
const CAR_PASSIVE_DECEL_PER_SEC = 0.7

/**
 * Cars will have the default angular acceleration of 0.135 radians/sec^2.
 */
const CAR_ANG_ACCEL_PER_SEC = 0.135



export enum CarImagePath {
    RED = "/car/red_car.png",
    GREEN = "/car/green_car.png",
    BLUE = "/car/blue_car.png",
    PURPLE = "/car/purple_car.png"
}

export default class Car extends PhysicsObject {

    /**
     * Name of this car.
     */
    #name: string

    #imagePath: CarImagePath

    /**
     * This car's stats.
     */
    #stats: CarStats

    /**
     * Current camera angle of this car (only used if the car is controlled
     * by the player).
     */
    #cameraAngle: number

    /**
     * Maximum angle by which the camera angle of the car (that is, the angle
     * that the car's sprite is facing) may differ from the direction that the 
     * car is traveling (this.angle).
     */
    #maxCameraAngleOffset: number

    /**
     * Car's sprite. May be null until the image has loaded.
     */
    #image: ImageBitmap | null = null

    /**
     * Current AIPathMarker that this car is traveling towards. Only used in 
     * AI-controlled cars.
     */
    #currentAIPathMarker: AIPathMarker | null

    /**
     * Current lap number that this car is on.
     */
    #currentLap: number

    /**
     * Car's current checkpoint.
     */
    #currentCheckpoint: Checkpoint
    
    /**
     * Whether this car is currently respawning.
     */
    #isRespawning: boolean

    /**
     * What place this car is currently in.
     */
    #currentPlace: number

    /**
     * Constructs a new Car object.
     * @param name text name of the car. Used in the results screen and debug menus.
     * @param color color of the car (red, green, blue, or purple).
     * @param stats stats for this car.
     * @param initialRespawnPoint point at which this car should respawn when it is first loaded into the course.
     * @param initialRespawnAngle point at which this car should face when it respawns, when it is 
     * first loaded into the course.
     * @param xPos x-position of the car, when it first loads into the course. 
     * Zero will be used if this isn't passed.
     * @param yPos y-position of the car, when it first loads into the course.
     * Zero will be used if this isn't passed.
     * @param angle angle that the car will face when it first loads into the course.
     * Zero will be used if this isn't passed.
     */
    constructor(
        name: string,
        color: CarImagePath, 
        stats: CarStats,
        initialCheckpoint: Checkpoint,
        xPos?: number, 
        yPos?: number, 
        angle?: number
    ) {
        super(new Circle(new Point(xPos ?? 0, yPos ?? 0), 6), 0.5, 0.0015, 5)

        this.#name = name
        this.#stats = stats
        this.#imagePath = color


        if (angle !== undefined) {
            this.angle = angle
        }
        this.#cameraAngle = this.angle
        this.#maxCameraAngleOffset = 0
        this.#currentAIPathMarker = null

        this.#currentCheckpoint = initialCheckpoint
        this.#currentLap = 1

        this.#isRespawning = false

        this.#currentPlace = -1

        loadImage(color).then(image => this.#image = image)
    }

    get imagePath(): CarImagePath {
        return this.#imagePath
    }

    get name(): string {
        return this.#name
    }

    set name(name: string) {
        this.#name = name
    }

    get currentPlace(): number {
        return this.#currentPlace
    }

    set currentPlace(place: number) {
        this.#currentPlace = place
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

    get currentAIPathMarker(): AIPathMarker | null {
        return this.#currentAIPathMarker
    }

    set currentAIPathMarker(marker: AIPathMarker | null) {
        this.#currentAIPathMarker = marker
    }

    get currentCheckpoint(): Checkpoint {
        return this.#currentCheckpoint
    }

    set currentCheckpoint(checkpoint: Checkpoint) {
        this.#currentCheckpoint = checkpoint
    }

    get currentLapNumber(): number {
        return this.#currentLap
    }

    set currentLapNumber(lap: number) {
        this.#currentLap = lap
    }

    aiCarUpdate(
        deltaTime: number,
        collision: CollisionArea[],
        aiPathMarkers: AIPathMarker[],
        physicsObjects: PhysicsObject[],
        checkpoints: Checkpoint[]
    ) {

        let maxSpeedModifier: number = 1.0
        let turningRadiusModifier: number = 1.0

        for (const collisionArea of this.#collisionsOccurring(collision)) {
            maxSpeedModifier = calculateMaxSpeedModifier(maxSpeedModifier, collisionArea)
            turningRadiusModifier = calculateTurningRadiusModifier(turningRadiusModifier, collisionArea)

            if (collisionArea.effect === CollisionEffect.OUT_OF_BOUNDS) {
                this.#respawn(false)
            }
        }

        for (const obj of physicsObjects.filter(o => o !== this && this.hitbox.collidesWith(o.hitbox))) {
            this.collide(obj)
        }

        this.#handleLinearAcceleration(deltaTime, (this.#isRespawning) ? false : "forwards")
        

        // TODO add code to determine the lap completion percentage from the checkpoints of the current ai path marker and
        // if the ai car is further along in the lap completion than the marker is, then move to the next path marker as well 
        // (in case it misses the path marker for some reason)
        

        if (this.#currentAIPathMarker !== null) {
            // has car reached the path marker it's going to?
            if (this.hitbox.collidesWith(this.#currentAIPathMarker.point)) {
                // pick the next one to drive to
                this.#currentAIPathMarker = getNextAIPathMarker(this.#currentAIPathMarker, aiPathMarkers)
            }

            const targetAngle = Math.atan2(
                this.#currentAIPathMarker.point.y - this.hitbox.getCenter().y, 
                this.#currentAIPathMarker.point.x - this.hitbox.getCenter().x
            )

            const difference = normalizeNegativePositivePi(targetAngle - this.angle)
            if (difference > 0) {
                this.angularVelocity += 0.00075 * turningRadiusModifier
            } else {
                this.angularVelocity -= 0.00075 * turningRadiusModifier
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

        this.#updateLapCompletion(checkpoints)

        super.update(deltaTime)

    }

    carUpdate(
        deltaTime: number,
        keybindMap: KeybindMap, 
        keyPressedMap: KeyPressedMap,
        collision: CollisionArea[],
        physicsObjects: PhysicsObject[],
        checkpoints: Checkpoint[]
    ) {

        let shake: boolean = false
        let maxSpeedModifier: number = 1.0
        let turningRadiusModifier: number = 1.0
        let maxCameraAngleOffset: number = 0.0

        // Track object interactions
        for (const collisionArea of this.#collisionsOccurring(collision)) {
            maxSpeedModifier = calculateMaxSpeedModifier(maxSpeedModifier, collisionArea)
            turningRadiusModifier = calculateTurningRadiusModifier(turningRadiusModifier, collisionArea)

            switch (collisionArea.effect) {
                case CollisionEffect.LIGHT_OFFROAD:
                    shake = true
                    maxCameraAngleOffset = Math.max(maxCameraAngleOffset, LIGHT_CAMERA_ANGLE_OFFSET)
                    break

                case CollisionEffect.MEDIUM_OFFROAD:
                    shake = true
                    maxCameraAngleOffset = Math.max(maxCameraAngleOffset, MEDIUM_CAMERA_ANGLE_OFFSET)
                    break

                case CollisionEffect.HEAVY_OFFROAD:
                    shake = true
                    maxCameraAngleOffset = Math.max(maxCameraAngleOffset, HEAVY_CAMERA_ANGLE_OFFSET)
                    break

                case CollisionEffect.CAMERA_SHAKE:
                    shake = true
                    break

                case CollisionEffect.OUT_OF_BOUNDS:
                    this.#respawn(true)
                    break
                    
            }
            
        }
        if (this.#isRespawning) {
            shake = false
        }

        for (const obj of physicsObjects.filter(o => o !== this && this.hitbox.collidesWith(o.hitbox))) {
            this.collide(obj)
        }
        this.#maxCameraAngleOffset = maxCameraAngleOffset

        
        
        const accel = keyPressedMap.get(keybindMap.get("ACCELERATE")!)
        const decel = keyPressedMap.get(keybindMap.get("DECELERATE")!)
        const left = keyPressedMap.get(keybindMap.get("LEFT")!)
        const right = keyPressedMap.get(keybindMap.get("RIGHT")!)
        

        if (this.#maxCameraAngleOffset === 0 || (!left && !right)) {
            this.#cameraAngle -= (this.#cameraAngle - this.angle) * 0.02
        }
        
        if (!this.#isRespawning &&(accel !== decel)) {
            this.#handleLinearAcceleration(deltaTime, accel ? "forwards" : "backwards")
        } else {
            this.#handleLinearAcceleration(deltaTime, false)
        }

        if (left && !this.#isRespawning) {
            this.angularVelocity -= 0.00075 * turningRadiusModifier
            this.cameraAngle += 0.02 * maxCameraAngleOffset
        }

        if (right && !this.#isRespawning) {
            this.angularVelocity += 0.00075 * turningRadiusModifier
            this.cameraAngle -= 0.02 * maxCameraAngleOffset
        }

        if ((!left && !right) || this.#isRespawning) {
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

        this.#updateLapCompletion(checkpoints)

        super.update(deltaTime)

        return {
            shake: shake
        }
    }

    /**
     * Handles the linear acceleration of the car. 
     * @param deltaTime the amount of time that passed since the previous frame.
     * @param holdingGas if the car's gas pedal is being held (by the player or AI).
     */
    #handleLinearAcceleration(deltaTime: number, holdingGasPedal: "forwards" | "backwards" | false) {

        // If the car is accelerating forwards, increase its speed
        if (!this.#isRespawning && holdingGasPedal) {

            if (holdingGasPedal === "forwards") {
                // Normal forward acceleration
                this.velocity += deltaTime / 1000 * CAR_ACCEL_PER_SEC * this.#stats.acceleration
            } else {
                // Car is reversing - accelerates backwards at 1/4 the normal speed
                this.velocity -= deltaTime / 1000 * CAR_ACCEL_PER_SEC * this.#stats.acceleration / 4
            }
            
        } else {

            // Car is not accelerating at all or is respawning - slowly lose speed
            const lossAmt = deltaTime / 1000 * CAR_PASSIVE_DECEL_PER_SEC
            if (this.velocity > lossAmt) {
                this.velocity -= lossAmt
            } else if (this.velocity < -lossAmt) {
                this.velocity += lossAmt
            } else {
                this.velocity = 0
            }

        }
    }

    /**
     * Causes the car to respawn. The car will not be able to accelerate or 
     * steer while respawning. The respawn will drop the car at the current 
     * respawn point facing the current respawn angle.
     */
    #respawn(isPlayer: boolean) {
        if (!this.#isRespawning) {
            this.#isRespawning = true
            if (isPlayer) {
                postMessage({type: IPCRespawnStartMessage})
            }

            setTimeout(() => {
                this.#isRespawning = false

                this.velocity = 0
                this.angularVelocity = 0

                this.angle = this.#currentCheckpoint.respawnAngle
                this.#cameraAngle = this.angle
                this.hitbox.getCenter().x = this.#currentCheckpoint.respawnPoint.x
                this.hitbox.getCenter().y = this.#currentCheckpoint.respawnPoint.y
            }, 1000)
        }
    }

    #updateLapCompletion(checkpoints: Checkpoint[]) {

        // Highest checkpoint ID in the level.
        const lastCheckpointId = Math.max(...checkpoints.map(c => c.id))

        for (const checkpoint of checkpoints.filter(c => this.hitbox.getCenter().collidesWith(c.hitbox))) {
            if (this.#currentCheckpoint.id + 1 === checkpoint.id) {
                this.#currentCheckpoint = checkpoint
                return
            } else if (this.#currentCheckpoint.id === lastCheckpointId && checkpoint.id === 0) {
                // Assume there is only one checkpoint 0 in the level, at the finish line.
                this.#currentCheckpoint = checkpoints.filter(c => c.id === 0)[0]
                this.#currentLap++
                return
            }
        }
    }

    #collisionsOccurring(allAreas: CollisionArea[]): CollisionArea[] {
        return allAreas.filter(area => this.hitbox.getCenter().collidesWith(area.shape))
    }

    debugText(): string {
        return `${Magenta("Car")}${White("[x:")}${
            Green(this.hitbox.getCenter().x.toFixed(0))
        }${White(" y:")}${
            Green(this.hitbox.getCenter().y.toFixed(0))
        }${White(" v:")}${
            Green(this.velocity.toFixed(2))
        }${White(" a:")}${
            Green(this.angle.toFixed(2))
        }${White(" cp:")}${
            Green(String(this.#currentCheckpoint.id))
        }${
            (this.#currentAIPathMarker === null) ? "" : White(" m: ") + Green(String(this.#currentAIPathMarker.number))
        }${White("]")}`
    }

}

const calculateMaxSpeedModifier = (currentModifier: number, collisionArea: CollisionArea): number => {
    let newModifier = 1.0
    switch (collisionArea.effect) {
        case CollisionEffect.LIGHT_OFFROAD:
            newModifier = LIGHT_OFFROAD_SPEED_MODIFIER
            break
        case CollisionEffect.MEDIUM_OFFROAD:
            newModifier = MEDIUM_OFFROAD_SPEED_MODIFIER
            break
        case CollisionEffect.HEAVY_OFFROAD:
            newModifier = HEAVY_OFFROAD_SPEED_MODIFIER
            break
    }
    return Math.min(currentModifier, newModifier)
}

const calculateTurningRadiusModifier = (currentModifier: number, collisionArea: CollisionArea): number => {
    let newModifier: number = 1.0
    switch (collisionArea.effect) {
        case CollisionEffect.LIGHT_OFFROAD:
            newModifier = LIGHT_TURNING_RADIUS_MODIFIER
            break
        case CollisionEffect.MEDIUM_OFFROAD:
            newModifier = MEDIUM_TURNING_RADIUS_MODIFIER
            break
        case CollisionEffect.HEAVY_OFFROAD:
            newModifier = HEAVY_TURNING_RADIUS_MODIFIER
    }
    return Math.min(currentModifier, newModifier)
}

export const getName = (path: CarImagePath): string => {
    switch (path) {
        case CarImagePath.RED:
            return "Red"
        case CarImagePath.GREEN:
            return "Green"
        case CarImagePath.BLUE:
            return "Blue"
        case CarImagePath.PURPLE:
            return "Purple"
    }
}

export const getStats = (path: CarImagePath): CarStats => {
    switch (path) {
        case CarImagePath.RED:
            return getRedCarStats()
        case CarImagePath.GREEN:
            return getGreenCarStats()
        case CarImagePath.BLUE:
            return getBlueCarStats()
        case CarImagePath.PURPLE:
            return getPurpleCarStats()
    }
}