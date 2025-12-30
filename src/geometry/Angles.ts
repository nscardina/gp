
/**
 * Puts an angle within the range [0, 2pi).
 * @param angle 
 */
export const normalize02PI = (angle: number): number => {
    while (angle < 0) {
        angle += 2 * Math.PI
    }
    while (angle >= 2 * Math.PI) {
        angle -= 2 * Math.PI
    }
    return angle
}

/**
 * Puts an angle within the range [-pi, pi).
 * @param angle 
 * @returns 
 */
export const normalizeNegativePositivePi = (angle: number): number => {
    return Math.atan2(Math.sin(angle), Math.cos(angle))
}