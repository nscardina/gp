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
        const leftSideText = `${getOrdinal(car.currentPlace)}: ${car.name}`
        const rightSideText = `${getPoints(car.currentPlace)}`

        const leftSideMetrics = ctx.measureText(leftSideText)
        const rightSideMetrics = ctx.measureText(rightSideText)

        const numDots = Math.floor((offscreenCanvas.width - leftSideMetrics.width - rightSideMetrics.width - 20) / dotMetrics.width)

        ctx.textAlign = "left"
        ctx.fillText(`${leftSideText}`, 10, 20 + 10 * index)
        ctx.textAlign = "right"
        ctx.fillText(`${". ".repeat(numDots)}${rightSideText}`, offscreenCanvas.width - 10, 20 + 10 * index)
    })

    ctx.textAlign = "left"

}

const getOrdinal = (place: number): string => {
    switch (place) {
        case 1: return "1st";
        case 2: return "2nd";
        case 3: return "3rd";
        case 4: return "4th";
    }
    return "";
}

export const getPoints = (place: number): number => {
    switch (place) {
        case 1: return 5;
        case 2: return 3;
        case 3: return 1;
        case 4: return 0;
    }
    return 0;
}