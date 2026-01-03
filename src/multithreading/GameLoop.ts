import { isDebug, setDebug } from "../Debug"
import { PointDistanceToPolygon } from "../geometry/IntersectionAlgorithms"
import type Polygon from "../geometry/Polygon"
import { makeCountdownFadingUIRenderTask } from "../menu/Countdown"
import type Car from "../physics/Car"
import { Delay } from "../util/Delay"
import FadingUIRenderTask from "./FadingUIRenderTask"
import { FPSCounter } from "./FPSCounter"
import { gameState, type GameState } from "./GameState"

export const DESIRED_FPS = 120
export const DESIRED_MS_PER_TICK = 1000 / DESIRED_FPS

const fpsCounter = new FPSCounter()

let lastTime = 0

type RenderInfo = {
    shake: boolean
}

let fadingUIRenderTasks: FadingUIRenderTask[] = []

export const gameLoop: FrameRequestCallback = (timestamp: number) => {
    const deltaTime = timestamp - lastTime
    lastTime = timestamp

    fpsCounter.updateFps(deltaTime)

    const renderInfo = update(deltaTime)

    render(renderInfo)

    requestAnimationFrame(gameLoop)
}


export const countdown = async(state: GameState) => {
    state.state = "countdown"
    state.countdownNumber = "3"
    fadingUIRenderTasks.push(makeCountdownFadingUIRenderTask("3", state))

    await Delay(1000)
    state.countdownNumber = "2"
    fadingUIRenderTasks.push(makeCountdownFadingUIRenderTask("2", state))

    await Delay(1000)
    state.countdownNumber = "1"
    fadingUIRenderTasks.push(makeCountdownFadingUIRenderTask("1", state))

    await Delay(1000)
    state.countdownNumber = "GO"
    fadingUIRenderTasks.push(makeCountdownFadingUIRenderTask("GO", state))

    state.state = "race"
    await Delay(1000)
    state.countdownNumber = null
}

function update(deltaTime: number): RenderInfo | null {
    const state = gameState()

    if (state === null || state.paused) {
        return null
    }

    const debugOn = state.keyPressedMap.get(state.keybindMap.get("DEBUG_ACTIVATE")!)
    const debugOff = state.keyPressedMap.get(state.keybindMap.get("DEBUG_DEACTIVATE")!)

    if (debugOn) {
        setDebug(true)
    }
    if (debugOff) {
        setDebug(false)
    }

    const { course, playerCar, cars, keybindMap, keyPressedMap } = state

    if (state.state === "race") {
        for (const aiCar of cars.filter(car => car !== playerCar)) {
            aiCar.aiCarUpdate(deltaTime, course.collisionAreas, course.aiPathMarkers, [
                ...cars
            ], course.checkpoints)
        }

        let playerCarUpdateResults = {
            shake: false
        }
        if (playerCar.currentLapNumber > course.numberOfLaps) {
            playerCar.aiCarUpdate(deltaTime, course.collisionAreas, course.aiPathMarkers, [
                ...cars
            ], course.checkpoints)
        } else {
            playerCarUpdateResults = playerCar.carUpdate(deltaTime, keybindMap, keyPressedMap, course.collisionAreas, [
                ...cars
            ], course.checkpoints)
        }

        // Update lap completion values for the cars
        cars.sort((car1, car2) => 
            car2.currentLapNumber - car1.currentLapNumber
            || car2.currentCheckpoint.id - car1.currentCheckpoint.id
            || (
                PointDistanceToPolygon(
                    car2.hitbox.getCenter(), 
                    car2.currentCheckpoint.hitbox as Polygon
                ) - PointDistanceToPolygon(
                    car1.hitbox.getCenter(),
                    car1.currentCheckpoint.hitbox as Polygon
                )
            )
        )
        cars.forEach((car, index) => {
            car.currentPlace = index + 1
        })

        if (
            playerCar.currentLapNumber > course.numberOfLaps ||
            cars.filter(car => car.currentLapNumber > course.numberOfLaps).length >= 3
        ) {
            state.state = "results_screen"
        }

        return {
            ...playerCarUpdateResults
        }
    }

    if (state.state === "results_screen") {
        for (const car of cars) {
            car.aiCarUpdate(deltaTime, course.collisionAreas, course.aiPathMarkers, cars, course.checkpoints)
        }

        
    }
    
    return null
    
}

