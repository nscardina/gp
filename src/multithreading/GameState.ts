import type { KeybindMap, KeyPressedMap } from "../keybind/Keyboard"
import type Course from "../level/Course"
import type Car from "../physics/Car"

export type GameState = {
    paused: boolean,
    offscreenCanvas: OffscreenCanvas,
    ctx: OffscreenCanvasRenderingContext2D,
    course: Course,
    cars: Car[],
    playerCar: Car,

    keybindMap: KeybindMap,
    keyPressedMap: KeyPressedMap
}

let _gameState: GameState | null = null

export const setupGameState = function(state: GameState) {
    _gameState = state
}

export const gameState = function(): GameState | null {
    return _gameState
}