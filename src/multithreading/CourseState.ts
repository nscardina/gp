import type Course from "../level/Course";
import type { CarImagePath } from "../physics/Car";
import Car, { getName, getStats } from "../physics/Car";

export type CourseState = {
    phase: "countdown" | "race" | "results_screen",
    countdownNumber: "GO" | "1" | "2" | "3" | null,
    paused: boolean,
    
    course: Course,
    cars: Car[],
    playerCar: Car,
}

export const makeNewCourseState = (course: Course, playerCar: CarImagePath, cars: CarImagePath[]): CourseState => {

    const playerCarObject = new Car(
		getName(playerCar),
		playerCar,
		getStats(playerCar),
		course.checkpoints[0],
		course.spawnpoints.at(-1)?.location.x,
		course.spawnpoints.at(-1)?.location.y,
		course.spawnpoints.at(-1)?.spawnAngle
	)
	playerCarObject.currentAIPathMarker = course.aiPathMarkers[1]

	const aiCarObjects = cars
		.filter(path => path !== playerCar)
		.map((path, index) => {
			const spawnpoint = course.spawnpoints.at(index)
			const car = new Car(
				getName(path),
				path,
				getStats(path),
				course.checkpoints[0],
				spawnpoint?.location.x, spawnpoint?.location.y, spawnpoint?.spawnAngle)
			car.currentAIPathMarker = course.aiPathMarkers[1]
			return car
		})

	

    return {
        phase: "countdown",
        countdownNumber: "3",
        paused: false,
        course: course,
        playerCar: playerCarObject,
        cars: [playerCarObject, ...aiCarObjects]
    }
}