function render(renderInfo: RenderInfo | null) {
    const state = gameState()

    if (state === null) {
        return
    }

    const { offscreenCanvas } = state

    // draw background
    renderCourse(renderInfo, state)

    renderCarImage(state)

    if (state.state === "countdown" || state.state === "race") {
        renderLapCounter(state)
        renderSpeedometer(state)
    }
    

    // if (state.state === "countdown" && state.countdownNumber !== null) {
    //     renderCenteredText(state, state.countdownNumber)
    // }
    fadingUIRenderTasks = fadingUIRenderTasks.filter(t => !t.isCompleted)
    for (const task of fadingUIRenderTasks) {
        task.render()
    }

    if (state.state === "results_screen") {
        renderResultsScreen(state)
    }

    setDebugText()

    const bitmap = offscreenCanvas.transferToImageBitmap();
    postMessage({ type: "render", bitmap: bitmap }, [bitmap] as any)
}

function renderResultsScreen(state: GameState) {
    const textLines = ["Results"]
    textLines.push(...state.cars.map(car => `${car.name}: ${car.currentPlace}`))

    const { offscreenCanvas, ctx } = state
    ctx.font = "8px press_start"
    ctx.textBaseline = "top"
    ctx.imageSmoothingEnabled = false
    

    const dotMetrics = ctx.measureText(". ")

    ctx.fillStyle = "rgb(0 0 0 / 80%)"
    ctx.fillRect(5, 5, offscreenCanvas.width - 10, 25 + (dotMetrics.actualBoundingBoxAscent + dotMetrics.actualBoundingBoxDescent + 5) * textLines.length)

    ctx.textAlign = "center"
    ctx.fillStyle = "rgba(0, 153, 255, 1)"
    ctx.fillText("Results", offscreenCanvas.width / 2, 10)
    

    // draw car placement text
    state.cars.forEach((car, index) => {
        const carNameMetrics = ctx.measureText(car.name)
        const carPlaceMetrics = ctx.measureText(`${car.currentPlace}`)

        const numDots = Math.floor((offscreenCanvas.width - carNameMetrics.width - carPlaceMetrics.width - 20) / dotMetrics.width)

        ctx.textAlign = "left"
        ctx.fillText(`${car.name}`, 10, 20 + 10 * index)
        ctx.textAlign = "right"
        ctx.fillText(`${". ".repeat(numDots)}${car.currentPlace}`, offscreenCanvas.width - 10, 20 + 10 * index)
    })

    ctx.textAlign = "left"
    
}

function renderCourse(renderInfo: RenderInfo | null, state: GameState) {
    const { offscreenCanvas, course, ctx, playerCar } = state
    
    const x = (offscreenCanvas.width + ((renderInfo?.shake) ? Math.random() * 4 : 0)) | 0
    const y = (offscreenCanvas.height + ((renderInfo?.shake) ? Math.random() * 4 : 0)) | 0

    course.render(ctx, x, y, playerCar, state.cars)
}

function renderCarImage(state: GameState) {
    const { playerCar, ctx, offscreenCanvas } = state

    // Player car image may not have loaded yet; don't render if it didn't
    const carImg = playerCar.image
    if (carImg !== null) {
        // draw car
        ctx.save();
        ctx.translate((offscreenCanvas.width / 2) | 0, (offscreenCanvas.height / 2) | 0)
        ctx.rotate(playerCar.angle - playerCar.cameraAngle)
        ctx.drawImage(carImg, (-carImg.width / 2) | 0, (-carImg.height / 2) | 0)

        ctx.restore();
    }
}

