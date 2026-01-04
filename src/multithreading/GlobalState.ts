import { LoadImageResources, type ImageResources } from "../ImageResources"
import { makeDefaultKeybindMap, makeKeyPressedMap, type KeybindMap, type KeyPressedMap } from "../keybind/Keyboard"

export type GlobalState = {

    offscreenCanvas: OffscreenCanvas,
    ctx: OffscreenCanvasRenderingContext2D,
    keybindMap: KeybindMap,    
    keyPressedMap: KeyPressedMap,
    imageResources: ImageResources
}

const OFFSCREEN_CANVAS_WIDTH = 160
const OFFSCREEN_CANVAS_HEIGHT = 120

export const initGlobalState = async(): Promise<GlobalState> => {

    const offscreenCanvas = new OffscreenCanvas(OFFSCREEN_CANVAS_WIDTH, OFFSCREEN_CANVAS_HEIGHT)
    const ctx = offscreenCanvas.getContext("2d")!
    const keybindMap = makeDefaultKeybindMap()
    const keyPressedMap = makeKeyPressedMap(keybindMap)
    const imageResources = await LoadImageResources()

    return {
        offscreenCanvas: offscreenCanvas,
        ctx: ctx,
        keybindMap: keybindMap,
        keyPressedMap: keyPressedMap,
        imageResources: imageResources
    }
}