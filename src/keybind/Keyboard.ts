import { isDebug } from "../Debug"
import { makeIPCKeyDownEventObject, makeIPCKeyUpEventObject } from "../multithreading/IPC"
import { IterAny } from "../util/IteratorUtils"

/**
 * Names of the different keybindings.
 */
type KeybindName = "ACCELERATE" 
    | "DECELERATE"
    | "LEFT"
    | "RIGHT"
    | "BOOST"
    | "DEBUG_ACTIVATE"
    | "DEBUG_DEACTIVATE"

/**
 * Mapping between keybind name and the event.key value.
 */
export type KeybindMap = Map<KeybindName, string>

/**
 * Mapping between an event.key value (corresponding to a keybind) 
 * and whether it is pressed or not.
 */
export type KeyPressedMap = Map<string, boolean>

/**
 * Default keybind map, which contains the default key bindings 
 * for each of the actions in the game.
 */
export function makeDefaultKeybindMap(): KeybindMap {
    const map = new Map()
    .set("ACCELERATE", "w")
    .set("DECELERATE", "s")
    .set("LEFT", "a")
    .set("RIGHT", "d")
    .set("BOOST", "f")
    .set("DEBUG_ACTIVATE", "1")
    .set("DEBUG_DEACTIVATE", "2")

    return map
}
    

/**
 * Creates a KeyPressedMap with entries for each of the specified 
 * keybinding event.key strings from the KeybindMap passed to this 
 * function.
 * @param from KeybindMap that defines the keys to track the status of.
 * @returns KeyPressedMap.
 */
export function makeKeyPressedMap(from: KeybindMap): KeyPressedMap {
    const map = new Map() as KeyPressedMap
    for (const keyName of from.values()) {
        map.set(keyName, false)
    }
    return map
}


let oldKeydownListener: ((this: Window, ev: KeyboardEvent) => any) | null = null
let oldKeyupListener: ((this: Window, ev: KeyboardEvent) => any) | null = null

/**
 * Sets listeners for the keydown and keyup events on the Window object to 
 * listen for any of the bound keys in the KeybindMap, and removes the old 
 * listeners if there are any. This allows the keybinds to be changed and 
 * new listeners set.
 * @param keybindMap keybind map.
 * @param keyPressedMap map to set when the keys are pressed. 
 */
export function setKeyListener(keybindMap: KeybindMap, gameWorker: Worker) {

    const keydownListener: (this: Window, ev: KeyboardEvent) => any = event => {
        if (IterAny(keybindMap.values(), value => value === event.key)) {
            gameWorker.postMessage(makeIPCKeyDownEventObject(event.key))
            if (isDebug()) {
                console.log(`"${event.key}" pressed`)
            }
        }
    } 

    const keyupListener: (this: Window, ev: KeyboardEvent) => any = event => {
        if (IterAny(keybindMap.values(), value => value === event.key)) {
            gameWorker.postMessage(makeIPCKeyUpEventObject(event.key))
            if (isDebug()) {
                console.log(`"${event.key}" released`)
            }
        }
    }

    if (oldKeydownListener !== null) {
        window.removeEventListener("keydown", oldKeydownListener)
    }

    if (oldKeyupListener !== null) {
        window.removeEventListener("keyup", oldKeyupListener)
    }

    window.addEventListener("keydown", keydownListener)
    window.addEventListener("keyup", keyupListener)

}
