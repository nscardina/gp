/**
 * Attributes of a car.
 * 
 * The speed stat affects the car's top speed. The default is 1.0, and the stat is 
 * used as a multiplier to the car's top speed.
 * 
 * The acceleration stat affects the car's rate of acceleration. The default is 
 * 1.0, and the stat is used as a multiplier to the car's increase in velocity 
 * when the accelerator pedal is held.
 * 
 * The weight stat affects the car's mass. The default is 1.0, and the stat is used 
 * as a multiplier to the car's mass, and this affects collisions with other cars.
 * 
 * The offroad stat affects how much speed the car loses when in offroad. The default 
 * is 1.0, and the stat is used as a multiplier for the rate of decrease in the 
 * car's speed when it is in the offroad. It is also used as a multiplier to how 
 * much the car's top speed is reduced while in the offroad.
 * 
 * The boost stat affects how quickly the car builds up boosts when traveling across 
 * boost tiles, how much the car's top speed is raised when boosting, and how 
 * quickly boosting uses up the car's stored boost.
 */
export type CarStats = {
    speed: number,
    acceleration: number,
    weight: number,
    offroad: number,
    boost: number
}

/**
 * Gets the red car's stats.
 * The red car has all of the default stats of 1.0.
 */
export const getRedCarStats = (): CarStats => ({
    speed: 1.0,
    acceleration: 1.0,
    weight: 1.0,
    offroad: 1.0,
    boost: 1.0
})

/**
 * Gets the green car's stats.
 * The green car has the highest speed stat, significantly lower acceleration 
 * than the default, and slightly worse than default offroad stat. It also has 
 * significantly higher weight than the other cars.
 */
export const getGreenCarStats = (): CarStats => ({
    speed: 1.3,
    acceleration: 0.6,
    weight: 2.0,
    offroad: 0.9,
    boost: 1.0
})

/**
 * Gets the blue car's stats.
 * The blue car has a slightly lower-than-usual speed stat but with significantly 
 * higher acceleration and slightly higher offroad stats than normal.
 */
export const getBlueCarStats = (): CarStats => ({
    speed: 0.9,
    acceleration: 1.5,
    weight: 1.0,
    offroad: 1.1,
    boost: 1.0
})

/**
 * Gets the purple car's stats.
 * The purple car has normal speed, but slightly increased acceleration and 
 * significantly increased offroad and boost stats compared to the default of 1.0.
 * However, it has much lower weight than the other cars.
 */
export const getPurpleCarStats = (): CarStats => ({
    speed: 1.0,
    acceleration: 1.2,
    weight: 0.6,
    offroad: 1.5,
    boost: 1.5
})