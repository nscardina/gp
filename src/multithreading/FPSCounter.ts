import { Green, White } from "../Debug"

const FPS_COUNTER_UPDATE_DELAY_MS = 1000

export class FPSCounter {
    #fps: number

    #canUpdate: boolean

    constructor() {
        this.#fps = 0
        this.#canUpdate = true
    }

    updateFps(deltaTime: number) {

        if (this.#canUpdate) {
            this.#canUpdate = false
            this.#fps = 1000 / deltaTime
            setTimeout(() => this.#canUpdate = true, FPS_COUNTER_UPDATE_DELAY_MS)
        }

    }

    debugText(): string {
        return `${White("FPS:")}${Green(this.#fps.toFixed(0))}`
    }


}