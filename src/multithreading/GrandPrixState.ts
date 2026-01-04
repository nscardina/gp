import Course from "../level/Course"
import { CarImagePath } from "../physics/Car"
import { loadText } from "../util/Load"

export type GrandPrixState = {
    grandPrixName: string,
    currentRaceNumber: number,
    cars: CarImagePath[],
    playerCar: CarImagePath,
    courses: Course[],
    scores: Map<CarImagePath, number>
}

export const makeNewGrandPrixState = async(playerCarColor: CarImagePath, grandPrixJsonURL: string): Promise<GrandPrixState> => {
    const grandPrixJson = JSON.parse(await loadText(grandPrixJsonURL))
    

    const grandPrixName: string = grandPrixJson.name
    const grandPrixCourses: Course[] = await Promise.all(grandPrixJson.courses.map((courseURL: string) => Course.loadCourse(courseURL)))

    const cars = Object.values(CarImagePath)
    
    const scores = new Map<CarImagePath, number>()
    for (const car of cars) {
        scores.set(car, 0)
    }

    return {
        grandPrixName: grandPrixName,
        currentRaceNumber: 0,
        cars: cars,
        playerCar: playerCarColor,
        courses: grandPrixCourses,
        scores: scores
    }
    
}