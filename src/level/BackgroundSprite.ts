export type BackgroundSpriteJSONData = {
    x: number,
    y: number,
    animation: BackgroundSpriteAnimationJSONData | null,
    repeat: BackgroundSpriteRepeatJSONData | null,
    images: string[]
}

export function isBackgroundSpriteJSONData(object: unknown):
object is BackgroundSpriteJSONData {
    return typeof(object) === "object"
    && object !== null
    && "x" in object
    && typeof(object.x) === "number"
    && "y" in object
    && typeof(object.y) === "number"
    && "animation" in object
    && (
        isBackgroundSpriteAnimationJSONData(object.animation)
        || object.animation === null
    )
    && "repeat" in object
    && (
        isBackgroundSpriteRepeatJSONData(object.repeat)
        || object.repeat === null
    )
    && "images" in object
    && Array.isArray(object.images)
    && object.images.every(image => typeof(image) === "string")
}

export type BackgroundSpriteAnimationJSONData = {
    delay: number
}

export function isBackgroundSpriteAnimationJSONData(object: unknown): 
object is BackgroundSpriteAnimationJSONData {
    return typeof(object) === "object"
    && object !== null
    && "delay" in object
    && typeof(object.delay) === "number"
}

export type BackgroundSpriteRepeatJSONData = {
    x: number,
    y: number
}

export function isBackgroundSpriteRepeatJSONData(object: unknown):
object is BackgroundSpriteRepeatJSONData {
    return typeof(object) === "object"
    && object !== null
    && "x" in object
    && typeof(object.x) === "number"
    && "y" in object
    && typeof(object.y) === "number"
}

export default class BackgroundSprite {

    #x: number

    #y: number

    #animated: boolean

    #animationDelay: number

    #currentFrame: number

    #delayWithinFrame: number

    #repeat: boolean

    #repeatX: number

    #repeatY: number

    #images: ImageBitmap[]

    constructor(
        x: number,
        y: number,
        animated: boolean,
        animationDelay: number,
        repeat: boolean,
        repeatX: number,
        repeatY: number,
        images: ImageBitmap[]
    ) {
        this.#x = x
        this.#y = y
        this.#animated = animated
        this.#animationDelay = animationDelay
        this.#repeat = repeat
        this.#repeatX = repeatX
        this.#repeatY = repeatY
        this.#images = images

        this.#currentFrame = 0
        this.#delayWithinFrame = 0
    }

    get x(): number {
        return this.#x
    }

    set x(x: number) {
        this.#x = x
    }

    get y(): number {
        return this.#y
    }

    set y(y: number) {
        this.#y = y
    }

    get animated(): boolean {
        return this.#animated
    }

    set animated(animated: boolean) {
        this.#animated = animated
    }

    get animationDelay(): number {
        return this.#animationDelay;
    }
    set animationDelay(value: number) {
        this.#animationDelay = value;
    }

    get repeat(): boolean {
        return this.#repeat;
    }
    set repeat(value: boolean) {
        this.#repeat = value;
    }

    get repeatX(): number {
        return this.#repeatX;
    }
    set repeatX(value: number) {
        this.#repeatX = value;
    }

    get repeatY(): number {
        return this.#repeatY;
    }
    set repeatY(value: number) {
        this.#repeatY = value;
    }

    get images(): ImageBitmap[] {
        return this.#images;
    }
    set images(value: ImageBitmap[]) {
        this.#images = value;
    }

    get currentImage(): ImageBitmap {
        if (this.#animated) {
            this.#delayWithinFrame = (this.#delayWithinFrame + 1) % this.#animationDelay
            if (this.#delayWithinFrame === 0) {
                this.#currentFrame = (this.#currentFrame + 1) % this.#images.length
            }

            return this.#images[this.#currentFrame]
        }
        
        return this.#images[0]
    }

    static deserialize(json: object, imageMap: Map<string, ImageBitmap>): BackgroundSprite {
        if (
            isBackgroundSpriteJSONData(json) 
            && json.images.every(image => imageMap.has(image))
        ) {
            return new BackgroundSprite(
                json.x,
                json.y,
                json.animation !== null,
                json.animation?.delay ?? 0,
                json.repeat !== null,
                json.repeat?.x ?? 0,
                json.repeat?.y ?? 0,
                json.images.map(imageId => imageMap.get(imageId)!)
            )
        } else {
            throw new Error(`Unable to construct BackgroundSprite from ${JSON.stringify(json)}`)
        }

        
    }
    

}