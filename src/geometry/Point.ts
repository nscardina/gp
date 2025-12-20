export default class Point {
    #x: number
    #y: number

    constructor(x?: number, y?: number) {
        this.#x = x ?? 0
        this.#y = y ?? 0
    }

    get x(): number {
        return this.#x
    }

    set x(x: number) {
        this.#x = x
    }

    get y(): number {
        return this.#y
    }

    set y(y: number) {
        this.#y = y
    }

    toString() {
        return `Point[x: ${this.#x}, y: ${this.#y}]`
    }
}