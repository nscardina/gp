import type { ImageResources } from "../ImageResources"
import type { CourseState } from "../multithreading/CourseState"
import FadingUIRenderTask from "../multithreading/FadingUIRenderTask"
import type { GlobalState } from "../multithreading/GlobalState"

export const makeCountdownFadingUIRenderTask = (
    text: CourseState["countdownNumber"],
    globalState: GlobalState
) => {
    const task = new FadingUIRenderTask(1000, pct => {
        const { offscreenCanvas, ctx, imageResources } = globalState

        const image = getCountdownImage(text, imageResources)
        if (image !== null) {
            ctx.globalAlpha = 1 - pct
            ctx.drawImage(image, 
                (offscreenCanvas.width / 2 - image.width / 2) | 0,
                (offscreenCanvas.height / 2 - image.height / 2) | 0
            )
            ctx.globalAlpha = 1
        }
    })
    return task
}

export const getCountdownImage = (text: CourseState["countdownNumber"], imageResources: ImageResources): ImageBitmap | null => {
    switch (text) {
        case "1": return imageResources.Countdown.One
        case "2": return imageResources.Countdown.Two
        case "3": return imageResources.Countdown.Three
        case "GO": return imageResources.Countdown.Go
        default: return null
    }
}