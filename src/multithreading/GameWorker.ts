import { makeNewCourseState, type CourseState } from "./CourseState";
import { countdown, makeGameLoop } from "./GameLoop";
import { initGlobalState, type GlobalState } from "./GlobalState";
import { makeNewGrandPrixState, type GrandPrixState } from "./GrandPrixState";
import { isIPCInitGPMessageObject, isIPCKeyDownEventObject, isIPCKeyUpEventObject, isIPCSetPauseStateMessageObject } from "./IPC";


const pressStartFont = await new FontFace("press_start", `url("${import.meta.env.BASE_URL}Press_Start_2P/PressStart2P-Regular.ttf")`).load()
self.fonts.add(pressStartFont)

let globalState: GlobalState = await initGlobalState()
let gpState: GrandPrixState | null = null
let courseState: CourseState | null = null

onmessage = async (e) => {

	if ("type" in e.data && typeof (e.data.type) === "string") {

		if (isIPCInitGPMessageObject(e.data)) {
			gpState = await makeNewGrandPrixState(e.data.carColor, "./grand_prix/bronze_cup.json")
			courseState = makeNewCourseState(gpState.courses[0], gpState.playerCar, gpState.cars)

			countdown(globalState, courseState)

			const gameloop = makeGameLoop(globalState, gpState, courseState)
			requestAnimationFrame(gameloop)
		}

		if (isIPCSetPauseStateMessageObject(e.data) && courseState !== null) {
			courseState.paused = e.data.paused
		}


		if (isIPCKeyDownEventObject(e.data)) {
			globalState.keyPressedMap.set(e.data.key, true)
		}

		if (isIPCKeyUpEventObject(e.data)) {
			globalState.keyPressedMap.set(e.data.key, false)
		}

		if (isIPCSetPauseStateMessageObject(e.data) && courseState !== null) {
			courseState.paused = e.data.paused
		}

	}

};

self.addEventListener('error', e => {
  console.error('Worker error:', e);
});

self.addEventListener('unhandledrejection', e => {
  console.error('Worker promise rejection:', e.reason);
});