import FadingUIRenderTask from "../multithreading/FadingUIRenderTask"
import { gameState, type GameState } from "../multithreading/GameState"

export const makeCountdownFadingUIRenderTask = (
    text: GameState["countdownNumber"],
    state: GameState
) => {
    const task = new FadingUIRenderTask(1000, pct => {
        const { offscreenCanvas, ctx } = state
        ctx.font = "8px press_start"
        ctx.textBaseline = "top"
        ctx.imageSmoothingEnabled = false
        ctx.fillStyle = `rgba(0, 153, 255, ${1 - pct})`

        ctx.fillRect(offscreenCanvas.width / 2 - 10, offscreenCanvas.height / 2, 20, 24)

        ctx.textAlign = "center"
        ctx.fillText(text!, offscreenCanvas.width / 2, offscreenCanvas.height / 2)
        ctx.textAlign = "left"
    })
    return task
}