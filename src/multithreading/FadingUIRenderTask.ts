export default class FadingUIRenderTask {

    #startingTime: number
    #endingTime: number
    #task: (percentage: number) => void

    constructor(numMs: number, task: (percentage: number) => void) {
        this.#startingTime = Date.now()
        this.#endingTime = this.#startingTime + numMs
        this.#task = task
    }

    get isCompleted(): boolean {
        return Date.now() > this.#endingTime
    }

    render() {
        const now = Date.now()
        if (now <= this.#endingTime) {
            this.#task((Date.now() - this.#startingTime) / 1000)
        }
    }

}