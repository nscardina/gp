import JSZip from "jszip"
import { loadImageFromZip } from "../util/LoadImage"
import BackgroundSprite, { isBackgroundSpriteJSONData } from "./BackgroundSprite"
import type Car from "../physics/Car"
import { CollisionArea, getCollisionEffectDebugColor, isCollisionAreaJSONData } from "./Collision"
import Polygon from "../geometry/Polygon"
import { colorToString, type Color } from "../geometry/Color"
import { isDebug } from "../Debug"
import { isSpawnpointJSONData, Spawnpoint } from "./Spawnpoint"
import { AIPathMarker, getAIPathMarkerDebugColor, isAIPathMarkerJSONData } from "./AIPathMarker"
import type Point from "../geometry/Point"

export default class Course {

    #images: Map<string, ImageBitmap>

    #aiPathMarkers: AIPathMarker[]

    #backgroundSprites: BackgroundSprite[]

    #collisionAreas: CollisionArea[]

    #spawnpoints: Spawnpoint[]

    constructor(
        images: Map<string, ImageBitmap>,
        backgroundSprites: BackgroundSprite[],
        collisionAreas: CollisionArea[],
        spawnpoints: Spawnpoint[],
        aiPathMarkers: AIPathMarker[]
    ) {
        this.#images = images
        this.#backgroundSprites = backgroundSprites
        this.#collisionAreas = collisionAreas
        this.#spawnpoints = spawnpoints
        this.#aiPathMarkers = aiPathMarkers
    }

    get images(): Map<string, ImageBitmap> {
        return this.#images
    }

    set images(images: Map<string, ImageBitmap>) {
        this.#images = images
    }

    get backgroundSprites(): BackgroundSprite[] {
        return this.#backgroundSprites
    }

    set backgroundSprites(backgroundSprites: BackgroundSprite[]) {
        this.#backgroundSprites = backgroundSprites
    }

    get collisionAreas(): CollisionArea[] {
        return this.#collisionAreas
    }

    set collisionAreas(collisionAreas: CollisionArea[]) {
        this.#collisionAreas = collisionAreas
    }

    get spawnpoints(): Spawnpoint[] {
        return this.#spawnpoints
    }

    set spawnpoints(spawnpoints: Spawnpoint[]) {
        this.spawnpoints = spawnpoints
    }

    get aiPathMarkers(): AIPathMarker[] {
        return this.#aiPathMarkers
    }

