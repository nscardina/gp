import { makeDefaultKeybindMap, makeKeyPressedMap } from "../keybind/Keyboard";
import Course from "../level/Course";
import Car, { CarImagePath } from "../physics/Car";
import { gameLoop } from "./GameLoop";
import { gameState, setupGameState } from "./GameState";
import { isIPCInitGPMessageObject, isIPCKeyDownEventObject, isIPCKeyUpEventObject, isIPCSetPauseStateMessageObject } from "./IPC";


onmessage = async (e) => {

  if (e.data.type === "START") {
    const { width, height } = e.data;

    const offscreen = new OffscreenCanvas(width / 4, height / 4);
    const ctx = offscreen.getContext('2d')!;

    const circuit = await Course.loadCourse("/circuit.gpc")

    const playerCar = new Car(CarImagePath.RED)

    const keybindMap = makeDefaultKeybindMap()
    const keyPressedMap = makeKeyPressedMap(keybindMap)

    setupGameState({
      paused: false,
      offscreenCanvas: offscreen,
      ctx: ctx,
      course: circuit,
      cars: [playerCar],
      playerCar: playerCar,
      keybindMap: keybindMap,
      keyPressedMap: keyPressedMap
    })

    requestAnimationFrame(gameLoop)
  }

  if ("type" in e.data && typeof(e.data.type) === "string") {

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
        
        const state = gameState()!

        const playerCar = new Car(
          e.data.carColor, 
          state.course.spawnpoints.at(-1)?.location.x,
          state.course.spawnpoints.at(-1)?.location.y,
          state.course.spawnpoints.at(-1)?.spawnAngle
        )
        const aiCars = Object.values(CarImagePath)
          .filter(path => path !== e.data.carColor)
          .map((path, index) => {
            const spawnpoint = state.course.spawnpoints.at(index)
            const car = new Car(path, spawnpoint?.location.x, spawnpoint?.location.y, spawnpoint?.spawnAngle)
            car.currentAIPathMarker = state.course.aiPathMarkers[1]
            return car
          })

        state.playerCar = playerCar
        state.cars = [playerCar, ...aiCars]
        state.paused = false
        setupGameState(state)
      }

      if (isIPCSetPauseStateMessageObject(e.data)) {
        const state = gameState()!
        state.paused = e.data.paused
        setupGameState(state)
      }
    }

    
  }
  
};

