import { makeDefaultKeybindMap, makeKeyPressedMap } from "../keybind/Keyboard";
import Course from "../level/Course";
import Car, { CarImagePath, getName, getStats } from "../physics/Car";
import { getRedCarStats } from "../physics/CarStats";
import { countdown, gameLoop } from "./GameLoop";
import { gameState, setupGameState } from "./GameState";
import { isIPCInitGPMessageObject, isIPCKeyDownEventObject, isIPCKeyUpEventObject, isIPCSetPauseStateMessageObject, type IPCInitGPMessageObject } from "./IPC";

const pressStartFont = new FontFace("press_start", 'url("/Press_Start_2P/PressStart2P-Regular.ttf")')
pressStartFont.load().then(() => self.fonts.add(pressStartFont))


onmessage = async (e) => {

	if (e.data.type === "START") {
		const { width, height } = e.data;

		const offscreen = new OffscreenCanvas(width / 4, height / 4);
		const ctx = offscreen.getContext('2d')!;

		const circuit = await Course.loadCourse("/circuit.gpc")

		const playerCar = new Car("No Name", CarImagePath.RED, getRedCarStats(),
			circuit.checkpoints[0],
			circuit.spawnpoints.at(-1)?.location.x,
			circuit.spawnpoints.at(-1)?.location.y,
			circuit.spawnpoints.at(-1)?.spawnAngle
		)

		const keybindMap = makeDefaultKeybindMap()
		const keyPressedMap = makeKeyPressedMap(keybindMap)

		setupGameState({
			state: "countdown",
			countdownNumber: null,
			paused: false,
			offscreenCanvas: offscreen,
			ctx: ctx,
			course: circuit,
			cars: [playerCar],
			playerCar: playerCar,
			keybindMap: keybindMap,
			keyPressedMap: keyPressedMap
		})

		
	}

	if ("type" in e.data && typeof (e.data.type) === "string") {

		const state = gameState()
		if (state !== null) {
			const { keyPressedMap } = state

			if (isIPCKeyDownEventObject(e.data)) {
				keyPressedMap.set(e.data.key, true)
			}

			if (isIPCKeyUpEventObject(e.data)) {
				keyPressedMap.set(e.data.key, false)
			}

			if (isIPCInitGPMessageObject(e.data)) {
				initCourse(e.data)

			}

			if (isIPCSetPauseStateMessageObject(e.data)) {
				const state = gameState()!
				state.paused = e.data.paused
				setupGameState(state)
			}
		}


	}

};

const initCourse = async (data: IPCInitGPMessageObject) => {
	const state = gameState()!

	const playerCar = new Car(
		getName(data.carColor),
		data.carColor,
		getStats(data.carColor),
		state.course.checkpoints[0],
		state.course.spawnpoints.at(-1)?.location.x,
		state.course.spawnpoints.at(-1)?.location.y,
		state.course.spawnpoints.at(-1)?.spawnAngle
	)
	playerCar.currentAIPathMarker = state.course.aiPathMarkers[1]

	const aiCars = Object.values(CarImagePath)
		.filter(path => path !== data.carColor)
		.map((path, index) => {
			const spawnpoint = state.course.spawnpoints.at(index)
			const car = new Car(
				getName(path),
				path,
				getStats(path),
				state.course.checkpoints[0],
				spawnpoint?.location.x, spawnpoint?.location.y, spawnpoint?.spawnAngle)
			car.currentAIPathMarker = state.course.aiPathMarkers[1]
			return car
		})

	state.playerCar = playerCar
	state.cars = [playerCar, ...aiCars]
	state.paused = false
	state.state = "countdown"
	setupGameState(state)

	countdown(state)

	requestAnimationFrame(gameLoop)
}