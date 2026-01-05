import { isDebug, setDebug } from "../Debug"
import { PointDistanceToPolygon } from "../geometry/IntersectionAlgorithms"
import type Polygon from "../geometry/Polygon"
import { renderLapCounter } from "../gui/LapCounter"
import { renderResultsScreen } from "../gui/ResultsScreen"
import { renderSpeedometer } from "../gui/Speedometer"
import { makeCountdownFadingUIRenderTask } from "../menu/Countdown"
import { Delay } from "../util/Delay"
import type { CourseState } from "./CourseState"
import FadingUIRenderTask from "./FadingUIRenderTask"
import { FPSCounter } from "./FPSCounter"
import type { GlobalState } from "./GlobalState"
import type { GrandPrixState } from "./GrandPrixState"

export const DESIRED_FPS = 120
export const DESIRED_MS_PER_TICK = 1000 / DESIRED_FPS

const fpsCounter = new FPSCounter()

let lastTime = 0

type RenderInfo = {
    shake: boolean
}

let fadingUIRenderTasks: FadingUIRenderTask[] = []

export const makeGameLoop = (
    globalState: GlobalState, 
    gpState: GrandPrixState,
    courseState: CourseState
): FrameRequestCallback => {

    const gameLoop: FrameRequestCallback = (timestamp: number) => {
        const deltaTime = timestamp - lastTime
        lastTime = timestamp

        fpsCounter.updateFps(deltaTime)

        const renderInfo = update(deltaTime, globalState, gpState, courseState)

        render(renderInfo, globalState, gpState, courseState)

        requestAnimationFrame(gameLoop)
    }

    return gameLoop

}


export const countdown = async(globalState: GlobalState, state: CourseState) => {
    state.phase = "countdown"

    await Delay(1500)

    state.countdownNumber = "3"
    fadingUIRenderTasks.push(makeCountdownFadingUIRenderTask("3", globalState))

    await Delay(1000)
    state.countdownNumber = "2"
    fadingUIRenderTasks.push(makeCountdownFadingUIRenderTask("2", globalState))

    await Delay(1000)
    state.countdownNumber = "1"
    fadingUIRenderTasks.push(makeCountdownFadingUIRenderTask("1", globalState))

    await Delay(1000)
    state.countdownNumber = "GO"
    fadingUIRenderTasks.push(makeCountdownFadingUIRenderTask("GO", globalState))

    state.phase = "race"
    await Delay(1000)
    state.countdownNumber = null
}

function update(
    deltaTime: number,
    globalState: GlobalState, 
    gpState: GrandPrixState,
    courseState: CourseState
): RenderInfo | null {

    if (courseState.paused) {
        return null
    }

    const debugOn = globalState.keyPressedMap.get(globalState.keybindMap.get("DEBUG_ACTIVATE")!)
    const debugOff = globalState.keyPressedMap.get(globalState.keybindMap.get("DEBUG_DEACTIVATE")!)

    if (debugOn) {
        setDebug(true)
    }
    if (debugOff) {
        setDebug(false)
    }

    const { course, playerCar, cars } = courseState
    const { keybindMap, keyPressedMap } = globalState

    if (courseState.phase === "race") {
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
            courseState.phase = "results_screen"
        }

        return {
            ...playerCarUpdateResults
        }
    }

    if (courseState.phase === "results_screen") {
        for (const car of cars) {
            car.aiCarUpdate(deltaTime, course.collisionAreas, course.aiPathMarkers, cars, course.checkpoints)
        }

        
    }
    
    return null
    
}

function render(
    renderInfo: RenderInfo | null,
    globalState: GlobalState, 
    gpState: GrandPrixState,
    courseState: CourseState
) {

    const { offscreenCanvas } = globalState

    // draw background
    renderCourse(renderInfo, globalState, courseState)

    renderCarImage(globalState, courseState)

    if (courseState.phase === "countdown" || courseState.phase === "race") {
        renderLapCounter(globalState, courseState)
        renderSpeedometer(globalState, courseState)
    }

    fadingUIRenderTasks = fadingUIRenderTasks.filter(t => !t.isCompleted)
    for (const task of fadingUIRenderTasks) {
        task.render()
    }

    if (courseState.phase === "results_screen") {
        renderResultsScreen(globalState, courseState)
    }

    setDebugText(courseState)

    const bitmap = offscreenCanvas.transferToImageBitmap();
    postMessage({ type: "render", bitmap: bitmap }, [bitmap] as any)
}

function renderCourse(renderInfo: RenderInfo | null, globalState: GlobalState, courseState: CourseState) {
    const { offscreenCanvas, ctx } = globalState
    const { playerCar, course, cars } = courseState
    
    const x = (offscreenCanvas.width + ((renderInfo?.shake) ? Math.random() * 4 : 0)) | 0
    const y = (offscreenCanvas.height + ((renderInfo?.shake) ? Math.random() * 4 : 0)) | 0

    course.render(ctx, x, y, playerCar, cars)
}

function renderCarImage(globalState: GlobalState, courseState: CourseState) {
    const { ctx, offscreenCanvas } = globalState
    const { playerCar } = courseState

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

function renderCenteredText(globalState: GlobalState, text: string) {
    const { offscreenCanvas, ctx } = globalState
    ctx.font = "8px press_start"
    ctx.textBaseline = "top"
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = "rgba(0, 153, 255, 1)"

    ctx.textAlign = "center"
    ctx.fillText(text, offscreenCanvas.width / 2, offscreenCanvas.height / 2)
    ctx.textAlign = "left"
}

function setDebugText(courseState: CourseState) {

    if (!isDebug()) {
        postMessage({type: "debugText", text: ""})
        return
    }

    const { playerCar, cars } = courseState

    let textLines = []
    textLines.push(fpsCounter.debugText())
    textLines.push("player: " + playerCar.debugText())
    textLines.push(...cars.filter(car => car !== playerCar).map(car => car.debugText()))
    

    
    postMessage({type: "debugText", text: textLines.join("<br>")})

    
}