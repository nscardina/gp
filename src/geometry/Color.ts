export type Color = {
    red: number,
    green: number,
    blue: number,
    alpha: number
}

export function colorToString(color: Color) {
    return `rgb(${color.red} ${color.green} ${color.blue} / ${color.alpha})`
}