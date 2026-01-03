let _debug = false

export function isDebug() {
    return _debug
}

export function setDebug(debug: boolean) {
    _debug = debug
}

export const White = (text: string) => `<span style="color:rgb(255,255,255)">${text}</span>`
export const Green = (text: string) => `<span style="color:rgba(46, 255, 63, 1)">${text}</span>`
export const Blue = (text: string) => `<span style="color: rgba(0, 153, 255, 1)">${text}</span>`
export const Magenta = (text: string) => `<span style="color: rgba(183, 0, 255, 1)">${text}</span>`