import JSZip from "jszip"
import { loadImageFromZip } from "../util/LoadImage"
import BackgroundSprite, { isBackgroundSpriteJSONData } from "./BackgroundSprite"
import type Car from "../physics/Car"

export default class Course {

    #images: Map<string, ImageBitmap>

    #backgroundSprites: BackgroundSprite[]

    constructor(
        images: Map<string, ImageBitmap>,
        backgroundSprites: BackgroundSprite[]
    ) {
        this.#images = images
        this.#backgroundSprites = backgroundSprites
    }

    static async loadCourse(path: string): Promise<Course> {
        try {
            const response = await fetch(path)
            const data = await response.arrayBuffer()
            const zip = new JSZip()
            const contents = await zip.loadAsync(data)

            const courseJsonFile = contents.file("course.json")
            if (courseJsonFile === null) {
                throw "No course.json in zip"
            }

            const courseJson: unknown = JSON.parse(await courseJsonFile.async("string"))
            if (!(typeof(courseJson) === "object") || courseJson === null) {
                throw "Malformed course.json in zip"
            }

            if (
                !("images" in courseJson) 
                || !(typeof(courseJson.images) === "object")
                || courseJson.images === null
            ) {
                throw "Malformed course.json: no images list provided"
            }

            const keyImageTuples = await Promise.all(loadImages(contents, courseJson.images))
            const imageMap: Map<string, ImageBitmap> = new Map()
            for (const [key, image] of keyImageTuples) {
                imageMap.set(key, image)
            }

            if (
                !("background_sprites" in courseJson)
                || !Array.isArray(courseJson.background_sprites) 
                || !courseJson.background_sprites.every(s => isBackgroundSpriteJSONData(s))
            ) {
                throw "Malformed course.json background_sprites section"
            }
            
            const backgroundSprites = courseJson.background_sprites.map(s => {
                return BackgroundSprite.deserialize(s, imageMap)
            })

            const course = new Course(
                imageMap,
                backgroundSprites
            )
            return course

        } catch (error) {
            throw `Unable to load file: ${error}`
        }

    }

    render(
        ctx: CanvasRenderingContext2D,
        offscreenWidth: number,
        offscreenHeight: number,
        playerCar: Car
    ) {
        for (const sprite of this.#backgroundSprites) {
            ctx.save();
            ctx.translate(offscreenWidth / 2, offscreenHeight / 2)
            ctx.rotate(-playerCar.angle - Math.PI / 2);
            ctx.translate(-playerCar.hitbox.getCenter().x, -playerCar.hitbox.getCenter().y)

            const img = sprite.currentImage

            if (sprite.repeat) {
                for (let y = 0; y < sprite.repeatY; y++) {
                    for (let x = 0; x < sprite.repeatX; x++) {
                        ctx.drawImage(
                            img, 
                            sprite.x + x * img.width, 
                            sprite.y + y * img.height
                        )
                    }
                }
            } else {
                ctx.drawImage(img, sprite.x, sprite.y)
            }

            
            ctx.restore();
        }
    }

}

function loadImages(zip: JSZip, courseJsonImages: object): Promise<[string, ImageBitmap]>[] {
    let promises: Promise<[string, ImageBitmap]>[] = []
    for (const [key, value] of Object.entries(courseJsonImages)) {
        if (typeof(value) !== "string") {
            throw `images: value of ${key} is not a string`
        }
        promises.push(new Promise((resolved) => {
            resolved(loadImageFromZip(zip, value).then(image => ([key, image])))
        }))
    }
    return promises
}

