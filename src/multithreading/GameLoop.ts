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

    if (state === null) {
        return null
    }

    const { course, playerCar, keybindMap, keyPressedMap } = state

    let playerCarUpdateResults = playerCar.carUpdate(deltaTime, keybindMap, keyPressedMap, course.collisionAreas)
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

    course.render(ctx, x, y, playerCar)

    const carImg = playerCar.image
    if (carImg !== null) {
        // draw car
        ctx.save();
        ctx.translate((offscreenCanvas.width / 2) | 0, (offscreenCanvas.height / 2) | 0)
        ctx.rotate(playerCar.angle - playerCar.cameraAngle)
        ctx.drawImage(carImg, (-carImg.width / 2) | 0, (-carImg.height / 2) | 0)

        ctx.restore();
    }

    

    const bitmap = offscreenCanvas.transferToImageBitmap();
    postMessage({ bitmap }, [bitmap] as any)
}