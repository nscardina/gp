function IterAny<T>(iterable: Iterable<T>, satisfies: (value: T) => boolean) {
    for (const value of iterable) {
        if (satisfies(value)) {
            return true
        }
    }
    return false
}

export {
    IterAny
}