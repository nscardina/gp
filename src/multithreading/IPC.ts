export const IPCStartMessage = "START"
export const IPCKeyDownMessage = "KEY_DOWN"
export const IPCKeyUpMessage = "KEY_UP"

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