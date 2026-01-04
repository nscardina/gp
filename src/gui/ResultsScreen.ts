import type { CourseState } from "../multithreading/CourseState"
import type { GlobalState } from "../multithreading/GlobalState"

export function renderResultsScreen(globalState: GlobalState, courseState: CourseState) {


    const textLines = ["Results"]
    textLines.push(...courseState.cars.map(car => `${car.name}: ${car.currentPlace}`))

    const { offscreenCanvas, ctx } = globalState
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
    courseState.cars.forEach((car, index) => {
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
