import { isDebug } from "../Debug"
import { gameState } from "./GameState"

export const DESIRED_FPS = 120
export const DESIRED_MS_PER_TICK = 1000 / DESIRED_FPS

let lastTime = 0

type RenderInfo = {
    shake: boolean
}

export const gameLoop: FrameRequestCallback = (timestamp: number) => {
    const deltaTime = timestamp - lastTime
    lastTime = timestamp

    const renderInfo = update(deltaTime)

    render(renderInfo)

    requestAnimationFrame(gameLoop)
}

function update(deltaTime: number): RenderInfo | null {
    const state = gameState()

    if (state === null || state.paused) {
        return null
    }

    const { course, playerCar, cars, keybindMap, keyPressedMap } = state

    for (const aiCar of cars.filter(car => car !== playerCar)) {
        aiCar.aiCarUpdate(deltaTime, course.collisionAreas, course.aiPathMarkers, [
            ...cars
        ])
    }

    let playerCarUpdateResults = playerCar.carUpdate(deltaTime, keybindMap, keyPressedMap, course.collisionAreas, [
        ...cars
    ])
    return {
        ...playerCarUpdateResults
    }
}

function render(renderInfo: RenderInfo | null) {
    const state = gameState()

    if (state === null) {
        return
    }

    const { playerCar, course, offscreenCanvas, ctx } = state

    // draw background
    const x = (offscreenCanvas.width + ((renderInfo?.shake) ? Math.random() * 4 : 0)) | 0
    const y = (offscreenCanvas.height + ((renderInfo?.shake) ? Math.random() * 4 : 0)) | 0

    course.render(ctx, x, y, playerCar, state.cars)

    const carImg = playerCar.image
    if (carImg !== null) {
        // draw car
        ctx.save();
        ctx.translate((offscreenCanvas.width / 2) | 0, (offscreenCanvas.height / 2) | 0)
        ctx.rotate(playerCar.angle - playerCar.cameraAngle)
        ctx.drawImage(carImg, (-carImg.width / 2) | 0, (-carImg.height / 2) | 0)

        ctx.restore();
    }

    setDebugText()

    const bitmap = offscreenCanvas.transferToImageBitmap();
    postMessage({ type: "render", bitmap: bitmap }, [bitmap] as any)
}

function setDebugText() {
    const state = gameState()

    if (state === null || !isDebug()) {
        postMessage({type: "debugText", text: ""})
        return
    }

    const { playerCar, cars } = state

    
    postMessage({type: "debugText", text: cars.map(car => car.debugText()).join("\n")})

    
}