    set aiPathMarkers(aiPathMarkers: AIPathMarker[]) {
        this.#aiPathMarkers = aiPathMarkers
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

            if (
                !("collision" in courseJson)
                || !Array.isArray(courseJson.collision)
                || !courseJson.collision.every(c => isCollisionAreaJSONData(c))
            ) {
                throw "Malformed course.json collision section"
            }

            const collisionAreas = courseJson.collision.map(c => {
                return CollisionArea.deserialize(c)
            })

            if (
                !("spawnpoints" in courseJson) 
                || !Array.isArray(courseJson.spawnpoints)
                || !courseJson.spawnpoints.every(s => isSpawnpointJSONData(s))
            ) {
                throw "Malformed course.json spawnpoints section"
            }

            const spawnpoints = courseJson.spawnpoints.map(s => {
                return Spawnpoint.deserialize(s)
            })

            if (
                !("aiPathMarkers" in courseJson)
                || !Array.isArray(courseJson.aiPathMarkers)
                || !courseJson.aiPathMarkers.every(m => isAIPathMarkerJSONData(m))
            ) {
                throw "Malformed course.json aiPathMarkers section"
            }

            const aiPathMarkers = courseJson.aiPathMarkers.map(m => {
                return AIPathMarker.deserialize(m)
            })

            const course = new Course(
                imageMap,
                backgroundSprites,
                collisionAreas,
                spawnpoints,
                aiPathMarkers
            )
            return course

        } catch (error) {
            throw `Unable to load file: ${error}`
        }

    }

    render(
        ctx: OffscreenCanvasRenderingContext2D,
        offscreenWidth: number,
        offscreenHeight: number,
        playerCar: Car,
        allCars: Car[]
    ) {
        for (const sprite of this.#backgroundSprites) {
            this.renderSprite(ctx, offscreenWidth, offscreenHeight, playerCar, sprite)
        }

        if (isDebug()) {
            for (const aiPathMarker of this.#aiPathMarkers) {
                this.renderCircle(ctx, offscreenWidth, offscreenHeight, playerCar, aiPathMarker.point, 4, getAIPathMarkerDebugColor(aiPathMarker))
            }
        }
        

        for (const aiCar of allCars.filter(car => car !== playerCar)) {
            if (aiCar.image !== null) {
                this.renderImageBitmap(ctx, offscreenWidth, offscreenHeight, playerCar, aiCar.image, 
                aiCar.hitbox.getCenter().x, aiCar.hitbox.getCenter().y, aiCar.angle)
            }
            
        }

        if (isDebug()) {
            for (const area of this.#collisionAreas) {
                if (area.shape instanceof Polygon) {
                    this.renderPolygon(ctx, offscreenWidth, offscreenHeight, playerCar, area.shape, getCollisionEffectDebugColor(area.effect))
                }
            }
        }
        
    }

    renderImageBitmap(
        ctx: OffscreenCanvasRenderingContext2D,
        offscreenWidth: number,
        offscreenHeight: number,
        playerCar: Car,
        img: ImageBitmap,
        spriteX: number,
        spriteY: number,
        rotation: number
    ) {

        ctx.save();
        ctx.translate(offscreenWidth / 2, offscreenHeight / 2)
        ctx.rotate(-playerCar.angle - Math.PI / 2);
        ctx.translate(-playerCar.hitbox.getCenter().x, -playerCar.hitbox.getCenter().y)
        ctx.translate(spriteX, spriteY);
        ctx.rotate(rotation + Math.PI / 2)

        ctx.drawImage(img, ( - img.width / 2) | 0, ( - img.height / 2) | 0)
 
        ctx.restore()
    }

    renderSprite(
        ctx: OffscreenCanvasRenderingContext2D,
        offscreenWidth: number,
        offscreenHeight: number,
        playerCar: Car,
        sprite: BackgroundSprite
    ) {
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

        ctx.restore()
    }

    renderPolygon(
        ctx: OffscreenCanvasRenderingContext2D,
        offscreenWidth: number,
        offscreenHeight: number,
        playerCar: Car,
        polygon: Polygon,
        color: Color
    ) {
        ctx.save();
        ctx.translate(offscreenWidth / 2, offscreenHeight / 2)
        ctx.rotate(-playerCar.angle - Math.PI / 2);
        ctx.translate(-playerCar.hitbox.getCenter().x, -playerCar.hitbox.getCenter().y)

        const points = polygon.points

        ctx.beginPath()
        if (points.length > 0) {
            ctx.moveTo(points[0].x, points[0].y)
        }

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y)
        }

        ctx.lineTo(points[0].x, points[0].y)
        
        color.alpha = 1.0
        ctx.strokeStyle = colorToString(color)
        color.alpha = 0.3
        ctx.fillStyle = colorToString(color)
        
        ctx.fill()
        ctx.stroke()

        ctx.restore()
    }

    renderCircle(
        ctx: OffscreenCanvasRenderingContext2D,
        offscreenWidth: number,
        offscreenHeight: number,
        playerCar: Car,
        center: Point,
        radius: number,
        color: Color
    ) {
        ctx.save();
        ctx.translate(offscreenWidth / 2, offscreenHeight / 2)
        ctx.rotate(-playerCar.angle - Math.PI / 2);
        ctx.translate(-playerCar.hitbox.getCenter().x, -playerCar.hitbox.getCenter().y)

        ctx.beginPath()
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = colorToString(color)
        ctx.fill()

        ctx.restore()
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

