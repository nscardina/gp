import { CarImagePath } from "../physics/Car"

export const IPCStartMessage = "START"
export const IPCKeyDownMessage = "KEY_DOWN"
export const IPCKeyUpMessage = "KEY_UP"
export const IPCInitGPMessage = "INIT_GP"
export const IPCSetPauseStateMessage = "SET_PAUSE_STATE"
export const IPCRespawnStartMessage = "RESPAWN_START"
export const IPCDisplayNextRaceButton = "DISPLAY_NEXT_RACE_BUTTON"
export const IPCTriggerNextRaceButton = "TRIGGER_NEXT_RACE"
export const IPCShowGPResults = "DISPLAY_GP_RESULTS"

export type IPCRespawnStartMessageObject = {
    type: typeof IPCRespawnStartMessage
}

export function isIPCRespawnStartMessage(object: unknown): object is IPCRespawnStartMessageObject {
    return typeof(object) === "object"
    && object !== null
    && "type" in object
    && object.type === IPCRespawnStartMessage
}

export type IPCKeyDownEventObject = {
    type: typeof IPCKeyDownMessage,
    key: string
}

export function makeIPCKeyDownEventObject(key: string): IPCKeyDownEventObject {
    return {
        type: IPCKeyDownMessage,
        key: key
    }
}

export function isIPCKeyDownEventObject(object: unknown): object is IPCKeyDownEventObject {
    return typeof(object) === "object"
    && object !== null
    && "type" in object
    && object.type === IPCKeyDownMessage
    && "key" in object
    && typeof(object.type) === "string"
}

export type IPCKeyUpEventObject = {
    type: typeof IPCKeyUpMessage,
    key: string
}

export function makeIPCKeyUpEventObject(key: string) {
    return {
        type: IPCKeyUpMessage,
        key: key
    }
}

export function isIPCKeyUpEventObject(object: unknown): object is IPCKeyUpEventObject {
    return typeof(object) === "object"
    && object !== null
    && "type" in object
    && object.type === IPCKeyUpMessage
    && "key" in object
    && typeof(object.type) === "string"
}

export type IPCInitGPMessageObject = {
    type: typeof IPCInitGPMessage,
    carColor: CarImagePath
}

export function isIPCInitGPMessageObject(object: unknown): object is IPCInitGPMessageObject {
    return typeof(object) === "object"
    && object !== null
    && "type" in object
    && object.type === IPCInitGPMessage
    && "carColor" in object
    && Object.values(CarImagePath).includes(object.carColor as any)
}

export type IPCSetPauseStateMessageObject = {
    type: typeof IPCSetPauseStateMessage,
    paused: boolean
}

export function isIPCSetPauseStateMessageObject(object: unknown): object is IPCSetPauseStateMessageObject {
    return typeof(object) === "object"
    && object !== null
    && "type" in object
    && object.type === IPCSetPauseStateMessage
    && "paused" in object
    && typeof(object.paused) === "boolean"
}

export type IPCDisplayNextRaceMessageObject = {
    type: typeof IPCDisplayNextRaceButton
}

export const isIPCDisplayNextRaceMessageObject = (object: unknown): object is IPCDisplayNextRaceMessageObject => (
    typeof(object) === "object"
    && object !== null
    && "type" in object
    && object.type === IPCDisplayNextRaceButton
)

export type IPCTriggerNextRaceButtonObject = {
    type: typeof IPCTriggerNextRaceButton
}

export const isIPCTriggerNextRaceButtonObject = (object: unknown): object is IPCTriggerNextRaceButtonObject => (
    typeof(object) === "object"
    && object !== null
    && "type" in object
    && object.type === IPCTriggerNextRaceButton
)

export type IPCDisplayGPResultsObject = {
    type: typeof IPCShowGPResults,
    carPointTotals: {name: string, points: number}[]
    playerFinishingPosition: number
}

export const isIPCDisplayGPResultsObject = (object: unknown): object is IPCDisplayGPResultsObject => (
    typeof(object) === "object"
    && object !== null
    && "type" in object
    && object.type === IPCShowGPResults
    && "carPointTotals" in object
    && Array.isArray(object.carPointTotals)
    && object.carPointTotals.every(obj => (
        typeof(obj) === "object"
        && obj !== null
        && "name" in obj
        && typeof(obj.name) === "string"
        && "points" in obj
        && typeof(obj.points) === "number"
    ))
    && "playerFinishingPosition" in object
    && typeof(object.playerFinishingPosition) === "number"
)