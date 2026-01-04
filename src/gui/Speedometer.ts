import type { CourseState } from "../multithreading/CourseState"
import type { GlobalState } from "../multithreading/GlobalState"

export function renderSpeedometer(globalState: GlobalState, courseState: CourseState) {
    const { ctx, offscreenCanvas } = globalState
    const { playerCar } = courseState

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