function renderSpeedometer(state: GameState) {
    const { ctx, offscreenCanvas, playerCar } = state

    const radius = 14
    const cx = 15
    const cy = offscreenCanvas.height - 10

    // cos, sin of rotation 1/4pi - Math.cos(45 deg)
    const tpi4 = Math.cos(Math.PI / 4)

    // draw background of speedometer
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = "rgb(50, 50, 50)"
    ctx.strokeStyle = "rgb(100, 100, 100)"
    ctx.fill()
    ctx.stroke()

    // draw gray lines on speedometer
    ctx.beginPath()
    ctx.moveTo(cx - radius * tpi4, cy + radius * tpi4)
    ctx.lineTo(cx - radius * tpi4 + 3, cy + radius * tpi4 - 3)
    ctx.moveTo(cx - radius, cy)
    ctx.lineTo(cx - radius + 3, cy)
    ctx.moveTo(cx - radius * tpi4, cy - radius * tpi4)
    ctx.lineTo(cx - radius * tpi4 + 3, cy - radius * tpi4 + 3)
    ctx.moveTo(cx, cy - radius)
    ctx.lineTo(cx, cy - radius + 3)
    ctx.moveTo(cx + radius * tpi4, cy - radius * tpi4)
    ctx.lineTo(cx + radius * tpi4 - 3, cy - radius * tpi4 + 3)
    ctx.moveTo(cx + radius, cy)
    ctx.lineTo(cx + radius - 3, cy)
    ctx.moveTo(cx + radius * tpi4, cy + radius * tpi4)
    ctx.lineTo(cx + radius * tpi4 - 3, cy + radius * tpi4 - 3)
    ctx.stroke()
    
    // draw needle on speedometer
    ctx.beginPath()
    ctx.moveTo(15, offscreenCanvas.height - 10)
    const speedometerAngle = -3 * Math.PI / 4 - (playerCar.velocity / 0.8) * 6 * Math.PI / 4
    ctx.lineTo(
        15 + (12 * Math.cos(speedometerAngle)),
        offscreenCanvas.height - 10 - (12 * Math.sin(speedometerAngle))
    )
    ctx.strokeStyle = "rgb(255, 0, 0)"
    ctx.stroke()
}

function renderLapCounter(state: GameState) {
    const { playerCar, ctx, offscreenCanvas } = state

    ctx.fillStyle = "rgb(50,50,50)"
    ctx.roundRect(offscreenCanvas.width - 51, offscreenCanvas.height - 18, 50, 16, 4)
    ctx.fill()

    ctx.font = "8px press_start"
    ctx.textBaseline = "top"
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = "rgba(0, 153, 255, 1)"
    ctx.fillText(`Lap ${playerCar.currentLapNumber}`, offscreenCanvas.width - 46, offscreenCanvas.height - 13)
}

function renderCenteredText(state: GameState, text: string) {
    const { offscreenCanvas, ctx } = state
    ctx.font = "8px press_start"
    ctx.textBaseline = "top"
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = "rgba(0, 153, 255, 1)"

    ctx.textAlign = "center"
    ctx.fillText(text, offscreenCanvas.width / 2, offscreenCanvas.height / 2)
    ctx.textAlign = "left"
}

function setDebugText() {
    const state = gameState()

    if (state === null || !isDebug()) {
        postMessage({type: "debugText", text: ""})
        return
    }

    const { playerCar, cars } = state

    let textLines = []
    textLines.push(fpsCounter.debugText())
    textLines.push("player: " + playerCar.debugText())
    textLines.push(...cars.filter(car => car !== playerCar).map(car => car.debugText()))
    

    
    postMessage({type: "debugText", text: textLines.join("<br>")})

    
}