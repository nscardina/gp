import type { CourseState } from "../multithreading/CourseState"
import type { GlobalState } from "../multithreading/GlobalState"

export function renderLapCounter(globalState: GlobalState, courseState: CourseState) {
    const { ctx, offscreenCanvas } = globalState
    const { playerCar } = courseState

    ctx.fillStyle = "rgb(50,50,50)"
    ctx.roundRect(offscreenCanvas.width - 51, offscreenCanvas.height - 18, 50, 16, 4)
    ctx.fill()

    ctx.font = "8px press_start"
    ctx.textBaseline = "top"
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = "rgba(0, 153, 255, 1)"
    ctx.fillText(`Lap ${playerCar.currentLapNumber}`, offscreenCanvas.width - 46, offscreenCanvas.height - 13)
}
